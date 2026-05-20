# Dashboard Infaq (Modular)

This is a modularized version of the dashboard.

Files:

- `dashboard.html` — main HTML shell
- `styles.css` — extracted styles
- `app.js` — extracted and refactored JavaScript (runs on DOMContentLoaded)

To run: open `dashboard.html` in a browser (double-click or serve from a local static server).

Notes:

- Chart.js is loaded via CDN inside `dashboard.html`.
- `app.js` uses the global `Chart` provided by Chart.js.
- If you need to integrate with a build system or ES modules, we can refactor `app.js` further.
