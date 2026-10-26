# My Bike Fuel Tracker — PWA

An installable, offline-first Progressive Web App (PWA). No Android Studio or Play Store listing required.

## Fastest way to use on Android
1. Host these files on an HTTPS static host. Easy options include GitHub Pages or Netlify.
2. Open the published HTTPS URL in Chrome on Android.
3. Open Chrome's menu and choose **Install app** or **Add to Home screen**.
4. Launch it from the home screen. After its first successful load, the app shell is cached for offline use.

## GitHub Pages quick setup
1. Sign in to GitHub and create a new repository, e.g. `my-bike-fuel-tracker`.
2. Upload all files from this folder to the repository root.
3. Open **Settings → Pages** and publish from the `main` branch, root folder.
4. Wait for the published HTTPS URL, open it in Android Chrome, and install it.

## Features
- Manual date, odometer, litres, price per litre, full-tank checkbox and note.
- Distance and km/l between consecutive full-tank entries.
- Fuel cost per record and total fuel spend.
- Mileage history and chart.
- CSV export and JSON backup/restore.
- Offline app shell and local browser storage; no account or server database.

## Important
- Mileage calculation uses the litres added at each full refill and the distance since the previous full refill. For accurate full-to-full mileage, fill to the same level and record top-ups consistently.
- Records are saved in the browser on that device. Export JSON before clearing browser data or switching phones.
- Service worker/offline caching requires HTTPS or localhost. Opening `index.html` directly as a file won't enable PWA installation or offline caching.
