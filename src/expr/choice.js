class ChoiceExpr extends Expression {
    constructor(...choices) {
        super([]);
        this.label = new TextExpr("?");
        this.label.color = "white";
        this.addArg(this.label);
        this.choices = choices;
        this._sparkling = false;
        this._state = "closed";
        this._sparkles = [];
    }

    get rowSize() {
        return Math.ceil(Math.sqrt(this.choices.length));
    }

    get size() {
        if (this._state === "closed") {
            return super.size;
        }
        else if (this._state === "open") {
            var padding = this.padding;
            var sizes = this.getHoleSizes();
            if (sizes.length === 0) return { w:this._size.w, h:this._size.h };

            let boxW = 0;
            let boxH = 0;

            for (let size of sizes) {
                if (size.w > boxW) boxW = size.w;
                if (size.h > boxH) boxH = size.h;
            }

            let width = this.padding.left + this.rowSize * boxW + this.padding.right;
            let height = this.padding.inner + this.rowSize * boxH;

            return { w:width, h: height };
        }
    }

    update() {
        if (!this._sparkling && this.stage) {
            this.sparkle();
        }
        else if (!this.stage) {
            this._sparkling = false;
        }

        if (this._state === "closed") {
            super.update();
        }
        else if (this._state === "open") {
            let rowSize = this.rowSize;
            this.children = [];

            this.holes.forEach((expr) => this.addChild(expr));
            this.holes.forEach((expr) => {
                expr.anchor = { x:0, y:0.5 };
                expr.scale = { x:0.85, y:0.85 };
                expr.update();
            });
            var size = this.size;

            let boxW = 0;
            let boxH = 0;

            for (let size of this.getHoleSizes()) {
                if (size.w > boxW) boxW = size.w;
                if (size.h > boxH) boxH = size.h;
            }

            let col = 0;
            let row = 0;
            for (let expr of this.holes) {
                expr.anchor = { x:0, y:0.5 };
                expr.pos = {
                    x: this.padding.left + col * boxW,
                    y: this.padding.inner / 2 + row * boxH + expr.anchor.y * expr.size.h,
                };
                expr.scale = { x:0.85, y:0.85 };
                expr.update();

                col += 1;
                if (col >= rowSize) {
                    col = 0;
                    row += 1;
                }
            }

            this.children = this.holes;
        }
    }

    swap(arg, anotherArg) {
        let poof = this.holes.indexOf(arg) > -1 && (anotherArg instanceof MissingExpression || anotherArg === null);
        super.swap(arg, anotherArg);

        if (poof) {
            Animate.poof(this);
            this.cleanup();
            (this.parent || this.stage).swap(this, null);
        }
    }

    cleanup() {
        this._sparkling = false;
        for (let sparkle of this._sparkles) {
            if (sparkle.stage) {
                sparkle.stage.remove(sparkle);
            }
        }
        this._sparkles = [];
    }

    drawInternal(ctx, pos, boundingSize) {
        let gradient = ctx.createLinearGradient(pos.x, pos.y, pos.x + boundingSize.w, pos.y + boundingSize.h);
        gradient.addColorStop(0, 'purple');
        gradient.addColorStop(0.5, 'green');
        gradient.addColorStop(1, 'blue');
        this.color = gradient;
        if (this._state === "closed") {
            super.drawInternal(ctx, pos, boundingSize);
        }
        else if (this._state === "open") {
            super.drawInternal(ctx, pos, boundingSize);
        }
    }

    onmouseclick() {
        this.removeArg(this.label);
        this.choices.forEach((c) => this.holes.push(c.clone()));
        this._state = "open";
    }

    sparkle() {
        this._sparkling = true;
        // Store node center pos.
        var center = this.centerPos();
        var size = this.absoluteSize;
        if (size.w === 0) size = { w:50, h:50 };
        const count = Math.min(200, 80 * (size.w / 50.0));
        const minRad = 1;
        const maxRad = 4;
        const colorElems = "0123456789ABCDEF";
        const colorFunc = (part) => {
            const r = colorElems[Math.floor(Math.random() * colorElems.length)];
            const g = colorElems[Math.floor(Math.random() * colorElems.length)];
            const b = colorElems[Math.floor(Math.random() * colorElems.length)];
            return `#${r}${g}${b}`;
        };

        // Create a bunch of floaty particles.
        for (let i = 0; i < count; i++) {

            let part = new mag.SparkleStar(
                center.x, center.y,
                Math.floor(minRad + (maxRad - minRad) * Math.random()));
            this._sparkles.push(part);

            let ghostySparkle = () => {
                size = this.absoluteSize;
                if (size.w === 0) size = { w:50, h:50 };

                let vec = { x:(Math.random() - 0.5) * size.w * 1.5,
                            y:(Math.random() - 0.5) * size.h * 1.5 - part.size.h / 2.0 };

                part.pos = addPos(this.centerPos(), vec);
                part.color = colorFunc(part);
                part.shadowOffset = 0;
                part.opacity = 1.0;
                this.stage.add(part);
                part.anim = Animate.tween(part, { opacity:0.0 }, Math.max(2000 * Math.random(), 1000), (elapsed)=>elapsed, false).after(() => {
                    this.stage.remove(part);
                    if (this._sparkling) {
                        ghostySparkle();
                    }
                });
            };
            ghostySparkle();
        }
        Animate.drawUntil(this.stage, () => {
            return !this._sparkling;
        });
    }
}
