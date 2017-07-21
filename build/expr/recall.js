'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TypeBox = function (_mag$RoundedRect) {
    _inherits(TypeBox, _mag$RoundedRect);

    function TypeBox(x, y, w, h, onCarriageReturn, onTextChanged) {
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
        var cursor = new BlinkingCursor(_this.padding.left, h * (1 - percentH) / 2.0, 2, h * percentH);
        _this.cursor = cursor;
        _this._origWidth = w;

        // Selection highlight
        var selection = new mag.Rect(0, cursor.pos.y, 2, cursor.size.h);
        selection.color = "Cyan";
        selection.opacity = 0.3;
        selection.ignoreEvents = true;
        selection.shadowOffset = 0;
        _this.selection = selection;

        _this.onCarriageReturn = onCarriageReturn;
        _this.onTextChanged = onTextChanged;
        return _this;
    }

    _createClass(TypeBox, [{
        key: 'isPlaceholder',
        value: function isPlaceholder() {
            return true;
        }

        /* MOUSE EVENTS */

    }, {
        key: 'onmouseenter',
        value: function onmouseenter(pos) {
            //this.focus();
            this.stroke = { color: 'blue', lineWidth: 2 };
            SET_CURSOR_STYLE(CONST.CURSOR.TEXT);
        }
    }, {
        key: 'onmousedown',
        value: function onmousedown(pos) {
            _get(TypeBox.prototype.__proto__ || Object.getPrototypeOf(TypeBox.prototype), 'onmousedown', this).call(this, pos);
            this.clearSelection();
            var pos_idx = this.charIndexForCursorPos(pos);
            this.updateCursorPosition(pos_idx);
            this._prevMousePos = pos;
            this._prevCursorIdx = pos_idx;
        }
    }, {
        key: 'onmousedrag',
        value: function onmousedrag(pos) {
            var pos_idx = this.charIndexForCursorPos(addPos(this._prevMousePos, fromTo(this.absolutePos, pos)));
            this.showSelection({ start: this._prevCursorIdx, end: pos_idx });
            this.updateCursorPosition(pos_idx);
        }
    }, {
        key: 'onmouseclick',
        value: function onmouseclick(pos) {
            this.focus();
            var pos_idx = this.charIndexForCursorPos(pos);
            this.updateCursorPosition(pos_idx);
        }
    }, {
        key: 'onmouseleave',
        value: function onmouseleave(pos) {
            //this.blur();
            this.stroke = null;
            SET_CURSOR_STYLE(CONST.CURSOR.DEFAULT);
        }

        /* VIRTUAL CURSOR */
        // From an absolute position within this box,
        // calculate the index of the character that
        // the cursor should appear to the left of.

    }, {
        key: 'charIndexForCursorPos',
        value: function charIndexForCursorPos(pos) {
            var num_chars = this.textExpr.text.length;
            if (num_chars === 0) return 0;
            var x_pos = fromTo(this.textExpr.absolutePos, pos).x;
            var t_width = this.textExpr.absoluteSize.w;
            var char_w = t_width / num_chars;
            var charIdx = Math.min(num_chars, Math.round(x_pos / char_w));
            return charIdx;
        }
    }, {
        key: 'cursorXPosForCharIdx',
        value: function cursorXPosForCharIdx(charIdx) {
            var num_chars = this.textExpr.text.length;
            charIdx = Math.max(0, Math.min(charIdx, num_chars)); // clip index
            return this.textExpr.text.length > 0 ? this.textExpr.size.w * charIdx / num_chars : this.textExpr.size.w;
        }
    }, {
        key: 'update',
        value: function update() {
            _get(TypeBox.prototype.__proto__ || Object.getPrototypeOf(TypeBox.prototype), 'update', this).call(this);
            this.size = { w: Math.max(this._origWidth, this.textExpr.size.w + this.cursor.size.w + this.padding.right), h: this.size.h };
        }
    }, {
        key: 'updateCursorPosition',
        value: function updateCursorPosition(charIdx) {
            var num_chars = this.textExpr.text.length;
            if (typeof charIdx === 'undefined') charIdx = num_chars;
            charIdx = Math.max(0, Math.min(charIdx, num_chars));
            var x_pos = this.cursorXPosForCharIdx(charIdx);
            if ('charIdx' in this.cursor && this.cursor.charIdx === charIdx) return; // No need to update if there's been no change.
            this.update();
            this.cursor.pos = { x: x_pos, y: this.cursor.pos.y };
            this.size = { w: Math.max(this._origWidth, this.textExpr.size.w + this.cursor.size.w + this.padding.right), h: this.size.h };
            this.cursor.resetBlinking();
            this.cursor.charIdx = charIdx;
        }
    }, {
        key: 'showSelection',


        /* SELECTION HIGHLIGHT */
        value: function showSelection(selrange) {
            if (selrange.start === selrange.end) {
                this.clearSelection();
                return; // no selection to show
            }
            if (selrange.start > selrange.end) {
                // Swap to ensure property start <= end.
                var temp = selrange.start;
                selrange.start = selrange.end;
                selrange.end = temp;
            }
            var selection = this.selection;
            var x1_pos = this.cursorXPosForCharIdx(selrange.start);
            var x2_pos = this.cursorXPosForCharIdx(selrange.end);
            selection.pos = { x: x1_pos, y: selection.pos.y };
            selection.size = { w: x2_pos - x1_pos, h: selection.size.h };
            selection.range = selrange;
            if (!this.hasChild(selection)) this.addChild(selection);
            this.update();
        }
    }, {
        key: 'hasSelection',
        value: function hasSelection() {
            return this.hasChild(this.selection) && this.selection.range;
        }
    }, {
        key: 'deleteSelectedText',
        value: function deleteSelectedText() {
            if (this.hasSelection()) {
                var txt = this.text;
                var selrange = this.selection.range;
                if (selrange.start > 0) {
                    if (selrange.end < txt.length) this.text = txt.substring(0, selrange.start) + txt.substring(selrange.end);else this.text = txt.substring(0, selrange.start);
                    this.updateCursorPosition(selrange.start);
                } else if (selrange.end < txt.length) {
                    this.text = txt.substring(selrange.end);
                    this.updateCursorPosition(0);
                } else {
                    this.text = ''; // entire text was selected, so delete it all.
                    this.updateCursorPosition(0);
                }

                this.clearSelection();
            }
        }
    }, {
        key: 'clearSelection',
        value: function clearSelection() {
            if (this.hasChild(this.selection)) {
                this.removeChild(this.selection);
                this.selection.range = null;
                this.update();
            }
        }

        /* FOCUS AND BLUR */

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
            if (this.stage) this.stage.keyEventDelegate = this;
        }
    }, {
        key: 'blur',
        value: function blur() {
            if (!this.isFocused()) return;
            this.cursor.stopBlinking();
            this.removeChild(this.cursor);
            this.stroke = null;
            if (this.stage && this.stage.keyEventDelegate == this) this.stage.keyEventDelegate = null;
        }
    }, {
        key: 'type',
        value: function type(str) {
            this.deleteSelectedText();
            var txt = this.text;
            var charIdx = this.cursorIndex;
            if (charIdx >= txt.length) // insert at end of text
                this.text += str;else if (charIdx > 0) // insert in between text
                this.text = txt.substring(0, charIdx) + str + txt.substring(charIdx);else // insert at beginning of text
                this.text = str + txt;
            Resource.play('key-press-' + Math.floor(Math.random() * 4 + 1));
            this.updateCursorPosition(charIdx + 1);
            if (this.onTextChanged) this.onTextChanged();
            this.stage.update();
        }
    }, {
        key: 'backspace',
        value: function backspace() {
            var num = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

            if (this.hasSelection()) {
                this.deleteSelectedText();
                if (this.onTextChanged) this.onTextChanged();
                if (this.stage) this.stage.update();
                return;
            }
            var txt = this.text;
            var charIdx = this.cursorIndex;
            if (charIdx >= txt.length) {
                // backspace at end of text
                this.text = txt.substring(0, txt.length - 1);
                charIdx = txt.length - 1;
            } else if (charIdx > 0) {
                // backspace in between text
                this.text = txt.substring(0, charIdx - 1) + txt.substring(charIdx);
                charIdx--;
            }
            this.updateCursorPosition(charIdx);
            if (this.onTextChanged) this.onTextChanged();
            this.stage.update();
        }
    }, {
        key: 'leftArrow',
        value: function leftArrow() {
            this.updateCursorPosition(Math.max(0, this.cursorIndex - 1));
            this.clearSelection();
        }
    }, {
        key: 'rightArrow',
        value: function rightArrow() {
            this.updateCursorPosition(this.cursorIndex + 1);
            this.clearSelection();
        }
    }, {
        key: 'carriageReturn',
        value: function carriageReturn() {
            // Solidify block (if possible)
            if (this.onCarriageReturn) this.onCarriageReturn();
            this.blur();
            if (this.stage) this.stage.update();
        }
    }, {
        key: 'text',
        get: function get() {
            return this.textExpr.text;
        },
        set: function set(txt) {
            this.textExpr.text = txt;
        }
    }, {
        key: 'fontSize',
        get: function get() {
            return this.textExpr.fontSize;
        },
        set: function set(fs) {
            this.textExpr.fontSize = fs;
        }
    }, {
        key: 'cursorIndex',
        get: function get() {
            return 'charIdx' in this.cursor ? this.cursor.charIdx : this.text.length;
        }
    }]);

    return TypeBox;
}(mag.RoundedRect);

