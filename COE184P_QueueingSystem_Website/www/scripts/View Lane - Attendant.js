var ngViewLaneAttendantApp = angular.module("ViewLaneAttendantApp", ["ViewQueuesUserApp"]);

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

ngViewQueuesUserApp.controller("queueController", function ($scope, $filter, $window, $location, $q, $timeout, $interval, viewLaneAttendantService) {
    $scope.userInfo = { "Email": "USER_PLACEHOLDER_EMAIL" };
    $scope.queueList = {};

    $timeout(() => {
        var laneNumber = sessionStorage.getItem("LaneNumber");
        /*-----------------------------------------------------------------*/
        viewLaneAttendantService.isEmptyQueue(laneNumber)
            .then((data, status) => {
                $scope.isEmptyQueue = data.data["IsEmptyQueueAtLaneResult"];
                
                if (!$scope.isEmptyQueue)
                    return viewLaneAttendantService.getQueuedUserNumbers(laneNumber);
                else {
                    $scope.frontQueued = "Looks empty..."
                    $q.reject("INFO: queue is empty.");
                }
            },
            (reason) => { console.log("queue update chain broken - " + reason); })
            .then((data) => {
                $scope.queueList = data.data["GetListOfQueuedAtLaneResult"];
                $scope.frontQueued = $scope.queueList[0];
            }, (reason) => { console.log("ERROR: failed to get list of queued."); });
        /*-----------------------------------------------------------------*/
        viewLaneAttendantService.peek(laneNumber)
            .then((data, status) => {
                var frontTick = data.data["PeekAtLaneResult"];
                if (frontTick != null) {
                    $scope.isFrontOngoing = frontTick["Status"] == 0;
                    $scope.frontTicket = frontTick;
                }
                else
                    $scope.isFrontOngoing == false;
            },
            (status) => { console.log("ERROR: Unable to retrieve front queue ticket: " + status); });
        /*-----------------------------------------------------------------*/
    }, 250);

    $interval(() => {
        var laneNumber = sessionStorage.getItem("LaneNumber");
        /*-----------------------------------------------------------------*/
        viewLaneAttendantService.isEmptyQueue(laneNumber)
            .then((data, status) => {
                $scope.isEmptyQueue = data.data["IsEmptyQueueAtLaneResult"];

                if (!$scope.isEmptyQueue) {
                    return viewLaneAttendantService.getQueuedUserNumbers(laneNumber);
                } else {
                    $scope.frontQueued = "Looks empty...";
                    $scope.isFrontOngoing = false;
                    $scope.queueList = {};
                    $q.reject("INFO: queue is empty.");
                }
            },
            (reason) => { console.log("queue update chain broken - " + reason); })
            .then((data) => {
                var queueList = data.data["GetListOfQueuedAtLaneResult"];
                var queueFront = queueList[0];

                //reflect changes on the model only if the queue list is different
                if (!angular.equals(queueList, $scope.queueList)) {
                    $scope.queueList = queueList;
                    $scope.frontQueued = queueFront;
                }
            }, (reason) => { console.log("ERROR: failed to get list of queued."); });
        /*-----------------------------------------------------------------*/
        viewLaneAttendantService.peek(laneNumber)
            .then((data, status) => {
                var frontTick = data.data["PeekAtLaneResult"];
                if (frontTick != null) {
                    $scope.isFrontOngoing = frontTick["Status"] == 0;
                    $scope.frontTicket = frontTick;
                }
                else
                    $scope.isFrontOngoing == false;
            },
            (status) => { console.log("ERROR: Unable to retrieve front queue ticket: " + status); });
        /*-----------------------------------------------------------------*/
        viewLaneAttendantService.getLane(laneNumber)
            .then((data, status) => {
                var lane = data.data["GetLaneResult"];
                if (!angular.equals($scope.lane,lane))
                    $scope.lane = lane;
            },
            (status) => { console.log("ERROR: Unable to retrieve lane information: error code " + status); });
        $scope.userInfo.Email = sessionStorage.getItem("Email");
        /*-----------------------------------------------------------------*/
        viewLaneAttendantService.getAttendant(laneNumber)
            .then((data, status) => {
                var att = data.data["GetAttendantAtLaneResult"];
                if (!angular.equals($scope.attendant,att))
                    $scope.attendant = att;
            },
            (status) => { console.log("ERROR: Unable to retrieve attendant information: error code " + status); });
        /*-----------------------------------------------------------------*/
    },
        500);

    $scope.finishCurrentlyServing = function () {

        viewLaneAttendantService.finishQueueTicket($scope.frontTicket["QueueID"])
            .then((data, status) => {
                if (data.data["FinishQueueTicketResult"]) {
                    $window.alert("Dequeued front ticket!");
                    $scope.isFrontOngoing = false;
                }
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