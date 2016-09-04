'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 *	Lambda Calc V3
 *  --------------
 * 	Foundation structures
 */

var EMPTY_EXPR_WIDTH = 50;
var DEFAULT_EXPR_HEIGHT = 50;
var DEFAULT_CORNER_RAD = 20;
var DEFAULT_RENDER_CTX = null;

/** A generic expression. Could be a lambda expression, could be an if statement, could be a for.
    In general, anything that takes in arguments and can reduce to some other value based on those arguments. */

var Expression = function (_RoundedRect) {
    _inherits(Expression, _RoundedRect);

    function Expression() {
        var holes = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

        _classCallCheck(this, Expression);

        var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(Expression).call(this, 0, 0, EMPTY_EXPR_WIDTH, DEFAULT_EXPR_HEIGHT, DEFAULT_CORNER_RAD));

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
            var parent = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

            var c = _get(Object.getPrototypeOf(Expression.prototype), 'clone', this).call(this, parent);
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
                //this.stage.draw();
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
            var options = arguments.length <= 0 || arguments[0] === undefined ? undefined : arguments[0];

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
            //e.parent = this.parent;
            if (e.children.length === 0) return e.reduce();else {
                e.holes = e.holes.map(function (hole) {
                    if (hole instanceof Expression) return hole.reduceCompletely();else return hole;
                });
                //console.warn('Reduced: ', e, e.holes);
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

                var _stage = this.parent.stage;
                var beforeState = _stage.toString();
                var detachedExp = this.toString();
                var parent = this.parent;

                parent.swap(this, ghost_expr);

                this.parent = null;
                _stage.add(this);
                _stage.bringToFront(this);

                var afterState = _stage.toString();
                Logger.log('detached-expr', { 'before': beforeState, 'after': afterState, 'item': detachedExp });
                _stage.saveState();
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
            var filterFunc = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

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
            var filterFunc = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

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
            var options = arguments.length <= 1 || arguments[1] === undefined ? undefined : arguments[1];

            if (this.locked) return this.hitsChild(pos, options);else return _get(Object.getPrototypeOf(Expression.prototype), 'hits', this).call(this, pos, options);
        }
    }, {
        key: 'onmousedrag',
        value: function onmousedrag(pos) {
            if (this.ignoreEvents) return;

            _get(Object.getPrototypeOf(Expression.prototype), 'onmousedrag', this).call(this, pos);

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

                //this.shell.stage.remove(this);
                //this.shell.stage = null;
                //this.shell.parent.swap(this.shell, this); // put it back
                //this.shell = null;
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

            //if(this.color === 'red') width *= 0.8;
            return { w: width, h: DEFAULT_EXPR_HEIGHT };
        }
    }]);

    return Expression;
}(RoundedRect);

var MissingExpression = function (_Expression) {
    _inherits(MissingExpression, _Expression);

    function MissingExpression(expr_to_miss) {
        _classCallCheck(this, MissingExpression);

        var _this3 = _possibleConstructorReturn(this, Object.getPrototypeOf(MissingExpression).call(this, []));

        if (!expr_to_miss) expr_to_miss = new Expression();
        _this3.shadowOffset = -1; // inner
        _this3.color = '#555555';
        _this3._size = { w: expr_to_miss.size.w, h: expr_to_miss.size.h };
        _this3.ghost = expr_to_miss;
        return _this3;
    }

    _createClass(MissingExpression, [{
        key: 'getClass',
        value: function getClass() {
            return MissingExpression;
        }
    }, {
        key: 'onmousedrag',
        value: function onmousedrag(pos) {} // disable drag

    }, {
        key: 'ondropenter',
        value: function ondropenter(node, pos) {
            this.onmouseenter(pos);
        }
    }, {
        key: 'ondropexit',
        value: function ondropexit(node, pos) {
            this.onmouseleave(pos);
        }
    }, {
        key: 'ondropped',
        value: function ondropped(node, pos) {
            _get(Object.getPrototypeOf(MissingExpression.prototype), 'ondropped', this).call(this, node, pos);
            if (node.dragging) {
                // Reattach node.

                // Should not be able to stick lambdas in MissingExpression holes (exception of Map)
                if (node instanceof LambdaExpr && !(this.parent instanceof MapFunc)) return;

                var _stage2 = this.stage;
                var beforeState = _stage2.toString();
                var droppedExp = node.toString();

                Resource.play('pop');
                node.stage.remove(node);
                node.droppedInClass = this.getClass();
                this.parent.swap(this, node); // put it back

                var afterState = _stage2.toString();
                Logger.log('placed-expr', { 'before': beforeState, 'after': afterState, 'item': droppedExp });

                _stage2.saveState();
                Logger.log('state-save', afterState);

                // Blink red if total reduction is not possible with this config.
                /*var try_reduce = node.parent.reduceCompletely();
                if (try_reduce == node.parent || try_reduce === null) {
                    Animate.blink(node.parent, 400, [1,0,0]);
                }*/

                // Blink blue if reduction is possible with this config.
                var try_reduce = node.parent.reduceCompletely();
                if (try_reduce != node.parent && try_reduce !== undefined) {
                    Animate.blink(node.parent, 1000, [1, 1, 0], 1);
                }
            }
        }
    }, {
        key: 'toString',
        value: function toString() {
            return '_';
        }
    }]);

    return MissingExpression;
}(Expression);

var MissingTypedExpression = function (_MissingExpression) {
    _inherits(MissingTypedExpression, _MissingExpression);

    function MissingTypedExpression() {
        _classCallCheck(this, MissingTypedExpression);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(MissingTypedExpression).apply(this, arguments));
    }

    _createClass(MissingTypedExpression, [{
        key: 'getClass',
        value: function getClass() {
            return MissingTypedExpression;
        }

        // Returns TRUE if this hole accepts the given expression.

    }, {
        key: 'accepts',
        value: function accepts(expr) {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this.acceptedClasses[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var c = _step.value;

                    if (expr instanceof c) return true;
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
        }
    }, {
        key: 'ondropenter',
        value: function ondropenter(node, pos) {
            if (this.accepts(node)) _get(Object.getPrototypeOf(MissingTypedExpression.prototype), 'ondropenter', this).call(this, node, pos);
        }
    }, {
        key: 'ondropexit',
        value: function ondropexit(node, pos) {
            if (this.accepts(node)) _get(Object.getPrototypeOf(MissingTypedExpression.prototype), 'ondropexit', this).call(this, node, pos);
        }
    }, {
        key: 'ondropped',
        value: function ondropped(node, pos) {
            if (this.accepts(node)) _get(Object.getPrototypeOf(MissingTypedExpression.prototype), 'ondropped', this).call(this, node, pos);
        }
    }, {
        key: 'drawInternal',
        value: function drawInternal(pos, boundingSize) {
            pos.x -= boundingSize.w / 1.2 - boundingSize.w;
            pos.y -= boundingSize.h / 1.14 - boundingSize.h; // aesthetic resizing
            boundingSize.w /= 1.2;
            this.graphicNode.ctx = this.ctx;
            this.graphicNode.stroke = this.stroke;
            this.graphicNode.color = this.color;
            this.graphicNode.shadowOffset = this.shadowOffset;
            this.graphicNode.drawInternal(pos, boundingSize);
        }
    }, {
        key: 'toString',
        value: function toString() {
            return '_';
        }
    }]);

    return MissingTypedExpression;
}(MissingExpression);

var MissingBagExpression = function (_MissingTypedExpressi) {
    _inherits(MissingBagExpression, _MissingTypedExpressi);

    function MissingBagExpression(expr_to_miss) {
        _classCallCheck(this, MissingBagExpression);

        var _this5 = _possibleConstructorReturn(this, Object.getPrototypeOf(MissingBagExpression).call(this, expr_to_miss));

        _this5._size = { w: 50, h: 50 };
        _this5.graphicNode = new Bag(0, 0, 22, false);
        _this5.acceptedClasses = [BagExpr, PutExpr];
        return _this5;
    }

    _createClass(MissingBagExpression, [{
        key: 'getClass',
        value: function getClass() {
            return MissingBagExpression;
        }
    }, {
        key: 'toString',
        value: function toString() {
            return '__';
        }
    }]);

    return MissingBagExpression;
}(MissingTypedExpression);

var MissingBooleanExpression = function (_MissingTypedExpressi2) {
    _inherits(MissingBooleanExpression, _MissingTypedExpressi2);

    function MissingBooleanExpression(expr_to_miss) {
        _classCallCheck(this, MissingBooleanExpression);

        var _this6 = _possibleConstructorReturn(this, Object.getPrototypeOf(MissingBooleanExpression).call(this, expr_to_miss));

        _this6._size = { w: 80, h: 50 };
        _this6.color = "#0c2c52";

        _this6.graphicNode = new HexaRect(0, 0, 44, 44);

        _this6.acceptedClasses = [BooleanPrimitive, CompareExpr];
        return _this6;
    }

    _createClass(MissingBooleanExpression, [{
        key: 'getClass',
        value: function getClass() {
            return MissingBooleanExpression;
        }
    }, {
        key: 'drawInternal',
        value: function drawInternal(pos, boundingSize) {
            this.graphicNode.ctx = this.ctx;
            this.graphicNode.stroke = this.stroke;
            this.graphicNode.color = this.color;
            this.graphicNode.shadowOffset = this.shadowOffset;
            this.graphicNode.drawInternal(pos, boundingSize);
        }
    }, {
        key: 'toString',
        value: function toString() {
            return '_b';
        }
    }]);

    return MissingBooleanExpression;
}(MissingTypedExpression);

