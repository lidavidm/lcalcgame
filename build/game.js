'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * A Level is a complete description of a single scenario in this programming game.
 * Given a set of "expressions", a player must manipulate those expressions to
 * reach a "goal" state, with optional support from a "toolbox" of primitive expressions.
 * (*This may change in time.*) */

var Level = function () {
    function Level(expressions, goal) {
        var toolbox = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

        _classCallCheck(this, Level);

        this.exprs = expressions;
        this.goal = goal;
        this.toolbox = toolbox;
    }

    // Builds a single Stage from the level description,
    // and returns it.
    // * The layout should be generated automatically, and consistently.
    // * That way a higher function can 'parse' a text file description of levels --
    // * written in code, for instance -- and generate the entire game on-the-fly.


    _createClass(Level, [{
        key: 'build',
        value: function build(canvas) {

            var stage = new Stage(canvas);

            // Seed the random number generator so that while randomly generated,
            // levels appear the same each time you play.
            Math.seed = 12045;

            var canvas_screen = canvas.getBoundingClientRect();
            var screen = { height: canvas_screen.height / 1.4, width: canvas_screen.width / 1.4, y: canvas_screen.height * (1 - 1 / 1.4) / 2.0, x: canvas_screen.width * (1 - 1 / 1.4) / 2.0 };
            var board_packing = this.findBestPacking(this.exprs, screen);
            stage.addAll(board_packing); // add expressions to the stage

            // TODO: Offload this onto second stage?
            var goal_node = this.goal.nodeRepresentation;
            goal_node[0].pos = { x: 20, y: 10 };
            goal_node[1].pos = { x: 110, y: 10 };
            goal_node[1].ignoreGetClassInstance = true;
            var lastChild = goal_node[1].children[goal_node[1].children.length - 1];
            goal_node[0].children[0].size = { w: 110 + lastChild.pos.x + lastChild.size.w, h: 70 };
            stage.add(goal_node[0]);
            stage.add(goal_node[1]);

            //var toolbox_vis = this.generateToolboxVisual(toolbox_vis);
            //stage.addAll(toolbox_vis);

            stage.uiGoalNodes = [goal_node[0], goal_node[1]];
            stage.goalNodes = goal_node[1].children;

            // UI Buttons
            var ui_padding = 10;
            var btn_back = new Button(canvas_screen.width - 64 * 3 - ui_padding, ui_padding, 64, 64, { default: 'btn-back-default', hover: 'btn-back-hover', down: 'btn-back-down' }, function () {
                prev(); // go back to previous level; see index.html.
            });
            var btn_reset = new Button(btn_back.pos.x + btn_back.size.w, btn_back.pos.y, 64, 64, { default: 'btn-reset-default', hover: 'btn-reset-hover', down: 'btn-reset-down' }, function () {
                initBoard(); // reset board state; see index.html.
            });
            var btn_next = new Button(btn_reset.pos.x + btn_reset.size.w, ui_padding, 64, 64, { default: 'btn-next-default', hover: 'btn-next-hover', down: 'btn-next-down' }, function () {
                next(); // go back to previous level; see index.html.
            });
            stage.add(btn_back);
            stage.add(btn_reset);
            stage.add(btn_next);

            // Toolbox
            var TOOLBOX_HEIGHT = 90;
            var toolbox = new Toolbox(0, canvas_screen.height - TOOLBOX_HEIGHT, canvas_screen.width, TOOLBOX_HEIGHT);
            stage.add(toolbox);

            stage.uiNodes = [btn_back, btn_reset, btn_next, toolbox];

            // Checks if the player has completed the level.
            var goal = this.goal;
            stage.expressionNodes = function () {
                // TODO: Offshore the goal nodes onto some other stage.
                var nodes = [];
                var expr;
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = this.nodes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var n = _step.value;

                        if (n in this.uiGoalNodes || this.uiNodes.indexOf(n) > -1 || n.constructor.name === 'Rect' || n.constructor.name === 'ImageRect' || n.toolbox) continue;
                        nodes.push(n);
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

                return nodes;
            }.bind(stage);
            stage.isCompleted = function () {
                var _this2 = this;

                var exprs = this.expressionNodes();
                var matching = goal.test(exprs.map(function (n) {
                    return n.clone();
                }));
                if (matching) {
                    // Pair nodes so that goal nodes reference the actual nodes on-screen (they aren't clones).
                    // goal.test returns an array of indexes, referring to the indexes of the expressions passed into the test,
                    // ordered by the order of the goal nodes displayed on screen. So the info needed to pair an expression to a goal node.
                    // With this we can reconstruct the actual pairing for the nodes on-screen (not clones).
                    var pairs = matching.map(function (j, i) {
                        return [exprs[j], _this2.goalNodes[i]];
                    });
                    return pairs;
                }
                return false;
            }.bind(stage);

            return stage;
        }

        // Parse a shorthand description of a level
        // * In Scheme-esque format, with _ for holes:
        // * '(if _ triangle star) (== triangle _) (rect)'
        // NOTE: This does not do error checking! Make sure your desc is correct.

    }, {
        key: 'findBestPacking',


        // Unreachable....


        // Ian's really inefficient packing algorithm:
        // * 1. Put the expressions in random places.
        // * 2. Check if they overlap.
        // * --> If so, try again.
        // * --> Otherwise, add to a list.
        // * 3. When the list of candidates reaches a threshold #, quit.
        // * 4. Select the candidate with the greatest pairwise distance between expressions.
        value: function findBestPacking(exprs, screen) {

            var es = exprs; // clones of the initial expressions to place on the board
            var _this = this;
            if (!Array.isArray(es)) es = [es];

            var candidates = [];
            var CANDIDATE_THRESHOLD = 10;
            while (candidates.length < CANDIDATE_THRESHOLD) {

                // 1. Put the expressions in random places.
                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = es[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var e = _step2.value;

                        var size = e.absoluteSize;

                        var y = 0;
                        while (y < 50) {
                            y = Math.seededRandom() * (screen.height - size.h) + screen.y;
                        }

                        e.pos = { x: Math.seededRandom() * (screen.width - size.w) + screen.x,
                            y: y };
                    }

                    // 2. Check if they overlap.
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

                var overlap = false;
                var _iteratorNormalCompletion3 = true;
                var _didIteratorError3 = false;
                var _iteratorError3 = undefined;

                try {
                    for (var _iterator3 = es[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                        var _e = _step3.value;
                        var _iteratorNormalCompletion4 = true;
                        var _didIteratorError4 = false;
                        var _iteratorError4 = undefined;

                        try {
                            for (var _iterator4 = es[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                                var f = _step4.value;

                                if (_e == f) continue;
                                if (intersects(_e.absoluteBounds, f.absoluteBounds)) {
                                    overlap = true;
                                    break;
                                }
                            }
                        } catch (err) {
                            _didIteratorError4 = true;
                            _iteratorError4 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion4 && _iterator4.return) {
                                    _iterator4.return();
                                }
                            } finally {
                                if (_didIteratorError4) {
                                    throw _iteratorError4;
                                }
                            }
                        }

                        if (overlap === true) break;
                    }

                    // --> Otherwise, add to the list of candidates.
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

                if (!overlap) {
                    candidates.push(es);
                }
            }
            // 3. When the list of candidates reaches a threshold #, quit.

            // 4. Select the candidate with the greatest pairwise distance between expressions.
            var len = candidates.length;
            var pairwise_calcs = [];
            var pairwise_keys = [];
            var pairwise_totals = [];
            var keyfor = function keyfor(i, j) {
                if (i < j) return i.toString() + " " + j.toString();else return j.toString() + " " + i.toString();
            };
            var computePairwiseDist = function computePairwiseDist(a, b) {
                var sum = 0;
                var _iteratorNormalCompletion5 = true;
                var _didIteratorError5 = false;
                var _iteratorError5 = undefined;

                try {
                    for (var _iterator5 = a[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                        var _e2 = _step5.value;
                        // f is an expression.
                        var _iteratorNormalCompletion6 = true;
                        var _didIteratorError6 = false;
                        var _iteratorError6 = undefined;

                        try {
                            for (var _iterator6 = b[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                                var _f = _step6.value;
                                // e is an expression.
                                sum += Math.sqrt(Math.pow(_e2.pos.x - _f.pos.x, 2) + Math.pow(_e2.pos.y - _f.pos.y, 2));
                            }
                        } catch (err) {
                            _didIteratorError6 = true;
                            _iteratorError6 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion6 && _iterator6.return) {
                                    _iterator6.return();
                                }
                            } finally {
                                if (_didIteratorError6) {
                                    throw _iteratorError6;
                                }
                            }
                        }
                    }
                } catch (err) {
                    _didIteratorError5 = true;
                    _iteratorError5 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion5 && _iterator5.return) {
                            _iterator5.return();
                        }
                    } finally {
                        if (_didIteratorError5) {
                            throw _iteratorError5;
                        }
                    }
                }

                return sum;
            };
            for (var i = 0; i < len; i++) {
                pairwise_totals[i] = 0;
                for (var j = 0; j < len; j++) {
                    var key = keyfor(i, j);
                    if (i === j) continue;else if (key in pairwise_calcs) {
                        pairwise_totals[i] += pairwise_calcs[key];
                    } else {
                        pairwise_calcs[key] = computePairwiseDist(candidates[i], candidates[j]);
                        pairwise_totals[i] += pairwise_calcs[key];
                        pairwise_keys.push(key);
                    }
                }
            }

            var max = 0;
            var max_idx = -1;
            for (var _i = 0; _i < len; _i++) {
                if (pairwise_totals[_i] > max) {
                    max = pairwise_totals[_i];
                    max_idx = _i;
                }
            }

            var rtn = candidates[max_idx];
            if (!rtn) {
                rtn = exprs;
            }
            return rtn;
        }
    }], [{
        key: 'make',
        value: function make(expr_descs, goal_descs) {
            var lvl = new Level(Level.parse(expr_descs), new Goal(new ExpressionPattern(Level.parse(goal_descs))));
            return lvl;
        }
    }, {
        key: 'parse',
        value: function parse(desc) {
            function splitParen(s) {
                s = s.trim();
                var depth = 0;
                var paren_idx = 0;
                var expr_descs = [];
                for (var i = 0; i < s.length; i++) {
                    if (s[i] === '(') {
                        if (depth === 0) paren_idx = i + 1;
                        depth++;
                    } else if (s[i] === ')') {
                        depth--;
                        if (depth === 0) expr_descs.push(s.substring(paren_idx, i));
                    }
                }
                if (expr_descs.length === 0) expr_descs.push(s);
                return expr_descs;
            }

            // Split string by top-level parentheses.
            var descs = splitParen(desc);
            console.log('descs', descs);

            // Parse expressions recursively.
            var es = descs.map(function (expr_desc) {
                return Level.parseExpr(expr_desc);
            });
            es = es.map(function (e) {
                return e instanceof LambdaHoleExpr ? new LambdaExpr([e]) : e;
            });
            console.log('exprs', es);
            return es;
        }
    }, {
        key: 'parseExpr',
        value: function parseExpr(desc) {

            var LOCK_MARKER = '/';
            var lock = function lock(e) {
                var locked = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

                if (locked) e.lock();else e.unlock();
                return e;
            };

            //console.log('parse called with arg: ', desc);
            //if (desc === 10) debugger;
            var toplevel_lock = desc[0] === LOCK_MARKER;
            if (toplevel_lock) desc = desc.substring(1);
            desc = stripParen(desc);

            function splitArgs(s) {
                //console.log('arg is: ', s);
                s = s.trim().replace(/\s+/g, ' '); // clean up the string; replace all whitespace by single space.
                if (s.indexOf(' ') === -1 && s.indexOf('(') === -1) return [s]; // there is nothing to parse
                var depth = 0;
                var expr_idx = 0;
                var paren_locked = false;
                var args = [];
                for (var i = 0; i < s.length; i++) {
                    if (s[i] === '(') {
                        if (depth === 0) {
                            expr_idx = i;
                            paren_locked = i > 0 && s[i - 1] === LOCK_MARKER;
                        }
                        depth++;
                    } else if (s[i] === ')') {
                        depth--;
                    } else if (depth === 0 && s[i] === ' ') {
                        var _desc = s.substring(expr_idx, i);
                        if (paren_locked) _desc = LOCK_MARKER + _desc;
                        args.push(_desc);
                        expr_idx = i + 1;
                        paren_locked = false;
                    }
                }
                if (expr_idx < s.length) {
                    var _desc2 = s.substring(expr_idx);
                    if (paren_locked) _desc2 = LOCK_MARKER + _desc2;
                    args.push(_desc2);
                }
                return args;
            }

            // Parse a single (top-level) expression.
            var args = splitArgs(desc);

            // If there are multiple arguments, parse them recursively, then compress into single expression.
            if (args.length > 1) {

                console.log('parsing expr with multiple args', args, toplevel_lock);

                var exprs = args.map(function (arg) {
                    return Level.parseExpr(arg);
                });
                console.log(' >> inner exprs', exprs);
                if (Array.isArray(exprs[0])) {
                    // array of expressions
                    return lock(new Expression(exprs), toplevel_lock);
                } else {
                    // Class name. Invoke the instantiator.
                    var op_class = exprs[0];
                    if (!(op_class instanceof LambdaHoleExpr) && !(op_class instanceof BagExpr) && op_class.length !== exprs.length - 1) {
                        // missing an argument, or there's an extra argument:
                        console.warn('Operator-argument mismatch with exprs: ', exprs);
                        console.warn('Continuing...');
                    }
                    for (var i = 1; i < exprs.length; i++) {
                        // Cast the other arguments into expressions.
                        if (Array.isArray(exprs[i])) exprs[i] = new Expression(exprs[i]); // wrap in paren
                        else if (isClass(exprs[i])) {
                                if (exprs[i].length > 0) console.warn('Instantiating expression class ', exprs[i], ' with 0 arguments when it expects ' + exprs[i].length + '.');
                                exprs[i] = constructClassInstance(exprs[i], null);
                            } else if (isInstanceOfClass(exprs[i], Expression)) {} // Nothing to fix.
                            else {
                                    console.error("Expression ", exprs[i], ' not of known type.');
                                }
                    }
                    if (op_class instanceof LambdaHoleExpr) {
                        var lexp = new LambdaExpr([op_class]);
                        for (var _i2 = 1; _i2 < exprs.length; _i2++) {
                            lexp.addArg(exprs[_i2]);
                        }
                        return lock(lexp, toplevel_lock);
                    } else if (op_class instanceof BagExpr) {
                        var _ret = function () {
                            var bag = op_class;
                            var sz = bag.graphicNode.size;
                            var topsz = bag.graphicNode.topSize(sz.w / 2.0);
                            for (var _i3 = 1; _i3 < exprs.length; _i3++) {
                                bag.addItem(exprs[_i3]);
                            }

                            // Set start positions of bag items. If from 1 to 6, arrange like dice dots.
                            var dotpos = DiceNumber.drawPositionsFor(exprs.length - 1);
                            if (dotpos.length > 0) {
                                // Arrange items according to dot positions.
                                bag.arrangeNicely();
                            } else {
                                // Arrange items randomly in bag.
                                exprs.slice(1).forEach(function (e) {
                                    e.pos = { x: (Math.random() + 0.4) * sz.w / 2.0, y: (Math.random() + 0.7) * sz.h / 2.0 };
                                });
                            }

                            return {
                                v: lock(bag, toplevel_lock)
                            };
                        }();

                        if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
                    } else if (args[0] in CompareExpr.operatorMap()) {
                        // op name is supported comparison operation like ==, !=, etc
                        console.log('constructing comparator ' + args[0] + ' with exprs ', exprs.slice(1));
                        var es = exprs.slice(1);es.push(args[0]);
                        return lock(constructClassInstance(op_class, es), toplevel_lock); // pass the operator name to the comparator
                    } else {
                            console.log(exprs);
                            return lock(constructClassInstance(op_class, exprs.slice(1)), toplevel_lock); // (this is really generic, man)
                        }
                }
            }

            // Handle single arguments
            var arg = args[0];
            var locked = arg.indexOf(LOCK_MARKER) > -1 || toplevel_lock;
            arg = arg.replace(LOCK_MARKER, '');
            var e;
            console.log('Handling single arg: ', arg);

            // Why can we do this? Because JS allows us to do .length on class names to check # of arguments.
            var op_mappings = {
                'if': IfStatement,
                'ifelse': IfElseStatement,
                'triangle': new TriangleExpr(0, 0, 44, 44),
                'rect': new RectExpr(0, 0, 44, 44),
                'star': new StarExpr(0, 0, 25, 5),
                'circle': new CircleExpr(0, 0, 22),
                'diamond': new RectExpr(0, 0, 44, 44), // for now
                '_': MissingExpression,
                '__': MissingBagExpression,
                '_b': MissingBooleanExpression,
                'true': new TrueExpr(),
                'false': new FalseExpr(),
                'cmp': CompareExpr,
                '==': CompareExpr,
                '!=': CompareExpr,
                'bag': new BagExpr(0, 0, 54, 54, []),
                'count': new CountExpr(),
                'map': SimpleMapFunc,
                'reduce': ReduceFunc,
                'put': PutExpr,
                'pop': PopExpr,
                'define': DefineExpr,
                'null': new NullExpr(0, 0, 64, 64),
                'dot': function () {
                    var circ = new CircleExpr(0, 0, 18);
                    circ.color = 'gold';
                    return circ;
                }()
            };

            if (Number.isNumber(arg)) {
                var numexpr = new NumberExpr(parseInt(arg));
                lock(numexpr, locked);
                return numexpr;
            } else if (arg in op_mappings) {
                if (isInstanceOfClass(op_mappings[arg], Expression)) {
                    e = op_mappings[arg].clone();
                    lock(e, locked);
                } else e = op_mappings[arg];
                return e;
            } else if (arg.indexOf('λ') > -1) {
                var varname = arg.replace('λ', '');
                if (__FADED_LAMBDAS) return new FadedLambdaHoleExpr(varname);else return new LambdaHoleExpr(varname); // lambda hole in parentheses
            } else if (arg.indexOf('#') > -1) {
                    var _varname = arg.replace('#', '');
                    var lambdavar = void 0;
                    if (__FADED_LAMBDAS) lambdavar = new FadedLambdaVarExpr(_varname);else lambdavar = new LambdaVarExpr(_varname);
                    if (_varname.indexOf('_') > -1) {
                        // Vars like #/x are draggable.
                        _varname = _varname.replace('_', '');
                        lambdavar.ignoreEvents = false; // makes draggable
                        lambdavar.name = _varname;
                    }
                    return lambdavar;
                } else {
                    console.error('Unknown argument: ', arg);
                    return new Expression();
                }
        }
    }]);

    return Level;
}();

