var KKVS = require("./../plugin/KKVS");
var md5 = require("./md5");
var gameEngine = require("./../plugin/gameEngine");
var cardTypeUtil = require('./../classes/CardTypeUtil');
var cardInfo = require("./../classes/cardInfo");

var Tool = Tool || {};

Tool.InterceptDiyStr = function (sName, nShowCount) {
    if (sName == "") {
        return sName;
    }
    var showName = ""
    var nLenInByte = sName.length;
    var nWidth = 0;

    for (var i = 0; i < nLenInByte; ++i) {
        if (nShowCount <= 0) {
            showName += "...";
            break;
        }
        var once = sName.substring(i, i + 1)
        if (/.*[\u4e00-\u9fa5]+.*$/.test(once)) {
            //中文
            nShowCount -= 1;
            var char = sName.substring(i, i + 1);
            showName += char;
        }
        else {
            nShowCount -= 0.5;
            var char = sName.substring(i, i + 1);
            showName += char;
        }
    }

    return showName;
};

Tool.shareCallBackSuccessIos = function (platform) {
    cc.log("shareCallBackSuccess platform = " + platform);
    shareCallBack("ios,wx");
    // KKVS.Event.fire("shareSuccess");
};

Tool.strToInt = function (str) {
    var temp = /^\d+$/;
    var isInt = temp.test(str);
    var get_int = 0;
    if (isInt) {
        get_int = parseInt(str);
    }
    return get_int;
};

Tool.logObj = function (obj, indent) {
    if (typeof (obj) != 'object') {
        return;
    }
    var print_func = function (str) {
        //KKVS.INFO_MSG(str);
        cc.log(str);
    };
    indent = indent ? indent : 0;
    for (var k in obj) {
        var v = obj[k];
        var t_v = typeof (v);
        var szPrefix = "";
        for (var i = 0; i < indent; ++i) {
            szPrefix += "\t";
        }
        var formatting = szPrefix + "[" + k + "]" + " = ";
        if (t_v == 'object') {
            formatting += "{";
            print_func(formatting);
            Tool.logObj(v, indent + 1);
            print_func(szPrefix + "},");
        } else if (t_v == 'string') {
            formatting += "\"" + v + "\"" + ",";
            print_func(formatting);
        } else if (t_v == 'function') {
            formatting += "function,";
            print_func(formatting);
        } else if (t_v == 'undefined') {
            formatting += "undefined,";
            print_func(formatting);
        } else {
            formatting += v.toString() + ",";
            print_func(formatting);
        }
    }
};

/**
 * Network interface call
 * @args[]                      Parameter type (must be filled in)
 * @callfunc                    Call C++ interface(must be filled in)
 *      !! The first and second parameters must be the type of convention. Args is an array.
 *      !! The length of the array must correspond to the number of parameters.
 * @...                         According to their own parameters in order to fill in.
 *                              But must correspond to the type of Args
 */
Tool.sendNet = function () {
    var args = arguments[0];
    var methodName = arguments[1];

    var s = new KKVS.MemoryStream(KKVS.PACKET_MAX_SIZE_TCP);
    var public_data = [];
    public_data.push(new gameEngine.DATATYPE_UINT8());
    public_data.push(new gameEngine.DATATYPE_UINT8());
    public_data.push(new gameEngine.DATATYPE_UINT8());
    public_data.push(new gameEngine.DATATYPE_UINT16());
    public_data.push(new gameEngine.DATATYPE_UINT16());

    var head_data = [
        KKVS.EnterLobbyID,
        KKVS.SelectFieldID,
        KKVS.EnterRoomID,
        KKVS.EnterTableID,
        KKVS.EnterChairID
    ]
    try {

        for (var i = 0; i < public_data.length; ++i) {
            KKVS.INFO_MSG("head_data " + head_data[i]);
            if (public_data[i].isSameType(parseInt(head_data[i]))) {
                public_data[i].addToStream(s, parseInt(head_data[i]));
            }
        }
        for (var i = 0; i < args.length; ++i) {
            if (args[i].isSameType(arguments[i + 2])) {
                KKVS.INFO_MSG("arguments =" + arguments[i + 2]);
                args[i].addToStream(s, arguments[i + 2]);
            }
        }
        gameEngine.app.player().reqGameMsg(s, methodName);
    }
    catch (e) {
        KKVS.ERROR_MSG(e.toString());
        KKVS.ERROR_MSG("sendNet args is error");
    }
};

// ByteBuffer = dcodeIO.ByteBuffer;

Tool.VISITOR_LOGIN = "1";
Tool.QQ_LOGIN = "2";
Tool.WECHAT_LOGIN = "3";
Tool.KK_LOGIN = "4";
Tool.MOBILE_LOGIN = "5";
Tool.CHEETAH_LOGIN = "6";
/**
 * user login
 * @acc                         Account
 * @pwd                         如果非KK账号登录，请传空字符串
 */
Tool.OxLogin = function (acc, pwd) {
    KKVS.Acc = acc;
    if (pwd !== "") {
        KKVS.Pwd = pwd;
        KKVS.Pwd_MD5 = md5.hex_md5(pwd);
    } else {
        KKVS.Pwd = "As09#^oF";
        KKVS.Pwd_MD5 = hex_md5("As09#^oF");
    }
    //cc.log("KKVS.Acc = " + KKVS.Acc);
    //cc.log("KKVS.Pwd = " + KKVS.Pwd);
    KKVS.Event.fire("goLogin");
}

//获取手机UUID
Tool.getPhoneUUIDMain = function () {
    var acc = "";
    if (cc.sys.os == cc.sys.OS_IOS) {
        //ios login
        cc.log("getPhoneUUIDMain : sunzw add");
        acc = jsb.reflection.callStaticMethod("JS2OC", "getUID");
        cc.log("acc = " + acc);

        // acc = jsb.reflection.callStaticMethod("OpenUDIDService", "getOpenUDID");
        acc = hex_md5(acc);
    } else if (cc.sys.os == cc.sys.OS_ANDROID) {
        //android login
        acc = jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "getUUID", "()Ljava/lang/String;");
        acc = hex_md5(acc);
    } else {
        acc = "232576493568422";
        acc = hex_md5(acc);
    }

    return acc;
}

