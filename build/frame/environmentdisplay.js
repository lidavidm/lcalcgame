"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// The panel at the bottom of the screen.
var EnvironmentDisplay = function (_mag$ImageRect) {
    _inherits(EnvironmentDisplay, _mag$ImageRect);

    function EnvironmentDisplay(x, y, w, h) {
        var globals = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;

        _classCallCheck(this, EnvironmentDisplay);

        var _this = _possibleConstructorReturn(this, (EnvironmentDisplay.__proto__ || Object.getPrototypeOf(EnvironmentDisplay)).call(this, x, y, w, h, 'toolbox-bg'));

        _this.padding = 20;
        _this.env = null;
        _this.globals = globals ? globals : new Environment();
        _this.contents = [];
        _this.highlighted = null;
        return _this;
    }

    _createClass(EnvironmentDisplay, [{
        key: "showEnvironment",
        value: function showEnvironment(env) {
            var _this2 = this;

            if (!env) return;
            this.clear();
            this.env = env;
            var pos = this.leftEdgePos;
            var setup = function setup(e, padding) {
                e.update();
                _this2.stage.add(e);
                _this2.contents.push(e);
                e.anchor = { x: 0, y: 0.5 };
                e.pos = pos;
                pos = addPos(pos, { x: e.size.w, y: 0 });
            };
            env.names().forEach(function (name) {
                var label = new TextExpr(name + "=");
                label.color = "white";
                setup(label, 0);

                var e = env.lookup(name).clone();
                setup(e, _this2.padding);
            });
        }
    }, {
        key: "showGlobals",
        value: function showGlobals() {
            this.clear();
            this.showEnvironment(this.globals);
        }
    }, {
        key: "clear",
        value: function clear() {
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
    }, {
        key: "leftEdgePos",
        get: function get() {
            return { x: this.padding * 2 + this.pos.x, y: this.size.h / 2.0 + this.pos.y };
        }
    }]);

    return EnvironmentDisplay;
}(mag.ImageRect);