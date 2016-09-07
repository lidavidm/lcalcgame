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

var HalfFadedLambdaHoleExpr = function (_LambdaHoleExpr2) {
    _inherits(HalfFadedLambdaHoleExpr, _LambdaHoleExpr2);

    function HalfFadedLambdaHoleExpr() {
        _classCallCheck(this, HalfFadedLambdaHoleExpr);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(HalfFadedLambdaHoleExpr).apply(this, arguments));
    }

    _createClass(HalfFadedLambdaHoleExpr, [{
        key: 'openImage',
        get: function get() {
            return this.name === 'x' ? 'lambda-hole-xside' : 'lambda-hole-y';
        }
    }, {
        key: 'closedImage',
        get: function get() {
            return this.name === 'x' ? 'lambda-hole-xside-closed' : 'lambda-hole-y-closed';
        }
    }]);

    return HalfFadedLambdaHoleExpr;
}(LambdaHoleExpr);

var FadedPythonLambdaHoleExpr = function (_LambdaHoleExpr3) {
    _inherits(FadedPythonLambdaHoleExpr, _LambdaHoleExpr3);

    function FadedPythonLambdaHoleExpr() {
        _classCallCheck(this, FadedPythonLambdaHoleExpr);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(FadedPythonLambdaHoleExpr).apply(this, arguments));
    }

    _createClass(FadedPythonLambdaHoleExpr, [{
        key: 'drawInternal',


        // Draw special round rect around term.
        value: function drawInternal(pos, boundingSize) {
            var ctx = this.ctx;
            setStrokeStyle(ctx, this.stroke);
            ctx.fillStyle = this.color;
            ctx.drawImage(Resource.getImage(this.image), pos.x, pos.y, boundingSize.w, boundingSize.h);
            if (this.stroke) {
                roundRect(ctx, pos.x, pos.y, boundingSize.w, boundingSize.h, 6, false, true, this.stroke.opacity);
            }
        }
    }, {
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

var FadedES6LambdaHoleExpr = function (_FadedPythonLambdaHol) {
    _inherits(FadedES6LambdaHoleExpr, _FadedPythonLambdaHol);

    function FadedES6LambdaHoleExpr() {
        _classCallCheck(this, FadedES6LambdaHoleExpr);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(FadedES6LambdaHoleExpr).apply(this, arguments));
    }

    _createClass(FadedES6LambdaHoleExpr, [{
        key: 'hits',


        // Events
        value: function hits(pos, options) {
            if (this.ignoreEvents) return null; // All children are ignored as well.
            else if (!this.isOpen) return null;

            if (typeof options !== 'undefined' && options.hasOwnProperty('exclude')) {
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = options.exclude[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var e = _step.value;

                        if (e == this) return null;
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

            var hitChild = this.hitsChild(pos, options);
            if (hitChild) return hitChild;

            // Hasn't hit any children, so test if the point lies on this node.
            var boundingSize = this.absoluteSize;
            boundingSize.w /= 2.0;
            var upperLeftPos = this.upperLeftPos(this.absolutePos, boundingSize);
            if (pointInRect(pos, rectFromPosAndSize(upperLeftPos, boundingSize))) return this;else return null;
        }

        // Draw special round rect around just x term.

    }, {
        key: 'drawInternal',
        value: function drawInternal(pos, boundingSize) {
            var ctx = this.ctx;
            setStrokeStyle(ctx, this.stroke);
            ctx.fillStyle = this.color;
            ctx.drawImage(Resource.getImage(this.image), pos.x, pos.y, boundingSize.w, boundingSize.h);
            if (this.stroke) {
                roundRect(ctx, pos.x, pos.y, boundingSize.w / 2.0, boundingSize.h, 6, false, true, this.stroke.opacity);
            }
        }
    }, {
        key: 'openImage',
        get: function get() {
            return this.name === 'x' ? 'lambda-hole-x-es6' : 'lambda-hole-y';
        }
    }, {
        key: 'closedImage',
        get: function get() {
            return this.name === 'x' ? 'lambda-hole-x-closed-es6' : 'lambda-hole-y-closed';
        }
    }]);

    return FadedES6LambdaHoleExpr;
}(FadedPythonLambdaHoleExpr);

var HalfFadedLambdaVarExpr = function (_LambdaVarExpr) {
    _inherits(HalfFadedLambdaVarExpr, _LambdaVarExpr);

    function HalfFadedLambdaVarExpr() {
        _classCallCheck(this, HalfFadedLambdaVarExpr);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(HalfFadedLambdaVarExpr).apply(this, arguments));
    }

    _createClass(HalfFadedLambdaVarExpr, [{
        key: 'openImage',
        get: function get() {
            return 'lambda-pipe-open';
        }
    }, {
        key: 'closedImage',
        get: function get() {
            return this.name === 'x' ? 'lambda-pipe-xside-closed' : 'lambda-pipe-xside-closed';
        }
    }]);

    return HalfFadedLambdaVarExpr;
}(LambdaVarExpr);

var FadedLambdaVarExpr = function (_LambdaVarExpr2) {
    _inherits(FadedLambdaVarExpr, _LambdaVarExpr2);

    function FadedLambdaVarExpr(varname) {
        _classCallCheck(this, FadedLambdaVarExpr);

        var _this6 = _possibleConstructorReturn(this, Object.getPrototypeOf(FadedLambdaVarExpr).call(this, varname));

        _this6.graphicNode.size = _this6.name === 'x' ? { w: 24, h: 24 } : { w: 24, h: 30 };
        _this6.graphicNode.offset = _this6.name === 'x' ? { x: 0, y: 0 } : { x: 0, y: 2 };
        _this6.handleOffset = 2;
        return _this6;
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
        get: function get() {
            return 'lambda-pipe-x-open';
        }
    }, {
        key: 'closedImage',
        get: function get() {
            return this.name === 'x' ? 'lambda-pipe-x' : 'lambda-pipe-x';
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

        var _this7 = _possibleConstructorReturn(this, Object.getPrototypeOf(FadedSimpleMapFunc).call(this, oneParamFunc, bag));

        var txt_color = 'black';
        var txt = new TextExpr('.map(');
        txt.color = txt_color;
        var txt2 = new TextExpr(')');
        txt2.color = txt_color;

        _this7.holes = [];
        _this7.addArg(bag);
        _this7.addArg(txt);
        _this7.addArg(oneParamFunc);
        _this7.addArg(txt2);
        _this7.arrowPaths = [];
        //this.heightScalar = 1.0;
        //this.exprOffsetY = 0;
        //this.animatedReduction = false;
        _this7.update();

        _this7.color = "YellowGreen";
        return _this7;
    }

    _createClass(FadedSimpleMapFunc, [{
        key: 'returnBag',
        get: function get() {
            return null;
        }
    }, {
        key: 'func',
        get: function get() {
            return this.holes[2];
        }
    }, {
        key: 'bag',
        get: function get() {
            return this.holes[0];
        },
        set: function set(bg) {
            this.holes[0] = bg;
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

        var _this8 = _possibleConstructorReturn(this, Object.getPrototypeOf(FadedMapFunc).call(this, oneParamFunc, bag));

        _this8.heightScalar = 1.0;
        _this8.exprOffsetY = 0;
        _this8.animatedReduction = false;
        return _this8;
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

        var _this9 = _possibleConstructorReturn(this, Object.getPrototypeOf(FunnelMapFunc).call(this, oneParamFunc, bag));

        _this9.children = [];
        _this9.holes = [];
        //this.animatedReduction = false;

        // Expression it fits over.
        oneParamFunc.unlock();
        _this9.addArg(oneParamFunc);

        // Funnel graphic.
        var funnel = new FunnelExpr(0, 0, 198 / 2, 281 / 2);
        _this9.funnel = funnel;
        _this9.addArg(funnel);

        // Bag.
        //bag.unlock();
        _this9.addArg(bag);
        return _this9;
    }

    _createClass(FunnelMapFunc, [{
        key: 'update',
        value: function update() {
            var _this10 = this;

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
                _this10.addChild(h);
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

        var _this11 = _possibleConstructorReturn(this, Object.getPrototypeOf(FadedVarExpr).call(this, [txt]));

        txt.color = "OrangeRed";
        _this11.color = "gold";
        _this11.primitiveName = name;
        return _this11;
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
    }, {
        key: 'graphicNode',
        get: function get() {
            return this.holes[0];
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

        return _possibleConstructorReturn(this, Object.getPrototypeOf(FadedTriangleExpr).call(this, 'tri'));
    }

    return FadedTriangleExpr;
}(FadedVarExpr);

var FadedCircleExpr = function (_FadedVarExpr4) {
    _inherits(FadedCircleExpr, _FadedVarExpr4);

    function FadedCircleExpr() {
        _classCallCheck(this, FadedCircleExpr);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(FadedCircleExpr).call(this, 'dot'));
    }

    return FadedCircleExpr;
}(FadedVarExpr);

var FadedNullExpr = function (_FadedVarExpr5) {
    _inherits(FadedNullExpr, _FadedVarExpr5);

    function FadedNullExpr() {
        _classCallCheck(this, FadedNullExpr);

        var _this16 = _possibleConstructorReturn(this, Object.getPrototypeOf(FadedNullExpr).call(this, 'null'));

        _this16.color = "lightgray";
        _this16.graphicNode.color = 'black';
        _this16.opacity = 0.8;
        return _this16;
    }

    _createClass(FadedNullExpr, [{
        key: 'poof',
        value: function poof() {
            if (!this.stage) return;
            Animate.poof(this);
            this.stage.remove(this);
        }
    }]);

    return FadedNullExpr;
}(FadedVarExpr);

var BracketArrayExpr = function (_BagExpr) {
    _inherits(BracketArrayExpr, _BagExpr);

    function BracketArrayExpr(x, y, w, h) {
        var holding = arguments.length <= 4 || arguments[4] === undefined ? [] : arguments[4];

        _classCallCheck(this, BracketArrayExpr);

        var _this17 = _possibleConstructorReturn(this, Object.getPrototypeOf(BracketArrayExpr).call(this, x, y, w, h, holding));

        _this17.holes = [];
        _this17.children = [];

        _this17.addArg(new Expression());

        _this17._items = holding;

        _this17.l_brak = new TextExpr('[');
        _this17.r_brak = new TextExpr(']');
        _this17.graphicNode.addArg(_this17.l_brak);
        _this17.graphicNode.addArg(_this17.r_brak);

        _this17.graphicNode.padding = { left: 10, inner: 0, right: 20 };

        //this.color = "tan";
        return _this17;
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
        }

        // Removes an item from the bag and returns it.

    }, {
        key: 'popItem',
        value: function popItem() {
            var item = this._items.pop();
            this.graphicNode.removeArg(item);
            if (this._items.length >= 1) {
                var last_comma_idx = this.graphicNode.holes.length - 2;
                this.graphicNode.holes.splice(last_comma_idx, 1);
            }
            return item;
        }

        // Spills the entire bag onto the play field.

    }, {
        key: 'spill',
        value: function spill() {
            var _this18 = this;

            if (!this.stage) {
                console.error('@ BracketArrayExpr.spill: Array is not attached to a Stage.');
                return;
            } else if (this.parent) {
                console.error('@ BracketArrayExpr.spill: Cannot spill array while it\'s inside of another expression.');
                return;
            } else if (this.toolbox) {
                console.warn('@ BracketArrayExpr.spill: Cannot spill array while it\'s inside the toolbox.');
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
                var rad = _this18.size.h * 2.0;
                var targetPos = addPos(pos, { x: rad * Math.cos(theta), y: rad * Math.sin(theta) });

                targetPos = clipToRect(targetPos, item.absoluteSize, { x: 25, y: 0 }, { w: GLOBAL_DEFAULT_SCREENSIZE.width - 25,
                    h: GLOBAL_DEFAULT_SCREENSIZE.height - stage.toolbox.size.h });

                item.pos = pos;
                Animate.tween(item, { 'pos': targetPos }, 100, function (elapsed) {
                    return Math.pow(elapsed, 0.5);
                });
                //item.pos = addPos(pos, { x:rad*Math.cos(theta), y:rad*Math.sin(theta) });
                item.parent = null;
                _this18.graphicNode.removeChild(item);
                item.scale = { x: 1, y: 1 };
                stage.add(item);
            });

            // Set the items in the bag back to nothing.
            this.items = [];
            this.graphicNode.holes = [this.l_brak, this.r_brak]; // just to be sure!
            this.graphicNode.update();

            // Log changes
            Logger.log('bag-spill', { 'before': before_str, 'after': stage.toString(), 'item': bag_before_str });

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
            var _this19 = this;

            this._items.forEach(function (item) {
                return _this19.graphicNode.removeArg(item);
            });
            this.graphicNode.children = [this.l_brak, this.r_brak];
            this._items = [];
            items.forEach(function (item) {
                _this19.addItem(item);
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