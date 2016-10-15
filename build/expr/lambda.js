'use strict';

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Lambda calculus versions of Expression objects.
 * The LambdaHoleExpr performs substitution on LambdaVar subexpressions in its parent expression context.
 * -----------------------------------------------
 * */
var LambdaHoleExpr = function (_MissingExpression) {
    _inherits(LambdaHoleExpr, _MissingExpression);

    _createClass(LambdaHoleExpr, [{
        key: 'openImage',
        get: function get() {
            return this.name === 'x' ? 'lambda-hole' : 'lambda-hole-red';
        }
    }, {
        key: 'closedImage',
        get: function get() {
            return this.name === 'x' ? 'lambda-hole-closed' : 'lambda-hole-red-closed';
        }
    }, {
        key: 'openingAnimation',
        get: function get() {
            var anim = new mag.Animation();
            anim.addFrame('lambda-hole-opening0', 50);
            anim.addFrame('lambda-hole-opening1', 50);
            anim.addFrame('lambda-hole', 50);
            return anim;
        }
    }, {
        key: 'closingAnimation',
        get: function get() {
            var anim = new mag.Animation();
            anim.addFrame('lambda-hole-opening1', 50);
            anim.addFrame('lambda-hole-opening0', 50);
            anim.addFrame('lambda-hole-closed', 50);
            return anim;
        }
    }]);

    function LambdaHoleExpr(varname) {
        _classCallCheck(this, LambdaHoleExpr);

        var _this2 = _possibleConstructorReturn(this, (LambdaHoleExpr.__proto__ || Object.getPrototypeOf(LambdaHoleExpr)).call(this, null));

        _this2._name = varname;
        _this2.color = _this2.colorForVarName();
        _this2.image = _this2.openImage;
        _this2.isOpen = true;
        return _this2;
    }

    _createClass(LambdaHoleExpr, [{
        key: 'colorForVarName',
        value: function colorForVarName() {
            return LambdaHoleExpr.colorForVarName(this.name);
        }

        // Draw special circle representing a hole.

    }, {
        key: 'drawInternal',
        value: function drawInternal(ctx, pos, boundingSize) {
            var rad = boundingSize.w / 2.0;
            setStrokeStyle(ctx, this.stroke);
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(pos.x + rad, pos.y + rad, rad, 0, 2 * Math.PI);
            ctx.drawImage(Resource.getImage(this.image), pos.x, pos.y, boundingSize.w, boundingSize.h);
            if (this.stroke) ctx.stroke();
        }

        // Accessibility

    }, {
        key: 'open',
        value: function open() {
            var _this3 = this;

            if (!this.isOpen) {
                if (this.stage) {
                    if (this._runningAnim) this._runningAnim.cancel();
                    this._runningAnim = Animate.play(this.openingAnimation, this, function () {
                        _this3.image = _this3.openImage;
                        if (_this3.stage) _this3.stage.draw();
                    });
                } else this.image = this.openImage;
                this.isOpen = true;
            }
        }
    }, {
        key: 'close',
        value: function close() {
            var _this4 = this;

            if (this.isOpen) {
                if (this.stage) {
                    if (this._runningAnim) this._runningAnim.cancel();
                    this._runningAnim = Animate.play(this.closingAnimation, this, function () {
                        _this4.image = _this4.closedImage;
                        if (_this4.stage) _this4.stage.draw();
                    });
                } else this.image = this.closedImage;
                this.isOpen = false;
            }
        }
    }, {
        key: 'hits',
        value: function hits(pos) {
            var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;

            if (this.isOpen) return _get(LambdaHoleExpr.prototype.__proto__ || Object.getPrototypeOf(LambdaHoleExpr.prototype), 'hits', this).call(this, pos, options);else return null;
        }
    }, {
        key: 'applyExpr',
        value: function applyExpr(node) {
            if (!this.parent) {
                console.error('@ LambdaHoleExpr.applyExpr: No parent LambdaExpr.');
                return false;
            }

            var parent = this.parent;
            parent.getEnvironment().update(this.name, node);

            // Now remove this hole from its parent expression.
            parent.removeArg(this);

            // GAME DESIGN CHOICE: Automatically break apart parenthesized values.
            // * If we don't do this, the player can stick everything into one expression and destroy that expression
            // * to destroy as many expressions as they like with a single destruction piece. And that kind of breaks gameplay.
            return parent.performReduction();
        }

        // Events

    }, {
        key: 'onmousedrag',
        value: function onmousedrag(pos) {
            if (this.parent) {
                pos = addPos(pos, fromTo(this.absolutePos, this.parent.absolutePos));
                this.parent.onmousedrag(pos);
            }
        }
    }, {
        key: 'onmouseenter',
        value: function onmouseenter(pos) {
            _get(LambdaHoleExpr.prototype.__proto__ || Object.getPrototypeOf(LambdaHoleExpr.prototype), 'onmouseenter', this).call(this, pos);
            if (this.stage) {
                this.stage.environmentDisplay.showEnvironment(this.getEnvironment());
            }
        }
    }, {
        key: 'onmouseleave',
        value: function onmouseleave() {
            _get(LambdaHoleExpr.prototype.__proto__ || Object.getPrototypeOf(LambdaHoleExpr.prototype), 'onmouseleave', this).call(this);
            if (this.stage) {
                this.stage.environmentDisplay.showGlobals();
            }
        }
    }, {
        key: 'ondropenter',
        value: function ondropenter(node, pos) {
            var _this5 = this;

            if (node instanceof LambdaHoleExpr) node = node.parent;
            _get(LambdaHoleExpr.prototype.__proto__ || Object.getPrototypeOf(LambdaHoleExpr.prototype), 'ondropenter', this).call(this, node, pos);

            // Special case: Funnel representation of 'map' hovered over hole.
            // if (node instanceof FunnelMapFunc) {
            //     node.onmouseenter();
            //     return;
            // }

            node.opacity = 0.4;

            if (this.parent) {
                // Ignore variables that are shadowed when previewing
                var subvarexprs = findNoncapturingVarExpr(this.parent, this.name);

                subvarexprs.forEach(function (e) {
                    if (e.name === _this5.name) {
                        var preview_node = node.clone();
                        preview_node.opacity = 1.0;
                        preview_node.bindSubexpressions();
                        e.open(preview_node);
                    }
                });
                this.opened_subexprs = subvarexprs;
                this.close_opened_subexprs = function () {
                    if (!_this5.opened_subexprs) return;
                    _this5.opened_subexprs.forEach(function (e) {
                        e.close();
                    });
                    _this5.opened_subexprs = null;
                };
            }
        }
    }, {
        key: 'ondropexit',
        value: function ondropexit(node, pos) {
            if (node instanceof LambdaHoleExpr) node = node.parent;

            _get(LambdaHoleExpr.prototype.__proto__ || Object.getPrototypeOf(LambdaHoleExpr.prototype), 'ondropexit', this).call(this, node, pos);

            // if (node instanceof FunnelMapFunc) {
            //     return;
            // }

            if (node) node.opacity = 1.0;
            this.close_opened_subexprs();
        }
    }, {
        key: 'ondropped',
        value: function ondropped(node, pos) {
            var _this6 = this;

            if (node instanceof LambdaHoleExpr) node = node.parent;
            if (node.dragging) {
                // Make sure node is being dragged by the user.

                // Special case: Funnel dropped over hole.
                // if (node instanceof FunnelMapFunc) {
                //     node.func = this.parent;
                //     this.parent.parent = null;
                //     this.parent.stage.remove(this.parent);
                //     this.onmouseleave();
                //     this.parent.onmouseenter();
                //     node.update();
                //     return;
                // }

                var afterDrop = function afterDrop() {
                    // Cleanup
                    node.opacity = 1.0;
                    _this6.close_opened_subexprs();

                    // User dropped an expression into the lambda hole.
                    Resource.play('pop');

                    // Clone the dropped expression.
                    var dropped_expr = node.clone();

                    // Save the current state of the board.
                    var stage = node.stage;
                    stage.saveState();

                    Logger.log('state-save', stage.toString());

                    // Remove the original expression from its stage.
                    stage.remove(node);

                    // If this hole is part of a larger expression tree (it should be!),
                    // attempt recursive substitution on any found LambdaVarExpressions.
                    if (_this6.parent) {
                        var parent = _this6.parent;
                        var orig_exp_str = _this6.parent.toString();
                        var dropped_exp_str = node.toString();

                        _this6.applyExpr(node);

                        // Log the reduction.
                        Logger.log('reduction-lambda', { 'before': orig_exp_str, 'applied': dropped_exp_str, 'after': parent.toString() });
                        Logger.log('state-save', stage.toString());

                        if (parent.children.length === 0) {

                            // This hole expression is a destructor token.
                            // (a) Play nifty 'POOF' animation.
                            Animate.poof(parent);

                            // (b) Remove expression from the parent stage.
                            (parent.parent || parent.stage).remove(parent);
                        } else stage.dumpState();
                    } else {
                        console.warn('ERROR: Cannot perform lambda-substitution: Hole has no parent.');

                        // Hole is singular; acts as abyss. Remove it after one drop.
                        _this6.stage.remove(_this6);
                    }

                    stage.update();
                };

                if (level_idx < 1) {
                    Animate.tween(node, { opacity: 0 }, 400, function (elapsed) {
                        return Math.pow(elapsed, 0.5);
                    }).after(afterDrop);
                } else afterDrop();
            }
        }
    }, {
        key: 'toString',
        value: function toString() {
            return 'λ' + this.name;
        }
    }, {
        key: 'name',
        get: function get() {
            return this._name;
        },
        set: function set(n) {
            this._name = n;
        }
    }], [{
        key: 'colorForVarName',
        value: function colorForVarName(v) {

            if (v === 'x') return 'lightgray';else return 'white'; //'IndianRed';

            // return {
            //
            //     'x':'orange',
            //     'y':'IndianRed',
            //     'z':'green',
            //     'w':'blue'
            //
            // }[v];
        }
    }]);

    return LambdaHoleExpr;
}(MissingExpression);

