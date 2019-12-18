var ngMainPageAttendantApp = angular.module("MainPageAttendantApp", ["MainPageUserApp"]);

ngMainPageAttendantApp.controller("lanesController", function ($scope, $location, $window, $timeout, $interval, $q, lanesService) {
    
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
                                    if (count == $scope.lanes.length)
                                        initModel();
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
        var count = 0;
        /*--------------------------------------------------------*/
        lanesService.getLanes()
            .then((data, status) => {
                var lanes = data.data["GetAllLanesResult"];
                //reflect changes in model only when it is different
                if (!angular.equals(lanes, $scope.lanes)) {
                    $scope.lanes = lanes;
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
                                        if (count == $scope.lanes.length)
                                            initModel();
                                    },
                                    (status) => {
                                        console.log("Exited getLaneAttendant loop - " + status);
                                    });
                            },
                            (status) => { console.log("ERROR: Unable to retrieve lane activity information."); });

                    },
                        (status) => { console.log("ERROR: Unable to retrieve lane information: error code " + status); });
                } else {
                    //still need to check if the attendant's lane has changed
                    angular.forEach($scope.lanes, (val, key) => {
                        lanesService.isLaneActive(val["LaneNumber"])
                            .then((data, status) => {
                                var isActiveResult = data.data["IsLaneActiveResult"];
                                //update model only if it has changed
                                if ($scope.lanes[key]["IsActive"] != isActiveResult)
                                    $scope.lanes[key]["IsActive"] = isActiveResult;
                                lanesService.getLaneAttendant(val["LaneNumber"])
                                    .then((data, status) => {
                                        var attendant = data.data["GetAttendantAtLaneResult"];
                                        var thisAttendantID = sessionStorage.getItem("QueueAttendantID");
                                        if (attendant != null && attendant.QueueAttendantID == thisAttendantID) {
                                            //update model only if it has changed
                                            if (!angular.equals($scope.attendant, attendant)) {
                                                $scope.isNotAssigned = false;
                                                $scope.attendant = attendant;
                                            }
                                            //break out
                                            $q.reject("Exited loop - found the assigned lane for the attendant.");
                                        }
                                        else
                                            count++;
                                        if (count == $scope.lanes.length)
                                            initModel();
                                    },
                                    (status) => {
                                        console.log("Exited getLaneAttendant loop - " + status);
                                    });
                            },
                            (status) => { console.log("ERROR: Unable to retrieve lane activity information."); });

                    },
                        (status) => { console.log("ERROR: Unable to retrieve lane information: error code " + status); });
                }
            });
        /*--------------------------------------------------------*/
    },
        500);

    $scope.goToAttendantLane = function () {
        if ($scope.attendant.DesignatedLane.LaneNumber == -1) {
            $window.alert("You have no assigned lane, contact an administrator.");
            return;
        }
        sessionStorage.setItem("LaneNumber", $scope.attendant.DesignatedLane.LaneNumber);
        $window.location.replace("View Lane - Attendant.html");
    };

    function initModel() {
        $scope.attendant = { 'DesignatedLane': { 'LaneNumber': '-1' } };
        $scope.isNotAssigned = true;
    };
});