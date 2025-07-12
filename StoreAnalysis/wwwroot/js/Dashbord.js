$(document).ready(function () {
    const userName = sessionStorage.getItem("UserName");
    const img = sessionStorage.getItem("UserImage");
    if (userName) {
        $('#headerUserName').text(userName);
    }
    if (img) {
        $('#headerUserImage').attr('src', `data:image/png;base64,${img}`);
    }
    loadKPI();
    loadSalesChart();
});

function loadKPI() {
    $.ajax({
        url: '/Dashboard/GetKPIData',
        method: 'GET',
        success: function (data) {
            $('#totalSales').text(data.totalSales.toFixed(2));
            $('#totalOrders').text(data.totalOrders);
            $('#topStore').text(data.topStore);
            $('#avgOrderValue').text(data.avgOrderValue.toFixed(2));
        },
        error: function () {
            alert('Failed to load KPI data.');
        }
    });
}

function loadSalesChart() {
    $.ajax({
        url: '/Dashboard/GetSalesChartData',
        method: 'GET',
        success: function (data) {
            const labels = data.map(x => x.date);
            const values = data.map(x => x.total);

            new Chart($('#salesChart'), {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Sales Over Time',
                        data: values,
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 2,
                        fill: false
                    }]
                }
            });
        },
        error: function () {
            alert('Failed to load chart data.');
        }
    });
}