var cardTypeUtil = require('./cardTypeUtil');
var cardInfo = require('./cardInfo');

cc.Class({
    extends: cc.Component,
    properties: {
        pokerSprite: {
            default: null,
            type: cc.Sprite
        },
        isTouched: false,
        isChoosed: false
    },

    onLoad: function () {
        this.touchEventMgr();
        // cc.log("cardPer load perfabs");
        // cc.loader.loadRes("perfabs/card_bg", function (err, loadprefab) {
        //     if (err) {
        //         cc.log("加载牌背预制出错 原因：" + err);
        //         return;
        //     };
        //     if (!(loadprefab instanceof cc.Prefab)) {
        //         cc.log("载入的不是预制资源");
        //         return;
        //     }
        //     // var cardNode = cc.instantiate(loadprefab);
        //     // this.cardNode = cardNode;
        // });
    },

    // 显示牌面
    showPoker: function (id, z_Order) {
        var self = this;
        // cc.log("id = " + id + " z_Order = " + z_Order);
        var cardValue = cardTypeUtil.GetCardValue(id);
        var cardColorType = cardInfo[cardTypeUtil.GetCardColor(id)].cardType;

        var path = "";
        if (cardColorType == 0) {
            path = "card/card_" + cardColorType + "_" + (cardValue - 78);
        } else {
            if (cardValue > 13)
                path = "card/card_" + cardColorType + "_" + (cardValue - 13);
            else
                path = "card/card_" + cardColorType + "_" + cardValue;

            if (cardValue == 1)
                cardValue = 14;

            if (cardValue == 2)
                cardValue = 15
        }
        // cc.log("path = " + path);
        cc.loader.loadRes(path, cc.SpriteFrame, function (err, spriteFrame) {
            self.pokerSprite.getComponent(cc.Sprite).spriteFrame = spriteFrame;
        })
    },

    // 触摸监听
    touchEventMgr: function() {
        var self = this;
        self.canTouch = true;

        this.node.on(cc.Node.EventType.TOUCH_START, function(event) {
            if (self.canTouch) {
                self.handleResponse(self.isTouched);
                self.isTouched = (!self.isTouched);
            }
        }, this);
    },

    // 点击到牌处理
    handleResponse: function () {
        var self = this;
        if (self.isTouched) {
            this.node.runAction(cc.moveBy(0.1, 0, -30));
            this.isChoosed = false;
        } else {
            this.node.runAction(cc.moveBy(0.1, 0, 30));
            this.isChoosed = true;
        }
    }
});