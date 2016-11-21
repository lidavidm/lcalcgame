class Sequence extends Expression {
    constructor(...exprs) {
        super(exprs);
        this._stackVertically = true;
        this._animating = false;
    }

    canReduce() {
        for (let expr of this.holes) {
            // TODO: need some way to tell whether an expression is
            // 'complete'
            if (expr instanceof MissingExpression) return false;
        }
        return true;
    }

    performReduction() {
        if (!this.canReduce()) return null;

        this._animating = true;
        return new Promise((resolve, reject) => {
            let exprs = this.holes.slice();

            let nextStep = () => {
                if (exprs.length === 0) {
                    Animate.poof(this);
                    (this.parent || this.stage).swap(this, null);
                    resolve(null);
                }
                else {
                    let expr = exprs.shift();
                    let result = expr.performReduction();
                    let delay = () => {
                        window.setTimeout(() => {
                            nextStep();
                        }, 300);
                    };
                    if (result instanceof Promise) {
                        result.then(delay);
                    }
                    else {
                        delay();
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
