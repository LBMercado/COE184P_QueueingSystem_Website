var ngMainPageUserApp = angular.module("MainPageUserApp", []);

ngMainPageUserApp.factory("lanesService", function($http) {
    var lanesFactory = {};
    var httpConfig = {
        dataType: "json",
        contentType: "application/json",
        headers: {
                "authorization": "Basic " + btoa(BASIC_AUTH_USER + ":" + BASIC_AUTH_PASSW),
                "access-control-allow-credentials": true
            }
    };
    lanesFactory.getLanes = function () {
        return $http.get(
            SERVICE_ENDPOINTURL + "GetAllLanes", httpConfig
        );
    };

    lanesFactory.getLaneAttendant = function (laneNumber) {
        return $http.post(
            SERVICE_ENDPOINTURL + "GetAttendantAtLane", JSON.stringify({ "laneNumber": laneNumber }), httpConfig
        );
    };

    lanesFactory.isLaneActive = function (laneNumber) {
        return $http.post(
            SERVICE_ENDPOINTURL + "IsLaneActive", JSON.stringify({"laneNumber": laneNumber}), httpConfig
        );
    };

    return lanesFactory;
});

ngMainPageUserApp.controller("lanesController", function ($scope, $timeout, $window, $filter, lanesService) {

    setInterval(() => {
        $scope.$apply(() => {
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
        })
    },
        1000);

    $scope.viewQueue = function (lane) {
        sessionStorage.setItem("LaneNumber", lane.LaneNumber);

        lanesService.getLaneAttendant(lane.LaneNumber)
            .then((data, status) => {
                if (angular.equals(data.data["GetAttendantAtLaneResult"], null))
                    console.log("WARNING: No attendant found at lane " + lane.LaneNumber)
                else {
                    sessionStorage.setItem("AttendantID", data.data["GetAttendantAtLaneResult"]["QueueAttendantID"]);
                    $window.location.replace("View Queues - User.html");
                }

            },
            (status) => { console.log("ERROR: failed to retrieve attendant at lane " + lane.LaneNumber) });
    };
});