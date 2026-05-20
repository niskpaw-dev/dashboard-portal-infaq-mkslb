# Dashboard Infaq (Modular)

A static dashboard built with modular HTML, CSS, and JavaScript.

Files:

- `index.html` — production entry point for Vercel and browser hosting
- `styles.css` — extracted responsive styles with dark/light theme support
- `app.js` — extracted JavaScript for chart rendering, filters, CSV export, and print

Features:

- responsive mobile-first dashboard layout
- trend line and doughnut charts using Chart.js
- filter by fund/category
- dark / light theme toggle
- export visible transactions to CSV
- print-friendly report view

To run:

1. Open `index.html` in a browser, or
2. Serve the folder with any static server

Notes:

- Chart.js is loaded via CDN in `index.html`.
- `app.js` initializes charts once and updates chart data dynamically.
- The theme preference is saved in `localStorage`.
- `dashboard.html` has been removed as a legacy file.