var MissingKeyExpression = function (_MissingBooleanExpres) {
    _inherits(MissingKeyExpression, _MissingBooleanExpres);

    function MissingKeyExpression(expr_to_miss) {
        _classCallCheck(this, MissingKeyExpression);

        var _this7 = _possibleConstructorReturn(this, Object.getPrototypeOf(MissingKeyExpression).call(this, expr_to_miss));

        var keyhole = new ImageRect(0, 0, 26 / 2, 42 / 2, 'lock-keyhole');
        _this7.graphicNode.addChild(keyhole);

        return _this7;
    }

    _createClass(MissingKeyExpression, [{
        key: 'drawInternal',
        value: function drawInternal(pos, boundingSize) {
            _get(Object.getPrototypeOf(MissingKeyExpression.prototype), 'drawInternal', this).call(this, pos, boundingSize);

            // Draw keyhole.
            var sz = this.graphicNode.children[0].size;
            this.graphicNode.children[0].drawInternal(addPos(pos, { x: boundingSize.w / 2.0 - sz.w / 2, y: boundingSize.h / 2.0 - sz.h / 2 }), sz);
        }
    }]);

    return MissingKeyExpression;
}(MissingBooleanExpression);

var TextExpr = function (_Expression2) {
    _inherits(TextExpr, _Expression2);

    function TextExpr(txt) {
        var font = arguments.length <= 1 || arguments[1] === undefined ? 'Consolas' : arguments[1];
        var fontSize = arguments.length <= 2 || arguments[2] === undefined ? 35 : arguments[2];

        _classCallCheck(this, TextExpr);

        var _this8 = _possibleConstructorReturn(this, Object.getPrototypeOf(TextExpr).call(this));

        _this8.text = txt;
        _this8.font = font;
        _this8.fontSize = fontSize; // in pixels
        _this8.color = 'black';
        return _this8;
    }

    _createClass(TextExpr, [{
        key: 'drawInternal',
        value: function drawInternal(pos, boundingSize) {
            var ctx = this.ctx;
            var abs_scale = this.absoluteScale;
            ctx.save();
            ctx.font = this.contextFont;
            ctx.scale(abs_scale.x, abs_scale.y);
            ctx.fillStyle = this.color;
            ctx.fillText(this.text, pos.x / abs_scale.x, pos.y / abs_scale.y + 2.2 * this.fontSize * this.anchor.y);
            ctx.restore();
        }
    }, {
        key: 'hits',
        value: function hits(pos, options) {
            return false;
        } // disable mouse events

    }, {
        key: 'value',
        value: function value() {
            return this.text;
        }
    }, {
        key: 'size',
        get: function get() {
            var ctx = this.ctx || GLOBAL_DEFAULT_CTX;
            if (!ctx || !this.text || this.text.length === 0) {
                console.error('Cannot size text: No context.');
                return { w: 4, h: this.fontSize };
            } else if (this.manualWidth) return { w: this.manualWidth, h: DEFAULT_EXPR_HEIGHT };
            ctx.font = this.contextFont;
            var measure = ctx.measureText(this.text);
            return { w: measure.width, h: DEFAULT_EXPR_HEIGHT };
        }
    }, {
        key: 'contextFont',
        get: function get() {
            return this.fontSize + 'px ' + this.font;
        }
    }]);

    return TextExpr;
}(Expression);

var BooleanPrimitive = function (_Expression3) {
    _inherits(BooleanPrimitive, _Expression3);

    function BooleanPrimitive(name) {
        _classCallCheck(this, BooleanPrimitive);

        var _this9 = _possibleConstructorReturn(this, Object.getPrototypeOf(BooleanPrimitive).call(this));

        var text = new TextExpr(name);
        text.pos = { x: 0, y: 0 };
        text.anchor = { x: -0.1, y: 1.5 }; // TODO: Fix this bug.
        _this9.color = "HotPink";
        _this9.addArg(text);
        return _this9;
    }

    _createClass(BooleanPrimitive, [{
        key: 'reduce',
        value: function reduce() {
            return this;
        }
    }, {
        key: 'reduceCompletely',
        value: function reduceCompletely() {
            return this;
        }
    }, {
        key: 'drawInternal',
        value: function drawInternal(pos, boundingSize) {
            this.ctx.fillStyle = 'black';
            setStrokeStyle(this.ctx, this.stroke);
            if (this.shadowOffset !== 0) {
                hexaRect(this.ctx, pos.x, pos.y + this.shadowOffset, boundingSize.w, boundingSize.h, true, this.stroke ? true : false, this.stroke ? this.stroke.opacity : null);
            }
            this.ctx.fillStyle = this.color;
            hexaRect(this.ctx, pos.x, pos.y, boundingSize.w, boundingSize.h, true, this.stroke ? true : false, this.stroke ? this.stroke.opacity : null);
        }
    }]);

    return BooleanPrimitive;
}(Expression);

var TrueExpr = function (_BooleanPrimitive) {
    _inherits(TrueExpr, _BooleanPrimitive);

    function TrueExpr() {
        _classCallCheck(this, TrueExpr);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(TrueExpr).call(this, 'true'));
    }

    _createClass(TrueExpr, [{
        key: 'value',
        value: function value() {
            return true;
        }
    }, {
        key: 'toString',
        value: function toString() {
            return 'true';
        }
    }]);

    return TrueExpr;
}(BooleanPrimitive);

var FalseExpr = function (_BooleanPrimitive2) {
    _inherits(FalseExpr, _BooleanPrimitive2);

    function FalseExpr() {
        _classCallCheck(this, FalseExpr);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(FalseExpr).call(this, 'false'));
    }

    _createClass(FalseExpr, [{
        key: 'value',
        value: function value() {
            return false;
        }
    }, {
        key: 'toString',
        value: function toString() {
            return 'false';
        }
    }]);

    return FalseExpr;
}(BooleanPrimitive);

var EmptyExpr = function (_Expression4) {
    _inherits(EmptyExpr, _Expression4);

    function EmptyExpr() {
        _classCallCheck(this, EmptyExpr);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(EmptyExpr).apply(this, arguments));
    }

    _createClass(EmptyExpr, [{
        key: 'value',
        value: function value() {
            return null;
        }
    }]);

    return EmptyExpr;
}(Expression);

// An if statement.


var IfStatement = function (_Expression5) {
    _inherits(IfStatement, _Expression5);

    function IfStatement(cond, branch) {
        _classCallCheck(this, IfStatement);

        var if_text = new TextExpr('if');
        var then_text = new TextExpr('then');
        if_text.color = 'black';
        then_text.color = 'black';

        var _this13 = _possibleConstructorReturn(this, Object.getPrototypeOf(IfStatement).call(this, [if_text, cond, then_text, branch]));

        _this13.color = 'LightBlue';
        return _this13;
    }

    _createClass(IfStatement, [{
        key: 'onmouseclick',
        value: function onmouseclick(pos) {
            this.performReduction();
        }
    }, {
        key: 'reduce',
        value: function reduce() {
            if (!this.cond || !this.branch) return this; // irreducible
            var cond_val = this.cond.value();
            if (cond_val === true && this.branch instanceof MissingExpression) return this; // true can't reduce to nothing but false can.
            if (cond_val === true) return this.branch; // return the inner branch
            else if (cond_val === false) return this.emptyExpr; // disappear
                else return this; // something's not reducable...
        }
    }, {
        key: 'playJimmyAnimation',
        value: function playJimmyAnimation(onComplete) {
            Resource.play('key-jiggle');
            this.opacity = 1.0;
            Animate.tween(this, { 'opacity': 0 }, 500).after(onComplete);
            //Animate.wait(Resource.getAudio('key-jiggle').duration * 1000).after(onComplete);
        }
    }, {
        key: 'playUnlockAnimation',
        value: function playUnlockAnimation(onComplete) {
            Resource.play('key-unlock');
            Animate.wait(150).after(onComplete);
        }
    }, {
        key: 'performReduction',
        value: function performReduction() {
            var _this14 = this;

            var reduction = this.reduce();
            if (reduction != this) {
                (function () {

                    var stage = _this14.stage;
                    var afterEffects = function afterEffects() {
                        _get(Object.getPrototypeOf(IfStatement.prototype), 'performReduction', _this14).call(_this14);
                        stage.update();
                        stage.draw();
                    };

                    if (reduction === null) _this14.playJimmyAnimation(afterEffects);else _this14.playUnlockAnimation(afterEffects);

                    //var shatter = new ShatterExpressionEffect(this);
                    //shatter.run(stage, (() => {
                    //    super.performReduction();
                    //}).bind(this));
                })();
            }
        }
    }, {
        key: 'value',
        value: function value() {
            return undefined;
        }
    }, {
        key: 'toString',
        value: function toString() {
            return '(if ' + this.cond.toString() + ' ' + this.branch.toString() + ')';
        }
    }, {
        key: 'cond',
        get: function get() {
            return this.holes[1];
        }
    }, {
        key: 'branch',
        get: function get() {
            return this.holes[3];
        }
    }, {
        key: 'emptyExpr',
        get: function get() {
            return null;
        }
    }, {
        key: 'constructorArgs',
        get: function get() {
            return [this.cond.clone(), this.branch.clone()];
        }
    }]);

    return IfStatement;
}(Expression);

