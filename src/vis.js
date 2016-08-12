class Node {
    constructor(x, y) {
        this._pos = { x:x, y:y };
        this.children = [];
        this.parent = null;
        this._stage = null;
        this._ctx = null;
        this.ignoreEvents = false;
    }
    get stage() { if(!this._stage && this.parent) return this.parent.stage; else return this._stage; }
    set stage(stg) { this._stage = stg; }
    get ctx() { return this._ctx; }
    get pos() { return { x:this._pos.x, y:this._pos.y }; }
    get absolutePos() {
        var pos = this.pos;
        if (this.parent) return addPos(pos, this.parent.absolutePos);
        else             return pos;
    }
    set pos(p) { this._pos = p; }
    set ctx(c) {
        this._ctx = c;
        for (let child of this.children)
            child.ctx = c;
    }
    addChild(child) {
        this.children.push(child);
        if (child) {
            child.parent = this;
            child.ctx = this.ctx;
        }
    }
    addChildAt(idx, child) {
        if (idx < 0 || idx >= this.children.count) {
            console.error('@ Node.addChildAt: Index out of range.');
            return;
        }
        this.children.splice(idx, 0, child);
        child.parent = this;
        child.ctx = this.ctx;
    }
    removeChild(node) {
        var i = this.children.indexOf(node);
        if (i > -1) {
            this.children[i].ctx = null;
            this.children[i].stage = null;
            this.children.splice(i, 1);
        }
    }
    addAll(children) {
        children.forEach((child) => this.addChild(child));
    }
    removeAll(children) {
        children.forEach((child) => this.removeChild(child));
    }
    posWithOffset(offset) {
        if (typeof offset === 'undefined') return this.pos;
        else return shiftPos(this.pos, offset);
    }
    update() { }
    draw(offset) {
        var pos = this.posWithOffset(offset);
        this.drawInternal(pos);
        this.children.forEach((child) => child.draw(pos));
    }
    drawInternal(pos) { }

    // Events
    hits(pos, options={}) { return null; } // Whether the given position lies 'inside' this node. Returns the node that it hits (could be child).
    hitsChild(pos) { return null; }
    onmousedown(pos) { }
    onmousedrag(pos) { }
    onmouseclick(pos) { }
    onmousehover(pos) { }
    onmouseenter(pos) { }
    onmouseleave(pos) { }
    onmouseup(pos) { }

    // Drag 'n' drop
    ondropenter(node, pos) { }
    ondropped(node, pos) { }
    ondropexit(node, pos) { }

    // Name of class
    value() {
        return this.constructor.name;
    }

    // Generic clone function.
    get constructorArgs() { return null; }
    clone(parent=null) {
        var ins = constructClassInstance(this.constructor, this.constructorArgs);
        //console.warn('Cloning', this.constructor);
        for (const key of Object.keys(this)) {
            let v = this[key];
            if (v && v instanceof Object) {
                if ('x' in v && 'y' in v) v = { x:v.x, y:v.y };
                else if ('w' in v && 'h' in v) v = { w:v.w, h:v.h };
                else if ('color' in v && 'lineWidth' in v) v = { color:v.color, lineWidth:v.lineWidth };
            }
            ins[key] = v;
            //console.warn('Cloning', key, v);
        }
        ins.parent = parent;
        ins.children = ins.children.map((child) => child.clone(this));
        return ins;
    }

    // 'Equality.'
    equals(otherNode) {
        if (!otherNode || !otherNode.constructor) return false;
        else return this.constructor.name === otherNode.constructor.name;
    }
}

