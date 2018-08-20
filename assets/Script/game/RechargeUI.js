var gameEngine = require('./../plugin/gameEngine');
var KKVS = require('./../plugin/KKVS');
var Tool = require('./../tool/Tool');
var DialogView = require('./../widget/DialogView');
var TxtDialogComp = require('./../widget/TxtDialogComp');

var RechargeUI = RechargeUI || {};
RechargeUI.Show = function () {
    var self = this;
    cc.loader.loadRes("perfabs/Recharge", cc.Prefab, function (error, prefab) {
        if (error) {
            cc.error(error);
            return;
        }
        // 实例 
        self._rechargeUI = cc.instantiate(prefab);
        self._rechargeUI.parent = cc.find('Canvas');
        var closeBtn = cc.find('bg/close', self._rechargeUI);
        closeBtn.on('click', self.closeClick, self);

        var bg = self._rechargeUI.getChildByName("bg");
        var scrollview = bg.getChildByName("scrollview");
        var view = scrollview.getChildByName("view");
        var content = view.getChildByName("content");
        var priceArray = [6,30,60,128,328,648];
        for( var i = 0 ; i < 6 ; i++){
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
        if (cc.sys.os == cc.sys.OS_IOS) {
            var text = "暂不支持苹果系统购买钻石";
            (new DialogView()).build(TxtDialogComp, {
                txt: text,
                type: 1
            }).show();
        }



        var value = parseInt(event.target.tag);
        Tool.getOrderNumber(value);
    },

    self.closeClick = function (event) {
        self._rechargeUI.destroy();
    };
};

module.exports = RechargeUI;

