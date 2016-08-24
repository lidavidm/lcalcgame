class FadedLambdaHoleExpr extends LambdaHoleExpr {
    get openImage() { return this.name === 'x' ? 'lambda-hole-x' : 'lambda-hole-y'; }
    get closedImage() { return this.name === 'x' ? 'lambda-hole-x-closed' : 'lambda-hole-y-closed'; }
}
class FadedPythonLambdaHoleExpr extends LambdaHoleExpr {
    get openImage() { return this.name === 'x' ? 'lambda-hole-x-python' : 'lambda-hole-y'; }
    get closedImage() { return this.name === 'x' ? 'lambda-hole-x-closed-python' : 'lambda-hole-y-closed'; }
    get size() {
        let sz = super.size;
        sz.w = 120;
        return sz;
    }
}

class FadedLambdaVarExpr extends LambdaVarExpr {
    constructor(varname) {
        super(varname);
        this.graphicNode.size = this.name === 'x' ? { w:24, h:24 } : { w:24, h:30 };
        this.graphicNode.offset = this.name === 'x' ? { x:0, y:0 } : { x:0, y:2 };
        this.handleOffset = 2;
    }
    get openImage() { 'lambda-pipe-x-open'; }
    get closedImage() { return this.name === 'x' ? 'lambda-pipe-x' : 'lambda-pipe-y'; }
    get openingAnimation() {
        var anim = new Animation();
        anim.addFrame('lambda-pipe-x-opening0', 50);
        anim.addFrame('lambda-pipe-x-opening1', 50);
        anim.addFrame(this.openImage,           50);
        return anim;
    }
    get closingAnimation() {
        var anim = new Animation();
        anim.addFrame('lambda-pipe-x-opening1', 50);
        anim.addFrame('lambda-pipe-x-opening0', 50);
        anim.addFrame(this.closedImage,         50);
        return anim;
    }

    open(preview_expr=null) {
        if (this.stateGraph.currentState !== 'open') {
            this.stateGraph.enter('opening');

            if(preview_expr) {
                let scale = this.graphicNode.size.w / preview_expr.size.w * 2.0;
                preview_expr.pos = { x:this.graphicNode.size.w / 2.0, y:0 };
                preview_expr.scale = { x:scale, y:scale };
                preview_expr.anchor = { x:0.5, y:0.3 };
                preview_expr.stroke = null;
                this.graphicNode.addChild(preview_expr);
                this.stage.draw();
            }
        }
    }
}

class FadedSimpleMapFunc extends SimpleMapFunc {
    constructor(oneParamFunc, bag) {
        super(oneParamFunc, bag);

        let txt_color = 'black';
        let txt = new TextExpr('map(');
        txt.color = txt_color;
        let comma = new TextExpr(',');
        comma.color = txt_color;
        let txt2 = new TextExpr(')');
        txt2.color = txt_color;

        this.holes = [];
        this.addArg(txt);
        this.addArg(oneParamFunc);
        this.addArg(comma);
        this.addArg(bag);
        this.addArg(txt2);
        this.arrowPaths = [];
        //this.heightScalar = 1.0;
        //this.exprOffsetY = 0;
        //this.animatedReduction = false;
        this.update();

        this.color = "YellowGreen";
    }
    get returnBag() { return null; }
    get func() {
        return this.holes[1];
    }
    get bag() {
        return this.holes[3];
    }
    set bag(bg) {
        this.holes[3] = bg;
    }
}

// Full-faded map function.
class FadedMapFunc extends FadedSimpleMapFunc {
    constructor(oneParamFunc, bag) {
        super(oneParamFunc, bag);

        // Remove animations + arrow
        this.heightScalar = 1.0;
        this.exprOffsetY = 0;
        this.animatedReduction = false;
    }
    updateArrowPaths() { } // remove arrow
}

// Fully-concrete map function.
class FunnelMapFunc extends MapFunc {
    constructor(oneParamFunc, bag) {
        super(oneParamFunc, bag);
        this.children = [];
        this.holes = [];
        //this.animatedReduction = false;

        // Expression it fits over.
        oneParamFunc.unlock();
        this.addArg(oneParamFunc);

        // Funnel graphic.
        var funnel = new FunnelExpr(0, 0, 198/2, 281/2);
        this.funnel = funnel;
        this.addArg(funnel);

        // Bag.
        bag.unlock();
        this.addArg(bag);
    }
    update() {
        if (this.func && this.funnel) {
            this.func.pos = { x:this.funnel.size.w * 38 / 200, y:this.funnel.size.h / 2.0 - this.func.size.h / 1.3 };
            this.func.update();
            if (this.func.holes.length > 0)
                this.func.holes[0].open();
            else {
                if (!this.funcDraw) this.funcDraw = this.func.draw;
                this.func.draw = () => {};
            }
        }
        if (this.bag && this.funnel) {
            if (this.bag instanceof MissingExpression) this.bag.shadowOffset = -4;
            this.bag.pos = { x:this.funnel.size.w / 2.0 + 3, y:-this.funnel.size.h * (280/2 - 50) / 280};
            this.bag.anchor = { x:0.5, y:0.5 };
            this.bag.update();
        }
        this.children = [];
        this.holes.forEach((h) => {
            this.addChild(h);
        });
    }
    onmouseenter(pos) {
        this.funnel.onmouseenter(pos);
        this.func.onmouseenter(pos);
    }
    onmouseleave(pos) {
        this.funnel.onmouseleave(pos);
        this.func.onmouseleave(pos);
    }
    updateArrowPaths() { }
    drawInternal(pos, boundingSize) { }
    hits(pos, options) {
        var b = this.bag.hits(pos, options);
        if (b) return b;
        var e = this.func.hits(pos, options);
        if (e) return (e != this.func && e != this.func.holes[0]) ? e : this;
        var h = this.funnel.hits(pos, options);
        if (h) return this;
        else   return null;
    }
    get returnBag() { return null; }
    get func() {
        return this.holes[0];
    }
    set func(f) {
        f.anchor = { x:0, y:0 };
        this.holes[0] = f;
    }
    get bag() {
        return this.holes[2];
    }
    set bag(bg) {
        this.holes[2] = bg;
    }
}