// A simpler graphical form of if.


var ArrowIfStatement = function (_IfStatement) {
    _inherits(ArrowIfStatement, _IfStatement);

    function ArrowIfStatement(cond, branch) {
        _classCallCheck(this, ArrowIfStatement);

        var _this15 = _possibleConstructorReturn(this, Object.getPrototypeOf(ArrowIfStatement).call(this, cond, branch));

        var arrow = new TextExpr('→');
        arrow.color = 'black';
        _this15.holes = [cond, arrow, branch];
        return _this15;
    }

    _createClass(ArrowIfStatement, [{
        key: 'cond',
        get: function get() {
            return this.holes[0];
        }
    }, {
        key: 'branch',
        get: function get() {
            return this.holes[2];
        }
    }]);

    return ArrowIfStatement;
}(IfStatement);

var IfElseStatement = function (_IfStatement2) {
    _inherits(IfElseStatement, _IfStatement2);

    function IfElseStatement(cond, branch, elseBranch) {
        _classCallCheck(this, IfElseStatement);

        var _this16 = _possibleConstructorReturn(this, Object.getPrototypeOf(IfElseStatement).call(this, cond, branch));

        var txt = new TextExpr('else');
        txt.color = 'black';
        _this16.addArg(txt);
        _this16.addArg(elseBranch);
        return _this16;
    }

    _createClass(IfElseStatement, [{
        key: 'reduce',
        value: function reduce() {
            if (!this.cond || !this.branch || !this.elseBranch) return this; // irreducible
            var cond_val = this.cond.value();
            console.log(this.cond, cond_val);
            if (cond_val === true) return this.branch; // return the inner branch
            else if (cond_val === false) return this.elseBranch; // disappear
                else return this; // something's not reducable...
        }
    }, {
        key: 'toString',
        value: function toString() {
            return '(if ' + this.cond.toString() + ' ' + this.branch.toString() + ' ' + this.elseBranch.toString() + ')';
        }
    }, {
        key: 'elseBranch',
        get: function get() {
            return this.holes[4];
        }
    }, {
        key: 'constructorArgs',
        get: function get() {
            return [this.cond.clone(), this.branch.clone(), this.elseBranch.clone()];
        }
    }]);

    return IfElseStatement;
}(IfStatement);

// Lock and key metaphor for if.


var LockIfStatement = function (_IfStatement3) {
    _inherits(LockIfStatement, _IfStatement3);

    function LockIfStatement(cond, branch) {
        _classCallCheck(this, LockIfStatement);

        var _this17 = _possibleConstructorReturn(this, Object.getPrototypeOf(LockIfStatement).call(this, cond, branch));

        _this17.holes = [cond, branch];

        var bluebg = new RoundedRect(0, 0, 25, 25);
        bluebg.color = "#2484f5";
        _this17._bg = bluebg;

        var top = new ImageRect(0, 0, 112 / 2.0, 74 / 2.0, 'lock-top-locked');
        _this17._top = top;

        var shinewrap = new PatternRect(0, 0, 24, 100, 'shinewrap');
        shinewrap.opacity = 0.8;
        _this17._shinewrap = shinewrap;
        return _this17;
    }

    _createClass(LockIfStatement, [{
        key: 'playJimmyAnimation',
        value: function playJimmyAnimation(onComplete) {
            var _this18 = this;

            Resource.play('key-jiggle');
            Animate.wait(Resource.getAudio('key-jiggle').duration * 1000).after(onComplete);
            if (this.stage) this.stage.draw();

            var pos = this.pos;
            Animate.tween(this, { 'pos': { x: pos.x + 16, y: pos.y } }, 100).after(function () {
                Animate.tween(_this18, { 'pos': { x: pos.x - 16, y: pos.y } }, 100).after(function () {
                    Animate.tween(_this18, { 'pos': { x: pos.x, y: pos.y } }, 100).after(function () {
                        Animate.wait(300).after(function () {
                            _this18.opacity = 1.0;
                            _this18._shinewrap.opacity = 0;
                            Animate.tween(_this18, { 'opacity': 0 }, 100).after(function () {
                                _this18.opacity = 0;
                                if (_this18.stage) {
                                    var _stage3 = _this18.stage;
                                    _stage3.remove(_this18);
                                    _stage3.draw();
                                }
                            });
                        });
                    });
                });
            });
        }
    }, {
        key: 'playUnlockAnimation',
        value: function playUnlockAnimation(onComplete) {
            var _this19 = this;

            Resource.play('key-unlock');
            Animate.wait(600).after(onComplete);

            Animate.wait(200).after(function () {
                _this19._top.image = 'lock-top-unlocked';
                _this19._top.size = { w: _this19._top.size.w, h: 128 / 2 };
                _this19._shinewrap.opacity = 0;
                if (_this19.stage) _this19.stage.draw();
            });
        }
    }, {
        key: 'drawInternal',
        value: function drawInternal(pos, boundingSize) {
            _get(Object.getPrototypeOf(LockIfStatement.prototype), 'drawInternal', this).call(this, pos, boundingSize);

            var ctx = this.ctx;
            var condsz = this.cond.absoluteSize;

            var bgsz = { w: condsz.w + 14, h: condsz.h + 16 };
            var bgpos = addPos(pos, { x: -(bgsz.w - condsz.w) / 2.0 + this.cond.pos.x, y: -(bgsz.h - condsz.h) / 2.0 + 3 });
            var topsz = this._top.size;
            var wrapsz = { w: boundingSize.w - condsz.w, h: boundingSize.h };
            var wrappos = { x: bgpos.x + bgsz.w, y: pos.y };

            this._shinewrap.size = wrapsz;
            this._shinewrap.pos = wrappos;

            this._bg.ctx = ctx;
            this._bg.stroke = this.stroke;
            this._top.ctx = ctx;

            this._bg.drawInternal(bgpos, bgsz);
            this._top.drawInternal(addPos(bgpos, { x: bgsz.w / 2.0 - topsz.w / 2.0, y: -topsz.h }), topsz);
        }
    }, {
        key: 'drawInternalAfterChildren',
        value: function drawInternalAfterChildren(pos, boundingSize) {
            var ctx = this.ctx;
            this._shinewrap.ctx = ctx;

            if ((!this.opacity || this.opacity > 0) && this._shinewrap.opacity > 0 && !(this.branch instanceof MissingExpression)) {
                ctx.save();
                roundRect(ctx, pos.x, pos.y, boundingSize.w, boundingSize.h, this.radius * this.absoluteScale.x, false, false);
                ctx.clip();

                ctx.globalCompositeOperation = "screen";
                ctx.globalAlpha = this._shinewrap.opacity;
                this._shinewrap.drawInternal(this._shinewrap.pos, this._shinewrap.size);
                ctx.restore();
            }
        }
    }, {
        key: 'cond',
        get: function get() {
            return this.holes[0];
        }
    }, {
        key: 'branch',
        get: function get() {
            return this.holes[1];
        }
    }]);

    return LockIfStatement;
}(IfStatement);

var InlineLockIfStatement = function (_IfStatement4) {
    _inherits(InlineLockIfStatement, _IfStatement4);

    function InlineLockIfStatement(cond, branch) {
        _classCallCheck(this, InlineLockIfStatement);

        var _this20 = _possibleConstructorReturn(this, Object.getPrototypeOf(InlineLockIfStatement).call(this, cond, branch));

        var lock = new ImageExpr(0, 0, 56, 56, 'lock-icon');
        lock.lock();
        _this20.holes = [cond, lock, branch];
        return _this20;
    }

    _createClass(InlineLockIfStatement, [{
        key: 'playJimmyAnimation',
        value: function playJimmyAnimation(onComplete) {
            var _this21 = this;

            _get(Object.getPrototypeOf(InlineLockIfStatement.prototype), 'playJimmyAnimation', this).call(this, onComplete);

            this.opacity = 1.0;
            Animate.tween(this, { 'opacity': 0 }, 100).after(function () {
                _this21.opacity = 0;
                if (_this21.stage) {
                    var _stage4 = _this21.stage;
                    _stage4.remove(_this21);
                    _stage4.draw();
                }
            });
        }
    }, {
        key: 'playUnlockAnimation',
        value: function playUnlockAnimation(onComplete) {
            this.holes[1].image = 'lock-icon-unlocked';
            _get(Object.getPrototypeOf(InlineLockIfStatement.prototype), 'playUnlockAnimation', this).call(this, onComplete);
        }
    }, {
        key: 'cond',
        get: function get() {
            return this.holes[0];
        }
    }, {
        key: 'branch',
        get: function get() {
            return this.holes[2];
        }
    }]);

    return InlineLockIfStatement;
}(IfStatement);