class Rect extends Node {
    constructor(x, y, w, h) {
        super(x, y);
        this._size = { w:w, h:h };
        this._anchor = { x:0, y:0 };
        this._scale = { x:1, y:1 };
        this._color = "lightgray";
        this._highlightColor = 'yellow';
        this.stroke = null;
        this.shadowOffset = 2;
    }
    get highlightColor() { return this._highlightColor; }
    set highlightColor(clr) { this._highlightColor = clr; }
    get absolutePos() {
        var pos = this.pos;
        if (this.parent) {
            let abs_scale = this.parent.absoluteScale;
            return addPos( {x:pos.x*abs_scale.x,
                            y:pos.y*abs_scale.y},
                            this.parent.upperLeftPos( this.parent.absolutePos , this.parent.absoluteSize ));
        }
        else return pos;
    }
    get absoluteScale() {
        if (this.parent) return multiplyPos( this.scale, this.parent.absoluteScale );
        else             return this.scale;
    }
    get absoluteSize() {
        var size = this.size;
        var scale = this.absoluteScale;
        return { w:size.w*scale.x, h:size.h*scale.y };
    }
    get absoluteBounds() {
        var pos = this.absolutePos;
        var size = this.absoluteSize;
        return { x:pos.x, y:pos.y, w:size.w, h:size.h };
    }
    get color() { return this._color; }
    get size() { return { w:this._size.w, h:this._size.h }; }
    get anchor() { return { x:this._anchor.x, y:this._anchor.y }; }
    get scale() { return { x:this._scale.x, y:this._scale.y }; }
    set size(sz) { this._size = sz; }
    set anchor(anch) { this._anchor = anch; }
    set scale(sc) { this._scale = sc; }
    set color(clr) { this._color = clr; }
    upperLeftPos(pos, boundingSize) {
        return { x:pos.x - this.anchor.x*boundingSize.w, y:pos.y - this.anchor.y*boundingSize.h };
    }
    centerPos() {
        let sz = this.absoluteSize;
        let pt = this.absolutePos;
        let left = this.upperLeftPos( pt, sz );
        return { x:left.x + sz.w * 0.5, y:left.y + sz.h * 0.5 };
    }
    posOnRectAt(unitPos) { // Given unit pos like 0, 1, returns position relative to Rect's this.pos and this.anchor properties.
        let sz = { w:this._size.w * this._scale.x, h:this._size.h * this._scale.y };
        let pt = this.upperLeftPos( this._pos, sz );
        let offset = { x:unitPos.x * sz.w, y:unitPos.y * sz.h };
        return addPos(pt, offset);
    }
    draw() {
        if (!this.ctx) return;
        this.ctx.save();
        if (this.opacity && this.opacity < 1.0) {
            this.ctx.globalAlpha = this.opacity;
        }
        var boundingSize = this.absoluteSize;
        var upperLeftPos = this.upperLeftPos(this.absolutePos, boundingSize);
        if (this._color || this.stroke) this.drawInternal(upperLeftPos, boundingSize);
        this.children.forEach((child) => {
            child.parent = this;
            child.draw();
        });
        if (this._color || this.stroke) this.drawInternalAfterChildren(upperLeftPos, boundingSize);
        this.ctx.restore();
    }
    drawInternal(pos, boundingSize) {
        setStrokeStyle(this.ctx, this.stroke);
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(pos.x, pos.y, boundingSize.w, boundingSize.h+this.shadowOffset);
        if(this.stroke) this.ctx.strokeRect(pos.x, pos.y, boundingSize.w, boundingSize.h+this.shadowOffset);
        this.ctx.fillStyle = this.color;
        this.ctx.fillRect(pos.x, pos.y, boundingSize.w, boundingSize.h);
        if(this.stroke) this.ctx.strokeRect(pos.x, pos.y, boundingSize.w, boundingSize.h);
    }
    drawInternalAfterChildren(pos, boundingSize) { }

    // Events
    hits(pos, options) {
        if (this.ignoreEvents) return null; // All children are ignored as well.

        if (typeof options !== 'undefined' && options.hasOwnProperty('exclude')) {
            for(let e of options.exclude) {
                if (e == this) return null;
            }
            //console.log('excluding ', this);
            //return null; // skip excluded nodes
        }

        var hitChild = this.hitsChild(pos, options);
        if (hitChild) return hitChild;

        // Hasn't hit any children, so test if the point lies on this node.
        var boundingSize = this.absoluteSize;
        var upperLeftPos = this.upperLeftPos(this.absolutePos, boundingSize);
        if (pointInRect(pos, rectFromPosAndSize(upperLeftPos, boundingSize) )) return this;
        else return null;
    }
    hitsChild(pos, options) {
        // Depth-first hit test.
        if (this.children && this.children.length > 0) {
            var hitChild = null;
            for (let child of this.children) {
                hitChild = child.hits(pos, options);
                if (hitChild) break;
            }
            if (hitChild) return hitChild;
        }
        return null;
    }
    onmousedown(pos) { }
    onmousedrag(pos) {
        //this.pos = pos;
    }
    onmouseenter(pos) {
        this.stroke = { color:this.highlightColor, lineWidth:2 };
    }
    onmouseleave(pos) {
        this.stroke = null;
    }
    onmouseup(pos) { }
}

