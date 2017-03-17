const TOOLBOX_HEIGHT = 90;
const UI_PADDING = 10;

/** A subclass of Stage that assumes Nodes are Expressions
    and allows for saving state. */
class ReductStage extends mag.Stage {
    constructor(canvas=null) {
        super(canvas);
        this.stateStack = [];
        this.environment = new Environment();
        this.md = new MobileDetect(window.navigator.userAgent);
        this.onorientationchange();
    }

    buildUI(showEnvironment, envDisplayWidth) {
        let canvas_screen = this.boundingSize;
        let UI_PADDING = 10;

        var btn_back = new mag.Button(canvas_screen.w - 64*3 - UI_PADDING, UI_PADDING, 64, 64,
            { default:'btn-back-default', hover:'btn-back-hover', down:'btn-back-down' },
            () => {
            //returnToMenu();
            prev(); // go back to previous level; see index.html.
        });

        var btn_reset = new mag.Button(btn_back.pos.x + btn_back.size.w, UI_PADDING, 64, 64,
            { default:'btn-reset-default', hover:'btn-reset-hover', down:'btn-reset-down' },
            () => {
            initBoard(); // reset board state; see index.html.
        });
        var btn_next = new mag.Button(btn_reset.pos.x + btn_reset.size.w, UI_PADDING, 64, 64,
            { default:'btn-next-default', hover:'btn-next-hover', down:'btn-next-down' },
            () => {
            next(); // go back to previous level; see index.html.
        });

        if (__SHOW_DEV_INFO) {
            this.add(btn_back);
            this.add(btn_next);
        }
        else {
            btn_reset.pos = btn_next.pos;
        }
        this.add(btn_reset);

        // Toolbox
        var toolbox = new Toolbox(0, canvas_screen.h - TOOLBOX_HEIGHT, canvas_screen.w, TOOLBOX_HEIGHT);
        this.add(toolbox);
        this.toolbox = toolbox;

        // Environment
        let yOffset = btn_reset.absoluteSize.h + btn_reset.absolutePos.y + 20;
        var env = new (ExprManager.getClass('environment_display'))(canvas_screen.w - envDisplayWidth, yOffset, envDisplayWidth, canvas_screen.h - TOOLBOX_HEIGHT - yOffset);
        if (showEnvironment) {
            this.add(env);
        }
        this.environmentDisplay = env;

        this.uiNodes = [ btn_back, btn_reset, btn_next, toolbox, env ];
    }

    layoutUI() {
        // layoutUI is called through onorientationchange in the
        // constructor, before we have any UI nodes
        if (!this.uiNodes) return;

        let canvas_screen = this.boundingSize;

        let btn_back = this.uiNodes[0];
        let btn_reset = this.uiNodes[1];
        let btn_next = this.uiNodes[2];

        if (__SHOW_DEV_INFO) {
            btn_back.pos = {
                x: canvas_screen.w - 64*3 - UI_PADDING,
                y: btn_back.pos.y,
            };
            btn_reset.pos = {
                x: canvas_screen.w - 64*2 - UI_PADDING,
                y: btn_reset.pos.y,
            };
            btn_next.pos = {
                x: canvas_screen.w - 64 - UI_PADDING,
                y: btn_next.pos.y,
            };
        }
        else {
            btn_reset.pos = {
                x: canvas_screen.w - 64 - UI_PADDING,
                y: btn_reset.pos.y,
            };
        }

        this.toolbox.pos = {
            x: 0,
            y: canvas_screen.h - TOOLBOX_HEIGHT,
        };
        this.toolbox.size = {
            w: canvas_screen.w,
            h: TOOLBOX_HEIGHT,
        };

        let yOffset = btn_reset.absoluteSize.h + btn_reset.absolutePos.y + 20;
        this.environmentDisplay._pos = {
            x: canvas_screen.w - this.environmentDisplay.size.w,
            y: yOffset,
        };
        this.environmentDisplay._size = {
            w: this.environmentDisplay.size.w,
            h: canvas_screen.h - TOOLBOX_HEIGHT - yOffset,
        };
    }

    finishLoading() {
        let innerStages = this.getNodesWithClass(ReductStageExpr);
        innerStages.forEach((stg) => {
            stg.build();
        });
    }

