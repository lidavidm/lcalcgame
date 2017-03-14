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
        this.onDownColor = shadowColor;
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
        this.color = this.onDownColor;
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
    onmousedrag(pos) {
        let hits = this.hits(pos);
        if (!hits && this.color !== this.onUpColor) {
            this.onmouseleave(pos);
        } else if (this.color === this.onUpColor && hits) {
            this.onmouseenter(pos);
            this.onmousedown(pos);
        }
    }
    onmousedown(pos) {
        this._prevy = this._pos.y;
        this._pos.y += this.shadowOffset - this.downIndent;
        this.shadowOffset = this.downIndent;
        //this.color = this.onUpColor;
        Resource.play('fatbtn-click');
    }
    onmouseup(pos) {
        if (!this.hits(pos)) return;
        this._pos.y = this._origpos.y;
        this.shadowOffset = this.origShadowOffset;
        this.runButtonClickEffect();
        Animate.wait(50).after(() => Resource.play('fatbtn-beep'));
    }
}

class MenuStar extends mag.ImageRect {
    constructor() {
        super('mainmenu-star' + Math.floor(Math.random() * 14 + 1));
    }
    twinkle(dur=350) {
        const blinkDur = dur + Math.random() * 100;
        let _this = this;
        let blink = () => {
            if (_this.cancelBlink) return;
            Animate.tween(_this, { opacity:0.4 }, blinkDur, (e) => Math.pow(e, 2)).after(() => {
                if (_this.cancelBlink) return;
                Animate.tween(_this, { opacity:1 }, blinkDur, (e) => Math.pow(e, 2)).after(blink);
            });
        };
        blink();
    }
}

class MainMenu extends mag.Stage {

    constructor(canvas=null, onClickPlay=null, onClickSettings=null) {
        super(canvas);

        let bg = new mag.Rect(0, 0, GLOBAL_DEFAULT_SCREENSIZE.width, GLOBAL_DEFAULT_SCREENSIZE.height);
        bg.color = '#594764';
        bg.pos = zeroPos();
        bg.ignoreEvents = true;
        this.add(bg);
        this.bg = bg;

        this.showStars();
        this.showStarboy(onClickPlay);
        this.showTitle();
        //this.showPlayButton(onClickPlay);
        //this.showSettingsButton(onClickSettings);
    }

    showStars() {
        const NUM_STARS = 70;
        const STARBOY_RECT = {x:GLOBAL_DEFAULT_SCREENSIZE.width / 2.0-298/1.8/2, y:GLOBAL_DEFAULT_SCREENSIZE.height / 2.1-385/1.8/2, w:298/1.8, h:385/1.8};
        let genRandomPt = () => {
            return randomPointInRect( {x:0, y:0, w:GLOBAL_DEFAULT_SCREENSIZE.width, h:GLOBAL_DEFAULT_SCREENSIZE.height} );
        };
        let stars = [];
        let n = NUM_STARS;
        while(n-- > 0) {

            // Create an instance of a star illustration.
            let star = new MenuStar();
            //star.anchor = { x:0.5, y:0.5 };

            // Find a random position that doesn't intersect other previously created stars.
            let p = genRandomPt();
            for (let i = 0; i < stars.length; i++) {
                let s = stars[i];
                let prect = {x:p.x, y:p.y, w:star.size.w, h:star.size.h};
                let srect = {x:s._pos.x, y:s._pos.y, w:s.size.w, h:s.size.h};
                if (intersects(STARBOY_RECT, prect) ||
                    intersects(prect, srect)) {
                    p = genRandomPt();
                    i = 0;
                }
            }

            // Set star properties
            star.pos = p;
            star.opacity = 0.4;
            const scale = Math.random() * 0.3 + 0.3;
            star.scale = { x:scale, y:scale };
            this.add(star);
            stars.push(star);

            // Twinkling effect
            Animate.wait(1000 * Math.random()).after(() => star.twinkle());

            // "Zoom"
            let screenCenter = {x:GLOBAL_DEFAULT_SCREENSIZE.width/2.0, y:GLOBAL_DEFAULT_SCREENSIZE.height/2.0};
            let fromCenter = fromTo( screenCenter, star.pos);
            let offscreenDest = addPos(screenCenter, rescalePos( fromCenter, screenCenter.x * 1.6));
            let comebackDest = addPos(screenCenter, rescalePos( fromCenter, 120));
            let zoom = () => {
                Animate.tween(star, { pos:offscreenDest, scale:{x:0.6,y:0.6} }, 3000 * distBetweenPos(star.pos, screenCenter) / distBetweenPos(offscreenDest, screenCenter),
                (e) => Math.pow(e, 0.8)).after(() => {
                    star.pos = comebackDest;
                    star.scale = { x:scale, y:scale };
                    star.opacity = 0;
                    zoom();
                });
            };
            star.zoomAnimation = () => {

                zoom();
                //Animate.wait(distBetweenPos(p, screenCenter) / distBetweenPos(offscreenDest, screenCenter) * 1000).after(zoom);
            };

        }
        this.stars = stars;
    }

    zoom() {
        this.stars.forEach((star) => {
            star.zoomAnimation();
        });
    }

