/**
 * Handy-dandy animation operations over node arrays.
 */
class Animate {

    static blink(nodes, dur=1000, colorWeights=[1,1,1]) {
        if (!Array.isArray(nodes)) nodes = [nodes];
        nodes.forEach((n) => {
            var last_color = null;
            var twn = new Tween((elapsed) => {
                n.stroke = { color: colorFrom255((Math.sin(4*elapsed*Math.PI)+1) * 255 / 2, colorWeights), lineWidth:2 };
                if(n.stage) n.stage.draw();
            }, dur).after(() => {
                n.stroke = null;
                n.stage.draw();
            });
            twn.run();
        });
    }

    static followPath(node, path, dur=1000, smoothFunc=((elapsed) => elapsed)) {
        node.pos = addPos(path.absolutePos, path.posAlongPath(smoothFunc(0)));
        var twn = new Tween((elapsed) => {
            node.pos = addPos(path.absolutePos, path.posAlongPath(smoothFunc(elapsed)));
            if(node.stage)
                node.stage.draw();
        }, dur);
        twn.run();
        return twn;
    }

    static tween(node, targetValue, dur=1000, smoothFunc=((elapsed) => elapsed)) {
        //if (!(propName in node)) {
        //    console.error('@ Animate.tween: "' + propName.toString() + '" is not a property of node', node );
        //    return;
        //}
        let deepCloneProperties = (obj, srcobj) => {
            let sourceValue = {};
            for (let prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    if (typeof obj[prop] === 'object')
                        sourceValue[prop] = deepCloneProperties(obj[prop], srcobj[prop]);
                    else
                        sourceValue[prop] = srcobj[prop];
                }
            }
            return sourceValue;
        };
        let sourceValue = deepCloneProperties(targetValue, node);
        let finalValue = deepCloneProperties(targetValue, targetValue);

        let lerpVals = (src, tgt, elapsed) => {
            return (1.0 - elapsed) * src + elapsed * tgt;
        };
        let lerpProps = (sourceObj, targetObj, elapsed) => {
            let rt = {};
            for (let prop in targetObj) {
                if (targetObj.hasOwnProperty(prop)) {
                    if (typeof targetObj[prop] === 'object')
                        rt[prop] = lerpProps(sourceObj[prop], targetObj[prop], elapsed); // recursion into inner properties
                    else
                        rt[prop] = lerpVals(sourceObj[prop], targetObj[prop], elapsed);
                }
            }
            return rt;
        };

        var twn = new Tween((elapsed) => {
            elapsed = smoothFunc(elapsed);
            let new_props = lerpProps(sourceValue, targetValue, elapsed);

            for (let prop in new_props) {
                if (new_props.hasOwnProperty(prop)) {
                    node[prop] = new_props[prop];
                }
            }

            if (node.stage) node.stage.draw();
        }, dur).after(() => {

            for (let prop in finalValue) {
                if (finalValue.hasOwnProperty(prop)) {
                    node[prop] = finalValue[prop];
                }
            }

            if (node.stage) node.stage.draw();
        });
        twn.run();
        return twn;
    }

    static play(animation, imageRect, onComplete) {
        var startFrame = animation.frameAt(0);
        imageRect.image = startFrame.image;
        var stage = imageRect.stage;
        var dur = animation.totalDuration;
        var twn = new Tween((elapsed) => {
            var currentImage = animation.frameAtTime(elapsed * dur).image;
            if (currentImage !== imageRect.image) {
                imageRect.image = currentImage;
                //console.error('changed img to ' + currentImage + ', ' + (elapsed * dur));
                stage.draw();
            }
        }, animation.totalDuration).after(onComplete);
        twn.run();
    }

    static poof(expr, sfx='poof') {
        if (expr.stage) {
            let sz = expr.size;
            let len = (sz.w + sz.h) / 2.0;
            let pos = expr.pos;
            let scale = 1.4;
            let img = new ImageRect(pos.x - len*(scale-1.0)/2.0,
                                    pos.y - len*(scale-1.0)/2.0,
                                    len*1.4, len*1.4, 'poof0');
            expr.stage.add(img);
            let anim = Resource.getAnimation('poof');
            Animate.play(anim, img, () => {
                let stg = img.stage;
                stg.remove(img); // remove self from stage on animation end.
                stg.draw();
            });

            if (sfx) Resource.play(sfx, 0.4);
        }
    }

}

