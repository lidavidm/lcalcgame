

class TextExpr extends Expression {
    constructor(txt, font='Consolas', fontSize=35) {
        super();
        this.text = txt;
        this.font = font;
        this.fontSize = fontSize; // in pixels
        this.color = 'black';
    }
    get size() {
        var ctx = this.ctx || GLOBAL_DEFAULT_CTX;
        if (!ctx || !this.text || this.text.length === 0) {
            console.error('Cannot size text: No context.');
            return { w:4, h:this.fontSize };
        }
        else if (this.manualWidth)
            return { w:this.manualWidth, h:DEFAULT_EXPR_HEIGHT };
        ctx.font = this.contextFont;
        var measure = ctx.measureText(this.text);
        return { w:measure.width, h:DEFAULT_EXPR_HEIGHT };
    }
    get contextFont() {
        return this.fontSize + 'px ' + this.font;
    }
    drawInternal(ctx, pos, boundingSize) {
        var abs_scale = this.absoluteScale;
        ctx.save();
        ctx.font = this.contextFont;
        ctx.scale(abs_scale.x, abs_scale.y);
        ctx.fillStyle = this.color;
        ctx.fillText(this.text, pos.x / abs_scale.x, pos.y / abs_scale.y + 2.2 * this.fontSize * this.anchor.y);
        ctx.restore();
    }
    hits(pos, options) { return false; } // disable mouse events
    value() { return this.text; }
}
