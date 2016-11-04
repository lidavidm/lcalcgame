const SHRINK_DURATION = 800;
const EXPAND_DURATION = 400;
/// Variable nodes - separate from lambda variable expressions, for
/// now.
class VarExpr extends Expression {
    constructor(name) {
        super([new TextExpr(name)]);
        this.name = name;
        // See MissingTypedExpression#constructor
        this.equivalentClasses = [VarExpr];
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

class ChestVarExpr extends VarExpr {
    constructor(name) {
        super(name);
        // See MissingTypedExpression#constructor
        this.equivalentClasses = [ChestVarExpr];

        this._cacheBase = null;
        this._cacheLid = null;
        this._opened = false;
    }

    drawInternal(ctx, pos, boundingSize) {
        let baseHeight = 0.5 * boundingSize.h;
        let remainingHeight = 0.8 * (boundingSize.h - baseHeight);
        let offset = 0.2 * (boundingSize.h - baseHeight);

        if (!this._cacheBase) {
            let cacheBase = document.createElement("canvas");
            cacheBase.width = boundingSize.w;
            cacheBase.height = boundingSize.h;
            let ctx = cacheBase.getContext("2d");
            // Base of chest
            ctx.fillStyle = '#cd853f';
            setStrokeStyle(ctx, {
                lineWidth: 2,
                color: '#ffa500',
            });
            ctx.fillRect(0, remainingHeight, boundingSize.w, baseHeight);
            ctx.strokeRect(0 + 2, remainingHeight + 2, boundingSize.w - 4, baseHeight - 4);
            setStrokeStyle(ctx, {
                lineWidth: 1.5,
                color: '#8b4513',
            });
            ctx.strokeRect(0, remainingHeight, boundingSize.w, baseHeight);
            ctx.strokeRect(0 + 3.5, remainingHeight + 3.5, boundingSize.w - 7, baseHeight - 7);

            let cacheLid = document.createElement("canvas");
            cacheLid.width = boundingSize.w;
            cacheLid.height = boundingSize.h;
            ctx = cacheLid.getContext("2d");
            // Lid of chest
            ctx.fillStyle = '#cd853f';
            setStrokeStyle(ctx, {
                lineWidth: 2,
                color: '#ffa500',
            });
            ctx.strokeRect(0 + 2, offset, boundingSize.w - 4, baseHeight - 2);
            setStrokeStyle(ctx, {
                lineWidth: 1.5,
                color: '#8b4513',
            });
            ctx.strokeRect(0 + 3.5, offset, boundingSize.w - 7, baseHeight - 3.5);

            ctx.fillRect(0 + 3.5, offset, boundingSize.w - 7, baseHeight - 3.5);
            ctx.strokeRect(0, offset, boundingSize.w, baseHeight);

            this._cacheBase = cacheBase;
            this._cacheLid = cacheLid;
        }

        let size = this.absoluteSize;
        if (!this._opened) {
            ctx.drawImage(this._cacheBase, pos.x, pos.y, size.w, size.h);
            ctx.drawImage(this._cacheLid, pos.x, pos.y, size.w, size.h);
        }
        else {
            ctx.drawImage(this._cacheBase, pos.x, pos.y, size.w, size.h);
        }
    }

    performReduction(animated=true) {
        if (this._opened) return;
        let value = this.reduce();
        if (value != this) {
            if (!animated) {
                let parent = this.parent ? this.parent : this.stage;
                parent.swap(this, value);
                return;
            }
            value = value.clone();
            value.scale = { x: 0.1, y: 0.1 };
            value.pos = {
                x: this.pos.x + 0.5 * this.size.w - 0.5 * value.absoluteSize.w,
                y: this.pos.y + 30,
            };
            value.opacity = 0.0;

            let stage = this.stage;
            stage.add(value);
            this._opened = true;

            this.opacity = 1.0;
            Animate.tween(this, { opacity: 0.0 }, 300);
            Animate.tween(value, {
                scale: { x: 1.0, y: 1.0 },
                pos: {
                    x: this.pos.x + 0.5 * this.size.w - 0.5 * value.size.w,
                    y: this.pos.y - value.size.h,
                },
                opacity: 1.0,
            }, 500).after(() => {
                window.setTimeout(() => {
                    if (this.parent) {
                        stage.remove(value);
                        this.parent.swap(this, value);
                    }
                    else {
                        this.stage.remove(this);
                    }
                    stage.draw();
                    stage.update();
                }, 200);
            });
        }
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
            this.value.performReduction(false);
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

            this.variable._opened = true;
            let target = {
                scale: { x: 0.3, y: 0.3 },
                pos: { x: this.variable.pos.x, y: this.variable.pos.y },
            };

            // quadratic lerp for pos.y - makes it "arc" towards the variable
            let b = 4 * (Math.min(this.value.pos.y, this.variable.pos.y) - 120) - this.variable.pos.y;
            let c = this.value.pos.y;
            let a = this.variable.pos.y - b;
            let lerp = (src, tgt, elapsed, chain) => {
                if (chain.length == 2 && chain[0] == "pos" && chain[1] == "y") {
                    return a*elapsed*elapsed + b*elapsed + c;
                }
                else {
                    return (1.0 - elapsed) * src + elapsed * tgt;
                }
            };
            Animate.tween(this.value, target, 500, (x) => x, true, lerp).after(() => {
                this.getEnvironment().update(this.variable.name, value);
                let parent = this.parent || this.stage;
                Animate.poof(this);
                window.setTimeout(() => {
                    parent.swap(this, null);
                }, 100);
                this.stage.draw();
            });
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
