
/**
 *	Lambda Calc V3
 *  --------------
 * 	Foundation structures
 */

 const EMPTY_EXPR_WIDTH = 50;
 const DEFAULT_EXPR_HEIGHT = 50;
 const DEFAULT_CORNER_RAD = 20;
 var DEFAULT_RENDER_CTX = null;

/** A generic expression. Could be a lambda expression, could be an if statement, could be a for.
    In general, anything that takes in arguments and can reduce to some other value based on those arguments. */
class Expression extends RoundedRect {
    constructor(holes=[]) {
        super(0, 0, EMPTY_EXPR_WIDTH, DEFAULT_EXPR_HEIGHT, DEFAULT_CORNER_RAD);

        this.holes = holes;
        this.padding = { left:10, inner:10, right:10 };
        this._size = { w:EMPTY_EXPR_WIDTH, h:DEFAULT_EXPR_HEIGHT };

        if (this.holes) {
            var _this = this;
            this.holes.forEach((hole) => {
                _this.addChild(hole);
            });
        }
    }
    equals(otherNode) {
        if (otherNode instanceof Expression && this.holes.length === otherNode.holes.length) {
            if (this.holes.length === 0)
                return this.value === otherNode.value;
            else {
                var b = true;
                for(let i = 0; i < this.holes.length; i++)
                    b &= this.holes[i].value === otherNode[i].value;
                return b;
            }
        }
        return false;
    }
    clone(parent=null) {
        var c = super.clone(parent);
        var children = c.children;
        c.children = [];
        c.holes = [];
        c.stroke = null;
        c.toolbox = null;
        children.forEach((child) => c.addArg(child));
        return c;
    }

    // Makes all inner expressions undraggable, 'binding' them permanently.
    bindSubexpressions() {
        this.holes.forEach((hole) => {
            if (hole instanceof Expression && !(hole instanceof MissingExpression)) {
                if (hole instanceof VarExpr || hole instanceof BooleanPrimitive)
                    hole.lock();
                hole.bindSubexpressions();
            }
        });
    }

    addArg(arg) {
        this.holes.push(arg);
        this.addChild(arg);
    }

    removeArg(arg) {
        var idx = this.holes.indexOf(arg);
        if (idx > -1) {
            this.holes.splice(idx, 1); // remove 1 elem @ idx
            this.update();
            //this.stage.draw();
        } else console.error('@ removeArg: Could not find arg ', arg, ' in expression.');
    }

    swap(arg, anotherArg) {
        if (!arg || anotherArg === undefined) return;
        var i = this.holes.indexOf(arg);
        if (i > -1) {

            if (anotherArg === null) {
                arg.detach();
                this.holes[i]._size = { w:50, h:50 };
                arg.stage.remove(arg);
            } else {

                this.holes.splice(i, 1, anotherArg);

                if (anotherArg) {
                    anotherArg.pos = arg.pos;
                    anotherArg.dragging = false;
                    anotherArg.parent = this;
                    anotherArg.scale = { x:0.85, y:0.85 };
                    anotherArg.onmouseleave();
                    anotherArg.onmouseup();
                }

                arg.parent = null;
            }
            this.update();
        }
        else console.log('Cannot swap: Argument ', arg, ' not found in parent.');
    }

    get holeCount() {
        return this.holes ? this.holes.length : 0;
    }

    // Sizes to match its children.
    get size() {

        var padding = this.padding;
        var width = 0;
        var sizes = this.getHoleSizes();
        var scale_x = this.scale.x;

        if (sizes.length === 0) return { w:this._size.w, h:this._size.h };

        sizes.forEach((s) => {
            width += s.w + padding.inner;
        });
        width += padding.right; // the end

        //if(this.color === 'red') width *= 0.8;
        return { w:width, h:DEFAULT_EXPR_HEIGHT };
    }

    getHoleSizes() {
        if (!this.holes || this.holes.length === 0) return [];
        var sizes = [];
        this.holes.forEach((expr) => {
            var size = expr ? expr.size : {w:EMPTY_EXPR_WIDTH, h:DEFAULT_EXPR_HEIGHT};
            size.w *= expr.scale.x;
            sizes.push(size);
        });
        return sizes;
    }

    update() {
        var padding = this.padding.inner;
        var x = this.padding.left;
        var y = this.size.h / 2.0 + (this.exprOffsetY ? this.exprOffsetY : 0);
        var _this = this;
        this.children = [];
        this.holes.forEach((expr) => _this.addChild(expr));
        this.holes.forEach((expr) => { // Update hole expression positions.
            expr.anchor = { x:0, y:0.5 };
            expr.pos = { x:x, y:y };
            expr.scale = { x:0.85, y:0.85 };
            expr.update();
            x += expr.size.w * expr.scale.x + padding;
        });
        this.children = this.holes; // for rendering
    }

    // Apply arguments to expression
    apply(args) {
        // ... //
    }

    // Apply a single argument at specified arg index
    applyAtIndex(idx, arg) {
        // ... //
    }

    // Reduce this expression to another.
    // * Returns the newly built expression. Leaves this expression unchanged.
    reduce(options=undefined) {
        return this;
    }

    // * Swaps this expression for its reduction (if one exists) in the expression hierarchy.
    performReduction() {
        var reduced_expr = this.reduce();
        if (reduced_expr !== undefined && reduced_expr != this) { // Only swap if reduction returns something > null.

            console.warn('performReduction with ', this, reduced_expr);

            if (!this.stage) return;

            this.stage.saveState();
            Logger.log('state-save', this.stage.toString());

            // Log the reduction.
            let reduced_expr_str;
            if (reduced_expr === null)
                reduced_expr_str = '()';
            else if (Array.isArray(reduced_expr))
                reduced_expr_str = reduced_expr.reduce((prev,curr) => (prev + curr.toString() + ' '), '').trim();
            else reduced_expr_str = reduced_expr.toString();
            Logger.log('reduction', { 'before':this.toString(), 'after':reduced_expr_str });

            var parent = this.parent ? this.parent : this.stage;
            if (reduced_expr) reduced_expr.ignoreEvents = this.ignoreEvents; // the new expression should inherit whatever this expression was capable of as input
            parent.swap(this, reduced_expr);

            // Check if parent expression is now reducable.
            if (reduced_expr && reduced_expr.parent) {
                var try_reduce = reduced_expr.parent.reduceCompletely();
                if (try_reduce != reduced_expr.parent && try_reduce !== null) {
                    Animate.blink(reduced_expr.parent, 400, [0,1,0], 1);
                }
            }

            if (reduced_expr)
                reduced_expr.update();

            return reduced_expr;
        }
    }
    reduceCompletely() { // Try to reduce this expression and its subexpressions as completely as possible.
        var e = this;
        var prev_holes = e.holes;
        //e.parent = this.parent;
        if (e.children.length === 0) return e.reduce();
        else {
            e.holes = e.holes.map((hole) => {
                if (hole instanceof Expression)
                    return hole.reduceCompletely();
                else
                    return hole;
            });
            //console.warn('Reduced: ', e, e.holes);
            e.children = [];
            e.holes.forEach((hole) => e.addChild(hole));
            var red = e.reduce();
            e.children = [];
            e.holes = prev_holes;
            e.holes.forEach((hole) => e.addChild(hole));
            return red;
        }
    }

