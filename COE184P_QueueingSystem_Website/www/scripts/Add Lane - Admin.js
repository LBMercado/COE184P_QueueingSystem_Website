var ngAddLaneApp = angular.module("AddLaneApp", []);

ngAddLaneApp.factory("addLaneService", function ($http) {
    var addLaneFactory = {};

    var httpConfig = {
        dataType: "json",
        contentType: "application/json",
        headers: {
                "authorization": "Basic " + btoa(BASIC_AUTH_USER + ":" + BASIC_AUTH_PASSW),
                "access-control-allow-credentials": true
            }
    };

    var convertDateToTimeSpan = function (date) {
        return "PT" + date.getHours() + "H" + date.getMinutes() + "M" + date.getSeconds() + "S";
    };

    addLaneFactory.getLaneCount = function () {
        return $http.get(
            SERVICE_ENDPOINTURL + "GetLaneCount", httpConfig
        );
    };

    addLaneFactory.addNewLane = function (newLane) {
        return $http.post(
            SERVICE_ENDPOINTURL + "AddNewLane", JSON.stringify({"lane":newLane}), httpConfig
        );
    };
    
    addLaneFactory.setLaneAttendant = function (laneNumber, attID, tolerance) {
        return $http.post(
            SERVICE_ENDPOINTURL + "SetLaneActive",
            JSON.stringify({
                "laneNumber":laneNumber,
                "attendantID": attID,
                "maxTolerance": convertDateToTimeSpan(tolerance)
            }), httpConfig
        );
    };

    return addLaneFactory;
});

ngAddLaneApp.factory("laneInfoService", function ($http) {
    var laneInfoFactory = {};

    var httpConfig = {
        dataType: "json",
        contentType: "application/json",
        headers: {
                "authorization": "Basic " + btoa(BASIC_AUTH_USER + ":" + BASIC_AUTH_PASSW),
                "access-control-allow-credentials": true
            }
    };

    laneInfoFactory.getLaneInfo = function (laneNumber) {
        return $http.post(
            SERVICE_ENDPOINTURL + "GetLane", JSON.stringify({"laneNumber":laneNumber}),httpConfig
        );
    };

    laneInfoFactory.getAttendant = function (attID) {
        return $http.post(
            SERVICE_ENDPOINTURL + "GetAttendantWithAttendantID", JSON.stringify({"attendantID":attID}), httpConfig
        );
    }

    laneInfoFactory.getAttendants = function () {
        return $http.post(
            SERVICE_ENDPOINTURL + "GetListOfAttendants", "{}",httpConfig
        );
    };

    return laneInfoFactory;
});

ngAddLaneApp.controller("userInfoController", function ($scope, $timeout) {
    $scope.userInfo = {};
    $scope.userInfo["Email"] = 'USER_PLACEHOLDER_EMAIL';

    $timeout(() => {
        $scope.$apply(() => {
            $scope.userInfo["Email"] = sessionStorage.getItem("Email");
        });
    }, 500);
});

