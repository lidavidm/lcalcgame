




// Wrapper class to make arbitrary nodes into draggable expressions.
class VarExpr extends Expression { }
class GraphicVarExpr extends VarExpr {
    constructor(graphic_node) {
        super([graphic_node]);
        this.color = 'gold';
    }

    get color() { return super.color; }
    set color(clr) {
        this.holes[0].color = clr;
    }
    get delegateToInner() {
        return this.ignoreEvents || (!this.parent) || !(this.parent instanceof Expression);
    }
    get graphicNode() { return this.holes[0]; }
    reduceCompletely() { return this; }
    reduce() { return this; }

    //get size() { return this.holes[0].size; }
    hits(pos, options) {
        if(this.ignoreEvents) return null;
        if(this.holes[0].hits(pos, options)) return this;
        else return null;
    }
    onmouseenter(pos) {
        if (this.delegateToInner) this.holes[0].onmouseenter(pos);
        else super.onmouseenter(pos);
    }
    onmouseleave(pos) {
        if (!this.delegateToInner) super.onmouseleave(pos);
        this.holes[0].onmouseleave(pos);
    }
    drawInternal(ctx, pos, boundingSize) {
        if (!this.delegateToInner) {
            this._color = '#777';
            super.drawInternal(ctx, pos, boundingSize);
        }
    }
    value() { return this.holes[0].value(); }
}
class StarExpr extends GraphicVarExpr {
    constructor(x, y, rad, pts=5) {
        super(new mag.Star(x, y, rad, pts));
    }
    toString() { return 'star'; }
}
class CircleExpr extends GraphicVarExpr {
    constructor(x, y, rad) {
        super(new mag.Circle(x, y, rad));
    }
    toString() { return 'circle'; }
}
class PipeExpr extends GraphicVarExpr {
    constructor(x, y, w, h) {
        super(new mag.Pipe(x, y, w, h-12));
    }
    toString() { return 'pipe'; }
}
class TriangleExpr extends GraphicVarExpr {
    constructor(x, y, w, h) {
        super(new mag.Triangle(x, y, w, h));
    }
    toString() { return 'triangle'; }
}
class RectExpr extends GraphicVarExpr {
    constructor(x, y, w, h) {
        super(new mag.Rect(x, y, w, h));
    }
    toString() { return 'diamond'; }
}
class ImageExpr extends GraphicVarExpr {
    constructor(x, y, w, h, resource_key) {
        super(new mag.ImageRect(x, y, w, h, resource_key));
        this._image = resource_key;
    }
    get image() { return this._image; }
    set image(img) {
        this._image = img;
        this.graphicNode.image = img;
    }
    toString() { return this._image; }
}
class FunnelExpr extends ImageExpr {
    constructor(x, y, w, h) {
        super(x, y, w, h, 'funnel');
        this.graphicNode.anchor = { x:0, y:0.5 };
    }
    update() { }
    get size() {
        return this.graphicNode.size;
    }
    onmouseenter() {
        this.graphicNode.image = 'funnel-selected';
    }
    onmouseleave() {
        this.graphicNode.image = 'funnel';
    }
    drawInternal(ctx, pos, boundingSize) {  }
}
class NullExpr extends ImageExpr {
    constructor(x, y, w, h) {
        super(x, y, w, h, 'null-circle');
    }
    reduce() {
        return null; // hmmmm
    }
    performReduction() {
        Animate.poof(this);
        super.performReduction();
    }
    onmousehover() {
        this.image = 'null-circle-highlight';
    }
    onmouseleave() {
        this.image = 'null-circle';
    }
    onmouseclick() {
        this.performReduction();
    }
    toString() {
        return 'null';
    }
    value() { return null; }
}
class MirrorExpr extends ImageExpr {
    constructor(x, y, w, h) {
        super(x, y, w, h, 'mirror-icon');
        this.lock();
        this.graphicNode.offset = { x:0, y:-10 };
        this.innerExpr = null;
        this._broken = false;
    }
    set exprInMirror(e) {
        this.innerExpr = e;

        if (e) {
            e.scale = { x:1, y:1 };
            e.parent = this.graphicNode;
            e.update();
        }
    }
    set broken(b) {
        this._broken = b;
        if (b) this.graphicNode.image = 'mirror-icon-broken';
        else   this.graphicNode.image = 'mirror-icon';
    }
    get broken() {
        return this._broken;
    }
    get exprInMirror() {
        return this.innerExpr;
    }
    drawInternalAfterChildren(ctx, pos, boundingSize) {
        if (!this.innerExpr) return;

        ctx.save();
        ctx.globalCompositeOperation = "overlay";
        this.innerExpr.parent = this.graphicNode;
        this.innerExpr.pos = { x:this.graphicNode.size.w / 2.0, y:this.graphicNode.size.h / 2.0 };
        this.innerExpr.anchor = { x:0.5, y:0.8 };
        this.innerExpr.draw(ctx);
        ctx.restore();
    }
}

/** Faded variants. */
class FadedVarExpr extends Expression {
    constructor(name) {
        let txt = new TextExpr(name);
        super([txt]);
        txt.color = "OrangeRed";
        this.color = "gold";
        this.primitiveName = name;
    }
    get graphicNode() { return this.holes[0]; }
    reduceCompletely() { return this; }
    reduce() { return this; }
    toString() {
        return this.primitiveName;
    }
    value() { return this.toString(); }
}
class FadedStarExpr extends FadedVarExpr {
    constructor() { super('star'); }
}
class FadedRectExpr extends FadedVarExpr {
    constructor() { super('rect'); }
}
class FadedTriangleExpr extends FadedVarExpr {
    constructor() { super('tri'); }
}
class FadedCircleExpr extends FadedVarExpr {
    constructor() { super('dot'); }
}
