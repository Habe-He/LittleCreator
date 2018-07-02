/**
 * Created by hades on 2017/7/4.
 */
modulelobby.ExchangeCenterQrCodeUI = cc.Node.extend({
    ctor: function () {
        this._super();

        var json = ccs.load("res/exchangecenter_qrcode_ui.json");
        var visibleSize = cc.director.getVisibleSize();
        var origin = cc.director.getVisibleOrigin();
        json.node.x = origin.x + visibleSize.width / 2 - json.node.getContentSize().width / 2;
        json.node.y = origin.y + visibleSize.height / 2 - json.node.getContentSize().height / 2;
        this.addChild(json.node);

        var self = this;
        var rootNode = json.node;
        var back = rootNode.getChildByName("back");
        back.addTouchEventListener(function (sender, type) {
            switch (type) {
                case ccui.Widget.TOUCH_ENDED:
                    self.removeFromParent();
                    break;
                default :
                    break;
            }
        });

        return true;
    }
});