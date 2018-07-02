/**
 * 连线机制,只针对大厅
 * Created by hades on 2016/12/23.
 */

var OnLineManager = {};

OnLineManager._forceOffLine = false;
OnLineManager._onlineTime = 0;
OnLineManager._onlineMaxTime = 3;
OnLineManager._autoConnect = false;
OnLineManager._onLine = false;
OnLineManager._kicked = false;

OnLineManager.init = function () {
    OnLineManager.reset();
    KKVS.Event.deregister("onLoginSuccess", OnLineManager);
    KKVS.Event.register("onLoginSuccess", OnLineManager, "_onLineCallback");
}
OnLineManager.reset = function () {
    OnLineManager._forceOffLine = false;
    OnLineManager._onlineTime = 0;
}
//OnLineManager.createAccount = function () {
//    KKVS.Event.fire(EVENT_LOADING, {event:EVENT_LOADING_SHOW});
//    var acc = KKVS.Acc;
//    var pwd = KKVS.Pwd_MD5;
//    KKVS.Login_type = VISITOR_LOGIN;
//    KBEngine.app.reset();
//    if(!acc || acc == "") {
//        modulelobby.showTxtDialog({title : "系统提示", txt : "创建失败,帐号不能为空"});
//        return;
//    }
//    var login_extraDatas = {plaza_id : "0"};
//    var datas = JSON.stringify(login_extraDatas);
//    KBEngine.Event.fire("createAccount", acc, pwd, datas);
//}
OnLineManager.onLine = function () {
    //KKVS.Event.fire(EVENT_LOADING,{event:EVENT_LOADING_SHOW});
    modulelobby.showLoading(null, null, 15);
    cc.log("->OnLineManager.onLine");
    cc.log("->OnLineManager._onlineTime = " + OnLineManager._onlineTime.toString());
    OnLineManager._forceOffLine = false;
    OnLineManager._onLine = false;
    //onLine();
    var acc = KKVS.Acc;
    var pwd = KKVS.Pwd_MD5;
    cc.log("acc = " + acc);
    cc.log("pwd = " + pwd);
    KBEngine.app.reset();
    if(!acc || acc == "") {
        modulelobby.showTxtDialog({title : "系统提示", txt : "登录失败,帐号不能为空"});
        return;
    }
    var login_extraDatas = {plaza_id : "0"};
    if (typeof (KKVS.installData) == 'undefined' || typeof (KKVS.installData.bindData) == 'undefined' || typeof (KKVS.installData.bindData.AgentID) == 'undefined' || KKVS.installData.bindData.AgentID == 'null') {
    } else {
        login_extraDatas.agent = KKVS.installData.bindData.AgentID.toString(); //渠道
    }

    if (typeof (KKVS.installData) == 'undefined' || typeof (KKVS.installData.bindData) == 'undefined' || typeof (KKVS.installData.bindData.ParentID) == 'undefined' || KKVS.installData.bindData.ParentID == 'null') {
    } else {
        login_extraDatas.parent = KKVS.installData.bindData.ParentID.toString(); //渠道
    }

    if (KKVS.Login_type == VISITOR_LOGIN || KKVS.Login_type == "0") {
        login_extraDatas.login_type = VISITOR_LOGIN;
    } else if (KKVS.Login_type == MOBILE_LOGIN) {
        login_extraDatas.login_type = MOBILE_LOGIN;
    } else if (KKVS.Login_type == WECHAT_LOGIN) {
        login_extraDatas.login_type = WECHAT_LOGIN;
        //login_extraDatas.openid = KKVS.WxData.openid;
        //login_extraDatas.nick_name = KKVS.WxData.nick_name;
        //login_extraDatas.sex = KKVS.WxData.sex.toString();
        //login_extraDatas.head = KKVS.WxData.head;
        //login_extraDatas.unionid = KKVS.WxData.unionid;
        //login_extraDatas.phone = "";
        //login_extraDatas.mac_addr = getPhoneUUID();
    } else {
        modulelobby.showTxtDialog({title : "系统提示", txt : "无效登录"});
        return;
    }
    var datas = JSON.stringify(login_extraDatas);
    //var loginEvent = OnLineManager._autoConnect ? "reLoginBaseapp" : "login";
    KBEngine.Event.fire("login", acc, pwd, datas);

    OnLineManager._onlineTime = (OnLineManager._onlineTime + 1 < OnLineManager._onlineMaxTime) ? (OnLineManager._onlineTime + 1) : OnLineManager._onlineMaxTime;
}
OnLineManager.offLine = function () {
    OnLineManager.reset();
    OnLineManager._onLine = false;
    if (KBEngine && KBEngine.app) {
        KBEngine.app.reset();
    }
};
OnLineManager._onLineCallback = function () {
    cc.log("->OnLineManager._onLineCallback");
    //刷新变动的信息
    OnLineManager.reset();
    OnLineManager._onLine = true;
    //KKVS.Event.fire("refreshMyScore");
    //KKVS.Event.fire("refreshKbao");
    //KKVS.Event.fire("refreshVip");
    KKVS.Event.fire("updateLobbyUI"); //用于更新断线重连后所有数据
    //KKVS.Event.fire(EVENT_LOADING,{event:EVENT_LOADING_HIDE});
    modulelobby.hideLoading();
}
OnLineManager.forceOffLine = function () {
    //OnLineManager.reset();
    //OnLineManager._forceOffLine = true;
    //if (KBEngine.app && KBEngine.app.player()) {
    //    KBEngine.app.player().req_charge("");
    //    //KBEngine.app.reset();
    //}
}
OnLineManager.isForceOffLine = function () {
    return OnLineManager._forceOffLine;
}
OnLineManager.isOnLine = function () {
    return OnLineManager._forceOffLine == false && OnLineManager._onlineTime < OnLineManager._onlineMaxTime;
}

OnLineManager.init();