ngAddLaneApp.controller("laneInfoController", function ($scope, $window, $q, $interval, $timeout, laneInfoService, addLaneService) {
    var unassignedAtt = {
        "AccountNumber": -1,
        "ContactNumber": "",
        "Email": "",
        "FirstName": "",
        "LastName": "",
        "MiddleName": "",
        "Password": "",
        "DesignatedLane": {
            "Capacity": 0,
            "LaneID": 0,
            "LaneName": null,
            "LaneNumber": 0
        },
        "QueueAttendantID": ""
    };
    var defaultLane = {
        "LaneName": "",
        "Capacity":10
    };

    $scope.newLane = defaultLane;
    $scope.attOptions = ['No Attendant'];
    $scope.selectedAttID = $scope.attOptions[0];
    $scope.assignedAtt = unassignedAtt;

    $timeout(() => {
        var selectedAttID = $scope.selectedAttID;
        /*-------------------------------------------------*/
        laneInfoService.getAttendants()
            .then((data, status) => {
                var attList = data.data["GetListOfAttendantsResult"];
                if (!attList.length)
                    console.log("WARNING: No attendants available.");
                else {
                    $scope.availAttendants = attList;
                    $scope.attOptions = ['No Attendant'];
                    angular.forEach(attList, function (val, key) {
                        $scope.attOptions.push(val["QueueAttendantID"]);
                    });
                }
            }, (status) => { console.log("ERROR: failed to retrieve list of attendants."); });
        /*-------------------------------------------------*/
        addLaneService.getLaneCount().then(
            (data) => {
                var curLaneNumber = data.data["GetLaneCountResult"];
                if (curLaneNumber != null)
                    $scope.nextLaneNumber = curLaneNumber + 1;
                else
                    $scope.nextLaneNumber = -1;
            });
        /*-------------------------------------------------*/
    }, 500);

    $interval(() => {
        var selectedAttID = $scope.selectedAttID;
        /*-------------------------------------------------*/
        laneInfoService.getAttendants()
            .then((data, status) => {
                var attList = data.data["GetListOfAttendantsResult"];
                if (!attList.length)
                    console.log("WARNING: No attendants available.");
                //update the model only if it is different from the current
                else if (!angular.equals(attList,$scope.availAttendants)){
                    $scope.availAttendants = attList;
                    $scope.attOptions = ['No Attendant'];
                    angular.forEach(attList, function (val, key) {
                        $scope.attOptions.push(val["QueueAttendantID"]);
                    });
                }
            }, (status) => { console.log("ERROR: failed to retrieve list of attendants."); });
        /*-------------------------------------------------*/
        if (selectedAttID == "No Attendant") {
            //don't reassign if they are the same
            if (!angular.equals($scope.assignedAtt, unassignedAtt))
                $scope.assignedAtt = unassignedAtt;
        } else {
            laneInfoService.getAttendant(selectedAttID)
            .then((data, status) => {
                var att = data.data["GetAttendantWithAttendantIDResult"];
                if (att == null)
                    $scope.assignedAtt = unassignedAtt;
                //update the model only if it is different from the current
                else (!angular.equals(att,$scope.assignedAtt))
                    $scope.assignedAtt = att;
            }, (status) => { console.log("ERROR: Unable to retrieve attendant info."); });
        }
        /*-------------------------------------------------*/
        addLaneService.getLaneCount().then(
            (data) => {
                //update the model only if it is different from the current
                if ($scope.nextLaneNumber != data.data["GetLaneCountResult"] + 1)
                    $scope.nextLaneNumber = data.data["GetLaneCountResult"] + 1;
            });
        /*-------------------------------------------------*/
    }, 1000);

    $scope.addNewLane = function (newLane, assignedAttID) {
        var laneToAdd = angular.copy(newLane);
        var tolerance = new Date();
        tolerance.setHours(23,59,59); //default tolerance of ~one day

        laneToAdd.LaneNumber = $scope.nextLaneNumber - 1;
        if (!laneToAdd.LaneName){
            $window.alert("A name is required for the lane.");
            return;
        }
        if (assignedAttID == 'No Attendant' || assignedAttID.length != 12) {
            addLaneService.addNewLane(laneToAdd)
                .then((data) => {
                    if (data.data["AddNewLaneResult"]) {
                        $scope.newLane = defaultLane;
                        $scope.selectedAttID = $scope.attOptions[0];
                        $window.alert("New lane added with unset attendant.");
                    }
                }, (status) => { console.log("ERROR: Failed to add new lane with no attendant."); });
        } else {
            laneInfoService.getAttendant(assignedAttID)
                .then((data) => {
                    var selAtt = data.data["GetAttendantWithAttendantIDResult"];
                    if (selAtt == null)
                        $q.reject("AttendantID value does not match an attendant.");
                    else if (angular.equals(unassignedAtt["DesignatedLane"], selAtt["DesignatedLane"]))
                        return addLaneService.addNewLane(laneToAdd);
                    else {
                        $window.alert("The attendant selected is already assigned to a lane.");
                        $q.reject("Cannot set an attendant that already has a lane.");
                    }
                })
                .then((data) => {
                    if (data.data["AddNewLaneResult"]) {
                        return addLaneService.setLaneAttendant(laneToAdd.LaneNumber, assignedAttID, tolerance);
                    } else {
                        $window.alert("Failed to add new lane.");
                        $q.reject("Failed to add new lane.");
                    }
                })
                .then((data) => {
                    if (data.data["SetLaneActiveResult"]) {
                        $scope.newLane = defaultLane;
                        $scope.selectedAttID = $scope.attOptions[0];
                        $window.alert("New lane added with set attendant.");
                    } else {
                        $window.alert("ERROR: Failed to set lane active.");
                        $q.reject("Failed to set attendant to new lane.");
                    }
                })
                .catch((reason) => { console.log("WARNING: rejection/error caught. Reason: " + reason); });
        }
    };

    $scope.goToMainPage = function () {
        $window.location.replace("Main Page - Admin.html");
    };
});