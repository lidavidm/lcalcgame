"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SHRINK_DURATION = 500;
var EXPAND_DURATION = 800;
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
            this.animating = true;
            var target = {
                scale: {
                    x: 0.0,
                    y: 0.0
                },
                pos: {
                    x: this.holes[1].pos.x + 0.5 * this.holes[1].size.w,
                    y: this.holes[1].pos.y
                }
            };
            return Animate.tween(this.holes[1], target, 300).after(function () {
                _this2.animating = false;
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
        key: "animateChangeTo",
        value: function animateChangeTo(value) {
            var _this3 = this;

            this.animating = true;
            var target = {
                scale: {
                    x: 0.0,
                    y: 0.0
                },
                pos: {
                    x: this.holes[1].pos.x + 0.5 * this.holes[1].size.w,
                    y: this.holes[1].pos.y
                }
            };
            Animate.tween(this.holes[1], target, SHRINK_DURATION).after(function () {
                _this3.holes[1] = value;
                _get(VarExpr.prototype.__proto__ || Object.getPrototypeOf(VarExpr.prototype), "update", _this3).call(_this3);
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
                    _this3.animating = false;
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

        var _this4 = _possibleConstructorReturn(this, (AssignExpr.__proto__ || Object.getPrototypeOf(AssignExpr)).call(this, []));

        if (variable && !(variable instanceof MissingExpression)) {
            _this4.holes.push(variable);
        } else {
            var missing = new MissingTypedExpression(new VarExpr("_"));
            missing.acceptedClasses = [VarExpr];
            _this4.holes.push(missing);
        }

        _this4.holes.push(new TextExpr("←"));

        if (value) {
            _this4.holes.push(value);
        } else {
            _this4.holes.push(new MissingExpression());
        }
        return _this4;
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
            var _this5 = this;

            var animated = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

            // The side-effect actually happens here. reduce() is called
            // multiple times as a 'canReduce', and we don't want any
            // update to happen multiple times.
            if (this.value) {
                this.value.performReduction();
            }
            if (this.canReduce()) {
                (function () {
                    var otherVars = _this5.stage.getNodesWithClass(VarExpr, [_this5.variable], true, null);
                    var afterAnimate = function afterAnimate() {
                        _this5.getEnvironment().update(_this5.variable.name, _this5.value);
                        var parent = _this5.parent || _this5.stage;
                        Animate.poof(_this5);
                        window.setTimeout(function () {
                            parent.swap(_this5, null);
                        }, 100);
                        otherVars.forEach(function (node) {
                            // Make sure the change is reflected
                            node.close();
                            node.update();
                        });
                        _this5.stage.draw();
                    };
                    if (animated) {
                        var v1 = _this5.variable.holes[1].absolutePos;
                        var v2 = _this5.value.absolutePos;
                        var target = {
                            pos: {
                                x: v1.x - v2.x + _this5.value.pos.x,
                                y: v1.y - v2.y + _this5.value.pos.y
                            }
                        };
                        otherVars.forEach(function (v) {
                            return v.animateChangeTo(_this5.value.clone());
                        });
                        _this5.variable.open(new MissingExpression());
                        Animate.tween(_this5.value, target, SHRINK_DURATION).after(function () {
                            _this5.value.scale = { x: 0, y: 0 };
                            _this5.variable.open(_this5.value.clone(), false);
                            window.setTimeout(afterAnimate, EXPAND_DURATION);
                        });
                    } else {
                        _get(AssignExpr.prototype.__proto__ || Object.getPrototypeOf(AssignExpr.prototype), "performReduction", _this5).call(_this5);
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

        return _possibleConstructorReturn(this, (ExpressionView.__proto__ || Object.getPrototypeOf(ExpressionView)).call(this, expr_to_miss));
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
    }]);

    return ExpressionView;
}(MissingExpression);