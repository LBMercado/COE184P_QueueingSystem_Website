var ngMainPageAttendantApp = angular.module("MainPageAttendantApp", ["MainPageUserApp"]);

ngMainPageAttendantApp.controller("lanesController", function ($scope, $location, $window, lanesService) {
    setInterval(() => {
        $scope.$apply(() => {
            var count = 0;
            lanesService.getLanes()
                .then((data, status) => {
                    $scope.lanes = data.data["GetAllLanesResult"];
                    angular.forEach($scope.lanes, (val, key) => {
                        lanesService.isLaneActive(val["LaneNumber"]).then(
                            (data, status) => {
                                $scope.lanes[key]["IsActive"] = data.data["IsLaneActiveResult"];
                            },
                            (status) => { console.log("ERROR: Unable to retrieve lane activity information."); }
                        );
                    },
                        (status) => { console.log("ERROR: Unable to retrieve lane information: error code " + status); });
                    $scope.userInfo["Email"] = sessionStorage.getItem("Email");

                });
            $scope.userInfo["Email"] = sessionStorage.getItem("Email");
            angular.forEach($scope.lanes, (val, key) => {
                lanesService.getLaneAttendant(val["LaneNumber"])
                    .then(
                    (data, status) => {
                        var attendant = data.data["GetAttendantAtLaneResult"];
                        var thisAttendantID = sessionStorage.getItem("QueueAttendantID");
                        if (attendant != null && attendant.QueueAttendantID == thisAttendantID) {
                            $scope.isNotAssigned = false;
                            $scope.attendant = attendant;
                        }
                        else
                            count++;
                        if (count == $scope.lanes.length)
                            initModel($scope);
                    },
                    (status) => {
                        console.log("ERROR: Unable to retrieve lane attendant information.");
                    });
            });
        })
    },
        500);

    $scope.goToAttendantLane = function () {
        if ($scope.attendant.DesignatedLane.LaneNumber == -1) {
            $window.alert("You have no assigned lane, contact an administrator.");
            return;
        }
        sessionStorage.setItem("LaneNumber", $scope.attendant.DesignatedLane.LaneNumber);
        $window.location.replace("/View Lane - Attendant.html");
    };
});

function initModel($scope) {
    $scope.attendant = { 'DesignatedLane': { 'LaneNumber': '-1' } };
    $scope.isNotAssigned = true;
};