    detach() {
        if (this.parent) {
            var ghost_expr;
            if (this.droppedInClass)
                ghost_expr = new this.droppedInClass(this);
            else
                ghost_expr = new MissingExpression(this);

            let stage = this.parent.stage;
            let beforeState = stage.toString();
            let detachedExp = this.toString();
            let parent = this.parent;

            parent.swap(this, ghost_expr);

            this.parent = null;
            stage.add(this);
            stage.bringToFront(this);

            let afterState = stage.toString();
            Logger.log('detached-expr', {'before':beforeState, 'after':afterState, 'item':detachedExp });
            stage.saveState();
            Logger.log('state-save', afterState);

            this.shell = ghost_expr;
        }
        if (this.toolbox) {

            if (this.stage) {
                this.stage.saveState();
                Logger.log('state-save', this.stage.toString());
            }

            this.toolbox.removeExpression(this); // remove this expression from the toolbox
            Logger.log('toolbox-dragout', this.toString());
        }
    }

    lock() {
        this.shadowOffset = 0;
        this.ignoreEvents = true;
        this.locked = true;
    }
    unlock() {
        this.shadowOffset = 2;
        this.ignoreEvents = false;
        this.locked = false;
    }
    lockSubexpressions(filterFunc=null) {
        this.holes.forEach((child) => {
            if (child instanceof Expression) {
                if (!filterFunc || filterFunc(child))
                    child.lock();
                child.lockSubexpressions(filterFunc);
            }
        });
    }
    unlockSubexpressions(filterFunc=null) {
        this.holes.forEach((child) => {
            if (child instanceof Expression) {
                if (!filterFunc || filterFunc(child))
                    child.unlock();
                child.unlockSubexpressions(filterFunc);
            }
        });
    }

    hits(pos, options=undefined) {
        if (this.locked) return this.hitsChild(pos, options);
        else             return super.hits(pos, options);
    }

    onmousedrag(pos) {
        if (this.ignoreEvents) return;

        super.onmousedrag(pos);

        const rightX = pos.x + this.absoluteSize.w;
        //if (rightX < GLOBAL_DEFAULT_SCREENSIZE.width) { // Clipping to edges
            this.pos = pos;
        //} else this.pos = { x:GLOBAL_DEFAULT_SCREENSIZE.width - this.absoluteSize.w, y:pos.y };

        if (!this.dragging) {
            this.detach();
            this.posBeforeDrag = this.absolutePos;
            this.stage.bringToFront(this);
            this.dragging = true;
        }
    }
    onmouseup(pos) {
        if (this.dragging && this.shell) {
            if(!this.parent) this.scale = { x:1, y:1 };
            this.shell = null;

            Logger.log('detach-commit', this.toString());

            //this.shell.stage.remove(this);
            //this.shell.stage = null;
            //this.shell.parent.swap(this.shell, this); // put it back
            //this.shell = null;
        }
        if (this.dragging) {
            if (this.toolbox && !this.toolbox.hits(pos)) {
                this.toolbox = null;

                Logger.log('toolbox-remove', this.toString());

                if (this.stage) {
                    this.stage.saveState();
                    Logger.log('state-save', this.stage.toString());
                }
            }

            Logger.log('moved', {'item':this.toString(), 'prevPos':JSON.stringify(this.posBeforeDrag), 'newPos':JSON.stringify(this.pos)});
        }
        //if (this.toolbox) this.toolbox = null;
        this.dragging = false;
    }

    // The value (if any) this expression represents.
    value() { return undefined; }
    toString() {
        if (this.holes.length === 1) return this.holes[0].toString();
        let s = '(';
        for (let i = 0; i < this.holes.length; i++) {
            if (i > 0) s += ' ';
            s += this.holes[i].toString();
        }
        return s + ')';
    }
}

class MissingExpression extends Expression {
    constructor(expr_to_miss) {
        super([]);
        if (!expr_to_miss) expr_to_miss = new Expression();
        this.shadowOffset = -1; // inner
        this.color = '#555555';
        this._size = { w:expr_to_miss.size.w, h:expr_to_miss.size.h };
        this.ghost = expr_to_miss;
    }
    getClass() { return MissingExpression; }
    onmousedrag(pos) { } // disable drag
    ondropenter(node, pos) {
        this.onmouseenter(pos);
    }
    ondropexit(node, pos) {
        this.onmouseleave(pos);
    }
    ondropped(node, pos) {
        super.ondropped(node, pos);
        if (node.dragging) { // Reattach node.

            // Should not be able to stick lambdas in MissingExpression holes (exception of Map)
            if (node instanceof LambdaExpr && !(this.parent instanceof MapFunc))
                return;

            let stage = this.stage;
            let beforeState = stage.toString();
            let droppedExp = node.toString();

            Resource.play('pop');
            node.stage.remove(node);
            node.droppedInClass = this.getClass();
            this.parent.swap(this, node); // put it back

            let afterState = stage.toString();
            Logger.log('placed-expr', {'before':beforeState, 'after':afterState, 'item':droppedExp });

            stage.saveState();
            Logger.log('state-save', afterState);

            // Blink red if total reduction is not possible with this config.
            /*var try_reduce = node.parent.reduceCompletely();
            if (try_reduce == node.parent || try_reduce === null) {
                Animate.blink(node.parent, 400, [1,0,0]);
            }*/

            // Blink blue if reduction is possible with this config.
            var try_reduce = node.parent.reduceCompletely();
            if (try_reduce != node.parent && try_reduce !== undefined) {
                Animate.blink(node.parent, 1000, [1,1,0], 1);
            }
        }
    }

    toString() { return '_'; }
}

class MissingTypedExpression extends MissingExpression {
    getClass() { return MissingTypedExpression; }

    // Returns TRUE if this hole accepts the given expression.
    accepts(expr) {
        for (let c of this.acceptedClasses) {
            if (expr instanceof c) return true; }
    }
    ondropenter(node, pos) {
        if (this.accepts(node))
            super.ondropenter(node, pos);
    }
    ondropexit(node, pos) {
        if (this.accepts(node))
            super.ondropexit(node, pos);
    }
    ondropped(node, pos) {
        if (this.accepts(node))
            super.ondropped(node, pos);
    }

    drawInternal(pos, boundingSize) {
        pos.x -= boundingSize.w / 1.2 - boundingSize.w;
        pos.y -= boundingSize.h / 1.14 - boundingSize.h; // aesthetic resizing
        boundingSize.w /= 1.2;
        this.graphicNode.ctx = this.ctx;
        this.graphicNode.stroke = this.stroke;
        this.graphicNode.color = this.color;
        this.graphicNode.shadowOffset = this.shadowOffset;
        this.graphicNode.drawInternal(pos, boundingSize);
    }