var LambdaVarExpr = function (_ImageExpr) {
    _inherits(LambdaVarExpr, _ImageExpr);

    function LambdaVarExpr(varname) {
        _classCallCheck(this, LambdaVarExpr);

        var _this7 = _possibleConstructorReturn(this, (LambdaVarExpr.__proto__ || Object.getPrototypeOf(LambdaVarExpr)).call(this, 0, 0, 54 * 1.2, 70 * 1.2, 'lambda-pipe'));

        _this7.graphicNode.offset = { x: 0, y: -8 };
        _this7.name = varname ? varname.replace('_', '') : undefined;
        _this7.ignoreEvents = true;
        _this7.handleOffset = -8;

        // Graphic animation.
        _this7.stateGraph.enter('closed');
        return _this7;
    }

    _createClass(LambdaVarExpr, [{
        key: 'clone',
        value: function clone() {
            var c = _get(LambdaVarExpr.prototype.__proto__ || Object.getPrototypeOf(LambdaVarExpr.prototype), 'clone', this).call(this);
            c._stateGraph = null;
            c.stateGraph.enter('closed');
            return c;
        }
    }, {
        key: 'hits',
        value: function hits(pos, options) {
            if (this.holes[0].hits(pos, options)) return this;else return null;
        }
    }, {
        key: 'onmouseenter',
        value: function onmouseenter(pos) {
            if (this.stage) {
                this.stage.environmentDisplay.showEnvironment(this.getEnvironment());
                this.stage.environmentDisplay.highlightName(this.name);
            }
        }
    }, {
        key: 'onmouseleave',
        value: function onmouseleave(pos) {
            if (this.stage) {
                this.stage.environmentDisplay.clearHighlight();
                this.stage.environmentDisplay.showGlobals();
            }
        }
    }, {
        key: 'onmouseclick',
        value: function onmouseclick(pos) {
            // TODO: DML enable reduction, but make sure we are not bound
            // by a lambda
            if (!this.parent) {
                this.performReduction();
            }
        }
    }, {
        key: 'open',
        value: function open() {
            var _this8 = this;

            var preview_expr = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

            if (this.stateGraph.currentState !== 'open') {
                (function () {
                    _this8.stateGraph.enter('opening');

                    var _this = _this8;
                    var stage = _this8.stage;

                    if (preview_expr) {
                        (function () {
                            var stateGraph = _this8.stateGraph;
                            Animate.wait(140).after(function () {
                                if (stateGraph.currentState === 'opening' || stateGraph.currentState === 'open') {
                                    var scale = _this8.graphicNode.size.w / preview_expr.size.w * 0.8;
                                    preview_expr.pos = { x: _this8.children[0].size.w / 2.0, y: -10 };
                                    preview_expr.scale = { x: scale, y: scale };
                                    preview_expr.anchor = { x: 0.5, y: 0 };
                                    preview_expr.stroke = null;
                                    _this.graphicNode.addChild(preview_expr);
                                    stage.draw();
                                }
                            });
                        })();
                    }
                })();
            }
        }
    }, {
        key: 'close',
        value: function close() {
            if (this.stateGraph.currentState !== 'closed') {
                var stage = this.stage;
                this.stateGraph.enter('closing');
                this.graphicNode.children = [];
                stage.draw();
            }
        }
    }, {
        key: 'reduce',
        value: function reduce() {
            var environment = this.getEnvironment();
            var value = environment.lookup(this.name);

            if (value) {
                var clone = value.clone();
                clone.stage = null;
                clone.bindSubexpressions();
                var parent = this.parent || this.stage;
                if (parent) {
                    parent.swap(this, clone);
                    if (this.parent) {
                        this.parent.bindSubexpressions();

                        if (this.parent instanceof IfStatement && this.parent.cond instanceof CompareExpr) {
                            this.parent.cond.unlock();
                        }
                    }
                }
                return clone;
            }
            return this;
        }

        //onmousedrag() {}

    }, {
        key: 'drawInternal',
        value: function drawInternal(ctx, pos, boundingSize) {
            _get(LambdaVarExpr.prototype.__proto__ || Object.getPrototypeOf(LambdaVarExpr.prototype), 'drawInternal', this).call(this, ctx, pos, boundingSize);
            if (ctx && !this.parent) {
                this.scale = { x: 0.8, y: 0.8 };
                drawCircle(ctx, pos.x, pos.y + this.handleOffset + this.shadowOffset, boundingSize.w / 2.0, 'black', this.graphicNode.stroke);
                drawCircle(ctx, pos.x, pos.y + this.handleOffset, boundingSize.w / 2.0, 'lightgray', this.graphicNode.stroke);
            }
        }
    }, {
        key: 'value',
        value: function value() {
            return undefined;
        }
    }, {
        key: 'toString',
        value: function toString() {
            return '#' + (this.ignoreEvents ? '' : '_') + this.name;
        }
    }, {
        key: 'openImage',
        get: function get() {
            return this.name === 'x' ? 'lambda-pipe-open' : 'lambda-pipe-red-open';
        }
    }, {
        key: 'closedImage',
        get: function get() {
            return this.name === 'x' ? 'lambda-pipe' : 'lambda-pipe-red';
        }
    }, {
        key: 'openingAnimation',
        get: function get() {
            var anim = new mag.Animation();
            anim.addFrame('lambda-pipe-opening0', 50);
            anim.addFrame('lambda-pipe-opening1', 50);
            anim.addFrame('lambda-pipe-open', 50);
            return anim;
        }
    }, {
        key: 'closingAnimation',
        get: function get() {
            var anim = new mag.Animation();
            anim.addFrame('lambda-pipe-opening1', 50);
            anim.addFrame('lambda-pipe-opening0', 50);
            anim.addFrame('lambda-pipe', 50);
            return anim;
        }
    }, {
        key: 'stateGraph',
        get: function get() {
            var _this9 = this;

            if (!this._stateGraph) {
                var g = new mag.StateGraph();
                g.addState('closed', function () {
                    _this9.image = _this9.closedImage;
                });
                if (this.stage) this.stage.draw();
                g.addState('opening', function () {
                    var anim = _this9.openingAnimation;
                    Animate.play(anim, _this9, function () {
                        if (g.currentState === 'opening') g.enter('open');
                    });
                });
                g.addState('open', function () {
                    _this9.image = _this9.openImage;
                });
                if (this.stage) this.stage.draw();
                g.addState('closing', function () {
                    var anim = _this9.closingAnimation;
                    Animate.play(anim, _this9, function () {
                        if (g.currentState === 'closing') g.enter('closed');
                    });
                });
                this._stateGraph = g;
            }
            return this._stateGraph;
        }
    }]);

    return LambdaVarExpr;
}(ImageExpr);

