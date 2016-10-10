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

    names() {
        let set = new Set([
            ...Object.keys(this.bindings),
            ...(this.parent ? this.parent.names() : []),
        ]);
        return Array.from(set);
    }
}
