// The panel at the bottom of the screen.
class EnvironmentDisplay extends mag.ImageRect {
    constructor(x, y, w, h) {
        super(x, y, w, h, 'toolbox-bg');
        this.padding = 20;
        this.env = null;
        this.contents = [];
        this.opacity = 0.1;
    }

    get leftEdgePos() { return { x:this.padding * 2 + this.pos.x, y:this.size.h / 2.0 + this.pos.y }; }

    showEnvironment(env) {
        if (!env) return;
        this.opacity = 0.8;
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
            setup(label, 0);

            let e = env.lookup(name).clone();
            setup(e, this.padding);
        });
    }

    clear() {
        this.opacity = 0.1;
        if (this.env) {
            for (let child of this.contents) {
                this.stage.remove(child);
            }
        }
        this.contents = [];
        this.env = null;
    }
}
