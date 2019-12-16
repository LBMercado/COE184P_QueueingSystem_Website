var ngMainPageAdminApp = angular.module("MainPageAdminApp", ["MainPageUserApp"]);

ngMainPageAdminApp.controller("lanesController", function ($scope, $window, $location, lanesService) {
    setInterval(() => {
        $scope.$apply(() => {
            lanesService.getLanes()
                .then((data, status) => {
                    $scope.lanes = data.data["GetAllLanesResult"];
                },
                (status) => { console.log("ERROR: Unable to retrieve lane information: error code " + status); });
            $scope.userInfo["Email"] = sessionStorage.getItem("Email");

        });
    }, 500);

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