    toString() { return '_'; }
}

class MissingBagExpression extends MissingTypedExpression {
    constructor(expr_to_miss) {
        super(expr_to_miss);
        this._size = { w:50, h:50 };
        this.graphicNode = new Bag(0, 0, 22, false);
        this.acceptedClasses = [ BagExpr, PutExpr ];
    }
    getClass() { return MissingBagExpression; }

    toString() { return '__'; }
}

class MissingBooleanExpression extends MissingTypedExpression {
    constructor(expr_to_miss) {
        super(expr_to_miss);
        this._size = { w:80, h:50 };
        this.color = "#0c2c52";

        this.graphicNode = new HexaRect(0, 0, 44, 44);

        this.acceptedClasses = [ BooleanPrimitive, CompareExpr ];
    }
    getClass() { return MissingBooleanExpression; }

    drawInternal(pos, boundingSize) {
        this.graphicNode.ctx = this.ctx;
        this.graphicNode.stroke = this.stroke;
        this.graphicNode.color = this.color;
        this.graphicNode.shadowOffset = this.shadowOffset;
        this.graphicNode.drawInternal(pos, boundingSize);
    }

    toString() { return '_b'; }
}
class MissingKeyExpression extends MissingBooleanExpression {
    constructor(expr_to_miss) {
        super(expr_to_miss);

        var keyhole = new ImageRect(0, 0, 26/2, 42/2, 'lock-keyhole');
        this.graphicNode.addChild(keyhole);

    }
    drawInternal(pos, boundingSize) {
        super.drawInternal(pos, boundingSize);

        // Draw keyhole.
        let sz = this.graphicNode.children[0].size;
        this.graphicNode.children[0].drawInternal( addPos(pos, { x:boundingSize.w/2.0-sz.w/2, y:boundingSize.h/2.0-sz.h/2 }), sz);
    }
}

class TextExpr extends Expression {
    constructor(txt, font='Consolas', fontSize=35) {
        super();
        this.text = txt;
        this.font = font;
        this.fontSize = fontSize; // in pixels
        this.color = 'black';
    }
    get size() {
        var ctx = this.ctx || GLOBAL_DEFAULT_CTX;
        if (!ctx || !this.text || this.text.length === 0) {
            console.error('Cannot size text: No context.');
            return { w:4, h:this.fontSize };
        }
        else if (this.manualWidth)
            return { w:this.manualWidth, h:DEFAULT_EXPR_HEIGHT };
        ctx.font = this.contextFont;
        var measure = ctx.measureText(this.text);
        return { w:measure.width, h:DEFAULT_EXPR_HEIGHT };
    }
    get contextFont() {
        return this.fontSize + 'px ' + this.font;
    }
    drawInternal(pos, boundingSize) {
        var ctx = this.ctx;
        var abs_scale = this.absoluteScale;
        ctx.save();
        ctx.font = this.contextFont;
        ctx.scale(abs_scale.x, abs_scale.y);
        ctx.fillStyle = this.color;
        ctx.fillText(this.text, pos.x / abs_scale.x, pos.y / abs_scale.y + 2.2 * this.fontSize * this.anchor.y);
        ctx.restore();
    }
    hits(pos, options) { return false; } // disable mouse events
    value() { return this.text; }
}

class BooleanPrimitive extends Expression {
    constructor(name) {
        super();
        var text = new TextExpr(name);
        text.pos = { x:0, y:0 };
        text.anchor = { x:-0.1, y:1.5 }; // TODO: Fix this bug.
        this.color = "HotPink";
        this.addArg(text);
    }
    reduce() { return this; }
    reduceCompletely() { return this; }

    drawInternal(pos, boundingSize) {
        this.ctx.fillStyle = 'black';
        setStrokeStyle(this.ctx, this.stroke);
        if (this.shadowOffset !== 0) {
            hexaRect(this.ctx,
                      pos.x, pos.y+this.shadowOffset,
                      boundingSize.w, boundingSize.h,
                      true, this.stroke ? true : false,
                      this.stroke ? this.stroke.opacity : null);
        }
        this.ctx.fillStyle = this.color;
        hexaRect(this.ctx,
                  pos.x, pos.y,
                  boundingSize.w, boundingSize.h,
                  true, this.stroke ? true : false,
                  this.stroke ? this.stroke.opacity : null);
    }
}
class TrueExpr extends BooleanPrimitive {
    constructor() {
        super('true');
    }
    value() { return true; }
    toString() { return 'true'; }
}
class FalseExpr extends BooleanPrimitive {
    constructor() {
        super('false');
    }
    value() { return false; }
    toString() { return 'false'; }
}
class EmptyExpr extends Expression {
    value() { return null; }
}

// An if statement.
class IfStatement extends Expression {
    constructor(cond, branch) {
        var if_text = new TextExpr('if');
        var then_text = new TextExpr('then');
        if_text.color = 'black';
        then_text.color = 'black';
        super([if_text, cond, then_text, branch]);
        this.color = 'LightBlue';
    }

    get cond() { return this.holes[1]; }
    get branch() { return this.holes[3]; }
    get emptyExpr() { return null; }
    get constructorArgs() { return [this.cond.clone(), this.branch.clone()]; }

    onmouseclick(pos) {
        this.performReduction();
    }

    reduce() {
        if (!this.cond || !this.branch) return this; // irreducible
        var cond_val = this.cond.value();
        if (cond_val === true && this.branch instanceof MissingExpression) return this; // true can't reduce to nothing but false can.
        if (cond_val === true)          return this.branch; // return the inner branch
        else if (cond_val === false)    return this.emptyExpr; // disappear
        else                            return this; // something's not reducable...
    }

    playJimmyAnimation(onComplete) {
        Resource.play('key-jiggle');
        Animate.wait(Resource.getAudio('key-jiggle').duration * 1000).after(onComplete);
    }
    playUnlockAnimation(onComplete) {
        Resource.play('key-unlock');
        Animate.wait(860).after(onComplete);
    }

    performReduction() {
        var reduction = this.reduce();
        if (reduction != this) {

            let stage = this.stage;
            let afterEffects = () => {
                super.performReduction();
                stage.update();
                stage.draw();
            };

            if (reduction === null)
                this.playJimmyAnimation(afterEffects);
            else
                this.playUnlockAnimation(afterEffects);


            //var shatter = new ShatterExpressionEffect(this);
            //shatter.run(stage, (() => {
            //    super.performReduction();
            //}).bind(this));
        }
    }

    value() {
        return undefined;
    }
    toString() {
        return '(if ' + this.cond.toString() + ' ' + this.branch.toString() + ')';
    }
}

// A simpler graphical form of if.
class ArrowIfStatement extends IfStatement {
    constructor(cond, branch) {
        super(cond, branch);
        var arrow = new TextExpr('→');
        arrow.color = 'black';
        this.holes = [ cond, arrow, branch ];
    }
    get cond() { return this.holes[0]; }
    get branch() { return this.holes[2]; }
}

