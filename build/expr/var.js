'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// Wrapper class to make arbitrary nodes into draggable expressions.

var VarExpr = function (_Expression) {
    _inherits(VarExpr, _Expression);

    function VarExpr() {
        _classCallCheck(this, VarExpr);

        return _possibleConstructorReturn(this, (VarExpr.__proto__ || Object.getPrototypeOf(VarExpr)).apply(this, arguments));
    }

    return VarExpr;
}(Expression);

var GraphicVarExpr = function (_VarExpr) {
    _inherits(GraphicVarExpr, _VarExpr);

    function GraphicVarExpr(graphic_node) {
        _classCallCheck(this, GraphicVarExpr);

        var _this2 = _possibleConstructorReturn(this, (GraphicVarExpr.__proto__ || Object.getPrototypeOf(GraphicVarExpr)).call(this, [graphic_node]));

        _this2.color = 'gold';
        return _this2;
    }

    _createClass(GraphicVarExpr, [{
        key: 'reduceCompletely',
        value: function reduceCompletely() {
            return this;
        }
    }, {
        key: 'reduce',
        value: function reduce() {
            return this;
        }

        //get size() { return this.holes[0].size; }

    }, {
        key: 'hits',
        value: function hits(pos, options) {
            if (this.ignoreEvents) return null;
            if (this.holes[0].hits(pos, options)) return this;else return null;
        }
    }, {
        key: 'onmouseenter',
        value: function onmouseenter(pos) {
            if (this.delegateToInner) this.holes[0].onmouseenter(pos);else _get(GraphicVarExpr.prototype.__proto__ || Object.getPrototypeOf(GraphicVarExpr.prototype), 'onmouseenter', this).call(this, pos);
        }
    }, {
        key: 'onmouseleave',
        value: function onmouseleave(pos) {
            if (!this.delegateToInner) _get(GraphicVarExpr.prototype.__proto__ || Object.getPrototypeOf(GraphicVarExpr.prototype), 'onmouseleave', this).call(this, pos);
            this.holes[0].onmouseleave(pos);
        }
    }, {
        key: 'drawInternal',
        value: function drawInternal(pos, boundingSize) {
            if (!this.delegateToInner) {
                this._color = '#777';
                _get(GraphicVarExpr.prototype.__proto__ || Object.getPrototypeOf(GraphicVarExpr.prototype), 'drawInternal', this).call(this, pos, boundingSize);
            }
        }
    }, {
        key: 'value',
        value: function value() {
            return this.holes[0].value();
        }
    }, {
        key: 'color',
        get: function get() {
            return _get(GraphicVarExpr.prototype.__proto__ || Object.getPrototypeOf(GraphicVarExpr.prototype), 'color', this);
        },
        set: function set(clr) {
            this.holes[0].color = clr;
        }
    }, {
        key: 'delegateToInner',
        get: function get() {
            return this.ignoreEvents || !this.parent || !(this.parent instanceof Expression);
        }
    }, {
        key: 'graphicNode',
        get: function get() {
            return this.holes[0];
        }
    }]);

    return GraphicVarExpr;
}(VarExpr);

var StarExpr = function (_GraphicVarExpr) {
    _inherits(StarExpr, _GraphicVarExpr);

    function StarExpr(x, y, rad) {
        var pts = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 5;

        _classCallCheck(this, StarExpr);

        return _possibleConstructorReturn(this, (StarExpr.__proto__ || Object.getPrototypeOf(StarExpr)).call(this, new Star(x, y, rad, pts)));
    }

    _createClass(StarExpr, [{
        key: 'toString',
        value: function toString() {
            return 'star';
        }
    }]);

    return StarExpr;
}(GraphicVarExpr);

var CircleExpr = function (_GraphicVarExpr2) {
    _inherits(CircleExpr, _GraphicVarExpr2);

    function CircleExpr(x, y, rad) {
        _classCallCheck(this, CircleExpr);

        return _possibleConstructorReturn(this, (CircleExpr.__proto__ || Object.getPrototypeOf(CircleExpr)).call(this, new Circle(x, y, rad)));
    }

    _createClass(CircleExpr, [{
        key: 'toString',
        value: function toString() {
            return 'circle';
        }
    }]);

    return CircleExpr;
}(GraphicVarExpr);