var KeyTrueExpr = function (_TrueExpr) {
    _inherits(KeyTrueExpr, _TrueExpr);

    function KeyTrueExpr() {
        _classCallCheck(this, KeyTrueExpr);

        var _this22 = _possibleConstructorReturn(this, Object.getPrototypeOf(KeyTrueExpr).call(this));

        _this22.holes = [];
        _this22.children = [];

        var key = new ImageExpr(0, 0, 56, 28, 'key-icon');
        key.lock();
        _this22.addArg(key);
        _this22.graphicNode = key;
        return _this22;
    }

    _createClass(KeyTrueExpr, [{
        key: 'onmouseclick',
        value: function onmouseclick(pos) {

            // Clicking on the key in a lock (if statement) will act as if they clicked the if statement.
            if (this.parent && this.parent instanceof IfStatement && this.parent.cond == this) this.parent.onmouseclick(pos);else _get(Object.getPrototypeOf(KeyTrueExpr.prototype), 'onmouseclick', this).call(this, pos);
        }
    }]);

    return KeyTrueExpr;
}(TrueExpr);

var KeyFalseExpr = function (_FalseExpr) {
    _inherits(KeyFalseExpr, _FalseExpr);

    function KeyFalseExpr() {
        _classCallCheck(this, KeyFalseExpr);

        var _this23 = _possibleConstructorReturn(this, Object.getPrototypeOf(KeyFalseExpr).call(this));

        _this23.holes = [];
        _this23.children = [];

        var key = new ImageExpr(0, 0, 56, 34, 'broken-key-icon');
        key.lock();
        _this23.addArg(key);
        _this23.graphicNode = key;
        return _this23;
    }

    _createClass(KeyFalseExpr, [{
        key: 'onmouseclick',
        value: function onmouseclick(pos) {

            // Clicking on the key in a lock (if statement) will act as if they clicked the if statement.
            if (this.parent && this.parent instanceof IfStatement && this.parent.cond == this) this.parent.onmouseclick(pos);else _get(Object.getPrototypeOf(KeyFalseExpr.prototype), 'onmouseclick', this).call(this, pos);
        }
    }]);

    return KeyFalseExpr;
}(FalseExpr);

// A boolean compare function like ==, !=, >, >=, <=, <.


var CompareExpr = function (_Expression6) {
    _inherits(CompareExpr, _Expression6);

    _createClass(CompareExpr, null, [{
        key: 'operatorMap',
        value: function operatorMap() {
            return { '==': 'is', '!=': 'is not' };
        }
    }, {
        key: 'textForFuncName',
        value: function textForFuncName(fname) {
            var map = CompareExpr.operatorMap();
            if (fname in map) return map[fname];else return fname;
        }
    }]);

    function CompareExpr(b1, b2) {
        var compareFuncName = arguments.length <= 2 || arguments[2] === undefined ? '==' : arguments[2];

        _classCallCheck(this, CompareExpr);

        var compare_text = new TextExpr(CompareExpr.textForFuncName(compareFuncName));
        compare_text.color = 'black';

        var _this24 = _possibleConstructorReturn(this, Object.getPrototypeOf(CompareExpr).call(this, [b1, compare_text, b2]));

        _this24.funcName = compareFuncName;
        _this24.color = "HotPink";
        _this24.padding = { left: 20, inner: 10, right: 30 };
        return _this24;
    }

    _createClass(CompareExpr, [{
        key: 'onmouseclick',
        value: function onmouseclick(pos) {
            console.log('Expressions are equal: ', this.compare());
            this.performReduction();
        }
    }, {
        key: 'reduce',
        value: function reduce() {
            var cmp = this.compare();
            if (cmp === true) return new (ExprManager.getClass('true'))();else if (cmp === false) return new (ExprManager.getClass('false'))();else return this;
        }
    }, {
        key: 'performReduction',
        value: function performReduction() {
            var _this25 = this;

            var animated = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

            if (this.reduce() != this) {
                if (animated) {
                    var shatter = new ShatterExpressionEffect(this);
                    shatter.run(stage, function () {
                        _this25.ignoreEvents = false;
                        _get(Object.getPrototypeOf(CompareExpr.prototype), 'performReduction', _this25).call(_this25);
                    }.bind(this));
                    this.ignoreEvents = true;
                } else _get(Object.getPrototypeOf(CompareExpr.prototype), 'performReduction', this).call(this);
            }
        }
    }, {
        key: 'compare',
        value: function compare() {
            if (this.funcName === '==') {
                var lval = this.leftExpr.value();
                var rval = this.rightExpr.value();

                // Variables that are equal reduce to TRUE, regardless of whether they are bound!!
                if (!lval && !rval && this.leftExpr instanceof LambdaVarExpr && this.rightExpr instanceof LambdaVarExpr) return this.leftExpr.name === this.rightExpr.name;

                //console.log('leftexpr', this.leftExpr.constructor.name, this.leftExpr instanceof LambdaVarExpr, lval);
                //console.log('rightexpr', this.rightExpr.constructor.name, rval);

                if (lval === undefined || rval === undefined) return undefined;else if (Array.isArray(lval) && Array.isArray(rval)) return setCompare(lval, rval, function (e, f) {
                    return e.toString() === f.toString();
                });else return lval === rval;
            } else if (this.funcName === '!=') {
                return this.leftExpr.value() !== this.rightExpr.value();
            } else {
                console.warn('Compare function "' + this.funcName + '" not implemented.');
                return false;
            }
        }
    }, {
        key: 'drawInternal',
        value: function drawInternal(pos, boundingSize) {
            this.ctx.fillStyle = 'black';
            setStrokeStyle(this.ctx, this.stroke);
            if (this.shadowOffset !== 0) {
                hexaRect(this.ctx, pos.x, pos.y + this.shadowOffset, boundingSize.w, boundingSize.h, true, this.stroke ? true : false, this.stroke ? this.stroke.opacity : null);
            }
            this.ctx.fillStyle = this.color;
            hexaRect(this.ctx, pos.x, pos.y, boundingSize.w, boundingSize.h, true, this.stroke ? true : false, this.stroke ? this.stroke.opacity : null);
        }
    }, {
        key: 'toString',
        value: function toString() {
            return '(' + this.funcName + ' ' + this.leftExpr.toString() + ' ' + this.rightExpr.toString() + ')';
        }
    }, {
        key: 'constructorArgs',
        get: function get() {
            return [this.holes[0].clone(), this.holes[2].clone(), this.funcName];
        }
    }, {
        key: 'leftExpr',
        get: function get() {
            return this.holes[0];
        }
    }, {
        key: 'rightExpr',
        get: function get() {
            return this.holes[2];
        }
    }]);

    return CompareExpr;
}(Expression);

var FadedCompareExpr = function (_CompareExpr) {
    _inherits(FadedCompareExpr, _CompareExpr);

    function FadedCompareExpr(b1, b2) {
        var compareFuncName = arguments.length <= 2 || arguments[2] === undefined ? '==' : arguments[2];

        _classCallCheck(this, FadedCompareExpr);

        var _this26 = _possibleConstructorReturn(this, Object.getPrototypeOf(FadedCompareExpr).call(this, b1, b2, compareFuncName));

        _this26.holes[1].text = compareFuncName;
        return _this26;
    }

    return FadedCompareExpr;
}(CompareExpr);

