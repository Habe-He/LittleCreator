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

module.exports = cardTypeUtil;