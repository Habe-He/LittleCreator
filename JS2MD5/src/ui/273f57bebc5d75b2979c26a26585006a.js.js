/**
 * Created by hades on 2017/3/2.
 */
modulelobby.BankCenterSaveMUI = cc.Node.extend({
    ctor: function () {
        this._super();
        this.opt_obj = null;

        var json = ccs.load("res/bankcenter_sm_ui.json");
        this.addChild(json.node);
        var rootNode = json.node;
        var self = this;
        var bg = rootNode.getChildByName("bg");
        var user_gold = bg.getChildByName("gold");
        user_gold.ignoreContentAdaptWithSize(true);
        this.gold = user_gold;
        var user_bankgold = bg.getChildByName("bankgold");
        user_bankgold.ignoreContentAdaptWithSize(true);
        this.bankgold = user_bankgold;
        var savemoney_input = bg.getChildByName("savemoney_input_bg").getChildByName("input");
        savemoney_input = new InputExView(savemoney_input, true);
        this.savemoney_Input = savemoney_input;
        var ok_btn = bg.getChildByName("ok_btn");
        savemoney_input.setFontColor(cc.color(255, 255, 255), cc.color(255, 255, 255));
        savemoney_input.setEditBox(3, 1, 1);

        user_gold.setString(getGoldTxt(KKVS.KGOLD));
        user_bankgold.setString(getGoldTxt(KKVS.KGOLD_BANK));
        ok_btn.addClickEventListener(function() {
            ok_btn.setTouchEnabled(false);
            ok_btn.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function() {
                ok_btn.setTouchEnabled(true);
            })));
            self.onClickOK(savemoney_input.getString().trim());
        });

        return true;
    },
    emptyInput : function () {
        this.savemoney_Input.setString("");
    },
    onClickOK: function (strMoney) {
        var self = this;
        ////var money = strToInt(strMoney);
        ////float->int
        //var moneyf = parseFloat(strMoney); //test当传入无效值时会不会转化为0
        //moneyf = moneyf.toFixed(2);
        //var money = parseInt(moneyf * 100);
        var money = strMoney;
        if (!(/^[0-9]*$/.test(money))) {
            self.showErrMsg("金币输入异常！");
            self.emptyInput();
            return;
        }
        money = parseInt(strMoney);
        if (typeof (money) != 'number' || isNaN(money) || money == 0) {
            self.showErrMsg("金币输入异常！");
            self.emptyInput();
            return;
        } else if (0 < money && KKVS.KGOLD < money) {
            self.showErrMsg("存入金币不能大于携带的金币！");
            self.emptyInput();
            return;
        }
        modulelobby.showLoading(null, null, 10);
        self.opt_obj = {type : 1, money : money, bank : KKVS.KGOLD_BANK};
        KBEngine.app.player().reqSaveBank(money);
        self.emptyInput();
    },
    showErrMsg: function (args) {
        var dialog = new modulelobby.TxtDialog({title : "系统提示", txt : args});
        dialog.show();
    },
    opt_ret : function (args) {
        if (args.code == 1) {
            if (this.opt_obj && this.opt_obj.type == 1) {
                this.opt_obj = null;
                KKVS.Event.fire("refreshMyBank");
                this.showErrMsg("存放成功");
            }
        } else {
            this.opt_obj = null;
        }
    },
    onGold : function () {
        this.gold.setString(getGoldTxt(KKVS.KGOLD));
    },
    onBankGold : function () {
        this.bankgold.setString(getGoldTxt(KKVS.KGOLD_BANK));
    },
    updateLobbyUI : function () {
        this.onGold();
        this.onBankGold();
    },
    onEnter : function () {
        cc.Node.prototype.onEnter.call(this);
        KKVS.Event.register("opt_ret", this, "opt_ret");
        KKVS.Event.register("refreshMyScore", this, "onGold");
        KKVS.Event.register("refreshMyBank", this, "onBankGold");
        KKVS.Event.register("updateLobbyUI", this, "updateLobbyUI");
    },
    onExit: function() {
        KKVS.Event.deregister("opt_ret", this);
        KKVS.Event.deregister("refreshMyScore", this);
        KKVS.Event.deregister("refreshMyBank", this);
        KKVS.Event.deregister("updateLobbyUI", this);
        cc.Node.prototype.onExit.call(this);
    }
});