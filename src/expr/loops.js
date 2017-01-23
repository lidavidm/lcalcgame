const SCALE_FACTOR = 0.33;

class RepeatLoopExpr extends Expression {
    constructor(times, body) {
        super([times, body]);
        this.arcAngle = 0;
        this.color = "orange";
        this.radius = 30;
    }

    get timesExpr() {
        return this.holes[0];
    }

    set timesExpr(expr) {
        this.holes[0] = expr;
    }

    get bodyExpr() {
        return this.holes[1];
    }

    set bodyExpr(expr) {
        this.holes[1] = expr;
    }

    get size() {
        let size = super.size;
        return {
            w: size.w + this.radius,
            h: Math.max(2 * this.radius + 10, size.h),
        };
    }

    update() {
        super.update();
        let centerX = this.size.w / 2;
        let centerY = this.size.h / 2;
        if (this.timesExpr) {
            this.timesExpr.stroke = {
                color: "#999",
                width: 2,
            };
        }
        if (this.bodyExpr) {
            this.bodyExpr.stroke = {
                color: "#999",
                width: 2,
            };
        }
        this.bodyExpr.pos = {
            x: this.bodyExpr.pos.x + this.radius,
            y: this.bodyExpr.pos.y,
        };
    }

    drawInternal(ctx, pos, boundingSize) {
        let leftEdge = this.timesExpr.absolutePos.x + this.timesExpr.absoluteSize.w;
        let centerX = leftEdge + (this.bodyExpr.absolutePos.x - leftEdge) / 2;
        let centerY = pos.y + boundingSize.h / 2;

        ctx.lineWidth = 1.0;
        ctx.fillStyle = '#999';
        ctx.beginPath();
        ctx.arc(centerX, centerY + this.shadowOffset, this.radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = 'orange';
        ctx.strokeStyle = 'black';
        ctx.arc(centerX, centerY, this.radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();

        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.arc(centerX, centerY, this.radius, this.arcAngle, this.arcAngle + Math.PI / 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(centerX, centerY, this.radius, this.arcAngle + Math.PI, this.arcAngle + 3 * Math.PI / 2);
        ctx.stroke();

        // draw the arrows
        ctx.lineWidth = 1.5;
        ctx.fillStyle = 'black';

        let arrowOffsetAngle = Math.PI / 2 + this.arcAngle;
        let arrowCenterX = centerX + Math.cos(arrowOffsetAngle) * this.radius;
        let arrowCenterY = centerY + Math.sin(arrowOffsetAngle) * this.radius;
        drawPointsAround(ctx, arrowCenterX, arrowCenterY, [[-6.0, 0.0], [6.0, 3.0], [6.0, -3.0]], this.arcAngle);
        arrowOffsetAngle = -Math.PI / 2 + this.arcAngle;
        arrowCenterX = centerX + Math.cos(arrowOffsetAngle) * this.radius;
        arrowCenterY = centerY + Math.sin(arrowOffsetAngle) * this.radius;
        drawPointsAround(ctx, arrowCenterX, arrowCenterY, [[6.0, 0.0], [-6.0, 3.0], [-6.0, -3.0]], this.arcAngle);

        // draw the times symbol
        ctx.beginPath();
        ctx.moveTo(centerX - 5, centerY - 5);
        ctx.lineTo(centerX + 5, centerY + 5);
        ctx.moveTo(centerX + 5, centerY - 5);
        ctx.lineTo(centerX - 5, centerY + 5);
        ctx.stroke();
    }

    performReduction() {
        if (!this.bodyExpr.isComplete()) {
            Animate.blink(this.bodyExpr, 1000, [1.0, 0.0, 0.0]);
            return Promise.reject("RepeatLoopExpr: missing body!");
        }

        this._cachedSize = this.size;
        this._animating = true;

        return this.performSubReduction(this.timesExpr).then((num) => {
            if (!(num instanceof NumberExpr) || !this.bodyExpr || this.bodyExpr instanceof MissingExpression) {
                this._animating = false;
                return Promise.reject("RepeatLoopExpr incomplete!");
            }

            if (num.number <= 0) {
                Animate.poof(this);
                (this.parent || this.stage).swap(this, null);
                return null;
            }

            let seqClass = ExprManager.getClass('sequence');
            let body = [];
            for (let i = 0; i < num.number; i++) {
                body.push(this.bodyExpr.clone());
            }
            let result = new seqClass(...body);
            result.lockSubexpressions();
            result.update();
            return new Promise((resolve, _reject) => {
                Animate.tween(this, {
                    arcAngle: body.length * Math.PI,
                }, 500 * body.length).after(() => {
                    (this.parent || this.stage).swap(this, result);
                    resolve(result);
                });
            });
        });
    }

    onmouseclick() {
        if (!this._animating) {
            this.performReduction();
        }
    }
}

function drawPointsAround(ctx, centerX, centerY, points, rotation) {
    ctx.beginPath();
    let first = true;
    for (let [x, y] of points) {
        let tx = centerX + x * Math.cos(rotation) - y * Math.sin(rotation);
        let ty = centerY + x * Math.sin(rotation) + y * Math.cos(rotation);
        if (first) {
            ctx.moveTo(tx, ty);
            first = false;
        }
        else {
            ctx.lineTo(tx, ty);
        }
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}
