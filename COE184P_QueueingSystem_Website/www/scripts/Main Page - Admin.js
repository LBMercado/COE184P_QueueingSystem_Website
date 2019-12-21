var ngMainPageAdminApp = angular.module("MainPageAdminApp", ["MainPageUserApp"]);

ngMainPageAdminApp.controller("lanesController", function ($scope, $window, $location, lanesService, $interval, $timeout) {
    $scope.userInfo = { 'Email': 'USER_PLACEHOLDER_EMAIL' };

    $scope.refreshLaneView = function () {
        lanesService.getLanes()
            .then((data, status) => {
                var laneList = data.data["GetAllLanesResult"];
                //update only when the list changes
                if (!angular.equals(laneList, $scope.lanes))
                    $scope.lanes = laneList;
            },
            (status) => { console.log("ERROR: Unable to retrieve lane information: error code " + status); });
    };

    $timeout(() => {
        $scope.userInfo["Email"] = sessionStorage.getItem("Email");
        /*------------------------------------------------------------*/
        lanesService.getLanes()
            .then((data, status) => {
                var laneList = data.data["GetAllLanesResult"];
                $scope.lanes = laneList;
            },
            (status) => { console.log("ERROR: Unable to retrieve lane information: error code " + status); });
        /*------------------------------------------------------------*/
    }, 500);

    $interval(() => {
        $scope.refreshLaneView();
    }, 1000);

    $scope.logout = function () {
        $window.sessionStorage.clear();
        $window.location.replace("Login.html");
    };

    $scope.goToEditLane = function (laneNumber) {
        sessionStorage.setItem("LaneNumber", laneNumber);
        $window.location.replace("Edit Lane - Admin.html");
    };

    $scope.goToAddUser = function () {
        $window.location.replace("Add User - Admin.html");
    };

    $scope.goToAddLane = function () {
        $window.location.replace("Add Lane - Admin.html");
    };
});