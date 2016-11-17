var __SHOW_DEV_INFO = false;
var __COND = 'unknown';

var GLOBAL_DEFAULT_CTX = null;
var GLOBAL_DEFAULT_SCREENSIZE = null;
var stage;
var canvas;

var level_idx = getCookie('level_idx') || 0;
if (level_idx !== 0) level_idx = parseInt(level_idx);

function init() {

    // -- TEST CORS --
    // $.ajax({
    //     type: "GET",
    //     url: 'http://gdiac.cs.cornell.edu/research_games/page_load.php',
    //     data:{game_id:7017018, client_timestamp:1},
    //     async:true,
    //     dataType : 'jsonp',   //you may use jsonp for cross origin request
    //     crossDomain:true,
    //     success: function(data, status, xhr) {
    //         //console.log('Connected to server.');
    //     }
    // });

    LOAD_REDUCT_RESOURCES(Resource);

    if (!__SHOW_DEV_INFO)
        $('#devinfo').hide();

    if (__GET_PARAMS) {
        var start_from = __GET_PARAMS.level;
        var fade_level = __GET_PARAMS.fade;
        //var playerId = __GET_PARAMS.player;
        if (start_from) {
            console.log(start_from);
            level_idx = parseInt(start_from);
        }
        //if (playerId) {
        //    Logger.playerId = playerId;
        //}
        if (fade_level && fade_level > 0) {
           ExprManager.setDefaultFadeLevel(parseInt(fade_level));
        }
    }

    // Start a new log session (creating userID as necessary),
    // and then begin the game.
    Logger.startSession().then(function (userinfo) {

        if (userinfo.cond) {
            __COND = userinfo.cond;

            if (userinfo.cond === 'B')
                ExprManager.setDefaultFadeLevel(100);
        }

        return loadChapterSelect();
    }).then(initBoard);
}

function loadCustomLevel(lvl_desc, goal_desc) {
    stage = Resource.buildLevel( { board:lvl_desc, goal:goal_desc, toolbox:"" }, canvas );
    stage.update();
    stage.draw();
}
function levelChanged(val) {
    if (!isNaN(parseInt(val))) {
        if (val < 0) val = 0;
        else if (val >= Resource.level.length) val = Resource.level.length - 1;
        level_idx = val;
        initBoard();
    }
}

function clearStage() {
    if (stage) {
        stage.clear();
        stage.invalidate();
        //delete stage;
        stage = null;
    }

    if (mag.AnimationUpdateLoop) {
        mag.AnimationUpdateLoop.clear();
    }
}

function initBoard() {

    canvas = document.getElementById('canvas');

    if (canvas.getContext) {

        clearStage();

        if (__IS_MOBILE) {

            // Width 100% and height 100%
            let resizeCanvas = function() {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                GLOBAL_DEFAULT_SCREENSIZE = canvas.getBoundingClientRect();
            };

            // Resize canvas during a mobile phone orientation change.
            window.addEventListener('resize', resizeCanvas, false);
            window.addEventListener('orientationchange', resizeCanvas, false);
            resizeCanvas();
        }

        hideHelpText();
        hideEndGame();
        updateProgressBar();

        // New: saves progress upon reload.
        setCookie('level_idx', level_idx);

        GLOBAL_DEFAULT_CTX = canvas.getContext('2d');
        GLOBAL_DEFAULT_SCREENSIZE = canvas.getBoundingClientRect();
        $('#lvl_num_visible').text((level_idx+1) + '');
        //document.getElementById('lvl_desc').innerHTML = Resource.level[level_idx].description || '(No description.)';

        let redraw = (stage) => {
            stage.update();
            stage.draw();
            stage.draw();
        };


        stage = new MainMenu(canvas, () => {

            // stage = new LevelSelectMenu(canvas, 'Basics', (level) => {
            //     stage = Resource.buildLevel(level, canvas);
            //     redraw(stage);
            // });
            // redraw(stage);

            //Clicks 'play' button. Transition to chapter select screen.
            stage = new ChapterSelectMenu(canvas, (chapterName) => {
                stage = Resource.startChapter(chapterName, canvas);
                redraw(stage);
            }, (levelSelected) => {
                stage = Resource.buildLevel(levelSelected, canvas);
                redraw(stage);
            });
            redraw(stage);

        }, () => {
            // Clicked 'settings' button. Transition to settings screen.
        });
        redraw(stage);
        return;

        stage = Resource.buildLevel(Resource.level[level_idx], canvas);

        Logger.transitionToTask(level_idx, stage.toString()).then(function() {

            Logger.log('condition', __COND);

        }).catch(function (err) {
            //console.error(err);
        });

        /*var es = stage.getNodesWithClass(Expression, [], true);
        var tes = stage.getNodesWithClass(TextExpr, [], true);
        es.forEach(function(e) {
            e.color = "white";
        });
        tes.forEach(function(t) {
            t.color = "black";
        });*/

        // One-time only blink of lambda holes on first level.
        if (level_idx === 0) {
            var holes = stage.getNodesWithClass(FadedES6LambdaHoleExpr, [], true);
            if (holes.length > 0) { // This is the 'faded' (completely abstract) version of the game.
                showHelpText();
                var runCount = 0;
                var waitBlink = function (waittime, blinktime, cancelCond) {
                    Animate.wait(waittime).after(function() {
                        if (cancelCond()) {
                            return;
                        }
                        else Animate.blink(holes, blinktime, [1,1,0], 1).after(function() {
                            runCount++;
                            waitBlink(waittime, blinktime, cancelCond);
                        });
                    });
                };
                waitBlink(3000, 1500, function() {
                    return !(holes[0].stage) || !(holes[0].parent) || stage.ranCompletionAnim || runCount > 1;
                });
            }
        }

        stage.update();
        stage.draw();

        // This fixes some render bugs. Not exactly sure why.
        stage.draw();
    }
}

