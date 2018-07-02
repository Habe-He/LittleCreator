/**
 * Created by hades on 2017/2/20.
 */
cc.log("--- load modulelobby --");
var modulelobby = {};
modulelobby.jsFiles = (typeof (jsFiles) == 'undefined') ? [] : jsFiles;
modulelobby._sceneStack = [];
//modulelobby._dialogStack = [];
modulelobby._runningScene = null;
modulelobby._runningSceneLock = false;
modulelobby._runningLoading = null;

modulelobby.baseScene = cc.Scene.extend({
    ctor : function () {
        this._super();
        var self = this;
        this.foreground = true;
        this.dialog = null;
        this.exitDialog = null;
        var listenerHide = cc.EventListener.create({
            event: cc.EventListener.CUSTOM,
            eventName: cc.game.EVENT_HIDE,
            callback: function (event) {
                self.onEventHide(event);
            }
        });
        cc.eventManager.addListener(listenerHide, self);
        var listenerShow = cc.EventListener.create({
            event: cc.EventListener.CUSTOM,
            eventName: cc.game.EVENT_SHOW,
            callback: function (event) {
                self.onEventShow(event);
            }
        });
        cc.eventManager.addListener(listenerShow, self);
        cc.eventManager.addListener({
            event: cc.EventListener.KEYBOARD,
            onKeyReleased: function(keyCode, event) {
                if (keyCode == cc.KEY.back) {
                    //cc.log("modulelobby onKeyReleased cc.KEY.back press:" + keyCode);
                    var sText = "退出荆都麻将？";
                    var cbFunc = function(){
                        self.exitDialog = null;
                        //UMengAgentMain.end(); //um
                        cc.director.end();
                    }

                    if (self.exitDialog) {
                        self.exitDialog.close();
                        self.exitDialog = null;
                    }

                    //var dialog = modulelobby.showTxtDialog({title : "系统提示",txt : sText, type : 2, cb : cbFunc, cb2 : function(){
                    //    self.exitDialog = null;
                    //}});
                    var dialog = new modulelobby.TxtDialog({title : "系统提示",txt : sText, type : 2, cb : cbFunc, cb2 : function(){
                        self.exitDialog = null;
                    }});
                    var _scene = modulelobby._scene();
                    dialog.show(_scene, 901);
                    self.exitDialog = dialog;
                }
            }}, this);
    },
    onEnter : function () {
        cc.Scene.prototype.onEnter.call(this);
        KBEngine.Event.register("onLoginFailed", this, "onLoginFailed");
        KBEngine.Event.register("onLoginBaseappFailed", this, "onLoginFailed");
        KBEngine.Event.register("onDisableConnect", this, "onDisableConnect");
        KBEngine.Event.register("onKicked", this, "onLoginFailed");
        if (KKVS.Kicked || OnLineManager._kicked) {
            modulelobby.rootScene(modulelobby.Login);
        } else {
            this.connect();
        }
    },
    onExit : function () {
        KBEngine.Event.deregister("onLoginFailed", this);
        KBEngine.Event.deregister("onLoginBaseappFailed", this);
        KBEngine.Event.deregister("onDisableConnect", this);
        KBEngine.Event.deregister("onKicked", this);
        cc.Scene.prototype.onExit.call(this);
    },
    onEventHide : function (event) {
        //cc.log("lobby::游戏进入后台 2");
        this.foreground = false;
        this.shutdown();
    },
    onEventShow : function (event) {
        //cc.log("lobby::重新返回游戏 2");
        this.foreground = true;
        modulelobby.hideLoading();
        this.connect();
    },
    shutdown : function () {
        OnLineManager.offLine();
    },
    connect : function () {
        var self = this;
        //cc.log("connect OnLineManager._autoConnect=" + OnLineManager._autoConnect.toString());
        if (!OnLineManager._kicked && OnLineManager._autoConnect && !KBEngine.app.socket) {
            if (OnLineManager.isOnLine()) {
                OnLineManager.reset();
                OnLineManager.onLine();
            } else {
                if (this.dialog) {
                    this.dialog.close();
                    this.dialog = null;
                }
                this.dialog = modulelobby.showTxtDialog({title : "系统提示", txt : "与服务器断开连接,确认重新连接?", type : 2, cb : function () {
                    self.dialog = null;
                    OnLineManager.reset();
                    OnLineManager.onLine();
                }, cb2 : function () {
                    self.dialog = null;
                    modulelobby.rootScene(modulelobby.Login);
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
        modulelobby.hideLoading();
        if (this.dialog) {
            this.dialog.close();
            this.dialog = null;
        }
        this.dialog = modulelobby.showTxtDialog({title : "系统提示", txt : errTxt, type : 1, cb : function () {
            self.dialog = null;
            modulelobby.rootScene(modulelobby.Login);
        }});
    },
    onDisableConnect : function (args) {
        //cc.log("->onDisableConnect, args.disable_type=" + args.disable_type);
        //cc.log("onDisableConnect OnLineManager._autoConnect =" + OnLineManager._autoConnect.toString());
        var self = this;
        modulelobby.hideLoading();
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
            this.dialog = modulelobby.showTxtDialog({title : "系统提示", txt : "与服务器断开连接,确认重新连接?", type : 2, cb : function () {
                self.dialog = null;
                OnLineManager.reset();
                OnLineManager.onLine();
            }, cb2 : function () {
                self.dialog = null;
                modulelobby.rootScene(modulelobby.Login);
            }});
        } else {
            this.dialog = modulelobby.showTxtDialog({title : "系统提示", txt : "游戏正在维护中,请稍后尝试登录.", type : 1, cb : function () {
                self.dialog = null;
                modulelobby.rootScene(modulelobby.Login);
            }});
        }
    }
});
modulelobby._scene = function () {
    if (!modulelobby._runningScene) {
        modulelobby._runningScene = new modulelobby.baseScene();
        cc.director.runScene(modulelobby._runningScene);
    }
    return modulelobby._runningScene;
};

modulelobby.runScene = function (view, params) {
    var _scene = modulelobby._scene();
    var scene = new view(params);
    var i = modulelobby._sceneStack.length;
    if (i === 0) {
        modulelobby._sceneStack[i] = scene;
    } else {
        var destroyScene = modulelobby._sceneStack[i - 1];
        modulelobby._sceneStack[i - 1] = scene;
        destroyScene.removeFromParent();
    }
    _scene.addChild(scene, 10);
};

modulelobby.pushScene = function (view, params) {
    var _scene = modulelobby._scene();
    var scene = new view(params);
    modulelobby._sceneStack.push(scene);
    _scene.addChild(scene, 10);
    var i = modulelobby._sceneStack.length - 1;
    if (0 < i) {
        var backScene = modulelobby._sceneStack[i - 1];
        backScene.setVisible(false);
    }
};

modulelobby.popScene = function () {
    var scene = modulelobby._sceneStack.pop();
    if (typeof (scene) == 'object') {
        scene.removeFromParent();
    }
    var i = modulelobby._sceneStack.length;
    if (0 < i) {
        var enterScene = modulelobby._sceneStack[i - 1];
        enterScene.setVisible(true);
    }
};

modulelobby.cleanScene = function () {
    //clean all scene
    var tmpStack = modulelobby._sceneStack;
    modulelobby._sceneStack = [];
    for (var i = tmpStack.length - 1; 0 <= i; --i) {
        var scene = tmpStack[i];
        if (typeof (scene) == 'object') {
            scene.removeFromParent();
        }
    }
    //clean loading
    //modulelobby.hideLoading();
    //clean all dialog
};
modulelobby.rootScene = function (view, params) {
    modulelobby.cleanScene();
    modulelobby.runScene(view, params);
};
modulelobby.jumpScene = function (view, params) {
    var tmpStack = modulelobby._sceneStack;
    var findInd = -1;
    var findCnt = 0;
    for (var i = tmpStack.length - 1; 0 <= i; --i) {
        var scene = tmpStack[i];
        if (scene instanceof view) {
            findInd = i;
            break;
        }
        ++findCnt;
    }
    if (findInd == -1) {
        modulelobby.pushScene(view, params);
        return;
    }
    if (findCnt == 0) {
        return;
    }
    for (var i = tmpStack.length - 1; findInd < i; --i) {
        var scene = tmpStack[i];
        if (typeof (scene) == 'object') {
            scene.removeFromParent();
        }
    }
    tmpStack.splice(findInd + 1, findCnt);
    var enterScene = modulelobby._sceneStack[findInd];
    enterScene.setVisible(true);
};

modulelobby.showLoading = function (cb, target, time) {
    if (!modulelobby._runningScene) {
        return;
    }
    if (!modulelobby._runningLoading) {
        var _scene = modulelobby._scene();
        modulelobby._runningLoading = new modulelobby.CommonLoading();
        modulelobby._runningLoading.loadUI();
        _scene.addChild(modulelobby._runningLoading, 1000);
    }
    modulelobby._runningLoading.showLoading(cb, target, time);
};
modulelobby.hideLoading = function () {
    if (!modulelobby._runningScene || !modulelobby._runningLoading) {
        return;
    }
    modulelobby._runningLoading.hideLoading();
};

modulelobby.showDialog = function (dialogview, action) {
    if (!modulelobby._runningScene || !dialogview) {
        return;
    }
    var _scene = modulelobby._scene();
    dialogview.show(_scene, 900, action);
};
modulelobby.showTxtDialog = function (data, action) {
    var dialog = new modulelobby.TxtDialog(data);
    modulelobby.showDialog(dialog, action);
    return dialog;
};
modulelobby.showTipDialog = function (data) {
    var dialog = new modulelobby.TipDialog(data);
    modulelobby.showDialog(dialog, null);
    return dialog;
};
modulelobby.isScreenLocked = function () {
    return modulelobby._runningSceneLock;
};
modulelobby.lockScreen = function (locktime) {
    modulelobby._runningSceneLock = true;
    if (modulelobby._runningScene) {
        var time = locktime && (typeof locktime == 'number') ? locktime : 0.3;
        modulelobby._runningScene.runAction(cc.sequence(cc.delayTime(time), cc.callFunc(function () {
            modulelobby.unlockScreen();
        })));
    }
};
modulelobby.unlockScreen = function () {
    modulelobby._runningSceneLock = false;
    if (modulelobby._runningScene) {
        modulelobby._runningScene.stopAllActions();
    }
};

cc.log("--- load modulelobby end --");