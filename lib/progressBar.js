function setProgressBar(barId, containerId, percentage) {
    var bar = document.getElementById(barId);
    var container = document.getElementById(containerId);
    var iv = setInterval(frame, 10);
    var startTime = Date.now();
    var duration = 400;
    var initialWidth = $(bar).width();
    var deltaWidth = $(container).width() * percentage - initialWidth;

    function frame() {
        var elapsed = Date.now() - startTime;
        if (elapsed >= duration) {
            bar.style.width = (initialWidth + deltaWidth) + 'px';
            clearInterval(iv);
        } else {
            bar.style.width = (initialWidth + deltaWidth * Math.pow(elapsed / duration, 0.5)) + 'px';
        }
    }
}
function setProgressBarColor(barId, color) {
    var bar = document.getElementById(barId);
    bar.style['background-color'] = color;
}
