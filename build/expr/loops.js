"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SCALE_FACTOR = 0.33;

var RepeatLoopExpr = function (_Expression) {
    _inherits(RepeatLoopExpr, _Expression);

    function RepeatLoopExpr(times, body) {
        _classCallCheck(this, RepeatLoopExpr);

        var _this = _possibleConstructorReturn(this, (RepeatLoopExpr.__proto__ || Object.getPrototypeOf(RepeatLoopExpr)).call(this, []));

        if (times instanceof MissingExpression) {
            times = new MissingNumberExpression();
        }
        if (body instanceof MissingExpression) {
            body = new InvisibleMissingExpression();
        }
        _this.addArg(times);
        _this.addArg(body);
        _this.padding.right = 0;
        _this.color = "orange";
        return _this;
    }

    _createClass(RepeatLoopExpr, [{
        key: "update",
        value: function update() {
            _get(RepeatLoopExpr.prototype.__proto__ || Object.getPrototypeOf(RepeatLoopExpr.prototype), "update", this).call(this);
        }
    }, {
        key: "drawInternal",
        value: function drawInternal(ctx, pos, boundingSize) {
            var _this2 = this;

            var leftWidth = this.timesExpr.absolutePos.x + this.timesExpr.absoluteSize.w + this.padding.inner / 2 - pos.x;
            var rightWidth = boundingSize.w - leftWidth + 1;
            var rightX = pos.x + leftWidth - 1;
            var bracketHeight = (boundingSize.h - this.bodyExpr.absoluteSize.h) / 2;
            var radius = this.radius * this.absoluteScale.x;
            var bracketRadius = bracketHeight;

            var offsetLineTo = function offsetLineTo(offset, x, y) {
                return ctx.lineTo(x, y + offset);
            };
            var offsetQuadraticCurveTo = function offsetQuadraticCurveTo(offset, cx, cy, x, y) {
                return ctx.quadraticCurveTo(cx, cy + offset, x, y + offset);
            };

            var draw = function draw(offset) {
                ctx.beginPath();
                ctx.moveTo(pos.x + radius + offset, pos.y + offset);
                offsetLineTo(offset, pos.x + boundingSize.w - bracketRadius, pos.y);
                offsetQuadraticCurveTo(offset, pos.x + boundingSize.w, pos.y, pos.x + boundingSize.w, pos.y + bracketRadius);
                offsetLineTo(offset, pos.x + leftWidth, pos.y + bracketRadius);
                offsetLineTo(offset, pos.x + leftWidth, pos.y + boundingSize.h - bracketRadius);
                offsetLineTo(offset, pos.x + boundingSize.w, pos.y + boundingSize.h - bracketRadius);
                offsetQuadraticCurveTo(offset, pos.x + boundingSize.w, pos.y + boundingSize.h, pos.x + boundingSize.w - bracketRadius, pos.y + boundingSize.h);
                offsetLineTo(offset, pos.x + radius, pos.y + boundingSize.h);
                offsetQuadraticCurveTo(offset, pos.x, pos.y + boundingSize.h, pos.x, pos.y + boundingSize.h - radius);
                offsetLineTo(offset, pos.x, pos.y + radius);
                offsetQuadraticCurveTo(offset, pos.x, pos.y, pos.x + radius, pos.y);
                ctx.closePath();
                if (_this2.stroke) {
                    strokeWithOpacity(ctx, _this2.stroke.opacity);
                }
                ctx.fill();
            };

            setStrokeStyle(ctx, this.stroke);
            if (this.shadowOffset !== 0) {
                ctx.fillStyle = 'black';
                draw(this.shadowOffset);
            }
            ctx.fillStyle = this.color;
            draw(0);
        }
    }, {
        key: "performReduction",
        value: function performReduction() {
            var _this3 = this;

            if (!this.bodyExpr.isComplete()) {
                var incomplete = mag.Stage.getNodesWithClass(MissingExpression, [], true, [this.bodyExpr]);
                incomplete.forEach(function (expr) {
                    Animate.blink(expr, 1000, [1.0, 0.0, 0.0]);
                });
                return Promise.reject("RepeatLoopExpr: missing body!");
            }

            this._cachedSize = this.size;
            this._animating = true;

            return this.performSubReduction(this.timesExpr).then(function (num) {
                if (!(num instanceof NumberExpr) || !_this3.bodyExpr || _this3.bodyExpr instanceof MissingExpression) {
                    Animate.blink(_this3.timesExpr, 1000, [1.0, 0.0, 0.0]);
                    _this3._animating = false;
                    return Promise.reject("RepeatLoopExpr incomplete!");
                }

                if (num.number <= 0) {
                    Animate.poof(_this3);
                    (_this3.parent || _this3.stage).swap(_this3, null);
                    return null;
                }

                var seqClass = ExprManager.getClass('sequence');
                var body = [];
                for (var i = 0; i < num.number; i++) {
                    body.push(_this3.bodyExpr.clone());
                }
                var result = new (Function.prototype.bind.apply(seqClass, [null].concat(body)))();
                result.lockSubexpressions();
                result.update();
                (_this3.parent || _this3.stage).swap(_this3, result);
                return result;
            });
        }
    }, {
        key: "onmouseclick",
        value: function onmouseclick() {
            if (!this._animating) {
                this.performReduction();
            }
        }
    }, {
        key: "timesExpr",
        get: function get() {
            return this.holes[0];
        },
        set: function set(expr) {
            this.holes[0] = expr;
        }
    }, {
        key: "bodyExpr",
        get: function get() {
            return this.holes[1];
        },
        set: function set(expr) {
            this.holes[1] = expr;
        }
    }, {
        key: "size",
        get: function get() {
            var padding = this.padding;
            var width = 0;
            var height = 50;
            var sizes = this.getHoleSizes();
            var scale_x = this.scale.x;

            sizes.forEach(function (s) {
                height = Math.max(height, s.h);
                width += s.w + padding.inner;
            });
            width += padding.right;
            height += padding.inner;
            return { w: width, h: height };
        }
    }]);

    return RepeatLoopExpr;
}(Expression);

function drawPointsAround(ctx, centerX, centerY, points, rotation) {
    ctx.beginPath();
    var first = true;
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = points[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var _step$value = _slicedToArray(_step.value, 2);

            var x = _step$value[0];
            var y = _step$value[1];

            var tx = centerX + x * Math.cos(rotation) - y * Math.sin(rotation);
            var ty = centerY + x * Math.sin(rotation) + y * Math.cos(rotation);
            if (first) {
                ctx.moveTo(tx, ty);
                first = false;
            } else {
                ctx.lineTo(tx, ty);
            }
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

    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}