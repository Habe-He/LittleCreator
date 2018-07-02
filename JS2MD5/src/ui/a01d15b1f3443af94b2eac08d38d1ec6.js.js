/**
 * Created by hades on 2017/3/2.
 */
modulelobby.BankCenterGetMUI = cc.Node.extend({
    ctor: function () {
        this._super();
        this.opt_obj = null;

        var json = ccs.load("res/bankcenter_gm_ui.json");
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
        var getmoney_input = bg.getChildByName("getmoney_input_bg").getChildByName("input");
        getmoney_input = new InputExView(getmoney_input, true);
        this.getmoney_Input = getmoney_input;
        var pwd_input = bg.getChildByName("pwd_input_bg").getChildByName("input");
        pwd_input = new InputExView(pwd_input, true);
        this.pwd_Input = pwd_input;
        var ok_btn = bg.getChildByName("ok_btn");
        var alterpwd_btn = bg.getChildByName("alterpwd_btn");
        getmoney_input.setFontColor(cc.color(255, 255, 255), cc.color(255, 255, 255));
        pwd_input.setFontColor(cc.color(255, 255, 255), cc.color(255, 255, 255));
        getmoney_input.setEditBox(3, 1, 1);
        pwd_input.setEditBox(5, 0, 1);
        user_gold.setString(getGoldTxt(KKVS.KGOLD));
        user_bankgold.setString(getGoldTxt(KKVS.KGOLD_BANK));
        alterpwd_btn.addClickEventListener(function() {
            alterpwd_btn.setTouchEnabled(false);
            alterpwd_btn.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function() {
                alterpwd_btn.setTouchEnabled(true);
            })));
            KKVS.Event.fire("BankCenter_Switch", 2);
        });
        ok_btn.addClickEventListener(function() {
            ok_btn.setTouchEnabled(false);
            ok_btn.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function() {
                ok_btn.setTouchEnabled(true);
            })));
            self.onClickOK(getmoney_input.getString().trim(), pwd_input.getString());
        });


        return true;
    },
    emptyInput : function () {
        this.getmoney_Input.setString("");
        this.pwd_Input.setString("");
    },
    onClickOK: function (strMoney, strPwd) {
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
        } else if (0 < money && KKVS.KGOLD_BANK < money) {
            self.showErrMsg("取出金币不能大于银行存储的金币！");
            self.emptyInput();
            return;
        }
        if (!self.checkPwd(strPwd)) {
            self.showErrMsg("取款密码格式不正确,不能包含中文且长度必须为6~33个字符");
            self.emptyInput();
            return;
        }
        modulelobby.showLoading(null, null, 10);
        strPwd = hex_md5(strPwd);
        self.opt_obj = {type : 2, money : money, bank : KKVS.KGOLD_BANK, pwd : strPwd};
        KBEngine.app.player().reqTakeBank(money, strPwd);
        self.emptyInput();
    },
    showErrMsg: function (args) {
        var dialog = new modulelobby.TxtDialog({title : "系统提示", txt : args});
        dialog.show();
    },
    checkPwd: function (txt) {
        if (txt == "") {
            return false;
        }
        if (txt.length < 6 || txt.length > 33) {
            return false;
        }
        //是否包含中文
        if(/.*[\u4e00-\u9fa5]+.*$/.test(txt)) {
            return false;
        }
        return true;
    },
    opt_ret : function (args) {
        if (args.code == 1) {
            if (this.opt_obj && this.opt_obj.type == 2) {
                this.opt_obj = null;
                KKVS.Event.fire("refreshMyBank");
                this.showErrMsg("提取成功");
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