// Specifies a 'notch' in a drawn rectangle.
// left, right, top, or bottom, and relpos is the relative position on that side from 0 to 1, clockwise.
class Notch {

    constructor(side='left', depth=8, width=16, relpos=0, inner=true) {
        this.side = side;
        this.depth = depth;
        this.width = width;
        this.inner = inner; // inner (concave) or outer (convex) notch?
        if (relpos && relpos <= 1 || relpos >= 0)
            this.relpos = relpos;
        else {
            console.warn('@ new Notch: Relative position outside of unit length.');
            this.relpos = 0;
        }
    }

    // Tells you whether two notches 'fit into' one another.
    isCompatibleWith(otherNotch) {
        return (this.inner !== otherNotch.inner) &&
                //(this.width === otherNotch.width && this.depth === otherNotch.depth) && // arguable
                (this.type === otherNotch.type) &&
               ((this.side === 'left' && otherNotch.side === 'right') ||
               (this.side === 'right' && otherNotch.side === 'left') ||
               (this.side === 'top' && otherNotch.side === 'bottom') ||
               (this.side === 'bottom' && otherNotch.side === 'top'));
    }

    // The type of notch, used for determining compatibility.
    // Obviously a 'hexagonal' notch wouldn't fit a 'wedge' notch, for instance.
    get type() { return 'standard'; } // I would go with just 'type',

};

// A triangular 'wedge' shaped notch.
class WedgeNotch extends Notch {
    get type() { return 'wedge'; }
    drawHoriz(ctx, x, y, w, dir) {
        let relpos = this.relpos;
        let facing = this.inner ? 1 : -1;
        ctx.lineTo(x + dir * (w * relpos - this.width), y);
        ctx.lineTo(x + dir * (w * relpos), y + facing * dir * this.depth);
        ctx.lineTo(x + dir * (w * relpos + this.width), y);
    }
    drawVert(ctx, x, y, h, dir) {
        let relpos = this.relpos;
        let facing = this.inner ? 1 : -1;
        ctx.lineTo(x, y + dir * (h * relpos - this.width));
        ctx.lineTo(x - facing * dir * this.depth, y + dir * h * relpos);
        ctx.lineTo(x, y + dir * (h * relpos + this.width));
    }
}
