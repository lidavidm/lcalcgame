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
            this.preview = preview;
            this.update();
            return null;
        }
        this.animating = true;
        let target = {
            scale: {
                x: 0.0,
                y: 0.0,
            },
            pos: {
                x: this.holes[1].pos.x + 0.5 * this.holes[1].size.w,
                y: this.holes[1].pos.y,
            },
        };
        return Animate.tween(this.holes[1], target, 300).after(() => {
            this.animating = false;
            this.preview = preview;
            this.update();
        });
    }

    close() {
        this.preview = null;
        this.update();
    }

    animateShrink() {
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
        return Animate.tween(this.holes[1], target, SHRINK_DURATION).after(() => {
            this.animating = false;
        });
    }

    animateChangeTo(value) {
        this.animateShrink().after(() => {
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
            let otherVars = findAliasingVarExpr(initial, this.variable.name, [this.variable], false, true);
            console.log(otherVars);
            let afterAnimate = () => {
                this.getEnvironment().update(this.variable.name, this.value);
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
                this.variable.animateShrink();
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
        ctx.beginPath();
        ctx.arc(pos.x+rad,pos.y+rad,rad,0,2*Math.PI);
        var gradient = ctx.createLinearGradient(pos.x + rad, pos.y, pos.x + rad, pos.y + 2 * rad);
        gradient.addColorStop(0.0, "#AAAAAA");
        gradient.addColorStop(0.7, "#191919");
        gradient.addColorStop(1.0, "#191919");
        ctx.fillStyle = gradient;
        ctx.fill();

        if (this._openOffset < Math.PI / 2) {
            ctx.fillStyle = '#A4A4A4';
            setStrokeStyle(ctx, {
                color: '#C8C8C8',
                lineWidth: 1.5,
            });

            ctx.beginPath();
            ctx.arc(pos.x+rad, pos.y+rad, rad, -0.25*Math.PI + this._openOffset, 0.75*Math.PI - this._openOffset);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(pos.x+rad, pos.y+rad, rad, -0.25*Math.PI - this._openOffset, 0.75*Math.PI + this._openOffset, true);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(pos.x+rad,pos.y+rad,rad,0,2*Math.PI);
        var gradient = ctx.createRadialGradient(pos.x + rad, pos.y + rad, 0.67 * rad, pos.x + rad, pos.y + rad, rad);
        gradient.addColorStop(0,"rgba(0, 0, 0, 0.0)");
        gradient.addColorStop(1,"rgba(0, 0, 0, 0.4)");
        ctx.fillStyle = gradient;
        ctx.fill();
    }
}

function findAliasingVarExpr(initial, name) {
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
        if (node instanceof VarExpr && node.name === name) {
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
