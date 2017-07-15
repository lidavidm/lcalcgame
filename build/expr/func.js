'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// Acts as a named wrapper for a def'd expression.

var NamedFuncExpr = function (_Expression) {
    _inherits(NamedFuncExpr, _Expression);

    function NamedFuncExpr(name, paramNames) {
        _classCallCheck(this, NamedFuncExpr);

        var txt_name = void 0;
        var exprs = void 0;

        // Special case: Player has to enter name of call.
        if (name === '_t_varname') {
            var typebox = TypeInTextExpr.fromExprCode('_t_varname', function (final_txt) {
                // After the player 'commits' to a valid call name,
                // swap the text-enter field with plain text.
                _this.holes[0] = new TextExpr(final_txt + '(');
                _this.holes[0].color = 'black';
                _this.holes.splice(1, 1); // remove extra open parentheses
                _this.name = final_txt;
                _this.update();
            });
            txt_name = new TextExpr('');
            exprs = [typebox, txt_name];
        } else {
            txt_name = new TextExpr(name);
            txt_name.color = 'black';
            exprs = [txt_name];
        }

        // Special case: Player has to enter params of call.
        if (paramNames === '_t_params') {
            var params_typebox = TypeInTextExpr.fromExprCode('_t_params', function (final_txt) {
                // After the player 'commits' to valid call parameters,
                // swap the text-enter field with plain text.
                var dummy_call = 'foo' + final_txt;
                _this.holes[0].text += '(';
                _this.holes = [_this.holes[0]]; // remove everything but the call name
                var parsedArguments = __PARSER.parse(dummy_call).args;
                console.log(parsedArguments);
                for (var i = 0; i < parsedArguments.length; i++) {
                    if (i > 0) _this.holes.push(new TextExpr(','));
                    _this.holes.push(parsedArguments[i]);
                }
                _this.holes.push(new TextExpr(')'));
                _this.update();
            });
            exprs.push(params_typebox);
        } else {
            // Construct params from provided arguments.
            txt_name.text += '(';

            for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
                args[_key - 2] = arguments[_key];
            }

            for (var i = 0; i < args.length; i++) {
                if (i > 0) exprs.push(new TextExpr(','));
                exprs.push(args[i].clone());
            }
            exprs.push(new TextExpr(')'));
        }

        var _this = _possibleConstructorReturn(this, (NamedFuncExpr.__proto__ || Object.getPrototypeOf(NamedFuncExpr)).call(this, exprs));

        _this.newArgs = [];
        _this.color = 'OrangeRed';
        _this.name = name;
        _this.paramNames = paramNames;
        return _this;
    }

    _createClass(NamedFuncExpr, [{
        key: 'canReduce',
        value: function canReduce() {

            // First let's check that call is fully defined...
            if (this.hasPlaceholderChildren()) {
                var missing = this.getPlaceholderChildren();
                // If not, attempt to resolve inner typeboxes...
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = missing[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var m = _step.value;

                        if (m instanceof TypeInTextExpr && m.canReduce()) m.reduce();else m.animatePlaceholderStatus();
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }

                return false;
            } else if (this.funcExpr.hasPlaceholderChildren()) {
                this.funcExpr.animatePlaceholderChildren();
                return false;
            } else return true;
        }
    }, {
        key: 'onmouseclick',
        value: function onmouseclick() {
            //console.log(this);
            this.performReduction();
        }
    }, {
        key: 'reduce',
        value: function reduce() {
            if (!this.canReduce()) return this;

            var refDefineExpr = Level.getStage().functions[this.name];
            if (refDefineExpr == null) return this;

            this._wrapped_ref = refDefineExpr;
            this.scale = refDefineExpr.scale;
            var expr = this.funcExpr.expr.clone();

            for (var it = 1; it < this.holes.length; ++it) {
                this.holes[it] = this.holes[it].reduceCompletely();
            }

            if (!expr || expr instanceof MissingExpression) return this;else {

                // Blink any unfilled 'holes'
                var incomplete_exprs = mag.Stage.getNodesWithClass(MissingExpression, [], true, [expr]).filter(function (e) {
                    return !(e instanceof LambdaHoleExpr);
                });
                if (incomplete_exprs.length > 0) {
                    //console.log(incomplete_exprs);
                    incomplete_exprs.forEach(function (e) {
                        return Animate.blink(e, 1000, [1, 0, 0], 2);
                    });
                    return this;
                }

                // This should 'reduce' by applying the arguments to the wrapped expression.
                // First, let's check that we HAVE arguments...
                var isValidArgument = function isValidArgument(a) {
                    return a && a instanceof Expression && !(a instanceof MissingExpression);
                };
                var validateAll = function validateAll(arr, testfunc) {
                    return arr.reduce(function (prev, x) {
                        return prev && testfunc(x);
                    }, true);
                };
                var args = this.args;
                if (args.length === 0 || validateAll(args, isValidArgument)) {
                    // true if all args valid

                    // All the arguments check out. Now we need to apply them.
                    var _expr = this.funcExpr;

                    /*
                        TODO: Turn body of function into JS code, then execute that
                        and funnel the output into the ES6Parser to return the correct Reduct block:
                     */
                    // * We have to be very careful here, in case the program hangs! *
                    // eval("while(1) {}");
                    this._javaScriptFunction = _expr.toJavaScript();
                    if (this._javaScriptFunction) {
                        var js_code = '(' + this._javaScriptFunction + ")(" + args.map(function (a) {
                            return a.toJavaScript();
                        }).join(',') + ");";
                        var geval = eval; // equivalent to calling eval in the global scope
                        var rtn = void 0;
                        console.log(args);
                        console.log('Eval\'ing ', js_code);

                        try {
                            rtn = geval(js_code);
                            console.log('Result = ', rtn);
                            if (typeof rtn === "string") _expr = ES6Parser.parse('"' + rtn + '"');else _expr = ES6Parser.parse(rtn.toString());
                        } catch (e) {
                            if (e instanceof SyntaxError) {
                                console.warn(e.message);
                            }
                            console.log(e);
                            return this; // Abort
                        }
                    } else {
                            if (args.length > 0) {
                                _expr = _expr.expr.clone(); // get inner expression
                                _expr = args.reduce(function (lambdaExpr, arg) {
                                    return lambdaExpr.applyExpr(arg);
                                }, _expr); // Chains application to inner lambda expressions.
                            }
                        }

                    Resource.play('define-convert');

                    // Disable editing the DefineExpr after its been used once.
                    this._wrapped_ref.lockSubexpressions(function (e) {
                        return !(e instanceof DragPatch);
                    });
                    this._wrapped_ref.lock();

                    return _expr.clone(); // to be safe we'll clone it.
                }
            }

            return this;
        }

        // Whoa... meta.

    }, {
        key: 'toString',
        value: function toString() {
            var s = '(' + this.name; // e.g. '(length'
            var args = this.args;
            for (var i = 0; i < args.length; i++) {
                s += ' ' + args[i].toString();
            }s += ')';
            return s;
        }
    }, {
        key: 'toJavaScript',
        value: function toJavaScript() {
            var name = this.name;
            var args = this.args.map(function (x) {
                return x.toJavaScript();
            }).join(', ');
            return this.name + '(' + args + ')';
        }
    }, {
        key: 'expr',
        get: function get() {
            return new (Function.prototype.bind.apply(NamedFuncExpr, [null].concat([this.name, this.paramNames], _toConsumableArray(this.args))))();
        }
    }, {
        key: 'funcExpr',
        get: function get() {
            return this.stage.functions[this.name];
        }
    }, {
        key: 'args',
        get: function get() {
            var args = [];
            for (var i = 1; i < this.holes.length - 1; i++) {
                if (i % 2 === 1) args.push(this.holes[i].clone());
            }
            return args;
        }
    }, {
        key: 'constructorArgs',
        get: function get() {
            return [this.name, this.paramNames].concat(_toConsumableArray(this.args));
        }
    }]);

    return NamedFuncExpr;
}(Expression);