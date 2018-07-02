modulelobby.RechargeCenter = cc.Layer.extend({
    ctor: function (data) {
        this._super();

        var json = ccs.load("res/rechargecenter.json");
        var visibleSize = cc.director.getVisibleSize();
        var origin = cc.director.getVisibleOrigin();
        json.node.x = origin.x + visibleSize.width / 2 - json.node.getContentSize().width / 2;
        json.node.y = origin.y + visibleSize.height / 2 - json.node.getContentSize().height / 2;
        this.addChild(json.node);
        var rootNode = json.node;
        var self = this;
        var back = rootNode.getChildByName("back");
        this.top = back.getChildByName("top");
        this.top.setPosition(cc.p(960, 1230));
        var returnBtn = this.top.getChildByName("return_btn");
        this.red_text = this.top.getChildByName("png").getChildByName("text");
        this.red_text.ignoreContentAdaptWithSize(true);
        this.leftbar = back.getChildByName("leftbar");
        this.leftbar.setPosition(cc.p(-211.2, 475.2));
        this.body = back.getChildByName("body");
        this.body.setPosition(cc.p(2688, 475.2));
        this.pages = [];
        this.curpage = -1;
        var btn_0 = this.leftbar.getChildByName("btn_0");
        this.pages[0] = {head : btn_0, body : null, obj : modulelobby.RechargecenterGold};
        var btn_1 = this.leftbar.getChildByName("btn_1");
        this.pages[1] = {head : btn_1, body : null, obj : modulelobby.RechargecenterRed};
        var red_help = this.leftbar.getChildByName("red_help");
        var help_body = this.leftbar.getChildByName("help_body");
        help_body.setVisible(false);
        var help_content = this.leftbar.getChildByName("help_content");
        help_content.setVisible(false);
        red_help.addTouchEventListener(function(sender, type) {
            switch (type) {
                case ccui.Widget.TOUCH_BEGAN:
                    sender.setScale(1.05);
                    break;
                case ccui.Widget.TOUCH_ENDED:
                    sender.setScale(1);
                    playEffect();
                    help_body.setVisible(!help_body.isVisible());
                    help_content.setVisible(!help_content.isVisible());
                    break;
                case ccui.Widget.TOUCH_CANCELED:
                    sender.setScale(1);
                    help_body.setVisible(false);
                    help_content.setVisible(false);
                    break;
                default:
                    break;
            }
        });
        help_body.addTouchEventListener(function(sender, type) {
            switch (type) {
                case ccui.Widget.TOUCH_ENDED:
                    help_body.setVisible(false);
                    help_content.setVisible(false);
                    break;
                case ccui.Widget.TOUCH_CANCELED:
                    help_body.setVisible(false);
                    help_content.setVisible(false);
                    break;
                default:
                    break;
            }
        });
        returnBtn.addClickEventListener(function() {
            playEffect();
            if (!modulelobby.isScreenLocked()) {
                modulelobby.lockScreen(0.9);
                returnBtn.runAction(cc.sequence(cc.delayTime(10), cc.callFunc(function() {
                    self.exit();
                })));
                var onswitch = true;
                var cpage = self.pages[self.curpage];
                if (cpage && cpage.body && typeof (cpage.body.switch) == 'function') {
                    onswitch = cpage.body.switch(-1);
                }
                if (onswitch) {
                    self.exit();
                }
            }
        });
        for (var i = 0, l = this.pages.length; i < l; ++i) {
            this.pages[i].head.setTag(i);
            this.pages[i].head.addClickEventListener(function(sender) {
                playEffect();
                self.showPage(sender.getTag());
            });
        }
        if (typeof (data) == 'number') {
            this.showPage(data);
        } else {
            this.showPage(0);
        }
        this._show();
        this.on_prop_list();

        return true;
    },
    showPage : function (ind) {
        var onswitch = true;
        var cpage = this.pages[this.curpage];
        if (cpage && cpage.body && typeof (cpage.body.switch) == 'function') {
            onswitch = cpage.body.switch(ind);
        }
        if (!onswitch) {
            return;
        }
        var page = this.pages[ind];
        if (!page) {
            return;
        }
        for (var i = 0, l = this.pages.length; i < l; ++i) {
            this.pages[i].head.setEnabled(true);
            this.pages[i].head.loadTextures("currency/currency_16.png", "currency/currency_16.png", "currency/currency_16.png", ccui.Widget.PLIST_TEXTURE);
            var png_1 = this.pages[i].head.getChildByName("png_1");
            png_1.setVisible(false);
            var png_2 = this.pages[i].head.getChildByName("png_2");
            png_2.setVisible(false);
            var png_3 = this.pages[i].head.getChildByName("png_3");
            png_3.setVisible(true);
            this.pages[i].head.setScale(0.95,1);
            if (this.pages[i].body) {
                this.pages[i].body.setVisible(false);
            }
        }
        this.curpage = ind;
        page.head.setEnabled(false);
        page.head.loadTextures("currency/currency_17.png", "currency/currency_17.png", "currency/currency_17.png", ccui.Widget.PLIST_TEXTURE);
        var page_png_1 = page.head.getChildByName("png_1");
        page_png_1.setVisible(true);
        var page_png_2 = page.head.getChildByName("png_2");
        page_png_2.setVisible(true);
        var page_png_3 = page.head.getChildByName("png_3");
        page_png_3.setVisible(false);
        page.head.setScale(1);
        if (!page.body) {
            page.body = new page.obj();
            var size = this.body.getContentSize();
            page.body.setPosition(size.width * 0.5, size.height * 0.5);
            this.body.addChild(page.body, ind);
        } else {
            page.body.setVisible(true);
        }
    },
    on_prop_list : function () {
        for (var n = 0, m = KKVS.PropList.length; n < m; ++n) {
            if (KKVS.PropList[n].prop_id == 1004){
                this.red_text.setString(getRedPacketTxt(KKVS.PropList[n].count));
                break;
            }
        }
    },
    on_player_msg : function (cmd, params) {
        if (cmd == PLAYER_MSG_ID_PROP) {
            if (typeof params == 'object' && typeof params.prop_id == 'number' && params.prop_id == 1004) {
                if (0 <= params.ch) {
                    this.red_text.setString(getRedPacketTxt(params.num));
                }
            }
        }
    },
    onSwitch : function (ind) {
        if (ind == -1) {
            this.exit();
        } else {
            this.showPage(ind);
        }
    },
    exit : function () {
        if (typeof (this.exitTag) == 'undefined') {
            this.exitTag = true;
            this._hide();
            this.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function() {
                modulelobby.popScene();
                KKVS.Event.fire("More_Game_Hide");
            })));
            //modulelobby.popScene();
        }
    },
    showDialog : function (args) {
        var dialog = new modulelobby.TxtDialog({title : "系统提示", txt : args});
        dialog.show(this);
    },
    _show : function () {
        this.top.runAction(cc.moveTo(0.5, cc.p(960, 1080)).easing(cc.easeElasticOut()));
        this.leftbar.runAction(cc.moveTo(0.5, cc.p(211.2, 475.2)).easing(cc.easeElasticOut()));
        this.body.runAction(cc.moveTo(0.5, cc.p(1152, 475.2)).easing(cc.easeElasticOut()));
    },
    _hide : function () {
        this.top.runAction(cc.moveTo(0.3, cc.p(960, 1230)).easing(cc.easeSineOut()));
        this.leftbar.runAction(cc.moveTo(0.3, cc.p(-211.2, 475.2)).easing(cc.easeSineOut()));
        this.body.runAction(cc.moveTo(0.3, cc.p(2688, 475.2)).easing(cc.easeSineOut()));
    },
    onEnter : function () {
        this._super();
        KKVS.Event.register("on_player_msg", this, "on_player_msg");
        KKVS.Event.register("on_prop_list", this, "on_prop_list");
        KKVS.Event.register("RechargeCenter_Switch", this, "onSwitch");
        cc.spriteFrameCache.addSpriteFrames("res/ui/currency/currency_1.plist", "res/ui/currency/currency_1.png");
    },
    onExit: function() {
        KKVS.Event.deregister("on_player_msg", this);
        KKVS.Event.deregister("on_prop_list", this);
        KKVS.Event.deregister("RechargeCenter_Switch", this);
        this._super();
    }
});









