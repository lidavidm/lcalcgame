var mag = (function(_) {

    class Network {

        constructor() {

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

            this.startTS = Date.now();
        }

        get length() {
            return this.nodes.length;
        }

        // Where 'from' and 'to' are node ids.
        addEdge(from, to, data=null) {
            if (!this.hasEdge(from, to, data)) {
                const new_edge = {from:from, to:to, uid:this.unusedEdgeId, ts:(Date.now() - this.startTS)};
                if (data !== null) new_edge.data = data;
                this.edges.push(new_edge);
                this.unusedEdgeId += 1;
            }
        }
        // * Note that this will return 'false' if data differs.
        // * This is to allow for a multigraph, in case it arises.
        // * I.e., Players might use different ways to
        // * transition from two of the same states.
        hasEdge(from, to, data=null) {
            for (let i = 0; i < this.edges.length; i++) {
                const e = this.edges[i];
                if (e.from === from && e.to === to) {
                    if (data === null || e.data === data)
                        return true; // match
                }
            }
            return false;
        }

        // Set-compare objects.
        compare(x, y) {
            const typeX = typeof x;
            const typeY = typeof y;
            if (Array.isArray(x)) {
                if (Array.isArray(y)) {
                    return setCompare(x, y, ((a, b) => a === b));
                } else {
                    return false;
                }
            }
            else if ((typeX === 'string' && typeY === 'string') ||
                     (typeX === 'number' && typeY === 'number')) {
                return x === y;
            }
            else if (typeX === 'object' && typeY === 'object') {
                if (Object.keys(x).length !== Object.keys(y).length)
                    return false;
                for (var key in x) {
                    if (!(key in y) || !this.compare(x[key], y[key]))
                        return false;
                }
                return true;
            }
            else if (typeX !== typeY)
                return false;
            else {
                console.warn('Cannot compare ', x, y, '. Types are odd: ', typeX, typeY);
                return false;
            }
        }

        // Where pattern is a semi-description of a node,
        // e.g. { id:2 } for node with id 2,
        // or { data:"x == star" } for all
        // nodes with data matching "x == star".
        nodesMatching(pattern) {
            let matches = [];
            for (let i = 0; i < this.nodes.length; i++) {
                const n = this.nodes[i];
                for (var key in pattern) {
                    if (key in n) {
                        if (typeof n[key] === 'object') { // TODO: This must be set comparison, not sequences.
                            if (this.compare(n[key], pattern[key]))
                                matches.push(n);
                        } else if (n[key] === pattern[key]) {
                            matches.push(n);
                        }
                    }
                }
            }
            return matches;
        }
        has(pattern) {
            return this.nodesMatching(pattern).length > 0;
        }
        nodeIdFor(pattern) {
            const ns = this.nodesMatching(pattern);
            if (ns.length === 0) return -1;
            else                 return ns[0].id;
        }
        nodeForId(id) {
            if (id === null || typeof id === 'undefined') return null;
            console.log(id, this.nodes);
            const ns = this.nodesMatching({id:id});
            if (ns.length === 0) return null;
            else                 return ns[0];
        }
        get lastAddedNode() {
            console.log(this.lastNodeId, this.nodes);
            return this.nodeForId(this.lastNodeId);
        }

        // Push new node onto the graph,
        // checking for existing match,
        // defaulting to this.lastNode for previous node,
        //  and adding an appropriate edge.
        push(stateData, changeData=null, prevNodeId=null) {
            if (prevNodeId === null) prevNodeId = this.lastNodeId;

            // If we already have this node...
            const dup_id = this.nodeIdFor({data: stateData});
            if (dup_id > -1) { // If we've already seen this state...
                console.log('dup state');
                if (dup_id === prevNodeId) // We haven't actually moved, so do nothing.
                    return;
                else {                     // We've gone back to a previous state, so add an edge.
                    console.log('went back to ', dup_id);
                    this.addEdge(prevNodeId, dup_id, changeData);
                    this.lastNodeId = dup_id; // This is the id of the 'current node' (state) in the 'stack'...
                }
            } else { // This is a new state.
                const nid = this.unusedNodeId;
                this.nodes.push( { id:nid, data:stateData, ts:(Date.now() - this.startTS) } ); // Add a new node.
                if (prevNodeId !== null)  // Add an edge going from prev. node to new one, if prev. node exists.
                    this.addEdge(prevNodeId, nid, changeData);
                this.unusedNodeId += 1; // This id has been used, so increment to the next.
                this.lastNodeId = nid;
            }
        }

        // Exporting methods
        serialize() {
            return {
                nodes:this.nodes,
                edges:this.edges
            };
        }
        toString() {
            return JSON.stringify(this.serialize());
        }
    }

    _.Network = Network;
    return _;
}(mag || {}));