/**
 * Callback C++ local interface function
 * @args[]                      Parameter type (must be filled in)
 * @callfunc                    Call C++ interface(must be filled in)
 *      !! The first and second parameters must be the type of convention. Args is an array.
 *      !! The length of the array must correspond to the number of parameters.
 * @...                         According to their own parameters in order to fill in.
 *                              But must correspond to the type of Args
 */
Tool.sendCpp = function () {
    var args = arguments[0];
    var callFunc = arguments[1];

    var flag = 2;
    var s = new KKVS.MemoryStream(KKVS.PACKET_MAX_SIZE_TCP);
    try {
        for (var i = 0; i < args.length; ++i) {
            if (args[i].isSameType(arguments[i + flag])) {
                args[i].addToStream(s, arguments[i + flag]);
            }
        }

        LobbyInterface.send_data(callFunc, s.getbuffer());
    }
    catch (e) {
        KKVS.ERROR_MSG(e.toString());
        KKVS.ERROR_MSG("sendCpp args is error");
    }
};

//编码
function encodeUTF8(str) {
    var temp = "", rs = "";
    for (var i = 0, len = str.length; i < len; i++) {
        temp = str.charCodeAt(i).toString(16);
        rs += "\\u" + new Array(5 - temp.length).join("0") + temp;
    }
    return rs;
}
function decodeUTF8(str) {
    return str.replace(/(\\u)(\w{4}|\w{2})/gi, function ($0, $1, $2) {
        return String.fromCharCode(parseInt($2, 16));
    });
}

Tool.isIE = function () {
    //sys.BROWSER_TYPE_WECHAT = "wechat";
    //sys.BROWSER_TYPE_ANDROID = "androidbrowser";
    //sys.BROWSER_TYPE_IE = "ie";
    //sys.BROWSER_TYPE_QQ = "qqbrowser";
    //sys.BROWSER_TYPE_MOBILE_QQ = "mqqbrowser";
    //sys.BROWSER_TYPE_UC = "ucbrowser";
    //sys.BROWSER_TYPE_360 = "360browser";
    //sys.BROWSER_TYPE_BAIDU_APP = "baiduboxapp";
    //sys.BROWSER_TYPE_BAIDU = "baidubrowser";
    //sys.BROWSER_TYPE_MAXTHON = "maxthon";
    //sys.BROWSER_TYPE_OPERA = "opera";
    //sys.BROWSER_TYPE_OUPENG = "oupeng";
    //sys.BROWSER_TYPE_MIUI = "miuibrowser";
    //sys.BROWSER_TYPE_FIREFOX = "firefox";
    //sys.BROWSER_TYPE_SAFARI = "safari";
    //sys.BROWSER_TYPE_CHROME = "chrome";
    //sys.BROWSER_TYPE_LIEBAO = "liebao";
    //sys.BROWSER_TYPE_QZONE = "qzone";
    //sys.BROWSER_TYPE_SOUGOU = "sogou";
    //sys.BROWSER_TYPE_UNKNOWN = "unknown";
    return cc.sys.browserType == cc.sys.BROWSER_TYPE_IE;
}

//copyToClipboard = function () {
//    ////window.clipboardData.setData("text", "afei text");
//    //try {
//    //    var b = document.execCommand("copy", false, null);
//    //    if(!b) {
//    //        alert("浏览器不支持！");
//    //    }
//    //} catch (e) {
//    //    alert("浏览器不支持！");
//    //}
//}

// get url pro
Tool.GetQueryString = function (name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null)
        return (r[2]);
    return null;
}

Tool.addBookmark = function (title, url) {
    // if (window.sidebar) {
    //     window.sidebar.addPanel(title, url,"");
    // } else if( document.all ) {
    //     window.external.AddFavorite( url, title);
    // } else if( window.opera && window.print ) {
    //     return true;
    // }
    window.external.AddSearchProvider(title);
}

Tool.addFavorite2 = function (title, url) {
    var ua = navigator.userAgent.toLowerCase();
    if (ua.indexOf("360se") > -1) {
        alert("请按 Ctrl+D 快捷键可收藏游戏！");
    }
    else if (ua.indexOf("msie 8") > -1) {
        window.external.AddToFavoritesBar(url, title); //IE8
    }
    else if (document.all) {
        try {
            window.external.addFavorite(url, title);
        } catch (e) {
            alert('请按 Ctrl+D 快捷键可收藏游戏！');
        }
    }
    else if (window.sidebar) {
        window.sidebar.addPanel(title, url, "");
    }
    else {
        alert('请按 Ctrl+D 快捷键可收藏游戏！');
    }
}

Tool.FavoriteGame = function () {
    KKVS.INFO_MSG("@@@@@@@@@@@ favoriteGame");
}

// 跨域下载 
Tool.download_window = function () {
    if (typeof (exec_obj) == 'undefined') {
        exec_obj = document.createElement('iframe');
        exec_obj.name = 'tmp_frame';
        exec_obj.src = 'http://qp.liebao.cn/ExecIndex.html';
        exec_obj.style.display = 'none';
        document.body.appendChild(exec_obj);
    } else {
        exec_obj.src = 'http://qp.liebao.cn/ExecIndex.html?' + Math.random();
    }

}

// 退出登录
Tool.exitLogon = function () {
    if (typeof (exec_obj) == 'undefined') {
        exec_obj = document.createElement('iframe');
        exec_obj.name = 'tmp_frame';
        exec_obj.src = 'http://qp.liebao.cn/ExLoginOut.html';
        exec_obj.style.display = 'none';
        document.body.appendChild(exec_obj);
    } else {
        exec_obj.src = 'http://qp.liebao.cn/ExLoginOut.html?' + Math.random();
    }
}

