 
 

class ImageRect extends Rect {
    constructor(x, y, w, h, resource_key) {
        super(x,y,w,h);
        this.image = resource_key;
        this._offset = { x:0, y:0 };
    }
    get offset() { return { x:this._offset.x, y:this._offset.y }; }
    set offset(o) { this._offset = { x:o.x, y:o.y }; }
    drawInternal(pos, boundingSize) {
        if (!this.ctx || !this.image) {
            console.error('@ ImageRect: Cannot draw image ', this.image, ' in context ', this.ctx);
            return;
        }
        this.ctx.drawImage(Resource.getImage(this.image), pos.x + this._offset.x, pos.y + this._offset.y, boundingSize.w, boundingSize.h);
    }
}

class PatternRect extends ImageRect {
    drawInternal(pos, boundingSize) {
        if (!this.ctx || !this.image) return;
        this.ctx.save();
        var ptrn = this.ctx.createPattern( Resource.getImage(this.image), 'repeat' );
        this.ctx.fillStyle = ptrn;
        this.ctx.fillRect(pos.x + this._offset.x, pos.y + this._offset.y, boundingSize.w, boundingSize.h);
        this.ctx.restore();
    }
}

class Button extends ImageRect {
    constructor(x, y, w, h, resource_map, onclick) {
        // where resource_map properties are:
        //  { default, hover (optional), down (opt.) }
        super(x, y, w, h, resource_map.default);
        this.images = resource_map;
        this.clickFunc = onclick;
    }
    onmouseenter(pos) {
        if ('hover' in this.images)
            this.image = this.images.hover;
    }
    onmouseleave(pos) {
        this.image = this.images.default;
    }
    onmousedown(pos) {
        if ('down' in this.images)
            this.image = this.images.down;
    }
    onmouseup(pos) {
        this.image = this.images.default;
        if (this.clickFunc) this.clickFunc();
    }
}
