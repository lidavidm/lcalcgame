class Environment {
    constructor(parent=null) {
        this.parent = parent;
        this.bindings = {};
    }

    lookup(key) {
        return this.bindings[key];
    }

    update(key, value) {
        this.bindings[key] = value;
    }
}
