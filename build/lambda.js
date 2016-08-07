'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

/**
 * A lambda calculus parser in JS.
 */
var LambdaCalculus = function () {
    var pub = {};

    pub.config = {
        lambdaExpr: Circle,
        parenExpr: Expression,
        varExpr: Expression
    };
    var color_map = {};
    var nextColor = function nextColor() {
        return '#' + Math.floor(Math.random() * 16777215).toString(16);
    };
    var genLambda = function genLambda(name) {
        if (!(name in color_map)) color_map[name] = nextColor();
        var l = new pub.config.parenExpr();
        var hole = new pub.config.lambdaExpr(0, 0, 22, 5);
        hole.color = color_map[name];
        l.addArg(hole); // first hole is lambda expr
        return l;
    };
    var genParen = function genParen(name) {
        return new pub.config.parenExpr();
    };
    var genVar = function genVar(name) {
        if (!(name in color_map)) color_map[name] = nextColor();
        var v = new pub.config.varExpr();
        v.color = color_map[name];
        return v;
    };

    /**
     * Parse a lambda expression
     * @param  {array} lcalc_expr - A lambda calculus expression as an array like ['λx', ['x', 'y']]. (TODO: string support)
     * @return {AST} - The AST of the lambda calculus expression.
     */
    pub.parse = function (lcalc_expr) {

        return parse_recur(lcalc_expr);
    };
    var parse_recur = function parse_recur(lcalc_expr) {

        if (lcalc_expr.length === 0) return null;

        var exprs = [];
        for (var e = 0; e < lcalc_expr.length; e++) {

            // If first term is a lambda, strip it and assume the following terms are in parentheses.
            if (typeof lcalc_expr[e] === 'string' && lcalc_expr[e].indexOf('λ') > -1) {
                var lambda = genLambda(lcalc_expr[e].substring(1));
                for (var i = e + 1; i < lcalc_expr.length; i++) {
                    var next_expr = parse_recur(lcalc_expr[i]);
                    console.log('next_expr: ', lcalc_expr[i], ' from ', lcalc_expr);
                    if (next_expr) lambda.addArg(next_expr);
                }
                exprs.push(lambda);
                break;
            } else if (typeof lcalc_expr[e] === 'string') {
                // var name
                var var_expr = genVar(lcalc_expr[e]);
                exprs.push(var_expr);
            } else if (_typeof(lcalc_expr[e]) === 'object') {
                // array (parentheses)
                var paren_expr = genParen();
                var inside = parse_recur(lcalc_expr[e]);
                inside.forEach(function (exp) {
                    return paren_expr.addArg(exp);
                });
                exprs.push(paren_expr);
            }
        }

        if (exprs.length > 1) {
            var paren = genParen();
            exprs.forEach(function (exp) {
                return paren.addArg(exp);
            });
            console.log(paren);
            return paren;
        } else return exprs[0];
    };

    return pub;
}();