var LambdaExpr = function (_Expression) {
    _inherits(LambdaExpr, _Expression);

    function LambdaExpr(exprs) {
        _classCallCheck(this, LambdaExpr);

        var _this10 = _possibleConstructorReturn(this, (LambdaExpr.__proto__ || Object.getPrototypeOf(LambdaExpr)).call(this, exprs));

        _this10.environment = new Environment();
        if (_this10.takesArgument) {
            _this10.environment.bound[exprs[0].name] = true;
        }

        /*let txt = new TextExpr('→');
        txt.color = 'gray'
        this.addArg(txt);*/
        return _this10;
    }

    _createClass(LambdaExpr, [{
        key: 'getEnvironment',
        value: function getEnvironment() {
            var env = _get(LambdaExpr.prototype.__proto__ || Object.getPrototypeOf(LambdaExpr.prototype), 'getEnvironment', this).call(this);
            if (!env.parent && this.stage) {
                env.parent = this.stage.environment;
            }
            return env;
        }
    }, {
        key: 'applyExpr',
        value: function applyExpr(node) {
            if (this.takesArgument) {
                return this.holes[0].applyExpr(node);
            } else return this;
        }
    }, {
        key: 'numOfNestedLambdas',
        value: function numOfNestedLambdas() {
            if (!this.takesArgument || !this.fullyDefined) return 0;else if (this.holes.length < 2) return 1;else {
                return 1 + (this.holes[1] instanceof LambdaExpr ? this.holes[1].numOfNestedLambdas() : 0);
            }
        }
    }, {
        key: 'addChild',
        value: function addChild(c) {
            _get(LambdaExpr.prototype.__proto__ || Object.getPrototypeOf(LambdaExpr.prototype), 'addChild', this).call(this, c);

            // Color all subvarexpr's of child consistently with their names.
            if (this.takesArgument) {
                this.updateHole();

                var hole = this.holes[0];
                var lvars = mag.Stage.getNodesWithClass(LambdaVarExpr, [], true, [this]);
                lvars.forEach(function (v) {
                    if (v.name === hole.name) {
                        v.color = hole.colorForVarName();
                    }
                });
            }
        }
    }, {
        key: 'updateHole',
        value: function updateHole() {
            // Determine whether this LambdaExpr has any MissingExpressions:
            if (this.holes[0].name !== 'x') this.color = this.holes[0].color;
            var missing = !this.fullyDefined;
            if (missing || this.parent && this.parent instanceof FuncExpr && !this.parent.isAnimating) // ||
                //this.parent instanceof LambdaExpr && this.parent.takesArgument)))
                this.holes[0].close();else this.holes[0].open();
        }

        // Close lambda holes appropriately.

    }, {
        key: 'swap',
        value: function swap(node, otherNode) {
            _get(LambdaExpr.prototype.__proto__ || Object.getPrototypeOf(LambdaExpr.prototype), 'swap', this).call(this, node, otherNode);
            if (this.takesArgument) {
                if (otherNode instanceof MissingExpression) {
                    // if expression was removed...
                    this.holes[0].close(); // close the hole, undoubtedly
                } else if (node instanceof MissingExpression) {
                    // if expression was placed...
                    this.updateHole();
                }
            }
        }
    }, {
        key: 'onmouseclick',
        value: function onmouseclick(pos) {
            this.performReduction();
        }
    }, {
        key: 'onmouseenter',
        value: function onmouseenter(pos) {
            _get(LambdaExpr.prototype.__proto__ || Object.getPrototypeOf(LambdaExpr.prototype), 'onmouseenter', this).call(this, pos);
            if (this.stage) {
                this.stage.environmentDisplay.showEnvironment(this.getEnvironment());
            }
        }
    }, {
        key: 'onmouseleave',
        value: function onmouseleave() {
            _get(LambdaExpr.prototype.__proto__ || Object.getPrototypeOf(LambdaExpr.prototype), 'onmouseleave', this).call(this);
            if (this.stage) {
                this.stage.environmentDisplay.showGlobals();
            }
        }
    }, {
        key: 'hitsChild',
        value: function hitsChild(pos) {
            if (this.isParentheses) return null;
            return _get(LambdaExpr.prototype.__proto__ || Object.getPrototypeOf(LambdaExpr.prototype), 'hitsChild', this).call(this, pos);
        }
    }, {
        key: 'reduce',
        value: function reduce() {
            // Remove 'parentheses':
            if (this.isParentheses) {
                return this.holes;
            } else return _get(LambdaExpr.prototype.__proto__ || Object.getPrototypeOf(LambdaExpr.prototype), 'reduce', this).call(this);
        }
    }, {
        key: 'performReduction',
        value: function performReduction() {
            var _this11 = this;

            // If we don't have all our arguments, refuse to evaluate.
            if (this.takesArgument) {
                return this;
            }

            // Perform substitution, but stop at the 'boundary' of another lambda.
            var varExprs = findNoncapturingVarExpr(this, null, true);
            var environment = this.getEnvironment();
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = varExprs[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var expr = _step.value;

                    expr.reduce();
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

            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = this.holes[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var child = _step2.value;

                    if (child instanceof LambdaExpr) {
                        // TODO: need to recurse down into children, but not children of lambdas
                        child.environment.parent = this.environment;
                    }
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                        _iterator2.return();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }

            var reduced_expr = this.reduce();
            if (reduced_expr && reduced_expr != this) {
                // Only swap if reduction returns something > null.

                if (this.stage) this.stage.saveState();

                var parent;
                if (Array.isArray(reduced_expr)) {
                    if (reduced_expr.length === 1) {
                        reduced_expr = reduced_expr[0];
                    } // reduce to single argument
                    else if (this.parent) return; // cannot reduce a parenthetical expression with > 1 subexpression.
                        else {
                                parent = this.stage;
                                reduced_expr.forEach(function (e) {
                                    if (_this11.locked) e.lock();else e.unlock();
                                });
                                parent.swap(this, reduced_expr); // swap 'this' (on the board) with an array of its reduced expressions
                                return reduced_expr;
                            }
                }

                parent = this.parent ? this.parent : this.stage;
                if (this.locked) reduced_expr.lock(); // the new expression should inherit whatever this expression was capable of as input
                else reduced_expr.unlock();
                //console.warn(this, reduced_expr);
                if (parent) parent.swap(this, reduced_expr);

                if (reduced_expr.parent) {
                    var try_reduce = reduced_expr.parent.reduceCompletely();
                    if (try_reduce != reduced_expr.parent && try_reduce !== null) {
                        Animate.blink(reduced_expr.parent, 400, [0, 1, 0]);
                    }
                }

                return reduced_expr;
            }
        }
    }, {
        key: 'reduceCompletely',
        value: function reduceCompletely() {
            // Try to reduce this expression and its subexpressions as completely as possible.

            // If the inner expression reduces to null when it takes an argument, this lambda expression itself should disappear.
            if (this.takesArgument && this.fullyDefined && this.holes.length === 2 && this.holes[1].reduceCompletely() === null) {

                console.error('HELLO');
                return null;
            } else return _get(LambdaExpr.prototype.__proto__ || Object.getPrototypeOf(LambdaExpr.prototype), 'reduceCompletely', this).call(this);
        }
    }, {
        key: 'toString',
        value: function toString() {
            if (this.holes.length === 1 && this.holes[0] instanceof LambdaHoleExpr) return '(' + _get(LambdaExpr.prototype.__proto__ || Object.getPrototypeOf(LambdaExpr.prototype), 'toString', this).call(this) + ')';else return _get(LambdaExpr.prototype.__proto__ || Object.getPrototypeOf(LambdaExpr.prototype), 'toString', this).call(this);
        }
    }, {
        key: 'isParentheses',
        get: function get() {
            return this.holes.length > 0 && !this.takesArgument;
        }
    }, {
        key: 'takesArgument',
        get: function get() {
            return this.holes.length > 0 && this.holes[0] instanceof LambdaHoleExpr;
        }
    }, {
        key: 'fullyDefined',
        get: function get() {
            // If one arg is MissingExpression, this will be false.
            if (this.holes.length < 2) return true;
            return this.holes.slice(1).reduce(function (prev, arg) {
                return prev && !(arg instanceof MissingExpression);
            }, true);
        }
    }, {
        key: 'isConstantFunction',
        get: function get() {
            return this.takesArgument && mag.Stage.getNodesWithClass(LambdaVarExpr, [], true, [this]).length === 0;
        }
    }, {
        key: 'body',
        get: function get() {
            return this.takesArgument ? this.holes[1] : null;
        }
    }]);

    return LambdaExpr;
}(Expression);

/** Faded lambda variants. */


var FadedLambdaHoleExpr = function (_LambdaHoleExpr) {
    _inherits(FadedLambdaHoleExpr, _LambdaHoleExpr);

    function FadedLambdaHoleExpr() {
        _classCallCheck(this, FadedLambdaHoleExpr);

        return _possibleConstructorReturn(this, (FadedLambdaHoleExpr.__proto__ || Object.getPrototypeOf(FadedLambdaHoleExpr)).apply(this, arguments));
    }

    _createClass(FadedLambdaHoleExpr, [{
        key: 'openImage',
        get: function get() {
            return this.name === 'x' ? 'lambda-hole-x' : 'lambda-hole-y';
        }
    }, {
        key: 'closedImage',
        get: function get() {
            return this.name === 'x' ? 'lambda-hole-x-closed' : 'lambda-hole-y-closed';
        }
    }]);

    return FadedLambdaHoleExpr;
}(LambdaHoleExpr);

var HalfFadedLambdaHoleExpr = function (_LambdaHoleExpr2) {
    _inherits(HalfFadedLambdaHoleExpr, _LambdaHoleExpr2);

    function HalfFadedLambdaHoleExpr() {
        _classCallCheck(this, HalfFadedLambdaHoleExpr);

        return _possibleConstructorReturn(this, (HalfFadedLambdaHoleExpr.__proto__ || Object.getPrototypeOf(HalfFadedLambdaHoleExpr)).apply(this, arguments));
    }

    _createClass(HalfFadedLambdaHoleExpr, [{
        key: 'openImage',
        get: function get() {
            return this.name === 'x' ? 'lambda-hole-xside' : 'lambda-hole-y';
        }
    }, {
        key: 'closedImage',
        get: function get() {
            return this.name === 'x' ? 'lambda-hole-xside-closed' : 'lambda-hole-y-closed';
        }
    }]);

    return HalfFadedLambdaHoleExpr;
}(LambdaHoleExpr);

var FadedPythonLambdaHoleExpr = function (_LambdaHoleExpr3) {
    _inherits(FadedPythonLambdaHoleExpr, _LambdaHoleExpr3);

    function FadedPythonLambdaHoleExpr() {
        _classCallCheck(this, FadedPythonLambdaHoleExpr);

        return _possibleConstructorReturn(this, (FadedPythonLambdaHoleExpr.__proto__ || Object.getPrototypeOf(FadedPythonLambdaHoleExpr)).apply(this, arguments));
    }

    _createClass(FadedPythonLambdaHoleExpr, [{
        key: 'drawInternal',


        // Draw special round rect around term.
        value: function drawInternal(ctx, pos, boundingSize) {
            setStrokeStyle(ctx, this.stroke);
            ctx.fillStyle = this.color;
            ctx.drawImage(Resource.getImage(this.image), pos.x, pos.y, boundingSize.w, boundingSize.h);
            if (this.stroke) {
                roundRect(ctx, pos.x, pos.y, boundingSize.w, boundingSize.h, 6, false, true, this.stroke.opacity);
            }
        }
    }, {
        key: 'openImage',
        get: function get() {
            return this.name === 'x' ? 'lambda-hole-x-python' : 'lambda-hole-y';
        }
    }, {
        key: 'closedImage',
        get: function get() {
            return this.name === 'x' ? 'lambda-hole-x-closed-python' : 'lambda-hole-y-closed';
        }
    }, {
        key: 'size',
        get: function get() {
            var sz = _get(FadedPythonLambdaHoleExpr.prototype.__proto__ || Object.getPrototypeOf(FadedPythonLambdaHoleExpr.prototype), 'size', this);
            sz.w = 120;
            return sz;
        }
    }]);

    return FadedPythonLambdaHoleExpr;
}(LambdaHoleExpr);

var FadedES6LambdaHoleExpr = function (_FadedPythonLambdaHol) {
    _inherits(FadedES6LambdaHoleExpr, _FadedPythonLambdaHol);

    function FadedES6LambdaHoleExpr() {
        _classCallCheck(this, FadedES6LambdaHoleExpr);

        return _possibleConstructorReturn(this, (FadedES6LambdaHoleExpr.__proto__ || Object.getPrototypeOf(FadedES6LambdaHoleExpr)).apply(this, arguments));
    }

    _createClass(FadedES6LambdaHoleExpr, [{
        key: 'hits',


        // Events
        value: function hits(pos, options) {
            if (this.ignoreEvents) return null; // All children are ignored as well.
            else if (!this.isOpen) return null;

            if (typeof options !== 'undefined' && options.hasOwnProperty('exclude')) {
                var _iteratorNormalCompletion3 = true;
                var _didIteratorError3 = false;
                var _iteratorError3 = undefined;

                try {
                    for (var _iterator3 = options.exclude[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                        var e = _step3.value;

                        if (e == this) return null;
                    }
                } catch (err) {
                    _didIteratorError3 = true;
                    _iteratorError3 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion3 && _iterator3.return) {
                            _iterator3.return();
                        }
                    } finally {
                        if (_didIteratorError3) {
                            throw _iteratorError3;
                        }
                    }
                }
            }

            var hitChild = this.hitsChild(pos, options);
            if (hitChild) return hitChild;

            // Hasn't hit any children, so test if the point lies on this node.
            var boundingSize = this.absoluteSize;
            boundingSize.w /= 2.0;
            var upperLeftPos = this.upperLeftPos(this.absolutePos, boundingSize);
            if (pointInRect(pos, rectFromPosAndSize(upperLeftPos, boundingSize))) return this;else return null;
        }

        // Draw special round rect around just x term.

    }, {
        key: 'drawInternal',
        value: function drawInternal(ctx, pos, boundingSize) {
            setStrokeStyle(ctx, this.stroke);
            ctx.fillStyle = this.color;
            ctx.drawImage(Resource.getImage(this.image), pos.x, pos.y, boundingSize.w, boundingSize.h);
            if (this.stroke) {
                roundRect(ctx, pos.x, pos.y, boundingSize.w / 2.0, boundingSize.h, 6, false, true, this.stroke.opacity);
            }
        }
    }, {
        key: 'openImage',
        get: function get() {
            return this.name === 'x' ? 'lambda-hole-x-es6' : 'lambda-hole-y';
        }
    }, {
        key: 'closedImage',
        get: function get() {
            return this.name === 'x' ? 'lambda-hole-x-closed-es6' : 'lambda-hole-y-closed';
        }
    }]);

    return FadedES6LambdaHoleExpr;
}(FadedPythonLambdaHoleExpr);

