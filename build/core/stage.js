'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * A core drawing 'layer'.
 * You can add Nodes to this layer to display them and update them.
 */
var mag = function (_) {

    // This construct allows us to embed stages within each other,
    // without messing with the internal logic that may be relied on
    // for the stage's children (such as identifying the part node as a Stage)

    var StageNode = function (_mag$Rect) {
        _inherits(StageNode, _mag$Rect);

        function StageNode(x, y, stageToEmbed, canvas) {
            _classCallCheck(this, StageNode);

            stageToEmbed._canvas = canvas; // if we try this normally, it's going to try to delegate the mouse, which we dont want.
            if (canvas) {
                var sz = stageToEmbed.boundingSize;

                var _this = _possibleConstructorReturn(this, (StageNode.__proto__ || Object.getPrototypeOf(StageNode)).call(this, x, y, sz.w, sz.h));
            } else {
                var _this = _possibleConstructorReturn(this, (StageNode.__proto__ || Object.getPrototypeOf(StageNode)).call(this, x, y, 0, 0));
            }
            _this._embeddedStage = stageToEmbed;
            _this._embeddedStage.draw = function () {
                _this.draw(_this._embeddedStage.ctx);
            };
            _this._clip = { l: 0, t: 0, r: 1, b: 1 };
            return _possibleConstructorReturn(_this);
        }

        _createClass(StageNode, [{
            key: 'setup',
            value: function setup(stageToEmbed, canvas) {
                var _this2 = this;

                console.log('setup called with ', canvas);
                stageToEmbed._canvas = canvas;
                stageToEmbed.ctx = canvas.getContext('2d');
                var stage_size = this.embeddedStage.boundingSize;
                this._clip = { l: 0, t: 0, r: this._size.w / stage_size.w, b: this._size.h / stage_size.h };
                this.size = stage_size;
                this._embeddedStage = stageToEmbed;
                this._embeddedStage.draw = function () {
                    _this2.draw(_this2._embeddedStage.ctx);
                };
            }
        }, {
            key: 'setClipWithSize',
            value: function setClipWithSize(sz) {
                var stage_size = this.embeddedStage.boundingSize;
                this._clip = { l: 0, t: 0, r: sz.w / stage_size.w, b: sz.h / stage_size.h };
            }
        }, {
            key: 'hitsWithin',
            value: function hitsWithin(pos) {
                var boundingSize = this.absoluteSize;
                boundingSize.w *= this._clip.r - this._clip.l;
                boundingSize.h *= this._clip.b - this._clip.t;
                var upperLeftPos = this.upperLeftPos(this.absolutePos, boundingSize);
                if (pointInRect(pos, rectFromPosAndSize(upperLeftPos, boundingSize))) return this;else return null;
            }

            // Clipping regions of the underlying stage.

        }, {
            key: 'update',
            value: function update() {
                this._embeddedStage.update();
            }
        }, {
            key: 'drawInternal',
            value: function drawInternal(ctx, pos, boundingSize) {
                if (!this._embeddedStage || !this._embeddedStage.canvas) {
                    console.error('nblah');
                    return;
                }

                var bz = this._embeddedStage.boundingSize;
                var scaleRatio = { x: boundingSize.w / bz.w, y: boundingSize.h / bz.h };
                this._embeddedStage.ctx = ctx;
                ctx.save();

                ctx.translate(pos.x, pos.y);

                // Clip drawing to only the stage (and possibly a subregion)
                var r = this.clip;
                ctx.translate((r.r - r.l) * boundingSize.w * this.anchor.x - boundingSize.w * r.l, (r.b - r.t) * boundingSize.h * this.anchor.y - boundingSize.h * r.t);
                ctx.rect(boundingSize.w * r.l, boundingSize.h * r.t, boundingSize.w * (r.r - r.l), boundingSize.h * (r.b - r.t));
                ctx.clip();

                ctx.scale(scaleRatio.x, scaleRatio.y);

                this._embeddedStage.drawImpl();
                ctx.restore();
            }

            // Events

        }, {
            key: 'transformCoords',
            value: function transformCoords(pos) {
                pos = clonePos(pos);
                var sz = this.absoluteSize;
                pos.x -= this.absolutePos.x;
                pos.y -= this.absolutePos.y;
                pos.x -= sz.w * this.anchor.x;
                pos.y -= sz.h * this.anchor.y;
                pos.x /= this.absoluteScale.x;
                pos.y /= this.absoluteScale.y;
                return pos;
            }
        }, {
            key: 'hits',
            value: function hits(pos) {
                var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

                var h = this.hitsWithin(pos);
                if (h) console.log('hit');
                return h;
            }
        }, {
            key: 'onmousedown',
            value: function onmousedown(pos) {
                pos = this.transformCoords(pos);
                this._embeddedStage.onmousedown(pos);
            }
        }, {
            key: 'onmousedrag',
            value: function onmousedrag(pos) {
                pos = this.transformCoords(pos);
                this._embeddedStage.onmousedrag(pos);
            }
        }, {
            key: 'onmouseclick',
            value: function onmouseclick(pos) {
                pos = this.transformCoords(pos);
                this._embeddedStage.onmouseclick(pos);
            }
        }, {
            key: 'onmousehover',
            value: function onmousehover(pos) {
                pos = this.transformCoords(pos);
                this._embeddedStage.onmousehover(pos);
            }
            //onmouseenter(pos) {
            //    this._embeddedStage.onmouseenter(pos);
            //}
            //onmouseleave(pos) {
            //    this._embeddedStage.onmouseleave(pos);
            //}

        }, {
            key: 'onmouseup',
            value: function onmouseup(pos) {
                pos = this.transformCoords(pos);
                this._embeddedStage.onmouseup(pos);
            }
        }, {
            key: 'onorientationchange',
            value: function onorientationchange() {}
        }, {
            key: 'clip',
            get: function get() {
                var c = this._clip;
                return { l: c.l, t: c.t, r: c.r, b: c.b };
            },
            set: function set(c) {
                this._clip = { l: c.l, t: c.t, r: c.r, b: c.b };
            }
        }, {
            key: 'isClipped',
            get: function get() {
                return this._clip.l > 0 || this._clip.t > 0 || this._clip.r < 1 || this._clip.b < 1;
            }

            // Access to embedded stage.

        }, {
            key: 'embeddedStage',
            get: function get() {
                return this._embeddedStage;
            },
            set: function set(s) {
                this._embeddedStage = s;
            }
        }]);

        return StageNode;
    }(mag.Rect);

    var Stage = function () {
        function Stage() {
            var canvas = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

            _classCallCheck(this, Stage);

            if (canvas) this.canvas = canvas;else this.ctx = null;
            this.nodes = [];
            this.hoverNode = null;
            this._scale = 1;
            this.requested = false;
        }

        _createClass(Stage, [{
            key: 'finishLoading',


            // Call this once all nodes are loaded into the stage,
            // for instance at level generation.
            // Extend this to do any final setup.
            value: function finishLoading() {}
        }, {
            key: 'clear',
            value: function clear() {
                if (this.color) {
                    this.ctx.fillStyle = this.color;
                    this.ctx.fillRect(0, 0, canvas.width, canvas.height);
                } else {
                    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
                }
            }
        }, {
            key: 'has',
            value: function has(node) {
                return node && node.stage == this && this.nodes.indexOf(node) > -1;
            }
        }, {
            key: 'add',
            value: function add(node) {
                if (this.has(node)) return;
                node.stage = this;
                if (node.locked) node.unlock();
                this.nodes.push(node);
            }
        }, {
            key: 'addAll',
            value: function addAll(nodes) {
                var _this3 = this;

                nodes.forEach(function (n) {
                    return _this3.add(n);
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
                var _this4 = this;

                var i = this.nodes.indexOf(node);
                if (i > -1) {
                    var origpos;
                    var pos;
                    var total_width;
                    var rightpos;
                    var scale;
                    var anotherNode;
                    var an;

                    var _ret = function () {

                        // just delete the node...
                        if (anotherNodeOrNodes === null) {
                            _this4.nodes.splice(i, 1);
                            return {
                                v: void 0
                            };
                        }

                        _this4.nodes[i].stage = null;
                        origpos = _this4.nodes[i].centerPos();
                        total_width = 0;
                        scale = _this4.nodes[i].scale;
                        anotherNode = anotherNodeOrNodes;

                        if (!Array.isArray(anotherNode)) {
                            anotherNode = [anotherNode];
                        }

                        pos = clonePos(origpos);

                        for (var j = 0; j < anotherNode.length; j++) {
                            an = anotherNode[j];

                            an.unlock();
                            an.pos = pos;
                            an.parent = null;
                            an.stage = _this4;
                            an.scale = _this4.nodes[i].scale;
                            if (anotherNode.length === 1) an.anchor = { x: 0.5, y: 0.5 };
                            an.onmouseleave();
                            pos = addPos({ x: an.size.w + 6, y: 0 }, pos);
                            total_width += an.size.w + 6;
                            if (j === 0) _this4.nodes.splice(i, 1, an);else _this4.nodes.splice(i + j, 0, an);
                        }

                        // Can't duplicate horizontally or we'll go off-screen.
                        // So, duplicate vertically.
                        if (origpos.x + total_width > _this4.boundingSize.w) {
                            pos = clonePos(origpos);
                            anotherNode.forEach(function (n) {
                                var p = n.pos;
                                n.pos = pos;
                                n.anchor = { x: 0, y: 0.5 };
                                pos = addPos({ x: 0, y: an.size.h + 6 }, pos);
                            });
                        }

                        // If it extends off screen (horizontally), bounce it
                        // back inside
                        var maxWidth = 0;
                        var leastX = 0;
                        var _iteratorNormalCompletion = true;
                        var _didIteratorError = false;
                        var _iteratorError = undefined;

                        try {
                            for (var _iterator = anotherNode[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                var n = _step.value;

                                maxWidth = Math.max(maxWidth, (1 - n.anchor.x) * n.absoluteSize.w);
                                leastX = Math.min(leastX, n.pos.x - n.anchor.x * n.absoluteSize.w);
                            }
                        } catch (err) {
                            _didIteratorError = true;
                            _iteratorError = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion && _iterator.return) {
                                    _iterator.return();
                                }
                            } finally {
                                if (_didIteratorError) {
                                    throw _iteratorError;
                                }
                            }
                        }

                        var offset = void 0;
                        if (pos.x > _this4.boundingSize.w) {
                            offset = pos.x + maxWidth - _this4.boundingSize.w;
                        }
                        if (leastX < 0) {
                            offset = leastX;
                        }
                        if (Number.isNumber(offset) && !Number.isNaN(offset) && offset != 0) {
                            anotherNode.forEach(function (n) {
                                var p = n.pos;
                                n.pos = { x: p.x - offset, y: p.y };
                                var hidden = n.absolutePos.x - n.anchor.x * n.absoluteSize.w;
                                if (hidden < 0) {
                                    n.pos = { x: n.pos.x + Math.abs(hidden), y: p.y };
                                }
                            });
                        }
                    }();

                    if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
                }

                this.update();
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
                var _this5 = this;

                this.nodes.forEach(function (n) {
                    n.update();

                    // Ignore nodes that are not expressions
                    if (!(n instanceof Expression) || n.toolbox) return;

                    var left = n.pos.x - n.anchor.x * n.absoluteSize.w;
                    var top = n.pos.y - n.anchor.y * n.absoluteSize.h;
                    var right = left + n.absoluteSize.w;

                    // Resize nodes that are too large
                    if (n.absoluteSize.w > _this5.boundingSize.w) {
                        var scale = _this5.boundingSize.w / n.size.w;
                        if (scale > 0.2) scale -= 0.05;
                        n.scale = { x: scale, y: scale };
                        n.pos = { x: 0, y: n.pos.y };
                    }
                    // Reposition nodes that go off the edge
                    else if (left < 0) {
                            var p = n.pos;
                            n.pos = { x: p.x - left, y: p.y };
                        } else if (right > _this5.boundingSize.w) {
                            var overhang = right - _this5.boundingSize.w;
                            var _p = n.pos;
                            n.pos = { x: _p.x - overhang, y: _p.y };
                        }

                    if (top < 0) {
                        n.pos = { x: n.pos.x, y: n.pos.y - top };
                    }
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


            /** Invalidates this stage, so that it won't draw to canvas or receive events. */
            value: function invalidate() {
                this.invalidated = true;
                delegateMouse(this._canvas, null);
            }
        }, {
            key: 'validate',
            value: function validate() {
                this.invalidated = false;
                delegateMouse(this._canvas, this);
            }

            /** Draw this stage to the canvas. */

        }, {
            key: 'draw',
            value: function draw() {
                var _this6 = this;

                // To avoid redundant draws, when someone calls draw, we
                // instead try to schedule an actual redraw. Another
                // redraw cannot be scheduled until the previous one
                // completes. The scheduling is done using
                // requestAnimationFrame so that the browser has control
                // over the framerate.
                if (!this.requested) {
                    this.requested = true;
                    window.requestAnimationFrame(function () {
                        _this6.drawImpl();
                        _this6.requested = false;
                    });
                }
            }
        }, {
            key: 'drawImpl',
            value: function drawImpl() {
                if (this.invalidated) return; // don't draw invalidated stages.
                this.ctx.save();
                this.ctx.scale(this._scale, this._scale);
                this.clear();
                var len = this.nodes.length;
                for (var i = 0; i < len; i++) {
                    this.nodes[i].draw(this.ctx);
                }
                //this.nodes.forEach((n) => n.draw(this.ctx));
                this.ctx.restore();
            }

            // Event handlers.

        }, {
            key: 'getNodeUnder',
            value: function getNodeUnder(node, pos) {
                // Exclude nodes that are in the toolbox - we don't want
                // to allow any interaction except dragging them out.
                var is_toolbox = function is_toolbox(e) {
                    return e && (e.toolbox || e.parent && is_toolbox(e.parent));
                };
                var hit_nodes = this.getHitNodesIntersecting(node, { 'exclude': [node] });
                var hit = null;
                //console.log('under-nodes:', hit_nodes);
                if (hit_nodes.length > 0) {
                    (function () {

                        // Sort hit nodes by closeness to center of dragged node:
                        var center = node.centerPos();
                        hit_nodes.sort(function (a, b) {
                            return distBetweenPos(center, a.centerPos()) > distBetweenPos(center, b.centerPos());
                        });

                        for (var i = hit_nodes.length - 1; i > -1; i--) {
                            if (hit_nodes[i] != node && !is_toolbox(hit_nodes[i])) hit = hit_nodes[i];
                        }
                    })();
                }
                //console.log('nodeUnder:', hit);
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

                    if (this.heldNode instanceof ReductStageExpr) {
                        this.heldNode.onmousedrag(pos);
                        this.draw();
                        return;
                    }

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
            key: 'onkeydown',
            value: function onkeydown(event) {}
        }, {
            key: 'onkeypress',
            value: function onkeypress(event) {}
        }, {
            key: 'onkeyup',
            value: function onkeyup(event) {}
        }, {
            key: 'onorientationchange',
            value: function onorientationchange(event) {}
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
            key: 'getHitNodesIntersecting',
            value: function getHitNodesIntersecting(node) {
                var _this7 = this;

                var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
                var startingNodes = arguments[2];

                if (typeof startingNodes === 'undefined') startingNodes = this.nodes;
                var hits = [];
                var nodeSize = node.absoluteSize;
                var nodeBounds = rectFromPosAndSize(node.upperLeftPos(node.absolutePos, nodeSize), nodeSize);
                var hitnode = null;
                startingNodes.forEach(function (n) {
                    if (n == node) return;

                    // Check whether absolute boundaries intersect:
                    var hitNodeSize = n.absoluteSize;
                    var hitNodeBounds = rectFromPosAndSize(n.upperLeftPos(n.absolutePos, hitNodeSize), hitNodeSize);
                    if (intersects(nodeBounds, hitNodeBounds)) {

                        // Give priority to intersections with child nodes (recursively)
                        // console.log('intersects', node, n);
                        var holes = n.holes ? n.holes.filter(function (e) {
                            return e instanceof Expression;
                        }) : [];
                        //if (n instanceof LambdaExpr) holes = holes.filter((e) => (e instanceof LambdaHoleExpr || e instanceof MissingExpression));
                        if (!(n instanceof BracketArrayExpr || n instanceof FadedES6LambdaHoleExpr)) {
                            if (holes.length > 0) {
                                var subintersections = _this7.getHitNodesIntersecting(node, options, holes);
                                if (subintersections.length > 0) {
                                    hits = hits.concat(subintersections);
                                    return;
                                }
                            }
                        }

                        // Get the intersection rectangle and its center point:
                        var intersection = rectFromIntersection(nodeBounds, hitNodeBounds);
                        var center = { x: intersection.x + intersection.w / 2.0, y: intersection.y + intersection.h / 2.0 };

                        // Use the hit test as if the cursor was at the center of the intersection:
                        // (this allows us to use existing hit test code, which relies on points, not rectangles)
                        hitnode = n.hits(center, options);
                        if (hitnode) {
                            hits.push(hitnode);
                        } else if (n instanceof LambdaHoleExpr) {
                            hitnode = n.hits(n.absolutePos, options);
                            if (hitnode) hits.push(hitnode);
                        }
                    }
                });
                return hits;
            }
        }, {
            key: 'toString',
            value: function toString() {
                return "[Stage toString method is undefined]";
            }
        }, {
            key: 'scale',
            get: function get() {
                return this._scale;
            },
            set: function set(s) {
                if (s === 0) return;
                this._scale = s;
            }
        }, {
            key: 'boundingSize',
            get: function get() {
                var r = this._canvas.getBoundingClientRect();
                return { w: r.width / this.scale, h: r.height / this.scale };
            }
        }, {
            key: 'canvas',
            get: function get() {
                return this._canvas;
            },
            set: function set(c) {
                if (c) {
                    delegateMouse(c, this);
                    this.ctx = canvas.getContext('2d');
                } else {
                    delegateMouse(this._canvas, null);
                    this.ctx = null;
                }
                this._canvas = c;
            }
        }], [{
            key: 'getNodesWithClass',
            value: function getNodesWithClass(Class) {
                var excludedNodes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

                var _this8 = this;

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
                        var childs = _this8.getNodesWithClass(Class, excludedNodes, true, n.children);
                        childs.forEach(function (c) {
                            return rt.push(c);
                        });
                    }
                });
                return rt;
            }
        }, {
            key: 'getAllNodes',
            value: function getAllNodes(nodes) {
                var excludedNodes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
                var recursive = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

                var result = [];

                nodes.forEach(function (n) {
                    if (excludedNodes.indexOf(n) > -1) return;else {
                        result.push(n);
                    }

                    if (recursive && n.children.length > 0) {
                        result = result.concat(Stage.getAllNodes(n.children, excludedNodes, true));
                    }
                });

                return result;
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
                x: (evt.clientX - rect.left) / stage._scale,
                y: (evt.clientY - rect.top) / stage._scale
            };
        }
        function getTouch(evt) {
            var idx = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

            if (evt.touches.length > 0) return evt.touches[idx];else return evt.changedTouches[idx];
        }

        if (stage) {

            // MOUSE EVENTS
            var onmousedown = function onmousedown(pos) {

                stage.onmousedown(pos);

                mouseIsDown = true;
                mouseDragged = false;
                mouseDownTime = Date.now();
                missedDragCalls = [];
            };
            var onmouseup = function onmouseup(pos) {

                if (!mouseDragged) stage.onmouseclick(pos);

                stage.onmouseup(pos);

                mouseIsDown = false;
                mouseDragged = false;
            };
            var onmousemove = function onmousemove(pos) {

                if (!mouseIsDown) {
                    stage.onmousehover(pos);
                } else if (mouseDragged || Date.now() - mouseDownTime > CLICK_DEBOUNCE_TIME) {
                    // debounce clicks
                    if (missedDragCalls.length > 0) {
                        missedDragCalls.forEach(function (call) {
                            return call();
                        });
                        missedDragCalls = [];
                    }
                    stage.onmousedrag(pos);
                    mouseDragged = true;
                } else {
                    missedDragCalls.push(function () {
                        stage.onmousedrag(pos);
                    });
                }
                return false;
            };
            canvas.onmousedown = function (e) {
                if (e.button === RIGHT_BTN) return false;
                onmousedown(getMousePos(e));
                return false;
            };
            canvas.onmousemove = function (e) {
                if (e.button === RIGHT_BTN) return false;
                onmousemove(getMousePos(e));
                return false;
            };
            canvas.onmouseup = function (e) {
                if (e.button === RIGHT_BTN) return false;
                onmouseup(getMousePos(e));
                return false;
            };

            // Keyboard events
            var getCBKeyEvent = function getCBKeyEvent(e) {
                // Cross-browser wrapper for key events.
                var keycode = e.which || e.keyCode;
                var character = String.fromCharCode(keycode || e.charCode);
                return {
                    keyCode: keycode,
                    // Although deprecated, charCode is the best way
                    // to distinguish between special characters and
                    // normal characters. Note that Firefox fires the
                    // keypress event for keys like Backspace, while
                    // Chrome seems not to.
                    charCode: e.charCode,
                    char: character,
                    shiftKey: e.shiftKey,
                    ctrlKey: e.ctrlKey,
                    altKey: e.altKey,
                    metaKey: e.metaKey
                };
            };
            var onkeydown = function onkeydown(e) {
                var event = getCBKeyEvent(e);
                stage.onkeydown(event);
                if (e.keyCode == 32 || e.keyCode == 13 || e.keyCode == 9) {
                    // Space, tab, or...
                    // Browsers report charCode as 0 for these characters?
                    event.charCode = event.keyCode;
                    stage.onkeypress(event);
                    e.preventDefault();
                }
            };
            var onkeypress = function onkeypress(e) {
                var event = getCBKeyEvent(e);
                // console.log(event.char);
                stage.onkeypress(event);
            };
            var onkeyup = function onkeyup(e) {
                var event = getCBKeyEvent(e);
                stage.onkeyup(event);
            };
            // Keep track of listeners so we can unregister them
            window.listeners = window.listeners || {};
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = Object.keys(window.listeners)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var _key = _step2.value;

                    window.removeEventListener(_key, window.listeners[_key], false);
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                        _iterator2.return();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }

            window.listeners.keydown = onkeydown;
            window.listeners.keypress = onkeypress;
            window.listeners.keyup = onkeyup;
            window.addEventListener('keydown', onkeydown, false);
            window.addEventListener('keypress', onkeypress, false);
            window.addEventListener('keyup', onkeyup, false);

            // Touch events
            var ontouchstart = function ontouchstart(e) {

                var pos = getMousePos(getTouch(e));

                stage.onmousehover(pos);
                onmousedown(pos);

                e.preventDefault();
            };
            var ontouchmove = function ontouchmove(e) {

                var pos = getMousePos(getTouch(e));

                onmousemove(pos);

                e.preventDefault();
            };
            var ontouchend = function ontouchend(e) {

                var pos = getMousePos(getTouch(e));

                onmouseup(pos);
                stage.onmousehover({ x: -10000, y: -10000 });

                e.preventDefault();
            };
            var ontouchcancel = function ontouchcancel(e) {
                ontouchend(e);
                e.preventDefault();
            };

            // TOUCH EVENTS (MOBILE)
            if (canvas.listeners) {
                // Remove prior listeners to prevent events from being
                // fired multiple times
                var _iteratorNormalCompletion3 = true;
                var _didIteratorError3 = false;
                var _iteratorError3 = undefined;

                try {
                    for (var _iterator3 = Object.keys(canvas.listeners)[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                        var key = _step3.value;

                        canvas.removeEventListener(key, canvas.listeners[key], false);
                    }
                } catch (err) {
                    _didIteratorError3 = true;
                    _iteratorError3 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion3 && _iterator3.return) {
                            _iterator3.return();
                        }
                    } finally {
                        if (_didIteratorError3) {
                            throw _iteratorError3;
                        }
                    }
                }
            }
            canvas.addEventListener('touchstart', ontouchstart, false);
            canvas.addEventListener('touchmove', ontouchmove, false);
            canvas.addEventListener('touchend', ontouchend, false);
            canvas.addEventListener('touchcancel', ontouchcancel, false);
            canvas.listeners = {
                'touchstart': ontouchstart,
                'touchmove': ontouchmove,
                'touchend': ontouchend,
                'touchcancel': ontouchcancel
            };
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
    _.StageNode = StageNode;
    return _;
}(mag || {});