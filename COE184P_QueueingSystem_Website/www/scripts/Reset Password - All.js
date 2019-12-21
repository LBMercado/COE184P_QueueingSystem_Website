var ngResetPasswordApp = angular.module("ResetPasswordApp", ["ViewInfoAllApp"]);

ngResetPasswordApp.factory("resetPasswordService", function ($http, viewInfoService) {
    var resetPasswordService = viewInfoService;

    var httpConfig = {
        dataType: "json",
        contentType: "application/json",
        headers: {
            "authorization": "Basic " + btoa(BASIC_AUTH_USER + ":" + BASIC_AUTH_PASSW),
            "access-control-allow-credentials": true
        }
    };

    resetPasswordService.resetPassword = function (email, oldPassword, newPassword) {
        return $http.post(
            SERVICE_ENDPOINTURL + "ResetPassword",
            JSON.stringify({
                "email": email,
                "oldPassword": oldPassword,
                "newPassword": newPassword
            }), httpConfig
        );
    };

    return resetPasswordService;
});

ngResetPasswordApp.controller("resetPasswordController", function ($scope, $location, $window, resetPasswordService) {
    $scope.notifText = "";
    setInterval(() => {
        $scope.$apply(() => {
            var accountNumber = sessionStorage["AccountNumber"];
            resetPasswordService.isAdmin(accountNumber)
                .then((data, status) => {
                    if (data.data["IsAdminResult"]) {
                        resetPasswordService.getAdmin(accountNumber)
                            .then((data, status) => {
                                $scope.userInfo = data.data["GetAdminAccountWithAccountNumberResult"];
                            }, (status) => { console.log("ERROR: Unable to retrieve admin account."); });;
                    }
                    return resetPasswordService.isAttendant(accountNumber);
                },
                (status) => { console.log("ERROR: Unable to retrieve user type as admin."); })
                .then((data, status) => {
                    if (data.data["IsQueueAttendantResult"]) {
                        resetPasswordService.getAttendant(accountNumber)
                            .then((data, status) => {
                                $scope.userInfo = data.data["GetAttendantWithAccountNumberResult"];
                            }, (status) => { console.log("ERROR: Unable to retrieve attendant account."); });;
                    }
                    return resetPasswordService.isUser(accountNumber);
                }, (status) => { console.log("ERROR: Unable to retrieve user type as attendant."); })
                .then((data, status) => {
                    if (data.data["IsUserResult"]) {
                        resetPasswordService.getUser(accountNumber)
                            .then((data, status) => {
                                $scope.userInfo = data.data["GetUserAccountWithAccountNumberResult"];
                            }, (status) => { console.log("ERROR: Unable to retrieve user account."); });;
                    }
                }, (status) => { console.log("ERROR: Unable to retrieve user type as user."); });
        });
    },
        500);

    $scope.resetPassword = function (oldPassw, newPassw) {
        var email = $scope.userInfo["Email"];

        if (!oldPassw || !newPassw) {
            $scope.notifText = "Please fill out all the fields.";
            return;
        }

        resetPasswordService.resetPassword(email, oldPassw, newPassw)
            .then((data, status) => {
                if (data.data["ResetPasswordResult"]) {
                    $scope.notifText = "Successfully changed password!";
                    $scope.oldPassw = '';
                    $scope.newPassw = '';
                }
                else {
                    $scope.notifText = "Incorrect old password given.";
                }
            }, (status) => { console.log("ERROR: Unable to reset password.") });
    };

    $scope.goBackToViewAccount = function () {
        $window.location.replace("View Info - All.html");
    };
});