const asyncRequest = (() => {
    function handleReadyState(o, callback) {
        const poll = window.setInterval(() => {
            if (o && o.readyState === 4) {
                window.clearInterval(poll);
                if (callback) {
                    callback(o)
                }
            }
        }, 50)
    }

    const getXHR = () => {
        let http;
        try {
            http = new XMLHttpRequest;
            getXHR = function () {
                return new XMLHttpRequest;
            }
        } catch (e) {
            var msxml = ['MSXML2.XMLHTTP.3.0', 'MSXML2.XMLHTTP', 'Microsft.XMLHTTP'];
            for (let x = 0, len = msxml.length; x < len; x++) {
                try {
                    http = new ActiveXObject(msxml[x]);
                    getXHR = () => {
                        return new ActiveXObject(msxml[x]);
                    }
                    break;
                } catch (e) { }
            }
        }
        return http;
    };

    return function (method, uri, callback, postData) {
        let http = getXHR();
        http.open(method, uri, true);
        handleReadyState(http, callback);
        http.send(postData || null);
        return http;
    }
})();

Function.prototype.method = function (name, fn) {
    this.prototype[name] = fn;
    return this;
}

if (!Array.prototype.forEach) {
    Array.method('forEach', function (fn, thisObj) {
        const scope = thisObj || window;
        for (let x = 0, len = this.length; x < len; x++) {
            fn.call(scope, this[i], i, this)
        }
    });
}

if (!Array.prototype.filter) {
    Array.method('filter', function (fn, thisObj) {
        const scope = thisObj || window;
        const a = [];
        for (let x = 0, len = this.length; x < len; x++) {
            if (!fn.call(scope, this[i], i, this)) {
                continue;
            }
            a.push(this[i]);
        }
        return a;
    });
}

//基本观察者系统
window.DED = window.DED || {};
DED.util = DED.util || {};
DED.util.Observer = function () {
    this.fns = {};
}

DED.util.Observer.prototype = {
    subsribe: function (fn) {
        this.fns.push(fn)
    },
    unsubcribe: function (fn) {
        this.fns = this.fns.filter(function (el) {
            if (el !== fn) {
                return el;
            }
        })
    },
    fire: function (o) {
        this.fns.forEach(function (el) {
            el(o);
        })
    }
};