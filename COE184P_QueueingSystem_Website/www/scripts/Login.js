var ngLoginApp = angular.module("LoginApp", ["ngAnimate"]);

ngLoginApp.provider("LoginProvider", function () {
    this.httpConfig = {
        dataType: "json",
        contentType: "application/json",
        headers: {
            "authorization": "",
            "access-control-allow-credentials": true
        }
    };
    this.baseUrl = "";
    this.$get = function () {
        return {
            "httpConfig": this.httpConfig,
            "baseUrl": this.baseUrl
        };
    };
});

ngLoginApp.service("LoginService", function ($http, $q, LoginProvider) {
    this.isValidLogin = function (email, password) {
        var data = {
            "email": email,
            "password": password
        };
        var serviceName = "IsCorrectLogin";
        return $http.post(
            LoginProvider.baseUrl + serviceName,
            JSON.stringify(data),
            LoginProvider.httpConfig
        ).then((response) => {
            return response.data[serviceName + "Result"];
        }, (response) => {
            return $q.reject("Unable to proceed with login request. Error " +
                response.statusCode + ": " + response.statusText);
        });
    };
    this.signInUser = function (email, password) {
        var data = {
            "email": email,
            "password": password
        };
        var serviceName = "LoginAsUser";
        return $http.post(
            LoginProvider.baseUrl + serviceName,
            JSON.stringify(data),
            LoginProvider.httpConfig
        ).then((response) => {
            return response.data[serviceName + "Result"];
        }, (response) => {
            return $q.reject("Unable to proceed with sign in request. Error " +
                response.statusCode + ": " + response.statusText);
        });
    };
    this.signUpUser = function (user) {
        var data = user;
        var serviceName = "RegisterAsUser";
        return $http.post(
            LoginProvider.baseUrl + serviceName,
            JSON.stringify({ 'user': data }),
            LoginProvider.httpConfig
        ).then((response) => {
            return response.data[serviceName + "Result"];
        }, (response) => {
            return $q.reject("Unable to proceed with sign up request. Error " +
                response.statusCode + ": " + response.statusText);
        });
    };
    this.signInAttendant = function (email, password) {
        var data = {
            "email": email,
            "password": password
        };
        var serviceName = "LoginAsAttendant";
        return $http.post(
            LoginProvider.baseUrl + serviceName,
            JSON.stringify(data),
            LoginProvider.httpConfig
        ).then((response) => {
            return response.data[serviceName + "Result"];
        }, (response) => {
            return $q.reject("Unable to proceed with sign in request. Error " +
                response.statusCode + ": " + response.statusText);
        });
    };
    this.signUpAttendant = function (user) {
        var data = user;
        var serviceName = "RegisterAsAttendant";
        return $http.post(
            LoginProvider.baseUrl + serviceName,
            JSON.stringify({ 'attendant': data }),
            LoginProvider.httpConfig
        ).then((response) => {
            return response.data[serviceName + "Result"];
        }, (response) => {
            return $q.reject("Unable to proceed with sign up request. Error " +
                response.statusCode + ": " + response.statusText);
        });
    };
    this.signInAdmin = function (email, password) {
        var data = {
            "email": email,
            "password": password
        };
        var serviceName = "LoginAsAdmin";
        return $http.post(
            LoginProvider.baseUrl + serviceName,
            JSON.stringify(data),
            LoginProvider.httpConfig
        ).then((response) => {
            return response.data[serviceName + "Result"];
        }, (response) => {
            return $q.reject("Unable to proceed with sign in request. Error " +
                response.statusCode + ": " + response.statusText);
        });
    };
    this.signUpAdmin = function (user) {
        var data = user;
        var serviceName = "RegisterAsAdmin";
        return $http.post(
            LoginProvider.baseUrl + serviceName,
            JSON.stringify({ 'admin': data }),
            LoginProvider.httpConfig
        ).then((response) => {
            return response.data[serviceName + "Result"];
        }, (response) => {
            return $q.reject("Unable to proceed with sign up request. Error " +
                response.statusCode + ": " + response.statusText);
        });
    };
});

