"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SHRINK_DURATION = 800;
var EXPAND_DURATION = 400;
/// Variable nodes - separate from lambda variable expressions, for
/// now.

var VarExpr = function (_Expression) {
    _inherits(VarExpr, _Expression);

    function VarExpr(name) {
        _classCallCheck(this, VarExpr);

        var _this = _possibleConstructorReturn(this, (VarExpr.__proto__ || Object.getPrototypeOf(VarExpr)).call(this, [new TextExpr(name), new ExpressionView(null)]));

        _this.name = name;
        _this._stackVertically = true;
        // See MissingTypedExpression#constructor
        _this.equivalentClasses = [VarExpr];
        _this.preview = null;
        _this.animating = false;
        return _this;
    }

    _createClass(VarExpr, [{
        key: "open",
        value: function open(preview) {
            var _this2 = this;

            var animate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

            if (!animate) {
                this.preview = preview;
                this.update();
                return null;
            }
            return this.animateShrink(200).after(function () {
                _this2.preview = preview;
                _this2.update();
            });
        }
    }, {
        key: "close",
        value: function close() {
            this.preview = null;
            this.update();
        }
    }, {
        key: "animateShrink",
        value: function animateShrink(duration) {
            var _this3 = this;

            this.animating = true;
            var target = null;
            if (this.holes[1] instanceof ExpressionView) {
                target = {
                    _openOffset: Math.PI / 2
                };
            } else {
                target = {
                    scale: {
                        x: 0.0,
                        y: 0.0
                    },
                    pos: {
                        x: this.holes[1].pos.x + 0.5 * this.holes[1].size.w,
                        y: this.holes[1].pos.y
                    }
                };
            }
            return Animate.tween(this.holes[1], target, duration).after(function () {
                _this3.animating = false;
            });
        }
    }, {
        key: "animateChangeTo",
        value: function animateChangeTo(value) {
            var _this4 = this;

            this.animateShrink(SHRINK_DURATION).after(function () {
                _this4.animating = true;
                _this4.holes[1] = value;
                _get(VarExpr.prototype.__proto__ || Object.getPrototypeOf(VarExpr.prototype), "update", _this4).call(_this4);
                var target = {
                    scale: value.scale,
                    pos: value.pos
                };
                value.pos = {
                    x: value.pos.x + 0.5 * value.size.w,
                    y: value.pos.y
                };
                value.scale = {
                    x: 0,
                    y: 0
                };
                Animate.tween(value, target, 300).after(function () {
                    _this4.animating = false;
                });
            });
        }
    }, {
        key: "update",
        value: function update() {
            if (this.animating) {
                _get(VarExpr.prototype.__proto__ || Object.getPrototypeOf(VarExpr.prototype), "update", this).call(this);
                return;
            }

            if (this.preview) {
                this.holes[1] = this.preview;
                this.holes[1].lock();
                this.holes[1].bindSubexpressions();
                _get(VarExpr.prototype.__proto__ || Object.getPrototypeOf(VarExpr.prototype), "update", this).call(this);
                if (this.stage) this.stage.draw();
                return;
            }

            var env = this.getEnvironment();
            if (!env) {
                _get(VarExpr.prototype.__proto__ || Object.getPrototypeOf(VarExpr.prototype), "update", this).call(this);
                return;
            }
            if (env.lookup(this.name)) {
                var value = env.lookup(this.name);
                this.holes[1] = value.clone();
                this.holes[1].lock();
                this.holes[1].bindSubexpressions();
            } else {
                this.holes[1] = new ExpressionView(null);
            }
            _get(VarExpr.prototype.__proto__ || Object.getPrototypeOf(VarExpr.prototype), "update", this).call(this);
            if (this.stage) this.stage.draw();
        }
    }, {
        key: "canReduce",
        value: function canReduce() {
            return this.getEnvironment() && (this.parent || this.stage) && this.getEnvironment().lookup(this.name);
        }
    }, {
        key: "reduce",
        value: function reduce() {
            var env = this.getEnvironment();
            if (!env) return this;

            var parent = this.parent ? this.parent : this.stage;
            if (!parent) return this;

            var value = env.lookup(this.name);
            if (!value) return this;

            return value;
        }
    }, {
        key: "performReduction",
        value: function performReduction() {
            var value = this.reduce();
            if (value != this) {
                value = value.clone();
                var parent = this.parent ? this.parent : this.stage;
                parent.swap(this, value);
            }
        }
    }, {
        key: "onmouseclick",
        value: function onmouseclick() {
            this.performReduction();
        }
    }]);

    return VarExpr;
}(Expression);

