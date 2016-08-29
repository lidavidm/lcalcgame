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
        //bag.unlock();
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
                if (this.func.holes.length > 0) this.func.holes[0].open();else {
                    if (!this.funcDraw) this.funcDraw = this.func.draw;
                    this.func.draw = function () {};
                }
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
        },
        set: function set(f) {
            f.anchor = { x: 0, y: 0 };
            this.holes[0] = f;
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

var FadedVarExpr = function (_Expression) {
    _inherits(FadedVarExpr, _Expression);

    function FadedVarExpr(name) {
        _classCallCheck(this, FadedVarExpr);

        var txt = new TextExpr(name);

        var _this8 = _possibleConstructorReturn(this, Object.getPrototypeOf(FadedVarExpr).call(this, [txt]));

        txt.color = "OrangeRed";
        _this8.color = "gold";
        _this8.primitiveName = name;
        return _this8;
    }

    _createClass(FadedVarExpr, [{
        key: 'reduceCompletely',
        value: function reduceCompletely() {
            return this;
        }
    }, {
        key: 'reduce',
        value: function reduce() {
            return this;
        }
    }, {
        key: 'toString',
        value: function toString() {
            return this.primitiveName;
        }
    }, {
        key: 'value',
        value: function value() {
            return this.toString();
        }
    }]);

    return FadedVarExpr;
}(Expression);

var FadedStarExpr = function (_FadedVarExpr) {
    _inherits(FadedStarExpr, _FadedVarExpr);

    function FadedStarExpr() {
        _classCallCheck(this, FadedStarExpr);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(FadedStarExpr).call(this, 'star'));
    }

    return FadedStarExpr;
}(FadedVarExpr);

var FadedRectExpr = function (_FadedVarExpr2) {
    _inherits(FadedRectExpr, _FadedVarExpr2);

    function FadedRectExpr() {
        _classCallCheck(this, FadedRectExpr);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(FadedRectExpr).call(this, 'rect'));
    }

    return FadedRectExpr;
}(FadedVarExpr);

var FadedTriangleExpr = function (_FadedVarExpr3) {
    _inherits(FadedTriangleExpr, _FadedVarExpr3);

    function FadedTriangleExpr() {
        _classCallCheck(this, FadedTriangleExpr);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(FadedTriangleExpr).call(this, 'triangle'));
    }

    return FadedTriangleExpr;
}(FadedVarExpr);

var FadedCircleExpr = function (_FadedVarExpr4) {
    _inherits(FadedCircleExpr, _FadedVarExpr4);

    function FadedCircleExpr() {
        _classCallCheck(this, FadedCircleExpr);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(FadedCircleExpr).call(this, 'circle'));
    }

    return FadedCircleExpr;
}(FadedVarExpr);

var BracketArrayExpr = function (_BagExpr) {
    _inherits(BracketArrayExpr, _BagExpr);

    function BracketArrayExpr(x, y, w, h) {
        var holding = arguments.length <= 4 || arguments[4] === undefined ? [] : arguments[4];

        _classCallCheck(this, BracketArrayExpr);

        var _this13 = _possibleConstructorReturn(this, Object.getPrototypeOf(BracketArrayExpr).call(this, x, y, w, h, holding));

        _this13.holes = [];
        _this13.children = [];

        _this13.addArg(new Expression());

        _this13._items = holding;

        _this13.l_brak = new TextExpr('[');
        _this13.r_brak = new TextExpr(']');
        _this13.graphicNode.addArg(_this13.l_brak);
        _this13.graphicNode.addArg(_this13.r_brak);

        _this13.graphicNode.padding = { left: 10, inner: 0, right: 20 };
        return _this13;
    }

    _createClass(BracketArrayExpr, [{
        key: 'arrangeNicely',
        value: function arrangeNicely() {}
    }, {
        key: 'addItem',


        // Adds an item to the bag.
        value: function addItem(item) {

            item.onmouseleave();

            item.lock();

            this._items.push(item);

            if (this._items.length > 1) {
                var comma = new TextExpr(',');
                this.graphicNode.holes.splice(this.graphicNode.holes.length - 1, 0, comma);
            }

            this.graphicNode.holes.splice(this.graphicNode.holes.length - 1, 0, item);

            this.graphicNode.update();

            console.log(this.graphicNode.children, this.graphicNode.children.length);
        }

        // Removes an item from the bag and returns it.

    }, {
        key: 'popItem',
        value: function popItem() {
            var item = this._items.pop();
            this.graphicNode.removeArg(item);
            return item;
        }

        // Spills the entire bag onto the play field.

    }, {
        key: 'spill',
        value: function spill() {
            var _this14 = this;

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

            // Add back all of this bags' items to the stage.
            items.forEach(function (item, index) {

                item = item.clone();
                var theta = index / items.length * Math.PI * 2;
                var rad = _this14.size.h * 2.0;
                var targetPos = addPos(pos, { x: rad * Math.cos(theta), y: rad * Math.sin(theta) });
                item.pos = pos;
                Animate.tween(item, { 'pos': targetPos }, 100, function (elapsed) {
                    return Math.pow(elapsed, 0.5);
                });
                //item.pos = addPos(pos, { x:rad*Math.cos(theta), y:rad*Math.sin(theta) });
                item.parent = null;
                _this14.graphicNode.removeChild(item);
                item.scale = { x: 1, y: 1 };
                stage.add(item);
            });

            // Set the items in the bag back to nothing.
            this.items = [];
            this.graphicNode.holes = [this.l_brak, this.r_brak]; // just to be sure!
            this.graphicNode.update();

            // Play spill sfx
            Resource.play('bag-spill');
        }
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
            this.ondropexit(node, pos);

            if (this.parent) return;

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
            this.addItem(n);

            Resource.play('bag-addItem');
        }
    }, {
        key: 'items',
        get: function get() {
            return this._items.slice();
        },
        set: function set(items) {
            var _this15 = this;

            this._items.forEach(function (item) {
                return _this15.graphicNode.removeArg(item);
            });
            this.graphicNode.children = [this.l_brak, this.r_brak];
            this._items = [];
            items.forEach(function (item) {
                _this15.addItem(item);
            });
        }
    }, {
        key: 'delegateToInner',
        get: function get() {
            return true;
        }
    }]);

    return BracketArrayExpr;
}(BagExpr);