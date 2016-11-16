class MenuButton extends mag.RoundedRect {
    constructor(x, y, w, h, text, onclick, color='gold', textColor='orange', shadowColor='orange', onDownShadowColor='red') {
        super(x, y, w, h, 10);

        let t = new TextExpr(text, 'Futura');
        t.color = textColor;
        t.anchor = { x:0.5, y:0.5 };
        t.pos = { x:w/2, y:h/2 };
        this.text = t;
        this.addChild(t);

        this.origShadowOffset = 14;
        this.shadowOffset = 14;
        this.hoverIndent = -4;
        this.downIndent = 4;
        this.shadowColor = shadowColor;
        this.onDownShadowColor = onDownShadowColor;
        this.onUpShadowColor = shadowColor;
        this.onUpColor = color;
        this.textColor = textColor;
        this.color = color;

        this.clickFunc = onclick;

        this.pos = { x:x, y:y };
    }

    get pos() { return { x:this._pos.x, y:this._pos.y }; }
    set pos(p) {
        super.pos = p;
        this._origpos = { x:p.x, y:p.y };
    }

    runButtonClickEffect() {

        var rr = new mag.RoundedRect( this.absolutePos.x, this.absolutePos.y,
                                      this.absoluteSize.w, this.absoluteSize.h, this.radius );
        rr.color = null;
        rr.shadowOffset = 0;
        rr.anchor = this.anchor;
        rr.ignoreEvents = true;
        rr.stroke = { color:'white', lineWidth:4, opacity:1.0 };
        this.stage.add(rr);

        Animate.chain((elapsed) => {
            let c = colorTween(elapsed, [1, 215/255.0, 0], [1, 1, 1]);
            let sc = colorTween(elapsed, [1, 0, 0], [0.8, 0.8, 0.8]);
            this.color = c;
            this.text.color = c;
            this.shadowColor = sc;
            this.stage.draw();
        }, 200, null,
        (elapsed) => {
            //elapsed = elapsed * elapsed;
            rr.scale = { x:1+elapsed, y:1+elapsed };
            rr.stroke.opacity = 1-elapsed;
            this.stage.draw();
        }, 160, () => {
            this.stage.remove(rr);
            this.onmouseleave();
            this.stage.draw();
            if (this.clickFunc) {
                this.clickFunc();
            }
        });
    }

    onmouseenter(pos) {
        this.color = this.shadowColor;
        this.shadowColor = this.onDownShadowColor;
        this.shadowOffset = this.origShadowOffset - this.hoverIndent;
        this.text.color = 'white';
        this._pos.y += this.hoverIndent;
    }
    onmouseleave(pos) {
        this.color = this.onUpColor;
        this.shadowColor = this.onUpShadowColor;
        this.text.color = this.textColor;
        this._pos.y = this._origpos.y;
        this.shadowOffset = this.origShadowOffset;
    }
    onmousedown(pos) {
        this._prevy = this._pos.y;
        this._pos.y += this.shadowOffset - this.downIndent;
        this.shadowOffset = this.downIndent;
        //this.color = this.onUpColor;
    }
    onmouseup(pos) {
        this._pos.y = this._origpos.y;
        this.shadowOffset = this.origShadowOffset;
        this.runButtonClickEffect();
    }
}

class MainMenu extends mag.Stage {

    constructor(canvas=null, onClickPlay, onClickSettings) {
        super(canvas);

        this.showTitle();
        this.showPlayButton(onClickPlay);
        this.showSettingsButton(onClickSettings);
    }

    showTitle() {
        let title = new TextExpr('R (E) D U C T', 'Futura', 80);
        title.color = 'black';
        title.anchor = { x:0.5, y:0.5 };
        title.pos = { x:GLOBAL_DEFAULT_SCREENSIZE.width / 2.0, y:GLOBAL_DEFAULT_SCREENSIZE.height / 5 };
        this.add(title);
        console.log(title);
    }

    showPlayButton(onClickPlay) {
        let b = new MenuButton(GLOBAL_DEFAULT_SCREENSIZE.width / 2.0,
                               GLOBAL_DEFAULT_SCREENSIZE.height / 2.0,
                               140, 100,
                               'Play', onClickPlay);
        b.anchor = { x:0.5, y:0.5 };
        this.add(b);
    }

    showSettingsButton(onClickSettings) {
        let b = new MenuButton(GLOBAL_DEFAULT_SCREENSIZE.width / 2.0,
                               GLOBAL_DEFAULT_SCREENSIZE.height / 2.0 + 120,
                               140, 60,
                               'Settings',
                               onClickSettings,
                               'Purple', 'lightgray', 'Indigo', 'Purple');
        b.anchor = { x:0.5, y:0.5 };
        this.add(b);
    }
}

class DraggableRect extends mag.Rect {
    constrainX() { this.cX = true; }
    constrainY() { this.cY = true; }
    snapEvery(step, offset) { this.snapStep = step; this.snapOffset = offset; }
    onmousedrag(pos) {
        if (this.cX) pos.x = this.pos.x;
        if (this.cY) pos.y = this.pos.y;
        this.pos = pos;
    }
    onmouseup(pos) {
        if (!this.snapStep) {
            super.onmouseup(pos);
            return;
        }

        let targetPos = { x:Math.round(this.pos.x / this.snapStep) * this.snapStep + this.snapOffset, y:this.pos.y };
        Animate.tween(this, { pos:targetPos }, 200, (elapsed) => Math.pow(elapsed, 0.5));
    }
}