var MirrorCompareExpr = function (_CompareExpr2) {
    _inherits(MirrorCompareExpr, _CompareExpr2);

    function MirrorCompareExpr(b1, b2) {
        var compareFuncName = arguments.length <= 2 || arguments[2] === undefined ? '==' : arguments[2];

        _classCallCheck(this, MirrorCompareExpr);

        var _this27 = _possibleConstructorReturn(this, Object.getPrototypeOf(MirrorCompareExpr).call(this, b1, b2, compareFuncName));

        _this27.children = [];
        _this27.holes = [];
        _this27.padding = { left: 20, inner: 0, right: 40 };

        _this27.addArg(b1);

        // Mirror graphic
        var mirror = new MirrorExpr(0, 0, 86, 86);
        mirror.exprInMirror = b2.clone();
        _this27.addArg(mirror);

        _this27.addArg(b2);
        return _this27;
    }

    _createClass(MirrorCompareExpr, [{
        key: 'expressionToMirror',
        value: function expressionToMirror() {
            var isMirrorable = function isMirrorable(expr) {
                return !(!expr || expr instanceof LambdaVarExpr || expr instanceof MissingExpression);
            };
            if (isMirrorable(this.leftExpr)) return this.leftExpr.clone();else if (isMirrorable(this.rightExpr)) return this.rightExpr.clone();else return null;
        }
    }, {
        key: 'update',
        value: function update() {
            _get(Object.getPrototypeOf(MirrorCompareExpr.prototype), 'update', this).call(this);
            if (this.reduce() != this) {
                this.mirror.exprInMirror = new (ExprManager.getClass('true'))().graphicNode;
                this.mirror.broken = !this.compare();
            } else {
                this.mirror.exprInMirror = this.expressionToMirror();
                this.mirror.broken = false;
            }
        }

        // Animation effects

    }, {
        key: 'performReduction',
        value: function performReduction() {
            var _this28 = this;

            if (!this.isReducing && this.reduce() != this) {
                var stage = this.stage;
                var shatter = new MirrorShatterEffect(this.mirror);
                shatter.run(stage, function () {
                    _this28.ignoreEvents = false;
                    _get(Object.getPrototypeOf(MirrorCompareExpr.prototype), 'performReduction', _this28).call(_this28, false);
                }.bind(this));
                this.ignoreEvents = true;
                this.isReducing = true;
            }
        }
    }, {
        key: 'constructorArgs',
        get: function get() {
            return [this.holes[0].clone(), this.holes[2].clone(), this.funcName];
        }
    }, {
        key: 'leftExpr',
        get: function get() {
            return this.holes[0];
        }
    }, {
        key: 'mirror',
        get: function get() {
            return this.holes[1];
        }
    }, {
        key: 'rightExpr',
        get: function get() {
            return this.holes[2];
        }
    }]);

    return MirrorCompareExpr;
}(CompareExpr);

// Integers


var NumberExpr = function (_Expression7) {
    _inherits(NumberExpr, _Expression7);

    function NumberExpr(num) {
        _classCallCheck(this, NumberExpr);

        var _this29 = _possibleConstructorReturn(this, Object.getPrototypeOf(NumberExpr).call(this, [new DiceNumber(num)]));

        _this29.number = num;
        _this29.color = 'Ivory';
        _this29.highlightColor = 'OrangeRed';
        return _this29;
    }

    _createClass(NumberExpr, [{
        key: 'value',
        value: function value() {
            return this.number;
        }
    }, {
        key: 'toString',
        value: function toString() {
            return this.number.toString();
        }
    }, {
        key: 'constructorArgs',
        get: function get() {
            return [this.number];
        }
    }]);

    return NumberExpr;
}(Expression);

// Draws the circles for a dice number inside its boundary.


var DiceNumber = function (_Rect) {
    _inherits(DiceNumber, _Rect);

    _createClass(DiceNumber, null, [{
        key: 'drawPositionsFor',
        value: function drawPositionsFor(num) {
            var L = 0.15;
            var T = L;
            var R = 1.0 - L;
            var B = R;
            var M = 0.5;
            var map = {
                0: [],
                1: [{ x: M, y: M }],
                2: [{ x: L, y: T }, { x: R, y: B }],
                3: [{ x: R, y: T }, { x: M, y: M }, { x: L, y: B }],
                4: [{ x: L, y: T }, { x: R, y: T }, { x: R, y: B }, { x: L, y: B }],
                5: [{ x: L, y: T }, { x: R, y: T }, { x: R, y: B }, { x: L, y: B }, { x: M, y: M }],
                6: [{ x: L, y: T }, { x: R, y: T }, { x: R, y: M }, { x: R, y: B }, { x: L, y: B }, { x: L, y: M }]
            };
            if (num in map) return map[num];else {
                console.error('Dice pos array does not exist for number ' + num + '.');
                return [];
            }
        }
    }]);

    function DiceNumber(num) {
        var radius = arguments.length <= 1 || arguments[1] === undefined ? 6 : arguments[1];

        _classCallCheck(this, DiceNumber);

        var _this30 = _possibleConstructorReturn(this, Object.getPrototypeOf(DiceNumber).call(this, 0, 0, 44, 44));

        _this30.number = num;
        _this30.circlePos = DiceNumber.drawPositionsFor(num);
        _this30.radius = radius;
        _this30.color = 'black';
        return _this30;
    }

    _createClass(DiceNumber, [{
        key: 'hits',
        value: function hits(pos, options) {
            return false;
        }
    }, {
        key: 'drawInternal',
        value: function drawInternal(pos, boundingSize) {
            var _this31 = this;

            if (this.circlePos && this.circlePos.length > 0) {
                (function () {

                    var ctx = _this31.ctx;
                    var rad = _this31.radius * boundingSize.w / _this31.size.w;
                    var fill = _this31.color;
                    var stroke = _this31.stroke;
                    _this31.circlePos.forEach(function (relpos) {
                        var drawpos = { x: pos.x + boundingSize.w * relpos.x - rad, y: pos.y + boundingSize.h * relpos.y - rad };
                        drawCircle(ctx, drawpos.x, drawpos.y, rad, fill, stroke);
                    });
                })();
            }
        }
    }, {
        key: 'constructorArgs',
        get: function get() {
            return [this.number, this.radius];
        }
    }]);

    return DiceNumber;
}(Rect);

// Wrapper class to make arbitrary nodes into draggable expressions.


var VarExpr = function (_Expression8) {
    _inherits(VarExpr, _Expression8);

    function VarExpr() {
        _classCallCheck(this, VarExpr);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(VarExpr).apply(this, arguments));
    }

    return VarExpr;
}(Expression);

var GraphicVarExpr = function (_VarExpr) {
    _inherits(GraphicVarExpr, _VarExpr);

    function GraphicVarExpr(graphic_node) {
        _classCallCheck(this, GraphicVarExpr);

        var _this33 = _possibleConstructorReturn(this, Object.getPrototypeOf(GraphicVarExpr).call(this, [graphic_node]));

        _this33.color = 'gold';
        return _this33;
    }

    _createClass(GraphicVarExpr, [{
        key: 'reduceCompletely',
        value: function reduceCompletely() {
            return this;
        }
    }, {
        key: 'reduce',
        value: function reduce() {
            return this;
        }

        //get size() { return this.holes[0].size; }

    }, {
        key: 'hits',
        value: function hits(pos, options) {
            if (this.ignoreEvents) return null;
            if (this.holes[0].hits(pos, options)) return this;else return null;
        }
    }, {
        key: 'onmouseenter',
        value: function onmouseenter(pos) {
            if (this.delegateToInner) this.holes[0].onmouseenter(pos);else _get(Object.getPrototypeOf(GraphicVarExpr.prototype), 'onmouseenter', this).call(this, pos);
        }
    }, {
        key: 'onmouseleave',
        value: function onmouseleave(pos) {
            if (!this.delegateToInner) _get(Object.getPrototypeOf(GraphicVarExpr.prototype), 'onmouseleave', this).call(this, pos);
            this.holes[0].onmouseleave(pos);
        }
    }, {
        key: 'drawInternal',
        value: function drawInternal(pos, boundingSize) {
            if (!this.delegateToInner) {
                this._color = '#777';
                _get(Object.getPrototypeOf(GraphicVarExpr.prototype), 'drawInternal', this).call(this, pos, boundingSize);
            }
        }
    }, {
        key: 'value',
        value: function value() {
            return this.holes[0].value();
        }
    }, {
        key: 'color',
        get: function get() {
            return _get(Object.getPrototypeOf(GraphicVarExpr.prototype), 'color', this);
        },
        set: function set(clr) {
            this.holes[0].color = clr;
        }
    }, {
        key: 'delegateToInner',
        get: function get() {
            return this.ignoreEvents || !this.parent || !(this.parent instanceof Expression);
        }
    }, {
        key: 'graphicNode',
        get: function get() {
            return this.holes[0];
        }
    }]);

    return GraphicVarExpr;
}(VarExpr);

var StarExpr = function (_GraphicVarExpr) {
    _inherits(StarExpr, _GraphicVarExpr);

    function StarExpr(x, y, rad) {
        var pts = arguments.length <= 3 || arguments[3] === undefined ? 5 : arguments[3];

        _classCallCheck(this, StarExpr);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(StarExpr).call(this, new Star(x, y, rad, pts)));
    }

    _createClass(StarExpr, [{
        key: 'toString',
        value: function toString() {
            return 'star';
        }
    }]);

    return StarExpr;
}(GraphicVarExpr);

var CircleExpr = function (_GraphicVarExpr2) {
    _inherits(CircleExpr, _GraphicVarExpr2);

    function CircleExpr(x, y, rad) {
        _classCallCheck(this, CircleExpr);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(CircleExpr).call(this, new Circle(x, y, rad)));
    }

    _createClass(CircleExpr, [{
        key: 'toString',
        value: function toString() {
            return 'circle';
        }
    }]);

    return CircleExpr;
}(GraphicVarExpr);

