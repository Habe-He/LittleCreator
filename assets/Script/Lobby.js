var KKVS = require("./plugin/KKVS");
var OnLineManager = require("./tool/OnLineManager");
var Tool = require('./tool/Tool');
var AppHelper = require('./AppHelper');
var httpUtils = require('./plugin/httpUtils');
var gameModel = require('./game/gameModel');
var CreateRoom = require('./game/createRoom');
var PvpInfo = require('./game/PvpInfo');

var DialogView = require('./widget/DialogView');
var TxtDialogComp = require('./widget/TxtDialogComp');
var gameEngine = require('./plugin/gameEngine');
var StringDef = require('./tool/StringDef');
var wxSDK = require('./tool/wxSDK');
var AudioMnger = require('./game/AudioMnger');
var RunkList = require("./game/RunkList");

cc.Class({
    extends: cc.Component,

    properties: {
        runkListPB: cc.Prefab,
    },

    onLoad: function () {
        cc.log("=> Lobby::onLoad()");

        cc.game.on(cc.game.EVENT_HIDE, function (event) {
            cc.log("Creator Lobby 切换后台");
        });
        cc.game.on(cc.game.EVENT_SHOW, function (event) {
            cc.log("Creator Lobby 切换前台");
        });

        OnLineManager._autoConnect = true;
        gameModel.isWaiting = false;
        var self = this;
        self.addEvent();
        self._serversRoomConfig();

        var paiBtn = cc.find('bg/PaiWei', this.node);
        var suiBtn = cc.find('bg/Sui', this.node);
        var haoBtn = cc.find('bg/Hao', this.node);
        var runkBtn = cc.find('bg/RunkBtn', this.node);

        var moreGameBtn = cc.find("bg/Bottom/moreGame", this.node);
        var Btn_Changer = cc.find("bg/Bottom/Btn_Changer", this.node);
        var Btn_Mail = cc.find("bg/Bottom/Btn_Mail", this.node);
        var Btn_View = cc.find("bg/Btn_View", this.node);
        var Btn_Share = cc.find("bg/Btn_Share", this.node);

        // paiBtn.getComponent(cc.Button).interactable = false;

        // click
        paiBtn.on('touchend', self.paiTouchEvent, this);
        suiBtn.on('touchend', self.suiTouchEvent, this);
        haoBtn.on('touchend', self.haoTouchEvent, this);
        runkBtn.on("click", self.runkTouchEvent, this);

        moreGameBtn.on("click", self.moreGameClick, this);
        Btn_Changer.on("click", self.moreGameClick, this);
        Btn_Mail.on("click", self.moreGameClick, this);
        Btn_View.on("click", self.moreGameClick, this);
        Btn_Share.on("click", self.moreGameClick, this);


        var bg = this.node.getChildByName('bg');
        var nameBG = bg.getChildByName('NameBG');
        var name = nameBG.getChildByName('name').getComponent(cc.Label);
        name.string = Tool.InterceptDiyStr(Tool.encryptMoblieNumber(KKVS.NICKNAME), 5);

        var coinbg = bg.getChildByName('coin');
        self.coinCount = coinbg.getChildByName('count').getComponent(cc.Label);
        self.coinCount.string = Tool.goldSplit(KKVS.KGOLD);

        var diamond = bg.getChildByName('ZuanShi');
        var diamondCount = diamond.getChildByName('count').getComponent(cc.Label);
        for (var i in gameModel.propsMsg) {
            if (gameModel.propsMsg[i].prop_id == StringDef.Diamond) {
                cc.log("钻石 = ", gameModel.propsMsg[i].count);
                diamondCount.string = gameModel.propsMsg[i].count;
            }
        }

        var mSprite = bg.getChildByName("msak");
        var head = mSprite.getChildByName('Head_0').getComponent(cc.Sprite);
        Tool.weChatHeadFile(head, KKVS.HEAD_URL, mSprite);

        self.lv = cc.find('bg/Lv', this.node);
        self.lv.on('touchend', self.ShowPvPInfo, this);

        self.starCount = self.lv.getChildByName('starCount');
        self.starIcon = self.lv.getChildByName('starIcon');

        self.starCount.active = false;
        self.starIcon.active = false;

        self.paiweiDesc = cc.find('bg/saiJiInfoBg', this.node);
        self._updateLobbyLevel();

        // 注册wx事件
        wxSDK.getLaunchOptionsSync(false, null);
        wxSDK.onNetworkStatusChange();
        wxSDK.showShareMenu();
        wxSDK.onShareAppMessage();

        AudioMnger.playBGM();

        gameModel.isInGameStart = false;

        // 更新微信数据信息
        wx.postMessage({
            messageType: 4,
            messageData: 0
        });
        cc.log("KKVS.PVPSCORES = " + KKVS.PVPSCORES);
        var sco = parseInt(KKVS.PVPSCORES)
        wx.postMessage({
            messageType: 2,
            messageData: sco
        });

        var mon = parseInt(KKVS.KGOLD);
        wx.postMessage({
            messageType: 3,
            messageData: mon
        });
    },

    moreGameClick: function (event) {
        cc.log("更多游戏");
        var text = "功能暂未开启";
        (new DialogView()).build(TxtDialogComp, {
            txt: text,
            type: 1
        }).show();
    },


    ShowPvPInfo: function (event) {
        cc.log("点击排位界面");
        PvpInfo.Show();
    },

    suiTouchEvent: function (event) {
        cc.log("点击金币场次");
        KKVS.GAME_MODEL = 0;
        KKVS.SelectFieldID = 2;
        KKVS.EnterRoomID = 1;
        cc.director.loadScene("GameUI");
        AppHelper.get().showLoading(null, null, 15);
    },

    paiTouchEvent: function (event) {
        cc.log("排位");
        KKVS.GAME_MODEL = 6;
        KKVS.SelectFieldID = 99;
        KKVS.EnterRoomID = 99;
        cc.director.loadScene("GameUI");
        AppHelper.get().showLoading(null, null, 15);
    },

    haoTouchEvent: function (event) {
        cc.log("好友对战");
        AppHelper.get().showLoading(null, null, 150);
        CreateRoom.Show();
    },

    runkTouchEvent: function (event) {
        cc.log("点击排行榜");
        var text = "功能暂未开启";
        (new DialogView()).build(TxtDialogComp, {
            txt: text,
            type: 1
        }).show();
        // AppHelper.get().showLoading(null, null, 150);

        // var cardNode = cc.instantiate(this.runkListPB);
        // cardNode.getComponent('RunkList').setPB(cardNode);
        // this.node.addChild(cardNode, 10);
    },

    _serversRoomConfig: function () {
        var reqURL = "https://apiwxgame.kkvs.com/MobileApi/GetRoomConfig";
        httpUtils.getInstance().httpGets(reqURL, function (data) {
            if (data == -1) {
                cc.log('获取大厅房间配置失败！');
            } else {
                var jsonD = JSON.parse(data);
                gameModel.roomConfig = jsonD;
            }
        });
    },

    _updateLobbyLevel: function () {
        var self = this;
        var data = Tool.getLevelInfo(KKVS.PVPSCORES);
        if (data.star == -1) {
            self.starCount.active = false;
            self.starIcon.active = false;
        } else {
            self.starCount.active = true;
            self.starIcon.active = true;
            self.starCount.getComponent(cc.Label).string = data.star.toString();
        }
        cc.loader.loadRes("Lobby/Lv_" + (data.bigLevel - 1), cc.SpriteFrame, function (err, spriteFrame) {
            if (err) {
                cc.log("Lobby getLobbyLevel err = " + err);
                return;
            }
            self.lv.getComponent(cc.Sprite).spriteFrame = spriteFrame;
        });
    },

    create_room_success: function (args) {
        AppHelper.get().showLoading(null, null, 15);
        // args.room_id === table ID

        cc.director.loadScene("GameUI");
    },

    on_player_join_room: function (args) {
        AppHelper.get().showLoading(null, null, 15);
        cc.director.loadScene("GameUI");
    },

    refreshMyScore: function (money) {
        var self = this;
        self.coinCount.string = Tool.goldSplit(money.toString());
        // self.coinCount.string = money.toString();
        
    },
    dissolveRoom: function () {
        if (KKVS.RoomOutData) {
            if (KKVS.RoomOutData.back_score == 0) {
                var text = "房间已结束，您消耗了" + KKVS.RoomOutData.cost_score.toString() + "颗钻石。";
                (new DialogView()).build(TxtDialogComp, {
                    txt: text,
                    type: 1
                }).show();
            } else {
                var text = "房间已解散，未打满总局数自动返还" + KKVS.RoomOutData.back_score.toString() + "颗钻石到您的账户中。";
                (new DialogView()).build(TxtDialogComp, {
                    txt: text,
                    type: 1
                }).show();
            }
            KKVS.RoomOutData = null;
        }
    },

    addEvent: function () {
        cc.log("Lobby addEvent");
        KKVS.Event.register("create_room_success", this, "create_room_success");
        KKVS.Event.register("on_player_join_room", this, "on_player_join_room");
        KKVS.Event.register("refreshMyScore", this, "refreshMyScore");
        KKVS.Event.register("on_breakroom", this, "dissolveRoom");
    },

    onDestroy() {
        cc.log("=> Lobby::onDestroy()");
        KKVS.Event.deregister("create_room_success", this);
        KKVS.Event.deregister("on_player_join_room", this);
        KKVS.Event.deregister("refreshMyScore", this);
        KKVS.Event.deregister("on_breakroom", this);

    },

});