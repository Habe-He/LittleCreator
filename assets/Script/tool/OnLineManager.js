/**
 * 连线机制
 */
var KKVS = require("./../plugin/KKVS");
var gameEngine = require("./../plugin/gameEngine");

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

OnLineManager.onLine = function () {
    //KKVS.Event.fire(EVENT_LOADING,{event:EVENT_LOADING_SHOW});
    //modulelobby.showLoading(null, null, 15);
    cc.log("->OnLineManager.onLine");
    cc.log("->OnLineManager._onlineTime = " + OnLineManager._onlineTime.toString());
    OnLineManager._forceOffLine = false;
    OnLineManager._onLine = false;
    //onLine();
    var acc = KKVS.Acc;
    var pwd = KKVS.Pwd; //Pwd_MD5
    cc.log("acc = " + acc);
    cc.log("pwd = " + pwd);
    gameEngine.app.reset();
    if(!acc || acc == "") {
        //modulelobby.showTxtDialog({title : "系统提示", txt : "登录失败,帐号不能为空"});
        return;
    }
    var login_extraDatas = {
        login_type: "1", //you ke
        plaza_id: "0",
        server_id: "1"
    };
    var datas = JSON.stringify(login_extraDatas);
    gameEngine.Event.fire("login", acc, pwd, datas);

    OnLineManager._onlineTime = (OnLineManager._onlineTime + 1 < OnLineManager._onlineMaxTime) ? (OnLineManager._onlineTime + 1) : OnLineManager._onlineMaxTime;
}
OnLineManager.offLine = function () {
    OnLineManager.reset();
    OnLineManager._onLine = false;
    if (gameEngine && gameEngine.app) {
        gameEngine.app.reset();
    }
};
OnLineManager._onLineCallback = function () {
    cc.log("->OnLineManager._onLineCallback");
    //刷新变动的信息
    OnLineManager.reset();
    OnLineManager._onLine = true;
    KKVS.Event.fire("updateLobbyUI"); //用于更新断线重连后所有数据
    //KKVS.Event.fire(EVENT_LOADING,{event:EVENT_LOADING_HIDE});
    //modulelobby.hideLoading();
}
OnLineManager.forceOffLine = function () {
    //OnLineManager.reset();
    //OnLineManager._forceOffLine = true;
    //if (gameEngine.app && gameEngine.app.player()) {
    //    gameEngine.app.player().req_charge("");
    //    //gameEngine.app.reset();
    //}
}
OnLineManager.isForceOffLine = function () {
    return OnLineManager._forceOffLine;
}
OnLineManager.isOnLine = function () {
    return OnLineManager._forceOffLine == false && OnLineManager._onlineTime < OnLineManager._onlineMaxTime;
}

OnLineManager.init();

module.exports = OnLineManager;