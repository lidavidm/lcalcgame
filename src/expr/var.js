const SHRINK_DURATION = 800;
const EXPAND_DURATION = 400;

class _ChestImages {
    base(name) {
        if (name == "x") {
            return Resource.getImage("chest-wood-base");
        }
        return Resource.getImage("chest-metal-base");
    }

    lidClosed(name) {
        if (name == "x") {
            return Resource.getImage("chest-wood-lid-closed");
        }
        return Resource.getImage("chest-metal-lid-closed");
    }

    lidOpen(name) {
        if (name == "x") {
            return Resource.getImage("chest-wood-lid-open");
        }
        return Resource.getImage("chest-metal-lid-open");
    }
}

const ChestImages = new _ChestImages();

// parabolic lerp for y - makes it "arc" towards the final position
const arcLerp = (y0, y1, arc=120) => {
    let b = 4 * (Math.min(y0, y1) - arc) - y1 - 3 * y0;
    let c = y0;
    let a = y1 - b - c;
    let lerp = (src, tgt, elapsed, chain) => {
        if (chain.length == 2 && chain[0] == "pos" && chain[1] == "y") {
            return a*elapsed*elapsed + b*elapsed + c;
        }
        else {
            return (1.0 - elapsed) * src + elapsed * tgt;
        }
    };
    return lerp;
};

/// Variable nodes - separate from lambda variable expressions, for
/// now.
class VarExpr extends Expression {
    constructor(name) {
        super([]);
        this.name = name;
        // See MissingTypedExpression#constructor
        this.equivalentClasses = [VarExpr];
    }

    open(preview, animate=true) {
    }

    close() {
    }

    value() {
        if (this.canReduce()) {
            return this.getEnvironment().lookup(this.name).value();
        }
        return undefined;
    }

    isValue() {
        return false;
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

    isPlaceholder() {
        if (this.canReduce()) return false;
        if (this.parent) {
            if (this.rootParent instanceof Sequence) return false;
            if (this.parent instanceof AssignExpr) {
                return this.parent.variable != this;
            }
        }
        return true;
    }

    animatePlaceholderStatus() {
        if (!this.canReduce()) this.performReduction();
    }

    onmouseclick() {
        this.performReduction();
    }

    toString() {
        return '$' + (this.ignoreEvents ? '' : '_') + this.name;
    }
    toJavaScript() {
        return this.name;
    }
}

class LabeledVarExpr extends VarExpr {
    constructor(name) {
        super(name);
        this.label = new TextExpr(name);
        this.addArg(this.label);
    }

    // Used by EnvironmentLambdaExpr
    // TODO: better name
    // TODO: tweak this animation (side arc?)
    animateReduction(display) {
        if (this.parent && this.parent instanceof AssignExpr && this.parent.variable == this) return null;

        return new Promise((resolve, reject) => {
            let value = this.reduce();
            if (this.reduce() != this) {
                let dummy = display.getExpr().clone();
                let stage = this.stage;
                stage.add(dummy);
                dummy.pos = display.getExpr().absolutePos;
                dummy.scale = display.getExpr().absoluteScale;

                Animate.tween(dummy, {
                    pos: this.absolutePos,
                    scale: { x: 1, y: 1 },
                }, 300).after(() => {
                    let clone = display.getExpr().clone();
                    (this.parent || this.stage).swap(this, clone);
                    if (this.locked) clone.lock();
                    stage.remove(dummy);
                    resolve();
                });
            }
            else {
                reject();
            }
        });
    }

    performReduction() {
        if (this.parent && this.parent instanceof AssignExpr && this.parent.variable == this) return null;

        let value = this.reduce();
        if (value != this) {
            value = value.clone();
            let parent = this.parent ? this.parent : this.stage;
            parent.swap(this, value);
            return Promise.resolve(value);
        }
        else {
            let wat = new TextExpr("?");
            this.stage.add(wat);
            wat.pos = this.label.absolutePos;
            Animate.tween(wat, {
                pos: {
                    x: wat.pos.x,
                    y: wat.pos.y - 50,
                },
            }, 250);
            window.setTimeout(() => {
                Animate.poof(wat);
                this.stage.remove(wat);
                this.stage.draw();
                this.stage.update();
            }, 500);
            return Promise.reject("Cannot reduce undefined variable");
        }
    }
}

class ChestVarExpr extends VarExpr {
    constructor(name) {
        super(name);
        // See MissingTypedExpression#constructor
        this.equivalentClasses = [ChestVarExpr];
        this._preview = null;
        this._animating = false;
    }

