// Graphic for a node of a tree.
class TreeNodeExpr extends Expression {
    constructor(valueExpr) {
        super([valueExpr]);
        this.radius = 28; // make it appear ovoid
        this.color = 'violet';
        this.anchor = {x:0.5, y:0.5};
        this.lockSubexpressions();
        this.holes[0].ignoreEvents = true;
    }
}

// Model of a tree
class TreeModel {
    static test() { // for debug testing...
        return new TreeModel("'root'", new TreeModel("star"), new TreeModel(2, new TreeModel(3), new TreeModel(4)));
    }
    constructor(V=0, L=null, R=null) {
        this.value = V; // A string, number, or boolean.
        this.left  = L; // TreeModel | null
        this.right = R; // TreeModel | null
    }
}

// Graphic for a tree.
class TreeGraphic extends mag.Rect {
    constructor(treeModel) {
        super(0, 0, 10, 10);

        this.makeFromTreeModel(treeModel);
        this.reorderChildren(); // ensure nodes are drawn after paths.
    }

    reorderChildren() {
        let paths = this.children.filter((c) => c instanceof ArrowPath);
        let nodes = this.children.filter((c) => !(c instanceof ArrowPath));
        this.children = [].concat(paths).concat(nodes);
    }

    makeFromTreeModel(root, depth=0, x=0, y=0) {
        if (!root || root.value === null) return null;
        let valueExpr = __PARSER.parse(root.value.toString());
        let treeNodeExpr = new TreeNodeExpr(valueExpr);
        treeNodeExpr.pos = { x:x, y:y };
        treeNodeExpr.model = root;
        treeNodeExpr.scale = { x:0.8, y:0.8 };
        treeNodeExpr.onmousedrag = () => {};
        this.addChild(treeNodeExpr);
        if (root.left)  {
            let leftExpr = this.makeFromTreeModel(root.left,  depth+1, x-80/(depth+1), y+80);
            this.addPath(treeNodeExpr, leftExpr);
        }
        if (root.right) {
            let rightExpr = this.makeFromTreeModel(root.right, depth+1, x+80/(depth+1), y+80);
            this.addPath(treeNodeExpr, rightExpr);
        }
        return treeNodeExpr;
    }

    addPath(node1, node2) {
        let a = new ArrowPath([node1.pos, node2.pos], {color:'purple', lineWidth:2});
        a.drawArrowHead = false;
        this.addChild(a);
    }
}



// static traverse(tree, cb, depth=0) { // Traverse the tree depth-first, calling 'cb' at every node.
//     if (!tree) return;
//     if (tree.value) cb(tree, depth);
//     TreeModel.traverse(tree.left, depth+1);
//     TreeModel.traverse(tree.right, depth+1);
// }
