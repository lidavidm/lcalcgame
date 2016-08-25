class Stage {
    constructor(canvas=null) {
        if (canvas) this.canvas = canvas;
        else        this.ctx = null;
        this.clear = () => this.ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.nodes = [];
        this.hoverNode = null;
        this.stateStack = [];
    }
    get canvas() { return this._canvas; }
    set canvas(c) {
        if (c) {
            delegateMouse(canvas, this);
            this.ctx = canvas.getContext('2d');
        } else {
            delegateMouse(canvas, null);
            this.ctx = null;
        }
    }
    add(node) {
        node.ctx = this.ctx;
        node.stage = this;
        if(node.locked) node.unlock();
        this.nodes.push(node);
    }
    addAll(nodes) {
        var _this = this;
        nodes.forEach((n) => _this.add(n));
    }
    getNodesWithClass(Class, excludedNodes=[], recursive=true, nodes=null) {
        if (!nodes) nodes = this.nodes;
        return Stage.getNodesWithClass(Class, excludedNodes, recursive, nodes);
    }
    static getNodesWithClass(Class, excludedNodes=[], recursive=true, nodes=null) {
        if (!nodes) return null;
        var rt = [];
        nodes.forEach((n) => {
            var excluded = false;
            excludedNodes.forEach((excn) => {excluded |= n == excn || n.ignoreGetClassInstance;});
            if (excluded) {
                //console.log('excluded: ', excludedNodes);
                return;
            }
            else if (n instanceof Class) rt.push(n);
            if (recursive && n.children.length > 0) {
                let childs = this.getNodesWithClass(Class, excludedNodes, true, n.children);
                childs.forEach((c) => rt.push(c));
            }
        });
        return rt;
    }
    remove(node) {
        var i = this.nodes.indexOf(node);
        if (i > -1) {
            this.nodes[i].ctx = null;
            this.nodes[i].stage = null;
            this.nodes.splice(i, 1);
        }
    }
    swap(node, anotherNodeOrNodes) {
        var i = this.nodes.indexOf(node);
        if (i > -1) {

            // just delete the node...
            if (anotherNodeOrNodes === null) {
                this.nodes.splice(i, 1);
                return;
            }

            this.nodes[i].ctx = null;
            this.nodes[i].stage = null;
            var origpos = this.nodes[i].upperLeftPos(this.nodes[i].absolutePos, this.nodes[i].absoluteSize);
            var pos;
            var total_width = 0;
            var rightpos;
            var scale = this.nodes[i].scale;

            var anotherNode = anotherNodeOrNodes;
            if (!Array.isArray(anotherNode)) {
                anotherNode = [anotherNode];
                origpos = this.nodes[i].centerPos();
            }

            pos = clonePos(origpos);

            for (let j = 0; j < anotherNode.length; j++) {
                var an = anotherNode[j];
                an.unlock();
                an.pos = pos;
                an.ctx = this.ctx;
                an.parent = null;
                an.stage = this;
                an.scale = this.nodes[i].scale;
                if (anotherNode.length === 1)
                    an.anchor = { x:0.5, y:0.5 };
                an.onmouseleave();
                pos = addPos({ x:an.size.w + 6, y:0 }, pos);
                total_width += an.size.w + 6;
                if (j === 0) this.nodes.splice(i, 1, an);
                else this.nodes.splice(i+j, 0, an);
            }

            // Can't duplicate horizontally or we'll go off-screen.
            // So, duplicate vertically.
            if (total_width > GLOBAL_DEFAULT_SCREENSIZE.width) {
                pos = clonePos(origpos);
                anotherNode.forEach((n) => {
                    let p = n.pos;
                    n.pos = pos;
                    n.anchor = { x:0, y:0.5 };
                    pos = addPos({x:0, y:an.size.h + 6}, pos);
                });
            }
            if (pos.x > GLOBAL_DEFAULT_SCREENSIZE.width) {
                let offset = pos.x - GLOBAL_DEFAULT_SCREENSIZE.width;
                anotherNode.forEach((n) => {
                    let p = n.pos;
                    n.pos = { x:p.x - offset, y:p.y };
                });
            }

            //console.warn('nodes = ', this.nodes, this);
            //this.draw();
        }
    }
    bringToFront(node) {
        var i = this.nodes.indexOf(node);
        if (i > -1 && i < this.nodes.length-1) {
            var n = this.nodes[i];
            this.nodes.splice(i, 1);
            this.nodes.push(n);
            this.draw();
        }
    }
    update() {
        this.nodes.forEach((n) => n.update());

        if (this.isCompleted) {
            let level_complete = this.isCompleted();

            if (level_complete) {

                // DEBUG TEST FLYTO ANIMATION.
                if (!this.ranCompletionAnim) {

                    let you_win = () => {
                        Logger.log( 'victory', { 'final_state':this.toString(), 'num_of_moves':undefined } );

                        var cmp = new ImageRect(GLOBAL_DEFAULT_SCREENSIZE.width / 2, GLOBAL_DEFAULT_SCREENSIZE.height / 2, 740 / 2, 146 / 2, 'victory');
                        cmp.anchor = { x:0.5, y:0.5 };
                        this.add(cmp);
                        this.draw();

                        Resource.play('victory');
                        Animate.wait(Resource.getAudio('victory').duration * 1000).after(function () {
                            next();
                        });
                    };

                    let pairs = level_complete;
                    let num_exploded = 0;

                    pairs.forEach((pair, idx) => {
                        var node = pair[0];
                        var goalNode = pair[1];
                        node.ignoreEvents = true;

                        Resource.play('matching-goal');

                        var blinkCount = level_idx === 0 ? 2 : 1;
                        Animate.blink([node, goalNode], 3800 / 2.0 * blinkCount, [0, 1, 1], blinkCount).after(() => {
                            //Resource.play('shootwee');

                            Animate.flyToTarget(node, goalNode.absolutePos, 2500.0, { x:200, y:300 }, () => {
                                SplosionEffect.run(node);
                                console.log(goalNode);
                                goalNode.parent.removeChild(goalNode);
                                num_exploded++;
                                if (num_exploded === pairs.length) {
                                    Animate.wait(500).after(you_win);
                                }
                            });

                        });


                    });

                    this.ranCompletionAnim = true;
                }
            }

            console.warn('LEVEL IS COMPLETE? ', level_complete);
        }
    }
    invalidate(nodes) {
        if (typeof nodes === 'undefined') nodes = this.nodes;
        else if (nodes && nodes.length === 0) return;
        var _this = this;
        nodes.forEach((n) => {
            n.ctx = null;
            _this.invalidate(n.children);
        });
        this.invalidated = true;
    }
    draw() {
        if (this.invalidated) return; // don't draw invalidated stages.
        this.ctx.save();
        this.ctx.scale(1,1);
        this.clear();
        this.nodes.forEach((n) => n.draw());
        this.ctx.restore();
    }

    // State.
    saveState() {
        var clones = this.expressionNodes().map((n) => n.clone());
        clones = clones.filter((n) => !(n instanceof ExpressionEffect));
        this.stateStack.push(clones);
    }
    restoreState() {
        if (this.stateStack.length > 0) {
            this.nodes = this.stateStack.pop();
            this.update();
            this.draw();

            Logger.log('state-restore', this.toString());
        }
    }
    dumpState() {
        if (this.stateStack.length > 0) {
            this.stateStack.pop();
        }
    }

    // Event handlers.
    getNodeUnder(node, pos) {
        var hit_nodes = this.getHitNodes(pos, {'exclude':[node]});
        var hit = null;
        if (hit_nodes.length > 0) {
            for(let i = hit_nodes.length-1; i > -1; i--) {
                if (hit_nodes[i] != node)
                    hit = hit_nodes[i];
            }
        }
        return hit;
    }
    onmousedown(pos) { // Mouse clicked down.
        var hit_nodes = this.getHitNodes(pos);
        if (hit_nodes.length > 0) {
            hit_nodes[hit_nodes.length-1].onmousedown(pos); // only send to top-most node??
            this.heldNode = hit_nodes[hit_nodes.length-1];

            //console.log('Clicked node: ', hit_nodes[hit_nodes.length-1].color, hit_nodes[0]);

            if (this.lastHeldNode != this.heldNode) {
                var holes = this.getNodesWithClass(MissingExpression, [this.heldNode]);
                //Animate.blink(holes);
                this.lastHeldNode = this.heldNode;
            }
        }
        this.draw();
    }
    onmousedrag(pos) { // Mouse clicked + moving (drag).
        if (this.heldNode) { // Only send this event to the 'mousedown'd node.

            var nodepos = pos;
            if (this.heldNode.absoluteSize) {
                if (!this.heldNodeOrigOffset)
                    this.heldNodeOrigOffset = fromTo(pos, this.heldNode.absolutePos);
                nodepos = addPos(pos, this.heldNodeOrigOffset);
            }
            this.heldNode.onmousedrag(nodepos);

            // Check which node lies below the heldNode. If there is one,
            // let it know, and store it for the mouseup event.
            var underNode = this.getNodeUnder(this.heldNode, pos);
            if (this.underNode && this.underNode == underNode) { }
            else if (!this.underNode) {
                if (underNode) underNode.ondropenter(this.heldNode, pos);
                this.underNode = underNode;
            } else if (this.underNode != underNode) { // this.underNode != underNode
                if (underNode) underNode.ondropenter(this.heldNode, pos);
                this.underNode.ondropexit(this.heldNode, pos);
                this.underNode = underNode;
            }

            this.draw();
        }
    }
    onmousehover(pos) { // Hovering without clicking.
        // .. safest to do nothing here for now .. //
        var hit_nodes = this.getHitNodes(pos);
        var hit = hit_nodes[hit_nodes.length-1];
        if (this.hoverNode) {
            if (hit === this.hoverNode) { // If hovering over this node and not its children...
                this.hoverNode.onmousehover(pos);
                //console.log('hovering over ', this.hoverNode.color);
                this.draw();
                return;
            }
            else {
                this.hoverNode.onmouseleave(pos);
                //console.log('left ', this.hoverNode.color);
                if (hit) {
                    hit.onmouseenter(pos);
                    this.hoverNode = hit;
                    this.draw();
                    return;
                } else {
                    this.hoverNode = null;
                    this.draw();
                }
            }
        }
        if (hit_nodes.length > 0) {
            hit_nodes[hit_nodes.length-1].onmouseenter(pos); // only send to top-most node??
            this.hoverNode = hit_nodes[hit_nodes.length-1];
            this.draw();
        }
    }
    onmouseclick(pos) {
        if (this.heldNode) {
            this.heldNode.onmouseclick(pos);
        }
    }
    onmouseup(pos) { // Mouse button unclicked.
        if (this.heldNode) { // Only send this event to the 'mousedown'd node.

            // Drag 'n' drop droppped event.
            if (this.underNode) {
                this.underNode.ondropped(this.heldNode, pos);
                this.underNode = null;
            }

            this.heldNode.onmouseup(pos);
            this.heldNode = null;
            this.heldNodeOrigOffset = null;

            this.update();
            this.draw();
        }
    }
    getHitNodes(pos, options={}) {
        var hits = [];
        var hitnode = null;
        this.nodes.forEach((n) => {
            hitnode = n.hits(pos, options);
            if (hitnode) hits.push(hitnode);
        });
        return hits;
    }

    toString() {
        let nodes = this.expressionNodes();
        let exp = nodes.reduce((prev, curr) => {
            let s = curr.toString();
            if (s === '()') return prev; // Skip empty expressions.
            else            return (prev + curr.toString() + ' ');
        }, '').trim();
        return exp;
    }
}

