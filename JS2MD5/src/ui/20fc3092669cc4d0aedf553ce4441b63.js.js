modulelobby.UserCenter = cc.Layer.extend({
    ctor: function (pageindex) {
        this._super();

        var json = ccs.load("res/usercenter.json");
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
        this.leftbar = back.getChildByName("leftbar");
        this.leftbar.setPosition(cc.p(-211.2, 475.2));
        this.body = back.getChildByName("body");
        this.body.setPosition(cc.p(2688, 475.2));
        this.pages = [];
        this.curpage = -1;
        var info_btn = this.leftbar.getChildByName("info_btn");
        this.pages[0] = {head : info_btn, body : null, obj : modulelobby.UserCenterAccUI};
        var name_btn = this.leftbar.getChildByName("name_btn");
        this.pages[1] = {head : name_btn, body : null, obj : modulelobby.UserCenterRealName};

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
        for (var i = 0; i < 2; ++i) {
            this.pages[i].head.setTag(i);
            this.pages[i].head.addClickEventListener(function(sender) {
                playEffect();
                self.showPage(sender.getTag());
            });
        }
        if (typeof (pageindex) == 'number') {
            this.showPage(pageindex);
        } else {
            this.showPage(0);
        }
        this._show();

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
        for (var i = 0; i < 2; ++i) {
            this.pages[i].head.setEnabled(true);
            this.pages[i].head.loadTextures("currency/currency_16.png", "currency/currency_16.png", "currency/currency_16.png", ccui.Widget.PLIST_TEXTURE);
            var png_1 = this.pages[i].head.getChildByName("png_1");
            png_1.setVisible(false);
            var png_2 = this.pages[i].head.getChildByName("png_2");
            png_2.setVisible(false);
            var png_3 = this.pages[i].head.getChildByName("png_3");
            png_3.setVisible(true);
            this.pages[i].head.setScale(0.95, 1);
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
    opt_ret : function (args) {
        modulelobby.hideLoading();
        if (args.code == 1) {
            //
        } else {
            var msg = args.msg || "操作失败";
            this.showDialog(msg);
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
                KKVS.Event.fire("Lobby_Show");
            })));
            //modulelobby.popScene();
        }
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
        KKVS.Event.register("opt_ret", this, "opt_ret");
        KKVS.Event.register("UserCenter_Switch", this, "onSwitch");
        cc.spriteFrameCache.addSpriteFrames("res/ui/currency/currency_1.plist", "res/ui/currency/currency_1.png");
    },
    onExit: function() {
        KKVS.Event.deregister("opt_ret", this);
        KKVS.Event.deregister("UserCenter_Switch", this);
        this._super();
    },
    showDialog : function (args) {
        var dialog = new modulelobby.TxtDialog({title : "系统提示", txt : args});
        dialog.show(this);
    }
});