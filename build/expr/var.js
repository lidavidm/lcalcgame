"use strict";

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SHRINK_DURATION = 800;
var EXPAND_DURATION = 400;
/// Variable nodes - separate from lambda variable expressions, for
/// now.

var VarExpr = function (_Expression) {
    _inherits(VarExpr, _Expression);

    function VarExpr(name) {
        _classCallCheck(this, VarExpr);

        var _this = _possibleConstructorReturn(this, (VarExpr.__proto__ || Object.getPrototypeOf(VarExpr)).call(this, []));

        _this.name = name;
        // See MissingTypedExpression#constructor
        _this.equivalentClasses = [VarExpr];
        return _this;
    }

    _createClass(VarExpr, [{
        key: "open",
        value: function open(preview) {
            var animate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
        }
    }, {
        key: "close",
        value: function close() {}
    }, {
        key: "canReduce",
        value: function canReduce() {
            return this.getEnvironment() && (this.parent || this.stage) && this.getEnvironment().lookup(this.name);
        }
    }, {
        key: "reduce",
        value: function reduce() {
            var env = this.getEnvironment();
            if (!env) return this;

            var parent = this.parent ? this.parent : this.stage;
            if (!parent) return this;

            var value = env.lookup(this.name);
            if (!value) return this;

            return value;
        }
    }, {
        key: "performReduction",
        value: function performReduction() {
            var value = this.reduce();
            if (value != this) {
                value = value.clone();
                var parent = this.parent ? this.parent : this.stage;
                parent.swap(this, value);
            }
        }
    }, {
        key: "onmouseclick",
        value: function onmouseclick() {
            this.performReduction();
        }
    }]);

    return VarExpr;
}(Expression);