    showStarboy(onclick) {
        let bg = this.bg;
        let _this = this;
        let starboy = new mag.Button(0, 0, 298/1.8, 385/1.8,
                                    {default:'mainmenu-starboy', hover:'mainmenu-starboy-glow', down:'mainmenu-starboy-glow'},
                                    () => {
                                        if (_this.title) _this.remove(_this.title);
                                        Resource.play('mainmenu-enter');
                                        starboy.cancelFloat = true;
                                        starboy.ignoreEvents = true;
                                        Animate.tween(starboy, { scale:{x:0.0, y:0.0} }, 2500, (e) => Math.pow(e, 2));
                                        Animate.wait(2000).after(() => {
                                            Animate.run((e) => {
                                                bg.color = colorTween(e, [89/255.0, 71/255.0, 100/255.0], [0, 0, 0]);
                                                _this.stars.forEach((s) => {
                                                    s.opacity = 1 - e;
                                                    s.cancelBlink = true;
                                                });
                                                _this.draw();
                                            }, 700).after(() => {
                                                _this.stars.forEach((s) => {
                                                    _this.remove(s);
                                                });
                                                _this.stars = [];
                                                _this.remove(starboy);
                                                _this.starboy = null;
                                                _this.draw();
                                                onclick();
                                            });
                                        });
                                        this.zoom();
                                    });
        starboy.anchor = { x:0.5, y:0.5 };
        starboy.pos = { x:GLOBAL_DEFAULT_SCREENSIZE.width / 2.0, y:GLOBAL_DEFAULT_SCREENSIZE.height / 2.1 };
        this.add(starboy);

        let y = starboy._pos.y;
        let float = 0;
        var twn = new mag.IndefiniteTween((delta) => {
            float += delta / 600;
            starboy.pos = { x:starboy.pos.x, y:y+Math.cos(float)*14 };
            if (starboy.cancelFloat) twn.cancel();
        });
        twn.run();
    }

    showTitle() {
        let title = new TextExpr('R   E   D   U   C   T', 'Consolas', 30);
        title.color = 'white';
        title.anchor = { x:0.5, y:0.5 };
        title.pos = { x:GLOBAL_DEFAULT_SCREENSIZE.width / 2.0, y:GLOBAL_DEFAULT_SCREENSIZE.height / 1.2 };
        this.add(title);
        this.title = title;
    }

    showPlayButton(onClickPlay) {
        let b = new MenuButton(GLOBAL_DEFAULT_SCREENSIZE.width / 2.0,
                               GLOBAL_DEFAULT_SCREENSIZE.height / 2.0 + 80,
                               140, 100,
                               'Play', onClickPlay);
        b.anchor = { x:0.5, y:0.5 };
        this.add(b);
    }