var PipeExpr = function (_GraphicVarExpr3) {
    _inherits(PipeExpr, _GraphicVarExpr3);

    function PipeExpr(x, y, w, h) {
        _classCallCheck(this, PipeExpr);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(PipeExpr).call(this, new Pipe(x, y, w, h - 12)));
    }

    _createClass(PipeExpr, [{
        key: 'toString',
        value: function toString() {
            return 'pipe';
        }
    }]);

    return PipeExpr;
}(GraphicVarExpr);

var TriangleExpr = function (_GraphicVarExpr4) {
    _inherits(TriangleExpr, _GraphicVarExpr4);

    function TriangleExpr(x, y, w, h) {
        _classCallCheck(this, TriangleExpr);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(TriangleExpr).call(this, new Triangle(x, y, w, h)));
    }

    _createClass(TriangleExpr, [{
        key: 'toString',
        value: function toString() {
            return 'triangle';
        }
    }]);

    return TriangleExpr;
}(GraphicVarExpr);

var RectExpr = function (_GraphicVarExpr5) {
    _inherits(RectExpr, _GraphicVarExpr5);

    function RectExpr(x, y, w, h) {
        _classCallCheck(this, RectExpr);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(RectExpr).call(this, new Rect(x, y, w, h)));
    }

    _createClass(RectExpr, [{
        key: 'toString',
        value: function toString() {
            return 'diamond';
        }
    }]);

    return RectExpr;
}(GraphicVarExpr);

var ImageExpr = function (_GraphicVarExpr6) {
    _inherits(ImageExpr, _GraphicVarExpr6);

    function ImageExpr(x, y, w, h, resource_key) {
        _classCallCheck(this, ImageExpr);

        var _this39 = _possibleConstructorReturn(this, Object.getPrototypeOf(ImageExpr).call(this, new ImageRect(x, y, w, h, resource_key)));

        _this39._image = resource_key;
        return _this39;
    }

    _createClass(ImageExpr, [{
        key: 'toString',
        value: function toString() {
            return this._image;
        }
    }, {
        key: 'image',
        get: function get() {
            return this._image;
        },
        set: function set(img) {
            this._image = img;
            this.graphicNode.image = img;
        }
    }]);

    return ImageExpr;
}(GraphicVarExpr);

var FunnelExpr = function (_ImageExpr) {
    _inherits(FunnelExpr, _ImageExpr);

    function FunnelExpr(x, y, w, h) {
        _classCallCheck(this, FunnelExpr);

        var _this40 = _possibleConstructorReturn(this, Object.getPrototypeOf(FunnelExpr).call(this, x, y, w, h, 'funnel'));

        _this40.graphicNode.anchor = { x: 0, y: 0.5 };
        return _this40;
    }

    _createClass(FunnelExpr, [{
        key: 'update',
        value: function update() {}
    }, {
        key: 'onmouseenter',
        value: function onmouseenter() {
            this.graphicNode.image = 'funnel-selected';
        }
    }, {
        key: 'onmouseleave',
        value: function onmouseleave() {
            this.graphicNode.image = 'funnel';
        }
    }, {
        key: 'drawInternal',
        value: function drawInternal(pos, boundingSize) {}
    }, {
        key: 'size',
        get: function get() {
            return this.graphicNode.size;
        }
    }]);

    return FunnelExpr;
}(ImageExpr);

var NullExpr = function (_ImageExpr2) {
    _inherits(NullExpr, _ImageExpr2);

    function NullExpr(x, y, w, h) {
        _classCallCheck(this, NullExpr);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(NullExpr).call(this, x, y, w, h, 'null-circle'));
    }

    _createClass(NullExpr, [{
        key: 'reduce',
        value: function reduce() {
            return null; // hmmmm
        }
    }, {
        key: 'performReduction',
        value: function performReduction() {
            Animate.poof(this);
            _get(Object.getPrototypeOf(NullExpr.prototype), 'performReduction', this).call(this);
        }
    }, {
        key: 'onmousehover',
        value: function onmousehover() {
            this.image = 'null-circle-highlight';
        }
    }, {
        key: 'onmouseleave',
        value: function onmouseleave() {
            this.image = 'null-circle';
        }
    }, {
        key: 'onmouseclick',
        value: function onmouseclick() {
            this.performReduction();
        }
    }, {
        key: 'toString',
        value: function toString() {
            return 'null';
        }
    }, {
        key: 'value',
        value: function value() {
            return null;
        }
    }]);

    return NullExpr;
}(ImageExpr);

var MirrorExpr = function (_ImageExpr3) {
    _inherits(MirrorExpr, _ImageExpr3);

    function MirrorExpr(x, y, w, h) {
        _classCallCheck(this, MirrorExpr);

        var _this42 = _possibleConstructorReturn(this, Object.getPrototypeOf(MirrorExpr).call(this, x, y, w, h, 'mirror-icon'));

        _this42.lock();
        _this42.graphicNode.offset = { x: 0, y: -10 };
        _this42.innerExpr = null;
        _this42._broken = false;
        return _this42;
    }

    _createClass(MirrorExpr, [{
        key: 'drawInternalAfterChildren',
        value: function drawInternalAfterChildren(pos, boundingSize) {
            if (!this.innerExpr) return;

            var ctx = this.ctx;

            ctx.save();
            ctx.globalCompositeOperation = "overlay";
            this.innerExpr.parent = this.graphicNode;
            this.innerExpr.pos = { x: this.graphicNode.size.w / 2.0, y: this.graphicNode.size.h / 2.0 };
            this.innerExpr.anchor = { x: 0.5, y: 0.8 };
            this.innerExpr.ctx = ctx;
            this.innerExpr.draw();
            ctx.restore();
        }
    }, {
        key: 'exprInMirror',
        set: function set(e) {
            this.innerExpr = e;

            if (e) {
                e.scale = { x: 1, y: 1 };
                e.parent = this.graphicNode;
                e.update();
            }
        },
        get: function get() {
            return this.innerExpr;
        }
    }, {
        key: 'broken',
        set: function set(b) {
            this._broken = b;
            if (b) this.graphicNode.image = 'mirror-icon-broken';else this.graphicNode.image = 'mirror-icon';
        },
        get: function get() {
            return this._broken;
        }
    }]);

    return MirrorExpr;
}(ImageExpr);

/** Collections */


var PutExpr = function (_Expression9) {
    _inherits(PutExpr, _Expression9);

    function PutExpr(item, collection) {
        _classCallCheck(this, PutExpr);

        var txt_put = new TextExpr('put');
        var txt_in = new TextExpr('in');
        txt_put.color = 'black';
        txt_in.color = 'black';

        var _this43 = _possibleConstructorReturn(this, Object.getPrototypeOf(PutExpr).call(this, [txt_put, item, txt_in, collection]));

        _this43.color = 'violet';
        return _this43;
    }

    _createClass(PutExpr, [{
        key: 'onmouseclick',
        value: function onmouseclick() {
            this.performReduction();
        }
    }, {
        key: 'reduce',
        value: function reduce() {
            if (!this.item || !this.collection || this.item instanceof MissingExpression || this.item instanceof LambdaVarExpr || // You can't put a pipe into a bag with PUT; it's confusing...
            this.collection instanceof MissingExpression) return this;else if (!(this.collection instanceof CollectionExpr)) {
                console.error('@ PutExpr.reduce: Input is not a Collection.', this.collection);
                return this;
            } else {
                var new_coll = this.collection.clone();
                new_coll.addItem(this.item.clone()); // add item to bag
                return new_coll; // return new bag with item appended
            }
        }
    }, {
        key: 'toString',
        value: function toString() {
            return '(put ' + this.item.toString() + ' ' + this.collection.toString() + ')';
        }
    }, {
        key: 'item',
        get: function get() {
            return this.holes[1];
        }
    }, {
        key: 'collection',
        get: function get() {
            return this.holes[3];
        }
    }, {
        key: 'constructorArgs',
        get: function get() {
            return [this.item.clone(), this.collection.clone()];
        }
    }]);

    return PutExpr;
}(Expression);

var PopExpr = function (_Expression10) {
    _inherits(PopExpr, _Expression10);

    function PopExpr(collection) {
        _classCallCheck(this, PopExpr);

        var txt_pop = new TextExpr('pop');
        txt_pop.color = 'black';

        var _this44 = _possibleConstructorReturn(this, Object.getPrototypeOf(PopExpr).call(this, [txt_pop, collection]));

        _this44.color = 'violet';
        return _this44;
    }

    _createClass(PopExpr, [{
        key: 'onmouseclick',
        value: function onmouseclick() {
            this.performReduction();
        }
    }, {
        key: 'reduce',
        value: function reduce() {
            if (!this.collection || this.collection instanceof MissingExpression) return this;else {
                var item = this.collection.items[0].clone();
                return item;
            }
        }
    }, {
        key: 'toString',
        value: function toString() {
            return '(pop ' + this.collection.toString() + ')';
        }
    }, {
        key: 'collection',
        get: function get() {
            return this.holes[1];
        }
    }, {
        key: 'constructorArgs',
        get: function get() {
            return [this.collection.clone()];
        }
    }]);

    return PopExpr;
}(Expression);

