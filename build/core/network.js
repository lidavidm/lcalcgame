'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var mag = function (_) {
    var Network = function () {
        function Network() {
            _classCallCheck(this, Network);

            // Objects, each with 'id' and 'data' elements.
            this.nodes = [];

            // Objects with 'from' and 'to' as node ids,
            // and an optional 'data' tag explaining the transition (e.g. reductions).
            this.edges = [];

            // The last state 'pushed' onto the network graph.
            this.lastNodeId = null;

            // The next available node id. (they must all be unique)
            this.unusedNodeId = 0;

            // For internal ordering purposes.
            // (e.g. to trace the player's moves precisely)
            this.unusedEdgeId = 0;
            this.lastEdgeId = 0;

            this.startTS = Date.now();
        }

        _createClass(Network, [{
            key: 'addEdge',


            // Where 'from' and 'to' are node ids.
            value: function addEdge(from, to) {
                var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

                if (!this.hasEdge(from, to, data)) {
                    var new_edge = { from: from, to: to, uid: this.unusedEdgeId, ts: Date.now() - this.startTS };
                    if (data !== null) new_edge.data = data;
                    this.edges.push(new_edge);
                    this.lastEdgeId = this.unusedEdgeId;
                    this.unusedEdgeId += 1;
                }
            }
        }, {
            key: 'setEdgeData',
            value: function setEdgeData(uid, data) {
                for (var i = 0; i < this.edges.length; i++) {
                    if (this.edges[i].uid === uid) {
                        this.edges[i].data = data;
                        break;
                    }
                }
            }
            // * Note that this will return 'false' if data differs.
            // * This is to allow for a multigraph, in case it arises.
            // * I.e., Players might use different ways to
            // * transition from two of the same states.

        }, {
            key: 'hasEdge',
            value: function hasEdge(from, to) {
                var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

                for (var i = 0; i < this.edges.length; i++) {
                    var e = this.edges[i];
                    if (e.from === from && e.to === to) {
                        if (data === null || e.data === data) return true; // match
                    }
                }
                return false;
            }

            // Set-compare objects.

        }, {
            key: 'compare',
            value: function compare(x, y) {
                var _this = this;

                var typeX = typeof x === 'undefined' ? 'undefined' : _typeof(x);
                var typeY = typeof y === 'undefined' ? 'undefined' : _typeof(y);
                if (Array.isArray(x)) {
                    if (Array.isArray(y)) {
                        return setCompare(x, y, function (a, b) {
                            return _this.compare(a, b);
                        });
                    } else {
                        return false;
                    }
                } else if (typeX === 'string' && typeY === 'string' || typeX === 'number' && typeY === 'number') {
                    return x === y;
                } else if (typeX === 'object' && typeY === 'object') {
                    if (Object.keys(x).length !== Object.keys(y).length) return false;
                    for (var key in x) {
                        if (!(key in y) || !this.compare(x[key], y[key])) return false;
                    }
                    return true;
                } else if (typeX !== typeY) return false;else {
                    console.warn('Cannot compare ', x, y, '. Types are odd: ', typeX, typeY);
                    return false;
                }
            }

            // Where pattern is a semi-description of a node,
            // e.g. { id:2 } for node with id 2,
            // or { data:"x == star" } for all
            // nodes with data matching "x == star".

        }, {
            key: 'nodesMatching',
            value: function nodesMatching(pattern) {
                var matches = [];
                for (var i = 0; i < this.nodes.length; i++) {
                    var n = this.nodes[i];
                    for (var key in pattern) {
                        if (key in n) {
                            if (_typeof(n[key]) === 'object') {
                                // TODO: This must be set comparison, not sequences.
                                if (this.compare(n[key], pattern[key])) matches.push(n);
                            } else if (n[key] === pattern[key]) {
                                matches.push(n);
                            }
                        }
                    }
                }
                return matches;
            }
        }, {
            key: 'has',
            value: function has(pattern) {
                return this.nodesMatching(pattern).length > 0;
            }
        }, {
            key: 'nodeIdFor',
            value: function nodeIdFor(pattern) {
                var ns = this.nodesMatching(pattern);
                if (ns.length === 0) return -1;else return ns[0].id;
            }
        }, {
            key: 'nodeForId',
            value: function nodeForId(id) {
                if (id === null || typeof id === 'undefined') return null;
                var ns = this.nodesMatching({ id: id });
                if (ns.length === 0) return null;else return ns[0];
            }
        }, {
            key: 'push',


            // Push new node onto the graph,
            // checking for existing match,
            // defaulting to this.lastNode for previous node,
            //  and adding an appropriate edge.
            value: function push(stateData) {
                var changeData = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
                var prevNodeId = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

                if (prevNodeId === null) prevNodeId = this.lastNodeId;

                // If we already have this node...
                var dup_id = this.nodeIdFor({ data: stateData });
                if (dup_id > -1) {
                    // If we've already seen this state...
                    // console.log('dup state');
                    if (dup_id === prevNodeId) {
                        // We haven't actually moved, so do nothing.
                        if (changeData !== null) {
                            this.setEdgeData(this.lastEdgeId, changeData); // belated setting of edge data
                            return true;
                        } else return false;
                    } else {
                        // We've gone back to a previous state, so add an edge.
                        // console.log('went back to ', dup_id);
                        this.addEdge(prevNodeId, dup_id, changeData);
                        this.lastNodeId = dup_id; // This is the id of the 'current node' (state) in the 'stack'...
                    }
                } else {
                        // This is a new state.
                        var nid = this.unusedNodeId;
                        this.nodes.push({ id: nid, data: stateData, ts: Date.now() - this.startTS }); // Add a new node.
                        if (prevNodeId !== null) // Add an edge going from prev. node to new one, if prev. node exists.
                            this.addEdge(prevNodeId, nid, changeData);
                        this.unusedNodeId += 1; // This id has been used, so increment to the next.
                        this.lastNodeId = nid;
                    }

                return true;
            }

            // For logging minor changes that occur _within_ the current game-state.

        }, {
            key: 'pushAddendumToCurrentState',
            value: function pushAddendumToCurrentState(data) {
                var currentNode = this.lastAddedNode;
                if ('subchanges' in currentNode) currentNode.subchanges.push(data);else currentNode.subchanges = [data];
            }

            // Exporting methods

        }, {
            key: 'serialize',
            value: function serialize() {
                return {
                    nodes: this.nodes,
                    edges: this.edges
                };
            }
        }, {
            key: 'toString',
            value: function toString() {
                return JSON.stringify(this.serialize());
            }
        }, {
            key: 'toVisJSNetworkData',
            value: function toVisJSNetworkData(toLabel) {
                var _this2 = this;

                if (!('vis' in window)) {
                    console.error('Vis.js not found.');
                    return {};
                }

                var clean = function clean(s) {
                    return s.replace(/__(star|rect|tri|triangle|diamond|circle|dot)/g, '');
                };
                var toEdgeLabel = function toEdgeLabel(e) {
                    var d = e.data;
                    if ((typeof d === 'undefined' ? 'undefined' : _typeof(d)) === 'object') {
                        if ('before' in d && 'after' in d) {
                            if ('item' in d) return '(' + clean(d.before) + ') (' + clean(d.item) + ') -> ' + clean(d.after);else return clean(d.before) + ' -> ' + clean(d.after);
                        } else if ('item' in d && 'name' in d) return d.name + ': ' + clean(d.item);else return JSON.stringify(d);
                    } else return d;
                };

                if (typeof toLabel === 'undefined') toLabel = function toLabel(n) {
                    if (typeof n.data === 'string') return n.data;
                    var s = n.data.board.map(clean).join(') (');
                    if (n.data.board.length > 1) s = '(' + s + ')';
                    return s;
                };

                var lastNodeId = this.lastNodeId;
                var nodes = new vis.DataSet(this.nodes.map(function (n) {
                    var v = { id: n.id,
                        label: toLabel(n) };
                    if (n.id === lastNodeId && n.data && // Check for victory state.
                    _this2.compare(n.data.goal, n.data.board)) {
                        v.final = true;
                        v.color = {
                            background: 'Gold',
                            border: 'Orange',
                            highlight: {
                                background: 'Yellow',
                                border: 'OrangeRed'
                            }
                        };
                    } else if (n.id === 0) {
                        // Mark initial state.
                        v.initial = true;
                        v.color = {
                            background: 'LightGreen',
                            border: 'green',
                            highlight: {
                                background: 'Aquamarine',
                                border: 'LightSeaGreen'
                            }
                        };
                    } else if (n.data === 'reset') {
                        // Mark reset state.
                        v.reset = true;
                        v.color = {
                            background: '#BDAEC6',
                            border: '#732C7B',
                            highlight: {
                                background: '#BDAEC6',
                                border: 'Indigo'
                            }
                        };
                    }
                    return v;
                }));
                var edges = new vis.DataSet(this.edges.map(function (e) {
                    return { from: e.from,
                        to: e.to,
                        label: __STATEGRAPH_DISPLAY_EDGES && e.data && e.data !== null ? toEdgeLabel(e) : undefined };
                }));
                return {
                    nodes: nodes,
                    edges: edges
                };
            }
        }, {
            key: 'length',
            get: function get() {
                return this.nodes.length;
            }
        }, {
            key: 'lastAddedNode',
            get: function get() {
                return this.nodeForId(this.lastNodeId);
            }
        }]);

        return Network;
    }();

    _.Network = Network;
    return _;
}(mag || {});