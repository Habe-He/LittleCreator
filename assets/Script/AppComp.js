var OnLineManager = require('./tool/OnLineManager');
var gameEngine = require("./plugin/gameEngine");
var KKVS = require("./plugin/KKVS");
var DialogView = require("./widget/DialogView");
var TxtDialogComp = require("./widget/TxtDialogComp");
var TipDialogComp = require("./widget/TipDialogComp");
var LoadingComp = require("./widget/LoadingComp");

var m_sErr = [
    "成功",
    "服务器没有准备好。",
    "服务器负载过重。",
    "非法登录。",
    "用户名或者密码不正确。",
    "用户名不正确。",
    "密码不正确。",
    "创建账号失败（已经存在一个相同的账号）。",
    "操作过于繁忙",
    "当前账号在另一处登录了。",
    "账号已登陆。",
    "游戏正在维护中,请稍后尝试登录.",
    "EntityDefs不匹配。",
    "服务器正在关闭中。",
    "Email地址错误。",
    "账号被冻结。",
    "账号已过期。",
    "账号未激活。",
    "与服务端的版本不匹配。",
    "操作失败。",
    "服务器正在启动中。",
    "未开放账号注册功能。",
    "不能使用email地址。",
    "找不到此账号。",
    "数据库错误(请检查dbmgr日志和DB)。"
];

