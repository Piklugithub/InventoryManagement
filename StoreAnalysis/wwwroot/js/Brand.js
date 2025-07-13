let selectedCategoryId = null;

//$('#categoryDropdown').change(function () {
//    selectedCategoryId = $(this).val();
//    loadBrands(selectedCategoryId);
//});
function CatagoryChange() {
    selectedCategoryId = $('#categoryDropdown').val();
    loadBrands(selectedCategoryId);
} 

function loadBrands(categoryId) {
    $.get('/Brand/GetBrandsByCategory', { categoryId }, function (data) {
        let html = '';
        data.forEach(function (b) {
            html += `<tr>
                            <td>${b.name}</td>
                            <td><span class="badge ${b.isActive ? 'bg-success' : 'bg-secondary'}">${b.isActive ? 'Active' : 'Inactive'}</span></td>
                            <td>
                                <button class="btn btn-sm btn-warning me-1" onclick="editBrand(${b.id}, '${b.name}', ${b.isActive})">Edit</button>
                                <button class="btn btn-sm btn-danger" onclick="deleteBrand(${b.id})">Delete</button>
                            </td>
                         </tr>`;
        });
        $('#brandTable tbody').html(html);
    });
}

$('#brandForm').submit(function (e) {
    e.preventDefault();
    var brand = {};
    if ($('#brandId').val() == "" || $('#brandId').val() == null) {
         brand = {
            Name: $('#brandName').val(),
            IsActive: $('#isActive').is(':checked'),
            CategoryId: $('#modalCategory').val() // Get from modal dropdown
        };
    }
    else {
         brand = {
            Id: $('#brandId').val(),
            Name: $('#brandName').val(),
            IsActive: $('#isActive').is(':checked'),
            CategoryId: $('#modalCategory').val() // Get from modal dropdown
        };
    }
    
    const url = brand.Id ? '/Brand/UpdateBrand' : '/Brand/AddBrand';
    $.ajax({
        url: url,
        type: 'POST',
        data: JSON.stringify(brand),
        contentType: 'application/json',
        success: function () {
            $('#brandModal').modal('hide');
            loadBrands(selectedCategoryId);
            $('#brandForm')[0].reset();
            $('#brandId').val('');
        }
    });
});

function editBrand(id, name, isActive) {
    $('#brandId').val(id);
    $('#brandName').val(name);
    $('#isActive').prop('checked', isActive);
    $('#modalCategory').val($('#categoryDropdown').val()).prop('disabled', true); // lock category
    $('#brandModal').modal('show');
}

function deleteBrand(id) {
    if (confirm('Are you sure you want to delete this brand?')) {
        $.post('/Brand/DeleteBrand', { id }, function () {
            loadBrands(selectedCategoryId);
        });
    }
}
$('#categoryForm').submit(function (e) {
    e.preventDefault();
    const name = $('#categoryName').val();

    $.ajax({
        url: '/Brand/AddCategory',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ Name: name }),
        success: function (newCategory) {
            // Add to main dropdown
            $('#categoryDropdown').append(`<option value="${newCategory.id}">${newCategory.name}</option>`);
            // Also add to modal dropdown
            $('#modalCategory').append(`<option value="${newCategory.id}">${newCategory.name}</option>`);

            $('#categoryModal').modal('hide');
            $('#categoryForm')[0].reset();
        },
        error: function (xhr) {
            alert("Error: " + xhr.responseText);
        }
    });
});