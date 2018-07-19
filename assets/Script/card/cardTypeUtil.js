/*
    新增修改 for wechat game
*/

var gameModel = require('./../game/gameModel')
var cardTypeUtil = {};

/**
 * Created by huyijun on 2016/6/29.
 * 以3--15代表牌值
 * 斗地主普通牌形判断工具类
 */
var cardTypeUtil = cardTypeUtil || {};
// 牌形 和后端牌形一致，只要+100就和服务端的牌形一致
cardTypeUtil.oneCard = 1; //"单张"
cardTypeUtil.doubleCard = 2; //"对子"
cardTypeUtil.threeCard = 3; //"三张不带"
cardTypeUtil.bormCard = 4; //"炸弹（四张）"(包括5到8炸)
cardTypeUtil.rocketCard = 5; //"火箭"
cardTypeUtil.threeTakeOneCard = 6; //"三带一"
cardTypeUtil.threeTakeTwoCard = 7; //"三带二"
cardTypeUtil.fourTakeSingleCard = 8; //"四带二单"
cardTypeUtil.fourTakeDoubleCard = 9; //"四带二双"
cardTypeUtil.sequenceCard = 10; //"顺子"
cardTypeUtil.linkDoubleCard = 11; //"连对(双顺)"
cardTypeUtil.planeTakeNoneCard = 12; //"飞机不带（三顺）"
cardTypeUtil.planeTakeSingleCard = 13; //"飞机带单"
cardTypeUtil.planeTakeDoubleCard = 14; //"飞机带双"
cardTypeUtil.spaceil = 15; //"特殊牌形"
cardTypeUtil.undefindCard = 0; //"无效的牌形"

cardTypeUtil.boomSoft = 104; //"4炸"(软炸)
cardTypeUtil.boomFive = 105; //"5炸"
cardTypeUtil.boomSix = 106; //"6炸"
cardTypeUtil.boomSeven = 107; //"7炸"
cardTypeUtil.boomEight = 108; //"8炸"

cardTypeUtil.smallQueen = 78; //"小王的值"
cardTypeUtil.bigQueen = 79; //"大王的值"

// 获取数值
cardTypeUtil.GetCardValue = function (date) {
    if (date == 79 || date == 78)
        return date;
    if ((date % 16) == 1)
        return 14;
    if ((date % 16) == 2)
        return 15;
    return date & 0x0F;
};

// 获取花色
cardTypeUtil.GetCardColor = function (date) {
    return date & 0xF0;
},

// 逻辑数值
cardTypeUtil.GetCardLogicValue = function (date) {
    if (date == 65 || date == 66) {
        return 10;
    }
    //扑克属性
    var bCardColor = this.GetCardColor(date);
    var bCardValue = this.GetCardValue(date);
    //转换数值
    return (bCardValue > 10) ? (10) : bCardValue;
},

// 获取数组中的最小值
cardTypeUtil.min = function (array) {
    if (array == null) {
        return;
    };
    cardTypeUtil.sortArray(array);
    return array[0];
},

// 获取数组中的最大值
cardTypeUtil.max = function (array) {
    if (array == null) {
        return;
    };
    // 升序排列
    cardTypeUtil.sortArray(array);
    return array[array.length - 1];
},

// 获取数组中当前元素的个数
cardTypeUtil.count = function (array, value) {
    if (array == null || value == null) {
        return 0;
    };
    var len = array.length;
    var num = 0;
    for (var i = 0; i < len; i++) {
        if (array[i] == value) {
            num += 1;
        }
    }
    return num;
},

// 判断目标牌为哪一种牌形并返回结果
cardTypeUtil.getCardType = function (objCardValues) {
    var laiZiNum = cardTypeUtil.count(objCardValues, gameModel.laiZiCardValue);
    if (laiZiNum > 0) {
        var cardType = cardTypeUtil.getLaiZiCardType(objCardValues);
        return cardType;
    }
    var cardType = cardTypeUtil.getCommonCardType(objCardValues);
    return cardType;
}

// 判断目标牌为哪一种牌形并返回结果 没有癞子的普通牌形
cardTypeUtil.getCommonCardType = function (objCardValues) {
    var cardType = cardTypeUtil.isOneToFour(objCardValues);
    if (cardType) return cardType;
    cardType = cardTypeUtil.isRocketCard(objCardValues);
    if (cardType) return cardType;
    cardType = cardTypeUtil.isSequenceCard(objCardValues);
    if (cardType) return cardType;
    cardType = cardTypeUtil.isLinkDoubleCard(objCardValues);
    if (cardType) return cardType;
    cardType = cardTypeUtil.isPlaneTakeNoneCard(objCardValues);
    if (cardType) return cardType;
    cardType = cardTypeUtil.isThreeTakeCard(objCardValues);
    if (cardType) return cardType;
    cardType = cardTypeUtil.isFourTakeCard(objCardValues);
    if (cardType) return cardType;
    cardType = cardTypeUtil.isPlaneCard(objCardValues);
    if (cardType) return cardType;
    cardType = cardTypeUtil.isFiveToEightBoom(objCardValues);
    if (cardType) return cardType;
    return cardTypeUtil.undefindCard;
};

// 判断目标牌为哪一种牌形并返回结果 有癞子的牌
cardTypeUtil.getLaiZiCardType = function (objCardValues) {
    var cardType = cardTypeUtil.isLaiZiOne(objCardValues);
    if (cardType) return cardType;
    cardType = cardTypeUtil.isLaiZiDoubleToThree(objCardValues);
    if (cardType) return cardType;
    cardType = cardTypeUtil.isLaiZiFiveToEight(objCardValues);
    if (cardType) return cardType;
    cardType = cardTypeUtil.isLaiZiThreeTakeX(objCardValues);
    if (cardType) return cardType;
    cardType = cardTypeUtil.isLaiZiFourTakeX(objCardValues);
    if (cardType) return cardType;
    cardType = cardTypeUtil.isLaiZiShunZi(objCardValues);
    if (cardType) return cardType;
    return cardTypeUtil.undefindCard;
};

// 是否为炸弹，4到8都是
cardTypeUtil.isBormCard = function (cardValues) {
    if (cardValues == null) return false;
    if (cardValues.length < 4 || cardValues.length > 8) return false;
    if (cardTypeUtil.setCount(cardValues).length == 1) return true;
    return false;
};

// 是否为5-8炸弹
cardTypeUtil.isFiveToEightBoom = function (cardValues) {
    if (cardValues == null) return false;
    if (cardValues.length < 5 || cardValues.length > 8) return false;
    if (cardTypeUtil.setCount(cardValues).length == 1) return cardValues.length + 100;
    return false;
};

// 单张,对子,三张,炸弹
cardTypeUtil.isOneToFour = function (cardValues) {
    if (cardValues == null || cardValues.length > 4) return false;
    if (cardTypeUtil.min(cardValues) == cardTypeUtil.max(cardValues)) {
        return cardValues.length;
    };
    return false;
};

// 火箭（大小王 王炸）
cardTypeUtil.isRocketCard = function (cardValues) {
    if (cardValues == null || cardValues.length != 2) return false;
    //升序排列
    cardTypeUtil.sortArray(cardValues);
    //第一张小王，第二张大王
    if (cardValues[0] == cardTypeUtil.smallQueen && cardValues[1] == cardTypeUtil.bigQueen) {
        return cardTypeUtil.rocketCard;
    }
    return false;
};

// 是否有大小王
// cardTypeUtil.smallQueen = 16;//"小王的值"
// cardTypeUtil.bigQueen = 17;//"大王的值"
cardTypeUtil.isHasKing = function (cardValues) {
    var len = cardValues.length;
    for (var i = 0; i < len; i++) {
        if (cardValues[i] == cardTypeUtil.smallQueen || cardValues[i] == cardTypeUtil.bigQueen) {
            return true;
        }
    }
    return false;
}

// 顺子
cardTypeUtil.isSequenceCard = function (cardValues) {
    if (cardValues == null || cardValues.length < 5 || cardValues.length > 12) return false;
    if (cardTypeUtil.min(cardValues) < 3 || cardTypeUtil.max(cardValues) > 14) return false;
    if (cardTypeUtil.setCount(cardValues).length != cardValues.length) return false;
    if (cardTypeUtil.max(cardValues) - cardTypeUtil.min(cardValues) == cardValues.length - 1) return cardTypeUtil.sequenceCard;
    return false;
};
//双顺 ,连对（三对或以上连着的对子）
cardTypeUtil.isLinkDoubleCard = function (cardValues) {
    if (cardValues == null || cardValues.length < 6 || cardValues.length % 2 != 0) return false;
    if (cardTypeUtil.min(cardValues) < 3 || cardTypeUtil.max(cardValues) > 14) return false;
    var len = cardValues.length;
    for (var i = 0; i < len; i++) {
        if (cardTypeUtil.count(cardValues, cardValues[i]) != 2) return false;
    }
    if (cardTypeUtil.max(cardValues) - cardTypeUtil.min(cardValues) == cardValues.length / 2 - 1) return cardTypeUtil.linkDoubleCard;
    return false;
};
//三顺,飞机不带
cardTypeUtil.isPlaneTakeNoneCard = function (cardValues) {
    if (cardValues == null || cardValues.length < 6 || cardValues.length % 3 != 0) return false;
    if (cardTypeUtil.min(cardValues) < 3 || cardTypeUtil.max(cardValues) > 14) return false;
    var len = cardValues.length;
    for (var i = 0; i < len; i++) {
        if (cardTypeUtil.count(cardValues, cardValues[i]) != 3) return false;
    }
    if (cardTypeUtil.max(cardValues) - cardTypeUtil.min(cardValues) == cardValues.length / 3 - 1) return cardTypeUtil.planeTakeNoneCard;
    return false;
};
//三带X
cardTypeUtil.isThreeTakeCard = function (cardValues) {
    if (cardValues == null || (cardValues.length != 4 && cardValues.length != 5)) return false;
    var list = cardTypeUtil.setCount(cardValues);
    if (list.length != 2) return false;
    var len = cardValues.length;
    for (var i = 0; i < len; i++) {
        if (cardTypeUtil.count(cardValues, cardValues[i]) == 3) {
            if (cardValues.length == 4) {
                return cardTypeUtil.threeTakeOneCard;
            } else if (cardValues.length == 5) {
                return cardTypeUtil.threeTakeTwoCard;
            }
        }
    }
};
//四带x
cardTypeUtil.isFourTakeCard = function (cardValues) {
    if (cardValues == null || (cardValues.length != 6 && cardValues.length != 8)) return false;
    var list = cardTypeUtil.setCount(cardValues);
    if (list.length != 3) return false;
    var len = cardValues.length;
    for (var i = 0; i < len; i++) {
        if (cardTypeUtil.count(cardValues, cardValues[i]) == 4) {
            if (cardValues.length == 6) {
                return cardTypeUtil.fourTakeSingleCard;
            } else if (cardValues.length == 8) {
                return cardTypeUtil.fourTakeDoubleCard;
            }
        }
    }
    return false;
};


