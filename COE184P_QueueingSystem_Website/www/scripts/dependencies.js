const SERVERNAME = "localhost";
const WEBSITENAME = "COE184P_QueueingSystem";
const WCFNAME = "QueueSystemService.svc"
const SERVICE_ENDPOINTURL = "http://" + SERVERNAME + "/" + WEBSITENAME + "/" + WCFNAME + "/";
const BASIC_AUTH_USER = "Local-User", BASIC_AUTH_PASSW = "Kubl3IKhun";
const AUTH_HEADER = "Basic " + btoa(BASIC_AUTH_USER + ":" + BASIC_AUTH_PASSW);