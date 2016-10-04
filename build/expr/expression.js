'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/** Foundation of all other expressions in Reduct.
 *	@module expression
 */

var EMPTY_EXPR_WIDTH = 50;
var DEFAULT_EXPR_HEIGHT = 50;
var DEFAULT_CORNER_RAD = 20;
var DEFAULT_RENDER_CTX = null;

/** A generic expression. Could be a lambda expression, could be an if statement, could be a for.
    In general, anything that takes in arguments and can reduce to some other value based on those arguments. */

var Expression = function (_mag$RoundedRect) {
    _inherits(Expression, _mag$RoundedRect);

    function Expression() {
        var holes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

        _classCallCheck(this, Expression);

        var _this2 = _possibleConstructorReturn(this, (Expression.__proto__ || Object.getPrototypeOf(Expression)).call(this, 0, 0, EMPTY_EXPR_WIDTH, DEFAULT_EXPR_HEIGHT, DEFAULT_CORNER_RAD));

        _this2.holes = holes;
        _this2.padding = { left: 10, inner: 10, right: 10 };
        _this2._size = { w: EMPTY_EXPR_WIDTH, h: DEFAULT_EXPR_HEIGHT };

        if (_this2.holes) {
            var _this = _this2;
            _this2.holes.forEach(function (hole) {
                _this.addChild(hole);
            });
        }
        return _this2;
    }

    _createClass(Expression, [{
        key: 'equals',
        value: function equals(otherNode) {
            if (otherNode instanceof Expression && this.holes.length === otherNode.holes.length) {
                if (this.holes.length === 0) return this.value === otherNode.value;else {
                    var b = true;
                    for (var i = 0; i < this.holes.length; i++) {
                        b &= this.holes[i].value === otherNode[i].value;
                    }return b;
                }
            }
            return false;
        }
    }, {
        key: 'clone',
        value: function clone() {
            var parent = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

            var c = _get(Expression.prototype.__proto__ || Object.getPrototypeOf(Expression.prototype), 'clone', this).call(this, parent);
            var children = c.children;
            c.children = [];
            c.holes = [];
            c.stroke = null;
            c.toolbox = null;
            children.forEach(function (child) {
                return c.addArg(child);
            });
            return c;
        }

        // Makes all inner expressions undraggable, 'binding' them permanently.

    }, {
        key: 'bindSubexpressions',
        value: function bindSubexpressions() {
            this.holes.forEach(function (hole) {
                if (hole instanceof Expression && !(hole instanceof MissingExpression)) {
                    if (hole instanceof VarExpr || hole instanceof BooleanPrimitive) hole.lock();
                    hole.bindSubexpressions();
                }
            });
        }
    }, {
        key: 'addArg',
        value: function addArg(arg) {
            this.holes.push(arg);
            this.addChild(arg);
        }
    }, {
        key: 'removeArg',
        value: function removeArg(arg) {
            var idx = this.holes.indexOf(arg);
            if (idx > -1) {
                this.holes.splice(idx, 1); // remove 1 elem @ idx
                this.update();
            } else console.error('@ removeArg: Could not find arg ', arg, ' in expression.');
        }
    }, {
        key: 'swap',
        value: function swap(arg, anotherArg) {
            if (!arg || anotherArg === undefined) return;
            var i = this.holes.indexOf(arg);
            if (i > -1) {

                if (anotherArg === null) {
                    arg.detach();
                    this.holes[i]._size = { w: 50, h: 50 };
                    arg.stage.remove(arg);
                } else {

                    this.holes.splice(i, 1, anotherArg);

                    if (anotherArg) {
                        anotherArg.pos = arg.pos;
                        anotherArg.dragging = false;
                        anotherArg.parent = this;
                        anotherArg.scale = { x: 0.85, y: 0.85 };
                        anotherArg.onmouseleave();
                        anotherArg.onmouseup();
                    }

                    arg.parent = null;
                }
                this.update();
            } else console.log('Cannot swap: Argument ', arg, ' not found in parent.');
        }
    }, {
        key: 'getHoleSizes',
        value: function getHoleSizes() {
            if (!this.holes || this.holes.length === 0) return [];
            var sizes = [];
            this.holes.forEach(function (expr) {
                var size = expr ? expr.size : { w: EMPTY_EXPR_WIDTH, h: DEFAULT_EXPR_HEIGHT };
                size.w *= expr.scale.x;
                sizes.push(size);
            });
            return sizes;
        }
    }, {
        key: 'update',
        value: function update() {
            var padding = this.padding.inner;
            var x = this.padding.left;
            var y = this.size.h / 2.0 + (this.exprOffsetY ? this.exprOffsetY : 0);
            var _this = this;
            this.children = [];
            this.holes.forEach(function (expr) {
                return _this.addChild(expr);
            });
            this.holes.forEach(function (expr) {
                // Update hole expression positions.
                expr.anchor = { x: 0, y: 0.5 };
                expr.pos = { x: x, y: y };
                expr.scale = { x: 0.85, y: 0.85 };
                expr.update();
                x += expr.size.w * expr.scale.x + padding;
            });
            this.children = this.holes; // for rendering
        }

        // Apply arguments to expression

    }, {
        key: 'apply',
        value: function apply(args) {}
        // ... //


        // Apply a single argument at specified arg index

    }, {
        key: 'applyAtIndex',
        value: function applyAtIndex(idx, arg) {}
        // ... //


        // Reduce this expression to another.
        // * Returns the newly built expression. Leaves this expression unchanged.

    }, {
        key: 'reduce',
        value: function reduce() {
            var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;

            return this;
        }

        // * Swaps this expression for its reduction (if one exists) in the expression hierarchy.

    }, {
        key: 'performReduction',
        value: function performReduction() {
            var reduced_expr = this.reduce();
            if (reduced_expr !== undefined && reduced_expr != this) {
                // Only swap if reduction returns something > null.

                console.warn('performReduction with ', this, reduced_expr);

                if (!this.stage) return;

                this.stage.saveState();
                Logger.log('state-save', this.stage.toString());

                // Log the reduction.
                var reduced_expr_str = void 0;
                if (reduced_expr === null) reduced_expr_str = '()';else if (Array.isArray(reduced_expr)) reduced_expr_str = reduced_expr.reduce(function (prev, curr) {
                    return prev + curr.toString() + ' ';
                }, '').trim();else reduced_expr_str = reduced_expr.toString();
                Logger.log('reduction', { 'before': this.toString(), 'after': reduced_expr_str });

                var parent = this.parent ? this.parent : this.stage;
                if (reduced_expr) reduced_expr.ignoreEvents = this.ignoreEvents; // the new expression should inherit whatever this expression was capable of as input
                parent.swap(this, reduced_expr);

                // Check if parent expression is now reducable.
                if (reduced_expr && reduced_expr.parent) {
                    var try_reduce = reduced_expr.parent.reduceCompletely();
                    if (try_reduce != reduced_expr.parent && try_reduce !== null) {
                        Animate.blink(reduced_expr.parent, 400, [0, 1, 0], 1);
                    }
                }

                if (reduced_expr) reduced_expr.update();

                return reduced_expr;
            }
        }
    }, {
        key: 'reduceCompletely',
        value: function reduceCompletely() {
            // Try to reduce this expression and its subexpressions as completely as possible.
            var e = this;
            var prev_holes = e.holes;
            if (e.children.length === 0) return e.reduce();else {
                e.holes = e.holes.map(function (hole) {
                    if (hole instanceof Expression) return hole.reduceCompletely();else return hole;
                });
                e.children = [];
                e.holes.forEach(function (hole) {
                    return e.addChild(hole);
                });
                var red = e.reduce();
                e.children = [];
                e.holes = prev_holes;
                e.holes.forEach(function (hole) {
                    return e.addChild(hole);
                });
                return red;
            }
        }
    }, {
        key: 'detach',
        value: function detach() {
            if (this.parent) {
                var ghost_expr;
                if (this.droppedInClass) ghost_expr = new this.droppedInClass(this);else ghost_expr = new MissingExpression(this);

                var stage = this.parent.stage;
                var beforeState = stage.toString();
                var detachedExp = this.toString();
                var parent = this.parent;

                parent.swap(this, ghost_expr);

                this.parent = null;
                stage.add(this);
                stage.bringToFront(this);

                var afterState = stage.toString();
                Logger.log('detached-expr', { 'before': beforeState, 'after': afterState, 'item': detachedExp });
                stage.saveState();
                Logger.log('state-save', afterState);

                this.shell = ghost_expr;
            }
            if (this.toolbox) {

                if (this.stage) {
                    this.stage.saveState();
                    Logger.log('state-save', this.stage.toString());
                }

                this.toolbox.removeExpression(this); // remove this expression from the toolbox
                Logger.log('toolbox-dragout', this.toString());
            }
        }
    }, {
        key: 'lock',
        value: function lock() {
            this.shadowOffset = 0;
            this.ignoreEvents = true;
            this.locked = true;
        }
    }, {
        key: 'unlock',
        value: function unlock() {
            this.shadowOffset = 2;
            this.ignoreEvents = false;
            this.locked = false;
        }
    }, {
        key: 'lockSubexpressions',
        value: function lockSubexpressions() {
            var filterFunc = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

            this.holes.forEach(function (child) {
                if (child instanceof Expression) {
                    if (!filterFunc || filterFunc(child)) child.lock();
                    child.lockSubexpressions(filterFunc);
                }
            });
        }
    }, {
        key: 'unlockSubexpressions',
        value: function unlockSubexpressions() {
            var filterFunc = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

            this.holes.forEach(function (child) {
                if (child instanceof Expression) {
                    if (!filterFunc || filterFunc(child)) child.unlock();
                    child.unlockSubexpressions(filterFunc);
                }
            });
        }
    }, {
        key: 'hits',
        value: function hits(pos) {
            var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;

            if (this.locked) return this.hitsChild(pos, options);else return _get(Expression.prototype.__proto__ || Object.getPrototypeOf(Expression.prototype), 'hits', this).call(this, pos, options);
        }
    }, {
        key: 'onmousedrag',
        value: function onmousedrag(pos) {
            if (this.ignoreEvents) return;

            _get(Expression.prototype.__proto__ || Object.getPrototypeOf(Expression.prototype), 'onmousedrag', this).call(this, pos);

            var rightX = pos.x + this.absoluteSize.w;
            //if (rightX < GLOBAL_DEFAULT_SCREENSIZE.width) { // Clipping to edges
            this.pos = pos;
            //} else this.pos = { x:GLOBAL_DEFAULT_SCREENSIZE.width - this.absoluteSize.w, y:pos.y };

            if (!this.dragging) {
                this.detach();
                this.posBeforeDrag = this.absolutePos;
                this.stage.bringToFront(this);
                this.dragging = true;
            }
        }
    }, {
        key: 'onmouseup',
        value: function onmouseup(pos) {
            if (this.dragging && this.shell) {

                if (!this.parent) this.scale = { x: 1, y: 1 };
                this.shell = null;

                Logger.log('detach-commit', this.toString());
            }
            if (this.dragging) {
                if (this.toolbox && !this.toolbox.hits(pos)) {
                    this.toolbox = null;

                    Logger.log('toolbox-remove', this.toString());

                    if (this.stage) {
                        this.stage.saveState();
                        Logger.log('state-save', this.stage.toString());
                    }
                }

                Logger.log('moved', { 'item': this.toString(), 'prevPos': JSON.stringify(this.posBeforeDrag), 'newPos': JSON.stringify(this.pos) });
            }
            //if (this.toolbox) this.toolbox = null;
            this.dragging = false;
        }

        // The value (if any) this expression represents.

    }, {
        key: 'value',
        value: function value() {
            return undefined;
        }
    }, {
        key: 'toString',
        value: function toString() {
            if (this.holes.length === 1) return this.holes[0].toString();
            var s = '(';
            for (var i = 0; i < this.holes.length; i++) {
                if (i > 0) s += ' ';
                s += this.holes[i].toString();
            }
            return s + ')';
        }
    }, {
        key: 'holeCount',
        get: function get() {
            return this.holes ? this.holes.length : 0;
        }

        // Sizes to match its children.

    }, {
        key: 'size',
        get: function get() {

            var padding = this.padding;
            var width = 0;
            var sizes = this.getHoleSizes();
            var scale_x = this.scale.x;

            if (sizes.length === 0) return { w: this._size.w, h: this._size.h };

            sizes.forEach(function (s) {
                width += s.w + padding.inner;
            });
            width += padding.right; // the end

            return { w: width, h: DEFAULT_EXPR_HEIGHT };
        }
    }]);

    return Expression;
}(mag.RoundedRect);