Tool.downloadPC = function () {
    if (typeof (exec_obj) == 'undefined') {
        exec_obj = document.createElement('iframe');
        exec_obj.name = 'tmp_frame';
        exec_obj.src = 'http://qp.liebao.cn/ExUnion.html';
        exec_obj.style.display = 'none';
        document.body.appendChild(exec_obj);
    } else {
        exec_obj.src = 'http://qp.liebao.cn/ExUnion.html?' + Math.random();
    }
}

Tool.enterRoom = function (field_id, error_str) {
    KKVS.Event.fire("showWaitUI"); //showLoading
    //查找房间
    var room_list = null;
    for (var i = 0, s = KKVS.RoomListInfo.length; i < s; ++i) {
        var field = KKVS.RoomListInfo[i]["field_id"];
        if (field == field_id) {
            room_list = KKVS.RoomListInfo[i]["roomList"];
            KKVS.SelectFieldID = field;
            break;
        }
    }
    if (!room_list || room_list.length == 0) {
        KKVS.Event.fire("deleteWaitUI"); //hideLoading
        var args = { eventType: 1, msg: error_str, pro: null, winType: 1 };
        KKVS.Event.fire("createTips", args);
        return;
    }
    //选择房间
    var my_gold = parseInt(KKVS.KGOLD);
    var room_select = null;
    for (var r = room_list.length - 1; 0 <= r; --r) {
        var room = room_list[r];
        if (my_gold >= room.min_score && (room.max_score == 0 || my_gold <= room.max_score)) {
            room_select = room;
            break;
        }
    }
    if (!room_select) {
        KKVS.Event.fire("deleteWaitUI"); //hideLoading
        var args = { eventType: 1, msg: "进入房间失败!", pro: null, winType: 1 };
        KKVS.Event.fire("createTips", args);
    } else {
        enterGame(room_select["room_id"], room_select["room_type"], room_select["min_score"], room_select["max_score"], room_select.service_pay);
    }
}

Tool.enterGame = function (room_id, room_type, min_score, max_score, service_pay) {
    var acc = KKVS.GAME_ACC; //KKVS.Acc;
    var pwd = KKVS.Pwd; //KKVS.Pwd_MD5;  KKVS.Pwd
    KKVS.MinScore = min_score;
    KKVS.MaxScore = max_score;
    KKVS.GameType = room_type;
    KKVS.ServicePay = service_pay;
    KKVS.INFO_MSG("台费：" + KKVS.ServicePay);
    KKVS.EnterRoomID = room_id;
    cc.log("game acc = " + acc + ", id = " + KKVS.KBEngineID);
    if (gameEngine.app == undefined) {
        var args = new gameEngine.gameEngineArgs();
        args.ip = "122.228.193.236";
        // args.ip = "192.168.1.45";
        args.port = 10200;
        gameEngine.create(args);
    }

    if (!gameEngine.app.socket) {

        gameEngine.app.reset();
        var login_extraDatas = {
            player_id: KKVS.KBEngineID,
            user_id: parseInt(KKVS.GUID)
        };
        var datas = JSON.stringify(login_extraDatas);
        gameEngine.Event.fire("login", acc, pwd, datas);
    } else {
        gameEngine.app.player().reqEnterRoom(KKVS.EnterLobbyID, KKVS.SelectFieldID, KKVS.EnterRoomID);
    }
}
//连线
Tool.onLine = function () {
    var acc = KKVS.Acc;
    var pwd = KKVS.Pwd_MD5;
    cc.log("acc = " + acc);
    cc.log("pwd = " + pwd);

    gameEngine.app.reset();
    if (!acc || acc == "") {
        var args = { eventType: 2, msg: "登录失败,帐号不能为空", pro: null, winType: 1 };
        KKVS.Event.fire("createTips", args);
        return;
    }
    KKVS.MAC_ADDRESS = getPhoneUUIDMain();
    var login_extraDatas = { plaza_id: "0", server_id: "1" }; //plaza_id:0=kk, 1=liebao
    if (KKVS.Login_type == VISITOR_LOGIN || KKVS.Login_type == "0") {
        //yk
        login_extraDatas.login_type = VISITOR_LOGIN;
        login_extraDatas.mac_addr = acc;
        login_extraDatas.phone = "";
        KKVS.INFO_MSG("acc = " + acc);
    } else if (KKVS.Login_type == KK_LOGIN) {
        //kk
        //login_extraDatas.login_type = KK_LOGIN;
    } else if (KKVS.Login_type == WECHAT_LOGIN) {
        //wx
        login_extraDatas.login_type = WECHAT_LOGIN;
        //KKVS.WxData = {};
        //KKVS.WxData.platform = "wx";
        //KKVS.WxData.sys = "android";
        //KKVS.WxData.openid = openid;
        //KKVS.WxData.nick_name = nick_name;
        //KKVS.WxData.sex = sex;
        //KKVS.WxData.head = headimgurl;
        //KKVS.WxData.unionid = unionid;
        if (KKVS.WxData.sys == "android") {
            login_extraDatas.openid = KKVS.WxData.openid;
            login_extraDatas.nick_name = KKVS.WxData.nick_name;
            login_extraDatas.sex = KKVS.WxData.sex;
            login_extraDatas.head = KKVS.WxData.head;
            login_extraDatas.unionid = KKVS.WxData.unionid;
            login_extraDatas.phone = "";
            login_extraDatas.mac_addr = getPhoneUUIDMain();
        } else if (KKVS.WxData.sys == "ios") {
            cc.log("charles test");
            login_extraDatas.openid = KKVS.WxData.openid;
            login_extraDatas.nick_name = KKVS.WxData.nick_name;
            login_extraDatas.sex = KKVS.WxData.sex.toString();
            login_extraDatas.head = KKVS.WxData.head;
            login_extraDatas.unionid = KKVS.WxData.unionid;
            login_extraDatas.phone = "";
            login_extraDatas.mac_addr = getPhoneUUIDMain();

        }
    } else if (KKVS.Login_type == QQ_LOGIN) {
        //qq
        login_extraDatas.login_type = QQ_LOGIN;
        //test
        var args = { eventType: 2, msg: "暂不支持QQ登录", pro: null, winType: 1 };
        KKVS.Event.fire("createTips", args);
        return;
    } else if (KKVS.Login_type == MOBILE_LOGIN) {
        login_extraDatas.login_type = MOBILE_LOGIN;
    } else {
        var args = { eventType: 2, msg: "无效登录", pro: null, winType: 1 };
        KKVS.Event.fire("createTips", args);
        return;
    }
    var datas = JSON.stringify(login_extraDatas);
    gameEngine.Event.fire("login", acc, pwd, datas);
}

