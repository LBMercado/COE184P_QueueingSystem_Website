var ngEditLaneApp = angular.module("EditLaneApp", []);
/*FACTORIES/SERVICES--------------------------------------------------------------------*/
ngEditLaneApp.factory("httpConfigFactory", [function () {
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

ngEditLaneApp.factory("sharedDataFactory", [function () {
    return {
        data: {
            thisLane: null,
            selAttID: "",
            assignedAtt: null,
            availAtts: [],
            notifText: ""
        },
        update_thisLane: function (newLane) {
            this.data.thisLane = newLane;
        },
        update_selAttID: function (newSelAttID) {
            this.data.selAttID = newSelAttID;
        },
        update_assignedAtt: function (newAssignedAtt) {
            this.data.assignedAtt = newAssignedAtt;
        },
        update_availAtts: function (newAvailAtts) {
            this.data.availAtts = newAvailAtts;
        },
        update_notifText: function (text) {
            this.data.notifText = text;
        },
    };
}]);

ngEditLaneApp.factory("laneInfoService", ["httpConfigFactory", "$http", function (httpConfigFactory, $http) {
    var factory = {};
    var httpConfig = httpConfigFactory;

    factory.getLaneServiceName = "GetLane";
    factory.getLane = function (laneNumber) {
        return $http.post(
            SERVICE_ENDPOINTURL + factory.getLaneServiceName, JSON.stringify({ "laneNumber": laneNumber }), httpConfig
        );
    };
    factory.getLaneAttServiceName = "GetAttendantAtLane";
    factory.getLaneAtt = function (laneNumber) {
        return $http.post(
            SERVICE_ENDPOINTURL + factory.getLaneAttServiceName, JSON.stringify({ "laneNumber": laneNumber }), httpConfig
        );
    };

    factory.isLaneActiveServiceName = "IsLaneActive";
    factory.isLaneActive = function (laneNumber) {
        return $http.post(
            SERVICE_ENDPOINTURL + factory.isLaneActiveServiceName,
            JSON.stringify({
                "laneNumber": laneNumber
            }), httpConfig
        );
    };

    return factory;
}]);

ngEditLaneApp.factory("laneEditService", ["httpConfigFactory", "$http", function (httpConfigFactory, $http) {
    var factory = {};
    var httpConfig = httpConfigFactory;

    var convertDateToTimeSpan = function (date) {
        return "PT" + date.getHours() + "H" + date.getMinutes() + "M" + date.getSeconds() + "S";
    };

    factory.editLaneServiceName = "EditLane";
    factory.editLane = function (editedLane) {
        return $http.post(
            SERVICE_ENDPOINTURL + factory.editLaneServiceName, JSON.stringify({ "lane": editedLane }), httpConfig
        );
    };

    factory.setLaneAttendantServiceName = "SetAttendantAtLane";
    factory.setLaneAttendant = function (laneNumber, attID) {
        return $http.post(
            SERVICE_ENDPOINTURL + factory.setLaneAttendantServiceName,
            JSON.stringify({
                "laneNumber": laneNumber,
                "attendantID": attID
            }), httpConfig
        );
    };

    factory.setLaneActiveServiceName = "SetLaneActive";
    factory.setLaneActive = function (laneNumber, attID, tolerance) {
        return $http.post(
            SERVICE_ENDPOINTURL + factory.setLaneActiveServiceName,
            JSON.stringify({
                "laneNumber": laneNumber,
                "attendantID": attID,
                "maxTolerance": convertDateToTimeSpan(tolerance)
            }), httpConfig
        );
    };

    factory.setLaneInactiveServiceName = "SetLaneInactive";
    factory.setLaneInactive = function (laneNumber) {
        return $http.post(
            SERVICE_ENDPOINTURL + factory.setLaneInactiveServiceName,
            JSON.stringify({
                "laneNumber": laneNumber
            }), httpConfig
        );
    };

    return factory;
}]);

ngEditLaneApp.factory("laneQueueService", ["httpConfigFactory", "$http", function (httpConfigFactory, $http) {
    var factory = {};
    var httpConfig = httpConfigFactory;

    factory.getQueuedServiceName = "GetListOfQueuedAtLane";
    factory.getQueued = function (laneNumber) {
        return $http.post(
            SERVICE_ENDPOINTURL + factory.getQueuedServiceName, JSON.stringify({ "laneNumber": laneNumber }), httpConfig
        );
    };

    factory.getQueueNumbersServiceName = "GetListOfQueueNumbersAtLane";
    factory.getQueueNumbers = function (laneNumber) {
        return $http.post(
            SERVICE_ENDPOINTURL + factory.getQueueNumbersServiceName, JSON.stringify({ "laneNumber": laneNumber }), httpConfig
        );
    };

    factory.resetQueueServiceName = "ResetQueueAtLane"
    factory.resetQueue = function (laneNumber) {
        return $http.post(
            SERVICE_ENDPOINTURL + factory.resetQueueServiceName, JSON.stringify({ "laneNumber": laneNumber }), httpConfig
        );
    };

    factory.peekServiceName = "PeekAtLane";
    factory.peek = function (laneNumber) {
        return $http.post(
            SERVICE_ENDPOINTURL + factory.peekServiceName, JSON.stringify({ "laneNumber": laneNumber }), httpConfig
        );
    };

    factory.isEmptyQueueServiceName = "IsEmptyQueueAtLane";
    factory.isEmptyQueue = function (laneNumber) {
        return $http.post(
            SERVICE_ENDPOINTURL + factory.isEmptyQueueServiceName, JSON.stringify({ "laneNumber": laneNumber }), httpConfig
        );
    };

    return factory;
}]);

ngEditLaneApp.factory("attendantInfoService", ["httpConfigFactory", "$http", function (httpConfigFactory, $http) {
    var factory = [];
    var httpConfig = httpConfigFactory;

    factory.getAttendantServiceName = "GetAttendantWithAttendantID";
    factory.getAttendant = function (attID) {
        return $http.post(
            SERVICE_ENDPOINTURL + factory.getAttendantServiceName, JSON.stringify({ "attendantID": attID }), httpConfig
        );
    }

    factory.getAllAttendantsServiceName = "GetListOfAttendants";
    factory.getAllAttendants = function () {
        return $http.post(
            SERVICE_ENDPOINTURL + factory.getAllAttendantsServiceName, {}, httpConfig
        );
    };

    return factory;
}]);
/*FACTORIES/SERVICES--------------------------------------------------------------------*/
/*CONTROLLERS--------------------------------------------------------------------*/
ngEditLaneApp.controller("userInfoController", [function () {
    this.userInfo = {};
    this.userInfo["Email"] = "USER_PLACEHOLDER_EMAIL";

    setInterval(() => {
        this.userInfo.Email = sessionStorage.getItem("Email");
    }, 500);
}]);

ngEditLaneApp.controller("laneEditNameController", ["laneInfoService", "laneEditService", "sharedDataFactory", "$q", "$window", "$scope", "$interval", function (laneInfoService, laneEditService, sharedDataFactory, $q, $window, $scope, $interval) {
    var laneNumber = sessionStorage.getItem("LaneNumber");
    this.notifText = "";
    $scope.sharedDataGet = sharedDataFactory.data;
    $scope.sharedDataSet_thisLane = function (thisLane) { sharedDataFactory.update_thisLane(thisLane); };
    $scope.sharedDataSet_selAttID = function (selAttID) { sharedDataFactory.update_selAttID(selAttID); };
    $scope.sharedDataSet_assignedAtt = function (assignedAtt) { sharedDataFactory.update_assignedAtt(assignedAtt); };
    $scope.sharedDataSet_availAtts = function (availAtts) { sharedDataFactory.update_availAtts(availAtts); };
    $scope.sharedDataSet_notifText = function (text) { sharedDataFactory.update_notifText(text) };

    $scope.sharedDataSet_notifText(this.notifText);
    this.refreshLaneInfo = function () {
        laneInfoService.getLane(laneNumber)
            .then((data) => {
                if (data.data[laneInfoService.getLaneServiceName + "Result"] != null) {
                    this.thisLane = data.data[laneInfoService.getLaneServiceName + "Result"];
                    $scope.sharedDataSet_thisLane(this.thisLane);
                }
                else {
                    $q.reject("Unable to get lane information.");
                }
            })
            .catch((reason) => { console.log("ERROR: " + reason); });
    };

    this.refreshLaneInfo();

    $interval(() => {
        this.notifText = $scope.sharedDataGet.notifText;
    }, 500);

    this.editLaneName = function (editedLane) {
        if (typeof editedLane === "undefined") {
            console.log("ERROR: lane instance is unset, cannot proceed with edit.");
            return;
        }
        if (!editedLane.LaneName) {
            $scope.sharedDataSet_notifText("Lane Name cannot be empty.");
            this.notifText = $scope.sharedDataGet.notifText;
            return;
        }

        laneEditService.editLane(editedLane)
            .then((data) => {
                if (data.data[laneEditService.editLaneServiceName + "Result"]) {
                    $scope.sharedDataSet_notifText("Successfully changed lane name!");
                    this.notifText = $scope.sharedDataGet.notifText;
                    this.refreshLaneInfo();
                }
                else
                    console.log("WARNING: unable to update lane information.");
            })
            .catch((reason) => { console.log("ERROR: " + reason); });
    };
}]);

ngEditLaneApp.controller("laneEditAttController", ["laneInfoService", "attendantInfoService", "laneEditService", "sharedDataFactory", "$scope", "$window", "$q",
    function (laneInfoService, attendantInfoService, laneEditService, sharedDataFactory, $scope, $window, $q) {
        this.attOptions = ["No Attendant"];
        $scope.sharedDataGet = sharedDataFactory.data;
        $scope.sharedDataSet_thisLane = function (thisLane) { sharedDataFactory.update_thisLane(thisLane); };
        $scope.sharedDataSet_selAttID = function (selAttID) { sharedDataFactory.update_selAttID(selAttID); };
        $scope.sharedDataSet_assignedAtt = function (assignedAtt) { sharedDataFactory.update_assignedAtt(assignedAtt); };
        $scope.sharedDataSet_availAtts = function (availAtts) { sharedDataFactory.update_availAtts(availAtts); };
        $scope.sharedDataSet_notifText = function (text) { sharedDataFactory.update_notifText(text) };
        $scope.sharedDataSet_selAttID(this.selAttID);

        var laneNumber = sessionStorage.getItem("LaneNumber");
        this.thisLane = {};
        this.thisLane["LaneNumber"] = laneNumber;

        this.refreshLaneInfo = function () {
            laneInfoService.getLaneAtt(laneNumber)
                .then((data) => {
                    if (data.data[laneInfoService.getLaneAttServiceName + "Result"] != null) {
                        this.assignedAtt = data.data[laneInfoService.getLaneAttServiceName + "Result"];
                        this.selAttID = this.assignedAtt.QueueAttendantID;
                    }
                    else {
                        this.assignedAtt = null;
                        this.selAttID = this.attOptions[0];
                    }
                    $scope.sharedDataSet_assignedAtt(this.assignedAtt);
                    $scope.sharedDataSet_selAttID(this.selAttID);
                })
                .catch((reason) => { console.log("ERROR: " + reason); });
        };

        this.refreshLaneInfo();

        setInterval(() => {
            $scope.$apply(() => {
                var selectedAtt = this.selAttID;
                if (!selectedAtt || selectedAtt == 'Attendant ID' || selectedAtt.length != 12) {
                    this.assignedAtt = null;
                }
                /*-------------------------------------------------*/
                attendantInfoService.getAllAttendants()
                    .then((data, status) => {
                        var attList = data.data[attendantInfoService.getAllAttendantsServiceName + "Result"];
                        if (!attList.length)
                            console.log("No attendants available.");
                        else {
                            this.availAtts = attList;
                            $scope.sharedDataSet_availAtts(this.availAtts);
                            this.attOptions = ['No Attendant'];
                            var attOpts = this.attOptions;
                            angular.forEach(attList, function (val, key) {
                                attOpts.push(val["QueueAttendantID"]);
                            });
                        }
                    }, (status) => { console.log("ERROR: failed to retrieve list of attendants."); });
                /*-------------------------------------------------*/
            });
        }, 500);

        this.editLaneAttendant = function (laneNumber, selectedAttID) {
            var isActive = false;
            var tolerance = new Date();
            tolerance.setHours(23, 59, 59); //~1 day tolerance

            if (typeof laneNumber === "undefined") {
                console.log("ERROR: cannot edit lane attendant - lane number is undefined.");
                return;
            }

            if (selectedAttID == this.attOptions[0]) {
                laneEditService.setLaneInactive(laneNumber)
                    .then((data) => {
                        if (data.data[laneEditService.setLaneInactiveServiceName + "Result"]) {
                            this.refreshLaneInfo();
                            $scope.sharedDataSet_notifText("Successfully unset attendant in lane.");
                        }
                        else {
                            $scope.sharedDataSet_notifText("Lane is already inactive.");
                        }
                    })
                    .catch((reason) => { console.log("ERROR: " + reason) });
            }
            else {
                //check if lane is active
                laneInfoService.isLaneActive(laneNumber)
                    .then((data) => {
                        isActive = data.data[laneInfoService.isLaneActiveServiceName + "Result"];
                        console.log("DEBUG: Lane is active? " + isActive);
                        if (isActive)
                            return laneEditService.setLaneAttendant(laneNumber, selectedAttID);
                        else
                            return laneEditService.setLaneActive(laneNumber, selectedAttID, tolerance);
                    })
                    .then((data) => {
                        var success;
                        if (isActive)
                            success = data.data[laneEditService.setLaneAttendantServiceName + "Result"];
                        else
                            success = data.data[laneEditService.setLaneActiveServiceName + "Result"];

                        if (success) {
                            this.refreshLaneInfo();
                            $scope.sharedDataSet_notifText("Successfully set attendant in lane.");
                        }
                        else
                            console.log("ERROR: Failed to set attendant in lane.");
                    })
                    .catch((reason) => { console.log("ERROR: " + reason) });
            }
        };
    }]);

ngEditLaneApp.controller("assignedAttController", ["sharedDataFactory", "$scope", function (sharedDataFactory, $scope) {
    $scope.sharedDataGet = sharedDataFactory.data;
    $scope.sharedDataSet_thisLane = function (thisLane) { sharedDataFactory.update_thisLane(thisLane); };
    $scope.sharedDataSet_selAttID = function (selAttID) { sharedDataFactory.update_selAttID(selAttID); };
    $scope.sharedDataSet_assignedAtt = function (assignedAtt) { sharedDataFactory.update_assignedAtt(assignedAtt); };
    $scope.sharedDataSet_availAtts = function (availAtts) { sharedDataFactory.update_availAtts(availAtts); };

    setInterval(() => {
        this.assignedAtt = $scope.sharedDataGet.assignedAtt;
    }, 500);
}]);

ngEditLaneApp.controller("queueListController", ["$scope", "laneQueueService", function ($scope, laneQueueService) {
    setInterval(() => {
        $scope.$apply(() => {
            var laneNumber = sessionStorage.getItem("LaneNumber");
            /*---------------------------------------------------------------------------------*/
            laneQueueService.getQueueNumbers(laneNumber)
                .then((data, status) => {
                    this.queueList = data.data[laneQueueService.getQueueNumbersServiceName + "Result"];
                    if (typeof this.queueList === "undefined" || this.queueList.length == 0) {
                        this.frontQueued = "Looks empty..."
                    }
                    else {
                        this.frontQueued = this.queueList[0];
                    }
                },
                (status) => { console.log("ERROR: Unable to retrieve queued user information: error code " + status); });
            /*---------------------------------------------------------------------------------*/
        })
    },
        500);
}]);

ngEditLaneApp.controller("resetQueueController", ["laneQueueService", "$scope", "sharedDataFactory", function (laneQueueService, $scope, sharedDataFactory) {
    $scope.sharedDataGet = sharedDataFactory.data;
    $scope.sharedDataSet_thisLane = function (thisLane) { sharedDataFactory.update_thisLane(thisLane); };
    $scope.sharedDataSet_selAttID = function (selAttID) { sharedDataFactory.update_selAttID(selAttID); };
    $scope.sharedDataSet_assignedAtt = function (assignedAtt) { sharedDataFactory.update_assignedAtt(assignedAtt); };
    $scope.sharedDataSet_availAtts = function (availAtts) { sharedDataFactory.update_availAtts(availAtts); };

    setInterval(() => {
        this.thisLane = $scope.sharedDataGet.thisLane;
    }, 500);

    this.resetQueueForLane = function (laneNumber) {
        if (typeof laneNumber === "undefined") {
            console.log("ERROR: lane number is undefined, cannot proceed with queue reset.");
            return;
        }

        laneQueueService.resetQueue(laneNumber);
    };
}]);

ngEditLaneApp.controller("viewAttController", ["$scope", "sharedDataFactory", function ($scope, sharedDataFactory) {
    $scope.sharedDataGet = sharedDataFactory.data;
    $scope.sharedDataSet_thisLane = function (thisLane) { sharedDataFactory.update_thisLane(thisLane); };
    $scope.sharedDataSet_selAttID = function (selAttID) { sharedDataFactory.update_selAttID(selAttID); };
    $scope.sharedDataSet_assignedAtt = function (assignedAtt) { sharedDataFactory.update_assignedAtt(assignedAtt); };
    $scope.sharedDataSet_availAtts = function (availAtts) { sharedDataFactory.update_availAtts(availAtts); };

    setInterval(() => {
        this.selAttID = $scope.sharedDataGet.selAttID;
        this.availAtts = $scope.sharedDataGet.availAtts;
    }, 500);
}]);

ngEditLaneApp.controller("returnPageController", ['$window', function ($window) {
    this.goToMainPage = function () {
        $window.location.replace("Main Page - Admin.html");
    };
}]);
/*CONTROLLERS--------------------------------------------------------------------*/