"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * 	AUTHOR's NOTE:
 * 	In developing Reduct the model was never separated from the view.
 * 	This proved efficient earlier on, but has grown to be a hassle as
 * 	more and more statements are introduced with the same semantics
 * 	but vastly different syntax; because JS has no 'interfaces',
 * 	we are forced to extend the same base class (e.g. IfStatement) whose
 * 	original visual style (e.g. a ternary) may need to be completely
 * 	overhauled (e.g. for a multi-line statement).
 *
 * 	Instead of mixing model and view, instead what we want are the
 * 	'logic' and _final_ 'syntax' of a language stored inside a 'language model,'
 * 	while the graphics (which can be completely abstract, like a treasure chest)
 * 	are left up to the stage of the game.
 *
 *	In theory this would e.g. let us swap 'Python' for 'JS' (in early levels),
 *	the crux being a core 'Statement' graphic class that expresses _any language_
 *	in its "purest" / most abstract form (just text). In other words, it takes
 *	the syntax model for a concept like 'if' in various languages:
 *
 *		|  COMMON LISP   | JAVASCRIPT  |
 *		——————————————————————————————
 *							if (<b>)
 *		(if <b> <t> <f>)        <t>
 *							else
 *								<f>
 *
 *
 *   and then 'everything' is rendered accordingly.
 *
 * 	 Right now, swapping syntax is an incredible pain: all 'final' text classes
 * 	 have to be extended with a minor change in syntax, and these extensions
 * 	 (similar to the issue explicated above) may have to overwrite or
 * 	 duplicate large parts of code just so the Class hierarchy is
 * 	 respected.
 *
 * 	 Now, there still *can* be fancy, language-specific classes.
 * 	 But these should exist as special cases rather than the norm. And tbh,
 * 	 scrolling through lines and lines of code to decipher the semantics
 * 	 from the syntax / visuals is a paaaain. :)
 */

var AbstractValue = function () {
    function AbstractValue() {
        _classCallCheck(this, AbstractValue);
    }

    _createClass(AbstractValue, [{
        key: "reduce",
        value: function reduce() {
            return this.value();
        }
    }, {
        key: "value",
        value: function value() {
            return undefined;
        }
    }]);

    return AbstractValue;
}();

var AbstractTrueValueModel = function () {
    function AbstractTrueValueModel() {
        _classCallCheck(this, AbstractTrueValueModel);
    }

    _createClass(AbstractTrueValueModel, [{
        key: "value",
        value: function value() {
            return true;
        }
    }]);

    return AbstractTrueValueModel;
}();

var AbstractFalseValueModel = function () {
    function AbstractFalseValueModel() {
        _classCallCheck(this, AbstractFalseValueModel);
    }

    _createClass(AbstractFalseValueModel, [{
        key: "value",
        value: function value() {
            return true;
        }
    }]);

    return AbstractFalseValueModel;
}();

var AbstractIfStatementModel = function () {
    function AbstractIfStatementModel() {
        _classCallCheck(this, AbstractIfStatementModel);
    }

    _createClass(AbstractIfStatementModel, [{
        key: "reduce",
        value: function reduce(b, t, f) {
            b.reduce();
        }
    }]);

    return AbstractIfStatementModel;
}();

var JSIfStatement = function (_AbstractIfStatementM) {
    _inherits(JSIfStatement, _AbstractIfStatementM);

    function JSIfStatement() {
        _classCallCheck(this, JSIfStatement);

        return _possibleConstructorReturn(this, (JSIfStatement.__proto__ || Object.getPrototypeOf(JSIfStatement)).apply(this, arguments));
    }

    return JSIfStatement;
}(AbstractIfStatementModel);