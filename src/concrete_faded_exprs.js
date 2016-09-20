class FadedLambdaHoleExpr extends LambdaHoleExpr {
    get openImage() { return this.name === 'x' ? 'lambda-hole-x' : 'lambda-hole-y'; }
    get closedImage() { return this.name === 'x' ? 'lambda-hole-x-closed' : 'lambda-hole-y-closed'; }
}
class HalfFadedLambdaHoleExpr extends LambdaHoleExpr {
    get openImage() { return this.name === 'x' ? 'lambda-hole-xside' : 'lambda-hole-y'; }
    get closedImage() { return this.name === 'x' ? 'lambda-hole-xside-closed' : 'lambda-hole-y-closed'; }
}
class FadedPythonLambdaHoleExpr extends LambdaHoleExpr {
    get openImage() { return this.name === 'x' ? 'lambda-hole-x-python' : 'lambda-hole-y'; }
    get closedImage() { return this.name === 'x' ? 'lambda-hole-x-closed-python' : 'lambda-hole-y-closed'; }
    get size() {
        let sz = super.size;
        sz.w = 120;
        return sz;
    }

    // Draw special round rect around term.
    drawInternal(pos, boundingSize) {
        var ctx = this.ctx;
        setStrokeStyle(ctx, this.stroke);
        ctx.fillStyle = this.color;
        ctx.drawImage(Resource.getImage(this.image), pos.x, pos.y, boundingSize.w, boundingSize.h);
        if(this.stroke) {
            roundRect(ctx, pos.x, pos.y, boundingSize.w, boundingSize.h, 6, false, true, this.stroke.opacity);
        }
    }
}
class FadedES6LambdaHoleExpr extends FadedPythonLambdaHoleExpr {
    get openImage() { return this.name === 'x' ? 'lambda-hole-x-es6' : 'lambda-hole-y'; }
    get closedImage() { return this.name === 'x' ? 'lambda-hole-x-closed-es6' : 'lambda-hole-y-closed'; }

    // Events
    hits(pos, options) {
        if (this.ignoreEvents) return null; // All children are ignored as well.
        else if (!this.isOpen) return null;

        if (typeof options !== 'undefined' && options.hasOwnProperty('exclude')) {
            for(let e of options.exclude) {
                if (e == this) return null;
            }
        }

        var hitChild = this.hitsChild(pos, options);
        if (hitChild) return hitChild;

        // Hasn't hit any children, so test if the point lies on this node.
        var boundingSize = this.absoluteSize;
        boundingSize.w /= 2.0;
        var upperLeftPos = this.upperLeftPos(this.absolutePos, boundingSize);
        if (pointInRect(pos, rectFromPosAndSize(upperLeftPos, boundingSize) )) return this;
        else return null;
    }

    // Draw special round rect around just x term.
    drawInternal(pos, boundingSize) {
        var ctx = this.ctx;
        setStrokeStyle(ctx, this.stroke);
        ctx.fillStyle = this.color;
        ctx.drawImage(Resource.getImage(this.image), pos.x, pos.y, boundingSize.w, boundingSize.h);
        if(this.stroke) {
            roundRect(ctx, pos.x, pos.y, boundingSize.w / 2.0, boundingSize.h, 6, false, true, this.stroke.opacity);
        }
    }
}

class HalfFadedLambdaVarExpr extends LambdaVarExpr {
    get openImage() { return 'lambda-pipe-open'; }
    get closedImage() { return this.name === 'x' ? 'lambda-pipe-xside-closed' : 'lambda-pipe-xside-closed'; }
}

class FadedLambdaVarExpr extends LambdaVarExpr {
    constructor(varname) {
        super(varname);
        this.graphicNode.size = this.name === 'x' ? { w:24, h:24 } : { w:24, h:30 };
        this.graphicNode.offset = this.name === 'x' ? { x:0, y:0 } : { x:0, y:2 };
        this.handleOffset = 2;
    }
    get openImage() { return 'lambda-pipe-x-open'; }
    get closedImage() { return this.name === 'x' ? 'lambda-pipe-x' : 'lambda-pipe-x'; }
    get openingAnimation() {
        var anim = new Animation();
        anim.addFrame('lambda-pipe-x-opening0', 50);
        anim.addFrame('lambda-pipe-x-opening1', 50);
        anim.addFrame(this.openImage,           50);
        return anim;
    }
    get closingAnimation() {
        var anim = new Animation();
        anim.addFrame('lambda-pipe-x-opening1', 50);
        anim.addFrame('lambda-pipe-x-opening0', 50);
        anim.addFrame(this.closedImage,         50);
        return anim;
    }

