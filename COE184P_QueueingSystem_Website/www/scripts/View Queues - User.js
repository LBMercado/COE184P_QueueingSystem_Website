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
    viewQueueFactory.getQueuedUserNumbers = function (laneNumber) {
        return $http.post(
            SERVICE_ENDPOINTURL + "GetListOfQueuedAtLane", JSON.stringify({"laneNumber":laneNumber}),httpConfig
        );
    };
    viewQueueFactory.getLane = function (laneNumber) {
        return $http.post(
            SERVICE_ENDPOINTURL + "GetLane", JSON.stringify({"laneNumber":laneNumber}),httpConfig
        );
    };
    viewQueueFactory.getAttendant = function (laneNumber) {
        return $http.post(
            SERVICE_ENDPOINTURL + "GetAttendantAtLane", JSON.stringify({"laneNumber":laneNumber}),httpConfig
        );
    };
    viewQueueFactory.getUserTickets = function (accountNumber) {
        return $http.post(
            SERVICE_ENDPOINTURL + "GetUserTicketsWithAccountNumber", JSON.stringify({"accountNumber":accountNumber}),httpConfig
        );
    };
    viewQueueFactory.enqueueUser = function (userID, laneNumber, priority) {
        return $http.post(
            SERVICE_ENDPOINTURL + "EnqueueUserTicket", JSON.stringify({"userID":userID, "laneNumber":laneNumber, "priorityNumber":priority}),httpConfig
        );
    }
    return viewQueueFactory;
});

ngViewQueuesUserApp.controller("queueController", function ($scope, $filter, $window, viewQueueService) {
    setInterval(() => {
        $scope.$apply(() => {
            viewQueueService.getQueuedUserNumbers(sessionStorage.getItem("LaneNumber"))
                .then((data, status) => {
                    $scope.queueList = data.data["GetListOfQueuedAtLaneResult"];
                    if (typeof $scope.queueList === "undefined" || $scope.queueList.length == 0) {
                        $scope.frontQueued = "Looks empty..."
                    }
                    else {
                        $scope.frontQueued = $scope.queueList[0];
                        if ($scope.frontQueued == sessionStorage.getItem("AccountNumber")) {
                            $scope.queueNotif = "Get ready! You will be served next.";
                        } else {
                            $scope.queueNotif = "Queue in progress...";
                        }
                    }
                },
                (status) => { console.log("ERROR: Unable to retrieve queued user information: error code " + status); });
        })
    },
        500);

    setInterval(() => {
        $scope.$apply(() => {
            viewQueueService.getUserTickets(sessionStorage.getItem("AccountNumber"))
                .then((data, status) => {
                    $scope.userTicket = $filter("filter")(data.data["GetUserTicketsWithAccountNumberResult"],
                        (item) => { return item.QueueLane.LaneNumber == sessionStorage.getItem("LaneNumber")&&
                            item.Status == 0 ||
                            item.Status == 1
                        });
                    if (typeof $scope.userTicket === "undefined" || $scope.userTicket.length == 0) {
                        $scope.userTicket = { "QueueNumber": 'Not Queued' };
                        $scope.queueNotif = "Click the button below to queue to this lane.";
                    }
                    else if ($scope.userTicket.length >= 1)
                        $scope.userTicket = $scope.userTicket[0];
                },
                (status) => { console.log("ERROR: Unable to retrieve user ticket information: error code " + status); });
        })
    },
        500);

    setInterval(() => {
        $scope.$apply(() => {
            viewQueueService.getLane(sessionStorage.getItem("LaneNumber"))
                .then((data, status) => {
                    $scope.lane = data.data["GetLaneResult"];
                },
                (status) => { console.log("ERROR: Unable to retrieve lane information: error code " + status); });
            $scope.userInfo.Email = sessionStorage.getItem("Email");
        })
    },
        500);

    setInterval(() => {
        $scope.$apply(() => {
            viewQueueService.getAttendant(sessionStorage.getItem("LaneNumber"))
                .then((data, status) => {
                    $scope.attendant = data.data["GetAttendantAtLaneResult"];
                },
                (status) => { console.log("ERROR: Unable to retrieve attendant information: error code " + status); });
        })
    },
        500);

    
    $scope.enqueueUser = function () {
        var accountNumber = sessionStorage.getItem("AccountNumber");
        var userID = sessionStorage.getItem("UserID");
        var laneNumber = sessionStorage.getItem("LaneNumber");
        var priority = 0;

        viewQueueService.getUserTickets(accountNumber)
                .then((data, status) => {
                    $scope.userTicket = $filter("filter")(data.data["GetUserTicketsWithAccountNumberResult"],
                        (item) => { return item.QueueLane.LaneNumber == laneNumber &&
                            item.Status == 0 ||
                            item.Status == 1
                        });
                    if (typeof $scope.userTicket === "undefined" || $scope.userTicket.length == 0) {
                        viewQueueService.enqueueUser(userID, laneNumber, priority).then(
                            (data, status) => {
                                data.data["EnqueueUserTicketResult"] == true ?  
                                    $scope.queueNotif = "You are now in queue, please wait..."
                                    : $scope.queueNotif = "It seems the system failed to queue you, please contact the administrator.";
                            },
                            (status) => { });
                    }
                    else {
                        $scope.queueNotif = "You are already queued.";
                    }
                },
                (status) => { console.log("ERROR: Unable to retrieve user ticket information: error code " + status); });
    };

    $scope.goBackToMainPage = function () {
        $window.location.replace("Main Page - User.html");
    };
});