    showSettingsButton(onClickSettings) {
        let b = new MenuButton(GLOBAL_DEFAULT_SCREENSIZE.width / 2.0,
                               GLOBAL_DEFAULT_SCREENSIZE.height / 2.0 + 80 + 120,
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

class LevelCell extends MenuButton {
    lock() {
        this.text.text = '🔒';
        this.color = '#666';
        this.shadowColor = 'gray';
        this.pos = { x:this.pos.x, y:this.pos.y+this.shadowOffset-8 };
        this.shadowOffset = 8;
        this.ignoreEvents = true;
    }
}
class LevelSelectGrid extends mag.Rect {
    constructor(chapterName, onLevelSelect) {
        super(0, 0, 0, 0);
        this.color = null;
        this.showGrid(chapterName, onLevelSelect);
    }

    hide(dur) {
        let len = this.children.length;
        this.children.forEach((c, i) => {
            c.opacity = 1;
            Animate.tween(c, { scale: {x:0, y:0}, opacity:0 }, (len - i - 1) * 30).after(() => {
                this.removeChild(c);
            });
        });
        return Animate.wait((len - 1) * 30);
    }

    gridSizeForLevelCount(n) {
        if (n <= 8) return 124;
        else if (n <= 14) return 100;
        else return 84;
    }

    showGrid(chapterName, onselect) {

        // Layout measurement
        const levels = Resource.levelsForChapter(chapterName);
        const NUM_CELLS = levels[0].length; // total number of cells to fit on the grid
        const CELL_SIZE = this.gridSizeForLevelCount(NUM_CELLS); // width and height of each cell square, in pixels
        const SCREEN_WIDTH = GLOBAL_DEFAULT_SCREENSIZE.width; // the width of the screen to work with
        const PADDING = 20; // padding between cells
        const TOP_MARGIN = 20;
        const GRID_MARGIN = 80; // margin bounding grid on top, left, and right sides
        const NUM_COLS = Math.trunc((SCREEN_WIDTH - GRID_MARGIN*2) / (CELL_SIZE + PADDING)); // number of cells that fit horizontally on the screen
        const NUM_ROWS = Math.trunc(NUM_CELLS / NUM_COLS + 1); // number of rows
        const GRID_LEFTPAD = (SCREEN_WIDTH - ((CELL_SIZE + PADDING) * NUM_COLS + GRID_MARGIN*2)) / 2.0;

        console.log(levels);
        console.log(SCREEN_WIDTH - GRID_MARGIN*2, CELL_SIZE + PADDING, NUM_CELLS, NUM_COLS, NUM_ROWS);

        const genClickCallback = (level_idx) => {
            return () => onselect(levels[0][level_idx], levels[1] + level_idx);
        };

        const leftmost = GRID_LEFTPAD + GRID_MARGIN;
        let x = leftmost;
        let y = TOP_MARGIN;

        for (let r = 0; r < NUM_ROWS; r++) {

            let i = r * NUM_COLS;

            for (let c = 0; c < NUM_COLS; c++) {

                // Create a level cell and add it to the grid.
                let cell = new LevelCell(x + CELL_SIZE / 2.0, y + CELL_SIZE / 2.0, CELL_SIZE, CELL_SIZE, i.toString(), genClickCallback(i),
                                         r === 0 ? 'LightGreen' : 'Gold', 'white', r === 0 ? 'Green' : 'Teal', r === 0 ? 'DarkGreen' : 'DarkMagenta');
                cell.onDownColor = r === 0 ? 'YellowGreen' : 'Orange' ;
                cell.anchor = { x:0.5, y:0.5 };
                //if (i > 5) cell.lock();
                this.addChild(cell);

                // Animate cell into position.
                cell.scale = { x:0.0, y:0 };
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

class LevelSpot extends mag.Circle {
    constructor(x, y, r, onclick) {
        super(x, y, r);
        this.color = 'gray';
        this.enabled = false;
        this.shadowOffset = 0;
        this.highlightColor = 'lime';
        this.disabledColor = 'gray';
        this.enabledColor = 'white';
        this.stroke = { color:'black', lineWidth:2 };
        this.onclick = onclick;
        this.flashing = false;
    }
    flash() {
        this.enabledColor = 'cyan';
        this.color = 'cyan';

        if (this.flashing) return;
        this.flashing = true;
        const dur = 600;
        this.opacity =  1.0;
        let _this = this;
        let blink = () => {
            if (_this.cancelBlink) {
                this.flashing = false;
                return;
            }
            Animate.tween(_this, { opacity:0.4 }, dur, (e) => Math.pow(e, 2)).after(() => {
                if (_this.cancelBlink) {
                    this.flashing = false;
                    return;
                }
                Animate.tween(_this, { opacity:1 }, dur, (e) => Math.pow(e, 0.5)).after(blink);
            });
        };
        blink();
    }
    enable() {
        this.color = 'white';
        this.enabled = true;
        this.enabledColor = 'white';
    }
    disable() {
        this.color = 'gray';
        this.enabled = false;
    }
    onmouseenter(pos) {
        if (!this.enabled) return;
        this.stroke = { color:'yellow', lineWidth:this.stroke.lineWidth };
        this.color = this.highlightColor;
    }
    onmouseleave(pos) {
        if (!this.enabled) return;
        this.stroke = { color:'black', lineWidth:this.stroke.lineWidth };
        this.color = this.enabledColor;
    }
    onmouseclick(pos) {
        if (this.enabled && this.onclick) {
            this.onclick();
        }
    }
}

class PlanetCard extends mag.ImageRect {
    constructor(x, y, r, name, planet_image, onclick) {
        super(x, y, r*2, r*2, planet_image+'-locked');

        this.radius = r;
        this.name = name;
        this.onclick = onclick;

        // Backing Glow on Mouseover
        let glow = new mag.ImageRect(0, 0, r*2.5, r*2.5, 'planet-glow');
        glow.anchor = { x:0.5, y:0.5 };
        glow.pos = { x:r, y:r };
        glow.ignoreEvents = true;
        this.glow = glow;

        // Enable backing glow for newly accessible planet
        this.highlighted = false;

        // Text
        const capitalize = (string) => (string.charAt(0).toUpperCase() + string.slice(1));
        let t = new TextExpr(capitalize(name), 'Futura', 14);
        t.color = 'white';
        t.anchor = { x:0.5, y:0.5 };
        t.pos = { x:r, y: 2*r + 15 };
        this.text = t;
        //this.addChild(t);

        // Level path
        let path = new ArrowPath();
        path.stroke.color = 'white';
        path.stroke.lineDash = [5*this.radius/120];
        path.stroke.lineWidth = r / 120;
        path.drawArrowHead = false;
        path.ignoreEvents = true;
        this.path = path;
        this.addChild(path);

        this.pts = [];
        this.unitpos = (pos) => {
            pos = clonePos(pos);
            pos.x -= this.absolutePos.x;
            pos.y -= this.absolutePos.y;
            pos.x /= this.absoluteSize.w / 2;
            pos.y /= this.absoluteSize.h / 2;
            return pos;
        };
    }

    get landingPoint() {
        let a = this.absolutePos;
        return {x:a.x, y:a.y - this.absoluteSize.h / 3};
    }
    get localLandingPoint() {
        return {x:this.size.w/2.0, y:this.size.h/2.0 / 3};
    }

    showText() {
        if (this.children.indexOf(this.text) === -1)
            this.addChild(this.text);
    }
    hideText() {
        if (this.children.indexOf(this.text) > -1)
            this.removeChild(this.text);
    }

    showShip(worldShip) {
        // Create ship graphic
        let ship = new mag.RotatableImageRect('ship-small');
        ship.anchor = worldShip.anchor;
        ship.scale = worldShip.absoluteScale;
        ship.rotation = -Math.PI/2.0;
        //ship.scale = { x:0.5*r/120, y:0.5*r/120 };
        ship.pos = this.localLandingPoint;
        ship.ignoreEvents = true;
        this.ship = ship;
        this.addChild(ship);
    }
    hideShip() {
        if (this.ship) {
            this.removeChild(this.ship);
            this.ship = null;
        }
    }

    highlight() {
        this.highlighted = true;
        this.glow.opacity = 0.5;
    }

    removeHighlight() {
        this.highlighted = false;
        this.glow.opacity = 0;
    }

    onmouseclick() {
        if (this.onclick)
            this.onclick();
        this.selected = false;
    }
    onmouseenter() {
        this.selected = true;
        this.glow.opacity = this.highlighted ? 0.5 : 0.0;
        Animate.tween(this.glow, { opacity:1.0 }, 100).after(() => {
            this.glow.opacity = 1;
        });
    }
    onmouseleave(pos) {
        if (distBetweenPos(pos, this.pos) > this.absoluteSize.h / 4.0) {
            this.selected = false;
            if (this.highlighted) {
                this.highlight(); // Reset glow
            }
        }
    }

    drawInternal(ctx, pos, boundingSize) {
        if (this.highlighted || (this.selected && this.scale.x < 1.1)) {
            this.glow.parent = this;
            this.glow.draw(ctx);
        }
        super.drawInternal(ctx, pos, boundingSize);
    }

    // Uncomment for drawing curves directly on planets (DEBUG).
    onmousedown(pos) {
        pos = this.unitpos(pos);
        this.pts = [ pos ];
        console.warn(pos);
    }
    onmousedrag(pos) {
        pos = this.unitpos(pos);
        if (this.pts.length > 0) {
             pos.y *= -1;
             pos.x *= -1;
             let relpos = fromTo(pos, this.pts[0]);
             this.pts.push(relpos);
        }
    }
    onmouseup(pos) {
        console.log(this.pts.reduce((prev, cur) => prev + '{"x":' + (cur.x) + ', "y":' + (cur.y) + '},\n', ''));
        if(this.pts.length>2)
            this.setCurve(this.pts);
        this.pts = [];
        this.stage.draw();
    }

    activate() {
        this.image = this.image.replace('-locked', '');
        this.showText();
        this.active = true;
    }

    deactivate() {
        this.active = false;
        this.hideText();
        this.removeChild(this.path);
    }

    activateSpots() {
        if (!this.spots) return;

        this.addChild(this.path);

        // Make all spots invisible.
        this.spots.forEach((spot) => {
            spot.opacity = 0;
            spot.ignoreEvents = true;
            this.addChild(spot);
        });

        // Animate-in how much of the path is drawn.
        const dur = 2000;
        this.path.percentDrawn = 0;
        Animate.tween(this.path, { percentDrawn:1.0 }, dur);
        Animate.run((e) => {
            this.spots.forEach((spot) => {
                if (spot.relPosAlongPath <= this.path.percentDrawn) {
                    if (spot.opacity === 0) Resource.play('levelspot-activate');
                    spot.opacity = 1.0;
                }
            });
        }, dur).after(() => {
            this.spots.forEach((spot) => {
                if (spot.opacity === 0) Resource.play('levelspot-activate');
                spot.opacity = 1.0;
                spot.ignoreEvents = false;
            });
            this.path.percentDrawn = 1;
            this.spots[0].enable();
            this.spots[0].flash();
            Resource.play('fatbtn-beep');
        });
    }

    deactivateSpots() {
        this.removeChild(this.path);

        this.spots.forEach((spot) => {
            spot.opacity = 0;
            spot.ignoreEvents = true;
        });
    }

    updateLevelSpots() {
        if (!this.spots) return;
        this.spots.forEach((spot, i) => {
            spot.opacity = 1.0;
            // Flash the spot if it's the level after one we've
            // completed (level_idx isn't reliable for this when
            // there's multiple branches), or if it's the first spot
            // on the planet
            if ((!completedLevels[spot.levelId] && completedLevels[spot.levelId - 1]) || i == 0) {
                spot.enable();
                spot.flash();
            }
            else if (completedLevels[spot.levelId]) {
                spot.enable();
            }
            else {
                spot.disable();
            }
        });
    }

    setCurve(pts) {
        this.path.points = pts.map((p) => ({ x:p.x*this.radius+this.radius, y:p.y*this.radius+this.radius }));
    }

    setLevels(levels, onLevelSelect) {
        this.startLevelIdx = levels[1];
        this.endLevelIdx = levels[1] + levels[0].length - 1;
        const NUM_LVLS = levels[0].length; // total number of cells to fit on the grid
        const genClickCallback = (level_idx) => {
            return () => {
                Resource.play('fatbtn-beep');
                onLevelSelect(levels[0][level_idx], levels[1] + level_idx);
            };
        };

        // Level spots
        this.spots = [];
        for (let i = 1; i <= NUM_LVLS; i++) {
            let spotpos = this.path.posAlongPath((i-1) / (NUM_LVLS-1));
            let spot = new LevelSpot( spotpos.x, spotpos.y, 6 * this.radius / 120, genClickCallback(i-1) );
            spot.anchor = { x:0.5, y:0.5 };
            spot.relPosAlongPath = i / NUM_LVLS;
            spot.levelId = levels[1] + i-1;
            spot.stroke.lineWidth = Math.max(this.radius / 120 * 2, 1.5);
            spot.ignoreEvents = true;

            if (completedLevels[spot.levelId]) {
                spot.enable();
            }
            // We have not completed the first level of this planet,
            // but presumably this planet is enabled, so enable the
            // first level
            else if (i === 1) {
                spot.enable();
                spot.flash();
            }
            else if (!completedLevels[spot.levelId] && completedLevels[spot.levelId - 1]) {
                spot.enable();
                spot.flash();
            }
            this.spots.push(spot);

            if (this.active) this.addChild(spot);
        }
    }
}

class ChapterSelectShip extends mag.RotatableImageRect {
    constructor() {
        super('ship-small');
        this.pointing = { x:1, y:0 };
        this.velocity = { x:0, y:0 };

        this.planet = null;

        const trailWidth = 140;
        let trail = new RainbowTrail(0, 0, trailWidth, 30);
        trail.pos = { x:-trailWidth+20, y:20 };
        //trail.anchor = { x:1, y:0 };
        this.trail = trail;
        this.addChild(trail);
    }

    // Fly to another planet. (entire sequence)
    flyToPlanet(startPlanet, endPlanet) {

        // Hide the local ships and make the world ship
        // the only ship visible.
        this.pos = startPlanet.landingPoint;
        startPlanet.hideShip();
        endPlanet.hideShip();

        const endScale = endPlanet.radius / 120 / 2;
        let dest = endPlanet.landingPoint;
        let aboveOrbitDest = addPos(dest, { x:0, y:-20 });
        let pointing = fromTo(this.pos, aboveOrbitDest);
        let pointAngle = Math.atan2(pointing.y, pointing.x);
        this.trail.opacity = 0;
        let _this = this;
        this.rotation = -Math.PI / 2.0; // make the ship face upright

        return this.launch().then(() => {
            this.rotateTo(pointAngle);
            return this.moveTo(addPos({x:-20, y:-50}, addPos(this.pos, scalarMultiply(pointing, 0.05))));
        }).then(() => {
            Animate.tween(this.trail, { opacity:1.0 }, 100);
            return new Promise((resolve, reject) => {
                let dur = _this.flyTo(aboveOrbitDest, resolve);
                Animate.tween(this, { scale:{x:endScale, y:endScale} }, dur);
            });
        }).then(() => {
            return _this.land(dest);
        }).then(() => {
            this.planet = endPlanet;
            endPlanet.showShip(_this);
        });
    }
    attachToPlanet(planet) {
        this.pos = planet.landingPoint;
        this.planet = planet;
        planet.showShip(this);
    }

    // Launch the ship into the air.
    launch() {
        this.planet = null;
        return new Promise((resolve, reject) => {
            this.moveTo(addPos(this.pos, { x:0, y:-20 }), 1000).then(resolve);
        });
    }

    // Rotate to angle.
    rotateTo(angle, dur=1000, smoothFunc=(e)=>e) {
        return new Promise((resolve, reject) => {
            Animate.tween(this, { rotation:angle }, dur, smoothFunc).after(resolve);
        });
    }

    // Move to pos (without changing rotation).
    moveTo(dest, dur=1000, smoothFunc=(e)=>e) {
        return new Promise((resolve, reject) => {
            Animate.tween(this, { pos:clonePos(dest) }, dur, smoothFunc).after(() => {
                resolve();
            });
        });
    }

    // Execute landing sequence.
    land(dest) {
        this.trail.opacity = 0;
        return this.rotateTo(-Math.PI/2.0, 500).then(() => {
            return this.moveTo(dest, 1000);
        });
    }

    thrust(force, delta) {
        const MAX_VEL = 1;
        let deltaForce = scalarMultiply(force, delta);
        let step = dotProduct(deltaForce, this.pointing);
        this.pointing = normalize(addPos(this.pointing, deltaForce));
        this.velocity = addPos(this.velocity, scalarMultiply(this.pointing, step));
        if(lengthOfPos(this.velocity) > MAX_VEL) this.velocity = rescalePos(this.velocity, MAX_VEL);
        this.pos = addPos(this.velocity, this.pos);
        this.rotation = Math.atan2(this.pointing.y, this.pointing.x);
        this.trail.time += delta*400;
    }

    flyTo(dest, onReachingDest) {
        const FORCE = 10;
        const travelDist = distBetweenPos(this.pos, dest);
        const pointing = fromTo(this.pos, dest);
        const DUR = travelDist / 100 * 1000; // 1 sec per 100 units.
        this.rotation = Math.atan2(pointing.y, pointing.x);

        let del = 0;
        Animate.run((e) => {
            this.trail.opacity = Math.pow(e, 0.5);
            this.trail.time += (e - del) * 8000;
            del = e;
        }, DUR);
        this.moveTo(dest, DUR).then(onReachingDest);
        return DUR;

        // let twn = new mag.IndefiniteTween((delta) => {
        //     this.thrust( rescalePos( fromTo(this.pos, dest), distBetweenPos(this.pos, dest) / totalDist), delta / 1000.0 * 10);
        //
        //     let distleft = distBetweenPos(this.pos, dest);
        //     this.trail.opacity = Math.pow(distleft / totalDist, 0.5);
        //
        //     if (distleft <= 10) {
        //         if (onReachingDest) onReachingDest();
        //         twn.cancel();
        //     }
        //     //this.stage.draw();
        // });
        // twn.run();
    }
}

class ChapterSelectMenu extends mag.Stage {
    // flyToChapIdx should be an array of
    // {
    //     chapterIdx: chapter_idx,
    //     startIdx: idx_of_starting_level,
    // }
    constructor(canvas, onLevelSelect, flyToChapIdx) {
        super(canvas);

        this.trails = [];

        this.showStarField();
        this.showChapters(onLevelSelect);

        let _this = this;
        _this.offset = { x:0, y:0 };
        Animate.wait(100).after(() => {
            let lastActivePlanet;
            for (let planet of this.planets) {
                if (planet.active && level_idx >= planet.startLevelIdx && level_idx <= planet.endLevelIdx) {
                    lastActivePlanet = planet;
                    break;
                }
            }

            let ship = new ChapterSelectShip();
            const shipScale = lastActivePlanet.radius / 120 / 2;
            ship.scale = { x:shipScale, y:shipScale };

            if (flyToChapIdx) {
                ship.attachToPlanet(lastActivePlanet);

                for (let chap of flyToChapIdx) {
                    let newChapIdx = chap.chapterIdx;
                    let newPlanet = this.planets[newChapIdx];
                    newPlanet.highlight();
                    newPlanet.activate();
                    newPlanet.deactivateSpots();
                    let oldOnClick = newPlanet.onclick;

                    let trail = this.makeTrail(lastActivePlanet, newPlanet);
                    trail.percentDrawn = 0;
                    Animate.tween(trail, { percentDrawn:1.0 }, 1000);

                    newPlanet.onclick = () => {
                        newPlanet.onclick = oldOnClick;
                        newPlanet.removeHighlight();
                        this.add(ship);
                        let startPlanet = ship.planet || lastActivePlanet;
                        ship.flyToPlanet(startPlanet, newPlanet).then(() => {
                            return new Promise(function(resolve, reject) {
                                Animate.wait(600).after(() => {
                                    _this.remove(ship);
                                    resolve();
                                });
                            });
                        }).then(oldOnClick)
                            .then(() => {
                                newPlanet.activateSpots();
                                // Get level_idx from the chapter
                                // itself, instead of assuming
                                // linearity
                                level_idx = chap.startIdx;
                                saveProgress();
                            });
                    };
                }
            } else {
                ship.attachToPlanet(lastActivePlanet);
            }
        });
    }

    updateLevelSpots() {
        if (this.planets) {
            this.planets.forEach((p) => p.updateLevelSpots());
        }
    }

    drawImpl() {
        if (this.invalidated) return; // don't draw invalidated stages.
        this.ctx.save();
        this.ctx.scale(this._scale, this._scale);
        this.clear();
        this.ctx.translate(this.offset.x, this.offset.y);
        const len = this.nodes.length;
        for (let i = 0; i < len; i++) {
            this.nodes[i].draw(this.ctx);
        }
        //this.nodes.forEach((n) => n.draw(this.ctx));
        this.ctx.restore();
    }

    showTrails() {
        this.trails.forEach((trail) => {
            trail.percentDrawn = 1;
        });
    }

    hideTrails() {
         this.trails.forEach((trail) => {
            trail.percentDrawn = 0;
        });
    }

    showStarField() {
        const NUM_STARS = 100;
        let genRandomPt = () => randomPointInRect( {x:0, y:0, w:GLOBAL_DEFAULT_SCREENSIZE.width, h:GLOBAL_DEFAULT_SCREENSIZE.height} );
        let stars = [];
        let n = NUM_STARS;
        while(n-- > 0) {

            // Create an instance of a star illustration.
            let star = new MenuStar();
            //star.anchor = { x:0.5, y:0.5 };

            // Find a random position that doesn't intersect other previously created stars.
            let p = genRandomPt();
            // for (let i = 0; i < stars.length; i++) {
            //     let s = stars[i];
            //     let prect = {x:p.x, y:p.y, w:star.size.w, h:star.size.h};
            //     let srect = {x:s._pos.x, y:s._pos.y, w:s.size.w, h:s.size.h};
            //     if (intersects(STARBOY_RECT, prect) ||
            //         intersects(prect, srect)) {
            //         p = genRandomPt();
            //         i = 0;
            //     }
            // }

            // Set star properties
            star.pos = p;
            star.opacity = 0.4;
            const scale = Math.random() * 0.3 + 0.1;
            star.scale = { x:scale, y:scale };
            this.add(star);
            stars.push(star);

            // Twinkling effect
            Animate.wait(1000 * Math.random()).after(() => star.twinkle(1000));
        }
    }

    setPlanetsToDefaultPos(dur) {
        let stage = this;
        Resource.getChapterGraph().then((chapters) => {
            const POS_MAP = layoutPlanets(chapters.transitions, this.boundingSize);
            stage.planets.forEach((p, i) => {
                p.ignoreEvents = false;
                if (p.spots) p.spots.forEach((s) => { s.ignoreEvents = true; });
                if (p.expandFunc) p.onclick = p.expandFunc;
                if (!stage.has(p)) stage.add(p);
                let rad = POS_MAP[i].r;
                Animate.tween(p, { pos: {x:POS_MAP[i].x+15, y:POS_MAP[i].y+40}, scale:{x:1,y:1}, opacity:1.0 }, dur).after(() => {
                    if (p.active) p.showText();
                });
            });
        });
    }

    clear() {
        this.ctx.save();
        this.ctx.fillStyle = '#594764';
        this.ctx.fillRect(0, 0, canvas.width, canvas.height);
        this.ctx.restore();
    }

    showLevelSelectGrid(chapterName, onLevelSelect) {

        let grid = new LevelSelectGrid(chapterName, onLevelSelect);
        grid.pos = { x:0, y:40 };

        var btn_back = new mag.Button(10, 10, 50, 50, { default: 'btn-back-default', hover: 'btn-back-hover', down: 'btn-back-down' }, () => {
            grid.hide().after(() => this.remove(grid));
            this.remove(btn_back);
            this.showTrails();
            this.setPlanetsToDefaultPos(500);
            Resource.play('goback');
        });
        btn_back.opacity = 0.7;

        //this.add(grid);
        this.add(btn_back);
    }

    showChapters(onLevelSelect) {
        // Expand and disappear animations.
        let stage = this;
        let expand = (planet) => {
            planet.ignoreEvents = false;
            planet.expandFunc = planet.onclick;
            planet.onclick = null;
            planet.hideText();
            stage.bringToFront(planet);
            let r = GLOBAL_DEFAULT_SCREENSIZE.width / 3.0;
            let center = { x:GLOBAL_DEFAULT_SCREENSIZE.width / 2.0, y:GLOBAL_DEFAULT_SCREENSIZE.height / 2.0 };
            let scale = r / planet.radius;
            Animate.tween(planet, { scale:{x:scale, y:scale}, pos: center }, 1000, (elapsed) => {
                return Math.pow(elapsed, 3);
            }).after(() => {
                if (planet.spots) planet.spots.forEach((s) => { s.ignoreEvents = false; });
            });
        };
        let hide = (planet) => {
            planet.opacity = 1.0;
            if (planet.spots) planet.spots.forEach((s) => { s.ignoreEvents = true; });
            Animate.tween(planet, { scale:{x:1, y:1}, opacity:0 }, 500).after(() => {
                stage.remove(planet);
            });
        };

        // Each chapter is a 'Planet' in Starboy's Universe:
        //let planetNode = new mag.Rect(0,0,1,1);
        Resource.getChapterGraph().then((chapters) => {
            let planets = [];
            const POS_MAP = layoutPlanets(chapters.transitions, this.boundingSize);

            let planetParent = new mag.Rect(0, 0, 0, 0);

            chapters.chapters.forEach((chap, i) => {
                let pos = i < POS_MAP.length ? POS_MAP[i] : { x:0, y:0, r:10 };
                let planet = new PlanetCard(pos.x, pos.y, pos.r, chap.name, chap.resources ? chap.resources.planet : 'planet-bagbag');
                planet.color = 'white';
                if (i === 1) planet.path.stroke.color = 'gray';
                planet.anchor = { x:0.5, y:0.5 };
                planet.shadowOffset = 0;
                planet.onclick = () => {
                    this.hideTrails();
                    for (let k = 0; k < planets.length; k++) {
                        planets[k].ignoreEvents = true;
                        if (k !== i) hide(planets[k]);
                        else         expand(planets[k]);
                    }
                    Resource.play('zoomin');
                    Animate.wait(500).after(() => {
                        stage.showLevelSelectGrid(planet.name, onLevelSelect);
                    });
                    return new Promise((resolve, reject) => {
                        Animate.wait(1000).after(resolve);
                    });
                };

                if (chap.resources) {
                    const levels = Resource.levelsForChapter(chap.name);

                    // Set path curve on planet.
                    planet.setCurve(chap.resources.curve);

                    // Activate planet if applicable
                    if (Resource.isChapterUnlocked(i)) {
                        planet.activate();
                    }
                    else {
                        planet.deactivate();
                    }

                    // Set levels along curve.
                    planet.setLevels(levels, onLevelSelect);
                }

                planetParent.addChild(planet);
                planets.push(planet);
            });
            this.add(planetParent);
            this.planetParent = planetParent;

            let transitionMap = {};
            chapters.chapters.forEach((chap, i) => {
                transitionMap[chap.key] = i;
            });
            chapters.chapters.forEach((chap, i) => {
                let planet1 = planets[i];
                if (planet1.active) {
                    for (let t of chap.transitions) {
                        let planet2 = planets[transitionMap[t]];
                        if (planet2.active) {
                            this.makeTrail(planet1, planet2);
                        }
                    }
                }
            });

            this.planets = planets;
        });

    }

    makeTrail(planet1, planet2) {
        let path1 = planet1.path.points;
        let path2 = planet2.path.points;
        let start = addPos(
            { x: -planet1.radius, y: -planet1.radius },
            addPos(planet1.absolutePos, path1[path1.length - 1]));
        let end = addPos(
            { x: -planet2.radius, y: -planet2.radius },
            addPos(planet2.absolutePos, path2[0]));
        let dx = end.x - start.x;
        let dy = Math.abs(end.y - start.y);
        let factor = 0.3;

        let control1 = { x: start.x + factor * dx, y: 0 },
            control2 = { x: end.x - factor * dx, y: 0 };
        if (end.y < start.y) {
            control1.y = start.y + factor * dy;
            control2.y = end.y - factor * dy;
        }
        else {
            control1.x = start.x;
            control1.y = start.y + Math.abs(factor * dy);
            control2.x = end.x;
            control2.y = end.y - Math.abs(factor * dy);
        }
        // Cubic bezier curve
        let points = [];
        for (let i = 0; i < 101; i++) {
            let t = i / 100;
            let x = Math.pow(1-t, 3)*start.x + 3*Math.pow(1-t, 2)*t*control1.x
                + 3*(1-t)*t*t*control2.x + t*t*t*end.x;
            let y = Math.pow(1-t, 3)*start.y + 3*Math.pow(1-t, 2)*t*control1.y
                + 3*(1-t)*t*t*control2.y + t*t*t*end.y;
            points.push({ x: x, y: y });
        }
        let trail = new ArrowPath(points);
        trail.percentDrawn = 1;
        trail.stroke.color = '#AAA';
        trail.stroke.lineDash = [3];
        trail.stroke.lineWidth = 2;
        trail.drawArrowHead = true;
        trail.ignoreEvents = true;
        this.planetParent.addChild(trail);
        this.trails.push(trail);

        return trail;
    }
}

function layoutPlanets(adjacencyList, boundingSize) {
    const MAX_GROUP_SIZE = 4;

    // From src/util.js
    let seed = 42;
    let seededRandom = function(max, min) {
        max = max || 1;
        min = min || 0;

        seed = (seed * 9301 + 49297) % 233280;
        var rnd = seed / 233280;

        return min + rnd * (max - min);
    };

    // Perform a topological sort of the planets to get a layout
    let sorted = topologicalSort(adjacencyList);
    let groups = [[]];
    for (let group of sorted) {
        if (group.length === 1) {
            groups[groups.length - 1] = groups[groups.length - 1].concat(group);
        }
        else {
            groups.push(group);
            groups.push([]);
        }
    }
    if (groups[groups.length - 1].length === 0) groups.pop();

    let positions = [];

    let startX = 0;
    let startY = 0;
    let subgroups = [];
    for (let group of groups) {
        if (group.length > MAX_GROUP_SIZE) {
            let numSubgroups = Math.round(group.length / MAX_GROUP_SIZE);
            let subgroupSize = Math.round(group.length / numSubgroups);
            let subgroup = [];
            while (group.length > 0) {
                subgroup.push(group.shift());
                if (subgroup.length == subgroupSize) {
                    subgroups.push(subgroup);
                    subgroup = [];
                }
            }
            if (subgroup.length > 0) {
                subgroups.push(subgroup);
            }
        }
        else {
            subgroups = [group];
        }

        for (let subgroup of subgroups) {
            console.log(subgroup);
            let boundingArea = {
                x: startX,
                y: startY,
                w: 0.8 * boundingSize.w,
                h: boundingSize.h,
            };

            let sublayout = layoutGroup(subgroup, boundingArea, seededRandom);
            positions = positions.concat(sublayout);

            let maxOffset = 0;
            for (let cell of sublayout) {
                maxOffset = Math.max(maxOffset, cell.x + cell.r - boundingArea.x);
            }
            startX += maxOffset;
            console.log(maxOffset, boundingArea.w);
        }
    }

    return positions;
}

function layoutGroup(group, boundingArea, seededRandom) {
    // Divide the available space into a grid
    let gridCells = [];
    let aspectRatio = boundingArea.w / boundingArea.h;
    let yCells = Math.sqrt(group.length / aspectRatio);
    let xCells = aspectRatio * yCells;

    if (Math.floor(yCells) * Math.floor(xCells) >= group.length) {
        yCells = Math.floor(yCells);
        xCells = Math.floor(xCells);
    }
    else if (Math.ceil(yCells) * Math.floor(xCells) >= group.length) {
        yCells = Math.ceil(yCells);
        xCells = Math.floor(xCells);
    }
    else if (Math.floor(yCells) * Math.ceil(xCells) >= group.length) {
        yCells = Math.floor(yCells);
        xCells = Math.ceil(xCells);
    }
    else {
        yCells = Math.ceil(yCells);
        xCells = Math.ceil(xCells);
    }

    let cellWidth = (boundingArea.w - 20) / xCells;
    let cellHeight = (boundingArea.h - 20) / yCells;
    let firstCellMultiplier = 1.0;
    let xCellMultiplier = 1.0, yCellMultiplier = 1.0;
    if (xCells > 1 && yCells > 1) {
        // Make the first cell slightly larger
        firstCellMultiplier = 1.2;
        xCellMultiplier = (xCells - firstCellMultiplier) / (xCells - 1);
        yCellMultiplier = (yCells - firstCellMultiplier) / (yCells - 1);
    }

    let y = boundingArea.y;
    for (let row = 0; row < yCells; row++) {
        let x = boundingArea.x;
        let height = cellHeight * (row == 0 ? firstCellMultiplier : yCellMultiplier);

        let newCells = [];
        for (let col = 0; col < xCells; col++) {
            let width = cellWidth * (col == 0 ? firstCellMultiplier : xCellMultiplier);
            let r = seededRandom(0.7, 0.9) * Math.min(width, height) / 2;
            let xfudge = 1.2 * (width - 2 * r) / 2.0;
            let yfudge = (height - 2 * r) / 2.0;
            let xf = (col == 0 && row == 0) ? 0 : seededRandom(-xfudge, xfudge);
            let yf = (col == 0 && row == 0) ? 0 : seededRandom(-1.2*yfudge, 0.7 * yfudge);
            let cell = {
                x: x + (width / 2) + xf,
                y: y + (height / 2) + yf,
                w: width,
                h: height,
                r: r
            };
            newCells.push(cell);
            x += width;
        }

        gridCells = gridCells.concat(newCells);

        y += height;
    }

    // Extra cells to use
    if (gridCells.length > group.length) {
        let extraCells = gridCells.splice(group.length);
        // Merge last cell with cell next to it
        if (yCells > 1) {
            let lastCell = extraCells.pop();
            let cellAboveIndex = xCells * yCells - 2;
            let cellAbove = gridCells[cellAboveIndex];
            gridCells[cellAboveIndex] = lastCell;
            lastCell.x = 0.5 * lastCell.x + 0.5 * cellAbove.x;
            lastCell.y = 0.7 * lastCell.y + 0.3 * cellAbove.y;
        }
    }

    return gridCells;
}

function topologicalSort(adjacencyList) {
    // Get all nodes without dependencies. Add them to the result
    // list, sorting all nodes at each stage. Remove them from the
    // dependencies of other nodes, and repeat. Continue until there
    // are no remaining nodes without dependencies.
    let result = [];

    let dependencies = {};
    for (let src of Object.keys(adjacencyList)) {
        dependencies[src] = {};
    }

    for (let [src, dsts] of Object.entries(adjacencyList)) {
        for (let dst of dsts) {
            dependencies[dst][src] = true;
        }
    }

    while (true) {
        let found = [];
        for (let [dst, deps] of Object.entries(dependencies)) {
            if (Object.keys(deps).length === 0) {
                found.push(dst);
            }
        }

        if (found.length === 0) break;

        for (let dst of found) {
            for (let [_, deps] of Object.entries(dependencies)) {
                delete deps[dst];
            }
            delete dependencies[dst];
        }

        // Sort the list to give us a deterministic order
        found.sort();
        result.push(found);
    }

    return result;
}










// -- OLD --
// class LevelCell extends MenuButton {
    // constructor(x, y, w, h, name, icon, onclick) {
    //     super(x, y, w, h, name.toString(), onclick);
    //
    //     this.shadowOffset = 10;
    //
    //     // Visual icon
    //     if (icon) {
    //         let img = new mag.ImageRect(0, 0, w, h, icon);
    //         img.ignoreEvents = true;
    //         this.addChild(img);
    //     } else { // Default to text displaying level index.
    //         let txt = new TextExpr(name.toString(), 'Futura');
    //         txt.color = 'white';
    //         txt.anchor = { x:0.5, y:0.5 };
    //         txt.pos = { x: w / 2.0, y: w / 2.0 };
    //         this.addChild(txt);
    //     }
    //
    //     this.name = name;
    //     this.onclick = onclick;
    // }
    // onmouseclick(pos) {
    //     if (this.onclick)
    //         this.onclick();
    // }
// }
// class ChapterCard extends mag.Rect {
//     constructor(x, y, w, h, name, desc, icon, onclick) {
//
//         const TXTPAD = 50;
//         super(x, y, w, h);
//
//         // Visual icon
//         let img = new mag.ImageRect(0, 0, w, h - TXTPAD, icon);
//         img.ignoreEvents = true;
//         this.addChild(img);
//
//         // Chapter name
//         let txt = new TextExpr(name, 'Futura');
//         txt.color = 'white';
//         txt.pos = { x:img.pos.x+img.size.w/2.0,
//                     y:img.pos.y+img.size.h+txt.fontSize };
//         txt.anchor = { x:0.5, y:0 };
//         this.addChild(txt);
//
//         this.name = name;
//         this.onclick = onclick;
//     }
//
//     onmouseclick(pos) {
//         if (this.onclick)
//             this.onclick(this.name);
//     }
// }
//
// class ChapterSelectMenu extends mag.Stage {
//     constructor(canvas, onChapterSelect) {
//         super(canvas);
//         this.showChapters(onChapterSelect);
//     }
//
//     showChapters(onselect) {
//
//         let W = 200; let P = 40; let X = 0;
//         let onChapterSelect = onselect;
//         console.log(onChapterSelect);
//         let container = new DraggableRect(GLOBAL_DEFAULT_SCREENSIZE.width / 2.0 - W / 2.0, 100, 1000, 300);
//         container.constrainY();
//         container.color = 'lightgray';
//         container.shadowOffset = 0;
//         container.snapEvery(W + P, W / 2.0 - P);
//         this.add(container);
//
//         Resource.getChapters().then((chapters) => {
//             container.size = { w:(W + P) * chapters.length, h:300 };
//             chapters.forEach((chap) => {
//
//                 let c = new ChapterCard(X, 0, W, 300, chap.name, chap.description, null, onChapterSelect);
//                 //c.ignoreEvents = true;
//                 c.color = 'HotPink';
//                 c.onmousedrag = (pos) => {
//                     pos.x -= c.pos.x;
//                     container.onmousedrag(pos);
//                 };
//                 c.onmouseup = (pos) => {
//                     pos.x -= c.pos.x;
//                     container.onmouseup(
//                         pos);
//                 };
//                 container.addChild(c);
//
//                 X += W + P;
//
//             });
//         });
//     }
// }
