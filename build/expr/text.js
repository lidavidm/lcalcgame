'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TextExpr = function (_Expression) {
    _inherits(TextExpr, _Expression);

    function TextExpr(txt) {
        var font = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'Consolas';
        var fontSize = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 35;

        _classCallCheck(this, TextExpr);

        var _this = _possibleConstructorReturn(this, (TextExpr.__proto__ || Object.getPrototypeOf(TextExpr)).call(this));

        _this.text = txt;
        _this.font = font;
        _this.fontSize = fontSize; // in pixels
        _this.color = 'black';
        return _this;
    }

    _createClass(TextExpr, [{
        key: 'drawInternal',
        value: function drawInternal(ctx, pos, boundingSize) {
            var abs_scale = this.absoluteScale;
            ctx.save();
            ctx.font = this.contextFont;
            ctx.scale(abs_scale.x, abs_scale.y);
            ctx.fillStyle = this.color;
            ctx.fillText(this.text, pos.x / abs_scale.x, pos.y / abs_scale.y + 2.2 * this.fontSize * this.anchor.y);
            ctx.restore();
        }
    }, {
        key: 'hits',
        value: function hits(pos, options) {
            return false;
        } // disable mouse events

    }, {
        key: 'value',
        value: function value() {
            return this.text;
        }
    }, {
        key: 'size',
        get: function get() {
            var ctx = this.ctx || GLOBAL_DEFAULT_CTX;
            if (!ctx || !this.text || this.text.length === 0) {
                console.error('Cannot size text: No context.');
                return { w: 4, h: this.fontSize };
            } else if (this.manualWidth) return { w: this.manualWidth, h: DEFAULT_EXPR_HEIGHT };
            ctx.font = this.contextFont;
            var measure = ctx.measureText(this.text);
            return { w: measure.width, h: DEFAULT_EXPR_HEIGHT };
        }
    }, {
        key: 'contextFont',
        get: function get() {
            return this.fontSize + 'px ' + this.font;
        }
    }]);

    return TextExpr;
}(Expression);