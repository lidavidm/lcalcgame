const SCALE_FACTOR = 0.33;

class RepeatLoopExpr extends Expression {
    constructor(times, body) {
        super([times, body]);
        this.markerAngle = 0;
        this.drawMarker = false;
        this.color = "orange";
    }

    // draw(ctx) {
    // }

    get timesExpr() {
        return this.holes[0];
    }

    get bodyExpr() {
        return this.holes[1];
    }

    get size() {
        if (this._animating) return this._cachedSize;
        let subSize = this.timesExpr.size;
        let subHeight = Math.max(this.timesExpr.size.h, this.bodyExpr.size.h);
        let w = subSize.w * 2.25;
        let h = subHeight * 1.5;
        if (w < h) w = h;
        return {
            w: w,
            h: h,
        };
    }

    update() {
        super.update();
        let centerX = this.size.w / 2;
        let centerY = this.size.h / 2;
        let innerR = 0.1 * this.size.h / 2;
        let outerR = 0.9 * this.size.h / 2;
        if (this.timesExpr) {
            this.timesExpr.stroke = {
                color: "#999",
                width: 2,
            };
            this.timesExpr.pos = {
                x: centerX - outerR - this.timesExpr.size.w / 3,
                y: centerY,
            };
        }
        if (this.bodyExpr) {
            this.bodyExpr.stroke = {
                color: "#999",
                width: 2,
            };
            this.bodyExpr.pos = {
                x: centerX + outerR - Math.min(25, this.bodyExpr.size.w / 2),
                y: centerY,
            };
        }
    }

    drawInternal(ctx, pos, boundingSize) {
        super.drawInternal(ctx, pos, boundingSize);

        let centerX = pos.x + boundingSize.w / 2;
        let centerY = pos.y + boundingSize.h / 2;
        let outerR = 0.9 * boundingSize.h / 2;

        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.strokeStyle = ctx.fillStyle = 'black';
        ctx.arc(centerX, centerY, outerR, 0, Math.PI * 2);
        ctx.closePath();
        ctx.stroke();

        // draw the arrows
        let dy = Math.abs(this.timesExpr.absolutePos.y + this.timesExpr.absoluteSize.h / 2 - centerY);
        let lowerTipAngle = Math.PI - Math.asin(dy / outerR);
        drawArrowOnArc(ctx, lowerTipAngle, -Math.PI / 10, centerX, centerY, outerR);

        dy = Math.abs(this.bodyExpr.absolutePos.y - this.bodyExpr.absoluteSize.h / 2 - centerY);
        let upperTipAngle = -Math.asin(dy / outerR);
        drawArrowOnArc(ctx, upperTipAngle, -Math.PI / 10, centerX, centerY, outerR);

        if (this.drawMarker) {
            ctx.beginPath();
            let dy = Math.abs(this.timesExpr.absolutePos.y - this.timesExpr.absoluteSize.h / 2 - centerY);
            let startAngle = Math.asin(dy / outerR) - Math.PI;
            dy = Math.abs(this.bodyExpr.absolutePos.y - this.bodyExpr.absoluteSize.h / 2 - centerY);
            let endAngle = -Math.asin(dy / outerR);
            let markerAngle = startAngle + this.markerAngle * (endAngle - startAngle);
            ctx.arc(centerX + outerR * Math.cos(markerAngle),
                    centerY + outerR * Math.sin(markerAngle),
                    0.1 * outerR, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fill();
        }
    }

    animateNumber() {
        return new Promise((resolve, reject) => {
            this.drawMarker = true;
            this.markerAngle = 0.0;
            this.swap(this.timesExpr, new NumberExpr(this.timesExpr.number - 1));
            this.timesExpr.lock();

            Animate.tween(this, {
                markerAngle: 1.0,
            }, 500).after(() => {
                this.drawMarker = false;
                resolve();
            });
        });
    }

    performReduction() {
        if (!this.bodyExpr.isComplete()) {
            Animate.blink(this.bodyExpr, 300, [1.0, 0.0, 0.0]);
            return Promise.reject("RepeatLoopExpr: missing body!");
        }

        this._cachedSize = this.size;
        this._animating = true;

        return this.performSubReduction(this.timesExpr).then((num) => {
            if (!(num instanceof NumberExpr) || !this.bodyExpr || this.bodyExpr instanceof MissingExpression) {
                this._animating = false;
                return Promise.reject("RepeatLoopExpr incomplete!");
            }
            let body = this.bodyExpr.clone();

            let nextStep = () => {
                if (this.timesExpr.number > 0) {
                    return this.animateNumber().then(() => {
                        return this.performSubReduction(this.bodyExpr).then(() => {
                            this.holes[1] = body.clone();
                            this.holes[1].parent = this;
                            this.holes[1].stage = this.stage;
                            this.update();

                            return new Promise((resolve, reject) => {
                                window.setTimeout(() => {
                                    let r = nextStep();
                                    if (r instanceof Promise) r.then(resolve, reject);
                                    else resolve(r);
                                }, 500);
                            });
                        });
                    });
                }
                else {
                    Animate.poof(this);
                    (this.parent || this.stage).swap(this, null);
                    return null;
                }
            };
            return nextStep();
        });
    }

    onmouseclick() {
        if (!this._animating) {
            this.performReduction();
        }
    }
}


function drawArrowOnArc(ctx, tipAngle, deltaAngle, centerX, centerY, radius) {
    let baseAngle = tipAngle + deltaAngle;
    ctx.beginPath();
    ctx.moveTo(centerX + 0.9 * radius * Math.cos(baseAngle), centerY + 0.9 * radius * Math.sin(baseAngle));
    ctx.lineTo(centerX + 1.1 * radius * Math.cos(baseAngle), centerY + 1.1 * radius * Math.sin(baseAngle));
    ctx.lineTo(centerX + radius * Math.cos(tipAngle), centerY + radius * Math.sin(tipAngle));
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
}