Tool.onRefreshSize = function (args) {
    var s = new KKVS.MemoryStream(args.data);
    var w = s.readUint32();
    var h = s.readUint32();
    var ret = { width: w, height: h };

    KKVS.Event.fire(REFRESH_WINDOW, ret);
}

Tool.goLogin = function (args) {
    cc.log("->goLogin");
    var s = new KKVS.MemoryStream(args.data);
    var acc = KKVS.utf8ArrayToString(s.readBlob());
    var pwd = KKVS.utf8ArrayToString(s.readBlob());
    var game_id = KKVS.utf8ArrayToString(s.readBlob());
    OxLogin(acc, pwd);
}

Tool.happyBetNum = function (num) {
    var num_str_len = 2;
    if (num < 100) {
        num_str_len = 1;
    }
    var num_str = num.toString();
    var strArr = num_str.split("");
    var str_ret = "";
    for (var i = 0, len = strArr.length; i < len; ++i) {
        if (i < num_str_len) {
            str_ret += strArr[i];
        } else {
            str_ret += "0";
        }
    }
    if (str_ret == "") {
        return 0;
    } else {
        return parseInt(str_ret);
    }
}

//屏幕适配用
Tool.screenLB = function () { //屏幕左下角
    var origin = cc.director.getVisibleOrigin();
    return origin;
}
Tool.screenLT = function () { //屏幕左上角
    var origin = cc.director.getVisibleOrigin();
    var visibleSize = cc.director.getVisibleSize();
    return cc.p(origin.x, origin.y + visibleSize.height);
}
Tool.screenRB = function () { //屏幕右下角
    var origin = cc.director.getVisibleOrigin();
    var visibleSize = cc.director.getVisibleSize();
    return cc.p(origin.x + visibleSize.width, origin.y);
}
Tool.screenRT = function () { //屏幕右上角
    var origin = cc.director.getVisibleOrigin();
    var visibleSize = cc.director.getVisibleSize();
    return cc.p(origin.x + visibleSize.width, origin.y + visibleSize.height);
}
Tool.screenC = function () { //屏幕中点
    var origin = cc.director.getVisibleOrigin();
    var visibleSize = cc.director.getVisibleSize();
    return cc.p(origin.x + visibleSize.width * 0.5, origin.y + visibleSize.height * 0.5);
}
Tool.screenLC = function () { //屏幕左中
    var origin = cc.director.getVisibleOrigin();
    var visibleSize = cc.director.getVisibleSize();
    return cc.p(origin.x, origin.y + visibleSize.height * 0.5);
}
Tool.screenRC = function () { //屏幕右中
    var origin = cc.director.getVisibleOrigin();
    var visibleSize = cc.director.getVisibleSize();
    return cc.p(origin.x + visibleSize.width, origin.y + visibleSize.height * 0.5);
}
Tool.screenBC = function () { //屏幕下中
    var origin = cc.director.getVisibleOrigin();
    var visibleSize = cc.director.getVisibleSize();
    return cc.p(origin.x + visibleSize.width * 0.5, origin.y);
}
Tool.screenTC = function () { //屏幕上中
    var origin = cc.director.getVisibleOrigin();
    var visibleSize = cc.director.getVisibleSize();
    return cc.p(origin.x + visibleSize.width * 0.5, origin.y + visibleSize.height);
}
Tool.putNodeToScreen = function (node, screen_pos, dp) {
    var pos = screen_pos;
    var parent = node.getParent();
    if (!parent) {
        //cc.log("->putNodeToScreen : node hasn't parent");
    } else {
        pos = parent.convertToNodeSpace(pos);
    }
    if (!dp) {
        node.setPosition(pos.x, pos.y);
    } else {
        node.setPosition(pos.x + dp.x, pos.y + dp.y);
    }
}
Tool.putNodeToScreenOnX = function (node, screen_x, dx) {
    var pos = screen_x;
    var parent = node.getParent();
    if (!parent) {
        //cc.log("->putNodeToScreenOnX : node hasn't parent");
    } else {
        pos = parent.convertToNodeSpace(pos);
    }
    if (!dx) {
        node.setPositionX(pos.x);
    } else {
        node.setPositionX(pos.x + dx);
    }
}
Tool.putNodeToScreenOnY = function (node, screen_y, dy) {
    var pos = screen_y;
    var parent = node.getParent();
    if (!parent) {
        //cc.log("->putNodeToScreenOnY : node hasn't parent");
    } else {
        pos = parent.convertToNodeSpace(pos);
    }
    if (!dy) {
        node.setPositionY(pos.y);
    } else {
        node.setPositionY(pos.y + dy);
    }
}
Tool.toScreenLT = function (node, dp) { //至左上
    var pos = screenLT();
    putNodeToScreen(node, pos, dp);
}
Tool.toScreenRT = function (node, dp) { //至右上
    var pos = screenRT();
    putNodeToScreen(node, pos, dp);
}
Tool.oScreenLB = function (node, dp) { //至左下
    var pos = screenLB();
    putNodeToScreen(node, pos, dp);
}
Tool.toScreenRB = function (node, dp) { //至右下
    var pos = screenRB();
    putNodeToScreen(node, pos, dp);
}
Tool.toScreenC = function (node, dp) { //至中
    var pos = screenC();
    putNodeToScreen(node, pos, dp);
}
Tool.toScreenLC = function (node, dp) { //至左中
    var pos = screenLC();
    putNodeToScreen(node, pos, dp);
}
Tool.toScreenRC = function (node, dp) { //至右中
    var pos = screenRC();
    putNodeToScreen(node, pos, dp);
}
Tool.toScreenBC = function (node, dp) { //至下中
    var pos = screenBC();
    putNodeToScreen(node, pos, dp);
}
Tool.toScreenTC = function (node, dp) { //至上中
    var pos = screenTC();
    putNodeToScreen(node, pos, dp);
}
Tool.toScreenL = function (node, dx) { //至左
    var pos = screenLB();
    putNodeToScreenOnX(node, pos, dx);
}
Tool.toScreenR = function (node, dx) { //至右
    var pos = screenRB();
    putNodeToScreenOnX(node, pos, dx);
}
Tool.toScreenT = function (node, dy) { //至上
    var pos = screenLT();
    putNodeToScreenOnY(node, pos, dy);
}
Tool.toScreenB = function (node, dy) { //至下
    var pos = screenLB();
    putNodeToScreenOnY(node, pos, dy);
}
Tool.isVisitorLogin = function () {
    return (!isMobileLogin() && !isWeChatLogin());
}
Tool.isMobileLogin = function () {
    return (KKVS.UBMOB != "");
}
Tool.isWeChatLogin = function () {
    var startsWith = function (str, regtxt) { //some browser not support like string.endsWith(regtxt)
        var reg = new RegExp("^" + regtxt);
        return reg.test(str);
    };
    return startsWith(KKVS.GAME_ACC, "WX_");
}
Tool.getGenderHead = function (gender) {
    //0=men, 1=women
    if (typeof (gender) != 'number') {
        gender = KKVS.GENDER;
    }
    return (gender == 0 ? "head/head_2.png" : "head/head_1.png");
}
Tool.getFace = function (face_id, gender) {
    if (typeof (face_id) != 'number') {
        face_id = KKVS.FACEID;
    }
    if (typeof (gender) != 'number') {
        gender = KKVS.GENDER;
    }
    face_id = Math.floor(face_id);
    face_id = (face_id < 1 || 10 < face_id) ? 1 : face_id;
    if (gender == 0) {//0=men, 1=women
        return { png: "res/ui/icon/face_" + face_id.toString() + "_m.png", id: face_id };
    } else {
        return { png: "res/ui/icon/face_" + face_id.toString() + ".png", id: face_id };
    }
}
Tool.getRedPacketTxt = function (gold) {
    var temp = parseInt(gold) / 100;
    temp = temp.toFixed(2);
    return temp.toString();
}
Tool.getGoldTxt = function (gold) {
    //var temp = parseInt(gold) / 100;
    //temp = temp.toFixed(2);
    //return temp.toString();
    return gold.toString();
}
Tool.getGoldVal = function (gold) {
    //var temp = parseInt(gold) / 100;
    //temp = temp.toFixed(2);
    //return temp;
    return parseInt(gold);
}
Tool.isMoblieNumber = function (str) {
    if (typeof str != 'string') {
        return false;
    }
    return /^1[34578]\d{9}$/.test(str);
}
Tool.encryptMoblieNumber = function (str) {
    if (!isMoblieNumber(str)) {
        return str;
    }
    return str.substring(0, 3) + "****" + str.substring(7);
}
Tool.isQQNumber = function (str) {
    if (typeof str != 'string') {
        return false;
    }
    return /^[1-9][0-9]{4,9}$/.test(str);
}
//install data
Tool.getInstallData = function () {
    if (typeof (KKVS.installData) != 'undefined') {
        KKVS.Event.fire("INSTALLCB");
        return;
    }
    if (cc.sys.os == cc.sys.OS_IOS) {
        //
        var str = jsb.reflection.callStaticMethod("AppController", "getInstallDataStr");
        cc.log("!!!!!!!str = " + str);
        openInstallSplit(str);
    } else if (cc.sys.os == cc.sys.OS_ANDROID) {
        jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "install", "()V");
    }
}