var PipeExpr = function (_GraphicVarExpr3) {
    _inherits(PipeExpr, _GraphicVarExpr3);

    function PipeExpr(x, y, w, h) {
        _classCallCheck(this, PipeExpr);

        return _possibleConstructorReturn(this, (PipeExpr.__proto__ || Object.getPrototypeOf(PipeExpr)).call(this, new Pipe(x, y, w, h - 12)));
    }

    _createClass(PipeExpr, [{
        key: 'toString',
        value: function toString() {
            return 'pipe';
        }
    }]);

    return PipeExpr;
}(GraphicVarExpr);

var TriangleExpr = function (_GraphicVarExpr4) {
    _inherits(TriangleExpr, _GraphicVarExpr4);

    function TriangleExpr(x, y, w, h) {
        _classCallCheck(this, TriangleExpr);

        return _possibleConstructorReturn(this, (TriangleExpr.__proto__ || Object.getPrototypeOf(TriangleExpr)).call(this, new Triangle(x, y, w, h)));
    }

    _createClass(TriangleExpr, [{
        key: 'toString',
        value: function toString() {
            return 'triangle';
        }
    }]);

    return TriangleExpr;
}(GraphicVarExpr);

var RectExpr = function (_GraphicVarExpr5) {
    _inherits(RectExpr, _GraphicVarExpr5);

    function RectExpr(x, y, w, h) {
        _classCallCheck(this, RectExpr);

        return _possibleConstructorReturn(this, (RectExpr.__proto__ || Object.getPrototypeOf(RectExpr)).call(this, new Rect(x, y, w, h)));
    }

    _createClass(RectExpr, [{
        key: 'toString',
        value: function toString() {
            return 'diamond';
        }
    }]);

    return RectExpr;
}(GraphicVarExpr);

var ImageExpr = function (_GraphicVarExpr6) {
    _inherits(ImageExpr, _GraphicVarExpr6);

    function ImageExpr(x, y, w, h, resource_key) {
        _classCallCheck(this, ImageExpr);

        var _this8 = _possibleConstructorReturn(this, (ImageExpr.__proto__ || Object.getPrototypeOf(ImageExpr)).call(this, new ImageRect(x, y, w, h, resource_key)));

        _this8._image = resource_key;
        return _this8;
    }

    _createClass(ImageExpr, [{
        key: 'toString',
        value: function toString() {
            return this._image;
        }
    }, {
        key: 'image',
        get: function get() {
            return this._image;
        },
        set: function set(img) {
            this._image = img;
            this.graphicNode.image = img;
        }
    }]);

    return ImageExpr;
}(GraphicVarExpr);

var FunnelExpr = function (_ImageExpr) {
    _inherits(FunnelExpr, _ImageExpr);

    function FunnelExpr(x, y, w, h) {
        _classCallCheck(this, FunnelExpr);

        var _this9 = _possibleConstructorReturn(this, (FunnelExpr.__proto__ || Object.getPrototypeOf(FunnelExpr)).call(this, x, y, w, h, 'funnel'));

        _this9.graphicNode.anchor = { x: 0, y: 0.5 };
        return _this9;
    }

    _createClass(FunnelExpr, [{
        key: 'update',
        value: function update() {}
    }, {
        key: 'onmouseenter',
        value: function onmouseenter() {
            this.graphicNode.image = 'funnel-selected';
        }
    }, {
        key: 'onmouseleave',
        value: function onmouseleave() {
            this.graphicNode.image = 'funnel';
        }
    }, {
        key: 'drawInternal',
        value: function drawInternal(pos, boundingSize) {}
    }, {
        key: 'size',
        get: function get() {
            return this.graphicNode.size;
        }
    }]);

    return FunnelExpr;
}(ImageExpr);

var NullExpr = function (_ImageExpr2) {
    _inherits(NullExpr, _ImageExpr2);

    function NullExpr(x, y, w, h) {
        _classCallCheck(this, NullExpr);

        return _possibleConstructorReturn(this, (NullExpr.__proto__ || Object.getPrototypeOf(NullExpr)).call(this, x, y, w, h, 'null-circle'));
    }

    _createClass(NullExpr, [{
        key: 'reduce',
        value: function reduce() {
            return null; // hmmmm
        }
    }, {
        key: 'performReduction',
        value: function performReduction() {
            Animate.poof(this);
            _get(NullExpr.prototype.__proto__ || Object.getPrototypeOf(NullExpr.prototype), 'performReduction', this).call(this);
        }
    }, {
        key: 'onmousehover',
        value: function onmousehover() {
            this.image = 'null-circle-highlight';
        }
    }, {
        key: 'onmouseleave',
        value: function onmouseleave() {
            this.image = 'null-circle';
        }
    }, {
        key: 'onmouseclick',
        value: function onmouseclick() {
            this.performReduction();
        }
    }, {
        key: 'toString',
        value: function toString() {
            return 'null';
        }
    }, {
        key: 'value',
        value: function value() {
            return null;
        }
    }]);

    return NullExpr;
}(ImageExpr);

