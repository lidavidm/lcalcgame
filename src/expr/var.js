/// Variable nodes - separate from lambda variable expressions, for
/// now.
class VarExpr extends Expression {
    constructor(name) {
        super([new TextExpr(name), new ExpressionView(null)]);
        this.name = name;
        this._stackVertically = true;
    }

    get size() {
        var padding = this.padding;
        var width = 50;  // TODO: should be DEFAULT_EXPR_WIDTH
        var height = 0;
        var sizes = this.getHoleSizes();
        var scale_x = this.scale.x;

        if (sizes.length === 0) return { w:this._size.w, h:this._size.h };

        sizes.forEach((s) => {
            height += s.h + padding.inner;
            width = Math.max(width, s.w);
        });
        width += padding.right + padding.left; // the end

        return { w:width, h: height };
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
