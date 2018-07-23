var gameEngine = require("./../plugin/gameEngine");
var KKVS = require("./../plugin/KKVS");
var gameModel = require("./../game/gameModel");
var GameManager = require("./../game/GameManager");
var Tool = require("./../tool/Tool");

gameEngine.GamePlayer = gameEngine.Entity.extend({
    __init__: function () {
        this._super();
        this.lobbyList = {};
        this.nFlag = 0;
        this.room_config = {};
        this.bReconnect = false;
        this.baseCall("req_login_game_server", parseInt(KKVS.KBEngineID).toString());

        // 进入游戏场景
    },

    on_login_game: function (ret, ret_msg) {
        KKVS.INFO_MSG("->on_login_game");
        KKVS.INFO_MSG("ret = " + ret.toString());
        if (ret) {
            this.baseCall("reqLobbyList");
        } else {
            var args = {
                eventType: 1002,
                msg: ret_msg,
                pro: null,
                winType: 1
            };
            KKVS.Event.fire("createTips", args);
            TipsBar.showString("登录游戏服务器失败：" + ret_msg);
            KKVS.INFO_MSG("登录游戏服务器失败：" + ret_msg);
        }
    },
    /**
     * 最外层大厅消息
     */
    onLobbyList: function (params) {
        cc.log("onLobbyList msg receive");
        KKVS.INFO_MSG("大厅列表");
        this.bReconnect = true;
        KKVS.EnterRoomID = 1;
        this.reqEnterLobby(2);
    },

    onPlayerData: function (params) {
        cc.log("onPlayerData msg");
        cc.log("params = " + params);
        // logObj(params);
        KKVS.UID = this.id;
        KKVS.GUID = params.guid;
        KKVS.NICKNAME = params.nickname;
        KKVS.GENDER = params.gender;
        KKVS.KGOLD = params.gamemoney;
        KKVS.EXP = params.exp;
        KKVS.VIP = params.vip;
        KKVS.HEAD_URL = params.head_url;
        cc.log("KKVS.HEAD_URL=" + KKVS.HEAD_URL);
        cc.log("KKVS.NICKNAME=" + KKVS.NICKNAME);
        KKVS.GAME_ACC = params.account;
        //cc.director.loadScene("Lobby");
    },

    on_item: function () {
        // [ 
        // {"prop_id": 1050, "prop_count": 100},  // 钻石
        // {"prop_id": 1004, "prop_count": 5000}  
        // ]
        // 1000    小红包抽奖次数  消耗次数可抽奖
        // 1001    中红包抽奖次数  消耗次数可抽奖
        // 1002    大红包抽奖次数 消耗次数可抽奖
        // 1004    红包余额            可提现
        // 1050    钻石|房卡       开房，兑换游戏币
    },


    on_player_msg: function (cmd, datas) {

        // case PLAYER_MSG_ID_REQ_COMPETITIVE_RANKING:
        //     // {'id': 0, 'start': 0, 'end': 0, 'status': 1} //id、
        //     // 注: # id: 季赛ID
        //     // # start: 季赛开始时间戳
        //     // # end: 季赛结束时间戳
        //     // # status: 季赛当前状态  0 未开始, 1 进行中, 2 已结束
        //     break;
        // case PLAYER_MSG_ID_REQ_PLAYER_COMPETITIVE_RANKING:
        //     break;

    },

    onEnterLobby: function (lobbyID, bSuccess, ret_code) {
        cc.log("KKVS.EnterLobbyID = " + KKVS.EnterLobbyID);
        cc.log("KKVS.SelectFieldID = " + KKVS.SelectFieldID);
        KKVS.SelectFieldID = 1;
        cc.log("KKVS.EnterRoomID = " + KKVS.EnterRoomID);
        if (bSuccess) {
            KKVS.EnterLobbyID = lobbyID;
            KKVS.Event.fire("onLoginGameSuccess", 1);
            // KKVS.INFO_MSG("------>onEnterLobby game 3, the room id = " + KKVS.EnterRoomID);
            // this.reqEnterRoom(KKVS.EnterLobbyID, KKVS.SelectFieldID, KKVS.EnterRoomID);
        }
    },

    on_player_game_money_update: function (money) {
        // if (KKVS.GAME_MODEL == 0) {
        //     KKVS.KGOLD = money;
        // }
        cc.log("GamePlayer->>>>on_player_game_money_update money = " + money);
        KKVS.Event.fire("refreshMyScoreDDZ", money);
    },

    on_game_money_update: function (lobbyID, fieldID, roomID, playerID, money) {
        KKVS.INFO_MSG("GamePlayer->>>>on_game_money_update money = " + money);
        KKVS.Event.fire("refreshOtherScoreDDZ", playerID, money);
    },

    on_player_money_update: function (kbao) {
        KKVS.INFO_MSG("GamePlayer->>>>on_player_money_update");
        KKVS.KBAO = kbao;
        KKVS.INFO_MSG("kbao = " + kbao);
        KKVS.Event.fire("refreshKbao");
    },

    /**
     * 单款大厅消息
     */
    onRoomList: function (lobbyID, params) {
        KKVS.INFO_MSG("房间列表");
    },

    onRoomDataChanged: function (lobbyID, fieldID, roomID, playersCount) {
        cc.log("->>>>>>onRoomDataChanged");
        var sKey = lobbyID.toString() + fieldID.toString() + roomID.toString();
        KKVS.RoomPlayerCount[sKey] = playersCount;
        //this.LogRoomPlayerCount.push({lobbyID: lobbyID, fieldID: fieldID, roomID: roomID, playersCount: playersCount});
    },
    /**
     * //////////////////////////////////////////////////////////////////////
     */

    /**
     * 房间消息
     */
    onEnterRoomResult: function (lobbyID, fieldID, roomID, bSuccess, erorStr) {
        KKVS.INFO_MSG("newLand GamePlayer->onEnterRoomResult");
        if (!bSuccess) {

            // var args = {
            //     eventType: 1001,
            //     msg: erorStr,
            //     pro: null,
            //     winType: 1
            // };
            // KKVS.Event.fire("createTips", args);

            // KKVS.Event.fire("createFreeTableFail", args);//请求桌子失败
            var args = {
                eventType: 1002,
                msg: erorStr,
                pro: null,
                winType: 1
            };
            cc.log("erorStr = " + erorStr);
            KKVS.Event.fire("createTips", args);
            KKVS.INFO_MSG("请求房间失败 GamePlayer-> 187 line");
            return;
        }
        KKVS.Event.fire("onEnterRoomResult");
        KKVS.EnterRoomID = roomID;
        KKVS.Event.fire("LoginGameSvrSuccess");
        this.reqEnterTable(KKVS.EnterLobbyID, KKVS.SelectFieldID, KKVS.EnterRoomID);
    },

    onRoomConfig: function (lobbyID, fieldID, roomID, room_config) {
        KKVS.INFO_MSG("->onRoomConfig");
        this.room_config = JSON.parse(room_config);
        var data = this.room_config;
        cc.log("room_config = " + room_config);
        gameModel.baseScore = this.room_config.multiples;
        cc.log("gameModel.baseScore = " + gameModel.baseScore);
        KKVS.GAME_MODEL = data.game_mode;

        gameModel.Bring = data.bring;

        // ST - 2018年4月19日16:16:12

        // var roomData = {
        //     delay: data.delay,
        //     roomTitle: data.extra_config.room_name,
        //     jushu: data.innings,
        //     promotion: data.promotion
        // };
        // gameModel.ComRoomConfig = roomData;

        KKVS.Event.fire("onShowWaitStart", data.delay);
    },

    onTableStatus: function (lobbyID, fieldID, roomID, tableID, tableStatus) {
        KKVS.INFO_MSG("->onTableStatus");
    },
    onPlayerEnterRoom: function (lobbyID, fieldID, roomID, player) {
        KKVS.INFO_MSG("->onPlayerEnterRoom");
    },

    onEnterTable: function (lobbyID, fieldID, roomID, tableID, chairID, playerID) {
        KKVS.INFO_MSG("->onEnterTable");
    },

    onReConnectGameTable: function (lobbyID, fieldID, roomID, tableID, chairID, info) {
        cc.log("onReConnectGameTable");
        if (KKVS.GAME_MODEL == 3) {
            KKVS.EnterLobbyID = lobbyID;
            KKVS.SelectFieldID = fieldID;
            KKVS.EnterRoomID = roomID;
            KKVS.EnterTableID = tableID;
            KKVS.EnterChairID = chairID;
        } else {
            if (!this.bReconnect) {
                return;
            }
            this.bReconnect = false;
            KKVS.Event.fire("onLoginGameSuccess", 2);
            cc.log("########");
            cc.log("GamePlayer::onReConnectGameTable info=" + info);
            cc.log("########");
            cc.log("->onReConnectGameTable  " + info);
            cc.log("table: " + tableID + "/chair: " + chairID)
            KKVS.EnterLobbyID = lobbyID;
            KKVS.SelectFieldID = fieldID;
            KKVS.EnterRoomID = roomID;
            KKVS.EnterTableID = tableID;
            KKVS.EnterChairID = chairID;
            // var roomData = null;
            // for (var i = 0, s = KKVS.RoomListInfo.length; i < s; ++i) {
            //     var field = KKVS.RoomListInfo[i]["field_id"];
            //     if (field == KKVS.SelectFieldID) {
            //         var roomList = KKVS.RoomListInfo[i]["roomList"];
            //         for (var r = 0, l = roomList.length; r < l; ++r) {
            //             if (roomList[r]["room_id"] == KKVS.EnterRoomID) {
            //                 roomData = roomList[r];
            //                 break;
            //             }
            //         }
            //         break;
            //     }
            // }
            // if (!roomData) {
            //     cc.log("GamePlayer::onReConnectGameTable roomData is null");
            //     return;
            // }
            // COM_NAME = roomData.name;
            // if (typeof (COM_NAME_NODE) != 'undefined' && COM_NAME_NODE) {
            //     COM_NAME_NODE.setString(COM_NAME);
            // }
            // KKVS.MinScore = roomData.min_score;
            // KKVS.MaxScore = roomData.max_score;
            // KKVS.GameType = roomData.room_type;
            // KKVS.ServicePay = roomData.service_pay;
            // gameModel.baseScore = roomData.base_score;
        }
        //enter room
        KKVS.Event.fire("reConnectGameSvrSuccess");
        this.reqReConnectGameTable();
    },

    reqReConnectGameTable: function () {
        cc.log(">>reqReConnectGameTable");
        this.baseCall("reqReConnectGameTable", KKVS.EnterLobbyID, KKVS.SelectFieldID, KKVS.EnterRoomID, KKVS.EnterTableID, KKVS.EnterChairID, 1);
    },

    onEnterTableResult: function (lobbyID, fieldID, roomID, tableID, chairID, bSuccess, erorStr) {
        cc.log("onEnterTableResult");

        if (!bSuccess) {
            KKVS.INFO_MSG("进入游戏桌子失败 原因：" + erorStr);
            var args = {
                eventType: 1002,
                msg: erorStr,
                pro: null,
                winType: 1
            };
            //TipsBar.showString("进入游戏桌子失败 原因：" + erorStr);
            KKVS.Event.fire("createTips", args);
            return;
        }

        KKVS.EnterTableID = tableID;
        KKVS.EnterChairID = chairID;
        KKVS.myChairID = chairID;

        KKVS.EnterLobbyID = lobbyID;
        KKVS.SelectFieldID = fieldID;
        KKVS.EnterRoomID = roomID;
        KKVS.Event.fire("onEnterTableResult");
    },

    request_GetReady: function (lobby_id, field_id, room_id, table_id, chair_id) {
        this.baseCall("reqKent_ready", lobby_id, field_id, room_id, table_id, chair_id);
        this.baseCall("reqYves_GameReady", lobby_id, field_id, room_id, table_id, chair_id);
    },

    onLeaveTable: function (lobbyID, fieldID, roomID, tableID, chairID, playerID) {
        cc.log("->onLeaveTable:lobbyID=" + lobbyID + ",fieldID=" + fieldID + ",roomID=" + roomID + ",tableID=" + tableID + ",chairID=" + chairID + ",playerID=" + playerID);
    },

    onPlayerLeaveRoom: function (lobbyID, fieldID, roomID, playerID) {
        cc.log("->onPlayerLeaveRoom");
    },

    // 游戏状态
    onGameStatus: function () {
        var args = arguments;
        cc.log("GamePlayer >> onGameStatus");
        var data = {
            state: args[4]
        };
        if (args[4] == 0)
            gameModel.isInGameStart = false;
        else
            gameModel.isInGameStart = true;
        cc.log("303 gameModel.isInGameStart = " + gameModel.isInGameStart);
        KKVS.Event.fire("onEnterTableResult");
    },

    onHappy_fk_update: function () {
        cc.log("onHappy_fk_update");
    },

    onRoomConfig: function () {
        cc.log("onRoomConfig");
    },



    // ST 用户进入 
    onEnterGameTable: function () {
        cc.log(">> onEnterGameTable 用户进入桌子");
        var args = arguments;
        var data = [];
        var chairID = args[4];
        var v = args[5];
        var ip = typeof (v.ip) != 'string' ? "" : v.ip;
        var head_url = typeof (v.head_url) != 'string' ? "" : v.head_url;
        data = {
            nickname: v.nickname,
            gender: v.gender,
            gold: v.gamemoney,
            headID: v.head_id,
            playerId: v.id,
            status: v.player_status,
            offline: v.is_offline,
            chairID: chairID,
            vip: v.vip,
            ip: ip,
            head_url: head_url
        };
        GameManager.onSeverUserEnter(data);
        KKVS.Event.fire("unShowResult");
    },

    // 用户离开消息
    onLeaveGameTable: function () {
        cc.log("GamePlayer::onLeaveGameTable");
        var args = arguments;
        var chairID = args[4];
        var playerID = args[5];
        var data = {
            chairID: chairID,
            playerID: playerID
        };
        // GameManager.onSeverLeaveTable(data);
    },

    onKent_GameSay: function () { //手机版本与pc版本不同
        var args = arguments;
        var nik = decodeUTF8(args[4]);
        var txt = decodeUTF8(args[5]);
        var param = {
            nickname: nik,
            text: txt
        };
        //cc.log("->onKent_GameSay");
        //logObj(param);
        KKVS.Event.fire("onHunGameSay", param);
    },
    /**
     * 以上服务端回调消息
     * 以下客户端请求消息
     */
    reqEnterLobby: function (lobbyID) {
        this.baseCall("reqEnterLobby", lobbyID);
    },

    reqEnterRoom: function (lobbyID, fieldID, roomID) {
        KKVS.INFO_MSG("reqEnterRoom : lobbyID = " + lobbyID + ", fieldID = " + fieldID + ", roomID = " + roomID);
        this.baseCall("reqEnterRoom", lobbyID, fieldID, roomID);
    },

    reqEnterTable: function (lobbyID, fieldID, roomID, tableID, chairID) {
        KKVS.INFO_MSG("-----> 请求进入游戏桌子");
        this.baseCall("reqEnterTable", lobbyID, fieldID, roomID, 65535, 65535);
    },

    reqLeaveTable: function () {
        var lobbyID = KKVS.EnterLobbyID;
        var fieldID = KKVS.SelectFieldID;
        var roomID = KKVS.EnterRoomID;
        var tableID = KKVS.EnterTableID;
        var chairID = KKVS.EnterChairID;
        this.baseCall("reqLeaveTable", lobbyID, fieldID, roomID, tableID, chairID);
        KKVS.INFO_MSG("player req leave table!");
        KKVS.INFO_MSG("lobbyID = " + lobbyID + ", fieldID = " + fieldID + ", roomID = " + roomID + ", tableID = " + tableID + ", chairID = " + chairID);
    },
    reqLeaveRoom: function (lobbyID, fieldID, roomID) {
        KKVS.INFO_MSG("lobbyID = " + lobbyID + ", fieldID = " + fieldID + ", roomID = " + roomID);
        this.baseCall("reqLeaveRoom", lobbyID, fieldID, roomID);
    },

    reqLeaveLobby: function (lobbyID) {
        KKVS.INFO_MSG("player leave lobby, the lobby id = " + lobbyID);
        this.baseCall("reqLeaveLobby", lobbyID);
    },

    reqGameMsg: function (s, methodname) {
        // var name = s.readBlob();
        // var methodname = KKVS.utf8ArrayToString(name);       KKVS.INFO_MSG("methodname = " + methodname);

        if (methodname == "") {
            KKVS.ERROR_MSG("[reqGameMsg] methodname is null");
            return;
        }
        var method = gameEngine.moduledefs["GamePlayer"].base_methods[methodname];
        var args = method[3];

        var sendData = [];
        for (var i = 0; i < args.length; ++i) {
            sendData.push(args[i].createFromStream(s));
        }
        // for (var i in sendData) {
        //     KKVS.INFO_MSG("sendData[i] = " + sendData[i]);
        // }
        this.gameBaseCall(methodname, sendData);
    },

    ///////
    ////新增消息
    ///////
    // 准备消息

    onKent_UserReady: function () {
        var args = arguments;
        var data = {
            chairID: args[4]
        };
        GameManager.onSeverReady(data);
    },

    onHappy_SendCard: function (lobbyID, fieldID, roomID, tableID, cardList) {
        cc.log("->onHappy_SendCard====");
        // Tool.logObj(cardList);
        // KKVS.IsReconData = false;
        // KKVS.IsShowSelf = false;
        // KKVS.Event.fire("unShow");
        // KKVS.Event.fire("unShowResult");

        gameModel.diZhuCharId = 65535;
        GameManager.onSeverSendCard(cardList);
    },

    onHappy_SendCallBanker: function (lobbyID, fieldID, roomID, tableID, chair_ID, multiple) {
        cc.log("->onHappy_SendCallBanker");

        var data = {
            chairID: chair_ID,
            multiple: multiple,
            time: 10
        };

        KKVS.Event.fire("callBanker", data);
    },

    onHappy_SendBankerInfo: function (lobbyID, fieldID, roomID, tableID, chairID, multiple, dipailist) {
        cc.log("->onHappy_SendBankerInfo");
        var data = {
            chairID: chairID,
            multiple: multiple,
            dipailist: dipailist,
            time: 15,
            mustPlay: true
        };
        gameModel.diZhuCharId = chairID;
        KKVS.Event.fire("BankerInfo", data);
    },

    onHappy_OutCardInfo: function (lobbyID, fieldID, roomID, tableID, chairID, cardlist, type, nowplayID, mustplay, cardNum) {
        cc.log("onHappy_OutCardInfo");
        var cardlist = cardlist;
        if (type == 0)
            cardlist = [];
        if (chairID == KKVS.myChairID) {
            KKVS.Event.fire("playSelfCard", cardlist, chairID);
        } else {
            KKVS.Event.fire("playerPlayCard", cardlist, chairID);
        }

        KKVS.Event.fire("toPlayCard", nowplayID, 15, mustplay);
    },

    onHappy_openCard: function (lobbyID, fieldID, roomID, tableID, cardlist, isSpring) {
        cc.log("->onHappy_openCard====");
        // Tool.logObj(cardlist);
        // for (var i = 0; i < cardlist.length; i++) {
        //     if (i != KKVS.myChairID) {
        //         var data = {
        //             chairID: i,
        //             cardData: cardlist[i]
        //         };
        //         GameManager.onSurplusCard(data, isSpring);
        //     }
        // }
    },

    onHappy_GameEndInfo: function (lobby_id, field_id, room_id, table_id, card_list, scores, times, isspring, difen) {
        cc.log("->onHappy_GameEndInfo====");
        cc.log("=> gameModel.playerData.length" + gameModel.playerData.length);
        Tool.logObj(scores);
        var data = [];
        for (var i = 0; i < gameModel.playerData.length; ++i) {
            var name = gameModel.playerData[i].name;
            var baseScore = difen;
            var chairID = gameModel.playerData[i].chairID;
            var score = Number(scores[i].toString());
            var multiple = times;
            var sData = {
                'name': name,
                'baseScore': baseScore,
                'chairID': chairID,
                'score': score,
                'multiple': multiple
            };
            data.push(sData);
        }

        KKVS.Event.fire("EndInfo", data);

        // var args = arguments;
        // KKVS.IsShowSelf = false;
        // var beishu = args[6];
        // // 显示结算界面
        // GameManager.showResultView(beishu, score, times, difen);

        // if (score.length == 0) {
        //     cc.log("结算时候分数长度为 0 这个是错误的");
        //     return;
        // }

        // for (var i = 0; i < score.length; ++i) {
        //     cc.log(" fenshu = " + score[i])
        // }
        // cc.log("gameModel.diZhuCharId = " + gameModel.diZhuCharId);
        // // 结算表情
        // if (Number(score[gameModel.diZhuCharId].toString()) > 0)
        //     var winType = true;
        // else
        //     var winType = false;

        // var spring = 0;
        // if (isspring == 2)
        //     spring = 1; //是否春天
        // else
        //     spring = 0;

        // var oData = {
        //     diFen: 0,
        //     beiNum: beishu,
        //     chairID: KKVS.myChairID,
        //     winType: winType,
        //     isSpring: spring,
        //     score: score
        // };
        // GameManager.countScore(oData);
    },

    onHappy_GameErrInfo: function (lobbyID, fieldID, roomID, tableID, msginfo) {
        cc.log("->onHappy_GameErrInfo==== msginfo = " + msginfo);
        if (gameModel.nowplayID == KKVS.myChairID) {
            GameManager.onCardError(msginfo);
        }
    },

    send_LeaveTable: function (lobbyID, fieldID, roomID, tableID, chair_id) {
        cc.log("->send_LeaveTable====");
        if (chair_id == KKVS.EnterChairID) {
            KKVS.Event.fire("leaveGame");
        } else {
            var data = {
                chairID: chair_id
            };
            // GameManager.onSeverLeaveTable(data);
        }
    },

    onKent_tick: function (lobbyID, fieldID, roomID, tableID, chair_id) {
        cc.log("->onKent_tick====");
        if (chair_id == KKVS.EnterChairID) {
            // cc.log("自己被踢出桌子 -- 注释");
            KKVS.Event.fire("leaveGame");
        } else {
            cc.log("别的玩家被踢出桌子");
            var data = {
                chairID: chair_id
            };
            // GameManager.onSeverLeaveTable(data);
        }
    },

    req_room_msg: function (type, datas) {
        cc.log("->req_room_msg====");
        this.baseCall("req_room_msg", type, datas);
    },

    onHappy_Again: function () {
        cc.log("->onHappy_Again====");
        var args = arguments;
        // Tool.logObj(args);
        var data = {
            lobbyID: args[0],
            FieldID: args[1],
            Room_ID: args[2],
            TableID: args[3],
            User_State: args[4], // 桌子状态
            User_cards: args[5],
            User_cards_count: args[6],
            zhuang_beishu: args[7],
            cur_user: args[8],
            zhuang_ID: args[9], // 地主椅子号
            outCards: args[10],
            mustplay: args[11],
            zhuangBei: args[12],
            boomCount: args[13],
            rockCount: args[14],
            diZhuMoreCard: args[15],
            userOutCard: args[16]
        };

        KKVS.Event.fire("again", data);

        // gameModel.reConnectData = reData;

        // // 显示其它玩家剩下的牌 4 = 游戏结束
        // if (args[4] != 5) {
        //     for (var i = 0; i < args[6].length; i++) {
        //         var chairID = i;
        //         var cardData = args[6][i];
        //         var data = {
        //             chairID: chairID,
        //             cardData: cardData
        //         };
        //         KKVS.RRECON_PAICOUNT.push(data);
        //     }
        //     args[5] = [55, 53];
        //     gameModel.cardData = args[5];
        //     KKVS.DiZhuPai = args[15];
        // }
        // KKVS.IsReconData = true;
        // KKVS.Event.fire("reconnectionData", reData);
    },

    onHappy_Trusteeship: function (lobbyID, fieldID, roomID, tableID) {
        cc.log("->onHappy_SendCallBanker====");
        // GameManager.inTrusteeship();
        this.baseCall("reqKent_Trusteeship", lobbyID, fieldID, roomID, tableID, 1);
    },

    on_room_msg: function (type, args) {
        cc.log("->ST on_room_msg args ==== " + args);
        cc.log("->ST on_room_msg type ==== " + type);
        var datas = JSON.parse(args);
        if (type == ROOM_MSG_ID_JOIN_ROOM) {
            if (!datas.success) {
                cc.log("加入比赛房间失败 【" + datas.code + "】");
                if (typeof KKVS.MatchData == 'object' && typeof KKVS.MatchData[datas["MatchID"]] != 'undefined') {
                    KKVS.MatchData[datas["MatchID"]] = null;
                }
                var args = {
                    eventType: 3,
                    msg: "加入比赛房间失败 【" + datas.code + "】",
                    pro: datas,
                    winType: 1
                };
                KKVS.Event.fire("createTips", args);
            }
        } else if (type == ROOM_MSG_ID_MATCH_PROMOTION) {
            KKVS.Event.fire("onMatchPromotion", datas);
            KKVS.Event.fire("updateBaseScore", datas.promotion_rank);
        } else if (type == ROOM_MSG_ID_MATCH_MY_RANK_UPDATE) {
            KKVS.Event.fire("onMatchMyRank", datas);
        } else if (type == ROOM_MSG_ID_MATCH_TABLE_NOT_FINISH_COUNT) {
            KKVS.Event.fire("onMatchLeftTable", datas.left)
        } else if (type == ROOM_MSG_ID_MATCH_CUR_RANK) {
            KKVS.Event.fire("onMatchShowRank", datas);
        } else if (type == ROOM_MSG_ID_MATCH_ELIMILATE_UPDATE) {
            KKVS.Event.fire("onMatchUpdateLine", datas);
        }
    },

    ////////////
    // 新增红包消息
    ////////////

    on_task_get: function () {
        cc.log('on_task_get');
        var args = arguments;
        Tool.logObj(args);
        // var info = JSON.parse(args[3]);
        var task_info = {
            'task_id': args[0],
            'progress': args[1],
            'total': args[2]
        };
        KKVS.Event.fire("onGameTaskInfo", task_info);
    },

    on_task_progress: function () {
        cc.log('on_task_progress');
        var args = arguments;
        Tool.logObj(args);
        var data = {
            task_id: args[0],
            progress: args[1]
        };
        KKVS.Event.fire("onGameTaskUpdate", data);
    },

    on_task_award: function () {
        cc.log('on_task_award')
        var args = arguments;
        Tool.logObj(args);
        var data = {
            task_id: args[0],
            award_id: args[1],
            award_num: args[2]
        };
        KKVS.Event.fire("onGameTaskFinished", data);
    },

    // 房卡模式新增 消息
    // room_id 房间号
    onHappy_fk_update: function (lobbyID, fieldID, roomID, tableID, scores, zongJuShu, curJuShu, difen, beishu, room_id) {
        cc.log("newLand GamePlayer->onHappy_fk_update");
        var args = arguments;
        // logObj(args);

        for (var i = 0; i < scores.length; ++i) {
            cc.log(i + " jinbi = " + scores[i]);
        }

        var data = {
            scores: scores,
            zongJuShu: zongJuShu,
            curJuShu: curJuShu,
            difen: difen,
            beishu: beishu,
            room_id: room_id
        };
        KKVS.Event.fire("onHappyFuckUpdate", data);
    },

    onHappy_fk_finish: function (lobbyID, fieldID, roomID, tableID, rocks, booms, springs, fanSprings, scores, fangzhu, fanghao, time, names) {
        cc.log("newLand GamePlayer->onHappy_fk_finish");
        var args = arguments;
        // logObj(args);

        var data = {
            rocks: rocks,
            booms: booms,
            springs: springs,
            fanSprings: fanSprings,
            scores: scores,
            fangzhu: fangzhu,
            fanghao: fanghao,
            time: time,
            names: names
        };
        KKVS.Event.fire("onHappyFuckFinish", data);
    },

    on_game_info: function (roomNumber) {
        // body...
        KKVS.COM_ROOM_NUMBER = roomNumber;
        // cc.log("@@@COM_ROOM_NUMBER = " + COM_ROOM_NUMBER);
        // this.bReconnect = true;
        // KKVS.EnterLobbyID = 6;
    },

    req_start_game: function (id) {
        cc.log("req_start_game KKVS.EnterLobbyID = " + KKVS.EnterLobbyID);
        cc.log("req_start_game KKVS.SelectFieldID = " + KKVS.SelectFieldID);
        cc.log("req_start_game KKVS.EnterRoomID = " + KKVS.EnterRoomID);

        this.reqEnterRoom(KKVS.EnterLobbyID, KKVS.SelectFieldID, KKVS.EnterRoomID);
    },

    onHappy_OffLine: function () {

    },
});