//************************************金币********************************************
modulelobby.RechargecenterGold = cc.Node.extend({
    ctor: function () {
        this._super();
        var self = this;
        var json = ccs.load("res/rechargecenter_gold.json");
        this.addChild(json.node);
        var body = json.node.getChildByName("body");
        var view = body.getChildByName("view");
        var item_model = view.getItem(0);
        view.setItemModel(item_model);
        view.removeItem(0);
        try {
            for (var p = 0, c_len = m_sCurrency.length; p < c_len;) {
                view.pushBackDefaultItem();
                var item = view.getItem(view.getItems().length - 1);
                item.body1 = item.getChildByName("shop_0");
                item.body1.setVisible(false);
                item.body2 = item.getChildByName("shop_1");
                item.body2.setVisible(false);
                item.body3 = item.getChildByName("shop_2");
                item.body3.setVisible(false);
                item.body4 = item.getChildByName("shop_3");
                item.body4.setVisible(false);
                this.loadAgent(p++, item.body1);
                this.loadAgent(p++, item.body2);
                this.loadAgent(p++, item.body3);
                this.loadAgent(p++, item.body4);
            }
        } catch (e) {
        }
    },
    loadAgent : function (ind, node) {
        if (!m_sCurrency[ind]) {
            return;
        }
        var self = this;
        node.png_2 = node.getChildByName("png_2");
        node.png_3 = node.getChildByName("png_3");
        node.png_4 = node.getChildByName("png_4");
        node.text_1 = node.getChildByName("text_1");
        node.text_1.ignoreContentAdaptWithSize(true);
        //
        node.png_1 = node.getChildByName("png_1");
        node.png_1.ignoreContentAdaptWithSize(true);
        node.png_5 = node.getChildByName("png_5");
        node.png_6 = node.getChildByName("png_6");
        node.text_2 = node.getChildByName("text_2");
        node.text_2.ignoreContentAdaptWithSize(true);
        node.text_3 = node.getChildByName("text_3");
        node.text_3.ignoreContentAdaptWithSize(true);
        //特效
        node.ation_layer = node.getChildByName("ation_layer");
        node.png_1.setVisible(false);
        this.ation("res/ation_shopgold_" + ind.toString() +".json", node.ation_layer);
        if (m_sCurrency[ind].type == 0) {
            if (50 <= parseInt(m_sCurrency[ind].money)) {
                node.png_1.loadTexture("function/shop_21.png", ccui.Widget.PLIST_TEXTURE);
            }else {
                node.png_1.loadTexture("function/shop_20.png", ccui.Widget.PLIST_TEXTURE);
            }
            node.png_5.setVisible(m_sCurrency[ind].hotshow);
            node.text_2.setString(m_sCurrency[ind].money);
            node.text_3.setString(m_sCurrency[ind].amount + "K币");
            if (!cc.sys.isNative) {
                //H5版本clone()引起的问题(不够全面,克隆之后描边不见了)
                node.text_3.enableOutline(cc.color(150, 86, 52), 1);
            }
            if (ind == 0) {
                node.png_2.setVisible(false);
                node.png_3.setVisible(false);
                node.png_4.setVisible(false);
                node.text_1.setVisible(false);
            }else {
                node.png_2.setVisible(true);
                node.png_3.setVisible(true);
                node.png_4.setVisible(true);
                node.text_1.setVisible(true);
                node.text_1.setString(m_sCurrency[ind].gifts);
            }
            //设置pos
            var pos_1 = parseInt((node.getContentSize().width - (node.text_2.getContentSize().width + node.png_6.getContentSize().width)) / 2);
            node.text_2.setPositionX(pos_1);
            node.png_6.setPositionX((node.getContentSize().width - pos_1));
        }
        node.setTag(ind);
        node.addTouchEventListener(function(sender, type) {
            switch (type) {
                case ccui.Widget.TOUCH_BEGAN:
                    sender.setScale(1.05);
                    break;
                case ccui.Widget.TOUCH_ENDED:
                    sender.setScale(1);
                    sender.setTouchEnabled(false);
                    sender.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function() {
                        sender.setTouchEnabled(true);
                    })));
                    if (isVisitorLogin()) {
                        self.showDialog({title : "系统提示", txt : "亲爱的玩家：\n    您可以使用游客账号体验游戏, 为了更佳的游戏体验以及账号安全, 建议升级成正式账号。升级账号成功即送1元红包余额。", type : 2, halign : cc.TEXT_ALIGNMENT_LEFT, cb : self.goUserCenter, target: self});
                    } else if (cc.sys.isNative) {
                        if (cc.sys.os == cc.sys.OS_IOS) {
                            modulelobby.showLoading(null, null, 20);
                            //UMengAgentMain.prePay(m_sCurrency[sender.getTag()].money, m_sCurrency[sender.getTag()].amount, "50");
                            var transactionID = getTransaction_ID(m_sCurrency[sender.getTag()].money, m_sCurrency[sender.getTag()].paymentstr)
                        } else if (cc.sys.os == cc.sys.OS_ANDROID) {
                            var channelCode = (typeof cc.channelcode == 'number') ? cc.channelcode : 0;
                            if (channelCode == 0) {
                                if (isWXAppInstalled()){
                                    modulelobby.showLoading(null, null, 20);
                                    UMengAgentMain.prePay(m_sCurrency[sender.getTag()].money, m_sCurrency[sender.getTag()].amount, "50");
                                    getOrderNumberForAndroid(m_sCurrency[sender.getTag()].paymentstr);
                                } else {
                                    (new modulelobby.TxtDialog({title : "系统提示", txt : "微信不支持或未安装"})).show();
                                }
                            } else if (channelCode == 1) {
                                if (isAppInstalled("zypay")) {
                                    modulelobby.showLoading(null, null, 20);
                                    UMengAgentMain.prePay(m_sCurrency[sender.getTag()].money, m_sCurrency[sender.getTag()].amount, "50");
                                    getOrderNumberForAndroidZyPay(m_sCurrency[sender.getTag()].paymentstr);
                                } else {
                                    (new modulelobby.TxtDialog({title : "系统提示", txt : "卓易支付sdk初始化失败"})).show();
                                }
                            }
                        }
                    } else {
                        self.showDialog({title : "系统提示", txt : "web版本暂不支持支付操作"});
                    }
                    break;
                case ccui.Widget.TOUCH_CANCELED:
                    sender.setScale(1);
                    break;
                default:
                    break;
            }
        });
        node.setVisible(true);
    },
    showDialog : function (data, cvisible) {
        var dialog = new modulelobby.TxtDialog(data);
        if (cvisible) {
            dialog.addCloseButton();
        }
        dialog.show();
    },
    goUserCenter : function () {
        modulelobby.popScene();
        modulelobby.pushScene(modulelobby.UserCenter);
    },
    ation : function (data, view) {
        var n_data = ccs.load(data);
        var body = n_data.node.getChildByName("body");
        view.addChild(n_data.node);
        var rootAction = n_data.action;
        n_data.node.runAction(rootAction);
        rootAction.play("show", true);

        var view_size = view.getContentSize();
        body.setPosition(cc.p(view_size.width * 0.5, view_size.height * 0.5));
    },
    onEnter : function () {
        this._super();
        cc.spriteFrameCache.addSpriteFrames("res/ui/function/shop_0.plist", "res/ui/function/shop_0.png");
        cc.spriteFrameCache.addSpriteFrames("res/ui/animation/red/red_2.plist", "res/ui/animation/red/red_2.png");
    }
});








