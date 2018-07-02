/**
 * Created by hades on 2017/3/2.
 */
modulelobby.BankCenter = cc.Layer.extend({
    ctor: function () {
        this._super();

        var json = ccs.load("res/bankcenter.json");
        var visibleSize = cc.director.getVisibleSize();
        var origin = cc.director.getVisibleOrigin();
        json.node.x = origin.x + visibleSize.width / 2 - json.node.getContentSize().width / 2;
        json.node.y = origin.y + visibleSize.height / 2 - json.node.getContentSize().height / 2;
        this.addChild(json.node);
        var rootNode = json.node;
        var self = this;
        var bg = rootNode.getChildByName("bg");
        var returnBtn = bg.getChildByName("top").getChildByName("return_btn");
        var leftbar = bg.getChildByName("leftbar");
        this.body = bg.getChildByName("body");
        this.pages = [];
        this.curpage = -1;
        var savemoney_btn = leftbar.getChildByName("savemoney_btn");
        this.pages[0] = {head : savemoney_btn, body : null, obj : modulelobby.BankCenterSaveMUI};
        var getmoney_btn = leftbar.getChildByName("getmoney_btn");
        this.pages[1] = {head : getmoney_btn, body : null, obj : modulelobby.BankCenterGetMUI};
        var alterpwd_btn = leftbar.getChildByName("alterpwd_btn");
        this.pages[2] = {head : alterpwd_btn, body : null, obj : modulelobby.BankCenterPwdUI};

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
        for (var i = 0; i < 3; ++i) {
            this.pages[i].head.setTag(i);
            this.pages[i].head.addClickEventListener(function(sender) {
                self.showPage(sender.getTag());
            });
        }

        this.showPage(0);

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
        for (var i = 0; i < 3; ++i) {
            this.pages[i].head.setEnabled(true);
            this.pages[i].head.loadTextures("popup/057.png", "", "popup/057.png", ccui.Widget.PLIST_TEXTURE);
            var head_png = this.pages[i].head.getChildByName("png");
            if (i == 0) {
                head_png.setSpriteFrame("popup/046.png");
            } else if (i == 1) {
                head_png.setSpriteFrame("popup/048.png");
            } else if (i == 2 ) {
                head_png.setSpriteFrame("popup/023.png");
            }
            this.pages[i].head.setScale(0.9,1);
            if (this.pages[i].body) {
                this.pages[i].body.setVisible(false);
            }
        }
        this.curpage = ind;
        page.head.setEnabled(false);
        page.head.loadTextures("popup/056.png", "", "popup/056.png", ccui.Widget.PLIST_TEXTURE);
        var head_png_sprite;
        if (ind == 0) {
            head_png_sprite = page.head.getChildByName("png");
            head_png_sprite.setSpriteFrame("popup/045.png");
        } else if (ind == 1) {
            head_png_sprite = page.head.getChildByName("png");
            head_png_sprite.setSpriteFrame("popup/047.png");
        } else if (ind == 2 ) {
            head_png_sprite = page.head.getChildByName("png");
            head_png_sprite.setSpriteFrame("popup/022.png");
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
            //this.removeFromParent();
            modulelobby.popScene();
        }
    },
    onEnter : function () {
        cc.Layer.prototype.onEnter.call(this);
        KKVS.Event.register("opt_ret", this, "opt_ret");
        KKVS.Event.register("BankCenter_Switch", this, "onSwitch");
    },
    onExit: function() {
        KKVS.Event.deregister("opt_ret", this);
        KKVS.Event.deregister("BankCenter_Switch", this);
        cc.Layer.prototype.onExit.call(this);
    },
    showDialog : function (args) {
        var dialog = new modulelobby.TxtDialog({title : "系统提示", txt : args});
        dialog.show(this);
    }
});