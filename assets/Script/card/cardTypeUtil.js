/*
    新增修改 for wechat game
*/

var cardTypeUtil = {};

// 获取牌值
cardTypeUtil.GetCardValue = function (data) {
    if (data == 79 || data == 78)
        return data;
    if ((data % 16) == 1)
        return 14;
    if ((data % 16) == 2)
        return 15;
    return data & 0x0F;
};

// 获取花色
cardTypeUtil.GetCardColor = function (data) {
    return data & 0xF0;
};

// 自动提取出目标牌中含有的牌形并返还长度最长的一种牌形(少于5张牌的不判断)
cardTypeUtil.autoTakeOutCardType = function (cardValues) {
    if (cardValues.length == 0 || cardValues == null) {
        console.log("参数有误 你没有选牌");
        return null;
    }
    var len = cardValues.length;
    if (len < 5) {
        return false
    };
    // 升序排列
    cardValues.sort(function (a, b) {
        if (a.cardValue > b.cardValue) {
            return 1;
        } else if (a.cardValue < b.cardValue) {
            return -1;
        } else {
            return 0;
        }
    });
    // 检测顺序，检测可能多张的牌形，顺子，双顺，飞机，四带一，四带二然后做比较，张数多的为拉起
    var shunzi = cardTypeUtil.findShunZi(cardValues);
    // 牌型信息
    var cardInfo = cardTypeUtil.getCardInfo(cardValues);
    // 去重后的所有牌组
    var objarr = [];
    cardTypeUtil.setCountOver(cardValues, objarr);
    var liandui = [];
    var feiji = [];
    var fourTake = [];
    if (objarr.length > 1) {
        var duishun = cardTypeUtil.findShunZi(objarr[1], 3);
        // 有连对
        if (duishun.length > 0) {
            var len = duishun.length;
            for (var i = 0; i < len; i++) {
                liandui.push(duishun[i]);
                liandui.push(duishun[i]);
            }
        }
    }
    if (objarr.length > 2) {

        var sanShun = cardTypeUtil.findShunZi(objarr[2], 2);
        // 有飞机
        if (sanShun.length > 0) {
            var len = sanShun.length;
            for (var i = 0; i < len; i++) {
                feiji.push(sanShun[i]);
                feiji.push(sanShun[i]);
                feiji.push(sanShun[i]);
            }
            if (cardInfo[1].length >= len) {
                for (var p = 0; p < len; p++) {
                    feiji.push(cardInfo[1][p]);
                    feiji.push(cardInfo[1][p]);
                }
            } else if (cardInfo[0].length >= len) {
                for (var p = 0; p < len; p++) {
                    feiji.push(cardInfo[0][p]);
                }
            }
        }
    }
    // 有炸弹
    if (objarr.length > 3) {
        if (objarr[3].length > 0) {
            for (var k = 0; k < 4; k++) {
                fourTake.push(objarr[3][0]);
            }
            if (cardInfo[1].length >= 2) {
                for (var p = 0; p < 2; p++) {
                    fourTake.push(cardInfo[1][p]);
                    fourTake.push(cardInfo[1][p]);
                }
            } else if (cardInfo[0].length >= 2) {
                for (var p = 0; p < 2; p++) {
                    fourTake.push(cardInfo[0][p]);
                }
            }
        }
    }
    var allCardTypes = [];
    if (shunzi.length > 0) {
        allCardTypes.push(shunzi);
    };
    if (liandui.length > 0) {
        allCardTypes.push(liandui);
    };
    if (feiji.length > 0) {
        allCardTypes.push(feiji);
    };
    if (fourTake.length > 0) {
        allCardTypes.push(fourTake);
    };

    if (allCardTypes.length > 1) {
        // 有两种以上牌形
        allCardTypes.sort(function (a, b) {
            if (a.length > b.length) {
                return -1;
            } else if (a.length < b.length) {
                return 1;
            } else {
                return 0;
            }
        });
        return allCardTypes[0];
    } else if (allCardTypes.length == 1) {
        // 只有一种以上牌形
        return allCardTypes[0];
    } else {
        // 以上牌形都没有 再找一下有没有三张
        if (objarr.length > 2) {
            var threeTake = [];
            if (objarr[2].length > 0) {
                // 取三张里面最小的值
                var threeValue = objarr[2][0]
                threeTake.push(threeValue);
                threeTake.push(threeValue);
                threeTake.push(threeValue);
                if (cardInfo[1].length > 0) {
                    threeTake.push(cardInfo[1][0]);
                    threeTake.push(cardInfo[1][0]);
                } else if (cardInfo[0].length > 0) {
                    threeTake.push(cardInfo[0][0]);
                }
                return threeTake;
            }
        } else {
            return [];
        }
    }
    return [];
};

