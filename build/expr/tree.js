"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// Graphic for a node of a tree.

var TreeNodeExpr = function (_Expression) {
    _inherits(TreeNodeExpr, _Expression);

    function TreeNodeExpr(valueExpr) {
        _classCallCheck(this, TreeNodeExpr);

        var _this = _possibleConstructorReturn(this, (TreeNodeExpr.__proto__ || Object.getPrototypeOf(TreeNodeExpr)).call(this, [valueExpr]));

        _this.radius = 28; // make it appear ovoid
        _this.color = 'violet';
        _this.anchor = { x: 0.5, y: 0.5 };
        _this.lockSubexpressions();
        _this.holes[0].ignoreEvents = true;
        return _this;
    }

    return TreeNodeExpr;
}(Expression);

// Model of a tree


var TreeModel = function () {
    _createClass(TreeModel, null, [{
        key: "test",
        value: function test() {
            // for debug testing...
            return new TreeModel("'root'", new TreeModel("star"), new TreeModel(2, new TreeModel(3), new TreeModel(4)));
        }
    }]);

    function TreeModel() {
        var V = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
        var L = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        var R = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

        _classCallCheck(this, TreeModel);

        this.value = V; // A string, number, or boolean.
        this.left = L; // TreeModel | null
        this.right = R; // TreeModel | null
    }

    return TreeModel;
}();

// Graphic for a tree.


var TreeGraphic = function (_mag$Rect) {
    _inherits(TreeGraphic, _mag$Rect);

    function TreeGraphic(treeModel) {
        _classCallCheck(this, TreeGraphic);

        var _this2 = _possibleConstructorReturn(this, (TreeGraphic.__proto__ || Object.getPrototypeOf(TreeGraphic)).call(this, 0, 0, 10, 10));

        _this2.makeFromTreeModel(treeModel);
        _this2.reorderChildren(); // ensure nodes are drawn after paths.
        return _this2;
    }

    _createClass(TreeGraphic, [{
        key: "reorderChildren",
        value: function reorderChildren() {
            var paths = this.children.filter(function (c) {
                return c instanceof ArrowPath;
            });
            var nodes = this.children.filter(function (c) {
                return !(c instanceof ArrowPath);
            });
            this.children = [].concat(paths).concat(nodes);
        }
    }, {
        key: "makeFromTreeModel",
        value: function makeFromTreeModel(root) {
            var depth = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
            var x = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
            var y = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

            if (!root || root.value === null) return null;
            var valueExpr = __PARSER.parse(root.value.toString());
            var treeNodeExpr = new TreeNodeExpr(valueExpr);
            treeNodeExpr.pos = { x: x, y: y };
            treeNodeExpr.model = root;
            treeNodeExpr.scale = { x: 0.8, y: 0.8 };
            treeNodeExpr.onmousedrag = function () {};
            this.addChild(treeNodeExpr);
            if (root.left) {
                var leftExpr = this.makeFromTreeModel(root.left, depth + 1, x - 80 / (depth + 1), y + 80);
                this.addPath(treeNodeExpr, leftExpr);
            }
            if (root.right) {
                var rightExpr = this.makeFromTreeModel(root.right, depth + 1, x + 80 / (depth + 1), y + 80);
                this.addPath(treeNodeExpr, rightExpr);
            }
            return treeNodeExpr;
        }
    }, {
        key: "addPath",
        value: function addPath(node1, node2) {
            var a = new ArrowPath([node1.pos, node2.pos], { color: 'purple', lineWidth: 2 });
            a.drawArrowHead = false;
            this.addChild(a);
        }
    }]);

    return TreeGraphic;
}(mag.Rect);

// static traverse(tree, cb, depth=0) { // Traverse the tree depth-first, calling 'cb' at every node.
//     if (!tree) return;
//     if (tree.value) cb(tree, depth);
//     TreeModel.traverse(tree.left, depth+1);
//     TreeModel.traverse(tree.right, depth+1);
// }