var AssignExpr = function (_Expression2) {
    _inherits(AssignExpr, _Expression2);

    function AssignExpr(variable, value) {
        _classCallCheck(this, AssignExpr);

        var _this5 = _possibleConstructorReturn(this, (AssignExpr.__proto__ || Object.getPrototypeOf(AssignExpr)).call(this, []));

        if (variable && !(variable instanceof MissingExpression)) {
            _this5.holes.push(variable);
        } else {
            var missing = new MissingTypedExpression(new VarExpr("_"));
            missing.acceptedClasses = [VarExpr];
            _this5.holes.push(missing);
        }

        _this5.holes.push(new TextExpr("←"));

        if (value) {
            _this5.holes.push(value);
        } else {
            _this5.holes.push(new MissingExpression());
        }
        return _this5;
    }

    _createClass(AssignExpr, [{
        key: "onmouseclick",
        value: function onmouseclick() {
            this.performReduction();
        }
    }, {
        key: "canReduce",
        value: function canReduce() {
            return this.value && this.variable && this.value.canReduce();
        }
    }, {
        key: "reduce",
        value: function reduce() {
            if (this.variable && this.value) {
                return this.value;
            } else {
                return this;
            }
        }
    }, {
        key: "performReduction",
        value: function performReduction() {
            var _this6 = this;

            var animated = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

            // The side-effect actually happens here. reduce() is called
            // multiple times as a 'canReduce', and we don't want any
            // update to happen multiple times.
            if (this.value) {
                this.value.performReduction();
            }
            if (this.canReduce()) {
                (function () {
                    var initial = [];
                    if (_this6.parent) {
                        initial.push(_this6.parent);
                    } else {
                        initial = initial.concat(_this6.stage.nodes);
                    }
                    var otherVars = findAliasingVarExpr(initial, _this6.variable.name, [_this6.variable], false, true);
                    var afterAnimate = function afterAnimate() {
                        _this6.getEnvironment().update(_this6.variable.name, _this6.value);
                        var parent = _this6.parent || _this6.stage;
                        Animate.poof(_this6);
                        window.setTimeout(function () {
                            parent.swap(_this6, null);
                        }, 100);
                        _this6.stage.getNodesWithClass(VarExpr, [_this6.variable], true, null).forEach(function (node) {
                            // Make sure the change is reflected
                            node.close();
                            node.update();
                        });
                        _this6.stage.draw();
                    };
                    if (animated) {
                        var v1 = _this6.variable.holes[1].absolutePos;
                        var v2 = _this6.value.absolutePos;
                        var target = {
                            pos: {
                                x: v1.x - v2.x + _this6.value.pos.x,
                                y: v1.y - v2.y + _this6.value.pos.y
                            }
                        };
                        otherVars.forEach(function (v) {
                            return v.animateChangeTo(_this6.value.clone());
                        });
                        Resource.play('swoop');
                        _this6.variable.animateShrink(SHRINK_DURATION);
                        Animate.tween(_this6.value, target, SHRINK_DURATION, function (t) {
                            return -t * t * (t - 2);
                        }).after(function () {
                            _this6.value.scale = { x: 0, y: 0 };
                            _this6.variable.open(_this6.value.clone(), false);
                            window.setTimeout(afterAnimate, EXPAND_DURATION);
                        });
                    } else {
                        _get(AssignExpr.prototype.__proto__ || Object.getPrototypeOf(AssignExpr.prototype), "performReduction", _this6).call(_this6);
                        afterAnimate();
                    }
                })();
            }
        }
    }, {
        key: "reduceCompletely",
        value: function reduceCompletely() {
            if (this.value) {
                this.value.reduceCompletely();
            }

            if (this.variable && this.value) {
                // Return non-undefined non-this value so that when the
                // user drops everything in, MissingExpression#ondropped
                // will make this expr blink
                return null;
            } else {
                return this;
            }
        }
    }, {
        key: "variable",
        get: function get() {
            return this.holes[0] instanceof MissingExpression ? null : this.holes[0];
        }
    }, {
        key: "value",
        get: function get() {
            return this.holes[2] instanceof MissingExpression ? null : this.holes[2];
        }
    }]);

    return AssignExpr;
}(Expression);

