"use strict";

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/// Variable nodes - separate from lambda variable expressions, for
/// now.
var VarExpr = function (_Expression) {
    _inherits(VarExpr, _Expression);

    function VarExpr(name) {
        _classCallCheck(this, VarExpr);

        var _this = _possibleConstructorReturn(this, (VarExpr.__proto__ || Object.getPrototypeOf(VarExpr)).call(this, [new TextExpr(name), new ExpressionView(null)]));

        _this.name = name;
        _this._stackVertically = true;
        return _this;
    }

    _createClass(VarExpr, [{
        key: "onadded",
        value: function onadded() {
            var _this2 = this;

            // TODO: show the expr
            // TODO: keep up-to-date with changes in the environment
            this.getEnvironment().observe(function (name, value) {
                if (name === _this2.name) {
                    _this2.holes[1] = value.clone();
                    _this2.holes[1].lock();
                    _this2.holes[1].bindSubexpressions();
                    _this2.update();
                }
            });
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

            value = value.clone();
            parent.swap(this, value);
            return value;
        }
    }, {
        key: "onmouseclick",
        value: function onmouseclick() {
            this.reduce();
        }
    }]);

    return VarExpr;
}(Expression);

var AssignExpr = function (_Expression2) {
    _inherits(AssignExpr, _Expression2);

    function AssignExpr() {
        var variable = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
        var value = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

        _classCallCheck(this, AssignExpr);

        var _this3 = _possibleConstructorReturn(this, (AssignExpr.__proto__ || Object.getPrototypeOf(AssignExpr)).call(this, []));

        if (variable) {
            _this3.holes.push(variable);
        } else {
            _this3.holes.push(new MissingExpression(new VarExpr("_")));
        }

        _this3.holes.push(new TextExpr("←"));

        if (value) {
            _this3.holes.push(value);
        } else {
            _this3.holes.push(new MissingExpression());
        }
        return _this3;
    }

    _createClass(AssignExpr, [{
        key: "onmouseclick",
        value: function onmouseclick() {
            this.performReduction();
        }
    }, {
        key: "reduce",
        value: function reduce() {
            if (this.variable && this.value) {
                return null;
            } else {
                return this;
            }
        }
    }, {
        key: "performReduction",
        value: function performReduction() {
            var _this4 = this;

            var animated = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

            // The side-effect actually happens here. reduce() is called
            // multiple times as a 'canReduce', and we don't want any
            // update to happen multiple times.
            if (this.reduce() != this) {
                if (animated) {
                    var v1 = this.variable.holes[1].absolutePos;
                    var v2 = this.value.absolutePos;
                    Animate.tween(this.value, {
                        pos: {
                            x: v1.x - v2.x + this.value.pos.x,
                            y: v1.y - v2.y + this.value.pos.y
                        }
                    }, 300).after(function () {
                        _this4.getEnvironment().update(_this4.variable.name, _this4.value);
                        _get(AssignExpr.prototype.__proto__ || Object.getPrototypeOf(AssignExpr.prototype), "performReduction", _this4).call(_this4);
                    });
                } else {
                    _get(AssignExpr.prototype.__proto__ || Object.getPrototypeOf(AssignExpr.prototype), "performReduction", this).call(this);
                }
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