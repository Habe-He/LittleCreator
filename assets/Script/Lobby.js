var KKVS = require("./plugin/KKVS");
var OnLineManager = require("./tool/OnLineManager");
var Tool = require('./tool/Tool');
var AppHelper = require('./AppHelper');

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

        var redBagBtn = cc.find('bg/Btn_Red', this.node);
        var paiWeiBtn = cc.find('bg/Btn_PaiWei', this.node);

        redBagBtn.on('touchend', self.redBtnTouchEvent, this);
        paiWeiBtn.on('touchend', self.paiBtnTouchEvent, this);

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
        // KKVS.SelectFieldID = 2;
        cc.director.loadScene("GameUI");
        AppHelper.get().showLoading(null, null, 15);
        // gameEngine.app.player().req_start_game(0);
    },

    redBtnTouchEvent: function (event) {
        cc.log("点击红包场次");
        // KKVS.SelectFieldID = 1;
        // cc.director.loadScene("GameUI");
        // AppHelper.get().showLoading(null, null, 15);
    },

    paiBtnTouchEvent: function(event) {
        cc.log("排位");
        // KKVS.SelectFieldID = 99;
        // cc.director.loadScene("GameUI");
        // AppHelper.get().showLoading(null, null, 15);
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