var KKVS = require("./plugin/KKVS");
var OnLineManager = require("./tool/OnLineManager");
var Tool = require('./tool/Tool');
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

        var bg = this.node.getChildByName('bg');
        var nameBG = bg.getChildByName('NameBG');
        var name = nameBG.getChildByName('name').getComponent(cc.Label);
        name.string = Tool.InterceptDiyStr(Tool.encryptMoblieNumber(KKVS.NICKNAME), 5);

        var coinbg = bg.getChildByName('coin');
        var coinCount = coinbg.getChildByName('count').getComponent(cc.Label);
        coinCount.string = KKVS.KGOLD.toString();

        var head = bg.getChildByName('Head_0').getComponent(cc.Sprite);
        Tool.weChatHeadFile(head, KKVS.HEAD_URL);

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