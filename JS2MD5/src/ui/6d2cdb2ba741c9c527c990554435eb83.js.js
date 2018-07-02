modulelobby.CallDialog = modulelobby.DialogView.extend({
    ctor : function () {
        this._super();

        var json = ccs.load("res/calldialog_ui.json");
        var visibleSize = cc.director.getVisibleSize();
        var origin = cc.director.getVisibleOrigin();
        json.node.x = origin.x + visibleSize.width / 2 - json.node.getContentSize().width / 2;
        json.node.y = origin.y + visibleSize.height / 2 - json.node.getContentSize().height / 2;
        this.addChild(json.node);
        var rootNode = json.node;
        var self = this;
        this._layer = rootNode.getChildByName("back");
        var body = rootNode.getChildByName("body");
        this._body = body;
        var text_2 = body.getChildByName("text_2");
        text_2.ignoreContentAdaptWithSize(true);
        text_2.setString("微信公众号:" + wechat_public_number);
        var close_btn = body.getChildByName("close_btn");
        var _clone = body.getChildByName("_clone");
        //var submit_btn = body.getChildByName("submit_btn");
        //var input = body.getChildByName("msgbg").getChildByName("input");
        //if (cc.sys.isMobile && !cc.sys.isNative) {
        //    input = new InputExView(input);
        //    input.setFontColor(cc.color(255, 255, 255), cc.color(255, 255, 255));
        //}
        close_btn.addClickEventListener(function(sender) {
            sender.setTouchEnabled(false);
            playEffect();
            self.close();
        });
        _clone.addClickEventListener(function(sender) {
            sender.setTouchEnabled(false);
            sender.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function() {
                sender.setTouchEnabled(true);
            })));
            playEffect();
            copyToClipboardMain(wechat_public_number);
            (new modulelobby.TxtDialog({title : "系统提示", txt : "复制成功，请打开微信粘贴公众号并关注\n\n公众号：kk_ddz                      "})).show();
        });
        //submit_btn.addClickEventListener(function() {
        //    submit_btn.setTouchEnabled(false);
        //    submit_btn.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function() {
        //        submit_btn.setTouchEnabled(true);
        //    })));
        //    var str = input.getString().trim();
        //    if (!self.checkTxt(str)) {
        //        var dialog = new modulelobby.TxtDialog({title : "系统提示", txt : "内容长度必须大于0且小于100"});
        //        dialog.show();
        //        return;
        //    }
        //    self.close();
        //    //未实现功能:提交给服务器
        //    var params = {data : str};
        //    var datas = JSON.stringify(params);
        //    KBEngine.app.player().req_lobby_msg(LOBBY_MSG_FEEDBACK, datas);
        //});

        return true;
    },
    //checkTxt : function (txt) {
    //    var len = txt.length;
    //    return (0 < len && len < 100);
    //},
    getBody : function () {
        return this._body;
    },
    getLayer : function () {
        return this._layer;
    }
});