//飞机带翅膀
cardTypeUtil.isPlaneCard = function (cardValues) {
    if (cardValues == null || (cardValues.length < 8)) return false;
    var newList = [];
    cardValues.forEach(function (v) {
        if (cardTypeUtil.count(cardValues, v) == 3) newList.push(v);
    });
    var len = newList.length;
    if (cardTypeUtil.isPlaneTakeNoneCard(newList)) {
        var newLen = cardTypeUtil.setCount(newList).length;
        var pointLen = cardTypeUtil.setCount(cardValues).length;
        if (newLen * 2 == pointLen) {
            if (cardValues.length % 4 == 0) return cardTypeUtil.planeTakeSingleCard;
            else if (cardValues.length % 5 == 0) return cardTypeUtil.planeTakeDoubleCard;
        }
    }
    return false;
}
//获取一组卡牌中有多少个癞子
cardTypeUtil.getLaiZiNum = function (cardIds) {
    var num = 0;
    var len = cardIds;
    for (var i = 0; i < len; i++) {
        if (cardTypeUtil.GetCardColor(cardIds[i]) == 80) {
            num += 1;
        }
    }
    return num;
}
/**
 * 牌形比较
 *  selfCards：自己的牌卡牌ID
 *  objCards：目标牌，敌方牌卡牌ID
 *  返回结果为：selfCards 是否比 objCards 大,是还返回true,否则返回false
 */
cardTypeUtil.compare = function (selfCardIds, objCardIds) {
    if (selfCardIds == null || selfCardIds.length == 0) {
        cc.log("自身牌参数为NULL值或为空数组");
        return false;
    };
    if (objCardIds == null || objCardIds.length == 0) {
        cc.log("目标牌参数为NULL值或为空数组");
        return true;
    };
    var objCards = [];
    objCardIds.forEach(function (v) {
        objCards.push(cardTypeUtil.GetCardValue(v));
    });

    var selfCards = [];
    selfCardIds.forEach(function (v) {
        selfCards.push(cardTypeUtil.GetCardValue(v));
    });

    //判断目标牌形
    var objCardType = cardTypeUtil.getCardType(objCards);
    //判断自身牌形
    var selfCardType = cardTypeUtil.getCardType(selfCards);

    if (objCardType == cardTypeUtil.undefindCard && selfCardType != cardTypeUtil.undefindCard) {
        cc.log("目标牌形为无效牌形");
        return true
    } else if (objCardType != cardTypeUtil.undefindCard && selfCardType == cardTypeUtil.undefindCard) {
        cc.log("自身牌形为无效牌形");
        return false;
    }
    if (selfCardType == objCardType && selfCards.length == objCards.length) {
        //单张，对子，三张，炸弹（四炸），顺子，双顺，三顺
        if (selfCardType == cardTypeUtil.oneCard || selfCardType == cardTypeUtil.doubleCard || selfCardType == cardTypeUtil.threeCard || selfCardType == cardTypeUtil.bormCard || selfCardType == cardTypeUtil.sequenceCard || selfCardType == cardTypeUtil.linkDoubleCard || selfCardType == cardTypeUtil.planeTakeNoneCard) {
            return cardTypeUtil.max(selfCards) > cardTypeUtil.max(objCards);
        } else if (selfCardType == cardTypeUtil.threeTakeOneCard || selfCardType == cardTypeUtil.threeTakeTwoCard || selfCardType == cardTypeUtil.fourTakeSingleCard || selfCardType == cardTypeUtil.fourTakeDoubleCard) {
            var selfNum = 0;
            var selfLen = selfCards.length;
            for (var i = 0; i < selfLen; i++) {
                if (cardTypeUtil.count(selfCards, selfCards[i]) >= 3) selfNum = selfCards[i];
            }
            var objNum = 0;
            var objLen = objCards.length;
            for (var i = 0; i < objLen; i++) {
                if (cardTypeUtil.count(objCards, objCards[i]) >= 3) objNum = objCards[i];
            }
            return selfNum > objNum;
        } else if (selfCardType == cardTypeUtil.planeTakeSingleCard || selfCardType == cardTypeUtil.planeTakeDoubleCard) {
            var selfNumList = [];
            var selfLen = selfCards.length;
            for (var i = 0; i < selfLen; i++) {
                if (cardTypeUtil.count(selfCards, selfCards[i]) >= 3) selfNumList.push(selfCards[i]);
            }
            var objNumList = [];
            var objLen = objCards.length;
            for (var i = 0; i < objLen; i++) {
                if (cardTypeUtil.count(objCards, objCards[i]) >= 3) objNumList.push(objCards[i]);
            }
            return cardTypeUtil.max(selfNumList) > cardTypeUtil.max(objNumList);
        } else if (selfCardType == cardTypeUtil.boomFive || selfCardType == cardTypeUtil.boomSix || selfCardType == cardTypeUtil.boomSeven || selfCardType == cardTypeUtil.boomEight) {
            var selfLaiZiNum = cardTypeUtil.getLaiZiNum(selfCardIds);
            var objLaiZiNum = cardTypeUtil.getLaiZiNum(objCardIds);
            if (selfLaiZiNum == objLaiZiNum) return cardTypeUtil.max(selfCards) > cardTypeUtil.max(objCards);
            else return selfLaiZiNum < objLaiZiNum;
        }
    } else {
        if (selfCardType == cardTypeUtil.rocketCard) {
            return true;
        } else if (objCardType == cardTypeUtil.rocketCard) {
            return false;
        } else if (selfCardType == cardTypeUtil.boomSeven && objCardType != cardTypeUtil.boomEight) {
            return true;
        } else if (selfCardType == cardTypeUtil.boomSix && objCardType != cardTypeUtil.boomEight && objCardType != cardTypeUtil.boomSeven) {
            return true;
        } else if (selfCardType == cardTypeUtil.boomFive && objCardType != cardTypeUtil.boomEight && objCardType != cardTypeUtil.boomSeven && objCardType != cardTypeUtil.boomSix) {
            return true;
        } else if (selfCardType == cardTypeUtil.bormCard && objCardType != cardTypeUtil.boomEight && objCardType != cardTypeUtil.boomSeven && objCardType != cardTypeUtil.boomSix && objCardType != cardTypeUtil.boomFive) {
            return true;
        } else if (selfCardType == cardTypeUtil.boomSoft && objCardType != cardTypeUtil.bormCard && objCardType != cardTypeUtil.boomEight && objCardType != cardTypeUtil.boomSeven && objCardType != cardTypeUtil.boomSix && objCardType != cardTypeUtil.boomFive) {
            return true;
        } else {
            return false;
        }
    }
}
/**
*
癞子牌形判断
 */
//单张
cardTypeUtil.isLaiZiOne = function (cardValues) {
    if (cardValues == null || cardValues.length != 1) return false;
    if (cardValues[0] == gameModel.laiZiCardValue) {
        return cardTypeUtil.oneCard;
    };
    return 0;
};
//对子 三张
cardTypeUtil.isLaiZiDoubleToThree = function (cardValues) {
    if (cardValues == null || cardValues.length > 4) return false;
    if (cardTypeUtil.isHasKing(cardValues)) return false;
    var laiZiNum = cardTypeUtil.count(cardValues, gameModel.laiZiCardValue);
    if (laiZiNum > 0) {
        if (cardTypeUtil.setCount(cardValues).length == 2) {
            return cardValues.length;
        }
    }
    return 0;
};
//四炸到8炸
cardTypeUtil.isLaiZiFiveToEight = function (cardValues) {
    if (cardValues == null || cardValues.length < 4 || cardValues.length > 8) return false;
    if (cardTypeUtil.isHasKing(cardValues)) return false;
    var laiZiNum = cardTypeUtil.count(cardValues, gameModel.laiZiCardValue);
    if (laiZiNum > 0) {
        if (cardTypeUtil.setCount(cardValues).length == 2) {
            return cardValues.length + 100;
        } else if (cardTypeUtil.setCount(cardValues).length == 1) {
            return cardTypeUtil.bormCard;
        }
    }
    return 0;
};

