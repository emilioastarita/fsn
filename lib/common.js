function log() {
    return console.log.apply(console, arguments);
}

function debounce(func, wait, immediate) {
    let timeout;
    return function () {
        let context = this, args = arguments;
        let later = function () {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        let callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}
module.exports = {
    log: log,
    debounce: debounce,
    toucher: {
        DEFAULT_PORT: 9595,
        DEFAULT_IP: '0.0.0.0',
    },
    watcher: {
        DEBOUNCE_TIME: 1000,
        DEFAULT_IGNORE_PATTERNS: [
	    /node_modules/,
	    /.git/,
	    /tmp/,
	    /__jb_tmp__/,
	    /build/
        ]
    }
};
