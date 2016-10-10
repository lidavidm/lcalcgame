// The panel at the bottom of the screen.
class EnvironmentDisplay extends mag.ImageRect {
    constructor(x, y, w, h, globals=null) {
        super(x, y, w, h, 'toolbox-bg');
        this.padding = 20;
        this.env = null;
        this.globals = globals ? globals : new Environment();
        this.contents = [];
    }

    get leftEdgePos() { return { x:this.padding * 2 + this.pos.x, y:this.size.h / 2.0 + this.pos.y }; }

    showEnvironment(env) {
        if (!env) return;
        this.clear();
        this.env = env;
        let pos = this.leftEdgePos;
        let setup = (e, padding) => {
            e.update();
            this.stage.add(e);
            this.contents.push(e);
            e.anchor = { x:0, y:0.5 };
            e.pos = pos;
            pos = addPos(pos, { x:e.size.w, y:0 } );
        };
        env.names().forEach((name) => {
            let label = new TextExpr(name + "=");
            label.color = "white";
            setup(label, 0);

            let e = env.lookup(name).clone();
            setup(e, this.padding);
        });
    }

    showGlobals() {
        this.clear();
        this.showEnvironment(this.globals);
    }

    clear() {
        for (let child of this.contents) {
            this.stage.remove(child);
        }
        this.contents = [];
        this.env = null;
    }
}
