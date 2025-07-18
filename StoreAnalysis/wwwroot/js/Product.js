let table;

$(document).ready(function () {

    loadDropdowns();
    loadProductTable();
    $('#addProductForm').submit(function (e) {
        e.preventDefault();
        const data = {
            ProductName: $('[name="ProductName"]').val(),
            MRP: parseFloat($('[name="MRP"]').val()),
            Quantity: 0, // Default quantity to 0 for new products
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
                    showToastMessage("Product added successfully!", true);
                    loadProductTable();
                } else {
                    showToastMessage(res.message, false);
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
                    <td>${p.categoryName}</td>
                    <td>${p.brandName}</td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="saveEdit(${p.id})">Save</button>
                        <button class="btn btn-sm btn-danger delete-btn" data-id="${p.id}" data-name="${p.productName}">Delete</button>
                    </td>
                </tr>`);
            });
        },
        error: function (xhr, status, error) {
            console.error("Error fetching products:", error);
            showToastMessage("Error fetching products:" + error, false);
        }
    });
}

function saveEdit(id) {
    const updated = {
        Id: id,
        ProductName: $(`[data-id="${id}"][data-field="ProductName"]`).text(),
        MRP: parseFloat($(`[data-id="${id}"][data-field="MRP"]`).text()),       
    };

    $.ajax({
        url: '/Product/UpdateProductInline',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(updated),
        success: function (res) {
            if (res.success) {
                showToastMessage("Product updated successfully!", true);
                loadProductTable();
            } else {
                showToastMessage(res.message, false);
            }
        }
    });
}
let deleteId = null;
let rowToDelete = null;

$(document).on('click', '.delete-btn', function () {
    deleteId = $(this).data('id');
    const name = $(this).data('name');
    rowToDelete = $(this).closest('tr');

    $('#deleteItemName').text(name);
    $('#confirmDeleteModal').modal('show');
});

$('#confirmDeleteBtn').click(function () {
    $.ajax({
        url: `/Product/Delete/${deleteId}`, // Adjust controller path if needed
        type: 'POST',
        success: function (response) {
            if (response.success) {
                $('#confirmDeleteModal').modal('hide');
                showToastMessage("Product deleted successfully!", true);
                rowToDelete.remove();
            } else {
                showToastMessage("Error: " + response.message || "Unable to delete.", false);
            }
        },
        error: function () {
            showToastMessage("Failed to delete item.", false);
        }
    });
});
function showToastMessage(message, isSuccess) {
    const toastElement = $('#liveToast');

    // Remove previous color classes
    toastElement.removeClass('bg-success bg-danger');

    // Add new background class based on success/failure
    if (isSuccess) {
        toastElement.addClass('bg-success');
    } else {
        toastElement.addClass('bg-danger');
    }

    // Set the message
    $('#toastBody').text(message);

    // Show the toast
    const toast = new bootstrap.Toast(toastElement[0]);
    toast.show();
}
$(document).on('click', '.qty-up', function () {
    const id = $(this).data('id');
    const qtySpan = $(`.editable-qty[data-id="${id}"]`);
    let value = parseInt(qtySpan.text()) || 0;
    qtySpan.text(value + 1);

    // Optional: auto-save
    // updateQuantity(id, value + 1);
});

$(document).on('click', '.qty-down', function () {
    const id = $(this).data('id');
    const qtySpan = $(`.editable-qty[data-id="${id}"]`);
    let value = parseInt(qtySpan.text()) || 0;
    if (value > 0) {
        qtySpan.text(value - 1);
        // Optional: auto-save
        // updateQuantity(id, value - 1);
    }
});
$('#productSearch').on('keyup', function () {
    const value = $(this).val().toLowerCase();
    $("#productBody tr").filter(function () {
        const productName = $(this).find("td:first").text().toLowerCase();
        $(this).toggle(productName.indexOf(value) > -1);
    });
});