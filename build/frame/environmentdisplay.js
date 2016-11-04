"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// The panel at the bottom of the screen.
var EnvironmentDisplay = function (_mag$Rect) {
    _inherits(EnvironmentDisplay, _mag$Rect);

    function EnvironmentDisplay(x, y, w, h, stage) {
        _classCallCheck(this, EnvironmentDisplay);

        var _this = _possibleConstructorReturn(this, (EnvironmentDisplay.__proto__ || Object.getPrototypeOf(EnvironmentDisplay)).call(this, x, y, w, h));

        _this.color = "#444";
        _this.padding = 20;
        _this.env = null;
        _this.stage = stage;
        _this.contents = [];
        _this.highlighted = null;
        _this.toolbox = true;
        return _this;
    }

    _createClass(EnvironmentDisplay, [{
        key: "update",
        value: function update() {
            if (this.env) this.showEnvironment(this.env);else this.showGlobals();
        }
    }, {
        key: "showEnvironment",
        value: function showEnvironment(env) {
            var _this2 = this;

            if (!env) return;
            if (!this.stage) return;
            this.clear();
            this.env = env;
            var pos = this.leftEdgePos;
            var setup = function setup(e, padding, newRow) {
                e.update();
                e.ignoreEvents = true;
                e.toolbox = true;
                _this2.stage.add(e);
                _this2.contents.push(e);
                e.anchor = { x: 0, y: 0.5 };
                e.pos = pos;
                e.scale = { x: 1, y: 1 };
                if (newRow) {
                    pos = addPos(pos, { x: 0, y: e.size.h });
                    pos.x = _this2.leftEdgePos.x;
                } else {
                    pos = addPos(pos, { x: e.size.w, y: 0 });
                }
            };
            env.names().forEach(function (name) {
                var label = new TextExpr(name + "=");
                label.color = "#EEE";
                setup(label, 0, false);

                var e = env.lookup(name).clone();
                setup(e, _this2.padding, true);
            });
        }
    }, {
        key: "showGlobals",
        value: function showGlobals() {
            this.clear();
            this.showEnvironment(this.stage.environment);
        }
    }, {
        key: "clear",
        value: function clear() {
            if (!this.stage) return;
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this.contents[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var child = _step.value;

                    this.stage.remove(child);
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

            this.contents = [];
            this.env = null;
            this.highlighted = null;
        }
    }, {
        key: "highlightName",
        value: function highlightName(name) {
            var next = false;
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = this.contents[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var expr = _step2.value;

                    if (expr instanceof TextExpr && expr.text === name + "=") {
                        this.highlighted = expr;
                        expr.color = 'green';
                        next = true;
                    } else if (next) {
                        expr.onmouseenter();
                        break;
                    }
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
        }
    }, {
        key: "clearHighlight",
        value: function clearHighlight() {
            if (this.highlighted) {
                this.highlighted.color = 'white';
                this.highlighted = null;
            }
        }

        // Disable highlighting on hover

    }, {
        key: "onmouseenter",
        value: function onmouseenter(pos) {}
    }, {
        key: "onmouseleave",
        value: function onmouseleave(pos) {}
    }, {
        key: "leftEdgePos",
        get: function get() {
            return { x: this.padding + this.pos.x, y: 2 * this.padding + this.pos.y };
        }
    }]);

    return EnvironmentDisplay;
}(mag.Rect);