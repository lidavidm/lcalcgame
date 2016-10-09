"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Environment = function () {
    function Environment() {
        var parent = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

        _classCallCheck(this, Environment);

        this.parent = parent;
        this.bindings = {};
    }

    _createClass(Environment, [{
        key: "lookup",
        value: function lookup(key) {
            return this.bindings[key] || (this.parent ? this.parent.lookup(key) : null);
        }
    }, {
        key: "update",
        value: function update(key, value) {
            this.bindings[key] = value;
        }
    }]);

    return Environment;
}();