    get _superSize() {
        return super.size;
    }

    get size() {
        return { w:this._size.w, h:this._size.h };
    }

    open(preview, animate=true) {
        preview = preview.clone();
        preview.ignoreEvents = true;
        preview.scale = { x: 0.6, y: 0.6 };
        preview.anchor = { x: -0.1, y: 0.5 };
        this._preview = preview;
        if (this.holes.length > 0) {
            this.holes[0] = preview;
        }
        else {
            this.holes.push(preview);
        }
        this._opened = true;
    }

    close() {
        this._opened = false;
        this.removeChild(this.holes[0]);
        this._preview = null;
    }

    drawInternal(ctx, pos, boundingSize) {
        if (this._preview) {
            this._preview.pos = {
                x: 0,
                y: 5,
            };
        }

        if (this.parent && !this.ignoreEvents) {
            // Draw gray background analogous to other values
            ctx.fillStyle = "#777";
            roundRect(ctx,
                      pos.x, pos.y,
                      boundingSize.w, boundingSize.h,
                      6*this.absoluteScale.x, true, false, null);
        }

        let size = this._size;
        let scale = this.absoluteScale;
        let adjustedSize = this.absoluteSize;
        let offset = Math.max(2, (adjustedSize.w - size.w) / 2);
        ChestImages.base(this.name).draw(ctx, pos.x + offset, pos.y + offset, size.w * scale.x - 2 * offset, size.h * scale.y - 2 * offset);
        if (this._opened) {
            ChestImages.lidOpen(this.name).draw(ctx, pos.x + offset, pos.y + offset, size.w * scale.x - 2 * offset, size.h * scale.y - 2 * offset);
        }
        else {
            ChestImages.lidClosed(this.name).draw(ctx, pos.x + offset, pos.y + offset, size.w * scale.x - 2 * offset, size.h * scale.y - 2 * offset);
        }
        if (this.stroke) {
            ctx.save();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.globalCompositeOperation = 'screen';
            ctx.fillRect(pos.x, pos.y, boundingSize.w, boundingSize.h);
            ctx.restore();
        }
    }

    performReduction(animated=true) {
        if (this.parent && this.parent instanceof AssignExpr && this.parent.variable == this)
            return Promise.reject("Cannot reduce LHS of assignment");

        let value = this.reduce();
        if (value != this) {
            if (!animated) {
                let parent = this.parent ? this.parent : this.stage;
                parent.swap(this, value);
                return Promise.resolve(value);
            }
            this._animating = true;
            return this.animateReduction(value, true);
        }
        else if (animated) {
            let wat = new TextExpr("?");
            this.animateReduction(wat, false).then((wat) => {
                this._opened = false;
                window.setTimeout(() => {
                    Animate.poof(wat);
                    this.stage.remove(wat);
                    this.stage.draw();
                    this.stage.update();
                }, 500);
            });
        }
        return Promise.reject("Cannot reduce undefined variable");
    }

