'use strict';

/**
 * The central resource manager for your game.
 * Resources can be accessed from anywhere.
 * Add images, audio, etc and extend with your own methods (like loading levels).
 */
var Resource = null;
var mag = function (_) {

    var _Resource = function () {

        // USAGE EXAMPLE: Resource.audio('pop');

        var __RESOURCE_PATH = 'resources/';
        var __AUDIO_PATH = __RESOURCE_PATH + 'audio/';
        var __GRAPHICS_PATH = __RESOURCE_PATH + 'graphics/';

        var audioRsc = {};
        var audioEngineLoaded = false;
        var audioEngine = 'html5';

        var imageRsc = {};
        var animPresets = {};

        var loadAudio = function loadAudio(alias, filename) {
            if (!audioEngineLoaded) {
                if (lowLag) {
                    try {
                        lowLag.init({ 'sm2url': 'lib/sm2/swf/', 'debug': 'none' });
                        audioEngine = 'lowLag';
                    } catch (err) {
                        console.error(err);
                        audioEngine = 'html5';
                    }
                }
                audioEngineLoaded = true;
            }

            var audio = new Audio(__AUDIO_PATH + filename);
            audioRsc[alias] = audio;

            // Cross-browser low-latency audio.
            lowLag.load([__AUDIO_PATH + filename], alias);
        };
        var loadImage = function loadImage(alias, filename) {
            var img = new Image();
            img.src = __GRAPHICS_PATH + filename;
            img.alt = alias;
            imageRsc[alias] = img;
        };
        var loadImageSequence = function loadImageSequence(alias, filename, range) {
            var a = filename.split('.');
            var name = a[0];
            var ext = a[1];
            for (var i = range[0]; i <= range[1]; i++) {
                loadImage(alias + i, name + i + '.' + ext);
            }
        };
        var loadAnimation = function loadAnimation(imageSeqAlias, range, duration) {
            try {
                animPresets[imageSeqAlias] = _.Animation.forImageSequence(imageSeqAlias, range, duration);
            } catch (e) {
                console.log(e);
                //
            }
        };

        var muted = false;
        if (getCookie("muted") === "true") {
            muted = true;
        }

        return { // TODO: Add more resource types.
            loadImage: loadImage,
            loadImageSequence: loadImageSequence,
            loadAnimation: loadAnimation,
            loadAudio: loadAudio,
            audio: audioRsc,
            image: imageRsc,
            path: __RESOURCE_PATH,
            getImage: function getImage(name) {
                return imageRsc[name];
            },
            getAudio: function getAudio(name) {
                return audioRsc[name];
            },
            getAnimation: function getAnimation(name) {
                return animPresets[name].clone();
            },
            play: function play(alias, volume) {
                if (muted) return;
                if (audioEngine === 'html5') {
                    if (volume) audioRsc[alias].volume = volume;else audioRsc[alias].volume = 1.0;
                    audioRsc[alias].play();
                } else {
                    lowLag.play(alias);
                }
            },
            mute: function mute() {
                muted = true;
                setCookie("muted", "true", 1000);
            },
            unmute: function unmute() {
                muted = false;
                setCookie("muted", "false", 1000);
            },
            isMuted: function isMuted() {
                return muted;
            }
        };
    }();

    // Exports
    _.Resource = _Resource;
    Resource = _Resource;
    return _;
}(mag || {});