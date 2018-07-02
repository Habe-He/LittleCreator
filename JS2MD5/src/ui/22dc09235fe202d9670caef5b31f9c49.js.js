/**
 * Created by hades on 2017/3/2.
 */
modulelobby.UserCenterAlipayUI = cc.Node.extend({
    ctor: function () {
        this._super();
        this.split_char = ':';
        this.opt_obj = null;

        var json = ccs.load("res/usercenter_alipay_ui.json");
        this.addChild(json.node);
        var rootNode = json.node;
        var bind_layer = rootNode.getChildByName("bind_layer");
        this.bind_layer = bind_layer;
        var info_layer = rootNode.getChildByName("info_layer");
        this.info_layer = info_layer;
        if (typeof (KKVS.ALIPAY) == 'string' && KKVS.ALIPAY != "") {
            bind_layer.setVisible(false);
            info_layer.setVisible(true);
            this.initInfoLayer();
        } else {
            bind_layer.setVisible(true);
            info_layer.setVisible(false);
            this.initBindLayer();
        }

        return true;
    },
    initBindLayer : function () {
        var self = this;
        var acc_input = this.bind_layer.getChildByName("acc_input_bg").getChildByName("input");
        acc_input = new InputExView(acc_input);
        var name_input = this.bind_layer.getChildByName("name_input_bg").getChildByName("input");
        name_input = new InputExView(name_input);
        acc_input.setFontColor(cc.color(255, 255, 255), cc.color(255, 255, 255));
        name_input.setFontColor(cc.color(255, 255, 255), cc.color(255, 255, 255));
        var bind_alipay_btn = this.bind_layer.getChildByName("bind_alipay_btn");
        bind_alipay_btn.addClickEventListener(function() {
            bind_alipay_btn.setTouchEnabled(false);
            bind_alipay_btn.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function() {
                bind_alipay_btn.setTouchEnabled(true);
            })));
            var str_acc = acc_input.getString().trim();
            var str_name = name_input.getString().trim();
            if (!self.checkAlipay(str_acc)) {
                self.showErrMsg("支付宝帐号格式有误");
                return;
            }
            if (!self.checkAlipayName(str_name)) {
                self.showErrMsg("名字格式有误");
                return;
            }
            var params = {
                alipay : (str_acc + self.split_char + str_name)
            };
            var datas = JSON.stringify(params);
            modulelobby.showLoading(null, null, 10);
            self.opt_obj = {type : PLAYER_MSG_ID_UPDATE_PLAYER_INFO, alipay : params.alipay};
            KBEngine.app.player().req_player_msg(PLAYER_MSG_ID_UPDATE_PLAYER_INFO, datas);
        });
    },
    initInfoLayer : function () {
        var alipay_acc = this.info_layer.getChildByName("acc");
        alipay_acc.ignoreContentAdaptWithSize(true);
        var alipay_name = this.info_layer.getChildByName("name");
        alipay_name.ignoreContentAdaptWithSize(true);
        var arr = KKVS.ALIPAY.split(this.split_char, 2);
        alipay_acc.setString((arr[0] || ""));
        alipay_name.setString((arr[1] || ""));
    },
    checkAlipay : function (alipay_acc) {
        return /^0?\d{9,11}$/.test(alipay_acc) || /^(?:\w+\.?)*\w+@(?:\w+\.)+\w+$/.test(alipay_acc);
    },
    checkAlipayName : function (alipay_name) {
        return /^[\u4e00-\u9fa5]{2,16}$/.test(alipay_name) || /^[a-zA-Z\/ ]{2,32}$/.test(alipay_name);
    },
    showErrMsg: function (args) {
        var dialog = new modulelobby.TxtDialog({title : "系统提示", txt : args});
        dialog.show();
    },
    opt_ret : function (args) {
        if (args.code == 1) {
            //
        } else {
            this.opt_obj = null;
        }
    },
    on_player_msg : function (cmd) {
        modulelobby.hideLoading();
        if (this.opt_obj && this.opt_obj.type == cmd && cmd == PLAYER_MSG_ID_UPDATE_PLAYER_INFO) {
            if (typeof (KKVS.ALIPAY) == 'string' && KKVS.ALIPAY != "") {
                this.bind_layer.setVisible(false);
                this.info_layer.setVisible(true);
                this.initInfoLayer();
            }
        }
        this.opt_obj = null;
    },
    onEnter : function () {
        cc.Node.prototype.onEnter.call(this);
        KKVS.Event.register("opt_ret", this, "opt_ret");
        KKVS.Event.register("on_player_msg", this, "on_player_msg");
    },
    onExit: function() {
        KKVS.Event.deregister("opt_ret", this);
        KKVS.Event.deregister("on_player_msg", this);
        cc.Node.prototype.onExit.call(this);
    }
});