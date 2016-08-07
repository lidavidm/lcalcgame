'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var LogAnalyzer = function () {

    var __LOG_STORAGE_PATH = 'log_analyzer/logs';
    var pub = {};
    var users = {};

    var User = function () {
        function User(name) {
            _classCallCheck(this, User);

            this.name = name;
            this.sessions = [];
        }

        _createClass(User, [{
            key: 'addSession',
            value: function addSession(session) {
                this.sessions.push(session);
            }
        }, {
            key: 'getAllTasks',
            value: function getAllTasks() {
                return this.sessions.reduce(function (tasks, session) {
                    return tasks.concat(session.tasks);
                }, []);
            }
        }, {
            key: 'getTasksNamed',
            value: function getTasksNamed(taskName) {
                return this.sessions.reduce(function (tasks, session) {
                    return tasks.concat(session.getTasksNamed(taskName));
                }, []);
            }

            // Gets the user for the log, if any.

        }], [{
            key: 'for',
            value: function _for(logs) {
                var sessionStart = getFirstTask('startSession', logs);
                if (!sessionStart) console.error('@ User: startSession is ', sessionStart);
                return sessionStart[1]['user_id'];
            }
        }]);

        return User;
    }();

    var Session = function () {
        function Session(name, logs) {
            _classCallCheck(this, Session);

            this.name = name;
            this.logs = logs;
            this.tasks = Task.tasksFor(logs);
            console.log(' >>> session ' + name + ' has ' + this.tasks.length + ' tasks.');
        }

        _createClass(Session, [{
            key: 'getTasksNamed',
            value: function getTasksNamed(taskName) {
                console.log('getting tasks named ' + taskName, this);
                return this.tasks.filter(function (task) {
                    return task.name === taskName;
                });
            }

            // Gets the session for the log, if any.

        }], [{
            key: 'for',
            value: function _for(logs) {
                var sessionStart = getFirstTask('startSession', logs);
                if (!sessionStart) console.error('@ User: startSession is ', sessionStart);
                return sessionStart[1]['session_id'];
            }
        }]);

        return Session;
    }();

    var StateRepr = function () {
        function StateRepr(str) {
            _classCallCheck(this, StateRepr);

            var exprs = argsForExprString(str);

            // Convert lambda expressions to an invariant representation.
            this.exprs = exprs.map(function (e) {
                if (isLambdaExpr(e)) return deBruijn(e);else return e.replace(/diamond/g, '■').replace(/star/g, '★');
            });
        }

        _createClass(StateRepr, [{
            key: 'equals',
            value: function equals(otherExprSet) {

                // Compares the expression arrays like sets,
                // using the expression comparison function above.
                return setCompare(this.exprs, otherExprSet.exprs, StateRepr.areExpressionsEqual);
            }
        }, {
            key: 'toString',
            value: function toString() {
                var s = '';
                this.exprs.forEach(function (e) {
                    s += e + ' ';
                });
                return s.trim();
            }
        }], [{
            key: 'areExpressionsEqual',
            value: function areExpressionsEqual(e1, e2) {

                e1 = stripParen(e1);
                e2 = stripParen(e2);
                if (e1 === e2) return true; // true even for lambdas now...

                // Finer equivalence for expressions invariant to order-of-operations.
                if (isComparisonExpr(e1) && isComparisonExpr(e2)) {
                    var a1 = argsForExprString(e1);
                    var a2 = argsForExprString(e2);
                    if (a1[0] === a2[0]) {
                        // if same operation, then check other args...
                        return setCompare(a1.slice(1), a2.slice(1), StateRepr.areExpressionsEqual); // blah, magic
                    }
                }

                return false;
            }
        }]);

        return StateRepr;
    }();

    var StateReprSet = function () {
        function StateReprSet() {
            _classCallCheck(this, StateReprSet);

            this.states = [];
        }

        _createClass(StateReprSet, [{
            key: 'get',
            value: function get(equivStateRepr) {
                var len = this.states.length;
                for (var i = 0; i < len; i++) {
                    if (equivStateRepr.equals(this.states[i])) return this.states[i]; // This state is already in the set.
                }
                return null;
            }
        }, {
            key: 'map',
            value: function map(mapfunc) {
                return this.states.map(mapfunc);
            }
        }, {
            key: 'slice',
            value: function slice() {
                var srs = new StateReprSet();
                srs.states = this.states.slice();
                return srs;
            }
        }, {
            key: 'forEach',
            value: function forEach(fefunc) {
                this.states.forEach(fefunc);
            }
        }, {
            key: 'update',
            value: function update(stateRepr) {
                var node = this.get(stateRepr);
                if (node) {
                    if (stateRepr.final) node.final = true;else if (stateRepr.initial) node.initial = true;
                    return node;
                } else {
                    this.states.push(stateRepr);
                    return stateRepr;
                }
            }
        }, {
            key: 'last',
            value: function last() {
                return this.states[this.states.length - 1];
            }
        }]);

        return StateReprSet;
    }();

    var Task = function () {
        function Task(task_logs) {
            _classCallCheck(this, Task);

            this.logs = task_logs;
            this.name = task_logs[0][1]['quest_id'];
        }

        _createClass(Task, [{
            key: 'getStateGraph',


            // Casts task to reduction state graph.
            value: function getStateGraph() {
                var nodes = new StateReprSet();
                var edges = [];
                var actions = this.actions;
                var prev_node = null;
                var next_edge_detail = null;

                // Add initial state.
                nodes.update(this.initialState);
                prev_node = nodes.last();

                console.log('actions', actions);
                actions.forEach(function (action) {
                    var name = action['action_id'];
                    var data = action['action_detail'];
                    var victory = name === 'victory';
                    if (victory) {
                        data = JSON.parse(data)['final_state'];
                    }
                    if (name === 'state-save' || victory) {

                        var state = new StateRepr(data);
                        console.log(' >> state-save', data, state);
                        if (victory) state.final = true;

                        // Add a node for this state (does nothing if node already exists).
                        var node = nodes.update(state);

                        // Make an edge from the previous state to this one.
                        if (prev_node && !prev_node.equals(node)) {
                            var e = { from: prev_node, to: node, reduce: 1, undo: 0 };
                            if (next_edge_detail) {
                                e.reduction = next_edge_detail;
                                next_edge_detail = null;
                            }
                            edges.push(e);
                        }

                        prev_node = node;
                    } else if (name === 'state-restore') {

                        var _state = new StateRepr(data);

                        // This state should already be a node. Get it.
                        var _node = nodes.get(_state);
                        if (!_node) {
                            console.error('Error @ getStateGraph: Restored state was never reached in the first place!');
                            return;
                        }

                        // Make an edge from the current state (prev_node) to the previous state (node).
                        if (prev_node && !prev_node.equals(_node)) {
                            edges.push({ from: prev_node, to: _node, reduce: 0, undo: 1 });
                        }

                        prev_node = _node;
                    } else if (name.substring(0, 9) === 'reduction') {

                        data = JSON.parse(data);
                        if ('applied' in data) data.before = data.before + ' ' + data.applied;
                        next_edge_detail = data.before + ' → ' + data.after;
                    }
                });

                return { nodes: nodes, edges: edges };
            }
        }, {
            key: 'actions',
            get: function get() {
                return this.logs.filter(function (log) {
                    return log[0] === 'action';
                }).map(function (action) {
                    return action[1];
                });
            }
        }, {
            key: 'initialState',
            get: function get() {
                var state = new StateRepr(this.logs.filter(function (log) {
                    return log[0] === 'startTask';
                })[0][1]['quest_detail']);
                state.initial = true;
                return state;
            }
        }], [{
            key: 'tasksFor',
            value: function tasksFor(logs) {
                var tasks = [];
                var len = logs.length;
                var start_idx = -1;
                for (var i = 0; i < len; i++) {
                    var log = logs[i];
                    if (log[0] === 'startTask') start_idx = i;else if (log[0] === 'endTask') tasks.push(new Task(logs.slice(start_idx, i + 1)));
                }
                tasks.push(new Task(logs.slice(start_idx, logs.length)));
                return tasks;
            }
        }]);

        return Task;
    }();

    /** USER INTERFACE */


    var userSelElem, sessionSelElem, taskSelElem, createStateGraph;
    pub.setUserSelect = function (selectElem) {
        userSelElem = selectElem;
        userSelElem.onchange = function () {
            refreshSessionList();
            sessionSelElem.selectedIndex = -1;
            refreshTaskVis();
        };
    };
    pub.setSessionSelect = function (selectElem) {
        sessionSelElem = selectElem;
    };
    pub.setTaskSelect = function (selectElem) {
        selectElem.onchange = refreshTaskVis;
        taskSelElem = selectElem;
        removeAllOptions(taskSelElem);
        for (var i = 0; i < 72; i++) {
            var opt = document.createElement("option");
            opt.text = i.toString();
            opt.value = i.toString();
            taskSelElem.add(opt);
        }
    };
    pub.setStateGraphCallback = function (cb) {
        createStateGraph = cb;
    };
    var removeAllOptions = function removeAllOptions(selectElem) {
        var opts = selectElem.options;
        for (var i = 0; i < opts.length; i++) {
            selectElem.remove(opts[i]);
        }
    };
    var getSelectedOptions = function getSelectedOptions(selectElem) {
        var opts = selectElem.options;
        var sel_opts = [];
        for (var i = 0; i < opts.length; i++) {
            if (opts[i].selected) sel_opts.push(opts[i]);
        }
        return sel_opts;
    };
    var getSelectedUsers = function getSelectedUsers() {
        var sel_opts = getSelectedOptions(userSelElem);
        return sel_opts.map(function (opt) {
            return users[opt.text];
        });
    };
    var getSelectedTask = function getSelectedTask() {
        return parseInt(taskSelElem.options[taskSelElem.selectedIndex].value);
    };
    var refreshUserList = function refreshUserList() {
        removeAllOptions(userSelElem);
        for (var user in users) {
            if (users.hasOwnProperty(user)) {
                var opt = document.createElement("option");
                opt.text = user;
                opt.value = user;
                userSelElem.add(opt);
            }
        }
    };
    var refreshSessionList = function refreshSessionList() {
        removeAllOptions(sessionSelElem);
        var sel_users = getSelectedUsers();
        sel_users.forEach(function (user) {
            user.sessions.forEach(function (session) {
                var opt = document.createElement("option");
                opt.text = session.name;
                opt.value = session.name;
                sessionSelElem.add(opt);
                console.log('ADDED ', opt);
            });
        });
    };
    var refreshTaskVis = function refreshTaskVis() {
        var task = getSelectedTask();
        console.log('task ', task);

        if (parseInt(userSelElem.selectedIndex) === -1) return;
        if (parseInt(sessionSelElem.selectedIndex) === -1) {
            // No sessions selected. Go off user selection.
            var sel_users = getSelectedUsers();

            // Get all data on level taskName that the selected users have played.
            var sel_tasks = sel_users.reduce(function (tasks, user) {
                return tasks.concat(user.getTasksNamed(task));
            }, []);

            // Convert these tasks into state graphs.
            console.log(sel_tasks);
            var state_graphs = sel_tasks.map(function (task) {
                return task.getStateGraph();
            });
            console.log(state_graphs);

            // Merge the state graphs.
            // (a) Merge the nodes.
            var all_nodes = new StateReprSet();
            var raw_nodesets = state_graphs.reduce(function (nodes, graph) {
                return nodes.concat(graph.nodes.slice());
            }, []);
            raw_nodesets.forEach(function (nodeset) {
                nodeset.forEach(function (node) {
                    all_nodes.update(node); // Add node to merged set.
                });
            });
            // (b) Recalculate the edges with respect to the kept nodes.
            var raw_edges = state_graphs.reduce(function (edges, graph) {
                return edges.concat(graph.edges.slice());
            }, []);
            console.log(all_nodes.states);
            raw_edges = raw_edges.map(function (edge) {
                console.log(edge.from, edge.to);
                var e = { from: all_nodes.get(edge.from),
                    to: all_nodes.get(edge.to),
                    reduce: edge.reduce,
                    undo: edge.undo };
                if (edge.reduction) e.reduction = edge.reduction;
                return e;
            });
            // (c) Merge identical edges.
            console.log('edges:', raw_edges);
            for (var i = 0; i < raw_edges.length - 1; i++) {
                var e1 = raw_edges[i];
                for (var j = i + 1; j < raw_edges.length; j++) {
                    var e2 = raw_edges[j];
                    if (e1.from.equals(e2.from) && e1.to.equals(e2.to)) {

                        // Edges are equal. Merge and remove.
                        e1.reduce += e2.reduce;
                        e1.undo += e2.undo; // tally any properties...
                        raw_edges.splice(j, 1);
                        j--;
                    }
                }
            }

            // Edges and nodes should now be unique.
            // Merge back into a single state graph + display with vis.js.
            createStateGraph(all_nodes.map(function (state) {
                var s = state.toString();
                var node = { id: s, label: s, shape: 'box' };
                if (state.initial) {
                    node.color = {
                        background: 'LightGreen',
                        border: 'green',
                        highlight: {
                            background: 'Aquamarine',
                            border: 'LightSeaGreen'
                        }
                    };
                } else if (state.final) {
                    node.color = {
                        background: 'Gold',
                        border: 'Orange',
                        highlight: {
                            background: 'Yellow',
                            border: 'OrangeRed'
                        }
                    };
                }
                return node;
            }), raw_edges.map(function (edge) {
                var e = { from: edge.from.toString(), to: edge.to.toString() };
                if (edge.undo > 0) e.color = 'red';
                // if (edge.reduction) e.label = edge.reduction;
                return e;
            }));
            //label:('reduce:' + edge.reduce + '\nundo:' + edge.undo) }) ));
        } else {
                // ... TBI ...
                console.error('Not yet implemented.');
            }
    };

    /** DATA */
    var getTasks = function getTasks(taskName, logs) {
        return logs.filter(function (log) {
            return log[0] === taskName;
        });
    };
    var getFirstTask = function getFirstTask(taskName, logs) {
        for (var i = 0; i < logs.length; i++) {
            if (logs[i][0] === taskName) return logs[i];
        }
        return null;
    };

    var parseLog = function parseLog(json) {
        var logs = JSON.parse(json);
        var username = User.for(logs);
        var sessionID = Session.for(logs);
        var new_user = false;

        if (!(username in users)) {
            console.log(' > Added user ' + username + '.');
            users[username] = new User(username);
            refreshUserList();
            new_user = true;
        }

        console.log(' > For user: ' + username + '\n >> added session ' + sessionID + '.');
        users[username].addSession(new Session(sessionID, logs));

        if (new_user) refreshSessionList();
    };

    pub.handleFiles = function (files) {

        var numFiles = files.length;

        var _loop = function _loop(i) {
            var file = files[i];
            var filename = file.name;

            var reader = new FileReader();
            reader.onload = function (e) {
                var contents = e.target.result;
                console.log('Read file "' + filename + '"...');
                //console.log( " > " + contents);
                parseLog(contents);
            };

            reader.readAsText(file);
        };

        for (var i = 0; i < numFiles; i++) {
            _loop(i);
        }
    };

    return pub;
}();