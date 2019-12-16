﻿var ngViewLaneAttendantApp = angular.module("ViewLaneAttendantApp", ["ViewQueuesUserApp"]);

ngViewLaneAttendantApp.factory("viewLaneAttendantService", function ($http, viewQueueService) {
    var viewLaneAttendantFactory = viewQueueService;
    var httpConfig = {
        dataType: "json",
        contentType: "application/json",
        headers: {
                "authorization": "Basic " + btoa(BASIC_AUTH_USER + ":" + BASIC_AUTH_PASSW),
                "access-control-allow-credentials": true
        }
    };

    viewLaneAttendantFactory.dequeue = function (laneNumber) {
        return $http.post(
            SERVICE_ENDPOINTURL + "DequeueAtLane", JSON.stringify({"laneNumber":laneNumber}),httpConfig
        );
    };

    viewLaneAttendantFactory.peek = function (laneNumber) {
        return $http.post(
            SERVICE_ENDPOINTURL + "PeekAtLane", JSON.stringify({"laneNumber":laneNumber}),httpConfig
        );
    };

    viewLaneAttendantFactory.isEmptyQueue = function (laneNumber) {
        return $http.post(
            SERVICE_ENDPOINTURL + "IsEmptyQueueAtLane", JSON.stringify({"laneNumber":laneNumber}),httpConfig
        );
    };

    viewLaneAttendantFactory.finishQueueTicket = function (ticketID) {
        return $http.post(
            SERVICE_ENDPOINTURL + "FinishQueueTicket", JSON.stringify({"queueTicketID":ticketID}),httpConfig
        );
    }

    return viewLaneAttendantFactory;
});

ngViewQueuesUserApp.controller("queueController", function ($scope, $filter, $window, $location, viewLaneAttendantService) {
    $scope.userInfo = { "Email": "USER_PLACEHOLDER_EMAIL" };

    setInterval(() => {
        $scope.$apply(() => {
            viewLaneAttendantService.getQueuedUserNumbers(sessionStorage.getItem("LaneNumber"))
                .then((data, status) => {
                    $scope.queueList = data.data["GetListOfQueuedAtLaneResult"];
                    if (typeof $scope.queueList === "undefined" || $scope.queueList.length == 0) {
                        $scope.frontQueued = "Looks empty..."
                    }
                    else {
                        $scope.frontQueued = $scope.queueList[0];
                    }
                },
                (status) => { console.log("ERROR: Unable to retrieve queued user information: error code " + status); });

            viewLaneAttendantService.isEmptyQueue(sessionStorage.getItem("LaneNumber"))
                .then((data, status) => {
                    $scope.isEmptyQueue = data.data["IsEmptyQueueAtLaneResult"];
                },
                (status) => { console.log("ERROR: Unable to retrieve queue empty status: error code " + status); });

            viewLaneAttendantService.peek(sessionStorage.getItem("LaneNumber"))
                .then((data, status) => {
                    var frontTick = data.data["PeekAtLaneResult"];
                    if (frontTick != null) {
                        $scope.isFrontOngoing = frontTick["Status"] == 0;
                        $scope.frontTicket = frontTick;
                    }
                    else
                        $scope.isFrontOngoing == false;
                },
                (status) => { console.log("ERROR: Unable to retrieve front queue ticket: error code " + status); });
        })
    },
        500);
    setInterval(() => {
        $scope.$apply(() => {
            viewLaneAttendantService.getLane(sessionStorage.getItem("LaneNumber"))
                .then((data, status) => {
                    $scope.lane = data.data["GetLaneResult"];
                },
                (status) => { console.log("ERROR: Unable to retrieve lane information: error code " + status); });
            $scope.userInfo.Email = sessionStorage.getItem("Email");

            viewLaneAttendantService.getAttendant(sessionStorage.getItem("LaneNumber"))
                .then((data, status) => {
                    $scope.attendant = data.data["GetAttendantAtLaneResult"];
                },
                (status) => { console.log("ERROR: Unable to retrieve attendant information: error code " + status); });
        })
    },
        500);

    $scope.finishCurrentlyServing = function () {

        viewLaneAttendantService.finishQueueTicket($scope.frontTicket["QueueID"])
            .then((data, status) => {
                if (data.data["FinishQueueTicketResult"])
                    $window.alert("Dequeued front ticket!");
                else
                    $window.alert("Failed to delete ticket, please contact administrator.");
            },
            (status) => { console.log("ERROR: Unable to finish ticket: error code " + status); });
    };

    $scope.getNextServing = function () {
        viewLaneAttendantService.dequeue(sessionStorage.getItem("LaneNumber"))
            .then((data, status) => {
                var frontTick = data.data["DequeueAtLaneResult"];

                if (typeof frontTick != null)
                    $window.alert("Next queue set.");
                else
                    $window.alert("Failed to set next queue, please contact administrator.");
            },
            (status) => { console.log("ERROR: Unable to dequeue: error code " + status); });
    };

    $scope.goBackToMainPage = function () {
        $window.location.replace("Main Page - Attendant.html");
    };
});