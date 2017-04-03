var UnitTest = (function() {
    var pub = {};

    // Entry point for unit testing.
    pub.run = function() {

    };

    function assert(desc, bool) {
        if (bool === true) console.log(desc + ' %cPASSED', 'background: #EEE; color: #33ee33');
        else if (bool === false) console.log(desc + ' %cFAILED', 'background: #EEE; color: #ee3333');
        else console.error('@ assert: Condition test result is not boolean value.');
    }

    function getAllReductSchemeLevelStrings() {
        // Get all level descriptions, separate into individual expressions for each category,
        // and then flatten into a single array.
        let schemeChapters = Resource.chaptersWithLanguage('reduct-scheme');
        let levels = flatten(schemeChapters.map((chap) => Resource.levelsForChapter(chap)));
        let all_exprs = flatten(levels.map((lvl) => flatten([splitExprs(lvl.board), splitExprs(lvl.goal), splitExprs(lvl.toolbox)]));
        return all_exprs;
    }
    function getAllJavaScriptLevelStrings() {
        // Get all level descriptions, separate into individual expressions for each category,
        // and then flatten into a single array.
        let arrayify = (arr) => (Array.isArray(arr) ? arr : [arr]);
        let schemeChapters = Resource.chaptersWithLanguage('JavaScript');
        let levels = flatten(schemeChapters.map((chap) => Resource.levelsForChapter(chap)));
        let all_exprs = flatten(levels.map((lvl) => flatten([arrayify(lvl.board), arrayify(lvl.goal), arrayify(lvl.toolbox)]));
        return all_exprs;
    }

    // Tests whether parsed expressions convert neatly back to strings
    function testStringBijection() {
        let descs = {
            'reduct-scheme': getAllReductSchemeLevelStrings(), // easiest way to check robustness of conversion is just to use the existing level descriptions...
            'JavaScript':getAllJavaScriptLevelStrings()
        };
        let toStringMethodMap = {
            'reduct-scheme': 'toString',
            'JavaScript': 'toES6String'
        };
        for (var language in exprs) {
            let toStringMethodName = toStringMethodMap[language];
            descs[language].forEach((desc) => {
                let expr = Level.parse(desc, language);
                assert(toStringMethodName + ' conversion for ' + desc '?',
                       expr[toStringMethodName]() === desc);
            });
        }
    }

    // Test anonymous functions:
    function lambdas() {

        // TODO: Test identity and star.
        // Tested expression, Sequence of input expressions, Event on test expr applying input expr, expected output
        // '(lambda.x #x)', ['star', 'rect', 'triangle'], 'ondropped', ['star', 'rect', 'triangle']

    }

    return pub;
})();
