var KBEngine = require("./kbengine");
var KKVS = require("./KKVS");

KBEngine.Player = KBEngine.Entity.extend({
    __init__: function () {
        this._super();
        this.lobbyList = {};
        this.nFlag = 0;
        //this.LogRoomPlayerCount = [];
        //KBEngine.Event.fire("onLoginSuccessfully", KBEngine.app.entity_uuid, this.id, this);
        KKVS.KBEngineID = this.id;
        this.baseCall("reqLobbyList");
    },
    
    onSay: function(lobbyID, fieldID, roomID, tableID, playerID, text) {
        KKVS.INFO_MSG(text);
        if (lobbyID == 250) {
            var newTxt = text.split("|");
            var nickname = newTxt[0];
            var txt = newTxt[1];
            KKVS.HornNotice.push({"nickname": nickname, "datas": txt});
        }
    },
    
    // 公告
    on_notice: function(id, txt) {
        // KKVS.INFO_MSG("公告消息 id = " + id + ", txt = " + txt);
        KKVS.SystemNotice.push({"id": id, "txt": txt});
    },
    
    /**
     * 最外层大厅消息
     */
    onLobbyList: function (params) {
        KKVS.INFO_MSG("大厅列表");
        this.lobbyList = params;
        KKVS.INFO_MSG("Player::onLobbyList: Lobby size = " + this.lobbyList.length);
        for (var i = 0; i < this.lobbyList.length; i++) {
            var lobby = this.lobbyList[i];
            KKVS.INFO_MSG("Player::onLobbyList : id = " + lobby.id + ", name = " + lobby.name);
        }
        this.reqEnterLobby(2);
    },
    
    onPlayerData: function(params) {
        cc.log("->onPlayerData");
        KKVS.UID = this.id;
        KKVS.GUID = params.guid;
        KKVS.NICKNAME = params.nickname;
        // KKVS.KGOLD = params.gamemoney;
        KKVS.INFO_MSG("kb = " + params.gamemoney);
        KKVS.EXP = params.exp;
        KKVS.VIP = params.vip;
        KKVS.FACEID = params.head_id;
        KKVS.KBAO = params.money;
        KKVS.KGOLD_BANK = parseInt(params.money_bank);
        KKVS.UPWD = params.pwd;
        KKVS.UBMOB = params.bind_mob;
        KKVS.HEAD_URL = params.head_url;
        //KKVS.BANK_PWD = params.bank_pwd;
        KKVS.EXCHANGE_SIGN = params.exchange_sign;
        //KKVS.Event.fire(CHANGE_VIEW, 1);
        //KKVS.MailCount = params.mail_count;
        KKVS.GUIDE_FLAG = params.player_flags;
        KKVS.GAME_ACC = params.account;
        //if (parseInt(KKVS.KBAO) > 0) {
        //    this.exchange_k_bao_lb(parseInt(KKVS.KBAO), "", 0);
        //}
    },
    
    onEnterLobby: function(lobbyID, bSuccess, ret_code) {
        if (bSuccess) {
            KKVS.EnterLobbyID = lobbyID;
            
            KKVS.Event.fire("onLoginSuccess");
            KKVS.INFO_MSG("Player->onEnterLobby");
        }
    },
    
    on_player_game_money_update: function(money) {
        // KKVS.KGOLD = money;
        KKVS.Event.fire("refreshMyScore");
    },

    on_game_money_update_mobile: function(playerID, money) {
        KKVS.INFO_MSG("Player->>>>on_game_money_update_mobile");
        KKVS.Event.fire("refreshOtherScore", playerID, money);
    },

    on_player_money_update: function(kbao) { //afei20160727
        KKVS.INFO_MSG("Player->>>>on_player_money_update");
        KKVS.KBAO = kbao;
        KKVS.INFO_MSG("kbao = " + kbao);
        KKVS.Event.fire("refreshKbao");
    },
    on_box_record: function(sub_count, box_index_1, box_index_2) {
        KKVS.INFO_MSG("on_box_record sub_count = " + sub_count + ", box_index_1 = " + box_index_1 + ", box_index_2 = " + box_index_2);
        KKVS.BoxData = {sub_count: sub_count, box1: box_index_1, box2: box_index_2}
        KKVS.Event.fire("on_box_record");
    },
    
    on_box_result: function(bSuccess, prizes_id) {
        KKVS.INFO_MSG("on_box_result bSuccess = " + bSuccess + ", game_money = " + prizes_id);
        if (bSuccess) {
            KKVS.Event.fire("on_box_result", prizes_id);
        }
    },
    /**
     * //////////////////////////////////////////////////////////////////////
     */
    
    /**
     * 单款大厅消息
     */
    onRoomList: function(lobbyID, params) {
        KKVS.INFO_MSG("房间列表");
        //for (var i = 0; i < params.length; i++) {
        //    var field = params[i];
        //    KKVS.INFO_MSG("Field : id = " + field.id + " name = " + field.name + " rooms_count = " + field.roomList.length);
        //    for (var j = 0; j < field.roomList.length; j++) {
        //        var room = field.roomList[j];
        //        KKVS.INFO_MSG("Room : id = " + room.id + " name = " + room.name + " players_count = " + room.players_count + " status = " + room.status);
        //    }
        //}
        // if (ChannelName == "kkvs") {
        //     GameData.Lobby.EnterLobbyID = lobbyID;
        //     GameData.Lobby.setRoomList(params);
        //     KKVS.Event.fire("ShowRoomList", params);
        // } else if (ChannelName == "originating") {
        //     KKVS.INFO_MSG("you need send this msg to c++ pipe buffer list");
        // }
    },
    onRoomDataChanged: function(lobbyID, fieldID, roomID, playersCount) {
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
    onEnterRoomResult: function(lobbyID, fieldID,roomID, bSuccess, erorStr) {
        KKVS.INFO_MSG("->onEnterRoomResult");
        if(!bSuccess) {
            // if (ChannelName == "kkvs") {
            //     KKVS.ERROR_MSG("join the lobbyID : " + lobbyID + " fieldID : " + fieldID + " roomID : " + roomID + " is failed! " + "error: " + erorStr)
            // } else if (ChannelName == "originating") {
            //     KKVS.ERROR_MSG("[onEnterRoomResult] you need merge errmsg and show");
            // }
            var args = {eventType: 1, msg: erorStr, pro: null, winType: 1};
            KKVS.Event.fire("createTips", args);
            
            KKVS.Event.fire("createFreeTableFail", args);//请求桌子失败
            return;
        }
        KKVS.EnterRoomID = roomID;
        
        // if (fieldID == 5 && lobbyID == 1)
        // {
        //     KKVS.Event.fire("createFreeTable", 1);
        //     KKVS.INFO_MSG("this is create free teable!!!!");
        //     return;
        // }
        
        this.reqEnterTable(KKVS.EnterLobbyID, KKVS.SelectFieldID, KKVS.EnterRoomID);
        // var params = {lobby_id : lobbyID, field_id : fieldID, room_id : roomID};
        // KKVS.Event.fire("EnterRoom", params);
    },
    
    onRoomConfig: function(lobbyID, fieldID, roomID, room_config) {
        KKVS.INFO_MSG("->onRoomConfig");
        // if (ChannelName == "kkvs") {
        //     KKVS.INFO_MSG("房间配置");
        //     KKVS.INFO_MSG("lobbyID = " + lobbyID + ", fieldID = " + fieldID + ", room_id = " + roomID + ", room_config : " + " [ " + room_config.max_table + " ," + room_config.max_chair + " ," + room_config.room_type + " ]");
        //     GameData.setRoomConfig(lobbyID, fieldID, roomID, room_config);
        // } else if (ChannelName == "originating") {
        //     KKVS.INFO_MSG("[onRoomConfig] you need merge pipe buffer to c++ and send to single lobbyexe");
        // }
    },
    onTableStatus: function(lobbyID, fieldID, roomID, tableID, tableStatus) {
        KKVS.INFO_MSG("->onTableStatus");
        // if (ChannelName == "kkvs") {
        //     KKVS.INFO_MSG("桌子状态");
        //     KKVS.INFO_MSG("lobbyID = " + lobbyID + ", fieldID = " + fieldID + ", roomID = " + roomID + ", tableID =  " + tableID + " table_status = " + tableStatus);
        //     GameData.setRoomTable_status(lobbyID, fieldID, roomID, tableID, tableStatus);
        //     var params = {lobby_id : lobbyID, field_id : fieldID, room_id : roomID, table_id : tableID, table_status : tableStatus};
        //     KKVS.Event.fire("TableStatus", params);
        // } else if (ChannelName == "originating") {
        //     KKVS.INFO_MSG("[onTableStatus] you need merge pipe buffer to c++ and send to single lobbyexe");
        // }
    },
    onPlayerEnterRoom: function(lobbyID, fieldID, roomID, player) {
        KKVS.INFO_MSG("->onPlayerEnterRoom");
        // if (ChannelName == "kkvs") {
        //     this.nFlag = this.nFlag + 1;
        //     KKVS.INFO_MSG("lobbyID: " + lobbyID + ", fieldID: " + fieldID + ", roomID: " + roomID);
        //     KKVS.INFO_MSG("Player No: " + this.nFlag + ", id: " + player.id + ", name: " + player.nickname + ", kb: " + parseInt(player.gamemoney, 16) + ", faceID: " + player.head_id);
        //     GameData.addRoomPlayer(lobbyID, fieldID, roomID, player);
        // } else if (ChannelName == "originating") {
        //     KKVS.INFO_MSG("[onPlayerEnterRoom] you need merge pipe buffer to c++ and send to single lobbyexe");
        // }
    },
    
    onEnterTable: function(lobbyID, fieldID, roomID, tableID, chairID, playerID) {
        KKVS.INFO_MSG("->onEnterTable");
        // if (ChannelName == "kkvs") {
        //     KKVS.INFO_MSG("[onEnterTable] lobbyID: " + lobbyID + ", fieldID: " + fieldID + ", roomID: " + 
        //         roomID + ", talbeID: " + tableID + ", chairID: " + chairID + ", playerID: " + playerID);
        //     GameData.setRoomPlayer_enterTable(lobbyID, fieldID, roomID, tableID, chairID, playerID);
        //     var params = {lobby_id : lobbyID, field_id : fieldID, room_id : roomID, table_id : tableID, chair_id : chairID, player_id : playerID};
        //     KKVS.Event.fire("EnterTable", params);
        // } else if (ChannelName == "originating") {
        //     KKVS.INFO_MSG("[onEnterTable] you need merge pipe buffer to c++ and send pipe msg to single lobbyexe");
        // }
    },
    
    onEnterTableResult: function(lobbyID, fieldID, roomID, tableID, chairID, bSuccess, erorStr) {
        KKVS.INFO_MSG("newLand Player->onEnterTableResult");

        if (!bSuccess) {
            KKVS.INFO_MSG("进入游戏桌子失败 原因：" + erorStr);
            var args = {eventType: 1, msg: erorStr, pro: null, winType: 1};
            KKVS.Event.fire("createTips", args);
            return;
        }
        KKVS.EnterTableID = tableID;
        KKVS.EnterChairID = chairID;
        KKVS.myChairID = chairID;
      
        KKVS.EnterLobbyID = lobbyID;
        KKVS.SelectFieldID = fieldID;
        KKVS.EnterRoomID = roomID;    
        if(fieldID == 4) {
            KKVS.Event.fire(EVENT_SHOW_VIEW, {viewID : SCENE_ID_HUNTABLE});
        }else {
            KKVS.Event.fire(EVENT_SHOW_VIEW, {viewID : SCENE_ID_TABLE});
        }
    },

    onLeaveTable: function(lobbyID, fieldID, roomID, tableID, chairID, playerID) {
        cc.log("->onLeaveTable:lobbyID=" + lobbyID + ",fieldID=" + fieldID + ",roomID=" + roomID + ",tableID=" + tableID + ",chairID=" + chairID + ",playerID=" + playerID);
            // if (ChannelName == "kkvs") {
            //     KKVS.INFO_MSG("[onLeaveTable] you need delete this player from table ui");
            //     GameData.setRoomPlayer_leaveTable(lobbyID, fieldID, roomID, tableID, chairID, playerID);
            //     var params = {lobby_id : lobbyID, field_id : fieldID, room_id : roomID, table_id : tableID, chair_id : chairID, player_id : playerID};
            //     KKVS.Event.fire("LeaveTable", params);
            // } else if(ChannelName == "originating") {
            //     KKVS.INFO_MSG("[onLeaveTable] you need merge this msg to c++ and send pipe msg");
            // }
    },
    // onLeaveRoom: function(lobbyID, fieldID, roomID, playerID) {
    //     cc.log("->onLeaveRoom");
    //        if (ChannelName == "kkvs") {
    //           KKVS.INFO_MSG("[onLeaveRoom] you need delete this player from room playerList");
    //        } else if(ChannelName == "originating") {
    //            KKVS.INFO_MSG("[onLeaveRoom]  you need merge this msg to c++ and send pipe msg");
    //        }
    //},
    onPlayerLeaveRoom: function(lobbyID, fieldID, roomID, playerID) {
        cc.log("->onPlayerLeaveRoom");
        // if (ChannelName == "kkvs") {
        //     KKVS.INFO_MSG("[onPlayerLeaveRoom] lobbyID: " + lobbyID + ", fieldID: " + fieldID + ", roomID: " +
        //         roomID + ", playerID: " + playerID);
        //     KKVS.INFO_MSG("[onPlayerLeaveRoom] you need delete this player from room playerList");
        //     GameData.delRoomPlayer(lobbyID, fieldID, roomID, playerID);
        // } else if(ChannelName == "originating") {
        //     KKVS.INFO_MSG("[onPlayerLeaveRoom]  you need merge this msg to c++ and send pipe msg");
        // }
    },
    on_sign_record: function(days, can_check) {
        KKVS.INFO_MSG("on_sign_record : " + days + ", " + can_check);
        KKVS.CheckInData = {days: days, can_check: can_check};
        KKVS.Event.fire("on_sign_record", {days: days, can_check: can_check});
    },
    
    on_sign_result: function(bSuccess) {
        KKVS.INFO_MSG("on_sign_result : " + bSuccess);
        KKVS.Event.fire("on_sign_result", bSuccess);
    },
    
    on_turntable_record: function(can_turn) {
        KKVS.INFO_MSG("on_turntable_record : " + can_turn);
        KKVS.TurntableData = {can_turn: can_turn};
        KKVS.Event.fire("on_turntable_record", can_turn);
    },
    
    on_turntable_result: function(bSuccess, prizes_id, rotate) {
        KKVS.INFO_MSG("on_turntable_result : rotate = " + rotate + ", prizes_id = " + prizes_id);
        if (bSuccess) {
            KKVS.Event.fire("on_turntable_result", prizes_id, rotate);
        }
    },
    //onSay: function(lobbyID, fieldID, roomID, tableID, playerID, text) {
    //    //KKVS.INFO_MSG("onSay : lobbyID = " + lobbyID + ", fieldID = " + fieldID + ", roomID = " + roomID + ", tableID = " + tableID + ", playerID = " + playerID);
    //    //KKVS.INFO_MSG("onSay : text = " + text);
    //    var param = {playerID : playerID, text : text};
    //    KKVS.Event.fire("onHunGameSay", param);
    //},  
    exchange_k_bao: function(num, pwd) {
        KKVS.INFO_MSG("num = " + num);
        KKVS.INFO_MSG("pwd = " + pwd);
        KKVS.INFO_MSG("guid = " + KKVS.GUID.toString(16));
        KKVS.INFO_MSG("KKVS.MAC_ADDRESS = " + KKVS.MAC_ADDRESS);
        this.baseCall("exchange_k_bao", KKVS.GUID.toString(16), hex_md5(pwd), parseInt(num), KKVS.MAC_ADDRESS);
    },

     /**
     * //////////////////////////////////////////////////////////////////////
     */
    
    //游戏消息
    //onGameMessage: function(methodname, args, argsdata) { //->afei
    //    KKVS.INFO_MSG("recv game message : " + methodname);
    //    RecvManager.handleGameMsg(methodname, args);
    //},
    /**
     * 以上服务端回调消息
     * 以下客户端请求消息
     */
    reqEnterLobby: function(lobbyID) {
        this.baseCall("reqEnterLobby", lobbyID);
    },
    
    reqEnterRoom: function(lobbyID, fieldID, roomID) {
        KKVS.INFO_MSG("reqEnterRoom : lobbyID = " + lobbyID + ", fieldID = " + fieldID + ", roomID = " + roomID);
        this.baseCall("reqEnterRoom", lobbyID, fieldID, roomID);
    },
    
    reqEnterTable: function(lobbyID, fieldID, roomID, tableID, chairID) {
        KKVS.INFO_MSG("-----> 请求进入游戏桌子");
        this.baseCall("reqEnterTable", lobbyID, fieldID, roomID, 65535, 65535);
    },
    
    reqLeaveTable: function() {
        var lobbyID = KKVS.EnterLobbyID;
        var fieldID = KKVS.SelectFieldID;
        var roomID = KKVS.EnterRoomID;
        var tableID = KKVS.EnterTableID;
        var chairID = KKVS.EnterChairID;
        this.baseCall("reqLeaveTable", lobbyID, fieldID, roomID, tableID, chairID);
        KKVS.INFO_MSG("player req leave table!");
        KKVS.INFO_MSG("lobbyID = " + lobbyID + ", fieldID = " + fieldID + ", roomID = " + roomID + ", tableID = " + tableID + ", chairID = " + chairID);
    },
    reqLeaveRoom: function(lobbyID, fieldID, roomID) {
        KKVS.INFO_MSG("lobbyID = " + lobbyID + ", fieldID = " + fieldID + ", roomID = " + roomID);
        this.baseCall("reqLeaveRoom", lobbyID, fieldID, roomID);
    },
    
    reqLeaveLobby: function(lobbyID) {
        KKVS.INFO_MSG("player leave lobby, the lobby id = " + lobbyID);
        this.baseCall("reqLeaveLobby", lobbyID);
    },
    
    req_sign_record: function() {
        KKVS.INFO_MSG("req_sign_record");
        this.baseCall("req_sign_record");
    },
    
    req_sign: function() {
        KKVS.INFO_MSG("req_sign");
        this.baseCall("req_sign");
    },

    req_turntable_record: function() {
        KKVS.INFO_MSG("req_turntable_record");
        this.baseCall("req_turntable_record");
    },
    
    req_turntable: function() {
        KKVS.INFO_MSG("req_turntable");
        this.baseCall("req_turntable");
    },
    req_say : function(txt, type) {
        if (type == 250) {
            this.baseCall("req_say", 250, 250, 250, 65535, txt);
            return
        }
        this.baseCall("req_say", KKVS.EnterLobbyID, KKVS.SelectFieldID, KKVS.EnterRoomID, KKVS.EnterTableID, txt);
    },
    reqGameMsg: function(s, methodname) {
        // var name = s.readBlob();
        // var methodname = KKVS.utf8ArrayToString(name);		KKVS.INFO_MSG("methodname = " + methodname);

        if (methodname == "") {
            KKVS.ERROR_MSG("[reqGameMsg] methodname is null");
            return;
        }
        var method = KBEngine.moduledefs["Player"].base_methods[methodname];
        var args = method[3];

        var sendData = [];
        for (var i = 0; i < args.length; ++i) {
            sendData.push(args[i].createFromStream(s));
        }
        for (var i in sendData) {
            // KKVS.INFO_MSG("sendData[i] = " + sendData[i]); 
        }
        this.gameBaseCall(methodname, sendData);
    },

    reqMdBankPwd: function(pwd, pwdNew) {
        this.baseCall("md_bank_p", pwd, pwdNew);
    },
    reqSaveBank: function(money) {
        var betNum = parseInt(money).toString(16);
        this.baseCall("save_bank_m", betNum);
    },
    reqTakeBank: function(money, pwd) {
        var betNum = parseInt(money).toString(16);
        this.baseCall("take_bank_m", betNum, pwd);
    },
    opt_ret : function (code, msg) {
        cc.log("收到错误消息  msg = " + msg);
        var args = {code: code, msg: msg};
        KKVS.Event.fire("opt_ret", args);
    },
    //道具列表
    req_prop_list : function () {
        this.baseCall("req_prop_list");
    },
    on_prop_list : function (dataSet) {
        KKVS.PropList = dataSet;
        KKVS.Event.fire("on_prop_list");
        KKVS.Event.fire("on_prop_list_Horn");
    },
    //个人资料
    req_profile : function () {
        this.baseCall("req_profile");
    },
    on_profile : function (qq, wx, rm, sign) {
        KKVS.Event.fire("on_profile", qq, wx, rm, sign);
    },
    req_modify_profile : function(qq, wx, rm, sign) {
        this.baseCall("req_modify_profile", qq, wx, rm, sign);
    },
    //玩家资料
    req_query_profile : function (dbid) {
        cc.log("->req_query_profile, dbid = " + dbid);
        this.baseCall("req_query_profile", dbid.toString(16));
    },
    on_query_profile : function (id, qq, wx, rm, sign) {
        KKVS.Event.fire("on_query_profile", id, qq, wx, rm, sign);
    },
    //新手完成
    req_end_greenhand : function () {
        this.baseCall("req_end_greenhand");
    },
    //请求邮件
    req_opt_mail : function(type, id, cdk){
        this.baseCall("req_opt_mail", type, parseInt(id).toString(16), cdk);
    },
    //邮件(邮件ID， 标题 ， 类容， 类型（0只读 1可领取），状态（0未领取 1已领取）)
    on_mail_box_info : function(id, title, content, type, tatus){
        var data = {id: id, title: title, content: content, type: type, tatus: tatus};
        KKVS.Event.fire("on_mail_box_info", data);
    },
    //邮件操作返回
    on_opt_mail : function (finish, id, tatus) {
        var data = {finish: finish, id: id, tatus: tatus};
        KKVS.Event.fire("on_opt_mail", data);
    },
    on_mail_count : function(mailCount){
        KKVS.INFO_MSG("邮件数量 = " + mailCount);
        //邮件数量
        KKVS.MailCount = (parseInt(mailCount) >= 100) ? 99 : mailCount;
        KKVS.Event.fire("mailCountChange",KKVS.MailCount);
    },
   
    //排行榜
    req_rank_list : function () {
         KKVS.INFO_MSG("排行榜信息请求");
        this.baseCall("req_rank_list"); 
    },
    on_rank_list : function (dataSet) {
        cc.log("on_rank_list return");
        KKVS.RankList = dataSet;
        KKVS.Event.fire("on_rank_list");
    },
    req_box_record: function() {
        KKVS.INFO_MSG("req_box_record");
        this.baseCall("req_box_record");
    },
    
    req_box: function(box_index) {
        KKVS.INFO_MSG("req_box");
        this.baseCall("req_box", box_index);
    },
   
    reqJoinTable: function(lobbyID, fieldID, roomID, opt_code, valid_key, password) {
        KKVS.INFO_MSG("reqJoinTable");
        this.baseCall("reqJoinTable", lobbyID, fieldID, roomID, opt_code, valid_key, password);
    },
    
    req_redeem: function(nType, code_str) {
        this.baseCall("req_redeem", nType, code_str);
    },
    
    exchange_k_bao_lb: function(exchange_num, machine_code, isAuto) {
        this.baseCall("exchange_k_bao_lb", exchange_num, machine_code, isAuto);
    },
    
    onCreateTableResult : function (lobbyID, fieldID, roomID, tableID, success, ret_str) {
        KKVS.INFO_MSG("->onCreateTableResult:lobbyID=" + lobbyID + ",fieldID=" + fieldID + ",roomID=" + roomID + ",tableID=" + tableID + ",success=" + success + ",ret_str=" + ret_str);
        if (success)
        {
            KKVS.EnterLobbyID = lobbyID;
            KKVS.SelectFieldID = fieldID;
            KKVS.EnterRoomID = roomID;
            
            var data;
            for (var i = 0, s = KKVS.RoomListInfo.length; i < s; ++i) {
                var field = KKVS.RoomListInfo[i]["field_id"];
                if (field == 1) {
                    data = KKVS.RoomListInfo[i]["roomList"][KKVS.EnterRoomID - 1];
                    break;
                }
            }
            KKVS.GameType = 5; //因为是拿的欢乐牛牛的配置 所以这里写5
            KKVS.MinScore = data.min_score;
            KKVS.MaxScore = data.max_score;
            KKVS.ServicePay = data.service_pay;
            
            KKVS.INFO_MSG("创建房间 成功*********** 房间编号 = " + ret_str + "房间密码 = " +  KKVS.FreePassWord + " KKVS.GameType = " + KKVS.GameType);
            KKVS.FreeNum = ret_str;
            KKVS.GameType = FreeOx;
            this.reqJoinTable(lobbyID, fieldID, roomID, 1, "" +ret_str, KKVS.FreePassWord);
        }
        else
        {
             KKVS.INFO_MSG("ret_str" + ret_str);
        }
    }, 

    on_lobby_msg: function(cmd, msg) {
        if (cmd == 400) {
            var acc = KKVS.GAME_ACC;
            var pwd = KKVS.Pwd;
            if (gameEngine.app == undefined) {
                var args = new gameEngine.gameEngineArgs();
                args.ip = "192.168.1.45";
                args.port = 10200;
                gameEngine.create(args);
            }
            if (!gameEngine.app.socket) {

                gameEngine.app.reset();
                var login_extraDatas = {
                    player_id: KKVS.KBEngineID,
                    user_id: parseInt(KKVS.GUID)
                };
                var datas = JSON.stringify(login_extraDatas);
                gameEngine.Event.fire("login", acc, pwd, datas);
            } else {
                gameEngine.app.player().reqEnterRoom(KKVS.EnterLobbyID, KKVS.SelectFieldID, KKVS.EnterRoomID);
            }
        }
    },
});