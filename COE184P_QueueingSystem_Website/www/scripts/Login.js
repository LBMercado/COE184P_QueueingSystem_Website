var userInfo;

(function ($) {
    "use strict";
    /*==================================================================
    [ Validate ]*/
    var input = $(".validate-input .input100");
    $(".validate-form").on("submit", function () {
        var check = true;
        var userType;

        for (var i = 0; i < input.length; i++) {
            if (validate(input[i]) == false) {
                showValidate(input[i]);
                check = false;
            }
        }
        if (check) {
            var email = $(".validate-form .input100[name='email']").val();
            var pass = $(".validate-form .input100[name='pass']").val();
            var user;
            var serviceName = "IsCorrectLogin";
            var serviceUrl = SERVICE_ENDPOINTURL + serviceName;
            $.ajax({
                type: "POST",
                url: serviceUrl,
                dataType: "json",
                contentType: "application/json",
                headers: {
                    "authorization": "Basic " + btoa(BASIC_AUTH_USER + ":" + BASIC_AUTH_PASSW),
                    "access-control-allow-credentials": true,
                    "access-control-allow-methods": "GET,POST,OPTIONS"
                },
                data: JSON.stringify({
                    email: email,
                    password: pass
                }),
                async: true,
                success: function (data, status) {
                    if (data["IsCorrectLoginResult"] == true) { 
                        var p = getUser(email, pass);

                        p.done(() => {
                            user = userInfo;

                            if (user == null) {
                            console.log("ERROR: unknown user type returned at successful login.");
                            window.alert("Something went wrong during login.");
                            return;
                            }
                            setSessionData(user);
                            if ("AdminID" in user) {
                                window.location.replace("Main Page - Admin.html");
                            }
                            else if ("QueueAttendantID" in user) {
                                window.location.replace("Main Page - Attendant.html");
                            }
                            else {
                                window.location.replace("Main Page - User.html");
                            }
                            });
                    }
                    else {
                        window.alert("Incorrect login details entered.");
                    }
                },
                statusCode: {
                    401: () => { window.alert('client side: authentication error'); },
                    404: () => { window.alert('client side: page does not exist.'); },
                    500: () => { window.alert('server side: general error'); }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    window.alert("Failed to verify credentials, request failure. Error: " + errorThrown);
                }
            });
        }
        //return false for no page refresh
        return false;
    });
    /*==================================================================
    [ Validate ]*/
    var input = $('.validate-input .input100');

    $('.validate-form').on('submit', function () {
        var check = true;

        for (var i = 0; i < input.length; i++) {
            if (validate(input[i]) == false) {
                showValidate(input[i]);
                check = false;
            }
        }

        return check;
    });


    $('.validate-form .input100').each(function () {
        $(this).focus(function () {
            hideValidate(this);
        });
    });

    function validate(input) {
        if ($(input).attr('type') == 'email' || $(input).attr('name') == 'email') {
            if ($(input).val().trim().match(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{1,5}|[0-9]{1,3})(\]?)$/) == null) {
                return false;
            }
        }
        else {
            if ($(input).val().trim() == '') {
                return false;
            }
        }
    }

    function showValidate(input) {
        var thisAlert = $(input).parent();

        $(thisAlert).addClass('alert-validate');
    }

    function hideValidate(input) {
        var thisAlert = $(input).parent();

        $(thisAlert).removeClass('alert-validate');
    }

    function getUser(email, pw) {
        var serviceName = ['LoginAsUser', 'LoginAsAttendant', 'LoginAsAdmin'];
        var serviceUrl = [];
        var p = $.when();

        $.each(serviceName, (index, value) => {
            serviceUrl.push(SERVICE_ENDPOINTURL + value);
        });

        function _loginCallback(loginUrl, loginService) {
            return $.post({
                url: loginUrl,
                dataType: "json",
                contentType: "application/json",
                headers: {
                    "authorization": "Basic " + btoa(BASIC_AUTH_USER + ":" + BASIC_AUTH_PASSW),
                    "access-control-allow-credentials": true,
                    "access-control-allow-methods": "GET,POST,OPTIONS"
                },
                data: JSON.stringify({
                    email: email,
                    password: pw
                })})
                .done((data) => {
                    if (data[loginService + "Result"] != null)
                        userInfo = data[loginService + "Result"];
                })
                .fail(() => {
                    console.log("ERROR: unable to login at service \"" + loginService + "\"");
                });
        }

        $.each(serviceUrl, (index, value) => {
            p = p.then(() => {
                return _loginCallback(value, serviceName[index]);
            });
        });

        return p;
    }

    function setSessionData(user) {
        if ("AdminID" in user) {

            sessionStorage.setItem("AdminID", user["AdminID"]);
        }
        else if ("QueueAttendantID" in user) {
            sessionStorage.setItem("QueueAttendantID", user["QueueAttendantID"]);
        }
        else {
            sessionStorage.setItem("UserID", user["UserID"]);
        }
        sessionStorage.setItem("Email", user["Email"]);
        sessionStorage.setItem("AccountNumber", user["AccountNumber"]);
        sessionStorage.setItem("FullName", user["FirstName"] + " " + user["MiddleName"] + " " + user["LastName"]);
    }

    //SIGNUP

    $("#SignUpButton").on("click", function (e) {
        var firstName = $("#firstName").val(), middleName = $("#middleName").val(), lastName = $("#lastName").val(),
            email = $("#email").val(), password = $("#password").val(), confirmPassword = $("#confirmPassword").val(), contactNumber = $("#contactNumber").val();
        var serviceName = "RegisterAsUser";
        var serviceUrl = SERVICE_ENDPOINTURL + serviceName;
        $.ajax({
            type: "POST",
            url: serviceUrl,
            dataType: "json",
            contentType: "application/json",
            headers: {
                "authorization": "Basic " + btoa(basicAuthUser + ":" + basicAuthPass),
                "access-control-allow-credentials": true,
                "access-control-allow-methods": "GET,POST,OPTIONS"
            },
            data: JSON.stringify({
                user: {
                    Email: email,
                    Password: password,
                    ContactNumber: contactNumber,
                    FirstName: firstName,
                    MiddleName: middleName,
                    LastName: lastName
                }
            }),
            async: true,
            success: function (data, status) {
                alert("Sign Up Successful, Welcome " + firstName);
                window.location.replace("Login.html"); 
            }
        }); 
    }
    );

})(jQuery);