class Sequence extends Expression {
    constructor(...exprs) {
        super([]);
        this.padding.between = 5;
        exprs.forEach((expr) => {
            if (expr instanceof MissingExpression) {
                this.holes.push(new MissingSequenceExpression());
            }
            else if (expr instanceof Sequence) {
                expr.holes.forEach((x) => this.holes.push(x));
            }
            else {
                this.holes.push(expr);
            }
        });
        this._layout = { direction: "vertical", align: "none" };
        this._animating = false;
    }

    get subexpressions() {
        return this.holes;
    }

    canReduce() {
        for (let expr of this.holes) {
            if (!expr.isComplete()) return false;
        }
        return true;
    }

    update() {
        super.update();

        let width = 75;
        for (let expr of this.holes) {
            width = Math.max(width, expr.size.w);
        }
        for (let expr of this.holes) {
            if (expr instanceof MissingExpression) {
                expr._size = { w: width, h: expr.size.h };
            }
        }
        super.update();
    }

    performReduction() {
        let cleanup = () => {
            this._animating = false;
            while (this.holes.length > 0 && this.holes[0] instanceof MissingExpression) {
                this.holes.shift();
            }
            this.update();

            Animate.blink(this, 1000, [1.0, 0.0, 0.0]);
        };

        this.lockSubexpressions();
        return new Promise((resolve, reject) => {
            let nextStep = () => {
                if (this.holes.length === 0) {
                    Animate.poof(this);
                    (this.parent || this.stage).swap(this, null);
                    resolve(null);
                }
                else {
                    let expr = this.holes[0];
                    let result = expr.performReduction();
                    let delay = (newExpr) => {
                        if (newExpr instanceof Expression && newExpr != expr) {
                            this.holes[0] = newExpr;
                        }
                        else if (newExpr instanceof Expression && newExpr.isValue()) {
                            this.holes.shift();
                        }
                        else if (newExpr == expr) {
                            cleanup();
                            reject();
                            return;
                        }
                        else {
                            this.holes.shift();
                        }

                        // To handle expressions like loops that
                        // expand into sequences, flatten any
                        // subsequences we encounter.
                        let newHoles = [];
                        for (let expr of this.holes) {
                            if (expr instanceof Sequence) {
                                newHoles = newHoles.concat(expr.holes);
                            }
                            else {
                                newHoles.push(expr);
                            }
                        }
                        this.holes = newHoles;

                        this.update();
                        if (newExpr instanceof Expression) newExpr.lock();
                        if (newHoles.length > 0) {
                            after(800).then(() => nextStep());
                        }
                        else {
                            nextStep();
                        }
                    };
                    if (result instanceof Promise) {
                        result.then(delay, () => {
                            // Uh-oh, an error happened
                            cleanup();
                            reject();
                        });
                    }
                    else {
                        delay(result || expr);
                    }
                }
            };
            nextStep();
        });
    }

    onmouseclick() {
        this.performUserReduction();
    }

    toString() {
        return `${this.locked ? '/' : ''}(sequence ${this.subexpressions.map((x) => x.toString()).join(" ")})`;
    }
    toJavaScript() {
        let es = this.subexpressions.map((x) => x.toJavaScript());
        for (let i = 0; i < es.length; i++) {
            let e = es[i].trim();
            if (e[e.length-1] !== ';')
                es[i] += ';';
        }
        return es.join('\n');
    }

    reduceCompletely() {
        if (this.canReduce()) {
            // Return non-undefined non-this value so that when the
            // user drops everything in, MissingExpression#ondropped
            // will make this expr blink
            return null;
        }
        else {
            return this;
        }
    }
}

class NotchedSequence extends Sequence {
    constructor(...exprs) {
        super(...exprs);
        this.padding.right = 17.5;
        this._reductionIndicatorStart = 0;
    }

    drawInternal(ctx, pos, boundingSize) {
        super.drawInternal(ctx, pos, boundingSize);
        const radius = this.radius*this.absoluteScale.x;
        const rightMargin = 15 * this.scale.x;
        ctx.fillStyle = "#fff";
        roundRect(ctx,
                  pos.x + boundingSize.w - rightMargin, pos.y,
                  rightMargin, boundingSize.h,
                  {
                      tl: 0,
                      bl: 0,
                      tr: radius,
                      br: radius,
                  }, true, false,
                  null);

        setStrokeStyle(ctx, {
            color: '#000',
            lineWidth: 1,
        });
        for (let i = 0; i < this.holes.length - 1; i++) {
            let expr1 = this.holes[i];
            let expr2 = this.holes[i + 1];
            let expr1y = expr1.absolutePos.y + expr1.anchor.y * expr1.absoluteSize.h;
            let expr2y = expr2.absolutePos.y;
            let tickPos = expr1y + (expr2y - expr1y) / 2;
            ctx.beginPath();
            ctx.moveTo(pos.x + boundingSize.w - 15 * this.scale.x, expr1y);
            ctx.lineTo(pos.x + boundingSize.w, expr1y);
            ctx.stroke();
        }
    }
}

