var ngMainPageAttendantApp = angular.module("MainPageAttendantApp", ["MainPageUserApp"]);

ngMainPageAttendantApp.controller("lanesController", function ($scope, $location, $window, $timeout, $interval, $q, lanesService) {
    initModel();
    $timeout(() => {
        var count = 0;
        $scope.userInfo["Email"] = sessionStorage.getItem("Email");
        /*--------------------------------------------------------*/
        lanesService.getLanes()
            .then((data, status) => {
                $scope.lanes = data.data["GetAllLanesResult"];
                angular.forEach($scope.lanes, (val, key) => {
                    lanesService.isLaneActive(val["LaneNumber"])
                        .then((data, status) => {
                            $scope.lanes[key]["IsActive"] = data.data["IsLaneActiveResult"];
                            lanesService.getLaneAttendant(val["LaneNumber"])
                                .then((data, status) => {
                                    var attendant = data.data["GetAttendantAtLaneResult"];
                                    var thisAttendantID = sessionStorage.getItem("QueueAttendantID");
                                    if (attendant != null && attendant.QueueAttendantID == thisAttendantID) {
                                        $scope.isNotAssigned = false;
                                        $scope.attendant = attendant;
                                        //break out
                                        $q.reject("Exited loop - found the assigned lane for the attendant.");
                                    }
                                    else
                                        count++;
                                    if (count == $scope.lanes.length) {
                                        initModel();
                                        $scope.notifText = "You have no assigned lane, contact an administrator.";
                                        $scope.isNotAssigned = true;
                                    }
                                },
                                (status) => {
                                    console.log("Exited getLaneAttendant loop - " + status);
                                });
                        },
                        (status) => { console.log("ERROR: Unable to retrieve lane activity information."); });
                },
                    (status) => { console.log("ERROR: Unable to retrieve lane information: error code " + status); });
            });
        /*--------------------------------------------------------*/
    }, 250);

    $interval(() => {
        /*--------------------------------------------------------*/
        lanesService.getLanes()
            .then((data, status) => {
                var lanes = data.data["GetAllLanesResult"];
                var lanesWithStatus = [];
                lanes.reduce(function (p, lane) {
                    return p.then(function () {
                        return lanesService.isLaneActive(lane["LaneNumber"])
                            .then((response) => {
                                lane["IsActive"] = response.data["IsLaneActiveResult"];
                                lanesWithStatus.push(lane);
                                return $q.resolve(lanesWithStatus);
                            });
                    });
                }, $q.when(true))
                    .then((lanes) => {
                        //update model only if it is different
                        if (!angular.equals(lanes, $scope.lanes)) {
                            $scope.lanes = angular.copy(lanes);
                        }
                        var thisAttendantID = sessionStorage.getItem("QueueAttendantID");
                        lanes.reduce(function (p, lane) {
                            return p.then(function () {
                                return lanesService.getLaneAttendant(lane["LaneNumber"])
                                    .then((response) => {
                                        var att = response.data["GetAttendantAtLaneResult"];
                                        if (att != null && att.QueueAttendantID == thisAttendantID) {
                                            //break out
                                            return $q.reject(att);
                                        }
                                        else {
                                            return $q.resolve(null);
                                        }
                                    });
                            });
                        }, $q.when(true))
                            .then((att) => {
                            })
                            .catch((att) => {
                                if (att != null) {
                                    $scope.isNotAssigned = false;
                                    $scope.attendant = att;
                                } else {
                                    initModel();
                                }
                            });
                    });
            });
        /*--------------------------------------------------------*/
    },
        500);

    $scope.logout = function () {
        $window.sessionStorage.clear();
        $window.location.replace("Login.html");
    };

    $scope.goToAttendantLane = function () {
        if ($scope.attendant.DesignatedLane.LaneNumber == -1) {
            $scope.notifText = "You have no assigned lane, contact an administrator.";
            $scope.isNotAssigned = true;
            return;
        }
        sessionStorage.setItem("LaneNumber", $scope.attendant.DesignatedLane.LaneNumber);
        $window.location.replace("View Lane - Attendant.html");
    };

    function initModel() {
        $scope.attendant = { 'DesignatedLane': { 'LaneNumber': '-1' } };
        $scope.notifText = "You have no assigned lane, contact an administrator.";
        $scope.isNotAssigned = true;
    };
});