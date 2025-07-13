$(document).ready(function () {
    //const userName = sessionStorage.getItem("UserName");
    //const img = sessionStorage.getItem("UserImage");
    //if (userName) {
    //    $('#headerUserName').text(userName);
    //}
    //if (img) {
    //    $('#headerUserImage').attr('src', `data:image/png;base64,${img}`);
    //}
    loadKpis();
    loadCharts();
});

function loadKpis() {
    $.get('/Dashboard/GetKpiData', function (data) {
        $('#totalSales').text(data.totalSales);
        $('#totalProfit').text(data.totalProfit);
        $('#quantitySold').text(data.totalQuantitySold);
        $('#inventoryAdded').text(data.newInventoryAdded);
    });
}

// Function to load and render Chart.js charts
function loadCharts() {
    $.get('/Dashboard/GetSalesChartData', function (chartData) {
        new Chart(document.getElementById('salesChart'), {
            type: 'bar',
            data: {
                labels: chartData.salesLabels,
                datasets: [{
                    label: 'Daily Sales (₹)',
                    data: chartData.salesData,
                    backgroundColor: '#0d6efd'
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } }
            }
        });

        new Chart(document.getElementById('inventoryChart'), {
            type: 'pie',
            data: {
                labels: ['Sold', 'New Inventory'],
                datasets: [{
                    data: [chartData.totalQuantitySold, chartData.newInventoryAdded],
                    backgroundColor: ['#20c997', '#ffc107']
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { position: 'bottom' } }
            }
        });
    });
}