class IfElseStatement extends IfStatement {
    constructor(cond, branch, elseBranch) {
        super(cond, branch);
        var txt = new TextExpr('else');
        txt.color = 'black';
        this.addArg(txt);
        this.addArg(elseBranch);
    }
    get elseBranch() { return this.holes[4]; }
    get constructorArgs() { return [this.cond.clone(), this.branch.clone(), this.elseBranch.clone()]; }

    reduce() {
        if (!this.cond || !this.branch || !this.elseBranch) return this; // irreducible
        var cond_val = this.cond.value();
        console.log(this.cond, cond_val);
        if (cond_val === true)          return this.branch; // return the inner branch
        else if (cond_val === false)    return this.elseBranch; // disappear
        else                            return this; // something's not reducable...
    }

    toString() {
        return '(if ' + this.cond.toString() + ' ' + this.branch.toString() + ' ' + this.elseBranch.toString() + ')';
    }
}

// Lock and key metaphor for if.
class LockIfStatement extends IfStatement {
    constructor(cond, branch) {
        super(cond, branch);
        this.holes = [ cond, branch ];

        var bluebg = new RoundedRect(0, 0, 25, 25);
        bluebg.color = "#2484f5";
        this._bg = bluebg;

        var top = new ImageRect(0, 0, 112/2.0, 74/2.0, 'lock-top-locked');
        this._top = top;

        var shinewrap = new PatternRect(0, 0, 24, 100, 'shinewrap');
        shinewrap.opacity = 0.8;
        this._shinewrap = shinewrap;
    }
    get cond() { return this.holes[0]; }
    get branch() { return this.holes[1]; }

    playJimmyAnimation(onComplete) {
        Resource.play('key-jiggle');
        Animate.wait(Resource.getAudio('key-jiggle').duration * 1000).after(onComplete);
        if(this.stage) this.stage.draw();

        let pos = this.pos;
        Animate.tween(this, { 'pos':{x:pos.x+16, y:pos.y} }, 100 ).after(() => {
            Animate.tween(this, { 'pos':{x:pos.x-16, y:pos.y} }, 100 ).after(() => {
                Animate.tween(this, { 'pos':{x:pos.x, y:pos.y} }, 100 ).after(() => {
                    Animate.wait(300).after(() => {
                        this.opacity = 1.0;
                        this._shinewrap.opacity = 0;
                        Animate.tween(this, { 'opacity':0 }, 100 ).after(() => {
                            this.opacity = 0;
                            if (this.stage) {
                                let stage = this.stage;
                                stage.remove(this);
                                stage.draw();
                            }
                        });
                    });
                });
            });
        });
    }
    playUnlockAnimation(onComplete) {
        Resource.play('key-unlock');
        Animate.wait(600).after(onComplete);

        Animate.wait(200).after(() => {
            this._top.image = 'lock-top-unlocked';
            this._top.size = { w:this._top.size.w, h:128/2 };
            this._shinewrap.opacity = 0;
            if(this.stage) this.stage.draw();
        });
    }

    drawInternal(pos, boundingSize) {
        super.drawInternal(pos, boundingSize);

        let ctx = this.ctx;
        let condsz = this.cond.absoluteSize;

        let bgsz = { w:condsz.w+14, h:condsz.h+16 };
        let bgpos = addPos(pos, {x:-(bgsz.w-condsz.w)/2.0+this.cond.pos.x, y:-(bgsz.h-condsz.h)/2.0+3});
        let topsz = this._top.size;
        let wrapsz = { w:boundingSize.w - condsz.w, h:boundingSize.h };
        let wrappos = { x:bgpos.x+bgsz.w, y:pos.y };

        this._shinewrap.size = wrapsz;
        this._shinewrap.pos = wrappos;

        this._bg.ctx = ctx;
        this._bg.stroke = this.stroke;
        this._top.ctx = ctx;

        this._bg.drawInternal( bgpos, bgsz );
        this._top.drawInternal( addPos(bgpos, {x:bgsz.w / 2.0 - topsz.w/2.0, y:-topsz.h } ), topsz );
    }
    drawInternalAfterChildren(pos, boundingSize) {
        let ctx = this.ctx;
        this._shinewrap.ctx = ctx;

        if ((!this.opacity || this.opacity > 0) && this._shinewrap.opacity > 0 && !(this.branch instanceof MissingExpression)) {
            ctx.save();
            roundRect(ctx,
                      pos.x, pos.y,
                      boundingSize.w, boundingSize.h,
                      this.radius*this.absoluteScale.x, false, false);
            ctx.clip();

            ctx.globalCompositeOperation = "screen";
            ctx.globalAlpha = this._shinewrap.opacity;
            this._shinewrap.drawInternal( this._shinewrap.pos, this._shinewrap.size );
            ctx.restore();
        }
    }
}
class InlineLockIfStatement extends IfStatement {
    constructor(cond, branch) {
        super(cond, branch);
        var lock = new ImageExpr(0, 0, 56, 56, 'lock-icon');
        lock.lock();
        this.holes = [ cond, lock, branch ];
    }
    get cond() { return this.holes[0]; }
    get branch() { return this.holes[2]; }
    playJimmyAnimation(onComplete) {
        super.playJimmyAnimation(onComplete);

        this.opacity = 1.0;
        Animate.tween(this, { 'opacity':0 }, 100 ).after(() => {
            this.opacity = 0;
            if (this.stage) {
                let stage = this.stage;
                stage.remove(this);
                stage.draw();
            }
        });
    }
    playUnlockAnimation(onComplete) {
        this.holes[1].image = 'lock-icon-unlocked';
        super.playUnlockAnimation(onComplete);
    }
}
class KeyTrueExpr extends TrueExpr {
    constructor() {
        super();
        this.holes = [];
        this.children = [];

        var key = new ImageExpr(0, 0, 56, 28, 'key-icon');
        key.lock();
        this.addArg(key);
        this.graphicNode = key;
    }
    onmouseclick(pos) {

        // Clicking on the key in a lock (if statement) will act as if they clicked the if statement.
        if (this.parent && this.parent instanceof IfStatement && this.parent.cond == this)
            this.parent.onmouseclick(pos);
        else
            super.onmouseclick(pos);
    }
}
class KeyFalseExpr extends FalseExpr {
    constructor() {
        super();
        this.holes = [];
        this.children = [];

        var key = new ImageExpr(0, 0, 56, 34, 'broken-key-icon');
        key.lock();
        this.addArg(key);
        this.graphicNode = key;
    }
    onmouseclick(pos) {

        // Clicking on the key in a lock (if statement) will act as if they clicked the if statement.
        if (this.parent && this.parent instanceof IfStatement && this.parent.cond == this)
            this.parent.onmouseclick(pos);
        else
            super.onmouseclick(pos);
    }
}