// 自动提取出目标牌中含有的牌形并返还长度最长的一种牌形(少于5张牌的不判断)
cardTypeUtil.autoTakeOutCardType = function (cardValues) {
    if (cardValues.length == 0 || cardValues == null) {
        console.log("参数有误 你没有选牌");
        return null;
    }
    var len = cardValues.length;
    if (len < 5) {
        return false
    };
    // 升序排列
    cardValues.sort(function (a, b) {
        if (a.cardValue > b.cardValue) {
            return 1;
        } else if (a.cardValue < b.cardValue) {
            return -1;
        } else {
            return 0;
        }
    });
    // 检测顺序，检测可能多张的牌形，顺子，双顺，飞机，四带一，四带二然后做比较，张数多的为拉起
    var shunzi = cardTypeUtil.findShunZi(cardValues);
    // 牌型信息
    var cardInfo = cardTypeUtil.getCardInfo(cardValues);
    // 去重后的所有牌组
    var objarr = [];
    cardTypeUtil.setCountOver(cardValues, objarr);
    var liandui = [];
    var feiji = [];
    var fourTake = [];
    if (objarr.length > 1) {
        var duishun = cardTypeUtil.findShunZi(objarr[1], 3);
        // 有连对
        if (duishun.length > 0) {
            var len = duishun.length;
            for (var i = 0; i < len; i++) {
                liandui.push(duishun[i]);
                liandui.push(duishun[i]);
            }
        }
    }
    if (objarr.length > 2) {

        var sanShun = cardTypeUtil.findShunZi(objarr[2], 2);
        // 有飞机
        if (sanShun.length > 0) {
            var len = sanShun.length;
            for (var i = 0; i < len; i++) {
                feiji.push(sanShun[i]);
                feiji.push(sanShun[i]);
                feiji.push(sanShun[i]);
            }
            if (cardInfo[1].length >= len) {
                for (var p = 0; p < len; p++) {
                    feiji.push(cardInfo[1][p]);
                    feiji.push(cardInfo[1][p]);
                }
            } else if (cardInfo[0].length >= len) {
                for (var p = 0; p < len; p++) {
                    feiji.push(cardInfo[0][p]);
                }
            }
        }
    }
    // 有炸弹
    if (objarr.length > 3) {
        if (objarr[3].length > 0) {
            for (var k = 0; k < 4; k++) {
                fourTake.push(objarr[3][0]);
            }
            if (cardInfo[1].length >= 2) {
                for (var p = 0; p < 2; p++) {
                    fourTake.push(cardInfo[1][p]);
                    fourTake.push(cardInfo[1][p]);
                }
            } else if (cardInfo[0].length >= 2) {
                for (var p = 0; p < 2; p++) {
                    fourTake.push(cardInfo[0][p]);
                }
            }
        }
    }
    var allCardTypes = [];
    if (shunzi.length > 0) {
        allCardTypes.push(shunzi);
    };
    if (liandui.length > 0) {
        allCardTypes.push(liandui);
    };
    if (feiji.length > 0) {
        allCardTypes.push(feiji);
    };
    if (fourTake.length > 0) {
        allCardTypes.push(fourTake);
    };

    if (allCardTypes.length > 1) {
        // 有两种以上牌形
        allCardTypes.sort(function (a, b) {
            if (a.length > b.length) {
                return -1;
            } else if (a.length < b.length) {
                return 1;
            } else {
                return 0;
            }
        });
        return allCardTypes[0];
    } else if (allCardTypes.length == 1) {
        // 只有一种以上牌形
        return allCardTypes[0];
    } else {
        // 以上牌形都没有 再找一下有没有三张
        if (objarr.length > 2) {
            var threeTake = [];
            if (objarr[2].length > 0) {
                // 取三张里面最小的值
                var threeValue = objarr[2][0]
                threeTake.push(threeValue);
                threeTake.push(threeValue);
                threeTake.push(threeValue);
                if (cardInfo[1].length > 0) {
                    threeTake.push(cardInfo[1][0]);
                    threeTake.push(cardInfo[1][0]);
                } else if (cardInfo[0].length > 0) {
                    threeTake.push(cardInfo[0][0]);
                }
                return threeTake;
            }
        } else {
            return [];
        }
    }
    return [];
};

module.exports = cardTypeUtil;