$(document).ready(function () {
    loadProducts();

    $('#btnAddStock').click(function () {
        updateStock('/Inventory/AddStock');
    });

    $('#btnSell').click(function () {
        updateStock('/Inventory/SellProduct');
    });
});

function loadProducts() {
    $.get('/Inventory/GetProducts', function (products) {
        const dropdown = $('#productSelect').empty();
        const table = $('#productTableBody').empty();
        products.forEach(p => {
            dropdown.append(`<option value="${p.id}">${p.productName}</option>`);
            table.append(`<tr><td>${p.productName}</td><td>${p.quantity}</td></tr>`);
        });
    });
}

function updateStock(url) {
    const data = {
        ProductId: parseInt($('#productSelect').val()),
        Quantity: parseInt($('#quantity').val())
    };

    $.ajax({
        url: url,
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: function (res) {
            if (res.success) {
                alert("Operation successful");
                $('#quantity').val('');
                loadProducts();
            } else {
                alert(res.message);
            }
        }
    });
}