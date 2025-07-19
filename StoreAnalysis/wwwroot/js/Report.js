
let salesTrendChart, categorySalesChart;

function fetchReport(filters = {}) {
    $.ajax({
        url: '/Report/GetReportData',
        method: 'GET',
        data: filters,
        success: function (res) {
            populateTable('#salesTable tbody', res.salesData, 'sales');
            populateTable('#inventoryTable tbody', res.inventoryData, 'inventory');
            populateTable('#topProductsTable tbody', res.bestSelling, 'top');
            drawCharts(res.salesData);
        }
    });
}

function populateTable(selector, data, type) {
    let html = '';
    data.forEach(item => {
        if (type === 'sales') {
            html += `<tr>
                    <td>${item.productName}</td>
                    <td>${item.brand}</td>
                    <td>${item.category}</td>
                    <td>${item.quantity}</td>
                    <td>${item.totalSale.toFixed(2)}</td>
                    <td>${item.profit.toFixed(2)}</td>
                    <td>${item.saleDate}</td>
                </tr>`;
        } else if (type === 'inventory') {
            html += `<tr>
                    <td>${item.productName}</td>
                    <td>${item.brand}</td>
                    <td>${item.category}</td>
                    <td>${item.quantityAdded}</td>
                    <td>${item.date}</td>
                </tr>`;
        } else if (type === 'top') {
            html += `<tr>
                    <td>${item.productName}</td>
                    <td>${item.brand}</td>
                    <td>${item.category}</td>
                    <td>${item.totalSold}</td>
                    <td>${item.totalSale.toFixed(2)}</td>
                    <td>${item.profit.toFixed(2)}</td>
                </tr>`;
        }
    });
    $(selector).html(html);
}

function drawCharts(salesData) {
    // Group sales by date
    const grouped = {};
    salesData.forEach(s => {
        const date = s.saleDate;
        if (!grouped[date]) {
            grouped[date] = { totalSale: 0, category: {} };
        }
        grouped[date].totalSale += s.totalSale;
        if (!grouped[date].category[s.category]) {
            grouped[date].category[s.category] = 0;
        }
        grouped[date].category[s.category] += s.totalSale;
    });

    const labels = Object.keys(grouped);
    const totalSales = labels.map(l => grouped[l].totalSale);

    // For category chart, sum by category
    const categoryMap = {};
    salesData.forEach(s => {
        if (!categoryMap[s.category]) {
            categoryMap[s.category] = 0;
        }
        categoryMap[s.category] += s.totalSale;
    });

    const catLabels = Object.keys(categoryMap);
    const catValues = Object.values(categoryMap);

    // Destroy previous if exists
    if (salesTrendChart) salesTrendChart.destroy();
    if (categorySalesChart) categorySalesChart.destroy();

    // Chart 1: Sales Trend
    salesTrendChart = new Chart(document.getElementById('salesTrendChart'), {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Total Sale',
                data: totalSales,
                borderColor: 'blue',
                backgroundColor: 'rgba(0,0,255,0.1)',
                fill: true
            }]
        },
        options: { responsive: true }
    });

    // Chart 2: Category-wise Sale
    categorySalesChart = new Chart(document.getElementById('categorySalesChart'), {
        type: 'bar',
        data: {
            labels: catLabels,
            datasets: [{
                label: 'Sale by Category',
                data: catValues,
                backgroundColor: 'orange'
            }]
        },
        options: { responsive: true }
    });
}

function bindDropdowns() {
    $.ajax({
        url: '/Report/GetFilterDropdowns',
        method: 'GET',
        success: function (data) {
            bindOptions('#categoryFilter', data.categories, 'categoryId', 'categoryName');
            bindOptions('#brandFilter', data.brands, 'brandId', 'brandName');
        }
    });
}

function bindOptions(selector, list, valueField, textField) {
    let options = '<option value="">All</option>';
    list.forEach(item => {
        options += `<option value="${item[valueField]}">${item[textField]}</option>`;
    });
    $(selector).html(options);
}

// Trigger filter
$('#filterBtn').on('click', function () {
    const filters = {
        fromDate: $('#fromDate').val(),
        toDate: $('#toDate').val(),
        brandId: $('#brandFilter').val(),
        categoryId: $('#categoryFilter').val()
    };
    fetchReport(filters);
});

// Quick filter buttons
$('.quickFilter').on('click', function () {
    const range = $(this).data('range');
    const today = new Date();
    let fromDate, toDate;

    if (range === 'today') {
        fromDate = toDate = today.toISOString().split('T')[0];
    } else if (range === 'week') {
        const diff = today.getDate() - today.getDay() + 1;
        fromDate = new Date(today.setDate(diff)).toISOString().split('T')[0];
        toDate = new Date().toISOString().split('T')[0];
    } else if (range === 'month') {
        fromDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        toDate = new Date().toISOString().split('T')[0];
    } else if (range === 'year') {
        fromDate = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
        toDate = new Date().toISOString().split('T')[0];
    }

    fetchReport({ fromDate, toDate });
});

// Export Excel
$('#exportExcel').on('click', function () {
    const fromDate = $('#fromDate').val();
    const toDate = $('#toDate').val();
    const brandId = $('#brandFilter').val();
    const categoryId = $('#categoryFilter').val();

    const query = $.param({ fromDate, toDate, brandId, categoryId });

    window.location.href = '/Report/ExportToExcel?' + query;
});

// Export PDF (optional)
$('#exportPdf').on('click', function () {
    const filters = {
        fromDate: $('#fromDate').val(),
        toDate: $('#toDate').val(),
        brandId: $('#brandFilter').val(),
        categoryId: $('#categoryFilter').val()
    };
    const query = $.param(filters);
    window.location.href = '/Report/ExportToPdf?' + query;
});

// On load
$(function () {
    bindDropdowns();
    fetchReport();
});