const SHRINK_DURATION = 800;
const EXPAND_DURATION = 400;
/// Variable nodes - separate from lambda variable expressions, for
/// now.
class VarExpr extends Expression {
    constructor(name) {
        super([new TextExpr(name), new ExpressionView(null)]);
        this.name = name;
        this._stackVertically = true;
        // See MissingTypedExpression#constructor
        this.equivalentClasses = [VarExpr];
        this.preview = null;
        this.animating = false;
    }

    open(preview, animate=true) {
        if (!animate) {
            this.animating = false;
            this.preview = preview;
            this.update();
            return null;
        }
        return this.animateShrink(200).after(() => {
            this.preview = preview;
            this.update();
        });
    }

    close() {
        this.preview = null;
        this.update();
    }

    animateShrink(duration) {
        this.animating = true;
        let target = null;
        if (this.holes[1] instanceof ExpressionView) {
            target = {
                _openOffset: Math.PI / 2,
            };
        }
        else {
            target = {
                scale: {
                    x: 0.0,
                    y: 0.0,
                },
                pos: {
                    x: this.holes[1].pos.x + 0.5 * this.holes[1].size.w,
                    y: this.holes[1].pos.y,
                },
            };
        }
        return Animate.tween(this.holes[1], target, duration).after(() => {
            this.animating = false;
        });
    }

    animateChangeTo(value) {
        this.animateShrink(SHRINK_DURATION).after(() => {
            this.animating = true;
            this.holes[1] = value;
            super.update();
            let target = {
                scale: value.scale,
                pos: value.pos,
            };
            value.pos = {
                x: value.pos.x + 0.5 * value.size.w,
                y: value.pos.y,
            };
            value.scale = {
                x: 0,
                y: 0,
            };
            Animate.tween(value, target, 300).after(() => {
                this.animating = false;
            });
        });
    }

    update() {
        if (this.animating) {
            super.update();
            return;
        }

        if (this.preview) {
            this.holes[1] = this.preview;
            this.holes[1].lock();
            this.holes[1].bindSubexpressions();
            super.update();
            if (this.stage) this.stage.draw();
            return;
        }

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
        else {
            this.holes[1] = new ExpressionView(null);
        }
        super.update();
        if (this.stage) this.stage.draw();
    }

    canReduce() {
        return this.getEnvironment() && (this.parent || this.stage) && this.getEnvironment().lookup(this.name);
    }

    reduce() {
        let env = this.getEnvironment();
        if (!env) return this;

        let parent = this.parent ? this.parent : this.stage;
        if (!parent) return this;

        let value = env.lookup(this.name);
        if (!value) return this;

        return value;
    }

    performReduction() {
        let value = this.reduce();
        if (value != this) {
            value = value.clone();
            let parent = this.parent ? this.parent : this.stage;
            parent.swap(this, value);
        }
    }

    onmouseclick() {
        this.performReduction();
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

    canReduce() {
        return this.value && this.variable && this.value.canReduce();
    }

    reduce() {
        if (this.variable && this.value) {
            return this.value;
        }
        else {
            return this;
        }
    }

    performReduction(animated=true) {
        // The side-effect actually happens here. reduce() is called
        // multiple times as a 'canReduce', and we don't want any
        // update to happen multiple times.
        if (this.value) {
            this.value.performReduction();
        }
        if (this.canReduce()) {
            let initial = [];
            if (this.parent) {
                initial.push(this.parent);
            }
            else {
                initial = initial.concat(this.stage.nodes);
            }

            // Prevent background on GraphicValueExpr from being drawn
            this.value.ignoreEvents = true;
            // Keep a copy of the original value before we start
            // messing with it, to update the environment afterwards
            let value = this.value.clone();
            let otherVars = findAliasingVarExpr(initial, this.variable.name, [this.variable]);
            let afterAnimate = () => {
                this.getEnvironment().update(this.variable.name, value);
                let parent = this.parent || this.stage;
                Animate.poof(this);
                window.setTimeout(() => {
                    parent.swap(this, null);
                }, 100);
                this.stage.getNodesWithClass(VarExpr, [this.variable], true, null).forEach((node) => {
                    // Make sure the change is reflected
                    node.close();
                    node.update();
                });
                this.stage.draw();
            };
            if (animated) {
                let v1 = this.variable.holes[1].absolutePos;
                let v2 = this.value.absolutePos;
                let target = {
                    pos: {
                        x: v1.x - v2.x + this.value.pos.x,
                        y: v1.y - v2.y + this.value.pos.y,
                    },
                };
                otherVars.forEach((v) => v.animateChangeTo(this.value.clone()));
                Resource.play('swoop');
                this.variable.animateShrink(SHRINK_DURATION);
                Animate.tween(this.value, target, SHRINK_DURATION, (t) => -t * t * (t - 2)).after(() => {
                    this.value.scale = { x: 0, y: 0 };
                    this.variable.open(this.value.clone(), false);
                    window.setTimeout(afterAnimate, EXPAND_DURATION);
                });
            }
            else {
                super.performReduction();
                afterAnimate();
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
        this._openOffset = 0;
    }

    // Disable interactivity
    ondropenter() {}
    ondropexit() {}
    ondropped() {}
    onmouseenter() {}
    drawInternal(ctx, pos, boundingSize) {
        var rad = boundingSize.w / 2.0;
        setStrokeStyle(ctx, {
            color: '#AAAAAA',
            lineWidth: 3,
        });
        ctx.beginPath();
        ctx.arc(pos.x+rad,pos.y+rad,rad,0,2*Math.PI);

        ctx.clip();
        let alpha = 0.5 * (((Math.PI / 2) - this._openOffset) / (Math.PI / 2));
        ctx.shadowColor = `rgba(0,0,0,${alpha})`;
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        ctx.stroke();
    }
}

function findAliasingVarExpr(initial, name, ignore) {
    // TODO: needs to account for whether the variable we are looking
    // for is in an outer scope. Example:
    // x = 3
    // def test():
    //     global x
    //     x = 5
    let subvarexprs = [];
    let queue = initial;
    while (queue.length > 0) {
        let node = queue.pop();
        if (node instanceof VarExpr && node.name === name && ignore.indexOf(node) == -1) {
            subvarexprs.push(node);
        }
        else if (node instanceof LambdaExpr &&
                 (node.takesArgument &&
                   node.holes[0].name === name)) {
            // Capture-avoiding substitution
            continue;
        }

        if (node.children) {
            queue = queue.concat(node.children);
        }
    }

    return subvarexprs;
}
