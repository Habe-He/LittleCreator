var KKVS = require("./plugin/KKVS");
var OnLineManager = require("./tool/OnLineManager");
//var DialogView = require("./widget/DialogView");
//var TxtDialogComp = require("./widget/TxtDialogComp");
//var TipDialogComp = require("./widget/TipDialogComp");
//var AppHelper = require("./AppHelper");

cc.Class({
    extends: cc.Component,
    properties: {
        btnJinBI: cc.Button,
    },

    onLoad: function () {
        cc.log("=> Lobby::onLoad()");
        OnLineManager._autoConnect = true;
        var self = this;
        self.addEvent();
        this.btnJinBI.node.on("touchend", self.jinBiBtnTouchEvent, this);
    },

    setInfomation: function () {
        this.money.string = "金币：" + KKVS.KGOLD.toString();
        this.weChatID.string = "ID:" + KKVS.NICKNAME.toString();
    },


    rankBtnTouchEvent: function (event) {
        cc.log(" 点击排行榜");
    },

    jinBiBtnTouchEvent: function (event) {
        cc.log("点击金币场次");
        cc.director.loadScene("GameUI");
        //(new DialogView()).build(TxtDialogComp, {txt : "测试用例", type : 2}).show();
        //AppHelper.get().showLoading(null, null, 15);
    },

    shareBtnTouchEvent: function (event) {
        cc.log(" 点击分享");
    },

    //reConnectGameSvrSuccess: function() {
    //    cc.log("Lobby reConnectGameSvrSuccess");
    //    // cc.director.loadScene("GameUI");
    //},

    start() {
        
    },

    addEvent: function () {
        cc.log("Lobby addEvent");
        //KKVS.Event.register("reConnectGameSvrSuccess", this, "reConnectGameSvrSuccess");
    },

    onDestroy() {
        //KKVS.Event.deregister("reConnectGameSvrSuccess", this);
        cc.log("=> Lobby::onDestroy()");
    },

});