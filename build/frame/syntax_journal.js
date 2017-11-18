'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/* The journal overlay. */

var SyntaxJournal = function (_mag$ImageRect) {
    _inherits(SyntaxJournal, _mag$ImageRect);

    function SyntaxJournal() {
        var knowledge = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

        _classCallCheck(this, SyntaxJournal);

        var _this = _possibleConstructorReturn(this, (SyntaxJournal.__proto__ || Object.getPrototypeOf(SyntaxJournal)).call(this, 0, 0, GLOBAL_DEFAULT_SCREENSIZE.w / 1.8, GLOBAL_DEFAULT_SCREENSIZE.h / 1.4, 'journal-bg'));

        _this._viewingStage = null;
        _this.shadowOffset = 0;
        _this.color = 'beige';
        _this.highlightColor = null;
        _this._syntaxKnowledge = knowledge;
        return _this;
    }

    // Setting expressions in the journal,
    // as a list of parseable statements e.g.
    // [ 'x => x', '_ == _', '_b ? _ : _' ]


    _createClass(SyntaxJournal, [{
        key: 'renderKnowledge',
        value: function renderKnowledge() {
            this.children = [];
            var exprs = this._syntaxKnowledge.expressions;
            var VERT_PAD = 8;
            var CORNER_PAD = 20;
            var TOP_PAD = 40;
            var pos = { x: CORNER_PAD, y: TOP_PAD + CORNER_PAD };
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = exprs[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var e = _step.value;

                    e.pos = clonePos(pos);
                    this.addChild(e);
                    this.update();
                    pos.y += e.absoluteSize.h + VERT_PAD;
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
        }

        // Opening and closing the journal.

    }, {
        key: 'toggle',
        value: function toggle(stage) {
            if (this.isOpen) this.close();else this.open(stage);
        }
    }, {
        key: 'open',
        value: function open(stage) {
            var _this2 = this;

            if (this.isOpen) {
                if (stage != this._viewingStage) console.warn('Stage mismatch.');
                return;
            }

            var sz = stage.boundingSize;

            var bg = new mag.Rect(sz.w / 2.0, sz.h / 2.0, sz.w, sz.h);
            bg.anchor = { x: 0.5, y: 0.5 };
            bg.color = "black";
            bg.highlightColor = null;
            bg.opacity = 0.0;
            bg.onmousedown = function () {
                return _this2.onmousedown();
            };
            stage.add(bg);

            Animate.tween(bg, { opacity: 0.5 }, 200, function (e) {
                return e * e;
            });

            this.anchor = { x: 0.5, y: 0.5 };
            this.pos = { x: sz.w / 2.0, y: sz.h / 2.0 };
            stage.add(this);

            this._bg = bg;
            this._viewingStage = stage;
            this.ignoreEvents = false;

            stage.update();
            stage.draw();
        }
    }, {
        key: 'close',
        value: function close() {
            if (!this.isOpen) return;
            this._viewingStage.remove(this);
            this._viewingStage.remove(this._bg);
            this._viewingStage = null;
            this._bg = null;
        }
    }, {
        key: 'onmousedown',
        value: function onmousedown() {
            this.close();
        }
    }, {
        key: 'onmousedrag',
        value: function onmousedrag() {}
    }, {
        key: 'knowledge',
        get: function get() {
            return this._syntaxKnowledge;
        },
        set: function set(syntaxKnowledge) {
            this._syntaxKnowledge = syntaxKnowledge;
            this.renderKnowledge();
        }
    }, {
        key: 'isOpen',
        get: function get() {
            return this._viewingStage != null;
        }
    }]);

    return SyntaxJournal;
}(mag.ImageRect);

/* Button for accessing the journal. */


var SyntaxJournalButton = function (_mag$Button) {
    _inherits(SyntaxJournalButton, _mag$Button);

    function SyntaxJournalButton(syntaxJournal) {
        _classCallCheck(this, SyntaxJournalButton);

        var imgs = {
            default: 'journal-default',
            hover: 'journal-hover',
            down: 'journal-mousedown'
        };

        var _this3 = _possibleConstructorReturn(this, (SyntaxJournalButton.__proto__ || Object.getPrototypeOf(SyntaxJournalButton)).call(this, imgs, function () {
            //onclick
            syntaxJournal.toggle(_this3.stage);
            _this3.stage.bringToFront(_this3);
        }));

        _this3.journal = syntaxJournal;
        return _this3;
    }

    // Animate the expression on the stage
    // to 'fly into' the journal icon.
    // Used to visualize 'collecting' syntax.


    _createClass(SyntaxJournalButton, [{
        key: 'flyIn',
        value: function flyIn(expr) {
            if (!expr.stage) return;

            expr.ignoreEvents = true;
            var stage = expr.stage;
            var pos = this.absolutePos;
            return new Promise(function (resolve, reject) {
                //ShapeExpandEffect.run(expr, 1200, e=>e, "white", 2, () => {
                Animate.wait(400).after(function () {
                    Animate.tween(expr, { pos: pos, anchor: { x: 0.5, y: 0.5 }, scale: { x: 0.5, y: 0.5 } }, 2000, Animate.EASE.SIGMOID).after(function () {
                        expr.opacity = 1.0;
                        ShapeExpandEffect.run(expr, 400);
                        Animate.tween(expr, { opacity: 0.0 }, 400).after(function () {
                            stage.remove(expr);
                            resolve();
                        });
                    });
                });
            });

            //ShapeExpandEffect.run(expr);
        }
    }]);

    return SyntaxJournalButton;
}(mag.Button);

/* Model for storing syntax knowledge acquired through play. */


var SyntaxKnowledge = function () {
    function SyntaxKnowledge() {
        var defaultsUnlocked = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

        _classCallCheck(this, SyntaxKnowledge);

        var img_prefix = 'journal-syntax-';
        var img = function img(tag) {
            return img_prefix + tag;
        };
        var map = {
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

    _createClass(SyntaxKnowledge, [{
        key: 'isUnlocked',
        value: function isUnlocked(syntaxKey) {
            return this._unlocked.indexOf(syntaxKey) > -1;
        }
    }, {
        key: 'unlock',
        value: function unlock(syntaxKey) {
            if (this.isUnlocked(syntaxKey)) {
                // Already unlocked this key.
                return false;
            } else if (syntaxKey in this._map) {
                this._unlocked.push(syntaxKey);
                return true;
            } else {
                console.error('Unkown syntax \'' + syntaxKey + '\'. Try adding \'' + syntaxKey + '\' to the syntax->expression map.');
                return false;
            }
        }

        // This lets us makes the class JSON serialization,
        // e.g. we can call JSON.stringify(syntaxKnowledge) directly.
        // See JSON.stringify spec @ Mozilla for more details.

    }, {
        key: 'toJSON',
        value: function toJSON() {
            return this._unlocked;
        }
    }, {
        key: 'expressions',
        get: function get() {
            var _this4 = this;

            //const dfl = ExprManager.getDefaultFadeLevel();
            //ExprManager.setDefaultFadeLevel(1); // disable concrete representations for this parsing
            //const es = this._unlocked.map((e) => ES6Parser.parse(this._map[e].form));
            var es = this._unlocked.map(function (e) {
                return new ImageExpr(_this4._map[e].src);
            });
            es.forEach(function (e) {
                e.ignoreEvents = true;
                e.graphicNode.blendMode = 'multiply';
            });
            //ExprManager.setDefaultFadeLevel(dfl);
            return es;
        }
    }]);

    return SyntaxKnowledge;
}();