    animateReduction(value, destroy) {
        let stage = this.stage;

        value = value.clone();
        value.anchor = { x: 0.5, y: 0.5 };
        stage.add(value);
        value.update();

        let target = {
            x: this.absolutePos.x - this.anchor.x * this.size.w + 0.5 * this.size.w,
            y: this.absolutePos.y - value.size.h,
        };

        value.scale = { x: 0.1, y: 0.1 };
        value.update();
        value.pos = {
            x: this.absolutePos.x - this.anchor.x * this.size.w + 0.5 * this.size.w,
            y: this.absolutePos.y + 30,
        };

        if (!this._opened) {
            Resource.play('chest-open');
            this._opened = true;
        }

        return new Promise((resolve, _reject) => {
            Resource.play('come-out');
            Animate.tween(value, {
                scale: { x: 1.0, y: 1.0 },
                pos: target,
            }, 500).after(() => {
                window.setTimeout(() => {
                    if (destroy) {
                        Animate.poof(this);
                        if (this.parent) {
                            stage.remove(value);
                            this.parent.swap(this, value);
                        }
                        else {
                            this.stage.remove(this);
                        }
                    }
                    stage.draw();
                    stage.update();
                    resolve(value);
                }, 200);
            });
        });
    }

    onmouseenter() {
        super.onmouseenter();
        SET_CURSOR_STYLE(CONST.CURSOR.HAND);
    }

    onmouseleave() {
        super.onmouseleave();
        SET_CURSOR_STYLE(CONST.CURSOR.DEFAULT);
    }

    onmouseclick() {
        if (!this._animating) {
            this.performReduction(true);
        }
    }
}

class JumpingChestVarExpr extends ChestVarExpr {
    performReduction(animated=true) {
        if (this.parent && this.parent instanceof AssignExpr && this.parent.variable == this)
            return Promise.reject("Cannot reduce LHS of assignment");

        if (!animated || !this.stage) {
            return super.performReduction(animated);
        }
        let chest = this.stage.environmentDisplay.getBinding(this.name);
        if (!chest) {
            return super.performReduction(animated);
        }

        Resource.play('chest-open');
        this._opened = true;
        this._animating = true;
        let value = chest.holes[0].clone();
        value.pos = chest.holes[0].absolutePos;
        this.stage.add(value);

        let target = {
            pos: this.absolutePos,
            scale: { x: 0.3, y: 0.3 },
        };
        let lerp = arcLerp(value.absolutePos.y, this.absolutePos.y);
        Resource.play('fall-to');
        return new Promise((resolve, _reject) => {
            Animate.tween(value, target, 600, (x) => x, true, lerp).after(() => {
                this.stage.remove(value);
                this.stage.draw();
                window.setTimeout(() => {
                    super.performReduction(true).then((value) => {
                        resolve(value);
                    });
                }, 100);
            });
        });
    }
}

class LabeledChestVarExpr extends ChestVarExpr {
    constructor(name) {
        super(name);
        // See MissingTypedExpression#constructor
        this.equivalentClasses = [LabeledChestVarExpr];
        this.label = new TextExpr(name);
        this.label.color = 'white';
        this.holes.push(this.label);
    }

    open(preview, animate=true) {
    }

    close() {
    }

    drawInternal(ctx, pos, boundingSize) {
        this.holes[0].pos = {
            x: this.size.w / 2 - this.holes[0].absoluteSize.w / 2,
            y: this.size.h / 2,
        };

        super.drawInternal(ctx, pos, boundingSize);
    }
}

class AssignExpr extends Expression {
    constructor(variable, value) {
        super([]);
        if (variable && !(variable instanceof MissingExpression)) {
            this.addArg(variable);
        }
        else {
            let missing = new (ExprManager.getClass('_v'))(new VarExpr("_"));
            missing.acceptedClasses = [VarExpr];
            this.addArg(missing);
        }

        this.arrowLabel = new TextExpr("←");
        this.addArg(this.arrowLabel);

        if (value) {
            this.addArg(value);
        }
        else {
            this.addArg(new MissingExpression(new Expression()));
        }

        this._animating = false;
        this.animatedValue = value;
    }

    get variable() {
        return this.holes[0] instanceof MissingExpression ? null : this.holes[0];
    }

    set variable(expr) {
        this.holes[0] = expr;
    }

    get value() {
        return this.holes[2] instanceof MissingExpression ? null : this.holes[2];
    }

    set value(expr) {
        this.holes[2] = expr;
    }

    clone (parent = null) {
        let cln = super.clone(parent);
        cln.holes = [];
        this.holes.forEach((hole) => cln.holes.push(hole.clone()));
        return cln;
    }

