'use strict';

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var FadedLambdaHoleExpr = function (_LambdaHoleExpr) {
    _inherits(FadedLambdaHoleExpr, _LambdaHoleExpr);

    function FadedLambdaHoleExpr() {
        _classCallCheck(this, FadedLambdaHoleExpr);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(FadedLambdaHoleExpr).apply(this, arguments));
    }

    _createClass(FadedLambdaHoleExpr, [{
        key: 'openImage',
        get: function get() {
            return this.name === 'x' ? 'lambda-hole-x' : 'lambda-hole-y';
        }
    }, {
        key: 'closedImage',
        get: function get() {
            return this.name === 'x' ? 'lambda-hole-x-closed' : 'lambda-hole-y-closed';
        }
    }]);

    return FadedLambdaHoleExpr;
}(LambdaHoleExpr);

var FadedPythonLambdaHoleExpr = function (_LambdaHoleExpr2) {
    _inherits(FadedPythonLambdaHoleExpr, _LambdaHoleExpr2);

    function FadedPythonLambdaHoleExpr() {
        _classCallCheck(this, FadedPythonLambdaHoleExpr);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(FadedPythonLambdaHoleExpr).apply(this, arguments));
    }

    _createClass(FadedPythonLambdaHoleExpr, [{
        key: 'openImage',
        get: function get() {
            return this.name === 'x' ? 'lambda-hole-x-python' : 'lambda-hole-y';
        }
    }, {
        key: 'closedImage',
        get: function get() {
            return this.name === 'x' ? 'lambda-hole-x-closed-python' : 'lambda-hole-y-closed';
        }
    }, {
        key: 'size',
        get: function get() {
            var sz = _get(Object.getPrototypeOf(FadedPythonLambdaHoleExpr.prototype), 'size', this);
            sz.w = 120;
            return sz;
        }
    }]);

    return FadedPythonLambdaHoleExpr;
}(LambdaHoleExpr);

var FadedLambdaVarExpr = function (_LambdaVarExpr) {
    _inherits(FadedLambdaVarExpr, _LambdaVarExpr);

    function FadedLambdaVarExpr(varname) {
        _classCallCheck(this, FadedLambdaVarExpr);

        var _this3 = _possibleConstructorReturn(this, Object.getPrototypeOf(FadedLambdaVarExpr).call(this, varname));

        _this3.graphicNode.size = _this3.name === 'x' ? { w: 24, h: 24 } : { w: 24, h: 30 };
        _this3.graphicNode.offset = _this3.name === 'x' ? { x: 0, y: 0 } : { x: 0, y: 2 };
        _this3.handleOffset = 2;
        return _this3;
    }

    _createClass(FadedLambdaVarExpr, [{
        key: 'open',
        value: function open() {
            var preview_expr = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

            if (this.stateGraph.currentState !== 'open') {
                this.stateGraph.enter('opening');

                if (preview_expr) {
                    var scale = this.graphicNode.size.w / preview_expr.size.w * 2.0;
                    preview_expr.pos = { x: this.graphicNode.size.w / 2.0, y: 0 };
                    preview_expr.scale = { x: scale, y: scale };
                    preview_expr.anchor = { x: 0.5, y: 0.3 };
                    preview_expr.stroke = null;
                    this.graphicNode.addChild(preview_expr);
                    this.stage.draw();
                }
            }
        }
    }, {
        key: 'openImage',
        get: function get() {}
    }, {
        key: 'closedImage',
        get: function get() {
            return this.name === 'x' ? 'lambda-pipe-x' : 'lambda-pipe-y';
        }
    }, {
        key: 'openingAnimation',
        get: function get() {
            var anim = new Animation();
            anim.addFrame('lambda-pipe-x-opening0', 50);
            anim.addFrame('lambda-pipe-x-opening1', 50);
            anim.addFrame(this.openImage, 50);
            return anim;
        }
    }, {
        key: 'closingAnimation',
        get: function get() {
            var anim = new Animation();
            anim.addFrame('lambda-pipe-x-opening1', 50);
            anim.addFrame('lambda-pipe-x-opening0', 50);
            anim.addFrame(this.closedImage, 50);
            return anim;
        }
    }]);

    return FadedLambdaVarExpr;
}(LambdaVarExpr);

