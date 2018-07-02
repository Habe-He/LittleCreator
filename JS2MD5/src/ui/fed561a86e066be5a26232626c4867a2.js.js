/**
 * Created by User on 2017/11/2.
 */
modulelobby.Shopping = cc.Layer.extend({
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
        var bg = rootNode.getChildByName("bg");
        var topbar = bg.getChildByName("top");
        var returnBtn = topbar.getChildByName("return_btn");
        var red = topbar.getChildByName("png");
        this.textNum = red.getChildByName("text");
        this.textNum.ignoreContentAdaptWithSize(true);
        var leftbar = bg.getChildByName("leftbar");
        this.body = bg.getChildByName("body");
        this.pages = [];
        this.curpage = -1;
        var agent_btn = leftbar.getChildByName("agent_btn");
        this.pages[0] = {head : agent_btn, body : null, obj : modulelobby.ShoppingCurrency};
        var alipay_btn = leftbar.getChildByName("alipay_btn");
        this.pages[1] = {head : alipay_btn, body : null, obj : modulelobby.ShoppingExchange};
        var wechat_btn = leftbar.getChildByName("wechat_btn");
        wechat_btn.setVisible(false);
        wechat_btn.setTouchEnabled(false);
        this.pages[2] = {head : wechat_btn, body : null, obj : modulelobby.ShoppingPayment};

        returnBtn.addClickEventListener(function() {
            returnBtn.setTouchEnabled(false);
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
        });
        for (var i = 0, l = this.pages.length; i < l; ++i) {
            this.pages[i].head.setTag(i);
            this.pages[i].head.addClickEventListener(function(sender) {
                self.showPage(sender.getTag());
            });
        }
        if (typeof (data) == 'number') {
            this.showPage(data);
        } else {
            this.showPage(0);
        }
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
            //this.pages[i].head.setEnabled(true);
            //var head_png = this.pages[i].head.getChildByName("png");
            //var head_text = this.pages[i].head.getChildByName("text");
            //head_png.setVisible(false);
            //head_text.setVisible(false);
            //if (this.pages[i].body) {
            //    this.pages[i].body.setVisible(false);
            //}
            this.pages[i].head.setEnabled(true);
            this.pages[i].head.loadTextures("popup/057.png", "", "popup/057.png", ccui.Widget.PLIST_TEXTURE);
            var head_png = this.pages[i].head.getChildByName("png");
            if (i == 0) {
                head_png.setSpriteFrame("popup/063.png");
            } else if (i == 1) {
                head_png.setSpriteFrame("popup/003.png");
            } else if (i == 2 ) {
                head_png.setSpriteFrame("popup/004.png");
            }
            this.pages[i].head.setScale(0.9,1);
            if (this.pages[i].body) {
                this.pages[i].body.setVisible(false);
            }
        }
        //this.curpage = ind;
        //page.head.setEnabled(false);
        //var head_png_sprite = page.head.getChildByName("png");
        //head_png_sprite.setVisible(true);
        //var head_text_txt = page.head.getChildByName("text");
        //head_text_txt.setVisible(true);
        this.curpage = ind;
        page.head.setEnabled(false);
        page.head.loadTextures("popup/056.png", "", "popup/056.png", ccui.Widget.PLIST_TEXTURE);
        var head_png_sprite;
        if (ind == 0) {
            head_png_sprite = page.head.getChildByName("png");
            head_png_sprite.setSpriteFrame("popup/002.png");
        } else if (ind == 1) {
            head_png_sprite = page.head.getChildByName("png");
            head_png_sprite.setSpriteFrame("popup/064.png");
        } else if (ind == 2 ) {
            head_png_sprite = page.head.getChildByName("png");
            head_png_sprite.setSpriteFrame("popup/065.png");
        }
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
                this.textNum.setString(getRedPacketTxt(KKVS.PropList[n].count));
                break;
            }
        }
    },
    on_player_msg : function (cmd, params) {
        if (cmd == PLAYER_MSG_ID_PROP) {
            if (typeof params == 'object' && typeof params.prop_id == 'number' && params.prop_id == 1004) {
                if (0 <= params.ch) {
                    this.textNum.setString(getRedPacketTxt(params.num));
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
            modulelobby.popScene();
        }
    },
    onEnter : function () {
        cc.Layer.prototype.onEnter.call(this);
        cc.spriteFrameCache.addSpriteFrames("res/ui/popup/popup_1.plist", "res/ui/popup/popup_1.png");
        cc.spriteFrameCache.addSpriteFrames("res/ui/popup/popup_2.plist", "res/ui/popup/popup_2.png");
        cc.spriteFrameCache.addSpriteFrames("res/ui/shopping/shopping.plist", "res/ui/shopping/shopping.png");
        KKVS.Event.register("on_player_msg", this, "on_player_msg");
        KKVS.Event.register("on_prop_list", this, "on_prop_list");
        KKVS.Event.register("RechargeCenter_Switch", this, "onSwitch");
    },
    onExit: function() {
        KKVS.Event.deregister("on_player_msg", this);
        KKVS.Event.deregister("on_prop_list", this);
        KKVS.Event.deregister("RechargeCenter_Switch", this);
        cc.Layer.prototype.onExit.call(this);
    },
    showDialog : function (args) {
        var dialog = new modulelobby.TxtDialog({title : "系统提示", txt : args});
        dialog.show(this);
    }
});