/*
 * Storage class for sprite animations.
 */
class Animation {
    static forImageSequence(seqname, range, dur) {
        var a = new Animation();
        for (let i = range[0]; i <= range[1]; i++)
            a.addFrame(seqname + i, dur);
        return a;
    }
    constructor(frames=[]) {
        this.frames = frames;
        this.currentFrame = 0;
    }
    frameAt(idx) {
        if (idx < this.frames.length) return this.frames[idx];
        else return null;
    }
    addFrame(image_key, dur) {
        this.frames.push( {image:image_key, duration:dur} );
    }
    addFrames(frames) {
        frames.forEach((f) => {
            this.frames.push( {image:f.image, duration:f.duration} );
        });
    }
    get totalDuration() {
        return this.frames.reduce((prev,curr) => prev+curr.duration, 0);
    }
    frameAtTime(secs) {
        var a = 0;
        for (let f of this.frames) {
            a += f.duration;
            if (secs < a) return f;
        }
        return this.frames[this.frames.length-1];
    }
    clone() {
        var a = new Animation();
        this.frames.forEach((f) => {
            a.addFrame( f.image, f.duration ); });
        return a;
    }
}

class Tween {
    constructor(updateLoopFunc, duration, fps=30) {
        this.dur = duration;
        this.update = updateLoopFunc;
        this.fps = fps;
        var _this = this;
        this.after = (onComplete) => { _this.onComplete = onComplete; return _this; };
        return this;
    }

    run() {
        if (this.dur < 0.0001 && this.update) {
            this.update(0); // run once by default if duration is negligible
            return;
        }
        this.cancelTimeouts();

        var _this = this;
        this.startTimeMS = (new Date()).getTime();
        this.timeout();
        this.cancelCallback = function() {
            _this.cancel();
        };
    }
    timeout() {
        var _this = this;
        this.updateTimeout = setTimeout(function () {
            let elapsed = Math.min(((new Date()).getTime() - _this.startTimeMS) / _this.dur, 1.0);
            if (elapsed >= 1.0) _this.cancelCallback();
            else {
                _this.update(elapsed); // how much time has passed
                _this.timeout();
            }
        }, 1000.0 / this.fps);
    }

    cancel() {
        this.cancelTimeouts();
        if (this.onComplete) {
            //console.error((new Date()).getTime() - _this.startTimeMS);
            this.onComplete();
            this.onComplete = null;
        }
    }
    cancelTimeouts() {
        if (this.updateTimeout) window.clearTimeout(this.updateTimeout);
        if (this.clearTimeout) window.clearTimeout(this.clearTimeout);
        this.updateTimeout = null;
        this.clearTimeout = null;
    }

}

class StateGraph {
    constructor() {
        this.states = {};
        this.edges = [];
        this.currentState = null;
    }
    addState(name, onEnter=null, onExit=null, enterConditionFunc=null) {
        this.states[name] = {
            enterCondition:enterConditionFunc,
            onEnter:onEnter,
            onExit:onExit
        };
    }
    addEdge(stateA, stateB, directed=true) {
        this.edges.push([stateA, stateB]);
        if (!directed) this.edges.push([stateB, stateA]);
    }
    isEnterable(stateName) {
        if (!this.states[stateName].enterCondition) return true;
        else return this.states[stateName].enterCondition();
    }
    enter(stateName) {
        if (stateName in this.states) {
            if (this.states[stateName].onEnter)
                this.states[stateName].onEnter();
            this.currentState = stateName;
        }
    }
    exit(stateName) {
        if (stateName in this.states) {
            if (this.states[stateName].onExit)
                this.states[stateName].onExit();
        }
    }
    transition(stateA, stateB) {
        this.exit(stateA);
        this.enter(stateB);
    }
    getEnterableStatesFrom(startStateName) {
        var states = [];
        for (let edge of this.edges) {
            if (edge[0] === startStateName && this.isEnterable(edge[1]))
                states.push(edge[1]);
        }
        return states;
    }
}
