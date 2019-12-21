var ngViewQueuesUserApp = angular.module("ViewQueuesUserApp", []);

ngViewQueuesUserApp.factory("viewQueueService", function ($http) {
    var viewQueueFactory = {};
    var httpConfig = {
        dataType: "json",
        contentType: "application/json",
        headers: {
            "authorization": "Basic " + btoa(BASIC_AUTH_USER + ":" + BASIC_AUTH_PASSW),
            "access-control-allow-credentials": true
        }
    };
    viewQueueFactory.getQueuedAcctNumbers = function (laneNumber) {
        return $http.post(
            SERVICE_ENDPOINTURL + "GetListOfQueuedAtLane", JSON.stringify({ "laneNumber": laneNumber }), httpConfig
        );
    };
    viewQueueFactory.getQueuedQueueNumbers = function (laneNumber) {
        return $http.post(
            SERVICE_ENDPOINTURL + "GetListOfQueueNumbersAtLane", JSON.stringify({ "laneNumber": laneNumber }), httpConfig
        );
    };
    viewQueueFactory.getLane = function (laneNumber) {
        return $http.post(
            SERVICE_ENDPOINTURL + "GetLane", JSON.stringify({ "laneNumber": laneNumber }), httpConfig
        );
    };
    viewQueueFactory.getAttendant = function (laneNumber) {
        return $http.post(
            SERVICE_ENDPOINTURL + "GetAttendantAtLane", JSON.stringify({ "laneNumber": laneNumber }), httpConfig
        );
    };
    viewQueueFactory.getUserTickets = function (accountNumber) {
        return $http.post(
            SERVICE_ENDPOINTURL + "GetUserTicketsWithAccountNumber", JSON.stringify({ "accountNumber": accountNumber }), httpConfig
        );
    };
    viewQueueFactory.enqueueUser = function (userID, laneNumber, priority) {
        return $http.post(
            SERVICE_ENDPOINTURL + "EnqueueUserTicket", JSON.stringify({ "userID": userID, "laneNumber": laneNumber, "priorityNumber": priority }), httpConfig
        );
    }

    viewQueueFactory.finishQueueTicket = function (ticketID) {
        return $http.post(
            SERVICE_ENDPOINTURL + "FinishQueueTicket", JSON.stringify({ "queueTicketID": ticketID }), httpConfig
        );
    }

    viewQueueFactory.peek = function (laneNumber) {
        return $http.post(
            SERVICE_ENDPOINTURL + "PeekAtLane", JSON.stringify({ "laneNumber": laneNumber }), httpConfig
        );
    };

    return viewQueueFactory;
});

