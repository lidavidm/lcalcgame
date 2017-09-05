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
    isValue() {
        return true;
    }
    toString() {
        return (this.locked ? '/' : '') + this.number.toString();
    }
    toJavaScript() {
        return this.number.toString();
    }

    onmouseclick(pos) {
        // We can't really reduce, let's see if our parent wants to
        if (this.parent) {
            this.parent.onmouseclick(pos);
        }
    }
}

class FadedNumberExpr extends NumberExpr {
    constructor(num) {
        super(num);
        this.children = [];
        this.holes = [];
        this.addArg(new TextExpr(num.toString()));
    }
    addValue(num) {
        this.holes[0].text = (parseInt(this.holes[0].text) + num).toString();
    }
}

class OperatorExpr extends Expression {
    constructor(left, op, right) {
        super([left, op, right]);
        // if (op instanceof TextExpr)
        //     op.color = "#660037";
    }

    canReduce() {
        return this.leftExpr && (this.leftExpr.isValue() || this.leftExpr.canReduce()) &&
            this.rightExpr && (this.rightExpr.isValue() || this.rightExpr.canReduce());
    }

    get leftExpr() {
        return this.holes[0];
    }

    get rightExpr() {
        return this.holes[2];
    }

    get op() {
        return this.holes[1];
    }

    performReduction(animated=true) {
        return this.performSubReduction(this.leftExpr).then((left) => {
            return this.performSubReduction(this.rightExpr);
        }).then((right) => {
            let stage = this.stage;

            if (animated && stage) {
                return new Promise((resolve, _reject) => {
                    var shatter = new ShatterExpressionEffect(this);
                    shatter.run(stage, (() => {
                        this.ignoreEvents = false;
                        resolve(super.performReduction());
                    }).bind(this));
                    this.ignoreEvents = true;
                });
            }
            else {
                return super.performReduction();
            }
        });
    }

    performUserReduction() {
        if (this.op instanceof OpLiteral) {
            const Class = this.op.getClass();
            const stage = this.stage;
            const binExpr = new Class(this.leftExpr.clone(), this.rightExpr.clone());
            stage.swap(this, binExpr);
            return;
        }
        if (this.leftExpr instanceof ContextualTypeInTextExpr || this.leftExpr instanceof TypeInTextExpr)
            this.leftExpr.performReduction();
        if (this.rightExpr instanceof ContextualTypeInTextExpr || this.rightExpr instanceof TypeInTextExpr)
            this.rightExpr.performReduction();
        super.performUserReduction();
    }

    onmouseclick() {
        this.performUserReduction();
    }