var ChestVarExpr = function (_VarExpr) {
    _inherits(ChestVarExpr, _VarExpr);

    function ChestVarExpr(name) {
        _classCallCheck(this, ChestVarExpr);

        // See MissingTypedExpression#constructor
        var _this2 = _possibleConstructorReturn(this, (ChestVarExpr.__proto__ || Object.getPrototypeOf(ChestVarExpr)).call(this, name));

        _this2.equivalentClasses = [ChestVarExpr];
        _this2._preview = null;
        return _this2;
    }

    _createClass(ChestVarExpr, [{
        key: "open",
        value: function open(preview) {
            var animate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

            preview = preview.clone();
            preview.ignoreEvents = true;
            preview.scale = { x: 0.6, y: 0.6 };
            preview.anchor = { x: -0.1, y: 0.5 };
            this._preview = preview;
            if (this.holes.length > 0) {
                this.holes[0] = preview;
            } else {
                this.holes.push(preview);
            }
            this._opened = true;
        }
    }, {
        key: "close",
        value: function close() {
            this._opened = false;
            this.removeChild(this.holes[0]);
            this._preview = null;
        }
    }, {
        key: "drawInternal",
        value: function drawInternal(ctx, pos, boundingSize) {
            if (this._preview) {
                this._preview.pos = {
                    x: 0,
                    y: 5
                };
            }

            if (this.parent && !this.ignoreEvents) {
                // Draw gray background analogous to other values
                ctx.fillStyle = "#777";
                roundRect(ctx, pos.x, pos.y, boundingSize.w, boundingSize.h, 6 * this.absoluteScale.x, true, false, null);
            }

            var size = this._size;
            var scale = this.absoluteScale;
            var adjustedSize = this.absoluteSize;
            var offset = Math.max(2, (adjustedSize.w - size.w) / 2);
            ctx.drawImage(this._baseImage, pos.x + offset, pos.y + offset, size.w * scale.x - 2 * offset, size.h * scale.y - 2 * offset);
            if (this._opened) {
                ctx.drawImage(this._lidOpenImage, pos.x + offset, pos.y + offset, size.w * scale.x - 2 * offset, size.h * scale.y - 2 * offset);
            } else {
                ctx.drawImage(this._lidClosedImage, pos.x + offset, pos.y + offset, size.w * scale.x - 2 * offset, size.h * scale.y - 2 * offset);
            }
            if (this.stroke) {
                ctx.save();
                ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                ctx.globalCompositeOperation = 'screen';
                ctx.fillRect(pos.x, pos.y, boundingSize.w, boundingSize.h);
                ctx.restore();
            }
        }
    }, {
        key: "performReduction",
        value: function performReduction() {
            var _this3 = this;

            var animated = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

            if (this._opened) return;
            var value = this.reduce();
            if (value != this) {
                if (!animated) {
                    var parent = this.parent ? this.parent : this.stage;
                    parent.swap(this, value);
                    return;
                }
                return this.animateReduction(value, true);
            } else if (animated) {
                this.animateReduction(new TextExpr("?"), false).then(function (wat) {
                    _this3._opened = false;
                    window.setTimeout(function () {
                        Animate.poof(wat);
                        _this3.stage.remove(wat);
                        _this3.stage.draw();
                        _this3.stage.update();
                    }, 500);
                });
                return null;
            }
        }
    }, {
        key: "animateReduction",
        value: function animateReduction(value, destroy) {
            var _this4 = this;

            value = value.clone();
            value.scale = { x: 0.1, y: 0.1 };
            value.pos = {
                x: this.absolutePos.x + 0.5 * this.size.w - 0.5 * value.absoluteSize.w,
                y: this.absolutePos.y + 30
            };
            value.opacity = 0.0;

            var stage = this.stage;
            stage.add(value);
            this._opened = true;

            return new Promise(function (resolve, _reject) {
                Animate.tween(value, {
                    scale: { x: 1.0, y: 1.0 },
                    pos: {
                        x: _this4.absolutePos.x + 0.5 * _this4.size.w - 0.5 * value.size.w,
                        y: _this4.absolutePos.y - value.size.h
                    },
                    opacity: 1.0
                }, 500).after(function () {
                    window.setTimeout(function () {
                        if (destroy) {
                            Animate.poof(_this4);
                            if (_this4.parent) {
                                stage.remove(value);
                                _this4.parent.swap(_this4, value);
                            } else {
                                _this4.stage.remove(_this4);
                            }
                        }
                        stage.draw();
                        stage.update();
                        resolve(value);
                    }, 200);
                });
            });
        }
    }, {
        key: "onmouseenter",
        value: function onmouseenter() {
            _get(ChestVarExpr.prototype.__proto__ || Object.getPrototypeOf(ChestVarExpr.prototype), "onmouseenter", this).call(this);
            document.querySelector('canvas').style.cursor = 'pointer';
        }
    }, {
        key: "onmouseleave",
        value: function onmouseleave() {
            _get(ChestVarExpr.prototype.__proto__ || Object.getPrototypeOf(ChestVarExpr.prototype), "onmouseleave", this).call(this);
            document.querySelector('canvas').style.cursor = 'auto';
        }
    }, {
        key: "_superSize",
        get: function get() {
            return _get(ChestVarExpr.prototype.__proto__ || Object.getPrototypeOf(ChestVarExpr.prototype), "size", this);
        }
    }, {
        key: "size",
        get: function get() {
            return { w: this._size.w, h: this._size.h };
        }
    }, {
        key: "_baseImage",
        get: function get() {
            if (this.name == "x") {
                return Resource.getImage("chest-wood-base");
            }
            return Resource.getImage("chest-metal-base");
        }
    }, {
        key: "_lidClosedImage",
        get: function get() {
            if (this.name == "x") {
                return Resource.getImage("chest-wood-lid-closed");
            }
            return Resource.getImage("chest-metal-lid-closed");
        }
    }, {
        key: "_lidOpenImage",
        get: function get() {
            if (this.name == "x") {
                return Resource.getImage("chest-wood-lid-open");
            }
            return Resource.getImage("chest-metal-lid-open");
        }
    }]);

    return ChestVarExpr;
}(VarExpr);

