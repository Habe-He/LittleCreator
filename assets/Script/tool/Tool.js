var KKVS = require("./../plugin/KKVS");
var md5 = require("./md5");
var gameEngine = require("./../plugin/gameEngine");
var cardTypeUtil = require('./../card/cardTypeUtil');
var cardInfo = require('./../card/cardInfo');
var cardfabs = require('./../card/cardPer');
var StringDef = require('./StringDef');
var LevelConfig = require("./config.js");
var AppHelper = require('./../AppHelper');
var httpUtils = require('./../plugin/httpUtils')

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
};

Tool.goLogin = function (args) {
    cc.log("->goLogin");
    var s = new KKVS.MemoryStream(args.data);
    var acc = KKVS.utf8ArrayToString(s.readBlob());
    var pwd = KKVS.utf8ArrayToString(s.readBlob());
    var game_id = KKVS.utf8ArrayToString(s.readBlob());
    OxLogin(acc, pwd);
};

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
};

Tool.getViewChairID = function (nChairID) {
    var PlayerCount = 3;
    if (nChairID < PlayerCount) {
        return (nChairID - KKVS.myChairID + PlayerCount) % PlayerCount;
    }
    return -1;
};

Tool.InterceptDiyStr = function(sName, nShowCount) {
    if (sName == "") {
        return sName;
    }
    var showName = ""
    var nLenInByte = sName.length;

    for (var i = 0; i < nLenInByte; ++i) {
        if (nShowCount <= 0) {
            showName += "...";
            break;
        }
        var once = sName.substring(i, i + 1)
        if (/.*[\u4e00-\u9fa5]+.*$/.test(once)) {
            //中文
            nShowCount -= 1;
            var char = sName.substring(i, i + 1);
            showName += char;
        } else {
            nShowCount -= 0.5;
            var char = sName.substring(i, i + 1);
            showName += char;
        }
    }

    return showName;
};

Tool.isMoblieNumber = function (str) {
    if (typeof str != 'string') {
        return false;
    }
    return /^1[34578]\d{9}$/.test(str);
};

Tool.encryptMoblieNumber = function (str) {
    if (!Tool.isMoblieNumber(str)) {
        return str;
    }
    return str.substring(0, 3) + "****" + str.substring(7);
};

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
};

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
};

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
};

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
    return data;
};

Tool.gradeDownSort = function(data) {
    data.sort(function(x, y) {
        if (x < y) 
            return 1;
        else if (x > y)
            return -1;
        else
            return 0
    });
    return data;
};

// 下载用户头像
Tool.weChatHeadFile = function(img, url, temNode) {
    wx.downloadFile({
        url: url,
        header: "image",
        filePath: "",
        success: function (res) {
            var path = res.tempFilePath;
            cc.loader.load(path, function (err, texture) {
                var frame = new cc.SpriteFrame(texture);
                if (!img.isValid) return
                img.spriteFrame = frame;
                img.node.scale = 110 / img.node.getContentSize().width;
            });
        },

        fail: function (err) {
            cc.log("下载微信头像失败 = " + err);
        },
    });
};

// 获取详细日期 带小时分钟秒
Tool.getByTimeDetail = function(sec) {
    var d = new Date(sec * 1000);
    var date = d.getDate();
    var month = d.getMonth() + 1;
    var year = d.getFullYear();
    var h = d.getHours();
    var m = d.getMinutes();
    var s = d.getSeconds();
    return year + "-" + (month > 9 ? month : "0" + month ) + "-" + (date > 9 ? date : "0" + date ) + " " 
    + (h > 9 ? h : "0" + h ) + ":" + (m > 9 ? m : "0" + m ) + ":" + (s > 9 ? s : "0" + s );
};



Tool.getHourAndMin = function(sec) {
    var d = new Date(sec * 1000);
    var h = d.getHours();
    var m = d.getMinutes();
    var s = d.getSeconds();
    return(h > 9 ? h : "0" + h ) + ":" + (m > 9 ? m : "0" + m ) + ":" + (s > 9 ? s : "0" + s );
};



