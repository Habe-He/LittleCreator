/**
 * Created by hades on 2017/2/20.
 */
modulelobby.network = {};
modulelobby.network.ip = "122.228.196.166";//"192.168.1.165"; //
modulelobby.network.channel = 0;
modulelobby.EntryViewClass = 0;
modulelobby.EntryView = cc.Layer.extend({
    ctor: function () {
        this._super();

        KBEngine.destroy();
        var args = new KBEngine.KBEngineArgs();
        args.ip = modulelobby.network.ip;
        args.port = 20013;
        KBEngine.create(args);
        //c++ <=> js
        RegisterInterface.registerRecvCallBack();
        if (modulelobby.EntryViewClass == 0) {
            var logoView = new modulelobby.UpdatePage();
            this.addChild(logoView);
        } else {
            var loadingView = new modulelobby.Loading();
            this.addChild(loadingView);
        }

        return true;
    },
    onEnter : function () {
        cc.Layer.prototype.onEnter.call(this);
    },
    onExit : function () {
        cc.Layer.prototype.onExit.call(this);
    }
});

modulelobby.CommonLoading = cc.Layer.extend({
    _interval: null,
    _label: null,
    m_pAnimNode:null,
    m_pLoadingUI : null,
    m_pLoadingNode : null,
    _className: "CommonLoading",
    cb: null,
    target: null,
    timeout : 60 * 5,
    ctor: function () {
        this._super();
    },

    /**
     * 加载UI
     * @param res
     */
    loadUI: function (res) {
        //var json = ccs.load(res);
        //var node = this.m_pAnimNode = json.node;
        var visibleSize = cc.director.getVisibleSize();
        var origin = cc.director.getVisibleOrigin();
        //node.x = origin.x + visibleSize.width / 2 ;
        //node.y = origin.y + visibleSize.height / 2;
        //
        //this.m_pLoadingUI = this.m_pAnimNode.getChildByName("loading_ui");
        //this.m_pLoadingNode = this.m_pLoadingUI.getChildByName("loading_node");
        //
        //this.addChild(node,1,1);
        //var action = json.action;
        //node.runAction(action);
        //action.play("show", true);
        //this.setVisible(false);

        var m_pBg = new ccui.Layout();
        m_pBg.setTouchEnabled(true);
        m_pBg.setBackGroundColorType(ccui.Layout.BG_COLOR_SOLID);
        m_pBg.setBackGroundColor(cc.color(128, 128, 128));
        m_pBg.setBackGroundColorOpacity(128);
        m_pBg.setAnchorPoint(0.5, 0.5);
        m_pBg.setContentSize(1920, 1080);
        m_pBg.setPosition(origin.x + visibleSize.width * 0.5, origin.y + visibleSize.height * 0.5);
        this.addChild(m_pBg);

        var m_pTVTag = new cc.Sprite("res/ui/loading_xz.png");
        m_pTVTag.setPosition(960, 540);
        m_pTVTag.runAction(cc.rotateBy(3, 360.0).repeatForever());
        m_pBg.addChild(m_pTVTag);
        this.setVisible(false);
    },

    /**
     * 后台加载资源(不显示loadingUI
     * @param bInBackground : 是否后台加载
     */
    preloadInBackground: function (bInBackground) {
        if(this._label!=null){
            this._label.setVisible(!bInBackground);
        }
        if(this.m_pAnimNode!=null){
            this.m_pAnimNode.setVisible(!bInBackground);
        }
    },

    /**
     * custom onEnter
     */
    onEnter: function () {
        cc.Layer.prototype.onEnter.call(this);
    },

    /**
     * custom onExit
     */
    onExit: function () {
        cc.Layer.prototype.onExit.call(this);
    },

    /**
     * init with resources
     * @param {Array} resources
     * @param {Function|String} cb
     * @param {Object} target
     */
    initWithResources: function (resources, cb, target) {
        if (cc.isString(resources))
            resources = [resources];
        //this.resources = resources || [];
        //this.cb = cb;
        //this.target = target;
        var _resources = resources || [];

        var self = this;
        this.stopAllActions();
        this.setVisible(true);

        this.runAction(cc.sequence(cc.delayTime(self.timeout),cc.callFunc(self.notifyTimeOut,self)));
        //self.schedule(self._startLoading, 0.5);
        self._startLoading(_resources, cb, target);
    },

    /**
     * 通用loading显示
     * @param cb
     * @param target
     */
    showLoading: function ( cb, target, time) {
        //this.resources = [];
        this.cb = cb || null;
        this.target = target || null;
        time = time || this.timeout;
        var self = this;
        this.stopAllActions();
        this.setVisible(true);
        this.runAction(cc.sequence(cc.delayTime(time),cc.callFunc(self.notifyTimeOut,self)));
        //self.schedule(self._startLoading, 0.5);
        //self._startLoading();
    },

    /**
     * 通用loading显示
     * @param cb
     * @param target
     */
    hideLoading: function () {
        if (this.cb){
            this.cb.call(this.target);
        }
        this.dismiss();
    },

    /**
     * 开始加载
     * @private
     */
    _startLoading: function (resources, cb, target) {
        var self = this;
        //self.unschedule(self._startLoading);
        var res = resources;
        var res_cb = cb;
        var res_target = target;
        if(res.length > 0 )
        {
            if(this.m_pLoadingUI != null) {
                this.m_pLoadingUI.setPercent(100);
                this.m_pLoadingNode.setPositionX(0.0);
            }
            cc.loader.load(res,
                function (result, count, loadedCount) {
                    var percent = (loadedCount / count * 100) | 0;
                    percent = Math.min(percent, 100);
                    self.showPercent(percent);
                    //cc.log("加载中... " + percent + "%");
                }, function () {
                    if (res_cb)
                        res_cb.call(res_target);
                    self.dismiss();
                });
        }else {
            if (res_cb)
                res_cb.call(res_target);
            self.dismiss();
        }

    },

    /**
     * 通知超时
     */
    notifyTimeOut: function () {
        this.dismiss();
        //var params = {bNeedPreLoad:true,eventName:EVENT_SHOW_DIALOG,uiID:UI_ID_DIALOG_COMMON,content:"操作超时"};
        ////CCLOG("notifyTimeOut");
        //try{
        //    KKVS.Event.fire(EVENT_SHOW_DIALOG,params);
        //}
        //catch(e){
        //
        //}
    },

    /**
     * 消失
     */
    dismiss: function () {
        this.stopAllActions();
        //this.unschedule(this._startLoading);
        this.setVisible(false);
        if(this.target)
            this.target = null;
        if(this.cb)
            this.cb = null;
    },


    showPercent: function (percent) {
        //cc.log("->加载中... " + percent + "%");
        if(this._label!=null)
        {
            //this._label.setString("加载中... " + percent + "%");
        }
        if(this.m_pLoadingUI != null) {
            var size = this.m_pLoadingUI.getContentSize().width;
            this.m_pLoadingUI.setPercent(100.0 - percent);
            this.m_pLoadingNode.setPositionX(size * percent / 100.0);
        }
    },

    /**
     * 预加载
     * @param resources :[]资源数组
     * @param cb :回调函数
     * @param target :回调target
     */
    preload: function (resources, cb, target) {
        this.initWithResources(resources, cb, target);
    }
});

