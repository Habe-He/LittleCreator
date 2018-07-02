/**
 * Created by hades on 2017/3/2.
 */
modulelobby.BankCenterPwdUI = cc.Node.extend({
    ctor: function () {
        this._super();
        this.opt_obj = null;

        var json = ccs.load("res/bankcenter_pwd_ui.json");
        this.addChild(json.node);
        var rootNode = json.node;
        var self = this;
        var bg = rootNode.getChildByName("bg");
        var pwd_input = bg.getChildByName("pwd_input_bg").getChildByName("input");
        pwd_input = new InputExView(pwd_input, true);
        this.pwd_Input = pwd_input;
        var newpwd_input = bg.getChildByName("newpwd_input_bg").getChildByName("input");
        newpwd_input = new InputExView(newpwd_input, true);
        this.newpwd_Input = newpwd_input;
        var conpwd_input = bg.getChildByName("conpwd_input_bg").getChildByName("input");
        conpwd_input = new InputExView(conpwd_input, true);
        this.conpwd_Input = conpwd_input;
        var ok_btn = bg.getChildByName("ok_btn");
        pwd_input.setFontColor(cc.color(255, 255, 255), cc.color(255, 255, 255));
        newpwd_input.setFontColor(cc.color(255, 255, 255), cc.color(255, 255, 255));
        conpwd_input.setFontColor(cc.color(255, 255, 255), cc.color(255, 255, 255));
        pwd_input.setEditBox(5, 0, 1);
        newpwd_input.setEditBox(5, 0, 1);
        conpwd_input.setEditBox(5, 0, 1);
        ok_btn.addClickEventListener(function() {
            ok_btn.setTouchEnabled(false);
            ok_btn.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function() {
                ok_btn.setTouchEnabled(true);
            })));
            self.onClickOK(pwd_input.getString(), newpwd_input.getString(), conpwd_input.getString());
        });

        return true;
    },
    emptyInput : function () {
        this.pwd_Input.setString("");
        this.newpwd_Input.setString("");
        this.conpwd_Input.setString("");
    },
    onClickOK: function (strPwd, strNPwd, strCPwd) {
        var self = this;
        if (!self.checkPwd(strPwd)) {
            self.showErrMsg("密码格式不正确,不能包含中文且长度必须为6~33个字符");
            self.emptyInput();
            return;
        }
        if (strNPwd == strPwd) {
            self.showErrMsg("新密码不能与旧密码一致！");
            self.emptyInput();
            return;
        }
        if(!self.checkPwd(strNPwd)) {
            self.showErrMsg("新密码格式不正确,不能包含中文且长度必须为6~33个字符");
            self.emptyInput();
            return;
        }
        if (strNPwd != strCPwd) {
            self.showErrMsg("确认密码与新密码不一致！");
            self.emptyInput();
            return;
        }
        modulelobby.showLoading(null, null, 10);
        strPwd = hex_md5(strPwd);
        strNPwd = hex_md5(strNPwd);
        self.opt_obj = {type : 3, pwd : strPwd, npwd : strNPwd};
        KBEngine.app.player().reqMdBankPwd(strPwd, strNPwd);
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
            if (this.opt_obj && this.opt_obj.type == 3) {
                this.showErrMsg("密码修改成功");
                this.opt_obj = null;
            }
        } else {
            this.opt_obj = null;
        }
    },
    onEnter : function () {
        cc.Node.prototype.onEnter.call(this);
        KKVS.Event.register("opt_ret", this, "opt_ret");
    },
    onExit: function() {
        KKVS.Event.deregister("opt_ret", this);
        cc.Node.prototype.onExit.call(this);
    }
});