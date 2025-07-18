let deleteSupplierId = null;
let supplierRowToDelete = null;

$(document).ready(function () {
    loadSupplierTable();

    $('#addSupplierForm').submit(function (e) {
        e.preventDefault();

        const data = {
            SupplierId: parseInt($('[name="SupplierId"]').val()) || 0,
            SupplierName: $('[name="SupplierName"]').val(),
            ContactPerson: $('[name="ContactPerson"]').val(),
            PhoneNumber: $('[name="PhoneNumber"]').val(),
            Email: $('[name="Email"]').val(),
            Address: $('[name="Address"]').val(),
            IsActive: $('[name="IsActive"]').is(':checked')
        };

        $.ajax({
            url: '/Supplier/Save',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function (res) {
                if (res.success) {
                    const modalEl = document.getElementById('addSupplierModal');
                    const modalInstance = bootstrap.Modal.getInstance(modalEl);
                    if (modalInstance) {
                        modalInstance.hide();
                        setTimeout(() => {
                            $('.modal-backdrop').remove();
                            $('body').removeClass('modal-open');
                        }, 300);
                    }

                    $('#addSupplierForm')[0].reset();
                    showToastMessage("Supplier saved successfully!", true);
                    loadSupplierTable();
                } else {
                    showToastMessage(res.message || "Failed to save supplier.", false);
                }
            }
        });
    });

    $('#supplierSearch').on('keyup', function () {
        const value = $(this).val().toLowerCase();
        $("#supplierBody tr").filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
        });
    });

    $('#confirmDeleteSupplierBtn').click(function () {
        $.ajax({
            url: `/Supplier/Delete/${deleteSupplierId}`,
            type: 'DELETE',
            success: function (response) {
                if (response.success) {
                    $('#confirmDeleteModal').modal('hide');
                    showToastMessage("Supplier deleted successfully!", true);
                    supplierRowToDelete.remove();
                } else {
                    showToastMessage("Error: " + response.message || "Unable to delete.", false);
                }
            },
            error: function () {
                showToastMessage("Failed to delete supplier.", false);
            }
        });
    });
});
function loadSupplierTable() {
    $.ajax({
        url: '/Supplier/GetAll',
        method: 'GET',
        dataType: 'json',
        success: function (suppliers) {
            const tbody = $('#supplierBody');
            tbody.empty();

            suppliers.forEach(s => {
                tbody.append(`
                    <tr data-id="${s.supplierId}" class="readonly-row">
                        <td class="supplierName">${s.supplierName}</td>
                        <td class="phoneNumber">${s.phoneNumber}</td>
                        <td class="email">${s.email}</td>
                        <td class="status-cell">
                            <span class="badge ${s.status === 'Active' ? 'bg-success' : 'bg-secondary'}">${s.status}</span>
                        </td>
                        <td>
                            <button class="btn btn-sm btn-warning edit-btn"><i class="fa fa-edit"></i></button>
                            <button class="btn btn-sm btn-danger delete-supplier-btn" data-id="${s.supplierId}" data-name="${s.supplierName}"><i class="fa fa-trash"></i></button>
                            <button class="btn btn-sm btn-success save-btn d-none"><i class="fa fa-check"></i></button>
                            <button class="btn btn-sm btn-secondary cancel-btn d-none"><i class="fa fa-times"></i></button>
                        </td>
                    </tr>
                `);
            });

            bindSupplierTableEvents(); // Attach events after load
        }
    });
}

//function saveSupplierEdit(id) {
//    const updated = {
//        SupplierId: id,
//        SupplierName: $(`[data-id="${id}"][data-field="SupplierName"]`).text(),
//        PhoneNumber: $(`[data-id="${id}"][data-field="PhoneNumber"]`).text(),
//        Email: $(`[data-id="${id}"][data-field="Email"]`).text()
//    };

//    $.ajax({
//        url: '/Supplier/Save',
//        method: 'POST',
//        contentType: 'application/json',
//        data: JSON.stringify(updated),
//        success: function (res) {
//            if (res.success) {
//                showToastMessage("Supplier updated successfully!", true);
//                loadSupplierTable();
//            } else {
//                showToastMessage(res.message, false);
//            }
//        },
//        error: function () {
//            showToastMessage("Error updating supplier.", false);
//        }
//    });
//}

function showToastMessage(message, isSuccess) {
    const toastElement = $('#liveToast');

    if (toastElement.length === 0) {
        console.warn("Toast element not found in DOM.");
        return;
    }

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

    // Show the toast if element exists
    const toast = new bootstrap.Toast(toastElement[0]);
    toast.show();
}

function bindSupplierTableEvents() {
    $('.edit-btn').off('click').on('click', function () {
        const row = $(this).closest('tr');

        // Reset other rows
        $('#supplierBody tr').removeClass('editing-row').addClass('readonly-row');
        $('#supplierBody tr').find('.save-btn, .cancel-btn').addClass('d-none');
        $('#supplierBody tr').find('.edit-btn, .delete-supplier-btn').removeClass('d-none');
        $('#supplierBody tr').removeClass('editing-row');

        // Set current row to editing mode
        row.removeClass('readonly-row').addClass('editing-row');
        row.find('.edit-btn, .delete-supplier-btn').addClass('d-none');
        row.find('.save-btn, .cancel-btn').removeClass('d-none');

        // Replace cells with inputs
        row.find('td.supplierName').html(`<input type="text" class="form-control form-control-sm inline-input" value="${row.find('td.supplierName').text()}">`);
        row.find('td.phoneNumber').html(`<input type="text" class="form-control form-control-sm inline-input" value="${row.find('td.phoneNumber').text()}">`);
        row.find('td.email').html(`<input type="email" class="form-control form-control-sm inline-input" value="${row.find('td.email').text()}">`);

        const currentStatus = row.find('td.status-cell span').text().trim();
        row.find('td.status-cell').html(`
            <select class="form-select form-select-sm inline-status">
                <option value="Active" ${currentStatus === "Active" ? "selected" : ""}>Active</option>
                <option value="Inactive" ${currentStatus === "Inactive" ? "selected" : ""}>Inactive</option>
            </select>
        `);
    });

    $('.save-btn').off('click').on('click', function () {
        const row = $(this).closest('tr');
        const id = row.data('id');

        const updated = {
            SupplierId: id,
            SupplierName: row.find('td.supplierName input').val(),
            PhoneNumber: row.find('td.phoneNumber input').val(),
            Email: row.find('td.email input').val(),
            IsActive: row.find('td.status-cell select').val() === "Active"
        };

        $.ajax({
            url: '/Supplier/Save',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(updated),
            success: function (res) {
                if (res.success) {
                    showToastMessage("Supplier updated successfully!", true);
                    loadSupplierTable();
                } else {
                    showToastMessage(res.message || "Update failed.", false);
                }
            },
            error: function () {
                showToastMessage("Error updating supplier.", false);
            }
        });
    });

    $('.cancel-btn').off('click').on('click', function () {
        loadSupplierTable();
    });

    $('.delete-supplier-btn').off('click').on('click', function () {
        deleteSupplierId = $(this).data('id');
        const name = $(this).data('name');
        supplierRowToDelete = $(this).closest('tr');

        $('#deleteSupplierName').text(name);
        $('#confirmDeleteModal').modal('show');
    });
}