var ExpressionView = function (_MissingExpression) {
    _inherits(ExpressionView, _MissingExpression);

    function ExpressionView(expr_to_miss) {
        _classCallCheck(this, ExpressionView);

        var _this7 = _possibleConstructorReturn(this, (ExpressionView.__proto__ || Object.getPrototypeOf(ExpressionView)).call(this, expr_to_miss));

        _this7._openOffset = 0;
        return _this7;
    }

    // Disable interactivity


    _createClass(ExpressionView, [{
        key: "ondropenter",
        value: function ondropenter() {}
    }, {
        key: "ondropexit",
        value: function ondropexit() {}
    }, {
        key: "ondropped",
        value: function ondropped() {}
    }, {
        key: "onmouseenter",
        value: function onmouseenter() {}
    }, {
        key: "drawInternal",
        value: function drawInternal(ctx, pos, boundingSize) {
            var rad = boundingSize.w / 2.0;
            ctx.beginPath();
            ctx.arc(pos.x + rad, pos.y + rad, rad, 0, 2 * Math.PI);
            var gradient = ctx.createLinearGradient(pos.x + rad, pos.y, pos.x + rad, pos.y + 2 * rad);
            gradient.addColorStop(0.0, "#AAAAAA");
            gradient.addColorStop(0.7, "#191919");
            gradient.addColorStop(1.0, "#191919");
            ctx.fillStyle = gradient;
            ctx.fill();

            if (this._openOffset < Math.PI / 2) {
                ctx.fillStyle = '#A4A4A4';
                setStrokeStyle(ctx, {
                    color: '#C8C8C8',
                    lineWidth: 1.5
                });

                ctx.beginPath();
                ctx.arc(pos.x + rad, pos.y + rad, rad, -0.25 * Math.PI + this._openOffset, 0.75 * Math.PI - this._openOffset);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(pos.x + rad, pos.y + rad, rad, -0.25 * Math.PI - this._openOffset, 0.75 * Math.PI + this._openOffset, true);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            }

            ctx.beginPath();
            ctx.arc(pos.x + rad, pos.y + rad, rad, 0, 2 * Math.PI);
            var gradient = ctx.createRadialGradient(pos.x + rad, pos.y + rad, 0.67 * rad, pos.x + rad, pos.y + rad, rad);
            gradient.addColorStop(0, "rgba(0, 0, 0, 0.0)");
            gradient.addColorStop(1, "rgba(0, 0, 0, 0.4)");
            ctx.fillStyle = gradient;
            ctx.fill();
        }
    }]);

    return ExpressionView;
}(MissingExpression);

function findAliasingVarExpr(initial, name) {
    // TODO: needs to account for whether the variable we are looking
    // for is in an outer scope. Example:
    // x = 3
    // def test():
    //     global x
    //     x = 5
    var subvarexprs = [];
    var queue = initial;
    while (queue.length > 0) {
        var node = queue.pop();
        if (node instanceof VarExpr && node.name === name) {
            subvarexprs.push(node);
        } else if (node instanceof LambdaExpr && node.takesArgument && node.holes[0].name === name) {
            // Capture-avoiding substitution
            continue;
        }

        if (node.children) {
            queue = queue.concat(node.children);
        }
    }

    return subvarexprs;
}