var JumpingChestVarExpr = function (_ChestVarExpr) {
    _inherits(JumpingChestVarExpr, _ChestVarExpr);

    function JumpingChestVarExpr() {
        _classCallCheck(this, JumpingChestVarExpr);

        return _possibleConstructorReturn(this, (JumpingChestVarExpr.__proto__ || Object.getPrototypeOf(JumpingChestVarExpr)).apply(this, arguments));
    }

    _createClass(JumpingChestVarExpr, [{
        key: "performReduction",
        value: function performReduction() {
            var animated = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

            if (!animated || !this.stage) {
                return _get(JumpingChestVarExpr.prototype.__proto__ || Object.getPrototypeOf(JumpingChestVarExpr.prototype), "performReduction", this).call(this, animated);
            }
            var chest = this.stage.environmentDisplay.getBinding(this.name);
            if (!chest) {
                return _get(JumpingChestVarExpr.prototype.__proto__ || Object.getPrototypeOf(JumpingChestVarExpr.prototype), "performReduction", this).call(this, animated);
            }

            console.log(chest);
        }
    }]);

    return JumpingChestVarExpr;
}(ChestVarExpr);

var LabeledChestVarExpr = function (_ChestVarExpr2) {
    _inherits(LabeledChestVarExpr, _ChestVarExpr2);

    function LabeledChestVarExpr(name) {
        _classCallCheck(this, LabeledChestVarExpr);

        // See MissingTypedExpression#constructor
        var _this6 = _possibleConstructorReturn(this, (LabeledChestVarExpr.__proto__ || Object.getPrototypeOf(LabeledChestVarExpr)).call(this, name));

        _this6.equivalentClasses = [LabeledChestVarExpr];
        _this6.label = new TextExpr(name);
        _this6.label.color = 'white';
        _this6.holes.push(_this6.label);
        return _this6;
    }

    _createClass(LabeledChestVarExpr, [{
        key: "open",
        value: function open(preview) {
            var animate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
        }
    }, {
        key: "close",
        value: function close() {}
    }, {
        key: "drawInternal",
        value: function drawInternal(ctx, pos, boundingSize) {
            this.holes[0].pos = {
                x: this.size.w / 2 - this.holes[0].absoluteSize.w / 2,
                y: this.size.h / 2
            };

            _get(LabeledChestVarExpr.prototype.__proto__ || Object.getPrototypeOf(LabeledChestVarExpr.prototype), "drawInternal", this).call(this, ctx, pos, boundingSize);
        }
    }]);

    return LabeledChestVarExpr;
}(ChestVarExpr);

var DisplayChest = function (_ChestVarExpr3) {
    _inherits(DisplayChest, _ChestVarExpr3);

    function DisplayChest(name, expr) {
        _classCallCheck(this, DisplayChest);

        var _this7 = _possibleConstructorReturn(this, (DisplayChest.__proto__ || Object.getPrototypeOf(DisplayChest)).call(this, name));

        _this7._opened = true;
        _this7.holes.push(expr);
        expr.ignoreEvents = true;
        expr.scale = { x: 0.6, y: 0.6 };
        expr.anchor = { x: -0.1, y: 0.5 };
        _this7.childPos = { x: 10, y: 5 };
        return _this7;
    }

    _createClass(DisplayChest, [{
        key: "setExpr",
        value: function setExpr(expr) {
            this.holes[0] = expr;
            expr.ignoreEvents = true;
            expr.scale = { x: 0.6, y: 0.6 };
            // expr.anchor = { x: -0.1, y: 0.5 };
        }
    }, {
        key: "performReduction",
        value: function performReduction() {}
    }, {
        key: "prepareAssign",
        value: function prepareAssign() {
            var _this8 = this;

            var target = {
                childPos: {
                    x: 10,
                    y: -200
                }
            };
            return Animate.tween(this, target, 600).after(function () {
                _this8.childPos = { x: 10, y: 5 };
            });
        }
    }, {
        key: "drawInternal",
        value: function drawInternal(ctx, pos, boundingSize) {
            var size = this._size;
            var scale = this.absoluteScale;
            var adjustedSize = this.absoluteSize;
            var offsetX = (adjustedSize.w - size.w) / 2;
            ctx.drawImage(this._lidOpenImage, pos.x + offsetX, pos.y, size.w * scale.x, size.h * scale.y);
            this.holes[0].pos = {
                x: this.childPos.x,
                y: this.childPos.y
            };
        }
    }, {
        key: "drawInternalAfterChildren",
        value: function drawInternalAfterChildren(ctx, pos, boundingSize) {
            var size = this._size;
            var scale = this.absoluteScale;
            var adjustedSize = this.absoluteSize;
            var offsetX = (adjustedSize.w - size.w) / 2;
            ctx.drawImage(this._baseImage, pos.x + offsetX, pos.y, size.w * scale.x, size.h * scale.y);
        }
    }, {
        key: "size",
        get: function get() {
            return this._superSize;
        }
    }]);

    return DisplayChest;
}(ChestVarExpr);

