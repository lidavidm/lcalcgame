/* The journal overlay. */
class SyntaxJournal extends mag.Rect {
    constructor() {
        super(0, 0, GLOBAL_DEFAULT_SCREENSIZE.w / 1.8,
                    GLOBAL_DEFAULT_SCREENSIZE.h / 1.4);
        this._viewingStage = null;
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
        const exprs = this._syntaxKnowledge.expressions();
        let pos = { x:0, y:0 };
        const padding = 4;
        for (const e of exprs) {
            e.pos = clonePos(pos);
            this.addChild(e);
            this.update();
            pos.y += e.absoluteSize.h + padding;
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
        stage.add(this);
        this._viewingStage = stage;
        this.ignoreEvents = false;
    }
    close() {
        if (!this.isOpen) return;
        this._viewingStage.remove(this);
        this._viewingStage = null;
    }
}

/* Model for storing syntax knowledge acquired through play. */
class SyntaxKnowledge {
    constructor(defaultsUnlocked=[]) {
        const map = {
            '==': '_ == _',
            '?:': '_b ? _ : _',
            '=>': '(x) => _',
            'map': '__.map(_l)'
        };
        this._map = map;
        this._unlocked = defaultsUnlocked;
    }
    * expressions() {
        const len = this._unlocked.length;
        let i = 0;
        while(i < len) {
            yield ES6Parser.parse(this._map[this._unlocked[i]]);
            i++;
        }
    }
    unlock(syntaxKey) {
        if (syntaxKey in map) {
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
    toJSON() { return JSON.stringify(this._unlocked); }
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
        });
    }

}