function initEndGame() {
    canvas = document.getElementById('canvas');
    if (canvas.getContext) {

        clearStage();
        updateProgressBar();

        var size = canvas.getBoundingClientRect();
        $('#endscreen').css( { top:size.height / 3.0 } );
        $('#endscreen').show();

        Logger.log('game-complete', {});

        Resource.play('game-complete');
    }
}
function hideEndGame() {
    $('#endscreen').hide();
}

function showHelpText(txt) {
    var help = $('#help');
    var size = canvas.getBoundingClientRect();
    help.css( { top:size.height / 1.3, color:'#AAA' } );
    if (txt) help.text(txt);
    help.show();
}
function hideHelpText() {
    $('#help').hide();
}

function toggleDevInfo() {
    var devinfo = $('#devinfo');
    var txt = $('#devInfoBtnText');
    if (devinfo.is(':visible')) {
        devinfo.hide();
        txt.text('Show');
    } else {
        devinfo.show();
        txt.text('Hide');
    }
}

var __IS_LOGGING = true;
function toggleLogging() {
    var l = $('#toggleLogLink');
    if (Logger.isLogging()) {
        Logger.toggleLogging(false);
        l.text("Click here you'd like to turn data logging back on.");
    } else {
        Logger.toggleLogging(true);
        l.text("Click here you'd prefer to turn data logging off.");
    }
}

function updateProgressBar() {
    setProgressBar('progressBar', 'progressBarContainer', level_idx / (Resource.level.length - 1));
}
function prev() {
    if (!Logger.sessionBegan()) return;
    if (level_idx === 0) initBoard();
    else {
        level_idx--;
        initBoard();
    }
}
function next() {
    if (!Logger.sessionBegan()) return;
    if (level_idx === Resource.level.length-1) {
        initEndGame();
    }
    else {
        level_idx++;
        initBoard();
    }
}
function undo() {
    if (!Logger.sessionBegan()) return;
    stage.restoreState();
}

function loadChapterSelect() {
    /*var sel = document.getElementById("chapterSelect");
    removeOptions(sel); // clear old options.
    return Resource.getChapters().then( function(chapters) {
        chapters.forEach(function (chap) {
            var option = document.createElement("option");
            option.text = chap.description;
            option.value = chap.name;
            sel.add(option);
        });*/
    return Resource.getChapters();
    //} );
}
function gotoChapter() {
    var sel = document.getElementById('chapterSelect');
    var selected_chapter = sel.options[sel.selectedIndex].value;
    level_idx = Resource.getChapter(selected_chapter).startIdx;
    initBoard();
}
