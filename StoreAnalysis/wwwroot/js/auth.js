$(document).ready(function () {
    $('#showRegister').click(function () {
        $('#loginForm').removeClass('active');
        $('#registerForm').addClass('active');
    });

    $('#showLogin').click(function () {
        $('#registerForm').removeClass('active');
        $('#loginForm').addClass('active');
    });

    // Password match check
    $('#registerConfirm').on('blur', function () {
        const pass = $('#registerPassword').val().trim();
        const confirm = $('#registerConfirm').val().trim();

        if (pass !== confirm) {
            $('#confirm-error').show();
        } else {
            $('#confirm-error').hide();
        }
    });

    $('#registerPassword, #registerConfirm').on('input', function () {
        $('#confirm-error').hide();
    });

    $('#loginBtn').click(function (e) {
        e.preventDefault(); 
        const user = {
            Email: $('#loginEmail').val(),
            Password: $('#loginPassword').val()
        };
        $.ajax({
            url: '/User/LoginUser',
            method: 'POST',
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify(user),
            success: function (data) {
                //if (data.success) {
                //    $('#loginMsg').text(data.message).css("color", "green");
                //    sessionStorage.setItem("UserName", data.userName);
                //    sessionStorage.setItem("UserImage", data.profileImage);
                //    setTimeout(() => window.location = "/Dashboard/Index", 1500);
                //}
                //else {
                //    $('#loginMsg').text(data.message).css("color", "red");

                //}
                if (data.status === 'otp') {
                    var myModal = new bootstrap.Modal(document.getElementById('otpModal'));
                    myModal.show();
                } else {
                    $('#loginMsg').text(data.message).css("color", "red");
                }
            },
            error: function (xhr, status, err) {
                console.log("AJAX Error:", status, err);
                $('#loginMsg').text("Server error. Please try again.").css("color", "red");
            }
        });
    });
    $('#verifyOtpBtn').click(function () {
        let otp = $('#otpInput').val();
        let email = $('#loginEmail').val();
        $.ajax({
            url: '/User/VerifyOtp',
            type: 'POST',
            data: { otp: otp, email: email },
            success: function (res) {
                if (res.success) {
                    $('#loginMsg').text(res.message).css("color", "green");
                    sessionStorage.setItem("UserName", res.userName);
                    sessionStorage.setItem("UserImage", res.profileImage);
                     setTimeout(() => window.location = "/Dashboard/Index", 1500);
                } else {
                    $('#otpError').text(res.message).show();
                }
            }
        });
    });
    $('#registerBtn').click(function () {
        const file = $('#profilePic')[0].files[0];
        const formData = new FormData();
        formData.append("FullName", $('#registerName').val());
        formData.append("Email", $('#registerEmail').val());
        formData.append("Password", $('#registerPassword').val());
        formData.append("ProfilePicture", file);

        $.ajax({
            url: '/User/RegisterUser',
            method: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function (res) {
                if (res.success) {
                    $('#registerMsg').text(res.message).css("color", "green");
                    setTimeout(() => window.location = "/User/Login", 1500);
                } else {
                    $('#registerMsg').text(res.message).css("color", "red");
                }
            }
        });
    });
    $('#profilePic').on('change', function () {
        const file = this.files[0];
        const allowedTypes = ['image/jpeg', 'image/png'];
        const maxSize = 1024 * 1024; // 80KB

        if (!file) {
            $('#picError').text('');
            return;
        }

        // Check file type
        if (!allowedTypes.includes(file.type)) {
            $('#picError').text("Only JPG and PNG images are allowed.");
            this.value = ''; // clear file input
            return;
        }

        // Check file size
        if (file.size > maxSize) {
            $('#picError').text("Image must be less than or equal to 1MB.");
            this.value = ''; // clear file input
        } else {
            $('#picError').text(''); // clear error if valid
        }
    });

});



