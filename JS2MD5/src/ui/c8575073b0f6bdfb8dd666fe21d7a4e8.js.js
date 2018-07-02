/**
 * Created by hades on 2017/3/2.
 */
modulelobby.RechargeCenterOnlineUI = cc.Node.extend({
    ctor: function () {
        this._super();

        var json = ccs.load("res/rechargecenter_online_ui.json");
        this.addChild(json.node);

        return true;
    }
});