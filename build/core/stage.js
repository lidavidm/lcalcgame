'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * A core drawing 'layer'.
 * You can add Nodes to this layer to display them and update them.
 */
var mag = function (_) {
    var Stage = function () {
        function Stage() {
            var canvas = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

            _classCallCheck(this, Stage);

            if (canvas) this.canvas = canvas;else this.ctx = null;
            this.nodes = [];
            this.hoverNode = null;
        }

        _createClass(Stage, [{
            key: 'clear',
            value: function clear() {
                this.ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }, {
            key: 'add',
            value: function add(node) {
                node.stage = this;
                if (node.locked) node.unlock();
                this.nodes.push(node);
            }
        }, {
            key: 'addAll',
            value: function addAll(nodes) {
                var _this2 = this;

                nodes.forEach(function (n) {
                    return _this2.add(n);
                });
            }
        }, {
            key: 'remove',
            value: function remove(node) {
                var i = this.nodes.indexOf(node);
                if (i > -1) {
                    this.nodes[i].stage = null;
                    this.nodes.splice(i, 1);
                }
            }
        }, {
            key: 'swap',
            value: function swap(node, anotherNodeOrNodes) {
                var i = this.nodes.indexOf(node);
                if (i > -1) {

                    // just delete the node...
                    if (anotherNodeOrNodes === null) {
                        this.nodes.splice(i, 1);
                        return;
                    }

                    this.nodes[i].stage = null;
                    var origpos = this.nodes[i].upperLeftPos(this.nodes[i].absolutePos, this.nodes[i].absoluteSize);
                    var pos;
                    var total_width = 0;
                    var rightpos;
                    var scale = this.nodes[i].scale;

                    var anotherNode = anotherNodeOrNodes;
                    if (!Array.isArray(anotherNode)) {
                        anotherNode = [anotherNode];
                        origpos = this.nodes[i].centerPos();
                    }

                    pos = clonePos(origpos);

                    for (var j = 0; j < anotherNode.length; j++) {
                        var an = anotherNode[j];
                        an.unlock();
                        an.pos = pos;
                        an.parent = null;
                        an.stage = this;
                        an.scale = this.nodes[i].scale;
                        if (anotherNode.length === 1) an.anchor = { x: 0.5, y: 0.5 };
                        an.onmouseleave();
                        pos = addPos({ x: an.size.w + 6, y: 0 }, pos);
                        total_width += an.size.w + 6;
                        if (j === 0) this.nodes.splice(i, 1, an);else this.nodes.splice(i + j, 0, an);
                    }

                    // Can't duplicate horizontally or we'll go off-screen.
                    // So, duplicate vertically.
                    if (total_width > GLOBAL_DEFAULT_SCREENSIZE.width) {
                        pos = clonePos(origpos);
                        anotherNode.forEach(function (n) {
                            var p = n.pos;
                            n.pos = pos;
                            n.anchor = { x: 0, y: 0.5 };
                            pos = addPos({ x: 0, y: an.size.h + 6 }, pos);
                        });
                    }
                    if (pos.x > GLOBAL_DEFAULT_SCREENSIZE.width) {
                        (function () {
                            var offset = pos.x - GLOBAL_DEFAULT_SCREENSIZE.width;
                            anotherNode.forEach(function (n) {
                                var p = n.pos;
                                n.pos = { x: p.x - offset, y: p.y };
                            });
                        })();
                    }
                }
            }
        }, {
            key: 'bringToFront',
            value: function bringToFront(node) {
                var i = this.nodes.indexOf(node);
                if (i > -1 && i < this.nodes.length - 1) {
                    var n = this.nodes[i];
                    this.nodes.splice(i, 1);
                    this.nodes.push(n);
                    this.draw();
                }
            }

            /** Update all nodes on the stage. */

        }, {
            key: 'update',
            value: function update() {
                this.nodes.forEach(function (n) {
                    return n.update();
                });
            }

            // Recursive functions that grab nodes on this stage with the specified class.

        }, {
            key: 'getRootNodesThatIncludeClass',
            value: function getRootNodesThatIncludeClass(Class) {
                var excludedNodes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

                var ns = this.getNodesWithClass(Class, excludedNodes);
                var topns = ns.map(function (n) {
                    return n.rootParent;
                });
                return topns.filter(function (n) {
                    return !n.parent && n._stage !== undefined;
                });
            }
        }, {
            key: 'getNodesWithClass',
            value: function getNodesWithClass(Class) {
                var excludedNodes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
                var recursive = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
                var nodes = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

                if (!nodes) nodes = this.nodes;
                return mag.Stage.getNodesWithClass(Class, excludedNodes, recursive, nodes);
            }
        }, {
            key: 'invalidate',


            /** Invalidates a collection of nodes (or all the nodes on this stage)
                and invalidates this stage, so that it won't draw to canvas anymore. */
            value: function invalidate(nodes) {
                if (typeof nodes === 'undefined') nodes = this.nodes;else if (nodes && nodes.length === 0) return;
                var _this = this;
                nodes.forEach(function (n) {
                    n.ctx = null;
                    _this.invalidate(n.children);
                });
                this.invalidated = true;
            }

            /** Draw this stage to the canvas. */

        }, {
            key: 'draw',
            value: function draw() {
                var _this3 = this;

                if (this.invalidated) return; // don't draw invalidated stages.
                this.ctx.save();
                this.ctx.scale(1, 1);
                this.clear();
                this.nodes.forEach(function (n) {
                    return n.draw(_this3.ctx);
                }); // TODO: You should pass the ctx!!!!!!
                this.ctx.restore();
            }

            // Event handlers.

        }, {
            key: 'getNodeUnder',
            value: function getNodeUnder(node, pos) {
                var hit_nodes = this.getHitNodes(pos, { 'exclude': [node] });
                var hit = null;
                if (hit_nodes.length > 0) {
                    for (var i = hit_nodes.length - 1; i > -1; i--) {
                        if (hit_nodes[i] != node) hit = hit_nodes[i];
                    }
                }
                return hit;
            }
        }, {
            key: 'onmousedown',
            value: function onmousedown(pos) {
                // Mouse clicked down.
                var hit_nodes = this.getHitNodes(pos);
                if (hit_nodes.length > 0) {
                    hit_nodes[hit_nodes.length - 1].onmousedown(pos); // only send to top-most node??
                    this.heldNode = hit_nodes[hit_nodes.length - 1];

                    if (this.lastHeldNode != this.heldNode) this.lastHeldNode = this.heldNode;
                }
                this.draw();
            }
        }, {
            key: 'onmousedrag',
            value: function onmousedrag(pos) {
                // Mouse clicked + moving (drag).
                if (this.heldNode) {
                    // Only send this event to the 'mousedown'd node.

                    var nodepos = pos;
                    if (this.heldNode.absoluteSize) {
                        if (!this.heldNodeOrigOffset) this.heldNodeOrigOffset = fromTo(pos, this.heldNode.absolutePos);
                        nodepos = addPos(pos, this.heldNodeOrigOffset);
                    }

                    this.heldNode.onmousedrag(nodepos);

                    // Check which node lies below the heldNode. If there is one,
                    // let it know, and store it for the mouseup event.
                    var underNode = this.getNodeUnder(this.heldNode, pos);
                    if (this.underNode && this.underNode == underNode) {} else if (!this.underNode) {
                        if (underNode) underNode.ondropenter(this.heldNode, pos);
                        this.underNode = underNode;
                    } else if (this.underNode != underNode) {
                        // this.underNode != underNode
                        if (underNode) underNode.ondropenter(this.heldNode, pos);
                        this.underNode.ondropexit(this.heldNode, pos);
                        this.underNode = underNode;
                    }

                    this.draw();
                }
            }
        }, {
            key: 'onmousehover',
            value: function onmousehover(pos) {
                // Hovering without clicking.
                // .. safest to do nothing here for now .. //
                var hit_nodes = this.getHitNodes(pos);
                var hit = hit_nodes[hit_nodes.length - 1];
                if (this.hoverNode) {
                    if (hit === this.hoverNode) {
                        // If hovering over this node and not its children...
                        this.hoverNode.onmousehover(pos);
                        //console.log('hovering over ', this.hoverNode.color);
                        this.draw();
                        return;
                    } else {
                        this.hoverNode.onmouseleave(pos);
                        if (hit) {
                            hit.onmouseenter(pos);
                            this.hoverNode = hit;
                            this.draw();
                            return;
                        } else {
                            this.hoverNode = null;
                            this.draw();
                        }
                    }
                }
                if (hit_nodes.length > 0) {
                    hit_nodes[hit_nodes.length - 1].onmouseenter(pos); // only send to top-most node??
                    this.hoverNode = hit_nodes[hit_nodes.length - 1];
                    this.draw();
                }
            }
        }, {
            key: 'onmouseclick',
            value: function onmouseclick(pos) {
                if (this.heldNode) {
                    this.heldNode.onmouseclick(pos);
                }
            }
        }, {
            key: 'onmouseup',
            value: function onmouseup(pos) {
                // Mouse button unclicked.
                if (this.heldNode) {
                    // Only send this event to the 'mousedown'd node.

                    // Drag 'n' drop droppped event.
                    if (this.underNode) {
                        this.underNode.ondropped(this.heldNode, pos);
                        this.underNode = null;
                    }

                    this.heldNode.onmouseup(pos);
                    this.heldNode = null;
                    this.heldNodeOrigOffset = null;

                    this.update();
                    this.draw();
                }
            }
        }, {
            key: 'getHitNodes',
            value: function getHitNodes(pos) {
                var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

                var hits = [];
                var hitnode = null;
                this.nodes.forEach(function (n) {
                    hitnode = n.hits(pos, options);
                    if (hitnode) hits.push(hitnode);
                });
                return hits;
            }
        }, {
            key: 'toString',
            value: function toString() {
                return "[Stage toString method is undefined]";
            }
        }, {
            key: 'canvas',
            get: function get() {
                return this._canvas;
            },
            set: function set(c) {
                if (c) {
                    delegateMouse(canvas, this);
                    this.ctx = canvas.getContext('2d');
                } else {
                    delegateMouse(canvas, null);
                    this.ctx = null;
                }
            }
        }], [{
            key: 'getNodesWithClass',
            value: function getNodesWithClass(Class) {
                var excludedNodes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

                var _this4 = this;

                var recursive = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
                var nodes = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

                if (!nodes) return null;
                var rt = [];
                nodes.forEach(function (n) {
                    var excluded = false;
                    excludedNodes.forEach(function (excn) {
                        excluded |= n == excn || n.ignoreGetClassInstance;
                    });
                    if (excluded) return;else if (n instanceof Class) rt.push(n);
                    if (recursive && n.children.length > 0) {
                        var childs = _this4.getNodesWithClass(Class, excludedNodes, true, n.children);
                        childs.forEach(function (c) {
                            return rt.push(c);
                        });
                    }
                });
                return rt;
            }
        }]);

        return Stage;
    }();

    function delegateMouse(canvas, stage) {

        var RIGHT_BTN = 2;
        var mouseIsDown = false;
        var mouseDragged = false;
        var mouseDownTime = 0;
        var missedDragCalls = [];
        var CLICK_DEBOUNCE_TIME = 80; // in ms

        function getMousePos(evt) {
            var rect = canvas.getBoundingClientRect();
            return {
                x: evt.clientX - rect.left,
                y: evt.clientY - rect.top
            };
        }
        function getTouch(evt) {
            var idx = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

            if (evt.touches.length > 0) return evt.touches[idx];else return evt.changedTouches[idx];
        }

        if (stage) {

            // MOUSE EVENTS
            canvas.onmousedown = function (e) {
                if (e.button === RIGHT_BTN) return;

                stage.onmousedown(getMousePos(e));

                mouseIsDown = true;
                mouseDragged = false;
                mouseDownTime = Date.now();
                missedDragCalls = [];
            };
            canvas.onmouseup = function (e) {
                if (e.button === RIGHT_BTN) return;

                var mousepos = getMousePos(e);

                if (!mouseDragged) stage.onmouseclick(mousepos);

                stage.onmouseup(mousepos);

                mouseIsDown = false;
                mouseDragged = false;
            };
            canvas.onmousemove = function (e) {
                if (e.button === RIGHT_BTN) return;

                if (!mouseIsDown) {
                    stage.onmousehover(getMousePos(e));
                } else if (mouseDragged || Date.now() - mouseDownTime > CLICK_DEBOUNCE_TIME) {
                    // debounce clicks
                    if (missedDragCalls.length > 0) {
                        missedDragCalls.forEach(function (call) {
                            return call();
                        });
                        missedDragCalls = [];
                    }
                    stage.onmousedrag(getMousePos(e));
                    mouseDragged = true;
                } else {
                    (function () {
                        var pos = getMousePos(e);
                        missedDragCalls.push(function () {
                            stage.onmousedrag(pos);
                        });
                    })();
                }
                return false;
            };

            var ontouchstart = function ontouchstart(e) {

                console.log(e);
                var pos = getMousePos(getTouch(e));

                stage.onmousehover(pos);
                stage.onmousedown(pos);

                mouseIsDown = true;
                mouseDragged = false;

                e.preventDefault();
            };
            var ontouchmove = function ontouchmove(e) {
                if (!mouseIsDown) {
                    console.error('This shouldn\'t be reachable. How did you get here?');
                } else {
                    stage.onmousedrag(getMousePos(getTouch(e)));
                    mouseDragged = true;
                }

                e.preventDefault();
            };
            var ontouchend = function ontouchend(e) {

                var mousepos = getMousePos(getTouch(e));

                if (!mouseDragged) stage.onmouseclick(mousepos);

                stage.onmouseup(mousepos);

                mouseIsDown = false;
                mouseDragged = false;

                e.preventDefault();
            };
            var ontouchcancel = function ontouchcancel(e) {
                ontouchend(e);
                e.preventDefault();
            };

            // TOUCH EVENTS (MOBILE)
            canvas.addEventListener('touchstart', ontouchstart, false);
            canvas.addEventListener('touchmove', ontouchmove, false);
            canvas.addEventListener('touchend', ontouchend, false);
            canvas.addEventListener('touchcancel', ontouchcancel, false);
        } else {
            canvas.onmousedown = null;
            canvas.onmouseup = null;
            canvas.onmousemove = null;
            mouseIsDown = false;
            mouseDragged = false;
        }
    }

    // Exports
    _.Stage = Stage;
    return _;
}(mag || {});