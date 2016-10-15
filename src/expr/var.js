/// Variable nodes - separate from lambda variable expressions, for
/// now.
class VarExpr extends Expression {
    constructor(name) {
        super([new TextExpr(name), new ExpressionView(null)]);
        this.name = name;
        this._stackVertically = true;
        // See MissingTypedExpression#constructor
        this.equivalentClasses = [VarExpr];
    }

    update() {
        let env = this.getEnvironment();
        if (!env) {
            super.update();
            return;
        }
        if (env.lookup(this.name)) {
            let value = env.lookup(this.name);
            this.holes[1] = value.clone();
            this.holes[1].lock();
            this.holes[1].bindSubexpressions();
        }
        super.update();
    }

    reduce() {
        let env = this.getEnvironment();
        if (!env) return this;

        let parent = this.parent ? this.parent : this.stage;
        if (!parent) return this;

        let value = env.lookup(this.name);
        if (!value) return this;

        value = value.clone();
        parent.swap(this, value);
        return value;
    }

    onmouseclick() {
        this.reduce();
    }
}

class AssignExpr extends Expression {
    constructor(variable, value) {
        super([]);
        if (variable && !(variable instanceof MissingExpression)) {
            this.holes.push(variable);
        }
        else {
            let missing = new MissingTypedExpression(new VarExpr("_"));
            missing.acceptedClasses = [VarExpr];
            this.holes.push(missing);
        }

        this.holes.push(new TextExpr("←"));

        if (value) {
            this.holes.push(value);
        }
        else {
            this.holes.push(new MissingExpression());
        }
    }

    get variable() {
        return this.holes[0] instanceof MissingExpression ? null : this.holes[0];
    }

    get value() {
        return this.holes[2] instanceof MissingExpression ? null : this.holes[2];
    }

    onmouseclick() {
        this.performReduction();
    }

    reduce() {
        if (this.variable && this.value) {
            return null;
        }
        else {
            return this;
        }
    }

    performReduction(animated=true) {
        // The side-effect actually happens here. reduce() is called
        // multiple times as a 'canReduce', and we don't want any
        // update to happen multiple times.
        if (this.reduce() != this) {
            if (animated) {
                let v1 = this.variable.holes[1].absolutePos;
                let v2 = this.value.absolutePos;
                Animate.tween(this.value, {
                    pos: {
                        x: v1.x - v2.x + this.value.pos.x,
                        y: v1.y - v2.y + this.value.pos.y,
                    }
                }, 300).after(() => {
                    this.getEnvironment().update(this.variable.name, this.value);
                    let parent = this.parent || this.stage;
                    parent.swap(this, null);
                    this.stage.getNodesWithClass(VarExpr, [], true, null).forEach((node) => {
                        // Make sure the change is reflected
                        node.update();
                    });
                });
            }
            else {
                super.performReduction();
            }
        }
    }

    reduceCompletely() {
        if (this.value) {
            this.value.reduceCompletely();
        }

        if (this.variable && this.value) {
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

class ExpressionView extends MissingExpression {
    constructor(expr_to_miss) {
        super(expr_to_miss);
    }

    // Disable interactivity
    ondropenter() {}
    ondropexit() {}
    ondropped() {}
}
