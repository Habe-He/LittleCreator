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
        KKVS.INFO_MSG("onSeverUserEnter = 用户进入 name = " + args.nickname);
        KKVS.INFO_MSG("onSeverUserEnter = 用户进入 url = " + args.head_url);
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

        // 断线重连的时候通知 解散界面 用户进入的消息
        KKVS.Event.fire("updateUserDismiss", data);
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

    // 发牌
    onSeverSendCard: function (cardData) {
        gameModel.isInGameStart = true;
        gameModel.cardData = cardData;
        // this.m_pGameRoomView.showSelfCard();
        KKVS.Event.fire("showSelfCard");
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
        // gameEngine.destroy();
        // var my_gold = parseInt(KKVS.KGOLD);
        // cc.log("myGold=" + my_gold + ", KKVS.MinScore=" + KKVS.MinScore + ", KKVS.MaxScore=" + KKVS.MaxScore);
        // if (my_gold >= KKVS.MinScore && (KKVS.MaxScore == 0 || my_gold <= KKVS.MaxScore)) {
        //     this.exitGame();
        // } else {
        //     var str = my_gold < KKVS.MinScore ? "退出房间，金币少于" + getGoldTxt(KKVS.MinScore) : "退出房间，金币大于" + getGoldTxt(KKVS.MaxScore);
        //     KKVS.Event.fire("exitByGold", str);
        // }
    },
    exitGameMatch: function () {
        cc.log("---------离开比赛,断开socket-----------");
        this.exitGame();
    }
}
module.exports = GameManager;
