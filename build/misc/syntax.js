'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Syntax coloring constants.
 */

var _SyntaxColorManager = function () {
    function _SyntaxColorManager(syntaxColorProfile) {
        _classCallCheck(this, _SyntaxColorManager);

        if (!syntaxColorProfile) this.profile = {
            operator: 'black',
            bool: 'HotPink',
            string: 'Red',
            call: 'YellowGreen'
        };else this.profile = syntaxColorProfile;
        this.default_color = 'black';
    }

    _createClass(_SyntaxColorManager, [{
        key: 'for',
        value: function _for(name) {
            if (name in this.profile) return this.profile[name];else return this.default_color;
        }
    }]);

    return _SyntaxColorManager;
}();

var SyntaxColor = new _SyntaxColorManager();