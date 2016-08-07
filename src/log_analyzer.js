var LogAnalyzer = (function() {

    const __LOG_STORAGE_PATH = 'log_analyzer/logs';
    var pub = {};
    var users = {};

    class User {
        constructor(name) {
            this.name = name;
            this.sessions = [];
        }

        addSession(session) {
            this.sessions.push(session);
        }

        getAllTasks() {
            return this.sessions.reduce((tasks, session) => tasks.concat(session.tasks), []);
        }
        getTasksNamed(taskName) {
            return this.sessions.reduce((tasks, session) => tasks.concat(session.getTasksNamed(taskName)), []);
        }

        // Gets the user for the log, if any.
        static for(logs) {
            var sessionStart = getFirstTask('startSession', logs);
            if (!sessionStart)
                console.error('@ User: startSession is ', sessionStart);
            return sessionStart[1]['user_id'];
        }
    }
    class Session {
        constructor(name, logs) {
            this.name = name;
            this.logs = logs;
            this.tasks = Task.tasksFor(logs);
            console.log(' >>> session ' + name + ' has ' + this.tasks.length + ' tasks.');
        }

        getTasksNamed(taskName) {
            console.log('getting tasks named ' + taskName, this);
            return this.tasks.filter((task) => (task.name === taskName));
        }

        // Gets the session for the log, if any.
        static for(logs) {
            var sessionStart = getFirstTask('startSession', logs);
            if (!sessionStart)
                console.error('@ User: startSession is ', sessionStart);
            return sessionStart[1]['session_id'];
        }
    }

    class StateRepr {
        constructor(str) {
            let exprs = argsForExprString(str);

            // Convert lambda expressions to an invariant representation.
            this.exprs = exprs.map((e) => {
                if (isLambdaExpr(e))
                    return deBruijn(e);
                else
                    return e.replace(/diamond/g, '■').replace(/star/g, '★');
            });
        }
        static areExpressionsEqual(e1, e2) {

            e1 = stripParen(e1);
            e2 = stripParen(e2);
            if (e1 === e2) return true; // true even for lambdas now...

            // Finer equivalence for expressions invariant to order-of-operations.
            if (isComparisonExpr(e1) && isComparisonExpr(e2)) {
                let a1 = argsForExprString(e1);
                let a2 = argsForExprString(e2);
                if (a1[0] === a2[0]) { // if same operation, then check other args...
                    return setCompare(a1.slice(1), a2.slice(1), StateRepr.areExpressionsEqual); // blah, magic
                }
            }

            return false;
        }
        equals(otherExprSet) {

            // Compares the expression arrays like sets,
            // using the expression comparison function above.
            return setCompare(this.exprs, otherExprSet.exprs,
                              StateRepr.areExpressionsEqual);

        }
        toString() {
            let s = '';
            this.exprs.forEach((e) => {
                s += e + ' ';
            });
            return s.trim();
        }
    }

    class StateReprSet {
        constructor() {
            this.states = [];
        }
        get(equivStateRepr) {
            let len = this.states.length;
            for (let i = 0; i < len; i++) {
                if (equivStateRepr.equals(this.states[i]))
                    return this.states[i]; // This state is already in the set.
            }
            return null;
        }
        map(mapfunc) {
            return this.states.map(mapfunc);
        }
        slice() {
            var srs = new StateReprSet();
            srs.states = this.states.slice();
            return srs;
        }
        forEach(fefunc) {
            this.states.forEach(fefunc);
        }
        update(stateRepr) {
            let node = this.get(stateRepr);
            if (node) {
                if (stateRepr.final) node.final = true;
                else if (stateRepr.initial) node.initial = true;
                return node;
            }
            else {
                this.states.push(stateRepr);
                return stateRepr;
            }
        }
        last() {
            return this.states[this.states.length-1];
        }
    }

    class Task {
        constructor(task_logs) {
            this.logs = task_logs;
            this.name = task_logs[0][1]['quest_id'];
        }

        get actions() {
            return this.logs.filter((log) => log[0] === 'action').map((action) => action[1]);
        }

        get initialState() {
            var state = new StateRepr( this.logs.filter((log) => log[0] === 'startTask')[0][1]['quest_detail'] );
            state.initial = true;
            return state;
        }

        // Casts task to reduction state graph.
        getStateGraph() {
            var nodes = new StateReprSet();
            var edges = [];
            var actions = this.actions;
            var prev_node = null;
            var next_edge_detail = null;

            // Add initial state.
            nodes.update(this.initialState);
            prev_node = nodes.last();

            console.log('actions', actions);
            actions.forEach((action) => {
                let name = action['action_id'];
                let data = action['action_detail'];
                let victory = name === 'victory';
                if (victory) {
                    data = JSON.parse(data)['final_state'];
                }
                if (name === 'state-save' || victory) {

                    let state = new StateRepr(data);
                    console.log(' >> state-save', data, state);
                    if (victory) state.final = true;

                    // Add a node for this state (does nothing if node already exists).
                    let node = nodes.update( state );

                    // Make an edge from the previous state to this one.
                    if (prev_node && !prev_node.equals(node)) {
                        let e = {from:prev_node, to:node, reduce:1, undo:0};
                        if (next_edge_detail) {
                            e.reduction = next_edge_detail;
                            next_edge_detail = null;
                        }
                        edges.push(e);
                    }

                    prev_node = node;

                } else if (name === 'state-restore') {

                    let state = new StateRepr(data);

                    // This state should already be a node. Get it.
                    let node = nodes.get(state);
                    if (!node) {
                        console.error('Error @ getStateGraph: Restored state was never reached in the first place!');
                        return;
                    }

                    // Make an edge from the current state (prev_node) to the previous state (node).
                    if (prev_node && !prev_node.equals(node)) {
                        edges.push( {from:prev_node, to:node, reduce:0, undo:1} );
                    }

                    prev_node = node;
                } else if (name.substring(0, 9) === 'reduction') {

                    data = JSON.parse(data);
                    if ('applied' in data)
                        data.before = data.before + ' ' + data.applied;
                    next_edge_detail = data.before + ' → ' + data.after;

                }
            });

            return { nodes:nodes, edges:edges };
        }

        static tasksFor(logs) {
            var tasks = [];
            var len = logs.length;
            var start_idx = -1;
            for (let i = 0; i < len; i++) {
                let log = logs[i];
                if (log[0] === 'startTask')
                    start_idx = i;
                else if (log[0] === 'endTask')
                    tasks.push( new Task(logs.slice(start_idx, i + 1)) );
            }
            tasks.push( new Task(logs.slice(start_idx, logs.length)) );
            return tasks;
        }
    }

    /** USER INTERFACE */
    var userSelElem, sessionSelElem, taskSelElem, createStateGraph;
    pub.setUserSelect = (selectElem) => {
        userSelElem = selectElem;
        userSelElem.onchange = () => {
            refreshSessionList();
            sessionSelElem.selectedIndex = -1;
            refreshTaskVis();
        };
    };
    pub.setSessionSelect = (selectElem) => {
        sessionSelElem = selectElem;
    };
    pub.setTaskSelect = (selectElem) => {
        selectElem.onchange = refreshTaskVis;
        taskSelElem = selectElem;
        removeAllOptions(taskSelElem);
        for (let i = 0; i < 72; i++) {
            var opt = document.createElement("option");
            opt.text = i.toString();
            opt.value = i.toString();
            taskSelElem.add(opt);
        }
    };
    pub.setStateGraphCallback = (cb) => {
        createStateGraph = cb;
    };
    var removeAllOptions = (selectElem) => {
        var opts = selectElem.options;
        for (let i = 0; i < opts.length; i++)
            selectElem.remove(opts[i]);
    };
    var getSelectedOptions = (selectElem) => {
        var opts = selectElem.options;
        var sel_opts = [];
        for (let i = 0; i < opts.length; i++) {
            if (opts[i].selected)
                sel_opts.push(opts[i]);
        }
        return sel_opts;
    };
    var getSelectedUsers = () => {
        var sel_opts = getSelectedOptions(userSelElem);
        return sel_opts.map((opt) => users[opt.text]);
    };
    var getSelectedTask = () => {
        return parseInt(taskSelElem.options[taskSelElem.selectedIndex].value);
    };
    var refreshUserList = () => {
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
    var refreshSessionList = () => {
        removeAllOptions(sessionSelElem);
        var sel_users = getSelectedUsers();
        sel_users.forEach((user) => {
            user.sessions.forEach((session) => {
                var opt = document.createElement("option");
                opt.text = session.name;
                opt.value = session.name;
                sessionSelElem.add(opt);
                console.log('ADDED ', opt);
            });
        });
    };
    var refreshTaskVis = () => {
        var task = getSelectedTask();
        console.log('task ', task);

        if (parseInt(userSelElem.selectedIndex) === -1) return;
        if (parseInt(sessionSelElem.selectedIndex) === -1) { // No sessions selected. Go off user selection.
            var sel_users = getSelectedUsers();

            // Get all data on level taskName that the selected users have played.
            var sel_tasks = sel_users.reduce((tasks, user) => tasks.concat(user.getTasksNamed(task)), []);

            // Convert these tasks into state graphs.
            console.log(sel_tasks);
            var state_graphs = sel_tasks.map((task) => task.getStateGraph());
            console.log(state_graphs);

            // Merge the state graphs.
            // (a) Merge the nodes.
            var all_nodes = new StateReprSet();
            var raw_nodesets = state_graphs.reduce((nodes, graph) => nodes.concat(graph.nodes.slice()), []);
            raw_nodesets.forEach((nodeset) => {
                nodeset.forEach((node) => {
                    all_nodes.update(node); // Add node to merged set.
                });
            });
            // (b) Recalculate the edges with respect to the kept nodes.
            var raw_edges = state_graphs.reduce((edges, graph) => edges.concat(graph.edges.slice()), []);
            console.log(all_nodes.states);
            raw_edges = raw_edges.map((edge) => {
                console.log(edge.from, edge.to);
                let e = { from:all_nodes.get(edge.from),
                         to:all_nodes.get(edge.to),
                         reduce:edge.reduce,
                         undo:edge.undo };
                if (edge.reduction) e.reduction = edge.reduction;
                return e;
            });
            // (c) Merge identical edges.
            console.log('edges:', raw_edges);
            for (let i = 0; i < raw_edges.length-1; i++) {
                let e1 = raw_edges[i];
                for (let j = i + 1; j < raw_edges.length; j++) {
                    let e2 = raw_edges[j];
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
            createStateGraph( all_nodes.map((state) => {
                                    var s = state.toString();
                                    var node = { id:s, label:s, shape:'box' };
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
                                }),
                              raw_edges.map((edge) => {
                                    var e = { from:edge.from.toString(), to:edge.to.toString() };
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
    var getTasks = (taskName, logs) => {
        return logs.filter((log) => {
            return log[0] === taskName;
        });
    };
    var getFirstTask = (taskName, logs) => {
        for (let i = 0; i < logs.length; i++) {
            if (logs[i][0] === taskName) return logs[i]; }
        return null;
    };

    var parseLog = (json) => {
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

        if (new_user)
            refreshSessionList();
    };

    pub.handleFiles = (files) => {

        var numFiles = files.length;
        for (let i = 0; i < numFiles; i++) {
            let file = files[i];
            let filename = file.name;

            let reader = new FileReader();
            reader.onload = (e) => {
                var contents = e.target.result;
                console.log('Read file "' + filename + '"...');
                //console.log( " > " + contents);
                parseLog(contents);
            };

            reader.readAsText(file);
        }
    };

    return pub;
})();