class SemicolonNotchedSequence extends NotchedSequence {
    constructor(...exprs) {
        super(...exprs);
        this.padding.right = 15;
    }

    drawInternal(ctx, pos, boundingSize) {
        super.drawInternal(ctx, pos, boundingSize);
        const radius = this.radius*this.absoluteScale.x;
        const rightMargin = 15 * this.scale.x;

        ctx.fillStyle = "black";
        let fontSize = 35 * this.scale.y * 0.85;
        ctx.font = `${fontSize}px Consolas, monospace`;
        for (let i = 0; i < this.holes.length; i++) {
            let expr1 = this.holes[i];
            let expr1y = expr1.absolutePos.y; // - expr1.anchor.y * expr1.absoluteSize.h;
            expr1y += (expr1.absoluteSize.h - fontSize) / 2;
            ctx.fillText(";", pos.x + boundingSize.w - rightMargin, expr1y);
        }
    }
}

class SemicolonSequence extends Sequence {
    drawInternal(ctx, pos, boundingSize) {
        super.drawInternal(ctx, pos, boundingSize);
        const radius = this.radius*this.absoluteScale.x;
        const rightMargin = 15 * this.scale.x;

        ctx.fillStyle = "black";
        let fontSize = 35 * this.scale.y * 0.85;
        ctx.font = `${fontSize}px Consolas, monospace`;
        for (let i = 0; i < this.holes.length; i++) {
            let expr1 = this.holes[i];
            let expr1y = expr1.absolutePos.y; // - expr1.anchor.y * expr1.absoluteSize.h;
            expr1y += (expr1.absoluteSize.h - fontSize) / 2;
            ctx.fillText(";", pos.x + boundingSize.w - rightMargin, expr1y);
        }
    }

    clone (parent = null) {
        //console.log("called clone() in semicolon sequence");
        let cln = super.clone(parent);
        cln.holes = [];
        cln.children = [];
        //console.log("this.holes");
        //console.log(this.holes);
        //let thisHoles = this.holes.clone();
        this.holes.forEach((hole) => cln.holes.push(hole.clone()));
        return cln;
    }
}

/* A wrapper for blocks that are sequences but wrapped in a multi-line
   code {} block, like if {} else {} statements, for {} loops, while {} loops,
   etc. */
class MultiClampSequence extends Sequence {

    constructor(exprsPerClamp, includeBottomClamp=false) {
        super([]);
        this._layout.direction = "horizontal";
        this.shadowOffset = 6;
        this._numOfClamps = exprsPerClamp.length/2+1;
        let ground = 0;
        let breakIndices = [ 0 ];
        for(let i = 0; i < exprsPerClamp.length; i++) {
            let es = exprsPerClamp[i];
            ground += es.length;
            breakIndices.push(ground);
        }
        this.holes = exprsPerClamp.reduce((a,b) => a.concat(b));
        this.breakIndices = breakIndices;

        this._exprsPerClamp = exprsPerClamp;

        console.log(this);
    }

    get constructorArgs() {
        return [ this._exprsPerClamp ];
    }

    aggregateSize(sizes, padding=null) {
        if (!padding) padding = { right:0, left:0, inner:0 };
        return { w:sizes.reduce((p, c) => p + c.w + padding.inner, padding.left) + padding.right,
                 h:Math.max(...sizes.map((sz) => sz.h)) + padding.inner };
    }
    getSizeForSection(secID) {
        return this.aggregateSize(this.getHoleSizes().slice(this.breakIndices[secID], this.breakIndices[secID+1]), this.padding);
    }
    getTopSize() {
        return this.getSizeForSection(0);
    }
    getMidSize() {
        return this.getSizeForSection(2);
    }
    getBotSize() {
        return { w:100, h:30 };
    }

    // Sizes to match its children.
    get size() {
        var padding = this.padding;
        var width = 0;
        var height = DEFAULT_EXPR_HEIGHT;

        const FILLER_INNER_HEIGHT = 40;
        var topSize = this.getTopSize();
        var midSize = this.getMidSize();
        var botSize = this.getBotSize();

        var sz = { w:Math.max(topSize.w, midSize.w, botSize.w),
                   h:[topSize.h, FILLER_INNER_HEIGHT*(this._numOfClamps-1), midSize.h*(this._numOfClamps-2), botSize.h].reduce((a,b) => a + b, 0) };

        this.topRatio   = { x:topSize.w/sz.w, y:(topSize.h+padding.inner)/sz.h };
        this.innerRatio = { x:(padding.left*2)/sz.w, y:FILLER_INNER_HEIGHT/sz.h };
        this.midRatio   = { x:(midSize.w)/sz.w, y:(midSize.h-padding.inner)/sz.h };
        this.botRatio   = { x:(botSize.w-padding.left*2)/sz.w, y:botSize.h/sz.h };

        return sz;
    }

