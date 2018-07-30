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
 }

Tool.encryptMoblieNumber = function (str) {
    if (!Tool.isMoblieNumber(str)) {
        return str;
    }
    return str.substring(0, 3) + "****" + str.substring(7);
 }

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
},

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
},

// 下载用户头像
Tool.weChatHeadFile = function(img, url) {
    var oriSize = img.node.getContentSize();
    wx.downloadFile({
        url: url,
        header: "image",
        filePath: "",
        success: function (res) {
            var path = res.tempFilePath;
            cc.loader.load(path, function (err, texture) {
                var frame = new cc.SpriteFrame(texture);
                img.spriteFrame = frame;
                img.node.scale = 132 / img.node.getContentSize().width;
            });
        },

        fail: function (err) {
            cc.log("下载微信头像失败 = " + err);
        },
    });
},

// 获取日期
Tool.getByTime = function (_time) {
    var date = new Date(_time * 1000);
    var Y = date.getFullYear() + '-';
    var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
    var D = date.getDate() + ' ';

    return (Y + M + D);
},

module.exports = Tool;