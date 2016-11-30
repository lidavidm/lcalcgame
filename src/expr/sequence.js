class Sequence extends Expression {
    constructor(...exprs) {
        super(exprs);
        this._layout = { direction: "vertical", align: "none" };
        this._animating = false;
    }

    canReduce() {
        for (let expr of this.holes) {
            if (expr instanceof MissingExpression) return false;
            if (!expr.isComplete()) return false;
        }
        return true;
    }

    update() {
        for (let expr of this.holes) {
            if (expr instanceof MissingExpression) {
                expr._size = { w: Math.max(100, this.size.w - 20), h: expr.size.h };
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
