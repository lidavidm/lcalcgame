class Environment {
    constructor(parent=null) {
        this.parent = parent;
        this.bindings = {};
    }

    lookup(key) {
        return this.bindings[key] || (this.parent ? this.parent.lookup(key) : null);
    }

    update(key, value) {
        this.bindings[key] = value;
    }
}