ngViewQueuesUserApp.controller("queueController", function ($scope, $filter, $window, $q, $timeout, $interval, viewQueueService) {
    $scope.frontQueued = "Looks empty...";
    $scope.queueNotif = 'QUEUE_INFO';
    $scope.lane = { 'LaneName': 'LANE_NAME_UNSET' };
    $scope.attendant = { 'FirstName': 'ATTENDANT_NAME_UNSET', 'MiddleName': '', 'LastName': '' };
    $scope.userTicket = { 'QueueNumber': 'Not Queued' };
    $scope.userInfo = { "Email": "" };
    $scope.userInfo.Email = sessionStorage.getItem("Email");
    $scope.isQueued = false;
    $scope.notifText = "";

    $timeout(() => {
        var laneNumber = sessionStorage.getItem("LaneNumber");
        var acctNumber = sessionStorage.getItem("AccountNumber");
        /*-----------------------------------------------------------------------*/
        viewQueueService.getQueuedQueueNumbers(laneNumber)
            .then((data, status) => {
                $scope.queueList = data.data["GetListOfQueueNumbersAtLaneResult"];
                if (typeof $scope.queueList === "undefined" || $scope.queueList.length == 0)
                    $scope.frontQueued = "Looks empty...";
                else
                    $scope.frontQueued = $scope.queueList[0];
            },
            (status) => { console.log("ERROR: Unable to retrieve queued user information: error code " + status); });
        /*-----------------------------------------------------------------------*/
        viewQueueService.getUserTickets(acctNumber)
            .then((data, status) => {
                var userTicks = data.data["GetUserTicketsWithAccountNumberResult"];
                userTicks = $filter("filter")(userTicks,
                    (item) => {
                        return item.QueueLane.LaneNumber == laneNumber &&
                            item.Status == 0 ||
                            item.Status == 1
                    });
                if (typeof userTicks === "undefined" || userTicks.length == 0) {
                    $scope.userTicket = { "QueueNumber": 'Not Queued' };
                    $scope.queueNotif = "Tap on the button below to queue in.";
                }
                else if ($scope.userTicket.length >= 1) {
                    $scope.userTicket = userTicks[0];
                    $scope.isQueued = true;
                }
            },
            (status) => { console.log("ERROR: Unable to retrieve user ticket information: error code " + status); });
        /*-----------------------------------------------------------------------*/
        viewQueueService.getLane(laneNumber)
            .then((data, status) => {
                $scope.lane = data.data["GetLaneResult"];
            },
            (status) => { console.log("ERROR: Unable to retrieve lane information: error code " + status); });
        /*-----------------------------------------------------------------------*/
        viewQueueService.getAttendant(laneNumber)
            .then((data, status) => {
                $scope.attendant = data.data["GetAttendantAtLaneResult"];
            },
            (status) => { console.log("ERROR: Unable to retrieve attendant information: error code " + status); });
        /*-----------------------------------------------------------------------*/
        viewQueueService.peek(laneNumber)
            .then((data) => {
                var frontTick = data.data["PeekAtLaneResult"];

                if (frontTick != null && frontTick["ownerAccountNumber"] == acctNumber) {
                    if (frontTick["Status"] == 0)
                        $scope.queueNotif = "You are now being served! Please proceed to the attendant.";
                    else if (frontTick["Status"] == 1)
                        $scope.queueNotif = "Get ready! You will be served next.";
                }
            }, (reason) => { console.log("ERROR: Unable to peek at lane " + LaneNumber); });
        /*-----------------------------------------------------------------------*/
    }, 250);

    $interval(() => {
        var laneNumber = sessionStorage.getItem("LaneNumber");
        var acctNumber = sessionStorage.getItem("AccountNumber");
        /*-----------------------------------------------------------------------*/
        viewQueueService.getQueuedQueueNumbers(laneNumber)
            .then((data, status) => {
                var queued = data.data["GetListOfQueueNumbersAtLaneResult"];
                if (!angular.equals($scope.queueList, queued)) {
                    $scope.queueList = queued;
                    if (typeof $scope.queueList === "undefined" || $scope.queueList.length == 0)
                        $scope.frontQueued = "Looks empty...";
                    else
                        $scope.frontQueued = $scope.queueList[0];
                }
            },
            (status) => { console.log("ERROR: Unable to retrieve queued user information: error code " + status); });
        /*-----------------------------------------------------------------------*/
        viewQueueService.getUserTickets(acctNumber)
            .then((data, status) => {
                var userTicks = data.data["GetUserTicketsWithAccountNumberResult"];
                userTicks = $filter("filter")(userTicks,
                    (item) => {
                        return item.QueueLane.LaneNumber == laneNumber &&
                            item.Status == 0 ||
                            item.Status == 1
                    });
                if (typeof userTicks === "undefined" || userTicks.length == 0) {
                    $scope.userTicket = { "QueueNumber": 'Not Queued' };
                    $scope.queueNotif = "Tap on the button below to queue in.";
                    $scope.isQueued = false;
                } else {
                    $scope.userTicket = userTicks[0];
                    $scope.isQueued = true;
                }
            },
            (status) => { console.log("ERROR: Unable to retrieve user ticket information: error code " + status); });
        /*-----------------------------------------------------------------------*/
        viewQueueService.getLane(laneNumber)
            .then((data, status) => {
                var lane = data.data["GetLaneResult"];
                if (!angular.equals(lane, $scope.lane)) {
                    $scope.lane = lane;
                }
            },
            (status) => { console.log("ERROR: Unable to retrieve lane information: error code " + status); });
        /*-----------------------------------------------------------------------*/
        viewQueueService.getAttendant(laneNumber)
            .then((data, status) => {
                var att = data.data["GetAttendantAtLaneResult"];
                if (!angular.equals(att, $scope.attendant))
                    $scope.attendant = att;
            },
            (status) => { console.log("ERROR: Unable to retrieve attendant information: error code " + status); });
        /*-----------------------------------------------------------------------*/
        viewQueueService.peek(laneNumber)
            .then((data) => {
                var frontTick = data.data["PeekAtLaneResult"];

                if (frontTick != null && frontTick["ownerAccountNumber"] == acctNumber) {
                    if (frontTick["Status"] == 0)
                        $scope.queueNotif = "You are now being served! Please proceed to the attendant.";
                    else if (frontTick["Status"] == 1)
                        $scope.queueNotif = "Get ready! You will be served next.";
                }
            }, (reason) => { console.log("ERROR: Unable to peek at lane " + LaneNumber); });
        /*-----------------------------------------------------------------------*/
    }, 500);

    $scope.enqueueUser = function () {
        var accountNumber = sessionStorage.getItem("AccountNumber");
        var userID = sessionStorage.getItem("UserID");
        var laneNumber = sessionStorage.getItem("LaneNumber");
        var priority = 0;
        var userTick = $scope.userTicket;

        if (userTick["QueueNumber"] == "Not Queued") {
            viewQueueService.enqueueUser(userID, laneNumber, priority)
                .then((data, status) => {
                    var success = data.data["EnqueueUserTicketResult"];
                    if (success) {
                        $scope.notifText = "You are now in queue, please wait...";
                        $scope.queueNotif = "Queue in progress...";
                        $scope.isQueued = true;
                    } else {
                        $scope.queueNotif = "Something went wrong.";
                        $scope.notifText = "It seems the system failed to queue you, please contact the administrator.";
                    }
                }, (status) => { console.log("ERROR: unable to enqueue user to lane " + laneNumber); });
        } else {
            $scope.notifText = "You are already queued.";
        }
    };

    $scope.cancelQueue = function () {
        var acctNumber = sessionStorage.getItem("AccountNumber");
        var userTick = $scope.userTicket;

        if (userTick["QueueNumber"] == "Not Queued") {
            $scope.notifText = "You are not queued";
            return;
        }

        viewQueueService.finishQueueTicket(userTick["QueueID"])
            .then((data, status) => {
                if (data.data["FinishQueueTicketResult"]) {
                    $scope.queueNotif = "Tap on the button below to queue in.";
                    $scope.userTicket = { "QueueNumber": 'Not Queued' };
                    $scope.isQueued = false;
                    $scope.notifText = "Cancelled queue!";
                } else {
                    $scope.notifText = "Failed to delete ticket, please contact administrator.";
                }
            },
            (status) => { console.log("ERROR: Unable to finish ticket: error code " + status); });
    };

    $scope.goBackToMainPage = function () {
        $window.location.replace("Main Page - User.html");
    };
});