cc.Class({
    extends: cc.Component,

    properties: {
    },

    ctor : function () {
        this._runningScene = null;
        this._runningSceneLock = false;
        this._runningLoading = null;
        this.foreground = true;
        this.dialog = null;
        this.tipDialog = null;
        //this.exitDialog = null;
    },
    onLoad : function () {
        cc.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
        cc.log("=> AppComp::onLoad()");
        cc.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
        var self = this;
        cc.game.addPersistRootNode(this.node);
        //add listener
        wx.onHide(function() {
            cc.log("=> 监听到微信小游戏  切换后台");
            self.onEventHide();
        });
        wx.onShow(function() {
            cc.log("=> 监听到微信小游戏  切换前台");
            self.onEventShow();
        });
        //主动退出按钮侦听(无)
        gameEngine.Event.register("onLoginFailed", this, "onLoginFailed");
        gameEngine.Event.register("onLoginBaseappFailed", this, "onLoginFailed");
        gameEngine.Event.register("onDisableConnect", this, "onDisableConnect");
        gameEngine.Event.register("onKicked", this, "onLoginFailed");
        if (OnLineManager._kicked) { //KKVS.Kicked ||
            cc.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
            cc.log("=> 强制退出游戏");
            cc.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
        } else {
            this.connect();
        }
    },
    onDestroy : function () {
        cc.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
        cc.log("=> AppComp::onDestroy()");
        cc.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
        cc.game.removePersistRootNode(this.node);
        gameEngine.Event.deregister("onLoginFailed", this);
        gameEngine.Event.deregister("onLoginBaseappFailed", this);
        gameEngine.Event.deregister("onDisableConnect", this);
        gameEngine.Event.deregister("onKicked", this);
    },
    onEventHide : function (event) {
        this.foreground = false;
        this.shutdown();
    },
    onEventShow : function (event) {
        this.foreground = true;
        this.hideLoading();
        this.connect();
    },
    shutdown : function () {
        OnLineManager.offLine();
    },
    connect : function () {
        var self = this;
        //cc.log("connect OnLineManager._autoConnect=" + OnLineManager._autoConnect.toString());
        if (!OnLineManager._kicked && OnLineManager._autoConnect && !gameEngine.app.socket) {
            if (OnLineManager.isOnLine()) {
                OnLineManager.reset();
                OnLineManager.onLine();
            } else {
                if (this.dialog) {
                    this.dialog.close();
                    this.dialog = null;
                }
                this.dialog = this.showTxtDialog({title : "系统提示", txt : "与服务器断开连接,确认重新连接?", type : 2, cb : function () {
                    self.dialog = null;
                    OnLineManager.reset();
                    OnLineManager.onLine();
                }, cb2 : function () {
                    self.dialog = null;
                    cc.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
                    cc.log("=> 强制退出游戏2");
                    cc.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
                }});
            }
        }
    },
    onLoginFailed : function (args) {
        //cc.log("->onLoginFailed");
        var self = this;
        //args.msg_type, args.err_type, args.errcode, args.errtxt
        var errTxt = args.errtxt;
        var errCode = args.errcode;
        if(!errTxt || errTxt == "") {
            if (errCode == 65535 || errCode == 0) {
                errTxt = "与服务器断开连接";
            } else {
                errTxt = m_sErr[errCode];
            }
        }
        errTxt = (!errTxt || errTxt == "") ? "与服务器断开连接" : errTxt.trim();
        //cc.log("onLoginFailed args.err_type =", args.err_type);
        //cc.log("onLoginFailed errTxt =", errTxt);
        OnLineManager._kicked = true;
        this.hideLoading();
        if (this.dialog) {
            this.dialog.close();
            this.dialog = null;
        }
        this.dialog = this.showTxtDialog({title : "系统提示", txt : errTxt, type : 1, cb : function () {
            self.dialog = null;
            cc.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
            cc.log("=> 强制退出游戏3");
            cc.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
        }});
    },
    onDisableConnect : function (args) {
        //cc.log("->onDisableConnect, args.disable_type=" + args.disable_type);
        //cc.log("onDisableConnect OnLineManager._autoConnect =" + OnLineManager._autoConnect.toString());
        var self = this;
        this.hideLoading();
        if (OnLineManager._kicked) {
            //cc.log("OnLineManager._kicked=", OnLineManager._kicked.toString());
            return;
        }
        if (!this.foreground) {
            OnLineManager.reset();
            return;
        }
        if (OnLineManager._autoConnect && OnLineManager.isOnLine()) {
            OnLineManager.onLine();
            return;
        }
        if (this.dialog) {
            this.dialog.close();
            this.dialog = null;
        }
        if (OnLineManager._autoConnect) {
            this.dialog = this.showTxtDialog({title : "系统提示", txt : "与服务器断开连接,确认重新连接?", type : 2, cb : function () {
                self.dialog = null;
                OnLineManager.reset();
                OnLineManager.onLine();
            }, cb2 : function () {
                self.dialog = null;
                cc.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
                cc.log("=> 强制退出游戏4");
                cc.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
            }});
        } else {
            this.dialog = this.showTxtDialog({title : "系统提示", txt : "游戏正在维护中,请稍后尝试登录.", type : 1, cb : function () {
                self.dialog = null;
                cc.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
                cc.log("=> 强制退出游戏5");
                cc.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
            }});
        }
    },
    showLoading : function (cb, target, time) {
        if (!this.node) {
            return;
        }
        if (!this._runningLoading) {
            var loadingNode = (new DialogView()).build(LoadingComp);
            loadingNode.show(this.node, 1000);
            this._runningLoading = loadingNode.getComponent(LoadingComp);
        }
        this._runningLoading.showLoading(cb, target, time);
    },
    hideLoading : function () {
        if (!this.node || !this._runningLoading) {
            return;
        }
        this._runningLoading.hideLoading();
    },
    showDialog : function (dialogview, action) {
        if (!this.node || !dialogview) {
            return;
        }
        dialogview.show(this.node, 900, action);
    },
    showTxtDialog : function (data, action) {
        var dialog = (new DialogView()).build(TxtDialogComp, data);
        this.showDialog(dialog, action);
        return dialog;
    },
    showTheTxtDialog : function (data, action) {
        if (this.dialog) {
            this.dialog.close();
            this.dialog = null;
        }
        this.dialog = (new DialogView()).build(TxtDialogComp, data);
        this.showDialog(this.dialog, action);
        return this.dialog;
    },
    showTipDialog : function (data, action) {
        var dialog = (new DialogView()).build(TipDialogComp, data);
        this.showDialog(dialog, action);
        return dialog;
    },
    showTheTipDialog : function (data, action) {
        if (this.tipDialog) {
            this.tipDialog.close();
            this.tipDialog = null;
        }
        this.tipDialog = (new DialogView()).build(TipDialogComp, data);
        this.showDialog(this.tipDialog, action);
        return this.tipDialog;
    },
    isScreenLocked : function () {
        return this._runningSceneLock;
    },
    lockScreen : function (locktime) {
        this._runningSceneLock = true;
        if (this.node) {
            var self = this;
            var time = locktime && (typeof locktime == 'number') ? locktime : 0.3;
            this.node.runAction(cc.sequence(cc.delayTime(time), cc.callFunc(function () {
                self.unlockScreen();
            })));
        }
    },
    unlockScreen : function () {
        this._runningSceneLock = false;
        if (this.node) {
            this.node.stopAllActions();
        }
    }
});