var cardTypeUtil = require('./cardTypeUtil');
var cardInfo = require('./cardInfo');

cc.Class({
    extends: cc.Component,
    properties: {
        pokerSprite: {
            default: null,
            type: cc.Sprite
        },
        isSelect: false,
        isReadyToSelect: false,
        
        // 牌值
        cardValue: 0,
    },

    onLoad: function () {},

    // 显示牌面
    showPoker: function (id, z_Order) {
        var self = this;
        // cc.log("id = " + id + " z_Order = " + z_Order);
        self.cardValue = cardTypeUtil.GetCardValue(id);
        var cardColorType = cardInfo[cardTypeUtil.GetCardColor(id)].cardType;

        var path = "";
        if (cardColorType == 0) {
            path = "card/card_" + cardColorType + "_" + (self.cardValue - 78);
        } else {
            if (self.cardValue > 13)
                path = "card/card_" + cardColorType + "_" + (self.cardValue - 13);
            else
                path = "card/card_" + cardColorType + "_" + self.cardValue;

            if (self.cardValue == 1)
                self.cardValue = 14;

            if (self.cardValue == 2)
                self.cardValue = 15;
        }
        // cc.log("path = " + path);
        cc.loader.loadRes(path, cc.SpriteFrame, function (err, spriteFrame) {
            self.pokerSprite.getComponent(cc.Sprite).spriteFrame = spriteFrame;
        })
    },

    // 获取节点大小
    getCSize: function () {
        return this.pokerSprite.getComponent(cc.Sprite).node.getContentSize();
    },

    // 转换到自身坐标
    covToSpace: function(point) {
        return this.pokerSprite.getComponent(cc.Sprite).node.convertToNodeSpace(point);
    },

    // 获取位置
    getPokerPosition: function() {
        return this.pokerSprite.getComponent(cc.Sprite).node.getPosition();
    },

    // 通过是否被框选，显示牌 --- 弹起选中的牌
    showByReadySelect: function() {
        var self = this;
        if (self.isReadyToSelect) {
            self.handleResponse();
            self.isReadyToSelect = false;
        }
    },

    // 点击到牌处理
    handleResponse: function () {
        var self = this;
        if (self.isSelect) {
            this.node.runAction(cc.moveBy(0.1, 0, -30));
            this.isSelect = false;
        } else {
            this.node.runAction(cc.moveBy(0.1, 0, 30));
            this.isSelect = true;
        }
    },

    // 设置为未选中
    setNoneSelect: function() {
        var self = this;
        this.node.setPosition(cc.p(0, 30));
        self.isSelect = false;
        self.isReadyToSelect = false;
    },
});