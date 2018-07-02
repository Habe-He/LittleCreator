/**
 * Created by hades on 2017/3/2.
 */
modulelobby.RechargeCenterAlipayWechatUI = cc.Node.extend({
    ctor: function () {
        this._super();

        var json = ccs.load("res/rechargecenter_alipaywechat_ui.json");
        this.addChild(json.node);
        var rootNode = json.node;
        var self = this;
        var bg = rootNode.getChildByName("bg");
        var user_id = bg.getChildByName("id");
        user_id.ignoreContentAdaptWithSize(true);
        var user_gold = bg.getChildByName("gold");
        user_gold.ignoreContentAdaptWithSize(true);
        this.gold = user_gold;
        var recharge_input = bg.getChildByName("rmoney_input_bg").getChildByName("input");
        recharge_input = new InputExView(recharge_input);
        var submit_btn = bg.getChildByName("submit_btn");
        recharge_input.setFontColor(cc.color(255, 255, 255), cc.color(255, 255, 255));

        user_id.setString(KKVS.GUID.toString());
        user_gold.setString(getGoldTxt(KKVS.KGOLD));
        submit_btn.addClickEventListener(function() {
            submit_btn.setTouchEnabled(false);
            submit_btn.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function() {
                submit_btn.setTouchEnabled(true);
            })));
            self.onSubmit(recharge_input.getString().trim());
        });

        return true;
    },
    onSubmit: function (strMoney) {
        //var self = this;
        //var money = strToInt(strMoney);
        //if (money == 0) {
        //    self.showErrMsg("金币输入异常！");
        //    return;
        //}
        //modulelobby.showLoading(null, null, 10);
        //self.opt_obj = {type : 1, money : money};
        //KBEngine.app.player().reqTakeBank(money, strPwd);
        this.showErrMsg("充值系统暂未开放");
    },
    showErrMsg: function (args) {
        var dialog = new modulelobby.TxtDialog({title : "系统提示", txt : args});
        dialog.show();
    },
    opt_ret : function (args) {
        if (args.code == 1) {
            if (this.opt_obj && this.opt_obj.type == 1) {
                this.opt_obj = null;
            }
        } else {
            this.opt_obj = null;
        }
    },
    onGold : function () {
        this.gold.setString(getGoldTxt(KKVS.KGOLD));
    },
    onEnter : function () {
        cc.Node.prototype.onEnter.call(this);
        KKVS.Event.register("opt_ret", this, "opt_ret");
        KKVS.Event.register("refreshMyScore", this, "onGold");
    },
    onExit: function() {
        KKVS.Event.deregister("opt_ret", this);
        KKVS.Event.deregister("refreshMyScore", this);
        cc.Node.prototype.onExit.call(this);
    }
});