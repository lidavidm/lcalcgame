var Logger = (function() {

    const __GAME_ID = 7017017;
    const __VERSION_ID = 0.2;
    const __OFFLINE_NAME_PROMPT = false;
    const __GDIAC_BASEURL = 'http://gdiac.cs.cornell.edu/cs6360/spring2016/';
    const __PAGE_LOAD_URL = __GDIAC_BASEURL + 'page_load.php';
    const __TASK_BEGIN_URL = __GDIAC_BASEURL + 'player_quest.php';
    const __TASK_END_URL = __GDIAC_BASEURL + 'player_quest_end.php';
    const __RECORD_ACTION_URL = __GDIAC_BASEURL + 'player_action.php';

    var pub = {};
    var currentUserID = null;
    var currentSessionID = null;
    var taskSequenceID = 0;
    var currentTaskID = null;
    var dynamicTaskID = null;

    // Static logging. (as backup)
    var isOfflineSession = false;
    var static_log = [];
    var logStatic = (funcname, data, uploaded) => {
        if (!uploaded) data['error_message'] = 'This log failed to upload to the server.';
        static_log.push( [funcname, data] );
        //console.log('Log static: ', funcname, data);
    };

    /** Thanks to aroth @ SO:
        http://stackoverflow.com/a/6566471 */
    var SERIALIZE = (paramobj) => {
        var str = "";
        for (var key in paramobj) {
            if (str != "") str += "&";
            str += key + "=" + encodeURIComponent(paramobj[key]); }
        return str;
    };
    var HTTP_GET = (url, paramobj, onSuccess, onFail) => {
        if (isOfflineSession) {
            onFail(); // Fail immediately if session is offline.
            return;
        }
        var req = new XMLHttpRequest();
        req.onreadystatechange = function() {
            if (req.readyState == 4 && req.status == 200) onSuccess(req.responseText);
            else if (req.readyState == 4) {
                console.error('@ HTTP_GET: Response status: ' + req.status);
                onFail();
            }
        }
        req.open("GET", url + '?' + SERIALIZE(paramobj), true); // true for asynchronous
        req.send(null);
    };
    var BASE_PARAMS = () => {
        return { 'game_id':__GAME_ID, 'client_timestamp':Date.now() };
    };
    var SESSION_BASE_PARAMS = () => {
        var o = BASE_PARAMS();
        o['version_id'] = __VERSION_ID;
        o['user_id'] = currentUserID;
        o['session_id'] = currentSessionID;
        return o;
    };
    var ACTION_BASE_PARAMS = () => {
        var o = SESSION_BASE_PARAMS();
        o['quest_id'] = currentTaskID;
        o['session_seq_id'] = taskSequenceID;
        o['dynamic_quest_id'] = dynamicTaskID;
        return o;
    };

    var getFromCookie = (cookieName) => {
        let cval = getCookie(cookieName);
        if (!cval || cval.trim().length === 0) return null;
        else                                   return cval;
    };
    var storeCookie = (cname, cval) => {
        setCookie(cname, cval);
    };
    var sessionBegan = () => {
        return currentUserID !== null && currentSessionID !== null;
    };
    pub.sessionBegan = sessionBegan;
    pub.startSession = () => {
        return new Promise(function(resolve, reject) {

            var userID = getFromCookie('user_id');
            var params = BASE_PARAMS();
            if (userID) params['user_id'] = userID;

            // Get session ID from GET request:
            // * (also generates user ID if necessary)
            HTTP_GET(__PAGE_LOAD_URL, params, (response) => {
                var json = JSON.parse(response);
                var sessionID = json['session_id'];
                if (!userID) {
                    userID = json['user_id'];
                    storeCookie('user_id', userID);
                }
                currentUserID = userID;
                currentSessionID = sessionID;
                console.log('@ Logger: Began session with UN ' + userID + ' and SID ' + sessionID + '.');
                logStatic( 'startSession', json, true );
                resolve( {'user_id':userID, 'session_id':sessionID} );
            }, () => {
                // Rejected response. Create dummy ID and session ID to let user play game.
                if (__OFFLINE_NAME_PROMPT)
                    currentUserID = window.prompt('Welcome! Please enter your name.', 'unknown');
                else
                    currentUserID = Date.now();
                currentSessionID = Date.now();
                isOfflineSession = true;
                logStatic( 'startSession', {'user_id':currentUserID, 'session_id':currentSessionID, 'message':'static_session'}, false );
                console.warn('Could not start online session. Starting with unlogged UN and SID.');
                resolve( {'user_id':currentUserID, 'session_id':currentSessionID} ); // ugh
            });

        });
    };

    var taskBegan = () => {
        return dynamicTaskID !== null && currentTaskID !== null;
    };
    pub.startTask = (taskID, data=null) => {
        return new Promise(function(resolve, reject) {

            if (!sessionBegan()) {
                console.warn('@ startTask: Warning: Unknown user ID and/or session ID!');
                reject();
            } else if (taskBegan()) {
                console.warn('@ startTask: Warning: Task ' + currentTaskID + ' already running!');
                reject();
            }

            console.log('@ Logger: Started task ' + taskID);

            var params = SESSION_BASE_PARAMS();
            params['quest_id'] = taskID;
            params['session_seq_id'] = taskSequenceID;
            if (data) params['quest_detail'] = data;

            HTTP_GET(__TASK_BEGIN_URL, params, (response) => {
                console.log('LOGGER: posted task ' + taskID + ' with response: ', response);
                var json = JSON.parse(response);
                currentTaskID = taskID;
                dynamicTaskID = json['dynamic_quest_id'];
                params['dynamic_quest_id'] = dynamicTaskID;
                logStatic( 'startTask', params, true );
                resolve();
            }, () => {
                currentTaskID = taskID;
                dynamicTaskID = Date.now(); // for lack of a better idea.
                logStatic( 'startTask', params, false );
                reject('Failed to tell server that task ' + taskID + ' has started.');
            });

        });
    };
    pub.endTask = (taskID) => {
        return new Promise(function(resolve, reject) {

            if (!taskBegan()) {
                console.warn('@ endTask: Warning: No task was begun.');
                reject();
            }

            var params = SESSION_BASE_PARAMS();
            params['quest_id'] = taskID;
            params['session_seq_id'] = taskSequenceID;
            params['dynamic_quest_id'] = dynamicTaskID;

            console.log('@ Logger: Ended task ' + taskID);

            currentTaskID = null;
            dynamicTaskID = null;
            taskSequenceID++;

            HTTP_GET(__TASK_END_URL, params, (response) => {
                logStatic( 'endTask', params, true );
                resolve();
            }, () => {
                logStatic( 'endTask', params, false );
                reject('Failed to tell server that task ' + taskID + ' has ended.');
            });

        });
    };
    pub.transitionToTask = (taskID, data=null) => {
        if (taskBegan()) {
            let startNextTask = () => pub.startTask(taskID, data);
            return pub.endTask(currentTaskID).then(startNextTask, startNextTask); // start next task on both rejection and resolution
        } else {
            return pub.startTask(taskID, data);
        }
    };

    pub.log = (actionID, data) => {
        return pub.recordAction(actionID, data).catch((err) => {
            //console.error('@ Logger.log: ' + err);
        });
    }
    pub.recordAction = (actionID, data) => {
        return new Promise(function(resolve, reject) {

            // For now...
            console.log('@ Logger.log: ', actionID, data);

            if (data && typeof data === 'object')
                data = JSON.stringify(data);

            var params = ACTION_BASE_PARAMS();
            params['action_id'] = actionID;
            if (data) params['action_detail'] = data;

            if (!taskBegan()) {
                logStatic( 'action', params, false );
                reject('No current task.');
                return;
            }

            HTTP_GET(__RECORD_ACTION_URL, params, (response) => {
                console.log('LOGGER: recorded action ' + actionID + ' with response: ', response);
                logStatic( 'action', params, true );
                resolve();
            }, () => {
                logStatic( 'action', params, false );
                reject('Failed to upload action "' + actionID + '" to server.');
            });

        });
    };

    pub.download = () => {

        // create blob of data
        var blob = new Blob([JSON.stringify(static_log, null, 2)], {type: "text/plain;charset=utf-8"});

        // download as txt file json
        saveAs(blob, 'log_' + (new Date().getTime()).toString() + '.json');

    };

    return pub;
})();