    // Save state of game board and push onto undo stack.
    saveState() {
        // TODO: DML save and restore the environment as well.
        var board = this.expressionNodes().map((n) => n.clone());
        board = board.filter((n) => !(n instanceof ExpressionEffect));
        var toolbox = this.toolboxNodes().map((n) => n.clone());
        this.stateStack.push( { 'board':board, 'toolbox':toolbox } );
    }

    // Restore previous state of game board.
    restoreState() {
        if (this.stateStack.length > 0) {
            //this.nodes = this.stateStack.pop();

            this.expressionNodes().forEach((n) => this.remove(n));
            this.toolboxNodes().forEach((n) => this.remove(n));
            let restored_state = this.stateStack.pop();
            restored_state.board.forEach((n) => this.add(n));
            restored_state.toolbox.forEach((n) => {
                n.toolbox = this.toolbox;
                this.add(n);
            });

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

    // Checks for level completion.
    update() {
        super.update();

        if (this.isCompleted) {
            let level_complete = this.isCompleted();

            if (level_complete) {

                // DEBUG TEST FLYTO ANIMATION.
                if (!this.ranCompletionAnim) {

                    Logger.log( 'victory', { 'final_state':this.toString(), 'num_of_moves':undefined } );

                    let you_win = () => {

                        //if (level_idx < 1) {
                            var cmp = new mag.ImageRect(GLOBAL_DEFAULT_SCREENSIZE.w / 2, GLOBAL_DEFAULT_SCREENSIZE.h / 2, 740 / 2, 146 / 2, 'victory');
                            cmp.anchor = { x:0.5, y:0.5 };
                            this.add(cmp);
                            this.draw();

                            Resource.play('victory');
                            Animate.wait(1080).after(function () {
                                next();
                            });
                        //} else { // Skip victory jingle on every level after first.
                        //    next();
                        //}
                    };

                    let pairs = level_complete;
                    let num_exploded = 0;
                    let playedSplosionAudio = false;

                    pairs.forEach((pair, idx) => {
                        var node = pair[0];
                        var goalNode = pair[1];
                        node.ignoreEvents = true;

                        Resource.play('matching-goal');

                        var blinkCount = level_idx === 0 ? 2 : 1;
                        Animate.blink([node, goalNode], 2500 / 2.0 * blinkCount, [0, 1, 1], blinkCount).after(() => {
                            //Resource.play('shootwee');

                            this.playerWon = true;

                            //Animate.flyToTarget(node, goalNode.absolutePos, 2500.0, { x:200, y:300 }, () => {
                                SplosionEffect.run(node);
                                SplosionEffect.run(goalNode);

                                if (!playedSplosionAudio) {
                                    // Play sFx.
                                    Resource.play('splosion');
                                    playedSplosionAudio = true;
                                }

                                goalNode.parent.removeChild(goalNode);
                                num_exploded++;
                                if (num_exploded === pairs.length) {
                                    Animate.wait(500).after(you_win);
                                }
                            //});

                        });


                    });

                    this.ranCompletionAnim = true;
                }
            }
        }
    }

    onmouseclick(pos) {

        // Let player click to continue.
        if (!__IS_MOBILE && this.playerWon) {
            Logger.log('clicked-to-continue', '');
            next();
        }

        super.onmouseclick(pos);
    }

    toString() {
        let stringify = (nodes) => nodes.reduce((prev, curr) => {
            let s = curr.toString();
            if (s === '()') return prev; // Skip empty expressions.
            else            return (prev + curr.toString() + ' ');
        }, '').trim();

        let board = this.expressionNodes();
        let toolbox = this.toolboxNodes();
        let exp = {
            'board': stringify(board),
            'toolbox': stringify(toolbox)
        };

        return JSON.stringify(exp);
    }

    onorientationchange() {
        if (__IS_MOBILE) {
            if (this.md.phone()) {
                this.scale = 2.4;
            }
            else if (this.md.tablet()) {
                this.scale = 1.2;
            }
            else if (this.md.mobile()) {
                this.scale = 2.0;
            }
            else {
                this.scale = 1.0;
            }
        }
        this.layoutUI();
    }
}