//***********************************红包*********************************************
modulelobby.RechargecenterRed = cc.Node.extend({
    ctor: function () {
        this._super();
        var self = this;
        var json = ccs.load("res/rechargecenter_red.json");
        this.addChild(json.node);
        this.typeNum = -1;
        var body = json.node.getChildByName("body");
        var view = body.getChildByName("view");
        var item_model = view.getItem(0);
        view.setItemModel(item_model);
        view.removeItem(0);
        try {
            for (var q = 0, r_len = m_sExchange.length; q < r_len;) {
                view.pushBackDefaultItem();
                var item1 = view.getItem(view.getItems().length - 1);
                item1.body1 = item1.getChildByName("shop_0");
                item1.body1.setVisible(false);
                item1.body2 = item1.getChildByName("shop_1");
                item1.body2.setVisible(false);
                item1.body3 = item1.getChildByName("shop_2");
                item1.body3.setVisible(false);
                item1.body4 = item1.getChildByName("shop_3");
                item1.body4.setVisible(false);
                this.loadAgentR(q++, item1.body1);
                this.loadAgentR(q++, item1.body2);
                this.loadAgentR(q++, item1.body3);
                this.loadAgentR(q++, item1.body4);
            }
        } catch (e) {
        }
    },
    loadAgentR : function (ind, node) {
        if (!m_sExchange[ind]) {
            return;
        }
        var self = this;
        node.png_1 = node.getChildByName("png_1");
        node.png_1.ignoreContentAdaptWithSize(true);
        node.png_2 = node.getChildByName("png_2");
        node.text_1 = node.getChildByName("text_1");
        node.text_1.ignoreContentAdaptWithSize(true);
        node.text_2 = node.getChildByName("text_2");
        node.text_2.ignoreContentAdaptWithSize(true);
        //特效
        if (ind < 4) {
            node.png_1.setVisible(false);
            node.ation_layer = node.getChildByName("ation_layer");
            this.ation("res/ation_shopgold_" + ind.toString() +".json", node.ation_layer);
        }
        if (m_sExchange[ind].type == 0) {
            if (50 <= parseInt(m_sExchange[ind].money)) {
                node.png_1.loadTexture("function/shop_21.png", ccui.Widget.PLIST_TEXTURE);
            }else {
                node.png_1.loadTexture("function/shop_20.png", ccui.Widget.PLIST_TEXTURE);
            }
            node.text_2.setString(m_sExchange[ind].amount + "K币");
        }else if (m_sExchange[ind].type == 2){
            if (10 < parseInt(m_sExchange[ind].money)) {
                node.png_1.loadTexture("function/shop_23.png", ccui.Widget.PLIST_TEXTURE);
            }else {
                node.png_1.loadTexture("function/shop_22.png", ccui.Widget.PLIST_TEXTURE);
            }
            node.text_2.setString(m_sExchange[ind].amount + "红包");
        }
        node.text_1.setString(m_sExchange[ind].money);
        if (!cc.sys.isNative) {
            //H5版本clone()引起的问题(不够全面,克隆之后描边不见了)
            node.text_2.enableOutline(cc.color(150, 86, 52), 1);
        }
        node.setTag(ind);
        node.addTouchEventListener(function(sender, type){
            switch (type) {
                case ccui.Widget.TOUCH_BEGAN:
                    sender.setScale(1.05);
                    break;
                case ccui.Widget.TOUCH_ENDED:
                    sender.setScale(1);
                    sender.setTouchEnabled(false);
                    sender.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function() {
                        sender.setTouchEnabled(true);
                    })));
                    if (isVisitorLogin()) {
                        self.showDialog({title : "系统提示", txt : "亲爱的玩家：\n    您可以使用游客账号体验游戏, 为了更佳的游戏体验以及账号安全, 建议升级成正式账号。升级账号成功即送1元红包余额。", type : 2, halign : cc.TEXT_ALIGNMENT_LEFT, cb : self.goUserCenter, target: self});
                    }else {
                        modulelobby.showLoading(null, null, 10);
                        var amount;
                        if (m_sExchange[sender.getTag()].type == 0) {
                            self.typeNum = 2;
                        }else if (m_sExchange[sender.getTag()].type == 2) {
                            self.typeNum = 3;
                        }
                        amount = parseFloat(sender.text_1.getString()) * 100;
                        KBEngine.app.player().req_exc(self.typeNum, amount);
                    }
                    break;
                case ccui.Widget.TOUCH_CANCELED:
                    sender.setScale(1);
                    break;
                default:
                    break;
            }
        });

        node.setVisible(true);
    },
    showDialog : function (data, cvisible) {
        var dialog = new modulelobby.TxtDialog(data);
        if (cvisible) {
            dialog.addCloseButton();
        }
        dialog.show();
    },
    goUserCenter : function () {
        modulelobby.popScene();
        modulelobby.pushScene(modulelobby.UserCenter);
    },
    opt_ret : function (args) {
        //2红包兑换金币  3红包兑换微信红包
        if (this.typeNum == -1) {
            return;
        }
        modulelobby.hideLoading();
        var msg;
        if (args.code == 1){
            if (this.typeNum == 2) {
                msg = "兑换成功";
                (new modulelobby.RechargecenterPrompt(msg, false)).show();
            }else {
                msg = "兑换成功";
                (new modulelobby.RechargecenterPrompt(msg, true)).show();
            }
        }else {
            msg = args.msg || "兑换失败";
            (new modulelobby.RechargecenterPrompt(msg, false)).show();
        }
        this.typeNum = -1;
    },
    ation : function (data, view) {
        var n_data = ccs.load(data);
        var body = n_data.node.getChildByName("body");
        view.addChild(n_data.node);
        var rootAction = n_data.action;
        n_data.node.runAction(rootAction);
        rootAction.play("show", true);

        var view_size = view.getContentSize();
        body.setPosition(cc.p(view_size.width * 0.5, view_size.height * 0.5));
    },
    onEnter : function () {
        this._super();
        KKVS.Event.register("opt_ret", this, "opt_ret");
        cc.spriteFrameCache.addSpriteFrames("res/ui/function/shop_0.plist", "res/ui/function/shop_0.png");
        cc.spriteFrameCache.addSpriteFrames("res/ui/animation/red/red_2.plist", "res/ui/animation/red/red_2.png");
    },
    onExit: function() {
        KKVS.Event.deregister("opt_ret", this);
        this._super();
    }
});