    open(preview_expr=null) {
        if (this.stateGraph.currentState !== 'open') {
            this.stateGraph.enter('opening');

            if(preview_expr) {
                let scale = this.graphicNode.size.w / preview_expr.size.w * 2.0;
                preview_expr.pos = { x:this.graphicNode.size.w / 2.0, y:0 };
                preview_expr.scale = { x:scale, y:scale };
                preview_expr.anchor = { x:0.5, y:0.3 };
                preview_expr.stroke = null;
                this.graphicNode.addChild(preview_expr);
                this.stage.draw();
            }
        }
    }
}

class FadedSimpleMapFunc extends SimpleMapFunc {
    constructor(oneParamFunc, bag) {
        super(oneParamFunc, bag);

        let txt_color = 'black';
        let txt = new TextExpr('.map(');
        txt.color = txt_color;
        let txt2 = new TextExpr(')');
        txt2.color = txt_color;

        this.holes = [];
        this.addArg(bag);
        this.addArg(txt);
        this.addArg(oneParamFunc);
        this.addArg(txt2);
        this.arrowPaths = [];
        //this.heightScalar = 1.0;
        //this.exprOffsetY = 0;
        //this.animatedReduction = false;
        this.update();

        this.color = "YellowGreen";
    }
    get returnBag() { return null; }
    get func() {
        return this.holes[2];
    }
    get bag() {
        return this.holes[0];
    }
    set bag(bg) {
        this.holes[0] = bg;
    }
}

// Full-faded map function.
class FadedMapFunc extends FadedSimpleMapFunc {
    constructor(oneParamFunc, bag) {
        super(oneParamFunc, bag);

        // Remove animations + arrow
        this.heightScalar = 1.0;
        this.exprOffsetY = 0;
        this.animatedReduction = false;
    }
    updateArrowPaths() { } // remove arrow
}

// Fully-concrete map function.
class FunnelMapFunc extends MapFunc {
    constructor(oneParamFunc, bag) {
        super(oneParamFunc, bag);
        this.children = [];
        this.holes = [];
        //this.animatedReduction = false;

        // Expression it fits over.
        oneParamFunc.unlock();
        this.addArg(oneParamFunc);

        // Funnel graphic.
        var funnel = new FunnelExpr(0, 0, 198/2, 281/2);
        this.funnel = funnel;
        this.addArg(funnel);

        // Bag.
        //bag.unlock();
        this.addArg(bag);
    }
    update() {
        if (this.func && this.funnel) {
            this.func.pos = { x:this.funnel.size.w * 38 / 200, y:this.funnel.size.h / 2.0 - this.func.size.h / 1.3 };
            this.func.update();
            if (this.func.holes.length > 0)
                this.func.holes[0].open();
            else {
                if (!this.funcDraw) this.funcDraw = this.func.draw;
                this.func.draw = () => {};
            }
        }
        if (this.bag && this.funnel) {
            if (this.bag instanceof MissingExpression) this.bag.shadowOffset = -4;
            this.bag.pos = { x:this.funnel.size.w / 2.0 + 3, y:-this.funnel.size.h * (280/2 - 50) / 280};
            this.bag.anchor = { x:0.5, y:0.5 };
            this.bag.update();
        }
        this.children = [];
        this.holes.forEach((h) => {
            this.addChild(h);
        });
    }
    onmouseenter(pos) {
        this.funnel.onmouseenter(pos);
        this.func.onmouseenter(pos);
    }
    onmouseleave(pos) {
        this.funnel.onmouseleave(pos);
        this.func.onmouseleave(pos);
    }
    updateArrowPaths() { }
    drawInternal(pos, boundingSize) { }
    hits(pos, options) {
        var b = this.bag.hits(pos, options);
        if (b) return b;
        var e = this.func.hits(pos, options);
        if (e) return (e != this.func && e != this.func.holes[0]) ? e : this;
        var h = this.funnel.hits(pos, options);
        if (h) return this;
        else   return null;
    }
    get returnBag() { return null; }
    get func() {
        return this.holes[0];
    }
    set func(f) {
        f.anchor = { x:0, y:0 };
        this.holes[0] = f;
    }
    get bag() {
        return this.holes[2];
    }
    set bag(bg) {
        this.holes[2] = bg;
    }
}

class FadedVarExpr extends Expression {
    constructor(name) {
        let txt = new TextExpr(name);
        super([txt]);
        txt.color = "OrangeRed";
        this.color = "gold";
        this.primitiveName = name;
    }
    get graphicNode() { return this.holes[0]; }
    reduceCompletely() { return this; }
    reduce() { return this; }
    toString() {
        return this.primitiveName;
    }
    value() { return this.toString(); }
}
class FadedStarExpr extends FadedVarExpr {
    constructor() { super('star'); }
}
class FadedRectExpr extends FadedVarExpr {
    constructor() { super('rect'); }
}
class FadedTriangleExpr extends FadedVarExpr {
    constructor() { super('tri'); }
}
class FadedCircleExpr extends FadedVarExpr {
    constructor() { super('dot'); }
}
class FadedNullExpr extends FadedVarExpr {
    constructor() {
        super('null');
        this.color = "lightgray";
        this.graphicNode.color = 'black';
        this.opacity = 0.8;
    }
    poof() {
        if (!this.stage) return;
        Animate.poof(this);
        this.stage.remove(this);
    }
}





