var Tool = require("./../tool/Tool");
var gameModel = require("./gameModel");
var KKVS = require("./../plugin/KKVS");
var gameEngine = require("./../plugin/gameEngine");
var cardfabs = require('./../card/cardPer');
var cardTypeUtil = require('./../card/cardTypeUtil');

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
        btnScroeNo: cc.Button,

        pokerCard: {
            default: null,
            type: cc.Prefab
        },
    },

    onLoad: function () {
        this.addEvent();
        this.necData();

        console.log("进入到游戏场景中 onLoad");
    },

    // 数据初始化
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
        self.scoreBtnList = [self.btn1, self.btn2, self.btn3, self.btnScroeNo];

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

        this.addTouchLister();
    },

    // 用户进入
    playerEnter: function (args, viewID) {
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
        // cc.log("显示" + viewID + "的倒计时");
        self.m_Chairs[viewID].clock.active = true;
        self.m_Chairs[viewID].clockTime.getComponent(cc.Label).string = time.toString();

        self.timeNum = time;
        var delaytime = cc.delayTime(0.9);
        var callfunc = cc.callFunc(function () {
            if (self.timeNum <= 0) {
                self.m_Chairs[viewID].clock.active = false;

                if (viewID == 0) {
                    self.btnReady.active = false;
                    self.m_Chairs[0].clock.active = false;
                    for (var i = 0; i < self.scoreBtnList.length; ++i) {
                        self.scoreBtnList[i].active = false;
                    }
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

        var num = 0;
        self.cardList = [];
        var cardIds = Tool.toolSortArrayForSelf(gameModel.cardData);
        var len = cardIds.length;

        var size = cc.director.getVisibleSize();
        for (var i = 0; i < len; i++) {
            var cardNode = cc.instantiate(this.pokerCard);
            cardNode.setPosition(self.midPos, size.height / 2);
            self.myCardPanel.addChild(cardNode);
            self.cardList.push(cardNode);
        }
        self.showCardAction();
    },

    // 执行发牌动作
    showCardAction: function () {
        cc.log("执行发牌动作");
        var self = this;
        var len = self.cardList.length;
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
        self.showSelfCardInfo();
    },

    // 发完牌 - 显示自己的手牌数据
    showSelfCardInfo: function () {
        var self = this;
        var cardIds = Tool.toolSortArrayForSelf(gameModel.cardData);
        var len = cardIds.length;
        for (var i = 0; i < len; ++i) {
            var singleCard = self.cardList[i].getComponent(cardfabs);
            singleCard.showPoker(cardIds[i], i);
        }
    },

    // 自己被踢出桌子
    leaveGame: function () {
        cc.director.loadScene("Login");
    },

    // 选牌操作
    addTouchLister: function () {
        var self = this;
        this.touchstart_Point = null;
        self.myCardPanel.active = true;

        self.myCardPanel.on(cc.Node.EventType.TOUCH_START, function (event) {
            this.touchstart_Point = event.getLocation();
            this.converBeginPos = self.myCardPanel.convertToNodeSpace(this.touchstart_Point);
            self.selectCardList = [];
            var card = self.getSelectCard(this.touchstart_Point);
            if (card == null)
                self.setAllNoneSelectCard();

            var bY = this.converBeginPos.y;
            var eY = this.converBeginPos.y;

            var bX = this.converBeginPos.x;
            var eX = this.converBeginPos.x;
            self.isContentCard(bY, eY, bX, eX);

            // cc.log("this.touchstart_Point.x = " + this.touchstart_Point.x + " this.touchstart_Point.y = " + this.touchstart_Point.y);
        });

        self.myCardPanel.on(cc.Node.EventType.TOUCH_MOVE, function (event) {
            var movePos = event.getLocation();
            var converMovePos = self.myCardPanel.convertToNodeSpace(movePos);
            var bY = this.converBeginPos.y < converMovePos.y ? this.converBeginPos.y : converMovePos.y;
            var eY = this.converBeginPos.y > converMovePos.y ? this.converBeginPos.y : converMovePos.y;

            var bX = this.converBeginPos.x < converMovePos.x ? this.converBeginPos.x : converMovePos.x;
            var eX = this.converBeginPos.x > converMovePos.x ? this.converBeginPos.x : converMovePos.x;
            self.isContentCard(bY, eY, bX, eX);
        });

        self.myCardPanel.on(cc.Node.EventType.TOUCH_END, function (event) {
            if (self.selectCardList.length > 0) {
                self.showAllSelectCard(true);
            } else {
                self.setAllNoneSelectCard();
            };
        });

    },

    // 获取选中的牌
    getSelectCard: function (touchPos) {
        var self = this;
        var clen = self.cardList.length;

        if (clen == 0) {
            return null;
        };

        for (var i = clen - 1; 0 <= i; --i) {
            var v = self.cardList[i].getComponent(cardfabs);
            if (!v)
                return null;

            var size = v.getCSize();
            var t_touchPos = v.covToSpace(touchPos);
            var rect = cc.rect(0, 0, size.width, size.height);
            if (cc.rectContainsPoint(rect, t_touchPos)) {
                return v;
            }
        }
        return null;
    },

    // 设置所有的牌为未选中
    setAllNoneSelectCard: function () {
        var self = this;
        var clen = self.cardList.length;
        for (var i = 0; i < clen; ++i) {
            self.cardList[i].getComponent(cardfabs).setNoneSelect();
            // self.cardList[i].cardimg.setColor(cc.color(255, 255, 255, 255));
        }
        // self.btnPlay.stopAllActions();
        // self.btnPlay.setTouchEnabled(false);
        // self.btnPlay.setBright(false);
    },

    // 选中了哪些牌
    isContentCard: function (bY, eY, bX, eX) {
        var self = this;
        self.selectCardList = [];
        var clen = self.cardList.length;

        if (clen == 0)
            return;

        for (var i = clen - 1; i >= 0; i--) {
            var v = self.cardList[i].getComponent(cardfabs);
            if (!v)
                return

            var beginY = v.getPokerPosition().y;
            var endY = beginY + v.getCSize().height * self.cardScale;
            var bYIsIn = (bY < endY && bY > beginY);
            var eYIsIn = (eY < endY && eY > beginY);
            var touchYIsIn = (bY < endY && bY > beginY);
            if (bYIsIn || eYIsIn || touchYIsIn) {
                var beginX = v.getPokerPosition().x - 100;
                var endX = v.isTop ? (beginX + v.getCSize().width * self.cardScale) : (beginX + self.ghp);
                var beginIsIn = (beginX < eX && beginX > bX);
                var endIsIn = (endX < eX && endX > bX);
                var touchIsIn = (bX < endX && bX > beginX);
                if (beginIsIn || endIsIn || touchIsIn) {
                    v.isReadyToSelect = true;
                    self.selectCardList.push(v);
                    v.node.setColor(cc.color(127, 127, 127, 255));
                } else {
                    v.isReadyToSelect = false;
                    v.node.setColor(cc.color(255, 255, 255, 255));
                }
            }
        }
        // if (gameModel.outCardViewID == 0 && self.selectCardList.length > 0) {
        // 	self.btnPlay.setTouchEnabled(true);
        // 	self.btnPlay.setBright(true);
        // } else {
        // 	self.btnPlay.setTouchEnabled(false);
        // 	self.btnPlay.setBright(false);
        // }
    },

    // 弹出所有选中的牌
    showAllSelectCard: function (bool) {
        var self = this;
        var cardValues = [];
        var selfCards = [];
        var objCards = [];
        var toCheckCard = [];
        var toCheckCardValues = [];
        var clen = self.cardList.length;
        for (var i = 0; i < clen; ++i) {
            if (self.cardList[i].isReadyToSelect) {
                toCheckCard.push(self.cardList[i]);
                toCheckCardValues.push(self.cardList[i].getComponent(cardfabs).cardValue);
            }
        }

        // 找牌形
        if (self.selectCardList.length >= 5) {
            var findCards = cardTypeUtil.autoTakeOutCardType(toCheckCardValues);

            if (findCards != null && findCards.length > 3) {
                var flen = findCards.length;
                for (var i = 0; i < flen; i++) {
                    var clen = toCheckCard.length;
                    for (var k = (clen - 1); k >= 0; k--) {
                        if (toCheckCard[k].cardValue == findCards[i]) {
                            toCheckCard.splice(k, 1);
                            break;
                        };
                    };
                };
                var tlen = toCheckCard.length;
                for (var i = 0; i < tlen; ++i) {
                    toCheckCard[i].isReadyToSelect = false;
                }
            };
        };

        var clen = self.cardList.length;
        for (var i = 0; i < clen; ++i) {
            var v = self.cardList[i].getComponent(cardfabs);
            v.showByReadySelect();
            if (self.cardList[i] == self.upCard) {
                self.upCard = null;
            }
            if (bool)
                v.node.setColor(cc.color(255, 255, 255, 255));

            if (self.cardList[i].isSelect) {
                selfCards.push(v.cardValue);
            }
        }

        // if (selfCards.length > 0) {
        //     self.btnPlay.setTouchEnabled(true);
        //     self.btnPlay.setBright(true);
        // } else {
        //     self.btnPlay.stopAllActions();
        //     self.btnPlay.setTouchEnabled(false);
        //     self.btnPlay.setBright(false);
        // }
    },

    // 断线重连数据
    reconnectionData: function () {
        cc.log("game -> reconnectionData");
        var self = this;

        self.showSelfCard();
    },

    // 玩家叫分
    callBanker: function(data) {
        var self = this;
        var viewID = Tool.getViewChairID(data.chairID);
        if (viewID == -1) {
            cc.log("出现叫分出错了 原因：chairID = " + data.chairID);
            return;
        }
        for (var i = 0; i < 3; ++i) {
            self.m_Chairs[i].ready.active = false;
            self.m_Chairs[i].clock.active = false;
        }
        self.showTime(viewID, data.time);
        if (viewID == 0) {
            self.setCallScoreButton(data.multiple);
        }
    },

    // 不可操作的叫分按钮
    setCallScoreButton: function(multiple) {
        var self = this;
        for (var i = 0; i < self.scoreBtnList.length; ++i) {
            self.scoreBtnList[i].active = true;
            self.scoreBtnList[i].interactable = true;
        }
        if (multiple != -1) {
            for (var i = 0; i < multiple; ++i) {
                self.scoreBtnList[i].interactable = false;
            }
        }
    },

    // 确定地主
    BankerInfo: function(data) {
        // 地主标识显示
        // 显示地主牌
        // 更新地主手牌数量
    },

    addEvent() {
        var self = this;
        self.btnReady.node.on("touchend", self.onBtnReady, this);
        self.btnReady.node.on("touchend", self.btn1, this);
        self.btnReady.node.on("touchend", self.btn2, this);
        self.btnReady.node.on("touchend", self.btn3, this);

        cc.log("GameUI 注册Kbe事件");
        KKVS.Event.register("playerEnter", this, "playerEnter");
        KKVS.Event.register("showSelfCard", this, "showSelfCard");
        KKVS.Event.register("leaveGame", this, "leaveGame");
        KKVS.Event.register("reconnectionData", this, "reconnectionData");
        KKVS.Event.register("callBanker", this, "callBanker");
        KKVS.Event.register("BankerInfo", this, "BankerInfo");
    },

    onDestroy() {
        cc.log("GameUI has been destroy");
        KKVS.Event.deregister("playerEnter", this);
        KKVS.Event.deregister("showSelfCard", this);
        KKVS.Event.deregister("leaveGame", this);
        KKVS.Event.deregister("reconnectionData", this);
        KKVS.Event.deregister("callBanker", this);
        KKVS.Event.deregister("BankerInfo", this);
    },
});