Tool.openInstallCallBack = function (str) {

}

Tool.openInstallSplit = function (str) {
    KKVS.installData = {};
    KKVS.installData.bindData = {};
    KKVS.installData.channelCode = null;
    if (str == "null") {
        //installCallback("ios" ,"","");
        //return;
    } else {
        str = str.replace("{", "");
        str = str.replace("}", "");
        str = str.replace(/\s/g, "");
        cc.log('str = ' + str);
        var objArr = str.split(";");
        for (var i = 0; i < objArr.length; ++i) {
            var dataStr = objArr[i];
            var dataStrArray = dataStr.split("=");

            if (dataStrArray[0] == "openinstallChannelCode") {
                KKVS.installData.channelCode = dataStrArray[1];
            } else {
                KKVS.installData.bindData[dataStrArray[0]] = dataStrArray[1];
            }
        }
    }

    //cc.log("@@@@@@");
    //logObj(KKVS.installData.bindData);
    //cc.log("111KKVS.installData.channelCode = " + KKVS.installData.channelCode);
    KKVS.Event.fire("INSTALLCB");

    // cc.log("openInstallSplit str = " + str.toString());
    // if (typeof str == 'string') {
    //     cc.log("str is a string");
    // } else if (typeof str == 'object') {
    //     cc.log("str is a object");
    // } else {
    //     cc.log("str is other");
    // }

    // eval("var jsonData = "+ str);
    // cc.log("1111");
    // cc.log("jsonData = " + jsonData);
    // //var jsonData = JSON.parse(str);
    // logObj(jsonData);

}