// A boolean compare function like ==, !=, >, >=, <=, <.
class CompareExpr extends Expression {
    static operatorMap() {
        return { '==':'is', '!=':'is not' };
    }
    static textForFuncName(fname) {
        var map = CompareExpr.operatorMap();
        if (fname in map) return map[fname];
        else              return fname;
    }
    constructor(b1, b2, compareFuncName='==') {
        var compare_text = new TextExpr(CompareExpr.textForFuncName(compareFuncName));
        compare_text.color = 'black';
        super([b1, compare_text, b2]);
        this.funcName = compareFuncName;
        this.color = "HotPink";
        this.padding = { left:20, inner:10, right:30 };
    }
    get constructorArgs() { return [this.holes[0].clone(), this.holes[2].clone(), this.funcName]; }
    get leftExpr() { return this.holes[0]; }
    get rightExpr() { return this.holes[2]; }
    onmouseclick(pos) {
        console.log('Expressions are equal: ', this.compare());
        this.performReduction();
    }
    reduce() {
        var cmp = this.compare();
        if (cmp === true)       return new (ExprManager.getClass('true'))();
        else if (cmp === false) return new (ExprManager.getClass('false'))();
        else                    return this;
    }
    performReduction(animated=true) {
        if (this.reduce() != this) {
            if (animated) {
                var shatter = new ShatterExpressionEffect(this);
                shatter.run(stage, (() => {
                    this.ignoreEvents = false;
                    super.performReduction();
                }).bind(this));
                this.ignoreEvents = true;
            }
            else super.performReduction();
        }
    }
    compare() {
        if (this.funcName === '==') {
            var lval = this.leftExpr.value();
            var rval = this.rightExpr.value();

            // Variables that are equal reduce to TRUE, regardless of whether they are bound!!
            if (!lval && !rval && this.leftExpr instanceof LambdaVarExpr && this.rightExpr instanceof LambdaVarExpr)
                return this.leftExpr.name === this.rightExpr.name;

            //console.log('leftexpr', this.leftExpr.constructor.name, this.leftExpr instanceof LambdaVarExpr, lval);
            //console.log('rightexpr', this.rightExpr.constructor.name, rval);

            if (lval === undefined || rval === undefined)
                return undefined;
            else if (Array.isArray(lval) && Array.isArray(rval))
                return setCompare(lval, rval, (e, f) => (e.toString() === f.toString()));
            else
                return lval === rval;
        } else if (this.funcName === '!=') {
            return this.leftExpr.value() !== this.rightExpr.value();
        } else {
            console.warn('Compare function "' + this.funcName + '" not implemented.');
            return false;
        }
    }

    drawInternal(pos, boundingSize) {
        this.ctx.fillStyle = 'black';
        setStrokeStyle(this.ctx, this.stroke);
        if (this.shadowOffset !== 0) {
            hexaRect(this.ctx,
                      pos.x, pos.y+this.shadowOffset,
                      boundingSize.w, boundingSize.h,
                      true, this.stroke ? true : false,
                      this.stroke ? this.stroke.opacity : null);
        }
        this.ctx.fillStyle = this.color;
        hexaRect(this.ctx,
                  pos.x, pos.y,
                  boundingSize.w, boundingSize.h,
                  true, this.stroke ? true : false,
                  this.stroke ? this.stroke.opacity : null);
    }

    toString() {
        return '(' + this.funcName + ' ' + this.leftExpr.toString() + ' ' + this.rightExpr.toString() + ')';
    }
}

class FadedCompareExpr extends CompareExpr {
    constructor(b1, b2, compareFuncName='==') {
        super(b1, b2, compareFuncName);
        this.holes[1].text = compareFuncName;
    }
}

class MirrorCompareExpr extends CompareExpr {
    constructor(b1, b2, compareFuncName='==') {
        super(b1, b2, compareFuncName);

        this.children = [];
        this.holes = [];
        this.padding = { left:20, inner:0, right:40 };

        this.addArg(b1);

        // Mirror graphic
        var mirror = new MirrorExpr(0, 0, 86, 86);
        mirror.exprInMirror = b2.clone();
        this.addArg(mirror);

        this.addArg(b2);
    }
    get constructorArgs() { return [this.holes[0].clone(), this.holes[2].clone(), this.funcName]; }
    get leftExpr() { return this.holes[0]; }
    get mirror() { return this.holes[1]; }
    get rightExpr() { return this.holes[2]; }
    expressionToMirror() {
        let isMirrorable = (expr) => (!(!expr || expr instanceof LambdaVarExpr || expr instanceof MissingExpression));
        if (isMirrorable(this.leftExpr))
            return this.leftExpr.clone();
        else if (isMirrorable(this.rightExpr))
            return this.rightExpr.clone();
        else
            return null;
    }
    update() {
        super.update();
        if (this.reduce() != this) {
            this.mirror.exprInMirror = new (ExprManager.getClass('true'))().graphicNode;
            this.mirror.broken = !this.compare();
        } else {
            this.mirror.exprInMirror = this.expressionToMirror();
            this.mirror.broken = false;
        }
    }

    // Animation effects
    performReduction() {
        if (!this.isReducing && this.reduce() != this) {
            var stage = this.stage;
            var shatter = new MirrorShatterEffect(this.mirror);
            shatter.run(stage, (() => {
                this.ignoreEvents = false;
                super.performReduction(false);
            }).bind(this));
            this.ignoreEvents = true;
            this.isReducing = true;
        }
    }
}

// Integers
class NumberExpr extends Expression {
    constructor(num) {
        super([ new DiceNumber(num) ]);
        this.number = num;
        this.color = 'Ivory';
        this.highlightColor = 'OrangeRed';
    }
    get constructorArgs() {
        return [this.number];
    }
    value() {
        return this.number;
    }
    toString() {
        return this.number.toString();
    }
}

// Draws the circles for a dice number inside its boundary.
class DiceNumber extends Rect {
    static drawPositionsFor(num) {
        let L = 0.15;
        let T = L;
        let R = 1.0 - L;
        let B = R;
        let M = 0.5;
        let map = {
            0: [],
            1: [ { x: M, y: M} ],
            2: [ { x: L, y: T }, { x: R, y: B } ],
            3: [ { x: R, y: T}, { x: M, y: M}, { x: L, y: B } ],
            4: [ { x: L, y: T}, { x: R, y: T}, { x: R, y: B }, { x: L, y: B } ],
            5: [ { x: L, y: T}, { x: R, y: T}, { x: R, y: B }, { x: L, y: B }, { x: M, y: M } ],
            6: [ { x: L, y: T}, { x: R, y: T}, { x: R, y: M }, { x: R, y: B }, { x: L, y: B }, { x: L, y: M } ]
        };
        if (num in map) return map[num];
        else {
            console.error('Dice pos array does not exist for number ' + num + '.');
            return [];
        }
    }
    constructor(num, radius=6) {
        super(0, 0, 44, 44);
        this.number = num;
        this.circlePos = DiceNumber.drawPositionsFor(num);
        this.radius = radius;
        this.color = 'black';
    }
    get constructorArgs() {
        return [ this.number, this.radius ];
    }
    hits(pos, options) { return false; }
    drawInternal(pos, boundingSize) {

        if (this.circlePos && this.circlePos.length > 0) {

            let ctx = this.ctx;
            let rad = this.radius * boundingSize.w / this.size.w;
            let fill = this.color;
            let stroke = this.stroke;
            this.circlePos.forEach((relpos) => {
                let drawpos = { x: pos.x + boundingSize.w * relpos.x - rad, y: pos.y + boundingSize.h * relpos.y - rad };
                drawCircle(ctx, drawpos.x, drawpos.y, rad, fill, stroke);
            });

        }
    }
}

