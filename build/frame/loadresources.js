'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

function LOAD_REDUCT_RESOURCES(Resource) {
    var __RESOURCE_PATH = Resource.path;
    var __LEVELS_PATH = __RESOURCE_PATH + 'levels/';

    var loadAudio = Resource.loadAudio;
    var loadImage = Resource.loadImage;
    var loadImageSequence = Resource.loadImageSequence;
    var loadAnimation = Resource.loadAnimation;

    var levels = [];
    var chapters = [];
    var markChapter = function markChapter(alias, desc, prev_levels) {
        chapters.push({ name: alias, description: desc, startIdx: prev_levels.length });
    };
    var pushChapter = function pushChapter(json) {
        markChapter(json.chapterName, json.description, levels);
        json.levels.forEach(function (lvl) {
            levels.push(lvl);
        });
    };
    var loadChapterFromFile = function loadChapterFromFile(json_filename) {
        return new Promise(function (resolve, reject) {
            $.getJSON(__LEVELS_PATH + json_filename + '.json', function (json) {
                pushChapter(json);
                resolve();
            });
        });
    };
    var loadChaptersFromFiles = function loadChaptersFromFiles(files) {
        // Loads all chapters from json files asynchronously.
        // Chain loading promises
        return files.reduce(function (prev, curr) {
            return prev.then(function () {
                return loadChapterFromFile(curr);
            });
        }, Promise.resolve());
    };

    Resource.markChapter = markChapter;
    Resource.pushChapter = pushChapter;
    Resource.loadChapterFromFile = loadChapterFromFile;
    Resource.loadChaptersFromFiles = loadChaptersFromFiles;

    // Add resources here:
    loadAudio('pop', 'pop.wav');
    loadAudio('poof', 'poof.wav');
    loadAudio('bag-spill', 'spill.wav');
    loadAudio('bag-addItem', 'putaway.wav');
    loadAudio('heatup', 'heatup.wav');
    loadAudio('shatter', 'shatter1.wav');
    loadAudio('mirror-shatter', 'shatter2.wav');
    loadAudio('splosion', 'firework1.wav');
    loadAudio('shootwee', 'firework-shooting.wav');
    loadAudio('key-jiggle', 'key-jiggle.wav');
    loadAudio('key-unlock', 'key-unlock-fast.wav');
    loadAudio('victory', '325805__wagna__collect.wav');
    loadAudio('matching-goal', 'matching-the-goal2.wav');
    loadAudio('mutate', 'deflate.wav');
    loadAudio('game-complete', 'game-complete.wav');

    loadImage('bag-background', 'bg-stars.png');
    loadImage('lambda-hole', 'lambda-hole.png');
    loadImage('lambda-hole-opening0', 'lambda-hole-opening1.png');
    loadImage('lambda-hole-opening1', 'lambda-hole-opening2.png');
    loadImage('lambda-hole-closed', 'lambda-hole-closed.png');
    loadImage('lambda-hole-red', 'lambda-hole-white.png');
    loadImage('lambda-hole-red-closed', 'lambda-hole-white-closed.png');
    loadImage('lambda-pipe', 'lambda-pipe-closed.png');
    loadImage('lambda-pipe-open', 'lambda-pipe-open.png');
    loadImage('lambda-pipe-red', 'lambda-pipe-white-closed.png');
    loadImage('lambda-pipe-red-open', 'lambda-pipe-white-open.png');
    loadImage('lambda-pipe-opening0', 'lambda-pipe-opening0.png');
    loadImage('lambda-pipe-opening1', 'lambda-pipe-opening1.png');
    loadImage('null-circle', 'null1.png');
    loadImage('null-circle-highlight', 'null1-highlighted.png');
    loadImage('lock-icon', 'lock-icon.png');
    loadImage('lock-icon-unlocked', 'lock-icon-unlocked.png');
    loadImage('key-icon', 'key-icon.png');
    loadImage('broken-key-icon', 'broken-key-icon.png');
    loadImage('lock-keyhole', 'lock-keyhole.png');
    loadImage('lock-top-locked', 'lock-top-locked.png');
    loadImage('lock-top-unlocked', 'lock-top-unlocked.png');
    loadImage('shinewrap', 'stripeshine-wrap.png');
    loadImage('shinewrap-rightend', 'stripeshine-wrap-rightend.png');
    loadImage('mirror-icon', 'mirror.png');
    loadImage('mirror-icon-broken', 'mirror-broken.png');
    loadImage('mirror-icon-fade-true', 'mirror-fade-true.png');
    loadImage('mirror-icon-fade-false', 'mirror-fade-false.png');
    loadImage('mirror-icon-fade-false-lefthalf', 'mirror-fade-false-lefthalf.png');
    loadImage('mirror-icon-fade-false-righthalf', 'mirror-fade-false-righthalf.png');
    loadImage('funnel', 'funnel.png');
    loadImage('funnel-selected', 'funnel-selected.png');

    // UI Images.
    loadImage('btn-next-default', 'next-button.png');
    loadImage('btn-next-hover', 'next-button-hover.png');
    loadImage('btn-next-down', 'next-button-down.png');
    loadImage('btn-back-default', 'back-button.png');
    loadImage('btn-back-hover', 'back-button-hover.png');
    loadImage('btn-back-down', 'back-button-down.png');
    loadImage('btn-reset-default', 'reset-button.png');
    loadImage('btn-reset-hover', 'reset-button-hover.png');
    loadImage('btn-reset-down', 'reset-button-down.png');
    loadImage('toolbox-bg', 'toolbox-tiled-bg.png');
    loadImage('victory', 'you-win.png');

    // Concreteness faded images.
    loadImage('missing-bracket', 'missing-bracket.png');
    loadImage('missing-bracket-selected', 'missing-bracket-selected.png');
    loadImage('lambda-hole-x', 'lambda-hole-x.png');
    loadImage('lambda-hole-x-closed', 'lambda-hole-x-closed.png');
    loadImage('lambda-hole-x-es6', 'lambda-hole-x-es6.png');
    loadImage('lambda-hole-x-closed-es6', 'lambda-hole-x-closed-es6.png');
    loadImage('lambda-pipe-x', 'lambda-pipe-x-closed.png');
    loadImage('lambda-pipe-x-open', 'lambda-pipe-x-open.png');
    loadImage('lambda-pipe-x-opening0', 'lambda-pipe-x-opening0.png');
    loadImage('lambda-pipe-x-opening1', 'lambda-pipe-x-opening1.png');
    loadImage('lambda-hole-y', 'lambda-hole-y.png');
    loadImage('lambda-hole-y-closed', 'lambda-hole-y-closed.png');
    loadImage('lambda-pipe-y', 'lambda-pipe-y-closed.png');
    loadImage('lambda-hole-xside', 'lambda-hole-xside.png');
    loadImage('lambda-hole-xside-closed', 'lambda-hole-xside-closed.png');
    loadImage('lambda-pipe-xside-closed', 'lambda-pipe-xside-closed.png');

    // Loads poof0.png, poof1.png, ..., poof4.png (as poof0, poof1, ..., poof4, respectively).
    loadImageSequence('poof', 'poof.png', [0, 4]);

    // Load preset animations from image sequences.
    loadAnimation('poof', [0, 4], 120); // Cloud 'poof' animation for destructor piece.

    // Add levels here: (for now)
    // * The '/' character makes the following expression ignore mouse events (can't be drag n dropped). *
    var chapter_load_prom = loadChaptersFromFiles(['intro', 'booleans', 'conditionals', 'bindings', 'bags', 'combination', 'map']); //,     'posttest_v1', 'experimental'] );

    Resource.buildLevel = function (level_desc, canvas) {
        ExprManager.clearFadeLevels();
        if ('fade' in level_desc) {
            for (var key in level_desc.fade) {
                console.log(key);
                ExprManager.setFadeLevel(key, level_desc.fade[key]);
            }
        }

        var fadedBorders = ExprManager.fadeBordersAt(level_idx);
        if (fadedBorders.length > 0) {
            var _ret = function () {

                ExprManager.fadesAtBorder = false;
                var unfaded = Level.make(level_desc.board, level_desc.goal, level_desc.toolbox).build(canvas);
                ExprManager.fadesAtBorder = true;
                var faded = Level.make(level_desc.board, level_desc.goal, level_desc.toolbox).build(canvas);

                var unfaded_exprs = unfaded.nodes;
                var faded_exprs = faded.nodes;

                if (unfaded_exprs.length !== faded_exprs.length) {
                    console.error('Cannot execute fade animation at fade border: Node arrays of unequal length.');
                    return {
                        v: faded
                    };
                }

                unfaded.invalidate();

                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = fadedBorders[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var border = _step.value;


                        var unfaded_roots = unfaded.getRootNodesThatIncludeClass(border.unfadedClass);
                        var faded_roots = faded.getRootNodesThatIncludeClass(border.fadedClass);

                        if (unfaded_roots.length !== faded_roots.length) {
                            console.error('Cannot fade border ', border, ': Different # of root expressions.', unfaded_roots, faded_roots);
                            continue;
                        }

                        var _loop = function _loop(r) {
                            var unfaded_root = unfaded_roots[r];
                            var root = faded_roots[r];

                            // DEBUG: This only works for level 50!
                            if (unfaded.uiGoalNodes.indexOf(unfaded_root) > -1) {
                                unfaded_root = unfaded_root.children[0];
                                root = root.children[0];
                            }

                            if (unfaded_root.fadingOut) return 'continue';

                            unfaded_root.fadingOut = true;
                            unfaded_root.opacity = 1.0;
                            unfaded_root._stage = null;
                            unfaded_root.pos = root.pos;
                            faded.add(unfaded_root);
                            root.opacity = 0;

                            SparkleTrigger.run(unfaded_root, function () {

                                Logger.log('faded-expr', { 'expr': unfaded_root.toString(), 'state': faded.toString() });
                                Resource.play('mutate');

                                Animate.tween(root, { 'opacity': 1.0 }, 2000).after(function () {
                                    root.ignoreEvents = false;
                                });
                                Animate.tween(unfaded_root, { 'opacity': 0.0 }, 1000).after(function () {
                                    faded.remove(unfaded_root);
                                });
                            });

                            // Cross-fade old expression to new.
                            root.ignoreEvents = true;
                            unfaded_root.ignoreEvents = true;
                            /*Animate.tween(root, { 'opacity':1.0 }, 3000).after(() => {
                                root.ignoreEvents = false;
                            });
                            Animate.tween(unfaded_root, { 'opacity':0.0 }, 2000).after(() => {
                                faded.remove(unfaded_root);
                            });*/
                        };

                        for (var r = 0; r < faded_roots.length; r++) {
                            var _ret2 = _loop(r);

                            if (_ret2 === 'continue') continue;
                        }
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }

                return {
                    v: faded
                };
            }();

            if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
        } else {
            return Level.make(level_desc.board, level_desc.goal, level_desc.toolbox).build(canvas);
        }
    };
    Resource.level = levels;
    Resource.getChapters = function () {
        if (chapter_load_prom) return chapter_load_prom.then(function () {
            chapter_load_prom = null;
            return new Promise(function (resolve, reject) {
                resolve(chapters.slice());
            });
        });else return new Promise(function (resolve, reject) {
            resolve(chapters.slice());
        });
    };
    Resource.getChapter = function (name) {
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
            for (var _iterator2 = chapters[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var c = _step2.value;

                if (c.name === name) return c;
            }
        } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                    _iterator2.return();
                }
            } finally {
                if (_didIteratorError2) {
                    throw _iteratorError2;
                }
            }
        }

        return undefined;
    };
}