/** A Goal describes the conditions
    under which a level can be counted as complete.
    For instance, that the expression should reduce to a Star.
    The input of the comparator function includes both
    the final expression and the entire reduction stack (TODO).
    Simple goals, in the beginning, may only need the final expression.
    However, later on it may be necessary to analyze the reduction stack.
    To do this, extend Goal and create your own test() function.
*/


var Goal = function () {
    function Goal(accepted_patterns) {
        _classCallCheck(this, Goal);

        if (!Array.isArray(accepted_patterns)) accepted_patterns = [accepted_patterns];
        this.patterns = accepted_patterns;
    }

    _createClass(Goal, [{
        key: 'test',


        // MAYBE? TODO: Use reduction stack.
        value: function test(exprs) {
            var reduction_stack = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
            var _iteratorNormalCompletion7 = true;
            var _didIteratorError7 = false;
            var _iteratorError7 = undefined;

            try {

                for (var _iterator7 = this.patterns[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                    var pattern = _step7.value;

                    var paired_matching = pattern.test(exprs);
                    if (paired_matching) return paired_matching;
                }
            } catch (err) {
                _didIteratorError7 = true;
                _iteratorError7 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion7 && _iterator7.return) {
                        _iterator7.return();
                    }
                } finally {
                    if (_didIteratorError7) {
                        throw _iteratorError7;
                    }
                }
            }

            return false;
        }
    }, {
        key: 'nodeRepresentation',
        get: function get() {
            var exprs = flatten(this.patterns.map(function (p) {
                return p.exprs;
            })).map(function (expr) {
                return expr.clone();
            });
            var bg = new Rect(-20, -10, 200, 80);
            bg.color = "#444";
            bg.shadowOffset = 0;
            var txt = new TextExpr('Goal: ', 'Georgia');
            var node = new Rect(0, 0, 100, 50);
            node.color = null;
            node.ignoreEvents = true;
            txt.pos = { x: 0, y: node.size.h / 2 };
            txt.anchor = { x: 0, y: 0.5 };
            txt.color = "#EEE";

            var exprs_node = new Rect(0, 0, 0, 0);
            exprs_node.addAll(exprs);

            exprs[0].pos = { x: 0, y: 0 };

            // TODO: Fix the need for this hack.
            if (exprs[0] instanceof BagExpr) {
                exprs[0].pos = { x: 70, y: 50 };
            }

            exprs[0].ignoreEvents = true;
            for (var i = 1; i < exprs.length; i++) {
                exprs[i].pos = addPos({ x: exprs[i - 1].size.w, y: 0 }, exprs[i - 1].pos);
                exprs[i].ignoreEvents = true;
            }

            node.addAll([bg, txt]);
            return [node, exprs_node];
        }
    }]);

    return Goal;
}();