class RoundedRect extends Rect {
    constructor(x, y, w, h, rad=6) {
        super(x, y, w, h);
        this.radius = rad;
    }
    drawInternal(pos, boundingSize) {
        //console.log('drawing with color: ', this.color, boundingSize);
        this.ctx.fillStyle = 'black';
        setStrokeStyle(this.ctx, this.stroke);
        if (this.shadowOffset !== 0) {
            roundRect(this.ctx,
                      pos.x, pos.y+this.shadowOffset,
                      boundingSize.w, boundingSize.h,
                      this.radius*this.absoluteScale.x, true, this.stroke ? true : false); // just fill for now
        }
        this.ctx.fillStyle = this.color;
        roundRect(this.ctx,
                  pos.x, pos.y,
                  boundingSize.w, boundingSize.h,
                  this.radius*this.absoluteScale.x, true, this.stroke ? true : false); // just fill for now
    }
}

class HexaRect extends Rect {
    constructor(x, y, w, h) {
        super(x, y, w, h);
    }
    drawInternal(pos, boundingSize) {
        this.ctx.fillStyle = 'black';
        setStrokeStyle(this.ctx, this.stroke);
        if (this.shadowOffset !== 0) {
            hexaRect(this.ctx,
                      pos.x, pos.y+this.shadowOffset,
                      boundingSize.w, boundingSize.h,
                      true, this.stroke ? true : false); // just fill for now
        }
        this.ctx.fillStyle = this.color;
        hexaRect(this.ctx,
                  pos.x, pos.y,
                  boundingSize.w, boundingSize.h,
                  true, this.stroke ? true : false); // just fill for now
    }
}

class Star extends Rect {
    constructor(x, y, rad, points=5) {
        super(x, y, rad*2, rad*2);
        this.starPoints = points;
    }
    drawInternal(pos, boundingSize) {
        drawStar(this.ctx, pos.x+boundingSize.w/2, pos.y+boundingSize.h/2+this.shadowOffset,
                 this.starPoints, boundingSize.w / 2, boundingSize.w / 4,
                 this.stroke, 'black');
        drawStar(this.ctx, pos.x+boundingSize.w/2, pos.y+boundingSize.h/2,
                 this.starPoints, boundingSize.w / 2, boundingSize.w / 4,
                 this.stroke, this.color);
    }
}

class Triangle extends Rect {
    drawInternal(pos, boundingSize) {
        var ctx = this.ctx;
        setStrokeStyle(ctx, this.stroke);
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.moveTo(pos.x,pos.y+boundingSize.h+this.shadowOffset);
        ctx.lineTo(pos.x+boundingSize.w,pos.y+boundingSize.h+this.shadowOffset);
        ctx.lineTo(pos.x+boundingSize.w/2.0,pos.y+this.shadowOffset);
        ctx.closePath();
        ctx.fill();
        if (this.stroke) ctx.stroke();
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(pos.x,pos.y+boundingSize.h);
        ctx.lineTo(pos.x+boundingSize.w,pos.y+boundingSize.h);
        ctx.lineTo(pos.x+boundingSize.w/2.0,pos.y);
        ctx.closePath();
        ctx.fill();
        if (this.stroke) ctx.stroke();
    }
}

