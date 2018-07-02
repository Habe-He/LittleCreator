var KKVS = require("./../plugin/KKVS");
var gameModel = require("./../game/gameModel");
var Tool = require("./../tool/Tool");

var GameManager = {
    m_pGameRoomView: null,
    m_pGameState: null,
    PlayerCount: 3,

    // ST 转换视图
    getViewChairID: function (nChairID) {
        if (nChairID < this.PlayerCount) {
            return (nChairID - KKVS.myChairID + this.PlayerCount) % this.PlayerCount;
        }
        return -1;
    },

    // ST
    onSeverUserEnter: function (args) {
        KKVS.INFO_MSG("onSeverUserEnter = 用户进入");
        var chairID = args.chairID;
        var playerID = args.playerId;
        var userName = args.nickname;
        var gender = args.gender;
        var gold = args.gold;
        var headID = args.headID;
        var status = args.status;
        var offline = args.offline;
        var vip = args.vip;
        var viewID = this.getViewChairID(args.chairID);
        var data = {
            chairID: chairID,
            playerId: playerID,
            name: userName,
            gold: gold,
            headID: headID,
            status: status,
            offline: offline,
            vip: vip,
            gender: gender,
            beiNum: 1,
            ip: args.ip,
            head_url: args.head_url
        };
        gameModel.playerData[viewID] = data;
        gameModel.isWaiting = true;
        gameModel.isWaitingData.push(viewID);

        // creator 刷新玩家进入
        KKVS.Event.fire("playerEnter", data, viewID);

        // if (this.m_pGameRoomView) {
        //     this.m_pGameRoomView.uiChairUserInfo(data, viewID);
        // } else {
        //     gameModel.isWaiting = true;
        //     gameModel.isWaitingData.push(viewID);
        // }
    },

    // 用户准备
    onSeverReady: function (args) {
        var viewID = this.getViewChairID(args.chairID);
        if (this.m_pGameRoomView && gameModel.playerData[viewID]) {
            gameModel.playerData[viewID].status = 1;
            this.m_pGameRoomView.playerReady(viewID);
        }
    },

    // 开始叫分
    onSeverStartScore: function (args) {
        if (this.m_pGameRoomView) {
            var viewID = this.getViewChairID(args.chairID);
            this.m_pGameRoomView.callScore(viewID, args.timeNum);
        }
    },

    // 服务端返回玩家叫分
    onSeverReturnCallScore: function (args) {
        if (this.m_pGameRoomView == null) {
            console.log("游戏界面未初始化完成");
            return;
        }
        if (args.scoreNum > 0)
            gameModel.scoreNum = args.scoreNum;

        // 当前这个操作是谁记录下来
        for (var m = 0; m < 3; m++) {
            if (typeof gameModel.playerData[m] == 'undefined') {
                break;
            }
            if (gameModel.playerData[m].chairID == args.chairID)
                gameModel.nowPlayer = gameModel.playerData[m];

            // 记录这个玩家翻倍的信息
            if (args.scoreNum > 0) {
                gameModel.playerData[m].beiNum = args.scoreNum;
            }
        };
        var viewID = this.getViewChairID(args.chairID);
        if (typeof gameModel.playerData[viewID] != 'undefined') {
            this.m_pGameRoomView.showScoreValue(viewID, args.scoreNum);
        }
    },

    // 发牌
    onSeverSendCard: function (cardData) {
        gameModel.isInGameStart = true;
        gameModel.cardData = cardData;
        // this.m_pGameRoomView.showSelfCard();
        KKVS.Event.fire("showSelfCard");
    },

    // 出牌广播
    onToPlayCard: function (args) {
        if (this.m_pGameRoomView) {
            var viewID = this.getViewChairID(args.chairID);
            var time = args.time;
            var mustPlay = args.mustPlay;
            this.m_pGameRoomView.toPlayCard(viewID, time, mustPlay);
        }
    },

    // 牌形错误
    onCardError: function (errorType) {
        if (errorType)
            var msg = errorType;
        else
            var msg = '无效牌型';
        if (errorType == 1) {
            msg = "无效牌形";
        } else if (errorType == 2) {
            msg = "不符合游戏规则";
        } else if (errorType == 3) {
            msg = "管不上";
        }
        if (this.m_pGameRoomView) {
            // this.m_pGameRoomView.showTips(msg);
            this.m_pGameRoomView.recetCardList();
        }
    },

    // 确定地主
    onSeverOpenCard: function (args) {
        if (this.m_pGameRoomView) {
            var viewID = this.getViewChairID(args.chairID);
            gameModel.diCardData = args.diData;
            gameModel.diZhuCharId = args.chairID;
            this.m_pGameRoomView.setDiZhuRoleImg(viewID);
            this.m_pGameRoomView.showDiPai(viewID);
            this.m_pGameRoomView.setDiZhuCardNum(viewID);
        }
    },

    // 有玩家出牌
    onPlayerPlayCard: function (args) {
        var viewID = this.getViewChairID(args.chairID);
        var cardIds = args.cardData;
        if (this.m_pGameRoomView) {
            for (var m = 0; m < 3; m++) {
                if (typeof gameModel.playerData[m] == 'undefined')
                    break;

                if (gameModel.playerData[m].chairID == args.chairID) {
                    gameModel.nowPlayer = gameModel.playerData[m];
                }
            }
            if (typeof gameModel.playerData[viewID] != 'undefined') {
                if (args.chairID == KKVS.myChairID) {
                    gameModel.lastCardData = null;
                    this.m_pGameRoomView.playSelfCard(cardIds, viewID, args.chairID);
                    return;
                } else {
                    this.m_pGameRoomView.playerPlayCard(cardIds, viewID, args.chairID);
                }
            }
        }
    },

    setLastArray: function (array) {
        if (this.m_pGameRoomView) {
            this.m_pGameRoomView.setLastCardList(array);
        }
    },

    refreshShouPai: function (cardNum) {
        if (this.m_pGameRoomView)
            this.m_pGameRoomView.refreshShouPai(cardNum);
    },

    // 玩家进入托管
    inTrusteeship: function () {
        if (this.m_pGameRoomView)
            this.m_pGameRoomView.inTrusteeship();
    },

    // 用户离开
    onSeverLeaveTable: function (args) {
        var viewID = this.getViewChairID(args.chairID);
        if (this.m_pGameRoomView) {
            this.m_pGameRoomView.uiChairLeaveTable(viewID);
        };
        if (args.chairID == KKVS.myChairID) {
            if (this.forceLeave) {
                cc.log("=>自己离开");
                this.exitGameWithGold();
            } else {
                this.forceLeave = true;
            }
        }
    },

    // 显示结算界面
    showResultView: function (beishus, scores, times, difen) {
        if (this.m_pGameRoomView) {
            gameModel.isInGameStart = false;
            var data = [];
            for (var i = 0; i < gameModel.playerData.length; ++i) {
                var name = gameModel.playerData[i].name;
                var basescore = difen;
                var chair_id = gameModel.playerData[i].chairID;
                var score = Number(scores[chair_id].toString());
                var p = {
                    "name": name,
                    "basescore": basescore,
                    "times": beishus,
                    "score": score,
                    "chair_id": chair_id
                };
                data.push(p);
            }
            var win_Type = 1;
            var myScore = Number(scores[KKVS.myChairID].toString());
            if (myScore > 0)
                win_Type = 0;

            this.m_pGameRoomView.showResultView(win_Type, myScore, gameModel.diZhuCharId, data);
        }
    },

    // 摊牌
    onSurplusCard: function (args, isSpring) {
        if (this.m_pGameRoomView) {
            var viewID = this.getViewChairID(args.chairID);
            this.m_pGameRoomView.showResultCard(args.cardData, viewID, null, isSpring);
        }
    },

    // 游戏结算数据
    countScore: function (args) {
        if (this.m_pGameRoomView) {
            var viewID = this.getViewChairID(args.chairID);
            if (!gameModel.resultData) {
                gameModel.resultData = {};
            }
            gameModel.isplayIngCard = false;
            gameModel.resultData.diFen = args.diFen;
            gameModel.resultData.beiNum = args.beiNum;
            gameModel.resultData.chairID = args.chairID;
            gameModel.resultData.winType = args.winType;
            gameModel.resultData.isSpring = args.isSpring;
            gameModel.RESULT_TYPE = args.winType;
            this.m_pGameRoomView.showResultFace(args);
        }
    },

    // 叫分翻倍
    onSeverFanBei: function (beiNum) {
        if (this.m_pGameRoomView) {
            this.m_pGameRoomView.setBeiShu(beiNum);
        }
    },

    //强行离开
    onForceleave: function () {
        this.forceLeave = true;
        if (gameEngine && typeof (gameEngine.app) != 'undefined' && gameEngine.app.socket) {
            cc.log("---------请求退出游戏房间-----------");
            gameEngine.app.player().reqLeaveRoom(KKVS.EnterLobbyID, KKVS.SelectFieldID, KKVS.EnterRoomID);
        } else {
            this.exitGame();
        }
    },
    exitGame: function () {
        cc.log("---------exitGame()-----------");
        this.m_pGameRoomView = null;
        gameEngine.destroy();
        if (typeof ComEntry != 'undefined' && typeof (ComEntry.uninstall) == 'function') {
            ComEntry.uninstall();
        }
    },
    exitGameWithGold: function () {
        cc.log("---------离开游戏,断开socket-----------");
        gameEngine.destroy();
        var my_gold = parseInt(KKVS.KGOLD);
        cc.log("myGold=" + my_gold + ", KKVS.MinScore=" + KKVS.MinScore + ", KKVS.MaxScore=" + KKVS.MaxScore);
        if (my_gold >= KKVS.MinScore && (KKVS.MaxScore == 0 || my_gold <= KKVS.MaxScore)) {
            this.exitGame();
        } else {
            var str = my_gold < KKVS.MinScore ? "退出房间，金币少于" + getGoldTxt(KKVS.MinScore) : "退出房间，金币大于" + getGoldTxt(KKVS.MaxScore);
            KKVS.Event.fire("exitByGold", str);
        }
    },
    exitGameMatch: function () {
        cc.log("---------离开比赛,断开socket-----------");
        this.exitGame();
    }
}
module.exports = GameManager;
