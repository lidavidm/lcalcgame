// Acts as a named wrapper for a def'd expression.
// Should not store the procedure, but only store the name of the function
class NamedFuncExpr extends Expression {
    constructor(name, args) {
        let txt_name = new TextExpr(name);
        txt_name.color = 'black';
        let exprs = [ txt_name ];
        for ( let i = 0; i < args.length; i++ )
            exprs.push( args[i].clone() );
        super(exprs);
        this.color = 'OrangeRed';
        this.name = name;
        
        this._args = args.map((a) => a.clone());

        this.stage = Level.getStage();
        let refDefineExpr = this.stage.functions[name];
        this._wrapped_ref = refDefineExpr;
        this.scale = refDefineExpr.scale;
        console.log("reached end of NamedFuncExpr constructor");
    }
    /*get expr() {
        console.log("called get expr() in NAMEDFUNCEXPR");
        console.log(Level.getStage().functions[this.name].expr);
        return Level.getStage().functions[this.name].expr.clone();
    }*/

    get funcExpr() {
        //return Level.getStage().functions[this.name].expr.clone();
        return this._wrapped_ref.expr.clone();
        return new NamedFuncExpr(this.name, this._args);
    }

    get args() { return this.holes.slice(1).map((a) => a.clone()); }
    get constructorArgs() {
        return [ this.name, this.funcExpr, this.args ];
    }

    onmouseclick() {
        console.log(this);
        this.performReduction();
    }
    reduce() {
        let expr = this.funcExpr;
        if (!expr || expr instanceof MissingExpression)
            return this;
        else {

            let incomplete_exprs = mag.Stage.getNodesWithClass(MissingExpression, [], true, [expr]).filter((e) => (!(e instanceof LambdaHoleExpr)));
            if (incomplete_exprs.length > 0) {
                console.log(incomplete_exprs);
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
                console.log(expr);

                if (args.length > 0)
                    expr = args.reduce((lambdaExpr, arg) => lambdaExpr.applyExpr(arg), expr); // Chains application to inner lambda expressions.

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
        let s = '(' + name; // e.g. '(length'
        let args = this.args;
        for ( let i = 0; i < args.length; i++ )
            s += ' ' + args[i].toString();
        s += ')';
        return s;
    }
}
