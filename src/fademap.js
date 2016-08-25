var ExprManager = (function() {
    let pub = {};

    var _FADE_MAP = {
        'if':       [LockIfStatement, IfStatement],
        'ifelse':   [IfElseStatement],
        'triangle': [TriangleExpr],
        'rect':     [RectExpr],
        'star':     [StarExpr],
        'circle':   [CircleExpr],
        'diamond':  [RectExpr],
        '_':        [MissingExpression],
        '__':       [MissingBagExpression],
        '_b':       [MissingBooleanExpression],
        'true':     [KeyTrueExpr, TrueExpr],
        'false':    [KeyFalseExpr, FalseExpr],
        'cmp':      [MirrorCompareExpr],
        '==':       [MirrorCompareExpr],
        '!=':       [MirrorCompareExpr],
        'bag':      [BagExpr],
        'count':    [CountExpr],
        'map':      [FunnelMapFunc, SimpleMapFunc, MapFunc, FadedMapFunc],
        'reduce':   [ReduceFunc],
        'put':      [PutExpr],
        'pop':      [PopExpr],
        'define':   [DefineExpr],
        'var':      [LambdaVarExpr, FadedLambdaVarExpr],
        'hole':     [LambdaHoleExpr, FadedLambdaHoleExpr]
    };
    var fade_level = {};
    var DEFAULT_FADE_LEVEL = 0;

    pub.getClass = (ename) => {
        if (ename in _FADE_MAP) {
            if (ename in fade_level) return _FADE_MAP[ename][fade_level[ename]];
            else                     return _FADE_MAP[ename][DEFAULT_FADE_LEVEL];
        }
    };
    pub.getNumOfFadeLevels = (ename) => {
        if (!ename) return;
        else if (!(ename in _FADE_MAP)) {
            console.error('Expression type ' + ename + ' is not in the fade map.');
            return;
        }
        return _FADE_MAP[ename].length;
    };
    pub.setFadeLevel = (ename, index) => {
        if (!ename) return;
        else if (!(ename in _FADE_MAP)) {
            console.error('Expression type ' + ename + ' is not in the fade map.');
            return;
        } else if (pub.getNumOfFadeLevels(ename) >= index) {
            console.warn('Expression type ' + ename + ' has only ' + pub.getNumOfFadeLevels(ename) + ' fade levels. (' + index + 'exceeds)');
            index = pub.getNumOfFadeLevels(ename) - 1; // Set to max fade.
        }
        fade_level[ename] = index;
    };

    return pub;
})();
