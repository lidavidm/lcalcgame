"use strict";

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SHRINK_DURATION = 800;
var EXPAND_DURATION = 400;

var _ChestImages = function () {
    function _ChestImages() {
        _classCallCheck(this, _ChestImages);
    }

    _createClass(_ChestImages, [{
        key: "base",
        value: function base(name) {
            if (name == "x") {
                return Resource.getImage("chest-wood-base");
            }
            return Resource.getImage("chest-metal-base");
        }
    }, {
        key: "lidClosed",
        value: function lidClosed(name) {
            if (name == "x") {
                return Resource.getImage("chest-wood-lid-closed");
            }
            return Resource.getImage("chest-metal-lid-closed");
        }
    }, {
        key: "lidOpen",
        value: function lidOpen(name) {
            if (name == "x") {
                return Resource.getImage("chest-wood-lid-open");
            }
            return Resource.getImage("chest-metal-lid-open");
        }
    }]);

    return _ChestImages;
}();

var ChestImages = new _ChestImages();

// parabolic lerp for y - makes it "arc" towards the final position
var arcLerp = function arcLerp(y0, y1) {
    var arc = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 120;

    var b = 4 * (Math.min(y0, y1) - arc) - y1 - 3 * y0;
    var c = y0;
    var a = y1 - b - c;
    var lerp = function lerp(src, tgt, elapsed, chain) {
        if (chain.length == 2 && chain[0] == "pos" && chain[1] == "y") {
            return a * elapsed * elapsed + b * elapsed + c;
        } else {
            return (1.0 - elapsed) * src + elapsed * tgt;
        }
    };
    return lerp;
};

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
        key: "onmouseclick",
        value: function onmouseclick() {
            this.performReduction();
        }
    }]);

    return VarExpr;
}(Expression);

var LabeledVarExpr = function (_VarExpr) {
    _inherits(LabeledVarExpr, _VarExpr);

    function LabeledVarExpr(name) {
        _classCallCheck(this, LabeledVarExpr);

        var _this2 = _possibleConstructorReturn(this, (LabeledVarExpr.__proto__ || Object.getPrototypeOf(LabeledVarExpr)).call(this, name));

        _this2.label = new TextExpr(name);
        _this2.holes.push(_this2.label);
        return _this2;
    }

    _createClass(LabeledVarExpr, [{
        key: "performReduction",
        value: function performReduction() {
            var _this3 = this;

            if (this.parent && this.parent instanceof AssignExpr && this.parent.variable == this) return;

            var value = this.reduce();
            if (value != this) {
                value = value.clone();
                var _parent = this.parent ? this.parent : this.stage;
                _parent.swap(this, value);
            } else {
                (function () {
                    var wat = new TextExpr("?");
                    _this3.stage.add(wat);
                    wat.pos = _this3.label.absolutePos;
                    Animate.tween(wat, {
                        pos: {
                            x: wat.pos.x,
                            y: wat.pos.y - 50
                        }
                    }, 250);
                    window.setTimeout(function () {
                        Animate.poof(wat);
                        _this3.stage.remove(wat);
                        _this3.stage.draw();
                        _this3.stage.update();
                    }, 500);
                })();
            }
        }
    }]);

    return LabeledVarExpr;
}(VarExpr);

