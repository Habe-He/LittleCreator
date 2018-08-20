var gameEngine = require('./../plugin/gameEngine');
var KKVS = require('./../plugin/KKVS');
var Tool = require('./../tool/Tool');
var BuyScoreUI = BuyScoreUI || {};
BuyScoreUI.Show = function () {
    var self = this;
    cc.loader.loadRes("perfabs/BuyScore", cc.Prefab, function (error, prefab) {
        if (error) {
            cc.error(error);
            return;
        }
        // 实例 
        self._buyScoreUI = cc.instantiate(prefab);
        self._buyScoreUI.parent = cc.find('Canvas');
        var closeBtn = cc.find('bg/close', self._buyScoreUI);
        closeBtn.on('click', self.closeClick, self);

        var bg = self._buyScoreUI.getChildByName("bg");
        var scrollview = bg.getChildByName("scrollview");
        var view = scrollview.getChildByName("view");
        var content = view.getChildByName("content");
        var priceArray = [10,30,50,100,500,1000];
        for( var i = 0 ; i < priceArray.length ; i++){
            var frameName = "node_0" + ((i + 1).toString());
            cc.log("frameName = " + frameName);  
            var node = content.getChildByName(frameName);
            var btn = node.getChildByName("payBtn");
            btn.tag = priceArray[i];
            btn.on('click', self.buyClick, self);
        }
    });
    self.loadResIcon = function(iconNode , files){
        cc.loader.loadRes(files, cc.SpriteFrame, function(err, spriteFrame) {
            if (err) {
                cc.log("Lobby getLobbyLevel err = " + err);
                return;
            }
            iconNode.spriteFrame = spriteFrame;
        });
    },

    self.buyClick = function(event){
        var value = parseInt(event.target.tag);
        cc.log("value = " + value);
        gameEngine.app.player().sendChangeGold(value);
    },

    self.closeClick = function (event) {
        self._buyScoreUI.destroy();
    };
};

module.exports = BuyScoreUI;