// 获取日期
Tool.getByTime = function (sec) {
    var d = new Date(sec * 1000);
    var date = d.getDate();
    var month = d.getMonth() + 1;
    var year = d.getFullYear();
    return year + "-" + (month > 9 ? month : "0" + month ) + "-" + (date > 9 ? date : "0" + date ) + ""
};


// 金币 -> 万
Tool.goldSplit = function(money) {
    var str = "";
    if (money <= 10000) {
        return money.toString();
    } else {
        if (money % 10000 == 0) {
            str = money / 10000 + "万"
            return str.toString();
        } else {
            var wan = parseInt(money / 10000);
            var don = parseInt((money - wan * 10000) / 1000);
            str = wan + "." + don + "万"
            return str.toString();
        }
    }
};
// 获取音效的名字
Tool.getEffectName = function(gender, object) {
    var genderAr = ['voice/Effect/man/', 'voice/Effect/woman/', 'voice/Effect/woman/'];
    var ef_name = null;
    // TODO 待优化部分
    // 音效对象存入数组中
    if (object.ID == StringDef.ZHADAN_EF.ID) {
        ef_name = StringDef.ZHADAN_EF.Name;

    } else if (object.ID == StringDef.BUCHU_EF.ID) {
        ef_name = StringDef.BUCHU_EF.Name;

    } else if (object.ID == StringDef.FEIJI_EF.ID) {
        ef_name = StringDef.FEIJI_EF.Name;
        
    } else if (object.ID == StringDef.HUOJIAN_EF.ID) {
        ef_name = StringDef.HUOJIAN_EF.Name;
        
    } else if (object.ID == StringDef.BUJIAO_EF.ID) {
        ef_name = StringDef.BUJIAO_EF.Name;
        
    } else if (object.ID == StringDef.YIFEN_EF.ID) {
        ef_name = StringDef.YIFEN_EF.Name;
        
    } else if (object.ID == StringDef.ERFEN_EF.ID) {
        ef_name = StringDef.ERFEN_EF.Name;
        
    } else if (object.ID == StringDef.SANFEN_EF.ID) {
        ef_name = StringDef.SANFEN_EF.Name;
        
    } else if (object.ID == StringDef.SHUANGSHUN_EF.ID) {
        ef_name = StringDef.SHUANGSHUN_EF.Name;
        
    } else if (object.ID == StringDef.SHUNZI_EF.ID) {
        ef_name = StringDef.SHUNZI_EF.Name;
    }
    return (genderAr[gender] + ef_name).toString();
};

// 获取当前段位等级
Tool.getRunkLevel = function (score) {
    var division = 0;
    var startCount = 0;
    if (score >= 3000 && score < 4000) {
        division = 0;
        startCount = 1;

    } else if (score >= 4001 && score < 5000) {
        division = 0;
        startCount = 2;

    } else if (score >= 5001 && score < 10000) {
        division = 1;
        startCount = 1;
        
    } else if (score >= 10001 && score < 15000) {
        division = 1;
        startCount = 2;
        
    } else if (score >= 15001 && score < 20000) {
        division = 1;
        startCount = 3;
        
    }
    // TODO
    // 后续判断待增加

    return {'division': division, 'startCount': startCount};
};


Tool.getLevelInfoByLevelId = function(level_id){
    return LevelConfig.g_LevelScoreArea[level_id];
    // for( var i = 0 ; i < LevelConfig.g_LevelScoreArea.length ;i++){
    // }
};


