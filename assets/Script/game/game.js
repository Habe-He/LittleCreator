var Tool = require("./../tool/Tool");
var gameModel = require("./gameModel");
var KKVS = require("./../plugin/KKVS");
var gameEngine = require("./../plugin/gameEngine");
var cardfabs = require('./../card/cardPer');
var cardTypeUtil = require('./../card/cardTypeUtil');
var cardInfo = require('./../card/cardInfo');
var endNodePrefab = require('./gameEnd');

var OnLineManager = require('./../tool/OnLineManager')

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

        endPrefab: cc.Prefab,
    },

    onLoad: function () {
        cc.log("=> onLoad Game");
        var isBackGround = false;
        
        this.addEvent();
        this.necData();

        cc.log("进入到游戏场景中 onLoad");
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

        // 地主三张牌
        this.backPoker = [];

        // 玩家出的牌
        this.outCardList = [];
        this.outCardList[0] = [];
		this.outCardList[1] = [];
		this.outCardList[2] = [];

        // 出牌的玩家
        this.lastCardData = [];

        // 是否必须出牌
        this.mustPlay = false;
    },

    start: function () {
        cc.log("进入到游戏场景中 start");
        gameEngine.app.player().req_start_game(0);

        var self = this;
        self.bg = this.node.getChildByName("bg");

        // 三个玩家信息初始化 -------- 编辑器中节点默认 active = false
        for (var i = 0; i < 3; ++i) {
            var headNode = self.bg.getChildByName("Head_" + i.toString());
            var head = null;
            var cardNum = null;
            var cardNumBG = null;
            if (i != 0) {
                head = headNode.getChildByName("head");
                cardNumBG = headNode.getChildByName("card");
                cardNum = cardNumBG.getChildByName("count");
            }
            var name = headNode.getChildByName("name");
            var money = headNode.getChildByName("playerKB").getChildByName("money");
            var diZhuFlag = headNode.getChildByName("DiZhuFlag");
            var clock = headNode.getChildByName("clock");
            var clockTime = clock.getChildByName("time");
            var unCall = headNode.getChildByName("unCall");
            var unOut = headNode.getChildByName("unOut");
            var ready = headNode.getChildByName("ready");
            var CallScore = headNode.getChildByName("score");

            var data = {
                headNode: headNode,
                head: head,
                cardNumBG: cardNumBG,
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

        // 自己牌的节点
        self.myCardPanel = self.bg.getChildByName("myCardPanel");
        self.midPos = self.myCardPanel.getContentSize().width / 2 - 50;

        // 地主三张牌
        var leftInfo = self.bg.getChildByName("MasterCard");
        for (var i = 0; i < 3; ++i) {
            var pokers = leftInfo.getChildByName("c_" + i.toString());
            self.backPoker.push(pokers);
        }
        self.diText = leftInfo.getChildByName("di_text").getComponent(cc.Label);
        self.multipleText = leftInfo.getChildByName("bei_text").getComponent(cc.Label);

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
        self.m_Chairs[viewID].name.getComponent(cc.Label).string = Tool.InterceptDiyStr(Tool.encryptMoblieNumber(args.name), 4);
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
        self.m_Chairs[viewID].clock.active = true;
        self.m_Chairs[viewID].clockTime.getComponent(cc.Label).string = time.toString();

        self.timeNum = time;
        var delaytime = cc.delayTime(0.9);
        var callfunc = cc.callFunc(function () {
            if (self.timeNum <= 0) {
                self.m_Chairs[viewID].clock.active = false;

                if (viewID == 0) {
                    self.btnReady.active = false;
                    self.btnPlay.active = false;
                    self.btnNotPlay.active = false;
                    self.btnTips.active = false;

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

    onBtnOne: function (event) {
        gameEngine.app.player().baseCall("reqKent_callbanker", KKVS.EnterLobbyID, KKVS.SelectFieldID,
            KKVS.EnterRoomID, KKVS.EnterTableID, KKVS.EnterChairID, 1);
        this.visibleCallScore(false);
    },

    onBtnSceond: function (event) {
        gameEngine.app.player().baseCall("reqKent_callbanker", KKVS.EnterLobbyID, KKVS.SelectFieldID,
            KKVS.EnterRoomID, KKVS.EnterTableID, KKVS.EnterChairID, 2);
        this.visibleCallScore(false);
    },

    onBtnThree: function (event) {
        gameEngine.app.player().baseCall("reqKent_callbanker", KKVS.EnterLobbyID, KKVS.SelectFieldID,
            KKVS.EnterRoomID, KKVS.EnterTableID, KKVS.EnterChairID, 3);
        this.visibleCallScore(false);
    },

    onBtnScroeLess: function (event) {
        gameEngine.app.player().baseCall("reqKent_callbanker", KKVS.EnterLobbyID, KKVS.SelectFieldID,
            KKVS.EnterRoomID, KKVS.EnterTableID, KKVS.EnterChairID, 0);
        this.visibleCallScore(false);
    },

    onBtnPlay: function(event) {
        this.playCard();
    },

    onBtnNotPlay: function(event) {
        this.sendNotPlay();
    },

    onBtnTips: function(event) {
        this.toTipsCard();
    },

    sendNotPlay: function () {
		var self = this;
		self.setAllNoneSelectCard();
		self.visibleOperation(false);
		self.m_Chairs[0].unOut.active = true;
		gameEngine.app.player().baseCall("reqKent_outCard", KKVS.EnterLobbyID, KKVS.SelectFieldID,
            KKVS.EnterRoomID, KKVS.EnterTableID, KKVS.EnterChairID, []);
	},

    // 发送出牌
	playCard: function () {
        var self = this;
        var len = self.cardList.length;
		for (var k = len - 1; k >= 0; k--) {
			if (self.cardList[k].getComponent(cardfabs).isSelect) {
				self.outCardList[0].push(self.cardList[k]);
			}
        }
        Tool.sortCardList(self.outCardList[0]);
        var outLen = self.outCardList[0].length;
		var cardIs = [];
		var cardvalue = [];
		for (var p = 0; p < outLen; p++) {
			cardIs.push(self.outCardList[0][p].getComponent(cardfabs).getCardId());
			cardvalue.push(self.outCardList[0][p].getComponent(cardfabs).getCardValue());
        };

        var objCardType = cardTypeUtil.getCommonCardType(cardvalue);
		if (objCardType == 0) {
            self.recetCardList();
            cc.log("出牌错误");
			return;
        }

        if (self.mustPlay) {
			Tool.sortListBy2T3(cardvalue, '从大到小');
			if (cardvalue[0] <= cardTypeUtil.GetCardValue(this.cardList[0])) {
                self.recetCardList();
                cc.log("牌型错误");
				return;
			}
        }
        
        gameEngine.app.player().baseCall("reqKent_outCard", KKVS.EnterLobbyID, KKVS.SelectFieldID,
            KKVS.EnterRoomID, KKVS.EnterTableID, KKVS.EnterChairID, cardIs);
    },

    // 重置自己手中的所有的牌为未选中
	recetCardList: function () {
		var self = this;
		self.setAllNoneSelectCard();
		self.isCanPlayCard();
		self.outCardList[0] = [];
    },
    
    isCanPlayCard: function () {
		var self = this;
		var selfCards = [];
		var clen = self.cardList.length;
		for (var i = 0; i < clen; ++i) {
			if (self.cardList[i].isSelect) {
				selfCards.push(self.cardList[i].getComponent(cardfabs).getCardValue());
			}
		}
		if (selfCards.length > 0) {
			self.btnPlay.active = true;
		} else {
			self.btnPlay.active = false;
		}
    },
    
    // 提示
	toTipsCard: function () {
        var self = this;
        cc.log("toTipsCard");
		var objCards = null;
		var selfCards = [];
		self.setAllNoneSelectCard();
		var cardList = self.cardList.slice(0);

		var clen = cardList.length;
		for (var i = 0; i < clen; ++i) {
			selfCards.push(cardList[i].getComponent(cardfabs).getCardValue());
		}
        cc.log("别人出的牌型长度 = " + self.lastCardData.length);
		if (self.lastCardData.length != 0) {
			objCards = [];
			var llen = self.lastCardData.length;
			for (var i = 0; i < llen; ++i) {
				objCards.push(self.lastCardData[i].getComponent(cardfabs).getCardValue());
			}
        }
        if (objCards != null)
            cc.log('目标牌型长度 objCards.length = ' + objCards.length);
        
        var obj = cardTypeUtil.tipsCard(selfCards, objCards, 0);
		if (obj) {
			if (obj.length == 0) {
				self.sendNotPlay();
				return;
			}
		} else {
			self.sendNotPlay();
			return;
		}
        
		var delay = cc.delayTime(0.1);
		var callFunc = cc.callFunc(function () {
			var olen = obj.length;
			for (var p = 0; p < olen; p++) {
				var len = cardList.length;
				for (var i = len - 1; i >= 0; i--) {
					var cType = cardInfo[cardTypeUtil.GetCardColor(obj[p])].cardType;
					var sType = cardList[i].getComponent(cardfabs).getcardColorType();
					if (cType == sType && sType == 5) {
						cardList.splice(i, 1);
					} else if (obj[p] == cardList[i].getComponent(cardfabs).getCardValue()) {
						if (!cardList[i].getComponent(cardfabs).isSelect) {
							cardList[i].getComponent(cardfabs).isReadyToSelect = true;
							cardList[i].getComponent(cardfabs).showByReadySelect();
						}
						cardList.splice(i, 1);
						break;
					}
				}
			}
		});
		self.btnTips.runAction(cc.sequence(delay, callFunc));
		if (obj.length > 0) {
			self.btnPlay.active = true;
		} else {
			self.btnPlay.interactable = false;
		}
	},

    // -- 叫分按钮是否可见
    visibleCallScore: function (mBool) {
        var self = this;
        for (var i = 0; i < self.scoreBtnList.length; ++i) {
            self.scoreBtnList[i].active = mBool;
        }
    },

    // -- 出牌操作按钮是否可见
    visibleOperation: function(mBool) {
        var self = this;
        self.btnPlay.active = mBool;
        self.btnTips.active = mBool;
        self.btnNotPlay.active = mBool;
        self.btnYaoBuQi.active = mBool;
    },

    resettingData: function() {
        var self = this;
        // 清空自己手牌
        self.myCardPanel.removeAllChildren();

        // 清除玩家操作状态
        for (var i = 0; i < 3; ++i) {
            self.m_Chairs[i].unCall.active = false;
            self.m_Chairs[i].unOut.active = false;
            self.m_Chairs[i].CallScore.active = false;
            self.m_Chairs[i].diZhuFlag.active = false;
        }
    },

    // 创建牌背在屏幕中
    showSelfCard: function () {
        cc.log("创建牌背在屏幕中");
        var self = this;

        self.resettingData();

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
        self.m_Chairs[1].cardNumBG.active = true;
        self.m_Chairs[1].cardNum.getComponent(cc.Label).string = "17";

        self.m_Chairs[2].cardNumBG.active = true;
        self.m_Chairs[2].cardNum.getComponent(cc.Label).string = "17";
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
        cc.log("=> leaveGame");
        cc.director.loadScene("Lobby");
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
            self.cardList[i].getComponent(cardfabs).node.setColor(cc.color(255, 255, 255, 255));
        }
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
    callBanker: function (data) {
        var self = this;
        var viewID = Tool.getViewChairID(data.chairID);
        cc.log("viewID = " + viewID + " multiple = " + data.multiple);

        if (viewID == -1)
            return;
        
        var tempViewID = 0;
        if (viewID == 0) {
            tempViewID = 2;
        } else if (viewID == 1) {
            tempViewID = 0;
        } else if (viewID == 2) {
            tempViewID = 1;
        }
        if (data.multiple == 0) {
            self.m_Chairs[tempViewID].unCall.active = true;

        } else if (data.multiple != -1) {

            self.m_Chairs[tempViewID].CallScore.active = true;
            self.m_Chairs[tempViewID].CallScore.getComponent(cc.Label).string = data.multiple.toString();
        }

        if (data.multiple == -1 && viewID != 0) {
            self.showTime(viewID, data.time);
            return;
        }

        for (var i = 0; i < 3; ++i) {
            self.m_Chairs[i].ready.active = false;
            self.m_Chairs[i].clock.active = false;
        }
        
        self.showTime(viewID, data.time);
        if (viewID == 0)
            self.setCallScoreButton(data.multiple);
    },

    // 不可操作的叫分按钮
    setCallScoreButton: function (multiple) {
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
    BankerInfo: function (data) {
        // 地主标识显示
        // 显示地主牌
        // 更新地主手牌数量
        // 更新倍数

        var self = this;
        // 显示地址标识
        var viewID = Tool.getViewChairID(data.chairID);
        self.m_Chairs[viewID].diZhuFlag.active = true;

        // 确定地主后，其余玩家操作标志隐藏
        for (var i = 0; i < 3; ++i) {
            self.m_Chairs[i].unCall.active = false;
            self.m_Chairs[i].unOut.active = false;
            self.m_Chairs[i].ready.active = false;
            self.m_Chairs[i].CallScore.active = false;
            self.m_Chairs[i].clock.active = false;
        }

        // 地主牌显示
        for (var i = 0; i < 3; i++) {
            var cardNode = cc.instantiate(this.pokerCard);
            cardNode.getComponent(cardfabs).setNodeScale(0.46);
            cardNode.getComponent(cardfabs).showPoker(data.dipailist[i], i);
            self.backPoker[i].addChild(cardNode);
        }

        // 更新地主手牌
        if (viewID == 1) {
            self.m_Chairs[1].cardNum.getComponent(cc.Label).string = "20";
        } else if (viewID == 2) {
            self.m_Chairs[2].cardNum.getComponent(cc.Label).string = "20";
        }

        // 更新倍数
        self.multipleText.string = data.multiple.toString();

        self.toPlayCard(data.chairID, 15, data.mustPlay);

        if (KKVS.myChairID == data.chairID) {
            self.insertDiPai(data.dipailist);
        }
    },

    // 自己为地主 - 插入三张底牌
    insertDiPai: function (dipailist) {
        for (var i = 0; i < 3; i++) {
            var cardNode = cc.instantiate(this.pokerCard);
            cardNode.getComponent(cardfabs).setNodeScale(1.2);
            cardNode.getComponent(cardfabs).showPoker(dipailist[i], i);
            self.myCardPanel.addChild(cardNode);
            card.isReadyToSelect = true;
            self.cardList.push(cardNode);
        }
        Tool.sortCardList(self.cardList);
        var len = self.cardList.length;
		var midNum = (len - 1) / 2;
		for (var k = 0; k < len; ++k) {
			var objX = (k - midNum) * self.ghp + self.midPos;
			self.cardList[k].getComponent(cardfabs).node.setPosition(objX + 40, self.ghp * 2 - 140);
			self.cardList[k].getComponent(cardfabs).node.setLocalZOrder(k + 1);
		};
		self.setTopCard();
        self.showAllSelectCard(false);
        var delay = cc.delayTime(2);
		var callfunc = cc.callFunc(function () {
			self.setAllNoneSelectCard();
		});
		self.myCardPanel.runAction(cc.sequence(delay, callfunc));
    },

    // 出牌操作
    toPlayCard: function(chairID, time, mustPlay) {
        var self = this;
        var viewID = Tool.getViewChairID(chairID);
        cc.log("toPlayCard viewID = " + viewID);
        self.visibleCallScore(false);

        for (var i = 0; i < self.outCardList[viewID].length; ++i) {
            if (self.outCardList[viewID][i])
                self.outCardList[viewID][i].removeFromParent();
        }

        self.m_Chairs[viewID].unOut.active = false;

        self.outCardList[viewID] = [];
        if (viewID == 0) {
            self.btnPlay.active = true;
            self.btnNotPlay.active = true;
            self.btnNotPlay.interactable = !mustPlay;
            self.btnTips.active = true;

            var objCards = [];
            var selfCards = [];
            var cardList = self.cardList.slice(0);
            for (var i = 0; i < self.cardList.length; ++i)
                selfCards.push(cardList[i].getComponent(cardfabs).getCardValue());

            if (self.lastCardData.length != 0) {
                for (var i = 0; i < self.lastCardData.length; ++i)
                    objCards.push(self.lastCardData[i].getComponent(cardfabs).getCardValue());
            }

            var obj = cardTypeUtil.tipsCard(selfCards, objCards, 0);
            if (obj && obj.length == 0) {
				cc.log("没有大过上家的牌");
			} else {
                cc.log("打出自己选的牌");
            }
        }

        self.showTime(viewID, time - 1);
    },
    
    // 重新排列自己的牌的位置
	resortCardListPos: function () {
        cc.log("resortCardListPos");
		var self = this;
		var len = self.cardList.length;
		var midNum = (len - 1) / 2;
		var runTime = 0.13;
		for (var i = 0; i < len; i++) {
			var objX = (i - midNum) * self.ghp + self.midPos;
			var moveTo = cc.moveTo(runTime, cc.p(objX + 40, self.ghp * 2 - 140));
			self.cardList[i].setLocalZOrder(i);
			self.cardList[i].runAction(moveTo);
		}
		self.setTopCard();
    },
    
    // 设置最上层的卡牌为最视图最上层
	setTopCard: function () {
		var self = this;
		var len = self.cardList.length;
		if (len == 0) {
			return;
		};
		for (var i = 0; i < len; ++i) {
			self.cardList[i].isTop = i == (len - 1) ? true : false;
		}
		//如果自己的地主自己的最上面一张牌上显示地主
		if (KKVS.myChairID == gameModel.diZhuCharId) {
			self.cardList[self.cardList.length - 1].getComponent(cardfabs).showFlag();
		}
	},

    // 自己出牌
    playSelfCard: function(cardIds, chairID) {
        var self = this;
        cc.log("playSelfCard");

        var viewID = Tool.getViewChairID(chairID);
        if (self.m_Chairs[viewID].clock.active == true)
            self.m_Chairs[viewID].clock.active = false;
        
        if (cardIds.length == 0) {
            self.m_Chairs[viewID].unOut.active = true;
            return;
        }
        if (cardIds.length != 0) {
            self.outCardList[0] = [];
            for (var i = 0; i < cardIds.length; ++i) {
                for (var k = 0; k < self.cardList.length; ++k) {
                    if (cardIds[i] == self.cardList[k].getComponent(cardfabs).getCardId()) {
                        self.outCardList[0].push(self.cardList[k]);
                        self.cardList.splice(k, 1);
                    }
                }
            }
        }

        var cardvalue = [];
        for (var i = 0; i < cardIds.length; ++i) {
            var value = cardTypeUtil.GetCardValue(cardIds[i]);
            var cardType = cardInfo[cardTypeUtil.GetCardColor(cardIds[i])].cardType;
            if (cardType == 0)
                value = value;
            cardvalue.push(value);
        }

        var cardType = cardTypeUtil.getCardType(cardvalue);
        if (cardType == cardTypeUtil.rocketCard) {
			cc.log("cardTypeUtil.rocketCard");
		} else if (cardType == cardTypeUtil.bormCard || cardType > 100) {
			cc.log("cardTypeUtil.bormCard");
		} else if (cardType == cardTypeUtil.planeTakeNoneCard || cardType == cardTypeUtil.planeTakeSingleCard || cardType == cardTypeUtil.planeTakeDoubleCard) {
			cc.log("cardTypeUtil.planeTakeNoneCard");
		} else if (cardType == cardTypeUtil.sequenceCard) {
			cc.log("cardTypeUtil.sequenceCard");
		} else if (cardType == cardTypeUtil.linkDoubleCard) {
			cc.log("cardTypeUtil.linkDoubleCard");
        }
        
        Tool.sortOutCardList(self.outCardList[0], cardfabs);
        var outLen = self.outCardList[0].length;
		var midNum = (outLen - 1) / 2;
		var cardIs = [];
		for (var p = 0; p < outLen; ++p) {
			var objX = (p - midNum) * 40 + self.midPos;
			var moveTo = cc.moveTo(0.05, cc.p(objX, 350));

            self.outCardList[0][p].getComponent(cardfabs).node.setColor(cc.color(255, 255, 255, 255));
			self.outCardList[0][p].getComponent(cardfabs).node.setLocalZOrder(p); //设置坐标
			self.outCardList[0][p].getComponent(cardfabs).node.runAction(moveTo);
			cardIs.push(self.outCardList[0][p].getComponent(cardfabs).getCardId());
        };

        self.visibleOperation(false);
        if (KKVS.myChairID == gameModel.diZhuCharId) {
			if (self.outCardList[0] && self.outCardList[0].length > 0)
				self.outCardList[0][self.outCardList[0].length - 1].getComponent(cardfabs).showDiZhuSign();
		}
        
        Tool.sortCardList(self.cardList);
        self.resortCardListPos();

        gameModel.tipsClickNum = 0;
        self.lastCardData = [];
    },

    // 其它玩家打出牌
	playerPlayCard: function (cardIds, chairID) {
        var self = this;
        var viewID = Tool.getViewChairID(chairID)
        cc.log("playerPlayCard viewID = " + viewID + " cardIds.length = " + cardIds.length);

        for (var i = 0; i < 3; ++i) {
            self.m_Chairs[viewID].unOut.active = false;
        }

        self.m_Chairs[viewID].clock.active = false;

        if (cardIds.length == 0) {
            self.m_Chairs[viewID].unOut.active = true;
            return;
        }

        if (viewID == 1) {
            var newCount = parseInt(self.m_Chairs[1].cardNum.getComponent(cc.Label).string) - cardIds.length;
            self.m_Chairs[1].cardNum.getComponent(cc.Label).string = newCount.toString();
        } else if (viewID == 2) {
            var newCount = parseInt(self.m_Chairs[2].cardNum.getComponent(cc.Label).string) - cardIds.length;
            self.m_Chairs[2].cardNum.getComponent(cc.Label).string = newCount.toString();
        }

        var cardvalue = [];
		var cardIdsLen = cardIds.length;
		for (var i = 0; i < cardIdsLen; ++i) {
			var value = cardTypeUtil.GetCardValue(cardIds[i]);
			var cardType = cardInfo[cardTypeUtil.GetCardColor(cardIds[i])].cardType;
			if (cardType == 0) {
				value = value;
			};
			cardvalue.push(value);
        }
        
        var cardType = cardTypeUtil.getCardType(cardvalue);
		if (cardType == cardTypeUtil.rocketCard) {
			cc.log("2332222");
		} else if (cardType == cardTypeUtil.bormCard || cardType > 100) {
			cc.log("2332111");
		} else if (cardType == cardTypeUtil.planeTakeNoneCard || cardType == cardTypeUtil.planeTakeSingleCard || cardType == cardTypeUtil.planeTakeDoubleCard) {
			cc.log("2332qw");
		} else if (cardType == cardTypeUtil.sequenceCard) {
			cc.log("2332wewe");
		} else if (cardType == cardTypeUtil.linkDoubleCard) {
			cc.log("233223swe");
		}
        cardIds = Tool.toolSortArray(cardIds);
        
        var verCount = 8;
		var len = cardIds.length;
		var panelSize = self.myCardPanel.getContentSize();
		var posS = [panelSize.width - 460, 465];
		var starPos = posS[viewID - 1];
		var frlen = len <= 8 ? len : 8;
		var setaValue = viewID == 1 ? frlen : 0;
		for (var i = 0; i < len; ++i) {
            var card = cc.instantiate(this.pokerCard);
            card.setPosition((i % verCount - setaValue) * 40 + starPos, 500 - Math.floor(i / verCount) * 40);
            self.myCardPanel.addChild(card);
            self.outCardList[viewID].push(card);
            card.getComponent(cardfabs).showPoker(cardIds[i], i);
        }
        self.lastCardData = [];
        self.lastCardData = self.outCardList[viewID];
        gameModel.tipsClickNum = 0;

        if (chairID == gameModel.diZhuCharId) {
			self.outCardList[viewID][self.outCardList[viewID].length - 1].getComponent(cardfabs).showFlag();
		}
    },

    // 结算界面
    endInfo: function (data) {
        var self = this;
        var endNode = cc.instantiate(this.endPrefab);
        endNode.getComponent(endNodePrefab).setData(data, endNode);
        this.node.addChild(endNode, 9999);
    },

    // 断线重连后   更新其余玩家手牌数量
    reInitShouPai: function(data) {
        var self = this;
        for (var i = 0; i < data.length; ++i) {
            var viewID = Tool.getViewChairID(data[i]);
            if (viewID == 1) {
                self.m_Chairs[1].cardNum.getComponent(cc.Label).string = data.User_cards_count[i].toString();
            } else if (viewID == 2) {
                self.m_Chairs[2].cardNum.getComponent(cc.Label).string = data.User_cards_count[i].toString();
            }
        }
    },

    // 断线重连
    onLine_Again: function(data) {
        // 显示自己手牌
        var self = this;
        gameModel.cardData = data.User_cards
        self.showSelfCard();
        self.reInitShouPai(data.User_cards_count);
        gameModel.diZhuCharId = data.zhuang_ID;

        if (Tool.getViewChairID(data.cur_user) == 0 && data.User_cards_count[0] != 0 && data.User_cards_count[1] != 0 && data.User_cards_count[2] != 0) {
            self.visibleOperation(true);
            self.btnNotPlay.interactable = (data.mustPlay == 2) ? false : true;
        }
        self.showTime(Tool.getViewChairID(data.cur_user), 13);

        // 绘制上家扑克
        if (data.outCards != "" && data.userOutCard != 65535 && Tool.getViewChairID(data.userOutCard) != 0) {
            self.drawCard(data.outCards, Tool.getViewChairID(data.userOutCard));
            gameModel.lastCardData = [];
            for (var i in data.outCards) {
                var data = {
                    "cardValue": cardTypeUtil.GetCardValue(data.outCards[i])
                };
                gameModel.lastCardData.push(data);
            }
        } else {
            gameModel.lastCardData = null;
        }

        if (data.cur_user == KKVS.myChairID) {
            if (gameModel.diZhuCharId == 65535) {
                self.visibleCallScore(true);
            } else {
                if (gameModel.lastCardData == null || data.userOutCard == 0) {
                    if (data.User_cards_count[0] != 0 && data.User_cards_count[1] != 0 && data.User_cards_count[2] != 0) {
                        self.visibleOperation(true);
                    }
                    self.btnPlay.interactable = false;
                } else {
                    var objCards = null;
					var selfCards = [];
					var cardList = self.cardList.slice(0);
					var clen = cardList.length;
					for (var i = 0; i < clen; ++i) {
						selfCards.push(cardList[i].getComponent(cardfabs).getCardValue());
                    }
                    // 有上家的牌
                    if (gameModel.lastCardData) {
                        objCards = [];
						var llen = gameModel.lastCardData.length;
						for (var i = 0; i < llen; ++i) {
							objCards.push(gameModel.lastCardData[i].getComponent(cardfabs).getCardValue());
						}
                    }
                }
            }
        }
    },

    drawCard: function (cardIds, viewID) {
        var self = this;
        cc.log("绘制上家扑克");
        var verCount = 8;
		var len = cardIds.length;
		var panelSize = self.myCardPanel.getContentSize();
		var posS = [panelSize.width - 460, 465];
		var starPos = posS[viewID - 1];
		var frlen = len <= 8 ? len : 8;
		var setaValue = viewID == 1 ? frlen : 0;
        var scale = 0.5;
        for (var i = 0; i < len; ++i) {
            var card = cc.instantiate(this.pokerCard);
			card.setScale(scale);
            card.setPosition((i % verCount - setaValue) * 30 + starPos, 500 - Math.floor(i / verCount) * 40);
            card.getComponent(cardfabs).showPoker(cardIds[i], i);
			self.myCardPanel.addChild(card);
			self.outCardList[viewID].push(card);
		}
    },

    addEvent() {
        var self = this;
        self.btnReady.node.on("touchend", self.onBtnReady, this);
        self.btn1.node.on("touchend", self.onBtnOne, this);
        self.btn2.node.on("touchend", self.onBtnSceond, this);
        self.btn3.node.on("touchend", self.onBtnThree, this);
        self.btnScroeNo.node.on("touchend", self.onBtnScroeLess, this);
        self.btnPlay.node.on("touchend", self.onBtnPlay, this);
        self.btnNotPlay.node.on("touchend", self.onBtnNotPlay, this);
        self.btnTips.node.on("touchend", self.onBtnTips, this);
        self.btnYaoBuQi.node.on("touchend", self.onBtnNotPlay, this);

        cc.log("GameUI 注册Kbe事件");
        KKVS.Event.register("playerEnter", this, "playerEnter");
        KKVS.Event.register("showSelfCard", this, "showSelfCard");
        KKVS.Event.register("leaveGame", this, "leaveGame");
        KKVS.Event.register("reconnectionData", this, "reconnectionData");
        KKVS.Event.register("callBanker", this, "callBanker");
        KKVS.Event.register("BankerInfo", this, "BankerInfo");
        KKVS.Event.register("playerPlayCard", this, "playerPlayCard");
        KKVS.Event.register("playSelfCard", this, "playSelfCard");
        KKVS.Event.register("toPlayCard", this, "toPlayCard");
        KKVS.Event.register("EndInfo", this, "endInfo");
        KKVS.Event.register("again", this, "onLine_Again");

    },

    onDestroy() {
        cc.log("GameUI has been destroy");
        KKVS.Event.deregister("playerEnter", this);
        KKVS.Event.deregister("showSelfCard", this);
        KKVS.Event.deregister("leaveGame", this);
        KKVS.Event.deregister("reconnectionData", this);
        KKVS.Event.deregister("callBanker", this);
        KKVS.Event.deregister("BankerInfo", this);
        KKVS.Event.deregister("playerPlayCard", this);
        KKVS.Event.deregister("playSelfCard", this);
        KKVS.Event.deregister("toPlayCard", this);
        KKVS.Event.deregister("EndInfo", this);
        KKVS.Event.deregister("again", this);
    },
});