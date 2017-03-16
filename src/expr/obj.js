/**
 * Any expression with dot notation '.' properties to access.
 * Properties can themselves return objects...
 */
class ObjectExtensionExpr extends ExpressionPlus {
    constructor(baseExpr, objMethods) {

        super([baseExpr]);
        this.padding = { left:0, inner:0, right:0 }; // don't pad the base expression
        baseExpr.lock();

        this._subexpScale = 1.0; // don't scale subexpressions
        this.radius = 8;
        this.update();

        // objDefinition follows the format:
        // ---------------------------------
        // {
        //   propertyName:
        //      // Acts as a reduce() function.
        //      function (baseExpr, arg1, ..., argN) {
        //          // do stuff with args...
        //          return transformedExpr;
        //      }
        // }

        let onCellSelect = (cell) => {
            this.setExtension(cell.children[0].text.replace('.', '').split('(')[0], cell.children[0]._reduceMethod);
        };

        // Make pullout-drawer:
        let drawer = new PulloutDrawer(this.size.w, this.size.h/2, 8, 32, objMethods, onCellSelect);
        drawer.anchor = { x:0, y:0.32 };
        this.addChild(drawer);
        this.drawer = drawer;
        this.objMethods = objMethods;
        // TBI

    }
    onmousedrag(pos) {
        super.onmousedrag(pos);
        if (this.drawer && this.drawer.isOpen) this.drawer.close();
    }
    clone(parent=null) {
        if (this.drawer) {
            this.removeChild(this.drawer);
            let cln = super.clone(parent);
            this.addChild(this.drawer);
            return cln;
        } else
            return super.clone(parent);
    }
    get constructorArgs() { return [this.holes[0].clone(), $.extend(true, {}, this.objMethods)]; }
    get methodArgs() {
        if (this.holes.length <= 1) return [];
        else {
            return this.holes.slice(1).filter((x) => (!(x instanceof TextExpr))); // everything not text must be an argument...
        }
    }
    isCompletelySpecified() {
        if (this.holes[0] instanceof MissingExpression) return false;
        let args = this.methodArgs;
        if (args.length === 0) return true;
        else return args.reduce((p, a) => (p && !(a instanceof MissingExpression)), true)
    }
    update() {
        super.update();
        if (this.drawer) {
            this.drawer.pos = { x:this.size.w, y:this.drawer.pos.y };
        }
    }
    onmouseclick() {
        this.performReduction();
    }
    reduce() {
        console.log('reduce');
        if (this.subReduceMethod) {
            let r;
            let args = this.methodArgs;
            console.log(args);
            if (args.length > 0) // Add arguments to method call.
                r = this.subReduceMethod(this.holes[0], ...args);
            else r = this.subReduceMethod(this.holes[0]); // Method doesn't take arguments.
            if (r == this.holes[0]) return this;
            else return r;
        } else return this;
    }
    setExtension(methodText, subReduceMethod=null, argExprs=null) {
        if (this.holes[1]) this.holes.splice(1, 1);
        if (!subReduceMethod) {
            subReduceMethod = this.objMethods[methodText];
        }
        if (!argExprs) {
            let numArgs = subReduceMethod.length - 1;
            argExprs = []
            while (numArgs > 0) {
                let me = new MissingExpression();
                me._size = { w:44, h:44 };
                argExprs.push(me);
                numArgs--;
            }
        }

        // Left text
        let methodtxt = new TextExpr('.' + methodText + '(');
        methodtxt.fontSize = 22;
        methodtxt._yMultiplier = 3.4;
        methodtxt._xOffset = -15;
        methodtxt._sizeOffset = {w:-10, h:0};
        this.subReduceMethod = subReduceMethod;
        this.addArg(methodtxt);

        // Arguments / closing parentheses
        if (argExprs && argExprs.length > 0) {

            this.addArg(argExprs[0]);
            for (let i = 1; i < argExprs.length; i++) {
                let comma = new TextExpr(','); // comma to separate arguments
                comma.fontSize = methodtxt.fontSize;
                comma._yMultiplier = methodtxt._yMultiplier;
                this.addArg(comma);
                this.addArg(argExprs[i]);
            }
            let closingParen = new TextExpr(')'); // comma to separate arguments
            closingParen.fontSize = methodtxt.fontSize;
            closingParen._yMultiplier = methodtxt._yMultiplier;
            this.addArg(closingParen);

        } else methodtxt.text += ')'; // just add closing paren.

        this.update();

        // TODO: Add recursive drawers...
        //this.drawer.close(false);

        this.removeChild(this.drawer);
        this.drawer = null;
    }
}

