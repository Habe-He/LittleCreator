//cardId 卡牌唯一ID
//useBg 使用背牌

var cardTypeUtil = require('./CardTypeUtil');
var cardInfo = require('./cardInfo');

var baseCard = cc.Node.extend({
    ctor: function(cardId, level, usebg) {
        this._super();

        
        this.isSelect = false; //是否被选中
        this.isReadyToSelect = false; //被框选但未弹起状态  只有在被框选的时候才为真。
        this.hasOut = false; //是否已被打出
        this.isTop = false; //是否为现有牌中显示在最上层的牌;
        this.cardId = cardId; //卡牌ID 16位ID
        this.cardValue = cardTypeUtil.GetCardValue(cardId); //卡牌逻辑值
        this.cardColorType = cardInfo[cardTypeUtil.GetCardColor(cardId)].cardType; //卡牌花色(0为王)
        this.viewLevel = level; //渲染层级;
        var self = this;
        self.cardimg = new cc.Sprite("#card/card_card_bg.png", 1);
        this.addChild(self.cardimg);
        this.isUp = false;
        this.usebg = usebg;

        // this.init();
    },

    init: function() {
        var self = this;
        self.path = null;
        //空值默认为背景牌
        if (self.cardId == null || this.usebg) {
            self.cardimg.setSpriteFrame("card/card_card_bg.png");
            // return;
        }
        if (self.cardColorType == 0) {
            self.path = "card/card_card_" + self.cardColorType + "_" + (self.cardValue - 78) + ".png";
            //this.cardValue = this.cardValue + 15;//大小王重新给值
        } else {
            if (self.cardValue > 13)
                self.path = "card/card_card_" + self.cardColorType + "_" + (self.cardValue - 13) + ".png";
            else
                self.path = "card/card_card_" + self.cardColorType + "_" + self.cardValue + ".png";

            if (self.cardValue == 1)
                self.cardValue = 14;

            if (self.cardValue == 2)
                self.cardValue = 15
        }
        self.cardimg.setSpriteFrame(self.path);
    },
    
    getContentSize:function(){

        if( this.cardimg ){
            return this.cardimg.getContentSize();
        } else{
            cc.log(" error for cardimg");
        }

    },
    //显示癞子图标
    showLaizi: function() {},
    
    //移除癞子图标
    hideLaizi: function() {},
    
    // 显示地主标记
    showDiZhuSign: function() {
        var self = this;
        if (!self.diZhuImg) {
            self.diZhuImg = new cc.Sprite("#gameUI/gameRoom_dizhu.png", 1);
            var dizhuSize = self.diZhuImg.getContentSize();
            var imgSize = self.cardimg.getContentSize();
            self.diZhuImg.setPosition(imgSize.width - dizhuSize.width / 2 - 1, imgSize.height - dizhuSize.height / 2 - 1);
            self.cardimg.addChild(self.diZhuImg);
        } else {
            self.diZhuImg.setVisible(true);
        }
    },
    // 显示明牌标记
    showMinPaiImg: function() {},

    // 隐藏明牌标记
    hideMinPaiImg: function() {},

    // 隐藏地主标记
    hideDiZhuSign: function() {
        var self = this;
        if (self.diZhuImg) {
            self.diZhuImg.setVisible(false);
        }
    },

    // 重置数据
    setConfig: function(cardId, level) {
        var self = this;
        self.cardId = cardId; //卡牌ID 16位ID
        self.cardValue = cardTypeUtil.GetCardValue(cardId); //卡牌逻辑值
        self.cardColorType = cardInfo[cardTypeUtil.GetCardColor(cardId)].cardType; //卡牌花色
        self.viewLevel = level;
        self.init();
    },
    
    //重设渲染层级
    setViewLevel: function(level) {
        var self = this;
        self.viewLevel = level;
    },
    
    setUp: function() {
        var self = this;
        if (self.isClick == true) {
            self.isClick = false;
            return
        }
        self.cardimg.setPosition(cc.p(0, 8));
        self.isUp = true;
    },
    
    setDown: function() {
        var self = this;
        self.isUp = false;
        self.cardimg.setPosition(cc.p(0, 0));
    },
    
    //设置为未选中
    setNoneSelect: function() {
        var self = this;
        //var moveDowm = cc.moveTo(0.1,cc.p(0,0));
        self.isReadyToSelect = false;
        // self.cardimg.stopAllActions();
        self.isUp = false;
        self.cardimg.setPosition(cc.p(0, 0));
        //if(self.isSelect){
        self.isSelect = false;
        //self.cardimg.runAction(moveDowm);
        //}
    },
    
    //通过是否被框选，显示牌
    showByReadySelect: function() {
        var self = this;
        if (self.isReadyToSelect) {
            self.onClick();
            self.isReadyToSelect = false;
        }
    },
    
    //模拟被点击操作
    onClick: function() {
        var self = this;
        var moveUp = cc.moveTo(0.05, cc.p(0, 30));
        var moveDowm = cc.moveTo(0.05, cc.p(0, 0));
        self.isClick = true;
        // self.cardimg.stopAllActions();
        if (self.isSelect) {
            self.cardimg.setPosition(cc.p(0, 0));
            //self.cardimg.runAction(moveDowm);
            self.isUp = false;
            self.isSelect = !self.isSelect;
        } else {
            //self.cardimg.runAction(moveUp);
            self.cardimg.setPosition(cc.p(0, 30));
            self.isUp = true;
            self.isSelect = !self.isSelect;
        }
    },
    
    getCardId: function() {
        return this.cardId;
    }
});