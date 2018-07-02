modulelobby.UpdatePage = cc.Layer.extend({
    ctor: function () {
        this._super();

        var json = ccs.load("res/updatepage.json");
        var visibleSize = cc.director.getVisibleSize();
        var origin = cc.director.getVisibleOrigin();
        json.node.x = origin.x + visibleSize.width / 2 - json.node.getContentSize().width / 2;
        json.node.y = origin.y + visibleSize.height / 2 - json.node.getContentSize().height / 2;
        this.addChild(json.node);
        var rootAction = json.action;
        json.node.runAction(rootAction);
        rootAction.play("show1", false);

        var bg_1 = json.node.getChildByName("bg_1");
        bg_1.setVisible(true);
        var bg_2 = json.node.getChildByName("bg_2");
        bg_2.setVisible(false);
        this.runAction(cc.sequence(cc.delayTime(2.0), cc.callFunc(function() {
            bg_1.setVisible(false);
            rootAction.play("show2", false);
            bg_2.setVisible(true);
        }), cc.delayTime(2.0), cc.callFunc(function() {
            modulelobby.runScene(modulelobby.Loading);
        })));

        return true;
    }
});