var FadedSimpleMapFunc = function (_SimpleMapFunc) {
    _inherits(FadedSimpleMapFunc, _SimpleMapFunc);

    function FadedSimpleMapFunc(oneParamFunc, bag) {
        _classCallCheck(this, FadedSimpleMapFunc);

        var _this4 = _possibleConstructorReturn(this, Object.getPrototypeOf(FadedSimpleMapFunc).call(this, oneParamFunc, bag));

        var txt_color = 'black';
        var txt = new TextExpr('map(');
        txt.color = txt_color;
        var comma = new TextExpr(',');
        comma.color = txt_color;
        var txt2 = new TextExpr(')');
        txt2.color = txt_color;

        _this4.holes = [];
        _this4.addArg(txt);
        _this4.addArg(oneParamFunc);
        _this4.addArg(comma);
        _this4.addArg(bag);
        _this4.addArg(txt2);
        _this4.arrowPaths = [];
        //this.heightScalar = 1.0;
        //this.exprOffsetY = 0;
        //this.animatedReduction = false;
        _this4.update();

        _this4.color = "YellowGreen";
        return _this4;
    }

    _createClass(FadedSimpleMapFunc, [{
        key: 'returnBag',
        get: function get() {
            return null;
        }
    }, {
        key: 'func',
        get: function get() {
            return this.holes[1];
        }
    }, {
        key: 'bag',
        get: function get() {
            return this.holes[3];
        },
        set: function set(bg) {
            this.holes[3] = bg;
        }
    }]);

    return FadedSimpleMapFunc;
}(SimpleMapFunc);

// Full-faded map function.


var FadedMapFunc = function (_FadedSimpleMapFunc) {
    _inherits(FadedMapFunc, _FadedSimpleMapFunc);

    function FadedMapFunc(oneParamFunc, bag) {
        _classCallCheck(this, FadedMapFunc);

        // Remove animations + arrow

        var _this5 = _possibleConstructorReturn(this, Object.getPrototypeOf(FadedMapFunc).call(this, oneParamFunc, bag));

        _this5.heightScalar = 1.0;
        _this5.exprOffsetY = 0;
        _this5.animatedReduction = false;
        return _this5;
    }

    _createClass(FadedMapFunc, [{
        key: 'updateArrowPaths',
        value: function updateArrowPaths() {} // remove arrow

    }]);

    return FadedMapFunc;
}(FadedSimpleMapFunc);

// Fully-concrete map function.


var FunnelMapFunc = function (_MapFunc) {
    _inherits(FunnelMapFunc, _MapFunc);

    function FunnelMapFunc(oneParamFunc, bag) {
        _classCallCheck(this, FunnelMapFunc);

        var _this6 = _possibleConstructorReturn(this, Object.getPrototypeOf(FunnelMapFunc).call(this, oneParamFunc, bag));

        _this6.children = [];
        _this6.holes = [];
        //this.animatedReduction = false;

        // Expression it fits over.
        oneParamFunc.unlock();
        _this6.addArg(oneParamFunc);

        // Funnel graphic.
        var funnel = new FunnelExpr(0, 0, 198 / 2, 281 / 2);
        _this6.funnel = funnel;
        _this6.addArg(funnel);

        // Bag.
        bag.unlock();
        _this6.addArg(bag);
        return _this6;
    }

    _createClass(FunnelMapFunc, [{
        key: 'update',
        value: function update() {
            var _this7 = this;

            if (this.func && this.funnel) {
                this.func.pos = { x: this.funnel.size.w * 38 / 200, y: this.funnel.size.h / 2.0 - this.func.size.h / 1.3 };
                this.func.update();
                this.func.holes[0].open();
            }
            if (this.bag && this.funnel) {
                if (this.bag instanceof MissingExpression) this.bag.shadowOffset = -4;
                this.bag.pos = { x: this.funnel.size.w / 2.0 + 3, y: -this.funnel.size.h * (280 / 2 - 50) / 280 };
                this.bag.anchor = { x: 0.5, y: 0.5 };
                this.bag.update();
            }
            this.children = [];
            this.holes.forEach(function (h) {
                _this7.addChild(h);
            });
        }
    }, {
        key: 'onmouseenter',
        value: function onmouseenter(pos) {
            this.funnel.onmouseenter(pos);
            this.func.onmouseenter(pos);
        }
    }, {
        key: 'onmouseleave',
        value: function onmouseleave(pos) {
            this.funnel.onmouseleave(pos);
            this.func.onmouseleave(pos);
        }
    }, {
        key: 'updateArrowPaths',
        value: function updateArrowPaths() {}
    }, {
        key: 'drawInternal',
        value: function drawInternal(pos, boundingSize) {}
    }, {
        key: 'hits',
        value: function hits(pos, options) {
            var b = this.bag.hits(pos, options);
            if (b) return b;
            var e = this.func.hits(pos, options);
            if (e) return e != this.func && e != this.func.holes[0] ? e : this;
            var h = this.funnel.hits(pos, options);
            if (h) return this;else return null;
        }
    }, {
        key: 'returnBag',
        get: function get() {
            return null;
        }
    }, {
        key: 'func',
        get: function get() {
            return this.holes[0];
        }
    }, {
        key: 'bag',
        get: function get() {
            return this.holes[2];
        },
        set: function set(bg) {
            this.holes[2] = bg;
        }
    }]);

    return FunnelMapFunc;
}(MapFunc);