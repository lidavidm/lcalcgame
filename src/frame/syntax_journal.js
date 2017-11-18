/* The journal overlay. */
class SyntaxJournal extends mag.ImageRect {
    constructor(knowledge=null) {
        super(0, 0, GLOBAL_DEFAULT_SCREENSIZE.w / 1.8,
                    GLOBAL_DEFAULT_SCREENSIZE.h / 1.4,
              'journal-bg');
        this._viewingStage = null;
        this.shadowOffset = 0;
        this.color = 'beige';
        this.highlightColor = null;
        this._syntaxKnowledge = knowledge;
    }

    // Setting expressions in the journal,
    // as a list of parseable statements e.g.
    // [ 'x => x', '_ == _', '_b ? _ : _' ]
    get knowledge() { return this._syntaxKnowledge; }
    set knowledge(syntaxKnowledge) {
        this._syntaxKnowledge = syntaxKnowledge;
        this.renderKnowledge();
    }
    renderKnowledge() {
        this.children = [];
        const exprs = this._syntaxKnowledge.expressions;
        const VERT_PAD = 8;
        const CORNER_PAD = 20;
        const TOP_PAD = 40;
        let pos = { x:CORNER_PAD, y:TOP_PAD + CORNER_PAD };
        for (const e of exprs) {
            e.pos = clonePos(pos);
            this.addChild(e);
            this.update();
            pos.y += e.absoluteSize.h + VERT_PAD;
        }
    }

    // Opening and closing the journal.
    get isOpen() { return this._viewingStage != null; }
    toggle(stage) {
        if (this.isOpen)  this.close();
        else              this.open(stage);
    }
    open(stage) {
        if (this.isOpen) {
            if (stage != this._viewingStage)
                console.warn('Stage mismatch.');
            return;
        }

        const sz = stage.boundingSize;

        const bg = new mag.Rect(sz.w/2.0, sz.h/2.0, sz.w, sz.h);
        bg.anchor = { x:0.5, y:0.5 };
        bg.color = "black";
        bg.highlightColor = null;
        bg.opacity = 0.0;
        bg.onmousedown = () => this.onmousedown();
        stage.add(bg);

        Animate.tween(bg, {opacity:0.5}, 200, (e) => e * e);

        this.anchor = { x:0.5, y:0.5 };
        this.pos = { x:sz.w/2.0, y:sz.h/2.0 };
        stage.add(this);

        this._bg = bg;
        this._viewingStage = stage;
        this.ignoreEvents = false;

        stage.update();
        stage.draw();
    }
    close() {
        if (!this.isOpen) return;
        this._viewingStage.remove(this);
        this._viewingStage.remove(this._bg);
        this._viewingStage = null;
        this._bg = null;
    }

    onmousedown() {
        this.close();
    }
    onmousedrag() {}
}

/* Button for accessing the journal. */
class SyntaxJournalButton extends mag.Button {

    constructor(syntaxJournal) {
        const imgs = {
            default: 'journal-default',
            hover:   'journal-hover',
            down:    'journal-mousedown'
        };
        super(imgs, () => { //onclick
            syntaxJournal.toggle(this.stage);
            this.stage.bringToFront(this);
        });
        this.journal = syntaxJournal;
    }

    // Animate the expression on the stage
    // to 'fly into' the journal icon.
    // Used to visualize 'collecting' syntax.
    flyIn(expr) {
        if (!expr.stage) return;

        expr.ignoreEvents = true;
        const stage = expr.stage;
        const pos = this.absolutePos;
        return new Promise(function(resolve, reject) {
            //ShapeExpandEffect.run(expr, 1200, e=>e, "white", 2, () => {
            Animate.wait(400).after(() => {
                Animate.tween(expr, { pos: pos, anchor: {x:0.5, y:0.5}, scale:{ x:0.5, y:0.5 }}, 2000, Animate.EASE.SIGMOID).after(() => {
                    expr.opacity = 1.0;
                    ShapeExpandEffect.run(expr, 400);
                    Animate.tween(expr, { opacity: 0.0 }, 400).after(() => {
                        stage.remove(expr);
                        resolve();
                    });
                });
            });
        });

        //ShapeExpandEffect.run(expr);
    }

}

/* Model for storing syntax knowledge acquired through play. */
class SyntaxKnowledge {
    constructor(defaultsUnlocked=[]) {
        const img_prefix = 'journal-syntax-';
        const img = (tag) => (img_prefix + tag);
        const map = {
            '==': {
                form: '_ == _',
                src: img('equality')
            },
            '?:': {
                form: '_b ? _ : _',
                src: img('ternary')
            },
            '=>': {
                form: '(x) => _',
                src: img('anonfunc')
            },
            'map': {
                form: '__.map(_l)',
                src: img('map')
            },
            '+': {
                form: '_ + _',
                src: img('concat')
            },
            '""': {
                form: '"..."',
                src: img('quotes')
            },
            '[]': {
                form: '[0, 1, 2]',
                src: img('list')
            }
        };
        this._map = map;
        this._unlocked = defaultsUnlocked;
    }
    get expressions() {
        //const dfl = ExprManager.getDefaultFadeLevel();
        //ExprManager.setDefaultFadeLevel(1); // disable concrete representations for this parsing
        //const es = this._unlocked.map((e) => ES6Parser.parse(this._map[e].form));
        const es = this._unlocked.map((e) => new ImageExpr(this._map[e].src) );
        es.forEach((e) => {
            e.ignoreEvents = true;
            e.graphicNode.blendMode = 'multiply';
        });
        //ExprManager.setDefaultFadeLevel(dfl);
        return es;
    }
    isUnlocked(syntaxKey) {
        return this._unlocked.indexOf(syntaxKey) > -1;
    }
    unlock(syntaxKey) {
        if (this.isUnlocked(syntaxKey)) {
            // Already unlocked this key.
            return false;
        } else if (syntaxKey in this._map) {
            this._unlocked.push(syntaxKey);
            return true;
        } else {
            console.error(`Unkown syntax '${syntaxKey}'. Try adding '${syntaxKey}' to the syntax->expression map.`);
            return false;
        }
    }

    // This lets us makes the class JSON serialization,
    // e.g. we can call JSON.stringify(syntaxKnowledge) directly.
    // See JSON.stringify spec @ Mozilla for more details.
    toJSON() { return this._unlocked; }
}
