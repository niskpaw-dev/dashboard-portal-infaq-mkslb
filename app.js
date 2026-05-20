document.addEventListener('DOMContentLoaded', () => {
    Chart.defaults.color = '#8b95a5';
    Chart.defaults.borderColor = '#222a3f';
    Chart.defaults.font.family = "'Plus Jakarta Sans', sans-serif";

    // --- DATA SUMBER (Status SUCCESS sahaja, data anonim secara visual) ---
    const rawData = [
        { timestamp: "2026-05-06 07:34:54", amaun: 10, tabung: "pembangunan" },
        { timestamp: "2026-05-08 06:09:11", amaun: 5, tabung: "jumaat" },
        { timestamp: "2026-05-08 06:13:44", amaun: 5, tabung: "jumaat" },
        { timestamp: "2026-05-08 06:43:36", amaun: 30, tabung: "anak_yatim" },
        { timestamp: "2026-05-08 06:48:17", amaun: 10, tabung: "anak_yatim" },
        { timestamp: "2026-05-08 06:54:22", amaun: 50, tabung: "jumaat" },
        { timestamp: "2026-05-08 07:15:37", amaun: 33.33, tabung: "pembangunan" },
        { timestamp: "2026-05-08 12:43:06", amaun: 10, tabung: "jumaat" },
        { timestamp: "2026-05-08 13:18:37", amaun: 20, tabung: "jumaat" },
        { timestamp: "2026-05-11 23:55:15", amaun: 10, tabung: "pembangunan" },
        { timestamp: "2026-05-12 05:48:16", amaun: 10, tabung: "kebajikan" },
        { timestamp: "2026-05-15 07:51:00", amaun: 30, tabung: "jumaat" },
        { timestamp: "2026-05-15 11:07:37", amaun: 100, tabung: "pembangunan" },
        { timestamp: "2026-05-15 12:46:21", amaun: 10, tabung: "jumaat" },
        { timestamp: "2026-05-19 12:02:52", amaun: 1, tabung: "pembangunan" },
        { timestamp: "2026-05-19 12:50:42", amaun: 1, tabung: "pembangunan" },
        { timestamp: "2026-05-19 13:11:28", amaun: 1, tabung: "pembangunan" },
        { timestamp: "2026-05-19 13:30:56", amaun: 1, tabung: "pembangunan" }
    ];

    const formatCurrency = (val) => {
        const num = Number(val) || 0;
        return num.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };
    const formatLabel = (key) => ({ 'anak_yatim': 'Anak Yatim', 'jumaat': 'Jumaat', 'kebajikan': 'Kebajikan', 'pembangunan': 'Pembangunan', 'all': 'Semua Tabung' }[key] || key);
    const fundColors = { 'jumaat': '#8b5cf6', 'pembangunan': '#f43f5e', 'anak_yatim': '#14b8a6', 'kebajikan': '#f59e0b' };
    const monthsMs = ['Jan','Feb','Mac','Apr','Mei','Jun','Jul','Ogo','Sep','Okt','Nov','Dis'];

    let trendChart, pieChart;
    let currentFilter = 'all';
    const trendCtx = document.getElementById('trendChart').getContext('2d');
    const pieCtx = document.getElementById('pieChart').getContext('2d');
    const themeToggle = document.getElementById('theme-toggle');
    const exportCsvBtn = document.getElementById('export-csv');
    const printBtn = document.getElementById('print-report');
    const themeKey = 'dashboard-theme';
    const defaultTheme = localStorage.getItem(themeKey) || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');

    function hexToRgba(hex, alpha = 1) {
        if (!hex) return `rgba(136,136,136,${alpha})`;
        const h = hex.replace('#','');
        const bigint = parseInt(h.length === 3 ? h.split('').map(c => c+c).join('') : h, 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    function createCharts() {
        trendChart = new Chart(trendCtx, {
            type: 'line',
            data: { labels: [], datasets: [{ data: [], borderColor: '#14b8a6', backgroundColor: 'rgba(20,184,166,0.25)', borderWidth: 2, fill: true, tension: 0.3, pointRadius: 3, pointBackgroundColor: '#14b8a6', pointBorderWidth: 0 }] },
            options: {
                responsive: true, maintainAspectRatio: false,
                animation: false,
                plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false, backgroundColor: '#111622', titleColor: '#fff', bodyColor: '#14b8a6' } },
                scales: {
                    x: { grid: { display: false }, ticks: { font: {size: 10} } },
                    y: { border: {display: false}, grid: { color: '#222a3f' }, ticks: { maxTicksLimit: 5, font: {size: 10} } }
                }
            }
        });

        pieChart = new Chart(pieCtx, {
            type: 'doughnut',
            data: { labels: [], datasets: [{ data: [], backgroundColor: [], borderWidth: 0, hoverOffset: 4 }] },
            options: {
                responsive: true, maintainAspectRatio: false, cutout: '70%',
                animation: false,
                plugins: { legend: { display: false }, tooltip: { backgroundColor: '#111622', callbacks: { label: ctx => ` RM ${formatCurrency(ctx.raw)}` } } }
            }
        });
    }

    function setThemeIcon(theme) {
        if (!themeToggle) return;
        themeToggle.innerHTML = `<i class="fas fa-${theme === 'light' ? 'sun' : 'moon'}"></i>`;
    }

    function applyTheme(theme) {
        document.body.classList.toggle('theme-light', theme === 'light');
        document.body.classList.toggle('theme-dark', theme !== 'light');
        localStorage.setItem(themeKey, theme);
        setThemeIcon(theme);
    }

    function toggleTheme() {
        applyTheme(document.body.classList.contains('theme-light') ? 'dark' : 'light');
    }

    function getExportRows() {
        const rows = currentFilter === 'all' ? rawData : rawData.filter(r => r.tabung === currentFilter);
        return rows.map(r => ({ timestamp: r.timestamp, tabung: formatLabel(r.tabung), amaun: formatCurrency(r.amaun) }));
    }

    function exportCsv() {
        const rows = getExportRows();
        const header = ['Tarikh Masa', 'Kategori Tabung', 'Amaun (RM)'];
        const lines = [header.join(',')].concat(rows.map(r => `${r.timestamp},"${r.tabung}",${r.amaun}`));
        const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const safeFilter = currentFilter === 'all' ? 'semua' : currentFilter;
        const dateStr = new Date().toISOString().slice(0,10);
        link.download = `infaq-${safeFilter}-${dateStr}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    function printReport() {
        window.print();
    }

    function updateDashboard() {
        // Tapis
        let filteredData = currentFilter === 'all' ? rawData : rawData.filter(r => r.tabung === currentFilter);

        // Pengiraan Asas
        let total = 0, max = 0;
        let dailyMap = {};
        filteredData.forEach(r => {
            total += Number(r.amaun) || 0;
            if ((Number(r.amaun) || 0) > max) max = Number(r.amaun) || 0;
            let [datePart] = r.timestamp.split(' ');
            let parts = datePart.split('-'); // YYYY-MM-DD
            let key = `${parts[2]}-${parts[1]}`; // DD-MM
            dailyMap[key] = (dailyMap[key] || 0) + (Number(r.amaun) || 0);
        });

        let count = filteredData.length;
        let avg = count ? (total / count) : 0;
        let grandTotal = rawData.reduce((s, r) => s + (Number(r.amaun) || 0), 0);

        // Update Teks
        document.getElementById('grand-total-display').innerText = `RM ${formatCurrency(grandTotal)}`;
        document.getElementById('kpi-total').innerText = `RM ${formatCurrency(total)}`;
        document.getElementById('kpi-avg').innerText = `RM ${formatCurrency(avg)}`;
        document.getElementById('kpi-count').innerText = count;
        document.getElementById('kpi-max').innerText = `RM ${formatCurrency(max)}`;
        
        document.getElementById('trend-label').innerText = currentFilter === 'all' ? formatLabel('all') : `(${formatLabel(currentFilter)})`;
        document.getElementById('table-count').innerText = `${count} transaksi`;

        // Update Jadual
        const tbody = document.getElementById('table-body');
        tbody.innerHTML = '';
        // Terbalikkan jadual supaya tarikh terkini di atas
        [...filteredData].reverse().forEach(r => {
            let [datePart, timePart] = r.timestamp.split(' ');
            let parts = datePart.split('-');
            let day = Number(parts[2]);
            let month = monthsMs[Number(parts[1]) - 1] || 'Mei';
            let dString = `${day} ${month}, <span style="color:#8b95a5">${timePart.slice(0,5)}</span>`;
            
            tbody.innerHTML += `
                <tr>
                    <td style="font-size:0.85rem; font-weight:500;">${dString}</td>
                    <td><span class="tag-tabung">${formatLabel(r.tabung)}</span></td>
                    <td class="val-amaun" style="text-align: right; color: ${fundColors[r.tabung] || '#fff'}">RM ${formatCurrency(r.amaun)}</td>
                </tr>
            `;
        });
        if(count === 0) tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; padding: 20px;">Tiada Data</td></tr>`;

        // Proses Global Fund Map untuk ranking & pie
        let globalFundMap = {};
        rawData.forEach(r => globalFundMap[r.tabung] = (globalFundMap[r.tabung] || 0) + (Number(r.amaun) || 0));
        
        // Update Ranking
        const listContainer = document.getElementById('mini-fund-list');
        listContainer.innerHTML = '';
        Object.entries(globalFundMap).sort((a,b) => b[1] - a[1]).forEach(([k, v]) => {
            let isActive = (currentFilter === 'all' || currentFilter === k);
            let base = fundColors[k] || '#888888';
            listContainer.innerHTML += `
                <div class="mini-item ${currentFilter === k ? 'active' : ''}" data-fund="${k}" style="opacity: ${isActive ? 1 : 0.4}">
                    <div class="mini-item-name"><div class="dot" style="background:${base}"></div> ${formatLabel(k)}</div>
                    <div style="font-weight:700; color:var(--text-main); font-size:0.75rem;">RM ${formatCurrency(v)}</div>
                </div>
            `;
        });

        // Attach click handlers to mini items to change filter
        listContainer.querySelectorAll('.mini-item').forEach(el => {
            el.addEventListener('click', () => {
                const f = el.getAttribute('data-fund');
                currentFilter = f || 'all';
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                const btn = document.querySelector(`.filter-btn[data-fund="${currentFilter}"]`);
                if(btn) btn.classList.add('active');
                updateDashboard();
            });
        });

        updateTrendChart(dailyMap, filteredData);
        updatePieChart(globalFundMap);
    }

    function updateTrendChart(dailyMap, filteredData) {
        let source = (filteredData && filteredData.length) ? filteredData : rawData;
        let allDays = [...new Set(source.map(r => {
            const [datePart] = r.timestamp.split(' ');
            const [y,m,d] = datePart.split('-');
            return `${d}-${m}`;
        }))];

        allDays.sort((a,b) => {
            const [da,ma] = a.split('-').map(Number);
            const [db,mb] = b.split('-').map(Number);
            if (ma === mb) return da - db;
            return ma - mb;
        });

        const labels = allDays.map(key => {
            const [d,m] = key.split('-').map(Number);
            const month = monthsMs[m - 1] || 'Mei';
            return `${d} ${month}`;
        });
        const data = allDays.map(d => dailyMap[d] || 0);
        const cLine = currentFilter === 'all' ? '#14b8a6' : (fundColors[currentFilter] || '#14b8a6');

        const grad = trendCtx.createLinearGradient(0, 0, 0, 200);
        grad.addColorStop(0, hexToRgba(cLine, 0.25));
        grad.addColorStop(1, hexToRgba(cLine, 0));

        if (trendChart) {
            trendChart.data.labels = labels;
            trendChart.data.datasets[0].data = data;
            trendChart.data.datasets[0].borderColor = cLine;
            trendChart.data.datasets[0].backgroundColor = grad;
            trendChart.data.datasets[0].pointBackgroundColor = cLine;
            trendChart.options.plugins.tooltip.bodyColor = cLine;
            trendChart.update({ duration: 0 });
        }
    }

    function updatePieChart(fundMap) {
        const keys = Object.keys(fundMap);
        const labels = keys.map(formatLabel);
        const data = Object.values(fundMap);
        const colors = keys.map(k => {
            const base = fundColors[k] || '#888888';
            return (currentFilter === 'all' || currentFilter === k) ? base : hexToRgba(base, 0.2);
        });

        if (pieChart) {
            pieChart.data.labels = labels;
            pieChart.data.datasets[0].data = data;
            pieChart.data.datasets[0].backgroundColor = colors;
            pieChart.update({ duration: 0 });
        }
    }

    // Events Filter
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            currentFilter = e.currentTarget.getAttribute('data-fund') || 'all';
            updateDashboard();
        });
    });

    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
    if (exportCsvBtn) exportCsvBtn.addEventListener('click', exportCsv);
    if (printBtn) printBtn.addEventListener('click', printReport);

    // Run
    createCharts();
    applyTheme(defaultTheme);
    updateDashboard();

    // Mobile menu toggle for sidebar
    const menuBtn = document.getElementById('menu-btn');
    const sidebar = document.querySelector('.sidebar');
    if (menuBtn && sidebar) {
        menuBtn.addEventListener('click', () => {
            const opened = sidebar.classList.toggle('open');
            if (opened) overlay.classList.add('active');
            else overlay.classList.remove('active');
        });
    }

    // overlay click closes sidebar
    const overlay = document.getElementById('overlay');
    if (overlay) {
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
        });
    }

    // ESC to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
            if (overlay) overlay.classList.remove('active');
        }
    });

    // on resize to desktop, ensure overlay hidden and sidebar reset
    window.addEventListener('resize', () => {
        if (window.innerWidth >= 1024) {
            sidebar.classList.remove('open');
            if (overlay) overlay.classList.remove('active');
        }
    });
});