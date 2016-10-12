/// Variable nodes - separate from lambda variable expressions, for
/// now.
class VarExpr extends Expression {
    constructor(name) {
        super([new TextExpr(name), new ExpressionView(null)]);
        this.name = name;
    }

    onadded() {
        // TODO: show the expr
        // TODO: keep up-to-date with changes in the environment
        this.getEnvironment().observe((name, value) => {
            if (name === this.name) {
                this.holes[1] = value.clone();
            }
        });
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

class ExpressionView extends MissingExpression {
    constructor(expr_to_miss) {
        super(expr_to_miss);
    }

    // Disable interactivity
    ondropenter() {}
    ondropexit() {}
    ondropped() {}
}