// 获取段位信息 
Tool.getLevelInfo = function(score){
    for( var i = 0 ; i < LevelConfig.g_levelScore.length - 1 ; i++){
        var data = LevelConfig.g_levelScore[i];
        if( score >= data.minScore && score < data.maxScore){
            var finallyData = {
                bigLevel:data.big_level,
                star:data.star,
                name:data.desc,
                index_id: data.index_id
            }
            return finallyData;
        }
    }
    var data = LevelConfig.g_levelScore[LevelConfig.g_levelScore.length - 1];
    // cc.log("data.big_level = " + data.big_level);
    // cc.log("data.star = " + data.star);
    // cc.log("data.minScore = " + data.minScore);
    // cc.log("data.maxScore = " + data.maxScore);


    var star = 0;
    if( score >= data.minScore){
        star = parseInt ((score - data.minScore) /1000000);
    }

    var finallyData = {
        bigLevel: data.big_level,
        star: star,
        name: data.desc,
        index_id: data.index_id
    }
    return finallyData;
};

Tool.sendOrderNumber = function(orderNumber){
    var reqURL = "https://sjddz-yxjh.17fengyou.com/pay/order-notify";
    var sign_init = "order_no=" + orderNumber.toString() + KKVS.Acc.toString() + KKVS.sid.toString(); 
    var signStr = md5.hex_md5(sign_init);
    var params = {
        order_no:orderNumber,
        sign:signStr
    };
    cc.log("sendOrderNumber:signStr = " + signStr);
    httpUtils.getInstance().httpPost(reqURL, params ,function(data) {
        if (data == -1) {
            cc.log('请检查网络！');
        } else {
            AppHelper.get().hideLoading();
            var jsonD = JSON.parse(data);
            cc.log("jsonD.http_code = " + jsonD.http_code);
            cc.log("jsonD.msg = " + jsonD.msg);
            cc.log("jsonD.data = " + jsonD.data);
            if( jsonD.http_code != 200){
            } else{
                cc.log("奖励已发送至邮箱，请注意查收");
                KKVS.Event.fire("ChargeSuccess");
                cc.log("支付成功 , 奖励发送的邮箱");
                if (!gameEngine.app || !gameEngine.app.player()) {
                    return;
                }

                gameEngine.app.player().sendGetMailList();
            }
        }
    });
};

Tool.getOrderNumber = function(rmb){
    // rmb = 1;
    AppHelper.get().showLoading(null, null, 10);
    var reqURL = "https://sjddz-yxjh.17fengyou.com/pay/order";
    var sign_init = "user_id=" + KKVS.GUID.toString() + "&rmb=" + rmb.toString() +  KKVS.Acc.toString() + 
    KKVS.sid.toString();
    cc.log("sign_init = " + sign_init);
    var signStr = md5.hex_md5(sign_init);
    var params = {
        user_id:KKVS.GUID,
        rmb:rmb,
        sign:signStr
    };
    httpUtils.getInstance().httpPost(reqURL, params ,function(data) {
        if (data == -1) {
            cc.log('请检查网络！');
        } else {
            AppHelper.get().hideLoading();
            var jsonD = JSON.parse(data);
            cc.log("jsonD.http_code = " + jsonD.http_code);
            cc.log("jsonD.msg = " + jsonD.msg);
            cc.log("jsonD.data = " + jsonD.data);
            cc.log("jsonD.orderNumber = " + jsonD.data.order_no);
            if( jsonD.http_code != 200){

            } else{
                cc.log("充值调用失败");
            }
            var orderNumber = jsonD.data.order_no;
            // Tool.sendOrderNumber(orderNumber);
            // return;
            var gemNum = rmb;
            // 创建 wxSdk
            // env = 0 ( 正式 ) 1(测试)
            wx.requestMidasPayment({
                    mode: 'game',
                    env: 0,
                    platform: 'android',
                    offerId: '1450016529',
                    buyQuantity: rmb * 10,
                    zoneId: 1,
                    currencyType: 'CNY',
                    success(res) {
                        // 支付成功
                        console.log('购买成功')
                        console.log(res);
                        cc.log("orderNumber " + orderNumber);
                        Tool.sendOrderNumber(orderNumber);
                    },
                    fail({errMsg, errCode}) {
                        // 支付失败
                        console.log(errMsg, errCode)
                    },
                    complete(res) {
                        console.log(res)
                    }
            })
        }
    });
};
module.exports = Tool;