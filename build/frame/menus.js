'use strict';

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _set = function set(object, property, value, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent !== null) { set(parent, property, value, receiver); } } else if ("value" in desc && desc.writable) { desc.value = value; } else { var setter = desc.set; if (setter !== undefined) { setter.call(receiver, value); } } return value; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MenuButton = function (_mag$RoundedRect) {
    _inherits(MenuButton, _mag$RoundedRect);

    function MenuButton(x, y, w, h, text, onclick) {
        var color = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : 'gold';
        var textColor = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : 'orange';
        var shadowColor = arguments.length > 8 && arguments[8] !== undefined ? arguments[8] : 'orange';
        var onDownShadowColor = arguments.length > 9 && arguments[9] !== undefined ? arguments[9] : 'red';

        _classCallCheck(this, MenuButton);

        var _this = _possibleConstructorReturn(this, (MenuButton.__proto__ || Object.getPrototypeOf(MenuButton)).call(this, x, y, w, h, 10));

        var t = new TextExpr(text, 'Futura');
        t.color = textColor;
        t.anchor = { x: 0.5, y: 0.5 };
        t.pos = { x: w / 2, y: h / 2 };
        _this.text = t;
        _this.addChild(t);

        _this.origShadowOffset = 14;
        _this.shadowOffset = 14;
        _this.hoverIndent = -4;
        _this.downIndent = 4;
        _this.shadowColor = shadowColor;
        _this.onDownColor = shadowColor;
        _this.onDownShadowColor = onDownShadowColor;
        _this.onUpShadowColor = shadowColor;
        _this.onUpColor = color;
        _this.textColor = textColor;
        _this.color = color;

        _this.clickFunc = onclick;

        _this.pos = { x: x, y: y };
        return _this;
    }

    _createClass(MenuButton, [{
        key: 'runButtonClickEffect',
        value: function runButtonClickEffect() {
            var _this2 = this;

            var rr = new mag.RoundedRect(this.absolutePos.x, this.absolutePos.y, this.absoluteSize.w, this.absoluteSize.h, this.radius);
            rr.color = null;
            rr.shadowOffset = 0;
            rr.anchor = this.anchor;
            rr.ignoreEvents = true;
            rr.stroke = { color: 'white', lineWidth: 4, opacity: 1.0 };
            this.stage.add(rr);

            Animate.chain(function (elapsed) {
                var c = colorTween(elapsed, [1, 215 / 255.0, 0], [1, 1, 1]);
                var sc = colorTween(elapsed, [1, 0, 0], [0.8, 0.8, 0.8]);
                _this2.color = c;
                _this2.text.color = c;
                _this2.shadowColor = sc;
                _this2.stage.draw();
            }, 200, null, function (elapsed) {
                //elapsed = elapsed * elapsed;
                rr.scale = { x: 1 + elapsed, y: 1 + elapsed };
                rr.stroke.opacity = 1 - elapsed;
                _this2.stage.draw();
            }, 160, function () {
                _this2.stage.remove(rr);
                _this2.onmouseleave();
                _this2.stage.draw();
                if (_this2.clickFunc) {
                    _this2.clickFunc();
                }
            });
        }
    }, {
        key: 'onmouseenter',
        value: function onmouseenter(pos) {
            this.color = this.onDownColor;
            this.shadowColor = this.onDownShadowColor;
            this.shadowOffset = this.origShadowOffset - this.hoverIndent;
            this.text.color = 'white';
            this._pos.y += this.hoverIndent;
        }
    }, {
        key: 'onmouseleave',
        value: function onmouseleave(pos) {
            this.color = this.onUpColor;
            this.shadowColor = this.onUpShadowColor;
            this.text.color = this.textColor;
            this._pos.y = this._origpos.y;
            this.shadowOffset = this.origShadowOffset;
        }
    }, {
        key: 'onmousedown',
        value: function onmousedown(pos) {
            this._prevy = this._pos.y;
            this._pos.y += this.shadowOffset - this.downIndent;
            this.shadowOffset = this.downIndent;
            //this.color = this.onUpColor;
            Resource.play('fatbtn-click');
        }
    }, {
        key: 'onmouseup',
        value: function onmouseup(pos) {
            this._pos.y = this._origpos.y;
            this.shadowOffset = this.origShadowOffset;
            this.runButtonClickEffect();
            Animate.wait(50).after(function () {
                return Resource.play('fatbtn-beep');
            });
        }
    }, {
        key: 'pos',
        get: function get() {
            return { x: this._pos.x, y: this._pos.y };
        },
        set: function set(p) {
            _set(MenuButton.prototype.__proto__ || Object.getPrototypeOf(MenuButton.prototype), 'pos', p, this);
            this._origpos = { x: p.x, y: p.y };
        }
    }]);

    return MenuButton;
}(mag.RoundedRect);