    canReduce() {
        return this.value && this.variable && (this.value.canReduce() || this.value.isValue()) &&
            (this.variable instanceof VarExpr || this.variable instanceof VtableVarExpr
             || (this.variable instanceof TypeInTextExpr && this.variable.canReduce())
             || (this.variable instanceof ArrayObjectExpr && this.variable.canReduce())
             || (this.variable instanceof StringObjectExpr) && this.variable.canReduce());
        //return true;
    }

    reduce() {
        if (this.variable && this.value) {
            return this.value;
        }
        else {
            return this;
        }
    }

    animateJump() {
        return new Promise((resolve, reject) => {
            let target = {
                scale: { x: 0.3, y: 0.3 },
                pos: { x: this.variable.pos.x, y: this.variable.pos.y },
            };


            // quadratic lerp for pos.y - makes it "arc" towards the variable
            let lerp = arcLerp(this.value.pos.y, this.variable.pos.y);
            let parent = this.parent || this.stage;


            Animate.tween(this.value, target, 500, (x) => x, true, lerp).after(() => {
                Animate.poof(this);
                parent.swap(this, null);
                resolve();
            });
        });
    }

    setupAnimation() {
        this.variable._opened = true;

        // Prevent background on GraphicValueExpr from being drawn
        this.value.ignoreEvents = true;

        // Keep a copy of the original value before we start
        // messing with it, to update the environment afterwards
        //this._actualValue = this.value.clone();
    }

    finishReduction() {
        this.getEnvironment().update(this.variable.name, this._actualValue);
        this.stage.environmentDisplay.update();
        let binding = this.stage.environmentDisplay.getBinding(this.variable.name);
        Animate.blink(binding.getExpr());
        this.stage.getNodesWithClass(EnvironmentLambdaExpr).forEach((lambda) => {
            lambda.update();
            lambda.environmentDisplay.highlight(this.variable.name);
        });
        this.stage.update();
        this.stage.draw();
    }

    animateReduction() {
        this.setupAnimation();

        let environment = this.getEnvironment();
        let callback = null;
        if (environment == this.stage.environment && this.stage.environmentDisplay) {
            callback = this.stage.environmentDisplay.prepareAssign(this.variable.name);
        }

        let stage = this.stage;
        let afterAssign = new Promise((resolve, _reject) => {
            let finish = () => {
                // Need to save the stage sometimes - there's a race
                // condition where sometimes the expr is removed from
                // the stage before the assignment happens
                this.stage = stage;
                this.finishReduction();
                resolve();
            };

            if (callback) {
                callback.after(finish);
            }
            else {
                window.setTimeout(finish, 500);
            }
        });

        return Promise.all([afterAssign, this.animateJump()]);
    }

