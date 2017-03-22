class TypeBox extends mag.Rect {
    constructor(x, y, w, h) {
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
        let cursor = new BlinkingCursor(this.padding.left, h*(1 - percentH)/2.0, 8, h * percentH);
        this.cursor = cursor;
        this._origWidth = w;
    }
    get text() {
        return this.textExpr.text;
    }
    set text(txt) {
        this.textExpr.text = txt;
    }

    onmouseenter(pos) {
        //this.focus();
        this.stroke = { color:'blue', lineWidth:2 };
    }
    onmouseclick(pos) {
        this.focus();
    }
    onmouseleave(pos) {
        //this.blur();
        this.stroke = null;
    }
    isFocused() {
        return this.hasChild(this.cursor);
    }
    focus() {
        if (this.isFocused()) return;
        this.addChild(this.cursor);
        this.cursor.startBlinking();
        this.stroke = { color:'cyan', lineWidth:2 };
        this.stage.keyEventDelegate = this;
    }
    blur() {
        if (!this.isFocused()) return;
        this.cursor.stopBlinking();
        this.removeChild(this.cursor);
        this.stroke = null;
        if (this.stage.keyEventDelegate == this)
            this.stage.keyEventDelegate = null;
    }
    updateCursorPosition() {
        this.update();
        this.cursor.pos = { x:this.textExpr.size.w, y:this.cursor.pos.y };
        this.size = { w:Math.max(this._origWidth, this.textExpr.size.w + this.cursor.size.w + this.padding.right), h:this.size.h };
        this.cursor.resetBlinking();
    }

    type(str) {
        this.text += str;
        this.updateCursorPosition();
    }
    backspace(num=1) {
        let txt = this.text;
        this.text = txt.substring(0, txt.length-1);
        this.updateCursorPosition();
    }
    carriageReturn() { // Solidify block (if possible)
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
