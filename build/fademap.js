'use strict';

var ExprManager = function () {
    var pub = {};

    var _FADE_MAP = {
        'if': [LockIfStatement, InlineLockIfStatement, IfStatement],
        'ifelse': [IfElseStatement],
        'triangle': [TriangleExpr, FadedTriangleExpr],
        'rect': [RectExpr, FadedRectExpr],
        'star': [StarExpr, FadedStarExpr],
        'circle': [CircleExpr, FadedCircleExpr],
        'diamond': [RectExpr, FadedRectExpr],
        '_': [MissingExpression],
        '__': [MissingBagExpression],
        '_b': [MissingKeyExpression, MissingBooleanExpression],
        'true': [KeyTrueExpr, TrueExpr],
        'false': [KeyFalseExpr, FalseExpr],
        'cmp': [MirrorCompareExpr, FadedCompareExpr],
        '==': [MirrorCompareExpr, FadedCompareExpr],
        '!=': [MirrorCompareExpr, FadedCompareExpr],
        'bag': [BagExpr, BracketArrayExpr],
        'count': [CountExpr],
        'map': [SimpleMapFunc, FadedMapFunc],
        'reduce': [ReduceFunc],
        'put': [PutExpr],
        'pop': [PopExpr],
        'define': [DefineExpr],
        'var': [LambdaVarExpr, HalfFadedLambdaVarExpr, FadedLambdaVarExpr, FadedLambdaVarExpr],
        'hole': [LambdaHoleExpr, HalfFadedLambdaHoleExpr, FadedLambdaHoleExpr, FadedES6LambdaHoleExpr],
        'lambda': [LambdaHoleExpr, HalfFadedLambdaHoleExpr, FadedES6LambdaHoleExpr]
    };
    var fade_level = {};
    var DEFAULT_FADE_LEVEL = 0;

    var DEFAULT_FADE_PROGRESSION = {
        'var': [[8, 28], 28, 40],
        'hole': [[8, 28], 28, 40],
        'if': [24, 43],
        '_b': [32],
        '==': [22],
        'true': [44],
        'false': [44],
        'bag': [[49, 518]],
        'primitives': [70],
        'map': [59]
    };
    var primitives = ['triangle', 'rect', 'star', 'circle', 'diamond'];

    pub.fadeBordersAt = function (lvl) {
        var prog = DEFAULT_FADE_PROGRESSION;
        var borders = [];
        for (var t in prog) {
            if (t === 'primitives') continue;
            var ranges = prog[t];
            for (var i = 0; i < ranges.length; i++) {
                var r = ranges[i];
                if (Array.isArray(r)) {
                    if (r[0] === lvl) borders.push([t, i, i + 1, true]);else if (r[1] === lvl) borders.push([t, i + 1, i, false]);
                } else if (r === lvl) {
                    borders.push([t, i, i + 1, true]);
                }
            }
        }
        return borders.map(function (b) {
            return { 'unfadedClass': _FADE_MAP[b[0]][b[1]],
                'fadedClass': _FADE_MAP[b[0]][b[2]],
                'key': b[0] };
        });
    };
    pub.fadesAtBorder = true;

    pub.getClass = function (ename) {
        if (ename in _FADE_MAP) {
            return _FADE_MAP[ename][pub.getFadeLevel(ename)];
        } else {
            console.error('Expression type ' + ename + ' is not in the fade map.');
            return undefined;
        }
    };
    pub.getFadeLevel = function (ename) {

        var is_primitive = primitives.indexOf(ename) > -1;

        if (ename in fade_level) return fade_level[ename];else if ((ename === 'var' || ename === 'hole') && 'lambda' in fade_level) return fade_level.lambda;else if (ename in DEFAULT_FADE_PROGRESSION || is_primitive && "primitives" in DEFAULT_FADE_PROGRESSION) {

            var lvl_map = DEFAULT_FADE_PROGRESSION[is_primitive ? 'primitives' : ename];
            var fadeclass_idx = 0;
            for (var i = 0; i < lvl_map.length; i++) {
                var range = lvl_map[i];
                if (Array.isArray(range)) {
                    if (level_idx >= range[0] && level_idx < range[1]) {
                        if (!pub.fadesAtBorder && level_idx === range[0]) fadeclass_idx = i;else fadeclass_idx = i + 1;
                    }
                } else if (!pub.fadesAtBorder && level_idx === range) fadeclass_idx = i;else if (level_idx >= range) fadeclass_idx = i + 1;
            }
            if (DEFAULT_FADE_LEVEL > fadeclass_idx) return pub.getDefaultFadeLevel(ename);else return fadeclass_idx;
        } else return pub.getDefaultFadeLevel(ename);
    };
    pub.getDefaultFadeLevel = function (ename) {
        if (DEFAULT_FADE_LEVEL >= pub.getNumOfFadeLevels(ename)) return pub.getNumOfFadeLevels(ename) - 1;else return DEFAULT_FADE_LEVEL;
    };
    pub.getNumOfFadeLevels = function (ename) {
        if (!ename) return;else if (!(ename in _FADE_MAP)) {
            console.error('Expression type ' + ename + ' is not in the fade map.');
            return;
        }
        return _FADE_MAP[ename].length;
    };
    pub.setFadeLevel = function (ename, index) {
        if (!ename) return;else if (!(ename in _FADE_MAP)) {
            console.error('Expression type ' + ename + ' is not in the fade map.');
            return;
        } else if (pub.getNumOfFadeLevels(ename) >= index) {
            console.warn('Expression type ' + ename + ' has only ' + pub.getNumOfFadeLevels(ename) + ' fade levels. (' + index + 'exceeds)');
            index = pub.getNumOfFadeLevels(ename) - 1; // Set to max fade.
        }
        fade_level[ename] = index;
    };
    pub.setDefaultFadeLevel = function (index) {
        if (index >= 0) DEFAULT_FADE_LEVEL = index;
    };
    pub.clearFadeLevels = function () {
        fade_level = {};
    };

    return pub;
}();