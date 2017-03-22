'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// Notch attachment node.

var NewInstanceExpr = function (_FadedValueExpr) {
    _inherits(NewInstanceExpr, _FadedValueExpr);

    function NewInstanceExpr() {
        _classCallCheck(this, NewInstanceExpr);

        var _this = _possibleConstructorReturn(this, (NewInstanceExpr.__proto__ || Object.getPrototypeOf(NewInstanceExpr)).call(this, '+'));

        _this.notch = new RectNotch('right', 10, 10, 0.5, false);
        _this.padding.right = 20;
        _this.shadowOffset = 6;
        _this.radius = 3;
        return _this;
    }

    return NewInstanceExpr;
}(FadedValueExpr);

// Acts as a named wrapper for a def'd expression.


var NamedExpr = function (_Expression) {
    _inherits(NamedExpr, _Expression);

    function NamedExpr(name, expr, args) {
        _classCallCheck(this, NamedExpr);

        var txt_name = new TextExpr(name);
        txt_name.color = 'black';
        var exprs = [txt_name];
        for (var i = 0; i < args.length; i++) {
            exprs.push(args[i].clone());
        }
        var _this2 = _possibleConstructorReturn(this, (NamedExpr.__proto__ || Object.getPrototypeOf(NamedExpr)).call(this, exprs));

        _this2.color = 'OrangeRed';
        _this2.name = name;
        _this2._args = args.map(function (a) {
            return a.clone();
        });
        _this2._wrapped_expr = expr;
        return _this2;
    }

    _createClass(NamedExpr, [{
        key: 'onmouseclick',
        value: function onmouseclick() {
            this.performReduction();
        }
    }, {
        key: 'reduce',
        value: function reduce() {
            if (!this.expr || this.expr instanceof MissingExpression) return this;else {

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
                    var expr = this.expr;
                    console.log(expr);

                    if (args.length > 0) expr = args.reduce(function (lambdaExpr, arg) {
                        return lambdaExpr.applyExpr(arg);
                    }, expr); // Chains application to inner lambda expressions.

                    Resource.play('define-convert');

                    return expr.clone(); // to be safe we'll clone it.
                }
            }

            return this;
        }

        // Whoa... meta.

    }, {
        key: 'toString',
        value: function toString() {
            var s = '(' + name; // e.g. '(length'
            var args = this.args;
            for (var i = 0; i < args.length; i++) {
                s += ' ' + args[i].toString();
            }s += ')';
            return s;
        }
    }, {
        key: 'expr',
        get: function get() {
            return this._wrapped_expr.clone();
        }
    }, {
        key: 'args',
        get: function get() {
            return this.holes.slice(1).map(function (a) {
                return a.clone();
            });
        }
    }, {
        key: 'constructorArgs',
        get: function get() {
            return [this.name, this.expr.clone(), this.args];
        }
    }]);

    return NamedExpr;
}(Expression);

// Analogous to 'define' in Scheme.


var DefineExpr = function (_ClampExpr) {
    _inherits(DefineExpr, _ClampExpr);

    function DefineExpr(expr) {
        var name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

        _classCallCheck(this, DefineExpr);

        //let txt_define = new TextExpr('define');
        //txt_define.color = 'black';
        var txt_input = new Expression([new TextExpr(name ? name : 'foo')]); // TODO: Make this text input field (or dropdown menu).
        txt_input.color = 'Salmon';
        txt_input.radius = 2;
        txt_input.lock();

        var _this3 = _possibleConstructorReturn(this, (DefineExpr.__proto__ || Object.getPrototypeOf(DefineExpr)).call(this, [txt_input, expr]));

        _this3.breakIndices = { top: 1, mid: 2, bot: 2 }; // for ClampExpr
        _this3.color = 'OrangeRed';
        _this3.expr.shadowOffset = -2;
        if (name) _this3.funcname = name;

        _this3.notch = new RectNotch('left', 10, 10, 0.8, true);
        return _this3;
    }

    _createClass(DefineExpr, [{
        key: 'onmouseclick',
        value: function onmouseclick() {

            if (this.funcname) {
                this.performReduction();
            } else {
                // For now, prompt the user for a function name:
                var funcname = window.prompt("What do you want to call it?", "foo");
                if (funcname) {
                    this.funcname = funcname.trim();
                    // Check that name has no spaces etc...
                    if (funcname.indexOf(/\s+/g) === -1) {
                        this.performReduction();
                    } else {
                        window.alert("Name can't have spaces. Try again with something simpler."); // cancel
                    }
                }
            }
        }
    }, {
        key: 'reduceCompletely',
        value: function reduceCompletely() {
            return this;
        }
    }, {
        key: 'reduce',
        value: function reduce() {
            if (!this.expr || this.expr instanceof MissingExpression) return this;else {

                if (this.funcname) {
                    var funcname = this.funcname;
                    var args = [];
                    var numargs = 0;
                    if (this.expr instanceof LambdaExpr) numargs = this.expr.numOfNestedLambdas();
                    for (var i = 0; i < numargs; i++) {
                        args.push(new MissingExpression());
                    } // Return named function (expression).
                    var inf = new InfiniteExpression(new NamedExpr(funcname, this.expr.clone(), args));
                    inf.pos = addPos(this.expr.absolutePos, { x: inf.size.w / 2.0, y: 0 });
                    inf.anchor = { x: 0, y: 0.5 };
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
    }, {
        key: 'toString',
        value: function toString() {
            return '(define ' + this.expr.toString() + ')';
        }
    }, {
        key: 'expr',
        get: function get() {
            return this.children[1];
        }
    }, {
        key: 'constructorArgs',
        get: function get() {
            return [this.expr.clone()];
        }
    }]);

    return DefineExpr;
}(ClampExpr);