var AssignExpr = function (_Expression2) {
    _inherits(AssignExpr, _Expression2);

    function AssignExpr(variable, value) {
        _classCallCheck(this, AssignExpr);

        var _this9 = _possibleConstructorReturn(this, (AssignExpr.__proto__ || Object.getPrototypeOf(AssignExpr)).call(this, []));

        if (variable && !(variable instanceof MissingExpression)) {
            _this9.holes.push(variable);
        } else {
            var missing = new MissingTypedExpression(new VarExpr("_"));
            missing.acceptedClasses = [VarExpr];
            _this9.holes.push(missing);
        }

        _this9.holes.push(new TextExpr("←"));

        if (value) {
            _this9.holes.push(value);
        } else {
            _this9.holes.push(new MissingExpression());
        }
        return _this9;
    }

    _createClass(AssignExpr, [{
        key: "onmouseclick",
        value: function onmouseclick() {
            this.performReduction();
        }
    }, {
        key: "canReduce",
        value: function canReduce() {
            return this.value && this.variable && this.value.canReduce();
        }
    }, {
        key: "reduce",
        value: function reduce() {
            if (this.variable && this.value) {
                return this.value;
            } else {
                return this;
            }
        }
    }, {
        key: "performReduction",
        value: function performReduction() {
            var _this10 = this;

            var animated = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

            // The side-effect actually happens here. reduce() is called
            // multiple times as a 'canReduce', and we don't want any
            // update to happen multiple times.
            if (this.value) {
                var result = this.value.performReduction(animated);
                if (result instanceof Promise) {
                    result.then(function () {
                        window.setTimeout(function () {
                            return _this10.performReduction(animated);
                        }, 600);
                    });
                    return;
                }
            }
            if (this.canReduce()) {
                (function () {
                    var initial = [];
                    if (_this10.parent) {
                        initial.push(_this10.parent);
                    } else {
                        initial = initial.concat(_this10.stage.nodes);
                    }

                    // Prevent background on GraphicValueExpr from being drawn
                    _this10.value.ignoreEvents = true;
                    // Keep a copy of the original value before we start
                    // messing with it, to update the environment afterwards
                    var value = _this10.value.clone();

                    _this10.variable._opened = true;
                    var target = {
                        scale: { x: 0.3, y: 0.3 },
                        pos: { x: _this10.variable.pos.x, y: _this10.variable.pos.y }
                    };

                    var environment = _this10.getEnvironment();

                    // quadratic lerp for pos.y - makes it "arc" towards the variable
                    var b = 4 * (Math.min(_this10.value.pos.y, _this10.variable.pos.y) - 120) - _this10.variable.pos.y;
                    var c = _this10.value.pos.y;
                    var a = _this10.variable.pos.y - b;
                    var lerp = function lerp(src, tgt, elapsed, chain) {
                        if (chain.length == 2 && chain[0] == "pos" && chain[1] == "y") {
                            return a * elapsed * elapsed + b * elapsed + c;
                        } else {
                            return (1.0 - elapsed) * src + elapsed * tgt;
                        }
                    };

                    var parent = _this10.parent || _this10.stage;
                    var afterCallback = function afterCallback() {
                        _this10.getEnvironment().update(_this10.variable.name, value);
                        _this10.stage.environmentDisplay.showGlobals();
                        _this10.stage.draw();
                    };

                    var callback = null;
                    if (environment == _this10.stage.environment && _this10.stage.environmentDisplay) {
                        callback = _this10.stage.environmentDisplay.prepareAssign(_this10.variable.name);
                    }
                    if (callback) {
                        callback.after(afterCallback);
                    } else {
                        window.setTimeout(afterCallback, 500);
                    }

                    Animate.tween(_this10.value, target, 500, function (x) {
                        return x;
                    }, true, lerp).after(function () {
                        Animate.poof(_this10);
                        parent.swap(_this10, null);
                    });
                })();
            }
        }
    }, {
        key: "reduceCompletely",
        value: function reduceCompletely() {
            if (this.value) {
                this.value.reduceCompletely();
            }

            if (this.variable && this.value) {
                // Return non-undefined non-this value so that when the
                // user drops everything in, MissingExpression#ondropped
                // will make this expr blink
                return null;
            } else {
                return this;
            }
        }
    }, {
        key: "variable",
        get: function get() {
            return this.holes[0] instanceof MissingExpression ? null : this.holes[0];
        }
    }, {
        key: "value",
        get: function get() {
            return this.holes[2] instanceof MissingExpression ? null : this.holes[2];
        }
    }]);

    return AssignExpr;
}(Expression);