var MainMenu = function (_mag$Stage) {
    _inherits(MainMenu, _mag$Stage);

    function MainMenu() {
        var canvas = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
        var onClickPlay = arguments[1];
        var onClickSettings = arguments[2];

        _classCallCheck(this, MainMenu);

        var _this3 = _possibleConstructorReturn(this, (MainMenu.__proto__ || Object.getPrototypeOf(MainMenu)).call(this, canvas));

        _this3.showTitle();
        _this3.showPlayButton(onClickPlay);
        _this3.showSettingsButton(onClickSettings);
        return _this3;
    }

    _createClass(MainMenu, [{
        key: 'showTitle',
        value: function showTitle() {
            var title = new TextExpr('R (E) D U C T', 'Futura', 80);
            title.color = 'black';
            title.anchor = { x: 0.5, y: 0.5 };
            title.pos = { x: GLOBAL_DEFAULT_SCREENSIZE.width / 2.0, y: GLOBAL_DEFAULT_SCREENSIZE.height / 5 };
            this.add(title);
            console.log(title);
        }
    }, {
        key: 'showPlayButton',
        value: function showPlayButton(onClickPlay) {
            var b = new MenuButton(GLOBAL_DEFAULT_SCREENSIZE.width / 2.0, GLOBAL_DEFAULT_SCREENSIZE.height / 2.0, 140, 100, 'Play', onClickPlay);
            b.anchor = { x: 0.5, y: 0.5 };
            this.add(b);
        }
    }, {
        key: 'showSettingsButton',
        value: function showSettingsButton(onClickSettings) {
            var b = new MenuButton(GLOBAL_DEFAULT_SCREENSIZE.width / 2.0, GLOBAL_DEFAULT_SCREENSIZE.height / 2.0 + 120, 140, 60, 'Settings', onClickSettings, 'Purple', 'lightgray', 'Indigo', 'Purple');
            b.anchor = { x: 0.5, y: 0.5 };
            this.add(b);
        }
    }]);

    return MainMenu;
}(mag.Stage);

var DraggableRect = function (_mag$Rect) {
    _inherits(DraggableRect, _mag$Rect);

    function DraggableRect() {
        _classCallCheck(this, DraggableRect);

        return _possibleConstructorReturn(this, (DraggableRect.__proto__ || Object.getPrototypeOf(DraggableRect)).apply(this, arguments));
    }

    _createClass(DraggableRect, [{
        key: 'constrainX',
        value: function constrainX() {
            this.cX = true;
        }
    }, {
        key: 'constrainY',
        value: function constrainY() {
            this.cY = true;
        }
    }, {
        key: 'snapEvery',
        value: function snapEvery(step, offset) {
            this.snapStep = step;this.snapOffset = offset;
        }
    }, {
        key: 'onmousedrag',
        value: function onmousedrag(pos) {
            if (this.cX) pos.x = this.pos.x;
            if (this.cY) pos.y = this.pos.y;
            this.pos = pos;
        }
    }, {
        key: 'onmouseup',
        value: function onmouseup(pos) {
            if (!this.snapStep) {
                _get(DraggableRect.prototype.__proto__ || Object.getPrototypeOf(DraggableRect.prototype), 'onmouseup', this).call(this, pos);
                return;
            }

            var targetPos = { x: Math.round(this.pos.x / this.snapStep) * this.snapStep + this.snapOffset, y: this.pos.y };
            Animate.tween(this, { pos: targetPos }, 200, function (elapsed) {
                return Math.pow(elapsed, 0.5);
            });
        }
    }]);

    return DraggableRect;
}(mag.Rect);

var LevelCell = function (_MenuButton) {
    _inherits(LevelCell, _MenuButton);

    function LevelCell() {
        _classCallCheck(this, LevelCell);

        return _possibleConstructorReturn(this, (LevelCell.__proto__ || Object.getPrototypeOf(LevelCell)).apply(this, arguments));
    }

    return LevelCell;
}(MenuButton);

