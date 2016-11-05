// The panel at the bottom of the screen.
class EnvironmentDisplay extends mag.Rect {
    constructor(x, y, w, h, stage) {
        super(x, y, w, h);
        this.color = "#444";
        this.padding = 20;
        this.env = null;
        this.stage = stage;
        this.contents = [];
        this.bindings = {};
        this.highlighted = null;
        this.toolbox = true;
    }

    get leftEdgePos() { return { x:this.padding + this.pos.x, y: 2 * this.padding + this.pos.y }; }

    showEnvironment(env) {
        if (!env) return;
        if (!this.stage) return;
        this.clear();
        this.env = env;
        let pos = this.leftEdgePos;
        let setup = (e, padding, newRow) => {
            e.update();
            e.ignoreEvents = true;
            e.toolbox = true;
            this.stage.add(e);
            this.contents.push(e);
            e.anchor = { x:0, y:0.5 };
            e.pos = pos;
            e.scale = { x: 1, y: 1 };
            if (newRow) {
                pos = addPos(pos, { x: 0, y: e.size.h } );
                pos.x = this.leftEdgePos.x;
            }
            else {
                pos = addPos(pos, { x: e.size.w, y: 0 } );
            }
        };
        env.names().forEach((name) => {
            // let label = new TextExpr(name + "=");
            // label.color = "#EEE";
            // setup(label, 0, false);

            let e = env.lookup(name).clone();
            // setup(e, this.padding, true);
            let display = new DisplayChest(name, e);
            if (this.bindings[name]) {
                display = this.bindings[name];
                this.bindings[name].holes[0] = e;
            }
            this.bindings[name] = display;
            setup(display, this.padding, true);
        });
    }

    showGlobals() {
        this.clear();
        this.showEnvironment(this.stage.environment);
    }

    // Show an animation in preparation for updating a binding
    prepareAssign(name) {
        if (this.bindings[name] && this.bindings[name].prepareAssign) {
            return this.bindings[name].prepareAssign();
        }
        return null;
    }

    clear() {
        if (!this.stage) return;
        for (let child of this.contents) {
            this.stage.remove(child);
        }
        this.bindings = {};
        this.contents = [];
        this.env = null;
        this.highlighted = null;
    }

    highlightName(name) {
        let next = false;
        for (let expr of this.contents) {
            if (expr instanceof TextExpr && expr.text === name + "=") {
                this.highlighted = expr;
                expr.color = 'green';
                next = true;
            }
            else if (next) {
                expr.onmouseenter();
                break;
            }
        }
    }

    clearHighlight() {
        if (this.highlighted) {
            this.highlighted.color = 'white';
            this.highlighted = null;
        }
    }

    // Disable highlighting on hover
    onmouseenter(pos) {}
    onmouseleave(pos) {}
}