//***********************************提示*********************************************
modulelobby.RechargecenterPrompt = modulelobby.DialogView.extend({
    ctor: function (str, bool) {
        this._super();
        var self = this;
        var json = ccs.load("res/rechargecenter_prompt.json");
        var visibleSize = cc.director.getVisibleSize();
        var origin = cc.director.getVisibleOrigin();
        json.node.x = origin.x + visibleSize.width / 2 - json.node.getContentSize().width / 2;
        json.node.y = origin.y + visibleSize.height / 2 - json.node.getContentSize().height / 2;
        this.addChild(json.node);
        var body;
        this._layer = json.node.getChildByName("back");
        if (bool) {
            body = json.node.getChildByName("body_2");
            json.node.getChildByName("body_1").setVisible(false);
            var wechat_pn = body.getChildByName("text_2");
            wechat_pn.ignoreContentAdaptWithSize(true);
            wechat_pn.setString("微信公众号:" + wechat_public_number);
        }else {
            body = json.node.getChildByName("body_1");
            json.node.getChildByName("body_2").setVisible(false);
        }
        var text = body.getChildByName("text");
        text.setString(str);
        var btn = body.getChildByName("btn");
        var close_btn = body.getChildByName("close_btn");
        this.body = body;
        btn.addClickEventListener(function(sender){
            sender.setTouchEnabled(false);
            //复制公众号
            if (bool) {
                copyToClipboardMain(wechat_public_number);
                (new modulelobby.TxtDialog({title : "系统提示", txt : "复制成功，请打开微信粘贴公众号并关注\n\n公众号：kk_ddz                      "})).show();
            }
            self.close();
        });

        close_btn.addClickEventListener(function(sender){
            sender.setTouchEnabled(false);
            self.close();
        });

        return true;
    },
    getBody : function () {
        return this.body;
    },
    getLayer : function () {
        return this._layer;
    }
});