var LevelSelectGrid = function (_mag$Rect2) {
    _inherits(LevelSelectGrid, _mag$Rect2);

    function LevelSelectGrid(chapterName, onLevelSelect) {
        _classCallCheck(this, LevelSelectGrid);

        var _this6 = _possibleConstructorReturn(this, (LevelSelectGrid.__proto__ || Object.getPrototypeOf(LevelSelectGrid)).call(this, 0, 0, 0, 0));

        _this6.color = null;
        _this6.showGrid(chapterName, onLevelSelect);
        return _this6;
    }

    _createClass(LevelSelectGrid, [{
        key: 'hide',
        value: function hide(dur) {
            var _this7 = this;

            var len = this.children.length;
            this.children.forEach(function (c, i) {
                c.opacity = 1;
                Animate.tween(c, { scale: { x: 0, y: 0 }, opacity: 0 }, (len - i - 1) * 30).after(function () {
                    _this7.removeChild(c);
                });
            });
            return Animate.wait((len - 1) * 30);
        }
    }, {
        key: 'gridSizeForLevelCount',
        value: function gridSizeForLevelCount(n) {
            if (n <= 8) return 124;else if (n <= 14) return 100;else return 84;
        }
    }, {
        key: 'showGrid',
        value: function showGrid(chapterName, onselect) {
            var _this8 = this;

            // Layout measurement
            var levels = Resource.levelsForChapter(chapterName);
            var NUM_CELLS = levels.length; // total number of cells to fit on the grid
            var CELL_SIZE = this.gridSizeForLevelCount(NUM_CELLS); // width and height of each cell square, in pixels
            var SCREEN_WIDTH = GLOBAL_DEFAULT_SCREENSIZE.width; // the width of the screen to work with
            var PADDING = 20; // padding between cells
            var TOP_MARGIN = 20;
            var GRID_MARGIN = 80; // margin bounding grid on top, left, and right sides
            var NUM_COLS = Math.trunc((SCREEN_WIDTH - GRID_MARGIN * 2) / (CELL_SIZE + PADDING)); // number of cells that fit horizontally on the screen
            var NUM_ROWS = Math.trunc(NUM_CELLS / NUM_COLS + 1); // number of rows
            var GRID_LEFTPAD = (SCREEN_WIDTH - ((CELL_SIZE + PADDING) * NUM_COLS + GRID_MARGIN * 2)) / 2.0;

            console.log(levels);
            console.log(SCREEN_WIDTH - GRID_MARGIN * 2, CELL_SIZE + PADDING, NUM_CELLS, NUM_COLS, NUM_ROWS);

            var genClickCallback = function genClickCallback(level_idx) {
                return function () {
                    return onselect(levels[level_idx]);
                };
            };

            var leftmost = GRID_LEFTPAD + GRID_MARGIN;
            var x = leftmost;
            var y = TOP_MARGIN;

            for (var r = 0; r < NUM_ROWS; r++) {

                var i = r * NUM_COLS;

                var _loop = function _loop(c) {

                    // Create a level cell and add it to the grid.
                    var cell = new LevelCell(x + CELL_SIZE / 2.0, y + CELL_SIZE / 2.0, CELL_SIZE, CELL_SIZE, i.toString(), genClickCallback(i), r === 0 ? 'LightGreen' : 'Gold', 'white', r === 0 ? 'Green' : 'Teal', r === 0 ? 'DarkGreen' : 'DarkMagenta');
                    cell.onDownColor = r === 0 ? 'YellowGreen' : 'Orange';
                    cell.anchor = { x: 0.5, y: 0.5 };
                    _this8.addChild(cell);

                    // Animate cell into position.
                    cell.scale = { x: 0.0, y: 0 };
                    Animate.wait(i * 50).after(function () {
                        Animate.tween(cell, { scale: { x: 1, y: 1 } }, 300, function (elapsed) {
                            return Math.pow(elapsed, 0.5);
                        });
                    });

                    // Increment x-position.
                    x += CELL_SIZE + PADDING;

                    // The level index, calculated from the row and column indices.
                    i++;
                    if (i >= NUM_CELLS) return 'break';
                };

                for (var c = 0; c < NUM_COLS; c++) {
                    var _ret = _loop(c);

                    if (_ret === 'break') break;
                }

                if (i >= NUM_CELLS) break;

                // Increment y-position and set x-position left.
                y += CELL_SIZE + PADDING;
                x = leftmost;
            }
        }
    }]);

    return LevelSelectGrid;
}(mag.Rect);

var PlanetCard = function (_mag$Circle) {
    _inherits(PlanetCard, _mag$Circle);

    function PlanetCard(x, y, r, name, onclick) {
        _classCallCheck(this, PlanetCard);

        var _this9 = _possibleConstructorReturn(this, (PlanetCard.__proto__ || Object.getPrototypeOf(PlanetCard)).call(this, x, y, r));

        _this9.name = name;
        _this9.onclick = onclick;
        return _this9;
    }

    _createClass(PlanetCard, [{
        key: 'onmouseclick',
        value: function onmouseclick() {
            if (this.onclick) this.onclick();
        }
    }]);

    return PlanetCard;
}(mag.Circle);

