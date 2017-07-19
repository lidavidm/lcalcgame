"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Sequence = function (_Expression) {
    _inherits(Sequence, _Expression);

    function Sequence() {
        _classCallCheck(this, Sequence);

        var _this2 = _possibleConstructorReturn(this, (Sequence.__proto__ || Object.getPrototypeOf(Sequence)).call(this, []));

        _this2.padding.between = 5;

        for (var _len = arguments.length, exprs = Array(_len), _key = 0; _key < _len; _key++) {
            exprs[_key] = arguments[_key];
        }

        exprs.forEach(function (expr) {
            if (expr instanceof MissingExpression) {
                _this2.holes.push(new MissingSequenceExpression());
            } else if (expr instanceof Sequence) {
                expr.holes.forEach(function (x) {
                    return _this2.holes.push(x);
                });
            } else {
                _this2.holes.push(expr);
            }
        });
        _this2._layout = { direction: "vertical", align: "none" };
        _this2._animating = false;
        return _this2;
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

                    if (!expr.isComplete()) return false;
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
        key: "update",
        value: function update() {
            _get(Sequence.prototype.__proto__ || Object.getPrototypeOf(Sequence.prototype), "update", this).call(this);

            var width = 75;
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = this.holes[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var expr = _step2.value;

                    width = Math.max(width, expr.size.w);
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

            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = this.holes[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var _expr = _step3.value;

                    if (_expr instanceof MissingExpression) {
                        _expr._size = { w: width, h: _expr.size.h };
                    }
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

            _get(Sequence.prototype.__proto__ || Object.getPrototypeOf(Sequence.prototype), "update", this).call(this);
        }
    }, {
        key: "performReduction",
        value: function performReduction() {
            var _this3 = this;

            var cleanup = function cleanup() {
                _this3._animating = false;
                while (_this3.holes.length > 0 && _this3.holes[0] instanceof MissingExpression) {
                    _this3.holes.shift();
                }
                _this3.update();

                Animate.blink(_this3, 1000, [1.0, 0.0, 0.0]);
            };

            this.lockSubexpressions();
            return new Promise(function (resolve, reject) {
                var nextStep = function nextStep() {
                    if (_this3.holes.length === 0) {
                        Animate.poof(_this3);
                        (_this3.parent || _this3.stage).swap(_this3, null);
                        resolve(null);
                    } else {
                        (function () {
                            var expr = _this3.holes[0];
                            var result = expr.performReduction();
                            var delay = function delay(newExpr) {
                                if (newExpr instanceof Expression && newExpr != expr) {
                                    _this3.holes[0] = newExpr;
                                } else if (newExpr instanceof Expression && newExpr.isValue()) {
                                    _this3.holes.shift();
                                } else if (newExpr == expr) {
                                    cleanup();
                                    reject();
                                    return;
                                } else {
                                    _this3.holes.shift();
                                }

                                // To handle expressions like loops that
                                // expand into sequences, flatten any
                                // subsequences we encounter.
                                var newHoles = [];
                                var _iteratorNormalCompletion4 = true;
                                var _didIteratorError4 = false;
                                var _iteratorError4 = undefined;

                                try {
                                    for (var _iterator4 = _this3.holes[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                                        var _expr2 = _step4.value;

                                        if (_expr2 instanceof Sequence) {
                                            newHoles = newHoles.concat(_expr2.holes);
                                        } else {
                                            newHoles.push(_expr2);
                                        }
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

                                _this3.holes = newHoles;

                                _this3.update();
                                if (newExpr instanceof Expression) newExpr.lock();
                                if (newHoles.length > 0) {
                                    after(800).then(function () {
                                        return nextStep();
                                    });
                                } else {
                                    nextStep();
                                }
                            };
                            if (result instanceof Promise) {
                                result.then(delay, function () {
                                    // Uh-oh, an error happened
                                    cleanup();
                                    reject();
                                });
                            } else {
                                delay(result || expr);
                            }
                        })();
                    }
                };
                nextStep();
            });
        }
    }, {
        key: "onmouseclick",
        value: function onmouseclick() {
            this.performUserReduction();
        }
    }, {
        key: "toString",
        value: function toString() {
            return (this.locked ? '/' : '') + "(sequence " + this.subexpressions.map(function (x) {
                return x.toString();
            }).join(" ") + ")";
        }
    }, {
        key: "toJavaScript",
        value: function toJavaScript() {
            var es = this.subexpressions.map(function (x) {
                return x.toJavaScript();
            });
            for (var i = 0; i < es.length; i++) {
                var e = es[i].trim();
                if (e[e.length - 1] !== ';') es[i] += ';';
            }
            return es.join('\n');
        }
    }, {
        key: "reduceCompletely",
        value: function reduceCompletely() {
            if (this.canReduce()) {
                // Return non-undefined non-this value so that when the
                // user drops everything in, MissingExpression#ondropped
                // will make this expr blink
                return null;
            } else {
                return this;
            }
        }
    }, {
        key: "subexpressions",
        get: function get() {
            return this.holes;
        }
    }]);

    return Sequence;
}(Expression);

var NotchedSequence = function (_Sequence) {
    _inherits(NotchedSequence, _Sequence);

    function NotchedSequence() {
        var _ref;

        _classCallCheck(this, NotchedSequence);

        for (var _len2 = arguments.length, exprs = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            exprs[_key2] = arguments[_key2];
        }

        var _this4 = _possibleConstructorReturn(this, (_ref = NotchedSequence.__proto__ || Object.getPrototypeOf(NotchedSequence)).call.apply(_ref, [this].concat(exprs)));

        _this4.padding.right = 17.5;
        _this4._reductionIndicatorStart = 0;
        return _this4;
    }

    _createClass(NotchedSequence, [{
        key: "drawInternal",
        value: function drawInternal(ctx, pos, boundingSize) {
            _get(NotchedSequence.prototype.__proto__ || Object.getPrototypeOf(NotchedSequence.prototype), "drawInternal", this).call(this, ctx, pos, boundingSize);
            var radius = this.radius * this.absoluteScale.x;
            var rightMargin = 15 * this.scale.x;
            ctx.fillStyle = "#fff";
            roundRect(ctx, pos.x + boundingSize.w - rightMargin, pos.y, rightMargin, boundingSize.h, {
                tl: 0,
                bl: 0,
                tr: radius,
                br: radius
            }, true, false, null);

            setStrokeStyle(ctx, {
                color: '#000',
                lineWidth: 1
            });
            for (var i = 0; i < this.holes.length - 1; i++) {
                var expr1 = this.holes[i];
                var expr2 = this.holes[i + 1];
                var expr1y = expr1.absolutePos.y + expr1.anchor.y * expr1.absoluteSize.h;
                var expr2y = expr2.absolutePos.y;
                var tickPos = expr1y + (expr2y - expr1y) / 2;
                ctx.beginPath();
                ctx.moveTo(pos.x + boundingSize.w - 15 * this.scale.x, expr1y);
                ctx.lineTo(pos.x + boundingSize.w, expr1y);
                ctx.stroke();
            }
        }
    }]);

    return NotchedSequence;
}(Sequence);

var SemicolonNotchedSequence = function (_NotchedSequence) {
    _inherits(SemicolonNotchedSequence, _NotchedSequence);

    function SemicolonNotchedSequence() {
        var _ref2;

        _classCallCheck(this, SemicolonNotchedSequence);

        for (var _len3 = arguments.length, exprs = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
            exprs[_key3] = arguments[_key3];
        }

        var _this5 = _possibleConstructorReturn(this, (_ref2 = SemicolonNotchedSequence.__proto__ || Object.getPrototypeOf(SemicolonNotchedSequence)).call.apply(_ref2, [this].concat(exprs)));

        _this5.padding.right = 15;
        return _this5;
    }

    _createClass(SemicolonNotchedSequence, [{
        key: "drawInternal",
        value: function drawInternal(ctx, pos, boundingSize) {
            _get(SemicolonNotchedSequence.prototype.__proto__ || Object.getPrototypeOf(SemicolonNotchedSequence.prototype), "drawInternal", this).call(this, ctx, pos, boundingSize);
            var radius = this.radius * this.absoluteScale.x;
            var rightMargin = 15 * this.scale.x;

            ctx.fillStyle = "black";
            var fontSize = 35 * this.scale.y * 0.85;
            ctx.font = fontSize + "px Consolas, monospace";
            for (var i = 0; i < this.holes.length; i++) {
                var expr1 = this.holes[i];
                var expr1y = expr1.absolutePos.y; // - expr1.anchor.y * expr1.absoluteSize.h;
                expr1y += (expr1.absoluteSize.h - fontSize) / 2;
                ctx.fillText(";", pos.x + boundingSize.w - rightMargin, expr1y);
            }
        }
    }]);

    return SemicolonNotchedSequence;
}(NotchedSequence);

var SemicolonSequence = function (_Sequence2) {
    _inherits(SemicolonSequence, _Sequence2);

    function SemicolonSequence() {
        _classCallCheck(this, SemicolonSequence);

        return _possibleConstructorReturn(this, (SemicolonSequence.__proto__ || Object.getPrototypeOf(SemicolonSequence)).apply(this, arguments));
    }

    _createClass(SemicolonSequence, [{
        key: "drawInternal",
        value: function drawInternal(ctx, pos, boundingSize) {
            _get(SemicolonSequence.prototype.__proto__ || Object.getPrototypeOf(SemicolonSequence.prototype), "drawInternal", this).call(this, ctx, pos, boundingSize);
            var radius = this.radius * this.absoluteScale.x;
            var rightMargin = 15 * this.scale.x;

            ctx.fillStyle = "black";
            var fontSize = 35 * this.scale.y * 0.85;
            ctx.font = fontSize + "px Consolas, monospace";
            for (var i = 0; i < this.holes.length; i++) {
                var expr1 = this.holes[i];
                var expr1y = expr1.absolutePos.y; // - expr1.anchor.y * expr1.absoluteSize.h;
                expr1y += (expr1.absoluteSize.h - fontSize) / 2;
                ctx.fillText(";", pos.x + boundingSize.w - rightMargin, expr1y);
            }
        }
    }, {
        key: "clone",
        value: function clone() {
            var parent = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

            //console.log("called clone() in semicolon sequence");
            var cln = _get(SemicolonSequence.prototype.__proto__ || Object.getPrototypeOf(SemicolonSequence.prototype), "clone", this).call(this, parent);
            cln.holes = [];
            cln.children = [];
            //console.log("this.holes");
            //console.log(this.holes);
            //let thisHoles = this.holes.clone();
            this.holes.forEach(function (hole) {
                return cln.holes.push(hole.clone());
            });
            return cln;
        }
    }]);

    return SemicolonSequence;
}(Sequence);

/* A wrapper for blocks that are sequences but wrapped in a multi-line
   code {} block, like if {} else {} statements, for {} loops, while {} loops,
   etc. */


var MultiClampSequence = function (_Sequence3) {
    _inherits(MultiClampSequence, _Sequence3);

    function MultiClampSequence(exprsPerClamp) {
        var includeBottomClamp = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

        _classCallCheck(this, MultiClampSequence);

        var _this7 = _possibleConstructorReturn(this, (MultiClampSequence.__proto__ || Object.getPrototypeOf(MultiClampSequence)).call(this, []));

        _this7._layout.direction = "horizontal";
        _this7.shadowOffset = 6;
        _this7._numOfClamps = exprsPerClamp.length / 2 + 1;
        var ground = 0;
        var breakIndices = [0];
        for (var i = 0; i < exprsPerClamp.length; i++) {
            var es = exprsPerClamp[i];
            ground += es.length;
            breakIndices.push(ground);
        }
        _this7.holes = exprsPerClamp.reduce(function (a, b) {
            return a.concat(b);
        });
        _this7.breakIndices = breakIndices;

        _this7._exprsPerClamp = exprsPerClamp;

        console.log(_this7);
        return _this7;
    }

    _createClass(MultiClampSequence, [{
        key: "aggregateSize",
        value: function aggregateSize(sizes) {
            var padding = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

            if (!padding) padding = { right: 0, left: 0, inner: 0 };
            return { w: sizes.reduce(function (p, c) {
                    return p + c.w + padding.inner;
                }, padding.left) + padding.right,
                h: Math.max.apply(Math, _toConsumableArray(sizes.map(function (sz) {
                    return sz.h;
                }))) + padding.inner };
        }
    }, {
        key: "getSizeForSection",
        value: function getSizeForSection(secID) {
            return this.aggregateSize(this.getHoleSizes().slice(this.breakIndices[secID], this.breakIndices[secID + 1]), this.padding);
        }
    }, {
        key: "getTopSize",
        value: function getTopSize() {
            return this.getSizeForSection(0);
        }
    }, {
        key: "getMidSize",
        value: function getMidSize() {
            return this.getSizeForSection(2);
        }
    }, {
        key: "getBotSize",
        value: function getBotSize() {
            return { w: 100, h: 30 };
        }

        // Sizes to match its children.

    }, {
        key: "update",
        value: function update() {
            var _this8 = this;

            var _this = this;
            this.children = [];
            var FILLER_INNER_HEIGHT = 40;

            this.holes.forEach(function (expr) {
                return _this.addChild(expr);
            });
            // In the centering calculation below, we need this expr's
            // size to be stable. So we first set the scale on our
            // children, then compute our size once to lay out the
            // children.
            this.holes.forEach(function (expr) {
                expr.anchor = { x: 0, y: 0.5 };
                expr.scale = { x: 0.85, y: 0.85 };
                expr.update();
            });
            var size = this.size;
            var padding = this.padding.inner;
            var x = this.padding.left;
            var y = this.getTopSize().h / 2.0 + (this.exprOffsetY ? this.exprOffsetY : 0);
            if (this._layout.direction == "vertical") {
                y = padding;
            }

            var currentBreakIdx = 1;
            this.holes.forEach(function (expr, i) {
                // Update hole expression positions.

                if (i === _this8.breakIndices[currentBreakIdx]) {
                    x = i % 2 === 0 ? _this8.padding.left : _this8.getMidSize().w / 2.0 - expr.size.w / 2.0 * expr.scale.x;
                    if (currentBreakIdx % 2 === 1) y += FILLER_INNER_HEIGHT + padding;else {
                        y += expr.anchor.y * expr.size.h * expr.scale.y + padding / 2;
                        y += (1 - expr.anchor.y) * expr.size.h * expr.scale.y / 2;
                    }
                    if (_this8.padding.between) y += _this8.padding.between;
                    currentBreakIdx++;
                }

                expr.anchor = { x: 0, y: 0.5 };
                expr.pos = { x: x, y: y };
                expr.scale = { x: 0.85, y: 0.85 };
                expr.update();

                if (_this8._layout.direction == "vertical") {
                    y += expr.anchor.y * expr.size.h * expr.scale.y;
                    var offset = x;

                    // Centering
                    if (_this8._layout.align == "horizontal") {
                        var innerWidth = size.w;
                        var scale = expr.scale.x;
                        offset = (innerWidth - scale * expr.size.w) / 2;
                    }

                    expr.pos = { x: offset, y: y };

                    y += (1 - expr.anchor.y) * expr.size.h * expr.scale.y;
                    if (_this8.padding.between) y += _this8.padding.between;
                } else {
                    x += expr.size.w * expr.scale.x + padding;
                }
            });

            this.children = this.holes; // for rendering
        }
    }, {
        key: "drawBaseShape",
        value: function drawBaseShape(ctx, pos, boundingSize) {
            multiClampRect(ctx, pos.x, pos.y, boundingSize.w * this.topRatio.x, boundingSize.h * this.topRatio.y, boundingSize.w * this.innerRatio.x, boundingSize.h * this.innerRatio.y, boundingSize.w * this.midRatio.x, boundingSize.h * this.midRatio.y, boundingSize.w * this.botRatio.x, boundingSize.h * this.botRatio.y, this._numOfClamps - 2, // number of inner sections
            this.radius * this.absoluteScale.x, true, this.stroke ? true : false, this.stroke ? this.stroke.opacity : null, this.notches ? this.notches : null);
        }
    }, {
        key: "constructorArgs",
        get: function get() {
            return [this._exprsPerClamp];
        }
    }, {
        key: "size",
        get: function get() {
            var padding = this.padding;
            var width = 0;
            var height = DEFAULT_EXPR_HEIGHT;

            var FILLER_INNER_HEIGHT = 40;
            var topSize = this.getTopSize();
            var midSize = this.getMidSize();
            var botSize = this.getBotSize();

            var sz = { w: Math.max(topSize.w, midSize.w, botSize.w),
                h: [topSize.h, FILLER_INNER_HEIGHT * (this._numOfClamps - 1), midSize.h * (this._numOfClamps - 2), botSize.h].reduce(function (a, b) {
                    return a + b;
                }, 0) };

            this.topRatio = { x: topSize.w / sz.w, y: (topSize.h + padding.inner) / sz.h };
            this.innerRatio = { x: padding.left * 2 / sz.w, y: FILLER_INNER_HEIGHT / sz.h };
            this.midRatio = { x: midSize.w / sz.w, y: (midSize.h - padding.inner) / sz.h };
            this.botRatio = { x: (botSize.w - padding.left * 2) / sz.w, y: botSize.h / sz.h };

            return sz;
        }
    }]);

    return MultiClampSequence;
}(Sequence);

// A Statement (as in, multi-line code) of the form
// if (...) {
//     ...
// } else {
//     ...
// }


var IfElseBlockStatement = function (_MultiClampSequence) {
    _inherits(IfElseBlockStatement, _MultiClampSequence);

    function IfElseBlockStatement(cond, branch, elseBranch) {
        _classCallCheck(this, IfElseBlockStatement);

        var _this9 = _possibleConstructorReturn(this, (IfElseBlockStatement.__proto__ || Object.getPrototypeOf(IfElseBlockStatement)).call(this, [[new TextExpr('if'), cond], [branch], [new TextExpr('else')], [elseBranch]]));

        _this9.branch.anchor = { x: 0, y: 0 };
        _this9.elseBranch.anchor = { x: 0, y: 0 };
        return _this9;
    }

    _createClass(IfElseBlockStatement, [{
        key: "toJavaScript",
        value: function toJavaScript() {
            return "if (" + this.cond.toJavaScript() + ") {\n" + this.branch.toJavaScript() + "\n} else {\n" + this.elseBranch.toJavaScript() + "\n}";
        }
        // reduce() {
        //     if (this.canReduce()) {
        //         let c = this.cond.reduceCompletely();
        //         if ()
        //     }
        // }

    }, {
        key: "performReduction",
        value: function performReduction() {
            var _this10 = this;

            var animated = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

            var cleanup = function cleanup() {
                _this10._animating = false;
                _this10.update();
            };
            var swap = function swap(node, branch) {
                var parent = node.parent ? node.parent : node.stage;
                if (branch) branch.ignoreEvents = node.ignoreEvents; // the new expression should inherit whatever this expression was capable of as input
                parent.swap(node, branch);
            };
            var condSwap = function condSwap() {
                if (_this10.cond.value() === true) {
                    swap(_this10, _this10.branch);
                } else if (_this10.cond.value() === false) {
                    swap(_this10, _this10.elseBranch);
                } else {
                    console.error('Error @ IfElseBlockStatement.performReduction: Condition value is ', _this10.cond.value());
                    cleanup();
                    return Promise.reject();
                }
                return Promise.resolve();
            };

            this.lockSubexpressions();

            var r = this.reduceCompletely();
            if (r != this) {
                this._animating = true;
                if (this.cond.canReduce()) {
                    // If condition is reducable, animate its reduction first.
                    return this.cond.performReduction(animated).then(function () {
                        return new Promise(function (resolve, reject) {
                            Animate.wait(2000).after(function () {
                                resolve();
                            });
                        });
                    }).then(function () {
                        return condSwap();
                    });
                } else if (this.cond.isValue()) return condSwap();
            }

            return Promise.reject("Cannot reduce!");
        }
    }, {
        key: "cond",
        get: function get() {
            return this.holes[1];
        }
    }, {
        key: "branch",
        get: function get() {
            return this.holes[2];
        }
    }, {
        key: "elseBranch",
        get: function get() {
            return this.holes[4];
        }
    }, {
        key: "constructorArgs",
        get: function get() {
            return [this.cond.clone(), this.branch.clone(), this.elseBranch.clone()];
        }
    }]);

    return IfElseBlockStatement;
}(MultiClampSequence);