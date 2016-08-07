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
