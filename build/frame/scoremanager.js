"use strict";

var ScoreManager = function () {
    var pub = {};
    var score = 0;

    pub.loadFromCache = function () {
        if (window.localStorage["spendUnits"]) score = window.localStorage["spendUnits"];else score = 0;
    };
    pub.saveToCache = function () {
        window.localStorage["spendUnits"] = score;
    };

    pub.set = function (s) {
        if (s < 0) {
            console.warn('Score can\'t be negative. Aborting.');
            return;
        }
        score = s;
    };
    pub.add = function (s) {
        if (s > 0) score += s;
    };
    pub.get = function () {
        return score;
    };

    return pub;
}();