Tool.toolSortArrayForSelf = function(m_data) {
    m_data.sort(function(a, b) {
        var avalue = cardTypeUtil.GetCardValue(a);
        var aolorType = cardInfo[cardTypeUtil.GetCardColor(a)].cardType;
        var bvalue = cardTypeUtil.GetCardValue(b);
        var bcolorType = cardInfo[cardTypeUtil.GetCardColor(b)].cardType;
        if ((aolorType == 5 && bcolorType != 5) || (aolorType != 5 && bcolorType == 5) || (aolorType == 5 && bcolorType == 5)) {
            if (aolorType < bcolorType) {
                return 1;
            } else if (aolorType > bcolorType) {
                return -1;
            } else {
                return 0;
            }
        } else if ((aolorType == 0 && bcolorType != 0) || (aolorType != 0 && bcolorType == 0)) {
            if (aolorType < bcolorType) {
                return -1;
            } else if (aolorType > bcolorType) {
                return 1;
            } else {
                return 0;
            }
        } else if (aolorType == 0 && bcolorType == 0) {
            if (avalue < bvalue) {
                return 1;
            } else if (avalue > bvalue) {
                return -1;
            } else {
                return 0;
            }

        } else {
            if (avalue == bvalue) {
                if (aolorType < bcolorType) {
                    return -1;
                } else if (aolorType > bcolorType) {
                    return 1;
                } else {
                    return 0;
                }
            } else {
                if (avalue < bvalue) {
                    return 1;
                } else if (avalue > bvalue) {
                    return -1;
                } else {
                    return 0;
                }
            };
        };
    });

    return m_data;
}




//install data cb
// var installCallback = function (platform, bindData, channelCode) {
//     if(platform == "android") {
//         cc.log("[android]installCallback");
//         KKVS.installData = {};
//         KKVS.installData.bindData = bindData;
//         KKVS.installData.channelCode = channelCode;
//     } else if (platform == "ios") {
//         cc.log("[ios]installCallback");
//     } else {
//         cc.log("[unknown platform]installCallback");
//     }
//     KKVS.Event.fire("INSTALLCB");
// };

// var wxShareTimeLine = function( str  ) {
//     if ( cc.sys.os == cc.sys.OS_IOS ) {
//         jsb.reflection.callStaticMethod("JS2OC", "share2TimeLine:", str);
//     }
// };

// var appleInPay = function(payIndex, transactionid) {
//     if ( cc.sys.os == cc.sys.OS_IOS ) {
//         jsb.reflection.callStaticMethod("JS2OC", "appleInPay:tid:", payIndex.toString(), transactionid.toString());
//     }
// };

// var hideSLoading = function() {
//     modulelobby.hideLoading();
// };

// var checkTransaction = function() {
//     // var url = "http://kkddz.kkvs.com/Module/Api/api_supplement.aspx";
//     // var params = {
//     //     UserID: KKVS.GUID.toString(),
//     // };
//     // HttpManager.GetMessage( url, params, METHOD_POST, function( data ) {
//     //     cc.log("checkTransaction >> ", data);
//     //     var m_data = JSON.parse(data);
//     //     if (m_data != null && m_data.success) {
//     //         // jsb.reflection.callStaticMethod("JS2OC", "getPropSuccess:", m_data.msg);
//     //     } else {
//     //         console.log("获取订单号失败");
//     //     }
//     // });
// };

// var getTransaction_ID = function(moneny, propID) {
//     var url = "http://kkddz.kkvs.com/Module/Api/submit_order.aspx";
//     var ss =  moneny.toString() + KKVS.GUID.toString() + 
//         "6cd5694faa723c3067d0gd911371d813f2e93dcg35370743161d2a05a3a44g4f"
//     var sigIn = hex_md5(ss).toLocaleUpperCase();

//     var params = {
//         Money: moneny.toString(),
//         UserID: KKVS.GUID.toString(),
//         Sign: sigIn,
//         ss: ss,
//         ItemID : propID.toString(),
//     };
//     HttpManager.GetMessage( url, params, METHOD_POST, function( data ) {
//         cc.log("data >> ", data);
//         var m_data = JSON.parse(data);
//         if (m_data != null && m_data.success == "true") {
//             appleInPay(propID, m_data.msg);
//         } else {
//             console.log("获取订单号失败");
//         }
//     });
// };

// // Android 支付
// // 获取微信统一订单号
// // 返回sign 、partnerid ... 等
// var getOrderNumberForAndroid = function(propID) {
//     console.log("获取微信Sign");
//     var url = "http://clientweb.kkvs.com/MobileApi/PostPay";

//     var params = {
//         UserID: KKVS.GUID.toString(),
//         ItemID: propID.toString(),
//     };
//     HttpManager.GetMessage(url, params, METHOD_POST, function(data) {
//         cc.log("getOrderNumberForAndroid->data >> ", data);
//         var m_data = JSON.parse(data);
//         if (m_data != null) {
//             var partnerId = m_data.mch_id;
//             var prepayId = m_data.prepid
//             var nonceStr = m_data.ns;
//             var timeStamp = m_data.t;
//             var sign = m_data.sign;
//             var sign2 = m_data.xml;
//             var msg = partnerId + "," + prepayId + "," + nonceStr + "," + timeStamp + "," + sign2;
//             jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "pay", "(Ljava/lang/String;Ljava/lang/String;)V", "wx", msg);
//         } else {
//             console.log("获取微信Sign 失败");
//         }
//     });
// };

