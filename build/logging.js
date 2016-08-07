'use strict';

var Logger = function () {

    var __GAME_ID = 7017017;
    var __GDIAC_BASEURL = 'http://gdiac.cs.cornell.edu/cs6360/spring2016/';
    var __PAGE_LOAD_URL = __GDIAC_BASEURL + 'page_load.php';
    var __TASK_BEGIN_URL = __GDIAC_BASEURL + 'player_quest.php';
    var __TASK_END_URL = __GDIAC_BASEURL + 'player_quest_end.php';
    var __RECORD_ACTION_URL = __GDIAC_BASEURL + 'player_action.php';

    var pub = {};

    /** Thanks to aroth @ SO:
        http://stackoverflow.com/a/6566471 */
    var SERIALIZE = function SERIALIZE(paramobj) {
        var str = "";
        for (var key in paramobj) {
            if (str != "") str += "&";
            str += key + "=" + encodeURIComponent(paramobj[key]);
        }
        return str;
    };
    var HTTP_GET = function HTTP_GET(url, paramobj, onSuccess, onError) {
        var req = new XMLHttpRequest();
        req.onreadystatechange = function () {
            if (req.readyState == 4 && req.status == 200) cb(req.responseText);else console.error('@ HTTP_GET: Response status: ' + req.status);
        };
        req.open("GET", url + '?' + SERIALIZE(paramobj), true); // true for asynchronous
        req.send(null);
    };
    var BASE_PARAMS = function BASE_PARAMS() {
        return { 'game_id': __GAME_ID, 'client_timestamp': Date.now() };
    };

    var tryToGetFromCookie = function tryToGetFromCookie(cookieName) {};
    pub.getUserIDandSession = function () {

        return new Promise(function (resolve, reject) {
            var userID = tryToGetfromCookie('user_id');
            var params = BASE_PARAMS;
            if (userID) params['user_id'] = userID;
            HTTP_GET(__PAGE_LOAD_URL, params, function (response) {
                var json = JSON.parse(response);
                var sessionID = json['session_id'];
                if (!userID) {
                    userID = json['user_id'];
                    storeCookie('user_id', userID);
                }
                resolve({ 'user_id': userID, 'session_id': sessionID });
            }, reject);
        });
    };

    pub.log = function () {};

    return pub;
}();