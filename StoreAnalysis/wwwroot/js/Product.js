let table;

$(document).ready(function () {
    loadDropdowns();
    loadProductTable();

    $('#addProductForm').submit(function (e) {
        e.preventDefault();
        const data = {
            ProductName: $('[name="ProductName"]').val(),
            Quantity: parseInt($('[name="Quantity"]').val()),
            MRP: parseFloat($('[name="MRP"]').val()),
            CategoryId: parseInt($('[name="CategoryId"]').val()),
            BrandId: parseInt($('[name="BrandId"]').val())
        };

        $.ajax({
            url: '/Product/AddProduct',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function (res) {
                if (res.success) {
                    const modalEl = document.getElementById('addProductModal');
                    const modalInstance = bootstrap.Modal.getInstance(modalEl);
                    if (modalInstance) {
                        modalInstance.hide();
                        setTimeout(() => {
                            $('.modal-backdrop').remove();
                            $('body').removeClass('modal-open');
                        }, 300);
                    } 
                    $('#addProductForm')[0].reset();
                    loadProductTable();
                } else {
                    alert(res.message);
                }
            }
        });
    });
});

function loadDropdowns() {
    $.get('/Product/GetDropdownData', function (data) {
        $('[name="CategoryId"]').html(data.categories.map(c => `<option value="${c.value}">${c.text}</option>`));
        $('[name="BrandId"]').html(data.brands.map(b => `<option value="${b.value}">${b.text}</option>`));
    });
}

//function loadProductTable() {
//    table = $('#productTable').DataTable({
//        ajax: '/Product/GetAllProducts',
//        columns: [
//            {
//                data: 'productName',
//                render: (data, type, row) => `<span contenteditable="true" data-id="${row.id}" data-field="ProductName">${data}</span>`
//            },
//            {
//                data: 'mrp',
//                render: (data, type, row) => `<span contenteditable="true" data-id="${row.id}" data-field="MRP">${data}</span>`
//            },
//            {
//                data: 'quantity',
//                render: (data, type, row) => `<span contenteditable="true" data-id="${row.id}" data-field="Quantity">${data}</span>`
//            },
//            { data: 'categoryName' },
//            { data: 'brandName' },
//            {
//                data: null,
//                render: row => `<button class="btn btn-sm btn-primary" onclick="saveEdit(${row.id})">Save</button>`
//            }
//        ]
//    });
//}
function loadProductTable() {
    $.ajax({
        url: '/Product/GetAllProducts',
        method: 'GET',
        dataType: 'json',
        success: function (products) {
            console.log("Products received:", products);
            const tbody = $('#productBody');
            tbody.empty();

            products.forEach(p => {
                tbody.append(`<tr>
                    <td contenteditable="true" data-id="${p.id}" data-field="ProductName">${p.productName}</td>
                    <td contenteditable="true" data-id="${p.id}" data-field="MRP">${p.mrp}</td>
                    <td contenteditable="true" data-id="${p.id}" data-field="Quantity">${p.quantity}</td>
                    <td>${p.categoryName}</td>
                    <td>${p.brandName}</td>
                    <td><button class="btn btn-sm btn-primary" onclick="saveEdit(${p.id})">Save</button></td>
                </tr>`);
            });
        },
        error: function (xhr, status, error) {
            console.error("Error fetching products:", error);
        }
    });
}

function saveEdit(id) {
    const updated = {
        Id: id,
        ProductName: $(`[data-id="${id}"][data-field="ProductName"]`).text(),
        MRP: parseFloat($(`[data-id="${id}"][data-field="MRP"]`).text()),
        Quantity: parseInt($(`[data-id="${id}"][data-field="Quantity"]`).text())
    };

    $.ajax({
        url: '/Product/UpdateProductInline',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(updated),
        success: function (res) {
            if (res.success) {
                alert('Updated!');
                table.ajax.reload();
            } else {
                alert(res.message);
            }
        }
    });
}