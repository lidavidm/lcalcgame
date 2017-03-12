'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ApplyExpr = function (_Expression) {
    _inherits(ApplyExpr, _Expression);

    function ApplyExpr(exprToApply, lambdaExpr) {
        _classCallCheck(this, ApplyExpr);

        var _this = _possibleConstructorReturn(this, (ApplyExpr.__proto__ || Object.getPrototypeOf(ApplyExpr)).call(this, [exprToApply, lambdaExpr]));

        _this.lambdaExpr.pos = { x: 0, y: 0 };
        _this.exprToApply.pos = addPos(_this.lambdaExpr.pos, { x: -exprToApply.size.w, y: -exprToApply.size.h / 2 });

        _this.shadowOffset = 4;
        _this.color = '#ddd';

        _this.exprToApply.lock();

        var arrow = new ImageExpr(0, 0, 97 / 1.6, 60 / 1.6, 'apply-arrow');
        arrow.lock();
        _this.arrow = arrow;
        return _this;
    }

    _createClass(ApplyExpr, [{
        key: 'hitsChild',
        value: function hitsChild() {
            return null;
        }
    }, {
        key: 'drawInternalAfterChildren',
        value: function drawInternalAfterChildren(ctx, pos, boundingSize) {
            this.arrow.parent = this;
            this.arrow.pos = { x: this.exprToApply.pos.x + this.exprToApply.size.w / 2, y: -8 };
            this.arrow.draw(ctx);
        }

        //update() { }

    }, {
        key: 'constructorArgs',
        get: function get() {
            return [this.exprToApply.clone(), this.lambdaExpr.clone()];
        }
    }, {
        key: 'exprToApply',
        get: function get() {
            return this.children[0];
        }
    }, {
        key: 'lambdaExpr',
        get: function get() {
            return this.children[1];
        }
    }]);

    return ApplyExpr;
}(Expression);