modulelobby.getDialogViewShowAction = function () {
    return cc.spawn(cc.fadeTo(0.08, 255), cc.sequence(cc.scaleTo(0.08, 1.05), cc.scaleTo(0.125, 1)));
};
modulelobby.getDialogViewCloseAction = function () {
    return cc.spawn(cc.sequence(cc.delayTime(0.08), cc.fadeTo(0.125, 0)), cc.sequence(cc.scaleTo(0.08, 1.05), cc.scaleTo(0.125, 0.8)));
};

modulelobby.DialogView = cc.Node.extend({
    ctor: function () {
        this._super();
        return true;
    },
    onEnter : function () {
        cc.Node.prototype.onEnter.call(this);
    },
    onExit : function () {
        cc.Node.prototype.onExit.call(this);
    },
    getBody : function () {
        return null;
    },
    getLayer : function () {
        return null;
    },
    show : function (scene, zorder, action) {
        if (!scene) {
            var i = modulelobby._sceneStack.length;
            if (i === 0) {
                cc.log("->modulelobby._sceneStack.length === 0");
                return;
            }
            scene = modulelobby._sceneStack[i - 1];
        }
        var body = this.getBody();
        var layer = this.getLayer();
        if (body) {
            body.setScale(0.8);
            body.setOpacity(122);
            layer.setOpacity(0);
            body.setVisible(false);
            action = action ? action : modulelobby.getDialogViewShowAction();
            layer.runAction(cc.sequence(cc.fadeTo(0.2, 180), cc.callFunc(function() {
                body.setVisible(true);
            })));
            body.runAction(cc.sequence(cc.delayTime(0.2), action));
        }
        if (!zorder) {
            scene.addChild(this);
        } else {
            scene.addChild(this, zorder);
        }
    },
    close : function (action) {
        var body = this.getBody();
        var self = this;
        //if (body && action) {
        if (body) {
            action = action ? action : modulelobby.getDialogViewCloseAction();
            body.runAction(cc.sequence(action, cc.callFunc(function () {
                self.removeFromParent();
            })));
        } else {
            self.removeFromParent();
        }
    }
});