//三带X
cardTypeUtil.isLaiZiThreeTakeX = function (cardValues) {
    if (cardValues == null || cardValues.length < 4 || cardValues.length > 5) return 0;
    //if( cardTypeUtil.isHasKing( cardValues ) ) return 0;
    var laiZiNum = cardTypeUtil.count(cardValues, gameModel.laiZiCardValue);
    if (laiZiNum > 0) {
        if (cardTypeUtil.setCount(cardValues).length == 3) {
            if ((cardValues.length - 3) == 1) {
                return cardTypeUtil.threeTakeOneCard;
            } else if ((cardValues.length - 3) == 2) {
                return cardTypeUtil.threeTakeTwoCard;
            }
        }
    }
    return 0;
};
//四带X
cardTypeUtil.isLaiZiFourTakeX = function (cardValues) {
    if (cardValues == null || (cardValues.length != 6 && cardValues.length != 8)) return 0;
    //if( cardTypeUtil.isHasKing( cardValues ) ) return 0;
    var laiZiNum = cardTypeUtil.count(cardValues, gameModel.laiZiCardValue);
    var len = cardValues.length;
    if (laiZiNum > 0) {
        if (cardTypeUtil.setCount(cardValues).length == 4) {
            if (laiZiNum == 1) {
                //只有一张癞子的时候必须要一组三张相同的牌且只有一组，在8张的时候有可能两组三张相同的牌，一张癞子，一张单牌，这种情况要排除
                var threeNum = 0
                for (var i = 0; i < len; i++) {
                    var num = cardTypeUtil.count(cardValues, cardValues[i]);
                    if (num == 3) {
                        threeNum += 1;
                    }
                }
                if (threeNum == 1) {
                    return len / 2 + 5;
                }
            } else {
                return len / 2 + 5;
            }
        } //else if( cardTypeUtil.setCount(cardValues).length == 3 )未完
    }
    return 0;
};
//顺子
cardTypeUtil.isLaiZiShunZi = function (cardValues) {
    if (cardValues == null || cardValues.length < 5) return 0;
    if (cardTypeUtil.isHasKing(cardValues)) return 0; //顺子中不能有大小王
    var bigNum = cardTypeUtil.count(cardValues, 15); //顺子中不能有2
    if (bigNum > 0) return 0;
    var laiZiNum = cardTypeUtil.count(cardValues, gameModel.laiZiCardValue);
    var len = cardValues.length;
    var removeLiaziValues = cardTypeUtil.removeLaiZi(cardValues);
    cardTypeUtil.sortArray(removeLiaziValues);
    var rlen = removeLiaziValues.length;
    if (cardTypeUtil.setCount(removeLiaziValues).length < rlen) return 0; //顺子中不能有相同的牌
    //这一组牌中有多少不连续点，且不连续点之间差多少值。
    if (laiZiNum == 1) {
        //最多只有一个不连续点，且差值<=2
        var breakPointNum = cardTypeUtil.getBreakPointByValue(removeLiaziValues, 3);
        if (breakPointNum > 0) return 0; //差值大于2
        breakPointNum = cardTypeUtil.getBreakPointByValue(removeLiaziValues, 2);
        if (breakPointNum > 1) return 0; //不连续点有多个
        return cardTypeUtil.sequenceCard;
    } else if (laiZiNum == 2) {
        //最多有两个不连续点， 二个：且两个不连续点的差值等于2 一个：不连续点差值小于等于3
        var breakPointNum = cardTypeUtil.getBreakPointByValue(removeLiaziValues, 2);
        if (breakPointNum > 2) return 0;
        if (breakPointNum == 2) {
            var bnum = cardTypeUtil.getBreakPointByValue(removeLiaziValues, 3);
            if (bnum > 0) {
                return 0;
            } else {
                return cardTypeUtil.sequenceCard;
            }
        } else if (breakPointNum == 1) {
            var bnum = cardTypeUtil.getBreakPointByValue(removeLiaziValues, 4);
            if (bnum > 0) {
                return 0;
            } else {
                return cardTypeUtil.sequenceCard;
            }
        } else {
            return cardTypeUtil.sequenceCard;
        }
    } else if (laiZiNum == 3) {
        //最多有三个不连续点，三个:三个不连续点的差值都等于2 二个：只能有一个不连续点差值可以等于3  一个：差值必须小于4
        var breakPointNum = cardTypeUtil.getBreakPointByValue(removeLiaziValues, 2);
        if (breakPointNum > 3) {
            return 0;
        } else if (breakPointNum == 3) {
            var sNum = cardTypeUtil.getBreakPointByValue(removeLiaziValues, 3);
            if (sNum > 0) {
                return 0;
            } else {
                return cardTypeUtil.sequenceCard;
            }
        } else if (breakPointNum == 2) {
            var sNum = cardTypeUtil.getBreakPointByValue(removeLiaziValues, 4);
            if (sNum > 0) {
                return 0;
            } else {
                sNum = cardTypeUtil.getBreakPointByValue(removeLiaziValues, 3);
                if (sNum > 1) {
                    return 0;
                }
                return cardTypeUtil.sequenceCard;
            }
        } else if (breakPointNum == 1) {
            var sNum = cardTypeUtil.getBreakPointByValue(removeLiaziValues, 5);
            if (sNum > 0) {
                return 0;
            } else {
                return cardTypeUtil.sequenceCard;
            }
        } else {
            return cardTypeUtil.sequenceCard;
        }
    } else if (laiZiNum == 4) {
        return 0;
    }
}
//连对
cardTypeUtil.isLaiZiDoubleLink = function (cardValues) {
    if (cardValues == null || cardValues.length < 6 || cardValues.length % 2 != 0) return 0;
    if (cardTypeUtil.isHasKing(cardValues)) return 0;
    var bigNum = cardTypeUtil.count(cardValues, 15); //连对中不能有2
    if (bigNum > 0) return 0;
    var laiZiNum = cardTypeUtil.count(cardValues, gameModel.laiZiCardValue);
    var len = cardValues.length;
    if (laiZiNum == 1) {
        //去重以后的长度只能等于数组的长度除2 + 1
        var arr = cardTypeUtil.setCount(cardValues);
        if (arr.length != len / 2 + 1) return 0;
        var removeLaiziValure = cardTypeUtil.removeLaiZi(arr);
        if (cardTypeUtil.isSequenceCard(removeLaiziValure)) {
            return cardTypeUtil.isLinkDoubleCard;
        } else {
            return 0;
        }
    } else if (laiZiNum == 2 || laiZiNum == 3) {
        //去重以后的长度只能等于数组的长度除2 + 1 ,或者等于数组的长度除2
        var arr = cardTypeUtil.setCount(cardValues);
        if (arr.length != (len / 2 + 1) && arr.length != len / 2) return 0;
        if (arr.length == (len / 2 + 1)) {
            var removeLaiziValure = cardTypeUtil.removeLaiZi(arr);
            if (cardTypeUtil.isSequenceCard(removeLaiziValure)) {
                return cardTypeUtil.isLinkDoubleCard;
            } else {
                return 0;
            }
        } else if (arr.length == len / 2) {
            if (cardTypeUtil.isLaiZiShunZi(arr)) {
                return cardTypeUtil.isLinkDoubleCard;
            } else {
                return 0;
            }
        }
    } else if (laiZiNum == 4) {
        return 0; //暂时
        ////去重以后的长度只能等于数组的长度除2 + 1 ,或者等于数组的长度除2 或者等于数组的长度除2 -1
        //var arr = cardTypeUtil.setCount(cardValues);
        //if( arr.length != (len/2 + 1) && arr.length != len/2 && arr.length != len/2 - 1 ) return 0;
        //if( arr.length == (len/2 + 1) ){
        //    var removeLaiziValure = cardTypeUtil.removeLaiZi(arr);
        //    if( cardTypeUtil.isSequenceCard( removeLaiziValure ) ){
        //        return cardTypeUtil.isLinkDoubleCard;
        //    }else{
        //        return 0;
        //    }
        //}else if( arr.length == len/2 ){
        //    if( cardTypeUtil.isLaiZiShunZi(arr) ){
        //        return cardTypeUtil.isLinkDoubleCard;
        //    }else{
        //        return 0;
        //    }
        //}else if( arr.length == len/2 - 1){
        //
        //}
    }
}
//飞机不带
cardTypeUtil.isLaiZiPlaneTakeNone = function (cardValues) {
    if (cardValues == null || cardValues.length < 6 || cardValues.length % 3 != 0) return 0;
    if (cardTypeUtil.isHasKing(cardValues)) return 0;
    var bigNum = cardTypeUtil.count(cardValues, 15); //飞机不带中不能有2
    if (bigNum > 0) return 0;
    var laiZiNum = cardTypeUtil.count(cardValues, gameModel.laiZiCardValue);
    var len = cardValues.length;
    if (laiZiNum == 1 || laiZiNum == 2) {
        //去重以后的长度只能等于数组的长度除3 + 1
        var arr = cardTypeUtil.setCount(cardValues);
        if (arr.length != len / 3 + 1) return 0;
        var removeLaiziValure = cardTypeUtil.removeLaiZi(arr);
        if (cardTypeUtil.getBreakPointByValue(removeLaiziValure, 2) == 0) {
            return cardTypeUtil.planeTakeNoneCard;
        } else {
            return 0;
        }
    } else if (laiZiNum == 3) {
        //去重以后的长度只能等于数组的长度除3 + 1 ,或者等于数组的长度除3
        var arr = cardTypeUtil.setCount(cardValues);
        if (arr.length != len / 3 + 1 && arr.length != len / 3) return 0;
        if (arr.length == len / 3 + 1) {
            var removeLaiziValure = cardTypeUtil.removeLaiZi(arr);
            if (cardTypeUtil.getBreakPointByValue(removeLaiziValure, 2) == 0) {
                return cardTypeUtil.planeTakeNoneCard;
            } else {
                return 0;
            }
        } else if (arr.length == len / 3) {
            var removeLaiziValure = cardTypeUtil.removeLaiZi(arr);
            if (removeLaiziValure.length == 1) return cardTypeUtil.planeTakeNoneCard;
            if (cardTypeUtil.getBreakPointByValue(removeLaiziValure, 3) > 0) {
                return 0;
            } else {
                if (cardTypeUtil.getBreakPointByValue(removeLaiziValure, 2) > 1) {
                    return 0;
                } else {
                    return cardTypeUtil.planeTakeNoneCard;
                }
            }
        }
    } else if (laiZiNum == 4) {
        return 0;
    }
}
//飞机带翅膀
cardTypeUtil.isLaiZiPlane = function (cardValues) {
    if (cardValues == null || cardValues.length < 8 || (cardValues.length % 4 != 0 && cardValues.length % 5 != 0)) return 0;
    var laiZiNum = cardTypeUtil.count(cardValues, gameModel.laiZiCardValue);
    var len = cardValues.length;
    if (laiZiNum == 1) {
        if (len % 4 == 0) { //带单
            //去重以后的长度只能等于数组的长度除4*2 ,或者等于数组的长度除4*2 + 1
            var arr = cardTypeUtil.setCount(cardValues);
            if (arr.length != len * 2 / 4 && arr.length != len * 2 / 4 + 1) return 0;
            if (arr.length == len * 2 / 4) {
                if (cardTypeUtil.isPlaneTakeSingleCard(cardValues)) { //将癞子当普通值去做普通判断即可
                    return cardTypeUtil.planeTakeSingleCard;
                } else {
                    return 0;
                }
            } else if (arr.length == len * 2 / 4 + 1) {
                var planeArr = [];
                for (var i = 0; i < len; i++) {
                    var vLen = cardTypeUtil.count(cardValues, cardValues[i]);
                    if (vLen != 1 || cardValues[i] == gameModel.laiZiCardValue) {
                        planeArr.push(cardValues[i]);
                    }
                }
                if (cardTypeUtil.isLaiZiPlaneTakeNone(planeArr)) { //去掉不相干的单牌，去做飞机不带的癞子判断即可
                    return cardTypeUtil.planeTakeSingleCard;
                } else {
                    return 0;
                }
            }
        } else if (len % 5 == 0) { //带双
            //去重以后的长度只能等于数组的长度除5 * 2 + 1
            var arr = cardTypeUtil.setCount(cardValues);
            if (arr.length != cardValues.length * 2 / 5 + 1) return 0; //3,3,3,4,4,4,5,5,6,7,8 ,5
            var planeArr = []; //组成飞机可以的数据
            var rArr = []; //被丢弃的数据
            for (var i = 0; i < len; i++) {
                var vLen = cardTypeUtil.count(cardValues, cardValues[i]);
                if (vLen != 2 || cardValues[i] == gameModel.laiZiCardValue) {
                    planeArr.push(cardValues[i]);
                }
            }
            var rPlaneArr = cardTypeUtil.removeLaiZi(planeArr);
            for (var k = 0; k < rPlaneArr.length; k++) { //从丢弃的数组中找出一对和现有的牌相邻的牌
                var hasFind = false;
                for (var s = 0; s < rArr.length; s++) {
                    if (rArr[s] - rPlaneArr[k] == 1 || rArr[s] - rPlaneArr[k] == -1) {
                        planeArr.push(rArr[s]);
                        planeArr.push(rArr[s]);
                        hasFind = true;
                        break;
                    }
                }
                if (hasFind) break;
            }
            if (cardTypeUtil.isLaiZiPlaneTakeNone(planeArr)) {
                return cardTypeUtil.planeTakeSingleCard;
            } else {
                return 0;
            }
        }
    } else if (laiZiNum == 2) {
        if (len % 4 == 0) { //带单
            //去重以后的长度只能等于数组的长度除4*2 + 1 ,或者等于数组的长度除4*2,或者等于数组的长度除4*2-1,
            var arr = cardTypeUtil.setCount(cardValues);
            if (arr.length != len * 2 / 4 + 1 && arr.length != len * 2 / 4 && arr.length != (len * 2 / 4 - 1)) return 0;
            if (arr.length == (len * 2 / 4 + 1)) {
                var planeArr = []; //组成飞机可以的数据
                var rArr = []; //被丢弃的数据
                for (var i = 0; i < len; i++) {
                    var vLen = cardTypeUtil.count(cardValues, cardValues[i]);
                    if (vLen != 1 || cardValues[i] == gameModel.laiZiCardValue) {
                        planeArr.push(cardValues[i]);
                    }
                }
                var rPlaneArr = cardTypeUtil.removeLaiZi(planeArr);
                for (var k = 0; k < rPlaneArr.length; k++) { //从丢弃的数组中找出一张和现有的牌相邻的牌
                    var hasFind = false;
                    for (var s = 0; s < rArr.length; s++) {
                        if (rArr[s] - rPlaneArr[k] == 1 || rArr[s] - rPlaneArr[k] == -1) {
                            planeArr.push(rArr[s]);
                            hasFind = true;
                            break;
                        }
                    }
                    if (hasFind) break;
                }
                if (cardTypeUtil.isLaiZiPlaneTakeNone(planeArr)) {
                    return cardTypeUtil.planeTakeSingleCard;
                } else {
                    return 0;
                }
            } else if (arr.length == (len * 2 / 4)) {
                var planeArr = []; //组成飞机可以的数据
                for (var i = 0; i < len; i++) {
                    var vLen = cardTypeUtil.count(cardValues, cardValues[i]);
                    if (vLen != 1 && cardValues[i] != gameModel.laiZiCardValue) { //这次将癞子也过滤掉，
                        planeArr.push(cardValues[i]);
                    }
                }
                planeArr.push(gameModel.laiZiCardValue); //只加入一张癞子值
                if (cardTypeUtil.isLaiZiPlaneTakeNone(planeArr)) {
                    return cardTypeUtil.planeTakeSingleCard;
                } else {
                    return 0;
                }
            } else if (arr.length == (len * 2 / 4 - 1)) {
                var planeArr = []; //组成飞机可以的数据
                for (var i = 0; i < len; i++) {
                    var vLen = cardTypeUtil.count(cardValues, cardValues[i]);
                    if (vLen != 1 && vLen != 2) { //过滤掉，单张和对子
                        planeArr.push(cardValues[i]);
                    }
                }
                if (cardTypeUtil.isPlaneTakeNoneCard(planeArr)) {
                    return cardTypeUtil.planeTakeSingleCard;
                } else {
                    return 0;
                }
            }
        } else if (len % 5 == 0) { //带双
            //去重以后的长度只能等于数组的长度除5*2 ,或者等于数组的长度除5*2 + 1
        }
    } else if (laiZiNum == 3) {

    }
}
//removeLiaziValues:除去癞子的数组，
//chaValue：差值>=chaValue的不连续点
cardTypeUtil.getBreakPointByValue = function (removeLiaziValues, chaValue) {
    var breakPointNum = 0;
    var rlen = removeLiaziValues.length;
    for (var i = 0; i < (rlen - 1); i++) {
        if (removeLiaziValues[i + 1] - removeLiaziValues[i] >= chaValue) {
            breakPointNum += 1;
        }
    }
    return breakPointNum;
}
//升序排列目标数组
cardTypeUtil.sortArray = function (array) {
    //升序排列
    array.sort(function (a, b) {
        if (a > b) {
            return 1;
        } else if (a < b) {
            return -1;
        } else {
            return 0;
        }
    });
}

