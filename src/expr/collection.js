class CollectionExpr extends GraphicValueExpr { }
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

        this.reducableStrokeColor = "#ddd";

        //this.graphicNode.clipChildren = true;
        //this.graphicNode.clipBackground = 'bag-background';

        this.anchor = { x:0.5, y:0.5 };
        this._spillDisabled = true;
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
    lockSubexpressions(filterFunc=null) { }
    unlock() {
        super.unlock();
        this.graphicNode.shadowOffset = this.shadowOffset;
        if (this.graphicNode instanceof Expression) {
            this.graphicNode.unlock();
        }
    }
    get delegateToInner() { return true; }

    isValue() { return true; }

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

        let bag = new SmallStepBagExpr();
        bag.graphicNode.reset();

        let items = this.items.map((i) => i.clone());
        bag.items = [];
        let new_items = [];
        for (let item of items) {
            let c = item.clone();
            let pos = item.pos;
            let func = lambdaExpr.clone();
	    // Do not add the lambda to the stage - it should not need
	    // this global state, and it can cause problems if it
	    // tries to trigger a save point (since it may be in an
	    // inconsistent state)

            // this.stage.add(func);
            func.update();
            let new_funcs = func.applyExpr(c);
            if (!Array.isArray(new_funcs)) new_funcs = [ new_funcs ];

            // Check for null values - this means the lambda could not reduce
            for (let new_func of new_funcs) {
                if (new_func === null || typeof new_func === "undefined") {
                    WatEffect.run(lambdaExpr);
                    return undefined;
                }
            }

            for (let new_func of new_funcs) {
                new_func.pos = pos;
                new_func.unlockSubexpressions();
                new_func.lockSubexpressions((expr) => (expr instanceof ValueExpr || expr instanceof FadedValueExpr || expr instanceof BooleanPrimitive || expr.isValue())); // lock primitives
                bag.addItem(new_func);
                if (!new_func.isValue()) {
                    new_func.unlock();
                }
                this.stage.remove(new_func);
            }
        }
        return bag;
    }

    disableSpill() {
        this._spillDisabled = true;
    }

    // Spills the entire bag onto the play field.
    spill(logspill=true) {
        if (!this.stage) {
            console.error('@ BagExpr.spill: Bag is not attached to a Stage.');
            return;
        } else if (this.parent) {
            console.error('@ BagExpr.spill: Cannot spill a bag while it\'s inside of another expression.');
            return;
        } else if (this.toolbox) {
            console.warn('@ BagExpr.spill: Cannot spill bag while it\'s inside the toolbox.');
            return;
        } else if (this._spillDisabled) return;

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
            let rad = this.size.w * 1.5;
            let targetPos = addPos(pos, { x:rad*Math.cos(theta), y:rad*Math.sin(theta) } );

            targetPos = clipToRect(targetPos, item.absoluteSize, { x:25, y:0 },
                                    {w:GLOBAL_DEFAULT_SCREENSIZE.width-25,
                                     h:GLOBAL_DEFAULT_SCREENSIZE.height - stage.toolbox.size.h});

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

        // Log changes
        if (logspill)
            Logger.log('bag-spill', {'before':before_str, 'after':stage.toString(), 'item':bag_before_str});

        // Play spill sfx
        Resource.play('bag-spill');
    }

    reduce() {
        return this; // collections do not reduce!
    }
    reduceCompletely() {
        return this;
    }
    clone(parent=null) {
        let c = super.clone(parent);
        c._items = [];
        c.graphicNode.removeAllItems();
        this.items.forEach((i) => c.addItem(i.clone()));
        c.graphicNode.update();
        return c;
    }
    value() {
        return '[' + this.items.reduce(((str, curr) => str += ' ' + curr.toString()), '').trim() + ']'; // Arguably should be toString of each expression, but then comparison must be setCompare.
    }
    toString() {
        return (this.locked ? '/' : '') + '(bag' + this.items.reduce(((str, curr) => str += ' ' + curr.toString().replace('/', '')), '') + ')';
    }
    toJavaScript() {
        let itemsJS = this.items.map((x) => x.toJavaScript()).join(', ');
        return `[${itemsJS}]`;
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

class BracketBag extends Expression {
    constructor() {
        super();

        this.l_brak = new TextExpr('[');
        this.r_brak = new TextExpr(']');
        this.addArg(this.l_brak);
        this.addArg(this.r_brak);

        this.padding = { left:10, inner:0, right:20 };
    }

    reset() {
        this.holes = [this.l_brak, this.r_brak];
        this.children = [this.l_brak, this.r_brak];
    }

    swap(arg, otherArg) {
        if (this.parent) {
            let items = this.parent.items.slice();
            for (let i = 0; i < items.length; i++) {
                if (items[i] == arg) {
                    items[i] = otherArg;
                }
            }
            this.parent.items = items;
        }

        super.swap(arg, otherArg);
    }
}

/** "Faded" variant of a BagExpr. */
class BracketArrayExpr extends BagExpr {
    constructor(x, y, w, h, holding=[]) {
        super(x, y, w, h, holding);

        this.holes = [];
        this.children = [];

        // This becomes graphicNode.
        this.addArg(new BracketBag());

        this._items = holding;
        this._spillDisabled = true;
        //this.color = "tan";
    }
    get items() { return this._items.slice(); }
    set items(items) {
        this._items.forEach((item) => this.graphicNode.removeArg(item));
        this._items = [];
        items.forEach((item) => {
            this.addItem(item);
        });
    }
    arrangeNicely() { }
    get delegateToInner() { return true; }
    clone(parent=null) {
        let c = new BracketArrayExpr(this.pos.x, this.pos.y, this.size.w, this.size.h);
        c.graphicNode.reset();
        this.items.forEach((i) => {
            if (!(i instanceof TextExpr))
                c.addItem(i.clone());
        });
        c.graphicNode.update();
        if (this.locked) c.lock();
        return c;
    }

    // Adds an item to the bag.
    addItem(item) {
        if (item instanceof VarExpr || item instanceof VtableVarExpr) {
            // Reduce variables in our context. This is technically
            // not correct, but at this point, we have no idea what
            // the variable's original context was anymore.
            item.parent = this;
            item = item.reduce();
        }

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
        let item = this._items.pop();;
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
        } else if (this._spillDisabled) {
            // alert('You can no longer spill collections onto the board.\n\nInstead, try .pop().');
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
        this.graphicNode.reset(); // just to be sure!
        this.graphicNode.update();

        // Log changes
        if (logspill)
            Logger.log('bag-spill', {'before':before_str, 'after':stage.toString(), 'item':bag_before_str});

        // Play spill sfx
        Resource.play('bag-spill');
    }

    ondropenter(node, pos) {
        // DISABLE bag add for now.
        return;

        this.onmouseenter(pos);

    }
    ondropexit(node, pos) {
        // DISABLE bag add for now.
        return;

        this.onmouseleave(pos);

    }
    ondropped(node, pos) {
        this.ondropexit(node, pos);

        // DISABLE bag add for now.
        return;

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

class SmallStepBagExpr extends BracketArrayExpr {
    constructor(x, y, w, h, holding=[]) {
        super(x, y, w, h, holding);
        this.overlay = false;
        this.finished = false;
        this.ignoreAutoResize = true;
    }

    start() {
        if (!this.overlay && !this.finished) {
            this.overlay = true;
            let overlay = this.stage.showOverlay(0.5);
            const stage = this.stage;
            stage.remove(this);
            stage.add(this);
            this.overlayNode = overlay;
        }
    }

    onmouseenter() {}
    onmousedrag() {}

    finish() {
        if (!this.finished) {
            const stage = this.stage;
            let clone = new BracketArrayExpr();
            this.items.forEach(clone.addItem.bind(clone));
            (this.parent || this.stage).swap(this, clone);
            if (this.overlayNode) {
                Animate.tween(this.overlayNode, {
                    opacity: 0,
                }, 1000).after(() => {
                    stage.remove(this.overlayNode);
                    stage.ranResetNotifier = false;
                    stage.update();
                });
            }
            this.finished = true;
            this.overlay = false;
        }
    }

    update() {
        // Fix the position
        if (this.stage) {
            const pos = clonePos(this.pos);
            this.anchor = { x: 0, y: 0.5 };
            if (this.absoluteSize.w < this.stage.boundingSize.w) {
                pos.x = (this.stage.boundingSize.w - this.absoluteSize.w) / 2;
            }
            else {
                pos.x = 0;
            }

            this.pos = pos;
        }

        super.update();

        if (this._items.every(n => n.isValue() || !n.canReduce())) {
            this.finish();
        }

        if (this.stage && !this.overlay && !this.finished) {
            this.start();
        }
    }

    get items() {
        return this._items.slice();
    }

    set items(items) {
        this._items.forEach((item) => this.graphicNode.removeArg(item));
        this.graphicNode.reset();
        this._items = [];
        items.forEach((item) => {
            this.addItem(item);
            item.onmousedrag = () => {};
            if (!item.isValue()) {
                item.unlock();
                item.forceReducibilityIndicator = true;
            }
        });
        this.graphicNode.update();
        if (this.stage) super.update();
    }

    addItem(item) {
        item.onmousedrag = () => {};
        item.forceReducibilityIndicator = true;
        super.addItem(item);
    }

    isValue() {
        return false;
    }
}
