class ExpressionEffect extends RoundedRect {}
class ShatterExpressionEffect extends ExpressionEffect {
    constructor(roundRectToShatter) {
        let size = roundRectToShatter.absoluteSize;
        let pos = roundRectToShatter.upperLeftPos(roundRectToShatter.absolutePos, size);
        //size.w -= 75;
        super(pos.x + size.w/2.0, pos.y + size.h/2.0, size.w, size.h, roundRectToShatter.radius);
        this.size = size;

        this.opacity = 0.0;
        this.stroke = { color:'white', lineWidth:3 };
        this.color = 'white';
        this._effectParent = roundRectToShatter;

        var _this = this;
        this.run = (stage, afterFadeCb, afterShatterCb) => {
            _this.anchor = { x:0.5, y:0.5 };
            _this.fadeCb = afterFadeCb;
            _this.shatterCb = afterShatterCb;
            stage.add(_this);
            _this.fadeIn()
                .then(_this.shatter.bind(this))
                .then(() => {

                    // Removes self after completion.
                    let stage = (_this.parent || _this.stage);
                    stage.remove(_this);
                    stage.update();
                    stage.draw();

            })
        }
    }
    get constructorArgs() { return [this._effectParent.clone()]; }

    fadeIn() {
        var _this = this;
        this.opacity = 0.0;
        return new Promise(function(resolve, reject) {
            Animate.tween(_this, { 'opacity':1.0 }, 400, (elapsed) => Math.pow(elapsed, 0.4)).after(() => {
                if (_this.fadeCb) _this.fadeCb();
                resolve();
            });
            Resource.play('heatup');
        });
    }
    shatter() {
        var _this = this;
        _this.stroke = { color:'white', lineWidth:3 };
        return new Promise(function(resolve, reject) {
            Animate.tween(_this, { 'opacity':0.0, 'scale':{x:1.2, y:1.4} }, 300, (elapsed) => Math.pow(elapsed, 0.4)).after(() => {
                if (_this.shatterCb) _this.shatterCb();
                resolve();
            });
            Resource.play('shatter');
        });
    }

    toString() {
        return '';
    }
}