// Analogous to 'define' in Scheme.


var DefineExpr = function (_Expression11) {
    _inherits(DefineExpr, _Expression11);

    function DefineExpr(expr) {
        _classCallCheck(this, DefineExpr);

        var txt_define = new TextExpr('define');
        txt_define.color = 'black';

        var _this45 = _possibleConstructorReturn(this, Object.getPrototypeOf(DefineExpr).call(this, [txt_define, expr]));

        _this45.color = 'OrangeRed';
        return _this45;
    }

    _createClass(DefineExpr, [{
        key: 'onmouseclick',
        value: function onmouseclick() {
            this.performReduction();
        }
    }, {
        key: 'reduce',
        value: function reduce() {
            if (!this.expr || this.expr instanceof MissingExpression) return this;else {

                // For now, prompt the user for a function name:
                var funcname = window.prompt("What do you want to call it?", "foo");
                if (funcname) {
                    funcname = funcname.trim(); // remove trailing whitespace

                    // Check that name has no spaces etc...
                    if (funcname.indexOf(/\s+/g) === -1) {

                        var args = [];
                        var numargs = 0;
                        if (this.expr instanceof LambdaExpr) numargs = this.expr.numOfNestedLambdas();
                        for (var i = 0; i < numargs; i++) {
                            args.push(new MissingExpression());
                        } // Return named function (expression).
                        return new NamedExpr(funcname, this.expr.clone(), args);
                    } else {
                        window.alert("Name can't have spaces. Try again with something simpler."); // cancel
                    }
                }

                return this; // cancel
            }
        }
    }, {
        key: 'toString',
        value: function toString() {
            return '(define ' + this.expr.toString() + ')';
        }
    }, {
        key: 'expr',
        get: function get() {
            return this.holes[1];
        }
    }, {
        key: 'constructorArgs',
        get: function get() {
            return [this.expr.clone()];
        }
    }]);

    return DefineExpr;
}(Expression);

// Acts as a named wrapper for a def'd expression.


var NamedExpr = function (_Expression12) {
    _inherits(NamedExpr, _Expression12);

    function NamedExpr(name, expr, args) {
        _classCallCheck(this, NamedExpr);

        var txt_name = new TextExpr(name);
        txt_name.color = 'black';
        var exprs = [txt_name];
        for (var i = 0; i < args.length; i++) {
            exprs.push(args[i].clone());
        }
        var _this46 = _possibleConstructorReturn(this, Object.getPrototypeOf(NamedExpr).call(this, exprs));

        _this46.color = 'orange';
        _this46.name = name;
        _this46._args = args.map(function (a) {
            return a.clone();
        });
        _this46._wrapped_expr = expr;
        return _this46;
    }

    _createClass(NamedExpr, [{
        key: 'onmouseclick',
        value: function onmouseclick() {
            this.performReduction();
        }
    }, {
        key: 'reduce',
        value: function reduce() {
            if (!this.expr || this.expr instanceof MissingExpression) return this;else {

                // This should 'reduce' by applying the arguments to the wrapped expression.
                // First, let's check that we HAVE arguments...
                var isValidArgument = function isValidArgument(a) {
                    return a && a instanceof Expression && !(a instanceof MissingExpression);
                };
                var validateAll = function validateAll(arr, testfunc) {
                    return arr.reduce(function (prev, x) {
                        return prev && testfunc(x);
                    }, true);
                };
                var args = this.args;
                if (args.length === 0 || validateAll(args, isValidArgument)) {
                    // true if all args valid

                    // All the arguments check out. Now we need to apply them.
                    var expr = this.expr;
                    if (args.length > 0) expr = args.reduce(function (lambdaExpr, arg) {
                        return lambdaExpr.applyExpr(arg);
                    }, expr); // Chains application to inner lambda expressions.

                    return expr.clone(); // to be safe we'll clone it.
                }
            }

            return this;
        }

        // Whoa... meta.

    }, {
        key: 'toString',
        value: function toString() {
            var s = '(' + name; // e.g. '(length'
            var args = this.args;
            for (var i = 0; i < args.length; i++) {
                s += ' ' + args[i].toString();
            }s += ')';
            return s;
        }
    }, {
        key: 'expr',
        get: function get() {
            return this._wrapped_expr.clone();
        }
    }, {
        key: 'args',
        get: function get() {
            return this.holes.slice(1).map(function (a) {
                return a.clone();
            });
        }
    }, {
        key: 'constructorArgs',
        get: function get() {
            return [this.name, this.expr.clone(), this.args];
        }
    }]);

    return NamedExpr;
}(Expression);

var CollectionExpr = function (_GraphicVarExpr7) {
    _inherits(CollectionExpr, _GraphicVarExpr7);

    function CollectionExpr() {
        _classCallCheck(this, CollectionExpr);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(CollectionExpr).apply(this, arguments));
    }

    return CollectionExpr;
}(GraphicVarExpr);

