"use strict";

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
    }, {
        key: "size",
        get: function get() {
            var padding = this.padding;
            var width = 50; // TODO: should be DEFAULT_EXPR_WIDTH
            var height = 0;
            var sizes = this.getHoleSizes();
            var scale_x = this.scale.x;

            if (sizes.length === 0) return { w: this._size.w, h: this._size.h };

            sizes.forEach(function (s) {
                height += s.h + padding.inner;
                width = Math.max(width, s.w);
            });
            width += padding.right + padding.left; // the end

            return { w: width, h: height };
        }
    }]);

    return VarExpr;
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