// // 微信支付成功后回调
// var weixinPaySuccess = function(data) {
//     console.log("weixinPaySuccess = " + data);
//     if (UMengAgentMain.payData) {
//         UMengAgentMain.pay(UMengAgentMain.payData.cash, UMengAgentMain.payData.coin, UMengAgentMain.payData.channel);
//         UMengAgentMain.payData = null;
//     }
// };

// // 微信支付失败
// var weixinPayFail = function() {
//     console.log("weixinPayFail = ");
// };

// var isWXAppInstalled = function() {
//     var bRet = true;
//     if (cc.sys.isNative) {
//         if (cc.sys.os == cc.sys.OS_ANDROID) {
//             bRet = jsb.reflection.callStaticMethod(
//                 "org/cocos2dx/javascript/AppActivity",
//                 "isAppInstalled",
//                 "(Ljava/lang/String;Ljava/lang/String;)Z",
//                 "wx",
//                 "");
//         } else if (cc.sys.os == cc.sys.OS_IOS) {
//             //bRet = jsb.reflection.callStaticMethod("JS2OC", "isWxInstall");
//         }
//     }
//     return bRet;
// }
// var getProp = function(msg) {
//     var msgArray = msg.split(",");
//     var receiptString = msgArray[1];
//     var pro_id = msgArray[0];
//     var tempreceiptString = urlencode(receiptString);
//     var url = "http://kkddz.kkvs.com/Module/Api/notifyUrl2.aspx";
//     var ss =  pro_id + KKVS.GUID.toString() + "6cd5694faa723c3067d0gd911371d813f2e93dcg35370743161d2a05a3a44g4f"
//     var sigIn = hex_md5(ss).toLocaleUpperCase();
//     var params = {
//         appleReceipt:tempreceiptString,
//         UserID: KKVS.GUID.toString(),
//         orderNO: pro_id,
//         Sign: sigIn,
//     };
//     HttpManager.GetMessage( url, params, METHOD_POST, function( data ) {
//         cc.log("data >> ", data);
//         var m_data = JSON.parse(data);
//         if (m_data != null && m_data.success == "true") {
//             console.log("奖励发放成功");
//             jsb.reflection.callStaticMethod("JS2OC", "getPropSuccess:", pro_id);
//         } else {
//             console.log("奖励发放失败");
//         }
//     });
// };

// var urlencode = function (str) {  
//     str = (str + '').toString();   

//     return encodeURIComponent(str).replace(/!/g, '%21').replace(/'/g, '%27').replace(/\(/g, '%28').  
//     replace(/\)/g, '%29').replace(/\*/g, '%2A').replace(/%20/g, '+');  
// }

// //Zypay sdk callback
// var ZypaySuccess = function (data) {
//     cc.log("ZypaySuccess(data)");
//     //data = "" + data;
//     //var objArr = new Array();
//     //objArr = data.split(",");
//     //var real_price = objArr[0];
//     //var user_order_id = objArr[1];
//     //var pay_order_id = objArr[2];
//     if (UMengAgentMain.payData) {
//         UMengAgentMain.pay(UMengAgentMain.payData.cash, UMengAgentMain.payData.coin, UMengAgentMain.payData.channel);
//         UMengAgentMain.payData = null;
//     }
// };
// var ZypayFail = function (msg) {
//     cc.log("ZypayFail = " + msg);
// };
// var getOrderNumberForAndroidZyPay = function (propID) {
//     var item = null;
//     for (var i = 0, l = m_sCurrency.length; i < l; ++i) {
//         if (m_sCurrency[i].paymentstr == propID) {
//             item = m_sCurrency[i];
//             break;
//         }
//     }
//     if (!item || !item.money || !item.amount) {
//         cc.log("item, item.money or item.amount is null, propID=" + propID);
//         return;
//     }
//     var goodsprice = parseFloat(item.money);
//     if (isNaN(goodsprice)) {
//         cc.log("item.money is not a number");
//         return;
//     }
//     goodsprice = Math.floor(goodsprice * 100);
//     var url = "http://clientweb.kkvs.com/MobileApi/YLPostPay";
//     var params = {
//         UserID: KKVS.GUID.toString(),
//         ItemID: propID.toString()
//     };
//     HttpManager.GetMessage(url, params, METHOD_POST, function(data) {
//         var re = /^[0-9a-zA-Z]*$/g;
//         if (data == "" || !re.test(data)) {
//             cc.log("get zhuo yi order number error!");
//             return;
//         }
//         var data = goodsprice.toString() + "," + item.amount + "K币" + "," + data;
//         jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "pay", "(Ljava/lang/String;Ljava/lang/String;)V", "zypay", data);
//     });
// };
// var isAppInstalled = function (platform) {
//     var bRet = true;
//     if (cc.sys.isNative) {
//         if (cc.sys.os == cc.sys.OS_ANDROID) {
//             bRet = jsb.reflection.callStaticMethod(
//                 "org/cocos2dx/javascript/AppActivity",
//                 "isAppInstalled",
//                 "(Ljava/lang/String;Ljava/lang/String;)Z",
//                 platform,
//                 "");
//         } else if (cc.sys.os == cc.sys.OS_IOS) {
//             //bRet = jsb.reflection.callStaticMethod("JS2OC", "isWxInstall");
//         }
//     }
//     return bRet;
// };

// var getServerConfig = function (times) {
//     if (typeof (times) != 'number') {
//         times = 10;
//     }
//     if (times <= 0) {
//         KKVS.Event.fire("SERVERCONFIGCB", false);
//         return;
//     }
//     HttpManager.GetMessage(http_url_prefix + "api_agnet_config.aspx", {}, METHOD_POST, function (data) {
//         var ret = null;
//         try {
//             ret = JSON.parse(data);
//         } catch (e) {
//             //
//         }
//         if (!ret) {
//             getServerConfig(--times);
//             return;
//         }
//         //检测固定结构
//         //{"StatusName":...}
//         var cek = true;
//         if (ret instanceof Array) {
//             if (ret.length == 0) {
//                 cek = false;
//             } else if (typeof (ret[0]['StatusName']) == 'undefined'){
//                 cek = false;
//             }
//         } else {
//             cek = false;
//         }
//         if (cek) {
//             KKVS.serverConfigData = {};
//             for (var i = 0, l = ret.length; i < l; ++i) {
//                 var temp = ret[i];
//                 KKVS.serverConfigData[temp['StatusName']] = temp;
//             }
//             KKVS.Event.fire("SERVERCONFIGCB", true);
//         } else {
//             KKVS.Event.fire("SERVERCONFIGCB", false);
//         }
//     });
// };

