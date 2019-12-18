var ngAddUserApp = angular.module("AddUserApp", []);

/*FACTORIES/SERVICES--------------------------------------------------------------------*/
ngAddUserApp.factory("httpConfigFactory", [function () {
    var httpConfig = {
        dataType: "json",
        contentType: "application/json",
        headers: {
                "authorization": "Basic " + btoa(BASIC_AUTH_USER + ":" + BASIC_AUTH_PASSW),
                "access-control-allow-credentials": true
        }
    };

    return httpConfig;
}]);

ngAddUserApp.factory("userInfoService", ["httpConfigFactory", "$http", function (httpConfigFactory, $http) {
    var factory = [];
    var httpConfig = httpConfigFactory;

    factory.isExistingAccountServiceName = "IsCorrectLogin";
    factory.isExistingAccount = function (email, passw) {
        return $http.post(
            SERVICE_ENDPOINTURL + factory.isExistingAccountServiceName,
            JSON.stringify({ "email": email, "password": passw }),
            httpConfig
        );
    }

    return factory;
}]);

ngAddUserApp.factory("addUserService", ["httpConfigFactory", "$http", function (httpConfigFactory, $http) {
    var factory = [];
    var httpConfig = httpConfigFactory;

    factory.addUserServiceName = "RegisterAsUser";
    factory.addUser = function (user) {
        return $http.post(
            SERVICE_ENDPOINTURL + factory.addUserServiceName,
            JSON.stringify({ "user": user }),
            httpConfig
        );
    };

    factory.addAttServiceName = "RegisterAsAttendant";
    factory.addAtt = function (user) {
        return $http.post(
            SERVICE_ENDPOINTURL + factory.addAttServiceName,
            JSON.stringify({ "attendant": user }),
            httpConfig
        );
    };

    factory.addAdminServiceName = "RegisterAsAdmin";
    factory.addAdmin = function (user) {
        return $http.post(
            SERVICE_ENDPOINTURL + factory.addAdminServiceName,
            JSON.stringify({ "admin": user }),
            httpConfig
        );
    };

    return factory;
}]);
/*FACTORIES/SERVICES--------------------------------------------------------------------*/
/*CONTROLLERS--------------------------------------------------------------------*/
ngAddUserApp.controller("addUserController",
    ["$scope", "$window", "$location", "$q","userInfoService", "addUserService",
    function ($scope, $window, $location, $q, userInfoService, addUserService) {
        this.userTypeOpts = ["User", "Attendant", "Administrator"];
        this.selUserType = this.userTypeOpts[0];
        this.user = {};

        function determineUserAndAdd(user, userType) {
            switch (userType) {
                case "User":
                    return addUserService.addUser(user);
                    break;
                case "Attendant":
                    return addUserService.addAtt(user);
                    break;
                case "Administrator":
                    return addUserService.addAdmin(user);
                    break;
                default:
                    console.log("ERROR: Cannot identify user type.");

            }
        };

        function determineUserAddSuccess(data, userType) {
            switch (userType) {
                case "User":
                    return data.data[addUserService.addUserServiceName + "Result"];
                    break;
                case "Attendant":
                    return data.data[addUserService.addAttServiceName + "Result"];
                    break;
                case "Administrator":
                    return data.data[addUserService.addAdminServiceName + "Result"];
                    break;
                default:
                    console.log("ERROR: Cannot identify user type.");
                    return false;

            }
        };

        this.addNewUser = function (newUser, confirmPassw) {
            
            if (newUser.Password != confirmPassw) {
                $window.alert("Passwords don't match.");
                return;
            }

            userInfoService.isExistingAccount(newUser.Email, newUser.Password)
                .then((data) => {
                    var exists = data.data[userInfoService.isExistingAccountServiceName + "Result"];

                    if (exists) {
                        $window.alert("The email is already used.");
                        $q.reject("Failed to add: Email is already used.");;
                    } else {
                        return determineUserAndAdd(newUser, this.selUserType);
                    }
                })
                .then((data) => {
                    var success = determineUserAddSuccess(data, this.selUserType);

                    if (success) {
                        $window.alert("Successfully added new user!");
                        this.resetForm();

                    } else {
                        $window.alert("Failed to add user.");
                    }
                    return success;
                })
                .catch((reason) => { console.log("Caught: " + reason); });

        };

        this.resetForm = function() {
            this.user = {};
            this.confirmPassw = "";

            $scope.addUserForm.$setPristine();
            $scope.addUserForm.$setUntouched();
        };

        this.goBack = function () {
            $window.location.replace("Main Page - Admin.html");
        };

}]);
/*CONTROLLERS--------------------------------------------------------------------*/