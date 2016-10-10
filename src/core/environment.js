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

    static parse(desc) {
        console.log(desc);
        let bindings = {};
        let env = new Environment();
        for (let name of Object.keys(desc)) {
            let expr = Level.parse(desc[name]);
            if (expr.length !== 1) {
                throw "Invalid description of global value: " + name + "=" + desc[name];
            }
            env.update(name, expr[0]);
        }
        console.log(env);
        return env;
    }
}
