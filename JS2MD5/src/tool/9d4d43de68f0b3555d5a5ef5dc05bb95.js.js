/**
 *Http请求
 */

//服务器接口地址
var PAY_SERVER_ADDR = "http://pay.kkvs.com/pay/mobilepay/Redirect.aspx";
var METHOD_GET = "GET";
var METHOD_POST = "POST";
function Http() {
    var _succCallback = function () {
    };
    var _errCallback = function () {
    };
}

Http.prototype.getData = function (url, data, method, callBack, errorCallBack) {
    if (typeof (callBack) == "function") {
        this._succCallback = callBack;
    } else {
        this._succCallback = function () {
        }
    }
    if (typeof (errorCallBack) == "function") {
        this._errorCallBack = errorCallBack;
    } else {
        this._errorCallBack = function () {
        }
    }
    var xmlHttp = cc.loader.getXMLHttpRequest();
    var self = this;
    //回调
    xmlHttp.onreadystatechange = function () {
        //if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status <= 207)) {
        //cc.log(url + " " + JSON.stringify(params) + xmlHttp.responseText);
        cc.log("xmlHttp.onreadystatechange CB");
        cc.log("xmlHttp.readyState", xmlHttp.readyState);
        cc.log("xmlHttp.status", xmlHttp.status);
        cc.log("xmlHttp.statusText", xmlHttp.statusText);
        if (xmlHttp.readyState == 4) {
            if (xmlHttp.status == 200) {
                cc.log("data :", xmlHttp.responseText);
                var strData = "";
                if (xmlHttp.responseText.length > 0) {
                    strData = xmlHttp.responseText;
                    self._succCallback(strData);
                } else {
                    cc.log("什么都没有，请检查网络");
                    return;
                }
            }
            else {
                cc.log("Http网络错误处理");
                self._succCallback(null);
            }
        }
    }
    if (cc.sys.isNative) {
        xmlHttp.onerror = function () {
            cc.log("xmlHttp.onerror CB");
            cc.log("xmlHttp.readyState", xmlHttp.readyState);
            cc.log("xmlHttp.status", xmlHttp.status);
            cc.log("xmlHttp.statusText", xmlHttp.statusText);
            self._succCallback(null);
        }
    }
    var params = "";
    if (typeof(data) == "object") {
        var i = 0;
        for (key in data) {
            i++;
            if (i != 1) {
                params += ("&" + key + "=" + data[key]);
            } else {
                params += (key + "=" + data[key]);
            }
        }
    } else {
        params = data;
    }
    if (method == METHOD_GET) {
        url += "?" + params;
        cc.log(url);
        xmlHttp.open("GET", url, true);
        xmlHttp.send();
    } else {
        //url += "?" + params ;
        // cc.log(url + "(" + "参数 = " + params + ")");
        xmlHttp.open("POST", url);
        xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xmlHttp.send(params);
    }
};


var HttpManager = {
    /**
     * 通用获取数据方法getselfssage
     * @param successCallBack 成功后回调函数
     * @param errorCallBack  失败后回调函数(默认不填)
     */
    GetMessage: function (url, params, method, successCallBack, errorCallBack) {
        var http = new Http();
        http.getData(url, params, method, successCallBack, null);
    },

    GetParams: function (data) {
        var params = "";
        if (typeof(data) == "object") {
            var i = 0;
            for (key in data) {
                i++;
                if (i != 1) {
                    params += ("&" + key + "=" + data[key]);
                } else {
                    params += (key + "=" + data[key]);
                }
            }

        } else {
            params = data;
        }
        return params;
    },

    //获取组装的URL
    GetURL: function (url, params, method) {
        var params = HttpManager.GetParams(params);
        if (method == METHOD_GET) {
            url += "?" + params;
            cc.log(url);
        } else {
            cc.log(url);
        }
        return url;
    }

};