    performReduction(animated=true) {
        // The side-effect actually happens here. reduce() is called
        // multiple times as a 'canReduce', and we don't want any
        // update to happen multiple times.
        if (!this.canReduce()) {
            if (this.value && this.variable && !this.value.canReduce()) {
                // Try and play any animation anyways to hint at why
                // the value can't reduce.
                let result = this.value.reduceCompletely();

                if (result instanceof Promise) {
                    return result.then(() => {
                        return Promise.reject("AssignExpr: RHS cannot reduce");
                    });
                }
                return Promise.reject("AssignExpr: RHS cannot reduce");
            }
            return Promise.reject("AssignExpr: incomplete");
        }


        console.log("this.canReduce() == true!!");

        //The value is the right hand side
        //Reduce the right hand side first!!
        this.value = this.value.reduceCompletely().clone();

        if (this.value instanceof ArrayObjectExpr) {
            this.value = this.value.baseArray;
        }
        if (this.value instanceof StringObjectExpr) {
            this.value = this.value.baseStringValue;
        }
        this.animatedValue = this.value.clone();

        //this.variable.name = this.variable.holes[0].name;
        //console.log("This.Variable and This.Variable.name and This.Value");
        //console.log(this.variable);
        //console.log(this.variable.name);
        //console.log(this.value);

        if (this.variable instanceof ArrayObjectExpr) {
            /*let rhs = this.variable.baseArray.reduceCompletely();
            console.log("RHS!!!!!!");
            console.log(rhs);
            this.variable.name = this.variable.baseArray.name;
            if (this.variable.defaultMethodCall === "[..]") {
                console.log("method call is [..]");
                console.log("this.variable.name:");
                console.log(this.variable.name);
                console.log("This Value!!!!");
                console.log(this.value);
                this.variable.holes[2] = this.variable.holes[2].reduce();
                console.log("index: " + this.variable.holes[2].number);
                rhs._items[this.variable.holes[2].number] = this.value.clone();
                this.value = rhs.clone();
                console.log("after: rhs is:");
                console.log(rhs);
            }
            this.variable.name = this.variable.baseArray.name;*/
            let leftHandSide = this.variable.baseArray.reduceCompletely();
            this.variable.name = this.variable.baseArray.name;
            console.log("left Hand Side:");
            console.log(leftHandSide);
            if (this.variable.defaultMethodCall === "[..]") {
                console.log("this.variable");
                console.log(this.variable);
                let indexNum = this.variable.holes[2].reduceCompletely();
                if (!(indexNum instanceof NumberExpr)) {
                    return Promise.reject("invalid index!");
                }
                let index = this.variable.holes[2].reduceCompletely().number;
                //console.log("index: INDEX:");
                //console.log(index);
                //console.log("left hand side, should be bracket array expression and this.value");
                console.log(leftHandSide.items);
                console.log(this.value);
                leftHandSide._items[index] = this.value.clone();
                this.animatedValue = this.value.clone();
                this.value = leftHandSide.clone();
                //console.log("left hand side, should be bracket array expression!!");
                //console.log(this.value);
            }
        }

        if (this.variable instanceof StringObjectExpr) {
            let rhs = this.variable.baseStringValue.reduceCompletely();
            this.variable.name = this.variable.baseStringValue.name;
            console.log("variable name: " + this.variable.name);
            if (this.variable.defaultMethodCall === "[..]") {
                console.log("default method call is [..]");
                console.log(rhs);
                let originalString = rhs.value();
                console.log("ori string: " + originalString);
                let slicePosition = this.variable.holes[2].reduceCompletely().number;

                let indexNum = this.variable.holes[2].reduceCompletely();
                if (!(indexNum instanceof NumberExpr)) {
                    return Promise.reject("invalid index!");
                }

                console.log("slicePos: " + slicePosition);
                console.log("this.value.toString()" + this.value.toString());
                let newString = originalString.slice(0, slicePosition) + this.value.value()
                    + originalString.slice(slicePosition + 1);
                console.log("new String: " + newString);
                this.value = new StringValueExpr(newString);
            }
        }



        let starter = Promise.resolve();
        if (this.variable instanceof TypeInTextExpr) {
            starter = this.performSubReduction(this.variable, animated);
        }

        return starter.then(() => {
            if (!animated) {
                this.value.performReduction(false);
                let value = this.value.clone();
                this.getEnvironment().update(this.variable.name, value);
                this.stage.environmentDisplay.update();
                this.stage.draw();
                return Promise.resolve(null);
            }

            let promise;
            // Don't need as much delay if we're using
            // performSubReduction, since it pauses for us
            let delay = 200;
            if (this.value.isValue()) {
                promise = Promise.resolve(this.value);
                delay = 500;
            }
            else {
                promise = this.performSubReduction(this.value, true);
            }

            return promise.then((value) => {
                this._actualValue = this.value.clone();
                this.value = value;

            //return this.performSubReduction(this.value, true).then((value) => { // Shiliang's version. Not sure if better.
            //    this._actualValue = this.value.clone();
            //    this.value = this.animatedValue.clone();
                this.update();
                if (this.stage) this.stage.draw();
                return after(delay).then(() => this.animateReduction());
            }, () => {
                return Promise.reject();
            });
        });
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

    onmouseclick(pos) {
        if (this.parent) {
            this.parent.onmouseclick(pos);
            return;
        }

        this.performUserReduction();
    }

    toString() {
        let variable = this.variable ? this.variable.toString() : '_';
        let value = this.value ? this.value.toString() : '_';
        return `${this.locked ? '/' : ''}(assign ${variable} ${value})`;
    }
    toJavaScript() {
        let variable = this.variable ? this.variable.toString() : '_';
        let value = this.value ? this.value.toString() : '_';
        return `${variable} = ${value};`;
    }
}

class JumpingAssignExpr extends AssignExpr {
    constructor(variable, value) {
        super(variable, value);
    }