// var copyToClipboardMain = function (txt) {
//     if (cc.sys.isNative) {
//         if (cc.sys.os == cc.sys.OS_ANDROID) {
//             jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "copyToClipboard", "(Ljava/lang/String;)V", txt);
//         } else if (cc.sys.os == cc.sys.OS_IOS) {
//             jsb.reflection.callStaticMethod("JS2OC", "pasteBoard:", txt);
//         }
//     }
// };

// var openWebSite = function (urlText) {
//     cc.log("urlText = " + urlText);
//     cc.sys.openURL(urlText);
// };

// var getWechatHeadMask = function () {
//     //var stencil = new cc.Sprite("res/ui/icon/face_mask.png");
//     //return stencil;
//     return "res/ui/icon/face_mask.png";
// };
// var getWechatHeadBorder = function () {
//     return "res/ui/icon/face_border.png";
// };
// var setWechatHead = function (url, locHead, maskPng, borderPng, alphaTld) {
//     if (locHead) {
//         locHead.setVisible(true);
//         var TPNode = locHead.getParent();
//         if (TPNode) {
//             if (TPNode._wechatHead_ instanceof cc.Node) {
//                 TPNode._wechatHead_.removeFromParent();
//                 TPNode._wechatHead_ = null;
//             }
//             if (TPNode._wechatHeadBorder_ instanceof cc.Node) {
//                 TPNode._wechatHeadBorder_.removeFromParent();
//                 TPNode._wechatHeadBorder_ = null;
//             }
//         }
//     }
//     if (typeof url != 'string' || url == "") {
//         cc.log("error: url or locHead is null");
//         return;
//     }
//     cc.log("setWechatHead url=" + url);
//     var renderHead = function (texture) {
//         cc.log("renderHead");
//         if (!locHead) {
//             cc.log("error: locHead is null");
//             return;
//         }
//         var pNode = locHead.getParent();
//         if (!pNode) {
//             cc.log("error: locHead not have parent node");
//             return;
//         }
//         var locSize = locHead.getContentSize().width;
//         locHead.setVisible(false);
//         var headPng = new cc.Sprite(texture);
//         headPng.setScale(locSize / headPng.getContentSize().width);
//         if ((typeof maskPng == 'string' && maskPng != "") || (maskPng instanceof cc.DrawNode) || (maskPng instanceof cc.Sprite)) {
//             var locSize = locHead.getContentSize();
//             var clipper = new cc.ClippingNode();
//             clipper.alphaThreshold = (alphaTld ? alphaTld : ((maskPng instanceof cc.DrawNode) ? 1.0 : 0.5));
//             clipper.setContentSize(locSize);
//             clipper.setScale(locHead.getScale());
//             clipper.setAnchorPoint(locHead.getAnchorPoint());
//             clipper.setPosition(locHead.getPosition());
//             if (typeof maskPng == 'string') {
//                 var stencil = new cc.Sprite(maskPng);
//                 clipper.stencil = stencil;
//             } else {
//                 clipper.stencil = maskPng;
//             }
//             clipper.stencil.setAnchorPoint(cc.p(0.5, 0.5));
//             clipper.stencil.setPosition(locSize.width / 2, locSize.height / 2);
//             headPng.setPosition(locSize.width / 2, locSize.height / 2);
//             clipper.addChild(headPng);
//             pNode.addChild(clipper);
//             pNode._wechatHead_ = clipper;
//         } else {
//             headPng.setScale(headPng.getScale() * locHead.getScale());
//             headPng.setAnchorPoint(locHead.getAnchorPoint());
//             headPng.setPosition(locHead.getPosition());
//             pNode.addChild(headPng);
//             pNode._wechatHead_ = headPng;
//         }
//         if ((typeof borderPng == 'string' && borderPng != "") || (borderPng instanceof cc.Sprite)) {
//             var headBorder = null;
//             if (typeof borderPng == 'string') {
//                 headBorder = new cc.Sprite(borderPng);
//             } else {
//                 headBorder = borderPng;
//             }
//             headBorder.setAnchorPoint(locHead.getAnchorPoint());
//             headBorder.setPosition(locHead.getPosition());
//             pNode.addChild(headBorder);
//             pNode._wechatHeadBorder_ = headBorder;
//         }
//     };
//     var tempTexture = cc.textureCache.getTextureForKey(url);
//     if (!tempTexture) {
//         cc.loader.loadImg(url, {isCrossOrigin : true}, function (err, img) {
//             if (err) {
//                 cc.log("error: wechat head load failed");
//                 cc.log(err);
//             } else {
//                 cc.log("wechat head load success");
//                 var texture_0 = null;
//                 if (cc.sys.isNative) {
//                     texture_0 = img;
//                 } else {
//                     cc.textureCache.cacheImage(url, img);
//                     texture_0 = cc.textureCache.getTextureForKey(url);
//                     //var texture2d = new cc.Texture2D();
//                     //texture2d.initWithElement(img);
//                     //texture2d.handleLoadedTexture();
//                     //texture_0 = texture2d;
//                 }
//                 renderHead(texture_0);
//             }
//         });
//     } else {
//         cc.log("load wechat head from cache");
//         renderHead(tempTexture);
//     }
// };
module.exports = Tool;