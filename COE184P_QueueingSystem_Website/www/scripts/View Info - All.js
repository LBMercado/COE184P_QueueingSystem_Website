var ngViewInfoAllApp = angular.module("ViewInfoAllApp", []);

ngViewInfoAllApp.factory("viewInfoService", function ($http) {
    var viewInfoService = {};

    var httpConfig = {
        dataType: "json",
        contentType: "application/json",
        headers: {
            "authorization": "Basic " + btoa(BASIC_AUTH_USER + ":" + BASIC_AUTH_PASSW),
            "access-control-allow-credentials": true
        }
    };

    viewInfoService.isUser = function (accountNumber) {
        return $http.post(
            SERVICE_ENDPOINTURL + "IsUser", JSON.stringify({ "accountNumber": accountNumber }), httpConfig
        );
    };

    viewInfoService.isAttendant = function (accountNumber) {
        return $http.post(
            SERVICE_ENDPOINTURL + "IsQueueAttendant", JSON.stringify({ "accountNumber": accountNumber }), httpConfig
        );
    };

    viewInfoService.isAdmin = function (accountNumber) {
        return $http.post(
            SERVICE_ENDPOINTURL + "IsAdmin", JSON.stringify({ "accountNumber": accountNumber }), httpConfig
        );
    };

    viewInfoService.getUser = function (accountNumber) {
        return $http.post(
            SERVICE_ENDPOINTURL + "GetUserAccountWithAccountNumber", JSON.stringify({ "accountNumber": accountNumber }), httpConfig
        );
    };

    viewInfoService.getAttendant = function (accountNumber) {
        return $http.post(
            SERVICE_ENDPOINTURL + "GetAttendantWithAccountNumber", JSON.stringify({ "accountNumber": accountNumber }), httpConfig
        );
    };

    viewInfoService.getAdmin = function (accountNumber) {
        return $http.post(
            SERVICE_ENDPOINTURL + "GetAdminAccountWithAccountNumber", JSON.stringify({ "accountNumber": accountNumber }), httpConfig
        );
    };

    return viewInfoService;
});

ngViewInfoAllApp.controller("userInfoController", function ($scope, $location, $window, viewInfoService) {
    setInterval(() => {
        $scope.$apply(() => {
            var accountNumber = sessionStorage["AccountNumber"];
            viewInfoService.isAdmin(accountNumber)
                .then((data, status) => {
                    if (data.data["IsAdminResult"]) {
                        $scope.userType = 'Admin';
                        viewInfoService.getAdmin(accountNumber)
                            .then((data, status) => {
                                $scope.userInfo = data.data["GetAdminAccountWithAccountNumberResult"];
                            }, (status) => { console.log("ERROR: Unable to retrieve admin account."); });;
                    }
                    return viewInfoService.isAttendant(accountNumber);
                },
                (status) => { console.log("ERROR: Unable to retrieve user type as admin."); })
                .then((data, status) => {
                    if (data.data["IsQueueAttendantResult"]) {
                        $scope.userType = 'QueueAttendant';
                        viewInfoService.getAttendant(accountNumber)
                            .then((data, status) => {
                                $scope.userInfo = data.data["GetAttendantWithAccountNumberResult"];
                            }, (status) => { console.log("ERROR: Unable to retrieve attendant account."); });;
                    }
                    return viewInfoService.isUser(accountNumber);
                }, (status) => { console.log("ERROR: Unable to retrieve user type as attendant."); })
                .then((data, status) => {
                    if (data.data["IsUserResult"]) {
                        $scope.userType = 'User';
                        viewInfoService.getUser(accountNumber)
                            .then((data, status) => {
                                $scope.userInfo = data.data["GetUserAccountWithAccountNumberResult"];
                            }, (status) => { console.log("ERROR: Unable to retrieve user account."); });;
                    }
                }, (status) => { console.log("ERROR: Unable to retrieve user type as user."); });
        });
    },
        500);
    $scope.goBackToMainPage = function (userType) {
        switch (userType) {
            case "User":
                $window.location.replace("Main Page - User.html");
                break;
            case "QueueAttendant":
                $window.location.replace("Main Page - Attendant.html");
                break;
            case "Admin":
                $window.location.replace("Main Page - Admin.html");
                break;
            default:
                console.log("ERROR: Unidentified user type, cannot proceed with request.");
        }
    };

    $scope.resetPassword = function () {
        $window.location.replace("Reset Password - All.html");
    };
});