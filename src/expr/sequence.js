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

    performReduction() {
        if (!this.canReduce()) {
            mag.Stage.getNodesWithClass(MissingExpression, [], true, [this]).forEach((node) => {
                Animate.blink(node);
            });
            return null;
        }

        this._animating = true;
        return reduceExprs(this.holes).then(() => {
            Animate.poof(this);
            (this.parent || this.stage).swap(this, null);
            return null;
        }, () => {
            // Something went wrong
            mag.Stage.getNodesWithClass(Expression, [], true, [this]).forEach((node) => {
                node.lock();
            });
            this.stroke = {
                color: 'red',
                lineWidth: 2,
            };
        });
    }

    onmouseclick() {
        if (!this._animating) {
            this.performReduction();
        }
    }
}