    toString() {
        return (this.locked ? '/(' : '(') + this.op.toString() + ' ' + this.leftExpr.toString() + ' ' + this.rightExpr.toString() + ')';
    }
    toJavaScript() {
        let opName;
        if (this.op instanceof MissingOpExpression)
            opName = '>>';
        else if (this.op instanceof TypeInTextExpr)
            opName = this.op.typeBox.text.trim().length > 0 ? this.op.typeBox.text : '>>>';
        else if (this.op instanceof OpLiteral)
            opName = this.op.toString();
        else
            opName = this.op.text;

        const isString = x => ((x.match(/\'/g) || []).length === 2 && x.indexOf("'") === 0 && (x.lastIndexOf("'") === (x.length-1)));
        const wrap = s => {
            if (!isString(s) && /\s/g.test(s)) // if this value isn't a string and it has whitespace, we need to wrap it in parentheses...
                return '(' + s + ')';
            else
                return s;
        };
        return `${wrap(this.leftExpr.toJavaScript())} ${opName} ${wrap(this.rightExpr.toJavaScript())}`;
    }
}

class OpLiteral extends Expression {
    constructor(op) {
        let t = new TextExpr(op);
        t.color = 'black';
        super([t]);
        this.radius = 22;
    }
    // drawInternal(ctx, pos, boundingSize) {
    //     const rad = boundingSize.h / 2.0;
    //     if (this.shadowOffset !== 0) {
    //         drawCircle(ctx, pos.x, pos.y + this.shadowOffset, rad, this.shadowColor, this.stroke);
    //     }
    //     drawCircle(ctx, pos.x, pos.y, rad, this.color, this.stroke);
    // }
    getClass() {
        const map = {
            '==': ExprManager.getClass('=='),
            '=':  ExprManager.getClass('assign'),
            '+':  ExprManager.getClass('+')
        };
        const op = this.toString();
        if (op in map) return map[op];
        else           return ExprManager.getClass(op);
    }
    onmouseclick() {
        if (this.parent)
            this.parent.performUserReduction();
    }

    toString() {
        return this.holes[0].text;
    }
    toJavaScript() {
        return `_op('${this.toString()}')`;
    }
}

class AddExpr extends OperatorExpr {
    constructor(left, right) {
        let op = new TextExpr("+");
        super(left, op, right);
    }

    canReduce() {
        // Disallow booleans
        return super.canReduce() && (this.leftExpr && !(this.leftExpr instanceof BooleanPrimitive))
            && (this.rightExpr && !(this.rightExpr instanceof BooleanPrimitive));
    }

    /* This 'add' should work for string concatenation as well. */
    reduce() {
        if (!this.canReduce()) return this;
        else if (this.leftExpr instanceof NumberExpr && this.rightExpr instanceof NumberExpr) {
            return new (ExprManager.getClass('number'))(this.leftExpr.value() + this.rightExpr.value());
        }
        else if (this.leftExpr instanceof StringValueExpr || this.rightExpr instanceof StringValueExpr) {
            let result = this.leftExpr.value() + this.rightExpr.value();
            if (typeof result === 'string')
                return new (ExprManager.getClass('string'))(result);
        }
        else return this;
    }
}

class SubtractionExpr extends OperatorExpr {
    constructor(left, right) {
        let op = new TextExpr("-");
        super(left, op, right);
    }

    reduce() {
        if (this.leftExpr instanceof NumberExpr && this.rightExpr instanceof NumberExpr) {
            return new (ExprManager.getClass('number'))(this.leftExpr.value() - this.rightExpr.value());
        }
        else {
            return this;
        }
    }
}

class MultiplicationExpr extends OperatorExpr {
    constructor(left, right) {
        let op = new TextExpr("*");
        super(left, op, right);
    }

    canReduce() {
        // Disallow booleans
        return super.canReduce() && (this.leftExpr && !(this.leftExpr instanceof BooleanPrimitive))
            && (this.rightExpr && !(this.rightExpr instanceof BooleanPrimitive));
    }

    reduce() {
        if (this.leftExpr instanceof NumberExpr && this.rightExpr instanceof NumberExpr) {
            return new (ExprManager.getClass('number'))(this.leftExpr.value() * this.rightExpr.value());
        }
        else {
            return this;
        }
    }
}

class DivisionExpr extends OperatorExpr {
    constructor(left, right) {
        let op = new TextExpr("/");
        super(left, op, right);
    }

    canReduce() {
        // Disallow booleans
        return super.canReduce() && (this.leftExpr && !(this.leftExpr instanceof BooleanPrimitive))
            && (this.rightExpr && !(this.rightExpr instanceof BooleanPrimitive));
    }

    reduce() {
        if (this.leftExpr instanceof NumberExpr && this.rightExpr instanceof NumberExpr) {
            console.log("reducing division expression");
            let result = parseInt(this.leftExpr.value()/this.rightExpr.value());
            return new (ExprManager.getClass('number'))(result);
        }
        else {
            console.log("reduce failed!!");
            return this;
        }
    }
}

class ModuloExpr extends OperatorExpr {
    constructor(left, right) {
        let op = new TextExpr("%");
        console.log(right);
        if (Number.isNumber(right)) right = new FadedNumberExpr(right);
        super(left, op, right);
    }

    canReduce() {
        // Disallow booleans
        return super.canReduce() && (this.leftExpr && !(this.leftExpr instanceof BooleanPrimitive))
            && (this.rightExpr && !(this.rightExpr instanceof BooleanPrimitive));
    }

    reduce() {
        if (this.leftExpr instanceof NumberExpr && this.rightExpr instanceof NumberExpr) {
            return new (ExprManager.getClass('number'))(this.leftExpr.value() % this.rightExpr.value());
        }
        else {
            return this;
        }
    }
}

class AnimatedModuloExpr extends ModuloExpr {
    performUserReduction() {
        if (!this._reducing && this.canReduce() && this.reduce() != this) {
            const dividend = this.leftExpr.value();
            const divisor = this.rightExpr.value();
            const reduceExpr = this.reduce();
            let clock = new ModuloClockExpr(new FadedNumberExpr(dividend), divisor, 62);
            clock.pos = addPos(this.centerPos(), {x:0, y:-80});
            clock.anchor = this.anchor;
            clock.ignoreEvents = true;
            clock.graphicNode.shadowOffset = 0;
            this.stage.add(clock);
            this.ignoreEvents = true;
            this.lockSubexpressions();
            this._reducing = clock.performModulo(false);
            // this.stage.remove(this);
            this._reducing.then(() => {
                this.stage.swap(this, reduceExpr);
                this._reducing = false;
            });
            this.animateReducingStatus();
        }
    }
}

class CircleSpinner extends ArrowPath {
    constructor(radius) {
        super([ {x:0, y:0},
                {x:0, y:radius} ]);
        this.degree = 90;
        this.radius = radius;
    }
    spinBy(degrees, duration=300) {
        if (degrees === 0) return;
        const cur_theta = toRadians(this.degree);
        const add_theta = toRadians(degrees);
        const r = this.radius;
        const _this = this;
        this.degree += degrees;
        if (duration > 0) {
            return new Promise(function(resolve, reject) {
                Animate.run((elapsed) => {
                    const theta = cur_theta + elapsed * add_theta;
                    _this.points[1] = { x:r * Math.cos(theta), y:r * Math.sin(theta) };
                    if (_this.stage) _this.stage.draw();
                }, duration).after(() => {
                    const theta = cur_theta + add_theta;
                    _this.points[1] = { x:r * Math.cos(theta), y:r * Math.sin(theta) };
                    if (_this.stage) _this.stage.draw();
                    resolve();
                });
            });
        } else {
            const theta = cur_theta + add_theta;
            this.points[1] = { x:r * Math.cos(theta), y:r * Math.sin(theta) };
            return Promise.resolve();
        }
    }
}

class ModuloClock extends mag.Circle {
    constructor(x, y, rad, divisor) {
        super(x, y, rad);

        const spinnerColor = '#111';
        const numberColor  = '#aaa';
        const clockCenter = {x:rad, y:rad};

        this.color = 'Ivory';
        this.numberColor = numberColor;
        this.shadowColor = spinnerColor;

        let centerDot = new mag.Circle(0, 0, Math.trunc(rad / 8.0));
        centerDot.color = spinnerColor;
        centerDot.anchor = { x:0.5, y:0.5 };
        centerDot.pos = clockCenter;
        centerDot.shadowOffset = 0;
        centerDot.ignoreEvents = true;

        let spinner = new CircleSpinner(rad / 1.8);
        spinner.pos = clockCenter;
        spinner.anchor = { x:0.5, y:0.5 };
        spinner.stroke = { color:spinnerColor, lineWidth:4 };

        // Display numbers on the clock
        const numRad = rad / 1.3;
        this.numbers = [];
        for (let i = 0; i < divisor; i++) {
            let theta = toRadians( 90 + i / divisor * 360.0 );
            let num = new TextExpr(i.toString())
            num.fontSize = 26;
            num.color = numberColor;
            num.anchor = { x:0.5, y:0.5 };
            num.pos = addPos({ x:numRad * Math.cos(theta), y:numRad * Math.sin(theta)+5 }, clockCenter);
            this.addChild(num);
            this.numbers.push(num);
        }

        this.addChild(spinner);
        this.addChild(centerDot);

        this.hand = spinner;
        this.divisor = divisor;
    }

    swap(child, newChild) {
        if (this.hasChild(child)) {
            newChild.pos = child.pos;
            newChild.anchor = child.anchor;
            newChild.lock();
            this.children.splice(this.children.indexOf(child), 1, newChild);
            this.update();
        }
    }

    hitsChild(pos, options) {
        if (!this.parent.toolbox)
            return super.hitsChild(pos, options);
        else
            return null;
    }

    // 'Spins' the clock hand 'dividend' number of turns,
    // visualizing a modulo operation.
    performModulo(dividend, cbAfterEveryTurn) {
        const divisor = this.divisor;
        const hand = this.hand;
        const num_turns = Math.trunc(dividend / divisor) * divisor + dividend % divisor;
        const turn_degrees = 360.0 / divisor;
        const turns = (new Array(num_turns)).fill(turn_degrees);
        const spin_dur = (num_turns > 9) ? (2000 / num_turns) : 200;
        const wait_dur = spin_dur;
        const numbers = this.numbers;
        const number_color = this.numberColor;
        let turn_idx = 0;
        const animation = turns.reduce((prom, degrees) => prom.then(() => {
            return new Promise(function(resolve, reject) { // Spin turns
                hand.spinBy(degrees, spin_dur).then(() => {
                    if (cbAfterEveryTurn) cbAfterEveryTurn();
                    numbers[turn_idx].color = number_color;
                    turn_idx = (turn_idx + 1) % divisor;
                    numbers[turn_idx].color = 'black';
                    Animate.wait(wait_dur).after(resolve);
                });
            });
        }), Promise.resolve());
        animation.then(() => {
            console.log('@ ModuloClock: Done animating.');
        });
        return animation;
    }
}

class ModuloClockExpr extends GraphicValueExpr {
    constructor(dividendExpr, divisor, radius=72) {
        super(new ModuloClock(0, 0, radius, divisor));
        this.color = 'Ivory';
        let n = dividendExpr;
        if (!n) n = new MissingNumberExpression();
        n.pos = this.graphicNode.centerPos();
        n.anchor = {x:0.5, y:0.5};
        if (n instanceof NumberExpr) n.lock();
        this.graphicNode.addChild(n);
    }
    getDividendExpr() {
        let es = this.graphicNode.children.filter((e) => (e instanceof MissingExpression || e instanceof NumberExpr));
        if (es.length === 0) return null;
        else return es[0];
    }
    performModulo(shouldGiveNumber=true) {
        if (this._isAnimating) return Promise.reject();
        let dividendExpr = this.getDividendExpr();
        if (!dividendExpr) return Promise.reject();
        else if (dividendExpr instanceof MissingExpression) {
            dividendExpr.animatePlaceholderStatus();
            return Promise.reject();
        } else {
            this._isAnimating = true;
            const dividend = dividendExpr.value();
            const remainder = dividend % this.graphicNode.divisor;
            let afterTurn = () => {
                dividendExpr.addValue(-1);
            };
            return this.graphicNode.performModulo(dividend, afterTurn).then(() => {
                Animate.wait(200).after(() => {

                    const theta = toRadians(this.graphicNode.hand.degree);
                    const r = this.graphicNode.radius / 1.3;
                    let stage = this.stage;

                    let n = new FadedNumberExpr(remainder);
                    let pos = addPos(this.centerPos(), { x:r * Math.cos(theta), y:r * Math.sin(theta) });
                    n.anchor = { x:0.5, y:0.5 };

                    //Animate.poof(this);

                    if (shouldGiveNumber) {
                        n.pos = pos;
                        stage.add(n);
                        this.opacity = 1.0;
                        n.update();
                        Animate.tween(this, {opacity:0}, 1000).after(() => {
                            stage.remove(this);
                            stage.update();
                        });
                    } else {
                        Animate.poof(this);
                        stage.remove(this);
                        stage.draw();
                    }
                });
            });
        }
    }
    onmouseclick(pos) {
        this.performModulo();
    }
}

// Draws the circles for a dice number inside its boundary.
class DiceNumber extends mag.Rect {
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
            //console.error('Dice pos array does not exist for number ' + num + '.');
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
    drawInternal(ctx, pos, boundingSize) {

        if (this.circlePos && this.circlePos.length > 0) {

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
