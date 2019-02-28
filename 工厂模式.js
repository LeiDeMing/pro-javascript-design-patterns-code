var Interface = function (name, methods) {
    if (arguments.length != 2) {
        throw new Error("Interface constructor called width" + arguments.length + "arguments, but expected exactly 2")
    }

    this.name = name;
    this.methods = [];
    for (var i = 0, len = methods.length; i < len; i++) {
        if (typeof methods[i] !== "string") {
            throw new Error("Interface constructor expects method names to be passed in as a strin")
        }
        this.methods.push(methods[i])
    }
}

Interface.ensureImplements = function (object) {
    if (arguments.length < 2) {
        throw new Error("Function Interface.ensureImplements called with" + arguments.length + "arguments, but expected as least 2");
    }

    for (var i = 1, len = arguments.length; i < len; i++) {
        var interface = arguments[i]
        if (interface.constructor !== Interface) {
            throw new Error("Function Interface.ensureImplements expects arguments two and above to be instances of Interface");
        }

        for (var j = 0, methodsLen = interface.methods.length; j < methodsLen; j++) {
            var method = interface.methods[j];
            if (!object[method] || typeof object[method] !== 'function') {
                throw new Error("Function Interface.ensureImplements: object does not implement the " + interface.name + "interface.Method" + method + "was not found.")
            }
        }
    }
}

function extend(subClass, superClass) {
    var F = function () {};
    F.prototype = superClass.prototype;
    subClass.prototype = new F();
    subClass.prototype.constructor = subClass;
}

var Bicyle = new Interface('Bicyle', ['assemble', 'wash', 'ride', 'repair']);

//xhr工厂
var AjaxHandler = new Interface('AjaxHandler', ['request', 'createXhrObject'])

var SimpleHandler = function () {};
SimpleHandler.prototype = {
    request: function (method, url, callback, postVars) {
        var xhr = this.createXhrObject();
        xhr.onreadystatechange = function () {
            if (xhr.readyState !== 4) return;
            (xhr.status === 200) ? callback.success(xhr.responseText, xhr.reponseXML): callback.failure(xhr.status);
        }
        xhr.open(method, url, postVars);
        if (method !== "POST") postVars = null;
        xhr.send(postVars);
    },
    createXhrObject: function () {
        var methods = [
            function () {
                return new XMLHttpRequest();
            },
            function () {
                return new ActiveXObject('Msxml2.XMLHTTP');
            },
            function () {
                return new ActiveXObject('Microsoft.XMLHTTP')
            }
        ];

        for (var i = 0, len = methods.length; i < len; i++) {
            try {
                methods[i]();
            } catch (e) {
                continue
            }
            this.createXhrObject = methods[i];
            return methods[i];
        }

        throw new Error('Simplehandler: Could not create an XHR object.')
    }
}

// var myHandler=new SimpleHandler();
// var callback={
//     success:function(responseText){console.log(responseText)},
//     failure:function(statusCode){console.log(statusCode)}
// };
// myHandler.request('GET','script.php',callback)


//在发起新请求之前先确保之前的请求已经处理
var QueueHandler = function () {
    this.queue = [];
    this.requestInProgress = false;
    this.retryDelay = 5;
}

extend(QueueHandler, SimpleHandler);
QueueHandler.prototype.request = function (method, url, callback, postVars, override) {
    if (this.requestInProgress && !override) {
        this.queue.push({
            method: method,
            url: url,
            callback: callback,
            postVars: postVars
        });
    } else {
        this.requestInProgress = true;
        var xhr = this.createXhrObject();
        var that = this;
        xhr.onreadystatechange = function () {
            if (xhr.readyState !== 4) return;
            if (xhr.status === 200) {
                callback.success(xhr.responseText, xht.responseXML);
                that.advanceQueue();
            } else {
                callback.failure(xhr.status);
                setTimeout(function () {
                    that.request(method, url, callback, postVars, true)
                }, that.retryDelay * 1000)
            }
        }
        xhr.open(method, url, true);
        if (method !== "POST") postVars = null;
        xhr.send(postVars);
    }
}

QueueHandler.prototype.advanceQueue=function(){
    if(this.queue.length ===0){
        this.requestInProgress=false;
        return ;
    }
    var req=this.queue.shift();
    this.request(req.method,req.url,req.callback,req.postVars,true)
}