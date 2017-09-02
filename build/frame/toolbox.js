'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// The panel at the bottom of the screen.

var Toolbox = function (_mag$ImageRect) {
    _inherits(Toolbox, _mag$ImageRect);

    function Toolbox(x, y, w, h) {
        var exprs = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : [];

        _classCallCheck(this, Toolbox);

        var _this = _possibleConstructorReturn(this, (Toolbox.__proto__ || Object.getPrototypeOf(Toolbox)).call(this, x, y, w, h, 'toolbox-bg'));

        _this.items = exprs;
        _this.padding = 20;
        _this.numRows = 1;
        _this.rowHeight = Toolbox.defaultRowHeight;
        return _this;
    }

    _createClass(Toolbox, [{
        key: 'addExpression',


        // Adds an expression to the toolbox. Animates to new position.
        value: function addExpression(e) {
            var animated = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;


            // Add expression to toolbox.
            var toolbox = this;
            this.items.push(e);
            e.toolbox = this;

            //e.onmousedrag = function (pos) {
            //    super.onmousedrag(pos); // perform whatever the drag event is on this expression
            //    toolbox.removeExpression(e); // remove this expression from the toolbox
            //};

            // Disable the onclick handler so that you can't reduce things
            // in the toolbox
            e._origonmouseclick = e.onmouseclick;
            e.onmouseclick = function () {};

            // Animate new expression to toolbox position.
            this.setLayout(animated);
        }

        // Removes an expression from toolbox.

    }, {
        key: 'removeExpression',
        value: function removeExpression(e) {
            var animated = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

            var idx = this.items.indexOf(e);
            if (idx > -1) {
                this.items.splice(idx, 1);
                this.setLayout(animated); // rearrange remaining items
                e.scale = { x: 1, y: 1 };
                // Restore the onclick handler
                e.onmouseclick = e._origonmouseclick;
            }
        }

        // Returns the number of toolbox 'rows' required
        // to fit all the given expressions on the screen.
        // * Note: You should scale them beforehand!

    }, {
        key: 'getNumRowsToFit',
        value: function getNumRowsToFit(exprs) {
            var padding = this.padding;
            var sum = function sum(arr, f) {
                return arr.reduce(function (a, b) {
                    return a + f(b);
                }, 0);
            };
            var total_w = sum(exprs, function (e) {
                return e.absoluteSize.w + padding;
            });
            var toolbox_w = this.absoluteSize.w - padding * 4;
            var rows = Math.trunc(total_w / toolbox_w) + 1;
            console.log(total_w, toolbox_w, total_w / toolbox_w);
            return rows;
        }
    }, {
        key: 'getCenterYPosForRow',
        value: function getCenterYPosForRow(i) {
            var h = this.rowHeight;
            if (typeof this.numRows === 'undefined' || this.numRows === 1) return this.pos.y - h / 2.0;else return this.pos.y - h * (this.numRows - i - 1) - h / 2.0;
        }
    }, {
        key: 'setNumRows',
        value: function setNumRows(num_rows) {
            this.numRows = num_rows;
            this.updateRowHeightToItems();
            this.size = { w: this.size.w, h: this.rowHeight * num_rows };
        }
    }, {
        key: 'updateRowHeightToItems',
        value: function updateRowHeightToItems() {
            var row_h = Math.max.apply(Math, _toConsumableArray(this.items.map(function (i) {
                return i.absoluteSize.h;
            }))) + this.padding;
            if (this.numRows === 1 && row_h < Toolbox.defaultRowHeight) row_h = Toolbox.defaultRowHeight;
            this.rowHeight = row_h;
        }
    }, {
        key: 'resizeToFitItems',
        value: function resizeToFitItems() {
            var _this2 = this;

            this.items.forEach(function (i) {
                return i.update();
            });

            var rows = this.getNumRowsToFit(this.items);
            if (rows > 1) {
                (function () {

                    // Now rescale expressions if rows is > 1,
                    // to fit more expressions on the screen:
                    var row_scale = Math.pow(1.0 / rows, 0.2);
                    _this2.items.forEach(function (e) {
                        e.scale = { x: row_scale, y: row_scale };
                    });

                    // Now recalculate the number of rows given this new scale factor...
                    rows = _this2.getNumRowsToFit(_this2.items);
                })();
            }

            this.setNumRows(rows);
            this.setLayout();
        }

        // Set expression positions in toolbox.

    }, {
        key: 'setLayout',
        value: function setLayout() {
            var _this3 = this;

            var animated = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

            var pos = this.topLeftEdgePos;
            var currentRow = 0;
            var num_rows = this.numRows;
            var leftmost_x = pos.x;
            var toolbox_w = this.size.w;
            this.updateRowHeightToItems();
            this.items.forEach(function (e) {
                e.update();
                e.anchor = { x: 0, y: 0.5 };
                if (pos.x + e.absoluteSize.w > toolbox_w) {
                    // move to next row
                    currentRow += 1;
                    pos.y = _this3.getCenterYPosForRow(currentRow);
                    pos.x = leftmost_x;
                }
                if (animated) {
                    Animate.tween(e, { pos: clonePos(pos) }, 300, function (elapsed) {
                        return Math.pow(elapsed, 0.5);
                    });
                } else e.pos = clonePos(pos);
                pos.x += e.absoluteSize.w + _this3.padding;
            });
            //this.resizeToFitItems();
        }
    }, {
        key: 'ondropped',
        value: function ondropped(node, pos) {

            if (!node.toolbox) {
                // Can't drag nodes onto toolbox that aren't already elements --
                // once it's placed on the board, you can't drag it back.
                Logger.log('toolbox-reject', node.toString());
                Animate.tween(node, { pos: { x: node.pos.x, y: this.pos.y - node.size.h * 1.2 } }, 200, function (elapsed) {
                    return Math.pow(elapsed, 2);
                });
                return;
            } else if (node.toolbox && node.toolbox != this) {
                console.error('@ Toolbox.ondropped: Node toolbox does not match current toolbox instance.');
                return;
            }

            // User changed their minds about removing item from toolbox.
            // Add item back to the toolbox.
            this.addExpression(node);
            Logger.log('toolbox-addback', node.toString());
        }
    }, {
        key: 'leftmostX',
        get: function get() {
            return this.padding * 2 + this.pos.x;
        }
    }, {
        key: 'bottomLeftEdgePos',
        get: function get() {
            return { x: this.leftmostX, y: this.pos.y - this.rowHeight / 2.0 };
        }
    }, {
        key: 'topLeftEdgePos',
        get: function get() {
            return { x: this.leftmostX, y: this.getCenterYPosForRow(0) };
        }
    }], [{
        key: 'defaultRowHeight',
        get: function get() {
            return __IS_MOBILE && this.md.phone() ? 70 : 90;
        }
    }]);

    return Toolbox;
}(mag.ImageRect);