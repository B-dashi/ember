# Ember

Persönliche iPhone-PWA zum Tracken des Rauchverhaltens.

## Dateien

- `index.html` – Oberfläche
- `styles.css` – Design und vier Themes
- `app.js` – Tracking, Einstellungen, Analyse und lokale Speicherung
- `manifest.webmanifest` – PWA-Konfiguration
- `service-worker.js` – Offline-Cache und Updates
- `app-icon-iphone-180x180.png` – iPhone Home-Bildschirm
- `app-icon-pwa-192x192.png` – PWA Icon 192 px
- `app-icon-pwa-512x512.png` – PWA Icon 512 px
- `app-icon-maskable-512x512.png` – Maskable PWA Icon
- `browser-favicon-32x32.png` – Browser-Favicon
- `theme-background-blue.svg` – oberer Hintergrund für Blau
- `theme-background-terracotta.svg` – oberer Hintergrund für Terrakotta
- `theme-background-green.svg` – oberer Hintergrund für Grün
- `theme-background-violet.svg` – oberer Hintergrund für Violett

## GitHub Pages

Alle Dateien direkt in das Hauptverzeichnis des Repositorys `ember` hochladen. GitHub Pages bleibt auf `main` und `/(root)`.

Die App verwendet weiterhin die lokalen Speicher-Schlüssel `ember.v1.entries` und `ember.v1.settings`, damit vorhandene Ember-Einträge bei einem Update erhalten bleiben.