var ExpressionView = function (_MissingExpression) {
    _inherits(ExpressionView, _MissingExpression);

    function ExpressionView(expr_to_miss) {
        _classCallCheck(this, ExpressionView);

        var _this11 = _possibleConstructorReturn(this, (ExpressionView.__proto__ || Object.getPrototypeOf(ExpressionView)).call(this, expr_to_miss));

        _this11._openOffset = 0;
        return _this11;
    }

    // Disable interactivity


    _createClass(ExpressionView, [{
        key: "ondropenter",
        value: function ondropenter() {}
    }, {
        key: "ondropexit",
        value: function ondropexit() {}
    }, {
        key: "ondropped",
        value: function ondropped() {}
    }, {
        key: "onmouseenter",
        value: function onmouseenter() {}
    }, {
        key: "drawInternal",
        value: function drawInternal(ctx, pos, boundingSize) {
            var rad = boundingSize.w / 2.0;
            setStrokeStyle(ctx, {
                color: '#AAAAAA',
                lineWidth: 3
            });
            ctx.beginPath();
            ctx.arc(pos.x + rad, pos.y + rad, rad, 0, 2 * Math.PI);

            ctx.clip();
            var alpha = 0.5 * ((Math.PI / 2 - this._openOffset) / (Math.PI / 2));
            ctx.shadowColor = "rgba(0,0,0," + alpha + ")";
            ctx.shadowBlur = 3;
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;
            ctx.stroke();
        }
    }]);

    return ExpressionView;
}(MissingExpression);

function findAliasingVarExpr(initial, name, ignore) {
    // TODO: needs to account for whether the variable we are looking
    // for is in an outer scope. Example:
    // x = 3
    // def test():
    //     global x
    //     x = 5
    var subvarexprs = [];
    var queue = initial;
    while (queue.length > 0) {
        var node = queue.pop();
        if (node instanceof VarExpr && node.name === name && ignore.indexOf(node) == -1) {
            subvarexprs.push(node);
        } else if (node instanceof LambdaExpr && node.takesArgument && node.holes[0].name === name) {
            // Capture-avoiding substitution
            continue;
        }

        if (node.children) {
            queue = queue.concat(node.children);
        }
    }

    return subvarexprs;
}