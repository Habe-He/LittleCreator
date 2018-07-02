modulelobby.Advertising = modulelobby.DialogView.extend({
    ctor: function () {
        this._super();

        var json = ccs.load("res/advertising.json");
        var visibleSize = cc.director.getVisibleSize();
        var origin = cc.director.getVisibleOrigin();
        json.node.x = origin.x + visibleSize.width / 2 - json.node.getContentSize().width / 2;
        json.node.y = origin.y + visibleSize.height / 2 - json.node.getContentSize().height / 2;
        this.addChild(json.node);
        var self = this;
        this._layer = json.node.getChildByName("back");
        var body = json.node.getChildByName("body");
        this.m_bg = body;
        var close_btn = body.getChildByName("close_btn");
        close_btn.addClickEventListener(function(sender){
            sender.setTouchEnabled(false);
            playEffect();
            self.close();
        });
        var btn_show = body.getChildByName("btn_show");
        btn_show.addClickEventListener(function (sender) {
            sender.setTouchEnabled(false);
            sender.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function() {
                sender.setTouchEnabled(true);
            })));
            playEffect();
            self.close();
            (new modulelobby.RedpacketUI()).show();
        });

        return true;
    },
    getBody : function () {
        return this.m_bg;
    },
    getLayer : function () {
        return this._layer;
    }
});