"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Sequence = function (_Expression) {
    _inherits(Sequence, _Expression);

    function Sequence() {
        _classCallCheck(this, Sequence);

        for (var _len = arguments.length, exprs = Array(_len), _key = 0; _key < _len; _key++) {
            exprs[_key] = arguments[_key];
        }

        var _this = _possibleConstructorReturn(this, (Sequence.__proto__ || Object.getPrototypeOf(Sequence)).call(this, exprs));

        _this._stackVertically = true;
        _this._animating = false;
        return _this;
    }

    _createClass(Sequence, [{
        key: "canReduce",
        value: function canReduce() {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this.holes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var expr = _step.value;

                    // TODO: need some way to tell whether an expression is
                    // 'complete'
                    if (expr instanceof MissingExpression) return false;
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

            return true;
        }
    }, {
        key: "performReduction",
        value: function performReduction() {
            var _this2 = this;

            if (!this.canReduce()) return null;

            this._animating = true;
            return new Promise(function (resolve, reject) {
                var exprs = _this2.holes.slice();

                var nextStep = function nextStep() {
                    if (exprs.length === 0) {
                        Animate.poof(_this2);
                        (_this2.parent || _this2.stage).swap(_this2, null);
                        resolve(null);
                    } else {
                        var expr = exprs.shift();
                        var result = expr.performReduction();
                        var delay = function delay() {
                            window.setTimeout(function () {
                                nextStep();
                            }, 300);
                        };
                        if (result instanceof Promise) {
                            result.then(delay);
                        } else {
                            delay();
                        }
                    }
                };

                nextStep();
            });
        }
    }, {
        key: "onmouseclick",
        value: function onmouseclick() {
            if (!this._animating) {
                this.performReduction();
            }
        }
    }]);

    return Sequence;
}(Expression);