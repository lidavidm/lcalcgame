'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

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

        var _this2 = _possibleConstructorReturn(this, (MenuButton.__proto__ || Object.getPrototypeOf(MenuButton)).call(this, x, y, w, h, 10));

        var t = new TextExpr(text, 'Futura');
        t.color = textColor;
        t.anchor = { x: 0.5, y: 0.5 };
        t.pos = { x: w / 2, y: h / 2 };
        _this2.text = t;
        //this.addChild(t);

        _this2.origShadowOffset = 14;
        _this2.shadowOffset = 14;
        _this2.hoverIndent = -4;
        _this2.downIndent = 4;
        _this2.shadowColor = shadowColor;
        _this2.onDownColor = shadowColor;
        _this2.onDownShadowColor = onDownShadowColor;
        _this2.onUpShadowColor = shadowColor;
        _this2.onUpColor = color;
        _this2.textColor = textColor;
        _this2.color = color;

        _this2.clickFunc = onclick;

        _this2.pos = { x: x, y: y };
        _this2.stroke = { color: 'black', lineWidth: 2 };
        return _this2;
    }

    _createClass(MenuButton, [{
        key: 'setColors',
        value: function setColors(color, textColor, shadowColor, onDownShadowColor) {
            this.color = color;
            this.onUpColor = color;
            this.shadowColor = shadowColor;
            this.onDownColor = shadowColor;
            this.onDownShadowColor = onDownShadowColor;
            this.onUpShadowColor = shadowColor;
            this.textColor = textColor;
            this.text.color = textColor;
        }
    }, {
        key: 'showExpandingEffect',
        value: function showExpandingEffect() {
            var color = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'white';
            var dur = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 160;

            var _this3 = this;

            var loop = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
            var loopBreakTime = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 100;

            if (!this.stage) return;
            var stage = this.stage;

            var rr = new mag.RoundedRect(this.absolutePos.x, this.absolutePos.y, this.absoluteSize.w, this.absoluteSize.h, this.radius);
            rr.color = null;
            rr.shadowOffset = 0;
            rr.anchor = this.anchor;
            rr.ignoreEvents = true;
            rr.stroke = { color: color, lineWidth: 4, opacity: 1.0 };
            stage.add(rr);
            Animate.run(function (elapsed) {
                //elapsed = elapsed * elapsed;
                rr.scale = { x: 1 + elapsed, y: 1 + elapsed };
                rr.stroke.opacity = 1 - elapsed;
                stage.draw();
            }, dur).after(function () {
                stage.remove(rr);
                stage.draw();
                if (loop && _this3.stage) {
                    Animate.wait(loopBreakTime).after(function () {
                        _this3.showExpandingEffect(color, dur, loop, loopBreakTime);
                    });
                }
            });
        }
    }, {
        key: 'runButtonClickEffect',
        value: function runButtonClickEffect() {
            var _this4 = this;

            var shouldFireClickEvent = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;


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
                _this4.color = c;
                _this4.text.color = c;
                _this4.shadowColor = sc;
                _this4.stage.draw();
            }, 200, null, function (elapsed) {
                //elapsed = elapsed * elapsed;
                rr.scale = { x: 1 + elapsed, y: 1 + elapsed };
                rr.stroke.opacity = 1 - elapsed;
                _this4.stage.draw();
            }, 160, function () {
                _this4.stage.remove(rr);
                _this4.onmouseleave();
                _this4.stage.draw();
                if (_this4.clickFunc && shouldFireClickEvent) {
                    _this4.clickFunc();
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
        key: 'onmousedrag',
        value: function onmousedrag(pos) {
            var hits = this.hits(pos);
            if (!hits && this.color !== this.onUpColor) {
                this.onmouseleave(pos);
            } else if (this.color === this.onUpColor && hits) {
                this.onmouseenter(pos);
                this.onmousedown(pos);
            }
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
            if (!this.hits(pos)) return;
            this._pos.y = this._origpos.y;
            this.shadowOffset = this.origShadowOffset;
            this.runButtonClickEffect(true);
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

var MenuStar = function (_mag$ImageRect) {
    _inherits(MenuStar, _mag$ImageRect);

    function MenuStar() {
        _classCallCheck(this, MenuStar);

        return _possibleConstructorReturn(this, (MenuStar.__proto__ || Object.getPrototypeOf(MenuStar)).call(this, 'mainmenu-star' + Math.floor(Math.random() * 14 + 1)));
    }

    _createClass(MenuStar, [{
        key: 'twinkle',
        value: function twinkle() {
            var dur = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 350;

            var blinkDur = dur + Math.random() * 100;
            var _this = this;
            var blink = function blink() {
                if (_this.cancelBlink) return;
                Animate.tween(_this, { opacity: 0.4 }, blinkDur, function (e) {
                    return Math.pow(e, 2);
                }).after(function () {
                    if (_this.cancelBlink) return;
                    Animate.tween(_this, { opacity: 1 }, blinkDur, function (e) {
                        return Math.pow(e, 2);
                    }).after(blink);
                });
            };
            blink();
        }
    }, {
        key: 'drawInternal',
        value: function drawInternal(ctx, pos, boundingSize) {
            if (this.parent && Number.isNumber(this.parent.opacity)) {
                ctx.globalAlpha = this.parent.opacity * (this.opacity || 1.0);
            }
            _get(MenuStar.prototype.__proto__ || Object.getPrototypeOf(MenuStar.prototype), 'drawInternal', this).call(this, ctx, pos, boundingSize);
        }
    }]);

    return MenuStar;
}(mag.ImageRect);

var MainMenu = function (_mag$Stage) {
    _inherits(MainMenu, _mag$Stage);

    function MainMenu() {
        var canvas = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
        var onClickPlay = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        var onClickSettings = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

        _classCallCheck(this, MainMenu);

        var _this6 = _possibleConstructorReturn(this, (MainMenu.__proto__ || Object.getPrototypeOf(MainMenu)).call(this, canvas));

        var bg = new mag.Rect(0, 0, GLOBAL_DEFAULT_SCREENSIZE.width, GLOBAL_DEFAULT_SCREENSIZE.height);
        bg.color = '#594764';
        bg.pos = zeroPos();
        bg.ignoreEvents = true;
        _this6.add(bg);
        _this6.bg = bg;

        _this6.showStars();
        _this6.showStarboy(onClickPlay);
        //this.showTitle();
        //this.showPlayButton(onClickPlay);
        //this.showSettingsButton(onClickSettings);
        return _this6;
    }

    _createClass(MainMenu, [{
        key: 'showStars',
        value: function showStars() {
            var _this7 = this;

            var NUM_STARS = 70;
            var STARBOY_RECT = { x: GLOBAL_DEFAULT_SCREENSIZE.width / 2.0 - 298 / 1.8 / 2, y: GLOBAL_DEFAULT_SCREENSIZE.height / 2.1 - 385 / 1.8 / 2, w: 298 / 1.8, h: 385 / 1.8 };
            var genRandomPt = function genRandomPt() {
                return randomPointInRect({ x: 0, y: 0, w: GLOBAL_DEFAULT_SCREENSIZE.width, h: GLOBAL_DEFAULT_SCREENSIZE.height });
            };
            var stars = [];
            var n = NUM_STARS;

            var _loop = function _loop() {

                // Create an instance of a star illustration.
                var star = new MenuStar();
                //star.anchor = { x:0.5, y:0.5 };

                // Find a random position that doesn't intersect other previously created stars.
                var p = genRandomPt();

                // Limit how many times we try (mobile optimization)
                var tries = 0;

                for (var i = 0; i < stars.length; i++) {
                    var s = stars[i];
                    var prect = { x: p.x, y: p.y, w: star.size.w, h: star.size.h };
                    var srect = { x: s._pos.x, y: s._pos.y, w: s.size.w, h: s.size.h };
                    tries++;
                    if ((intersects(STARBOY_RECT, prect) || intersects(prect, srect)) && tries < 100) {
                        p = genRandomPt();
                        i = 0;
                    }
                }

                // Set star properties
                star.pos = p;
                star.opacity = 0.4;
                var scale = Math.random() * 0.3 + 0.3;
                star.scale = { x: scale, y: scale };
                _this7.add(star);
                stars.push(star);

                // Twinkling effect
                Animate.wait(1000 * Math.random()).after(function () {
                    return star.twinkle();
                });

                // "Zoom"
                var screenCenter = { x: GLOBAL_DEFAULT_SCREENSIZE.width / 2.0, y: GLOBAL_DEFAULT_SCREENSIZE.height / 2.0 };
                var fromCenter = fromTo(screenCenter, star.pos);
                var offscreenDest = addPos(screenCenter, rescalePos(fromCenter, screenCenter.x * 1.6));
                var comebackDest = addPos(screenCenter, rescalePos(fromCenter, 120));
                var zoom = function zoom() {
                    Animate.tween(star, { pos: offscreenDest, scale: { x: 0.6, y: 0.6 } }, 3000 * distBetweenPos(star.pos, screenCenter) / distBetweenPos(offscreenDest, screenCenter), function (e) {
                        return Math.pow(e, 0.8);
                    }).after(function () {
                        star.pos = comebackDest;
                        star.scale = { x: scale, y: scale };
                        star.opacity = 0;
                        zoom();
                    });
                };
                star.zoomAnimation = function () {

                    zoom();
                    //Animate.wait(distBetweenPos(p, screenCenter) / distBetweenPos(offscreenDest, screenCenter) * 1000).after(zoom);
                };
            };

            while (n-- > 0) {
                _loop();
            }
            this.stars = stars;
        }
    }, {
        key: 'zoom',
        value: function zoom() {
            this.stars.forEach(function (star) {
                star.zoomAnimation();
            });
        }
    }, {
        key: 'showStarboy',
        value: function showStarboy(onclick) {
            var _this8 = this;

            var bg = this.bg;
            var _this = this;
            var starboy = new mag.Button(0, 0, 298 / 1.8, 385 / 1.8, { default: 'mainmenu-starboy', hover: 'mainmenu-starboy-glow', down: 'mainmenu-starboy-glow' }, function () {
                if (_this.title) _this.remove(_this.title);
                Resource.play('mainmenu-enter');
                starboy.cancelFloat = true;
                starboy.ignoreEvents = true;
                Animate.tween(starboy, { scale: { x: 0.0, y: 0.0 } }, 2500, function (e) {
                    return Math.pow(e, 2);
                });
                Animate.wait(2000).after(function () {
                    Animate.run(function (e) {
                        bg.color = colorTween(e, [89 / 255.0, 71 / 255.0, 100 / 255.0], [0, 0, 0]);
                        _this.stars.forEach(function (s) {
                            s.opacity = 1 - e;
                            s.cancelBlink = true;
                        });
                        _this.draw();
                    }, 700).after(function () {
                        _this.stars.forEach(function (s) {
                            _this.remove(s);
                        });
                        _this.stars = [];
                        _this.remove(starboy);
                        _this.starboy = null;
                        _this.draw();
                        onclick();
                    });
                });
                _this8.zoom();
            });
            starboy.anchor = { x: 0.5, y: 0.5 };
            starboy.pos = { x: GLOBAL_DEFAULT_SCREENSIZE.width / 2.0, y: GLOBAL_DEFAULT_SCREENSIZE.height / 2.1 };
            this.add(starboy);

            var y = starboy._pos.y;
            var float = 0;
            var twn = new mag.IndefiniteTween(function (delta) {
                float += delta / 600;
                starboy.pos = { x: starboy.pos.x, y: y + Math.cos(float) * 14 };
                if (starboy.cancelFloat) twn.cancel();
            });
            twn.run();

            this.starboy = starboy;
        }
    }, {
        key: 'showTitle',
        value: function showTitle() {
            var title = new TextExpr('R   E   D   U   C   T', 'Consolas', 30);
            title.color = 'white';
            title.anchor = { x: 0.5, y: 0.5 };
            title.pos = { x: GLOBAL_DEFAULT_SCREENSIZE.width / 2.0, y: GLOBAL_DEFAULT_SCREENSIZE.height / 1.2 };
            this.add(title);
            this.title = title;
        }
    }, {
        key: 'showPlayButton',
        value: function showPlayButton(onClickPlay) {
            var b = new MenuButton(GLOBAL_DEFAULT_SCREENSIZE.width / 2.0, GLOBAL_DEFAULT_SCREENSIZE.height / 2.0 + 80, 140, 100, 'Play', onClickPlay);
            b.anchor = { x: 0.5, y: 0.5 };
            this.add(b);
        }
    }, {
        key: 'showSettingsButton',
        value: function showSettingsButton(onClickSettings) {
            var b = new MenuButton(GLOBAL_DEFAULT_SCREENSIZE.width / 2.0, GLOBAL_DEFAULT_SCREENSIZE.height / 2.0 + 80 + 120, 140, 60, 'Settings', onClickSettings, 'Purple', 'lightgray', 'Indigo', 'Purple');
            b.anchor = { x: 0.5, y: 0.5 };
            this.add(b);
        }
    }, {
        key: 'onorientationchange',
        value: function onorientationchange() {
            this.starboy.pos = { x: GLOBAL_DEFAULT_SCREENSIZE.width / 2.0, y: GLOBAL_DEFAULT_SCREENSIZE.height / 2.1 };
            this.title.pos = { x: GLOBAL_DEFAULT_SCREENSIZE.width / 2.0, y: GLOBAL_DEFAULT_SCREENSIZE.height / 1.2 };
            this.bg.size = {
                w: GLOBAL_DEFAULT_SCREENSIZE.width, h: GLOBAL_DEFAULT_SCREENSIZE.height
            };
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

var SpendBoard = function (_mag$Rect2) {
    _inherits(SpendBoard, _mag$Rect2);

    function SpendBoard() {
        var score = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
        var textColor = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'white';
        var iconColor = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'gold';

        _classCallCheck(this, SpendBoard);

        var _this10 = _possibleConstructorReturn(this, (SpendBoard.__proto__ || Object.getPrototypeOf(SpendBoard)).call(this, 0, 0, 120, 100));

        _this10.color = null;
        _this10.shadowOffset = 0;
        _this10.ignoreEvents = true;

        var t = new TextExpr(score.toString(), 'Futura', 64);
        t.pos = { x: 40, y: 80 };
        t.color = textColor;
        t.anchor = { x: 1, y: 0 };
        _this10.addChild(t);
        _this10.text = t;

        var spendIcon = new mag.Star(0, 0, 26, 5);
        spendIcon.pos = { x: t.pos.x + 10, y: 30 };
        spendIcon.ignoreEvents = true;
        spendIcon.color = iconColor;
        spendIcon.shadowOffset = 0;
        _this10.icon = spendIcon;
        _this10.addChild(spendIcon);
        return _this10;
    }

    _createClass(SpendBoard, [{
        key: 'addPoint',
        value: function addPoint() {
            var _this11 = this;

            var animated = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
            var subtract = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

            var dir = subtract ? -1 : 1;
            if (!animated) this.points = this.points + 1 * dir;else {
                var _ret2 = function () {
                    if (_this11._animating) _this11._animating++;else {
                        _this11._orig_pos = _this11.text.pos;
                        _this11._animating = 1;
                    }
                    var end_pos = _this11._animating > 1 ? _this11._orig_pos : _this11.text.pos;
                    var start_pos = addPos(end_pos, { x: 0, y: -20 * dir });
                    _this11.text.pos = start_pos;
                    _this11.points = _this11.points + 1 * dir;
                    return {
                        v: Animate.tween(_this11.text, { pos: end_pos }, 300, function (elapsed) {
                            return Math.pow(elapsed, 0.5);
                        }).after(function () {
                            _this11.text.pos = end_pos;
                            _this11._animating--;
                            if (_this11._animating === 0) _this11._orig_pos = null;
                        })
                    };
                }();

                if ((typeof _ret2 === 'undefined' ? 'undefined' : _typeof(_ret2)) === "object") return _ret2.v;
            }
        }
    }, {
        key: 'addPoints',
        value: function addPoints(num) {
            var _this12 = this;

            var animated = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

            if (num === 0) return;
            if (!animated) this.points = this.points + num;else {
                (function () {
                    var left = num;
                    var subtract = left < 0;
                    _this12.addPoint(true, subtract).after(function () {
                        if (subtract) left++;else left--;
                        _this12.addPoints(left, true);
                    });
                })();
            }
        }
    }, {
        key: 'losePoints',
        value: function losePoints(num) {
            var animated = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
            // Convenient wrapper, even though addPoints can subtract too.
            this.addPoints(num, animated);
        }
    }, {
        key: 'losePoint',
        value: function losePoint() {
            var animated = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
            // Convenient wrapper, even though addPoint can subtract too.
            this.addPoint(animated, true);
        }
    }, {
        key: 'points',
        get: function get() {
            return parseInt(this.text.text);
        },
        set: function set(pts) {
            this.text.text = pts.toString();
        }
    }]);

    return SpendBoard;
}(mag.Rect);

var LevelCell = function (_MenuButton) {
    _inherits(LevelCell, _MenuButton);

    function LevelCell() {
        _classCallCheck(this, LevelCell);

        return _possibleConstructorReturn(this, (LevelCell.__proto__ || Object.getPrototypeOf(LevelCell)).apply(this, arguments));
    }

    _createClass(LevelCell, [{
        key: 'drawPositionsFor',
        value: function drawPositionsFor(num) {
            var L = 0.15;
            var T = L;
            var R = 1.0 - L;
            var B = R;
            var M = 0.5;
            var MT = (M + T) / 2.0;
            var MB = (M + B) / 2.0;
            var ML = (M + L) / 2.0;
            var MR = (M + R) / 2.0;
            var MLL = (L + ML) / 2.0;
            var MRR = (R + MR) / 2.0;
            var map = {
                0: [],
                1: [{ x: M, y: M }],
                2: [{ x: ML, y: MT }, { x: MR, y: MB }],
                3: [{ x: MRR, y: MB }, { x: M, y: MT }, { x: MLL, y: MB }]
            };
            if (num in map) return map[num];else {
                //console.error('Dice pos array does not exist for number ' + num + '.');
                return [];
            }
        }
    }, {
        key: 'lock',
        value: function lock() {
            this.text.text = '🔒';
            if (!this.hasChild(this.text)) this.addChild(this.text);
            this.color = '#666';
            this.shadowColor = 'gray';
            this.pos = { x: this.pos.x, y: this.pos.y + this.shadowOffset - 8 };
            this.shadowOffset = 8;
            this.ignoreEvents = true;
        }
    }, {
        key: 'markAsIncomplete',
        value: function markAsIncomplete() {
            this.setColors('Gold', 'white', 'Orange', 'Red');
            this.ignoreEvents = false;
            this.isIncomplete = true;
            this.stroke.color = 'DarkRed';
        }
    }, {
        key: 'addStars',
        value: function addStars(num) {
            var strokeColor = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'MediumSeaGreen';

            var positions = this.drawPositionsFor(num);
            for (var i = 0; i < positions.length; i++) {
                var rad = 12 - (positions.length - 1) * 3.0;
                var _star = new mag.Star(this.size.w * positions[i].x, this.size.h * positions[i].y + 2, rad, 5);
                _star.anchor = { x: 0.5, y: 0.5 };
                _star.shadowOffset = -2;
                _star.color = this.isIncomplete ? 'DarkRed' : 'gold'; //Math.random() > 0.5 ? 'gold' : 'DarkSlateGray';
                _star.ignoreEvents = true;
                _star.stroke = { color: strokeColor, lineWidth: 1 };
                this.addChild(_star);
            }
        }
    }]);

    return LevelCell;
}(MenuButton);

var LevelSelectGrid = function (_mag$Rect3) {
    _inherits(LevelSelectGrid, _mag$Rect3);

    function LevelSelectGrid(chapterNameOrLevels, onLevelSelect) {
        _classCallCheck(this, LevelSelectGrid);

        var _this14 = _possibleConstructorReturn(this, (LevelSelectGrid.__proto__ || Object.getPrototypeOf(LevelSelectGrid)).call(this, 0, 0, 0, 0));

        _this14.color = null;
        _this14.loadGrid(chapterNameOrLevels, onLevelSelect);
        return _this14;
    }

    _createClass(LevelSelectGrid, [{
        key: 'hide',
        value: function hide(dur) {
            var _this15 = this;

            if (dur > 0) {
                var _ret4 = function () {
                    var len = _this15.children.length;
                    _this15.children.forEach(function (c, i) {
                        c.opacity = 1;
                        Animate.tween(c, { scale: { x: 0, y: 0 }, opacity: 0 }, (len - i - 1) * 30).after(function () {
                            _this15.removeChild(c);
                        });
                    });
                    return {
                        v: Animate.wait((len - 1) * 30)
                    };
                }();

                if ((typeof _ret4 === 'undefined' ? 'undefined' : _typeof(_ret4)) === "object") return _ret4.v;
            } else {
                this.children = [];
                return Animate.wait(0);
            }
        }
    }, {
        key: 'gridSizeForLevelCount',
        value: function gridSizeForLevelCount(n) {
            if (n <= 8) return 80;else if (n <= 14) return 60;else return 44;
        }
    }, {
        key: 'show',
        value: function show() {
            this.children = [];
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this.cells[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var cell = _step.value;

                    this.addChild(cell);
                    cell.opacity = 1.0;

                    // Animate cell into position.
                    cell._animation();
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            this.update();
        }
    }, {
        key: 'loadGrid',
        value: function loadGrid(chapterNameOrLevels, onselect) {
            var _this16 = this;

            // Layout measurement
            var levels;
            if (typeof chapterNameOrLevels === 'string') levels = Resource.levelsForChapter(chapterNameOrLevels);else levels = chapterNameOrLevels.slice();
            var NUM_CELLS = levels[0].length; // total number of cells to fit on the grid
            var CELL_SIZE = this.gridSizeForLevelCount(NUM_CELLS); // width and height of each cell square, in pixels
            var SCREEN_WIDTH = GLOBAL_DEFAULT_SCREENSIZE.width; // the width of the screen to work with
            var SCREEN_HEIGHT = GLOBAL_DEFAULT_SCREENSIZE.height; // the height of the screen to work with
            var PADDING = 20; // padding between cells
            var GRID_MARGIN = 200; // margin bounding grid on top, left, and right sides
            var NUM_COLS = Math.trunc((SCREEN_WIDTH - GRID_MARGIN * 2) / (CELL_SIZE + PADDING)); // number of cells that fit horizontally on the screen
            var NUM_ROWS = Math.trunc(NUM_CELLS / NUM_COLS + 1); // number of rows
            var GRID_LEFTPAD = (SCREEN_WIDTH - ((CELL_SIZE + PADDING) * NUM_COLS + GRID_MARGIN * 2)) / 2.0 + 20;
            var TOP_MARGIN = SCREEN_HEIGHT / 2.0 - (CELL_SIZE + PADDING) * NUM_ROWS / 2.0;

            // console.log(levels);
            // console.log(SCREEN_WIDTH - GRID_MARGIN*2, CELL_SIZE + PADDING, NUM_CELLS, NUM_COLS, NUM_ROWS);

            var start_idx = levels[1];
            var genClickCallback = function genClickCallback(level_idx) {
                return function () {
                    var thisButton = this; // if called by the LevelCell, 'this' will refer to the cell itself.
                    onselect(thisButton, start_idx + level_idx);
                };
            };

            var leftmost = GRID_LEFTPAD + GRID_MARGIN;
            var x = leftmost;
            var y = TOP_MARGIN;
            this.cells = [];

            for (var r = 0; r < NUM_ROWS; r++) {

                var last_row = r === NUM_ROWS - 1;
                var i = r * NUM_COLS;

                var _loop2 = function _loop2(c) {

                    // Create a level cell and add it to the grid.
                    var cell = new LevelCell(x + CELL_SIZE / 2.0 + (last_row ? (NUM_COLS - NUM_CELLS % NUM_COLS) * (CELL_SIZE + PADDING) / 2.0 : 0), y + CELL_SIZE / 2.0, CELL_SIZE, CELL_SIZE, i.toString(), genClickCallback(i), 'LightGreen', 'Green', 'Green', 'DarkGreen');
                    //r === 0 ? 'LightGreen' : 'Gold', 'white', r === 0 ? 'Green' : 'Teal', r === 0 ? 'DarkGreen' : 'DarkMagenta');
                    cell.onDownColor = r === 0 ? 'YellowGreen' : 'Orange';
                    cell.anchor = { x: 0.5, y: 0.5 };

                    var numStars = Math.trunc(i / NUM_CELLS * 3 + 1);
                    var idx = start_idx + i;
                    if (!ProgressManager.isLevelComplete(idx)) {
                        if (i === 0 || ProgressManager.isLevelUnlocked(idx) || idx > 0 && ProgressManager.isLevelComplete(idx - 1)) {
                            cell.markAsIncomplete();
                            cell.addStars(numStars, 'orange');
                            if (idx === 0) ProgressManager.updateLevelStatus(idx, { isUnlocked: true }); // very first level is always unlocked.
                        } else {
                                cell.lock();
                            }
                        ProgressManager.updateLevelStatus(idx, {
                            isComplete: false,
                            totalWorth: numStars,
                            remainingWorth: numStars
                        });
                    } else {
                        cell.addStars(numStars);
                    }

                    //if (i > 5) cell.lock();
                    _this16.cells.push(cell);

                    var dur = i * 50;
                    cell._animation = function () {
                        var _this17 = this;

                        this.scale = { x: 0.0, y: 0 };
                        Animate.wait(dur).after(function () {
                            Animate.tween(_this17, { scale: { x: 1, y: 1 } }, 300, function (elapsed) {
                                return Math.pow(elapsed, 0.5);
                            }).after(function () {
                                if (_this17.isIncomplete) _this17.showExpandingEffect('white', 500, true, 2000);
                            });
                        });
                    };

                    // Increment x-position.
                    x += CELL_SIZE + PADDING;

                    // The level index, calculated from the row and column indices.
                    i++;
                    if (i >= NUM_CELLS) return 'break';
                };

                for (var c = 0; c < NUM_COLS; c++) {
                    var _ret5 = _loop2(c);

                    if (_ret5 === 'break') break;
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

var LevelSpot = function (_mag$Circle) {
    _inherits(LevelSpot, _mag$Circle);

    function LevelSpot(x, y, r, onclick) {
        _classCallCheck(this, LevelSpot);

        var _this18 = _possibleConstructorReturn(this, (LevelSpot.__proto__ || Object.getPrototypeOf(LevelSpot)).call(this, x, y, r));

        _this18.color = 'gray';
        _this18.enabled = false;
        _this18.shadowOffset = 0;
        _this18.highlightColor = 'lime';
        _this18.disabledColor = 'gray';
        _this18.enabledColor = 'white';
        _this18.stroke = { color: 'black', lineWidth: 2 };
        _this18.onclick = onclick;
        _this18.flashing = false;

        var glow = new mag.ImageRect(0, 0, r * 2.5, r * 2.5, 'level-spot-glow');
        glow.anchor = { x: 0.5, y: 0.5 };
        glow.pos = { x: r, y: r };
        glow.ignoreEvents = true;
        _this18.glow = glow;
        _this18.glow.parent = _this18;
        return _this18;
    }

    _createClass(LevelSpot, [{
        key: 'cancelFlash',
        value: function cancelFlash() {
            this.flashing = false;
            this.cancelBlink = true;
            this.color = 'white';
        }
    }, {
        key: 'flash',
        value: function flash() {
            var _this19 = this;

            this.enabledColor = 'cyan';
            this.color = 'cyan';

            if (this.flashing) return;

            this.flashing = true;
            this.cancelBlink = false;
            var dur = 800;
            this.glow.opacity = 1.0;
            var _this = this;
            var sound = 0;
            var blink = function blink() {
                if (_this.cancelBlink) {
                    _this19.flashing = false;
                    return;
                }

                if (sound == 0 && !_this19.ignoreEvents && _this19.stage && !_this19.stage.invalidated) {
                    Resource.play('levelspot-scan');
                }
                sound = (sound + 1) % 4;

                Animate.tween(_this19.glow, { opacity: 0.1 }, dur, function (e) {
                    return Math.pow(e, 2);
                }).after(function () {
                    if (_this.cancelBlink) {
                        _this19.flashing = false;
                        return;
                    }
                    Animate.tween(_this19.glow, { opacity: 0.6 }, dur, function (e) {
                        return Math.pow(e, 0.5);
                    }).after(blink);
                });
            };
            blink();
        }
    }, {
        key: 'enable',
        value: function enable() {
            this.color = 'white';
            this.enabled = true;
            this.enabledColor = 'white';
        }
    }, {
        key: 'disable',
        value: function disable() {
            this.color = 'gray';
            this.enabled = false;
        }
    }, {
        key: 'onmouseenter',
        value: function onmouseenter(pos) {
            if (!this.enabled) return;
            this.stroke = { color: 'yellow', lineWidth: this.stroke.lineWidth };
            this.color = this.highlightColor;
        }
    }, {
        key: 'onmouseleave',
        value: function onmouseleave(pos) {
            if (!this.enabled) return;
            this.stroke = { color: 'black', lineWidth: this.stroke.lineWidth };
            this.color = this.enabledColor;
        }
    }, {
        key: 'onmouseclick',
        value: function onmouseclick(pos) {
            if (this.enabled && this.onclick) {
                this.onclick();
            }
        }
    }, {
        key: 'drawInternal',
        value: function drawInternal(ctx, pos, boundingSize) {
            if (!this.ignoreEvents && (this.flashing || this.color === this.highlightColor)) {
                ctx.save();
                if (this.glow.opacity) {
                    if (this.color === this.highlightColor) {
                        ctx.globalAlpha = Math.max(this.glow.opacity, 0.3) + 0.4;
                    } else {
                        ctx.globalAlpha = this.glow.opacity;
                    }
                }
                var glowPos = {
                    x: pos.x - 0.6 * boundingSize.w,
                    y: pos.y - 0.6 * boundingSize.h
                };
                var glowSize = {
                    w: 2.2 * boundingSize.w,
                    h: 2.2 * boundingSize.h
                };
                this.glow.drawInternal(ctx, glowPos, glowSize);
                ctx.restore();
            }
            _get(LevelSpot.prototype.__proto__ || Object.getPrototypeOf(LevelSpot.prototype), 'drawInternal', this).call(this, ctx, pos, boundingSize);
        }
    }]);

    return LevelSpot;
}(mag.Circle);

var PlanetCard = function (_mag$ImageRect2) {
    _inherits(PlanetCard, _mag$ImageRect2);

    function PlanetCard(x, y, r, name, planet_image, onclick) {
        _classCallCheck(this, PlanetCard);

        var _this20 = _possibleConstructorReturn(this, (PlanetCard.__proto__ || Object.getPrototypeOf(PlanetCard)).call(this, x, y, r * 2, r * 2, planet_image + '-locked'));

        _this20.radius = r;
        _this20.name = name;
        _this20.onclick = onclick;

        // Backing Glow on Mouseover
        var glow = new mag.ImageRect(0, 0, r * 2.5, r * 2.5, 'planet-glow');
        glow.anchor = { x: 0.5, y: 0.5 };
        glow.pos = { x: r, y: r };
        glow.ignoreEvents = true;
        _this20.glow = glow;

        // Enable backing glow for newly accessible planet
        _this20.highlighted = false;

        // Text
        var capitalize = function capitalize(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        };
        var t = new TextExpr(capitalize(name), 'Futura', 14);
        t.color = 'white';
        t.anchor = { x: 0.5, y: 0.5 };
        t.pos = { x: r, y: 2 * r + 15 };
        _this20.text = t;
        //this.addChild(t);

        _this20.pts = [];
        _this20.unitpos = function (pos) {
            pos = clonePos(pos);
            pos.x -= _this20.absolutePos.x;
            pos.y -= _this20.absolutePos.y;
            pos.x /= _this20.absoluteSize.w / 2;
            pos.y /= _this20.absoluteSize.h / 2;
            return pos;
        };
        return _this20;
    }

    _createClass(PlanetCard, [{
        key: 'showText',
        value: function showText() {
            if (this.children.indexOf(this.text) === -1) this.addChild(this.text);
        }
    }, {
        key: 'hideText',
        value: function hideText() {
            if (this.children.indexOf(this.text) > -1) this.removeChild(this.text);
        }
    }, {
        key: 'showExpandingEffect',
        value: function showExpandingEffect() {
            var color = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'white';
            var dur = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1200;

            var _this21 = this;

            var loop = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
            var loopBreakTime = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 100;

            var rr = new mag.Circle(this.absolutePos.x, this.absolutePos.y, this.absoluteSize.w / 2.0);
            rr.color = null;
            rr.shadowOffset = 0;
            rr.anchor = this.anchor;
            rr.ignoreEvents = true;
            rr.stroke = { color: color, lineWidth: 10, opacity: 1.0 };
            this.stage.add(rr);
            Animate.run(function (elapsed) {
                //elapsed = elapsed * elapsed;
                rr.scale = { x: 1 + elapsed, y: 1 + elapsed };
                rr.stroke.opacity = 1.0 - Math.sqrt(elapsed);
                rr.pos = _this21.absolutePos;
                _this21.stage.draw();
            }, dur).after(function () {
                _this21.stage.remove(rr);
                _this21.stage.draw();
                if (loop) {
                    Animate.wait(loopBreakTime).after(function () {
                        _this21.showExpandingEffect(color, dur, loop, loopBreakTime);
                    });
                }
            });
        }
    }, {
        key: 'showShip',
        value: function showShip(worldShip) {
            // Create ship graphic
            var ship = new mag.RotatableImageRect(0, 0, 82, 70, 'ship-large');
            ship.anchor = worldShip.anchor;
            ship.scale = worldShip.absoluteScale;
            ship.rotation = -Math.PI / 2.0;
            //ship.scale = { x:0.5*r/120, y:0.5*r/120 };
            ship.pos = this.localLandingPoint;
            ship.ignoreEvents = true;
            this.ship = ship;
            this.addChild(ship);
        }
    }, {
        key: 'hideShip',
        value: function hideShip() {
            if (this.ship) {
                this.removeChild(this.ship);
                this.ship = null;
            }
        }
    }, {
        key: 'highlight',
        value: function highlight() {
            this.highlighted = true;
            this.glow.opacity = 0.5;
        }
    }, {
        key: 'removeHighlight',
        value: function removeHighlight() {
            this.highlighted = false;
            this.glow.opacity = 0;
        }
    }, {
        key: 'onmouseclick',
        value: function onmouseclick() {
            if (!this.active && !this.spendBoard) return;
            if (this.onclick) this.onclick();
            this.selected = false;
        }
    }, {
        key: 'onmouseenter',
        value: function onmouseenter() {
            var _this22 = this;

            if (!this.active && !this.spendBoard) return;
            this.selected = true;
            this.glow.opacity = this.highlighted ? 0.5 : 0.0;
            Animate.tween(this.glow, { opacity: 1.0 }, 100).after(function () {
                _this22.glow.opacity = 1;
            });
        }
    }, {
        key: 'onmouseleave',
        value: function onmouseleave(pos) {
            if (!this.active && !this.spendBoard) return;
            if (distBetweenPos(pos, this.pos) > this.absoluteSize.h / 4.0) {
                this.selected = false;
                if (this.highlighted) {
                    this.highlight(); // Reset glow
                }
            }
        }
    }, {
        key: 'drawInternal',
        value: function drawInternal(ctx, pos, boundingSize) {
            if (this.parent && Number.isNumber(this.parent.opacity)) {
                ctx.globalAlpha = this.parent.opacity * (this.opacity || 1.0);
            }
            if (this.highlighted || this.selected && this.scale.x < 1.1) {
                this.glow.parent = this;
                this.glow.draw(ctx);
            }
            _get(PlanetCard.prototype.__proto__ || Object.getPrototypeOf(PlanetCard.prototype), 'drawInternal', this).call(this, ctx, pos, boundingSize);
        }
    }, {
        key: 'activate',
        value: function activate() {
            this.image = this.image.replace('-locked', '');
            this.showText();
            this.hideCost();
            this.active = true;
        }
    }, {
        key: 'deactivate',
        value: function deactivate() {
            var cost = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

            this.active = false;
            this.hideText();
            this.removeChild(this.path);

            if (cost > 0) this.showCost(cost);
        }
    }, {
        key: 'showCost',
        value: function showCost(cost) {
            if (typeof cost === 'undefined') cost = this.cost || 0;
            if (this.spendBoard) this.hideCost();
            var board = new SpendBoard(cost, 'darkgray', 'darkgray');
            board.anchor = { x: 0.5, y: 0.5 };
            board.pos = { x: this.size.w / 2.0 + 8, y: this.size.h / 2.0 - 4 };
            board.scale = { x: 0.5, y: 0.5 };
            this.cost = cost;
            this.spendBoard = board;
            this.addChild(board);
        }
    }, {
        key: 'hideCost',
        value: function hideCost() {
            if (this.spendBoard) {
                if (this.hasChild(this.spendBoard)) this.removeChild(this.spendBoard);
                this.spendBoard = undefined;
            }
        }
    }, {
        key: 'setCost',
        value: function setCost(cost) {
            this.cost = cost;
            if (this.spendBoard) this.spendBoard.text.text = cost.toString();
        }
    }, {
        key: 'updateLevelSpots',
        value: function updateLevelSpots() {
            if (!this.spots) return;
            this.spots.forEach(function (spot, i) {
                spot.opacity = 1.0;
                // Flash the spot if it's the level after one we've
                // completed (level_idx isn't reliable for this when
                // there's multiple branches), or if it's the first spot
                // on the planet

                spot.cancelFlash();
                spot.disable();
                if (completedLevels[spot.levelId]) {
                    spot.enable();
                }
                // We have not completed the first level of this planet,
                // but presumably this planet is enabled, so enable the
                // first level
                else if (i === 0) {
                        spot.enable();
                        spot.flash();
                    } else if (!completedLevels[spot.levelId] && completedLevels[spot.levelId - 1]) {
                        spot.enable();
                        spot.flash();
                    }
            });
        }
    }, {
        key: 'setLevels',
        value: function setLevels(levels, onLevelSelect) {
            var _this23 = this;

            this.startLevelIdx = levels[1];
            this.endLevelIdx = levels[1] + levels[0].length - 1;
            var NUM_LVLS = levels[0].length; // total number of cells to fit on the grid
            var clickCallback = function clickCallback(button, level_idx) {
                var pos = button.absolutePos;
                var r = button.absoluteSize.w / 2;
                // The scale changes between the menu and stage
                var posPercent = { x: pos.x / _this23.stage.boundingSize.w,
                    y: pos.y / _this23.stage.boundingSize.h };
                var mask = new Mask(posPercent.x, posPercent.y, 20 * r);
                _this23.stage.add(mask);
                Animate.tween(mask, {
                    opacity: 1.0,
                    radius: 0.1,
                    ringControl: 100
                }, 500).after(function () {
                    _this23.stage.remove(mask);
                    onLevelSelect(Resource.level[level_idx], level_idx);
                    window.stage.add(mask);
                    Animate.tween(mask, {
                        radius: Math.max(window.stage.boundingSize.w, window.stage.boundingSize.h),
                        ringControl: 150
                    }, 400).after(function () {
                        window.stage.remove(mask);
                    });
                });
            };

            var md = new MobileDetect(window.navigator.userAgent);

            // Level grid
            this.grid = new LevelSelectGrid([Resource.level.slice(this.startLevelIdx, this.endLevelIdx + 1), this.startLevelIdx], clickCallback);
            // for (let i = 1; i <= NUM_LVLS; i++) {
            //     let spotpos = this.path.posAlongPath((i-1) / (NUM_LVLS-1));
            //     let r = 8 * this.radius / 120;
            //     if (__IS_MOBILE && md.phone()) {
            //         r = 10 * this.radius / 120;
            //     }
            //     let spot = new LevelSpot( spotpos.x, spotpos.y, r, genClickCallback(i-1) );
            //     spot.anchor = { x:0.5, y:0.5 };
            //     spot.relPosAlongPath = i / NUM_LVLS;
            //     spot.levelId = levels[1] + i-1;
            //     spot.stroke.lineWidth = Math.max(this.radius / 120 * 2, 1.5);
            //     spot.ignoreEvents = true;
            //     this.spots.push(spot);
            //
            //     if (this.active) this.addChild(spot);
            // }
        }
    }, {
        key: 'showGrid',
        value: function showGrid() {
            if (!this.grid) return;
            this.stage.add(this.grid);
            this.grid.show();
            console.log('showing grid', this.grid, this.stage);
        }
    }, {
        key: 'hideGrid',
        value: function hideGrid() {
            var _this24 = this;

            var dur = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 500;

            if (!this.grid) return;
            var stage = this.stage;
            this.grid.hide(dur).after(function () {
                stage.remove(_this24.grid);
            });
        }
    }, {
        key: 'landingPoint',
        get: function get() {
            var a = this.absolutePos;
            return { x: a.x, y: a.y - this.absoluteSize.h / 3 };
        }
    }, {
        key: 'relativeLandingPoint',
        get: function get() {
            var a = this.pos;
            return { x: a.x, y: a.y - this.size.h / 3 };
        }
    }, {
        key: 'localLandingPoint',
        get: function get() {
            return { x: this.size.w / 2.0, y: this.size.h / 2.0 / 3 };
        }
    }]);

    return PlanetCard;
}(mag.ImageRect);

var ChapterSelectShip = function (_mag$RotatableImageRe) {
    _inherits(ChapterSelectShip, _mag$RotatableImageRe);

    function ChapterSelectShip() {
        _classCallCheck(this, ChapterSelectShip);

        var _this25 = _possibleConstructorReturn(this, (ChapterSelectShip.__proto__ || Object.getPrototypeOf(ChapterSelectShip)).call(this, 0, 0, 82, 70, 'ship-large'));

        _this25.pointing = { x: 1, y: 0 };
        _this25.velocity = { x: 0, y: 0 };

        _this25.planet = null;

        var trailWidth = 140;
        var trail = new RainbowTrail(0, 0, trailWidth, 30);
        trail.pos = { x: -trailWidth + 20, y: 20 };
        //trail.anchor = { x:1, y:0 };
        _this25.trail = trail;
        _this25.addChild(trail);
        return _this25;
    }

    // Fly to another planet. (entire sequence)


    _createClass(ChapterSelectShip, [{
        key: 'flyToPlanet',
        value: function flyToPlanet(stage, startPlanet, endPlanet) {
            var _this26 = this;

            // Hide the local ships and make the world ship
            // the only ship visible.
            this.pos = startPlanet.relativeLandingPoint;
            startPlanet.hideShip();
            endPlanet.hideShip();

            stage.planetParent.ignoreEvents = true;

            var startScale = this.scale.x;
            var endScale = endPlanet.radius / 120 / 2;
            var dest = endPlanet.relativeLandingPoint;
            var aboveOrbitDest = addPos(endPlanet.landingPoint, { x: 0, y: -75 });
            var relativeAboveOrbitDest = addPos(dest, { x: 0, y: -75 });
            var pointing = fromTo(this.pos, aboveOrbitDest);
            var pointAngle = Math.atan2(pointing.y, pointing.x);
            this.trail.opacity = 0;
            var _this = this;
            this.rotation = -Math.PI / 2.0; // make the ship face upright

            var start = startPlanet.relativeLandingPoint;
            var end = endPlanet.relativeLandingPoint;
            var control1 = {
                x: start.x + 10,
                y: start.y - 200
            };
            var control2 = {
                x: end.x - 10,
                y: end.y + 200
            };
            end.y -= 30;

            var travelDist = distBetweenPos(this.pos, dest);
            var duration = travelDist / 100 * 1000;

            var promisify = function promisify(x) {
                return new Promise(function (resolve, reject) {
                    x.after(resolve);
                });
            };

            var stars = [];
            var starParent = new mag.Rect(0, 0, 0, 0);
            starParent.opacity = 0;
            stage.add(starParent);

            for (var i = 0; i < 120; i++) {
                var _star2 = new MenuStar();
                _star2.pos = randomPointInRect({ x: 0, y: 0, w: stage.boundingSize.w, h: stage.boundingSize.h });
                var _scale = Math.random() * 0.2 + 0.1;
                _star2.scale = { x: _scale, y: _scale };
                starParent.addChild(_star2);
                stars.push(_star2);
            }

            // The initial launch
            var launch = promisify(Animate.tween(this, {
                pos: addPos(this.pos, { x: 0, y: -100 })
            }, 1000));
            var del = 0;
            var launchTrail = promisify(Animate.run(function (e) {
                _this26.trail.opacity = Math.min(0.4, Math.pow(e, 0.05));
                _this26.trail.time += (e - del) * 4000;
                del = e;
            }, 1250));

            return launch.then(function () {
                var p = _this26.absolutePos;
                stage.planetParent.removeChild(_this26);
                stage.add(_this26);
                _this26.pos = p;
                _this26.parent = null;

                _this26.image = 'ship-large-starboy';

                var rotate = promisify(Animate.tween(_this26, {
                    rotation: 0
                }, 600));

                // Zoom in on Starchild
                var zoomShip = promisify(Animate.tween(_this26, {
                    scale: { x: 5, y: 5 },
                    pos: {
                        x: stage.boundingSize.w / 2 - 2.5 * _this26.size.w,
                        y: stage.boundingSize.h / 2 - 2.5 * _this26.size.h
                    }
                }, 600));

                stage.starParent.opacity = 1.0;
                var fadeOutStars = promisify(Animate.tween(stage.starParent, {
                    opacity: 0
                }, 400));

                var fadeInStars = promisify(Animate.tween(starParent, {
                    opacity: 0.7
                }, 400));

                stage.planetParent.opacity = 1.0;
                var zoom = promisify(Animate.tween(stage.planetParent, {
                    opacity: 0
                }, 600));

                return Promise.all([zoomShip, zoom, launchTrail, fadeOutStars, fadeInStars]);
            }).then(function () {
                // Prepare for ignition
                _this26.trail.time = 0;
                return promisify(Animate.tween(_this26.trail, {
                    opacity: 0,
                    time: 500
                }, 300)).then(function () {
                    return promisify(Animate.tween(_this26.trail, {
                        opacity: 1.0,
                        time: 2500
                    }, 200));
                });
            }).then(function () {
                // Enter warp space!
                var mask = new Mask(0, 0, 0.01, "#FFFFFF");
                _this26.stage.add(mask);

                var flash = after(200).then(function () {
                    return promisify(Animate.tween(mask, {
                        opacity: 1.0
                    }, 100));
                }).then(function () {
                    return promisify(Animate.tween(mask, {
                        opacity: 0.0
                    }, 100));
                }).then(function () {
                    return _this26.stage.remove(mask);
                });

                var jumpForward = promisify(Animate.tween(_this26, {
                    pos: addPos(_this26.pos, { x: 300, y: 0 })
                }, 300));

                return jumpForward;
            }).then(function () {
                // Cruising along
                var jumpBack = promisify(Animate.tween(_this26, {
                    pos: addPos(_this26.pos, { x: -300, y: 0 })
                }, 1000));

                var origSize = stars[0].size;
                var sizer = stars[0].size;
                stars.forEach(function (s) {
                    return s.size = sizer;
                });
                var starStretch = promisify(Animate.tween(sizer, {
                    w: 450,
                    h: 6
                }, 600));

                var flyingDuration = 6000;
                var deceleration = 0.75;

                var t0 = 0;
                var flying = promisify(Animate.run(function (t1) {
                    _this26.trail.time += 8000 * (t1 - t0);

                    var dx = 15000 * (t1 - t0);
                    if (t1 > deceleration) dx *= -4 * t1 + 4;
                    stars.forEach(function (s) {
                        s.pos = addPos(s.pos, { x: -dx, y: 0 });
                        if (s.pos.x < 0) {
                            s.pos = { x: stage.boundingSize.w * (0.9 + Math.random() / 5), y: s.pos.y };
                        }
                    });

                    t0 = t1;
                }, flyingDuration));

                var slowing = after(flyingDuration - 500).then(function () {
                    return promisify(Animate.tween(sizer, origSize, 500));
                });

                return Promise.all([flying, slowing]);
            }).then(function () {
                // Come out of warp space
                var turnOffEngine = promisify(Animate.tween(_this26.trail, {
                    opacity: 0
                }, 400));

                // Zoom back out
                var zoomShip = promisify(Animate.tween(_this26, {
                    scale: { x: endScale, y: endScale },
                    pos: aboveOrbitDest
                }, 600));

                var fadeInStars = promisify(Animate.tween(stage.starParent, {
                    opacity: 1.0
                }, 400));

                var fadeOutStars = promisify(Animate.tween(starParent, {
                    opacity: 0
                }, 400));

                var rotate = after(400).then(function () {
                    return promisify(Animate.tween(_this26, {
                        rotation: -Math.PI / 2
                    }, 600));
                });

                var zoom = promisify(Animate.tween(stage.planetParent, {
                    opacity: 1
                }, 600));

                return Promise.all([turnOffEngine, rotate, zoomShip, zoom, fadeOutStars, fadeInStars]);
            }).then(function () {
                _this26.image = 'ship-large';
                stage.remove(_this26);
                stage.planetParent.addChild(_this26);
                _this26.pos = relativeAboveOrbitDest;
                var land = promisify(Animate.tween(_this26, {
                    pos: dest
                }, 1000));
                return land;
            }).then(function () {
                stage.planetParent.ignoreEvents = false;
                endPlanet.showShip(_this26);
                stage.remove(starParent);
            });
        }
    }, {
        key: 'attachToPlanet',
        value: function attachToPlanet(planet) {
            this.pos = planet.landingPoint;
            this.planet = planet;
            planet.showShip(this);
        }

        // Launch the ship into the air.

    }, {
        key: 'launch',
        value: function launch() {
            var _this27 = this;

            this.planet = null;
            return new Promise(function (resolve, reject) {
                _this27.moveTo(addPos(_this27.pos, { x: 0, y: -20 }), 1000).then(resolve);
            });
        }

        // Rotate to angle.

    }, {
        key: 'rotateTo',
        value: function rotateTo(angle) {
            var _this28 = this;

            var dur = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1000;
            var smoothFunc = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function (e) {
                return e;
            };

            return new Promise(function (resolve, reject) {
                Animate.tween(_this28, { rotation: angle }, dur, smoothFunc).after(resolve);
            });
        }

        // Move to pos (without changing rotation).

    }, {
        key: 'moveTo',
        value: function moveTo(dest) {
            var _this29 = this;

            var dur = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1000;
            var smoothFunc = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function (e) {
                return e;
            };

            return new Promise(function (resolve, reject) {
                Animate.tween(_this29, { pos: clonePos(dest) }, dur, smoothFunc).after(function () {
                    resolve();
                });
            });
        }

        // Execute landing sequence.

    }, {
        key: 'land',
        value: function land(dest) {
            var _this30 = this;

            this.trail.opacity = 0;
            return this.rotateTo(-Math.PI / 2.0, 500).then(function () {
                return _this30.moveTo(dest, 1000);
            });
        }
    }, {
        key: 'thrust',
        value: function thrust(force, delta) {
            var MAX_VEL = 1;
            var deltaForce = scalarMultiply(force, delta);
            var step = dotProduct(deltaForce, this.pointing);
            this.pointing = normalize(addPos(this.pointing, deltaForce));
            this.velocity = addPos(this.velocity, scalarMultiply(this.pointing, step));
            if (lengthOfPos(this.velocity) > MAX_VEL) this.velocity = rescalePos(this.velocity, MAX_VEL);
            this.pos = addPos(this.velocity, this.pos);
            this.rotation = Math.atan2(this.pointing.y, this.pointing.x);
            this.trail.time += delta * 400;
        }
    }, {
        key: 'flyTo',
        value: function flyTo(dest, onReachingDest) {
            var _this31 = this;

            var FORCE = 10;
            var travelDist = distBetweenPos(this.pos, dest);
            var pointing = fromTo(this.pos, dest);
            var DUR = travelDist / 100 * 1000; // 1 sec per 100 units.
            this.rotation = Math.atan2(pointing.y, pointing.x);

            var del = 0;
            Animate.run(function (e) {
                _this31.trail.opacity = Math.pow(e, 0.5);
                _this31.trail.time += (e - del) * 8000;
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
    }, {
        key: 'drawInternal',
        value: function drawInternal(ctx, pos, boundingSize) {
            // Need to save pos for later because it gets changed in the middle??
            this._savedPos = pos;
        }
    }, {
        key: 'drawInternalAfterChildren',
        value: function drawInternalAfterChildren(ctx, pos, boundingSize) {
            pos = this._savedPos;
            _get(ChapterSelectShip.prototype.__proto__ || Object.getPrototypeOf(ChapterSelectShip.prototype), 'drawInternal', this).call(this, ctx, pos, boundingSize);
        }
    }]);

    return ChapterSelectShip;
}(mag.RotatableImageRect);

var ChapterSelectMenu = function (_mag$Stage2) {
    _inherits(ChapterSelectMenu, _mag$Stage2);

    // flyToChapIdx should be an array of
    // {
    //     chapterIdx: chapter_idx,
    //     startIdx: idx_of_starting_level,
    // }

    function ChapterSelectMenu(canvas, onLevelSelect, flyToChapIdx) {
        _classCallCheck(this, ChapterSelectMenu);

        var _this32 = _possibleConstructorReturn(this, (ChapterSelectMenu.__proto__ || Object.getPrototypeOf(ChapterSelectMenu)).call(this, canvas));

        _this32.md = new MobileDetect(window.navigator.userAgent);
        _this32.onLevelSelect = onLevelSelect;

        _this32.btn_back = new mag.Button(10, 10, 50, 50, { default: 'btn-back-default', hover: 'btn-back-hover', down: 'btn-back-down' }, function () {
            _this32.activePlanet = null;
            _this32.remove(_this32.btn_back);
            _this32.setPlanetsToDefaultPos(500);
            Resource.play('goback');
        });
        _this32.btn_back.opacity = 0.7;

        _this32.spendBoard = new SpendBoard(ProgressManager.getScore());
        _this32.spendBoard.anchor = { x: 1, y: 1 };
        _this32.spendBoard.pos = { x: GLOBAL_DEFAULT_SCREENSIZE.width, y: GLOBAL_DEFAULT_SCREENSIZE.height };

        // DEBUG: Add points to test unlock functions.
        // Animate.wait(2000).after(() => {
        //     this.spendBoard.addPoints(8);
        // });

        _this32.planets = [];
        _this32.stars = [];
        _this32.activePlanet = null;
        _this32.starParent = new mag.Rect(0, 0, 0, 0);
        _this32.add(_this32.starParent);

        _this32.showStarField();

        _this32.onorientationchange();

        _this32.showChapters().then(function () {
            _this32.updateParallax();

            _this32.add(_this32.spendBoard);

            _this32.offset = { x: 0, y: 0 };
            var lastActivePlanet = _this32.lastActivePlanet;

            _this32.setCameraX(lastActivePlanet.pos.x - 3 * lastActivePlanet.radius);

            var ship = new ChapterSelectShip();
            var shipScale = lastActivePlanet.radius / 120 / 2;
            ship.scale = { x: shipScale, y: shipScale };

            if (flyToChapIdx && flyToChapIdx.length > 0) {
                ship.attachToPlanet(lastActivePlanet);

                var minNewPlanetX = 1000000;
                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    var _loop3 = function _loop3() {
                        var chap = _step2.value;

                        var newChapIdx = chap.chapterIdx;
                        var newPlanet = _this32.planets[newChapIdx];
                        newPlanet.highlight();
                        newPlanet.activate();
                        newPlanet.deactivateSpots();
                        var oldOnClick = newPlanet.onclick;
                        minNewPlanetX = Math.min(minNewPlanetX, newPlanet.pos.x);

                        newPlanet.onclick = function () {
                            newPlanet.onclick = oldOnClick;
                            newPlanet.removeHighlight();
                            _this32.remove(ship);
                            _this32.planetParent.addChild(ship);
                            var startPlanet = lastActivePlanet;
                            ship.flyToPlanet(_this32, startPlanet, newPlanet).then(function () {
                                return new Promise(function (resolve, reject) {
                                    Animate.wait(600).after(function () {
                                        _this32.planetParent.removeChild(ship);
                                        resolve();
                                    });
                                });
                            }).then(oldOnClick).then(function () {
                                newPlanet.activateSpots();
                                // Get level_idx from the chapter
                                // itself, instead of assuming
                                // linearity
                                level_idx = chap.startIdx;
                                saveProgress();
                            });
                        };
                    };

                    for (var _iterator2 = flyToChapIdx[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        _loop3();
                    }
                } catch (err) {
                    _didIteratorError2 = true;
                    _iteratorError2 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
                            _iterator2.return();
                        }
                    } finally {
                        if (_didIteratorError2) {
                            throw _iteratorError2;
                        }
                    }
                }

                if (minNewPlanetX + _this32.planetParent.pos.x > 0.8 * _this32.boundingSize.w) {
                    _this32.setCameraX(minNewPlanetX - 0.8 * _this32.boundingSize.w);
                }
            } else {
                ship.attachToPlanet(lastActivePlanet);
            }
        });
        return _this32;
    }

    _createClass(ChapterSelectMenu, [{
        key: 'reset',
        value: function reset() {
            var _this33 = this;

            this.panningEnabled = true;
            this.starParent.children = [];
            this.showStarField();
            var lastActivePlanet = this.lastActivePlanet;
            if (!lastActivePlanet) return;
            this.remove(this.btn_back);
            this.setPlanetsToDefaultPos(0).then(function () {
                _this33.setCameraX(lastActivePlanet.pos.x - 3 * lastActivePlanet.radius);

                if (_this33.activePlanet) {
                    _this33.activatePlanet(_this33.activePlanet, 0);
                }
            });
        }
    }, {
        key: 'setCameraX',
        value: function setCameraX(x) {
            x = Math.max(x, 0);
            x = Math.min(x, this.maxPlanetX - this.boundingSize.w);
            this.planetParent.pos = {
                x: -x,
                y: this.planetParent.pos.y
            };
            this.updateParallax();
        }
    }, {
        key: 'updateParallax',
        value: function updateParallax() {
            if (this.maxPlanetX) {
                var cameraX = -Math.min(0, this.planetParent.pos.x);
                var x = Math.min(1.0, cameraX / (1 + this.maxPlanetX - this.boundingSize.w)) * 0.5 * this.boundingSize.w;
                x = Math.max(x, 0);
                this.starParent.pos = {
                    x: -x,
                    y: this.starParent.pos.y
                };
            }
        }
    }, {
        key: 'onmousedown',
        value: function onmousedown(pos) {
            _get(ChapterSelectMenu.prototype.__proto__ || Object.getPrototypeOf(ChapterSelectMenu.prototype), 'onmousedown', this).call(this, pos);
            this._dragStart = pos;
        }
    }, {
        key: 'onmousedrag',
        value: function onmousedrag(pos) {
            if (this.panningEnabled) {
                var dx = pos.x - this._dragStart.x;
                dx *= 2;
                this.setCameraX(-(this.planetParent.pos.x + dx));
            }
            this._dragStart = pos;
            // TODO: we should use window.onmouseup as well to cancel dragging
        }
    }, {
        key: 'onmouseup',
        value: function onmouseup(pos) {
            _get(ChapterSelectMenu.prototype.__proto__ || Object.getPrototypeOf(ChapterSelectMenu.prototype), 'onmouseup', this).call(this, pos);
            this._dragStart = null;
        }
    }, {
        key: 'onorientationchange',
        value: function onorientationchange() {
            if (__IS_MOBILE) {
                if (this.md.phone()) {
                    this.scale = 1.0;
                } else if (this.md.tablet()) {
                    this.scale = 1.2;
                } else if (this.md.mobile()) {
                    this.scale = 2.0;
                } else {
                    this.scale = 1.0;
                }
            }
            // TODO: preserve scroll
            this.reset();
        }
    }, {
        key: 'updateLevelSpots',
        value: function updateLevelSpots() {
            if (this.planets) {
                this.planets.forEach(function (p) {
                    return p.updateLevelSpots();
                });
            }
        }
    }, {
        key: 'drawImpl',
        value: function drawImpl() {
            if (this.invalidated) return; // don't draw invalidated stages.
            this.ctx.save();
            this.ctx.scale(this._scale, this._scale);
            this.clear();
            var len = this.nodes.length;
            for (var i = 0; i < len; i++) {
                this.nodes[i].draw(this.ctx);
            }
            //this.nodes.forEach((n) => n.draw(this.ctx));
            this.ctx.restore();
        }
    }, {
        key: 'showStarField',
        value: function showStarField() {
            var _this34 = this;

            var NUM_STARS = 120;
            var genRandomPt = function genRandomPt() {
                return randomPointInRect({ x: 0, y: 0, w: 1.5 * _this34.boundingSize.w, h: _this34.boundingSize.h });
            };

            var starParent = this.starParent;

            var stars = this.stars;
            var n = NUM_STARS;

            var _loop4 = function _loop4() {

                // Create an instance of a star illustration.
                var star = new MenuStar();
                //star.anchor = { x:0.5, y:0.5 };

                // Find a random position that doesn't intersect other previously created stars.
                var p = genRandomPt();

                // Set star properties
                star.pos = p;
                star.opacity = 0.4;
                var scale = Math.random() * 0.3 + 0.1;
                star.scale = { x: scale, y: scale };
                starParent.addChild(star);
                stars.push(star);

                // Twinkling effect
                Animate.wait(1000 * Math.random()).after(function () {
                    return star.twinkle(1000);
                });
            };

            while (n-- > 0) {
                _loop4();
            }
        }
    }, {
        key: 'setPlanetsToDefaultPos',
        value: function setPlanetsToDefaultPos(dur) {
            var _this35 = this;

            var stage = this;
            this.panningEnabled = true;

            if (this.transitionPaths) this.transitionPaths.forEach(function (p) {
                p.opacity = 1;
            });

            return Resource.getChapterGraph().then(function (chapters) {
                var maxPlanetX = _this35.boundingSize.w;
                var POS_MAP = layoutPlanets(chapters.transitions, _this35.boundingSize);
                stage.planets.forEach(function (p, i) {
                    maxPlanetX = Math.max(maxPlanetX, POS_MAP[i].x + p.radius);
                    p.ignoreEvents = false;
                    if (p.spots) p.spots.forEach(function (s) {
                        s.ignoreEvents = true;
                    });
                    if (p.expandFunc) p.onclick = p.expandFunc;
                    if (!stage.planetParent.hasChild(p)) stage.planetParent.addChild(p);
                    if (p.active) p.showText();
                    var rad = POS_MAP[i].r;
                    p.hideGrid(0);
                    Animate.tween(p, { pos: { x: POS_MAP[i].x, y: POS_MAP[i].y }, scale: { x: 1, y: 1 }, opacity: 1.0 }, dur).after(function () {
                        if (p.active) p.showText();
                    });
                });
                _this35.maxPlanetX = maxPlanetX;
            });
        }
    }, {
        key: 'clear',
        value: function clear() {
            this.ctx.save();
            this.ctx.fillStyle = '#594764';
            this.ctx.fillRect(0, 0, canvas.width, canvas.height);
            this.ctx.restore();
        }
    }, {
        key: 'payToUnlock',
        value: function payToUnlock(planet) {
            var _this36 = this;

            if (planet._isUnlocking) return;

            var stage = this;
            planet._isUnlocking = true;
            var totalCost = planet.cost;
            var explosionColors = ['gold', 'lime', 'DeepPink ', 'cyan', 'magenta'];
            var randomColor = function randomColor() {
                return explosionColors[Math.trunc(explosionColors.length * Math.random())];
            };

            // Animates transfer of a single spend point from board1 to board2.
            var transferPoint = function transferPoint(board1, board2) {

                // Lose the point visually.
                board1.losePoint();

                // Take the icon representing points and fly it to
                // the icon on board2. (visually transfer)
                var icon1 = board1.icon.clone();
                icon1.pos = board1.icon.absolutePos;
                icon1.anchor = board1.icon.anchor;
                icon1.scale = board1.icon.absoluteScale;
                icon1.color = randomColor(); // to add some visual cool
                stage.add(icon1);

                return Animate.tween(icon1, { pos: board2.icon.absolutePos, scale: board2.icon.absoluteScale }, 400, function (elapsed) {
                    return Math.pow(elapsed, 2);
                }).after(function () {
                    SplosionEffect.run(icon1, icon1.color, 60, 200);
                    Resource.play('splosion');
                    board2.text.color = icon1.color;
                    board2.icon.color = icon1.color;
                    board2.losePoint();
                });
            };

            var transferPoints = function transferPoints(cost, board1, board2) {
                if (cost <= 0) {

                    planet.cost = undefined;
                    planet.activate();

                    // Update + save player progress.
                    ProgressManager.updateLevelStatus(planet.startLevelIdx, {
                        isUnlocked: true
                    });
                    ProgressManager.loseScore(totalCost);
                    ProgressManager.save();

                    Resource.play('unlock-planet');
                    _this36.panningEnabled = true;
                    _this36.updatePlanetSpendBoards();

                    planet.showExpandingEffect();
                    if (planet.toPaths) {
                        (function () {
                            var START_WIDTH = 20;
                            var _iteratorNormalCompletion3 = true;
                            var _didIteratorError3 = false;
                            var _iteratorError3 = undefined;

                            try {
                                var _loop5 = function _loop5() {
                                    var toPath = _step3.value;

                                    toPath.stroke = { color: 'gold', lineWidth: START_WIDTH, opacity: 1 };
                                    Animate.run(function (elapsed) {
                                        toPath.stroke.lineWidth = Math.trunc((1 - elapsed) * (START_WIDTH - 1) + 1);
                                    }, 1000);
                                };

                                for (var _iterator3 = planet.toPaths[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                                    _loop5();
                                }
                            } catch (err) {
                                _didIteratorError3 = true;
                                _iteratorError3 = err;
                            } finally {
                                try {
                                    if (!_iteratorNormalCompletion3 && _iterator3.return) {
                                        _iterator3.return();
                                    }
                                } finally {
                                    if (_didIteratorError3) {
                                        throw _iteratorError3;
                                    }
                                }
                            }
                        })();
                    }
                    planet._isUnlocking = false;
                } else {
                    transferPoint(board1, board2).after(function () {
                        transferPoints(cost - 1, board1, board2);
                    });
                }
            };

            transferPoints(totalCost, this.spendBoard, planet.spendBoard);
        }
    }, {
        key: 'updatePlanetSpendBoards',
        value: function updatePlanetSpendBoards() {
            if (!this.planets) return;

            // Traverse planet tree to set costs.
            var firstPlanet = this.planets.filter(function (p) {
                return !p.fromPlanets;
            })[0];
            function setCostsRecursive(startPlanet, passedPlanets) {
                if (passedPlanets.indexOf(startPlanet) > -1) return;
                var NUM_TOPLANETS = startPlanet.toPlanets.length;
                var COST_FOR_NEXT_PLANETS = NUM_TOPLANETS > 0 ? Math.trunc(startPlanet.worth * 0.75 / NUM_TOPLANETS) : 0;
                startPlanet.toPlanets.forEach(function (p) {
                    p.setCost(COST_FOR_NEXT_PLANETS);
                    setCostsRecursive(p, passedPlanets);
                    passedPlanets.push(p);
                });
            }
            setCostsRecursive(firstPlanet, []);

            // Show costs only for planets immediately adjacent to unlocked planets.
            this.planets.forEach(function (planet) {
                if (!planet.active && planet.fromPlanets) {
                    // Only allow player to unlock this planet if AT LEAST ONE planet
                    // that goes to it is unlocked.
                    var allowUnlock = planet.fromPlanets.filter(function (p) {
                        return p.active;
                    }).length > 0;
                    if (allowUnlock) planet.showCost();else planet.hideCost();
                }
            });
        }
    }, {
        key: 'activatePlanet',
        value: function activatePlanet(planet) {
            var _this37 = this;

            var durationMultiplier = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1.0;

            var stage = this;

            this.activePlanet = planet;
            this.panningEnabled = false;

            var expand = function expand(planet) {
                planet.ignoreEvents = false;
                // Make sure the saving of the onclick is idempotent in
                // case we reactivate the same planet (e.g. after an
                // orientation change)
                if (planet.onclick) planet.expandFunc = planet.onclick;
                planet.onclick = null;
                planet.hideText();
                var r = Math.min(_this37.boundingSize.w / 2.2, _this37.boundingSize.h / 2.2);
                var center = {
                    x: _this37.boundingSize.w / 2.0,
                    y: _this37.boundingSize.h / 2.0
                };
                // Account for camera
                center = addPos(center, {
                    x: -_this37.planetParent.pos.x,
                    y: -_this37.planetParent.pos.y
                });
                stage.bringToFront(planet);

                var scale = r / planet.radius;
                Animate.tween(planet, { scale: { x: scale, y: scale }, pos: center }, durationMultiplier * 1000, function (elapsed) {
                    return Math.pow(elapsed, 3);
                }).after(function () {
                    planet.showGrid();
                });
            };
            var hide = function hide(planet) {
                planet.opacity = 1.0;
                planet.hideText();
                planet.hideGrid();
                if (planet.spots) planet.spots.forEach(function (s) {
                    s.ignoreEvents = true;
                });
                Animate.tween(planet, { scale: { x: 1, y: 1 }, opacity: 0 }, durationMultiplier * 500).after(function () {
                    stage.planetParent.removeChild(planet);
                });
            };

            for (var k = 0; k < this.planets.length; k++) {
                this.planets[k].ignoreEvents = true;
                if (this.planets[k] === planet) {
                    expand(this.planets[k]);
                } else {
                    hide(this.planets[k]);
                }
            }

            this.transitionPaths.forEach(function (p) {
                p.opacity = 0.0;
            });

            if (durationMultiplier > 0) {
                Resource.play('zoomin');
            }
            Animate.wait(durationMultiplier * 500).after(function () {
                _this37.add(_this37.btn_back);
            });

            return new Promise(function (resolve, reject) {
                Animate.wait(durationMultiplier * 1000).after(resolve);
            });
        }
    }, {
        key: 'showChapters',
        value: function showChapters() {
            var _this38 = this;

            // Expand and disappear animations.
            var stage = this;

            // Each chapter is a 'Planet' in Starboy's Universe:
            return Resource.getChapterGraph().then(function (chapters) {
                var planets = [];
                var POS_MAP = layoutPlanets(chapters.transitions, _this38.boundingSize);

                var planetParent = new mag.Rect(0, 0, 0, 0);
                var worth = [];

                chapters.chapters.forEach(function (chap, i) {
                    var pos = i < POS_MAP.length ? POS_MAP[i] : { x: 0, y: 0, r: 10 };
                    var planet = new PlanetCard(pos.x, pos.y, pos.r, chap.name, chap.resources ? chap.resources.planet : 'planet-bagbag');
                    planet.filename = chap.filename;

                    planet.color = 'white';
                    // if (i === 1) planet.path.stroke.color = 'gray';
                    planet.anchor = { x: 0.5, y: 0.5 };
                    planet.shadowOffset = 0;

                    if (chap.resources) {

                        // Get the levels for this chapter.
                        var levels = Resource.levelsForChapter(chap.name);
                        var NUM_LEVELS = levels[0].length;

                        // Calculate total 'worth' of the chapter as the sum of starpoints.
                        // * Uses each planet's internal default setting for number of starpoints
                        // * per level, which is related to its local index. This might change in the future.
                        worth[i] = 0;
                        for (var n = 0.0; n < NUM_LEVELS; n += 1.0) {
                            worth[i] += Math.trunc(n / NUM_LEVELS * 3 + 1);
                        }planet.worth = worth[i];

                        // Activate planet if first level unlocked or this is the very first planet.
                        if (ProgressManager.isLevelUnlocked(chap.startIdx) || chap.startIdx === 0) {
                            planet.activate();
                        } else {
                            // Lock planet and set appropriate cost-to-unlock.
                            // TEMPORARILY... The cost is 50% of the previous planets' worth.
                            console.log(chap.name, worth[i - 1]);
                            planet.deactivate(i > 0 ? Math.trunc(worth[i - 1] * 0.75) : 1);
                        }

                        // Set levels for planet.
                        planet.setLevels(levels, _this38.onLevelSelect);
                    }

                    planet.onclick = function () {
                        if (planet.active) _this38.activatePlanet(planet);else if (planet.spendBoard && planet.cost && _this38.spendBoard && planet.cost <= _this38.spendBoard.points) {
                            _this38.payToUnlock(planet);
                        } else if (planet.spendBoard) {
                            Animate.blink(planet.spendBoard.text, 1000, [1, 0, 0], 2, false);
                            Animate.blink(planet.spendBoard.icon, 1000, [1, 0, 0], 2, false);
                            Resource.play('fatbtn-beep2');
                        }
                    };

                    planets.push(planet);
                });

                var transitionPaths = [];
                var _iteratorNormalCompletion4 = true;
                var _didIteratorError4 = false;
                var _iteratorError4 = undefined;

                try {
                    var _loop6 = function _loop6() {
                        var fromPlanet = _step4.value;

                        var fromPos = fromPlanet.absolutePos;
                        var toPlanetFileNames = chapters.transitions[fromPlanet.filename];
                        var paths = [];
                        var toPlanets = planets.filter(function (p) {
                            return toPlanetFileNames.indexOf(p.filename) > -1;
                        });
                        fromPlanet.toPlanets = toPlanets;
                        var _iteratorNormalCompletion5 = true;
                        var _didIteratorError5 = false;
                        var _iteratorError5 = undefined;

                        try {
                            for (var _iterator5 = toPlanets[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                                var toPlanet = _step5.value;

                                var pts = [clonePos(fromPos), toPlanet.absolutePos];
                                var strokeStyle = void 0;
                                if (toPlanet.active) strokeStyle = { color: 'gold', lineWidth: 1, opacity: 1 };else strokeStyle = { color: 'gold', lineWidth: 1, lineDash: [5, 10], opacity: 0.2 };
                                var path = new ArrowPath(pts, strokeStyle, 8, false);
                                if (!toPlanet.toPaths) toPlanet.toPaths = [path];else toPlanet.toPaths.push(path);
                                if (!toPlanet.fromPlanets) toPlanet.fromPlanets = [fromPlanet];else toPlanet.fromPlanets.push(fromPlanet);
                                paths.push(path);
                            }
                        } catch (err) {
                            _didIteratorError5 = true;
                            _iteratorError5 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion5 && _iterator5.return) {
                                    _iterator5.return();
                                }
                            } finally {
                                if (_didIteratorError5) {
                                    throw _iteratorError5;
                                }
                            }
                        }

                        transitionPaths = transitionPaths.concat(paths);
                    };

                    for (var _iterator4 = planets[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                        _loop6();
                    }
                } catch (err) {
                    _didIteratorError4 = true;
                    _iteratorError4 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion4 && _iterator4.return) {
                            _iterator4.return();
                        }
                    } finally {
                        if (_didIteratorError4) {
                            throw _iteratorError4;
                        }
                    }
                }

                transitionPaths.forEach(function (path) {
                    return planetParent.addChild(path);
                });
                planets.forEach(function (planet) {
                    return planetParent.addChild(planet);
                });

                _this38.add(planetParent);
                _this38.planetParent = planetParent;
                _this38.transitionPaths = transitionPaths;

                var transitionMap = {};
                chapters.chapters.forEach(function (chap, i) {
                    transitionMap[chap.key] = i;
                });

                _this38.planets = planets;
                _this38.setPlanetsToDefaultPos();
                _this38.updatePlanetSpendBoards();
            });
        }
    }, {
        key: 'lastActivePlanet',
        get: function get() {
            var lastActivePlanet = void 0;
            var _iteratorNormalCompletion6 = true;
            var _didIteratorError6 = false;
            var _iteratorError6 = undefined;

            try {
                for (var _iterator6 = this.planets[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                    var _planet = _step6.value;

                    if (_planet.active && level_idx >= _planet.startLevelIdx && level_idx <= _planet.endLevelIdx) {
                        lastActivePlanet = _planet;
                        break;
                    }
                }
            } catch (err) {
                _didIteratorError6 = true;
                _iteratorError6 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion6 && _iterator6.return) {
                        _iterator6.return();
                    }
                } finally {
                    if (_didIteratorError6) {
                        throw _iteratorError6;
                    }
                }
            }

            if (!lastActivePlanet) {
                var _iteratorNormalCompletion7 = true;
                var _didIteratorError7 = false;
                var _iteratorError7 = undefined;

                try {
                    for (var _iterator7 = this.planets[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                        var planet = _step7.value;

                        if (planet.active) {
                            lastActivePlanet = planet;
                        }
                    }
                } catch (err) {
                    _didIteratorError7 = true;
                    _iteratorError7 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion7 && _iterator7.return) {
                            _iterator7.return();
                        }
                    } finally {
                        if (_didIteratorError7) {
                            throw _iteratorError7;
                        }
                    }
                }
            }
            return lastActivePlanet;
        }
    }]);

    return ChapterSelectMenu;
}(mag.Stage);

function cubicBezierPoint(start, end, control1, control2, t) {
    var x = Math.pow(1 - t, 3) * start.x + 3 * Math.pow(1 - t, 2) * t * control1.x + 3 * (1 - t) * t * t * control2.x + t * t * t * end.x;
    var y = Math.pow(1 - t, 3) * start.y + 3 * Math.pow(1 - t, 2) * t * control1.y + 3 * (1 - t) * t * t * control2.y + t * t * t * end.y;
    return { x: x, y: y };
}

function cubicBezier(start, end, control1, control2, samples) {
    var points = [];
    for (var i = 0; i < samples + 1; i++) {
        var t = i / samples;
        points.push(cubicBezierPoint(start, end, control1, control2, t));
    }

    return points;
}

function layoutPlanets(adjacencyList, boundingSize) {
    var MAX_GROUP_SIZE = 4;

    // From src/util.js
    var seed = 42;
    var seededRandom = function seededRandom(max, min) {
        max = max || 1;
        min = min || 0;

        seed = (seed * 9301 + 49297) % 233280;
        var rnd = seed / 233280;

        return min + rnd * (max - min);
    };

    // Perform a topological sort of the planets to get a layout
    var sorted = topologicalSort(adjacencyList);
    var groups = [[]];
    var _iteratorNormalCompletion8 = true;
    var _didIteratorError8 = false;
    var _iteratorError8 = undefined;

    try {
        for (var _iterator8 = sorted[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
            var group = _step8.value;

            if (group.length === 1) {
                groups[groups.length - 1] = groups[groups.length - 1].concat(group);
            } else {
                groups.push(group);
                groups.push([]);
            }
        }
    } catch (err) {
        _didIteratorError8 = true;
        _iteratorError8 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion8 && _iterator8.return) {
                _iterator8.return();
            }
        } finally {
            if (_didIteratorError8) {
                throw _iteratorError8;
            }
        }
    }

    if (groups[groups.length - 1].length === 0) groups.pop();

    var positions = [];

    var startX = 20;
    var startY = 20;
    var subgroups = [];
    var _iteratorNormalCompletion9 = true;
    var _didIteratorError9 = false;
    var _iteratorError9 = undefined;

    try {
        for (var _iterator9 = groups[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
            var _group = _step9.value;

            if (_group.length > MAX_GROUP_SIZE) {
                var numSubgroups = Math.ceil(_group.length / MAX_GROUP_SIZE);
                var subgroupSize = Math.round(_group.length / numSubgroups);
                var subgroup = [];
                while (_group.length > 0) {
                    subgroup.push(_group.shift());
                    if (subgroup.length == subgroupSize) {
                        subgroups.push(subgroup);
                        subgroup = [];
                    }
                }
                if (subgroup.length > 0) {
                    subgroups.push(subgroup);
                }
            } else {
                subgroups = [_group];
            }

            var _iteratorNormalCompletion10 = true;
            var _didIteratorError10 = false;
            var _iteratorError10 = undefined;

            try {
                for (var _iterator10 = subgroups[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
                    var _subgroup = _step10.value;

                    var boundingArea = {
                        x: startX,
                        y: startY,
                        w: _subgroup.length > 2 ? boundingSize.w : 0.75 * boundingSize.w,
                        h: boundingSize.h - 40
                    };

                    var sublayout = layoutGroup(_subgroup, boundingArea, seededRandom);
                    positions = positions.concat(sublayout);

                    var maxOffset = 0;
                    var _iteratorNormalCompletion11 = true;
                    var _didIteratorError11 = false;
                    var _iteratorError11 = undefined;

                    try {
                        for (var _iterator11 = sublayout[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
                            var _cell = _step11.value;

                            maxOffset = Math.max(maxOffset, _cell.x + _cell.r - boundingArea.x);
                        }
                    } catch (err) {
                        _didIteratorError11 = true;
                        _iteratorError11 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion11 && _iterator11.return) {
                                _iterator11.return();
                            }
                        } finally {
                            if (_didIteratorError11) {
                                throw _iteratorError11;
                            }
                        }
                    }

                    startX += maxOffset;
                }
            } catch (err) {
                _didIteratorError10 = true;
                _iteratorError10 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion10 && _iterator10.return) {
                        _iterator10.return();
                    }
                } finally {
                    if (_didIteratorError10) {
                        throw _iteratorError10;
                    }
                }
            }
        }
    } catch (err) {
        _didIteratorError9 = true;
        _iteratorError9 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion9 && _iterator9.return) {
                _iterator9.return();
            }
        } finally {
            if (_didIteratorError9) {
                throw _iteratorError9;
            }
        }
    }

    return positions;
}

function layoutGroup(group, boundingArea, seededRandom) {
    // Divide the available space into a grid
    var gridCells = [];
    var aspectRatio = boundingArea.w / boundingArea.h;
    var yCells = Math.sqrt(group.length / aspectRatio);
    var xCells = aspectRatio * yCells;

    if (Math.floor(yCells) * Math.floor(xCells) >= group.length) {
        yCells = Math.floor(yCells);
        xCells = Math.floor(xCells);
    } else if (Math.ceil(yCells) * Math.floor(xCells) >= group.length) {
        yCells = Math.ceil(yCells);
        xCells = Math.floor(xCells);
    } else if (Math.floor(yCells) * Math.ceil(xCells) >= group.length) {
        yCells = Math.floor(yCells);
        xCells = Math.ceil(xCells);
    } else {
        yCells = Math.ceil(yCells);
        xCells = Math.ceil(xCells);
    }

    if (group.length == 3) {
        xCells = 2;
        yCells = 2;
    }

    if (xCells > 1 && yCells > 1 && Math.abs(xCells - yCells) == 1) {
        var min = Math.min(xCells, yCells);
        var max = Math.max(xCells, yCells);
        yCells = min;
        xCells = max;
    }

    var cellWidth = (boundingArea.w - 20) / xCells;
    var cellHeight = (boundingArea.h - 20) / yCells;
    var firstCellMultiplier = 1.0;
    var xCellMultiplier = 1.0,
        yCellMultiplier = 1.0;
    if (xCells > 1 && yCells > 1) {
        // Make the first cell slightly larger
        // firstCellMultiplier = 1.1;
        // xCellMultiplier = (xCells - firstCellMultiplier) / (xCells - 1);
        // yCellMultiplier = (yCells - firstCellMultiplier) / (yCells - 1);
    }

    var y = boundingArea.y;
    for (var row = 0; row < yCells; row++) {
        var x = boundingArea.x;
        var height = cellHeight * (row == 0 ? firstCellMultiplier : yCellMultiplier);

        var newCells = [];
        for (var col = 0; col < xCells; col++) {
            var width = cellWidth * (col == 0 ? firstCellMultiplier : xCellMultiplier);
            var r = seededRandom(0.6, 1.0) * Math.min(width, height) / 2;
            var xfudge = 1.2 * (width - 2 * r) / 2.0;
            var yfudge = (height - 2 * r) / 2.0;
            var xf = col == 0 && row == 0 ? 0 : seededRandom(-xfudge, xfudge);
            var yf = col == 0 && row == 0 ? 0 : seededRandom(-1.2 * yfudge, 0.7 * yfudge);
            var _cell2 = {
                x: x + width / 2 + xf,
                y: y + height / 2 + yf,
                w: width,
                h: height,
                r: r
            };
            newCells.push(_cell2);
            x += width;
        }

        gridCells = gridCells.concat(newCells);

        y += height;
    }

    // Extra cells to use
    if (gridCells.length > group.length) {
        var extraCells = gridCells.splice(group.length);
        // Merge last cell with cell next to it
        if (yCells > 1) {
            var lastCell = extraCells.pop();
            var cellAboveIndex = xCells * yCells - 2;
            var cellAbove = gridCells[cellAboveIndex];
            // Sometimes, the cell above us is part of extraCells and no longer usable
            if (cellAbove) {
                gridCells[cellAboveIndex] = lastCell;
                lastCell.x = 0.5 * lastCell.x + 0.5 * cellAbove.x;
                lastCell.y = 0.7 * lastCell.y + 0.3 * cellAbove.y;
            }
        }
    }

    return gridCells;
}

function topologicalSort(adjacencyList) {
    // Get all nodes without dependencies. Add them to the result
    // list, sorting all nodes at each stage. Remove them from the
    // dependencies of other nodes, and repeat. Continue until there
    // are no remaining nodes without dependencies.
    var result = [];

    var dependencies = {};
    var _iteratorNormalCompletion12 = true;
    var _didIteratorError12 = false;
    var _iteratorError12 = undefined;

    try {
        for (var _iterator12 = Object.keys(adjacencyList)[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
            var src = _step12.value;

            dependencies[src] = {};
        }
    } catch (err) {
        _didIteratorError12 = true;
        _iteratorError12 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion12 && _iterator12.return) {
                _iterator12.return();
            }
        } finally {
            if (_didIteratorError12) {
                throw _iteratorError12;
            }
        }
    }

    var _iteratorNormalCompletion13 = true;
    var _didIteratorError13 = false;
    var _iteratorError13 = undefined;

    try {
        for (var _iterator13 = Object.keys(adjacencyList)[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
            var _src = _step13.value;

            var dsts = adjacencyList[_src];
            var _iteratorNormalCompletion17 = true;
            var _didIteratorError17 = false;
            var _iteratorError17 = undefined;

            try {
                for (var _iterator17 = dsts[Symbol.iterator](), _step17; !(_iteratorNormalCompletion17 = (_step17 = _iterator17.next()).done); _iteratorNormalCompletion17 = true) {
                    var _dst2 = _step17.value;

                    dependencies[_dst2][_src] = true;
                }
            } catch (err) {
                _didIteratorError17 = true;
                _iteratorError17 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion17 && _iterator17.return) {
                        _iterator17.return();
                    }
                } finally {
                    if (_didIteratorError17) {
                        throw _iteratorError17;
                    }
                }
            }
        }
    } catch (err) {
        _didIteratorError13 = true;
        _iteratorError13 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion13 && _iterator13.return) {
                _iterator13.return();
            }
        } finally {
            if (_didIteratorError13) {
                throw _iteratorError13;
            }
        }
    }

    while (true) {
        var found = [];
        var _iteratorNormalCompletion14 = true;
        var _didIteratorError14 = false;
        var _iteratorError14 = undefined;

        try {
            for (var _iterator14 = Object.keys(dependencies)[Symbol.iterator](), _step14; !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
                var dst = _step14.value;

                var deps = dependencies[dst];
                if (Object.keys(deps).length === 0) {
                    found.push(dst);
                }
            }
        } catch (err) {
            _didIteratorError14 = true;
            _iteratorError14 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion14 && _iterator14.return) {
                    _iterator14.return();
                }
            } finally {
                if (_didIteratorError14) {
                    throw _iteratorError14;
                }
            }
        }

        if (found.length === 0) break;

        var _iteratorNormalCompletion15 = true;
        var _didIteratorError15 = false;
        var _iteratorError15 = undefined;

        try {
            for (var _iterator15 = found[Symbol.iterator](), _step15; !(_iteratorNormalCompletion15 = (_step15 = _iterator15.next()).done); _iteratorNormalCompletion15 = true) {
                var _dst = _step15.value;
                var _iteratorNormalCompletion16 = true;
                var _didIteratorError16 = false;
                var _iteratorError16 = undefined;

                try {
                    for (var _iterator16 = Object.keys(dependencies)[Symbol.iterator](), _step16; !(_iteratorNormalCompletion16 = (_step16 = _iterator16.next()).done); _iteratorNormalCompletion16 = true) {
                        var key = _step16.value;

                        var _deps = dependencies[key];
                        delete _deps[_dst];
                    }
                } catch (err) {
                    _didIteratorError16 = true;
                    _iteratorError16 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion16 && _iterator16.return) {
                            _iterator16.return();
                        }
                    } finally {
                        if (_didIteratorError16) {
                            throw _iteratorError16;
                        }
                    }
                }

                delete dependencies[_dst];
            }

            // Sort the list to give us a deterministic order
        } catch (err) {
            _didIteratorError15 = true;
            _iteratorError15 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion15 && _iterator15.return) {
                    _iterator15.return();
                }
            } finally {
                if (_didIteratorError15) {
                    throw _iteratorError15;
                }
            }
        }

        found.sort();
        result.push(found);
    }

    return result;
}

var Mask = function (_mag$Rect4) {
    _inherits(Mask, _mag$Rect4);

    function Mask(cx, cy, r) {
        var color = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "#594764";

        _classCallCheck(this, Mask);

        // cx, cy are in % of context width/height

        var _this39 = _possibleConstructorReturn(this, (Mask.__proto__ || Object.getPrototypeOf(Mask)).call(this, 0, 0, 0, 0));

        _this39.cx = cx;
        _this39.cy = cy;
        _this39.radius = r;
        _this39.opacity = 0.0;
        _this39.ringControl = 0;
        _this39.color = color;
        return _this39;
    }

    _createClass(Mask, [{
        key: 'drawInternal',
        value: function drawInternal(ctx, pos, boundingSize) {
            // Do everything in absolute coordinates to avoid any
            // weirdness with stage scale changing
            ctx.scale(1.0, 1.0);
            var w = ctx.canvas.clientWidth;
            var h = ctx.canvas.clientHeight;
            var cx = this.cx * w;
            var cy = this.cy * h;

            ctx.globalAlpha = this.opacity;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(cx, cy, this.radius, 0, 2 * Math.PI);
            ctx.rect(w, 0, -w, h);
            ctx.fill();
            ctx.globalAlpha = 1.0;
            var numRings = Math.min(Math.ceil(this.ringControl / 10), 4);

            setStrokeStyle(ctx, {
                lineWidth: 2,
                color: 'cyan'
            });
            for (var i = 0; i < numRings; i++) {
                var k = this.ringControl - i * 20;
                ctx.beginPath();
                ctx.arc(cx, cy, 30 * Math.exp(k / 50), 0, 2 * Math.PI);
                ctx.globalAlpha = Math.max(0.2, 1 - k / 50);
                ctx.stroke();
            }
        }
    }]);

    return Mask;
}(mag.Rect);

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