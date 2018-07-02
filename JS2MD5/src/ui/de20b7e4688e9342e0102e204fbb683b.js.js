/**
 * Created by hades on 2017/3/6.
 */
modulelobby.CallCenter = cc.Layer.extend({
    ctor: function () {
        this._super();

        var json = ccs.load("res/usercenter.json");
        var visibleSize = cc.director.getVisibleSize();
        var origin = cc.director.getVisibleOrigin();
        json.node.x = origin.x + visibleSize.width / 2 - json.node.getContentSize().width / 2;
        json.node.y = origin.y + visibleSize.height / 2 - json.node.getContentSize().height / 2;
        this.addChild(json.node);
        var rootNode = json.node;
        var self = this;
        var bg = rootNode.getChildByName("bg");
        var logintype = bg.getChildByName("top").getChildByName("logintype");
        logintype.ignoreContentAdaptWithSize(true);
        var returnBtn = bg.getChildByName("return_btn");
        var leftbar = bg.getChildByName("leftbar");
        this.body = bg.getChildByName("body");
        this.pages = [];
        this.curpage = -1;
        var accBtn = leftbar.getChildByName("acc_btn");
        this.pages[0] = {head : accBtn, body : null, obj : modulelobby.UserCenterAccUI};
        var bankBtn = leftbar.getChildByName("bank_btn");
        this.pages[1] = {head : bankBtn, body : null, obj : modulelobby.BankCenterPwdUI};
        var alipayBtn = leftbar.getChildByName("alipay_btn");
        this.pages[2] = {head : alipayBtn, body : null, obj : modulelobby.UserCenterAlipayUI};

        if (isVisitorLogin()) {
            logintype.setString("(游客进入)");
        } else {
            logintype.setString("(已登录帐号)");
        }
        returnBtn.addClickEventListener(function() {
            returnBtn.setTouchEnabled(false);
            modulelobby.popScene();
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
            if (this.pages[i].body) {
                this.pages[i].body.setVisible(false);
            }
        }
        this.curpage = ind;
        page.head.setEnabled(false);
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
    onEnter : function () {
        cc.Layer.prototype.onEnter.call(this);
        KKVS.Event.register("opt_ret", this, "opt_ret");
        KKVS.Event.register("UserCenter_Switch", this, "showPage");
    },
    onExit: function() {
        KKVS.Event.deregister("opt_ret", this);
        KKVS.Event.deregister("UserCenter_Switch", this);
        cc.Layer.prototype.onExit.call(this);
    },
    showDialog : function (args) {
        var dialog = new modulelobby.TxtDialog({title : "系统提示", txt : args});
        dialog.show(this);
    }
});