class ArrayObjectExpr extends ObjectExtensionExpr {
    constructor(baseArray, defaultMethodCall=null, defaultMethodArgs=null) {
        super(baseArray,

              { // Reduce methods for the submethods of the object.
                'pop':(arrayExpr) => {
                    if (arrayExpr.items.length === 0) return arrayExpr; // TODO: This should return undefined.
                    let item = arrayExpr.items[0].clone();
                    return item;
              },
                'push':(arrayExpr, pushedExpr) => {

                    if (pushedExpr instanceof ArrayObjectExpr)
                        pushedExpr = pushedExpr.holes[0];

                    if (!pushedExpr ||
                        pushedExpr instanceof MissingExpression ||
                        pushedExpr instanceof LambdaVarExpr)
                        return arrayExpr;
                    else {
                        let new_coll = arrayExpr.clone();
                        new_coll.addItem(pushedExpr.clone()); // add item to bag
                        return new_coll; // return new bag with item appended
                    }
              },
                'map':(arrayExpr, lambdaExpr) => {
                    let mapped = arrayExpr.map(lambdaExpr);
                    if (mapped) {
                        mapped.items = mapped.items.map((i) => i.reduceCompletely());
                        return mapped;
                    }
                    else return arrayExpr;
        }});

        if (baseArray instanceof CollectionExpr) baseArray.disableSpill();
        this.color = 'YellowGreen';

        if (!defaultMethodCall) {}
        else if (defaultMethodCall in this.objMethods) {
            this.setExtension(defaultMethodCall); // TODO: method args
        } else {
            console.error('@ ArrayObjectExpr: Method call ' + defaultMethodCall + ' not a possible member of the object.');
        }

        this.defaultMethodCall = defaultMethodCall;
        this.defaultMethodArgs = defaultMethodArgs;
    }
    get constructorArgs() { return [this.holes[0].clone(), this.defaultMethodCall, this.defaultMethodArgs]; }
    reduce() {
        let r = super.reduce();
        if (r != this && r instanceof BracketArrayExpr) {
            return new ArrayObjectExpr(r); // if reduce value is itself an array, make it an Array object that the user can apply methods to.
        }
        return r;
    }
}

class DropdownCell extends mag.Rect {
    constructor(x, y, w, h, subexpr, onclick, color, highlightColor) {
        super(x, y, w, h);
        this.shadowOffset = 0;
        this.color = color;
        this.origColor = color;
        this.highlightColor = highlightColor;
        if (subexpr instanceof Expression) {
            if (subexpr instanceof TextExpr) {
                subexpr.pos = { x:w/20, y:h/2+22/4 };
                subexpr.fontSize = 22;
            }
            this.addChild(subexpr);
        }
        this.onclick = onclick;
    }
    onmouseenter(pos) {
        this.color = this.highlightColor;
    }
    onmouseclick(pos) {
        if (this.onclick) this.onclick(this);
    }
    onmouseleave(pos) {
        this.color = this.origColor;
    }
}

class DropdownSelect extends mag.Rect {
    constructor(x, y, cellW, cellH, exprs, onCellClick, lowColor, highColor, highlightColor, startExpanded=true) {
        super(x, y, cellW, startExpanded ? cellH*exprs.length : cellH);
        this.highColor = highColor;
        this.lowColor = lowColor;

        // Create cells + add:
        this.cells = [];
        let cellX = 0;
        let cellY = 0;
        for (let i = 0; i < exprs.length; i++) {
            let cellColor = i % 2 === 0 ? lowColor : highColor;
            let onclick = (cell) => this.clicked(cell);
            let cell = new DropdownCell(cellX, cellY, cellW, cellH, exprs[i], onclick, cellColor, highlightColor);
            this.cells.push(cell);
            if (startExpanded || i === 0) this.addChild(cell);
            cellY += cellH;
        }

        this.onCellClick = onCellClick;
    }

    relayoutCells() {
        let cellX = 0;
        let cellY = 0;
        this.cells.forEach((c, i) => {
            c.origColor = c.color = i % 2 === 0 ? this.lowColor : this.highColor;
            c.pos = { x:cellX, y:cellY };
            cellY += c.size.h;
        });
    }
    resize() {
        const cellsize = this.children[0].size;
        this.size = { w:cellsize.w, h:cellsize.h*this.children.length };
    }