//将目标数组中的癞子除去，并返回该数组
cardTypeUtil.removeLaiZi = function (cardValues) {
    var len = cardValues.length;
    var arr = [];
    for (var i = 0; i < len; i++) {
        if (cardValues[i] != gameModel.laiZiCardValue) {
            arr.push(cardValues[i]);
        }
    }
    return arr;
}
//找出目标牌objCards中所有的num张的相同的牌的牌值，
cardTypeUtil.takeSameCardValue = function (objCards, num) {
    var objNumList = [];
    var objLen = objCards.length;
    for (var i = 0; i < objLen; i++) {
        if (cardTypeUtil.count(objCards, objCards[i]) == num && objNumList.indexOf(objCards[i]) == -1) {
            objNumList.push(objCards[i]);
        }
    }
    //升序排列
    cardTypeUtil.sortArray(objNumList);
    return objNumList;
}
//自动提取出目标牌中含有的牌形并返还长度最长的一种牌形(少于5张牌的不判断)
cardTypeUtil.autoTakeOutCardType = function (cardValues) {
    if (cardValues.length == 0 || cardValues == null) {
        cc.log("参数有误 你没有选牌");
        return null;
    }
    var len = cardValues.length;
    if (len < 5) {
        return false
    };
    //升序排列
    cardValues.sort(function (a, b) {
        if (a.cardValue > b.cardValue) {
            return 1;
        } else if (a.cardValue < b.cardValue) {
            return -1;
        } else {
            return 0;
        }
    });
    //检测顺序，检测可能多张的牌形，顺子，双顺，飞机，四带一，四带二然后做比较，张数多的为拉起
    var shunzi = cardTypeUtil.findShunZi(cardValues);
    //牌型信息
    var cardInfo = cardTypeUtil.getCardInfo(cardValues);
    //去重后的所有牌组
    var objarr = [];
    cardTypeUtil.setCountOver(cardValues, objarr);
    var liandui = [];
    var feiji = [];
    var fourTake = [];
    if (objarr.length > 1) {
        var duishun = cardTypeUtil.findShunZi(objarr[1], 3);
        //有连对
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
        //有飞机
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
    //有炸弹
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

    if (allCardTypes.length > 1) { //有两种以上牌形
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
    } else if (allCardTypes.length == 1) { //只有一种以上牌形
        return allCardTypes[0];
    } else { //以上牌形都没有 再找一下有没有三张
        if (objarr.length > 2) {
            var threeTake = [];
            if (objarr[2].length > 0) {
                var threeValue = objarr[2][0] //取三张里面最小的值
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
//找出目标牌中所有的顺子,并返回长度最长的一组顺子
//counts可不传参数，如果传了就默认这个长度为顺子找出并返回，
cardTypeUtil.findShunZi = function (objcardValue, counts) {
    if (objcardValue.length == 0 || objcardValue == null) {
        cc.log("参数有误00000000000000");
        return [];
    }
    var count = counts ? counts : 5;
    var cardValues = cardTypeUtil.setCount(objcardValue);
    var len = cardValues.length;
    var shuiContainer = [];
    var shunzi = [];
    for (var i = 0; i < len; i++) {
        if (cardValues[i] == cardValues[i + 1] - 1) {
            if (cardValues[i] < 15) { // 2或者王以上的值不能加入顺子
                shuiContainer.push(cardValues[i]);
            }
        } else {
            if (cardValues[i] < 15) {
                shuiContainer.push(cardValues[i]);
            }
            if (shuiContainer.length >= count) {
                shunzi.push(shuiContainer.slice(0));
                shuiContainer = [];
            } else {
                shuiContainer = [];
            }
        }
    }
    if (shunzi.length == 0) {
        return shunzi;
    }
    if (shunzi.length > 1) {
        shunzi.sort(function (a, b) {
            if (a.length > b.length) {
                return -1;
            } else if (a.length < b.length) {
                return 1;
            } else {
                return 0;
            }
        });
    }
    return shunzi[0];
};

//在selfCardValue中找出所有的比objcardShunZi顺子大的顺子
cardTypeUtil.findAllBigShunZi = function (selfCardValue, objcardShunZi) {
    if (objcardShunZi.length == 0 || objcardShunZi == null) {
        cc.log("目标顺子数组有误00000000000000");
        return [];
    }
    if (selfCardValue.length == 0 || selfCardValue == null) {
        cc.log("自己数组有误00000000000000");
        return [];
    }
    //目标顺子的长度 objLen 和最小值 objMin
    var objLen = objcardShunZi.length;
    var objMin = cardTypeUtil.min(objcardShunZi);

    var cardValues = cardTypeUtil.setCount(selfCardValue);
    //升序排列
    cardTypeUtil.sortArray(cardValues);
    var selfCardValues = [];
    for (var p = 0; p < cardValues.length; p++) {
        if (cardValues[p] > objMin) {
            selfCardValues = cardValues.slice(p);
            break;
        }
    }
    //截取所有比目标顺子最小值大的值集合的长度如果小于目标顺子的长度，返回空
    if (selfCardValues.length < objLen) return [];
    var len = selfCardValues.length;
    var shunZi = [];
    for (var k = 0; k < len; k++) {
        //每次找一组就行，
        var shuiContainer = [];
        for (var i = k; i < len; i++) {
            if (selfCardValues[i] == selfCardValues[i + 1] - 1) {
                if (selfCardValues[i] < 15) { // 2或者王以上的值不能加入顺子
                    shuiContainer.push(selfCardValues[i]);
                    if (shuiContainer.length >= objLen) {
                        if (shunZi.length > 0) {
                            if (shunZi[shunZi.length - 1][0] != shuiContainer[0]) {
                                shunZi.push(shuiContainer);
                            }
                        } else {
                            shunZi.push(shuiContainer);
                        }
                        break;
                    }
                }
            } else {
                if (selfCardValues[i] < 15) {
                    shuiContainer.push(selfCardValues[i]);
                    if (shuiContainer.length >= objLen) {
                        if (shunZi.length > 0) {
                            if (shunZi[shunZi.length - 1][0] != shuiContainer[0]) {
                                shunZi.push(shuiContainer);
                            }
                        } else {
                            shunZi.push(shuiContainer);
                        }
                    }
                }
                break;
            }
        }
    }
    return shunZi;
};

//在selfCardValue中找出所有的比objcardShunZi顺子大的顺子
cardTypeUtil.findAllBigLaiZiShunZi = function (selfCardValue, objcardShunZi) {
    if (objcardShunZi.length == 0 || objcardShunZi == null) {
        cc.log("目标顺子数组有误");
        return [];
    }
    if (selfCardValue.length == 0 || selfCardValue == null) {
        cc.log("自己数组有误");
        return [];
    }
    //目标顺子的长度 objLen 和最小值 objMin
    var objLen = objcardShunZi.length;
    var objMin = cardTypeUtil.min(objcardShunZi);
    var objMax = cardTypeUtil.max(objcardShunZi);
    if (objMax == 14) return []; //对方为最大的顺子
    //自己的最大值
    var selfMax = cardTypeUtil.max(selfCardValue);
    var cardValues = cardTypeUtil.setCount(selfCardValue);
    //升序排列
    cardValues.sort(function (a, b) {
        if (a > b) {
            return 1;
        } else if (a < b) {
            return -1;
        } else {
            return 0;
        }
    });
    var selfCardValues = [];
    for (var p = 0; p < cardValues.length; p++) {
        if (cardValues[p] > objMin) {
            selfCardValues.push(cardValues[p]);
        }
    }
    //截取所有比目标顺子最小值大的值集合的长度如果小于目标顺子的长度，返回空
    if ((selfCardValues.length + gameModel.laiZiCardNum) < objLen) return [];
    var len = selfCardValues.length;
    var shunZi = [];
    for (var k = 0; k < len; k++) {
        //每次找一组就行，
        var shuiContainer = [];
        //这一轮循环 ,已使用的laizi值
        var laiziHasUseNum = 0;
        for (var i = k; i < len; i++) {
            if (selfCardValues[i] == selfCardValues[i + 1] - 1) {
                if (selfCardValues[i] < 15) { // 2或者王以上的值不能加入顺子
                    //如果当前这个值正好是癞子，则被用为他本身值，癞子消耗一个
                    if (selfCardValues[i] == gameModel.laiZiCardValue) {
                        laiziHasUseNum += 1;
                    }
                    shuiContainer.push(selfCardValues[i]);
                    if (shuiContainer.length >= objLen) {
                        if (shunZi.length > 0) {
                            if (shunZi[shunZi.length - 1][0] != shuiContainer[0]) {
                                shunZi.push(shuiContainer);
                            }
                        } else {
                            shunZi.push(shuiContainer);
                        }
                        break;
                    }
                }
            } else {
                if (selfCardValues[i] < 15 || (gameModel.laiZiCardValue == 15 && selfCardValues[i] == 15)) {
                    //如果当前这个值正好是癞子，则被用为他本身值，癞子消耗一个
                    if (selfCardValues[i] == gameModel.laiZiCardValue) {
                        laiziHasUseNum += 1;
                    }
                    shuiContainer.push(selfCardValues[i]);
                    if (shuiContainer.length >= objLen) {
                        if (shunZi.length > 0) {
                            if (shunZi[shunZi.length - 1][0] != shuiContainer[0]) {
                                shunZi.push(shuiContainer);
                            }
                        } else {
                            shunZi.push(shuiContainer);
                        }
                        break;
                    } else {
                        var chaZhi = null; //中间差值表示需要多少个laizi来填补
                        var needLaiziNUM = objLen - shuiContainer.length;
                        if (selfCardValues[i] == selfMax) { //当前这个值已是最大值
                            chaZhi = 0
                        } else {
                            chaZhi = selfCardValues[i + 1] - selfCardValues[i] - 1;
                        }
                        if ((gameModel.laiZiCardNum - laiziHasUseNum) >= chaZhi) {
                            var addLNum = needLaiziNUM < chaZhi ? needLaiziNUM : chaZhi;
                            for (var m = 0; m < addLNum; m++) {
                                shuiContainer.push(gameModel.laiZiCardValue);
                            }
                            laiziHasUseNum += addLNum;
                            if (shuiContainer.length >= objLen) {
                                if (shunZi.length > 0) {
                                    if (shunZi[shunZi.length - 1][0] != shuiContainer[0]) {
                                        shunZi.push(shuiContainer);
                                    }
                                } else {
                                    shunZi.push(shuiContainer);
                                }
                                break;
                            }
                        } else if ((gameModel.laiZiCardNum - laiziHasUseNum) >= needLaiziNUM) {
                            for (var m = 0; m < needLaiziNUM; m++) {
                                shuiContainer.push(gameModel.laiZiCardValue);
                            }
                            laiziHasUseNum += needLaiziNUM;
                            if (shuiContainer.length >= objLen) {
                                if (shunZi.length > 0) {
                                    if (shunZi[shunZi.length - 1][0] != shuiContainer[0]) {
                                        shunZi.push(shuiContainer);
                                    }
                                } else {
                                    shunZi.push(shuiContainer);
                                }
                                break;
                            }
                        } else {
                            break;
                        }
                    }
                } else {
                    break;
                }
            }
        }
    }
    shunZi.sort(function (a, b) {
        var aCout = cardTypeUtil.count(a, gameModel.laiZiCardValue);
        var bCout = cardTypeUtil.count(b, gameModel.laiZiCardValue);
        if (aCout > bCout) {
            return 1;
        } else if (aCout > bCout) {
            return -1;
        } else {
            return 0;
        }
    });
    return shunZi;
};
//在selfCardValue中找出所有的比objcardShunZi顺子大的顺子
cardTypeUtil.findAllBigLaiZiShuangShunZi = function (cardValues, selfSetValue, objcardShunZi, olen) {

    var allShunZi = cardTypeUtil.findAllBigLaiZiShunZi(selfSetValue, objcardShunZi);

    var objLen = objcardShunZi.length;
    var slen = allShunZi.length;
    if (slen == 0) {
        return [];
    } else {
        for (var i = slen - 1; i >= 0; i--) {
            var slLen = allShunZi[i].length;
            var needLaizi = 0;
            for (var m = 0; m < slLen; m++) {
                var mcount = cardTypeUtil.count(cardValues, allShunZi[i][m]);
                //计算缺的laizi值
                if (olen - mcount > 0) {
                    needLaizi += olen - mcount;
                }
                //将现有的需要的值加上
                var flen = mcount < olen ? mcount : olen;
                for (var p = 0; p < flen - 1; p++) {
                    allShunZi[i].push(allShunZi[i][m]);
                }
            }
            //已使用了的laizi个数
            var hasUseLaizi = cardTypeUtil.count(allShunZi[i], gameModel.laiZiCardValue);
            if (gameModel.laiZiCardNum - hasUseLaizi >= needLaizi) {
                for (var k = 0; k < needLaizi; k++) {
                    allShunZi[i].push(gameModel.laiZiCardValue);
                }
            } else {
                allShunZi.splice(i, 1); //没有足够的laizi补冲这个顺子删除掉
            }
        }
        allShunZi.sort(function (a, b) {
            var aCout = cardTypeUtil.count(a, gameModel.laiZiCardValue);
            var bCout = cardTypeUtil.count(b, gameModel.laiZiCardValue);
            if (aCout > bCout) {
                return 1;
            } else if (aCout < bCout) {
                return -1;
            } else {
                return 0;
            }
        });
        return allShunZi;
    }
}
//目标牌去重以后的牌
cardTypeUtil.setCount = function (cardValues) {
    //复制一份数据，不能改变原来的数组
    var copyValues = cardValues.slice(0);
    //升序排列
    copyValues.sort(function (a, b) {
        if (a > b) {
            return 1;
        } else if (a < b) {
            return -1;
        } else {
            return 0;
        }
    });
    //去重以后的牌
    var arr = [copyValues[0]];
    var len = copyValues.length;
    for (var i = 1; i < len; i++) {
        if (arr[arr.length - 1] != copyValues[i]) {
            arr.push(copyValues[i]);
        }
    }
    return arr;
};
//将目标牌分割为去重的牌，和重复的牌值，返回这两个数组
cardTypeUtil.setCountAndDouble = function (cardValues) {
    //升序排列
    cardTypeUtil.sortArray(cardValues);
    var objarr = [];
    //去重以后的牌
    var arr = [cardValues[0]];
    var len = cardValues.length;
    //重复牌
    var brr = [];
    for (var i = 1; i < len; i++) {
        if (arr[arr.length - 1] != cardValues[i]) {
            arr.push(cardValues[i]);
        } else {
            brr.push(cardValues[i]);
        }
    }
    objarr.push(arr);
    objarr.push(brr);
    return objarr;
};
//将目牌层层去重直到没有重复的牌为止
cardTypeUtil.setCountOver = function (arr, objArr) {
        var aa = cardTypeUtil.setCountAndDouble(arr);
        objArr.push(aa[0]);
        if (aa[1].length > 1) {
            cardTypeUtil.setCountOver(aa[1], objArr);
        } else {
            objArr.push(aa[1]);
        }
    },
    //分析目标牌得到牌的信息
    //一共返回四个数组 里面第一个数组将存入所有的单牌，第二个数组将存入所有的对子，依次类推 每个数组里面的值都为去重的值，
    cardTypeUtil.getCardInfo = function (cardValues) {
        if (cardValues == null || cardValues.length == 0) {
            cc.log("参数无效111111");
            return;
        }
        //要返回的数组，里面第一个数组将存入所有的单牌，第二个数组将存入所有的对子，依次类推
        var returnArray = [];
        var objarray = [];
        //将cardValues分割为所有不重复的牌组并把分割后的所有数组加入到objarray
        cardTypeUtil.setCountOver(cardValues, objarray);
        var singleArr = [];
        if (objarray.length > 1 && objarray[1].length > 0) {
            var len = objarray[0].length;
            for (var i = 0; i < len; i++) {
                if (objarray[1].indexOf(objarray[0][i]) == -1) {
                    singleArr.push(objarray[0][i]);
                }
            }
        } else {
            singleArr = objarray[0];
        }
        var doubleArr = [];
        if (objarray.length > 2 && objarray[2].length > 0) {
            var len = objarray[1].length;
            for (var i = 0; i < len; i++) {
                if (objarray[2].indexOf(objarray[1][i]) == -1) {
                    doubleArr.push(objarray[1][i]);
                }
            }
        } else {
            if (objarray.length >= 2) {
                doubleArr = objarray[1];
            };
        }
        var threeArr = [];
        var boomArr = [];
        if (objarray.length > 3 && objarray[3].length > 0) {
            boomArr = objarray[3];
            var len = objarray[2].length;
            for (var i = 0; i < len; i++) {
                if (objarray[3].indexOf(objarray[2][i]) == -1) {
                    threeArr.push(objarray[2][i]);
                }
            }
        } else {
            if (objarray.length >= 3) {
                threeArr = objarray[2];
            };
        }
        returnArray[0] = singleArr;
        returnArray[1] = doubleArr;
        returnArray[2] = threeArr;
        returnArray[3] = boomArr;
        return returnArray;
    };
//在cardValues中找出最小的一个比objValue大的值
cardTypeUtil.findBig = function (objValue, cardValues) {
    //升序排列
    cardTypeUtil.sortArray(cardValues);
    var len = cardValues.length;
    for (var i = 0; i < len; i++) {
        if (cardValues[i] > objValue) {
            return cardValues[i];
        }
    }
    return -1;
}
//在cardValues中找出所有比objValue大的值
cardTypeUtil.findAllBig = function (objValue, cardValues) {
    //升序排列
    cardTypeUtil.sortArray(cardValues);
    var len = cardValues.length;
    var arr = [];
    for (var i = 0; i < len; i++) {
        if (cardValues[i] > objValue) {
            arr = cardValues.slice(i, cardValues.length);
            return arr;
        }
    }
    return arr;
}
//在info牌形信息中找出所有比objValue大的值 从info的第objLen个数组找起
cardTypeUtil.findAllBigs = function (objValue, info, objLen, fNum) {
    var infoLen = info.length;
    var arr = [];
    var frameNum = fNum ? fNum : 80; //寻找范围，不传默认小于大小王，可以传值包括大小王
    for (var i = objLen - 1; i < infoLen; i++) {
        var len = info[i].length;
        for (var k = 0; k < len; k++) {
            if (info[i][k] > objValue && info[i][k] < frameNum) {
                arr.push(info[i][k]);
            }
        }
    }
    return arr;
}
//在arrs数组中找出所有比objValue大的值
//fNum 寻找范围，不传默认小于大小王，可以传值包括大小王
//igonreLaizi是否忽略癞子值
cardTypeUtil.findBigs = function (objValue, arrs, fNum, igonreLaizi) {
    var arr = [];
    var len = arrs.length;
    var frameNum = fNum ? fNum : 16; //寻找范围，不传默认小于大小王，可以传值包括大小王
    for (var i = 0; i < len; i++) {
        if (arrs[i] > objValue && arrs[i] < frameNum) {

            if (igonreLaizi) {
                if (arrs[i] != gameModel.laiZiCardValue) {
                    arr.push(arrs[i]);
                }
            } else {
                arr.push(arrs[i]);
            }
        }
    }
    return arr;
}
//将count个value元素加入到数组arr
cardTypeUtil.getArray = function (arr, value, count) {
    for (var i = 0; i < count; i++) {
        arr.push(value);
    }
    return arr;
}
//提示功能，
//1：自已首出牌  依次从小到大弹出该牌值的所有牌，不拆牌  (腾讯欢乐斗地主规则：先从单张开始出，依次从小到大弹出，)
//2：管上家牌  依次从小到在能管住的牌形，拆牌    (腾讯欢乐斗地主规则：依次从小到在能管住的牌形，拆牌 )
//备注:当三带一对，或是飞机带一对，或者四带二对中的对子寻找，需要优化算法。带的对子当中应该也可以带laizi
cardTypeUtil.tipsCard = function (cardValues, objCards, objLaiZiNum) {
    if (cardValues == null) {
		console.log("参数为NULL***************");
		return;
	}
	if (cardValues.length == 0) {
		console.log("参数长度为0***************");
		return;
	}
	var info = cardTypeUtil.getCardInfo(cardValues);
	var singeArr = info[0];
	var doubleArr = info[1];
	var threeArr = info[2];
	var fourArr = info[3];
	//目标牌的来自数量，要从外面传进来 不传默认为0
	var objLaiZiNum = objLaiZiNum ? objLaiZiNum : 0;

	//要返回的数组
	var backArr = [];
	//自己出牌。
	if (objCards == null) {
		if (cardValues.length == 0) {
			return [];
		}
		var findBackArr = function() {
			if (singeArr.length > 0 && gameModel.tipsClickNum < singeArr.length) {
				var startNum = gameModel.tipsClickNum;
				gameModel.tipsClickNum += 1;
				backArr.push(singeArr[startNum]);
				return backArr;
			} else if (doubleArr.length > 0 && (gameModel.tipsClickNum - singeArr.length) < doubleArr.length) {
				var startNum = gameModel.tipsClickNum - singeArr.length;
				gameModel.tipsClickNum += 1;
				backArr.push(doubleArr[startNum]);
				backArr.push(doubleArr[startNum]);
				return backArr;
			} else if (threeArr.length > 0 && (gameModel.tipsClickNum - singeArr.length - doubleArr.length) < threeArr.length) {
				var startNum = (gameModel.tipsClickNum - singeArr.length - doubleArr.length);
				gameModel.tipsClickNum += 1;
				backArr.push(threeArr[startNum]);
				backArr.push(threeArr[startNum]);
				backArr.push(threeArr[startNum]);
				return backArr;
			} else if (fourArr.length > 0 && (gameModel.tipsClickNum - singeArr.length - doubleArr.length - threeArr.length) < fourArr.length) {
				var startNum = (gameModel.tipsClickNum - singeArr.length - doubleArr.length - threeArr.length);
				gameModel.tipsClickNum += 1;
				backArr.push(fourArr[startNum]);
				backArr.push(fourArr[startNum]);
				backArr.push(fourArr[startNum]);
				backArr.push(fourArr[startNum]);
				return backArr;
			} else {
				//重新执行第一次点提示
				gameModel.tipsClickNum = 0;
				return findBackArr();
			}
		}
		return findBackArr();

	} else {
		//只要做普通的牌形判断即可
		var objCardType = cardTypeUtil.getCommonCardType(objCards);
		//console.log("目标牌形是：：：：" + objCardType);
		var objLen = objCards.length;
		if (objCardType == cardTypeUtil.oneCard || objCardType == cardTypeUtil.doubleCard || objCardType == cardTypeUtil.threeCard) {
			var arr = [];
			if (objCardType == cardTypeUtil.oneCard) {
				arr = cardTypeUtil.findAllBigs(objCards[0], info, objLen, 80);
			} else {
				arr = cardTypeUtil.findAllBigs(objCards[0], info, objLen);
			}
			cardTypeUtil.sortLaiziArray(arr);
			var findBackArr = function() {
				var len = arr.length;
				if (len == 0 || gameModel.tipsClickNum >= len) {
					if (gameModel.laiZiCardValue && gameModel.laiZiCardNum > 0) {
						var laiziBackArr = cardTypeUtil.laiziTips(cardValues, objCards, objCardType, info);
						cardTypeUtil.sortLaiziDoubleArray(laiziBackArr);
						var laiziLen = laiziBackArr.length;
						if (laiziLen == 0) {
							return cardTypeUtil.findBoom(cardValues, info, len, backArr, findBackArr);
						} else {
							var allLen = len + laiziLen;
							if (gameModel.tipsClickNum >= allLen) {
								return cardTypeUtil.findBoom(cardValues, info, allLen, backArr, findBackArr);
							}
							var startNum = gameModel.tipsClickNum - len;
							gameModel.tipsClickNum += 1;
							return laiziBackArr[startNum];
						}
					} else {
						return cardTypeUtil.findBoom(cardValues, info, len, backArr, findBackArr);
					}
				}

				var startNum = gameModel.tipsClickNum;
				gameModel.tipsClickNum += 1;
				if (arr.length > 0) {
					backArr = cardTypeUtil.getArray(backArr, arr[startNum], objLen);
				}
				return backArr;
			}
			return findBackArr();
			//大小规则：：
			//1:不同张数，张数多的大
			//2:相同张数，laizi少的大
			//3:相同张数，相同laizi数,值大的大

			//寻找方法，确定目标炸弹长度，癞子数, 目标值
			//先寻找能组合出相同癞子数，相同长度且值比目标值更大的炸弹，( 目标炸弹长度 - 癞子数 = 找现有的牌里面的牌应该有的最小张数 同时找出比目标炸弹值更大的值)(先决条件，自己有的laizi数量要大于等于目标牌的laizi数量)
			//寻找能组合出相同长度的炸弹，且比目标牌laizi值更少的炸弹(先决条件，目标一定要有癞子数，如果没有不可能比他更少)
			//再寻找比目标长度更长的炸弹  目标牌长度 - 4 + 1 = 自己至少需要有的癞子数量
		} else if (objCardType == cardTypeUtil.bormCard || objCardType > 100) {
			var objLen = objCards.length;
			var objValue = objCards[0];
			var arr = [];
			var isIgore = true;
			if (objLaiZiNum == objLen) { //如果laizi数量等于炸弹的长度，说明该炸弹是四张癞子，应该作为本身值，癞子数量归0
				objLaiZiNum = 0;
				isIgore = false;
			}
			//console.log("0000000000000000000000000000000000000000000000" + isIgore);
			if (gameModel.laiZiCardNum >= objLaiZiNum) {
				var sameLenSameLaiZiArr = cardTypeUtil.findBigs(objValue, info[objLen - objLaiZiNum - 1], 16, isIgore);
				var sameLen = sameLenSameLaiZiArr.length;
				if (sameLen > 0) {
					for (var i = 0; i < sameLen; i++) {
						var boom = [];
						for (var p = 0; p < objLen; p++) {
							if (p < objLaiZiNum) {
								boom.push(gameModel.laiZiCardValue);
							} else {
								boom.push(sameLenSameLaiZiArr[i]);
							}
						}
						arr.push(boom);
					}
				}
			}
			//console.log("11111111111111111" + isIgore);
			//logObj(arr);
			if (objLaiZiNum > 0) {
				var objValueLen = objLen - objLaiZiNum; //目标炸弹除掉癞子的长度
				var slenOne = objValueLen + 1; //自己至少需要的相同牌的长度
				var slenTwo = objLen - gameModel.laiZiCardNum; //根据自己的癞子长度至少需要的相同牌长度
				var flen = slenOne > slenTwo ? slenOne : slenTwo;
				var sameLenLessLaiZiArr = cardTypeUtil.mergeInfo(info, flen - 1, [16, 17, gameModel.laiZiCardValue]);
				var sameLessLen = sameLenLessLaiZiArr.length;
				if (sameLessLen > 0) {
					for (var p = 0; p < sameLessLen; p++) {
						var boom = [];
						var count = cardTypeUtil.count(cardValues, sameLenLessLaiZiArr[p]);
						for (var m = 0; m < objLen; m++) {
							if (m < count) {
								boom.push(sameLenLessLaiZiArr[p]);
							} else {
								boom.push(gameModel.laiZiCardValue);
							}
						}
						arr.push(boom);
					}
				}
			}
			//console.log("22222222222222222222222" + isIgore);
			//logObj(arr);
			var needLaiziNum = objLen - 4 + 1; //至少需要的laizi数量
			if (gameModel.laiZiCardNum >= needLaiziNum) {
				var slen = objLen + 1 - gameModel.laiZiCardNum;
				var moreArr = cardTypeUtil.mergeInfo(info, slen - 1, [16, 17, gameModel.laiZiCardValue]);

				var moreLen = moreArr.length;
				if (moreLen > 0) {
					for (var p = 0; p < moreLen; p++) {
						var boom = [];
						var count = cardTypeUtil.count(cardValues, moreArr[p]);
						var curNeedLaiziNum = objLen - count + 1; //当前这个值至少需要的癞子数量
						for (var m = 0; m < count; m++) {
							boom.push(moreArr[p]);
						}
						for (var k = 0; k < curNeedLaiziNum; k++) {
							boom.push(gameModel.laiZiCardValue);
						}
						arr.push(boom);
					}
				}
			}
			//console.log("3.333333333333333333333333333333333" + isIgore);
			//logObj(arr);
			var findBackArr = function() {
				var len = arr.length;
				if (len == 0) {
					if (cardTypeUtil.findRock(cardValues)) {
						gameModel.tipsClickNum += 1;
						return [78, 79];
					} else {
						gameModel.tipsClickNum = 0;
						return [];
					}
				} else {
					if (gameModel.tipsClickNum == len) {
						if (cardTypeUtil.findRock(cardValues)) {
							gameModel.tipsClickNum += 1;
							return [78, 79];
						} else {
							gameModel.tipsClickNum = 0;
							return findBackArr();
						}
					} else if (gameModel.tipsClickNum > len) {
						gameModel.tipsClickNum = 0;
						return findBackArr();
					}
					var startNum = gameModel.tipsClickNum;
					gameModel.tipsClickNum += 1;
					backArr = arr[startNum];
					return backArr;
				}
			}
			return findBackArr();
		} else if (objCardType == cardTypeUtil.rocketCard) {
			return backArr; //要不起空数组
		} else if (objCardType == cardTypeUtil.threeTakeOneCard || objCardType == cardTypeUtil.threeTakeTwoCard) {
			var objValue = cardTypeUtil.takeSameCardValue(objCards, 3);
			var arr = cardTypeUtil.findAllBigs(objValue, info, 3);
			var len = arr.length;
			//如果没有找到比目标大的值 ，再看看有没有炸弹，有炸弹返回炸弹，没有返回空数组
			var findBackArr = function() {
				if (len == 0 || gameModel.tipsClickNum >= len) {
					if (gameModel.laiZiCardValue && gameModel.laiZiCardNum > 0) {
						var laiziBackArr = cardTypeUtil.laiziTips(cardValues, objCards, objCardType, info);
						cardTypeUtil.sortLaiziDoubleArray(laiziBackArr);
						var laiziLen = laiziBackArr.length;
						if (laiziLen == 0) {
							return cardTypeUtil.findBoom(cardValues, info, len, backArr, findBackArr);
						} else {
							var allLen = len + laiziLen;
							if (gameModel.tipsClickNum >= allLen) {
								return cardTypeUtil.findBoom(cardValues, info, allLen, backArr, findBackArr);
							}
							var startNum = gameModel.tipsClickNum - len;
							gameModel.tipsClickNum += 1;
							return laiziBackArr[startNum];
						}
					} else {
						return cardTypeUtil.findBoom(cardValues, info, len, backArr, findBackArr);
					}
				}
				var startNum = gameModel.tipsClickNum;
				gameModel.tipsClickNum += 1;
				//加入当前大于目标牌的值
				backArr = cardTypeUtil.getArray(backArr, arr[startNum], 3);
				//如果为三带一最一张最小的单张
				if ((objLen - 3) == 1) {
					var num = cardTypeUtil.findOneCard(info, [arr[startNum]]);
					if (num > 0) {
						backArr.push(num);
						return backArr;
					} else {
						return [];
					}
					//如果为三带二长一对最小的对子
				} else if ((objLen - 3) == 2) {
					var num = cardTypeUtil.findTwoCard(info, [arr[startNum]]);
					if (num > 0) {
						backArr.push(num);
						backArr.push(num);
						return backArr;
					} else {
						return [];
					}
				}
			}
			return findBackArr();
		} else if (objCardType == cardTypeUtil.fourTakeSingleCard || objCardType == cardTypeUtil.fourTakeDoubleCard) {
			var objValue = cardTypeUtil.takeSameCardValue(objCards, 4);
			var arr = cardTypeUtil.findAllBigs(objValue, info, 4);
			var len = arr.length;
			var findBackArr = function() {
				if (len == 0 || gameModel.tipsClickNum >= len) {
					if (gameModel.laiZiCardValue && gameModel.laiZiCardNum > 0) {
						var laiziBackArr = cardTypeUtil.laiziTips(cardValues, objCards, objCardType, info);
						cardTypeUtil.sortLaiziDoubleArray(laiziBackArr);
						var laiziLen = laiziBackArr.length;
						if (laiziLen == 0) {
							return cardTypeUtil.findBoom(cardValues, info, len, backArr, findBackArr);
						} else {
							var allLen = len + laiziLen;
							if (gameModel.tipsClickNum >= allLen) {
								return cardTypeUtil.findBoom(cardValues, info, allLen, backArr, findBackArr);
							}
							var startNum = gameModel.tipsClickNum - len;
							gameModel.tipsClickNum += 1;
							return laiziBackArr[startNum];
						}
					} else {
						return cardTypeUtil.findBoom(cardValues, info, len, backArr, findBackArr);
					}
				}
				var startNum = gameModel.tipsClickNum;
				gameModel.tipsClickNum += 1;
				//加入当前大于目标牌的值
				backArr = cardTypeUtil.getArray(backArr, arr[startNum], 4);
				//如果为四带二张单牌，找两张最小的单张
				if ((objLen - 4) == 2) {
					var num = cardTypeUtil.findOneCard(info, [arr[startNum]]);
					if (num > 0) {
						var scondNum = cardTypeUtil.findOneCard(info, [arr[startNum], num]);
						if (scondNum > 0) {
							backArr.push(num);
							backArr.push(scondNum);
						}
						return backArr;
					} else {
						return [];
					}
					//如果为四带二,找两对最小的对子
				} else if ((objLen - 4) == 4) {
					var num = cardTypeUtil.findTwoCard(info, arr[startNum]);
					if (num > 0) {
						var scondNum = cardTypeUtil.findTwoCard(info, [arr[startNum], num]);
						if (scondNum > 0) {
							backArr.push(num);
							backArr.push(num);
							backArr.push(scondNum);
							backArr.push(scondNum);
						}
						return backArr;
					} else {
						return [];
					}
				}
			}
			return findBackArr();
		} else if (objCardType == cardTypeUtil.sequenceCard) {
			var findBackArr = function() {
				var shunZi = cardTypeUtil.findAllBigLaiZiShunZi(cardValues, objCards); //顺子在这个方法里面包括了laizi
				var len = shunZi.length;
				if (len == 0 || gameModel.tipsClickNum >= len) {
					return cardTypeUtil.findBoom(cardValues, info, len, backArr, findBackArr);
				}
				if (gameModel.tipsClickNum >= len) {
					gameModel.tipsClickNum = 0;
				}
				if (len > 0) {
					var startNum = gameModel.tipsClickNum;
					gameModel.tipsClickNum += 1;
					return shunZi[startNum];
				} else {
					return [];
				}
			}
			return findBackArr();
		} else if (objCardType == cardTypeUtil.linkDoubleCard || objCardType == cardTypeUtil.planeTakeNoneCard) {
			//console.log("进到双顺的判断里面来了");
			var objArr = cardTypeUtil.setCount(objCards);
			var slen = objCards.length / objArr.length;
			//去重后的所有牌组
			var sarr = [];
			cardTypeUtil.setCountOver(cardValues, sarr);

			var duishun = cardTypeUtil.findAllBigLaiZiShuangShunZi(cardValues, sarr[0], objArr, slen);
			//console.log("duishun的长度 ******************" + duishun.length  );
			var len = duishun.length;
			var findBackArr = function() {
				if (len == 0 || gameModel.tipsClickNum >= len) {
					return cardTypeUtil.findBoom(cardValues, info, len, backArr, findBackArr);
				}
				if (len > 0) {
					var startNum = gameModel.tipsClickNum;
					gameModel.tipsClickNum += 1;

					return duishun[startNum];
				} else {
					return [];
				}
			}
			return findBackArr();
		} else if (objCardType == cardTypeUtil.planeTakeSingleCard || objCardType == cardTypeUtil.planeTakeDoubleCard) {
			//console.log("进入飞机判断");
			var objNumList = [];
			var objLen = objCards.length;
			for (var i = 0; i < objLen; i++) {
				if (cardTypeUtil.count(objCards, objCards[i]) >= 3) objNumList.push(objCards[i]);
			}
			//去重后的所有牌组
			var sarr = [];
			cardTypeUtil.setCountOver(cardValues, sarr);
			var objshunzi = cardTypeUtil.setCount(objNumList);

			var sanshun = cardTypeUtil.findAllBigLaiZiShuangShunZi(cardValues, sarr[0], objshunzi, 3);
			//console.log("进入飞机判断*********" + sanshun.length);
			var len = sanshun.length;
			var findBackArr = function() {
				if (len == 0) {
					return cardTypeUtil.findBoom(cardValues, info, len, backArr, findBackArr);
				}
				if (gameModel.tipsClickNum >= len) {
					return cardTypeUtil.findBoom(cardValues, info, len, backArr, findBackArr);
				}
				if (gameModel.tipsClickNum >= len) {
					gameModel.tipsClickNum = 0;
				}
				//有三顺根据是飞机带单还是飞机带双补冲数据
				if (len > 0) {
					var startNum = gameModel.tipsClickNum;
					gameModel.tipsClickNum += 1;
					var arr = sanshun[startNum];
					var rarr = arr.slice(0);
					if (gameModel.laiZiCardValue) {
						rarr.push(gameModel.laiZiCardValue);
					}

					if (objCards.length % 4 == 0) {
						var num = cardTypeUtil.findOneCard(info, rarr);
						if (num > 0) {

							rarr.push(num);
							var scondNum = cardTypeUtil.findOneCard(info, rarr);
							if (scondNum > 0) {
								arr.push(num);
								arr.push(scondNum);
							} else {
								return findBackArr();
							}
							return arr;
						} else {
							return findBackArr();
						}
					} else if (objCards.length % 5 == 0) {
						var num = cardTypeUtil.findTwoCard(info, rarr);
						if (num > 0) {
							rarr.push(num);
							var scondNum = cardTypeUtil.findTwoCard(info, rarr);
							if (scondNum > 0) {
								arr.push(num);
								arr.push(num);
								arr.push(scondNum);
								arr.push(scondNum);
							} else {
								return findBackArr();
							}
							return arr;
						} else {
							return findBackArr();
						}
					}
					return arr;
				} else {
					return [];
				}
			}
			return findBackArr();
		}
	}
};
//找来自的数量，
//objCardIds卡牌的ID而不是卡牌值
cardTypeUtil.findLaiZiCount = function (objCardIds) {
    var laiziNum = 0;
    objCardIds.forEach(function (v) {
        var aolorType = cardInfo[cardTypeUtil.GetCardColor(v)].cardType;
        if (aolorType == 5) {
            laiziNum += 1;
        }
    });
    return laiziNum;
}
//排列目标二维数组，癞子多的数组往后排 火箭永远往后排
cardTypeUtil.sortLaiziDoubleArray = function (array) {
    if (!gameModel.laiZiCardValue) return;
    array.sort(function (a, b) {
        //火箭永远往后排
        var aCardType = cardTypeUtil.isRocketCard(a);
        if (aCardType) return 1;
        var bCardType = cardTypeUtil.isRocketCard(b);
        if (bCardType) return 1;
        //癞子多的往后排
        var aCout = cardTypeUtil.count(a, gameModel.laiZiCardValue);
        var bCout = cardTypeUtil.count(b, gameModel.laiZiCardValue);
        if (aCout > bCout) {
            return 1;
        } else if (aCout > bCout) {
            return -1;
        } else {
            return 0;
        }
    });
}
//排列目标数组，癞子往后排
cardTypeUtil.sortLaiziArray = function (arr) {
    if (!gameModel.laiZiCardValue) return;
    arr.sort(function (a, b) {
        if (a == gameModel.laiZiCardValue && b != gameModel.laiZiCardValue) {
            return 1;
        } else if (a != gameModel.laiZiCardValue && b == gameModel.laiZiCardValue) {
            return -1;
        } else {
            return 0;
        }
    });
}
//找出通过组合赖子牌而比目标牌更大的牌
cardTypeUtil.laiziTips = function (selfcards, objcards, objcardType, info) {
    var objLen = objcards.length;
    var backArr = [];
    if (objcardType == cardTypeUtil.oneCard) {
        return backArr;
    } else if (objcardType == cardTypeUtil.doubleCard) {
        //将所有的癞子组合全部找到返回，不包括软炸
        var arr = cardTypeUtil.findAllBigs(objcards[0], info, 1);
        if (arr.length == 0) {
            return [];
        } else {
            var len = arr.length;
            for (var i = 0; i < len; i++) {
                if (arr[i] != gameModel.laiZiCardValue) {
                    var barr = [];
                    barr.push(arr[i]);
                    barr.push(gameModel.laiZiCardValue);
                    backArr.push(barr);
                }
            }
            return backArr;
        }
    } else if (objcardType == cardTypeUtil.threeCard) {
        //将所有的癞子组合全部找到返回，不包括软炸
        var startLen = null;
        if (gameModel.laiZiCardNum > 1) {
            startLen = 1;
        } else {
            startLen = 2;
        }
        var arr = cardTypeUtil.findAllBigs(objcards[0], info, startLen);
        if (arr.length == 0) {
            return [];
        } else {
            var len = arr.length;
            for (var i = 0; i < len; i++) {
                if (arr[i] != gameModel.laiZiCardValue) {
                    var acount = cardTypeUtil.count(selfcards, arr[i]);
                    var barr = [];
                    for (var k = 0; k < 3; k++) {
                        if (k < acount) {
                            barr.push(arr[i]);
                        } else {
                            barr.push(gameModel.laiZiCardValue);
                        }
                    }
                    backArr.push(barr);
                }
            }
            return backArr;
        }
    } else if (objcardType == cardTypeUtil.bormCard) {
        return [];
    } else if (objcardType == cardTypeUtil.threeTakeOneCard || objcardType == cardTypeUtil.threeTakeTwoCard) {
        var objValue = cardTypeUtil.takeSameCardValue(objcards, 3);
        //将所有的癞子组合全部找到返回，不包括软炸
        var startLen = null;
        if (gameModel.laiZiCardNum > 1) {
            startLen = 1;
        } else {
            startLen = 2;
        }
        var arr = cardTypeUtil.findAllBigs(objValue, info, startLen);
        if (arr.length == 0) {
            return [];
        } else {
            var len = arr.length;

            for (var i = 0; i < len; i++) {
                if (arr[i] != gameModel.laiZiCardValue) {
                    var acount = cardTypeUtil.count(selfcards, arr[i]);
                    var barr = [];
                    for (var k = 0; k < 3; k++) {
                        if (k < acount) {
                            barr.push(arr[i]);
                        } else {
                            barr.push(gameModel.laiZiCardValue);
                        }
                    }
                    //如果为三带一最一张最小的单张
                    if ((objLen - 3) == 1) {
                        var num = cardTypeUtil.findOneCard(info, [arr[i], gameModel.laiZiCardValue]);
                        if (num > 0) {
                            barr.push(num);
                        } else {
                            break;
                        }
                        //如果为三带二长一对最小的对子
                    } else if ((objLen - 3) == 2) {
                        var num = cardTypeUtil.findTwoCard(info, [arr[i], gameModel.laiZiCardValue]);
                        if (num > 0) {
                            barr.push(num);
                            barr.push(num);
                        } else {
                            break;
                        }
                    }
                    backArr.push(barr);
                }
            }
            return backArr;
        }
    } else if (objcardType == cardTypeUtil.fourTakeSingleCard || objcardType == cardTypeUtil.fourTakeDoubleCard) {
        var objValue = cardTypeUtil.takeSameCardValue(objcards, 4);
        //将所有的癞子组合全部找到返回，不包括软炸
        var startLen = 4 - gameModel.laiZiCardNum;
        if (startLen == 0) {
            startLen = 1;
        }
        var arr = cardTypeUtil.findAllBigs(objValue, info, startLen);
        if (arr.length == 0) {
            return [];
        } else {
            var len = arr.length;
            for (var i = 0; i < len; i++) {
                if (arr[i] != gameModel.laiZiCardValue) {
                    var acount = cardTypeUtil.count(selfcards, arr[i]);
                    var barr = [];
                    for (var k = 0; k < 4; k++) {
                        if (k < acount) {
                            barr.push(arr[i]);
                        } else {
                            barr.push(gameModel.laiZiCardValue);
                        }
                    }
                    //如果为四带二张单牌，找两张最小的单张
                    if ((objLen - 4) == 2) {

                        var num = cardTypeUtil.findOneCard(info, [arr[i]], gameModel.laiZiCardValue);
                        if (num > 0) {
                            var scondNum = cardTypeUtil.findOneCard(info, [arr[i], num, gameModel.laiZiCardValue]);
                            if (scondNum > 0) {
                                barr.push(num);
                                barr.push(scondNum);
                            }
                        } else {
                            break;
                        }
                        //如果为四带二,找两对最小的对子
                    } else if ((objLen - 4) == 4) {
                        var num = cardTypeUtil.findTwoCard(info, arr[i]);
                        if (num > 0) {
                            var scondNum = cardTypeUtil.findTwoCard(info, [arr[i], num, gameModel.laiZiCardValue]);
                            if (scondNum > 0) {
                                barr.push(num);
                                barr.push(num);
                                barr.push(scondNum);
                                barr.push(scondNum);
                            }
                        } else {
                            break;
                        }
                    }
                    backArr.push(barr);

                }
            }
            return backArr;
        }
    }
}
//在info数组中找炸弹
cardTypeUtil.findBoom = function (cardValues, info, len, backArr, findBackArr) {
    //如果有癞子先找软炸
    if (gameModel.laiZiCardValue && gameModel.laiZiCardNum > 0) {
        var infoLen = info.length;
        var arr = [];
        var frameNum = (3 - gameModel.laiZiCardNum) < 0 ? 0 : (3 - gameModel.laiZiCardNum);
        //先添加三个的再往前找1个的，这样消耗的laizi比较少
        for (var i = 2; i >= frameNum; i--) {
            var ilen = info[i].length;
            for (var k = 0; k < ilen; k++) {
                if (info[i][k] != gameModel.laiZiCardValue) {
                    arr.push(info[i][k]);
                }
            }
        }

        if (arr.length > 0) {
            var lbLen = arr.length;
            //所有的软炸都找完了，找硬炸
            if (gameModel.tipsClickNum >= len + lbLen) {
                if (info[3].length > 0) {
                    var bomLen = info[3].length;
                    if (gameModel.tipsClickNum == len + bomLen + lbLen) {
                        if (cardTypeUtil.findRock(cardValues)) {
                            gameModel.tipsClickNum += 1;
                            return [78, 79];
                        } else {
                            gameModel.tipsClickNum = 0;
                            return findBackArr();
                        }
                    }
                    var startNum = gameModel.tipsClickNum - len - lbLen;
                    gameModel.tipsClickNum += 1;
                    backArr = cardTypeUtil.getArray(backArr, info[3][startNum], 4);
                    return backArr;
                } else {
                    if (gameModel.tipsClickNum == len + lbLen) {
                        if (cardTypeUtil.findRock(cardValues)) {
                            gameModel.tipsClickNum += 1;
                            return [78, 79];
                        } else {
                            gameModel.tipsClickNum = 0;
                            return findBackArr();
                        }
                    } else {
                        if ((len + lbLen) == 0) { //表示前面也没有找到任何可大的牌
                            return backArr;
                        } else {
                            gameModel.tipsClickNum = 0;
                            return findBackArr();
                        }
                    }
                }
            }
            //找软炸
            var startNum = gameModel.tipsClickNum - len;
            gameModel.tipsClickNum += 1;
            var acount = cardTypeUtil.count(cardValues, arr[startNum]);
            for (var i = 0; i < 4; i++) {
                if (i < acount) {
                    backArr.push(arr[startNum]);
                } else {
                    backArr.push(gameModel.laiZiCardValue);
                }
            }
            return backArr;
        } else {
            //没有炸弹找火箭
            if (gameModel.tipsClickNum == len) {
                if (cardTypeUtil.findRock(cardValues)) {
                    gameModel.tipsClickNum += 1;
                    return [78, 79];
                } else {
                    if (len == 0) { //表示前面也没有找到任何可大的牌
                        return backArr;
                    } else {
                        gameModel.tipsClickNum = 0;
                        return findBackArr();
                    }
                }
            } else {

                if (len == 0) { //表示前面也没有找到任何可大的牌
                    return backArr;
                } else {
                    gameModel.tipsClickNum = 0;
                    return findBackArr();
                }
            }
        }
    } else {
        //没有癞子找硬炸
        if (info[3].length > 0) {
            var bomLen = info[3].length;
            if (gameModel.tipsClickNum == len + bomLen) {
                if (cardTypeUtil.findRock(cardValues)) {
                    gameModel.tipsClickNum += 1;
                    return [78, 79];
                } else {
                    gameModel.tipsClickNum = 0;
                    return findBackArr();
                }
            } else if (gameModel.tipsClickNum > len + bomLen) {
                gameModel.tipsClickNum = 0;
                return findBackArr();
            }
            var startNum = gameModel.tipsClickNum - len;
            gameModel.tipsClickNum += 1;
            backArr = cardTypeUtil.getArray(backArr, info[3][startNum], 4);
            return backArr;
        } else {
            if (len == 0) { //表示前面也没有找到任何可大的牌
                if (cardTypeUtil.findRock(cardValues)) {
                    return [78, 79];
                } else {
                    return backArr;
                }
            } else {
                if (gameModel.tipsClickNum == len) {
                    if (cardTypeUtil.findRock(cardValues)) {
                        gameModel.tipsClickNum += 1;
                        return [78, 79];
                    } else {
                        gameModel.tipsClickNum = 0;
                        return findBackArr();
                    }
                } else if (gameModel.tipsClickNum > len) {
                    gameModel.tipsClickNum = 0;
                    return findBackArr();
                }
            }
        }
    }
}
//找火箭
cardTypeUtil.findRock = function (cardValues) {
    var isSking = false;
    var isBking = false;
    var len = cardValues.length;
    for (var i = 0; i < len; i++) {
        if (cardValues[i] == 78) {
            isSking = true;
        } else if (cardValues[i] == 79) {
            isBking = true;
        }
    }
    if (isSking && isBking) {
        return true;
    } else {
        return false;
    }
}
//从info的第index个数组开始合并为一个数组 从0开始
//ignoreValue为忽略值数组，里面值的值全部忽略，
cardTypeUtil.mergeInfo = function (info, index, ignoreValues) {
    var infoLen = info.length;
    var arr = [];
    for (var i = index; i < infoLen; i++) {
        var len = info[i].length;
        for (var k = 0; k < len; k++) {
            if (ignoreValues && ignoreValues.length > 0) {
                var iLen = ignoreValues.length;
                var isIgnor = false;
                for (var m = 0; m < iLen; m++) {
                    if (info[i][k] == ignoreValues[m]) {
                        isIgnor = true;
                    }
                }
                if (!isIgnor) arr.push(info[i][k]);
            } else {
                arr.push(info[i][k]);
            }
        }
    }
    return arr;
}
//在解析后的数组中找到一张最小的牌，规则，先从单张数组中找，如果单张数组没有，从对子数组中拆最小的，对子也没有找三张里面的，再没有，说明整副牌只有炸弹了。返回空。
//ignoreValue为忽略值数组，里值的值全部忽略，
//如果有癞子值，癞子值往后徘
cardTypeUtil.findOneCard = function (info, ignoreValues) {
    var arr = cardTypeUtil.mergeInfo(info, 0);
    arr.sort(function (a, b) {
        if (a == gameModel.laiZiCardValue && b != gameModel.laiZiCardValue) {
            return 1;
        } else if (a != gameModel.laiZiCardValue && b == gameModel.laiZiCardValue) {
            return -1;
        } else if (a != gameModel.laiZiCardValue && b != gameModel.laiZiCardValue) {
            return 0;
        }
    })

    var len = arr.length;
    var ilen = 0;
    if (ignoreValues) {
        ilen = ignoreValues.length;
    }
    for (var i = 0; i < len; i++) {
        if (ignoreValues) {
            var isIgnor = false;
            for (var k = 0; k < ilen; k++) {
                if (arr[i] == ignoreValues[k]) {
                    isIgnor = true;
                }
            }
            if (!isIgnor) return arr[i];
        } else {
            return arr[i];
        }
    }
    return 0;
}
//在解析后的数组中找到一对最小的牌，规则，从对子数组中找最小的，对子也没有找三张里面的，再没有，说明整副牌只有炸弹了。返回空。
//ignoreValue为忽略值，
//如果有癞子值，癞子值往后徘
cardTypeUtil.findTwoCard = function (info, ignoreValues) {
    var arr = cardTypeUtil.mergeInfo(info, 1);
    arr.sort(function (a, b) {
        if (a == gameModel.laiZiCardValue && b != gameModel.laiZiCardValue) {
            return 1;
        } else if (a != gameModel.laiZiCardValue && b == gameModel.laiZiCardValue) {
            return -1;
        } else if (a != gameModel.laiZiCardValue && b != gameModel.laiZiCardValue) {
            return 0;
        }
    })

    var len = arr.length;
    var ilen = 0;
    if (ignoreValues) {
        ilen = ignoreValues.length;
    }
    for (var i = 0; i < len; i++) {
        if (ignoreValues) {
            var isIgnor = false;
            for (var k = 0; k < ilen; k++) {
                if (arr[i] == ignoreValues[k]) {
                    isIgnor = true;
                }
            }
            if (!isIgnor) return arr[i];
        } else {
            return arr[i];
        }
    }
    return 0;
}

module.exports = cardTypeUtil;