// Summon ES6 expressions out of thin air!!


var SummoningTypeBox = function (_TypeBox) {
    _inherits(SummoningTypeBox, _TypeBox);

    function SummoningTypeBox(x, y, w, h) {
        _classCallCheck(this, SummoningTypeBox);

        var onCommit = function onCommit() {
            var _this3 = this;

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

            block.update();
            block.pos = this.absolutePos;
            block.anchor = { x: 0, y: 0 };

            var fx = new ShatterExpressionEffect(block);
            fx.run(this.stage, function () {
                _this3.stage.add(block);
            }, function () {});
        };
        return _possibleConstructorReturn(this, (SummoningTypeBox.__proto__ || Object.getPrototypeOf(SummoningTypeBox)).call(this, x, y, w, h, onCommit));
    }

    return SummoningTypeBox;
}(TypeBox);

var BlinkingCursor = function (_mag$Rect) {
    _inherits(BlinkingCursor, _mag$Rect);

    function BlinkingCursor(x, y, w, h) {
        _classCallCheck(this, BlinkingCursor);

        var _this4 = _possibleConstructorReturn(this, (BlinkingCursor.__proto__ || Object.getPrototypeOf(BlinkingCursor)).call(this, x, y, w, h));

        _this4.color = 'black';
        _this4.opacity = 1;
        _this4.ignoreEvents = true;
        return _this4;
    }

    _createClass(BlinkingCursor, [{
        key: 'startBlinking',
        value: function startBlinking() {
            var _this5 = this;

            var blink = function blink() {
                _this5.blinkTween = Animate.tween(_this5, { opacity: 0 }, 1000, function (e) {
                    return Math.pow(e, 2);
                }).after(function () {
                    _this5.blinkTween = Animate.tween(_this5, { opacity: 1 }, 400, function (e) {
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

/* A text expression that starts as a freeform text box (TypeBox). */


var TypeInTextExpr = function (_TextExpr) {
    _inherits(TypeInTextExpr, _TextExpr);

    _createClass(TypeInTextExpr, [{
        key: 'constructorArgs',
        value: function constructorArgs() {
            return [this.validator, null, 1];
        }
    }, {
        key: 'clone',
        value: function clone() {
            var t = new TypeInTextExpr(this.validator);
            if (this.typeBox) {
                //console.log(t.typeBox);
                t.typeBox.text = this.typeBox.text;
            } else {
                t.text = this.text;
                t.typeBox = null;
            }
            return t;
        }
    }, {
        key: 'toString',
        value: function toString() {
            return this._exprCode ? this._exprCode : '_t';
        }
    }, {
        key: 'toJavaScript',
        value: function toJavaScript() {
            return this.toString();
        }

        // 'validator' is a function taking the text as an argument,
        // and returning true if valid and false if rejected.

    }], [{
        key: 'fromExprCode',


        /* Because there are many possible validators and contexts for typing,
        // and we need to write levels simply using an ES6 parser,
        // here we map predefined codes to special TypeInTextExpr's (+their validators).
        // Codes so far are:
        //      _t_string: Only accepts string values.
        //      _t_nonneg: Only accepts nonnegative integers.
        //      _t_int: Only accepts integers.
        //      _t_equiv: Only accepts comparison operators !=, ==, !==, ===.
        // There's also a special token, the operator >>>, which
        // means _t_equiv.
        */
        value: function fromExprCode(code, afterCommit) {
            code = code.replace('_t_', ''); // remove prepend
            var validators = {
                'string': function string(txt) {
                    return __PARSER.parse(txt) instanceof StringValueExpr;
                },
                'nonneg': function nonneg(txt) {
                    var i = Number.parseInt(txt, 10);
                    return !Number.isNaN(i) && i >= 0;
                },
                'int': function int(txt) {
                    return !Number.isNaN(Number.parseInt(txt, 10));
                },
                'equiv': function equiv(txt) {
                    return ['==', '!=', '===', '!==', 'or', 'and', 'or not', 'and not'].indexOf(txt) > -1;
                },
                'single': function single(txt) {
                    txt = txt.replace('return', '__return =');
                    var res = __PARSER.parse(txt);
                    console.log(txt, res);
                    return res && !(res instanceof Sequence);
                },
                'variable': function variable(txt) {
                    var result = __PARSER.parse(txt);
                    return result instanceof VarExpr || result instanceof VtableVarExpr;
                },
                'varname': function varname(txt) {
                    if (/^[a-z_]\w*$/g.test(txt)) {
                        // If it's a valid variable / function name...
                        // * Note that this doesn't actually check whether function with name 'txt' is defined.
                        // * If the player clicks on said undefined call, it should block them with a question mark effect.
                        return true;
                    } else {
                        return false;
                    }
                },
                'params': function params(txt) {
                    var dummy_call = 'foo' + txt;
                    if (__PARSER.parse(dummy_call)) {
                        // If it's a valid parameter list including parentheses, e.g. (0, 1, a, "georgia")
                        // * Similar to 'varname' above, doesn't type-check function to make sure call is valid.
                        // * This just verifies that the syntax is correct.
                        return true;
                    } else {
                        return false;
                    }
                }
            };
            if (code in validators) {
                var t = new TypeInTextExpr(validators[code], afterCommit);
                t._exprCode = '_t_' + code;
                return t;
            } else {
                console.error('@ TypeInTextExpr.fromExprCode: Code ' + code + ' doesn\'t match any known validator.');
                return null;
            }
        }
    }]);

    function TypeInTextExpr(validator, afterCommit) {
        var charLimit = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;

        _classCallCheck(this, TypeInTextExpr);

        var _this6 = _possibleConstructorReturn(this, (TypeInTextExpr.__proto__ || Object.getPrototypeOf(TypeInTextExpr)).call(this, " "));

        _this6.validator = validator;

        if (!afterCommit) {
            afterCommit = function afterCommit(txt) {
                txt = txt.replace('return', '__return =');
                var expr = __PARSER.parse(txt);
                if (!expr) return;
                var parent = _this6.parent || _this6.stage;
                parent.swap(_this6, expr);
                expr.lockSubexpressions(function (e) {
                    return !(e instanceof LambdaHoleExpr);
                });
                if (!(parent instanceof mag.Stage)) expr.lock();
                expr.update();
            };
        }

        var _thisTextExpr = _this6;
        var onCommit = function onCommit() {
            var txt = this.text.trim(); // this.text is the TypeBox's text string, *not* the TextExpr's!
            if (validator(txt)) {
                _thisTextExpr.commit(txt);
                Resource.play('carriage-return');
                if (afterCommit) afterCommit(txt);
            } else {
                Animate.blink(this, 1000, [1, 0, 0], 2); // blink red
            }
        };
        var onTextChanged = function onTextChanged() {
            if (validator(this.text.trim()) === true) {
                //this.color = 'green';
                this.stroke = { color: '#0f0', lineWidth: 4 };
            } else this.stroke = null;
        };

        var box = new TypeBox(0, 0, 52, _this6.size.h, onCommit, onTextChanged);
        box.fontSize = _this6.fontSize;
        _this6.addChild(box);
        _this6.ignoreEvents = false;
        _this6.typeBox = box;
        return _this6;
    }

    _createClass(TypeInTextExpr, [{
        key: 'parsedValue',
        value: function parsedValue() {
            if (this.typeBox) {
                var txt = this.typeBox.text.trim();
                if (this.validator(txt)) {
                    var result = __PARSER.parse(txt);
                    if (result) return result;
                }
            }
            return null;
        }
    }, {
        key: 'reduce',
        value: function reduce() {
            var value = this.parsedValue();
            if (value) {
                this.typeBox.carriageReturn();
                return value;
            }
            return this;
        }
    }, {
        key: 'performReduction',
        value: function performReduction() {
            var value = this.parsedValue();
            if (value) return Promise.resolve(value);
            return Promise.reject();
        }
    }, {
        key: 'commit',
        value: function commit(renderedText) {
            this.text = renderedText; // this is the underlying text in the TextExpr
            this.removeChild(this.typeBox);
            this.typeBox = null;
            this.update();
            ShapeExpandEffect.run(this, 200, function (e) {
                return Math.pow(e, 1);
            });
            ShapeExpandEffect.run(this, 350, function (e) {
                return Math.pow(e, 0.9);
            });
            ShapeExpandEffect.run(this, 500, function (e) {
                return Math.pow(e, 0.8);
            });
        }
    }, {
        key: 'isCommitted',
        value: function isCommitted() {
            return this.typeBox === null;
        }
    }, {
        key: 'hits',
        value: function hits(pos, options) {
            return this.hitsChild(pos, options);
        }
    }, {
        key: 'focus',
        value: function focus() {
            this.typeBox.focus();this.typeBox.onmouseleave();
        }
    }, {
        key: 'blur',
        value: function blur() {
            this.typeBox.blur();
        }
    }, {
        key: 'isValue',
        value: function isValue() {
            return false;
        }
    }, {
        key: 'isPlaceholder',
        value: function isPlaceholder() {
            return !this.isCommitted();
        }
    }, {
        key: 'animatePlaceholderStatus',
        value: function animatePlaceholderStatus() {
            if (this.typeBox) Animate.blink(this.typeBox, 1000, [1, 0, 0], 2);
        }
    }, {
        key: 'canReduce',
        value: function canReduce() {
            if (this.typeBox) {
                var txt = this.typeBox.text.trim();
                var valid = this.validator(txt);
                if (valid) {
                    this.reduce();
                    return true;
                }
                return false;
            } else return true;
        }
    }, {
        key: 'isComplete',
        value: function isComplete() {
            if (this.typeBox) {
                var txt = this.typeBox.text.trim();
                return this.validator(txt);
            } else {
                return true;
            }
        }
    }, {
        key: 'value',
        value: function value() {
            return undefined;
        }
    }, {
        key: 'size',
        get: function get() {
            if (this.typeBox) {
                return this.typeBox.size;
            } else {
                return _get(TypeInTextExpr.prototype.__proto__ || Object.getPrototypeOf(TypeInTextExpr.prototype), 'size', this);
            }
        }
    }]);

    return TypeInTextExpr;
}(TextExpr);