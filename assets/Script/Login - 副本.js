// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

var KKVS = require("./plugin/KKVS")
var Tool = require("./tool/Tool")
var KBEngine = require("kbengine");
cc.Class({
    extends: cc.Component,

    properties: {
        username: {
            default: null,
            type: cc.Label
        },

        wxHead: {
            default: null,
            type: cc.Sprite
        },

        button_change: cc.Button,
        button_login: cc.Button

        // 在这里执行自动登录
        // 获取用户微信昵称
        // 显示用户剩余挑战次数
    },

    start() {
        this.addEvent();
    },

    // LIFE-CYCLE CALLBACKS:
    onLoad: function() {
        var self = this;
        self._weChatCheckSession();

        this.button_login.node.on('click', this.login_callback, this);
        this.button_change.node.on('click', this.change_callback, this);
    },

    login_callback: function (event) {
        var self = this;
        cc.log("点击到登录按钮");
        // KBEngine.Event.fire("login", this.editBoxName.string, this.editBoxPwd.string, "kbengine_cocos_creator_demo");
        
        // cc.director.loadScene("GameUI");
        
        // TODO 暂时使用游客登录
        KKVS.Login_type = Tool.VISITOR_LOGIN;
        KKVS.Acc = 'ceshizhanghaoxg16000001' + Math.random(1, 999);
        KKVS.Pwd = '123456';
        Tool.OxLogin(KKVS.Acc, KKVS.Pwd);
    },

    _weChatCheckSession: function () {
        var self = this;
        wx.checkSession({
            success: function () {
                // 仍然是登录状态
                console.log("仍然是登录状态");
                self._weChatGetUserInfo();
            },

            fail: function (res) {
                // 登录状态已过期 或者 未登录过
                console.log("登录状态已过期 或者 未登录过");
                self._weChatLogin();
            },
        });
    },

    _weChatLogin: function () {
        var self = this;
        wx.login({
            success: function (res) {
                console.log("登录成功 code = " + res.code);
                self._weChatGetUserInfo();
            },

            fail: function (res) {
                console.log("调用小游戏登录失败 code = " + res.errMsg.code);
            },
        });
    },

    _weChatGetUserInfo: function () {
        var self = this;
        wx.getUserInfo({
            success: function (res) {
                var avatarUrl = res.userInfo.avatarUrl;
                var city = res.userInfo.city;
                // 性别 
                // 0 ：未知
                // 1 ：男
                // 2 ：女
                var gender = res.userInfo.gender;
                var nickName = res.userInfo.nickName;
                console.log("city = " + city);
                console.log("gender = " + gender);
                console.log("nickName = " + nickName);
                self.username.string = nickName;
                self._weChatDownloadFile(avatarUrl);
            },

            fail: function () {
                console.log("用户未确认授权");
            },
        });
    },

    _weChatDownloadFile: function (url) {
        var self = this;
        wx.downloadFile({
            url: url,
            header: "image",
            filePath: "",
            success: function (res) {
                var path = res.tempFilePath;
                cc.loader.load(path, function (err, texture) {
                    var frame = new cc.SpriteFrame(texture);
                    self.wxHead.spriteFrame = frame;
                });
            },

            fail: function (err) {
                console.log("下载微信头像失败 = " + err);
            },
        });
    },

    change_callback: function (event) {
        // KBEngine.Event.fire("createAccount", this.editBoxName.string, this.editBoxPwd.string, "kbengine_cocos_creator_demo");
        cc.log("点击到更换按钮");
    },

    // 场景切换
    onLoginSuccess: function () {
        console.log("登录服连接成功");

        // cc.director.loadScene("GameUI");
        Tool.enterGame(1, 2, 0,  0, 0);
    },

    login: function () {
        var self = this;
        var acc = KKVS.Acc;
        var pwd = KKVS.Pwd;
        KBEngine.app.reset();
        if (!acc || acc == "") {
            var args = {
                eventType: 1,
                msg: "登录失败,帐号不能为空",
                pro: null,
                winType: 1
            };
            KKVS.Event.fire("createTips", args);
            return;
        }

        // 45
        var login_extraDatas = {
            login_type: Tool.VISITOR_LOGIN,
            plaza_id: "0",
            server_id: "1"
        };

        var datas = JSON.stringify(login_extraDatas);
        KBEngine.Event.fire("login", acc, pwd, datas);
    },

    LoginGameSvrSuccess: function() {
        cc.director.loadScene("GameUI");
    },

    addEvent() {
        console.log("注册Kbe事件");
        KKVS.Event.register("goLogin", this, "login");
        KKVS.Event.register("onLoginSuccess", this, "onLoginSuccess");
        KKVS.Event.register("LoginGameSvrSuccess", this, "LoginGameSvrSuccess");
    },

    onDestroy() {
        console.log("Login Scene has been destroy");
        KKVS.Event.deregister("goLogin", this);
        KKVS.Event.deregister("onLoginSuccess", this);
        KKVS.Event.deregister("LoginGameSvrSuccess", this);
    },

    // update (dt) {},
});
