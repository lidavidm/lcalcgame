'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ImageRect = function (_Rect) {
    _inherits(ImageRect, _Rect);

    function ImageRect(x, y, w, h, resource_key) {
        _classCallCheck(this, ImageRect);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ImageRect).call(this, x, y, w, h));

        _this.image = resource_key;
        _this._offset = { x: 0, y: 0 };
        return _this;
    }

    _createClass(ImageRect, [{
        key: 'drawInternal',
        value: function drawInternal(pos, boundingSize) {
            if (!this.ctx || !this.image) {
                console.error('@ ImageRect: Cannot draw image ', this.image, ' in context ', this.ctx);
                return;
            }
            this.ctx.drawImage(Resource.getImage(this.image), pos.x + this._offset.x, pos.y + this._offset.y, boundingSize.w, boundingSize.h);
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
}(Rect);