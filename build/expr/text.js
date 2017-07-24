'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TextExpr = function (_ExpressionPlus) {
    _inherits(TextExpr, _ExpressionPlus);

    function TextExpr(txt) {
        var font = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'Consolas, Monaco, monospace';
        var fontSize = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 35;

        _classCallCheck(this, TextExpr);

        var _this = _possibleConstructorReturn(this, (TextExpr.__proto__ || Object.getPrototypeOf(TextExpr)).call(this));

        _this._text = txt;
        _this.font = font;
        _this.fontSize = fontSize; // in pixels
        _this.color = 'black';
        _this.wrap = false; // set to # of characters allowed on each line
        _this.shadow = null;
        _this._sizeCache = null;
        _this._yMultiplier = 2.2;
        _this._xOffset = 0;
        _this._sizeOffset = { w: 0, h: 0 };
        _this._baseline = "alphabetic";
        _this.stroke = null;
        return _this;
    }

    _createClass(TextExpr, [{
        key: 'shouldWrap',
        // for now, only estimates are possible.
        value: function shouldWrap() {
            return this.wrap !== false && Number.isNumber(this.wrap) && this.wrap < this.text.length;
        }
    }, {
        key: 'getNumLines',
        value: function getNumLines() {
            return (this.shouldWrap() ? Math.trunc((this.text.length - 1) / this.wrap) : 0) + 1;
        }
    }, {
        key: 'drawInternal',
        value: function drawInternal(ctx, pos, boundingSize) {
            // If wrap is specified as a number and text size exceeds wrap limit...
            if (this.shouldWrap()) {
                var chars_per_line = this.wrap;
                var total_chars = this.text.length;
                var text = this.text;
                var line_height = this.fontHeight;
                for (var i = 0; i < total_chars; i += chars_per_line) {
                    this.drawText(text.slice(i, i + chars_per_line), ctx, pos, boundingSize);
                    pos.y += line_height;
                }
            } else this.drawText(this.text, ctx, pos, boundingSize);
        }
    }, {
        key: 'drawText',
        value: function drawText(text, ctx, pos, boundingSize) {
            var abs_scale = this.absoluteScale;
            ctx.save();
            ctx.font = this.contextFont;
            ctx.scale(abs_scale.x, abs_scale.y);
            ctx.fillStyle = this.color;
            if (this.shadow) {
                ctx.save();
                ctx.shadowColor = this.shadow.color;
                ctx.shadowBlur = this.shadow.blur;
                ctx.shadowOffsetX = this.shadow.x;
                ctx.shadowOffsetY = this.shadow.y;
                ctx.fillText(text, (pos.x + this._xOffset) / abs_scale.x, pos.y / abs_scale.y + this._yMultiplier * this.fontSize * this.anchor.y);
                ctx.restore();
            }
            ctx.textBaseline = this._baseline;
            var x = (pos.x + this._xOffset) / abs_scale.x;
            var y = pos.y / abs_scale.y + this._yMultiplier * this.fontSize * this.anchor.y;
            if (this.stroke) {
                setStrokeStyle(ctx, this.stroke);
                ctx.strokeText(text, x, y);
            }
            ctx.fillText(text, x, y);
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
        key: 'canReduce',
        value: function canReduce() {
            return true;
        }
    }, {
        key: 'toString',
        value: function toString() {
            return this.text;
        }
    }, {
        key: 'toJavaScript',
        value: function toJavaScript() {
            return this.text;
        }
    }, {
        key: 'text',
        get: function get() {
            return this._text;
        },
        set: function set(txt) {
            this._text = txt;
            this._sizeCache = null; // invalidate size
        }
    }, {
        key: 'fontHeight',
        get: function get() {
            return this.fontSize;
        }
    }, {
        key: 'size',
        get: function get() {
            var ctx = this.ctx || GLOBAL_DEFAULT_CTX;
            if (!ctx) {
                console.error('Cannot size text: No context.');
                return { w: 4 + this._sizeOffset.w, h: this.fontSize + this._sizeOffset.h };
            } else if (!this.text || this.text.length === 0) {
                return { w: 4 + this._sizeOffset.w, h: this.fontSize + this._sizeOffset.h };
            } else if (this.manualWidth) {
                return { w: this.manualWidth, h: DEFAULT_EXPR_HEIGHT };
            } else if (this._sizeCache) {
                // Return a copy because callers may mutate this
                return { w: this._sizeCache.size.w + this._sizeOffset.w, h: this._sizeCache.size.h + this._sizeOffset.h };
            }

            ctx.font = this.contextFont;

            var shouldWrap = this.shouldWrap();
            var txt = shouldWrap ? this.text.slice(0, this.wrap) : this.text;
            var num_lines = this.getNumLines();
            var measure = ctx.measureText(txt);
            this._sizeCache = {
                size: { w: measure.width, h: DEFAULT_EXPR_HEIGHT * num_lines }
            };
            var sz = { w: measure.width + this._sizeOffset.w, h: DEFAULT_EXPR_HEIGHT * num_lines + this._sizeOffset.h };
            return sz;
        }
    }, {
        key: 'contextFont',
        get: function get() {
            return this.fontSize + 'px ' + this.font;
        }
    }]);

    return TextExpr;
}(ExpressionPlus);