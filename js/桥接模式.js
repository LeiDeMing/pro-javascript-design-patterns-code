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