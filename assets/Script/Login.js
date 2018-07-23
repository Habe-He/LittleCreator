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
var gameEngine = require("./plugin/gameEngine")
var httpUtils = require('./plugin/httpUtils')
var OnLineManager = require("./tool/OnLineManager");

cc.Class({
    extends: cc.Component,

    properties: {
        // 在这里执行自动登录
        // 获取用户微信昵称
        // 显示用户剩余挑战次数
    },

    start() {
        this.addEvent();
        cc.log("Login start");
        this.nickName = null;
        this.avatarUrl = null;
    },

    // LIFE-CYCLE CALLBACKS:
    onLoad: function () {
        cc.log("=> onLoad Login");
        var self = this;
        cc.log("Login onLoad");
        self._weChatCheckSession();
    },



    //login_callback: function (event) {
    //    var self = this;
    //    // TODO 暂时使用游客登录
    //    // KKVS.Login_type = Tool.VISITOR_LOGIN;
    //    // KKVS.Acc = 'ceshizhanghaoxg1600000101';
    //    // KKVS.Pwd = '123456';
    //    // Tool.OxLogin(KKVS.Acc, KKVS.Pwd);
    //},

    _weChatCheckSession: function () {
        var self = this;
        wx.checkSession({
            success: function () {
                cc.log("仍然是登录状态");
                self._wxLoginCode(function(data) {
                    self._serverLogin(data.code);
                });
            },

            fail: function (res) {
                cc.log("登录状态已过期 或者 未登录过");
                self._wxLoginCode(function(data) {
                    self._weChatGetUserInfo(data);
                });
            },
        });
    },

    _wxLoginCode: function(callback) {
        wx.login({
            success: function (res) {
                cc.log("登录成功 code = " + res.code);
                callback(res);
            },

            fail: function (res) {
                cc.log("调用小游戏登录失败 code = " + res.errMsg.code);
            },
        });
    },

    _serverLogin: function (code) {
        var reqURL = "https://apiwxgame.kkvs.com/MobileApi/GetSgameAccounts?Code=" + code;
        httpUtils.getInstance().httpGets(reqURL, function (data) {
            cc.log("_serverLogin " + data);
            if (data == -1) {
                cc.log('请检查网络！');
            } else {
                var jsonD = JSON.parse(data);
                cc.log(jsonD);
                cc.log(jsonD[0].Accounts);
                cc.log(jsonD[0].PassWord);

                KKVS.Login_type = Tool.VISITOR_LOGIN;
                KKVS.Acc = jsonD[0].Accounts;
                KKVS.Pwd = jsonD[0].PassWord;

                //Tool.OxLogin(KKVS.Acc, KKVS.Pwd);
                OnLineManager.onLine();
            }
        });
    },

    // 显示微信登录按钮
    _showUserInfoButton(data) {
        var self = this;
        var _w = 0.2265625 * window.innerWidth;
        var _h = 0.68326118 * window.innerHeight;
        var _bw = window.innerWidth; //0.546875 * window.innerWidth;
        var _bh = window.innerHeight; //0.1010101 * window.innerHeight;
        // 创建授权按钮
        try {
            wx.userInfoButton(_w, _h, _bw, _bh, data, function (res) {
                console.log(res);
                if (res.userInfo) {
                    //登录成功 保存用户信息
                    cc.log("res.userInfo = " + res.userInfo);
                    // wxsdk.set('userInfo', res.userInfo);
                    // self.loginState = false;
                    self._serverLogin(res.code);
                } else {
                    // self.loginState = true;
                    cc.log("ffffff");
                }
            });
        } catch (error) {
            console.log(error);
        }
    },

    _weChatGetUserInfo: function (data) {
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
                cc.log("city = " + city);
                cc.log("gender = " + gender);
                cc.log("nickName = " + nickName);

                // this.nickName = nickName;
                // this.avatarUrl = avatarUrl;

                self._serverLogin(data.code);
            },

            fail: function () {
                cc.log("用户未确认授权");
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
                cc.log("下载微信头像失败 = " + err);
            },
        });
    },

    // 场景切换
    onLoginGameSuccess: function (args) {
        cc.log("登录服连接成功 => " + args);
        if (args == 1) {
            cc.director.loadScene("Lobby");
        } else if (args == 2) {
            cc.director.loadScene("GameUI");
        }
    },

    //login: function () {
    //    var self = this;
    //    var acc = KKVS.Acc;
    //    var pwd = KKVS.Pwd;
    //    gameEngine.app.reset();
    //    if (!acc || acc == "") {
    //        var args = {
    //            eventType: 1,
    //            msg: "登录失败,帐号不能为空",
    //            pro: null,
    //            winType: 1
    //        };
    //        KKVS.Event.fire("createTips", args);
    //        return;
    //    }
    //
    //    // 45
    //    var login_extraDatas = {
    //        login_type: Tool.VISITOR_LOGIN,
    //        plaza_id: "0",
    //        server_id: "1"
    //    };
    //
    //    var datas = JSON.stringify(login_extraDatas);
    //    gameEngine.Event.fire("login", acc, pwd, datas);
    //},

    //reConnectGameSvrSuccess: function() {
    //    cc.log("Login reConnectGameSvrSuccess");
    //    cc.director.loadScene("GameUI");
    //},

    addEvent() {
        cc.log("注册Kbe事件");
        //KKVS.Event.register("goLogin", this, "login");
        KKVS.Event.register("onLoginGameSuccess", this, "onLoginGameSuccess");
        //KKVS.Event.register("reConnectGameSvrSuccess", this, "reConnectGameSvrSuccess");
    },

    onDestroy() {
        cc.log("Login Scene has been destroy");
        //KKVS.Event.deregister("goLogin", this);
        KKVS.Event.deregister("onLoginGameSuccess", this);
        //KKVS.Event.deregister("reConnectGameSvrSuccess", this);
    },

    // update (dt) {},
});