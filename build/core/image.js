'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var mag = function (_) {
    var ImageRect = function (_$Rect) {
        _inherits(ImageRect, _$Rect);

        function ImageRect(x, y, w, h, resource_key) {
            _classCallCheck(this, ImageRect);

            var _this = _possibleConstructorReturn(this, (ImageRect.__proto__ || Object.getPrototypeOf(ImageRect)).call(this, x, y, w, h));

            _this.image = resource_key;
            _this._offset = { x: 0, y: 0 };
            return _this;
        }

        _createClass(ImageRect, [{
            key: 'drawInternal',
            value: function drawInternal(ctx, pos, boundingSize) {
                if (!ctx || !this.image) {
                    console.error('@ ImageRect: Cannot draw image ', this.image, ' in context ', ctx);
                    return;
                }
                var ri = Resource.getImage(this.image);
                if (!ri) {
                    console.error('@ ImageRect: Cannot find resource image named ', this.image);
                    return;
                }
                ctx.drawImage(ri, pos.x + this._offset.x, pos.y + this._offset.y, boundingSize.w, boundingSize.h);
            }
        }, {
            key: 'offset',
            get: function get() {
                return { x: this._offset.x, y: this._offset.y };
            },
            set: function set(o) {
                this._offset = { x: o.x, y: o.y };
            }
        }]);

        return ImageRect;
    }(_.Rect);

    var PatternRect = function (_ImageRect) {
        _inherits(PatternRect, _ImageRect);

        function PatternRect() {
            _classCallCheck(this, PatternRect);

            return _possibleConstructorReturn(this, (PatternRect.__proto__ || Object.getPrototypeOf(PatternRect)).apply(this, arguments));
        }

        _createClass(PatternRect, [{
            key: 'drawInternal',
            value: function drawInternal(ctx, pos, boundingSize) {
                if (!ctx || !this.image) return;
                ctx.save();
                var ptrn = ctx.createPattern(Resource.getImage(this.image), 'repeat');
                ctx.fillStyle = ptrn;
                ctx.fillRect(pos.x + this._offset.x, pos.y + this._offset.y, boundingSize.w, boundingSize.h);
                ctx.restore();
            }
        }]);

        return PatternRect;
    }(ImageRect);

    var Button = function (_ImageRect2) {
        _inherits(Button, _ImageRect2);

        function Button(x, y, w, h, resource_map, onclick) {
            _classCallCheck(this, Button);

            var _this3 = _possibleConstructorReturn(this, (Button.__proto__ || Object.getPrototypeOf(Button)).call(this, x, y, w, h, resource_map.default));
            // where resource_map properties are:
            //  { default, hover (optional), down (opt.) }


            _this3.images = resource_map;
            _this3.clickFunc = onclick;
            return _this3;
        }

        _createClass(Button, [{
            key: 'onmouseenter',
            value: function onmouseenter(pos) {
                if ('hover' in this.images) this.image = this.images.hover;
            }
        }, {
            key: 'onmouseleave',
            value: function onmouseleave(pos) {
                this.image = this.images.default;
            }
        }, {
            key: 'onmousedown',
            value: function onmousedown(pos) {
                if ('down' in this.images) this.image = this.images.down;
            }
        }, {
            key: 'onmouseup',
            value: function onmouseup(pos) {
                this.image = this.images.default;
                if (this.clickFunc) this.clickFunc();
            }
        }]);

        return Button;
    }(ImageRect);

    _.ImageRect = ImageRect;
    _.PatternRect = PatternRect;
    _.Button = Button;
    return _;
}(mag || {});