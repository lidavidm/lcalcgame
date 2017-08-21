'use strict';

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var BooleanPrimitive = function (_Expression) {
    _inherits(BooleanPrimitive, _Expression);

    function BooleanPrimitive(name) {
        _classCallCheck(this, BooleanPrimitive);

        var _this = _possibleConstructorReturn(this, (BooleanPrimitive.__proto__ || Object.getPrototypeOf(BooleanPrimitive)).call(this));

        var text = new TextExpr(name);
        text.pos = { x: 0, y: 0 };
        text.anchor = { x: -0.1, y: 1.5 }; // TODO: Fix this bug.
        _this.color = "HotPink";
        _this.addArg(text);
        return _this;
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
        key: 'isValue',
        value: function isValue() {
            return true;
        }
    }, {
        key: 'drawInternal',
        value: function drawInternal(ctx, pos, boundingSize) {
            ctx.fillStyle = 'black';
            setStrokeStyle(ctx, this.stroke);
            if (this.shadowOffset !== 0) this.drawBaseShape(ctx, { x: pos.x, y: pos.y + this.shadowOffset }, boundingSize);
            ctx.fillStyle = this.color;
            this.drawBaseShape(ctx, pos, boundingSize);
        }
    }, {
        key: 'drawBaseShape',
        value: function drawBaseShape(ctx, pos, boundingSize) {
            hexaRect(ctx, pos.x, pos.y, boundingSize.w, boundingSize.h, true, this.stroke ? true : false, this.stroke ? this.stroke.opacity : null);
        }
    }]);

    return BooleanPrimitive;
}(Expression);

var TrueExpr = function (_BooleanPrimitive) {
    _inherits(TrueExpr, _BooleanPrimitive);

    function TrueExpr() {
        _classCallCheck(this, TrueExpr);

        return _possibleConstructorReturn(this, (TrueExpr.__proto__ || Object.getPrototypeOf(TrueExpr)).call(this, 'true'));
    }

    _createClass(TrueExpr, [{
        key: 'value',
        value: function value() {
            return true;
        }
    }, {
        key: 'toString',
        value: function toString() {
            return (this.locked ? '/' : '') + 'true';
        }
    }, {
        key: 'toJavaScript',
        value: function toJavaScript() {
            return 'true';
        }
    }]);

    return TrueExpr;
}(BooleanPrimitive);

var FalseExpr = function (_BooleanPrimitive2) {
    _inherits(FalseExpr, _BooleanPrimitive2);

    function FalseExpr() {
        _classCallCheck(this, FalseExpr);

        return _possibleConstructorReturn(this, (FalseExpr.__proto__ || Object.getPrototypeOf(FalseExpr)).call(this, 'false'));
    }

    _createClass(FalseExpr, [{
        key: 'value',
        value: function value() {
            return false;
        }
    }, {
        key: 'toString',
        value: function toString() {
            return (this.locked ? '/' : '') + 'false';
        }
    }, {
        key: 'toJavaScript',
        value: function toJavaScript() {
            return 'false';
        }
    }]);

    return FalseExpr;
}(BooleanPrimitive);

var GraphicFadedTrueExpr = function (_TrueExpr) {
    _inherits(GraphicFadedTrueExpr, _TrueExpr);

    function GraphicFadedTrueExpr() {
        _classCallCheck(this, GraphicFadedTrueExpr);

        var _this4 = _possibleConstructorReturn(this, (GraphicFadedTrueExpr.__proto__ || Object.getPrototypeOf(GraphicFadedTrueExpr)).call(this));

        _this4.color = "lightgray";
        return _this4;
    }

    _createClass(GraphicFadedTrueExpr, [{
        key: 'drawBaseShape',
        value: function drawBaseShape(ctx, pos, size) {
            roundRect(ctx, pos.x, pos.y, size.w, size.h, this.radius * this.absoluteScale.x, this.color ? true : false, this.stroke ? true : false, this.stroke ? this.stroke.opacity : null, this.notches ? this.notches : null);
        }
    }]);

    return GraphicFadedTrueExpr;
}(TrueExpr);

var GraphicFadedFalseExpr = function (_FalseExpr) {
    _inherits(GraphicFadedFalseExpr, _FalseExpr);

    function GraphicFadedFalseExpr() {
        _classCallCheck(this, GraphicFadedFalseExpr);

        var _this5 = _possibleConstructorReturn(this, (GraphicFadedFalseExpr.__proto__ || Object.getPrototypeOf(GraphicFadedFalseExpr)).call(this));

        _this5.color = "lightgray";
        return _this5;
    }

    _createClass(GraphicFadedFalseExpr, [{
        key: 'drawBaseShape',
        value: function drawBaseShape(ctx, pos, size) {
            roundRect(ctx, pos.x, pos.y, size.w, size.h, this.radius * this.absoluteScale.x, this.color ? true : false, this.stroke ? true : false, this.stroke ? this.stroke.opacity : null, this.notches ? this.notches : null);
        }
    }]);

    return GraphicFadedFalseExpr;
}(FalseExpr);

/** Faded bool variants. */


var KeyTrueExpr = function (_TrueExpr2) {
    _inherits(KeyTrueExpr, _TrueExpr2);

    function KeyTrueExpr() {
        _classCallCheck(this, KeyTrueExpr);

        var _this6 = _possibleConstructorReturn(this, (KeyTrueExpr.__proto__ || Object.getPrototypeOf(KeyTrueExpr)).call(this));

        _this6.holes = [];
        _this6.children = [];

        var key = new ImageExpr(0, 0, 56, 28, 'key-icon');
        key.lock();
        _this6.addArg(key);
        _this6.graphicNode = key;
        return _this6;
    }

    _createClass(KeyTrueExpr, [{
        key: 'onmouseclick',
        value: function onmouseclick(pos) {

            // Clicking on the key in a lock (if statement) will act as if they clicked the if statement.
            if (this.parent && this.parent instanceof IfStatement && this.parent.cond == this) this.parent.onmouseclick(pos);else _get(KeyTrueExpr.prototype.__proto__ || Object.getPrototypeOf(KeyTrueExpr.prototype), 'onmouseclick', this).call(this, pos);
        }
    }]);

    return KeyTrueExpr;
}(TrueExpr);

var KeyFalseExpr = function (_FalseExpr2) {
    _inherits(KeyFalseExpr, _FalseExpr2);

    function KeyFalseExpr() {
        _classCallCheck(this, KeyFalseExpr);

        var _this7 = _possibleConstructorReturn(this, (KeyFalseExpr.__proto__ || Object.getPrototypeOf(KeyFalseExpr)).call(this));

        _this7.holes = [];
        _this7.children = [];

        var key = new ImageExpr(0, 0, 56, 34, 'broken-key-icon');
        key.lock();
        _this7.addArg(key);
        _this7.graphicNode = key;
        return _this7;
    }

    _createClass(KeyFalseExpr, [{
        key: 'onmouseclick',
        value: function onmouseclick(pos) {

            // Clicking on the key in a lock (if statement) will act as if they clicked the if statement.
            if (this.parent && this.parent instanceof IfStatement && this.parent.cond == this) this.parent.onmouseclick(pos);else _get(KeyFalseExpr.prototype.__proto__ || Object.getPrototypeOf(KeyFalseExpr.prototype), 'onmouseclick', this).call(this, pos);
        }
    }]);

    return KeyFalseExpr;
}(FalseExpr);