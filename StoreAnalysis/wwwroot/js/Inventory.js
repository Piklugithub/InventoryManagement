//$(document).ready(function () {
//    loadProducts();

//    $('#btnAddStock').click(function () {
//        updateStock('/Inventory/AddStock');
//    });

//    $('#btnSell').click(function () {
//        updateStock('/Inventory/SellProduct');
//    });
//});

//function loadProducts() {
//    $.get('/Inventory/GetProducts', function (products) {
//        const dropdown = $('#productSelect').empty();
//        const table = $('#productTableBody').empty();
//        products.forEach(p => {
//            dropdown.append(`<option value="${p.id}">${p.productName}</option>`);
//            table.append(`<tr><td>${p.productName}</td><td>${p.quantity}</td></tr>`);
//        });
//    });
//}

//function updateStock(url) {
//    const data = {
//        ProductId: parseInt($('#productSelect').val()),
//        Quantity: parseInt($('#quantity').val())
//    };

//    $.ajax({
//        url: url,
//        method: 'POST',
//        contentType: 'application/json',
//        data: JSON.stringify(data),
//        success: function (res) {
//            if (res.success) {
//                alert("Operation successful");
//                $('#quantity').val('');
//                loadProducts();
//            } else {
//                alert(res.message);
//            }
//        }
//    });
//}


let allProducts = [];

$(document).ready(function () {
    loadInventory();

    $('#searchBox').on('input', function () {
        const keyword = $(this).val().toLowerCase();
        const filtered = allProducts.filter(p => p.productName.toLowerCase().includes(keyword));
        renderTable(filtered);
    });

    //$('#stockForm').submit(function (e) {
    //    e.preventDefault();
    //    const action = $('#modalAction').val();
    //    const endpoint = action === 'add' ? '/Inventory/AddStock' : '/Inventory/SellProduct';

    //    const payload = {
    //        ProductId: parseInt($('#modalProductId').val()),
    //        Quantity: parseInt($('#modalQuantity').val())
    //    };

    //    $.ajax({
    //        url: endpoint,
    //        method: 'POST',
    //        contentType: 'application/json',
    //        data: JSON.stringify(payload),
    //        success: function (res) {
    //            if (res.success) {
    //                $('#stockModal').modal('hide');
    //                loadInventory();
    //            } else {
    //                alert(res.message);
    //            }
    //        }
    //    });
    //});
});

function loadInventory() {
    $.get('/Inventory/GetProducts', function (data) {
        allProducts = data;
        renderTable(allProducts);
    });
}

function renderTable(products) {
    const tbody = $('#inventoryBody').empty();
    if (products.length === 0) {
        tbody.append(`<tr><td colspan="4" class="text-center text-muted">No products found</td></tr>`);
        return;
    }

    products.forEach(p => {
        const quantityBadge = p.quantity > 0
            ? `<span class="badge bg-success">${p.quantity}</span>`
            : `<span class="badge bg-danger">Out of stock</span>`;

        tbody.append(`
                <tr>
                    <td>${p.productName}</td>
                    <td>₹${p.mrp?.toFixed(2) ?? "0.00"}</td>
                    <td>${quantityBadge}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary" onclick="openStockModal(${p.id}, '${p.productName}')">
                            Manage
                        </button>
                    </td>
                </tr>
            `);
    });
}

function openStockModal(id, name) {
    $('#modalProductId').val(id);
    $('#modalProductName').val(name);
    $('#modalQuantity').val('');
    $('#modalAction').val('add');
    $('#stockModal').modal('show');
}
function submitStockUpdate(action) {
    const productId = parseInt($('#modalProductId').val());
    const quantity = parseInt($('#modalQuantity').val());

    if (!productId || !quantity || quantity <= 0) {
        alert("Please enter valid quantity.");
        return;
    }

    const endpoint = action === 'add'
        ? '/Inventory/AddStock'
        : '/Inventory/SellProduct';

    $.ajax({
        url: endpoint,
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            ProductId: productId,
            Quantity: quantity
        }),
        success: function (res) {
            if (res.success) {
                $('#stockModal').modal('hide');
                $('.modal-backdrop').remove(); // remove backdrop manually
                loadInventory(); // reload inventory table
            } else {
                alert(res.message || "Operation failed.");
            }
        }
    });
}