class BracketArrayExpr extends BagExpr {
    constructor(x, y, w, h, holding=[]) {
        super(x, y, w, h, holding);

        this.holes = [];
        this.children = [];

        this.addArg(new Expression());

        this._items = holding;

        this.l_brak = new TextExpr('[');
        this.r_brak = new TextExpr(']');
        this.graphicNode.addArg(this.l_brak);
        this.graphicNode.addArg(this.r_brak);

        this.graphicNode.padding = { left:10, inner:0, right:20 };

        //this.color = "tan";
    }
    get items() { return this._items.slice(); }
    set items(items) {
        this._items.forEach((item) => this.graphicNode.removeArg(item));
        this.graphicNode.children = [this.l_brak, this.r_brak];
        this._items = [];
        items.forEach((item) => {
            this.addItem(item);
        });
    }
    arrangeNicely() { }
    get delegateToInner() { return true; }

    // Adds an item to the bag.
    addItem(item) {

        item.onmouseleave();
        item.lock();

        this._items.push(item);

        if (this._items.length > 1) {
            let comma = new TextExpr(',');
            this.graphicNode.holes.splice(this.graphicNode.holes.length-1, 0, comma);
        }

        this.graphicNode.holes.splice(this.graphicNode.holes.length-1, 0, item);

        this.graphicNode.update();
    }

    // Removes an item from the bag and returns it.
    popItem() {
        let item = this._items.pop();
        this.graphicNode.removeArg(item);
        if(this._items.length >= 1) {
            let last_comma_idx = this.graphicNode.holes.length - 2;
            this.graphicNode.holes.splice(last_comma_idx, 1);
        }
        return item;
    }

    // Spills the entire bag onto the play field.
    spill(logspill=true) {

        if (!this.stage) {
            console.error('@ BracketArrayExpr.spill: Array is not attached to a Stage.');
            return;
        } else if (this.parent) {
            console.error('@ BracketArrayExpr.spill: Cannot spill array while it\'s inside of another expression.');
            return;
        } else if (this.toolbox) {
            console.warn('@ BracketArrayExpr.spill: Cannot spill array while it\'s inside the toolbox.');
            return;
        }

        let stage = this.stage;
        let items = this.items;
        let pos = this.pos;

        // GAME DESIGN CHOICE:
        // Remove the bag from the stage.
        // stage.remove(this);

        let before_str = stage.toString();
        let bag_before_str = this.toString();
        stage.saveState();
        Logger.log('state-save', stage.toString());

        // Add back all of this bags' items to the stage.
        items.forEach((item, index) => {

            item = item.clone();
            let theta = index / items.length * Math.PI * 2;
            let rad = this.size.h * 2.0;
            let targetPos = addPos(pos, { x:rad*Math.cos(theta), y:rad*Math.sin(theta) } );

            targetPos = clipToRect(targetPos, item.absoluteSize, { x:25, y:0 },
                                    {w:GLOBAL_DEFAULT_SCREENSIZE.width-25,
                                     h:GLOBAL_DEFAULT_SCREENSIZE.height - stage.toolbox.size.h});

            item.pos = pos;
            Animate.tween(item, { 'pos':targetPos }, 100, (elapsed) => Math.pow(elapsed, 0.5));
            //item.pos = addPos(pos, { x:rad*Math.cos(theta), y:rad*Math.sin(theta) });
            item.parent = null;
            this.graphicNode.removeChild(item);
            item.scale = { x:1, y:1 };
            stage.add(item);
        });

        // Set the items in the bag back to nothing.
        this.items = [];
        this.graphicNode.holes = [this.l_brak, this.r_brak]; // just to be sure!
        this.graphicNode.update();

        // Log changes
        if (logspill)
            Logger.log('bag-spill', {'before':before_str, 'after':stage.toString(), 'item':bag_before_str});

        // Play spill sfx
        Resource.play('bag-spill');
    }

    ondropenter(node, pos) {

        this.onmouseenter(pos);

    }
    ondropexit(node, pos) {

        this.onmouseleave(pos);

    }
    ondropped(node, pos) {
        this.ondropexit(node, pos);

        if (this.parent) return;

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
        this.addItem(n);

        Logger.log('bag-add', {'before':before_str, 'after':this.toString(), 'item':n.toString()});

        if (this.stage) {
            this.stage.saveState();
            Logger.log('state-save', this.stage.toString());
        } else {
            console.warn('@ BracketArrayExpr.ondroppped: Item dropped into bag which is not member of a Stage.');
        }

        Resource.play('bag-addItem');
    }
}