/************************K币K宝***************************/
modulelobby.ShoppingCurrency = cc.Node.extend({
    ctor: function () {
        this._super();
        var self = this;
        var json = ccs.load("res/shopping.json");
        this.addChild(json.node);
        var agentlist = json.node.getChildByName("bg");
        var png = json.node.getChildByName("png");
        png.setVisible(false);

        var item_model = agentlist.getItem(0);
        agentlist.setItemModel(item_model);
        agentlist.removeItem(0);
        this.loadingbar = json.node.getChildByName("loading");
        try {
            for (var i = 0, len = m_sCurrency.length; i < len;) {
                agentlist.pushBackDefaultItem();
                var item = agentlist.getItem(agentlist.getItems().length - 1);
                item.body1 = item.getChildByName("shopping_0");
                item.body1.setVisible(false);
                item.body2 = item.getChildByName("shopping_1");
                item.body2.setVisible(false);
                item.body3 = item.getChildByName("shopping_2");
                item.body3.setVisible(false);
                item.body4 = item.getChildByName("shopping_3");
                item.body4.setVisible(false);
                this.loadAgent(i++, item.body1);
                this.loadAgent(i++, item.body2);
                this.loadAgent(i++, item.body3);
                this.loadAgent(i++, item.body4);
            }
        } catch (e) {
        }
        this.loadingbar.runAction(cc.sequence(cc.delayTime(0.5), cc.callFunc(function () {
            self.hiddenLoading();
        })));

        return true;
    },
    showLoading : function () {
        this.loadingbar.runAction(cc.rotateBy(2, 360).repeatForever());
        this.loadingbar.setVisible(true);
    },
    hiddenLoading : function () {
        this.loadingbar.stopAllActions();
        this.loadingbar.setVisible(false);
    },
    loadAgent : function (ind, node) {
        if (!m_sCurrency[ind]) {
            return;
        }
        var self = this;
        node.png_1 = node.getChildByName("png_1");
        node.png_2 = node.getChildByName("png_2");
        node.png_3 = node.getChildByName("png_3");
        node.text_1 = node.getChildByName("text_1");
        node.text_1.ignoreContentAdaptWithSize(true);
        node.text_2 = node.getChildByName("text_2");

        if (m_sCurrency[ind].type == 0) {
            node.loadTexture("shopping/242.png", ccui.Widget.PLIST_TEXTURE);
            node.png_1.loadTexture("shopping/247.png", ccui.Widget.PLIST_TEXTURE);
            node.png_1.ignoreContentAdaptWithSize(true);
            if (50 <= parseInt(m_sCurrency[ind].money)) {
                node.png_2.loadTexture("shopping/251.png", ccui.Widget.PLIST_TEXTURE);
                node.png_2.ignoreContentAdaptWithSize(true);
            }else {
                node.png_2.loadTexture("shopping/250.png", ccui.Widget.PLIST_TEXTURE);
                node.png_2.ignoreContentAdaptWithSize(true);
            }
        }else if (m_sCurrency[ind].type == 1){
            node.loadTexture("shopping/241.png", ccui.Widget.PLIST_TEXTURE);
            node.png_1.loadTexture("shopping/246.png", ccui.Widget.PLIST_TEXTURE);
            node.png_1.ignoreContentAdaptWithSize(true);
            node.png_2.loadTexture("shopping/252.png", ccui.Widget.PLIST_TEXTURE);
            node.png_2.ignoreContentAdaptWithSize(true);
        }
        node.png_3.loadTexture("shopping/255.png", ccui.Widget.PLIST_TEXTURE);
        node.png_3.ignoreContentAdaptWithSize(true);
        node.text_1.setString(m_sCurrency[ind].amount);
        node.text_2.setString(m_sCurrency[ind].money);
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
                        self.showDialog({title : "系统提示", txt : "亲爱的玩家：\n    您可以使用游客账号体验游戏, 为了更佳的游戏体验以及账号安全, 建议升级成正式账号。升级账号成功即送3.5元红包余额。", type : 2, halign : cc.TEXT_ALIGNMENT_LEFT, cb : self.goUserCenter, target: self});
                    } else if (cc.sys.isNative) {
                        if (cc.sys.os == cc.sys.OS_IOS) {
                            modulelobby.showLoading(null, null, 20);
                            //UMengAgentMain.prePay(m_sCurrency[sender.getTag()].money, m_sCurrency[sender.getTag()].amount, "50");
                            var transactionID = getTransaction_ID(m_sCurrency[sender.getTag()].money, m_sCurrency[sender.getTag()].paymentstr)
                        } else if (cc.sys.os == cc.sys.OS_ANDROID) {
                            if (isWXAppInstalled()){
                                modulelobby.showLoading(null, null, 20);
                                UMengAgentMain.prePay(m_sCurrency[sender.getTag()].money, m_sCurrency[sender.getTag()].amount, "50");
                                getOrderNumberForAndroid(m_sCurrency[sender.getTag()].paymentstr);
                            } else {
                                (new modulelobby.TxtDialog({title : "系统提示", txt : "微信不支持或未安装"})).show();
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
    onEnter : function () {
        this._super();
        this.showLoading();
        cc.spriteFrameCache.addSpriteFrames("res/ui/shopping/shopping.plist", "res/ui/shopping/shopping.png");
    }
});




/***********************兑换***************************/
modulelobby.ShoppingExchange = cc.Node.extend({
    ctor: function () {
        this._super();
        var self = this;
        var json = ccs.load("res/shopping.json");
        this.addChild(json.node);
        var agentlist = json.node.getChildByName("bg");
        var png = json.node.getChildByName("png");
        var wechat_pn = png.getChildByName("text_2");
        wechat_pn.ignoreContentAdaptWithSize(true);
        wechat_pn.setString("微信公众号:" + wechat_public_number);
        var copy = png.getChildByName("copy");
        png.setVisible(true);
        this.typeNum = -1;

        var item_model = agentlist.getItem(0);
        agentlist.setItemModel(item_model);
        agentlist.removeItem(0);
        this.loadingbar = json.node.getChildByName("loading");
        try {
            for (var i = 0, len = m_sExchange.length; i < len;) {
                agentlist.pushBackDefaultItem();
                var item = agentlist.getItem(agentlist.getItems().length - 1);
                item.body1 = item.getChildByName("shopping_0");
                item.body1.setVisible(false);
                item.body2 = item.getChildByName("shopping_1");
                item.body2.setVisible(false);
                item.body3 = item.getChildByName("shopping_2");
                item.body3.setVisible(false);
                item.body4 = item.getChildByName("shopping_3");
                item.body4.setVisible(false);
                this.loadAgent(i++, item.body1);
                this.loadAgent(i++, item.body2);
                this.loadAgent(i++, item.body3);
                this.loadAgent(i++, item.body4);
            }
        } catch (e) {
        }
        this.loadingbar.runAction(cc.sequence(cc.delayTime(0.5), cc.callFunc(function () {
            self.hiddenLoading();
        })));

        copy.addClickEventListener(function(sender){
            sender.setTouchEnabled(false);
            sender.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function() {
                sender.setTouchEnabled(true);
            })));
            //复制公众号
            copyToClipboardMain(wechat_public_number);
            (new modulelobby.TxtDialog({title : "系统提示", txt : "复制成功，请打开微信粘贴公众号并关注\n\n公众号：kk_ddz                      "})).show();
        });

        return true;
    },
    showLoading : function () {
        this.loadingbar.runAction(cc.rotateBy(2, 360).repeatForever());
        this.loadingbar.setVisible(true);
    },
    hiddenLoading : function () {
        this.loadingbar.stopAllActions();
        this.loadingbar.setVisible(false);
    },
    loadAgent : function (ind, node) {
        if (!m_sExchange[ind]) {
            return;
        }
        var self = this;
        node.png_1 = node.getChildByName("png_1");
        node.png_2 = node.getChildByName("png_2");
        node.png_3 = node.getChildByName("png_3");
        node.text_1 = node.getChildByName("text_1");
        node.text_1.ignoreContentAdaptWithSize(true);
        node.text_2 = node.getChildByName("text_2");
        node.setTag(ind);
        if (m_sExchange[ind].type == 0) {
            node.loadTexture("shopping/242.png", ccui.Widget.PLIST_TEXTURE);
            node.png_1.loadTexture("shopping/247.png", ccui.Widget.PLIST_TEXTURE);
            node.png_1.ignoreContentAdaptWithSize(true);
            if (50 <= parseInt(m_sExchange[ind].money)) {
                node.png_2.loadTexture("shopping/251.png", ccui.Widget.PLIST_TEXTURE);
                node.png_2.ignoreContentAdaptWithSize(true);
            }else {
                node.png_2.loadTexture("shopping/250.png", ccui.Widget.PLIST_TEXTURE);
                node.png_2.ignoreContentAdaptWithSize(true);
            }
        }else if (m_sExchange[ind].type == 2){
            node.loadTexture("shopping/240.png", ccui.Widget.PLIST_TEXTURE);
            node.png_1.loadTexture("shopping/254.png", ccui.Widget.PLIST_TEXTURE);
            node.png_1.ignoreContentAdaptWithSize(true);
            if (10 < parseInt(m_sExchange[ind].money)) {
                node.png_2.loadTexture("shopping/249.png", ccui.Widget.PLIST_TEXTURE);
                node.png_2.ignoreContentAdaptWithSize(true);
            }else {
                node.png_2.loadTexture("shopping/248.png", ccui.Widget.PLIST_TEXTURE);
                node.png_2.ignoreContentAdaptWithSize(true);
            }
        }
        node.png_3.loadTexture("shopping/265.png", ccui.Widget.PLIST_TEXTURE);
        node.png_3.ignoreContentAdaptWithSize(true);
        node.text_1.setString(m_sExchange[ind].amount);
        node.text_2.setString(m_sExchange[ind].money);

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
                        self.showDialog({title : "系统提示", txt : "亲爱的玩家：\n    您可以使用游客账号体验游戏, 为了更佳的游戏体验以及账号安全, 建议升级成正式账号。升级账号成功即送3.5元红包余额。", type : 2, halign : cc.TEXT_ALIGNMENT_LEFT, cb : self.goUserCenter, target: self});
                    }else {
                        modulelobby.showLoading(null, null, 10);
                        var amount;
                        if (m_sExchange[sender.getTag()].type == 0) {
                            self.typeNum = 2;
                        }else if (m_sExchange[sender.getTag()].type == 2) {
                            self.typeNum = 3;
                        }
                        amount = parseFloat(sender.text_2.getString()) * 100;
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
                (new modulelobby.ShoppingPrompt(msg, false)).show();
            }else {
                msg = "兑换成功";
                (new modulelobby.ShoppingPrompt(msg, true)).show();
            }
        }else {
            msg = args.msg || "兑换失败";
            (new modulelobby.ShoppingPrompt(msg, false)).show();
        }
        this.typeNum = -1;
    },
    onEnter : function () {
        cc.Layer.prototype.onEnter.call(this);
        this.showLoading();
        cc.spriteFrameCache.addSpriteFrames("res/ui/shopping/shopping.plist", "res/ui/shopping/shopping.png");
        KKVS.Event.register("opt_ret", this, "opt_ret");
    },
    onExit: function() {
        KKVS.Event.deregister("opt_ret", this);
        cc.Layer.prototype.onExit.call(this);
    }
});






