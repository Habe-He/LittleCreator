modulelobby.FirstFlush = modulelobby.DialogView.extend({
    ctor : function (type) {
        this._super();
        var self = this;
        var json = ccs.load("res/first_flush_ui.json");
        var visibleSize = cc.director.getVisibleSize();
        var origin = cc.director.getVisibleOrigin();
        json.node.x = origin.x + visibleSize.width / 2 - json.node.getContentSize().width / 2;
        json.node.y = origin.y + visibleSize.height / 2 - json.node.getContentSize().height / 2;
        this.addChild(json.node);
        this._layer = json.node.getChildByName("back");
        this._body = json.node.getChildByName("body");
        var close_btn = this._body.getChildByName("close_btn");
        var btn_recharge = this._body.getChildByName("btn_recharge");
        close_btn.addClickEventListener(function(sender) {
            sender.setTouchEnabled(false);
            playEffect();
            self.close();
            if (type) {
                KKVS.Event.fire("Skip_Recharge_Center");
            }
        });
        btn_recharge.addClickEventListener(function(sender) {
            sender.setTouchEnabled(false);
            sender.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function() {
                sender.setTouchEnabled(true);
            })));
            playEffect();
            //首冲金额3元，获得金币60000K币，paymentstr:8000
            if (isVisitorLogin()) {
                self.showDialog({title : "系统提示", txt : "亲爱的玩家：\n    您可以使用游客账号体验游戏, 为了更佳的游戏体验以及账号安全, 建议升级成正式账号。升级账号成功即送1元红包余额。", type : 2, halign : cc.TEXT_ALIGNMENT_LEFT, cb : self.goUserCenter, target: self});
            } else if (cc.sys.isNative) {
                if (cc.sys.os == cc.sys.OS_IOS) {
                    modulelobby.showLoading(null, null, 20);
                    //UMengAgentMain.prePay(m_sCurrency[sender.getTag()].money, m_sCurrency[sender.getTag()].amount, "50");
                    getOrderNumberForAndroid("8000");
                } else if (cc.sys.os == cc.sys.OS_ANDROID) {
                    var channelCode = (typeof cc.channelcode == 'number') ? cc.channelcode : 0;
                    if (channelCode == 0) {
                        if (isWXAppInstalled()){
                            modulelobby.showLoading(null, null, 20);
                            UMengAgentMain.prePay("3", "60000", "50");
                            getOrderNumberForAndroid("8000");
                        } else {
                            (new modulelobby.TxtDialog({title : "系统提示", txt : "微信不支持或未安装"})).show();
                        }
                    } else if (channelCode == 1) {
                        if (isAppInstalled("zypay")) {
                            modulelobby.showLoading(null, null, 20);
                            UMengAgentMain.prePay("3", "60000", "50");
                            getOrderNumberForAndroidZyPay("8000");
                        } else {
                            (new modulelobby.TxtDialog({title : "系统提示", txt : "卓易支付sdk初始化失败"})).show();
                        }
                    }
                }
            } else {
                self.showDialog({title : "系统提示", txt : "web版本暂不支持支付操作"});
            }
        });

        return true;
    },
    SuccessVanish : function () {
        this.close();
    },
    showDialog : function (data, cvisible) {
        var dialog = new modulelobby.TxtDialog(data);
        if (cvisible) {
            dialog.addCloseButton();
        }
        dialog.show();
    },
    goUserCenter : function () {
        this.close();
        KKVS.Event.fire("Skip_User_Center");
    },
    getBody : function () {
        return this._body;
    },
    getLayer : function () {
        return this._layer;
    },
    onEnter : function () {
        this._super();
        KKVS.Event.register("FirstFlushSuccessVanish", this, "SuccessVanish");//首冲成功后消失
    },
    onExit: function() {
        KKVS.Event.deregister("FirstFlushSuccessVanish", this);
        this._super();
    }
});