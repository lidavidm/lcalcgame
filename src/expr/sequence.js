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
            if (expr instanceof MissingExpression) return false;
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
        if (!this.canReduce()) {
            mag.Stage.getNodesWithClass(MissingExpression, [], true, [this]).forEach((node) => {
                Animate.blink(node);
            });
            return null;
        }

        this._animating = true;

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
                    this._animating = false;
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
                        after(800).then(() => nextStep());
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
        if (!this._animating) {
            this.performReduction();
        }
    }
}

class NotchedSequence extends Sequence {
    constructor(...exprs) {
        super(...exprs);
        this.padding.left = 17.5;
        this._reductionIndicatorStart = 0;
    }

    drawInternal(ctx, pos, boundingSize) {
        super.drawInternal(ctx, pos, boundingSize);
        const radius = this.radius*this.absoluteScale.x;
        const leftMargin = 15 * this.scale.x;
        ctx.fillStyle = "#fff";
        roundRect(ctx,
                  pos.x, pos.y,
                  leftMargin, boundingSize.h,
                  {
                      tl: radius,
                      bl: radius,
                      tr: 0,
                      br: 0,
                  }, true, false,
                  null);

        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        for (let i = 0; i < this.holes.length - 1; i++) {
            let expr1 = this.holes[i];
            let expr2 = this.holes[i + 1];
            let expr1y = expr1.absolutePos.y + expr1.anchor.y * expr1.absoluteSize.h;
            let expr2y = expr2.absolutePos.y;
            let tickPos = expr1y + (expr2y - expr1y) / 2;
            ctx.beginPath();
            ctx.moveTo(pos.x, expr1y);
            ctx.lineTo(pos.x + 15 * this.scale.x, expr1y);
            ctx.stroke();
        }

        if (this._animating) {
            const rad = leftMargin / 3;
            const indicatorX = pos.x + leftMargin / 2 - rad;
            const verticalDistance = boundingSize.h - 2 * radius;
            const verticalOffset = 0.5 * (1.0 + Math.sin((Date.now() - this._reductionIndicatorStart) / 250)) * verticalDistance;
            drawCircle(ctx, indicatorX, pos.y + radius + verticalOffset, rad, "#000", null);
        }
    }

    performReduction() {
        let result = super.performReduction();

        Animate.drawUntil(this.stage, () => {
            return !this._animating || !this.stage;
        });
        this._reductionIndicatorStart = Date.now();

        return result;
    }
}