    animateReduction() {
        this.setupAnimation();

        let environment = this.getEnvironment();
        return this.animateJump().then(() => {
            return new Promise((resolve, _reject) => {
                if (environment != this.stage.environment) {
                    Animate.poof(this);
                    this.finishReduction();
                    parent.swap(this, null);
                    resolve();
                    return;
                }

                let chest = this.stage.environmentDisplay.getBinding(this.variable.name);
                let value = null;
                let targetPos = null;
                if (chest) {
                    targetPos = chest.absolutePos;
                    value = this.value.clone();
                    this.stage.environmentDisplay
                        .prepareAssign(this.variable.name);
                }
                else {
                    if (Object.keys(this.stage.environmentDisplay.bindings).length === 0) {
                        targetPos = clonePos(this.stage.environmentDisplay.absolutePos);
                        targetPos.y += this.stage.environmentDisplay.padding.inner;
                    }
                    else {
                        let contents = this.stage.environmentDisplay.bindings;
                        let maxY = 0;
                        let last;
                        for (let binding of Object.keys(contents)) {
                            binding = contents[binding];
                            let ap = binding.absolutePos;
                            if (ap.y > maxY) {
                                maxY = ap.y;
                                last = binding;
                            }
                        }
                        if (last) {
                            targetPos = addPos(last.absolutePos, {
                                x: 0,
                                y: last.absoluteSize.h + this.stage.environmentDisplay.padding.inner
                            });
                        }
                        else {
                            targetPos = clonePos(this.stage.environmentDisplay.absolutePos);
                            targetPos.y += this.stage.environmentDisplay.padding.inner;
                        }
                    }

                    value = new (ExprManager.getClass('reference_display'))(this.variable.name, this.value.clone());
                }
                this.value.scale = { x: 0, y: 0 };
                this.stage.add(value);
                value.pos = this.variable.absolutePos;
                value.scale = { x: 0.3, y: 0.3 };
                let target = {
                    pos: targetPos,
                    scale: { x: 0.7, y: 0.7 },
                };
                value.update();

                let lerp = arcLerp(value.absolutePos.y, targetPos.y, -150);
                Resource.play('fly-to');
                Animate.tween(value, target, 600, (x) => x, true, lerp).after(() => {
                    this.stage.remove(value);
                    this.finishReduction();
                    this.stage.draw();
                });
            });
        });
    }
}

class EqualsAssignExpr extends AssignExpr {
    constructor(variable, value) {
        super(variable, value);
        this.arrowLabel.text = "=";
    }
}

class VtableVarExpr extends ObjectExtensionExpr {
    constructor(name) {
        super(new LabeledVarExpr(name), {});

        this.removeChild(this.drawer);
        let drawer = new DynamicPulloutDrawer(this.size.w, this.size.h/2, 8, 32, this, this.drawer.onCellSelect);
        drawer.anchor = { x:0, y:0.32 };
        this.drawer = drawer;
        this.addChild(this.drawer);
        this.hasVtable = false;
    }

    canReduce() {
        return this.getEnvironment() && (this.parent || this.stage) && this.getEnvironment().lookup(this.name);
    }

    // Behave like a VarExpr
    open() {}
    close() {}
    get name() {
        return this.variable.name;
    }

    get variable() {
        return this.holes[0];
    }