var HalfFadedLambdaVarExpr = function (_LambdaVarExpr) {
    _inherits(HalfFadedLambdaVarExpr, _LambdaVarExpr);

    function HalfFadedLambdaVarExpr() {
        _classCallCheck(this, HalfFadedLambdaVarExpr);

        return _possibleConstructorReturn(this, (HalfFadedLambdaVarExpr.__proto__ || Object.getPrototypeOf(HalfFadedLambdaVarExpr)).apply(this, arguments));
    }

    _createClass(HalfFadedLambdaVarExpr, [{
        key: 'openImage',
        get: function get() {
            return 'lambda-pipe-open';
        }
    }, {
        key: 'closedImage',
        get: function get() {
            return this.name === 'x' ? 'lambda-pipe-xside-closed' : 'lambda-pipe-xside-closed';
        }
    }]);

    return HalfFadedLambdaVarExpr;
}(LambdaVarExpr);

var FadedLambdaVarExpr = function (_LambdaVarExpr2) {
    _inherits(FadedLambdaVarExpr, _LambdaVarExpr2);

    function FadedLambdaVarExpr(varname) {
        _classCallCheck(this, FadedLambdaVarExpr);

        var _this17 = _possibleConstructorReturn(this, (FadedLambdaVarExpr.__proto__ || Object.getPrototypeOf(FadedLambdaVarExpr)).call(this, varname));

        _this17.graphicNode.size = _this17.name === 'x' ? { w: 24, h: 24 } : { w: 24, h: 30 };
        _this17.graphicNode.offset = _this17.name === 'x' ? { x: 0, y: 0 } : { x: 0, y: 2 };
        _this17.handleOffset = 2;
        return _this17;
    }

    _createClass(FadedLambdaVarExpr, [{
        key: 'open',
        value: function open() {
            var preview_expr = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

            if (this.stateGraph.currentState !== 'open') {
                this.stateGraph.enter('opening');

                if (preview_expr) {
                    var scale = this.graphicNode.size.w / preview_expr.size.w * 2.0;
                    preview_expr.pos = { x: this.graphicNode.size.w / 2.0, y: 0 };
                    preview_expr.scale = { x: scale, y: scale };
                    preview_expr.anchor = { x: 0.5, y: 0.3 };
                    preview_expr.stroke = null;
                    this.graphicNode.addChild(preview_expr);
                    this.stage.draw();
                }
            }
        }
    }, {
        key: 'openImage',
        get: function get() {
            return 'lambda-pipe-x-open';
        }
    }, {
        key: 'closedImage',
        get: function get() {
            return this.name === 'x' ? 'lambda-pipe-x' : 'lambda-pipe-x';
        }
    }, {
        key: 'openingAnimation',
        get: function get() {
            var anim = new mag.Animation();
            anim.addFrame('lambda-pipe-x-opening0', 50);
            anim.addFrame('lambda-pipe-x-opening1', 50);
            anim.addFrame(this.openImage, 50);
            return anim;
        }
    }, {
        key: 'closingAnimation',
        get: function get() {
            var anim = new mag.Animation();
            anim.addFrame('lambda-pipe-x-opening1', 50);
            anim.addFrame('lambda-pipe-x-opening0', 50);
            anim.addFrame(this.closedImage, 50);
            return anim;
        }
    }]);

    return FadedLambdaVarExpr;
}(LambdaVarExpr);

function findNoncapturingVarExpr(lambda, name) {
    var skipLambda = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    var subvarexprs = [];
    var queue = [lambda];
    while (queue.length > 0) {
        var node = queue.pop();
        if (node instanceof VarExpr) {
            subvarexprs.push(node);
        } else if (node !== lambda && node instanceof LambdaExpr && (node.takesArgument && node.holes[0].name === name || skipLambda)) {
            // Capture-avoiding substitution
            continue;
        }

        if (node.children) {
            queue = queue.concat(node.children);
        }
    }

    return subvarexprs;
}