var BagExpr = function (_CollectionExpr) {
    _inherits(BagExpr, _CollectionExpr);

    function BagExpr(x, y, w, h) {
        var holding = arguments.length <= 4 || arguments[4] === undefined ? [] : arguments[4];

        _classCallCheck(this, BagExpr);

        //super(new Bag(x, y, w, h));
        var radius = (w + h) / 4.0;

        var _this48 = _possibleConstructorReturn(this, Object.getPrototypeOf(BagExpr).call(this, new Bag(x, y, radius)));

        _this48._items = holding;
        _this48.bigScale = 4;

        if (_this48.graphicNode) {
            _this48.graphicNode.color = 'tan';
            _this48.graphicNode.anchor = { x: 0.5, y: 0.5 };
        }

        //this.graphicNode.clipChildren = true;
        //this.graphicNode.clipBackground = 'bag-background';

        _this48.anchor = { x: 0.5, y: 0.5 };
        return _this48;
    }

    _createClass(BagExpr, [{
        key: 'arrangeNicely',
        value: function arrangeNicely() {
            var _this49 = this;

            var dotpos = DiceNumber.drawPositionsFor(this.items.length);
            if (dotpos.length > 0) {
                (function () {
                    // Arrange items according to dot positions.
                    var sz = _this49.graphicNode.size;
                    var topsz = _this49.graphicNode.topSize(sz.w / 2.0);
                    _this49.graphicNode.children.slice(1).forEach(function (e, idx) {
                        e.pos = { x: dotpos[idx].x * sz.w * 0.4 + topsz.w / 3.4, y: dotpos[idx].y * sz.h * 0.4 + topsz.h * 1.9 };
                    });
                })();
            }
        }
    }, {
        key: 'lock',
        value: function lock() {
            _get(Object.getPrototypeOf(BagExpr.prototype), 'lock', this).call(this);
            this.graphicNode.shadowOffset = this.shadowOffset;
        }
    }, {
        key: 'unlock',
        value: function unlock() {
            _get(Object.getPrototypeOf(BagExpr.prototype), 'unlock', this).call(this);
            this.graphicNode.shadowOffset = this.shadowOffset;
        }
    }, {
        key: 'addItem',


        // Adds an item to the bag.
        value: function addItem(item) {

            if (item.toolbox) {
                item.detach();
                item.toolbox = null;
            }

            var scale = 1.0 / this.bigScale;
            var center = this.graphicNode.size.w / 2.0;
            var x = (item.pos.x - this.pos.x) / (1.0 / scale) + center + item.size.w / 2.0 * scale;
            var y = (item.pos.y - this.pos.y) / (1.0 / scale) + center + item.size.h / 2.0 * scale;
            item.pos = { x: x, y: y };
            item.anchor = { x: 0.5, y: 0.5 };
            item.scale = { x: scale, y: scale };
            this._items.push(item);
            this.graphicNode.addItem(item);

            item.onmouseleave();

            this.arrangeNicely();
        }

        // Removes an item from the bag and returns it.

    }, {
        key: 'popItem',
        value: function popItem() {
            var _this50 = this;

            var item = this._items.pop();
            this.graphicNode.removeAllItems();
            this._items.forEach(function (item) {
                _this50.graphicNode.addItem(item);
            });
            return item;
        }

        // Applies a lambda function over every item in the bag and
        // returns a new bag containing the new items.

    }, {
        key: 'map',
        value: function map(lambdaExpr) {
            var _this51 = this;

            if (!(lambdaExpr instanceof LambdaExpr) || !lambdaExpr.takesArgument) {
                console.error('@ BagExpr.applyFunc: Func expr does not take argument.');
                return undefined;
            }
            var bag = this.clone();
            bag.graphicNode.children = [bag.graphicNode.children[0]];
            var items = bag.items;
            bag.items = [];
            var new_items = [];
            items.forEach(function (item) {
                var c = item.clone();
                var pos = item.pos;
                var func = lambdaExpr.clone();
                _this51.stage.add(func);
                func.update();
                var new_funcs = func.applyExpr(c);
                if (!Array.isArray(new_funcs)) new_funcs = [new_funcs];

                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = new_funcs[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var new_func = _step2.value;

                        _this51.stage.remove(new_func);
                        new_func.pos = pos;
                        new_func.unlockSubexpressions();
                        new_func.lockSubexpressions(function (expr) {
                            return expr instanceof VarExpr || expr instanceof FadedVarExpr || expr instanceof BooleanPrimitive;
                        }); // lock primitives
                        bag.addItem(new_func);
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
            });
            //bag.items = new_items;
            return bag;
        }

        // Spills the entire bag onto the play field.

    }, {
        key: 'spill',
        value: function spill() {
            var _this52 = this;

            if (!this.stage) {
                console.error('@ BagExpr.spill: Bag is not attached to a Stage.');
                return;
            } else if (this.parent) {
                console.error('@ BagExpr.spill: Cannot spill a bag while it\'s inside of another expression.');
                return;
            }

            var stage = this.stage;
            var items = this.items;
            var pos = this.pos;

            // GAME DESIGN CHOICE:
            // Remove the bag from the stage.
            // stage.remove(this);

            var before_str = stage.toString();
            var bag_before_str = this.toString();
            stage.saveState();
            Logger.log('state-save', stage.toString());

            // Add back all of this bags' items to the stage.
            items.forEach(function (item, index) {
                item = item.clone();
                var theta = index / items.length * Math.PI * 2;
                var rad = _this52.size.w * 1.5;
                var targetPos = addPos(pos, { x: rad * Math.cos(theta), y: rad * Math.sin(theta) });

                targetPos = clipToRect(targetPos, item.absoluteSize, { x: 25, y: 0 }, { w: GLOBAL_DEFAULT_SCREENSIZE.width - 25,
                    h: GLOBAL_DEFAULT_SCREENSIZE.height - stage.toolbox.size.h });

                item.pos = pos;
                Animate.tween(item, { 'pos': targetPos }, 100, function (elapsed) {
                    return Math.pow(elapsed, 0.5);
                });
                //item.pos = addPos(pos, { x:rad*Math.cos(theta), y:rad*Math.sin(theta) });
                item.parent = null;
                _this52.graphicNode.removeItem(item);
                item.scale = { x: 1, y: 1 };
                stage.add(item);
            });

            // Set the items in the bag back to nothing.
            this.items = [];
            this.graphicNode.removeAllItems(); // just to be sure!
            console.warn(this.graphicNode);

            // Log changes
            Logger.log('bag-spill', { 'before': before_str, 'after': stage.toString(), 'item': bag_before_str });

            // Play spill sfx
            Resource.play('bag-spill');
        }
    }, {
        key: 'reduce',
        value: function reduce() {
            return this; // collections do not reduce!
        }
    }, {
        key: 'reduceCompletely',
        value: function reduceCompletely() {
            return this;
        }
    }, {
        key: 'clone',
        value: function clone() {
            var c = _get(Object.getPrototypeOf(BagExpr.prototype), 'clone', this).call(this);
            c._items = this.items;
            return c;
        }
    }, {
        key: 'value',
        value: function value() {
            return this.items.slice(); // Arguably should be toString of each expression, but then comparison must be setCompare.
        }
    }, {
        key: 'toString',
        value: function toString() {
            return '(bag' + this.items.reduce(function (str, curr) {
                return str += ' ' + curr.toString();
            }, '') + ')';
        }
    }, {
        key: 'onmouseclick',
        value: function onmouseclick(pos) {
            this.spill();
        }
    }, {
        key: 'ondropenter',
        value: function ondropenter(node, pos) {

            if (this._tween) this._tween.cancel();
            if (this.parent) return;
            if (node instanceof FunnelMapFunc) return;

            if (this.stage) {
                var _pos = this.pos;
                _pos.x -= (this.anchor.x - 0.5) * this.size.w;
                _pos.y -= (this.anchor.y - 0.5) * this.size.h;
                this.pos = _pos;
                this.anchor = { x: 0.5, y: 0.5 };
            }
            this._beforeScale = this.graphicNode.scale;
            var targetScale = { x: this.bigScale, y: this.bigScale };
            this._tween = Animate.tween(this.graphicNode, { 'scale': targetScale }, 600, function (elapsed) {
                return Math.pow(elapsed, 0.25);
            });
            this.onmouseenter(pos);

            //if (this.stage) this.stage.draw();
        }
    }, {
        key: 'ondropexit',
        value: function ondropexit(node, pos) {

            if (this.parent) return;
            if (node instanceof FunnelMapFunc) return;

            this._tween.cancel();
            this._tween = Animate.tween(this.graphicNode, { 'scale': this._beforeScale }, 100, function (elapsed) {
                return Math.pow(elapsed, 0.25);
            });
            this.onmouseleave(pos);
        }
    }, {
        key: 'ondropped',
        value: function ondropped(node, pos) {
            this.ondropexit(node, pos);

            if (this.parent) return;
            if (node instanceof FunnelMapFunc) return;

            if (!(node instanceof Expression)) {
                console.error('@ BagExpr.ondropped: Dropped node is not an Expression.', node);
                return;
            } else if (!node.stage) {
                console.error('@ BagExpr.ondropped: Dropped node is not attached to a Stage.', node);
                return;
            } else if (node.parent) {
                console.error('@ BagExpr.ondropped: Dropped node has a parent expression.', node);
                return;
            }

            // Remove node from the stage:
            var stage = node.stage;
            stage.remove(node);

            // Dump clone of node into the bag:
            var n = node.clone();
            var before_str = this.toString();
            n.pos.x = 100; //(n.absolutePos.x - this.graphicNode.absolutePos.x + this.graphicNode.absoluteSize.w / 2.0) / this.graphicNode.absoluteSize.w;
            this.addItem(n);

            Logger.log('bag-add', { 'before': before_str, 'after': this.toString(), 'item': n.toString() });

            if (this.stage) {
                this.stage.saveState();
                Logger.log('state-save', this.stage.toString());
            } else {
                console.warn('@ BagExpr.ondroppped: Item dropped into bag which is not member of a Stage.');
            }

            Resource.play('bag-addItem');
        }
    }, {
        key: 'items',
        get: function get() {
            return this._items.slice();
        },
        set: function set(items) {
            var _this53 = this;

            this._items.forEach(function (item) {
                return _this53.graphicNode.removeItem(item);
            });
            this._items = [];
            items.forEach(function (item) {
                _this53.addItem(item);
            });
        }
    }, {
        key: 'delegateToInner',
        get: function get() {
            return true;
        }
    }]);

    return BagExpr;
}(CollectionExpr);

var CountExpr = function (_Expression13) {
    _inherits(CountExpr, _Expression13);

    function CountExpr(collectionExpr) {
        _classCallCheck(this, CountExpr);

        if (typeof collectionExpr === 'undefined') {
            collectionExpr = new MissingExpression();
            collectionExpr.color = 'lightgray';
        }
        var txt = new TextExpr('count');

        var _this54 = _possibleConstructorReturn(this, Object.getPrototypeOf(CountExpr).call(this, [txt, collectionExpr]));

        _this54.color = 'DarkTurquoise';
        txt.color = 'white';
        return _this54;
    }

    _createClass(CountExpr, [{
        key: 'onmouseclick',
        value: function onmouseclick() {
            this.performReduction();
        }
    }, {
        key: 'reduce',
        value: function reduce() {
            console.log(this.holes[1]);
            if (this.holes[1] instanceof MissingExpression) return this;else if (this.holes[1] instanceof BagExpr) return [new NumberExpr(this.holes[1].items.length), this.holes[1]];else return this;
        }
    }]);

    return CountExpr;
}(Expression);

// A while loop.
/* OLD -- class WhileLoop extends IfStatement {
    reduce() {
        if (!this.cond || !this.branch) return this; // irreducible
        else if (this.cond.value()) {
            this.branch.execute();
            return this; // step the branch, then return the same loop (irreducible)
        }
        else return this.emptyExpr;
    }
}

// A boolean expression. Can && or || or !.
class BooleanExpr extends Expression {
    constructor(b1, b2) {
        super(b1 || b2 ? [b1, b2] : [new TrueExpr(), new TrueExpr()]);
        this.OPTYPE = { AND:0, OR:1, NOT:2 };
        this.op = this.OPTYPE.AND;
    }

    // Change these when you subclass.
    get trueExpr() { return new TrueExpr(); }
    get falseExpr() { return new FalseExpr(); }

    // Reduces to TrueExpr or FalseExpr
    reduce() {
        var v = this.value();
        if (v) return this.trueExpr;
        else   return this.falseExpr;
    }

    value() {
        switch (this.op) {
            case this.OPTYPE.AND:
                return b1.value() && b2.value();
            case this.OPTYPE.OR:
                return b1.value() || b2.value();
            case this.OPTYPE.NOT:
                return !b1.value(); }
        console.error('Invalid optype.');
        return false;
    }
}*/