//***************************************支付选择*************************************
modulelobby.RechargecenterPayment = modulelobby.DialogView.extend({
    ctor: function (data) {
        this._super();
        var self = this;
        var json = ccs.load("res/rechargecenter_payment.json");
        var visibleSize = cc.director.getVisibleSize();
        var origin = cc.director.getVisibleOrigin();
        json.node.x = origin.x + visibleSize.width / 2 - json.node.getContentSize().width / 2;
        json.node.y = origin.y + visibleSize.height / 2 - json.node.getContentSize().height / 2;
        this.addChild(json.node);
        this._layer = json.node.getChildByName("back");
        this.body = json.node.getChildByName("body");
        var txt_1 = "K币×" + m_sCurrency[data.number].amount;
        var txt_2 = "￥" + m_sCurrency[data.number].money;
        var text_1 = this.body.getChildByName("text_1");
        var text_2 = this.body.getChildByName("text_2");
        text_1.ignoreContentAdaptWithSize(true);
        text_2.ignoreContentAdaptWithSize(true);
        text_1.setString(txt_1);
        text_2.setString(txt_2);
        var btn_1 = this.body.getChildByName("btn_1");
        var btn_2 = this.body.getChildByName("btn_2");
        var close_btn = this.body.getChildByName("close_btn");

        btn_1.addClickEventListener(function(sender){
            sender.setTouchEnabled(false);
            sender.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function() {
                sender.setTouchEnabled(true);
            })));
            cc.log("支付宝-支付");
        });

        btn_2.addClickEventListener(function(sender){
            sender.setTouchEnabled(false);
            sender.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function() {
                sender.setTouchEnabled(true);
            })));
            cc.log("微信-支付");
        });

        close_btn.addClickEventListener(function(sender){
            sender.setTouchEnabled(false);
            self.close();
        });

        return true;
    },
    getBody : function () {
        return this.body;
    },
    getLayer : function () {
        return this._layer;
    }
});