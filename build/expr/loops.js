'use strict';

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

        var _this = _possibleConstructorReturn(this, (RepeatLoopExpr.__proto__ || Object.getPrototypeOf(RepeatLoopExpr)).call(this, [times, body]));

        _this.markerAngle = 0;
        _this.drawMarker = false;
        return _this;
    }

    // draw(ctx) {
    // }

    _createClass(RepeatLoopExpr, [{
        key: 'update',
        value: function update() {
            _get(RepeatLoopExpr.prototype.__proto__ || Object.getPrototypeOf(RepeatLoopExpr.prototype), 'update', this).call(this);
            var centerX = this.size.w / 2;
            var centerY = this.size.h / 2;
            var innerR = 0.1 * this.size.h / 2;
            if (this.timesExpr) {
                this.timesExpr.pos = {
                    x: centerX - this.timesExpr.size.w * this.timesExpr.scale.x - innerR,
                    y: centerY
                };
            }
            if (this.bodyExpr) {
                this.bodyExpr.pos = {
                    x: centerX + innerR,
                    y: centerY
                };
            }
        }
    }, {
        key: 'drawInternal',
        value: function drawInternal(ctx, pos, boundingSize) {
            _get(RepeatLoopExpr.prototype.__proto__ || Object.getPrototypeOf(RepeatLoopExpr.prototype), 'drawInternal', this).call(this, ctx, pos, boundingSize);

            var centerX = pos.x + boundingSize.w / 2;
            var centerY = pos.y + boundingSize.h / 2;
            var outerR = 0.9 * boundingSize.h / 2;

            ctx.lineWidth = 1.0;
            ctx.beginPath();
            if (this.timesExpr && this.timesExpr.number && this.timesExpr.number > 0 || this.drawMarker) {
                ctx.strokeStyle = 'blue';
                // this.timesExpr.stroke = this.bodyExpr.stroke = {
                //     color: 'blue',
                //     width: 2,
                // };
            }
            // else if (this.timesExpr && this.timesExpr.isValue()) {
            // }
            else {
                    ctx.strokeStyle = 'black';
                }
            ctx.arc(centerX, centerY, outerR, 0, Math.PI * 2);
            ctx.closePath();
            ctx.stroke();

            // draw the arrows
            var dy = Math.abs(this.timesExpr.absolutePos.y + this.timesExpr.absoluteSize.h / 2 - centerY);
            var lowerTipAngle = Math.PI - Math.asin(dy / outerR);
            drawArrowOnArc(ctx, lowerTipAngle, -Math.PI / 8, centerX, centerY, outerR);

            dy = Math.abs(this.bodyExpr.absolutePos.y - this.bodyExpr.absoluteSize.h / 2 - centerY);
            var upperTipAngle = -Math.asin(dy / outerR);
            drawArrowOnArc(ctx, upperTipAngle, -Math.PI / 8, centerX, centerY, outerR);

            if (this.drawMarker) {
                ctx.strokeStyle = 'blue';
                ctx.fillStyle = 'blue';

                ctx.beginPath();
                var _dy = Math.abs(this.timesExpr.absolutePos.y - this.timesExpr.absoluteSize.h / 2 - centerY);
                var startAngle = Math.asin(_dy / outerR) - Math.PI;
                _dy = Math.abs(this.bodyExpr.absolutePos.y - this.bodyExpr.absoluteSize.h / 2 - centerY);
                var endAngle = -Math.asin(_dy / outerR);
                var markerAngle = startAngle + this.markerAngle * (endAngle - startAngle);
                ctx.arc(centerX + outerR * Math.cos(markerAngle), centerY + outerR * Math.sin(markerAngle), 0.1 * outerR, 0, Math.PI * 2);
                ctx.stroke();
                ctx.fill();
            }
        }
    }, {
        key: 'animateNumber',
        value: function animateNumber() {
            var _this2 = this;

            return new Promise(function (resolve, reject) {
                _this2.drawMarker = true;
                _this2.markerAngle = 0.0;
                _this2.swap(_this2.timesExpr, new NumberExpr(_this2.timesExpr.number - 1));
                _this2.timesExpr.lock();

                Animate.tween(_this2, {
                    markerAngle: 1.0
                }, 500).after(function () {
                    _this2.drawMarker = false;
                    resolve();
                });
            });
        }
    }, {
        key: 'performReduction',
        value: function performReduction() {
            var _this3 = this;

            this._animating = true;

            return this.performSubReduction(this.timesExpr).then(function (num) {
                if (!(num instanceof NumberExpr) || !_this3.bodyExpr || _this3.bodyExpr instanceof MissingExpression) {
                    _this3._animating = false;
                    return Promise.reject("RepeatLoopExpr incomplete!");
                }
                var body = _this3.bodyExpr.clone();

                var nextStep = function nextStep() {
                    if (_this3.timesExpr.number > 0) {
                        return _this3.animateNumber().then(function () {
                            return _this3.performSubReduction(_this3.bodyExpr).then(function () {
                                _this3.holes[1] = body.clone();
                                _this3.holes[1].parent = _this3;
                                _this3.holes[1].stage = _this3.stage;
                                _this3.update();

                                return new Promise(function (resolve, reject) {
                                    window.setTimeout(function () {
                                        var r = nextStep();
                                        if (r instanceof Promise) r.then(resolve, reject);else resolve(r);
                                    }, 500);
                                });
                            });
                        });
                    } else {
                        Animate.poof(_this3);
                        (_this3.parent || _this3.stage).swap(_this3, null);
                        return null;
                    }
                };
                return nextStep();
            });
        }
    }, {
        key: 'onmouseclick',
        value: function onmouseclick() {
            if (!this._animating) {
                this.performReduction();
            }
        }
    }, {
        key: 'timesExpr',
        get: function get() {
            return this.holes[0];
        }
    }, {
        key: 'bodyExpr',
        get: function get() {
            return this.holes[1];
        }
    }, {
        key: 'size',
        get: function get() {
            var subSize = this.timesExpr.size;
            return {
                w: subSize.w * 2.25,
                h: subSize.h * 1.5
            };
        }
    }]);

    return RepeatLoopExpr;
}(Expression);

function drawArrowOnArc(ctx, tipAngle, deltaAngle, centerX, centerY, radius) {
    var baseAngle = tipAngle + deltaAngle;
    ctx.beginPath();
    ctx.moveTo(centerX + 0.9 * radius * Math.cos(baseAngle), centerY + 0.9 * radius * Math.sin(baseAngle));
    ctx.lineTo(centerX + 1.1 * radius * Math.cos(baseAngle), centerY + 1.1 * radius * Math.sin(baseAngle));
    ctx.lineTo(centerX + radius * Math.cos(tipAngle), centerY + radius * Math.sin(tipAngle));
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
}