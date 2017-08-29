/**
 * Syntax coloring constants.
 */

class _SyntaxColorManager {
    constructor(syntaxColorProfile) {
        if (!syntaxColorProfile)
            this.profile = {
                operator: 'black',
                bool: 'DeepPink',
                string: 'Red',
                call: 'YellowGreen'
            };
        else
            this.profile = syntaxColorProfile;
        this.default_color = 'black';
    }
    for(name) {
        if (name in this.profile) return this.profile[name];
        else                      return this.default_color;
    }
}
var SyntaxColor = new _SyntaxColorManager();
