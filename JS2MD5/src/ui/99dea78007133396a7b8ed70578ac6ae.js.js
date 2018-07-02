////
////手机登录回调
////手机平台：android, ios
////登录平台：wx,
////登录平台openid: oAvdgwpYxnBO3_pkIqd3vLQ8aITw,
////名称: ***,
////性别: 0,
//// zh_CN,
//// ,
//// ,
//// 中国,
//// http://wx.qlogo.cn/mmopen/ajNVdqHZLLCjuFCA2lMb51NWTic0R6p0jOyx5KE2fR1qzpZQncBlwABuuttkRC9jPJoQictibWzZ8BpuPhHOpkXIkeMTDt5nicBSnJmfZERClpM/0,
//// ovzhNwRKrcssMNpKufYegWnGP454
//var loginCallback = function (args) {
//    cc.log("------------平台登录回调 begin----------");
//    //KKVS.Event.fire(EVENT_LOADING,{event:EVENT_LOADING_HIDE});
//    var objArr = new Array();
//    args = "" + args;
//    objArr = args.split(",");
//    //for(var i = 0; i < objArr.length; ++i) {
//    //    cc.log(i + "=" + objArr[i]);
//    //    CCLOG(i + "=" + objArr[i]);
//    //}
//    var sys_name = objArr[0];
//    if(sys_name == "android") {
//        var platform = objArr[1];
//        if(platform == "wx") {
//            var openid = objArr[2];
//            var nick_name = objArr[3];
//            var sex = objArr[4];
//            //var lang = objArr[5];
//            //var city = objArr[6];
//            //var province = objArr[7];
//            //var country = objArr[8];
//            var headimgurl = objArr[9];
//            var unionid = objArr[10];
//
//            //var data = {};
//            //data.sys = "android";
//            //data.platform = "wx";
//            //data.sex = 0;
//            //data.openid = "oAvdgwpYxnBO3_pkIqd3vLQ8aITw";
//            //data.nick_name = "阿飞";
//            //KKVS.Event.fire("wx_sdk_test", data);
//            KKVS.Acc = hex_md5(openid);
//            KKVS.WxData = {};
//            KKVS.WxData.platform = "wx";
//            KKVS.WxData.sys = "android";
//            KKVS.WxData.openid = hex_md5(openid);
//            KKVS.WxData.nick_name = nick_name;
//            KKVS.WxData.sex = sex;
//            KKVS.WxData.head = headimgurl;
//            KKVS.WxData.unionid = unionid;
//
//            modulelobby.runScene(modulelobby.Preloading);
//        }else {
//            cc.log("->unknown platform");
//        }
//    }else {
//        cc.log("->not phone");
//    }
//    cc.log("------------平台登录回调 end----------");
//};
var loginCallback = function (args) {
    cc.log("------------平台登录回调 begin----------");
    //KKVS.Event.fire(EVENT_LOADING,{event:EVENT_LOADING_HIDE});
    var objArr = new Array();
    args = "" + args;
    objArr = args.split(",");
    var sys_name = objArr[0];
    if(sys_name == "android") {
        var platform = objArr[1];
        if(platform == "wx") {
            var wx_code = objArr[2];
            weChatLoginByCode(wx_code, 10);
        } else {
            cc.log("->unknown platform");
        }
    } else {
        cc.log("->not phone");
    }
    cc.log("------------平台登录回调 end----------");
};
var weChatLoginByCode = function (wx_code, times) {
    var params = {
        Code : wx_code
    };
    cc.log("11111111111 wx_code = " + wx_code);
    modulelobby.showLoading(null, null, 10);
    HttpManager.GetMessage("http://clientweb.kkvs.com/MobileApi/GetAccountInfoByWeChatJZ", params, METHOD_GET, function (data) {
        modulelobby.hideLoading();
        var ret = null;
        try {
            ret = JSON.parse(data.trim());
        } catch (e) {
            //
        }
        if (ret && typeof (ret[0]) != 'undefined' && typeof (ret[0]['Accounts']) == 'string' && typeof (ret[0]['PassWord']) == 'string') {
            KKVS.Login_type = WECHAT_LOGIN;
            KKVS.Acc = ret[0]['Accounts'];
            KKVS.Pwd = ret[0]['PassWord'];
            KKVS.Pwd_MD5 = ret[0]['PassWord'];
            modulelobby.runScene(modulelobby.Preloading);
        } else if (0 < --times) {
            weChatLoginByCode(wx_code, times);
        }
    });
};
//
////oc 登陆回调 js
//var iOSLoginCallback = function(message) {
//    cc.log("------------平台登录回调 start----------");
//    cc.log("code is " + message);
//    if (message) {
//        var objWeixin = new Array();
//        var url = "https://api.weixin.qq.com/sns/oauth2/access_token";
//        objWeixin.appid = "wx766b176eb1ed0fe6";
//        objWeixin.secret = "03b08801903ec527873671a4e1902fd3";
//        objWeixin.code = message;
//        objWeixin.grant_type = "authorization_code";
//
//        var getSuccessCallBack = function (str) {
//            var jsonData = JSON.parse(str);
//            var objWeixincode = new Array();
//            var url = "https://api.weixin.qq.com/sns/userinfo";
//            objWeixincode.access_token = jsonData.access_token;
//            objWeixincode.openid = jsonData.appid;
//            var weixinDataSuccess = function (str) {
//                cc.log("------------weixinDataSuccess----------" + str);
//                weixinLogin(JSON.parse(str));
//            }
//            var weixinDataFailed = function () {
//                cc.log("------------weixinDataFailed----------");
//            }
//            Http.prototype.getData(url, objWeixincode, "GET", weixinDataSuccess, weixinDataFailed);
//            cc.log("------------平台登录回调111 ended----------" + str);
//        }
//        var getFailedCallBack = function () {
//            cc.log("------------平台登录回调 failed----------" + typeof(objArr));
//        }
//
//        Http.prototype.getData(url, objWeixin, "GET", getSuccessCallBack, getFailedCallBack);
//    }
//};
//
//var weixinLogin = function(weixinObj) {
//    //openid	普通用户的标识，对当前开发者帐号唯一
//    //nickname	普通用户昵称
//    //sex	普通用户性别，1为男性，2为女性
//    //province	普通用户个人资料填写的省份
//    //city	普通用户个人资料填写的城市
//    //country	国家，如中国为CN
//    //headimgurl	用户头像，最后一个数值代表正方形头像大小（有0、46、64、96、132数值可选，0代表640*640正方形头像），用户没有头像时该项为空
//    //privilege	用户特权信息，json数组，如微信沃卡用户为（chinaunicom）
//    //unionid	用户统一标识。针对一个微信开放平台帐号下的应用，同一用户的unionid是唯一的。
//    KKVS.Acc = hex_md5(weixinObj.openid);
//    KKVS.WxData = {};
//    KKVS.WxData.platform = "wx";
//    KKVS.WxData.sys = "ios";
//    KKVS.WxData.openid = hex_md5(weixinObj.openid);
//    //KKVS.WxData.nick_name = weixinObj.nickname;
//    KKVS.WxData.nick_name = "charles";
//    KKVS.WxData.sex = weixinObj.sex.toString();
//    KKVS.WxData.head = weixinObj.headimgurl;
//    KKVS.WxData.unionid = weixinObj.unionid;
//    //cc.log("nickname 1 is  "+KKVS.WxData.nick_name);
//    //cc.log("nickname 2 is  "+weixinObj.nickname);
////    KKVS.Acc = weixinObj.openid;
////    KKVS.WxData = {};
////    KKVS.WxData.platform = "wx";
////    KKVS.WxData.sys = "ios";
////    KKVS.WxData.sex = weixinObj.sex;
////    KKVS.WxData.openid = weixinObj.openid;
////    KKVS.WxData.nick_name = weixinObj.nickname;
//    KKVS.Event.fire(EVENT_SHOW_VIEW, {viewID : SCENE_ID_PRELOAD});
//}
modulelobby.AUTOMATIC_LOGON = 0;
modulelobby.Login = cc.Layer.extend({
    ctor: function () {
        this._super();
        KBEngine.app.reset();
        KKVS.reset();
        UMengAgentMain.profileSignOff(); //um
        OnLineManager.reset();
        OnLineManager._autoConnect = false;
        OnLineManager._kicked = false;

        var json = ccs.load("res/login.json");
        var visibleSize = cc.director.getVisibleSize();
        var origin = cc.director.getVisibleOrigin();
        json.node.x = origin.x + visibleSize.width / 2 - json.node.getContentSize().width / 2;
        json.node.y = origin.y + visibleSize.height / 2 - json.node.getContentSize().height / 2;
        this.addChild(json.node);
        var rootNode = json.node;
        var self = this;
        var bg = rootNode.getChildByName("bg");
        var guestBtn = bg.getChildByName("guest_btn");
        var loginBtn = bg.getChildByName("login_btn");
        var wechat_btn = bg.getChildByName("wechat_btn");
        var pwdBtn = bg.getChildByName("pwd_btn");
        var box_1 = bg.getChildByName("box_1");
        var accInput = bg.getChildByName("acc_input");
        var pwdInput = bg.getChildByName("pwd_input");
        this.m_input_account = new InputExView(accInput, true);
        this.m_input_pwd = new InputExView(pwdInput, true);
        this.m_input_account.setFontColor(cc.color(255, 255, 255), cc.color(255, 255, 255));
        this.m_input_pwd.setFontColor(cc.color(255, 255, 255), cc.color(255, 255, 255));
        this.m_input_account.setEditBox(3, 1, 1);
        this.m_input_pwd.setEditBox(5, 0, 1);
        guestBtn.addClickEventListener(function() {
            guestBtn.setTouchEnabled(false);
            guestBtn.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function() {
                guestBtn.setTouchEnabled(true);
            })));
            playEffect();
            if (cc.sys.isNative) {
                KKVS.Acc = getPhoneUUIDMain();
                KKVS.Login_type = VISITOR_LOGIN;
                if (KKVS.Acc !== "") {
                    modulelobby.runScene(modulelobby.Preloading);
                } else {
                    self.emptyInput();
                }
            } else {
                var dialog = new modulelobby.VisitorDialog();
                dialog.show();
                self.emptyInput();
            }
        });
        loginBtn.addClickEventListener(function(sender) {
            sender.setTouchEnabled(false);
            sender.runAction(cc.sequence(cc.delayTime(0.2), cc.callFunc(function() {
                sender.setTouchEnabled(true);
            })));
            playEffect();
            KKVS.Acc = self.m_input_account.getString();
            KKVS.Pwd = self.m_input_pwd.getString();
            KKVS.Login_type = MOBILE_LOGIN;
            //check
            if (KKVS.Acc == "") {
                self.showDialog("帐号不能为空");
                self.emptyInput();
                return;
            }
            if (isMoblieNumber(KKVS.Acc)) {
            } else {
                self.showDialog("帐号无效,请输入11位手机号码");
                self.emptyInput();
                return;
            }
            if (KKVS.Pwd == "") {
                self.showDialog("密码不能为空");
                self.emptyInput();
                return;
            }
            self.emptyInput();
            modulelobby.runScene(modulelobby.Preloading);
        });
        pwdBtn.addClickEventListener(function(sender) {
            pwdBtn.setTouchEnabled(false);
            pwdBtn.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function() {
                pwdBtn.setTouchEnabled(true);
            })));
            playEffect();
            self.emptyInput();
            var dialog = new modulelobby.ForgetPwdDialog(self.m_input_account.getString());
            dialog.show();
        });
        wechat_btn.addClickEventListener(function(sender) {
            sender.setTouchEnabled(false);
            sender.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function() {
                sender.setTouchEnabled(true);
            })));
            playEffect();
            self.emptyInput();
            modulelobby.showLoading(null, null, 10);
            KKVS.Login_type = WECHAT_LOGIN;
            if (cc.sys.os == cc.sys.OS_ANDROID) {
                jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "login", "(Ljava/lang/String;Ljava/lang/String;)V", "wx", "");
            } else if (cc.sys.os == cc.sys.OS_IOS) {
                var ret = jsb.reflection.callStaticMethod("JS2OC", "goWXLogin");
            }
        });
        if (cc.sys.isNative && (cc.sys.os == cc.sys.OS_ANDROID || cc.sys.os == cc.sys.OS_IOS)) {
            wechat_btn.setEnabled(true);
        } else {
            wechat_btn.setEnabled(false);
        }
        //自动登录
        var automatic_logon = cc.sys.localStorage.getItem("local_data_visit");
        automatic_logon = !automatic_logon ? "" : automatic_logon;
        modulelobby.AUTOMATIC_LOGON = parseInt(automatic_logon);
        box_1.setSelected(modulelobby.AUTOMATIC_LOGON);
        box_1.addEventListener(function (sender, type) {
            switch (type) {
                case ccui.CheckBox.EVENT_SELECTED:
                    modulelobby.AUTOMATIC_LOGON = 1;
                    break;
                case ccui.CheckBox.EVENT_UNSELECTED:
                    modulelobby.AUTOMATIC_LOGON = 0;
                    break;
                default:
                    break;
            }
        });
        //var qrcode = bg.getChildByName("qrcode");
        //if (cc.sys.isNative) {
        //    qrcode.setVisible(false);
        //} else {
        //    qrcode.setVisible(true);
        //}
        this.loadMobileAcc();
        if (!MUSIC_CONTROL) {
            //背景音效
            playMusic();
            MUSIC_CONTROL = true;
        }
        //var text = new ccui.Text("v 2017072814", "Arial", 40);
        //text.setAnchorPoint(0, 0);
        //text.setPosition(50, 20);
        //bg.addChild(text, 999);
        return true;
    },
    emptyInput : function () {
        this.m_input_account.setString("");
        this.m_input_pwd.setString("");
    },
    showDialog : function (args) {
        var dialog = new modulelobby.TxtDialog({title : "系统提示", txt : args});
        dialog.show();
    },
    loadMobileAcc : function () {
        if (!cc.sys.isNative) {
            return;
        }
        this.local_acc_prefix = "local_data_acc_mob";
        this.local_pwd_prefix = "local_data_pwd_mob";
        this.loadLocalAcc();
    },
    loadLocalAcc : function () {
        var self = this;
        var acc_1 = cc.sys.localStorage.getItem(self.local_acc_prefix);
        var pwd_1 = cc.sys.localStorage.getItem(self.local_pwd_prefix);
        acc_1 = !acc_1 ? "" : acc_1;
        pwd_1 = !pwd_1 ? "" : pwd_1;
        self.m_input_account.setString(acc_1);
        self.m_input_pwd.setString(pwd_1);
    },
    onEnter : function () {
        this._super();
    },
    onExit : function () {
        if (cc.sys.isNative) {
            cc.spriteFrameCache.removeUnusedSpriteFrames();
            cc.textureCache.removeUnusedTextures();
            cc.sys.garbageCollect();
        }
        this._super();
    }
});