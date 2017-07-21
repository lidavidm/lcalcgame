class TypeBox extends mag.RoundedRect {
    constructor(x, y, w, h, onCarriageReturn, onTextChanged) {
        super(x, y, w, h);
        this.color = 'white'; // should be pure white
        this.shadowOffset = 0;
        this.padding = { left:4, right:4 };

        // Text
        let txt = new TextExpr('');
        txt.fontSize = 22;
        txt.pos = { x:0, y:h - txt.size.h/2 };
        this.addChild(txt);
        this.textExpr = txt;

        // Blinking cursor
        let percentH = 0.8;
        let cursor = new BlinkingCursor(this.padding.left, h*(1 - percentH)/2.0, 2, h * percentH);
        this.cursor = cursor;
        this._origWidth = w;

        // Selection highlight
        let selection = new mag.Rect(0, cursor.pos.y, 2, cursor.size.h );
        selection.color = "Cyan";
        selection.opacity = 0.3;
        selection.ignoreEvents = true;
        selection.shadowOffset = 0;
        this.selection = selection;

        this.onCarriageReturn = onCarriageReturn;
        this.onTextChanged = onTextChanged;
    }
    get text() {
        return this.textExpr.text;
    }
    set text(txt) {
        this.textExpr.text = txt;
    }
    get fontSize() {
        return this.textExpr.fontSize;
    }
    set fontSize(fs) {
        this.textExpr.fontSize = fs;
    }

    isPlaceholder() {
        return true;
    }

    /* MOUSE EVENTS */
    onmouseenter(pos) {
        //this.focus();
        this.stroke = { color:'blue', lineWidth:2 };
        SET_CURSOR_STYLE(CONST.CURSOR.TEXT);
    }
    onmousedown(pos) {
        super.onmousedown(pos);
        this.clearSelection();
        const pos_idx = this.charIndexForCursorPos(pos);
        this.updateCursorPosition(pos_idx);
        this._prevMousePos = pos;
        this._prevCursorIdx = pos_idx;
    }
    onmousedrag(pos) {
        const pos_idx = this.charIndexForCursorPos(addPos(this._prevMousePos, fromTo(this.absolutePos, pos)));
        this.showSelection({ start:this._prevCursorIdx, end:pos_idx });
        this.updateCursorPosition(pos_idx);
    }
    onmouseclick(pos) {
        this.focus();
        const pos_idx = this.charIndexForCursorPos(pos);
        this.updateCursorPosition(pos_idx);
    }
    onmouseleave(pos) {
        //this.blur();
        this.stroke = null;
        SET_CURSOR_STYLE(CONST.CURSOR.DEFAULT);
    }

    /* VIRTUAL CURSOR */
    // From an absolute position within this box,
    // calculate the index of the character that
    // the cursor should appear to the left of.
    charIndexForCursorPos(pos) {
        const num_chars = this.textExpr.text.length;
        if (num_chars === 0) return 0;
        const x_pos = fromTo(this.textExpr.absolutePos, pos).x;
        const t_width = this.textExpr.absoluteSize.w;
        const char_w = t_width / num_chars;
        const charIdx = Math.min(num_chars, Math.round(x_pos / char_w));
        return charIdx;
    }
    cursorXPosForCharIdx(charIdx) {
        const num_chars = this.textExpr.text.length;
        charIdx = Math.max(0, Math.min(charIdx, num_chars)); // clip index
        return this.textExpr.text.length > 0 ? (this.textExpr.size.w * charIdx / num_chars) : this.textExpr.size.w;
    }
    update() {
        super.update();
        this.size = { w:Math.max(this._origWidth, this.textExpr.size.w + this.cursor.size.w + this.padding.right), h:this.size.h };
    }
    updateCursorPosition(charIdx) {
        const num_chars = this.textExpr.text.length;
        if (typeof charIdx === 'undefined') charIdx = num_chars;
        charIdx = Math.max(0, Math.min(charIdx, num_chars));
        const x_pos = this.cursorXPosForCharIdx(charIdx);
        if ('charIdx' in this.cursor && this.cursor.charIdx === charIdx) return; // No need to update if there's been no change.
        this.update();
        this.cursor.pos = { x:x_pos, y:this.cursor.pos.y };
        this.size = { w:Math.max(this._origWidth, this.textExpr.size.w + this.cursor.size.w + this.padding.right), h:this.size.h };
        this.cursor.resetBlinking();
        this.cursor.charIdx = charIdx;
    }
    get cursorIndex() {
        return 'charIdx' in this.cursor ? this.cursor.charIdx : this.text.length;
    }

    /* SELECTION HIGHLIGHT */
    showSelection(selrange) {
        if (selrange.start === selrange.end) {
            this.clearSelection();
            return; // no selection to show
        }
        if (selrange.start > selrange.end) { // Swap to ensure property start <= end.
            const temp = selrange.start;
            selrange.start = selrange.end;
            selrange.end = temp;
        }
        let selection = this.selection;
        const x1_pos = this.cursorXPosForCharIdx(selrange.start);
        const x2_pos = this.cursorXPosForCharIdx(selrange.end);
        selection.pos = { x:x1_pos, y:selection.pos.y };
        selection.size = { w:x2_pos - x1_pos, h:selection.size.h };
        selection.range = selrange;
        if (!this.hasChild(selection))
            this.addChild(selection);
        this.update();
    }
    hasSelection() {
        return this.hasChild(this.selection) && this.selection.range;
    }
    deleteSelectedText() {
        if (this.hasSelection()) {
            const txt = this.text;
            const selrange = this.selection.range;
            if (selrange.start > 0) {
                if (selrange.end < txt.length)
                    this.text = txt.substring(0, selrange.start) + txt.substring(selrange.end);
                else
                    this.text = txt.substring(0, selrange.start)
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
    clearSelection() {
        if (this.hasChild(this.selection)) {
            this.removeChild(this.selection);
            this.selection.range = null;
            this.update();
        }
    }

    /* FOCUS AND BLUR */
    isFocused() {
        return this.hasChild(this.cursor);
    }
    focus() {
        if (this.isFocused()) return;
        this.addChild(this.cursor);
        this.cursor.startBlinking();
        this.stroke = { color:'cyan', lineWidth:2 };
        if (this.stage) this.stage.keyEventDelegate = this;
    }
    blur() {
        if (!this.isFocused()) return;
        this.cursor.stopBlinking();
        this.removeChild(this.cursor);
        this.stroke = null;
        if (this.stage && this.stage.keyEventDelegate == this)
            this.stage.keyEventDelegate = null;
    }

    type(str) {
        this.deleteSelectedText();
        const txt = this.text;
        const charIdx = this.cursorIndex;
        if (charIdx >= txt.length) // insert at end of text
            this.text += str;
        else if (charIdx > 0) // insert in between text
            this.text = txt.substring(0, charIdx) + str + txt.substring(charIdx);
        else // insert at beginning of text
            this.text = str + txt;
        Resource.play('key-press-' + Math.floor(Math.random() * 4 + 1))
        this.updateCursorPosition(charIdx+1);
        if (this.onTextChanged) this.onTextChanged();
        this.stage.update();
    }
    backspace(num=1) {
        if (this.hasSelection()) {
            this.deleteSelectedText();
            if (this.onTextChanged) this.onTextChanged();
            if (this.stage) this.stage.update();
            return;
        }
        const txt = this.text;
        let charIdx = this.cursorIndex;
        if (charIdx >= txt.length) { // backspace at end of text
            this.text = txt.substring(0, txt.length-1);
            charIdx = txt.length-1;
        } else if (charIdx > 0) { // backspace in between text
            this.text = txt.substring(0, charIdx-1) + txt.substring(charIdx);
            charIdx--;
        }
        this.updateCursorPosition(charIdx);
        if (this.onTextChanged) this.onTextChanged();
        this.stage.update();
    }
    leftArrow() {
        this.updateCursorPosition(Math.max(0, this.cursorIndex-1));
        this.clearSelection();
    }
    rightArrow() {
        this.updateCursorPosition(this.cursorIndex+1);
        this.clearSelection();
    }
    carriageReturn() { // Solidify block (if possible)
        if (this.onCarriageReturn)
            this.onCarriageReturn();
        this.blur();
        if (this.stage) this.stage.update();
    }
}

// Summon ES6 expressions out of thin air!!
class SummoningTypeBox extends TypeBox {
    constructor(x, y, w, h) {
        let onCommit = function() {
            let txt = this.text.trim();
            let expr_desc = null;
            let input_map = {
                '==':'(== _ _)',
                '!=':'(!= _ _)',
                '?:':'(ifelse _b _ _)',
                '(x) => x':'(λx #x)',
                '(x) => x x':'(λx #x #x)',
                '(x) => x x x':'(λx #x #x #x)',
                '(x) =>':'(λx _)',
                'x':'(#_x)',
                'star':'star',
                'rect':'rect'
            };

            let block;
            if (txt in input_map) {
                expr_desc = input_map[txt];
                block = Level.parse(expr_desc)[0];
            } else {
                block = ES6Parser.parse(txt);
                if (!block) return;
            }

            block.update();
            block.pos = this.absolutePos;
            block.anchor = { x:0, y:0 };

            let fx = new ShatterExpressionEffect(block);
            fx.run(this.stage, () => {
                this.stage.add(block);
            }, () => {});

        };
        super(x, y, w, h, onCommit);
    }
}

class BlinkingCursor extends mag.Rect {
    constructor(x, y, w, h) {
        super(x, y, w, h);
        this.color = 'black';
        this.opacity = 1;
        this.ignoreEvents = true;
    }
    startBlinking() {
        let blink = () => {
            this.blinkTween = Animate.tween(this, { opacity:0 }, 1000, (e) => Math.pow(e, 2)).after(() => {
                this.blinkTween = Animate.tween(this, { opacity:1 }, 400, (e) => Math.pow(e, 2)).after(() => {
                    blink();
                });
            });
        };
        blink();
    }
    resetBlinking() {
        this.stopBlinking();
        this.opacity = 1;
        this.startBlinking();
    }
    stopBlinking() {
        if (this.blinkTween) {
            this.blinkTween.cancelWithoutFiringCallbacks();
            this.blinkTween = null;
            this.opacity = 1;
        }
    }
}

/* A text expression that starts as a freeform text box (TypeBox). */
class TypeInTextExpr extends TextExpr {

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
    static fromExprCode(code, afterCommit) {
        code = code.replace('_t_', ''); // remove prepend
        let validators = {
            'string':(txt) => (__PARSER.parse(txt) instanceof StringValueExpr),
            'nonneg':(txt) => {
                let i = Number.parseInt(txt, 10);
                return (!Number.isNaN(i) && i >= 0);
            },
            'int':(txt) => (!Number.isNaN(Number.parseInt(txt, 10))),
            'equiv':(txt) => (['==','!=','===','!==', 'or', 'and', 'or not', 'and not'].indexOf(txt) > -1),
            'single':(txt) => {
                txt = txt.replace('return', '__return =');
                let res = __PARSER.parse(txt);
                console.log(txt, res);
                return res && !(res instanceof Sequence);
            },
            'variable': (txt) => {
                let result = __PARSER.parse(txt);
                return (result instanceof VarExpr) || (result instanceof VtableVarExpr);
            },
            'varname': (txt) => {
                if (/^[a-z_]\w*$/g.test(txt)) { // If it's a valid variable / function name...
                    // * Note that this doesn't actually check whether function with name 'txt' is defined.
                    // * If the player clicks on said undefined call, it should block them with a question mark effect.
                    return true;
                } else {
                    return false;
                }
            },
            'params': (txt) => {
                let dummy_call = `foo${txt}`;
                if (__PARSER.parse(dummy_call)) { // If it's a valid parameter list including parentheses, e.g. (0, 1, a, "georgia")
                    // * Similar to 'varname' above, doesn't type-check function to make sure call is valid.
                    // * This just verifies that the syntax is correct.
                    return true;
                } else {
                    return false;
                }
            },
        };
        if (code in validators) {
            let t = new TypeInTextExpr(validators[code], afterCommit);
            t._exprCode = '_t_' + code;
            return t;
        } else {
            console.error('@ TypeInTextExpr.fromExprCode: Code ' + code + ' doesn\'t match any known validator.');
            return null;
        }
    }

    constructorArgs() {
        return [ this.validator, null, 1 ];
    }
    clone() {
        let t = new TypeInTextExpr(this.validator);
        if (this.typeBox) {
            //console.log(t.typeBox);
            t.typeBox.text = this.typeBox.text;
        } else {
            t.text = this.text;
            t.typeBox = null;
        }
        return t;
    }
    toString() {
        return this._exprCode ? this._exprCode : '_t';
    }
    toJavaScript() {
        return this.toString();
    }

    // 'validator' is a function taking the text as an argument,
    // and returning true if valid and false if rejected.
    constructor(validator, afterCommit, charLimit=1) {
        super(" ");

        this.validator = validator;

        if (!afterCommit) {
            afterCommit = (txt) => {
                txt = txt.replace('return', '__return =');
                let expr = __PARSER.parse(txt);
                if (!expr) return;
                let parent = (this.parent || this.stage);
                parent.swap(this, expr);
                expr.lockSubexpressions((e) => (!(e instanceof LambdaHoleExpr)));
                if (!(parent instanceof mag.Stage))
                    expr.lock();
                expr.update();
            };
        }

        let _thisTextExpr = this;
        let onCommit = function() {
            let txt = this.text.trim(); // this.text is the TypeBox's text string, *not* the TextExpr's!
            if (validator(txt)) {
                _thisTextExpr.commit(txt);
                Resource.play('carriage-return');
                if (afterCommit) afterCommit(txt);
            } else {
                Animate.blink(this, 1000, [1, 0, 0], 2); // blink red
            }
        };
        let onTextChanged = function() {
            if (validator(this.text.trim()) === true) {
                //this.color = 'green';
                this.stroke = { color:'#0f0', lineWidth:4 };
            } else
                this.stroke = null;
        };

        let box = new TypeBox(0, 0, 52, this.size.h, onCommit, onTextChanged);
        box.fontSize = this.fontSize;
        this.addChild(box);
        this.ignoreEvents = false;
        this.typeBox = box;
    }
    get size() {
        if (this.typeBox) {
            return this.typeBox.size;
        } else {
            return super.size;
        }
    }

    parsedValue() {
        if (this.typeBox) {
            let txt = this.typeBox.text.trim();
            if (this.validator(txt)) {
                let result = __PARSER.parse(txt);
                if (result) return result;
            }
        }
        return null;
    }

    reduce() {
        let value = this.parsedValue();
        if (value) {
            this.typeBox.carriageReturn();
            return value;
        }
        return this;
    }

    performReduction() {
        let value = this.parsedValue();
        if (value) return Promise.resolve(value);
        return Promise.reject();
    }

    commit(renderedText) {
        this.text = renderedText; // this is the underlying text in the TextExpr
        this.removeChild(this.typeBox);
        this.typeBox = null;
        this.update();
        ShapeExpandEffect.run(this, 200, (e) => Math.pow(e, 1));
        ShapeExpandEffect.run(this, 350, (e) => Math.pow(e, 0.9));
        ShapeExpandEffect.run(this, 500, (e) => Math.pow(e, 0.8));
    }
    isCommitted() { return this.typeBox === null; }
    hits(pos, options) {
        return this.hitsChild(pos, options);
    }
    focus() { this.typeBox.focus(); this.typeBox.onmouseleave(); }
    blur() { this.typeBox.blur(); }
    isValue() { return false; }
    isPlaceholder() {
        return !this.isCommitted();
    }
    animatePlaceholderStatus() {
        if (this.typeBox)
            Animate.blink(this.typeBox, 1000, [1,0,0], 2);
    }
    canReduce() {
        if (this.typeBox) {
            let txt = this.typeBox.text.trim();
            let valid = this.validator(txt);
            if (valid) {
                this.reduce();
                return true;
            }
            return false;
        }
        else return true;
    }
    isComplete() {
        if (this.typeBox) {
            let txt = this.typeBox.text.trim();
            return this.validator(txt);
        }
        else {
            return true;
        }
    }
    value() { return undefined; }
}