ngLoginApp.controller("LoginController", function ($window, $timeout, $q, LoginService) {
    this.user = {
        "AccountNumber": 0,
        "ContactNumber": "",
        "Email": "",
        "FirstName": "",
        "LastName": "",
        "MiddleName": "",
        "Password": "",
        "UserID": ""
    };
    this.successText = "";
    this.errorText = "";
    this.isValidLogin = false;
    this.isLoginClicked = false;
    this.isLoginClickedOnce = false;
    this.login = function (email, password) {
        if (this.isLoginClicked) return; //prevent repetitive requests
        if (!email, !password) return;
        this.isLoginClicked = true;
        this.isLoginClickedOnce = true;
        LoginService.isValidLogin(email, password)
            .then((isValid) => {
                if (isValid) {
                    LoginService.signInUser(email, password)
                        .then((user) => {
                            if (user == null)
                                return LoginService.signInAttendant(email, password);
                            else {
                                this.successText = "Success! You will be redirected shortly.";
                                this.isValidLogin = true;
                                $timeout(() => {
                                    sessionStorage.setItem("UserID", user["UserID"]);
                                    sessionStorage.setItem("Email", user["Email"]);
                                    sessionStorage.setItem("AccountNumber", user["AccountNumber"]);
                                    this.isLoginClicked = false;
                                    $window.location.replace("Main Page - User.html");
                                }, 3000);

                                return $q.reject("Promise chain broken - User type determined as user");
                            }
                        })
                        .then((attendant) => {
                            if (attendant == null)
                                return LoginService.signInAdmin(email, password);
                            else {
                                this.successText = "Success! You will be redirected shortly.";
                                this.isValidLogin = true;
                                $timeout(() => {
                                    sessionStorage.setItem("QueueAttendantID", attendant["QueueAttendantID"]);
                                    sessionStorage.setItem("Email", attendant["Email"]);
                                    sessionStorage.setItem("AccountNumber", attendant["AccountNumber"]);
                                    $window.location.replace("Main Page - Attendant.html");
                                    this.isLoginClicked = false;
                                }, 3000);
                                return $q.reject("Promise chain broken - User type determined as attendant");
                            }
                        })
                        .then((admin) => {
                            if (admin == null)
                                throw "Email and Password do not point to a valid user type.";
                            else {
                                this.successText = "Success! You will be redirected shortly.";
                                this.isValidLogin = true;
                                $timeout(() => {
                                    sessionStorage.setItem("AdminID", admin["AdminID"]);
                                    sessionStorage.setItem("Email", admin["Email"]);
                                    sessionStorage.setItem("AccountNumber", admin["AccountNumber"]);
                                    this.isLoginClicked = false;
                                    $window.location.replace("Main Page - Admin.html");
                                }, 3000);
                                return $q.resolve("Promise chain completed - User type determined as admin.");
                            }
                        })
                        .catch((errorResponse) => {
                            console.log("ERROR: " + errorResponse);
                        });
                } else {
                    this.errorText = "Email or Password entered is invalid.";
                    this.isValidLogin = false;
                    this.isLoginClicked = false;
                }
            })
            .catch((reason) => {
                console.log("ERROR: " + reason);
            });
    };
});

ngLoginApp.controller("SignUpController", function ($window, $timeout, LoginService) {
    this.user = {
        "AccountNumber": 0,
        "ContactNumber": "",
        "Email": "",
        "FirstName": "",
        "LastName": "",
        "MiddleName": "",
        "Password": "",
        "UserID": ""
    };
    this.isExistingLogin = false;
    this.isSuccessfulSignUp = false;
    this.notifText = "";
    this.signUp = function (user) {
        if (typeof user === "undefined" || user == null ||
            !user.Email || !user.Password ||
            user.Password != this.confirmPassword)
            return;

        LoginService.signUpUser(user)
            .then((success) => {
                if (success) {
                    this.isExistingLogin = false;
                    this.notifText = "Successfully signed up! You will be redirected shortly.";
                    this.isSuccessfulSignUp = true;
                    $timeout(() => {
                        $window.location.replace("Login.html");
                    }, 3000);
                }
                else {
                    //invalid signup, most likely re-used email
                    this.notifText = "Email entered is already used.";
                    this.isExistingLogin = true;
                    this.isSuccessfulSignUp = false;
                }
            })
            .catch((errorResponse) => {
                console.log("ERROR: " + errorResponse);
                this.isSuccessfulSignUp = false;
                this.isExistingLogin = false;
            });
    };
});

ngLoginApp.config(function (LoginProviderProvider) {
    LoginProviderProvider.httpConfig.headers.authorization = AUTH_HEADER;
    LoginProviderProvider.baseUrl = SERVICE_ENDPOINTURL;
});