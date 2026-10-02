(() => {
  "use strict";
  const STORAGE_ENTRIES="ember.v1.entries";
  const STORAGE_SETTINGS="ember.v1.settings";
  const THEMES={violet:{name:"Violett",themeColor:"#f6f4ff"},blue:{name:"Blau",themeColor:"#f3f8fe"},terracotta:{name:"Terrakotta",themeColor:"#fbf5ef"},green:{name:"Grün",themeColor:"#f4f7f1"},dark:{name:"Dunkel",themeColor:"#0a0b0d"}};
  const THEME_MIGRATION={orange:"terracotta",teal:"blue",graphite:"violet"};
  const $=id=>document.getElementById(id);
  const els={
    homeView:$("homeView"),settingsView:$("settingsView"),analysisView:$("analysisView"),
    dateLabel:$("dateLabel"),todayCount:$("todayCount"),limitCount:$("limitCount"),remainingText:$("remainingText"),pauseCardHome:$("pauseCardHome"),homePauseValue:$("homePauseValue"),homePauseHint:$("homePauseHint"),pauseDialValue:$("pauseDialValue"),progressCircle:$("progressCircle"),
    addButton:$("addButton"),lastCard:$("lastCard"),lastTime:$("lastTime"),lastRelative:$("lastRelative"),analysisComparisonCount:$("analysisComparisonCount"),analysisComparisonText:$("analysisComparisonText"),entryCountLabel:$("entryCountLabel"),daySummaryCard:$("daySummaryCard"),dayFirstEntry:$("dayFirstEntry"),dayFirstCompare:$("dayFirstCompare"),dayBestPause:$("dayBestPause"),dayMiniTimeline:$("dayMiniTimeline"),todaySheetSummary:$("todaySheetSummary"),todaySheetList:$("todaySheetList"),closeTodaySheet:$("closeTodaySheet"),
    analysisButton:$("analysisButton"),settingsButton:$("settingsButton"),settingsBackButton:$("settingsBackButton"),analysisBackButton:$("analysisBackButton"),
    limitTile:$("limitTile"),pauseTile:$("pauseTile"),designTile:$("designTile"),dataTile:$("dataTile"),aboutTile:$("aboutTile"),limitTileValue:$("limitTileValue"),pauseTileValue:$("pauseTileValue"),designTileValue:$("designTileValue"),
    modalBackdrop:$("modalBackdrop"),limitSheet:$("limitSheet"),pauseSheet:$("pauseSheet"),designSheet:$("designSheet"),dataSheet:$("dataSheet"),aboutSheet:$("aboutSheet"),todaySheet:$("todaySheet"),editSheet:$("editSheet"),
    limitMinus:$("limitMinus"),limitPlus:$("limitPlus"),settingsLimitValue:$("settingsLimitValue"),closeLimitSheet:$("closeLimitSheet"),
    pauseMinus:$("pauseMinus"),pausePlus:$("pausePlus"),settingsPauseValue:$("settingsPauseValue"),smartPauseToggle:$("smartPauseToggle"),smartPauseSuggestion:$("smartPauseSuggestion"),smartPauseText:$("smartPauseText"),smartPauseApply:$("smartPauseApply"),closePauseSheet:$("closePauseSheet"),themeList:$("themeList"),closeDesignSheet:$("closeDesignSheet"),
    exportDataButton:$("exportDataButton"),resetDataButton:$("resetDataButton"),closeDataSheet:$("closeDataSheet"),closeAboutSheet:$("closeAboutSheet"),
    editTime:$("editTime"),saveEditButton:$("saveEditButton"),deleteEntryButton:$("deleteEntryButton"),
    analysisToday:$("analysisToday"),analysisRemaining:$("analysisRemaining"),analysisGapToday:$("analysisGapToday"),analysisLongestToday:$("analysisLongestToday"),analysisBestWeek:$("analysisBestWeek"),analysisPauseGoal:$("analysisPauseGoal"),analysisCurrentPause:$("analysisCurrentPause"),analysisCurrentPauseText:$("analysisCurrentPauseText"),currentPauseFill:$("currentPauseFill"),analysisPauseHit:$("analysisPauseHit"),analysisPauseCaption:$("analysisPauseCaption"),analysisPauseAverage:$("analysisPauseAverage"),patternList:$("patternList"),timelinePlot:$("timelinePlot"),timelineEmpty:$("timelineEmpty"),weekChart:$("weekChart"),
    toast:$("toast"),toastText:$("toastText"),undoButton:$("undoButton")
  };
  let entries=loadEntries(), settings=loadSettings(), lastAddedId=null, editingId=null, toastTimer=null;
  const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));
  const dayStart=(date=new Date())=>new Date(date.getFullYear(),date.getMonth(),date.getDate()).getTime();
  const formatTime=date=>new Intl.DateTimeFormat("de-AT",{hour:"2-digit",minute:"2-digit"}).format(date);
  function formatDate(date=new Date()){const t=new Intl.DateTimeFormat("de-AT",{weekday:"long",day:"numeric",month:"long"}).format(date);return t.charAt(0).toUpperCase()+t.slice(1)}
  function relativeTime(date){const m=Math.max(0,Math.floor((Date.now()-date.getTime())/60000));if(m<1)return"gerade eben";if(m===1)return"vor 1 Min.";if(m<60)return`vor ${m} Min.`;const h=Math.floor(m/60);if(h===1)return"vor 1 Std.";if(h<24)return`vor ${h} Std.`;return"früher"}
  function loadEntries(){try{const raw=JSON.parse(localStorage.getItem(STORAGE_ENTRIES)||"[]");return Array.isArray(raw)?raw.filter(x=>x&&typeof x.id==="string"&&typeof x.time==="string"&&!Number.isNaN(Date.parse(x.time))).sort((a,b)=>Date.parse(a.time)-Date.parse(b.time)):[]}catch{return[]}}
  function loadSettings(){const fallback={limit:20,theme:"violet",pauseGoal:50,smartPauseSuggestions:true,smartPauseUserSet:false};try{const raw=JSON.parse(localStorage.getItem(STORAGE_SETTINGS)||"{}");const migrated=THEME_MIGRATION[raw.theme]||raw.theme;const userSet=Boolean(raw.smartPauseUserSet);return{limit:Number.isFinite(Number(raw.limit))?clamp(Math.round(Number(raw.limit)),1,99):20,theme:THEMES[migrated]?migrated:"violet",pauseGoal:Number.isFinite(Number(raw.pauseGoal))?clamp(Math.round(Number(raw.pauseGoal)/5)*5,5,240):50,smartPauseSuggestions:userSet?Boolean(raw.smartPauseSuggestions):true,smartPauseUserSet:userSet}}catch{return fallback}}
  const saveEntries=()=>localStorage.setItem(STORAGE_ENTRIES,JSON.stringify(entries));
  const saveSettings=()=>localStorage.setItem(STORAGE_SETTINGS,JSON.stringify(settings));
  function entriesForDay(start){const end=start+86400000;return entries.filter(item=>{const t=Date.parse(item.time);return t>=start&&t<end})}
  const todaysEntries=()=>entriesForDay(dayStart());
  function gapMinutes(list){const gaps=[];for(let i=1;i<list.length;i++){const mins=Math.round((Date.parse(list[i].time)-Date.parse(list[i-1].time))/60000);if(mins>=0)gaps.push(mins)}return gaps}
  function averageFromGaps(gaps){if(!gaps.length)return null;return Math.round(gaps.reduce((sum,value)=>sum+value,0)/gaps.length)}
  function averageMinutes(list=todaysEntries()){return averageFromGaps(gapMinutes(list))}
  function longestGap(gaps){return gaps.length?Math.max(...gaps):null}
  function weeklyBestPause(){
    let best=null,base=dayStart();
    for(let i=0;i<7;i++){
      const value=longestGap(gapMinutes(entriesForDay(base-i*86400000)));
      if(value!=null&&(best==null||value>best))best=value;
    }
    return best;
  }
  function yesterdayEntries(){const d=new Date();d.setDate(d.getDate()-1);return entriesForDay(dayStart(d))}
  function firstEntryLaterText(today){
    if(!today.length)return"";
    const yesterday=yesterdayEntries();
    if(!yesterday.length)return"";
    const t=new Date(today[0].time),y=new Date(yesterday[0].time);
    const todayMinutes=t.getHours()*60+t.getMinutes(),yesterdayMinutes=y.getHours()*60+y.getMinutes(),diff=todayMinutes-yesterdayMinutes;
    if(diff<=0)return"";
    if(diff<60)return`${diff} Min. später als gestern`;
    const h=Math.floor(diff/60),m=diff%60;
    return m?`${h} Std. ${m} Min. später als gestern`:`${h} Std. später als gestern`;
  }
  function renderMiniTimeline(today){
    els.dayMiniTimeline.innerHTML="";
    if(!today.length){
      els.dayMiniTimeline.classList.add("is-empty");
      return;
    }
    els.dayMiniTimeline.classList.remove("is-empty");
    today.forEach(entry=>{
      const d=new Date(entry.time),minutes=d.getHours()*60+d.getMinutes(),dot=document.createElement("span");
      dot.className="day-mini-dot";
      dot.style.left=`${clamp(minutes/1440*100,1.5,98.5)}%`;
      els.dayMiniTimeline.appendChild(dot);
    });
  }
  function renderDaySummary(today){
    const count=today.length,first=today[0],gaps=gapMinutes(today),best=longestGap(gaps),later=firstEntryLaterText(today);
    els.entryCountLabel.textContent=String(count);
    els.dayFirstEntry.textContent=first?formatTime(new Date(first.time)):"–";
    els.dayBestPause.textContent=formatGap(best);
    els.dayFirstCompare.hidden=!later;
    els.dayFirstCompare.textContent=later;
    renderMiniTimeline(today);
  }
  function renderTodaySheet(){
    const today=todaysEntries(),gaps=gapMinutes(today),best=longestGap(gaps);
    els.todaySheetSummary.textContent=today.length
      ?`${today.length} ${today.length===1?"Eintrag":"Einträge"} · Erste ${formatTime(new Date(today[0].time))} · Beste Pause ${formatGap(best)}`
      :"Noch keine Einträge heute.";
    els.todaySheetList.innerHTML="";
    [...today].reverse().forEach((entry,index)=>{
      const row=document.createElement("button");
      row.type="button";
      row.className="today-sheet-row";
      row.innerHTML=`<span><strong>${formatTime(new Date(entry.time))}</strong><small>${relativeTime(new Date(entry.time))}</small></span><span>${today.length-index}. ›</span>`;
      row.addEventListener("click",()=>openEdit(entry.id));
      els.todaySheetList.appendChild(row);
    });
  }
  function formatGap(mins){if(mins==null)return"–";if(mins<=0)return"< 1 Min.";if(mins<60)return`${mins} Min.`;const h=Math.floor(mins/60),m=mins%60;return m?`${h} Std. ${m} Min.`:`${h} Std.`}
  function latestEntry(){return entries.length?entries[entries.length-1]:null}
  function pauseStatusData(){
    const latest=latestEntry(),goal=settings.pauseGoal;
    if(!latest)return{state:"empty",elapsed:null,remaining:null,progress:0,text:"–",hint:`Pause ${goal} Min.`};
    const elapsed=Math.max(0,Math.floor((Date.now()-Date.parse(latest.time))/60000)),remaining=Math.max(0,goal-elapsed),progress=clamp(elapsed/goal,0,1);
    if(elapsed<goal){
      const close=remaining<=5;
      return{state:close?"close":"waiting",elapsed,remaining,progress,text:`${elapsed<1?"< 1":elapsed} / ${goal} Min.`,hint:close?`Noch ${remaining} Min. · Fast geschafft`:`Noch ${remaining} Min.`};
    }
    const extra=elapsed-goal;
    return{state:"reached",elapsed,remaining:0,progress:1,text:`${elapsed} Min.`,hint:extra>0?`Pause geschafft · +${extra} Min.`:"Pause geschafft ✓"};
  }
  function renderPauseStatus(){
    const status=pauseStatusData(),goal=settings.pauseGoal;
    if(status.state==="empty"){
      els.homePauseValue.textContent="0 Min.";
      els.homePauseHint.textContent=`${goal} Min. eingestellt`;
    }else if(status.state==="reached"){
      const extra=Math.max(0,status.elapsed-goal);
      els.homePauseValue.textContent=extra>0?`+${extra} Min.`:"Geschafft";
      els.homePauseHint.textContent=`${goal} Min. geschafft`;
    }else{
      els.homePauseValue.textContent=`${status.elapsed<1?0:status.elapsed} Min.`;
      els.homePauseHint.textContent=status.state==="close"
        ?`noch ${status.remaining} Min. · fast geschafft`
        :`noch ${status.remaining} Min.`;
    }
    els.pauseCardHome.dataset.state=status.state;
    els.pauseDialValue.dataset.state=status.state;
    els.pauseDialValue.style.strokeDashoffset=String(100-Math.round(status.progress*100));
  }
  function recentEntries(days=7){const start=dayStart()-Math.max(0,days-1)*86400000;return entries.filter(item=>Date.parse(item.time)>=start)}
  function recentGaps(days=3){const gaps=[],base=dayStart();for(let i=0;i<days;i++)gaps.push(...gapMinutes(entriesForDay(base-i*86400000)));return gaps}
  function smartPauseSuggestion(){
    if(!settings.smartPauseSuggestions)return null;
    const gaps=recentGaps(3);
    if(gaps.length<8)return null;
    const goal=settings.pauseGoal,hit=gaps.filter(value=>value>=goal).length,rate=hit/gaps.length,avg=averageFromGaps(gaps);
    if(rate>=.75&&avg!=null&&avg>=goal+2&&goal<240)return clamp(goal+5,5,240);
    return null;
  }
  function renderSmartPauseSuggestion(){
    els.smartPauseToggle.checked=settings.smartPauseSuggestions;
    const suggestion=smartPauseSuggestion();
    els.smartPauseSuggestion.hidden=!suggestion;
    if(suggestion)els.smartPauseText.textContent=`${suggestion} Min. ausprobieren?`;
  }
  function dayPart(hour){if(hour<5)return"Nacht";if(hour<9)return"Morgen";if(hour<12)return"Vormittag";if(hour<17)return"Nachmittag";if(hour<22)return"Abend";return"Nacht"}
  function dayPartPhrase(name){return name==="Nacht"?"in der Nacht":`am ${name.toLowerCase()}`}
  function renderPatterns(){
    const recent=recentEntries(7),items=[];
    if(recent.length>=6){
      const counts=new Map();
      recent.forEach(entry=>{const p=dayPart(new Date(entry.time).getHours());counts.set(p,(counts.get(p)||0)+1)});
      const busiest=[...counts.entries()].sort((a,b)=>b[1]-a[1])[0];
      if(busiest)items.push(`Die meisten Einträge liegen aktuell ${dayPartPhrase(busiest[0])}.`);
    }
    const gapBuckets=new Map(),base=dayStart();
    for(let i=0;i<7;i++){
      const list=entriesForDay(base-i*86400000);
      for(let j=1;j<list.length;j++){
        const mins=Math.round((Date.parse(list[j].time)-Date.parse(list[j-1].time))/60000);
        if(mins<0)continue;
        const p=dayPart(new Date(list[j].time).getHours()),bucket=gapBuckets.get(p)||[];
        bucket.push(mins);gapBuckets.set(p,bucket);
      }
    }
    const gapAverages=[...gapBuckets.entries()].filter(([,values])=>values.length>=2).map(([name,values])=>[name,averageFromGaps(values)]).sort((a,b)=>b[1]-a[1]);
    if(gapAverages[0])items.push(`Deine längsten Pausen liegen aktuell ${dayPartPhrase(gapAverages[0][0])}.`);
    els.patternList.innerHTML="";
    if(!items.length){
      const empty=document.createElement("div");empty.className="pattern-empty";empty.textContent="Noch nicht genug Daten. Ember erkennt Muster automatisch, ohne dass du etwas zusätzlich eintragen musst.";els.patternList.appendChild(empty);return;
    }
    items.slice(0,2).forEach(text=>{const row=document.createElement("div");row.className="pattern-row";row.innerHTML=`<span class="pattern-dot"></span><span>${text}</span>`;els.patternList.appendChild(row)});
  }
  function yesterdayCountAtCurrentTime(){const now=new Date(),todayStart=dayStart(now),elapsed=now.getTime()-todayStart,yesterday=new Date(now);yesterday.setDate(yesterday.getDate()-1);const start=dayStart(yesterday),cutoff=start+elapsed;return entries.filter(item=>{const t=Date.parse(item.time);return t>=start&&t<=cutoff}).length}
  function comparisonCopy(todayCount){const yesterdayCount=yesterdayCountAtCurrentTime(),diff=todayCount-yesterdayCount;if(diff===0)return"Gleich wie gestern um diese Uhrzeit";const amount=Math.abs(diff);return`${amount} ${diff<0?"weniger":"mehr"} als gestern um diese Uhrzeit`}
  function applyTheme(){document.documentElement.dataset.theme=settings.theme;document.querySelector('meta[name="theme-color"]')?.setAttribute("content",THEMES[settings.theme].themeColor);els.designTileValue.textContent=THEMES[settings.theme].name;els.themeList.querySelectorAll("button").forEach(b=>b.setAttribute("aria-checked",String(b.dataset.theme===settings.theme)))}
  function render(){
    const today=todaysEntries(),count=today.length,limit=settings.limit,newest=today[today.length-1],progress=clamp(count/limit,0,1);
    els.dateLabel.textContent=formatDate();
    els.todayCount.textContent=count;
    els.limitCount.textContent=limit;
    els.remainingText.textContent=`Tageslimit ${limit}`;
    renderPauseStatus();
    els.progressCircle.style.strokeDashoffset=String(100-progress*100);
    els.limitTileValue.textContent=`${limit} Zigaretten`;
    els.settingsLimitValue.textContent=limit;
    els.pauseTileValue.textContent=`${settings.pauseGoal} Minuten`;
    els.settingsPauseValue.textContent=settings.pauseGoal;
    renderSmartPauseSuggestion();
    els.analysisComparisonCount.textContent=`${count} ${count===1?"Zigarette":"Zigaretten"}`;
    els.analysisComparisonText.textContent=comparisonCopy(count);
    renderDaySummary(today);
    renderTodaySheet();

    if(newest){
      const d=new Date(newest.time);
      els.lastTime.textContent=formatTime(d);
      els.lastRelative.textContent=relativeTime(d);
      els.lastCard.disabled=false;
    }else{
      els.lastTime.textContent="–";
      els.lastRelative.textContent="Noch kein Eintrag";
      els.lastCard.disabled=true;
    }
    renderAnalysis();
  }
  function renderAnalysis(){
    const today=todaysEntries(),count=today.length,todayGaps=gapMinutes(today),avgToday=averageFromGaps(todayGaps),longestToday=longestGap(todayGaps),bestWeek=weeklyBestPause(),goal=settings.pauseGoal,hit=todayGaps.filter(value=>value>=goal).length,total=todayGaps.length;
    els.analysisToday.textContent=count;
    els.analysisRemaining.textContent=Math.max(settings.limit-count,0);
    els.analysisGapToday.textContent=formatGap(avgToday);
    els.analysisLongestToday.textContent=formatGap(longestToday);els.analysisBestWeek.textContent=formatGap(bestWeek);
    els.analysisPauseGoal.textContent=`${goal} Min. eingestellt`;
    els.analysisPauseHit.textContent=total?`${hit} / ${total}`:"–";
    els.analysisPauseCaption.textContent=total?`${total} abgeschlossene ${total===1?"Pause":"Pausen"} · Ziel ${goal} Min.`:"Noch keine abgeschlossene Pause";
    els.analysisPauseAverage.textContent=formatGap(avgToday);

    const live=pauseStatusData();
    if(live.state!=="empty"){
      els.analysisCurrentPause.textContent=live.elapsed<1?"< 1 Min.":`${live.elapsed} Min.`;
      els.analysisCurrentPauseText.textContent=live.state==="reached"
        ?(live.elapsed===goal?"Pause geschafft":`Pause geschafft · +${live.elapsed-goal} Min.`)
        :`Noch ${live.remaining} Min. bis ${goal} Min.`;
      els.currentPauseFill.style.width=`${Math.max(3,Math.round(live.progress*100))}%`;
      els.currentPauseFill.dataset.state=live.state;
      els.analysisCurrentPause.dataset.state=live.state;
    }else{
      els.analysisCurrentPause.textContent="–";
      els.analysisCurrentPauseText.textContent=`${goal} Min. eingestellt`;
      els.currentPauseFill.style.width="0%";
      els.currentPauseFill.dataset.state="empty";
      els.analysisCurrentPause.dataset.state="empty";
    }
    renderPatterns();

    const timelineGroups=[];
    const TIMELINE_CLUSTER_GAP=28;
    today.forEach(entry=>{
      const d=new Date(entry.time),minutes=d.getHours()*60+d.getMinutes(),last=timelineGroups[timelineGroups.length-1];
      if(last&&minutes-last.lastMinute<=TIMELINE_CLUSTER_GAP){
        last.entries.push(entry);
        last.lastMinute=minutes;
      }else{
        timelineGroups.push({entries:[entry],firstMinute:minutes,lastMinute:minutes});
      }
    });
    els.timelinePlot.innerHTML="";
    const showExactTimes=timelineGroups.length<=8;
    timelineGroups.forEach((group,index)=>{
      const first=new Date(group.entries[0].time),last=new Date(group.entries[group.entries.length-1].time);
      const center=(group.firstMinute+group.lastMinute)/2,position=clamp(center/1440*100,1.5,98.5),marker=document.createElement("span");
      const isCluster=group.entries.length>1;
      const firstTime=formatTime(first),lastTime=formatTime(last);
      const label=isCluster&&firstTime!==lastTime?`${firstTime}–${lastTime}`:firstTime;
      marker.className=`timeline-event ${index%2?"lane-b":"lane-a"}${showExactTimes?"":" dense"}${isCluster?" multiple cluster":""}`;
      marker.style.left=`${position}%`;
      marker.setAttribute("aria-label",isCluster?`${group.entries.length} Einträge zwischen ${firstTime} und ${lastTime}`:`Eintrag um ${firstTime}`);
      marker.title=isCluster?`${group.entries.length}× · ${label}`:label;
      const dot=document.createElement("span");
      dot.className="timeline-event-dot";
      dot.textContent=isCluster?`${group.entries.length}×`:"";
      const timeLabel=document.createElement("span");
      timeLabel.className="timeline-event-time";
      timeLabel.textContent=label;
      marker.append(dot,timeLabel);
      els.timelinePlot.appendChild(marker);
    });
    els.timelineEmpty.hidden=today.length>0;

    const days=[],base=dayStart();
    for(let i=6;i>=0;i--){
      const start=base-i*86400000,date=new Date(start);
      days.push({start,date,count:entriesForDay(start).length});
    }
    const max=Math.max(settings.limit,...days.map(d=>d.count),1);
    els.weekChart.innerHTML="";
    days.forEach(day=>{
      const col=document.createElement("div");
      col.className="day-bar";
      const pct=Math.max(3,Math.round(day.count/max*100));
      const label=new Intl.DateTimeFormat("de-AT",{weekday:"short"}).format(day.date).replace(".","");
      col.innerHTML=`<span class="bar-count">${day.count}</span><span class="bar-track"><span class="bar-fill" style="height:${pct}%"></span></span><span class="bar-label">${label}</span>`;
      els.weekChart.appendChild(col);
    });
  }
  function showView(view){[els.homeView,els.settingsView,els.analysisView].forEach(v=>{v.hidden=v!==view;v.classList.toggle("is-active",v===view)});window.scrollTo({top:0,behavior:"instant"})}
  function addEntry(){const id=crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(16).slice(2)}`,entry={id,time:new Date().toISOString()};entries.push(entry);entries.sort((a,b)=>Date.parse(a.time)-Date.parse(b.time));saveEntries();lastAddedId=id;render();showToast(`${formatTime(new Date(entry.time))} gespeichert`,true)}
  function undoLastAdd(){if(!lastAddedId)return;entries=entries.filter(x=>x.id!==lastAddedId);saveEntries();lastAddedId=null;render();showToast("Eintrag entfernt",false)}
  function hideToast(){clearTimeout(toastTimer);els.toast.classList.remove("is-visible");els.toast.setAttribute("aria-hidden","true")}
  function showToast(text,undo){hideToast();els.toastText.textContent=text;els.undoButton.hidden=!undo;els.toast.classList.add("is-visible");els.toast.setAttribute("aria-hidden","false");toastTimer=setTimeout(hideToast,3600)}
  function openSheet(sheet){hideToast();closeSheets(false);els.modalBackdrop.hidden=false;requestAnimationFrame(()=>{els.modalBackdrop.classList.add("is-visible");sheet.classList.add("is-open")});sheet.setAttribute("aria-hidden","false");document.body.style.overflow="hidden"}
  function closeSheets(hide=true){[els.limitSheet,els.pauseSheet,els.designSheet,els.dataSheet,els.aboutSheet,els.todaySheet,els.editSheet].forEach(s=>{s.classList.remove("is-open");s.setAttribute("aria-hidden","true")});if(hide){els.modalBackdrop.classList.remove("is-visible");setTimeout(()=>{els.modalBackdrop.hidden=true;document.body.style.overflow=""},210)}}
  function openEdit(id){const entry=entries.find(x=>x.id===id);if(!entry)return;editingId=id;const d=new Date(entry.time);els.editTime.value=`${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;openSheet(els.editSheet)}
  function saveEdit(){const entry=entries.find(x=>x.id===editingId);if(!entry||!els.editTime.value)return;const [h,m]=els.editTime.value.split(":").map(Number),d=new Date(entry.time);d.setHours(h,m,0,0);entry.time=d.toISOString();entries.sort((a,b)=>Date.parse(a.time)-Date.parse(b.time));saveEntries();closeSheets();render();setTimeout(()=>showToast("Eintrag aktualisiert",false),240)}
  function deleteEdit(){if(!editingId)return;entries=entries.filter(x=>x.id!==editingId);saveEntries();editingId=null;closeSheets();render();setTimeout(()=>showToast("Eintrag gelöscht",false),240)}
  function setTheme(theme){if(!THEMES[theme])return;settings.theme=theme;saveSettings();applyTheme();render()}
  function exportData(){const payload={app:"Ember",version:"1.0",exportedAt:new Date().toISOString(),settings,entries};const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=`ember-export-${new Date().toISOString().slice(0,10)}.json`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
  els.addButton.addEventListener("click",addEntry);els.undoButton.addEventListener("click",undoLastAdd);els.analysisButton.addEventListener("click",()=>showView(els.analysisView));els.pauseCardHome.addEventListener("click",()=>openSheet(els.pauseSheet));els.settingsButton.addEventListener("click",()=>showView(els.settingsView));els.daySummaryCard.addEventListener("click",()=>{renderTodaySheet();openSheet(els.todaySheet)});els.settingsBackButton.addEventListener("click",()=>showView(els.homeView));els.analysisBackButton.addEventListener("click",()=>showView(els.homeView));els.lastCard.addEventListener("click",()=>{const t=todaysEntries(),n=t[t.length-1];if(n)openEdit(n.id)});
  els.limitTile.addEventListener("click",()=>openSheet(els.limitSheet));els.limitMinus.addEventListener("click",()=>{settings.limit=clamp(settings.limit-1,1,99);saveSettings();render()});els.limitPlus.addEventListener("click",()=>{settings.limit=clamp(settings.limit+1,1,99);saveSettings();render()});els.closeLimitSheet.addEventListener("click",()=>closeSheets());
  els.pauseTile.addEventListener("click",()=>openSheet(els.pauseSheet));els.pauseMinus.addEventListener("click",()=>{settings.pauseGoal=clamp(settings.pauseGoal-5,5,240);saveSettings();render()});els.pausePlus.addEventListener("click",()=>{settings.pauseGoal=clamp(settings.pauseGoal+5,5,240);saveSettings();render()});els.smartPauseToggle.addEventListener("change",()=>{settings.smartPauseSuggestions=els.smartPauseToggle.checked;settings.smartPauseUserSet=true;saveSettings();render()});els.smartPauseApply.addEventListener("click",()=>{const suggestion=smartPauseSuggestion();if(!suggestion)return;settings.pauseGoal=suggestion;saveSettings();render()});els.closePauseSheet.addEventListener("click",()=>closeSheets());
  els.designTile.addEventListener("click",()=>openSheet(els.designSheet));els.themeList.addEventListener("click",e=>{const b=e.target.closest("button[data-theme]");if(b)setTheme(b.dataset.theme)});els.closeDesignSheet.addEventListener("click",()=>closeSheets());
  els.dataTile.addEventListener("click",()=>openSheet(els.dataSheet));els.exportDataButton.addEventListener("click",exportData);els.resetDataButton.addEventListener("click",()=>{if(confirm("Wirklich alle gespeicherten Zigaretten löschen?")){entries=[];saveEntries();closeSheets();render();setTimeout(()=>showToast("Alle Einträge gelöscht",false),240)}});els.closeDataSheet.addEventListener("click",()=>closeSheets());els.aboutTile.addEventListener("click",()=>openSheet(els.aboutSheet));els.closeAboutSheet.addEventListener("click",()=>closeSheets());els.closeTodaySheet.addEventListener("click",()=>closeSheets());
  els.modalBackdrop.addEventListener("click",()=>closeSheets());els.saveEditButton.addEventListener("click",saveEdit);els.deleteEntryButton.addEventListener("click",deleteEdit);
  setInterval(()=>{const t=todaysEntries(),n=t[t.length-1];if(n)els.lastRelative.textContent=relativeTime(new Date(n.time));renderPauseStatus();els.analysisComparisonText.textContent=comparisonCopy(t.length);renderAnalysis()},30000);window.addEventListener("focus",render);document.addEventListener("visibilitychange",()=>{if(!document.hidden)render()});
  applyTheme();render();showView(els.homeView);if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./service-worker.js").catch(()=>{}));
})();
