'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TypeBox = function (_mag$Rect) {
    _inherits(TypeBox, _mag$Rect);

    function TypeBox(x, y, w, h) {
        _classCallCheck(this, TypeBox);

        var _this = _possibleConstructorReturn(this, (TypeBox.__proto__ || Object.getPrototypeOf(TypeBox)).call(this, x, y, w, h));

        _this.color = 'white'; // should be pure white
        _this.shadowOffset = 0;
        _this.padding = { left: 4, right: 4 };

        // Text
        var txt = new TextExpr('');
        txt.fontSize = 22;
        txt.pos = { x: 0, y: h - txt.size.h / 2 };
        _this.addChild(txt);
        _this.textExpr = txt;

        // Blinking cursor
        var percentH = 0.8;
        var cursor = new BlinkingCursor(_this.padding.left, h * (1 - percentH) / 2.0, 8, h * percentH);
        _this.cursor = cursor;
        _this._origWidth = w;
        return _this;
    }

    _createClass(TypeBox, [{
        key: 'onmouseenter',
        value: function onmouseenter(pos) {
            //this.focus();
            this.stroke = { color: 'blue', lineWidth: 2 };
        }
    }, {
        key: 'onmouseclick',
        value: function onmouseclick(pos) {
            this.focus();
        }
    }, {
        key: 'onmouseleave',
        value: function onmouseleave(pos) {
            //this.blur();
            this.stroke = null;
        }
    }, {
        key: 'isFocused',
        value: function isFocused() {
            return this.hasChild(this.cursor);
        }
    }, {
        key: 'focus',
        value: function focus() {
            if (this.isFocused()) return;
            this.addChild(this.cursor);
            this.cursor.startBlinking();
            this.stroke = { color: 'cyan', lineWidth: 2 };
            this.stage.keyEventDelegate = this;
        }
    }, {
        key: 'blur',
        value: function blur() {
            if (!this.isFocused()) return;
            this.cursor.stopBlinking();
            this.removeChild(this.cursor);
            this.stroke = null;
            if (this.stage.keyEventDelegate == this) this.stage.keyEventDelegate = null;
        }
    }, {
        key: 'updateCursorPosition',
        value: function updateCursorPosition() {
            this.update();
            this.cursor.pos = { x: this.textExpr.size.w, y: this.cursor.pos.y };
            this.size = { w: Math.max(this._origWidth, this.textExpr.size.w + this.cursor.size.w + this.padding.right), h: this.size.h };
            this.cursor.resetBlinking();
        }
    }, {
        key: 'type',
        value: function type(str) {
            this.text += str;
            this.updateCursorPosition();
        }
    }, {
        key: 'backspace',
        value: function backspace() {
            var num = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

            var txt = this.text;
            this.text = txt.substring(0, txt.length - 1);
            this.updateCursorPosition();
        }
    }, {
        key: 'carriageReturn',
        value: function carriageReturn() {
            var _this2 = this;

            // Solidify block (if possible)
            var txt = this.text.trim();
            var expr_desc = null;
            var input_map = {
                '==': '(== _ _)',
                '!=': '(!= _ _)',
                '?:': '(ifelse _b _ _)',
                '(x) => x': '(λx #x)',
                '(x) => x x': '(λx #x #x)',
                '(x) => x x x': '(λx #x #x #x)',
                '(x) =>': '(λx _)',
                'x': '(#_x)',
                'star': 'star',
                'rect': 'rect'
            };

            var block = void 0;
            if (txt in input_map) {
                expr_desc = input_map[txt];
                block = Level.parse(expr_desc)[0];
            } else {
                block = ES6Parser.parse(txt);
                if (!block) return;
            }

            block.lockSubexpressions();
            block.update();
            block.pos = this.absolutePos;
            block.anchor = { x: 0, y: 0 };

            var fx = new ShatterExpressionEffect(block);
            fx.run(this.stage, function () {
                _this2.stage.add(block);
            }, function () {});
        }
    }, {
        key: 'text',
        get: function get() {
            return this.textExpr.text;
        },
        set: function set(txt) {
            this.textExpr.text = txt;
        }
    }]);

    return TypeBox;
}(mag.Rect);

var BlinkingCursor = function (_mag$Rect2) {
    _inherits(BlinkingCursor, _mag$Rect2);

    function BlinkingCursor(x, y, w, h) {
        _classCallCheck(this, BlinkingCursor);

        var _this3 = _possibleConstructorReturn(this, (BlinkingCursor.__proto__ || Object.getPrototypeOf(BlinkingCursor)).call(this, x, y, w, h));

        _this3.color = 'black';
        _this3.opacity = 1;
        _this3.ignoreEvents = true;
        return _this3;
    }

    _createClass(BlinkingCursor, [{
        key: 'startBlinking',
        value: function startBlinking() {
            var _this4 = this;

            var blink = function blink() {
                _this4.blinkTween = Animate.tween(_this4, { opacity: 0 }, 1000, function (e) {
                    return Math.pow(e, 2);
                }).after(function () {
                    _this4.blinkTween = Animate.tween(_this4, { opacity: 1 }, 400, function (e) {
                        return Math.pow(e, 2);
                    }).after(function () {
                        blink();
                    });
                });
            };
            blink();
        }
    }, {
        key: 'resetBlinking',
        value: function resetBlinking() {
            this.stopBlinking();
            this.opacity = 1;
            this.startBlinking();
        }
    }, {
        key: 'stopBlinking',
        value: function stopBlinking() {
            if (this.blinkTween) {
                this.blinkTween.cancelWithoutFiringCallbacks();
                this.blinkTween = null;
                this.opacity = 1;
            }
        }
    }]);

    return BlinkingCursor;
}(mag.Rect);