class Circle extends Rect {
    constructor(x, y, rad) {
        super(x, y, rad*2, rad*2);
        this._radius = rad;
        this.clipChildren = false;
    }
    get size() { return super.size; }
    set size(sz) {
        super.size = sz;
        this._radius = (sz.w + sz.h) / 4.0;
    }
    get radius() { return this._radius; }
    set radius(r) {
        this._radius = r;
        this._size = { w:r*2, h:r*2 };
    }
    drawInternalAfterChildren(pos, boundingSize) {
        if (this.clipChildren) {
            this.ctx.restore();

            var ctx = this.ctx;
            var rad = boundingSize.w / 2.0;
            drawCircle(ctx, pos.x, pos.y, rad, null, {color:'black', lineWidth:1});
        }
    }
    drawInternal(pos, boundingSize) {
        var ctx = this.ctx;
        var rad = boundingSize.w / 2.0;
        if (this.shadowOffset !== 0)
            drawCircle(ctx, pos.x, pos.y + this.shadowOffset, rad, 'black',    this.stroke);
        drawCircle(ctx, pos.x, pos.y,                     rad, this.color, this.stroke);
        if (this.clipChildren) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(pos.x+rad, pos.y+rad, rad, 0, 2*Math.PI);
            ctx.clip();

            if (this.clipBackground) {
                ctx.drawImage(Resource.getImage(this.clipBackground),
                    pos.x, pos.y);
            }
        }
    }
}

class Bag extends Circle {
    constructor(x, y, rad, includeInner=true) {
        super(x, y, rad);

        if (includeInner) {
            var outerRad = rad - this.topSize(rad).h / 2.0;
            var innerRad = outerRad / 1.3;
            var inner = new Circle(0, 0, innerRad);
            inner.pos = { x:outerRad - innerRad, y:rad/2.2 + (outerRad - innerRad) };
            inner.clipChildren = true;
            inner.clipBackground = 'bag-background';
            this.addChild(inner);
            this.inner = inner;
        }

        this.shadowOffset = 3;
    }
    addItem(item) {
        this.addChild(item);
        //this.inner.addChild(item);
    }
    removeItem(item) {
        this.removeChild(item);
        //this.inner.removeChild(item);
    }
    removeAllItems() {
        let children = this.children.filter((child) => (!child.clipChildren));
        children.forEach((child) => this.removeChild(child)); // ha-ha programming tricks ...
    }
    topSize(rad) {
        return { w:Math.round(rad) * 1.5, h:rad / 2.2 };
    }
    drawInternal(pos, boundingSize) {
        var ctx = this.ctx;
        var rad = boundingSize.w / 2.0;
        var topSize = this.topSize(rad);
        rad -= topSize.h / 2.0;
        drawBag(ctx, pos.x, pos.y + this.shadowOffset, topSize.w, topSize.h, rad, 'black',    this.stroke);
        drawBag(ctx, pos.x, pos.y,                     topSize.w, topSize.h, rad, this.color, this.stroke);
    }
    drawInternalAfterChildren(pos, boundingSize) {
        var ctx = this.ctx;
        var rad = boundingSize.w / 2.0;
        var topSize = this.topSize(rad);
        rad -= topSize.h / 2.0;
        drawBag(ctx, pos.x, pos.y, topSize.w, topSize.h, rad, null, this.stroke);
    }
}

class Pipe extends Rect {
    constructor(x, y, w, h, topColor='green', sideColor='ForestGreen') {
        super(x, y, w, h);
        this.topColor = topColor;
        this.sideColor = sideColor;
        this.cylStroke = { color:'blue', lineWidth:1 };
    }
    drawInternal(pos, boundingSize) {
        var ctx = this.ctx;
        var l = boundingSize.h / 4;
        var w = boundingSize.w / 2;
        var yoffset = -20;
        setStrokeStyle(ctx, this.cylStroke);

        // Draw side and bottom.
        ctx.fillStyle = this.sideColor;
        ctx.beginPath();
        ctx.ellipse(pos.x+w, pos.y+boundingSize.h+10+yoffset, w, l, 0, 0, Math.PI); // half ellipse
        ctx.lineTo(pos.x-w+w, pos.y+yoffset);
        ctx.lineTo(pos.x+w+w, pos.y+yoffset);
        ctx.closePath();
        ctx.fill();
        if(this.cylStroke) ctx.stroke();

        // Draw top circle.
        ctx.fillStyle = this.topColor;
        ctx.beginPath();
        ctx.ellipse(pos.x+w, pos.y+yoffset, w, l, 0, 0, 2 * Math.PI);
        ctx.fill();
        if(this.cylStroke) ctx.stroke();
    }
}

