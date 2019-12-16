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
    
    addLaneFactory.setLaneAttendant = function (laneNumber, attID) {
        return $http.post(
            SERVICE_ENDPOINTURL + "SetLaneActive",
            JSON.stringify({
                "laneNumber":laneNumber,
                "attendantID": attID
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

ngAddLaneApp.controller("userInfoController", function ($scope) {
    $scope.userInfo = {};
    $scope.userInfo["Email"] = 'USER_PLACEHOLDER_EMAIL';

    setInterval(() => {
        $scope.$apply(() => {
            $scope.userInfo["Email"] = sessionStorage.getItem("Email");
        });
    }, 500);
});

ngAddLaneApp.controller("laneInfoController", function ($scope, $window, $q, laneInfoService, addLaneService) {
    var resetAssignedAtt = function () {
        $scope.assignedAtt = {
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
    };

    $scope.newLane = {
        "LaneName": "",
        "Capacity":10
    };

    resetAssignedAtt();
    
    addLaneService.getLaneCount().then(
        (data) => {
            $scope.nextLaneNumber = data.data["GetLaneCountResult"] + 1;
        }
    );

    $scope.attOptions = ['No Attendant'];
    $scope.selectedAttID = $scope.attOptions[0];

    setInterval(() => {
        $scope.$apply(() => {

            var selectedAtt = $scope.selectedAttID;
            if (!selectedAtt || selectedAtt == 'Attendant ID' || selectedAtt.length != 12) {
                resetAssignedAtt();
            }
            /*-------------------------------------------------*/
            laneInfoService.getAttendants()
                .then((data, status) => {
                    var attList = data.data["GetListOfAttendantsResult"];
                    if (!attList.length)
                        console.log("No attendants available.");
                    else {
                        $scope.availAttendants = attList;
                        $scope.attOptions = ['No Attendant'];
                        angular.forEach(attList, function (val, key) {
                            $scope.attOptions.push(val["QueueAttendantID"]);
                        });
                    }
                }, (status) => { console.log("ERROR: failed to retrieve list of attendants."); });
            /*-------------------------------------------------*/
            laneInfoService.getAttendant(selectedAtt)
                .then((data, status) => {
                    if (data.data["GetAttendantWithAttendantIDResult"] != null)
                        $scope.assignedAtt = data.data["GetAttendantWithAttendantIDResult"];
                    else
                        resetAssignedAtt();
                }, (status) => { console.log("ERROR: Unable to retrieve attendant info."); });
        });
    }, 500);

    $scope.addNewLane = function (newLane, assignedAttID) {
        var isAssignedAtt = true;
        if (!newLane.LaneName){
            $window.alert("A name is required for the lane.");
            return;
        }
        if (assignedAttID == 'No Attendant' || assignedAttID.length != 12)
            isAssignedAtt = false;
        addLaneService.addNewLane(newLane)
            .then((data) => {
                if (data.data["AddNewLaneResult"]) {
                    $scope.nextLaneNumber++;
                    $scope.newLane.LaneName = "";
                    $scope.selectedAttID = $scope.attOptions[0];
                    if (isAssignedAtt)
                        return addLaneService.setLaneAttendant($scope.nextLaneNumber - 1, assignedAttID);
                    else {
                        $window.alert("New lane added with unset attendant.");
                        $q.reject('Lane attendant is not set.');
                    }
                }
            })
            .then((data) => {
                if (data.data["SetAttendantAtLaneResult"])
                    $window.alert("New lane added with set attendant.");
                else
                    $.reject("failed to set lane attendant");
            })
            .catch((reason) => { console.log("WARNING: rejection/error caught. Reason: " + reason); });
    };

    $scope.goToMainPage = function () {
        $window.location.replace("Main Page - Admin.html");
    };
});