function delegateMouse(canvas, stage) {

    var mouseIsDown = false;
    var mouseDragged = false;
    function getMousePos(evt) {
        var rect = canvas.getBoundingClientRect();
        return {
          x: evt.clientX - rect.left,
          y: evt.clientY - rect.top
        };
    }
    function getTouch(evt, idx=0) {
        if (evt.touches.length > 0)
            return evt.touches[idx];
        else
            return evt.changedTouches[idx];
    }

    if (stage) {

        // MOUSE EVENTS
        canvas.onmousedown = function(e){
            stage.onmousedown( getMousePos(e) );

            mouseIsDown = true;
            mouseDragged = false;
        };
        canvas.onmouseup = function(e){
            var mousepos = getMousePos(e);

            if (!mouseDragged) stage.onmouseclick( mousepos );

            stage.onmouseup( mousepos );

            mouseIsDown = false;
            mouseDragged = false;
        };
        canvas.onmousemove = function(e){
            if(!mouseIsDown) {
                stage.onmousehover( getMousePos(e) );
            } else {
                stage.onmousedrag( getMousePos(e) );
                mouseDragged = true;
            }
            return false;
        };

        var ontouchstart = function(e) {

            console.log(e);
            var pos = getMousePos( getTouch(e) );

            stage.onmousehover( pos );
            stage.onmousedown( pos );

            mouseIsDown = true;
            mouseDragged = false;

            e.preventDefault();
        };
        var ontouchmove = function(e) {
            if(!mouseIsDown) {
                console.error('This shouldn\'t be reachable. How did you get here?');
            } else {
                stage.onmousedrag( getMousePos( getTouch(e) ) );
                mouseDragged = true;
            }

            e.preventDefault();
        };
        var ontouchend = function(e) {

            var mousepos = getMousePos( getTouch(e) );

            if (!mouseDragged) stage.onmouseclick( mousepos );

            stage.onmouseup( mousepos );

            mouseIsDown = false;
            mouseDragged = false;

            e.preventDefault();
        };
        var ontouchcancel = function(e) {
            ontouchend(e);
            e.preventDefault();
        };

        // TOUCH EVENTS (MOBILE)
        canvas.addEventListener('touchstart', ontouchstart, false);
        canvas.addEventListener('touchmove', ontouchmove, false);
        canvas.addEventListener('touchend', ontouchend, false);
        canvas.addEventListener('touchcancel', ontouchcancel, false);


    } else {
        canvas.onmousedown = null;
        canvas.onmouseup = null;
        canvas.onmousemove = null;
        mouseIsDown = false;
        mouseDragged = false;
    }
}
