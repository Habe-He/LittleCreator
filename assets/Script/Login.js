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
var wxSDK = require('./tool/wxSDK');
var AniMnger = require('./game/AniMnger');
var StringDef = require('./tool/StringDef');

// var serversType = cc.Enum({
//     Formal_Server: 0,
//     Test_Server: 1,
//     Local_Server: 2
// });

cc.Class({
    extends: cc.Component,

    properties: {
        loadTxt: cc.Label,
        // selectServer: {
        //     default: serversType.Formal_Server,
        //     type: cc.Enum(serversType)
        // }
    },

    start() {
        this.addEvent();
        cc.log("Login start");
        this.nickName = null;
        this.avatarUrl = null;

        wxSDK.setKeepScreenOn();
        // window.serverNum = this.selectServer;
        // cc.warn('选择服务器 = ' + window.serverNum);

        // sjddz-tbj.phonecoolgame.com/10200
        // 443
    },

    // LIFE-CYCLE CALLBACKS:
    onLoad: function () {
        cc.log("=> onLoad Login");
        var self = this;
        cc.log("Login onLoad");
        if (!wxSDK.updateManager()) {
            self._weChatCheckSession();
        }
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

        cc.log("nickName = " + nickName);
        cc.log("avatarUrl = " + avatarUrl);
        cc.log("nickName = " + nickName);
        // avatarUrl = "http://wx.qlogo.cn/mmopen/vi_32/DYAIOgq83erjeyqibRRqMhkrIERB27SvG5UIv1w2455FwJXUIyqaxBGW81lB3Xic1I00JMVQvog74gxdg94r3LMg/132";
        var datas = {
            'Code': code,
            'nickname': nickName,
            'faceurl': avatarUrl,
            'gender': gender
        };
        //https://apiwxgame.kkvs.com/MobileApi/GetSgameAccounts?Code=061Alg7V09sPpV1PGF3V0IZB7V0Alg7K?
        // var reqURL = "https://apiwxgame.kkvs.com/MobileApi/GetSgameAccounts";
        var reqURL = "https://sjddz-yxjh.17fengyou.com/public/login";
        // demoQuest = http://clientweb.kkvs.com/MobileApi/GetAccountInfoByWeChatJZ?Code=1111
        var newUrl = reqURL + "?Code=" + datas.Code.toString() + "&nickname=" + datas.nickname.toString() +
            "&faceurl=" + datas.faceurl.toString() + "&gender=" + datas.gender.toString();
        cc.log('newUrl = ' + newUrl);
        httpUtils.getInstance().httpGets(newUrl, function (data) {
            cc.log("_serverLogin " + data);
            if (data == -1) {
                cc.log('请检查网络！');
            } else {
                var jsonD = JSON.parse(data);
                cc.log("jsonD.data = " + jsonD.data[0].Accounts);
                KKVS.Login_type = Tool.VISITOR_LOGIN;
                KKVS.Acc = jsonD.data[0].Accounts;
                KKVS.Pwd = jsonD.data[0].PassWord;
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
                if (gender == 1) {
                    gender = 0;
                } else if (gender == 2) {
                    gender = 1;
                }
                var nickName = res.userInfo.nickName;
                cc.log("avatarUrl = " + avatarUrl);
                cc.log("gender = " + gender);
                cc.log("nickName = " + nickName);
                wx.setStorageSync("nickName", nickName);
                wx.setStorageSync("avatarUrl", avatarUrl);
                wx.setStorageSync("gender", gender);
                self._serverLogin(data.code);
            },

            // 061nxiVf1vWfkA0mynXf1yH1Vf1nxiVo
            fail: function (res) {
                cc.log("用户未确认授权 " + data.code);
                self._serverLogin(data.code);
            },
        });
    },

    // 场景切换
    onLoginGameSuccess: function (args) {
        cc.log("登录服连接成功 => " + args);
        this.loadTxt.string = "登录成功";
        this.loadResForWx(args);
    },

    // 加载resource资源
    loadResForWx: function (args) {
        cc.log("正在加载resource资源");
        // TODO 分开加载 
        // Png
        // prefab
        // 音乐音效

        var progressCb = function (currentNum, maxNum, item) {
            var pre = (currentNum / maxNum) * 100;
            this.loadTxt.string = "正在加载资源......" + parseInt(pre) + "%";
        }.bind(this);

        var completeCb = function (err, res, url) {
            if (err) {
                cc.log("login loadResForWx err = " + err);
                return;
            }
            cc.log("加载一下资源 " + url);
            this.loadTxt.string = "资源加载完成";
            if (args == 1) {
                cc.director.loadScene("Lobby");
            } else {
                cc.director.loadScene("GameUI");
            }

        }.bind(this);

        cc.loader.loadResDir("", progressCb, completeCb);
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