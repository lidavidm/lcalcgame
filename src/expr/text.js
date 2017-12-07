class TextExpr extends ExpressionPlus {
    constructor(txt, font='Consolas, Monaco, monospace', fontSize=35) {
        super();
        this._text = txt;
        this.font = font;
        this.fontSize = fontSize; // in pixels
        this.color = 'black';
        this.wrap = false; // set to # of characters allowed on each line
        this.shadow = null;
        this._sizeCache = null;
        this._yMultiplier = 2.2;
        this._xOffset = 0;
        this._sizeOffset = { w:0, h:0 };
        this._baseline = "alphabetic";
        this.stroke = null;
    }

    kind() {
        return "display";
    }

    get text() {
        return this._text;
    }
    set text(txt) {
        this._text = txt;
        this._sizeCache = null; // invalidate size
    }
    get fontHeight() {
        return this.fontSize; // for now, only estimates are possible.
    }
    shouldWrap() {
        return this.wrap !== false && Number.isNumber(this.wrap) && this.wrap < this.text.length;
    }
    getNumLines() {
        return (this.shouldWrap() ? Math.trunc((this.text.length-1) / this.wrap) : 0) + 1;
    }
    getAbsoluteBoundsForSubstring(str) {
        const i = this._text.indexOf(str);
        if (i > -1) {
            const sz = this.absoluteSize;
            const pos = this.absolutePos;
            const char_w = sz.w / this._text.length;
            return { pos:addPos(pos, {x:char_w*i, y:0}), size:{w:char_w*str.length, h:sz.h} };
        } else {
            console.warn(`Substring '${str}' is not in TextExpr with text '${this._text}'`);
            return { pos: this.absolutePos, size:{w:0, h:0} };
        }
    }
    get size() {
        var ctx = this.ctx || GLOBAL_DEFAULT_CTX;
        if (!ctx) {
            console.error('Cannot size text: No context.');
            return { w:4+this._sizeOffset.w, h:this.fontSize+this._sizeOffset.h };
        }
        else if (!this.text || this.text.length === 0) {
            return { w:4+this._sizeOffset.w, h:this.fontSize+this._sizeOffset.h };
        }
        else if (this.manualWidth) {
            return { w:this.manualWidth, h:DEFAULT_EXPR_HEIGHT };
        }
        else if (this._sizeCache) {
            // Return a copy because callers may mutate this
            return { w: this._sizeCache.size.w+this._sizeOffset.w, h: this._sizeCache.size.h+this._sizeOffset.h };
        }

        ctx.font = this.contextFont;

        const shouldWrap = this.shouldWrap();
        const txt = shouldWrap ? this.text.slice(0, this.wrap) : this.text;
        const num_lines = this.getNumLines();
        let measure = ctx.measureText(txt);
        this._sizeCache = {
            size: { w: measure.width, h:DEFAULT_EXPR_HEIGHT * num_lines },
        };
        let sz = { w:measure.width+this._sizeOffset.w, h:DEFAULT_EXPR_HEIGHT * num_lines + this._sizeOffset.h };
        return sz;
    }
    get contextFont() {
        return this.fontSize + 'px ' + this.font;
    }
    drawInternal(ctx, pos, boundingSize) {
        // If wrap is specified as a number and text size exceeds wrap limit...
        if (this.shouldWrap()) {
            const chars_per_line = this.wrap;
            const total_chars = this.text.length;
            const text = this.text;
            const line_height = this.fontHeight;
            for (var i = 0; i < total_chars; i += chars_per_line) {
                this.drawText(text.slice(i, i+chars_per_line), ctx, pos, boundingSize);
                pos.y += line_height;
            }
        }
        else this.drawText(this.text, ctx, pos, boundingSize);
    }
    drawText(text, ctx, pos, boundingSize) {
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
        let x = (pos.x + this._xOffset) / abs_scale.x
        let y = pos.y / abs_scale.y + this._yMultiplier * this.fontSize * this.anchor.y;
        if (this.stroke) {
            setStrokeStyle(ctx, this.stroke);
            ctx.strokeText(text, x, y);
        }
        ctx.fillText(text, x, y);
        ctx.restore();
    }
    hits(pos, options) { return false; } // disable mouse events
    value() { return this.text; }
    canReduce() { return true; }
    toString() { return this.text; }
    toJavaScript() { return this.text; }
}