/***********************道具***************************/
modulelobby.ShoppingPayment = cc.Node.extend({
    ctor: function () {
        this._super();
        var self = this;
        var json = ccs.load("res/shopping.json");
        this.addChild(json.node);
        var agentlist = json.node.getChildByName("bg");
        var png = json.node.getChildByName("png");
        png.setVisible(false);

        var item_model = agentlist.getItem(0);
        agentlist.setItemModel(item_model);
        agentlist.removeItem(0);
        this.loadingbar = json.node.getChildByName("loading");
        try {
            for (var i = 0, len = m_sProp.length; i < len;) {
                agentlist.pushBackDefaultItem();
                var item = agentlist.getItem(agentlist.getItems().length - 1);
                item.body1 = item.getChildByName("shopping_0");
                item.body1.setVisible(false);
                item.body2 = item.getChildByName("shopping_1");
                item.body2.setVisible(false);
                item.body3 = item.getChildByName("shopping_2");
                item.body3.setVisible(false);
                item.body4 = item.getChildByName("shopping_3");
                item.body4.setVisible(false);
                this.loadAgent(i++, item.body1);
                this.loadAgent(i++, item.body2);
                this.loadAgent(i++, item.body3);
                this.loadAgent(i++, item.body4);
            }
        } catch (e) {
        }
        this.loadingbar.runAction(cc.sequence(cc.delayTime(0.5), cc.callFunc(function () {
            self.hiddenLoading();
        })));

        return true;
    },
    showLoading : function () {
        this.loadingbar.runAction(cc.rotateBy(2, 360).repeatForever());
        this.loadingbar.setVisible(true);
    },
    hiddenLoading : function () {
        this.loadingbar.stopAllActions();
        this.loadingbar.setVisible(false);
    },
    loadAgent : function (ind, node) {
        if (!m_sProp[ind]) {
            return;
        }
        var self = this;
        node.png_1 = node.getChildByName("png_1");
        node.png_2 = node.getChildByName("png_2");
        var label = new ccui.Text("斗地主", "res/fonts/tengxiangyuan.ttf", 35);
        label.setColor(cc.color(0, 0, 0));
        label.setAnchorPoint(0, 0.5);
        label.setPosition(cc.p(97, 50));
        node.png_2.addChild(label);
        node.png_3 = node.getChildByName("png_3");
        node.text_1 = node.getChildByName("text_1");
        node.text_1.ignoreContentAdaptWithSize(true);
        node.text_2 = node.getChildByName("text_2");

        if (m_sProp[ind].type == 3) {
            node.loadTexture("shopping/243.png", ccui.Widget.PLIST_TEXTURE);
            node.png_1.loadTexture("shopping/261.png", ccui.Widget.PLIST_TEXTURE);
            node.png_1.ignoreContentAdaptWithSize(true);
            node.png_2.loadTexture("shopping/253.png", ccui.Widget.PLIST_TEXTURE);
            node.png_2.ignoreContentAdaptWithSize(true);
            node.png_3.loadTexture("shopping/255.png", ccui.Widget.PLIST_TEXTURE);
            node.png_3.ignoreContentAdaptWithSize(true);
            node.text_1.setString(m_sProp[ind].amount);
            node.text_2.setString(m_sProp[ind].money);
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
                        self.showDialog({title : "系统提示", txt : "亲爱的玩家：\n    您可以使用游客账号体验游戏, 为了更佳的游戏体验以及账号安全, 建议升级成正式账号。升级账号成功即送3.5元红包余额。", type : 2, halign : cc.TEXT_ALIGNMENT_LEFT, cb : self.goUserCenter, target: self});
                    } else {
                        cc.log(" Upload payment parameters = " + m_sProp[sender.getTag()].paymentstr);
                        openWebSite("http://www.baidu.com");
                        //支付选择
                        //var prop = {"type" : m_sProp[sender.getTag()].type, "number" : sender.getTag()};
                        //(new modulelobby.ShoppingProp(prop)).show();
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
    onEnter : function () {
        this._super();
        this.showLoading();
        cc.spriteFrameCache.addSpriteFrames("res/ui/shopping/shopping.plist", "res/ui/shopping/shopping.png");
    }
});






/***********************提示***************************/
modulelobby.ShoppingPrompt = modulelobby.DialogView.extend({
    ctor: function (str, bool) {
        this._super();
        var self = this;
        var json = ccs.load("res/shopping_prompt.json");
        var visibleSize = cc.director.getVisibleSize();
        var origin = cc.director.getVisibleOrigin();
        json.node.x = origin.x + visibleSize.width / 2 - json.node.getContentSize().width / 2;
        json.node.y = origin.y + visibleSize.height / 2 - json.node.getContentSize().height / 2;
        this.addChild(json.node);
        var body;
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
        this.body = body;
        var text = body.getChildByName("text");
        text.setString(str);
        var btn_2 = body.getChildByName("btn_2");
        var close_btn = body.getChildByName("close_btn");

        btn_2.addClickEventListener(function(sender){
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
    }
});









/***********************支付选择***************************/
modulelobby.ShoppingProp = modulelobby.DialogView.extend({
    ctor: function (data) {
        this._super();
        var self = this;
        var json = ccs.load("res/shopping_payment.json");
        var visibleSize = cc.director.getVisibleSize();
        var origin = cc.director.getVisibleOrigin();
        json.node.x = origin.x + visibleSize.width / 2 - json.node.getContentSize().width / 2;
        json.node.y = origin.y + visibleSize.height / 2 - json.node.getContentSize().height / 2;
        this.addChild(json.node);
        this.body = json.node.getChildByName("body");
        var txt_1, txt_2;
        if (data.type == 0) {
            txt_1 = "K币×" + m_sCurrency[data.number].amount;
            txt_2 = "￥" + m_sCurrency[data.number].money;
        } else if (data.type == 3){
            txt_1 = "计时器×" + m_sProp[data.number].amount;
            txt_2 = "￥" + m_sProp[data.number].money;
        }
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
    }
});