// Wrapper class to make arbitrary nodes into draggable expressions.
class VarExpr extends Expression { }
class GraphicVarExpr extends VarExpr {
    constructor(graphic_node) {
        super([graphic_node]);
        this.color = 'gold';
    }

    get color() { return super.color; }
    set color(clr) {
        this.holes[0].color = clr;
    }
    get delegateToInner() {
        return this.ignoreEvents || (!this.parent) || !(this.parent instanceof Expression);
    }
    get graphicNode() { return this.holes[0]; }
    reduceCompletely() { return this; }
    reduce() { return this; }

    //get size() { return this.holes[0].size; }
    hits(pos, options) {
        if(this.ignoreEvents) return null;
        if(this.holes[0].hits(pos, options)) return this;
        else return null;
    }
    onmouseenter(pos) {
        if (this.delegateToInner) this.holes[0].onmouseenter(pos);
        else super.onmouseenter(pos);
    }
    onmouseleave(pos) {
        if (!this.delegateToInner) super.onmouseleave(pos);
        this.holes[0].onmouseleave(pos);
    }
    drawInternal(pos, boundingSize) {
        if (!this.delegateToInner) {
            this._color = '#777';
            super.drawInternal(pos, boundingSize);
        }
    }
    value() { return this.holes[0].value(); }
}
class StarExpr extends GraphicVarExpr {
    constructor(x, y, rad, pts=5) {
        super(new Star(x, y, rad, pts));
    }
    toString() { return 'star'; }
}
class CircleExpr extends GraphicVarExpr {
    constructor(x, y, rad) {
        super(new Circle(x, y, rad));
    }
    toString() { return 'circle'; }
}
class PipeExpr extends GraphicVarExpr {
    constructor(x, y, w, h) {
        super(new Pipe(x, y, w, h-12));
    }
    toString() { return 'pipe'; }
}
class TriangleExpr extends GraphicVarExpr {
    constructor(x, y, w, h) {
        super(new Triangle(x, y, w, h));
    }
    toString() { return 'triangle'; }
}
class RectExpr extends GraphicVarExpr {
    constructor(x, y, w, h) {
        super(new Rect(x, y, w, h));
    }
    toString() { return 'diamond'; }
}
class ImageExpr extends GraphicVarExpr {
    constructor(x, y, w, h, resource_key) {
        super(new ImageRect(x, y, w, h, resource_key));
        this._image = resource_key;
    }
    get image() { return this._image; }
    set image(img) {
        this._image = img;
        this.graphicNode.image = img;
    }
    toString() { return this._image; }
}
class FunnelExpr extends ImageExpr {
    constructor(x, y, w, h) {
        super(x, y, w, h, 'funnel');
        this.graphicNode.anchor = { x:0, y:0.5 };
    }
    update() { }
    get size() {
        return this.graphicNode.size;
    }
    onmouseenter() {
        this.graphicNode.image = 'funnel-selected';
    }
    onmouseleave() {
        this.graphicNode.image = 'funnel';
    }
    drawInternal(pos, boundingSize) {  }
}
class NullExpr extends ImageExpr {
    constructor(x, y, w, h) {
        super(x, y, w, h, 'null-circle');
    }
    reduce() {
        return null; // hmmmm
    }
    performReduction() {
        Animate.poof(this);
        super.performReduction();
    }
    onmousehover() {
        this.image = 'null-circle-highlight';
    }
    onmouseleave() {
        this.image = 'null-circle';
    }
    onmouseclick() {
        this.performReduction();
    }
    toString() {
        return 'null';
    }
    value() { return null; }
}
class MirrorExpr extends ImageExpr {
    constructor(x, y, w, h) {
        super(x, y, w, h, 'mirror-icon');
        this.lock();
        this.graphicNode.offset = { x:0, y:-10 };
        this.innerExpr = null;
        this._broken = false;
    }
    set exprInMirror(e) {
        this.innerExpr = e;

        if (e) {
            e.scale = { x:1, y:1 };
            e.parent = this.graphicNode;
            e.update();
        }
    }
    set broken(b) {
        this._broken = b;
        if (b) this.graphicNode.image = 'mirror-icon-broken';
        else   this.graphicNode.image = 'mirror-icon';
    }
    get broken() {
        return this._broken;
    }
    get exprInMirror() {
        return this.innerExpr;
    }
    drawInternalAfterChildren(pos, boundingSize) {
        if (!this.innerExpr) return;

        var ctx = this.ctx;

        ctx.save();
        ctx.globalCompositeOperation = "overlay";
        this.innerExpr.parent = this.graphicNode;
        this.innerExpr.pos = { x:this.graphicNode.size.w / 2.0, y:this.graphicNode.size.h / 2.0 };
        this.innerExpr.anchor = { x:0.5, y:0.8 };
        this.innerExpr.ctx = ctx;
        this.innerExpr.draw();
        ctx.restore();
    }
}

/** Collections */
class PutExpr extends Expression {
    constructor(item, collection) {
        let txt_put = new TextExpr('put');
        let txt_in = new TextExpr('in');
        txt_put.color = 'black';
        txt_in.color = 'black';
        super([txt_put, item, txt_in, collection]);
        this.color = 'violet';
    }
    get item() { return this.holes[1]; }
    get collection()  { return this.holes[3]; }
    get constructorArgs() {
        return [ this.item.clone(), this.collection.clone() ];
    }
    onmouseclick() {
        this.performReduction();
    }
    reduce() {
        if (!this.item || !this.collection ||
            this.item instanceof MissingExpression ||
            this.item instanceof LambdaVarExpr || // You can't put a pipe into a bag with PUT; it's confusing...
            this.collection instanceof MissingExpression)
            return this;
        else if (!(this.collection instanceof CollectionExpr)) {
            console.error('@ PutExpr.reduce: Input is not a Collection.', this.collection);
            return this;
        } else {
            let new_coll = this.collection.clone();
            new_coll.addItem(this.item.clone()); // add item to bag
            return new_coll; // return new bag with item appended
        }
    }
    toString() { return '(put ' + this.item.toString() + ' ' + this.collection.toString() + ')'; }
}
class PopExpr extends Expression {
    constructor(collection) {
        let txt_pop = new TextExpr('pop');
        txt_pop.color = 'black';
        super([txt_pop, collection]);
        this.color = 'violet';
    }
    get collection() { return this.holes[1]; }
    get constructorArgs() { return [ this.collection.clone() ]; }
    onmouseclick() {
        this.performReduction();
    }
    reduce() {
        if (!this.collection ||
            this.collection instanceof MissingExpression)
            return this;
        else {
            let item = this.collection.items[0].clone();
            return item;
        }
    }
    toString() { return '(pop ' + this.collection.toString() + ')'; }
}

