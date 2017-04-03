var UnitTest = (function() {
    var pub = {};

    // Entry point for unit testing.
    pub.run = function() {

    };

    function assert(desc, bool) {
        if (bool === true) console.log('%cPASSED ' + desc, 'background: #EEE; color: #33cc33');
        else if (bool === false) console.log('%cFAILED ' + desc, 'background: #EEE; color: #ee3333');
        else console.error('@ assert: Condition test result is not boolean value.');
    }

    function getAllReductSchemeLevelStrings() {
        // Get all level descriptions, separate into individual expressions for each category,
        // and then flatten into a single array.
        let splitExprs = (s) => ((s) ? Level.splitParen(s) : []);
        let schemeChapters = Resource.chaptersWithLanguage('reduct-scheme');
        let levels = flatten(
                            schemeChapters.map(
                                (chap) => Resource.levelsForChapter(chap.name)[0]
                            )
                     );
        let all_exprs = flatten(
                                levels.map(
                                    (lvl) => flatten( [splitExprs(lvl.board), splitExprs(lvl.goal), splitExprs(lvl.toolbox)] )
                                )
                        );
        return new Set(all_exprs);
    }
    function getAllJavaScriptLevelStrings() {
        // Get all level descriptions, separate into individual expressions for each category,
        // and then flatten into a single array.
        let arrayify = (arr) => (Array.isArray(arr) ? arr : [arr]);
        let schemeChapters = Resource.chaptersWithLanguage('JavaScript');
        let levels = flatten(schemeChapters.map((chap) => Resource.levelsForChapter(chap.name)));
        let all_exprs = flatten(
                                levels.map(
                                    (lvl) => flatten( [arrayify(lvl.board), arrayify(lvl.goal), arrayify(lvl.toolbox)] )
                                )
                        );
        return new Set(all_exprs);
    }

    // Tests whether parsed expressions convert neatly back to strings
    pub.testStringBijection = function() {
        let descs = {
            'reduct-scheme': getAllReductSchemeLevelStrings(), // easiest way to check robustness of conversion is just to use the existing level descriptions...
            'JavaScript':getAllJavaScriptLevelStrings()
        };
        let toStringMethodMap = {
            'reduct-scheme': 'toString',
            'JavaScript': 'toES6String'
        };
        let compare = (e1, e2) => {
            if (e1 === e2) return true;
            e1 = stripParen(e1).replace('diamond', 'rect');
            e2 = stripParen(e2).replace('diamond', 'rect');
            return e1 === e2;
        };
        for (var language in descs) {
            let toStringMethodName = toStringMethodMap[language];
            descs[language].forEach((desc) => {
                let expr = Level.parse('('+desc+')', language);
                let passed = compare(expr[toStringMethodName](), desc);
                assert(toStringMethodName + ' conversion for ' + desc, passed);
                if (!passed) console.log('   > ' + expr[toStringMethodName]());
            });
        }
    };

    // Test anonymous functions:
    function lambdas() {

        // TODO: Test identity and star.
        // Tested expression, Sequence of input expressions, Event on test expr applying input expr, expected output
        // '(lambda.x #x)', ['star', 'rect', 'triangle'], 'ondropped', ['star', 'rect', 'triangle']

    }

    return pub;
})();
