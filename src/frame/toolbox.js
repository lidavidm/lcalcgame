// The panel at the bottom of the screen.
class Toolbox extends mag.ImageRect {

    constructor(x, y, w, h, exprs=[]) {
        super(x, y, w, h, 'toolbox-bg');
        this.items = exprs;
        this.padding = 20;
        this.numRows = 1;
        this.rowHeight = Toolbox.defaultRowHeight;
    }

    static get defaultRowHeight() { return (__IS_MOBILE && this.md.phone()) ? 70 : 90; }
    get leftmostX() { return this.padding * 2 + this.pos.x; }
    get bottomLeftEdgePos() { return { x:this.leftmostX, y:this.pos.y - this.rowHeight / 2.0 }; }
    get topLeftEdgePos() { return { x:this.leftmostX, y:this.getCenterYPosForRow(0) }; }

    // Adds an expression to the toolbox. Animates to new position.
    addExpression(e, animated=true) {

        // Add expression to toolbox.
        let toolbox = this;
        this.items.push(e);
        e.toolbox = this;

        if (this.standardScale)
            e.scale = { x:this.standardScale, y:this.standardScale };

        //e.onmousedrag = function (pos) {
        //    super.onmousedrag(pos); // perform whatever the drag event is on this expression
        //    toolbox.removeExpression(e); // remove this expression from the toolbox
        //};

        // Disable the onclick handler so that you can't reduce things
        // in the toolbox
        e._origonmouseclick = e.onmouseclick;
        e.onmouseclick = function() {};

        // Animate new expression to toolbox position.
        this.setLayout(animated);
    }

    // Removes an expression from toolbox.
    removeExpression(e, animated=true) {
        let idx = this.items.indexOf(e);
        if (idx > -1) {
            this.items.splice(idx, 1);
            this.setLayout(animated); // rearrange remaining items
            e.scale = { x: 1, y: 1 };
            // Restore the onclick handler
            e.onmouseclick = e._origonmouseclick;
            console.log('removed', e);
        }
    }

    // Returns the number of toolbox 'rows' required
    // to fit all the given expressions on the screen.
    // * Note: You should scale them beforehand!
    getNumRowsToFit(exprs) {
        const padding = this.padding;
        const sum = (arr, f) => arr.reduce((a, b) => a + f(b), 0);
        const total_w = sum(exprs, (e) => e.absoluteSize.w + padding);
        const toolbox_w = this.absoluteSize.w - padding * 4;
        const rows = Math.trunc(total_w / toolbox_w) + 1;
        console.log(total_w, toolbox_w, total_w / toolbox_w);
        return rows;
    }
    getCenterYPosForRow(i) {
        const h = this.rowHeight;
        if (typeof this.numRows === 'undefined' || this.numRows === 1)
            return this.pos.y - h / 2.0;
        else return this.pos.y - h * (this.numRows - i - 1) - h / 2.0;
    }
    setNumRows(num_rows) {
        this.numRows = num_rows;
        this.updateRowHeightToItems();
        this.size = { w:this.size.w, h:this.rowHeight * num_rows };
    }
    updateRowHeightToItems() {
        let row_h = Math.max(...this.items.map((i) => i.absoluteSize.h)) + this.padding;
        if (this.numRows === 1 && row_h < Toolbox.defaultRowHeight)
            row_h = Toolbox.defaultRowHeight;
        this.rowHeight = row_h;
    }
    resizeToFitItems(animated=false) {
        this.items.forEach((i) => i.update());

        let rows = this.getNumRowsToFit(this.items);
        if (rows > 1) {

            // Now rescale expressions if rows is > 1,
            // to fit more expressions on the screen:
            const row_scale = Math.pow(1.0 / rows, 0.2);
            this.items.forEach((e) => {
                e.scale = { x:row_scale, y:row_scale };
            });
            this.standardScale = row_scale;

            // Now recalculate the number of rows given this new scale factor...
            rows = this.getNumRowsToFit(this.items);
        }

        this.setNumRows(rows);
        this.updateRowHeightToItems();
        this.setLayout(animated);
    }

    // Set expression positions in toolbox.
    setLayout(animated=false) {
        let pos = this.topLeftEdgePos;
        let currentRow = 0;
        const num_rows = this.numRows;
        const leftmost_x = pos.x;
        const toolbox_w = this.size.w;
        this.items.forEach((e) => {
            e.update();
            e.anchor = { x:0, y:0.5 };
            if (pos.x + e.absoluteSize.w > toolbox_w) { // move to next row
                currentRow += 1;
                pos.y = this.getCenterYPosForRow(currentRow);
                pos.x = leftmost_x;
            }
            if (animated) {
                Animate.tween(e, { pos:clonePos(pos) }, 200, (elapsed) => {
                    return Math.pow(elapsed, 0.5);
                });
            } else
                e.pos = clonePos(pos);
            pos.x += e.absoluteSize.w + this.padding;
        });
    }

    ondropped(node, pos) {

        // Fix for if the player is dragging a child, like MissingExpression.
        node = node.rootParent;

        if (!node.toolbox) {
            // Can't drag nodes onto toolbox that aren't already elements --
            // once it's placed on the board, you can't drag it back.
            Logger.log('toolbox-reject', node.toString());
            Animate.tween(node, { pos:{x:node.pos.x, y:this.topLeftEdgePos.y - node.absoluteSize.h * 2} }, 200, (elapsed) => Math.pow(elapsed, 2));
            return;
        } else if (node.toolbox && node.toolbox != this) {
            console.error('@ Toolbox.ondropped: Node toolbox does not match current toolbox instance.');
            return;
        }

        // User changed their minds about removing item from toolbox.
        // Add item back to the toolbox.
        console.log('adding back', node);
        this.addExpression(node);
        console.log(this.items);
        Logger.log('toolbox-addback', node.toJavaScript());
    }

}