    value() {
        if (this.variable && this.variable.canReduce()) {
            return this.getEnvironment().lookup(this.name);
        }
        return null;
    }
    isValue() {
        return false;
    }

    get objMethods() {
        let value = this.value();
        if (value) {
            return value.objMethods;
        }
        return {};
    }

    set objMethods(x) {

    }

    update() {
        super.update();
        this.updateVtable();
    }

    updateVtable() {
        let value = this.value();
        if (value) {
            if (value.color) {
                this.color = value.color;
                this.variable.color = value.color;
            }

            if (value instanceof ObjectExtensionExpr) {
                this.hasVtable = true;
            }
            else {
                this.hasVtable = false;
            }
        }
        else {
            this.hasVtable = false;
            if (this.variable.color) {
                this.color = this.variable.color;
            }
        }
    }

    performReduction() {
        if (!this.hasVtable || !this.subReduceMethod) {
            if (!this.variable.canReduce()) {
                // Play the ? animation
                this.variable.performReduction();
                return Promise.reject(`${this.name} is undefined.`);
            }
            else {
                let value = this.variable.reduce().clone();
                (this.parent || this.stage).swap(this, value);
                return Promise.resolve(value);
            }
        }
        else {
            let parent = this.parent || this.stage;
            let surrogate = this.createSurrogate();
            parent.swap(this, surrogate);
            surrogate.ignoreEvents = true;
            surrogate._reducing = true;
            surrogate.animateReducingStatus();
            return after(800).then(() => {
                let result = surrogate.reduce();
                parent.swap(surrogate, result);
                return result;
            });
        }
    }

    reduceCompletely() {
        if (!this.hasVtable || !this.subReduceMethod) {
            if (!this.variable.canReduce()) {
                return this;
            }
            else {
                let value = this.variable.reduce().clone();
                return value;
            }
        }
        else {
            return this.reduce();
        }
    }

    createSurrogate() {
        // Use a surrogate to do the actual reduction, so that (1) we
        // can use the actual object's reduce() method (this is
        // important for ArrayObjectExpr which does some
        // post-processing on the result) and (2) we can reduce()
        // without mutating ourselves
        let value = this.variable.reduce().clone();
        let surrogate = this;
        if (value instanceof ObjectExtensionExpr) {
            surrogate = value;
            value = value.holes[0];
        }

        surrogate.parent = this;  // In case the surrogate needs our environment
        surrogate.setExtension(this.subReduceText, this.subReduceMethod, this.methodArgs);
        return surrogate;
    }

    reduce() {
        if ((!this.hasVtable || !this.subReduceMethod) && !this.variable.canReduce()) {
            return this;
        }
        if (!this.hasVtable) return this.value();
        if (!this.subReduceMethod) return this.value();

        let surrogate = this.createSurrogate();
        return surrogate.reduce();
    }

    toString() {
        return this.variable.toString();
    }
    toJavaScript() {
        return this.variable.toJavaScript();
    }
}

class DynamicPulloutDrawer extends PulloutDrawer {
    constructor(x, y, w, h, parent, onCellSelect) {
        // Guard against null parent for cloning
        super(x, y, w, h, parent ? parent.objMethods : {}, onCellSelect);
        this.parent = parent;
    }

    open() {
        // Generate TextExpr for each property:
        let txts = [];
        let propertyTree = this.parent.objMethods;
        for (var key in propertyTree) {
            if (propertyTree.hasOwnProperty(key)) {
                let str = '.' + key;
                if (typeof propertyTree[key] === 'function' && propertyTree[key].length > 1) {
                    str += '(..)';
                } else {
                    str += '()';
                }
                let t = new TextExpr(str);
                t.ignoreEvents = true;
                t._reduceMethod = propertyTree[key];
                txts.push( t );
            }
        }
        this.txts = txts;

        super.open();
    }

    draw(ctx) {
        // Don't draw ourselves if the parent var does not have a
        // vtable or is nested
        if (this.parent && (!this.parent.hasVtable || this.parent.parent)) {
            return;
        }

        super.draw(ctx);
    }
}
