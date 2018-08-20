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
var MailCenter = require("./game/MailCenter");

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
        Btn_Mail.on("click", self.mailBtnClick, this);
        Btn_View.on("click", self.onViewClick, this);
        Btn_Share.on("click", self.shareGameClick, this);


        var bg = this.node.getChildByName('bg');
        var nameBG = bg.getChildByName('NameBG');
        self.name = nameBG.getChildByName('name').getComponent(cc.Label);
        self.name.string = Tool.InterceptDiyStr(Tool.encryptMoblieNumber(KKVS.NICKNAME), 5);

        var coinbg = bg.getChildByName('coin');
        self.coinCount = coinbg.getChildByName('count').getComponent(cc.Label);
        self.coinCount.string = Tool.goldSplit(KKVS.KGOLD);
        var addScore = coinbg.getChildByName("addScore");
        addScore.on('click', self.showBuyScoreUI, this);

        var diamond = bg.getChildByName('ZuanShi');
        self.diamondCount = diamond.getChildByName('count').getComponent(cc.Label);
        for (var i in gameModel.propsMsg) {
            if (gameModel.propsMsg[i].prop_id == StringDef.Diamond) {
                cc.log("钻石 = ", gameModel.propsMsg[i].count);
                self.diamondCount.string = gameModel.propsMsg[i].count;
            }
        }


        var recharge = diamond.getChildByName("recharge");
        if (cc.sys.os == cc.sys.OS_IOS) {
           recharge.active = false;
        } else{
           recharge.active = true;
        }


        recharge.on('click', self.showRechargeUI, this);


        var mSprite = bg.getChildByName("msak");
        self.head = mSprite.getChildByName('Head_0');
        Tool.weChatHeadFile(self.head.getComponent(cc.Sprite), KKVS.HEAD_URL, mSprite);

        self.head.getComponent(cc.Button).node.on('click', function() {
            cc.log("head heav clicked");
            wxSDK.getSetting();
        }, this);

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
        wx.updateShareMenu({
            withShareTicket: true
        });
        wxSDK.onNetworkStatusChange();
        wxSDK.showShareMenu();
        wxSDK.onShareAppMessage();

        var phoneRes = wxSDK.getSystemInfoSync();
        var tempClickBtn = bg.getChildByName('RunkBtn');
        cc.log("phoneRes.model = " + phoneRes.model);
        cc.log('tempClickBtn.x = ' + tempClickBtn.x);
        if (phoneRes.model == 'iPhone X') {
            tempClickBtn.x = tempClickBtn.x + 70;
            cc.log('2 tempClickBtn.x = ' + tempClickBtn.x);
        } else if (phoneRes.model == 'vivo X21A' || phoneRes.model == 'OPPO R15') {
            tempClickBtn.x = tempClickBtn.x + 50;
        }

        AudioMnger.playBGM();

        gameModel.isInGameStart = false;

        // 更新微信数据信息
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

    shareGameClick:function(){
        // wxSDK.shareAppMessageOnly();
        wxSDK.shareToGroup();
        // KKVS.Event.fire("shareSuccess");
    },

    onViewClick: function(event) {
        var text = "功能暂未开启";
        (new DialogView()).build(TxtDialogComp, {
            txt: text,
            type: 1
        }).show();
    },

    moreGameClick: function (event) {
        cc.log("更多游戏");
        var urlArray = [
        "https://apiwxgame.kkvs.com/game/res/shareImg/sb.jpg"];
        wx.previewImage({
            urls: urlArray // 需要预览的图片 http 链接列表
        })
        // wx.navigateToMiniProgram({
        //     appId: 'wx845a2f34af2f4235',
        //     path: "",
        //     success: (res) => {
        //         cc.log("res = ", res);
        //     },
        // });
    },

    mailBtnClick: function (event) {
        cc.log("点击了邮件");
        (new DialogView()).build(MailCenter).show();
    },

    showRechargeUI:function(event){
        cc.log("点击充值界面");
        var RechargeUI = require('./game/RechargeUI');
        RechargeUI.Show();

    },

    showBuyScoreUI:function(event){
        cc.log("显示兑换金币UI");
        var BuyScoreUI = require('./game/BuyScoreUI');
        BuyScoreUI.Show();
    },


    ShowPvPInfo: function (event) {
        cc.log("点击排位界面");
        // wxSDK.shareToGroup(1);
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
        // var text = "功能暂未开启";
        // (new DialogView()).build(TxtDialogComp, {
        //     txt: text,
        //     type: 1
        // }).show();
        AppHelper.get().showLoading(null, null, 150);

        var cardNode = cc.instantiate(this.runkListPB);
        cardNode.getComponent('RunkList').setPB(cardNode);
        this.node.addChild(cardNode, 10);
    },

    _serversRoomConfig: function () {

        var reqUrl = "https://sjddz-yxjh.17fengyou.com/room/configure"
        // var reqURL = "https://apiwxgame.kkvs.com/MobileApi/GetRoomConfig";
        // httpUtils.getInstance().httpPost(reqUrl, "",function (data) {
        //     if (data == -1) {
        //         cc.log('获取大厅房间配置失败！');
        //     } else {
        //         cc.log("获取大厅房间配置 data = " + data);
        //         var jsonD = JSON.parse(data);
        //         cc.log("data.code = " + jsonD.http_code);
        //         cc.log("jsonD = " + (jsonD.data));
        //         gameModel.roomConfig = jsonD;
        //     }
        // });
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
        cc.log("data.bigLevel = " + data.bigLevel);
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

    // 用户再次手动授权后
    onLoginGameSuccess: function() {
        var self = this;
        cc.log("用户再次手动授权后");
        // TODO 只刷新当前页面的信息
        for (var i in gameModel.propsMsg) {
            if (gameModel.propsMsg[i].prop_id == StringDef.Diamond) {
                cc.log("钻石 = ", gameModel.propsMsg[i].count);
                self.diamondCount.string = gameModel.propsMsg[i].count;
            }
        }
        
        Tool.weChatHeadFile(self.head.getComponent(cc.Sprite), KKVS.HEAD_URL, null);
        self.name.string = Tool.InterceptDiyStr(Tool.encryptMoblieNumber(KKVS.NICKNAME), 5);
        self.coinCount.string = Tool.goldSplit(KKVS.KGOLD);

        if( KKVS.isShareSuccess == true){
            KKVS.isShareSuccess = false;
            KKVS.Event.fire("shareSuccess");
        }
    },

    refreshPropsInfo:function(){
        //  主要用于刷新钻石
        for (var i in gameModel.propsMsg) {
            if (gameModel.propsMsg[i].prop_id == StringDef.Diamond) {
                cc.log("钻石 = ", gameModel.propsMsg[i].count);
                this.diamondCount.string = gameModel.propsMsg[i].count;
            }
        }
    },

    shareSuccess:function(){
        cc.log("分享成功");
        gameEngine.app.player().reqShareSuccess(1);
    },

    ChargeSuccess:function(){
        cc.log("充值成功");
        var text = "充值成功,奖励已发送至邮箱,请注意查收.";
        (new DialogView()).build(TxtDialogComp, {
            txt: text,
            type: 1
        }).show();
    },

    addEvent: function () {
        cc.log("Lobby addEvent");
        KKVS.Event.register("create_room_success", this, "create_room_success");
        KKVS.Event.register("on_player_join_room", this, "on_player_join_room");
        KKVS.Event.register("refreshMyScore", this, "refreshMyScore");
        KKVS.Event.register("on_breakroom", this, "dissolveRoom");
        KKVS.Event.register("onLoginGameSuccess", this, "onLoginGameSuccess");
        KKVS.Event.register("refreshPropsInfo", this, "refreshPropsInfo");
        KKVS.Event.register("shareSuccess", this, "shareSuccess");
        KKVS.Event.register("ChargeSuccess", this, "ChargeSuccess");
        // send msg
        gameEngine.app.player().reqShareRecord();
    },




    onDestroy() {
        cc.log("=> Lobby::onDestroy()");
        KKVS.Event.deregister("create_room_success", this);
        KKVS.Event.deregister("on_player_join_room", this);
        KKVS.Event.deregister("refreshMyScore", this);
        KKVS.Event.deregister("on_breakroom", this);
        KKVS.Event.deregister("onLoginGameSuccess", this);
        KKVS.Event.deregister("refreshPropsInfo", this);
        KKVS.Event.deregister("shareSuccess", this);
        KKVS.Event.deregister("ChargeSuccess", this);
    },

});