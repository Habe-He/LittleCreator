modulelobby.ForgetPwdDialog = modulelobby.DialogView.extend({
    ctor : function (data) {
        this._super();
        data = data || "";
        this.m_nTimeCnt = 60; //获取验证码锁定时间
        this.m_nTimeNum = 0;
        this.m_pRegPhone = "";
        this.m_nRandNum = null;

        var json = ccs.load("res/forgetpwd_ui.json");
        var visibleSize = cc.director.getVisibleSize();
        var origin = cc.director.getVisibleOrigin();
        json.node.x = origin.x + visibleSize.width / 2 - json.node.getContentSize().width / 2;
        json.node.y = origin.y + visibleSize.height / 2 - json.node.getContentSize().height / 2;
        this.addChild(json.node);
        var rootNode = json.node;
        var self = this;
        this._layer = rootNode.getChildByName("back");
        var body = rootNode.getChildByName("body");
        this._body = body;
        var phone_input = body.getChildByName("phone_input_bg").getChildByName("input");
        var phonecode_input = body.getChildByName("phonecode_input_bg").getChildByName("input");
        var pwd_input = body.getChildByName("pwd_input_bg").getChildByName("input");
        var conpwd_input = body.getChildByName("conpwd_input_bg").getChildByName("input");
        this.m_pTickTxt = body.getChildByName("tip_txt");
        this.m_pTickTxt.ignoreContentAdaptWithSize(true);
        this.m_pPhoneInput = new InputExView(phone_input, true, rootNode);
        this.m_pInputCode = new InputExView(phonecode_input, true, rootNode);
        this.m_pPwdInput = new InputExView(pwd_input, true, rootNode);
        this.m_pConPwdInput = new InputExView(conpwd_input, true, rootNode);
        this.m_pPhoneInput.setFontColor(cc.color(147, 100, 46), cc.color(147, 100, 46));
        this.m_pInputCode.setFontColor(cc.color(147, 100, 46), cc.color(147, 100, 46));
        this.m_pPwdInput.setFontColor(cc.color(147, 100, 46), cc.color(147, 100, 46));
        this.m_pConPwdInput.setFontColor(cc.color(147, 100, 46), cc.color(147, 100, 46));
        this.m_pPhoneInput.setEditBox(3, 1, 1);
        this.m_pInputCode.setEditBox(3, 1, 1);
        this.m_pPwdInput.setEditBox(5, 0, 1);
        this.m_pConPwdInput.setEditBox(5, 0, 1);
        this.m_pPhoneInput.setString(data);
        var close_btn = body.getChildByName("close_btn");
        var ok_btn = body.getChildByName("ok_btn");
        var phonecode_btn = body.getChildByName("phonecode_btn");
        this.m_pGetCodeBtn = phonecode_btn;
        close_btn.addClickEventListener(function() {
            close_btn.setTouchEnabled(false);
            playEffect();
            self.close();
        });
        ok_btn.addClickEventListener(function() {
            ok_btn.setTouchEnabled(false);
            ok_btn.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function() {
                ok_btn.setTouchEnabled(true);
            })));
            playEffect();
            self.onClickOK();
        });
        phonecode_btn.addClickEventListener(function(sender) {
            sender.setTouchEnabled(false);
            sender.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function() {
                sender.setTouchEnabled(true);
            })));
            playEffect();
            self.onGetCode();
        });

        return true;
    },
    emptyInput : function () {
        this.m_pPhoneInput.setString("");
        this.m_pInputCode.setString("");
        this.m_pPwdInput.setString("");
        this.m_pConPwdInput.setString("");
    },
    onGetCode : function () {
        cc.log("验证码");
        var self = this;
        var strAcc = this.checkRegInfo();
        //获取验证码时,只需要正确填写账号(手机号)即可
        if (strAcc == register_err_account_empty || strAcc == register_err_account_format || strAcc == register_err_account_len) {
            self.showErrMsg(strAcc);
        } else {
            var req_phone = self.m_pPhoneInput.getString();
            var params = {
                Userid : KKVS.GUID.toString(),
                PhoneNumber : req_phone,
                Sign : hex_md5(req_phone + "2Wr9bLUT%rh7BRs$"),//.toUpperCase()
                funname : "callfunc"
            };
            self.m_pGetCodeBtn.setVisible(false);
            self.m_pTickTxt.setVisible(true);
            self.m_nTimeCnt = 60;
            self.timeCnt();
            self.m_pRegPhone = "";
            self.m_nTimeNum = (new Date()).getTime();
            // 请求获取验证码
            HttpManager.GetMessage(send_code_url, params, METHOD_POST, function (data) {
                var ret = null;
                try {
                    ret = JSON.parse(data);
                } catch (e) {
                    //
                }
                if (!ret) {
                    return;
                }
                if (typeof (ret['Success']) == 'boolean' && ret['Success'] == true) {//Success:true,code:'111111',userid:'0'
                    self.m_pRegPhone = req_phone;
                    self.m_nRandNum = ret['code'];
                } else {//Success:false,Msg:'错误'
                    self.showErrMsg(ret['Msg']);
                    self.m_nTimeCnt = 0;
                }
            });
        }
    },
    //onGetCode : function () {
    //    cc.log("验证码");
    //    var self = this;
    //    var strAcc = this.checkRegInfo();
    //    //获取验证码时,只需要正确填写账号(手机号)即可
    //    if (strAcc == register_err_account_empty || strAcc == register_err_account_format || strAcc == register_err_account_len) {
    //        self.showErrMsg(strAcc);
    //    } else {
    //        var req_phone = self.m_pPhoneInput.getString();
    //        var params = {
    //            phone :req_phone,
    //            code :self.onCreateRandNum(),
    //            funname : "callfunc"
    //        };
    //        self.m_pGetCodeBtn.setVisible(false);
    //        self.m_pTickTxt.setVisible(true);
    //        self.m_nTimeCnt = 60;
    //        self.timeCnt();
    //        self.m_pRegPhone = "";
    //        self.m_nTimeNum = (new Date()).getTime();
    //        // 请求获取验证码
    //        HttpManager.GetMessage(http_url_prefix + "api_agent_sendcode.aspx", params, METHOD_POST, function (data) {
    //            var ret = null;
    //            try {
    //                ret = JSON.parse(data);
    //            } catch (e) {
    //                //
    //            }
    //            if (!ret) {
    //                return;
    //            }
    //            if (typeof (ret.resp) == 'object' && typeof (ret.resp.respCode) == 'string' && ret.resp.respCode == "000000") {
    //                self.m_pRegPhone = req_phone;
    //            } else {
    //                self.showErrMsg("获取验证码失败，请重新获取");
    //                self.m_nTimeCnt = 0;
    //            }
    //        });
    //        //test code
    //        //self.m_pInputCode.setString(params.code.toString());
    //        //self.m_pRegPhone = req_phone;
    //    }
    //},
    onClickOK: function () {
        var self = this;
        var strAcc = this.checkRegInfo();
        if (strAcc == register_err_account_empty || strAcc == register_err_account_format || strAcc == register_err_account_len
            || strAcc == register_err_code_empty || strAcc == register_err_code_foramt || strAcc == register_err_code_len) {
            self.showErrMsg(strAcc);
            self.emptyInput();
            return;
        }
        var strAcc = self.checkCodeEffective() ? self.checkRegInfo() : "验证码输入错误";
        cc.log(strAcc);
        if (strAcc != register_success) {
            self.showErrMsg(strAcc);
            self.emptyInput();
            return;
        }
        var tempTime = (new Date()).getTime();
        if (0 < self.m_nTimeNum && 180000 < tempTime - self.m_nTimeNum) {
            self.showErrMsg("验证码过期,请重新获取");
            self.emptyInput();
            return;
        }
        var strPwd = this.m_pPwdInput.getString();
        if(!self.checkPwd(strPwd)) {
            self.showErrMsg("密码格式不正确,不能包含中文且长度必须为6~33个字符");
            self.emptyInput();
            return;
        }
        var strConPwd = this.m_pConPwdInput.getString();
        if (strPwd != strConPwd) {
            self.showErrMsg("确认密码与新密码不一致！");
            self.emptyInput();
            return;
        }
        var strMob = this.m_pPhoneInput.getString();
        var params = { //funname: "callfunc"
            phone : strMob,
            newpassword : hex_md5(strPwd),
            sign : hex_md5(strMob + 'DK1NwRRXvlCpcnqo')
        };
        modulelobby.showLoading(null, null, 10);
        HttpManager.GetMessage(http_url_prefix + "api_agent_updatepass.aspx", params, METHOD_POST, function (data) {
            modulelobby.hideLoading();
            var ret = null;
            try {
                ret = JSON.parse(data.trim());
            } catch (e) {
                //
            }
            if (ret && typeof(ret['success']) == 'string' && ret['success'] == "true") {
                self.close();
                self.showErrMsg("密码修改成功");
            } else {
                self.showErrMsg(ret['msg']);
                //self.showErrMsg("密码修改失败");
            }
        });
        self.emptyInput();
    },

    showErrMsg: function (args) {
        var dialog = new modulelobby.TxtDialog({title : "系统提示", txt : args});
        dialog.show();
    },

    checkCodeEffective: function () {
        if (this.m_pInputCode.getString() != "" && this.m_nRandNum) {
            var a = this.m_nRandNum.toString();
            var b = this.m_pInputCode.getString();
            if (a == b) {
                return true;
            }
        }
        return false;
    },

    //获取验证码后 1分钟倒计时
    timeCnt: function () {
        var self = this;
        self.m_pTickTxt.setString(self.m_nTimeCnt + "s后重新获取");
        self.m_nTimeCnt -= 1;
        if (self.m_nTimeCnt >= 0) {
            //倒计时没有结束,递归
            self.m_pTickTxt.runAction(cc.sequence(cc.delayTime(1), cc.callFunc(self.timeCnt, self)));
        }
        else {
            self.m_pGetCodeBtn.setVisible(true);
            self.m_pTickTxt.setVisible(false);
            self.m_nTimeCnt = 60;
        }
    },

    ////生成Code(验证码)
    //onCreateRandNum: function () {
    //    var max_num = 9999;
    //    var min_num = 1000;
    //    this.m_nRandNum = Math.floor(cc.random0To1() * (max_num - min_num) + min_num);
    //    if (this.m_nRandNum < 1000 || this.m_nRandNum > 9999) {
    //        this.m_nRandNum = 6289;
    //    }
    //    //cc.log("验证码 = " + this.m_nRandNum);
    //    return this.m_nRandNum;
    //},

    //验证合法性
    checkRegInfo: function () {
        var self = this;
        var acc = this.m_pPhoneInput.getString();
        var code = this.m_pInputCode.getString();

        //正直表达式 用于判断获取的手机号是否是正整数
        var temp = /^\d+$/;
        //账号是否为空
        if (acc == null || acc == "") {
            return register_err_account_empty;
        }

        //判断账号是否为正整数
        if (!isMoblieNumber(acc)) {
            return register_err_account_format;
        }
        //var isInt = temp.test(acc);
        //if (!isInt) {
        //    return register_err_account_format;
        //}
        //else {
        //    var len = acc.length;
        //    //把账号转成数字
        //    var acc_int = parseInt(acc);
        //    //手机号是11位 增加一个联合判断 手机号一定大于 10000000000
        //    if (acc.length != 11 || acc_int < 10000 * 10000 * 100) {
        //        return register_err_account_len;
        //    }
        //}
        //验证码为空
        if (code == null || code == "") {
            return register_err_code_empty;
        }
        var isCodeInt = temp.test(code);
        //判断验证码是否为正整数
        if (!isCodeInt) {
            return register_err_code_foramt;
        }
        else {
            //var len = code.length;
            //把验证码转成数字
            var code_int = parseInt(code);
            //验证码是6位 增加一个联合判断 验证码一定大于 1000
            if (code.length != 6 || code_int < 100000) {
                return register_err_code_len;
            }
        }
        if (self.m_pRegPhone != acc) {
            return register_err_account_change;
        }
        return register_success;
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

    //checkNickNameLength: function (args) {
    //    var name_length = 0;
    //    for (var i = 0; i < args.length; ++i) {
    //        var once = args.substring(i, i + 1);
    //        if(/.*[\u4e00-\u9fa5]+.*$/.test(once)) {
    //            //中文
    //            name_length += 2;
    //        }
    //        else {
    //            name_length += 1;
    //        }
    //    }
    //
    //    if (name_length < 6) {
    //        return err_nickname_small;
    //    }
    //    else if (name_length > 32) {
    //        return err_nickname_big;
    //    }
    //
    //    return check_success;
    //},
    getBody : function () {
        return this._body;
    },
    getLayer : function () {
        return this._layer;
    }
});