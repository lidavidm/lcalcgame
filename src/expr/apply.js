class ApplyExpr extends Expression {
    constructor(exprToApply, lambdaExpr) {

        super([exprToApply, lambdaExpr]);

        this.lambdaExpr.pos = { x:0, y:0 };
        this.exprToApply.pos = addPos(this.lambdaExpr.pos,
            { x:-exprToApply.size.w, y:-exprToApply.size.h/2 });

        this.shadowOffset = 2;
        this.color = '#ddd';

        this.exprToApply.lock();
        this.lambdaExpr.lock();

        let arrow = new ImageExpr(0,0,97/1.6,60/1.6,'apply-arrow');
        arrow.lock();
        this.arrow = arrow;
        this.arrow.opacity = 1;
    }

    get constructorArgs() { return [ this.exprToApply.clone(), this.lambdaExpr.clone() ]; }

    get exprToApply() { return this.children[0]; }
    get lambdaExpr()  { return this.children[1]; }

    onmouseclick() {
        this.lambdaExpr.hole.ondropenter(this.exprToApply);
        //Animate.tween( this.arrow, {opacity:0}, 200 );
        Animate.wait(500).after(() => {
            let stg = this.stage;
            let lambda = this.lambdaExpr;
            this.exprToApply.opacity = 1.0;
            this.lambdaExpr.applyExpr(this.exprToApply);
            (this.parent || stg).swap(this, this.lambdaExpr);
            //lambda.performReduction();
            if (stg) stg.draw();
        });
    }

    hitsChild() { return null; }

    drawInternalAfterChildren(ctx, pos, boundingSize) {
        this.arrow.parent = this;
        this.arrow.pos = { x:this.exprToApply.pos.x + this.exprToApply.size.w/2, y:-8 };
        this.arrow.draw(ctx);
    }

    //update() { }
}
