"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

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
    }, {
        key: "names",
        value: function names() {
            var set = new Set([].concat(_toConsumableArray(Object.keys(this.bindings)), _toConsumableArray(this.parent ? this.parent.names() : [])));
            return Array.from(set);
        }
    }]);

    return Environment;
}();