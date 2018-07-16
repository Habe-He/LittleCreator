var KKVS = require("./../plugin/KKVS");
var md5 = require("./md5");
var gameEngine = require("./../plugin/gameEngine");
var cardTypeUtil = require('./../card/cardTypeUtil');
var cardInfo = require('./../card/cardInfo');
var cardfabs = require('./../card/cardPer');

var Tool = Tool || {};

Tool.logObj = function (obj, indent) {
    if (typeof (obj) != 'object') {
        return;
    }
    var print_func = function (str) {
        //KKVS.INFO_MSG(str);
        cc.log(str);
    };
    indent = indent ? indent : 0;
    for (var k in obj) {
        var v = obj[k];
        var t_v = typeof (v);
        var szPrefix = "";
        for (var i = 0; i < indent; ++i) {
            szPrefix += "\t";
        }
        var formatting = szPrefix + "[" + k + "]" + " = ";
        if (t_v == 'object') {
            formatting += "{";
            print_func(formatting);
            Tool.logObj(v, indent + 1);
            print_func(szPrefix + "},");
        } else if (t_v == 'string') {
            formatting += "\"" + v + "\"" + ",";
            print_func(formatting);
        } else if (t_v == 'function') {
            formatting += "function,";
            print_func(formatting);
        } else if (t_v == 'undefined') {
            formatting += "undefined,";
            print_func(formatting);
        } else {
            formatting += v.toString() + ",";
            print_func(formatting);
        }
    }
};

// ByteBuffer = dcodeIO.ByteBuffer;

Tool.VISITOR_LOGIN = "1";
Tool.QQ_LOGIN = "2";
Tool.WECHAT_LOGIN = "3";
Tool.KK_LOGIN = "4";
Tool.MOBILE_LOGIN = "5";
Tool.CHEETAH_LOGIN = "6";
/**
 * user login
 * @acc                         Account
 * @pwd                         如果非KK账号登录，请传空字符串
 */
Tool.OxLogin = function (acc, pwd) {
    KKVS.Acc = acc;
    if (pwd !== "") {
        KKVS.Pwd = pwd;
        KKVS.Pwd_MD5 = md5.hex_md5(pwd);
    } else {
        KKVS.Pwd = "As09#^oF";
        KKVS.Pwd_MD5 = hex_md5("As09#^oF");
    }
    //cc.log("KKVS.Acc = " + KKVS.Acc);
    //cc.log("KKVS.Pwd = " + KKVS.Pwd);
    KKVS.Event.fire("goLogin");
}

Tool.enterRoom = function (field_id, error_str) {
    KKVS.Event.fire("showWaitUI"); //showLoading
    //查找房间
    var room_list = null;
    for (var i = 0, s = KKVS.RoomListInfo.length; i < s; ++i) {
        var field = KKVS.RoomListInfo[i]["field_id"];
        if (field == field_id) {
            room_list = KKVS.RoomListInfo[i]["roomList"];
            KKVS.SelectFieldID = field;
            break;
        }
    }
    if (!room_list || room_list.length == 0) {
        KKVS.Event.fire("deleteWaitUI"); //hideLoading
        var args = {
            eventType: 1,
            msg: error_str,
            pro: null,
            winType: 1
        };
        KKVS.Event.fire("createTips", args);
        return;
    }
    //选择房间
    var my_gold = parseInt(KKVS.KGOLD);
    var room_select = null;
    for (var r = room_list.length - 1; 0 <= r; --r) {
        var room = room_list[r];
        if (my_gold >= room.min_score && (room.max_score == 0 || my_gold <= room.max_score)) {
            room_select = room;
            break;
        }
    }
    if (!room_select) {
        KKVS.Event.fire("deleteWaitUI"); //hideLoading
        var args = {
            eventType: 1,
            msg: "进入房间失败!",
            pro: null,
            winType: 1
        };
        KKVS.Event.fire("createTips", args);
    } else {
        enterGame(room_select["room_id"], room_select["room_type"], room_select["min_score"], room_select["max_score"], room_select.service_pay);
    }
}