/** An ExpressionPattern is like a regex over programming expressions.
 *	(It's really incomplete. I'm to blame for that. But TODO!)
 *	For right now, this just takes a single Expression and provides a
 *	comparison function with another expression.
 */


var ExpressionPattern = function () {
    function ExpressionPattern(exprs) {
        _classCallCheck(this, ExpressionPattern);

        if (!Array.isArray(exprs)) exprs = [exprs];
        this.exprs = exprs;
    }

    _createClass(ExpressionPattern, [{
        key: 'test',
        value: function test(exprs) {
            var lvl_exprs = exprs;
            var es = this.exprs.map(function (e) {
                return e;
            }); // shallow clone
            var es_idxs = this.exprs.map(function (e, i) {
                return i;
            });
            var paired_matching = [];

            // If sets of expressions have different length, they can't be equal.
            if (lvl_exprs.length !== es.length) return false;

            var compare = function compare(e, f) {

                //console.log(' comparing ', e, ' to ', f);

                // Compares two expressions.
                // Right now this just checks if their class tree is the same.
                if (e.constructor.name !== f.constructor.name) {
                    //console.log(' > Constructors don\'t match.');
                    return false; // expressions don't match
                } else {
                        // Check whether the expressions at this level have the same # of children. If so, do one-to-one comparison.
                        var e_children = e.children;
                        var f_children = f.children;
                        if (e_children.length !== f_children.length) {
                            //console.log(' > Length of child array doesn\'t match.');
                            return false;
                        } else {
                            for (var i = 0; i < e_children.length; i++) {
                                if (!compare(e_children[i], f_children[i])) {
                                    //console.log(' > Children don\'t match.');
                                    return false;
                                }
                            }
                        }
                    }

                //console.log(' > Expressions are equal.');
                return true;
            };

            var _iteratorNormalCompletion8 = true;
            var _didIteratorError8 = false;
            var _iteratorError8 = undefined;

            try {
                for (var _iterator8 = lvl_exprs[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                    var lvl_e = _step8.value;

                    var valid = -1;
                    for (var i = 0; i < es.length; i++) {
                        if (compare(es[i], lvl_e)) {
                            valid = i;
                            paired_matching.push(es_idxs[i]);
                            break;
                        }
                    }
                    if (valid > -1) {
                        //console.log(' > array was ', es);
                        //console.log(' > removing element ', es[valid]);
                        es.splice(valid, 1);
                        es_idxs.splice(valid, 1);
                        //console.log(' > array is now ', es);
                    } else return false;
                }
            } catch (err) {
                _didIteratorError8 = true;
                _iteratorError8 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion8 && _iterator8.return) {
                        _iterator8.return();
                    }
                } finally {
                    if (_didIteratorError8) {
                        throw _iteratorError8;
                    }
                }
            }

            return paired_matching;
        }
    }]);

    return ExpressionPattern;
}();