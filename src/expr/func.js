// Acts as a named wrapper for a def'd expression.
class NamedFuncExpr extends Expression {
    constructor(name, paramNames, ...args) {

        let txt_name = new TextExpr(name + '(');
        txt_name.color = 'black';
        let exprs = [ txt_name ];
        for ( let i = 0; i < args.length; i++ ) {
            if (i > 0) exprs.push(new TextExpr(','));
            exprs.push(args[i].clone());
        }
        exprs.push(new TextExpr(')'))

        super(exprs);

        this.newArgs = [];
        this.color = 'OrangeRed';
        this.name = name;
        this.paramNames = paramNames;
    }

    canReduce() {
        return true;
    }

    get expr() {
        return new NamedFuncExpr(this.name, ...this.args);
    }

    get funcExpr() {
        return Level.getStage().functions[this.name].expr.clone();
    }

    get args() { return this.holes.slice(1, this.holes.length-1).map((a) => a.clone()); }
    get constructorArgs() {
        return [ this.name, ...this.args ];
    }

    onmouseclick() {
        //console.log(this);
        this.performReduction();
    }
    reduce() {
        let refDefineExpr = Level.getStage().functions[this.name];
        if (refDefineExpr == null)
            return this;

        this._wrapped_ref = refDefineExpr;
        this.scale = refDefineExpr.scale;
        let expr = this.funcExpr;

        for (let it = 1; it < this.holes.length; ++it) {
            this.holes[it] = this.holes[it].reduceCompletely();
        }

        if (!expr || expr instanceof MissingExpression)
            return this;
        else {

            // Blink any unfilled 'holes'
            let incomplete_exprs = mag.Stage.getNodesWithClass(MissingExpression, [], true, [expr]).filter((e) => (!(e instanceof LambdaHoleExpr)));
            if (incomplete_exprs.length > 0) {
                //console.log(incomplete_exprs);
                incomplete_exprs.forEach((e) => Animate.blink(e, 1000, [1,0,0], 2));
                return this;
            }

            // This should 'reduce' by applying the arguments to the wrapped expression.
            // First, let's check that we HAVE arguments...
            var isValidArgument = (a) => a && (a instanceof Expression) && !(a instanceof MissingExpression);
            var validateAll = (arr, testfunc) => arr.reduce((prev, x) => prev && testfunc(x), true);
            let args = this.args;
            if (args.length === 0 || validateAll(args, isValidArgument)) { // true if all args valid

                // All the arguments check out. Now we need to apply them.
                let expr = this.funcExpr;

                /*
                    TODO: Turn body of function into JS code, then execute that
                    and funnel the output into the ES6Parser to return the correct Reduct block:
                 */
                // * We have to be very careful here, in case the program hangs! *
                if (this._javaScriptFunction) {
                    let js_code = '(' + this._javaScriptFunction + ")(" +
                          args.map((a) => a.toJavaScript()).join(',') +
                          ");";
                    let geval = eval; // equivalent to calling eval in the global scope
                    console.log(args);
                    console.log('Eval\'ing ', js_code);
                    let rtn = geval(js_code);
                    console.log('Result = ', rtn);
                    if (typeof rtn === "string")
                        expr = ES6Parser.parse('"' + rtn + '"');
                    else
                        expr = ES6Parser.parse(rtn.toString());
                } else {
                    if (args.length > 0)
                        expr = args.reduce((lambdaExpr, arg) => lambdaExpr.applyExpr(arg), expr); // Chains application to inner lambda expressions.
                }

                Resource.play('define-convert');

                // Disable editing the DefineExpr after its been used once.
                this._wrapped_ref.lockSubexpressions((e) => (!(e instanceof DragPatch)));
                this._wrapped_ref.lock();

                return expr.clone(); // to be safe we'll clone it.
            }
        }

        return this;
    }

    // Whoa... meta.
    toString() {
        let s = '(' + this.name; // e.g. '(length'
        let args = this.args;
        for ( let i = 0; i < args.length; i++ )
            s += ' ' + args[i].toString();
        s += ')';
        return s;
    }
    toJavaScript() {
        let name = this.name;
        let args = this.args.map((x) => x.toJavaScript()).join(', ');
        return `${this.name}(${args})`;
    }
}
