class Sequence extends Expression {
    constructor(...exprs) {
        super([]);
        this.padding.between = 5;
        exprs.forEach((expr) => {
            if (expr instanceof MissingExpression) {
                expr = new MissingSequenceExpression();
            }
            this.holes.push(expr);
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

        this.holes.forEach((expr) => expr.lock());
        let reduced = [];
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
                        this.holes.shift();
                        this.update();
                        reduced.push(newExpr);
                        if (newExpr instanceof Expression) newExpr.lock();
                        window.setTimeout(() => {
                            nextStep();
                        }, delay);
                    };
                    if (result instanceof Promise) {
                        result.then(delay, () => {
                            // Uh-oh, an error happened
                            this._animating = false;
                            while (this.holes.length > 0 && this.holes[0] instanceof MissingExpression) {
                                this.holes.shift();
                            }
                            this.update();

                            Animate.blink(this, 1000, [1.0, 0.0, 0.0]);
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

class NumberedSequence extends Sequence {
    constructor(...exprs) {
        super(...exprs);
        this.labels = [];
        this.padding.left = 30;

        for (let i = 0; i < exprs.length; i++) {
            let label = new TextExpr((i + 1).toString() + ":");
            label.fontSize = 20;
            this.labels.push(label);
        }
    }

    drawInternal(ctx, pos, boundingSize) {
        super.drawInternal(ctx, pos, boundingSize);
        let radius = this.radius*this.absoluteScale.x;
        ctx.fillStyle = "#fff";
        roundRect(ctx,
                  pos.x, pos.y,
                  27.5 * this.scale.x, boundingSize.h,
                  {
                      tl: radius,
                      bl: radius,
                      tr: 0,
                      br: 0,
                  }, true, false,
                  null);

        // When reducing, statements are removed from
        // this.holes. Offset the label so that the right label stays
        // with the right statement.
        let offset = this.labels.length - this.holes.length;
        for (let i = 0; i < this.holes.length; i++) {
            let statement = this.holes[i];
            let label = this.labels[i + offset];
            label._pos.x = statement.pos.x - 25;
            label._pos.y = statement.pos.y + 8;
            label.parent = this;
            label.update();
            label.update();
            label.draw(ctx);
        }
    }
}
