modulelobby.UserCenterAccUI = cc.Node.extend({
    ctor: function () {
        this._super();
        this.m_nTimeCnt = 60; //获取验证码锁定时间
        this.m_nTimeNum = 0;
        this.m_pRegPhone = "";
        this.m_nRandNum = null;
        this.opt_obj = null;
        this.trades_bool = false;

        var json = ccs.load("res/usercenter_acc_ui.json");
        this.addChild(json.node);
        var rootNode = json.node;
        var self = this;
        var bg = rootNode.getChildByName("body");
        this.gender_head = {gender : KKVS.GENDER, face_id : KKVS.FACEID};
        this.gender_head.head = bg.getChildByName("head_node").getChildByName("head");
        var user_gold = bg.getChildByName("gold");
        user_gold.ignoreContentAdaptWithSize(true);
        this.user_gold = user_gold;
        this.gender_head.box_men = bg.getChildByName("boy_box");
        this.gender_head.box_women = bg.getChildByName("girl_box");
        this.rightbar_1 = bg.getChildByName("rightbar_1");
        this.rightbar_2 = bg.getChildByName("rightbar_2");

        //this.setUserFace();
        var face_btn = bg.getChildByName("head_txt");
        face_btn.addClickEventListener(function (sender) {
            sender.setTouchEnabled(false);
            sender.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function (tnode) {
                sender.setTouchEnabled(true);
            })));
            playEffect();
            var dialog = new modulelobby.FaceDialog(self.gender_head.gender);
            dialog.show();
        });
        if (typeof KKVS.HEAD_URL == 'string' && KKVS.HEAD_URL != "") {
            face_btn.setTouchEnabled(false);
            face_btn.setVisible(false);
            var borderPng = new cc.Sprite(getWechatHeadBorder());
            borderPng.setScale(2.0);
            setWechatHead(KKVS.HEAD_URL, this.gender_head.head, getWechatHeadMask(), borderPng);
        }
        this.setGenderHead();
        //0=men, 1=women
        this.gender_head.box_men.addEventListener(function (sender, type) {
            switch (type) {
                case ccui.CheckBox.EVENT_SELECTED:
                    self.gender_head.gender = 0;
                    playEffect();
                    self.setGenderHead();
                    break;
                case ccui.CheckBox.EVENT_UNSELECTED:
                    break;
                default:
                    break;
            }
        });
        this.gender_head.box_women.addEventListener(function (sender, type) {
            switch (type) {
                case ccui.CheckBox.EVENT_SELECTED:
                    self.gender_head.gender = 1;
                    playEffect();
                    self.setGenderHead();
                    break;
                case ccui.CheckBox.EVENT_UNSELECTED:
                    break;
                default:
                    break;
            }
        });
        user_gold.setString(getGoldTxt(KKVS.KGOLD));
        if (isVisitorLogin()) {
            this.rightbar_1.setVisible(true);
            this.rightbar_2.setVisible(false);
            this.initVisitorLogin();
        } else {
            this.rightbar_1.setVisible(false);
            this.rightbar_2.setVisible(true);
            this.initAccLogin();
        }

        return true;
    },
    updateLobbyUI : function () {
        this.user_gold.setString(getGoldTxt(KKVS.KGOLD));
        this.gender_head.gender = KKVS.GENDER;
        this.gender_head.face_id = KKVS.FACEID;
        this.setGenderHead();
        //this.emptyInput();
    },
    onEnter : function () {
        this._super();
        KKVS.Event.register("opt_ret", this, "opt_ret");
        KKVS.Event.register("on_profile", this, "on_profile");
        KKVS.Event.register("on_player_msg", this, "on_player_msg");
        KKVS.Event.register("setUserFace", this, "setUserFace");
        KKVS.Event.register("updateLobbyUI", this, "updateLobbyUI");
    },
    onExit: function() {
        KKVS.Event.deregister("opt_ret", this);
        KKVS.Event.deregister("on_profile", this);
        KKVS.Event.deregister("on_player_msg", this);
        KKVS.Event.deregister("setUserFace", this);
        KKVS.Event.deregister("updateLobbyUI", this);
        this._super();
    },
    setGenderHead : function () {
        if (this.gender_head.gender == 0) {
            this.gender_head.box_men.setSelected(true);
            this.gender_head.box_women.setSelected(false);
            this.gender_head.box_men.setEnabled(false);
            this.gender_head.box_women.setEnabled(true);
        } else {
            this.gender_head.box_men.setSelected(false);
            this.gender_head.box_women.setSelected(true);
            this.gender_head.box_men.setEnabled(true);
            this.gender_head.box_women.setEnabled(false);
        }
        //this.gender_head.head.setSpriteFrame(getGenderHead(this.gender_head.gender));
        this.setUserFace(this.gender_head.face_id);
    },
    setUserFace : function (face_id) {
        var face = getFace(face_id, this.gender_head.gender);
        this.gender_head.face_id = face.id;
        this.gender_head.head.setTexture(face.png);
    },
    opt_ret : function (args) {
        if (args.code == 1) {
            if (this.trades_bool) {
                this.trades_bool = false;
                this.trades_input.setString(this.shieldwords_txt(this.trades_input.getString()));
                (new modulelobby.TipDialog({txt : "保存成功"})).show();
            }
        } else {
            if (this.trades_bool) {
                this.trades_bool = false;
                (new modulelobby.TipDialog({txt : args.msg})).show();
            }else {
                this.opt_obj = null;
            }
        }
    },
    on_profile : function (qq, wx, bz, qm) {
        //QQ，微信，备注，签名
        if (this.trades_input) {
            this.trades_input.setString(qm);
        }
    },
    on_player_msg : function (cmd) {
        cc.log("usercenterauuci::on_player_msg cmd=" + cmd);
        modulelobby.hideLoading();
        if (this.opt_obj && this.opt_obj.type == cmd) {
            if (cmd == PLAYER_MSG_ID_BIND_MOB) {
                cc.log("绑定手机");
                this.rightbar_1.setVisible(false);
                this.rightbar_2.setVisible(true);
                this.initAccLogin();
            } else if (cmd == PLAYER_MSG_ID_UPDATE_PLAYER_INFO) {
                //
            }
            if (typeof (this.opt_obj.event) == 'number') {
                KKVS.Event.fire("UserCenter_Switch", this.opt_obj.event);
            }
        }
        this.opt_obj = null;
    },
    initVisitorLogin : function () {
        var self = this;
        var phone_input = this.rightbar_1.getChildByName("phone_input_bg").getChildByName("input");
        var phonecode_input = this.rightbar_1.getChildByName("phonecode_input_bg").getChildByName("input");
        var pwd_input = this.rightbar_1.getChildByName("pwd_input_bg").getChildByName("input");
        var conpwd_input = this.rightbar_1.getChildByName("conpwd_input_bg").getChildByName("input");
        var tick_txt = this.rightbar_1.getChildByName("tip_txt");
        tick_txt.ignoreContentAdaptWithSize(true);
        var phonecode_btn = this.rightbar_1.getChildByName("phonecode_btn");
        var submit_btn = this.rightbar_1.getChildByName("submit_btn");

        this.m_pPhoneInput = new InputExView(phone_input, true);
        this.m_pInputCode = new InputExView(phonecode_input, true);
        this.m_pPwdInput = new InputExView(pwd_input, true);
        this.m_pConPwdInput = new InputExView(conpwd_input, true);
        this.m_pTickTxt = tick_txt;
        this.m_pGetCodeBtn = phonecode_btn;
        this.m_pPhoneInput.setFontColor(cc.color(147, 100, 46), cc.color(147, 100, 46));
        this.m_pInputCode.setFontColor(cc.color(147, 100, 46), cc.color(147, 100, 46));
        this.m_pPwdInput.setFontColor(cc.color(147, 100, 46), cc.color(147, 100, 46));
        this.m_pConPwdInput.setFontColor(cc.color(147, 100, 46), cc.color(147, 100, 46));
        this.m_pPhoneInput.setEditBox(3, 1, 1);
        this.m_pInputCode.setEditBox(3, 1, 1);
        this.m_pPwdInput.setEditBox(5, 0, 1);
        this.m_pConPwdInput.setEditBox(5, 0, 1);
        submit_btn.addClickEventListener(function() {
            submit_btn.setTouchEnabled(false);
            submit_btn.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function() {
                submit_btn.setTouchEnabled(true);
            })));
            playEffect();
            self.onSubmit();
        });
        phonecode_btn.addClickEventListener(function(sender) {
            sender.setTouchEnabled(false);
            sender.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function() {
                sender.setTouchEnabled(true);
            })));
            playEffect();
            self.onGetCode();
        });
    },
    initAccLogin : function () {
        var self = this;
        var user_acc = this.rightbar_2.getChildByName("acc");
        //user_acc.ignoreContentAdaptWithSize(true);
        user_acc.setString(KKVS.NICKNAME);
        var user_id = this.rightbar_2.getChildByName("id");
        //user_id.ignoreContentAdaptWithSize(true);
        user_id.setString(KKVS.GUID.toString());
        this.trades_input = this.rightbar_2.getChildByName("trades_png").getChildByName("input");
        this.shieldwords = [];
        if (cc.sys.isNative) {
            this.shieldwords = JSON.parse(jsb.fileUtils.getStringFromFile("res/config/shieldwords.json"));
        } else {
            this.shieldwords = JSON.parse(cc.loader._loadTxtSync("res/config/shieldwords.json"));
        }
        var btn_go = this.rightbar_2.getChildByName("btn_go");
        btn_go.addClickEventListener(function(sender) {
            sender.setTouchEnabled(false);
            sender.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function() {
                sender.setTouchEnabled(true);
            })));
            playEffect();
            self.trades_bool = true;
            var test = self.shieldwords_txt(self.trades_input.getString());
            KBEngine.app.player().req_modify_profile("", "", "", test);
        });
        //var alter_btn = this.rightbar_2.getChildByName("alter_btn");//修改银行密码
        //alter_btn.addClickEventListener(function() {
        //    alter_btn.setTouchEnabled(false);
        //    alter_btn.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function() {
        //        alter_btn.setTouchEnabled(true);
        //    })));
        //    playEffect();
        //    if (self.switch(1)) {
        //        KKVS.Event.fire("UserCenter_Switch", 1); //jump pwd
        //    }
        //});
        KBEngine.app.player().req_profile();
    },
    showErrMsg: function (args) {
        var dialog = new modulelobby.TxtDialog({title : "系统提示", txt : args});
        dialog.show();
    },
    emptyInput : function () {
        this.m_pPhoneInput.setString("");
        this.m_pInputCode.setString("");
        this.m_pPwdInput.setString("");
        this.m_pConPwdInput.setString("");
    },
    shieldwords_txt : function (txt) {
        if(!txt || txt.length == 0) {
            return "";
        }
        for(var p = 0, s = this.shieldwords.length; p < s; ++p) {
            var w = this.shieldwords[p];
            var reg = new RegExp(w, "g");
            var nw = "";
            for(var n = 0, m = w.length; n < m; ++n) {
                nw += "*";
            }
            txt = txt.replace(reg, nw);
        }
        return txt;
    },
    onSubmit : function () {
        var self = this;
        var strAcc = this.checkRegInfo();
        if (strAcc == register_err_account_empty || strAcc == register_err_account_format || strAcc == register_err_account_len
            || strAcc == register_err_code_empty || strAcc == register_err_code_foramt || strAcc == register_err_code_len) {
            self.showErrMsg(strAcc);
            self.emptyInput();
            return;
        }
        var strAcc = self.checkCodeEffective() ? self.checkRegInfo() : "验证码输入错误";
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
            self.showErrMsg("确认密码与密码不一致！");
            self.emptyInput();
            return;
        }
        var strMob = this.m_pPhoneInput.getString();
        var params = {
            bind_mob : strMob,
            pwd : hex_md5(strPwd)
        };
        var datas = JSON.stringify(params);
        modulelobby.showLoading(null, null, 10);
        this.opt_obj = {type : PLAYER_MSG_ID_BIND_MOB, bind_mob : strMob, pwd : strPwd};
        KBEngine.app.player().req_player_msg(PLAYER_MSG_ID_BIND_MOB, datas);
        self.emptyInput();
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
            //验证码是6位 增加一个联合判断 验证码一定大于 100000
            if (code.length != 6 || code_int < 100000) {
                return register_err_code_len;
            }
        }
        if (self.m_pRegPhone != acc) {
            return register_err_account_change;
        }
        return register_success;
    },
    switch : function (event) {
        if (this.gender_head.gender != KKVS.GENDER || this.gender_head.face_id != KKVS.FACEID) {
            var params = {
                gender : this.gender_head.gender,
                head_id : this.gender_head.face_id
            };
            var datas = JSON.stringify(params);
            modulelobby.showLoading(null, null, 10);
            this.opt_obj = {type : PLAYER_MSG_ID_UPDATE_PLAYER_INFO, gender : params.gender, head_id : params.head_id, event : event};
            KBEngine.app.player().req_player_msg(PLAYER_MSG_ID_UPDATE_PLAYER_INFO, datas);
        }
        return (this.gender_head.gender == KKVS.GENDER && this.gender_head.face_id == KKVS.FACEID);
    }
});