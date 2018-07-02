modulelobby.Preloading = cc.Layer.extend({
    m_pLoadingBar: null,
    //m_pGameIcon: null,
    ctor: function (autoVisit) {
        this._super();
        var json = ccs.load("res/preloading.json");
        var visibleSize = cc.director.getVisibleSize();
        var origin = cc.director.getVisibleOrigin();
        json.node.x = origin.x + visibleSize.width / 2 - json.node.getContentSize().width / 2;
        json.node.y = origin.y + visibleSize.height / 2 - json.node.getContentSize().height / 2;
        this.addChild(json.node);
        var rootNode = json.node;

        rootAction = json.action;
        rootNode.runAction(rootAction);
        rootAction.play("show", true);
        
        //KBEngine.Event.register("onLoginBaseappFailed", this, "onLoginBaseappFailed");
        //KBEngine.Event.register("onLoginFailed", this, "onLoginFailed");
        KKVS.Event.register("onLoginSuccess", this, "onLoginSuccess");
        KKVS.Event.register("goLogin", this, "login");
        KKVS.Event.register("on_sign_record", this, "on_sign_record");
        //KKVS.Event.register("on_turntable_record", this, "on_turntable_record");
        KKVS.Event.register("on_activity_info", this, "on_activity_info");
        KKVS.Event.register("on_turntable_left_times", this, "on_turntable_left_times");
        KKVS.Event.register("on_box_record", this, "on_box_record")
        KKVS.Event.register("on_prop_list", this, "on_prop_list");
        KKVS.Event.register("on_rank_list", this, "on_rank_list");
        KKVS.Event.register("on_rank_list_extra", this, "on_rank_list_extra");
        KKVS.Event.register("on_prop_rank_list", this, "on_prop_rank_list");

        var bg = rootNode.getChildByName("bg");
        //this.m_pGameIcon = bg.getChildByName("gameIcon");
        var black = bg.getChildByName("black");
        this.m_pLoadingBar = black.getChildByName("LoadingBar_1");
        black.setLocalZOrder(101);
        
        //var icon_posX = origin.x + this.m_pGameIcon.getBoundingBox().width / 2 + 50;
        //var icon_posY = origin.y + visibleSize.height - this.m_pGameIcon.getBoundingBox().height / 2 - 50;
        //var icon_pos = bg.convertToNodeSpace(cc.p(icon_posX, icon_posY));
        //this.m_pGameIcon.setPosition(icon_pos);
        
        //var armatureDataManager = ccs.armatureDataManager;
        //armatureDataManager.addArmatureFileInfo("res/Ox/armature/Animation.ExportJson");
        //var armature = new ccs.Armature("Animation");
        //armature.getAnimation().play("walk");
        //armature.setPosition(bg.getBoundingBox().width / 2, bg.getBoundingBox().height / 2);
        //bg.addChild(armature, 100);//_movementData can not be null
        //emulatorCheck
        if (emulatorCheck()) {
            var dialog = new modulelobby.TxtDialog({title : "系统提示", txt : "非常抱歉，请您在真机上进行游戏。", cb : function () {
                cc.director.end();
            }});
            dialog.show(this);
            return true;
        }
        if (autoVisit) {
            this.loadLocalAcc();
        }
        //读取配置
        KKVS.Event.register("SERVERCONFIGCB", this, "serverConfigCB");
        getServerConfig();
        //if (KKVS.Login_type != "0") {
        //    var pwd = KKVS.Login_type == KK_LOGIN || MOBILE_LOGIN || QQ_LOGIN ? KKVS.Pwd : "";
        //    OxLogin(KKVS.Acc, pwd);
        //} else {
        //    var acc = "";
        //    acc = getPhoneUUID();
        //    OxLogin(acc, "");
        //}

        return true;
    },
    serverConfigCB : function (tag) {
        if (!tag && !KKVS.serverConfigData) {
            var dialog = new modulelobby.TxtDialog({txt : "读取配置失败，请检查网络或稍后重试！", cb : function () {
                modulelobby.rootScene(modulelobby.Login);
            }});
            dialog.show();
        } else {
            // KKVS.Login_type = KK_LOGIN;
            // KKVS.Acc = "kktest1";
            // KKVS.Pwd = "123456";
            //modulelobby.runScene(modulelobby.Preloading);
            if (KKVS.Login_type != "0") {
                if (KKVS.Login_type == WECHAT_LOGIN) {
                    KKVS.Event.fire("goLogin");
                } else {
                    var pwd = KKVS.Login_type == KK_LOGIN || KKVS.Login_type == MOBILE_LOGIN || KKVS.Login_type == QQ_LOGIN ? KKVS.Pwd : "";
                    OxLogin(KKVS.Acc, pwd);
                }
            } else {
                var acc = "";
                acc = getPhoneUUIDMain();
                OxLogin(acc, "");
            }
        }
    },
    loadLocalAcc : function () {
        if (!cc.sys.isNative) {
            return;
        }
        var acc_1 = cc.sys.localStorage.getItem("local_data_acc");
        var pwd_1 = cc.sys.localStorage.getItem("local_data_pwd");
        var type_1 = cc.sys.localStorage.getItem("local_data_type");
        acc_1 = !acc_1 ? "" : acc_1;
        pwd_1 = !pwd_1 ? "" : pwd_1;
        type_1 = !type_1 ? "" : type_1;
        if (acc_1 != "" && pwd_1 != "" && type_1 != "") {
            KKVS.Acc = acc_1;
            KKVS.Pwd = pwd_1;
            KKVS.Pwd_MD5 = KKVS.Pwd;
            KKVS.Login_type = type_1;
        }
    },
    saveLocalAcc : function () {
        if (!cc.sys.isNative || typeof (KKVS.Login_type) != 'string' || KKVS.Acc == "" || KKVS.Pwd == "") {
            return;
        }
        cc.sys.localStorage.setItem("local_data_acc", KKVS.Acc);
        cc.sys.localStorage.setItem("local_data_pwd", KKVS.Pwd);
        cc.sys.localStorage.setItem("local_data_type", KKVS.Login_type);
        cc.sys.localStorage.setItem("local_data_visit", modulelobby.AUTOMATIC_LOGON.toString());
        if (KKVS.Login_type == MOBILE_LOGIN && isMoblieNumber(KKVS.Acc)) {
            cc.sys.localStorage.setItem("local_data_acc_mob", KKVS.Acc);
            cc.sys.localStorage.setItem("local_data_pwd_mob", KKVS.Pwd);
        }
    },
    reportRegister : function () {
        if (cc.sys.isNative && (KKVS.Login_type == VISITOR_LOGIN || KKVS.Login_type == "0") && KKVS.Acc != "" && !isMoblieNumber(KKVS.Acc)) {
            var acc_regist = cc.sys.localStorage.getItem("local_data_regist");
            acc_regist = !acc_regist ? "" : acc_regist;
            if (acc_regist == KKVS.Acc) {
                return;
            }
            cc.sys.localStorage.setItem("local_data_regist", KKVS.Acc);
            //上报存在重复性,查看数据时需删除重复数据
            if (cc.sys.os == cc.sys.OS_IOS) {
                cc.log("registerInstallData ");
                jsb.reflection.callStaticMethod("AppController", "registerInstallData");
            } else if (cc.sys.os == cc.sys.OS_ANDROID) {
                jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "register", "()V");
            }
        }
    },

    login: function() {
        KKVS.INFO_MSG("on click login btn");
        var self = this;
        cc.log("------------login begin----------");
        OnLineManager.onLine();
        cc.log("------------login end----------");

        var seq = cc.sequence(cc.delayTime(18), cc.callFunc(function() {
            var dialog = new modulelobby.TxtDialog({txt : "无法连接服务器，请检查网络或稍后重试！", cb : function () {
                if(cc.sys.os == cc.sys.OS_IOS){
                    modulelobby.rootScene(modulelobby.Login);
                } else{
                    cc.director.end();
                }

            }});
            dialog.show();
        }, self));
        this.runAction(seq);
    },
    on_rank_list : function () {
        this.m_pLoadingBar.setPercent(40);
    },
    on_rank_list_extra : function () {
        this.m_pLoadingBar.setPercent(45);
    },
    on_prop_rank_list : function () {
        this.m_pLoadingBar.setPercent(50);
    },
    on_prop_list : function () {
    },
    on_box_record: function() {
        this.m_pLoadingBar.setPercent(55);
    },
    on_activity_info : function (data) {
        this.m_pLoadingBar.setPercent(60);
    },
    on_sign_record: function(args) {
        this.m_pLoadingBar.setPercent(65);
    },
    on_turntable_left_times: function(args) {
        this.m_pLoadingBar.setPercent(70);
        this.stopAllActions();
        this.playerLoadBarAct();
    },
    onLoginSuccess: function() {
        cc.log("->onLoginSuccess");
        this.m_pLoadingBar.setPercent(20);
        this.saveLocalAcc();
        this.reportRegister();
        //是否实名验证
        var params = {
            UserID : parseInt(KKVS.GUID)
        };
        HttpManager.GetMessage(is_there_any_real_name, params, METHOD_POST, function (data) {
            var ret = null;
            try {
                ret = JSON.parse(data);
            } catch (e) {
                //
            }
            if (!ret) {
                return;
            }
            if (typeof (ret['Success']) == 'boolean') {
                if (ret['Success'] == true) {
                    KKVS.RealName.name = ret['name'];
                    KKVS.RealName.pass_portid = ret['pass_portid'];
                }
                KKVS.RealName.Success = ret['Success'];
            }
        });
        KBEngine.app.player().req_rank_list();
        KBEngine.app.player().req_rank_list_extra();
        KBEngine.app.player().req_prop_rank_list();
        KBEngine.app.player().req_activity_info();
        KBEngine.app.player().req_sign_record();
        //KBEngine.app.player().req_turntable_record();
        KBEngine.app.player().req_turntable_left_times();
        KBEngine.app.player().req_prop_list();
        KBEngine.app.player().req_box_record();
        //um
        var login_provider = "";
        if(KKVS.Login_type == VISITOR_LOGIN || KKVS.Login_type == "0") {
            login_provider = "YK"
        }else if(KKVS.Login_type == KK_LOGIN){
            login_provider = "KK"
        }else if(KKVS.Login_type == WECHAT_LOGIN){
            login_provider = "WX"
        }else if(KKVS.Login_type == QQ_LOGIN){
            login_provider = "QQ"
        }else if(KKVS.Login_type == MOBILE_LOGIN){
            login_provider = "MOB"
        }
        UMengAgentMain.profileSignIn(KKVS.Acc, login_provider);
    },
    
    playerLoadBarAct: function() {
        var self = this;
        var act1 = cc.delayTime(0.1);
        var act2 = cc.callFunc(function() {
            var nFlag = self.m_pLoadingBar.getPercent();
            self.m_pLoadingBar.setPercent(nFlag + 2);
            if (self.m_pLoadingBar.getPercent() >= 100) {
                self.m_pLoadingBar.stopAllActions();
                //KKVS.Event.fire(EVENT_SHOW_VIEW, {viewID : SCENE_ID_MAIN});
                modulelobby.runScene(modulelobby.MainLobby);
                //self.initMainUI();
            }
        });
        var seq = cc.sequence(act1, act2);
        this.m_pLoadingBar.runAction(cc.repeatForever(seq));
    },
    
    onExit: function() {
        KKVS.Event.deregister("onLoginSuccess", this);
        KKVS.Event.deregister("goLogin", this);
        KKVS.Event.deregister("on_sign_record", this);
        //KKVS.Event.deregister("on_turntable_record", this);
        KKVS.Event.deregister("on_activity_info", this);
        KKVS.Event.deregister("on_turntable_left_times", this);
        KKVS.Event.deregister("on_box_record", this);
        KKVS.Event.deregister("on_prop_list", this);
        KKVS.Event.deregister("on_rank_list", this);
        KKVS.Event.deregister("on_rank_list_extra", this);
        KKVS.Event.deregister("on_prop_rank_list", this);
        KKVS.Event.deregister("SERVERCONFIGCB", this);
        // KBEngine.Event.deregister("onLoginBaseappFailed", this);
        // KBEngine.Event.deregister("onLoginFailed", this);
        // KBEngine.Event.deregister("onDisableConnect", this);
        this.stopAllActions();
        this.m_pLoadingBar.stopAllActions();
        this._super();
    },
});