Tool.enterGame = function (room_id, room_type, min_score, max_score, service_pay) {
    var acc = KKVS.GAME_ACC; //KKVS.Acc;
    var pwd = KKVS.Pwd; //KKVS.Pwd_MD5;  KKVS.Pwd
    KKVS.MinScore = min_score;
    KKVS.MaxScore = max_score;
    KKVS.GameType = room_type;
    KKVS.ServicePay = service_pay;
    KKVS.INFO_MSG("台费：" + KKVS.ServicePay);
    KKVS.EnterRoomID = room_id;
    cc.log("game acc = " + acc + ", id = " + KKVS.KBEngineID);
    if (gameEngine.app == undefined) {
        var args = new gameEngine.gameEngineArgs();
        args.ip = "122.228.193.236";
        // args.ip = "192.168.1.45";
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

//连线
Tool.onLine = function () {
    var acc = KKVS.Acc;
    var pwd = KKVS.Pwd_MD5;
    cc.log("acc = " + acc);
    cc.log("pwd = " + pwd);

    gameEngine.app.reset();
    if (!acc || acc == "") {
        var args = {
            eventType: 2,
            msg: "登录失败,帐号不能为空",
            pro: null,
            winType: 1
        };
        KKVS.Event.fire("createTips", args);
        return;
    }
    KKVS.MAC_ADDRESS = getPhoneUUIDMain();
    var login_extraDatas = {
        plaza_id: "0",
        server_id: "1"
    }; //plaza_id:0=kk, 1=liebao
    if (KKVS.Login_type == VISITOR_LOGIN || KKVS.Login_type == "0") {
        //yk
        login_extraDatas.login_type = VISITOR_LOGIN;
        login_extraDatas.mac_addr = acc;
        login_extraDatas.phone = "";
        KKVS.INFO_MSG("acc = " + acc);
    } else if (KKVS.Login_type == KK_LOGIN) {
        //kk
        //login_extraDatas.login_type = KK_LOGIN;
    } else if (KKVS.Login_type == WECHAT_LOGIN) {
        //wx
        login_extraDatas.login_type = WECHAT_LOGIN;
        //KKVS.WxData = {};
        //KKVS.WxData.platform = "wx";
        //KKVS.WxData.sys = "android";
        //KKVS.WxData.openid = openid;
        //KKVS.WxData.nick_name = nick_name;
        //KKVS.WxData.sex = sex;
        //KKVS.WxData.head = headimgurl;
        //KKVS.WxData.unionid = unionid;
        if (KKVS.WxData.sys == "android") {
            login_extraDatas.openid = KKVS.WxData.openid;
            login_extraDatas.nick_name = KKVS.WxData.nick_name;
            login_extraDatas.sex = KKVS.WxData.sex;
            login_extraDatas.head = KKVS.WxData.head;
            login_extraDatas.unionid = KKVS.WxData.unionid;
            login_extraDatas.phone = "";
            login_extraDatas.mac_addr = getPhoneUUIDMain();
        } else if (KKVS.WxData.sys == "ios") {
            cc.log("charles test");
            login_extraDatas.openid = KKVS.WxData.openid;
            login_extraDatas.nick_name = KKVS.WxData.nick_name;
            login_extraDatas.sex = KKVS.WxData.sex.toString();
            login_extraDatas.head = KKVS.WxData.head;
            login_extraDatas.unionid = KKVS.WxData.unionid;
            login_extraDatas.phone = "";
            login_extraDatas.mac_addr = getPhoneUUIDMain();

        }
    } else if (KKVS.Login_type == QQ_LOGIN) {
        //qq
        login_extraDatas.login_type = QQ_LOGIN;
        //test
        var args = {
            eventType: 2,
            msg: "暂不支持QQ登录",
            pro: null,
            winType: 1
        };
        KKVS.Event.fire("createTips", args);
        return;
    } else if (KKVS.Login_type == MOBILE_LOGIN) {
        login_extraDatas.login_type = MOBILE_LOGIN;
    } else {
        var args = {
            eventType: 2,
            msg: "无效登录",
            pro: null,
            winType: 1
        };
        KKVS.Event.fire("createTips", args);
        return;
    }
    var datas = JSON.stringify(login_extraDatas);
    gameEngine.Event.fire("login", acc, pwd, datas);
}

Tool.goLogin = function (args) {
    cc.log("->goLogin");
    var s = new KKVS.MemoryStream(args.data);
    var acc = KKVS.utf8ArrayToString(s.readBlob());
    var pwd = KKVS.utf8ArrayToString(s.readBlob());
    var game_id = KKVS.utf8ArrayToString(s.readBlob());
    OxLogin(acc, pwd);
}

Tool.toolSortArrayForSelf = function (m_data) {
    m_data.sort(function (a, b) {
        var avalue = cardTypeUtil.GetCardValue(a);
        var aolorType = cardInfo[cardTypeUtil.GetCardColor(a)].cardType;
        var bvalue = cardTypeUtil.GetCardValue(b);
        var bcolorType = cardInfo[cardTypeUtil.GetCardColor(b)].cardType;
        if ((aolorType == 5 && bcolorType != 5) || (aolorType != 5 && bcolorType == 5) || (aolorType == 5 && bcolorType == 5)) {
            if (aolorType < bcolorType) {
                return 1;
            } else if (aolorType > bcolorType) {
                return -1;
            } else {
                return 0;
            }
        } else if ((aolorType == 0 && bcolorType != 0) || (aolorType != 0 && bcolorType == 0)) {
            if (aolorType < bcolorType) {
                return -1;
            } else if (aolorType > bcolorType) {
                return 1;
            } else {
                return 0;
            }
        } else if (aolorType == 0 && bcolorType == 0) {
            if (avalue < bvalue) {
                return 1;
            } else if (avalue > bvalue) {
                return -1;
            } else {
                return 0;
            }

        } else {
            if (avalue == bvalue) {
                if (aolorType < bcolorType) {
                    return -1;
                } else if (aolorType > bcolorType) {
                    return 1;
                } else {
                    return 0;
                }
            } else {
                if (avalue < bvalue) {
                    return 1;
                } else if (avalue > bvalue) {
                    return -1;
                } else {
                    return 0;
                }
            };
        };
    });

    return m_data;
}

Tool.getViewChairID = function (nChairID) {
    var PlayerCount = 3;
    if (nChairID < PlayerCount) {
        return (nChairID - KKVS.myChairID + PlayerCount) % PlayerCount;
    }
    return -1;
},

// 排列打出去的牌
Tool.sortOutCardList = function (objarr) {
    objarr.sort(function (a, b) {
        a = a.getComponent(cardfabs);
        b = b.getComponent(cardfabs);
        if ((a.cardColorType == 0 && b.cardColorType != 0) || (a.cardColorType != 0 && b.cardColorType == 0)) {
            if (a.cardColorType < b.cardColorType) {
                return -1;
            } else if (a.cardColorType > b.cardColorType) {
                return 1;
            } else {
                return 0;
            }
        } else if (a.cardColorType == 0 && b.cardColorType == 0) {
            if (a.cardValue < b.cardValue) {
                return 1;
            } else if (a.cardValue > b.cardValue) {
                return -1;
            } else {
                return 0;
            }
        } else {
            if (a.cardValue == b.cardValue) {
                if (a.cardColorType < b.cardColorType) {
                    return -1;
                } else if (a.cardColorType > b.cardColorType) {
                    return 1;
                } else {
                    return 0;
                }
            } else {
                if (a.cardValue < b.cardValue) {
                    return 1;
                } else if (a.cardValue > b.cardValue) {
                    return -1;
                } else {
                    return 0;
                }
            }
        }
    });
},

// 排列自己手上的牌
Tool.sortCardList = function(objarr) {
    objarr.sort(function(a, b) {
        a = a.getComponent(cardfabs);
        b = b.getComponent(cardfabs);
        if (a.cardColorType == 5 && b.cardColorType != 5 || a.cardColorType != 5 && b.cardColorType == 5) {
            if (a.cardColorType < b.cardColorType) {
                return 1;
            } else if (a.cardColorType > b.cardColorType) {
                return -1;
            } else {
                return 0;
            }
        } else if ((a.cardColorType == 0 && b.cardColorType != 0) || (a.cardColorType != 0 && b.cardColorType == 0)) {
            if (a.cardColorType < b.cardColorType) {
                return -1;
            } else if (a.cardColorType > b.cardColorType) {
                return 1;
            } else {
                return 0;
            }
        } else if (a.cardColorType == 0 && b.cardColorType == 0) {
            if (a.cardValue < b.cardValue) {
                return 1;
            } else if (a.cardValue > b.cardValue) {
                return -1;
            } else {
                return 0;
            }
        } else {
            if (a.cardValue == b.cardValue) {
                if (a.cardColorType < b.cardColorType) {
                    return -1;
                } else if (a.cardColorType > b.cardColorType) {
                    return 1;
                } else {
                    return 0;
                }
            } else {
                if (a.cardValue < b.cardValue) {
                    return 1;
                } else if (a.cardValue > b.cardValue) {
                    return -1;
                } else {
                    return 0;
                }
            }
        }
    });
},

Tool.toolSortArray = function(m_data) {
    m_data.sort(function(a, b) {
        var avalue = cardTypeUtil.GetCardValue(a);
        var aolorType = cardInfo[cardTypeUtil.GetCardColor(a)].cardType;
        var bvalue = cardTypeUtil.GetCardValue(b);
        var bcolorType = cardInfo[cardTypeUtil.GetCardColor(b)].cardType;
        if ((aolorType == 0 && bcolorType != 0) || (aolorType != 0 && bcolorType == 0)) {
            if (aolorType > bcolorType) {
                return 1;
            } else if (aolorType < bcolorType) {
                return -1;
            } else {
                return 0;
            }
        } else if (aolorType == 0 && bcolorType == 0) {
            if (avalue < bvalue) {
                return 1;
            } else if (avalue > bvalue) {
                return -1;
            } else {
                return 0;
            }
        } else {
            if (avalue == bvalue) {
                if (aolorType > bcolorType) {
                    return 1;
                } else if (aolorType < bcolorType) {
                    return -1;
                } else {
                    return 0;
                }
            } else {
                if (avalue < bvalue) {
                    return 1;
                } else if (avalue > bvalue) {
                    return -1;
                } else {
                    return 0;
                }
            }
        }
    })

    return m_data;
}

Tool.sortListBy2T3 = function(data, operator) {
    if (data == undefined)
        return;

    data.sort(function(x, y) {
        if (operator == "从小到大") {
            if (Number(x) < Number(y)) {
                return -1;
            } else {
                return 1;
            }
        } else if (operator == "从大到小") {
            if (Number(x) > Number(y)) {
                return -1;
            } else if (Number(x == Number(y))) {
                return -1;
            } else {
                return 1;
            }
        }
    });
}

module.exports = Tool;