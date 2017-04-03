'use strict';

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// Integers

var NumberExpr = function (_Expression) {
    _inherits(NumberExpr, _Expression);

    function NumberExpr(num) {
        _classCallCheck(this, NumberExpr);

        var _this = _possibleConstructorReturn(this, (NumberExpr.__proto__ || Object.getPrototypeOf(NumberExpr)).call(this, [new DiceNumber(num)]));

        _this.number = num;
        _this.color = 'Ivory';
        _this.highlightColor = 'OrangeRed';
        return _this;
    }

    _createClass(NumberExpr, [{
        key: 'value',
        value: function value() {
            return this.number;
        }
    }, {
        key: 'isValue',
        value: function isValue() {
            return true;
        }
    }, {
        key: 'toString',
        value: function toString() {
            return this.number.toString();
        }
    }, {
        key: 'onmouseclick',
        value: function onmouseclick(pos) {
            // We can't really reduce, let's see if our parent wants to
            if (this.parent) {
                this.parent.onmouseclick(pos);
            }
        }
    }, {
        key: 'constructorArgs',
        get: function get() {
            return [this.number];
        }
    }]);

    return NumberExpr;
}(Expression);

var FadedNumberExpr = function (_NumberExpr) {
    _inherits(FadedNumberExpr, _NumberExpr);

    function FadedNumberExpr(num) {
        _classCallCheck(this, FadedNumberExpr);

        var _this2 = _possibleConstructorReturn(this, (FadedNumberExpr.__proto__ || Object.getPrototypeOf(FadedNumberExpr)).call(this, num));

        _this2.children = [];
        _this2.holes = [];
        _this2.addArg(new TextExpr(num.toString()));
        return _this2;
    }

    return FadedNumberExpr;
}(NumberExpr);

var AddExpr = function (_Expression2) {
    _inherits(AddExpr, _Expression2);

    function AddExpr(left, right) {
        _classCallCheck(this, AddExpr);

        var op = new TextExpr("+");
        if (left instanceof MissingExpression) left = new MissingNumberExpression();
        if (right instanceof MissingExpression) right = new MissingNumberExpression();
        return _possibleConstructorReturn(this, (AddExpr.__proto__ || Object.getPrototypeOf(AddExpr)).call(this, [left, op, right]));
    }

    _createClass(AddExpr, [{
        key: 'canReduce',
        value: function canReduce() {
            return this.leftExpr && (this.leftExpr.isValue() || this.leftExpr.canReduce()) && this.rightExpr && (this.rightExpr.isValue() || this.rightExpr.canReduce());
        }
    }, {
        key: 'reduce',
        value: function reduce() {
            if (this.leftExpr instanceof NumberExpr && this.rightExpr instanceof NumberExpr) {
                return new (ExprManager.getClass('number'))(this.leftExpr.value() + this.rightExpr.value());
            } else {
                return this;
            }
        }
    }, {
        key: 'performReduction',
        value: function performReduction() {
            var _this4 = this;

            this._animating = true;
            return this.performSubReduction(this.leftExpr).then(function (left) {
                if (!(left instanceof NumberExpr)) {
                    _this4._animating = false;
                    return Promise.reject();
                }
                return _this4.performSubReduction(_this4.rightExpr).then(function (right) {
                    if (!(right instanceof NumberExpr)) {
                        _this4._animating = false;
                        return Promise.reject();
                    }

                    var stage = _this4.stage;

                    var val = _get(AddExpr.prototype.__proto__ || Object.getPrototypeOf(AddExpr.prototype), 'performReduction', _this4).call(_this4);
                    stage.update();
                    return val;
                });
            });
        }
    }, {
        key: 'onmouseclick',
        value: function onmouseclick() {
            if (!this._animating) {
                this.performReduction();
            }
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

    return AddExpr;
}(Expression);

// Draws the circles for a dice number inside its boundary.


var DiceNumber = function (_mag$Rect) {
    _inherits(DiceNumber, _mag$Rect);

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
        var radius = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 6;

        _classCallCheck(this, DiceNumber);

        var _this5 = _possibleConstructorReturn(this, (DiceNumber.__proto__ || Object.getPrototypeOf(DiceNumber)).call(this, 0, 0, 44, 44));

        _this5.number = num;
        _this5.circlePos = DiceNumber.drawPositionsFor(num);
        _this5.radius = radius;
        _this5.color = 'black';
        return _this5;
    }

    _createClass(DiceNumber, [{
        key: 'hits',
        value: function hits(pos, options) {
            return false;
        }
    }, {
        key: 'drawInternal',
        value: function drawInternal(ctx, pos, boundingSize) {
            var _this6 = this;

            if (this.circlePos && this.circlePos.length > 0) {
                (function () {

                    var rad = _this6.radius * boundingSize.w / _this6.size.w;
                    var fill = _this6.color;
                    var stroke = _this6.stroke;
                    _this6.circlePos.forEach(function (relpos) {
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
}(mag.Rect);