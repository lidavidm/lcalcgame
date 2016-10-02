 
 

// Integers
class NumberExpr extends Expression {
    constructor(num) {
        super([ new DiceNumber(num) ]);
        this.number = num;
        this.color = 'Ivory';
        this.highlightColor = 'OrangeRed';
    }
    get constructorArgs() {
        return [this.number];
    }
    value() {
        return this.number;
    }
    toString() {
        return this.number.toString();
    }
}

// Draws the circles for a dice number inside its boundary.
class DiceNumber extends Rect {
    static drawPositionsFor(num) {
        let L = 0.15;
        let T = L;
        let R = 1.0 - L;
        let B = R;
        let M = 0.5;
        let map = {
            0: [],
            1: [ { x: M, y: M} ],
            2: [ { x: L, y: T }, { x: R, y: B } ],
            3: [ { x: R, y: T}, { x: M, y: M}, { x: L, y: B } ],
            4: [ { x: L, y: T}, { x: R, y: T}, { x: R, y: B }, { x: L, y: B } ],
            5: [ { x: L, y: T}, { x: R, y: T}, { x: R, y: B }, { x: L, y: B }, { x: M, y: M } ],
            6: [ { x: L, y: T}, { x: R, y: T}, { x: R, y: M }, { x: R, y: B }, { x: L, y: B }, { x: L, y: M } ]
        };
        if (num in map) return map[num];
        else {
            console.error('Dice pos array does not exist for number ' + num + '.');
            return [];
        }
    }
    constructor(num, radius=6) {
        super(0, 0, 44, 44);
        this.number = num;
        this.circlePos = DiceNumber.drawPositionsFor(num);
        this.radius = radius;
        this.color = 'black';
    }
    get constructorArgs() {
        return [ this.number, this.radius ];
    }
    hits(pos, options) { return false; }
    drawInternal(pos, boundingSize) {

        if (this.circlePos && this.circlePos.length > 0) {

            let ctx = this.ctx;
            let rad = this.radius * boundingSize.w / this.size.w;
            let fill = this.color;
            let stroke = this.stroke;
            this.circlePos.forEach((relpos) => {
                let drawpos = { x: pos.x + boundingSize.w * relpos.x - rad, y: pos.y + boundingSize.h * relpos.y - rad };
                drawCircle(ctx, drawpos.x, drawpos.y, rad, fill, stroke);
            });

        }
    }
}