var MirrorExpr = function (_ImageExpr3) {
    _inherits(MirrorExpr, _ImageExpr3);

    function MirrorExpr(x, y, w, h) {
        _classCallCheck(this, MirrorExpr);

        var _this11 = _possibleConstructorReturn(this, (MirrorExpr.__proto__ || Object.getPrototypeOf(MirrorExpr)).call(this, x, y, w, h, 'mirror-icon'));

        _this11.lock();
        _this11.graphicNode.offset = { x: 0, y: -10 };
        _this11.innerExpr = null;
        _this11._broken = false;
        return _this11;
    }

    _createClass(MirrorExpr, [{
        key: 'drawInternalAfterChildren',
        value: function drawInternalAfterChildren(pos, boundingSize) {
            if (!this.innerExpr) return;

            var ctx = this.ctx;

            ctx.save();
            ctx.globalCompositeOperation = "overlay";
            this.innerExpr.parent = this.graphicNode;
            this.innerExpr.pos = { x: this.graphicNode.size.w / 2.0, y: this.graphicNode.size.h / 2.0 };
            this.innerExpr.anchor = { x: 0.5, y: 0.8 };
            this.innerExpr.ctx = ctx;
            this.innerExpr.draw();
            ctx.restore();
        }
    }, {
        key: 'exprInMirror',
        set: function set(e) {
            this.innerExpr = e;

            if (e) {
                e.scale = { x: 1, y: 1 };
                e.parent = this.graphicNode;
                e.update();
            }
        },
        get: function get() {
            return this.innerExpr;
        }
    }, {
        key: 'broken',
        set: function set(b) {
            this._broken = b;
            if (b) this.graphicNode.image = 'mirror-icon-broken';else this.graphicNode.image = 'mirror-icon';
        },
        get: function get() {
            return this._broken;
        }
    }]);

    return MirrorExpr;
}(ImageExpr);

/** Faded variants. */


var FadedVarExpr = function (_Expression2) {
    _inherits(FadedVarExpr, _Expression2);

    function FadedVarExpr(name) {
        _classCallCheck(this, FadedVarExpr);

        var txt = new TextExpr(name);

        var _this12 = _possibleConstructorReturn(this, (FadedVarExpr.__proto__ || Object.getPrototypeOf(FadedVarExpr)).call(this, [txt]));

        txt.color = "OrangeRed";
        _this12.color = "gold";
        _this12.primitiveName = name;
        return _this12;
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

        return _possibleConstructorReturn(this, (FadedStarExpr.__proto__ || Object.getPrototypeOf(FadedStarExpr)).call(this, 'star'));
    }

    return FadedStarExpr;
}(FadedVarExpr);

var FadedRectExpr = function (_FadedVarExpr2) {
    _inherits(FadedRectExpr, _FadedVarExpr2);

    function FadedRectExpr() {
        _classCallCheck(this, FadedRectExpr);

        return _possibleConstructorReturn(this, (FadedRectExpr.__proto__ || Object.getPrototypeOf(FadedRectExpr)).call(this, 'rect'));
    }

    return FadedRectExpr;
}(FadedVarExpr);

var FadedTriangleExpr = function (_FadedVarExpr3) {
    _inherits(FadedTriangleExpr, _FadedVarExpr3);

    function FadedTriangleExpr() {
        _classCallCheck(this, FadedTriangleExpr);

        return _possibleConstructorReturn(this, (FadedTriangleExpr.__proto__ || Object.getPrototypeOf(FadedTriangleExpr)).call(this, 'tri'));
    }

    return FadedTriangleExpr;
}(FadedVarExpr);

var FadedCircleExpr = function (_FadedVarExpr4) {
    _inherits(FadedCircleExpr, _FadedVarExpr4);

    function FadedCircleExpr() {
        _classCallCheck(this, FadedCircleExpr);

        return _possibleConstructorReturn(this, (FadedCircleExpr.__proto__ || Object.getPrototypeOf(FadedCircleExpr)).call(this, 'dot'));
    }

    return FadedCircleExpr;
}(FadedVarExpr);