var ChestVarExpr = function (_VarExpr2) {
    _inherits(ChestVarExpr, _VarExpr2);

    function ChestVarExpr(name) {
        _classCallCheck(this, ChestVarExpr);

        // See MissingTypedExpression#constructor
        var _this4 = _possibleConstructorReturn(this, (ChestVarExpr.__proto__ || Object.getPrototypeOf(ChestVarExpr)).call(this, name));

        _this4.equivalentClasses = [ChestVarExpr];
        _this4._preview = null;
        _this4._animating = false;
        return _this4;
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
            ctx.drawImage(ChestImages.base(this.name), pos.x + offset, pos.y + offset, size.w * scale.x - 2 * offset, size.h * scale.y - 2 * offset);
            if (this._opened) {
                ctx.drawImage(ChestImages.lidOpen(this.name), pos.x + offset, pos.y + offset, size.w * scale.x - 2 * offset, size.h * scale.y - 2 * offset);
            } else {
                ctx.drawImage(ChestImages.lidClosed(this.name), pos.x + offset, pos.y + offset, size.w * scale.x - 2 * offset, size.h * scale.y - 2 * offset);
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
            var _this5 = this;

            var animated = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

            if (this.parent && this.parent instanceof AssignExpr && this.parent.variable == this) return null;

            var value = this.reduce();
            if (value != this) {
                if (!animated) {
                    var _parent2 = this.parent ? this.parent : this.stage;
                    _parent2.swap(this, value);
                    return null;
                }
                this._animating = true;
                return this.animateReduction(value, true);
            } else if (animated) {
                this.animateReduction(new TextExpr("?"), false).then(function (wat) {
                    _this5._opened = false;
                    window.setTimeout(function () {
                        Animate.poof(wat);
                        _this5.stage.remove(wat);
                        _this5.stage.draw();
                        _this5.stage.update();
                    }, 500);
                });
                return null;
            }
            return null;
        }
    }, {
        key: "animateReduction",
        value: function animateReduction(value, destroy) {
            var _this6 = this;

            value = value.clone();
            value.scale = { x: 0.1, y: 0.1 };
            value.pos = {
                x: this.absolutePos.x + 0.5 * this.size.w - 0.5 * value.absoluteSize.w,
                y: this.absolutePos.y + 30
            };
            value.opacity = 0.0;

            var stage = this.stage;
            stage.add(value);

            if (!this._opened) {
                Resource.play('chest-open');
                this._opened = true;
            }

            return new Promise(function (resolve, _reject) {
                Resource.play('come-out');
                Animate.tween(value, {
                    scale: { x: 1.0, y: 1.0 },
                    pos: {
                        x: _this6.absolutePos.x + 0.5 * _this6.size.w - 0.5 * value.size.w,
                        y: _this6.absolutePos.y - value.size.h
                    },
                    opacity: 1.0
                }, 500).after(function () {
                    window.setTimeout(function () {
                        if (destroy) {
                            Animate.poof(_this6);
                            if (_this6.parent) {
                                stage.remove(value);
                                _this6.parent.swap(_this6, value);
                            } else {
                                _this6.stage.remove(_this6);
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
        key: "onmouseclick",
        value: function onmouseclick() {
            if (!this._animating) {
                this.performReduction(true);
            }
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
            var _this8 = this;

            var animated = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

            if (this.parent && this.parent instanceof AssignExpr && this.parent.variable == this) return null;

            if (!animated || !this.stage) {
                return _get(JumpingChestVarExpr.prototype.__proto__ || Object.getPrototypeOf(JumpingChestVarExpr.prototype), "performReduction", this).call(this, animated);
            }
            var chest = this.stage.environmentDisplay.getBinding(this.name);
            if (!chest) {
                return _get(JumpingChestVarExpr.prototype.__proto__ || Object.getPrototypeOf(JumpingChestVarExpr.prototype), "performReduction", this).call(this, animated);
            }

            Resource.play('chest-open');
            this._opened = true;
            this._animating = true;
            var value = chest.holes[0].clone();
            value.pos = chest.holes[0].absolutePos;
            this.stage.add(value);

            var target = {
                pos: this.absolutePos,
                scale: { x: 0.3, y: 0.3 }
            };
            var lerp = arcLerp(value.absolutePos.y, this.absolutePos.y);
            Resource.play('fall-to');
            return new Promise(function (resolve, _reject) {
                Animate.tween(value, target, 600, function (x) {
                    return x;
                }, true, lerp).after(function () {
                    _this8.stage.remove(value);
                    _this8.stage.draw();
                    window.setTimeout(function () {
                        _get(JumpingChestVarExpr.prototype.__proto__ || Object.getPrototypeOf(JumpingChestVarExpr.prototype), "performReduction", _this8).call(_this8, true).then(function (value) {
                            resolve(value);
                        });
                    }, 100);
                });
            });
        }
    }]);

    return JumpingChestVarExpr;
}(ChestVarExpr);

var LabeledChestVarExpr = function (_ChestVarExpr2) {
    _inherits(LabeledChestVarExpr, _ChestVarExpr2);

    function LabeledChestVarExpr(name) {
        _classCallCheck(this, LabeledChestVarExpr);

        // See MissingTypedExpression#constructor
        var _this9 = _possibleConstructorReturn(this, (LabeledChestVarExpr.__proto__ || Object.getPrototypeOf(LabeledChestVarExpr)).call(this, name));

        _this9.equivalentClasses = [LabeledChestVarExpr];
        _this9.label = new TextExpr(name);
        _this9.label.color = 'white';
        _this9.holes.push(_this9.label);
        return _this9;
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

// Display variants need to not be subclasses to not confuse the fader


var DisplayChest = function (_Expression2) {
    _inherits(DisplayChest, _Expression2);

    function DisplayChest(name, expr) {
        _classCallCheck(this, DisplayChest);

        var _this10 = _possibleConstructorReturn(this, (DisplayChest.__proto__ || Object.getPrototypeOf(DisplayChest)).call(this, [expr]));

        _this10.name = name;
        _this10.childPos = { x: 10, y: 5 };

        if (!expr) return _possibleConstructorReturn(_this10);
        expr.ignoreEvents = true;
        expr.scale = { x: 0.6, y: 0.6 };
        expr.anchor = { x: -0.1, y: 0.5 };
        return _this10;
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
        key: "getExpr",
        value: function getExpr() {
            return this.holes[0];
        }
    }, {
        key: "performReduction",
        value: function performReduction() {}
    }, {
        key: "prepareAssign",
        value: function prepareAssign() {
            var _this11 = this;

            var target = {
                childPos: {
                    x: 10,
                    y: -200
                }
            };
            return Animate.tween(this, target, 600).after(function () {
                _this11.childPos = { x: 10, y: 5 };
            });
        }
    }, {
        key: "drawInternal",
        value: function drawInternal(ctx, pos, boundingSize) {
            var size = this._size;
            var scale = this.absoluteScale;
            var adjustedSize = this.absoluteSize;
            var offsetX = (adjustedSize.w - size.w) / 2;
            ctx.drawImage(ChestImages.lidOpen(this.name), pos.x + offsetX, pos.y, size.w * scale.x, size.h * scale.y);
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
            ctx.drawImage(ChestImages.base(this.name), pos.x + offsetX, pos.y, size.w * scale.x, size.h * scale.y);
        }
    }]);

    return DisplayChest;
}(Expression);

var LabeledDisplayChest = function (_DisplayChest) {
    _inherits(LabeledDisplayChest, _DisplayChest);

    function LabeledDisplayChest(name, expr) {
        _classCallCheck(this, LabeledDisplayChest);

        var _this12 = _possibleConstructorReturn(this, (LabeledDisplayChest.__proto__ || Object.getPrototypeOf(LabeledDisplayChest)).call(this, name, expr));

        _this12.childPos = { x: 22.5, y: 5 };
        _this12.label = new TextExpr(name);
        _this12.label.color = 'white';
        _this12.holes.push(_this12.label);
        return _this12;
    }

    _createClass(LabeledDisplayChest, [{
        key: "drawInternal",
        value: function drawInternal(ctx, pos, boundingSize) {
            _get(LabeledDisplayChest.prototype.__proto__ || Object.getPrototypeOf(LabeledDisplayChest.prototype), "drawInternal", this).call(this, ctx, pos, boundingSize);
            this.label.pos = {
                x: this.size.w / 2 - this.label.absoluteSize.w / 2,
                y: this.size.h / 2
            };
        }
    }, {
        key: "draw",
        value: function draw(ctx) {
            if (!ctx) return;
            ctx.save();
            if (this.opacity !== undefined && this.opacity < 1.0) {
                ctx.globalAlpha = this.opacity;
            }
            var boundingSize = this.absoluteSize;
            var upperLeftPos = this.upperLeftPos(this.absolutePos, boundingSize);
            this.drawInternal(ctx, upperLeftPos, boundingSize);
            this.holes[0].parent = this;
            this.holes[0].draw(ctx);
            this.drawInternalAfterChildren(ctx, upperLeftPos, boundingSize);
            this.label.parent = this;
            this.label.draw(ctx);
            ctx.restore();
        }
    }]);

    return LabeledDisplayChest;
}(DisplayChest);

var LabeledDisplay = function (_Expression3) {
    _inherits(LabeledDisplay, _Expression3);

    function LabeledDisplay(name, expr) {
        _classCallCheck(this, LabeledDisplay);

        var _this13 = _possibleConstructorReturn(this, (LabeledDisplay.__proto__ || Object.getPrototypeOf(LabeledDisplay)).call(this, []));

        _this13.name = name;
        _this13.nameLabel = new TextExpr(name);
        _this13.nameLabel.color = 'white';
        _this13.equals = new TextExpr("=");
        _this13.equals.color = 'white';
        _this13.value = expr;
        _this13.addArg(_this13.nameLabel);
        _this13.addArg(_this13.equals);
        _this13.addArg(_this13.value);
        _this13.setExpr(expr);
        _this13.origValue = null;
        return _this13;
    }

    _createClass(LabeledDisplay, [{
        key: "open",
        value: function open(preview) {
            if (!this.origValue) {
                this.origValue = this.value;
                this.setExpr(preview);
            }
        }
    }, {
        key: "close",
        value: function close() {
            if (this.origValue) {
                this.setExpr(this.origValue);
                this.origValue = null;
            }
        }
    }, {
        key: "getExpr",
        value: function getExpr() {
            if (this.origValue) {
                return this.origValue;
            }
            return this.holes[2];
        }
    }, {
        key: "setExpr",
        value: function setExpr(expr) {
            if (this.holes.length < 3) return;
            expr.pos = { x: 0, y: 0 };
            this.holes[2] = expr;
            expr.scale = { x: 1.0, y: 1.0 };
            expr.anchor = { x: 0, y: 0.5 };
            expr.stroke = null;
            expr.ignoreEvents = true;
            expr.parent = this;
            this.value = expr;
            this.update();
        }
    }, {
        key: "drawInternal",
        value: function drawInternal(ctx, pos, boundingSize) {}
    }]);

    return LabeledDisplay;
}(Expression);

var AssignExpr = function (_Expression4) {
    _inherits(AssignExpr, _Expression4);

    function AssignExpr(variable, value) {
        _classCallCheck(this, AssignExpr);

        var _this14 = _possibleConstructorReturn(this, (AssignExpr.__proto__ || Object.getPrototypeOf(AssignExpr)).call(this, []));

        if (variable && !(variable instanceof MissingExpression)) {
            _this14.holes.push(variable);
        } else {
            var missing = new MissingTypedExpression(new VarExpr("_"));
            missing.acceptedClasses = [VarExpr];
            _this14.holes.push(missing);
        }

        _this14.arrowLabel = new TextExpr("←");
        _this14.holes.push(_this14.arrowLabel);

        if (value) {
            _this14.holes.push(value);
        } else {
            _this14.holes.push(new MissingExpression(new Expression()));
        }

        _this14._animating = false;
        return _this14;
    }

    _createClass(AssignExpr, [{
        key: "onmouseclick",
        value: function onmouseclick() {
            this.performReduction();
        }
    }, {
        key: "canReduce",
        value: function canReduce() {
            return this.value && this.variable && this.value.canReduce() && this.variable instanceof VarExpr;
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
        key: "animateJump",
        value: function animateJump() {
            var _this15 = this;

            return new Promise(function (resolve, reject) {
                var target = {
                    scale: { x: 0.3, y: 0.3 },
                    pos: { x: _this15.variable.pos.x, y: _this15.variable.pos.y }
                };

                // quadratic lerp for pos.y - makes it "arc" towards the variable
                var lerp = arcLerp(_this15.value.pos.y, _this15.variable.pos.y);
                var parent = _this15.parent || _this15.stage;

                Animate.tween(_this15.value, target, 500, function (x) {
                    return x;
                }, true, lerp).after(function () {
                    Animate.poof(_this15);
                    parent.swap(_this15, null);
                    resolve();
                });
            });
        }
    }, {
        key: "setupAnimation",
        value: function setupAnimation() {
            this.variable._opened = true;

            // Prevent background on GraphicValueExpr from being drawn
            this.value.ignoreEvents = true;

            // Keep a copy of the original value before we start
            // messing with it, to update the environment afterwards
            this._actualValue = this.value.clone();
        }
    }, {
        key: "finishReduction",
        value: function finishReduction() {
            this.getEnvironment().update(this.variable.name, this._actualValue);
            this.stage.environmentDisplay.showGlobals();
            var binding = this.stage.environmentDisplay.getBinding(this.variable.name);
            Animate.blink(binding.getExpr());
            this.stage.draw();
        }
    }, {
        key: "animateReduction",
        value: function animateReduction() {
            var _this16 = this;

            this.setupAnimation();

            var environment = this.getEnvironment();
            var callback = null;
            if (environment == this.stage.environment && this.stage.environmentDisplay) {
                callback = this.stage.environmentDisplay.prepareAssign(this.variable.name);
            }
            if (callback) {
                callback.after(function () {
                    return _this16.finishReduction();
                });
            } else {
                window.setTimeout(function () {
                    return _this16.finishReduction();
                }, 500);
            }

            return this.animateJump();
        }
    }, {
        key: "performReduction",
        value: function performReduction() {
            var _this17 = this;

            var animated = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

            // The side-effect actually happens here. reduce() is called
            // multiple times as a 'canReduce', and we don't want any
            // update to happen multiple times.
            if (!this.canReduce()) {
                if (this.value && this.variable && !this.value.canReduce()) {
                    // Try and play any animation anyways to hint at why
                    // the value can't reduce.
                    this.value.performReduction();
                }
                return null;
            }

            if (!animated) {
                this.value.performReduction(false);
                var value = this.value.clone();
                this.getEnvironment().update(this.variable.name, value);
                this.stage.environmentDisplay.showGlobals();
                this.stage.draw();
                return null;
            }

            this._animating = true;

            var result = this.value.performReduction(animated);
            if (result instanceof Promise) {
                return result.then(function () {
                    return new Promise(function (resolve, _reject) {
                        window.setTimeout(function () {
                            return _this17.animateReduction();
                        }, 600);
                    });
                });
            } else {
                return this.animateReduction();
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
        key: "onmouseclick",
        value: function onmouseclick() {
            if (!this._animating) {
                this.performReduction();
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

var JumpingAssignExpr = function (_AssignExpr) {
    _inherits(JumpingAssignExpr, _AssignExpr);

    function JumpingAssignExpr(variable, value) {
        _classCallCheck(this, JumpingAssignExpr);

        return _possibleConstructorReturn(this, (JumpingAssignExpr.__proto__ || Object.getPrototypeOf(JumpingAssignExpr)).call(this, variable, value));
    }

    _createClass(JumpingAssignExpr, [{
        key: "animateReduction",
        value: function animateReduction() {
            var _this19 = this;

            this.setupAnimation();

            var environment = this.getEnvironment();
            return this.animateJump().then(function () {
                return new Promise(function (resolve, _reject) {
                    if (environment != _this19.stage.environment) {
                        Animate.poof(_this19);
                        parent.swap(_this19, null);
                        _this19.finishReduction();
                        resolve();
                        return;
                    }

                    var chest = _this19.stage.environmentDisplay.getBinding(_this19.variable.name);
                    var value = null;
                    var targetPos = null;
                    if (chest) {
                        targetPos = chest.absolutePos;
                        value = _this19.value.clone();
                        _this19.stage.environmentDisplay.prepareAssign(_this19.variable.name);
                    } else {
                        if (_this19.stage.environmentDisplay.contents.length === 0) {
                            targetPos = _this19.stage.environmentDisplay.leftEdgePos;
                        } else {
                            var contents = _this19.stage.environmentDisplay.contents;
                            var last = contents[contents.length - 1];
                            targetPos = addPos(last.absolutePos, { x: 0, y: last.absoluteSize.h + _this19.stage.environmentDisplay.padding });
                        }

                        value = new (ExprManager.getClass('reference_display'))(_this19.variable.name, _this19.value.clone());
                    }
                    _this19.value.scale = { x: 0, y: 0 };
                    _this19.stage.add(value);
                    value.pos = _this19.variable.absolutePos;
                    value.scale = { x: 0.3, y: 0.3 };
                    var target = {
                        pos: targetPos,
                        scale: { x: 1, y: 1 }
                    };

                    var lerp = arcLerp(value.absolutePos.y, targetPos.y, -150);
                    Resource.play('fly-to');
                    Animate.tween(value, target, 600, function (x) {
                        return x;
                    }, true, lerp).after(function () {
                        _this19.stage.remove(value);
                        _this19.finishReduction();
                        _this19.stage.draw();
                    });
                });
            });
        }
    }]);

    return JumpingAssignExpr;
}(AssignExpr);

var EqualsAssignExpr = function (_AssignExpr2) {
    _inherits(EqualsAssignExpr, _AssignExpr2);

    function EqualsAssignExpr(variable, value) {
        _classCallCheck(this, EqualsAssignExpr);

        var _this20 = _possibleConstructorReturn(this, (EqualsAssignExpr.__proto__ || Object.getPrototypeOf(EqualsAssignExpr)).call(this, variable, value));

        _this20.arrowLabel.text = "=";
        return _this20;
    }

    return EqualsAssignExpr;
}(AssignExpr);