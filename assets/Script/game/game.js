var Tool = require("./../tool/Tool");
var gameModel = require("./gameModel");
var KKVS = require("./../plugin/KKVS");
var gameEngine = require("./../plugin/gameEngine");

cc.Class({
    
    extends: cc.Component,
    properties: {
        btnPlay: cc.Button,
        btnNotPlay: cc.Button,
        btnTips: cc.Button,
        btnYaoBuQi: cc.Button,
        btnReady: cc.Button,
        btn1: cc.Button,
        btn2: cc.Button,
        btn3: cc.Button,
        btnScroeNo: cc.Button
    },

    // LIFE-CYCLE CALLBACKS:
    onLoad: function () {
        this.addEvent();
        this.necData();
        console.log("进入到游戏场景中 onLoad");
    },

    // 
    necData: function () {
        // 手牌数据
        this.cardList = [];

        // 手牌中心位置
        this.midPos = null;

        // 牌间距
        this.ghp = 70;

        // 鼠标移动的时候弹起的牌
        this.upCard = null;

        // 卡牌初始缩放值
        this.cardScale = 1.2;

        //底牌
        this.diCardList = null;

        // 是否为反春天
        this.fanSpring = 1;

        // 提示信息
        this.tipsWigdetList = null;
        // match node
        this.m_pMatchNode = null;

        this.m_bShow = true;

        // 继续下一局
        this.continueClick = false;

        // 三个玩家信息
        this.m_Chairs = [];

        // 出牌操作按钮
        this.scoreBtnList = [];
    },

    start: function () {
        console.log("进入到游戏场景中 start");
        gameEngine.app.player().req_start_game(0);

        var self = this;
        self.bg = this.node.getChildByName("bg");
        // this.bg.active = false;

        // 三个玩家信息初始化 -------- 编辑器中节点默认 active = false
        for (var i = 0; i < 3; ++i) {
            var headNode = self.bg.getChildByName("head_" + i.toString());
            var role_image = headNode.getChildByName("role_image");
            var head = null;
            var cardNum = null;
            var cardNumBG = null;
            if (i != 0) {
                head = headNode.getChildByName("head_bg").getChildByName("head_Image");
                cardNumBG = headNode.getChildByName("cardNum");
                cardNum = cardNumBG.getChildByName("count");
            }
            var name = headNode.getChildByName("user_bg").getChildByName("username");
            name.string = "初始值";
            var money = headNode.getChildByName("user_bg").getChildByName("userkb");
            var diZhuFlag = headNode.getChildByName("DiZhuSign");
            var clock = headNode.getChildByName("countTime");
            var clockTime = clock.getChildByName("time");
            var unCall = headNode.getChildByName("unCall");
            var unOut = headNode.getChildByName("unOut");
            var ready = headNode.getChildByName("ready");
            var CallScore = headNode.getChildByName("CallScore");

            var data = {
                headNode: headNode,
                role_image: role_image,
                head: head,
                cardNum: cardNum,
                name: name,
                money: money,
                diZhuFlag: diZhuFlag,
                clock: clock,
                clockTime: clockTime,
                unCall: unCall,
                unOut: unOut,
                ready: ready,
                CallScore: CallScore
            };
            self.m_Chairs.push(data);
        }

        // 出牌操作面板
        var play_Panel = self.bg.getChildByName("play_Panel");
        self.btnPlay = play_Panel.getChildByName("Button_Out");
        self.btnNotPlay = play_Panel.getChildByName("Button_No");
        self.btnTips = play_Panel.getChildByName("Button_Tips");
        self.btnYaoBuQi = play_Panel.getChildByName("Button_YaoBuQi");
        self.btnReady = play_Panel.getChildByName("Button_Ready");

        // 叫分面板
        self.callScorePanel = self.bg.getChildByName("callScorePanel");
        self.btn1 = self.callScorePanel.getChildByName("Score_1");
        self.btn2 = self.callScorePanel.getChildByName("Score_2");
        self.btn3 = self.callScorePanel.getChildByName("Score_3");
        self.btnScroeNo = self.callScorePanel.getChildByName("Score_0");
        self.btn1.tag = 0;
        self.btn2.tag = 1;
        self.btn3.tag = 2;
        self.btnScroeNo.tag = 3;
        self.scoreBtnList = [self.btn1, self.btn2, self.btn3];

        // 托管
        self.tuoGuanBG = self.bg.getChildByName("tuoGuan");
        self.btnCanel = self.tuoGuanBG.getChildByName("btnTuoGuan");

        // 自己牌的节点
        self.myCardPanel = self.bg.getChildByName("myCardPanel");
        self.midPos = self.myCardPanel.getContentSize().width / 2 - 50;

        // 有数据等待初始化
        if (gameModel.isWaiting) {
            var len = gameModel.isWaitingData.length;
            var playerData = gameModel.playerData;
            for (var i = 0; i < len; i++) {
                this.playerEnter(playerData[gameModel.isWaitingData[i]], gameModel.isWaitingData[i]);
            }
            gameModel.isWaiting = false;
            gameModel.isWaitingData = [];
        }
    },

    playerEnter: function (args, viewID) {
        console.log("Little Creator uiChairUserInfo");
        var self = this;
        self.m_Chairs[viewID].headNode.active = true;
        self.m_Chairs[viewID].name.getComponent(cc.Label).string = args.name;
        self.m_Chairs[viewID].money.getComponent(cc.Label).string = args.gold;

        if (viewID == 0 && args.status == 0) {
            self.m_Chairs[viewID].clock.active = true;
            self.showTime(0, 15);
            self.btnReady.active = true;
        } else {
            self.m_Chairs[viewID].ready.active = true;
        }
    },

    showTime: function (viewID, time) {
        var self = this;
        this.node.stopAllActions();
        self.m_Chairs[viewID].clockTime.getComponent(cc.Label).string = time.toString();

        self.timeNum = time;
        var delaytime = cc.delayTime(0.9);
        var callfunc = cc.callFunc(function () {
            if (self.timeNum <= 0) {
                self.m_Chairs[viewID].clock.active = false;

                if (viewID == 0) {
                    self.btnReady.active = false;
                    self.m_Chairs[0].clock.active = false;
                }
                return;
            };

            self.timeNum = self.timeNum - 1;
            self.m_Chairs[viewID].clockTime.getComponent(cc.Label).string = self.timeNum.toString();
        });
        this.node.runAction(cc.repeatForever(cc.sequence(delaytime, callfunc)));
    },

    onBtnReady: function (event) {
        var self = this;
        gameEngine.app.player().request_GetReady(KKVS.EnterLobbyID, KKVS.SelectFieldID,
            KKVS.EnterRoomID, KKVS.EnterTableID, KKVS.EnterChairID);

        self.btnReady.active = false;
        self.m_Chairs[0].ready.active = true;
        self.m_Chairs[0].clock.active = false;
    },

    // 创建牌背在屏幕中
    showSelfCard: function () {
        cc.log("创建牌背在屏幕中");
        var self = this;
        self.myCardPanel.active = true;
        for (var i = 0; i < 3; ++i) {
            self.m_Chairs[i].ready.active = false;
        }

        self.cardList = [];
        var cardIds = Tool.toolSortArrayForSelf(gameModel.cardData);
        var len = cardIds.length;
        cc.log("初始手牌0长度 = " + len);

        var size = cc.director.getVisibleSize();
        for (var i = 0; i < len; i++) {
            cc.loader.loadRes("perfabs/card_bg", function (err, loadprefab) {
                if (err) {
                    cc.log("加载牌背预制出错, 原因：" + err);
                    return;
                };
                if (!(loadprefab instanceof cc.Prefab)) {
                    cc.log("载入的不是预制资源");
                    return;
                }
                var cardNode = cc.instantiate(loadprefab);
                cardNode.setPosition(self.midPos, size.height / 2);
                self.myCardPanel.addChild(cardNode);
                self.cardList.push(cardNode);
                // if (self.cardList.length != 1)
                //     cardNode.active = false;

                if (self.cardList.length == len) {
                    // 牌背预制加载结束
                    self.showCardAction();
                }
            });
        }
    },

    // 执行发牌动作
    showCardAction: function () {
        cc.log("执行发牌动作");
        var self = this;
        var len = self.cardList.length;
        cc.log("手牌长度 = " + len);
        var midNum = (len - 1) / 2;
        var runTime = 0;
        var ghpTime = 0.05;
        for (var i = len - 1; i >= 0; --i) {
            var objX = (i - midNum) * self.ghp + self.midPos + 50;
            runTime = runTime + ghpTime;
            self.cardList[i].setLocalZOrder(i);
            self.cardList[i].setScale(1.2);
            var action_1 = cc.sequence(cc.delayTime(runTime), cc.moveTo(0.2, cc.p(objX + 40, self.ghp * 2 - 140)));
            var action_2 = cc.sequence(cc.delayTime(runTime), cc.scaleTo(0.2, 1.2));
            self.cardList[i].runAction(cc.spawn(action_1, action_2));
        }
        if (self.cardList.length == 0) {
            cc.log("执行发牌动作 手牌数据长度为 0");
            return;
        }

        self.cardList[self.cardList.length - 1].isTop = true;

        // 绘制自己的手牌
        
    },

    // 自己被踢出桌子
    leaveGame: function () {
        cc.director.loadScene("Login");
    },

    // 断线重连数据
    reconnectionData: function () {
        cc.log("game -> reconnectionData");
        var self = this;

        self.showSelfCard();
    },

    addEvent() {
        var self = this;
        self.btnReady.node.on("touchend", self.onBtnReady, this);

        console.log("GameUI 注册Kbe事件");
        KKVS.Event.register("playerEnter", this, "playerEnter");
        KKVS.Event.register("showSelfCard", this, "showSelfCard");
        KKVS.Event.register("leaveGame", this, "leaveGame");
        KKVS.Event.register("reconnectionData", this, "reconnectionData");
    },

    onDestroy() {
        console.log("GameUI has been destroy");
        KKVS.Event.deregister("playerEnter", this);
        KKVS.Event.deregister("showSelfCard", this);
        KKVS.Event.deregister("leaveGame", this);
        KKVS.Event.deregister("reconnectionData", this);
    },

    // update (dt) {},
});