// Analogous to 'define' in Scheme.
class DefineExpr extends Expression {
    constructor(expr) {
        let txt_define = new TextExpr('define');
        txt_define.color = 'black';
        super([txt_define, expr]);
        this.color = 'OrangeRed';
    }
    get expr() { return this.holes[1]; }
    get constructorArgs() { return [ this.expr.clone() ]; }
    onmouseclick() {
        this.performReduction();
    }
    reduce() {
        if (!this.expr ||
            this.expr instanceof MissingExpression)
            return this;
        else {

            // For now, prompt the user for a function name:
            let funcname = window.prompt("What do you want to call it?", "foo");
            if (funcname) {
                funcname = funcname.trim(); // remove trailing whitespace

                // Check that name has no spaces etc...
                if (funcname.indexOf(/\s+/g) === -1) {

                    let args = [];
                    let numargs = 0;
                    if (this.expr instanceof LambdaExpr)
                        numargs = this.expr.numOfNestedLambdas();
                    for (let i = 0; i < numargs; i++)
                        args.push( new MissingExpression() );

                    // Return named function (expression).
                    return new NamedExpr(funcname, this.expr.clone(), args);
                }
                else {
                    window.alert("Name can't have spaces. Try again with something simpler."); // cancel
                }
            }

            return this; // cancel
        }
    }
    toString() { return '(define ' + this.expr.toString() + ')'; }
}

// Acts as a named wrapper for a def'd expression.
class NamedExpr extends Expression {
    constructor(name, expr, args) {
        let txt_name = new TextExpr(name);
        txt_name.color = 'black';
        let exprs = [ txt_name ];
        for ( let i = 0; i < args.length; i++ )
            exprs.push( args[i].clone() );
        super(exprs);
        this.color = 'orange';
        this.name = name;
        this._args = args.map((a) => a.clone());
        this._wrapped_expr = expr;
    }
    get expr() { return this._wrapped_expr.clone(); }
    get args() { return this.holes.slice(1).map((a) => a.clone()); }
    get constructorArgs() {
        return [ this.name, this.expr.clone(), this.args ];
    }

    onmouseclick() {
        this.performReduction();
    }
    reduce() {
        if (!this.expr ||
            this.expr instanceof MissingExpression)
            return this;
        else {

            // This should 'reduce' by applying the arguments to the wrapped expression.
            // First, let's check that we HAVE arguments...
            var isValidArgument = (a) => a && (a instanceof Expression) && !(a instanceof MissingExpression);
            var validateAll = (arr, testfunc) => arr.reduce((prev, x) => prev && testfunc(x), true);
            let args = this.args;
            if (args.length === 0 || validateAll(args, isValidArgument)) { // true if all args valid

                // All the arguments check out. Now we need to apply them.
                let expr = this.expr;
                if (args.length > 0)
                    expr = args.reduce((lambdaExpr, arg) => lambdaExpr.applyExpr(arg), expr); // Chains application to inner lambda expressions.

                return expr.clone(); // to be safe we'll clone it.
            }
        }

        return this;
    }

    // Whoa... meta.
    toString() {
        let s = '(' + name; // e.g. '(length'
        let args = this.args;
        for ( let i = 0; i < args.length; i++ )
            s += ' ' + args[i].toString();
        s += ')';
        return s;
    }
}

class CollectionExpr extends GraphicVarExpr { }
class BagExpr extends CollectionExpr {
    constructor(x, y, w, h, holding=[]) {
        //super(new Bag(x, y, w, h));
        let radius = (w + h) / 4.0;
        super(new Bag(x, y, radius));
        this._items = holding;
        this.bigScale = 4;

        if (this.graphicNode) {
            this.graphicNode.color = 'tan';
            this.graphicNode.anchor = { x:0.5, y:0.5 };
        }

        //this.graphicNode.clipChildren = true;
        //this.graphicNode.clipBackground = 'bag-background';

        this.anchor = { x:0.5, y:0.5 };
    }
    get items() { return this._items.slice(); }
    set items(items) {
        this._items.forEach((item) => this.graphicNode.removeItem(item));
        this._items = [];
        items.forEach((item) => {
            this.addItem(item);
        });
    }
    arrangeNicely() {
        let dotpos = DiceNumber.drawPositionsFor(this.items.length);
        if (dotpos.length > 0) { // Arrange items according to dot positions.
            let sz = this.graphicNode.size;
            let topsz = this.graphicNode.topSize(sz.w / 2.0);
            this.graphicNode.children.slice(1).forEach((e, idx) => {
                e.pos = { x:(dotpos[idx].x) * sz.w * 0.4 + topsz.w / 3.4, y:(dotpos[idx].y) * sz.h * 0.4 + topsz.h * 1.9 };
            });
        }
    }
    lock() {
        super.lock();
        this.graphicNode.shadowOffset = this.shadowOffset;
    }
    unlock() {
        super.unlock();
        this.graphicNode.shadowOffset = this.shadowOffset;
    }
    get delegateToInner() { return true; }

    // Adds an item to the bag.
    addItem(item) {

        if (item.toolbox) {
            item.detach();
            item.toolbox = null;
        }

        let scale = 1.0/this.bigScale;
        let center = this.graphicNode.size.w / 2.0;
        let x = (item.pos.x - this.pos.x) / (1.0/scale) + center + item.size.w / 2.0 * scale;
        let y = (item.pos.y - this.pos.y) / (1.0/scale) + center + item.size.h / 2.0 * scale;
        item.pos = { x:x, y:y };
        item.anchor = { x:0.5, y:0.5 };
        item.scale = { x:scale, y:scale };
        this._items.push(item);
        this.graphicNode.addItem(item);

        item.onmouseleave();

        this.arrangeNicely();
    }

    // Removes an item from the bag and returns it.
    popItem() {
        let item = this._items.pop();
        this.graphicNode.removeAllItems();
        this._items.forEach((item) => {
            this.graphicNode.addItem(item);
        });
        return item;
    }

    // Applies a lambda function over every item in the bag and
    // returns a new bag containing the new items.
    map(lambdaExpr) {
        if (!(lambdaExpr instanceof LambdaExpr) || !lambdaExpr.takesArgument) {
            console.error('@ BagExpr.applyFunc: Func expr does not take argument.');
            return undefined;
        }
        let bag = this.clone();
        bag.graphicNode.children = [ bag.graphicNode.children[0] ];
        let items = bag.items;
        bag.items = [];
        let new_items = [];
        items.forEach((item) => {
            let c = item.clone();
            let pos = item.pos;
            let func = lambdaExpr.clone();
            this.stage.add(func);
            func.update();
            let new_funcs = func.applyExpr(c);
            if (!Array.isArray(new_funcs)) new_funcs = [ new_funcs ];

            for (let new_func of new_funcs) {
                this.stage.remove(new_func);
                new_func.pos = pos;
                new_func.unlockSubexpressions();
                new_func.lockSubexpressions((expr) => (expr instanceof VarExpr || expr instanceof FadedVarExpr || expr instanceof BooleanPrimitive)); // lock primitives
                bag.addItem(new_func);
            }
        });
        //bag.items = new_items;
        return bag;
    }