    update() {
        var _this = this;
        this.children = [];
        const FILLER_INNER_HEIGHT = 40;

        this.holes.forEach((expr) => _this.addChild(expr));
        // In the centering calculation below, we need this expr's
        // size to be stable. So we first set the scale on our
        // children, then compute our size once to lay out the
        // children.
        this.holes.forEach((expr) => {
            expr.anchor = { x:0, y:0.5 };
            expr.scale = { x:0.85, y:0.85 };
            expr.update();
        });
        var size = this.size;
        var padding = this.padding.inner;
        var x = this.padding.left;
        var y = this.getTopSize().h / 2.0 + (this.exprOffsetY ? this.exprOffsetY : 0);
        if (this._layout.direction == "vertical") {
            y = padding;
        }

        let currentBreakIdx = 1;
        this.holes.forEach((expr, i) => { // Update hole expression positions.

            if (i === this.breakIndices[currentBreakIdx]) {
                x = this.getMidSize().w / 2.0 - expr.size.w / 2.0 * expr.scale.x;
                if (currentBreakIdx % 2 === 1) y += FILLER_INNER_HEIGHT + padding;
                else {
                    y += expr.anchor.y * expr.size.h * expr.scale.y + padding / 2;
                    y += (1 - expr.anchor.y) * expr.size.h * expr.scale.y / 2;
                }
                if (this.padding.between) y += this.padding.between;
                currentBreakIdx++;
            }

            expr.anchor = { x:0, y:0.5 };
            expr.pos = { x:x, y:y };
            expr.scale = { x:0.85, y:0.85 };
            expr.update();

            if (this._layout.direction == "vertical") {
                y += expr.anchor.y * expr.size.h * expr.scale.y;
                var offset = x;

                // Centering
                if (this._layout.align == "horizontal") {
                    var innerWidth = size.w;
                    var scale = expr.scale.x;
                    offset = (innerWidth - scale * expr.size.w) / 2;
                }

                expr.pos = { x:offset, y:y };

                y += (1 - expr.anchor.y) * expr.size.h * expr.scale.y;
                if (this.padding.between) y += this.padding.between;
            }
            else {
                x += expr.size.w * expr.scale.x + padding;
            }
        });

        this.children = this.holes; // for rendering
    }

    drawBaseShape(ctx, pos, boundingSize) {
        multiClampRect(ctx,
                      pos.x, pos.y,
                      boundingSize.w*this.topRatio.x, boundingSize.h*this.topRatio.y,
                      boundingSize.w*this.innerRatio.x, boundingSize.h*this.innerRatio.y,
                      boundingSize.w*this.midRatio.x, boundingSize.h*this.midRatio.y,
                      boundingSize.w*this.botRatio.x, boundingSize.h*this.botRatio.y,
                      this._numOfClamps-2, // number of inner sections
                      this.radius*this.absoluteScale.x, true, this.stroke ? true : false,
                      this.stroke ? this.stroke.opacity : null,
                      this.notches ? this.notches : null);
    }
}

// A Statement (as in, multi-line code) of the form
// if (...) {
//     ...
// } else {
//     ...
// }
class IfElseBlockStatement extends MultiClampSequence {
    constructor(cond, branch, elseBranch) {
        super([ [new TextExpr('if'), cond], [branch], [new TextExpr('else')], [elseBranch] ]);
        this.branch.anchor = {x:0, y:0};
        this.elseBranch.anchor = {x:0, y:0};
    }
    get cond()       { return this.holes[1]; }
    get branch()     { return this.holes[2]; }
    get elseBranch() { return this.holes[4]; }
    get constructorArgs() {
        return [ this.cond.clone(), this.branch.clone(), this.elseBranch.clone() ];
    }
    toJavaScript() {
        return `if (${this.cond.toJavaScript()}) {\n${this.branch.toJavaScript()}\n} else {\n${this.elseBranch.toJavaScript()}\n}`;
    }
    // reduce() {
    //     if (this.canReduce()) {
    //         let c = this.cond.reduceCompletely();
    //         if ()
    //     }
    // }
    performReduction(animated=true) {
        let cleanup = () => {
            this._animating = false;
            this.update();
        };
        let swap = (node, branch) => {
            var parent = node.parent ? node.parent : node.stage;
            if (branch) branch.ignoreEvents = node.ignoreEvents; // the new expression should inherit whatever this expression was capable of as input
            parent.swap(node, branch);
        };
        let condSwap = () => {
            if (this.cond.value() === true) {
                swap(this, this.branch);
            } else if (this.cond.value() === false) {
                swap(this, this.elseBranch);
            } else {
                console.error('Error @ IfElseBlockStatement.performReduction: Condition value is ', this.cond.value());
                cleanup();
                return Promise.reject();
            }
            return Promise.resolve();
        };

        this.lockSubexpressions();

        let r = this.reduceCompletely();
        if (r != this) {
            this._animating = true;
            if (this.cond.canReduce()) { // If condition is reducable, animate its reduction first.
                return this.cond.performReduction(animated).then(() => {
                    return new Promise(function(resolve, reject) {
                        Animate.wait(2000).after(() => {
                            resolve();
                        });
                    });
                }).then(() => {
                    return condSwap();
                });
            }
            else if (this.cond.isValue())
                return condSwap();
        }

        return Promise.reject("Cannot reduce!");
    }
}
