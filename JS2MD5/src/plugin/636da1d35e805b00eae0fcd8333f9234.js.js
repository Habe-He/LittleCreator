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
        KKVS.INFO_MSG("say=" + text);
        if (lobbyID == 250) {
            var newTxt = text.split("|");
            var nickname = newTxt[0];
            var txt = newTxt[1];
            KKVS.HornNotice.push({"nickname": nickname, "datas": txt});
        }
    },
    
    // 公告
    req_lobby_msg : function (cmd, datas) {
        this.baseCall("req_lobby_msg", cmd, datas);
    },
    on_lobby_msg : function (cmd, msg) {
       cc.log("Player::on_lobby_msg cmd=" + cmd);
        cc.log(" msg = " + msg);
        var params = JSON.parse(msg);
        if (cmd == LOBBY_MSG_PLAYER_OFFLINE_RECONNECT) {
            if (KKVS.CurScene == 0) {
                KKVS.ReRoomData = params;
            }
            KKVS.Event.fire("ComSys_NormalComponent", params);
        } else if( cmd == LOBBY_MSG_SOCIATY_BASE_USER){
            cc.log(" receive my SOCIATY info");
            logObj(params);
        } else if( cmd == LOBBY_MSG_SOCIATY_ACT_CREATE){
            cc.log(" create SOCIATY msg receive");
            logObj(params);
        } else if( cmd == LOBBY_MSG_SOCIATY_ACT_JOIN){
            cc.log("join SOCIATY msg reveive");
            logObj(params);
        } else if(cmd == LOBBY_MSG_SOCIATY_ACT_JOIN_AGREE_OR_NOT){
            cc.log("agree join SOCIATY msg reveive");
            logObj(params);
        } else if (cmd == LOBBY_MSG_SOCIATY_ACT_MENBER_LIST){
            cc.log(" getMsgList msg reveive");
            logObj(params);
        } else if (cmd == LOBBY_MSG_SOCIATY_ACT_DEL_MEMBER){
            cc.log(" remove member msg receive");
            logObj(params);
        } else if( cmd == LOBBY_MSG_SOCIATY_ACT_EXIT){
            cc.log(" exit sociaty msg reveive");
            logObj(params);
        } else if( cmd == LOBBY_MSG_SOCIATY_ACT_QUERY_MAIN_INFO){
            cc.log(" SOCIATY MAIN info msg receive");
            logObj(params);
        } else if( cmd == LOBBY_MSG_SOCIATY_ACT_CREATE_ROOM ){
            cc.log(" create sociaty room msg receive");
            logObj(params);
        } else if( cmd == LOBBY_MSG_SOCIATY_ACT_JOIN_ROOM){
            cc.log(" join sociaty room msg receive");
            logObj(params);
        } else if( cmd == LOBBY_MSG_SOCIATY_ACT_DESTORY_ROOM){
            cc.log(" destory sociaty room msg reveive");
            logObj(params);
        } else if( cmd == LOBBY_MSG_BASE_ACT_CREATE_ROOM){
            cc.log(" create room msg receive");
            logObj(params);
            var success = params.success;
            cc.log("success = " + success);
            if( success ){
                var room_id = params.room_id;
                var pwd = params.src.pwd;
                var data = {
                    room_id: room_id,
                    pwd: pwd
                }
                KKVS.Event.fire("create_room_success",data);
            } else{
                modulelobby.hideLoading();
                modulelobby.showTxtDialog({title : "系统提示",txt : params.error});
            }

        } else if( cmd == LOBBY_MSG_BASE_ACT_JOIN_ROOM){
            cc.log(" join room msg receive");
            modulelobby.hideLoading();
            logObj(params);
            if( params.success){
                var roomConfig = params.conf;
                var lobby_id = roomConfig.game_id; 
                KKVS.ROOM_ID = roomConfig.room_id;
                var data = {
                    game_id: lobby_id,
                    field_type: roomConfig.field_type,
                    room_id: roomConfig.room_id,
                    round: roomConfig.round,
                    multiples: roomConfig.multiples,
                    roles: roomConfig.roles,
                    user_id: roomConfig.user_id,
                    base_score: roomConfig.base_score
                }
                KKVS.Event.fire("on_player_join_room", data);
            } else{
                modulelobby.showTxtDialog({title : "系统提示",txt : params.error});
            }
        } else if( cmd == LOBBY_MSG_BASE_ACT_DESTORY_ROOM){
            cc.log(" destory room msg receive");
            logObj(params);
        } else if( cmd == LOBBY_MSG_BASE_ACT_LEAVE_ROOM){
            cc.log(" leave room msg receive");
            logObj(params);
            KKVS.Event.fire("leaveCardRoomSuccess", params);
            if(params.success){
                
            } else{

            }
        }
        KKVS.Event.fire("on_lobby_msg", cmd, params);
    },
    on_notice: function(id, txt, times, frequency) {
        KKVS.INFO_MSG("大厅::公告消息 id = " + id + ", txt = " + txt + ", times = " + times + ", frequency = " + frequency);
        KKVS.SystemNotice.push({"id": id, "txt": txt, "times" : times, "frequency" : frequency});
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
        this.reqEnterLobby(1);
        // GameData.Lobby.setGameList(this.lobbyList);
        // KKVS.Event.fire(CREATE_GAME_BTN, this.lobbyList);
    },
    
    onPlayerData: function(params) {
        cc.log("->onPlayerData");
        cc.log("KKVS.UID = " + this.id);
        //logObj(params);
        KKVS.UID = this.id;
        KKVS.GUID = params.guid;
        KKVS.INFO_MSG("KKVS.GUID = " + KKVS.GUID);
        KKVS.NICKNAME = params.nickname;
        KKVS.GENDER = params.gender; //0 = boy, 1 = girl
        KKVS.KGOLD = params.gamemoney;
        KKVS.INFO_MSG("kb = " + params.gamemoney);
        KKVS.EXP = params.exp;
        KKVS.INFO_MSG("KKVS.EXP = " + KKVS.EXP);
        KKVS.VIP = params.vip;
        KKVS.FACEID = params.head_id;
        KKVS.KBAO = params.money;
        KKVS.KGOLD_BANK = parseInt(params.money_bank);
        KKVS.UPWD = params.pwd;
        KKVS.UBMOB = params.bind_mob;
        KKVS.HEAD_URL = params.head_url;
        //KKVS.HEAD_URL = "http://thirdwx.qlogo.cn/mmopen/vi_32/yh45RgiaApWJxsXMbzGBo8AibnewesjwNFf9WDcdRfbtFSibkEuNaXqBicSFicvFysbvUo41G9Oy3qemNsv2WnWb2Uw/132";
        //KKVS.BANK_PWD = params.bank_pwd;
        cc.log("KKVS.HEAD_URL=" + KKVS.HEAD_URL);
        KKVS.EXCHANGE_SIGN = params.exchange_sign;
        //KKVS.Event.fire(CHANGE_VIEW, 1);
        //KKVS.MailCount = params.mail_count;
        KKVS.GUIDE_FLAG = params.player_flags;
        KKVS.GAME_ACC = params.account;
        //if (parseInt(KKVS.KBAO) > 0) {
        //    this.exchange_k_bao_lb(parseInt(KKVS.KBAO), "", 0);
        //}
        KKVS.ROOM_CARD = params.room_card;
        KKVS.SCORE_MASTER = params.score_master;
        KKVS.ALIPAY = params.alipay;
        KKVS.MatchData = {};
        KKVS.CurMatchData = null;
        KKVS.ReRoomData = null;
    },
    
    onEnterLobby: function(lobbyID, bSuccess, ret_code) {
        // if (bSuccess) {
        //     if (ChannelName == "kkvs") {
        //         KKVS.INFO_MSG("enter lobby success");
        //     } else if (ChannelName == "originating") {
        //         KKVS.INFO_MSG("you need start single lobby exe");
        //     }
        // }
        // else {
        //     if (ChannelName == "kkvs") {
        //         KKVS.ERROR_MSG("enter lobby failed");
        //     } else if (ChannelName == "originating") {
        //         KKVS.ERROR_MSG("[onEnterLobby] you need merge errmsg and show");
        //     }
        // }
        if (bSuccess) {
            KKVS.EnterLobbyID = lobbyID;
            
            KKVS.Event.fire("onLoginSuccess", 1);
            KKVS.INFO_MSG("------>onEnterLobby");
        }
    },
    
    on_player_game_money_update: function(money) {
        KKVS.INFO_MSG("Player->>>>on_player_game_money_update");
        KKVS.KGOLD = money;
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
    on_player_get_prop : function (name, player_id, prop_num) {
        KKVS.INFO_MSG("Player->>>>on_player_get_prop");
        var data = {name : name, player_id : player_id, prop_num : prop_num};
        KKVS.Event.fire("on_player_get_prop", data);
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
        
        if (fieldID == 5 && lobbyID == 1)
        {
            KKVS.Event.fire("createFreeTable", 1);
            KKVS.INFO_MSG("this is create free teable!!!!");
            return;
        }
        
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
        KKVS.INFO_MSG("->onEnterTableResult");

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
    on_turntable_new : function (data) {
        KKVS.INFO_MSG("on_turntable_new->");
        KKVS.Event.fire("on_turntable_new", data);
    },
    on_turntable_left_times : function (data) {
        KKVS.INFO_MSG("on_turntable_left_times->");
        KKVS.TurntableData = data;
        KKVS.Event.fire("on_turntable_left_times");
    },
    on_turntable_progress : function (data) {
        KKVS.INFO_MSG("on_turntable_progress->");
        KKVS.Event.fire("on_turntable_progress", data);
    },
    update_turntable_left_times : function (data) {
        KKVS.INFO_MSG("update_turntable_left_times->");
        KKVS.TurntableData = data;
        KKVS.Event.fire("update_turntable_left_times");
    },
    on_activity_info : function (data) {
        KKVS.INFO_MSG("on_activity_info->");
        KKVS.LimitOpen = data;
        KKVS.LimitOpen.start_time = KKVS.LimitOpen.start_time.slice(0, 10);
        KKVS.LimitOpen.end_time = KKVS.LimitOpen.end_time.slice(0, 10);
        KKVS.Event.fire("on_activity_info", data);
    },
    on_activity_config : function (data) {
        KKVS.INFO_MSG("on_activity_config->");
        for (var i = 0, len = data.length; i < len; ++i) {
            KKVS.WealthyData[i] = {};
            KKVS.WealthyData[i].id = data[i].id;
            KKVS.WealthyData[i].room_id = data[i].room_id;
            KKVS.WealthyData[i].win_times = data[i].win_times;
            KKVS.WealthyData[i].award = data[i].award.slice(2);
            KKVS.WealthyData[i].status = 0;
        }
        KKVS.Event.fire("on_activity_config");
    },
    on_activity_player_progress : function (finish, status) {
        KKVS.INFO_MSG("on_activity_player_progress->");
        KKVS.Event.fire("on_activity_player_progress", finish, status);
    },
    on_activity_player_win_times : function (lobby, field, room, win) {
        KKVS.INFO_MSG("on_activity_player_win_times->");
        KKVS.Event.fire("on_activity_player_win_times", lobby, field, room, win);
    },
    on_activity_award : function (data) {
        KKVS.INFO_MSG("on_activity_award->");
        KKVS.Event.fire("on_activity_award", data);
    },

    on_turntable_record: function(can_turn) {
        KKVS.INFO_MSG("on_turntable_record : " + can_turn);
        //KKVS.TurntableData = {can_turn: can_turn};
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
        KKVS.INFO_MSG("->reqEnterRoom : lobbyID = " + lobbyID + ", fieldID = " + fieldID + ", roomID = " + roomID);
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
        KKVS.INFO_MSG("->player req leave table!");
        KKVS.INFO_MSG("->lobbyID = " + lobbyID + ", fieldID = " + fieldID + ", roomID = " + roomID + ", tableID = " + tableID + ", chairID = " + chairID);
    },
    reqLeaveRoom: function(lobbyID, fieldID, roomID) {
        KKVS.INFO_MSG("->lobbyID = " + lobbyID + ", fieldID = " + fieldID + ", roomID = " + roomID);
        this.baseCall("reqLeaveRoom", lobbyID, fieldID, roomID);
    },
    
    reqLeaveLobby: function(lobbyID) {
        KKVS.INFO_MSG("->player leave lobby, the lobby id = " + lobbyID);
        this.baseCall("reqLeaveLobby", lobbyID);
    },
    
    req_sign_record: function() {
        KKVS.INFO_MSG("->req_sign_record");
        this.baseCall("req_sign_record");
    },
    req_sign: function() {
        KKVS.INFO_MSG("->req_sign");
        this.baseCall("req_sign");
    },
    req_activity_info : function () {
        KKVS.INFO_MSG("->req_activity_info");
        this.baseCall("req_activity_info");
    },
    req_activity_award : function (finish_id) {
        KKVS.INFO_MSG("->req_activity_award");
        this.baseCall("req_activity_award", finish_id);
    },
    req_turntable_left_times : function () {
        KKVS.INFO_MSG("->req_turntable_left_times");
        this.baseCall("req_turntable_left_times");
    },
    req_turntable_new : function () {
        KKVS.INFO_MSG("->req_turntable_new");
        this.baseCall("req_turntable_new");
    },
    req_turntable_record: function() {
        KKVS.INFO_MSG("->req_turntable_record");
        this.baseCall("req_turntable_record");
    },
    
    req_turntable: function() {
        KKVS.INFO_MSG("->req_turntable");
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
            KKVS.INFO_MSG("sendData[i] = " + sendData[i]); 
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
        cc.log("收到错误消息  msg = " + msg + ", code = " + code.toString());
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
    use_prop : function (prop_id, prop_count) {
        this.baseCall("use_prop", prop_id, prop_count);
    },
    //个人资料
    req_profile : function () {
        cc.log("->req_profile");
        this.baseCall("req_profile");
    },
    on_profile : function (qq, wx, rm, sign) {
        cc.log("->on_profile");
        KKVS.Event.fire("on_profile", qq, wx, rm, sign);
    },
    req_modify_profile : function(qq, wx, rm, sign) {
        cc.log("->req_modify_profile");
        this.baseCall("req_modify_profile", qq, wx, rm, sign);
    },
    //兑换
    req_exc : function (exc_type, exc_num) {
        this.baseCall("req_exc", exc_type, exc_num);
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
    //充值时断开socket
    req_charge : function (data) {
        this.baseCall("req_charge", data);
    },
    //金币排行榜
    req_rank_list : function () {
        KKVS.INFO_MSG("金币排行榜信息请求");
        this.baseCall("req_rank_list"); 
    },
    on_rank_list : function (dataSet) {
        cc.log("->on_rank_list");
        KKVS.RankList = dataSet;
        KKVS.Event.fire("on_rank_list");
    },
    //金币排行榜个人信息
    req_rank_list_extra : function () {
        cc.log("->req_rank_list_extra");
        this.baseCall("req_rank_list_extra");
    },
    on_rank_list_extra : function (data) {
        cc.log("->on_rank_list_extra");
        KKVS.OnRankList = data;
        KKVS.Event.fire("on_rank_list_extra");
    },
    //红包排行榜
    req_prop_rank_list : function () {
        KKVS.INFO_MSG("红包排行榜信息请求");
        this.baseCall("req_prop_rank_list");
    },
    on_prop_rank_list : function (data) {
        cc.log("->on_prop_rank_list");
        var list = data;
        for (var i = 0, len = list.length; i < len; ++i) {
            for (var j = 0; j < len - 1 - i; ++j) {
                if (list[j].prop_num.low < list[j+1].prop_num.low) {
                    var temp = list[j+1];
                    list[j+1] = list[j];
                    list[j] = temp;
                }
            }
        }
        KKVS.RedList = list;
        KKVS.Event.fire("on_prop_rank_list");
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

    req_player_msg : function(cmd, datas) {
        this.baseCall("req_player_msg", cmd, datas);
    },
    on_player_msg : function (cmd, datas) {
        var params = JSON.parse(datas);
        if (params.head_id != null && typeof (params.head_id) != 'undefined') {
            KKVS.FACEID = params.head_id;
        }
        if (params.head_url != null && typeof (params.head_url) != 'undefined') {
            KKVS.HEAD_URL = params.head_url;
        }
        if (params.gender != null && typeof (params.gender) != 'undefined') {
            KKVS.GENDER = params.gender;
        }
        if (params.nickname != null && typeof (params.nickname) != 'undefined') {
            KKVS.NICKNAME = params.nickname;
        }
        if (params.alipay != null && typeof (params.alipay) != 'undefined') {
            KKVS.ALIPAY = params.alipay;
            cc.log("KKVS.ALIPAY=" + KKVS.ALIPAY);
        }
        if (params.bind_mob != null && typeof (params.bind_mob) != 'undefined') {
            KKVS.UBMOB = params.bind_mob;
            KKVS.Event.fire("on_player_msg", PLAYER_MSG_ID_BIND_MOB, params);
        }
        if (typeof (params.gamemoney_bank) != 'undefined' && params.gamemoney_bank != null) {
            KKVS.KGOLD_BANK = parseInt(params.gamemoney_bank);
        }
        if (typeof (params.vip) != 'undefined' && params.vip != null) {
            KKVS.VIP = params.vip;
        }
        if (typeof (params.prop_id) != 'undefined' && params.prop_id != null) {
            if (KKVS.PropList) {
                //cc.log("KKVS.PropList update");
                //logObj(KKVS.PropList);
                //cc.log("====");
                //logObj(params);
                for (var i = 0, l = KKVS.PropList.length; i < l; ++i) {
                    if (KKVS.PropList[i].prop_id == params.prop_id) {
                        KKVS.PropList[i].count = params.num;
                        break;
                    }
                }
                //cc.log("-----");
                //logObj(KKVS.PropList);
            }
            KKVS.Event.fire("on_player_msg", PLAYER_MSG_ID_PROP, params);
        }
        
        KKVS.Event.fire("on_player_msg", cmd, params);
    },
    req_gm_msg: function(main_cmd, sub_cmd, datas) {
        this.baseCall("req_gm_msg", main_cmd, sub_cmd, datas);
    },
    //on_gm_msg : function () {
    //},
    
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
    //match
    req_focus : function (focus) {
        this.baseCall("req_focus", focus);
    },
    req_room_msg: function (cmd, datas) {
        //cc.log('req_room_msg cmd=' + cmd);
        this.baseCall("req_room_msg", cmd, datas);
    },
    //
    req_player_pos: function() {
        KKVS.INFO_MSG("req_player_pos");
        this.baseCall("req_player_pos");
    },
    on_player_pos : function (game_id) {
        KKVS.INFO_MSG("on_player_pos->" + game_id);
        KKVS.Event.fire("on_player_pos", game_id);
    },
    on_login_finish : function () {
        cc.log("Player::on_login_finish");
        KKVS.Event.fire("on_login_finish");
    },
    on_room_msg: function (cmd, datas) {
        cc.log("Player::on_room_msg cmd=" + cmd);
        cc.log("Player::datas=" + datas);
        var params = JSON.parse(datas);
        switch (cmd) {
            case 51:
                break;
            case 70:
                break;
            case 71:
                break;
            case 72:
                break;
            case 73:
                break;
            case 80:
                break;
            case 81:
                //cc.log("报名回复");
                break;
            case 82: //取消报名
                //cc.log("取消报名回复");
                if (params["success"]) {
                    KKVS.MatchData[params["MatchID"]] = null;
                }
                break;
            case 90: //比赛报名信息
                KKVS.MatchData[params["MatchID"]] = params;
                if (params["Status"] == 1) {
                    cc.log("比赛开始了", params);
                    if (OnLineManager._onLine) {
                        cc.log("发布比赛消息");
                        KKVS.Event.fire("ComSys_MatchComponent", params);
                    } else {
                        cc.log("禁止比赛消息");
                    }
                } else if (params["Status"] == 2) {
                    KKVS.MatchData[params["MatchID"]] = null;
                } else {
                    //cc.log("比赛未开始", params);
                }
                break;
            default :
                break;
        }
        KKVS.Event.fire("on_room_msg", cmd, params);
    },
    // sociaty 
    reqCreateSociatyMsg:function( name , desc){
        cc.log("send create sociaty msg");
        var data = {name: name , desc: desc};
        var json_str = JSON.stringify(data);
        this.baseCall("req_lobby_msg",LOBBY_MSG_SOCIATY_ACT_CREATE,json_str);        
    },
    // join sociaty 
    reqJoinInSociatyMsg:function(id){
        cc.log("send join sociaty msg");
        var data = {id: id};
        var json_str = JSON.stringify(data);
        this.baseCall("req_lobby_msg",LOBBY_MSG_SOCIATY_ACT_JOIN,json_str);     
    },
    // agree join sociaty
    // uid = userid  agree = 0 1 (1同意 )
    //同意|拒绝加入
    reqAgreeJoinSociatyMsg:function(id , uid ,agree){
        cc.log("send agree join sociaty msg");
        var data = {
            id: id,
            uid: uid,
            agree: agree
        };
        var json_str = JSON.stringify(data);
        this.baseCall("req_lobby_msg",LOBBY_MSG_SOCIATY_ACT_JOIN_AGREE_OR_NOT,json_str);
    },
    // 查询某公会会员列表
    reqSociatyInfoMsg:function(id){
        cc.log("send get sociaty info msg");
        var data = {id: id};
        var json_str = JSON.stringify(data);
        this.baseCall("req_lobby_msg",LOBBY_MSG_SOCIATY_ACT_MENBER_LIST,json_str);
    },
    // remove sociaty member
    reqRemoveSociatyMember:function(id , uid){
        cc.log("send reqRemoveSociatyMember msg");
        var data = {
            id: id,
            uid: uid
        };
        var json_str = JSON.stringify(data);
        this.baseCall("req_lobby_msg",LOBBY_MSG_SOCIATY_ACT_DEL_MEMBER,json_str);
    },
    //  exit sociaty
    reqExitSociaty:function(id){
        cc.log("send reqExitSociaty msg");
        var data = {
            id: id
        };
        var json_str = JSON.stringify(data);
        this.baseCall("req_lobby_msg",LOBBY_MSG_SOCIATY_ACT_EXIT,json_str);
    },
    reqSociatyDetailInfo:function(id){
        cc.log("send reqSociatyDetailInfo msg");
        var data = {
            id: id
        };
        var json_str = JSON.stringify(data);
        this.baseCall("req_lobby_msg",LOBBY_MSG_SOCIATY_ACT_QUERY_MAIN_INFO,json_str);
    },
    // 如果prop_id 为0 则请求所有道具
    reqMyProps:function(prop_id){
        cc.log(" reqMyProps prop_id = " + prop_id);
        this.baseCall("req_item",prop_id);
    },
    on_item:function(props){
        cc.log("on_item msg receive");
        cc.log("props.length = " + props.length);
        KKVS.FirstFlushSign = 0;
        for( var i = 0 ; i < props.length ; i++){
            cc.log("props[" + i + "].prop_id = " + props[i].prop_id);
            cc.log("props[" + i + "].count = " + props[i].count);
            cc.log("props[" + i + "].expire = " + props[i].expire);
            if (props[i].prop_id == 889 && 1 <= props[i].count) {//首冲后变为1
                KKVS.FirstFlushSign = 1;
                KKVS.Event.fire("FirstFlushSuccessVanish");
            }
        }
    },
    // create game room (公会模式)
    // 游戏ID, 局数, 倍数, 玩法, 人数
    // 2：斗地主  6：湖北癞油 89：四川麻将
    createSociatyGameRoom:function(id,game_id, round, multiples,field_type ,roles ,pwd ,room_type){
        var data = {
            id: id,
            game_id: game_id,
            round: round,
            multiples: multiples,
            field_type: field_type,
            roles: roles,
            pwd:pwd,
            room_type:room_type
        };
        var json_str = JSON.stringify(data);
        this.baseCall("req_lobby_msg",LOBBY_MSG_SOCIATY_ACT_CREATE_ROOM,json_str);
    },
    // 加入房间( 公会模式 ) 
    joinSociatyGameRoom:function(room_id ,pwd){
        var data = {
            room_id: room_id,
            pwd:pwd
        };
        var json_str = JSON.stringify(data);
        this.baseCall("req_lobby_msg",LOBBY_MSG_SOCIATY_ACT_JOIN_ROOM,json_str);
    },
    // 销毁房间( 公会模式)
    destorySociatyGameRoom:function(id,room_id){
        var data = {
            id: id,
            room_id: room_id
        };
        var json_str = JSON.stringify(data);
        this.baseCall("req_lobby_msg",LOBBY_MSG_SOCIATY_ACT_DESTORY_ROOM,json_str);
    },
    // 游戏ID, 局数, 倍数, 玩法, 人数 ， room_type : 0 是普通  1是 非正常
    // 6 是湖北癞油  bring 带入分数
    createGameRoom: function(game_id, round, multiples, field_type, roles, pwd , room_type , bring, base_score) {
        var data = {
            pwd: pwd,
            game_id: game_id,
            round: round,
            multiples: multiples,
            field_type: field_type,
            roles: roles,
            room_type: room_type,
            bring: bring
        };
        if (base_score) {
            data.base_score = base_score;
        }
        var json_str = JSON.stringify(data);
        this.baseCall("req_lobby_msg", LOBBY_MSG_BASE_ACT_CREATE_ROOM, json_str);
        // KBEngine.app.player().createGameRoom(6,2,0,1,4,"123456" ,0);
    },
    joinGameRoom: function(room_id, pwd) {
        var data = {
            room_id: room_id,
            pwd: pwd
        };
        var json_str = JSON.stringify(data);
        this.baseCall("req_lobby_msg", LOBBY_MSG_BASE_ACT_JOIN_ROOM, json_str);
    },
    destoryGameRoom: function( room_id) {
        var data = {
            room_id: room_id
        };
        var json_str = JSON.stringify(data);
        this.baseCall("req_lobby_msg", LOBBY_MSG_BASE_ACT_DESTORY_ROOM, json_str);
    },
    leaveCardRoom:function (room_id) {
        // body...
        var data = {
            room_id: room_id
        };
        var json_str = JSON.stringify(data);
        this.baseCall("req_lobby_msg", LOBBY_MSG_BASE_ACT_LEAVE_ROOM, json_str);
    }
});