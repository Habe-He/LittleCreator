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
        // testsgame.kkvs.com   10200 
    },

    _weChatCheckSession: function () {
        var self = this;
        wx.checkSession({
            success: function () {
                cc.log("仍然是登录状态");
                self._wxLoginCode(function (data) {
                    self._serverLogin(data.code);
                });
            },

            fail: function (res) {
                cc.log("登录状态已过期 或者 未登录过");
                self._wxLoginCode(function (data) {
                    self._weChatGetUserInfo(data);
                });
            },
        });
    },

    _wxLoginCode: function (callback) {
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
        var nickName = null;
        var avatarUrl = null;
        var gender = null;

        try {
            nickName = wx.getStorageSync('nickName');
            avatarUrl = wx.getStorageSync('avatarUrl');
            gender = wx.getStorageSync('gender');
          } catch (e) {
            cc.log("get getStorageSync errr");
          }

        if (nickName == null || avatarUrl == null || gender == null) {
            wx.showToast({
                title: '获取本地保存数据失败',
                icon: 'none',
                duration: 1000
            })
            return;
        }

        // cc.log("nickName = " + nickName + " avatarUrl = " + avatarUrl + " gender = " + gender);
        // var reqURL = "https://apiwxgame.kkvs.com/MobileApi/GetSgameAccounts?Code=" + code + "&nickname=" + nickName + "&faceurl=" + avatarUrl + "&gender=" + gender;
        // cc.log("reqURL = " + reqURL);
        var datas = {
            'Code' : code,
            'nickname' : nickName,
            'faceurl' : avatarUrl,
            'gender' : gender
        };
        var reqURL = "https://apiwxgame.kkvs.com/MobileApi/GetSgameAccounts";
        httpUtils.getInstance().httpPost(reqURL, datas, function (data) {
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
                    // 登录成功 保存用户信息
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
                // cc.log("city = " + city);
                // cc.log("gender = " + gender);
                // cc.log("nickName = " + nickName);

                // this.nickName = nickName;
                // this.avatarUrl = avatarUrl;

                wx.setStorage({
                    key: "nickName",
                    data: nickName
                });

                wx.setStorage({
                    key: "avatarUrl",
                    data: avatarUrl
                });

                wx.setStorage({
                    key: "gender",
                    data: gender
                });

                self._serverLogin(data.code);
            },

            fail: function () {
                cc.log("用户未确认授权");
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

    addEvent() {
        cc.log("注册Kbe事件");
        KKVS.Event.register("onLoginGameSuccess", this, "onLoginGameSuccess");
    },

    onDestroy() {
        cc.log("Login Scene has been destroy");
        KKVS.Event.deregister("onLoginGameSuccess", this);
    },

    // update (dt) {},
});