    // Spills the entire bag onto the play field.
    spill() {
        if (!this.stage) {
            console.error('@ BagExpr.spill: Bag is not attached to a Stage.');
            return;
        } else if (this.parent) {
            console.error('@ BagExpr.spill: Cannot spill a bag while it\'s inside of another expression.');
            return;
        }

        let stage = this.stage;
        let items = this.items;
        let pos = this.pos;

        // GAME DESIGN CHOICE:
        // Remove the bag from the stage.
        // stage.remove(this);

        // Add back all of this bags' items to the stage.
        items.forEach((item, index) => {
            item = item.clone();
            let theta = index / items.length * Math.PI * 2;
            let rad = this.size.w * 1.5;
            let targetPos = addPos(pos, { x:rad*Math.cos(theta), y:rad*Math.sin(theta) } );
            item.pos = pos;
            Animate.tween(item, { 'pos':targetPos }, 100, (elapsed) => Math.pow(elapsed, 0.5));
            //item.pos = addPos(pos, { x:rad*Math.cos(theta), y:rad*Math.sin(theta) });
            item.parent = null;
            this.graphicNode.removeItem(item);
            item.scale = { x:1, y:1 };
            stage.add(item);
        });

        // Set the items in the bag back to nothing.
        this.items = [];
        this.graphicNode.removeAllItems(); // just to be sure!
        console.warn(this.graphicNode);

        // Play spill sfx
        Resource.play('bag-spill');
    }

    reduce() {
        return this; // collections do not reduce!
    }
    reduceCompletely() {
        return this;
    }
    clone() {
        let c = super.clone();
        c._items = this.items;
        return c;
    }
    value() {
        return this.items.slice(); // Arguably should be toString of each expression, but then comparison must be setCompare.
    }
    toString() {
        return '(bag' + this.items.reduce(((str, curr) => str += ' ' + curr.toString()), '') + ')';
    }

    onmouseclick(pos) {
        this.spill();
    }

    ondropenter(node, pos) {

        if (this._tween) this._tween.cancel();
        if (this.parent) return;
        if (node instanceof FunnelMapFunc) return;

        if (this.stage) {
            let pos = this.pos;
            pos.x -= (this.anchor.x - 0.5) * this.size.w;
            pos.y -= (this.anchor.y - 0.5) * this.size.h;
            this.pos = pos;
            this.anchor = { x:0.5, y:0.5 };
        }
        this._beforeScale = this.graphicNode.scale;
        let targetScale = { x:this.bigScale, y:this.bigScale };
        this._tween = Animate.tween(this.graphicNode, { 'scale': targetScale }, 600, (elapsed) => Math.pow(elapsed, 0.25) );
        this.onmouseenter(pos);

        //if (this.stage) this.stage.draw();
    }
    ondropexit(node, pos) {

        if (this.parent) return;
        if (node instanceof FunnelMapFunc) return;

        this._tween.cancel();
        this._tween = Animate.tween(this.graphicNode, { 'scale': this._beforeScale }, 100, (elapsed) => Math.pow(elapsed, 0.25) );
        this.onmouseleave(pos);
    }
    ondropped(node, pos) {
        this.ondropexit(node, pos);

        if (this.parent) return;
        if (node instanceof FunnelMapFunc) return;

        if (!(node instanceof Expression)) {
            console.error('@ BagExpr.ondropped: Dropped node is not an Expression.', node);
            return;
        } else if (!node.stage) {
            console.error('@ BagExpr.ondropped: Dropped node is not attached to a Stage.', node);
            return;
        } else if (node.parent) {
            console.error('@ BagExpr.ondropped: Dropped node has a parent expression.', node);
            return;
        }

        // Remove node from the stage:
        let stage = node.stage;
        stage.remove(node);

        // Dump clone of node into the bag:
        let n = node.clone();
        let before_str = this.toString();
        n.pos.x = 100;//(n.absolutePos.x - this.graphicNode.absolutePos.x + this.graphicNode.absoluteSize.w / 2.0) / this.graphicNode.absoluteSize.w;
        this.addItem(n);

        Logger.log('bag-add', {'before':before_str, 'after':this.toString(), 'item':n.toString()});

        if (this.stage) {
            this.stage.saveState();
            Logger.log('state-save', this.stage.toString());
        } else {
            console.warn('@ BagExpr.ondroppped: Item dropped into bag which is not member of a Stage.');
        }

        Resource.play('bag-addItem');
    }
}

class CountExpr extends Expression {
    constructor(collectionExpr) {
        if (typeof collectionExpr === 'undefined') {
            collectionExpr = new MissingExpression();
            collectionExpr.color = 'lightgray';
        }
        let txt = new TextExpr('count');
        super([txt, collectionExpr]);
        this.color = 'DarkTurquoise';
        txt.color = 'white';
    }
    onmouseclick() {
        this.performReduction();
    }
    reduce() {
        console.log(this.holes[1]);
        if (this.holes[1] instanceof MissingExpression) return this;
        else if (this.holes[1] instanceof BagExpr)      return [new NumberExpr(this.holes[1].items.length), this.holes[1]];
        else                                            return this;
    }
}


// A while loop.
/* OLD -- class WhileLoop extends IfStatement {
    reduce() {
        if (!this.cond || !this.branch) return this; // irreducible
        else if (this.cond.value()) {
            this.branch.execute();
            return this; // step the branch, then return the same loop (irreducible)
        }
        else return this.emptyExpr;
    }
}

// A boolean expression. Can && or || or !.
class BooleanExpr extends Expression {
    constructor(b1, b2) {
        super(b1 || b2 ? [b1, b2] : [new TrueExpr(), new TrueExpr()]);
        this.OPTYPE = { AND:0, OR:1, NOT:2 };
        this.op = this.OPTYPE.AND;
    }

    // Change these when you subclass.
    get trueExpr() { return new TrueExpr(); }
    get falseExpr() { return new FalseExpr(); }

    // Reduces to TrueExpr or FalseExpr
    reduce() {
        var v = this.value();
        if (v) return this.trueExpr;
        else   return this.falseExpr;
    }

    value() {
        switch (this.op) {
            case this.OPTYPE.AND:
                return b1.value() && b2.value();
            case this.OPTYPE.OR:
                return b1.value() || b2.value();
            case this.OPTYPE.NOT:
                return !b1.value(); }
        console.error('Invalid optype.');
        return false;
    }
}*/
