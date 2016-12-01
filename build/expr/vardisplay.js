'use strict';

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// Display variants need to not be subclasses to not confuse the fader
var DisplayChest = function (_Expression) {
    _inherits(DisplayChest, _Expression);

    function DisplayChest(name, expr) {
        _classCallCheck(this, DisplayChest);

        var _this = _possibleConstructorReturn(this, (DisplayChest.__proto__ || Object.getPrototypeOf(DisplayChest)).call(this, [expr]));

        _this.name = name;
        _this.childPos = _this.origChildPos = { x: 5, y: 5 };

        if (!expr) return _possibleConstructorReturn(_this);
        expr.ignoreEvents = true;
        expr.scale = { x: 0.6, y: 0.6 };
        expr.anchor = { x: 0.5, y: 0.5 };
        return _this;
    }

    _createClass(DisplayChest, [{
        key: 'open',
        value: function open() {}
    }, {
        key: 'close',
        value: function close() {}
    }, {
        key: 'setExpr',
        value: function setExpr(expr) {
            this.holes[0] = expr;
            expr.ignoreEvents = true;
            expr.scale = { x: 0.6, y: 0.6 };
            expr.anchor = { x: 0.5, y: 0.5 };
            expr.pos = { x: 0, y: 0 };
            this.update();
        }
    }, {
        key: 'getExpr',
        value: function getExpr() {
            return this.holes[0];
        }
    }, {
        key: 'performReduction',
        value: function performReduction() {}
    }, {
        key: 'prepareAssign',
        value: function prepareAssign() {
            var _this2 = this;

            var target = {
                childPos: {
                    x: 10,
                    y: -200
                }
            };
            return Animate.tween(this, target, 600).after(function () {
                _this2.childPos = { x: _this2.origChildPos.x, y: _this2.origChildPos.y };
            });
        }
    }, {
        key: 'drawInternal',
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
        key: 'drawInternalAfterChildren',
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

        var _this3 = _possibleConstructorReturn(this, (LabeledDisplayChest.__proto__ || Object.getPrototypeOf(LabeledDisplayChest)).call(this, name, expr));

        _this3.childPos = _this3.origChildPos = { x: 20, y: 5 };
        _this3.label = new TextExpr(name);
        _this3.label.color = 'white';
        _this3.holes.push(_this3.label);
        return _this3;
    }

    _createClass(LabeledDisplayChest, [{
        key: 'update',
        value: function update() {
            _get(LabeledDisplayChest.prototype.__proto__ || Object.getPrototypeOf(LabeledDisplayChest.prototype), 'update', this).call(this);
            var expr = this.getExpr();

            this.label.pos = {
                x: this.childPos.x + expr.size.w / 2 * expr.scale.x - this.label.size.w / 2,
                y: this.size.h / 2
            };
        }
    }, {
        key: 'draw',
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

var LabeledDisplay = function (_Expression2) {
    _inherits(LabeledDisplay, _Expression2);

    function LabeledDisplay(name, expr) {
        _classCallCheck(this, LabeledDisplay);

        var _this4 = _possibleConstructorReturn(this, (LabeledDisplay.__proto__ || Object.getPrototypeOf(LabeledDisplay)).call(this, []));

        _this4.name = name;
        _this4.nameLabel = new TextExpr(name);
        _this4.nameLabel.color = 'black';
        _this4.equals = new TextExpr("=");
        _this4.equals.color = 'black';
        _this4.value = expr;
        _this4.addArg(_this4.nameLabel);
        _this4.addArg(_this4.equals);
        _this4.addArg(_this4.value);
        _this4.setExpr(expr);
        _this4.origValue = null;
        return _this4;
    }

    _createClass(LabeledDisplay, [{
        key: 'open',
        value: function open(preview) {
            if (!this.origValue) {
                this.origValue = this.value;
                this.setExpr(preview);
            }
        }
    }, {
        key: 'close',
        value: function close() {
            if (this.origValue) {
                this.setExpr(this.origValue);
                this.origValue = null;
            }
        }
    }, {
        key: 'getExpr',
        value: function getExpr() {
            if (this.origValue) {
                return this.origValue;
            }
            return this.holes[2];
        }
    }, {
        key: 'setExpr',
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
        key: 'drawInternal',
        value: function drawInternal(ctx, pos, boundingSize) {}
    }]);

    return LabeledDisplay;
}(Expression);

var SpreadsheetDisplay = function (_Expression3) {
    _inherits(SpreadsheetDisplay, _Expression3);

    function SpreadsheetDisplay(name, expr) {
        _classCallCheck(this, SpreadsheetDisplay);

        var _this5 = _possibleConstructorReturn(this, (SpreadsheetDisplay.__proto__ || Object.getPrototypeOf(SpreadsheetDisplay)).call(this, []));

        _this5.name = name;
        _this5.nameLabel = new TextExpr(name);
        _this5.nameLabel.color = 'black';
        _this5.value = expr;
        _this5.addArg(_this5.nameLabel);
        _this5.addArg(_this5.value);
        _this5.setExpr(expr);
        _this5.origValue = null;

        _this5._fixedSize = { w: 0, h: 0 };
        _this5.valuePos = 0;
        return _this5;
    }

    _createClass(SpreadsheetDisplay, [{
        key: 'update',
        value: function update() {
            _get(SpreadsheetDisplay.prototype.__proto__ || Object.getPrototypeOf(SpreadsheetDisplay.prototype), 'update', this).call(this);
            this.holes[1].pos = {
                x: this.valuePos + 10,
                y: this.holes[1].pos.y
            };
        }
    }, {
        key: 'open',
        value: function open(preview) {
            if (!this.origValue) {
                this.origValue = this.value;
                this.setExpr(preview);
            }
        }
    }, {
        key: 'close',
        value: function close() {
            if (this.origValue) {
                this.setExpr(this.origValue);
                this.origValue = null;
            }
        }
    }, {
        key: 'getExpr',
        value: function getExpr() {
            if (this.origValue) {
                return this.origValue;
            }
            return this.holes[1];
        }
    }, {
        key: 'setExpr',
        value: function setExpr(expr) {
            expr.pos = { x: 0, y: 0 };
            this.holes[1] = expr;
            expr.scale = { x: 1.0, y: 1.0 };
            expr.anchor = { x: 0, y: 0.5 };
            expr.stroke = null;
            expr.ignoreEvents = true;
            expr.parent = this;
            this.value = expr;
            this.update();
        }
    }, {
        key: 'drawInternal',
        value: function drawInternal(ctx, pos, boundingSize) {}
    }]);

    return SpreadsheetDisplay;
}(Expression);