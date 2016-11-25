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

        _this.rotationAngle = 0;
        return _this;
    }

    // draw(ctx) {
    // }

    _createClass(RepeatLoopExpr, [{
        key: 'drawInternal',
        value: function drawInternal(ctx, pos, boundingSize) {
            _get(RepeatLoopExpr.prototype.__proto__ || Object.getPrototypeOf(RepeatLoopExpr.prototype), 'drawInternal', this).call(this, ctx, pos, boundingSize);

            var centerX = pos.x + boundingSize.w / 2;
            var centerY = pos.y + boundingSize.h / 2;
            var outerR = 0.9 * boundingSize.h / 2;
            var innerR = 0.1 * boundingSize.h / 2;

            ctx.beginPath();
            ctx.strokeStyle = 'black';
            ctx.arc(centerX, centerY, outerR, 0, Math.PI * 2);
            ctx.closePath();
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(centerX, centerY, innerR, 0, Math.PI * 2);
            ctx.stroke();

            var spokes = 24;
            ctx.lineWidth = 1.0;
            for (var i = 0; i < spokes; i++) {
                var theta = i * 2 * Math.PI / spokes + this.rotationAngle;
                ctx.moveTo(centerX + innerR * Math.cos(theta), centerY + innerR * Math.sin(theta));
                ctx.lineTo(centerX + outerR * Math.cos(theta), centerY + outerR * Math.sin(theta));
                ctx.stroke();
            }
        }
    }, {
        key: 'performReduction',
        value: function performReduction() {
            var _this2 = this;

            this._animating = true;

            var working = false;
            var stopped = false;
            var rotate = function rotate() {
                if (working) _this2.rotationAngle += Math.PI / 3 / 60.0;
                _this2.stage.draw();
                if (!stopped) window.requestAnimationFrame(rotate);
            };
            rotate();

            this.performSubReduction(this.timesExpr).then(function () {
                var body = _this2.bodyExpr.clone();
                var times = _this2.timesExpr.number;

                var nextStep = function nextStep() {
                    if (times > 0) {
                        working = true;
                        _this2.performSubReduction(_this2.bodyExpr).then(function () {
                            working = false;

                            _this2.swap(_this2.timesExpr, new NumberExpr(--times));
                            _this2.timesExpr.lock();

                            _this2.holes[1] = body.clone();
                            _this2.holes[1].parent = _this2;
                            _this2.holes[1].stage = _this2.stage;
                            _this2.update();

                            window.setTimeout(function () {
                                nextStep();
                            }, 500);
                        });
                    } else {
                        stopped = true;
                        Animate.poof(_this2);
                        (_this2.parent || _this2.stage).swap(_this2, null);
                    }
                };
                nextStep();
            });
        }
    }, {
        key: 'onmouseclick',
        value: function onmouseclick() {
            this.performReduction();
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
                h: subSize.h * 2
            };
        }
    }]);

    return RepeatLoopExpr;
}(Expression);