(() => {
  "use strict";
  const STORAGE_ENTRIES="ember.v1.entries";
  const STORAGE_SETTINGS="ember.v1.settings";
  const STORAGE_MANUAL_COUNTS="ember.v1.manualDailyCounts";
  const THEMES={violet:{name:"Dusk",themeColor:"#f6f4ff"},blue:{name:"Blue Hour",themeColor:"#f3f8fe"},terracotta:{name:"Ember Clay",themeColor:"#fbf5ef"},green:{name:"Sage",themeColor:"#f4f7f1"},dark:{name:"Midnight",themeColor:"#0a0b0d"}};
  const THEME_MIGRATION={orange:"terracotta",teal:"blue",graphite:"violet"};
  const $=id=>document.getElementById(id);
  const els={
    homeView:$("homeView"),settingsView:$("settingsView"),analysisView:$("analysisView"),
    dateLabel:$("dateLabel"),todayCount:$("todayCount"),limitCount:$("limitCount"),remainingText:$("remainingText"),pauseCardHome:$("pauseCardHome"),homePauseValue:$("homePauseValue"),homePauseHint:$("homePauseHint"),pauseDialValue:$("pauseDialValue"),progressCircle:$("progressCircle"),progressWrap:$("progressWrap"),
    addButton:$("addButton"),lastCard:$("lastCard"),lastTime:$("lastTime"),lastRelative:$("lastRelative"),analysisComparisonCount:$("analysisComparisonCount"),analysisComparisonText:$("analysisComparisonText"),entryCountLabel:$("entryCountLabel"),daySummaryCard:$("daySummaryCard"),dayFirstEntry:$("dayFirstEntry"),dayFirstCompare:$("dayFirstCompare"),dayBestPause:$("dayBestPause"),dayMiniTimeline:$("dayMiniTimeline"),daySheetTitle:$("daySheetTitle"),todaySheetSummary:$("todaySheetSummary"),dayDetailCount:$("dayDetailCount"),dayDetailFirst:$("dayDetailFirst"),dayDetailAverage:$("dayDetailAverage"),dayDetailBest:$("dayDetailBest"),dayDetailTimeline:$("dayDetailTimeline"),dayDetailStatus:$("dayDetailStatus"),dayBackfillButton:$("dayBackfillButton"),todaySheetList:$("todaySheetList"),closeTodaySheet:$("closeTodaySheet"),
    analysisButton:$("analysisButton"),settingsButton:$("settingsButton"),settingsBackButton:$("settingsBackButton"),analysisBackButton:$("analysisBackButton"),
    limitTile:$("limitTile"),pauseTile:$("pauseTile"),designTile:$("designTile"),backfillTile:$("backfillTile"),dataTile:$("dataTile"),aboutTile:$("aboutTile"),limitTileValue:$("limitTileValue"),pauseTileValue:$("pauseTileValue"),designTileValue:$("designTileValue"),
    modalBackdrop:$("modalBackdrop"),pauseConfirmSheet:$("pauseConfirmSheet"),backfillSheet:$("backfillSheet"),limitSheet:$("limitSheet"),pauseSheet:$("pauseSheet"),designSheet:$("designSheet"),dataSheet:$("dataSheet"),aboutSheet:$("aboutSheet"),todaySheet:$("todaySheet"),editSheet:$("editSheet"),
    limitMinus:$("limitMinus"),limitPlus:$("limitPlus"),settingsLimitValue:$("settingsLimitValue"),smartLimitSuggestion:$("smartLimitSuggestion"),smartLimitText:$("smartLimitText"),smartLimitHint:$("smartLimitHint"),smartLimitLater:$("smartLimitLater"),smartLimitApply:$("smartLimitApply"),closeLimitSheet:$("closeLimitSheet"),
    pauseConfirmTime:$("pauseConfirmTime"),pauseConfirmSubtitle:$("pauseConfirmSubtitle"),pauseConfirmFill:$("pauseConfirmFill"),pauseWaitButton:$("pauseWaitButton"),pauseAddAnywayButton:$("pauseAddAnywayButton"),pauseMinus:$("pauseMinus"),pausePlus:$("pausePlus"),settingsPauseValue:$("settingsPauseValue"),smartPauseToggle:$("smartPauseToggle"),smartPauseSuggestion:$("smartPauseSuggestion"),smartPauseText:$("smartPauseText"),smartPauseLater:$("smartPauseLater"),smartPauseApply:$("smartPauseApply"),closePauseSheet:$("closePauseSheet"),themeList:$("themeList"),closeDesignSheet:$("closeDesignSheet"),
    backfillDate:$("backfillDate"),backfillCount:$("backfillCount"),backfillMinus:$("backfillMinus"),backfillPlus:$("backfillPlus"),saveBackfillButton:$("saveBackfillButton"),deleteBackfillButton:$("deleteBackfillButton"),closeBackfillSheet:$("closeBackfillSheet"),exportDataButton:$("exportDataButton"),importDataButton:$("importDataButton"),importDataInput:$("importDataInput"),resetDataButton:$("resetDataButton"),closeDataSheet:$("closeDataSheet"),closeAboutSheet:$("closeAboutSheet"),
    editTime:$("editTime"),saveEditButton:$("saveEditButton"),deleteEntryButton:$("deleteEntryButton"),
    analysisToday:$("analysisToday"),analysisRemaining:$("analysisRemaining"),analysisRemainingCard:$("analysisRemainingCard"),analysisRemainingTitle:$("analysisRemainingTitle"),analysisRemainingLabel:$("analysisRemainingLabel"),summaryWeekButton:$("summaryWeekButton"),summaryMonthButton:$("summaryMonthButton"),periodSummaryRange:$("periodSummaryRange"),periodSummaryLabel:$("periodSummaryLabel"),periodSummaryTotal:$("periodSummaryTotal"),periodSummaryAverage:$("periodSummaryAverage"),periodSummaryWithinLimit:$("periodSummaryWithinLimit"),periodSummaryBestPause:$("periodSummaryBestPause"),analysisPauseGoal:$("analysisPauseGoal"),analysisCurrentPause:$("analysisCurrentPause"),analysisCurrentPauseText:$("analysisCurrentPauseText"),currentPauseFill:$("currentPauseFill"),analysisPauseHit:$("analysisPauseHit"),analysisPauseCaption:$("analysisPauseCaption"),analysisPauseAverage:$("analysisPauseAverage"),timeHeatmap:$("timeHeatmap"),heatmapPeak:$("heatmapPeak"),daypartMorning:$("daypartMorning"),daypartNoon:$("daypartNoon"),daypartAfternoon:$("daypartAfternoon"),daypartEvening:$("daypartEvening"),weekOverview:$("weekOverview"),weekRangeTitle:$("weekRangeTitle"),weekPrev:$("weekPrev"),weekNext:$("weekNext"),monthCalendar:$("monthCalendar"),monthCalendarTitle:$("monthCalendarTitle"),monthTotal:$("monthTotal"),monthPrev:$("monthPrev"),monthNext:$("monthNext"),
    toast:$("toast"),toastText:$("toastText"),undoButton:$("undoButton")
  };
  const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));
  let entries=loadEntries(), settings=loadSettings(), manualDailyCounts=loadManualCounts(), lastAddedId=null, editingId=null, toastTimer=null, addAnimationTimer=null, analysisWeekOffset=0, analysisMonthOffset=0, analysisSummaryMode="week", activeDaySheetDate=null, backfillCountValue=0;
  const dayStart=(date=new Date())=>new Date(date.getFullYear(),date.getMonth(),date.getDate()).getTime();
  const formatTime=date=>new Intl.DateTimeFormat("de-AT",{hour:"2-digit",minute:"2-digit"}).format(date);
  function formatDate(date=new Date()){const t=new Intl.DateTimeFormat("de-AT",{weekday:"long",day:"numeric",month:"long"}).format(date);return t.charAt(0).toUpperCase()+t.slice(1)}
  function relativeTime(date){const m=Math.max(0,Math.floor((Date.now()-date.getTime())/60000));if(m<1)return"gerade eben";if(m===1)return"vor 1 Min.";if(m<60)return`vor ${m} Min.`;const h=Math.floor(m/60);if(h===1)return"vor 1 Std.";if(h<24)return`vor ${h} Std.`;return"früher"}
  function loadEntries(){try{const raw=JSON.parse(localStorage.getItem(STORAGE_ENTRIES)||"[]");return Array.isArray(raw)?raw.filter(x=>x&&typeof x.id==="string"&&typeof x.time==="string"&&!Number.isNaN(Date.parse(x.time))).sort((a,b)=>Date.parse(a.time)-Date.parse(b.time)):[]}catch{return[]}}
  function sanitizeManualCounts(raw){
    if(!raw||typeof raw!=="object"||Array.isArray(raw))return{};
    const clean={};
    Object.entries(raw).forEach(([key,value])=>{
      if(!/^\d{4}-\d{2}-\d{2}$/.test(key))return;
      const count=Number(value);
      if(Number.isFinite(count)&&count>=0)clean[key]=clamp(Math.round(count),0,99);
    });
    return clean;
  }
  function loadManualCounts(){try{return sanitizeManualCounts(JSON.parse(localStorage.getItem(STORAGE_MANUAL_COUNTS)||"{}"))}catch{return{}}}

  function normalizeSettings(raw={}){
    const migrated=THEME_MIGRATION[raw.theme]||raw.theme,userSet=Boolean(raw.smartPauseUserSet);
    const num=value=>Number.isFinite(Number(value))?Math.max(0,Number(value)):0;
    return{
      limit:Number.isFinite(Number(raw.limit))?clamp(Math.round(Number(raw.limit)),1,99):20,
      theme:THEMES[migrated]?migrated:"violet",
      pauseGoal:Number.isFinite(Number(raw.pauseGoal))?clamp(Math.round(Number(raw.pauseGoal)/5)*5,5,240):50,
      smartPauseSuggestions:userSet?Boolean(raw.smartPauseSuggestions):true,
      smartPauseUserSet:userSet,
      limitChangedAt:num(raw.limitChangedAt),
      pauseGoalChangedAt:num(raw.pauseGoalChangedAt),
      limitSuggestionSnoozedUntil:num(raw.limitSuggestionSnoozedUntil),
      pauseSuggestionSnoozedUntil:num(raw.pauseSuggestionSnoozedUntil)
    };
  }
  function loadSettings(){try{return normalizeSettings(JSON.parse(localStorage.getItem(STORAGE_SETTINGS)||"{}"))}catch{return normalizeSettings()}}
  const saveEntries=()=>localStorage.setItem(STORAGE_ENTRIES,JSON.stringify(entries));
  const saveSettings=()=>localStorage.setItem(STORAGE_SETTINGS,JSON.stringify(settings));
  const saveManualCounts=()=>localStorage.setItem(STORAGE_MANUAL_COUNTS,JSON.stringify(manualDailyCounts));
  function entriesForDay(start){const d=new Date(start),from=new Date(d.getFullYear(),d.getMonth(),d.getDate()).getTime(),next=new Date(d.getFullYear(),d.getMonth(),d.getDate()+1).getTime();return entries.filter(item=>{const t=Date.parse(item.time);return t>=from&&t<next})}
  function manualCountForDay(date){const value=manualDailyCounts[localDateKey(new Date(date))];return Number.isFinite(Number(value))?Number(value):null}
  function effectiveDayCount(date){
    const manual=manualCountForDay(date),exact=entriesForDay(dayStart(new Date(date))).length;
    return manual!=null?Math.max(manual,exact):exact;
  }
  function hasDayCount(date){return manualCountForDay(date)!=null||entriesForDay(dayStart(new Date(date))).length>0}

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
  function renderTimelineDots(target,list){
    target.innerHTML="";
    target.classList.toggle("is-empty",!list.length);
    list.forEach(entry=>{
      const d=new Date(entry.time),minutes=d.getHours()*60+d.getMinutes(),dot=document.createElement("span");
      dot.className="day-mini-dot";
      dot.style.left=`${clamp(minutes/1440*100,1.5,98.5)}%`;
      target.appendChild(dot);
    });
  }
  function renderMiniTimeline(today){renderTimelineDots(els.dayMiniTimeline,today)}
  function renderDaySummary(today){
    const count=today.length,first=today[0],gaps=gapMinutes(today),best=longestGap(gaps),later=firstEntryLaterText(today);
    els.entryCountLabel.textContent=String(count);
    els.dayFirstEntry.textContent=first?formatTime(new Date(first.time)):"–";
    els.dayBestPause.textContent=formatGap(best);
    els.dayFirstCompare.hidden=!later;
    els.dayFirstCompare.textContent=later;
    renderMiniTimeline(today);
  }
  function renderTimeHeatmap(){
    const recent=recentEntries(30),buckets=Array(12).fill(0),parts={morning:0,noon:0,afternoon:0,evening:0};
    recent.forEach(entry=>{
      const hour=new Date(entry.time).getHours();
      buckets[Math.floor(hour/2)]++;
      if(hour>=5&&hour<11)parts.morning++;
      else if(hour>=11&&hour<14)parts.noon++;
      else if(hour>=14&&hour<18)parts.afternoon++;
      else parts.evening++;
    });
    const max=Math.max(...buckets,0),total=recent.length;
    els.timeHeatmap.innerHTML="";
    buckets.forEach((count,index)=>{
      const cell=document.createElement("span"),start=index*2,end=start+2;
      const level=count===0?0:Math.max(1,Math.ceil(count/Math.max(max,1)*4));
      cell.className="time-heatmap-cell";
      cell.dataset.level=String(level);
      cell.setAttribute("aria-label",`${String(start).padStart(2,"0")} bis ${String(end).padStart(2,"0")} Uhr: ${count} ${count===1?"Eintrag":"Einträge"}`);
      cell.title=`${String(start).padStart(2,"0")}–${String(end).padStart(2,"0")} · ${count}`;
      els.timeHeatmap.appendChild(cell);
    });
    const pct=value=>total?`${Math.round(value/total*100)} %`:"–";
    els.daypartMorning.textContent=pct(parts.morning);
    els.daypartNoon.textContent=pct(parts.noon);
    els.daypartAfternoon.textContent=pct(parts.afternoon);
    els.daypartEvening.textContent=pct(parts.evening);
    if(!max){
      els.heatmapPeak.textContent="Noch keine Daten für ein Zeitmuster";
      return;
    }
    const peakIndex=buckets.indexOf(max),start=peakIndex*2,end=start+2;
    els.heatmapPeak.textContent=`Am häufigsten: ${String(start).padStart(2,"0")}–${String(end).padStart(2,"0")} Uhr`;
  }
  function localDateKey(date){
    return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
  }
  function startOfWeek(date=new Date()){
    const d=new Date(date.getFullYear(),date.getMonth(),date.getDate()),weekday=(d.getDay()+6)%7;
    d.setDate(d.getDate()-weekday);
    return d;
  }
  function addDays(date,amount){
    const d=new Date(date);
    d.setDate(d.getDate()+amount);
    return d;
  }
  function isSameLocalDay(a,b){
    return a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate();
  }
  function shortDayDate(date){
    return new Intl.DateTimeFormat("de-AT",{day:"numeric",month:"short"}).format(date).replace(".","");
  }
  function periodStats(startDate,endDate){
    const now=new Date(),todayStart=dayStart(now);
    let cursor=new Date(startDate.getFullYear(),startDate.getMonth(),startDate.getDate());
    const end=new Date(endDate.getFullYear(),endDate.getMonth(),endDate.getDate());
    let total=0,trackedDays=0,withinLimit=0,bestPause=null;
    while(cursor<end&&dayStart(cursor)<=todayStart){
      const list=entriesForDay(dayStart(cursor)),known=hasDayCount(cursor),count=effectiveDayCount(cursor);
      if(known){
        trackedDays++;
        total+=count;
        if(count<=settings.limit)withinLimit++;
      }
      const best=longestGap(gapMinutes(list));
      if(best!=null&&(bestPause==null||best>bestPause))bestPause=best;
      cursor=addDays(cursor,1);
    }
    return{total,trackedDays,withinLimit,bestPause,average:trackedDays?total/trackedDays:null};
  }
  function renderPeriodSummary(){
    const now=new Date(),weekStart=startOfWeek(now),monthStart=new Date(now.getFullYear(),now.getMonth(),1);
    const isWeek=analysisSummaryMode==="week";
    const start=isWeek?weekStart:monthStart,end=isWeek?addDays(weekStart,7):new Date(now.getFullYear(),now.getMonth()+1,1);
    const stats=periodStats(start,end);
    els.summaryWeekButton.classList.toggle("is-active",isWeek);
    els.summaryMonthButton.classList.toggle("is-active",!isWeek);
    els.summaryWeekButton.setAttribute("aria-pressed",String(isWeek));
    els.summaryMonthButton.setAttribute("aria-pressed",String(!isWeek));
    els.periodSummaryRange.textContent=isWeek?`${shortDayDate(start)} – ${shortDayDate(addDays(start,6))}`:new Intl.DateTimeFormat("de-AT",{month:"long",year:"numeric"}).format(start);
    els.periodSummaryLabel.textContent=isWeek?"Einträge diese Woche":"Einträge diesen Monat";
    els.periodSummaryTotal.textContent=String(stats.total);
    els.periodSummaryAverage.textContent=stats.average==null?"–":stats.average.toLocaleString("de-AT",{minimumFractionDigits:stats.average%1?1:0,maximumFractionDigits:1});
    els.periodSummaryWithinLimit.textContent=stats.trackedDays?`${stats.withinLimit}/${stats.trackedDays}`:"–";
    els.periodSummaryBestPause.textContent=formatGap(stats.bestPause);
  }
  function renderWeekOverview(){
    const now=new Date(),anchor=addDays(now,analysisWeekOffset*7),monday=startOfWeek(anchor),sunday=addDays(monday,6);
    els.weekRangeTitle.textContent=`${shortDayDate(monday)} – ${shortDayDate(sunday)}`;
    els.weekNext.disabled=analysisWeekOffset>=0;
    els.weekOverview.innerHTML="";
    const days=Array.from({length:7},(_,i)=>addDays(monday,i));
    const counts=days.map(date=>hasDayCount(date)?effectiveDayCount(date):null),max=Math.max(...counts.filter(v=>v!=null),1);
    days.forEach((date,index)=>{
      const count=counts[index],button=document.createElement("button"),future=date>now&&!isSameLocalDay(date,now),known=count!=null,manual=manualCountForDay(date)!=null;
      const weekday=new Intl.DateTimeFormat("de-AT",{weekday:"short"}).format(date).replace(".","");
      const level=known&&count>0?Math.max(1,Math.ceil(count/max*4)):0;
      button.type="button";
      button.className="week-day";
      button.dataset.level=String(level);
      if(isSameLocalDay(date,now))button.classList.add("is-today");
      if(manual)button.classList.add("is-manual");
      if(!known&&!future)button.classList.add("is-untracked");
      if(future){button.classList.add("is-future");button.disabled=true}
      button.innerHTML=known
        ?`<span>${weekday}</span><b>${date.getDate()}</b><strong>${count}</strong><small>${manual?"Nachtrag":count===1?"Eintrag":"Einträge"}</small>`
        :`<span>${weekday}</span><b>${date.getDate()}</b><strong>–</strong><small>${future?"":"Keine Daten"}</small>`;
      button.setAttribute("aria-label",future?`${formatDate(date)}: zukünftiger Tag`:known?`${formatDate(date)}: ${count} Zigaretten${manual?", nachgetragen":""}`:`${formatDate(date)}: keine Daten`);
      if(!future)button.addEventListener("click",()=>openDaySheet(date));
      els.weekOverview.appendChild(button);
    });
  }
  function renderMonthCalendar(){
    const now=new Date(),selected=new Date(now.getFullYear(),now.getMonth()+analysisMonthOffset,1),year=selected.getFullYear(),month=selected.getMonth();
    const first=new Date(year,month,1),daysInMonth=new Date(year,month+1,0).getDate();
    const monthCounts=Array.from({length:daysInMonth},(_,i)=>{
      const date=new Date(year,month,i+1);
      return hasDayCount(date)?effectiveDayCount(date):null;
    });
    const knownCounts=monthCounts.filter(value=>value!=null),max=Math.max(...knownCounts,0),total=knownCounts.reduce((sum,value)=>sum+value,0);
    const title=new Intl.DateTimeFormat("de-AT",{month:"long",year:"numeric"}).format(first);
    els.monthCalendarTitle.textContent=title.charAt(0).toUpperCase()+title.slice(1);
    els.monthTotal.textContent=`${total} ${total===1?"Eintrag":"Einträge"}`;
    els.monthNext.disabled=analysisMonthOffset>=0;
    els.monthCalendar.innerHTML="";
    const offset=(first.getDay()+6)%7;
    for(let i=0;i<offset;i++){
      const blank=document.createElement("span");
      blank.className="month-day is-blank";
      blank.setAttribute("aria-hidden","true");
      els.monthCalendar.appendChild(blank);
    }
    for(let day=1;day<=daysInMonth;day++){
      const date=new Date(year,month,day),count=monthCounts[day-1],cell=document.createElement("button");
      const future=date>now&&!isSameLocalDay(date,now),known=count!=null,manual=manualCountForDay(date)!=null,level=known&&count>0?Math.max(1,Math.ceil(count/Math.max(max,1)*4)):0;
      cell.type="button";
      cell.className="month-day";
      cell.dataset.level=String(level);
      if(isSameLocalDay(date,now))cell.classList.add("is-today");
      if(manual)cell.classList.add("is-manual");
      if(!known&&!future)cell.classList.add("is-untracked");
      if(future){cell.classList.add("is-future");cell.disabled=true}
      cell.innerHTML=`<b>${day}</b>${known?`<small>${count}</small>`:(!future?"<small>–</small>":"")}`;
      cell.setAttribute("aria-label",future?`${formatDate(date)}: zukünftiger Tag`:known?`${formatDate(date)}: ${count} Zigaretten${manual?", nachgetragen":""}`:`${formatDate(date)}: keine Daten`);
      if(!future)cell.addEventListener("click",()=>openDaySheet(date));
      els.monthCalendar.appendChild(cell);
    }
  }
  function renderDaySheet(date=new Date()){
    const selected=new Date(date.getFullYear(),date.getMonth(),date.getDate()),start=dayStart(selected),list=entriesForDay(start),manual=manualCountForDay(selected),known=manual!=null||list.length>0,count=manual!=null?manual:list.length,gaps=gapMinutes(list),best=longestGap(gaps),avg=averageFromGaps(gaps),isPast=dayStart(selected)<dayStart();
    activeDaySheetDate=selected;
    els.daySheetTitle.textContent=formatDate(selected);
    els.todaySheetSummary.textContent=manual!=null
      ?(list.length?"Anzahl nachgetragen · Zeitwerte nur aus den gespeicherten Uhrzeiten.":"Anzahl nachgetragen · keine Uhrzeiten gespeichert.")
      :(list.length?"Zeitwerte aus deinen gespeicherten Einträgen.":"Noch keine Daten für diesen Tag.");
    els.dayDetailCount.textContent=known?String(count):"–";
    els.dayDetailFirst.textContent=list.length?formatTime(new Date(list[0].time)):"–";
    els.dayDetailAverage.textContent=formatGap(avg);
    els.dayDetailBest.textContent=formatGap(best);
    renderTimelineDots(els.dayDetailTimeline,list);
    els.dayDetailStatus.classList.toggle("is-over-limit",known&&count>settings.limit);
    els.dayDetailStatus.classList.toggle("is-within-limit",known&&count<=settings.limit);
    els.dayDetailStatus.classList.toggle("is-untracked",!known);
    els.dayDetailStatus.textContent=!known
      ?"Keine Anzahl gespeichert"
      :count>settings.limit
        ?`${count-settings.limit} über Tageslimit ${settings.limit}`
        :`Im Tageslimit · ${count} / ${settings.limit}`;
    els.dayBackfillButton.hidden=!isPast;
    els.dayBackfillButton.textContent=manual!=null?"Nachgetragene Anzahl ändern":"Anzahl für diesen Tag nachtragen";
    els.todaySheetList.innerHTML="";
    [...list].reverse().forEach((entry,index)=>{
      const row=document.createElement("button");
      row.type="button";
      row.className="today-sheet-row";
      const number=list.length-index;
      row.innerHTML=`<span><strong>${formatTime(new Date(entry.time))}</strong><small>${number}. Eintrag</small></span><span>›</span>`;
      row.addEventListener("click",()=>openEdit(entry.id));
      els.todaySheetList.appendChild(row);
    });
  }
  function renderTodaySheet(){renderDaySheet(new Date())}
  function openDaySheet(date){
    renderDaySheet(date);
    openSheet(els.todaySheet);
  }
  function dateInputValue(date){
    return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
  }
  function parseDateInput(value){
    const parts=String(value||"").split("-").map(Number);
    if(parts.length!==3||parts.some(Number.isNaN))return null;
    return new Date(parts[0],parts[1]-1,parts[2]);
  }
  function updateBackfillSheetForDate(){
    const date=parseDateInput(els.backfillDate.value);
    if(!date)return;
    const manual=manualCountForDay(date),exact=entriesForDay(dayStart(date)).length;
    backfillCountValue=manual!=null?manual:exact;
    els.backfillCount.textContent=String(backfillCountValue);
    els.deleteBackfillButton.hidden=manual==null;
  }
  function openBackfillSheet(date=null){
    const yesterday=addDays(new Date(),-1),chosen=date&&dayStart(date)<dayStart()?new Date(date):yesterday;
    els.backfillDate.max=dateInputValue(yesterday);
    els.backfillDate.value=dateInputValue(chosen);
    updateBackfillSheetForDate();
    openSheet(els.backfillSheet);
  }
  function saveBackfill(){
    const date=parseDateInput(els.backfillDate.value);
    if(!date||dayStart(date)>=dayStart()){alert("Nachtragen ist nur für vergangene Tage möglich.");return}
    const exact=entriesForDay(dayStart(date)).length;
    if(backfillCountValue<exact){
      alert(`Für diesen Tag sind bereits ${exact} Einträge mit Uhrzeit gespeichert. Die nachgetragene Anzahl kann nicht kleiner sein.`);
      return;
    }
    manualDailyCounts[localDateKey(date)]=clamp(Math.round(backfillCountValue),0,99);
    saveManualCounts();
    closeSheets();
    activeDaySheetDate=null;
    render();
    setTimeout(()=>showToast("Tag nachgetragen",false),240);
  }
  function deleteBackfill(){
    const date=parseDateInput(els.backfillDate.value);
    if(!date)return;
    delete manualDailyCounts[localDateKey(date)];
    saveManualCounts();
    closeSheets();
    activeDaySheetDate=null;
    render();
    setTimeout(()=>showToast("Nachtrag entfernt",false),240);
  }
  function formatRemaining(minutes){
    const mins=Math.max(0,Math.round(minutes));
    if(mins<60)return`${mins} Min.`;
    const h=Math.floor(mins/60),m=mins%60;
    return m?`${h} Std. ${m} Min.`:`${h} Std.`;
  }
  function renderPauseConfirm(){
    const status=pauseStatusData();
    if(status.state==="empty"||status.state==="reached")return false;
    els.pauseConfirmTime.textContent=`Noch ${formatRemaining(status.remaining)}`;
    els.pauseConfirmSubtitle.textContent="bis zu deiner Pause";
    els.pauseConfirmFill.style.width=`${Math.max(3,Math.round(status.progress*100))}%`;
    return true;
  }
  function requestAddEntry(){
    const today=todaysEntries();
    if(!today.length){addEntry();return}
    const status=pauseStatusData();
    if(status.state==="waiting"||status.state==="close"){
      renderPauseConfirm();
      openSheet(els.pauseConfirmSheet);
      return;
    }
    addEntry();
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
        ?`noch ${status.remaining} Min.`
        :`noch ${status.remaining} Min.`;
    }
    els.pauseCardHome.dataset.state=status.state;
    els.pauseDialValue.dataset.state=status.state;
    els.pauseDialValue.style.strokeDashoffset=String(100-Math.round(status.progress*100));
  }
  function recentEntries(days=7){const start=dayStart()-Math.max(0,days-1)*86400000;return entries.filter(item=>Date.parse(item.time)>=start)}
  function recentGaps(days=3){const gaps=[],base=dayStart();for(let i=0;i<days;i++)gaps.push(...gapMinutes(entriesForDay(base-i*86400000)));return gaps}
  function snoozeUntil(days=7){const d=new Date();d.setDate(d.getDate()+days);return d.getTime()}
  function smartPauseSuggestion(){
    if(!settings.smartPauseSuggestions||Date.now()<settings.pauseSuggestionSnoozedUntil)return null;
    const goal=settings.pauseGoal;
    if(goal>=240)return null;
    const changedDay=settings.pauseGoalChangedAt?dayStart(new Date(settings.pauseGoalChangedAt)):0;
    const allGaps=[],today=new Date();
    for(let i=1;i<=5;i++){
      const date=new Date(today.getFullYear(),today.getMonth(),today.getDate()-i),start=dayStart(date);
      if(changedDay&&start<=changedDay)return null;
      const gaps=gapMinutes(entriesForDay(start));
      if(!gaps.length)return null;
      const hit=gaps.filter(value=>value>=goal).length;
      if(hit/gaps.length<.75)return null;
      allGaps.push(...gaps);
    }
    if(allGaps.length<8)return null;
    const avg=averageFromGaps(allGaps);
    return avg!=null&&avg>=goal+2?clamp(goal+5,5,240):null;
  }
  function renderSmartPauseSuggestion(){
    els.smartPauseToggle.checked=settings.smartPauseSuggestions;
    const suggestion=smartPauseSuggestion();
    els.smartPauseSuggestion.hidden=!suggestion;
    if(suggestion)els.smartPauseText.textContent=`5 Tage stabil · ${suggestion} Min. ausprobieren?`;
  }
  function smartLimitSuggestion(){
    const limit=settings.limit;
    if(limit<=1||Date.now()<settings.limitSuggestionSnoozedUntil)return null;
    const changedDay=settings.limitChangedAt?dayStart(new Date(settings.limitChangedAt)):0;
    const today=new Date();
    for(let i=1;i<=5;i++){
      const date=new Date(today.getFullYear(),today.getMonth(),today.getDate()-i),start=dayStart(date);
      if(changedDay&&start<=changedDay)return null;
      const count=entriesForDay(start).length;
      if(count===0||count>limit)return null;
    }
    return limit-1;
  }
  function renderSmartLimitSuggestion(){
    const suggestion=smartLimitSuggestion();
    els.smartLimitSuggestion.hidden=!suggestion;
    if(!suggestion)return;
    els.smartLimitText.textContent="5 Tage in Folge im Limit.";
    els.smartLimitHint.textContent=`Tageslimit auf ${suggestion} reduzieren?`;
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
    const today=todaysEntries(),count=today.length,limit=settings.limit,newest=today[today.length-1],progress=clamp(count/limit,0,1),over=count>limit;
    els.dateLabel.textContent=formatDate();
    els.todayCount.textContent=count;
    els.limitCount.textContent=limit;
    els.remainingText.textContent=over?`${count-limit} über Tageslimit`:`Tageslimit ${limit}`;
    els.progressWrap.classList.toggle("is-over-limit",over);
    renderPauseStatus();
    els.progressCircle.style.strokeDashoffset=String(100-progress*100);
    els.limitTileValue.textContent=`${limit} Zigaretten`;
    els.settingsLimitValue.textContent=limit;
    renderSmartLimitSuggestion();
    els.pauseTileValue.textContent=`${settings.pauseGoal} Minuten`;
    els.settingsPauseValue.textContent=settings.pauseGoal;
    renderSmartPauseSuggestion();
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
    const today=todaysEntries(),count=today.length,todayGaps=gapMinutes(today),avgToday=averageFromGaps(todayGaps),goal=settings.pauseGoal,hit=todayGaps.filter(value=>value>=goal).length,total=todayGaps.length,over=count>settings.limit;
    els.analysisToday.textContent=count;
    els.analysisRemaining.textContent=over?`+${count-settings.limit}`:Math.max(settings.limit-count,0);
    els.analysisRemainingTitle.textContent=over?"Über Limit":"Verbleibend";
    els.analysisRemainingLabel.textContent=over?"über dem Tageslimit":"bis zum Limit";
    els.analysisRemainingCard.classList.toggle("is-over-limit",over);
    renderPeriodSummary();
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
    renderTimeHeatmap();
    renderWeekOverview();
    renderMonthCalendar();
  }
  function showView(view){[els.homeView,els.settingsView,els.analysisView].forEach(v=>{v.hidden=v!==view;v.classList.toggle("is-active",v===view)});window.scrollTo({top:0,behavior:"instant"})}
  function currentView(){
    if(!els.settingsView.hidden)return els.settingsView;
    if(!els.analysisView.hidden)return els.analysisView;
    return els.homeView;
  }
  function sheetsOpen(){
    return [els.pauseConfirmSheet,els.backfillSheet,els.limitSheet,els.pauseSheet,els.designSheet,els.dataSheet,els.aboutSheet,els.todaySheet,els.editSheet]
      .some(sheet=>sheet&&sheet.getAttribute("aria-hidden")==="false");
  }
  function setupSwipeNavigation(){
    let startX=0,startY=0,startTime=0,tracking=false,mode="";
    const RIGHT_EDGE=42,IOS_LEFT_GUARD=54,MIN_DISTANCE=78,MAX_VERTICAL=62,MAX_TIME=650;
    document.addEventListener("touchstart",event=>{
      if(event.touches.length!==1||sheetsOpen())return;
      const touch=event.touches[0],view=currentView(),width=window.innerWidth;
      mode="";
      if(view===els.homeView&&touch.clientX>=width-RIGHT_EDGE)mode="open-settings";
      else if(view===els.settingsView&&touch.clientX>IOS_LEFT_GUARD)mode="back-home";
      if(!mode)return;
      startX=touch.clientX;
      startY=touch.clientY;
      startTime=Date.now();
      tracking=true;
    },{passive:true});
    document.addEventListener("touchmove",event=>{
      if(!tracking||event.touches.length!==1)return;
      const touch=event.touches[0],dx=touch.clientX-startX,dy=Math.abs(touch.clientY-startY);
      if(dy>MAX_VERTICAL||Date.now()-startTime>MAX_TIME){tracking=false;return}
      if(mode==="open-settings"&&dx<-MIN_DISTANCE){
        tracking=false;
        showView(els.settingsView);
      }else if(mode==="back-home"&&dx>MIN_DISTANCE){
        tracking=false;
        showView(els.homeView);
      }
    },{passive:true});
    document.addEventListener("touchend",()=>{tracking=false},{passive:true});
    document.addEventListener("touchcancel",()=>{tracking=false},{passive:true});
  }

  function currentView(){
    if(!els.settingsView.hidden)return els.settingsView;
    if(!els.analysisView.hidden)return els.analysisView;
    return els.homeView;
  }
  function gestureBlockedTarget(target){
    return Boolean(target.closest("button,input,select,textarea,.modal-sheet,.toast,.today-sheet-list"));
  }
  let swipeStartX=null,swipeStartY=null,swipeStartView=null,swipeFromRightEdge=false;
  function handleTouchStart(event){
    if(event.touches.length!==1||!els.modalBackdrop.hidden)return;
    const touch=event.touches[0],width=window.innerWidth;
    swipeStartX=touch.clientX;
    swipeStartY=touch.clientY;
    swipeStartView=currentView();
    swipeFromRightEdge=touch.clientX>=width-28;
    if(gestureBlockedTarget(event.target)){
      swipeStartX=null;
      swipeStartY=null;
      swipeStartView=null;
    }
  }
  function handleTouchEnd(event){
    if(swipeStartX==null||swipeStartY==null||!swipeStartView)return;
    const touch=event.changedTouches[0],dx=touch.clientX-swipeStartX,dy=touch.clientY-swipeStartY;
    const horizontal=Math.abs(dx)>=72&&Math.abs(dx)>Math.abs(dy)*1.35;
    if(horizontal){
      if(swipeStartView===els.homeView&&swipeFromRightEdge&&dx<0){
        showView(els.settingsView);
      }else if((swipeStartView===els.settingsView||swipeStartView===els.analysisView)&&dx>0&&swipeStartX>44){
        showView(els.homeView);
      }
    }
    swipeStartX=null;
    swipeStartY=null;
    swipeStartView=null;
    swipeFromRightEdge=false;
  }

  function playAddAnimation(){
    clearTimeout(addAnimationTimer);
    els.progressWrap.classList.remove("just-added");
    els.addButton.classList.remove("just-added");
    void els.progressWrap.offsetWidth;
    els.progressWrap.classList.add("just-added");
    els.addButton.classList.add("just-added");
    addAnimationTimer=setTimeout(()=>{
      els.progressWrap.classList.remove("just-added");
      els.addButton.classList.remove("just-added");
    },950);
  }
  function addEntry(){const id=crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(16).slice(2)}`,entry={id,time:new Date().toISOString()};entries.push(entry);entries.sort((a,b)=>Date.parse(a.time)-Date.parse(b.time));saveEntries();lastAddedId=id;render();playAddAnimation();showToast(`${formatTime(new Date(entry.time))} gespeichert`,true)}
  function undoLastAdd(){if(!lastAddedId)return;entries=entries.filter(x=>x.id!==lastAddedId);saveEntries();lastAddedId=null;render();showToast("Eintrag entfernt",false)}
  function hideToast(){clearTimeout(toastTimer);els.toast.classList.remove("is-visible");els.toast.setAttribute("aria-hidden","true")}
  function showToast(text,undo){hideToast();els.toastText.textContent=text;els.undoButton.hidden=!undo;els.toast.classList.add("is-visible");els.toast.setAttribute("aria-hidden","false");toastTimer=setTimeout(hideToast,3600)}
  function openSheet(sheet){hideToast();closeSheets(false);els.modalBackdrop.hidden=false;requestAnimationFrame(()=>{els.modalBackdrop.classList.add("is-visible");sheet.classList.add("is-open")});sheet.setAttribute("aria-hidden","false");document.body.style.overflow="hidden"}
  function closeSheets(hide=true){[els.pauseConfirmSheet,els.backfillSheet,els.limitSheet,els.pauseSheet,els.designSheet,els.dataSheet,els.aboutSheet,els.todaySheet,els.editSheet].forEach(s=>{s.classList.remove("is-open");s.setAttribute("aria-hidden","true")});if(hide){els.modalBackdrop.classList.remove("is-visible");setTimeout(()=>{els.modalBackdrop.hidden=true;document.body.style.overflow=""},210)}}
  function openEdit(id){const entry=entries.find(x=>x.id===id);if(!entry)return;editingId=id;const d=new Date(entry.time);els.editTime.value=`${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;openSheet(els.editSheet)}
  function saveEdit(){const entry=entries.find(x=>x.id===editingId);if(!entry||!els.editTime.value)return;const [h,m]=els.editTime.value.split(":").map(Number),d=new Date(entry.time);d.setHours(h,m,0,0);entry.time=d.toISOString();entries.sort((a,b)=>Date.parse(a.time)-Date.parse(b.time));saveEntries();closeSheets();render();setTimeout(()=>showToast("Eintrag aktualisiert",false),240)}
  function deleteEdit(){if(!editingId)return;entries=entries.filter(x=>x.id!==editingId);saveEntries();editingId=null;closeSheets();render();setTimeout(()=>showToast("Eintrag gelöscht",false),240)}
  function setTheme(theme){if(!THEMES[theme])return;settings.theme=theme;saveSettings();applyTheme();render()}
  function exportData(){const payload={app:"Ember",version:"1.1",exportedAt:new Date().toISOString(),settings,entries,manualDailyCounts};const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=`ember-export-${new Date().toISOString().slice(0,10)}.json`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
  function sanitizeImportedEntries(raw){
    if(!Array.isArray(raw))throw new Error("Keine gültigen Einträge gefunden.");
    const seen=new Set(),clean=[];
    raw.forEach((item,index)=>{
      if(!item||typeof item.time!=="string"||Number.isNaN(Date.parse(item.time)))return;
      let id=typeof item.id==="string"&&item.id.trim()?item.id.trim():`import-${Date.parse(item.time)}-${index}`;
      while(seen.has(id))id=`${id}-${index}`;
      seen.add(id);
      clean.push({id,time:new Date(item.time).toISOString()});
    });
    return clean.sort((a,b)=>Date.parse(a.time)-Date.parse(b.time));
  }
  async function importData(file){
    if(!file)return;
    try{
      const raw=JSON.parse(await file.text());
      if(!raw||typeof raw!=="object"||!Array.isArray(raw.entries))throw new Error("Das ist kein gültiges Ember-Backup.");
      const importedEntries=sanitizeImportedEntries(raw.entries),importedSettings=normalizeSettings(raw.settings||{}),importedManualCounts=sanitizeManualCounts(raw.manualDailyCounts||{});
      const ok=confirm(`Backup mit ${importedEntries.length} ${importedEntries.length===1?"Eintrag":"Einträgen"} importieren? Deine aktuellen Daten werden ersetzt.`);
      if(!ok)return;
      entries=importedEntries;
      settings=importedSettings;
      manualDailyCounts=importedManualCounts;
      saveEntries();
      saveSettings();
      saveManualCounts();
      analysisWeekOffset=0;
      analysisMonthOffset=0;
      analysisSummaryMode="week";
      applyTheme();
      closeSheets();
      render();
      setTimeout(()=>showToast("Backup importiert",false),240);
    }catch(error){
      alert(error&&error.message?error.message:"Import fehlgeschlagen.");
    }finally{
      els.importDataInput.value="";
    }
  }
  els.addButton.addEventListener("click",requestAddEntry);els.undoButton.addEventListener("click",undoLastAdd);els.analysisButton.addEventListener("click",()=>showView(els.analysisView));els.pauseCardHome.addEventListener("click",()=>openSheet(els.pauseSheet));els.settingsButton.addEventListener("click",()=>showView(els.settingsView));els.daySummaryCard.addEventListener("click",()=>openDaySheet(new Date()));els.settingsBackButton.addEventListener("click",()=>showView(els.homeView));els.analysisBackButton.addEventListener("click",()=>showView(els.homeView));els.lastCard.addEventListener("click",()=>{const t=todaysEntries(),n=t[t.length-1];if(n)openEdit(n.id)});
  els.pauseWaitButton.addEventListener("click",()=>closeSheets());
  els.pauseAddAnywayButton.addEventListener("click",()=>{closeSheets();addEntry()});
  els.backfillTile.addEventListener("click",()=>{activeDaySheetDate=null;openBackfillSheet()});
  els.dayBackfillButton.addEventListener("click",()=>{if(activeDaySheetDate)openBackfillSheet(activeDaySheetDate)});
  els.backfillDate.addEventListener("change",updateBackfillSheetForDate);
  els.backfillMinus.addEventListener("click",()=>{backfillCountValue=clamp(backfillCountValue-1,0,99);els.backfillCount.textContent=String(backfillCountValue)});
  els.backfillPlus.addEventListener("click",()=>{backfillCountValue=clamp(backfillCountValue+1,0,99);els.backfillCount.textContent=String(backfillCountValue)});
  els.saveBackfillButton.addEventListener("click",saveBackfill);
  els.deleteBackfillButton.addEventListener("click",deleteBackfill);
  els.closeBackfillSheet.addEventListener("click",()=>closeSheets());
  els.limitTile.addEventListener("click",()=>openSheet(els.limitSheet));
  els.limitMinus.addEventListener("click",()=>{settings.limit=clamp(settings.limit-1,1,99);settings.limitChangedAt=Date.now();settings.limitSuggestionSnoozedUntil=0;saveSettings();render()});
  els.limitPlus.addEventListener("click",()=>{settings.limit=clamp(settings.limit+1,1,99);settings.limitChangedAt=Date.now();settings.limitSuggestionSnoozedUntil=0;saveSettings();render()});
  els.smartLimitLater.addEventListener("click",()=>{settings.limitSuggestionSnoozedUntil=snoozeUntil(7);saveSettings();render()});
  els.smartLimitApply.addEventListener("click",()=>{const suggestion=smartLimitSuggestion();if(!suggestion)return;settings.limit=suggestion;settings.limitChangedAt=Date.now();settings.limitSuggestionSnoozedUntil=0;saveSettings();render()});
  els.closeLimitSheet.addEventListener("click",()=>closeSheets());
  els.pauseTile.addEventListener("click",()=>openSheet(els.pauseSheet));
  els.pauseMinus.addEventListener("click",()=>{settings.pauseGoal=clamp(settings.pauseGoal-5,5,240);settings.pauseGoalChangedAt=Date.now();settings.pauseSuggestionSnoozedUntil=0;saveSettings();render()});
  els.pausePlus.addEventListener("click",()=>{settings.pauseGoal=clamp(settings.pauseGoal+5,5,240);settings.pauseGoalChangedAt=Date.now();settings.pauseSuggestionSnoozedUntil=0;saveSettings();render()});
  els.smartPauseToggle.addEventListener("change",()=>{settings.smartPauseSuggestions=els.smartPauseToggle.checked;settings.smartPauseUserSet=true;saveSettings();render()});
  els.smartPauseLater.addEventListener("click",()=>{settings.pauseSuggestionSnoozedUntil=snoozeUntil(7);saveSettings();render()});
  els.smartPauseApply.addEventListener("click",()=>{const suggestion=smartPauseSuggestion();if(!suggestion)return;settings.pauseGoal=suggestion;settings.pauseGoalChangedAt=Date.now();settings.pauseSuggestionSnoozedUntil=0;saveSettings();render()});
  els.closePauseSheet.addEventListener("click",()=>closeSheets());
  els.designTile.addEventListener("click",()=>openSheet(els.designSheet));els.themeList.addEventListener("click",e=>{const b=e.target.closest("button[data-theme]");if(b)setTheme(b.dataset.theme)});els.closeDesignSheet.addEventListener("click",()=>closeSheets());
  els.summaryWeekButton.addEventListener("click",()=>{analysisSummaryMode="week";renderPeriodSummary()});
  els.summaryMonthButton.addEventListener("click",()=>{analysisSummaryMode="month";renderPeriodSummary()});
  els.weekPrev.addEventListener("click",()=>{analysisWeekOffset--;renderWeekOverview()});
  els.weekNext.addEventListener("click",()=>{if(analysisWeekOffset<0){analysisWeekOffset++;renderWeekOverview()}});
  els.monthPrev.addEventListener("click",()=>{analysisMonthOffset--;renderMonthCalendar()});
  els.monthNext.addEventListener("click",()=>{if(analysisMonthOffset<0){analysisMonthOffset++;renderMonthCalendar()}});
  els.dataTile.addEventListener("click",()=>openSheet(els.dataSheet));
  els.exportDataButton.addEventListener("click",exportData);
  els.importDataButton.addEventListener("click",()=>{els.importDataInput.value="";els.importDataInput.click()});
  els.importDataInput.addEventListener("change",()=>importData(els.importDataInput.files&&els.importDataInput.files[0]));
  els.resetDataButton.addEventListener("click",()=>{if(confirm("Wirklich alle gespeicherten Zigaretten löschen?")){entries=[];manualDailyCounts={};saveEntries();saveManualCounts();closeSheets();render();setTimeout(()=>showToast("Alle Einträge gelöscht",false),240)}});
  els.closeDataSheet.addEventListener("click",()=>closeSheets());els.aboutTile.addEventListener("click",()=>openSheet(els.aboutSheet));els.closeAboutSheet.addEventListener("click",()=>closeSheets());els.closeTodaySheet.addEventListener("click",()=>closeSheets());
  els.modalBackdrop.addEventListener("click",()=>closeSheets());els.saveEditButton.addEventListener("click",saveEdit);els.deleteEntryButton.addEventListener("click",deleteEdit);
  document.addEventListener("touchstart",handleTouchStart,{passive:true});
  document.addEventListener("touchend",handleTouchEnd,{passive:true});
  setInterval(()=>{const t=todaysEntries(),n=t[t.length-1];if(n)els.lastRelative.textContent=relativeTime(new Date(n.time));renderPauseStatus();if(els.pauseConfirmSheet.getAttribute("aria-hidden")==="false"){if(!renderPauseConfirm())closeSheets()}renderAnalysis()},30000);window.addEventListener("focus",render);document.addEventListener("visibilitychange",()=>{if(!document.hidden)render()});
  applyTheme();render();showView(els.homeView);setupSwipeNavigation();if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./service-worker.js").catch(()=>{}));
})();
