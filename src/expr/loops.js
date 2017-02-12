const SCALE_FACTOR = 0.33;

class RepeatLoopExpr extends Expression {
    constructor(times, body) {
        super([]);
        if (times instanceof MissingExpression) {
            times = new MissingNumberExpression();
        }
        this.color = "#7777CC";
        this.addArg(times);
        this.addArg(body);
        this.template = null;

        // Offset drawing self for a "stamp" effect
        this._animationOffset = 0;
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

    update() {
        super.update();

        if (this.timesExpr instanceof NumberExpr) {
            let missing = [];
            for (let i = 0; i < this.timesExpr.number; i++) {
                missing.push(this.bodyExpr.clone());
            }
            this.template = new NotchedSequence(...missing);
            this.template.lockSubexpressions();
            this.template.scale = { x: 0.8, y: 0.8 };
            this.template.parent = this;
            this.template.pos = {
                x: this.bodyExpr.pos.x + 5,
                y: this.size.h - this.template.padding.inner / 2,
            };
            this.template.holes.forEach((expr) => {
                expr.opacity = 0.3;
            });
        }
        else {
            this.template = null;
        }

        if (this.template != null) {
            this.template.update();
        };
    }

    getHoleSizes() {
        let result = super.getHoleSizes();
        if (this.template) {
            // Adjust size if the template is larger than the body
            result[1].w = Math.max(result[1].w, this.template.size.w * this.template.scale.x);
        }
        return result;
    }

    drawInternal(ctx, pos, boundingSize) {
        if (this.template != null) {
            ctx.save();
            this.template.draw(ctx);
            ctx.restore();
        }

        let divotX = this.timesExpr.absolutePos.x + this.timesExpr.absoluteSize.w + (this.bodyExpr.absolutePos.x - (this.timesExpr.absolutePos.x + this.timesExpr.absoluteSize.w)) / 2.0;
        let bracketHeight = boundingSize.h * 0.2;
        let radius = this.radius*this.absoluteScale.x;
        let bracketRadius = bracketHeight;

        let trayLeft = this.bodyExpr.absolutePos.x;
        let trayRight = this.bodyExpr.absolutePos.x + this.bodyExpr.absoluteSize.w;
        if (this.template) {
            trayLeft = this.template.absolutePos.x;
            trayRight = this.template.absolutePos.x + this.template.absoluteSize.w;
        }

        let offsetLineTo = (offset, x, y) => ctx.lineTo(x, y + offset);
        let offsetQuadraticCurveTo = (offset, cx, cy, x, y) => ctx.quadraticCurveTo(cx, cy + offset, x, y + offset);

        let draw = (offset) => {
            ctx.beginPath();
            ctx.moveTo(pos.x + radius + offset, pos.y + offset);
            offsetLineTo(offset, divotX - bracketRadius, pos.y);
            // "Divot" separating stamp and number
            offsetQuadraticCurveTo(offset, divotX, pos.y,
                                   divotX, pos.y + bracketRadius);
            // "Output tray"
            offsetLineTo(offset, trayLeft, pos.y - 10);
            offsetLineTo(offset, trayLeft, pos.y);
            offsetLineTo(offset, trayRight, pos.y);
            offsetLineTo(offset, trayRight, pos.y - 10);
            if (pos.x + boundingSize.w - trayRight > 20) {
                offsetLineTo(offset, trayRight + 5, pos.y);
                offsetLineTo(offset, pos.x + boundingSize.w - radius, pos.y);
                offsetQuadraticCurveTo(offset, pos.x + boundingSize.w, pos.y,
                                       pos.x + boundingSize.w, pos.y + radius);
            }
            else {
                offsetLineTo(offset, pos.x + boundingSize.w, pos.y + radius);
            }
            // Right side
            offsetLineTo(offset, pos.x + boundingSize.w, pos.y + boundingSize.h - radius);
            // "Input tray"
            if (pos.x + boundingSize.w - trayRight > 20) {
                offsetQuadraticCurveTo(offset, pos.x + boundingSize.w, pos.y + boundingSize.h,
                                       pos.x + boundingSize.w - radius, pos.y + boundingSize.h);
                offsetLineTo(offset, trayRight + 5, pos.y + boundingSize.h);
            }

            offsetLineTo(offset, trayRight, pos.y + boundingSize.h + 10);
            offsetLineTo(offset, trayRight, pos.y + boundingSize.h);
            offsetLineTo(offset, trayLeft, pos.y + boundingSize.h);
            offsetLineTo(offset, trayLeft, pos.y + boundingSize.h + 10);
            offsetLineTo(offset, divotX, pos.y + boundingSize.h - bracketRadius);
            // "Divot" on bottom
            offsetQuadraticCurveTo(offset, divotX, pos.y + boundingSize.h,
                                   divotX - bracketRadius, pos.y + boundingSize.h);
            offsetLineTo(offset, pos.x + radius, pos.y + boundingSize.h);
            // Bottom-left corner
            offsetQuadraticCurveTo(offset, pos.x, pos.y + boundingSize.h,
                                 pos.x, pos.y + boundingSize.h - radius);
            // Left side
            offsetLineTo(offset, pos.x, pos.y + radius);
            // Upper-left corner
            offsetQuadraticCurveTo(offset, pos.x, pos.y,
                                 pos.x + radius, pos.y);
            ctx.closePath();
            if (this.stroke) {
                strokeWithOpacity(ctx, this.stroke.opacity);
            }
            ctx.fill();
        };

        setStrokeStyle(ctx, this.stroke);
        if (this.shadowOffset !== 0) {
            ctx.fillStyle = 'black';
            draw(this.shadowOffset);
        }
        ctx.fillStyle = this.color;
        draw(0);
    }

    performReduction() {
        if (!this.bodyExpr.isComplete()) {
            const incomplete = mag.Stage.getNodesWithClass(MissingExpression, [], true, [this.bodyExpr]);
            incomplete.forEach((expr) => {
                Animate.blink(expr, 1000, [1.0, 0.0, 0.0]);
            });
            return Promise.reject("RepeatLoopExpr: missing body!");
        }

        this._cachedSize = this.size;
        this._animating = true;

        return this.performSubReduction(this.timesExpr).then((num) => {
            if (!(num instanceof NumberExpr) || !this.bodyExpr || this.bodyExpr instanceof MissingExpression) {
                Animate.blink(this.timesExpr, 1000, [1.0, 0.0, 0.0]);
                this._animating = false;
                return Promise.reject("RepeatLoopExpr incomplete!");
            }

            if (num.number <= 0) {
                Animate.poof(this);
                (this.parent || this.stage).swap(this, null);
                return null;
            }

            return new Promise((resolve, reject) => {
                let index = 0;
                let x = this.template.pos.x;
                let y = this.template.pos.y;

                let nextStep = () => {
                    if (index > this.template.subexpressions.length) {
                        resolve(this.template);
                        Animate.poof(this);
                        this.template.parent = null;
                        (this.parent || this.stage).swap(this, this.template);
                        return;
                    }

                    if (index == this.template.subexpressions.length) {
                        y -= this.size.h;
                        Animate.tween(this.template, {
                            pos: {
                                x: x,
                                y: y,
                            },
                        }, 300).after(() => {
                            index++;
                            after(400).then(nextStep);
                        });
                    }
                    else {
                        let current = this.template.subexpressions[index];
                        // If we're stamping a sequence, treat each
                        // group of expressions as a single stamp
                        let numExprs = 1;
                        if (this.bodyExpr instanceof Sequence) {
                            numExprs = this.bodyExpr.subexpressions.length;
                        }

                        for (let i = 0; i < numExprs; i++) {
                            let expr = this.template.subexpressions[index + i];
                            y -= expr.size.h * expr.scale.y;
                        }

                        Animate.tween(this.template, {
                            pos: {
                                x: x,
                                y: y,
                            },
                        }, 300).after(() => {
                            let oldOffset = this.bodyExpr.shadowOffset;
                            this.bodyExpr.shadowOffset = -4;
                            this.bodyExpr.pos = {
                                x: this.bodyExpr.pos.x,
                                y: this.bodyExpr.pos.y + 2,
                            };
                            for (let i = 0; i < numExprs; i++) {
                                this.template.subexpressions[index + i].opacity = 1.0;
                            }
                            index += numExprs;

                            after(300).then(() => {
                                this.bodyExpr.shadowOffset = oldOffset;
                                this.bodyExpr.pos = {
                                    x: this.bodyExpr.pos.x,
                                    y: this.bodyExpr.pos.y - 2,
                                };
                                this.stage.draw();
                                after(400).then(nextStep);
                            });
                        });
                    }
                };
                nextStep();
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
