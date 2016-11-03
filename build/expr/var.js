"use strict";

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

        var _this = _possibleConstructorReturn(this, (VarExpr.__proto__ || Object.getPrototypeOf(VarExpr)).call(this, [new TextExpr(name)]));

        _this.name = name;
        // See MissingTypedExpression#constructor
        _this.equivalentClasses = [VarExpr];
        return _this;
    }

    _createClass(VarExpr, [{
        key: "open",
        value: function open(preview) {
            var _this2 = this;

            var animate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

            if (!animate) {
                this.animating = false;
                this.preview = preview;
                this.update();
                return null;
            }
            return this.animateShrink(200).after(function () {
                _this2.preview = preview;
                _this2.update();
            });
        }
    }, {
        key: "close",
        value: function close() {
            this.preview = null;
            this.update();
        }
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
        var _this3 = _possibleConstructorReturn(this, (ChestVarExpr.__proto__ || Object.getPrototypeOf(ChestVarExpr)).call(this, name));

        _this3.equivalentClasses = [ChestVarExpr];

        _this3._cacheBase = null;
        _this3._cacheLid = null;
        _this3._opened = false;
        return _this3;
    }

    _createClass(ChestVarExpr, [{
        key: "drawInternal",
        value: function drawInternal(ctx, pos, boundingSize) {
            var baseHeight = 0.5 * boundingSize.h;
            var remainingHeight = 0.8 * (boundingSize.h - baseHeight);
            var offset = 0.2 * (boundingSize.h - baseHeight);

            if (!this._cacheBase) {
                var cacheBase = document.createElement("canvas");
                cacheBase.width = boundingSize.w;
                cacheBase.height = boundingSize.h;
                var _ctx = cacheBase.getContext("2d");
                // Base of chest
                _ctx.fillStyle = '#cd853f';
                setStrokeStyle(_ctx, {
                    lineWidth: 2,
                    color: '#ffa500'
                });
                _ctx.fillRect(0, remainingHeight, boundingSize.w, baseHeight);
                _ctx.strokeRect(0 + 2, remainingHeight + 2, boundingSize.w - 4, baseHeight - 4);
                setStrokeStyle(_ctx, {
                    lineWidth: 1.5,
                    color: '#8b4513'
                });
                _ctx.strokeRect(0, remainingHeight, boundingSize.w, baseHeight);
                _ctx.strokeRect(0 + 3.5, remainingHeight + 3.5, boundingSize.w - 7, baseHeight - 7);

                var cacheLid = document.createElement("canvas");
                cacheLid.width = boundingSize.w;
                cacheLid.height = boundingSize.h;
                _ctx = cacheLid.getContext("2d");
                // Lid of chest
                _ctx.fillStyle = '#cd853f';
                setStrokeStyle(_ctx, {
                    lineWidth: 2,
                    color: '#ffa500'
                });
                _ctx.strokeRect(0 + 2, offset, boundingSize.w - 4, baseHeight - 2);
                setStrokeStyle(_ctx, {
                    lineWidth: 1.5,
                    color: '#8b4513'
                });
                _ctx.strokeRect(0 + 3.5, offset, boundingSize.w - 7, baseHeight - 3.5);

                _ctx.fillRect(0 + 3.5, offset, boundingSize.w - 7, baseHeight - 3.5);
                _ctx.strokeRect(0, offset, boundingSize.w, baseHeight);

                this._cacheBase = cacheBase;
                this._cacheLid = cacheLid;
            }

            if (!this._opened) {
                ctx.drawImage(this._cacheBase, pos.x, pos.y);
                ctx.drawImage(this._cacheLid, pos.x, pos.y);
            } else {
                ctx.drawImage(this._cacheBase, pos.x, pos.y);
            }
        }
    }, {
        key: "performReduction",
        value: function performReduction() {
            var _this4 = this;

            if (this._opened) return;
            var value = this.reduce();
            if (value != this) {
                value = value.clone();
                // let parent = this.parent ? this.parent : this.stage;
                // parent.swap(this, value);
                value.scale = { x: 0.4, y: 0.4 };
                value.pos = {
                    x: this.pos.x + 0.5 * this.size.w - 0.5 * value.absoluteSize.w,
                    y: this.pos.y + 0.3 * this.size.h
                };
                this.stage.add(value);
                this._opened = true;
                Animate.tween(value, {
                    scale: { x: 1.0, y: 1.0 },
                    pos: {
                        x: this.pos.x,
                        y: this.pos.y - 30
                    }
                }, 700).after(function () {});
                Animate.tween(this, { opacity: 0.0 }, 1000).after(function () {
                    _this4.stage.remove(_this4);
                });
            }
        }
    }]);

    return ChestVarExpr;
}(VarExpr);

var AssignExpr = function (_Expression2) {
    _inherits(AssignExpr, _Expression2);

    function AssignExpr(variable, value) {
        _classCallCheck(this, AssignExpr);

        var _this5 = _possibleConstructorReturn(this, (AssignExpr.__proto__ || Object.getPrototypeOf(AssignExpr)).call(this, []));

        if (variable && !(variable instanceof MissingExpression)) {
            _this5.holes.push(variable);
        } else {
            var missing = new MissingTypedExpression(new VarExpr("_"));
            missing.acceptedClasses = [VarExpr];
            _this5.holes.push(missing);
        }

        _this5.holes.push(new TextExpr("←"));

        if (value) {
            _this5.holes.push(value);
        } else {
            _this5.holes.push(new MissingExpression());
        }
        return _this5;
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
            var _this6 = this;

            var animated = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

            // The side-effect actually happens here. reduce() is called
            // multiple times as a 'canReduce', and we don't want any
            // update to happen multiple times.
            if (this.value) {
                this.value.performReduction();
            }
            if (this.canReduce()) {
                (function () {
                    var initial = [];
                    if (_this6.parent) {
                        initial.push(_this6.parent);
                    } else {
                        initial = initial.concat(_this6.stage.nodes);
                    }

                    // Prevent background on GraphicValueExpr from being drawn
                    _this6.value.ignoreEvents = true;
                    // Keep a copy of the original value before we start
                    // messing with it, to update the environment afterwards
                    var value = _this6.value.clone();
                    _this6.getEnvironment().update(_this6.variable.name, value);
                    var parent = _this6.parent || _this6.stage;
                    Animate.poof(_this6);
                    window.setTimeout(function () {
                        parent.swap(_this6, null);
                    }, 100);
                    _this6.stage.draw();
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

        var _this7 = _possibleConstructorReturn(this, (ExpressionView.__proto__ || Object.getPrototypeOf(ExpressionView)).call(this, expr_to_miss));

        _this7._openOffset = 0;
        return _this7;
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