var ChapterSelectMenu = function (_mag$Stage2) {
    _inherits(ChapterSelectMenu, _mag$Stage2);

    function ChapterSelectMenu(canvas, onChapterSelect) {
        _classCallCheck(this, ChapterSelectMenu);

        var _this10 = _possibleConstructorReturn(this, (ChapterSelectMenu.__proto__ || Object.getPrototypeOf(ChapterSelectMenu)).call(this, canvas));

        _this10.showChapters(onChapterSelect);
        return _this10;
    }

    _createClass(ChapterSelectMenu, [{
        key: 'getPlanetPos',
        value: function getPlanetPos() {
            return [{ x: 144, y: 104, r: 120 }, { x: 426, y: 86, r: 55 }, { x: 690, y: 208, r: 44 }, { x: 456, y: 324, r: 60 }, { x: 138, y: 388, r: 80 }, { x: 316, y: 480, r: 40 }, { x: 530, y: 492, r: 70 }, { x: 760, y: 580, r: 30 }];
        }
    }, {
        key: 'setPlanetsToDefaultPos',
        value: function setPlanetsToDefaultPos(dur) {
            var stage = this;
            var POS_MAP = this.getPlanetPos();
            stage.planets.forEach(function (p, i) {
                p.ignoreEvents = false;
                if (!stage.has(p)) stage.add(p);
                Animate.tween(p, { pos: { x: POS_MAP[i].x + 15, y: POS_MAP[i].y + 40 }, radius: POS_MAP[i].r, opacity: 1.0 }, dur);
            });
        }
    }, {
        key: 'clear',
        value: function clear() {
            this.ctx.save();
            this.ctx.fillStyle = '#222';
            this.ctx.fillRect(0, 0, canvas.width, canvas.height);
            this.ctx.restore();
        }
    }, {
        key: 'showLevelSelectGrid',
        value: function showLevelSelectGrid(chapterName) {
            var _this11 = this;

            var grid = new LevelSelectGrid(chapterName, function (levelSelected) {
                // TODO: transition to level here...
            });
            grid.pos = { x: 0, y: 40 };

            var btn_back = new mag.Button(10, 10, 50, 50, { default: 'btn-back-default', hover: 'btn-back-hover', down: 'btn-back-down' }, function () {
                grid.hide().after(function () {
                    return _this11.remove(grid);
                });
                _this11.remove(btn_back);
                _this11.setPlanetsToDefaultPos(500);
                Resource.play('goback');
            });
            btn_back.opacity = 0.5;

            this.add(grid);
            this.add(btn_back);
        }
    }, {
        key: 'showChapters',
        value: function showChapters(onselect) {
            var _this12 = this;

            // For now, hardcore positions and radii per chapter:
            // TODO: Move to .json specs.
            var POS_MAP = this.getPlanetPos();

            // Expand and disappear animations.
            var stage = this;
            var expand = function expand(planet) {
                var r = GLOBAL_DEFAULT_SCREENSIZE.width / 2.0 * Math.pow(planet.radius / 120, 0.5);
                var centerBottom = { x: GLOBAL_DEFAULT_SCREENSIZE.width / 2.0, y: GLOBAL_DEFAULT_SCREENSIZE.height };
                Animate.tween(planet, { radius: r, pos: addPos(centerBottom, { x: 0, y: r / 2.0 }) }, 1000, function (elapsed) {
                    return Math.pow(elapsed, 3);
                });
            };
            var hide = function hide(planet) {
                planet.opacity = 1.0;
                Animate.tween(planet, { opacity: 0 }, 500).after(function () {
                    stage.remove(planet);
                });
            };

            // Each chapter is a 'Planet' in Starboy's Universe:
            Resource.getChapters().then(function (chapters) {

                var planets = [];

                chapters.forEach(function (chap, i) {
                    var pos = i < POS_MAP.length ? POS_MAP[i] : { x: 0, y: 0, r: 10 };
                    var planet = new PlanetCard(pos.x + 15, pos.y + 40, pos.r, chap.name);
                    planet.color = 'white';
                    planet.anchor = { x: 0.5, y: 0.5 };
                    planet.shadowOffset = 0;
                    planet.onclick = function () {
                        for (var k = 0; k < planets.length; k++) {
                            planets[k].ignoreEvents = true;
                            if (k !== i) hide(planets[k]);else expand(planets[k]);
                        }
                        Resource.play('zoomin');
                        Animate.wait(500).after(function () {
                            return _this12.showLevelSelectGrid(planet.name);
                        });
                    };
                    _this12.add(planet);
                    planets.push(planet);
                });

                _this12.planets = planets;
            });
        }
    }]);

    return ChapterSelectMenu;
}(mag.Stage);

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