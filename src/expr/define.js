// Notch attachment node.
class NewInstanceExpr extends FadedValueExpr {
    constructor() {
        super('+');
        this.notches = [ new WedgeNotch('right', 10, 10, 0.5, false) ];
        this.padding.right = 20;
        //this.shadowOffset = 6;
        this.radius = 3;
        this.attachNode = null;
    }
    // get notchPos() {
    //     let upperLeftPos = this.upperLeftPos(this.absolutePos, this.absoluteSize);
    //     return { x:upperLeftPos.x + this.size.w, y:upperLeftPos.y + this.size.h * this.notch.relpos };
    // }
    isAttached() {
        return this.attachNode ? true : false;
    }
    attach(nodeWithNotch) {
        if (!nodeWithNotch.notchPos) {
            console.error('@ NewInstanceExpr.attach: Prospective attachment has no notchPos property.');
            return;
        }
        this.attachNode = nodeWithNotch;
        let notchPos = this.notchPos;
        let nodeNotchDistY = nodeWithNotch.notchPos.y - nodeWithNotch.pos.y;
        nodeWithNotch.pos = { x:notchPos.x, y:notchPos.y - nodeNotchDistY };
        this.stroke = null;
        Animate.blink(this, 500, [1,0,1], 1);
        Animate.blink(nodeWithNotch, 500, [1,0,1], 1);
    }
    detachAttachment(node) {
        if (node != this.attachNode) {
            console.error('@ NewInstanceExpr.detach: Trying to detach node which isn\'t attached to this expression.');
            return;
        }
        this.attachNode = null;
    }
}

// Acts as a named wrapper for a def'd expression.
class NamedExpr extends Expression {
    constructor(name, expr, args) {
        let txt_name = new TextExpr(name);
        txt_name.color = 'black';
        let exprs = [ txt_name ];
        for ( let i = 0; i < args.length; i++ )
            exprs.push( args[i].clone() );
        super(exprs);
        this.color = 'OrangeRed';
        this.name = name;
        this._args = args.map((a) => a.clone());
        this._wrapped_expr = expr;
    }
    get expr() { return this._wrapped_expr.clone(); }
    get args() { return this.holes.slice(1).map((a) => a.clone()); }
    get constructorArgs() {
        return [ this.name, this.expr.clone(), this.args ];
    }

    onmouseclick() {
        this.performReduction();
    }
    reduce() {
        if (!this.expr ||
            this.expr instanceof MissingExpression)
            return this;
        else {

            // This should 'reduce' by applying the arguments to the wrapped expression.
            // First, let's check that we HAVE arguments...
            var isValidArgument = (a) => a && (a instanceof Expression) && !(a instanceof MissingExpression);
            var validateAll = (arr, testfunc) => arr.reduce((prev, x) => prev && testfunc(x), true);
            let args = this.args;
            if (args.length === 0 || validateAll(args, isValidArgument)) { // true if all args valid

                // All the arguments check out. Now we need to apply them.
                let expr = this.expr;
                console.log(expr);

                if (args.length > 0)
                    expr = args.reduce((lambdaExpr, arg) => lambdaExpr.applyExpr(arg), expr); // Chains application to inner lambda expressions.

                Resource.play('define-convert');

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

// Analogous to 'define' in Scheme.
class DefineExpr extends ClampExpr {
    constructor(expr, name=null) {
        //let txt_define = new TextExpr('define');
        //txt_define.color = 'black';
        let txt_input = new Expression([ new TextExpr(name ? name : 'foo') ]); // TODO: Make this text input field (or dropdown menu).
        txt_input.color = 'Salmon';
        txt_input.radius = 2;
        txt_input.lock();
        super([txt_input, expr]);
        this.breakIndices = { top:1, mid:2, bot:2 }; // for ClampExpr
        this.color = 'OrangeRed';
        this.expr.shadowOffset = -2;
        if (name) this.funcname = name;

        this.notches = [ new WedgeNotch('left', 10, 10, 0.8, true) ];
    }
    get expr() { return this.children[1]; }
    get constructorArgs() { return [ this.expr.clone() ]; }
    // get notchPos() {
    //     return { x: this.pos.x, y: this.pos.y + this.radius + (this.size.h - this.radius * 2) * (1 - this.notch.relpos) };
    // }
    // onmousedrag(pos) {
    //     super.onmousedrag(pos);
    //
    //     if (this._attachNode) {
    //         this._attachNode.detachAttachment(this);
    //         this._attachNode = null;
    //     }
    //
    //     const ATTACHMENT_THRESHOLD = 20;
    //     let notchPos = this.notchPos;
    //     let attachmentNodes = this.stage.getRootNodesThatIncludeClass(NewInstanceExpr);
    //     attachmentNodes.forEach((node) => {
    //         if (!node.isAttached()) {
    //             let dist = distBetweenPos(notchPos, node.notchPos);
    //             if (dist < ATTACHMENT_THRESHOLD) {
    //                 node.stroke = { color:'magenta', lineWidth:4 };
    //                 this._attachProspect = node;
    //             } else {
    //                 node.stroke = null;
    //                 if (this._attachProspect && this._attachProspect == node)
    //                     this._attachProspect = null;
    //             }
    //         }
    //     });
    // }
    // onmouseup(pos) {
    //     super.onmouseup(pos);
    //     if (this._attachProspect) { // Snap this function block into the NewInstanceExpr notch:
    //         this._attachProspect.attach(this);
    //         this._attachNode = this._attachProspect;
    //         this._attachProspect = null;
    //     }
    // }
    onmouseclick() {

        if (this.funcname) {
            this.performReduction();
        }
        else {
            // For now, prompt the user for a function name:
            let funcname = window.prompt("What do you want to call it?", "foo");
            if (funcname) {
                this.funcname = funcname.trim();
                // Check that name has no spaces etc...
                if (funcname.indexOf(/\s+/g) === -1) {
                    this.performReduction();
                }
                else {
                    window.alert("Name can't have spaces. Try again with something simpler."); // cancel
                }
            }
        }
    }
    reduceCompletely() { return this; }
    reduce() {
        if (!this.expr ||
            this.expr instanceof MissingExpression)
            return this;
        else {

            if (this.funcname) {
                let funcname = this.funcname;
                let args = [];
                let numargs = 0;
                if (this.expr instanceof LambdaExpr)
                    numargs = this.expr.numOfNestedLambdas();
                for (let i = 0; i < numargs; i++)
                    args.push( new MissingExpression() );

                // Return named function (expression).
                let inf = new InfiniteExpression( new NamedExpr(funcname, this.expr.clone(), args) );
                inf.pos = addPos(this.expr.absolutePos, {x:inf.size.w/2.0, y:0});
                inf.anchor = { x:0, y:0.5 };
                //inf.pos = { x:this.stage.boundingSize.w, y:this.stage.toolbox.leftEdgePos.y };
                this.stage.add(inf);
                inf.update();
                this.stage.update();
                this.stage.toolbox.addExpression(inf);

                Resource.play('define');

                return inf;
            }

            return this; // cancel
        }
    }
    toString() { return '(define ' + this.expr.toString() + ')'; }
}
