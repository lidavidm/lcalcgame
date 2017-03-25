'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 *  A parser converting a set of ES6 programs
 *  into a Reduct expression set.
 *
 *  Takes programs as a string,
 *  where each program is separated by a | (if multiple).
 */

var ES6Parser = function () {
    function ES6Parser() {
        _classCallCheck(this, ES6Parser);
    }

    _createClass(ES6Parser, null, [{
        key: 'lockFilter',
        value: function lockFilter(n) {
            if (n.__remain_unlocked) {
                n.__remain_unlocked = undefined;
                return false;
            } else return true;
        }
    }, {
        key: 'parse',
        value: function parse(program) {
            var _this = this;

            if (!esprima) {
                console.error('Cannot parse ES6 program: Esprima.js not found. \
            See http://esprima.readthedocs.io/en/latest/getting-started.html \
            for adding Esprima to your page.');
                return null;
            }

            if (program.split('|').length > 1) {
                return program.split('|').map(function (p) {
                    return _this.parse(p);
                });
            }
            // * if we reach here, we can assume single program...

            // Parse into AST using Esprima.js.
            var AST = esprima.parse(program);

            // If program has only one statement (;-separated code)
            // just parse and return that Expression.
            // Otherwise, parse all the statements into Expressions separately and
            // return a Sequence Expression (representing a multi-line program).
            var statements = AST.body;
            if (statements.length === 1) {
                var expr = this.parseNode(statements[0]);
                expr.lockSubexpressions(this.lockFilter);
                return expr;
            } else {
                var exprs = statements.map(function (n) {
                    return _this.parseNode(n);
                });
                var seq = new (Function.prototype.bind.apply(Sequence, [null].concat(_toConsumableArray(exprs))))();
                seq.lockSubexpressions(this.lockFilter);
                return seq;
            }
        }

        // Parse an AST node into Reduct expressions.

    }, {
        key: 'parseNode',
        value: function parseNode(ASTNode) {
            var _this2 = this;

            // To see all available types:
            // http://esprima.readthedocs.io/en/latest/syntax-tree-format.html
            var typeSwitcher = {

                /* A base-level token like 'x' */
                'Identifier': function Identifier(node) {

                    // Check if node is a Reduct reserved identifier (MissingExpression)
                    if (node.name === '_' || node.name === '_b' || node.name === '__') return new (ExprManager.getClass(node.name))();

                    // Otherwise, treat this as a variable name...
                    return new (ExprManager.getClass('var'))(node.name);
                },

                /* A primitive that's part of the language. Has 'value':
                    boolean | number | string | RegExp | null
                   and a corresponding 'raw' version, which is just the value-as-a-string.
                */
                'Literal': function Literal(node) {
                    if (node.value instanceof RegExp) {
                        console.error('Regular expressions are currently undefined.');
                        return null;
                    } else if (typeof node.value === 'string' || node.value instanceof String) {
                        if (ExprManager.isPrimitive(node.value)) {
                            // If this is the name of a Reduct primitive (like 'star')...
                            var primitiveArgs = {
                                'triangle': [0, 0, 44, 44],
                                'rect': [0, 0, 44, 44],
                                'star': [0, 0, 25, 5],
                                'circle': [0, 0, 22],
                                'diamond': [0, 0, 44, 44]
                            };
                            return new (Function.prototype.bind.apply(ExprManager.getClass(node.value), [null].concat(_toConsumableArray(primitiveArgs[node.value]))))();
                        } else {
                            // Otherwise this stands for a "string" value.
                            return new StringValueExpr(node.value);
                        }
                    } else if (Number.isNumber(node.value)) {
                        return new NumberExpr(node.value);
                    } else if (node.value === null) {
                        return new NullExpr(0, 0, 64, 64);
                    } else {
                        // Booleans should be left.
                        return new (ExprManager.getClass(node.raw))();
                    }
                },

                /* e.g. [2, true, x] */
                'ArrayExpression': function ArrayExpression(node) {
                    var arr = new (ExprManager.getClass('array'))(0, 0, 54, 54, []);
                    node.elements.forEach(function (e) {
                        return arr.addItem(_this2.parseNode(e));
                    });
                    return arr;
                },

                /* A single statement like (x == x); or (x) => x; */
                'ExpressionStatement': function ExpressionStatement(node) {
                    return _this2.parseNode(node.expression);
                },

                /* A function call of the form f(x) */
                'CallExpression': function CallExpression(node) {
                    if (node.callee.type === 'Identifier' && node.callee.name === '$') {
                        if (node.arguments.length === 0 || node.arguments.length > 1) {
                            console.error('Malformed unlock expression $ with ' + node.arguments.length + ' arguments.');
                            return null;
                        } else {
                            var unlocked_expr = _this2.parseNode(node.arguments[0]);
                            unlocked_expr.unlock();
                            unlocked_expr.__remain_unlocked = true; // When all inner expressions are locked in parse(), this won't be.
                            return unlocked_expr;
                        }
                    } else {
                        console.error('Call expressions outside of the special $() unlock syntax are currently undefined.');
                        return null;
                    }
                },

                /* Anonymous functions of the form (x) => x */
                'ArrowFunctionExpression': function ArrowFunctionExpression(node) {
                    if (node.params.length === 1 && node.params[0].type === 'Identifier') {
                        // Return new Lambda expression (anonymous function) at current stage of concreteness.
                        var lambda = new (ExprManager.getClass('lambda_abstraction'))([new (ExprManager.getClass('hole'))(node.params[0].name)]);
                        var body = _this2.parseNode(node.body);
                        lambda.addArg(body);
                        return lambda;
                    } else {
                        console.warn('Lambda expessions with more than one input are currently undefined.');
                        return null;
                    }
                },

                /*  BinaryExpression includes the operators:
                    'instanceof' | 'in' | '+' | '-' | '*' | '/' | '%' | '**' | '|' | '^' |
                    '&' | '==' | '!=' | '===' | '!==' | '<' | '>' | '<=' | '<<' | '>>' | '>>>'
                */
                'BinaryExpression': function BinaryExpression(node) {
                    if (ExprManager.hasClass(node.operator)) {
                        var BinaryExprClass = ExprManager.getClass(node.operator);
                        if (node.operator in CompareExpr.operatorMap()) return new BinaryExprClass(_this2.parseNode(node.left), _this2.parseNode(node.right), node.operator);else return new BinaryExprClass(_this2.parseNode(node.left), _this2.parseNode(node.right));
                    }
                },

                /*  Ternary expression ?:  */
                'ConditionalExpression': function ConditionalExpression(node) {
                    return new (ExprManager.getClass('ifelse'))(_this2.parseNode(node.test), _this2.parseNode(node.consequent), _this2.parseNode(node.alternate));
                }
            };

            // Apply!
            if (ASTNode.type in typeSwitcher) return typeSwitcher[ASTNode.type](ASTNode);else {
                console.error('@ ES6Parser.parseNode: No converter specified for AST Node of type ' + ASTNode.type);
                return null;
            }
        }
    }]);

    return ES6Parser;
}();