class ChapterCard extends mag.Rect {
    constructor(x, y, w, h, name, desc, icon, onclick) {

        const TXTPAD = 50;
        super(x, y, w, h);

        // Visual icon
        let img = new mag.ImageRect(0, 0, w, h - TXTPAD, icon);
        img.ignoreEvents = true;
        this.addChild(img);

        // Chapter name
        let txt = new TextExpr(name, 'Futura');
        txt.color = 'white';
        txt.pos = { x:img.pos.x+img.size.w/2.0,
                    y:img.pos.y+img.size.h+txt.fontSize };
        txt.anchor = { x:0.5, y:0 };
        this.addChild(txt);

        this.name = name;
        this.onclick = onclick;
    }

    onmouseclick(pos) {
        if (this.onclick)
            this.onclick(this.name);
    }
}

class ChapterSelectMenu extends mag.Stage {
    constructor(canvas, onChapterSelect) {
        super(canvas);
        this.showChapters(onChapterSelect);
    }

    showChapters(onselect) {

        let W = 200; let P = 40; let X = 0;
        let onChapterSelect = onselect;
        console.log(onChapterSelect);
        let container = new DraggableRect(GLOBAL_DEFAULT_SCREENSIZE.width / 2.0 - W / 2.0, 100, 1000, 300);
        container.constrainY();
        container.color = 'lightgray';
        container.shadowOffset = 0;
        container.snapEvery(W + P, W / 2.0 - P);
        this.add(container);

        Resource.getChapters().then((chapters) => {
            container.size = { w:(W + P) * chapters.length, h:300 };
            chapters.forEach((chap) => {

                let c = new ChapterCard(X, 0, W, 300, chap.name, chap.description, null, onChapterSelect);
                //c.ignoreEvents = true;
                c.color = 'HotPink';
                c.onmousedrag = (pos) => {
                    pos.x -= c.pos.x;
                    container.onmousedrag(pos);
                };
                c.onmouseup = (pos) => {
                    pos.x -= c.pos.x;
                    container.onmouseup(
                        pos);
                };
                container.addChild(c);

                X += W + P;

            });
        });

    }
}

class LevelCell extends mag.RoundedRect {
    constructor(x, y, w, h, name, icon, onclick) {
        super(x, y, w, h);

        this.shadowOffset = 10;

        // Visual icon
        if (icon) {
            let img = new mag.ImageRect(0, 0, w, h, icon);
            img.ignoreEvents = true;
            this.addChild(img);
        } else { // Default to text displaying level index.
            let txt = new TextExpr(name.toString(), 'Futura');
            txt.color = 'white';
            txt.anchor = { x:0.5, y:0.5 };
            txt.pos = { x: w / 2.0, y: w / 2.0 };
            this.addChild(txt);
        }

        this.name = name;
        this.onclick = onclick;
    }
    onmouseclick(pos) {
        if (this.onclick)
            this.onclick();
    }
}

class LevelSelectMenu extends mag.Stage {
    constructor(canvas, chapterName, onLevelSelect) {
        super(canvas);
        this.showGrid(chapterName, onLevelSelect);
    }

    showGrid(chapterName, onselect) {

        // Layout measurement
        const levels = Resource.levelsForChapter(chapterName);
        const NUM_CELLS = levels.length; // total number of cells to fit on the grid
        const CELL_SIZE = 124; // width and height of each cell square, in pixels
        const SCREEN_WIDTH = GLOBAL_DEFAULT_SCREENSIZE.width; // the width of the screen to work with
        const PADDING = 20; // padding between cells
        const GRID_MARGIN = 20; // margin bounding grid on top, left, and right sides
        const NUM_COLS = Math.trunc((SCREEN_WIDTH - GRID_MARGIN*2) / (CELL_SIZE + PADDING)); // number of cells that fit horizontally on the screen
        const NUM_ROWS = Math.trunc(NUM_CELLS / NUM_COLS + 1); // number of rows
        const GRID_LEFTPAD = (SCREEN_WIDTH - ((CELL_SIZE + PADDING) * NUM_COLS + GRID_MARGIN*2)) / 2.0;

        console.log(SCREEN_WIDTH - GRID_MARGIN*2, CELL_SIZE + PADDING, NUM_CELLS, NUM_COLS, NUM_ROWS);

        const genClickCallback = (level_idx) => {
            return () => onselect(levels[level_idx]);
        };

        const leftmost = GRID_LEFTPAD + GRID_MARGIN;
        let x = leftmost;
        let y = GRID_MARGIN;

        for (let r = 0; r < NUM_ROWS; r++) {

            let i = r * NUM_COLS;

            for (let c = 0; c < NUM_COLS; c++) {

                // Create a level cell and add it to the grid.
                let cell = new LevelCell(x + CELL_SIZE / 2.0, y + CELL_SIZE / 2.0, CELL_SIZE, CELL_SIZE, i, null, genClickCallback(i));
                cell.anchor = { x:0.5, y:0.5 };
                cell.color = 'LightGreen';
                cell.shadowColor = 'Green';
                cell.highlightColor = 'green';
                this.add(cell);

                // Animate cell into position.
                cell.scale = { x:0.2, y:0.2 };
                Animate.wait(i * 50).after(() => {
                    Animate.tween(cell, { scale: { x:1, y:1 } }, 300, (elapsed) => Math.pow(elapsed, 0.5));
                });

                // Increment x-position.
                x += CELL_SIZE + PADDING;

                // The level index, calculated from the row and column indices.
                i++;
                if (i >= NUM_CELLS) break;
            }

            if (i >= NUM_CELLS) break;

            // Increment y-position and set x-position left.
            y += CELL_SIZE + PADDING;
            x = leftmost;
        }


    }
}
















{}