class ArrowPath extends Node {
    constructor(points=[], stroke={color:'black', lineWidth:1}, arrowWidth=8) {
        super(0, 0);
        this.stroke = stroke;
        this.points = points;
        this.arrowWidth = arrowWidth;
    }

    get absolutePos() {
        var pos = this.pos;
        if (this.parent) {
            let abs_scale = this.parent.absoluteScale;
            return addPos( {x:pos.x*abs_scale.x,
                            y:pos.y*abs_scale.y},
                            this.parent.upperLeftPos( this.parent.absolutePos , this.parent.absoluteSize ));
        }
        else return pos;
    }

    get color() {
        return this.stroke.color;
    }
    set color(clr) {
        this.stroke.color = clr;
    }
    get pathLength() {
        let len = 0;
        for (let i = 1; i < this.points.length; i++)
            len += distBetweenPos(this.points[i-1], this.points[i]);
        return len;
    }
    addPoint(pt) {
        if (!this.points) this.points = [];
        this.points.push( {x:pt.x, y:pt.y} );
    }
    pointAtIndex(i) {
        return { x:this.points[i].x, y:this.points[i].y };
    }
    get lastPoint() {
        return this.pointAtIndex(this.points.length-1);
    }
    get lastSegment() {
        let p1 = this.pointAtIndex(this.points.length-2);
        let p2 = this.pointAtIndex(this.points.length-1);
        return fromTo(p1, p2);
    }

    // Takes a number from 0.0 to 1.0, representing start to end, respectively,
    // and returns the corresponding position along the path if it were treated like a single line.
    posAlongPath(elapsed) {
        if (elapsed < 0) return this.pointAtIndex(0);
        else if (elapsed > 1) return this.lastPoint;

        let totalLen = this.pathLength;
        let fraction = 0;
        for (let i = 1; i < this.points.length; i++) {
            let len = distBetweenPos(this.points[i-1], this.points[i]);
            if (elapsed < fraction + len / totalLen) {
                let seg_elapsed = elapsed - fraction;
                let vec = fromTo(this.points[i-1], this.points[i]);
                let seg_len = lengthOfPos(vec) * seg_elapsed;
                return addPos( this.points[i-1], rescalePos(vec, seg_len) );
            }
            fraction += len / totalLen;
        }

        return this.lastPoint;
    }

    draw(offset) {
        this.drawInternal(this.absolutePos);
    }

    // Draw path.
    drawInternal(pos) {
        if (!this.points || this.points.length === 0) return;
        let ctx = this.ctx;
        let abs_scale = this.parent.absoluteScale;
        let lastpt = this.lastPoint; //addPos( pos, this.lastPoint );

        ctx.save();
        ctx.translate(pos.x, pos.y);
        ctx.scale(abs_scale.x, abs_scale.y);

        setStrokeStyle(ctx, this.stroke);
        ctx.fillStyle = null;

        // Draw lines.
        let startpt = this.points[0];
        ctx.beginPath();
        ctx.moveTo(startpt.x, startpt.y);
        this.points.slice(1).forEach((pt) => {
            let p = pt;
            ctx.lineTo(p.x, p.y);
        });
        if (this.stroke) ctx.stroke();

        // Draw arrowhead.
        let lastseg = reversePos( rescalePos( this.lastSegment, this.arrowWidth ) ); // Vector pointing from final point to 2nd-to-last point.
        let leftpt = addPos( rotateBy(lastseg, Math.PI / 4.0), lastpt );
        let rightpt = addPos( rotateBy(lastseg, -Math.PI / 4.0), lastpt );
        ctx.fillStyle = this.stroke ? this.stroke.color : null;
        setStrokeStyle(ctx, null);
        ctx.beginPath();
        ctx.moveTo(  lastpt.x,  lastpt.y  );
        ctx.lineTo(  leftpt.x,  leftpt.y  );
        ctx.lineTo( rightpt.x, rightpt.y  );
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }
}
