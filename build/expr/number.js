'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

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

        var _this2 = _possibleConstructorReturn(this, (NumberExpr.__proto__ || Object.getPrototypeOf(NumberExpr)).call(this, [new DiceNumber(num)]));

        _this2.number = num;
        _this2.color = 'Cornsilk'; //'Ivory';
        _this2.highlightColor = 'OrangeRed';
        return _this2;
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
            return (this.locked ? '/' : '') + this.number.toString();
        }
    }, {
        key: 'toJavaScript',
        value: function toJavaScript() {
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

        var _this3 = _possibleConstructorReturn(this, (FadedNumberExpr.__proto__ || Object.getPrototypeOf(FadedNumberExpr)).call(this, num));

        _this3.children = [];
        _this3.holes = [];
        _this3.addArg(new TextExpr(num.toString()));
        return _this3;
    }

    _createClass(FadedNumberExpr, [{
        key: 'addValue',
        value: function addValue(num) {
            this.holes[0].text = (parseInt(this.holes[0].text) + num).toString();
        }
    }]);

    return FadedNumberExpr;
}(NumberExpr);

var OperatorExpr = function (_Expression2) {
    _inherits(OperatorExpr, _Expression2);

    function OperatorExpr(left, op, right) {
        _classCallCheck(this, OperatorExpr);

        // if (op instanceof TextExpr)
        //     op.color = "#660037";

        var _this4 = _possibleConstructorReturn(this, (OperatorExpr.__proto__ || Object.getPrototypeOf(OperatorExpr)).call(this, [left, op, right]));

        _this4.color = '#ffcc00';
        _this4.reducableStrokeColor = '#ff6600';
        return _this4;
    }

    _createClass(OperatorExpr, [{
        key: 'canReduce',
        value: function canReduce() {
            return this.leftExpr && (this.leftExpr.isValue() || this.leftExpr.canReduce()) && this.rightExpr && (this.rightExpr.isValue() || this.rightExpr.canReduce());
        }
    }, {
        key: 'performReduction',
        value: function performReduction() {
            var _this5 = this;

            var animated = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

            return this.performSubReduction(this.leftExpr).then(function (left) {
                return _this5.performSubReduction(_this5.rightExpr);
            }).then(function (right) {
                var stage = _this5.stage;

                if (animated && stage) {
                    return new Promise(function (resolve, _reject) {
                        var shatter = new ShatterExpressionEffect(_this5);
                        shatter.run(stage, function () {
                            _this5.ignoreEvents = false;
                            resolve(_get(OperatorExpr.prototype.__proto__ || Object.getPrototypeOf(OperatorExpr.prototype), 'performReduction', _this5).call(_this5));
                        }.bind(_this5));
                        _this5.ignoreEvents = true;
                    });
                } else {
                    return _get(OperatorExpr.prototype.__proto__ || Object.getPrototypeOf(OperatorExpr.prototype), 'performReduction', _this5).call(_this5);
                }
            });
        }
    }, {
        key: 'performUserReduction',
        value: function performUserReduction() {
            if (this.op instanceof OpLiteral) {
                var Class = this.op.getClass();
                var stage = this.stage;
                var binExpr = new Class(this.leftExpr.clone(), this.rightExpr.clone());
                stage.swap(this, binExpr);
                return;
            }
            if (this.leftExpr instanceof ContextualTypeInTextExpr || this.leftExpr instanceof TypeInTextExpr) this.leftExpr.performReduction();
            if (this.rightExpr instanceof ContextualTypeInTextExpr || this.rightExpr instanceof TypeInTextExpr) this.rightExpr.performReduction();
            _get(OperatorExpr.prototype.__proto__ || Object.getPrototypeOf(OperatorExpr.prototype), 'performUserReduction', this).call(this);
        }
    }, {
        key: 'onmouseclick',
        value: function onmouseclick() {
            this.performUserReduction();
        }
    }, {
        key: 'toString',
        value: function toString() {
            return (this.locked ? '/(' : '(') + this.op.toString() + ' ' + this.leftExpr.toString() + ' ' + this.rightExpr.toString() + ')';
        }
    }, {
        key: 'toJavaScript',
        value: function toJavaScript() {
            var opName = void 0;
            if (this.op instanceof MissingOpExpression) opName = '>>';else if (this.op instanceof TypeInTextExpr) opName = this.op.typeBox.text.trim().length > 0 ? this.op.typeBox.text : '>>>';else if (this.op instanceof OpLiteral) opName = this.op.toString();else opName = this.op.text;

            var isString = function isString(x) {
                return (x.match(/\'/g) || []).length === 2 && x.indexOf("'") === 0 && x.lastIndexOf("'") === x.length - 1;
            };
            var wrap = function wrap(s) {
                if (!isString(s) && /\s/g.test(s)) // if this value isn't a string and it has whitespace, we need to wrap it in parentheses...
                    return '(' + s + ')';else return s;
            };
            return wrap(this.leftExpr.toJavaScript()) + ' ' + opName + ' ' + wrap(this.rightExpr.toJavaScript());
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
    }, {
        key: 'op',
        get: function get() {
            return this.holes[1];
        }
    }]);

    return OperatorExpr;
}(Expression);

var OpLiteral = function (_Expression3) {
    _inherits(OpLiteral, _Expression3);

    function OpLiteral(op) {
        _classCallCheck(this, OpLiteral);

        var t = new TextExpr(op);
        t.color = 'black';

        var _this6 = _possibleConstructorReturn(this, (OpLiteral.__proto__ || Object.getPrototypeOf(OpLiteral)).call(this, [t]));

        _this6.radius = 22;
        return _this6;
    }
    // drawInternal(ctx, pos, boundingSize) {
    //     const rad = boundingSize.h / 2.0;
    //     if (this.shadowOffset !== 0) {
    //         drawCircle(ctx, pos.x, pos.y + this.shadowOffset, rad, this.shadowColor, this.stroke);
    //     }
    //     drawCircle(ctx, pos.x, pos.y, rad, this.color, this.stroke);
    // }


    _createClass(OpLiteral, [{
        key: 'getClass',
        value: function getClass() {
            var map = {
                '==': ExprManager.getClass('=='),
                '=': ExprManager.getClass('assign'),
                '+': ExprManager.getClass('+')
            };
            var op = this.toString();
            if (op in map) return map[op];else return ExprManager.getClass(op);
        }
    }, {
        key: 'onmouseclick',
        value: function onmouseclick() {
            if (this.parent) this.parent.performUserReduction();
        }
    }, {
        key: 'toString',
        value: function toString() {
            return this.holes[0].text;
        }
    }, {
        key: 'toJavaScript',
        value: function toJavaScript() {
            return '_op(\'' + this.toString() + '\')';
        }
    }]);

    return OpLiteral;
}(Expression);

var AddExpr = function (_OperatorExpr) {
    _inherits(AddExpr, _OperatorExpr);

    function AddExpr(left, right) {
        _classCallCheck(this, AddExpr);

        var op = new TextExpr("+");
        return _possibleConstructorReturn(this, (AddExpr.__proto__ || Object.getPrototypeOf(AddExpr)).call(this, left, op, right));
    }

    _createClass(AddExpr, [{
        key: 'canReduce',
        value: function canReduce() {
            // Disallow booleans
            return _get(AddExpr.prototype.__proto__ || Object.getPrototypeOf(AddExpr.prototype), 'canReduce', this).call(this) && this.leftExpr && !(this.leftExpr instanceof BooleanPrimitive) && this.rightExpr && !(this.rightExpr instanceof BooleanPrimitive);
        }

        /* This 'add' should work for string concatenation as well. */

    }, {
        key: 'reduce',
        value: function reduce() {
            if (!this.canReduce()) return this;else if (this.leftExpr instanceof NumberExpr && this.rightExpr instanceof NumberExpr) {
                return new (ExprManager.getClass('number'))(this.leftExpr.value() + this.rightExpr.value());
            } else if (this.leftExpr instanceof StringValueExpr || this.rightExpr instanceof StringValueExpr) {
                var result = this.leftExpr.value() + this.rightExpr.value();
                if (typeof result === 'string') return new (ExprManager.getClass('string'))(result);
            } else return this;
        }
    }]);

    return AddExpr;
}(OperatorExpr);

var SubtractionExpr = function (_OperatorExpr2) {
    _inherits(SubtractionExpr, _OperatorExpr2);

    function SubtractionExpr(left, right) {
        _classCallCheck(this, SubtractionExpr);

        var op = new TextExpr("-");
        return _possibleConstructorReturn(this, (SubtractionExpr.__proto__ || Object.getPrototypeOf(SubtractionExpr)).call(this, left, op, right));
    }

    _createClass(SubtractionExpr, [{
        key: 'reduce',
        value: function reduce() {
            if (this.leftExpr instanceof NumberExpr && this.rightExpr instanceof NumberExpr) {
                return new (ExprManager.getClass('number'))(this.leftExpr.value() - this.rightExpr.value());
            } else {
                return this;
            }
        }
    }]);

    return SubtractionExpr;
}(OperatorExpr);

var MultiplicationExpr = function (_OperatorExpr3) {
    _inherits(MultiplicationExpr, _OperatorExpr3);

    function MultiplicationExpr(left, right) {
        _classCallCheck(this, MultiplicationExpr);

        var op = new TextExpr("*");
        return _possibleConstructorReturn(this, (MultiplicationExpr.__proto__ || Object.getPrototypeOf(MultiplicationExpr)).call(this, left, op, right));
    }

    _createClass(MultiplicationExpr, [{
        key: 'canReduce',
        value: function canReduce() {
            // Disallow booleans
            return _get(MultiplicationExpr.prototype.__proto__ || Object.getPrototypeOf(MultiplicationExpr.prototype), 'canReduce', this).call(this) && this.leftExpr && !(this.leftExpr instanceof BooleanPrimitive) && this.rightExpr && !(this.rightExpr instanceof BooleanPrimitive);
        }
    }, {
        key: 'reduce',
        value: function reduce() {
            if (this.leftExpr instanceof NumberExpr && this.rightExpr instanceof NumberExpr) {
                return new (ExprManager.getClass('number'))(this.leftExpr.value() * this.rightExpr.value());
            } else {
                return this;
            }
        }
    }]);

    return MultiplicationExpr;
}(OperatorExpr);

var DivisionExpr = function (_OperatorExpr4) {
    _inherits(DivisionExpr, _OperatorExpr4);

    function DivisionExpr(left, right) {
        _classCallCheck(this, DivisionExpr);

        var op = new TextExpr("/");
        return _possibleConstructorReturn(this, (DivisionExpr.__proto__ || Object.getPrototypeOf(DivisionExpr)).call(this, left, op, right));
    }

    _createClass(DivisionExpr, [{
        key: 'canReduce',
        value: function canReduce() {
            // Disallow booleans
            return _get(DivisionExpr.prototype.__proto__ || Object.getPrototypeOf(DivisionExpr.prototype), 'canReduce', this).call(this) && this.leftExpr && !(this.leftExpr instanceof BooleanPrimitive) && this.rightExpr && !(this.rightExpr instanceof BooleanPrimitive);
        }
    }, {
        key: 'reduce',
        value: function reduce() {
            if (this.leftExpr instanceof NumberExpr && this.rightExpr instanceof NumberExpr) {
                console.log("reducing division expression");
                var result = parseInt(this.leftExpr.value() / this.rightExpr.value());
                return new (ExprManager.getClass('number'))(result);
            } else {
                console.log("reduce failed!!");
                return this;
            }
        }
    }]);

    return DivisionExpr;
}(OperatorExpr);

var ModuloExpr = function (_OperatorExpr5) {
    _inherits(ModuloExpr, _OperatorExpr5);

    function ModuloExpr(left, right) {
        _classCallCheck(this, ModuloExpr);

        var op = new TextExpr("%");
        console.log(right);
        if (Number.isNumber(right)) right = new FadedNumberExpr(right);
        return _possibleConstructorReturn(this, (ModuloExpr.__proto__ || Object.getPrototypeOf(ModuloExpr)).call(this, left, op, right));
    }

    _createClass(ModuloExpr, [{
        key: 'canReduce',
        value: function canReduce() {
            // Disallow booleans
            return _get(ModuloExpr.prototype.__proto__ || Object.getPrototypeOf(ModuloExpr.prototype), 'canReduce', this).call(this) && this.leftExpr && !(this.leftExpr instanceof BooleanPrimitive) && this.rightExpr && !(this.rightExpr instanceof BooleanPrimitive);
        }
    }, {
        key: 'reduce',
        value: function reduce() {
            if (this.leftExpr instanceof NumberExpr && this.rightExpr instanceof NumberExpr) {
                return new (ExprManager.getClass('number'))(this.leftExpr.value() % this.rightExpr.value());
            } else {
                return this;
            }
        }
    }]);

    return ModuloExpr;
}(OperatorExpr);

var AnimatedModuloExpr = function (_ModuloExpr) {
    _inherits(AnimatedModuloExpr, _ModuloExpr);

    function AnimatedModuloExpr() {
        _classCallCheck(this, AnimatedModuloExpr);

        return _possibleConstructorReturn(this, (AnimatedModuloExpr.__proto__ || Object.getPrototypeOf(AnimatedModuloExpr)).apply(this, arguments));
    }

    _createClass(AnimatedModuloExpr, [{
        key: 'performUserReduction',
        value: function performUserReduction() {
            var _this13 = this;

            if (!this._reducing && this.canReduce() && this.reduce() != this) {
                (function () {
                    var dividend = _this13.leftExpr.value();
                    var divisor = _this13.rightExpr.value();
                    var reduceExpr = _this13.reduce();
                    var clock = new ModuloClockExpr(new FadedNumberExpr(dividend), divisor, 62);
                    clock.pos = addPos(_this13.centerPos(), { x: 0, y: -80 });
                    clock.anchor = _this13.anchor;
                    clock.ignoreEvents = true;
                    clock.graphicNode.shadowOffset = 0;
                    _this13.stage.add(clock);
                    _this13.ignoreEvents = true;
                    _this13.lockSubexpressions();
                    _this13._reducing = clock.performModulo(false);
                    // this.stage.remove(this);
                    _this13._reducing.then(function () {
                        _this13.stage.swap(_this13, reduceExpr);
                        _this13._reducing = false;
                    });
                    _this13.animateReducingStatus();
                })();
            }
        }
    }]);

    return AnimatedModuloExpr;
}(ModuloExpr);

var CircleSpinner = function (_ArrowPath) {
    _inherits(CircleSpinner, _ArrowPath);

    function CircleSpinner(radius) {
        _classCallCheck(this, CircleSpinner);

        var _this14 = _possibleConstructorReturn(this, (CircleSpinner.__proto__ || Object.getPrototypeOf(CircleSpinner)).call(this, [{ x: 0, y: 0 }, { x: 0, y: radius }]));

        _this14.degree = 90;
        _this14.radius = radius;
        return _this14;
    }

    _createClass(CircleSpinner, [{
        key: 'spinBy',
        value: function spinBy(degrees) {
            var duration = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 300;

            if (degrees === 0) return;
            var cur_theta = toRadians(this.degree);
            var add_theta = toRadians(degrees);
            var r = this.radius;
            var _this = this;
            this.degree += degrees;
            if (duration > 0) {
                return new Promise(function (resolve, reject) {
                    Animate.run(function (elapsed) {
                        var theta = cur_theta + elapsed * add_theta;
                        _this.points[1] = { x: r * Math.cos(theta), y: r * Math.sin(theta) };
                        if (_this.stage) _this.stage.draw();
                    }, duration).after(function () {
                        var theta = cur_theta + add_theta;
                        _this.points[1] = { x: r * Math.cos(theta), y: r * Math.sin(theta) };
                        if (_this.stage) _this.stage.draw();
                        resolve();
                    });
                });
            } else {
                var theta = cur_theta + add_theta;
                this.points[1] = { x: r * Math.cos(theta), y: r * Math.sin(theta) };
                return Promise.resolve();
            }
        }
    }]);

    return CircleSpinner;
}(ArrowPath);

var ModuloClock = function (_mag$Circle) {
    _inherits(ModuloClock, _mag$Circle);

    function ModuloClock(x, y, rad, divisor) {
        _classCallCheck(this, ModuloClock);

        var _this15 = _possibleConstructorReturn(this, (ModuloClock.__proto__ || Object.getPrototypeOf(ModuloClock)).call(this, x, y, rad));

        var spinnerColor = '#111';
        var numberColor = '#aaa';
        var clockCenter = { x: rad, y: rad };

        _this15.color = 'Ivory';
        _this15.numberColor = numberColor;
        _this15.shadowColor = spinnerColor;

        var centerDot = new mag.Circle(0, 0, Math.trunc(rad / 8.0));
        centerDot.color = spinnerColor;
        centerDot.anchor = { x: 0.5, y: 0.5 };
        centerDot.pos = clockCenter;
        centerDot.shadowOffset = 0;
        centerDot.ignoreEvents = true;

        var spinner = new CircleSpinner(rad / 1.8);
        spinner.pos = clockCenter;
        spinner.anchor = { x: 0.5, y: 0.5 };
        spinner.stroke = { color: spinnerColor, lineWidth: 4 };

        // Display numbers on the clock
        var numRad = rad / 1.3;
        _this15.numbers = [];
        for (var i = 0; i < divisor; i++) {
            var theta = toRadians(90 + i / divisor * 360.0);
            var num = new TextExpr(i.toString());
            num.fontSize = 26;
            num.color = numberColor;
            num.anchor = { x: 0.5, y: 0.5 };
            num.pos = addPos({ x: numRad * Math.cos(theta), y: numRad * Math.sin(theta) + 5 }, clockCenter);
            _this15.addChild(num);
            _this15.numbers.push(num);
        }

        _this15.addChild(spinner);
        _this15.addChild(centerDot);

        _this15.hand = spinner;
        _this15.divisor = divisor;
        return _this15;
    }

    _createClass(ModuloClock, [{
        key: 'swap',
        value: function swap(child, newChild) {
            if (this.hasChild(child)) {
                newChild.pos = child.pos;
                newChild.anchor = child.anchor;
                newChild.lock();
                this.children.splice(this.children.indexOf(child), 1, newChild);
                this.update();
            }
        }
    }, {
        key: 'hitsChild',
        value: function hitsChild(pos, options) {
            if (!this.parent.toolbox) return _get(ModuloClock.prototype.__proto__ || Object.getPrototypeOf(ModuloClock.prototype), 'hitsChild', this).call(this, pos, options);else return null;
        }

        // 'Spins' the clock hand 'dividend' number of turns,
        // visualizing a modulo operation.

    }, {
        key: 'performModulo',
        value: function performModulo(dividend, cbAfterEveryTurn) {
            var divisor = this.divisor;
            var hand = this.hand;
            var num_turns = Math.trunc(dividend / divisor) * divisor + dividend % divisor;
            var turn_degrees = 360.0 / divisor;
            var turns = new Array(num_turns).fill(turn_degrees);
            var spin_dur = num_turns > 9 ? 2000 / num_turns : 200;
            var wait_dur = spin_dur;
            var numbers = this.numbers;
            var number_color = this.numberColor;
            var turn_idx = 0;
            var animation = turns.reduce(function (prom, degrees) {
                return prom.then(function () {
                    return new Promise(function (resolve, reject) {
                        // Spin turns
                        hand.spinBy(degrees, spin_dur).then(function () {
                            if (cbAfterEveryTurn) cbAfterEveryTurn();
                            numbers[turn_idx].color = number_color;
                            turn_idx = (turn_idx + 1) % divisor;
                            numbers[turn_idx].color = 'black';
                            Animate.wait(wait_dur).after(resolve);
                        });
                    });
                });
            }, Promise.resolve());
            animation.then(function () {
                console.log('@ ModuloClock: Done animating.');
            });
            return animation;
        }
    }]);

    return ModuloClock;
}(mag.Circle);

var ModuloClockExpr = function (_GraphicValueExpr) {
    _inherits(ModuloClockExpr, _GraphicValueExpr);

    function ModuloClockExpr(dividendExpr, divisor) {
        var radius = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 72;

        _classCallCheck(this, ModuloClockExpr);

        var _this16 = _possibleConstructorReturn(this, (ModuloClockExpr.__proto__ || Object.getPrototypeOf(ModuloClockExpr)).call(this, new ModuloClock(0, 0, radius, divisor)));

        _this16.color = 'Ivory';
        var n = dividendExpr;
        if (!n) n = new MissingNumberExpression();
        n.pos = _this16.graphicNode.centerPos();
        n.anchor = { x: 0.5, y: 0.5 };
        if (n instanceof NumberExpr) n.lock();
        _this16.graphicNode.addChild(n);
        return _this16;
    }

    _createClass(ModuloClockExpr, [{
        key: 'getDividendExpr',
        value: function getDividendExpr() {
            var es = this.graphicNode.children.filter(function (e) {
                return e instanceof MissingExpression || e instanceof NumberExpr;
            });
            if (es.length === 0) return null;else return es[0];
        }
    }, {
        key: 'performModulo',
        value: function performModulo() {
            var _this17 = this;

            var shouldGiveNumber = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

            if (this._isAnimating) return Promise.reject();
            var dividendExpr = this.getDividendExpr();
            if (!dividendExpr) return Promise.reject();else if (dividendExpr instanceof MissingExpression) {
                dividendExpr.animatePlaceholderStatus();
                return Promise.reject();
            } else {
                var _ret2 = function () {
                    _this17._isAnimating = true;
                    var dividend = dividendExpr.value();
                    var remainder = dividend % _this17.graphicNode.divisor;
                    var afterTurn = function afterTurn() {
                        dividendExpr.addValue(-1);
                    };
                    return {
                        v: _this17.graphicNode.performModulo(dividend, afterTurn).then(function () {
                            Animate.wait(200).after(function () {

                                var theta = toRadians(_this17.graphicNode.hand.degree);
                                var r = _this17.graphicNode.radius / 1.3;
                                var stage = _this17.stage;

                                var n = new FadedNumberExpr(remainder);
                                var pos = addPos(_this17.centerPos(), { x: r * Math.cos(theta), y: r * Math.sin(theta) });
                                n.anchor = { x: 0.5, y: 0.5 };

                                //Animate.poof(this);

                                if (shouldGiveNumber) {
                                    n.pos = pos;
                                    stage.add(n);
                                    _this17.opacity = 1.0;
                                    n.update();
                                    Animate.tween(_this17, { opacity: 0 }, 1000).after(function () {
                                        stage.remove(_this17);
                                        stage.update();
                                    });
                                } else {
                                    Animate.poof(_this17);
                                    stage.remove(_this17);
                                    stage.draw();
                                }
                            });
                        })
                    };
                }();

                if ((typeof _ret2 === 'undefined' ? 'undefined' : _typeof(_ret2)) === "object") return _ret2.v;
            }
        }
    }, {
        key: 'onmouseclick',
        value: function onmouseclick(pos) {
            this.performModulo();
        }
    }]);

    return ModuloClockExpr;
}(GraphicValueExpr);

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
                //console.error('Dice pos array does not exist for number ' + num + '.');
                return [];
            }
        }
    }]);

    function DiceNumber(num) {
        var radius = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 6;

        _classCallCheck(this, DiceNumber);

        var _this18 = _possibleConstructorReturn(this, (DiceNumber.__proto__ || Object.getPrototypeOf(DiceNumber)).call(this, 0, 0, 44, 44));

        _this18.number = num;
        _this18.circlePos = DiceNumber.drawPositionsFor(num);
        _this18.radius = radius;
        _this18.color = 'black';
        return _this18;
    }

    _createClass(DiceNumber, [{
        key: 'hits',
        value: function hits(pos, options) {
            return false;
        }
    }, {
        key: 'drawInternal',
        value: function drawInternal(ctx, pos, boundingSize) {
            var _this19 = this;

            if (this.circlePos && this.circlePos.length > 0) {
                (function () {

                    var rad = _this19.radius * boundingSize.w / _this19.size.w;
                    var fill = _this19.color;
                    var stroke = _this19.stroke;
                    _this19.circlePos.forEach(function (relpos) {
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