    expand(animated=false) {
        if (this.cells.length <= 1) return;
        else if (animated) {
            const FADE_TIME = 100;
            let waittime = 0;
            this.cells.slice(1).forEach((c, i) => {
                c.opacity = 0;
                Animate.wait(waittime).after(() => {
                    Animate.tween(c, { opacity:1.0 }, FADE_TIME, (e) => {
                        this.stage.draw();
                        return e;
                    }).after(() => {
                        c.opacity = 1.0;
                        this.resize();
                        this.stage.draw();
                    });
                });
                waittime += FADE_TIME;
                this.children[i+1] = c;
            });
        }
        else {
            this.children = this.cells.slice();
            this.relayoutCells();
            this.resize();
            this.stage.draw();
        }
    }
    close() {
        this.children = this.cells.slice(0, 1);
        this.resize();
        this.relayoutCells();
        this.stage.draw();
    }

    clicked(cell) {
        const cellIdx = this.cells.indexOf(cell);
        if (cellIdx < 0 || cellIdx >= this.cells.length) {
            console.error('@ DropdownSelect: Cell index out of range.');
            return;
        } else if (this.children.length === 1) { // closed. do nothing
            this.expand(false);
            return;
        }

        // Move clicked cell to front of array.
        let clickedCell = this.cells.splice(cellIdx, 1)[0];
        this.cells.splice(0, 0, clickedCell);

        // Close select
        this.close();

        // Fire callback
        if (this.onCellClick) this.onCellClick(cell);
    }
}

class PulloutDrawerHandle extends mag.ImageRect {
    constructor(x, y, w, h, onclick) {
        super(x, y, w, h, 'handle');
        this.onclick = onclick;
    }

    // Events
    onmouseenter(pos) {
        super.onmouseenter(pos);
        document.querySelector('canvas').style.cursor = 'pointer'; // col-resize is another option
    }
    onmouseclick(pos) {
        if(this.onclick) this.onclick();
    }
    onmouseleave(pos) {
        super.onmouseleave(pos);
        document.querySelector('canvas').style.cursor = 'auto';
    }
}

class PulloutDrawer extends mag.Rect {
    constructor(x, y, w, h, propertyTree, onCellSelect) {
        super(x, y, w, h);
        this.color = null;

        let onclick = () => {
            if (this.isOpen) this.close();
            else             this.open();
        };

        let cellBg = new mag.Rect(0, 0, 0, h);
        cellBg.color = "Green";
        cellBg.ignoreEvents = true;
        this.addChild(cellBg);
        this.cellBg = cellBg;

        let handle = new PulloutDrawerHandle(0, 0, w, h, onclick);
        this.addChild(handle);
        this.handle = handle;

        // Generate TextExpr for each property:
        let txts = [];
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
        this.onCellSelect = onCellSelect;
    }

    // Open the drawer
    open() {
        const DUR = 300;
        const W = 130;
        const cellsize = this.cellBg.size;
        const smoothFunc = (e) => Math.pow(e, 2);
        Animate.tween(this.cellBg, { size:{w:W, h:cellsize.h} }, DUR, smoothFunc);
        Animate.tween(this.handle, { pos:{x:W, y:0} }, DUR, smoothFunc);
        Animate.wait(DUR).after(() => {

            // Open the dropdown box.
            let dropdown = new DropdownSelect( 0, 0, W, cellsize.h, this.txts, this.onCellSelect, "YellowGreen", "MediumSeaGreen", "PaleGreen", false );
            this.addChild(dropdown);
            this.dropdown = dropdown;
            dropdown.expand(true);
        });
        Resource.play('drawer-open');
        this.isOpen = true;
    }

    // Close the drawer
    close(animated=true) {
        this.removeChild(this.dropdown);
        if (animated) {
            const DUR = 200;
            Animate.tween(this.cellBg, { size:{w:0, h:this.cellBg.size.h} }, DUR);
            Animate.tween(this.handle, { pos:{x:0, y:0} }, DUR);
            Resource.play('drawer-close');
        } else {
            this.cellBg.size = { w:0, h:this.cellBg.size.h };
            this.handle.pos = zeroPos();
        }
        this.isOpen = false;
    }

}
