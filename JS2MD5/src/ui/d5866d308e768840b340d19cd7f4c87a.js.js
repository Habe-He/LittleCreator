modulelobby.MailDialog = modulelobby.DialogView.extend({
    ctor : function (data) {
        this._super();
        this.data = data;
        this.opt_obj = null;
        var json = ccs.load("res/maildialog_ui.json");
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
        var from_txt = body.getChildByName("from_txt");
        from_txt.ignoreContentAdaptWithSize(true);
        var time_txt = body.getChildByName("time_txt");
        time_txt.ignoreContentAdaptWithSize(true);
        var txt = body.getChildByName("txt");
        var close_btn = body.getChildByName("close_btn");
        close_btn.addClickEventListener(function(sender) {
            close_btn.setTouchEnabled(false);
            playEffect();
            self.close();
        });
        from_txt.setString("发件人:" + InterceptDiyStr(data.fr, 12));
        time_txt.setString("发件时间:" + data.create_time);
        txt.setString(data.content);
        var opt_btn = body.getChildByName("opt_btn");
        if (this.data.type == 1 && this.data.status == 0) { //未领取
            opt_btn.addClickEventListener(function(sender) {
                sender.setTouchEnabled(false);
                sender.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function() {
                    sender.setTouchEnabled(true);
                })));
                playEffect();
                self.onOpt();
            });
            opt_btn.getChildByName("txt").ignoreContentAdaptWithSize(true);
            opt_btn.getChildByName("txt").setString("领取");
            opt_btn.setVisible(true);
        } else {
            opt_btn.setVisible(false);
        }

        return true;
    },
    onOpt : function () {
        modulelobby.showLoading(null, null, 10);
        var params = {
            id : this.data.id,
            type : this.data.type
        };
        var datas = JSON.stringify(params);
        this.opt_obj = {type : PLAYER_MSG_ID_MAIL_OPT, mail_id : params.id, mail_type : params.type}
        KBEngine.app.player().req_player_msg(PLAYER_MSG_ID_MAIL_OPT, datas);
    },
    getBody : function () {
        return this._body;
    },
    getLayer : function () {
        return this._layer;
    },
    on_player_msg : function (cmd, args) {
        if (this.opt_obj && this.opt_obj.type == cmd) {
            modulelobby.hideLoading();
            if (cmd == PLAYER_MSG_ID_MAIL_OPT) {
                if (args.success == true) {
                    this.data.status = 1;
                }
                if (this.opt_obj.mail_type == 0) {
                    KKVS.Event.fire("MailCenter_Load");
                } else if (this.opt_obj.mail_type == 1) {
                    var dialog = new modulelobby.TipDialog({txt : args.code});
                    dialog.show();
                    if (args.success == true) {
                        KKVS.Event.fire("MailCenter_Operate", {mail_type : this.opt_obj.mail_type, code : args.code, mail_id : args.mail_id, success : args.success});
                        this.close();
                    }
                }
            }
            this.opt_obj = null;
        }
    },
    onEnter : function () {
        this._super();
        KKVS.Event.register("on_player_msg", this, "on_player_msg");
        if (KBEngine.app.player() != undefined) {
            if (this.data.type == 0 && this.data.status == 0) {
                var params = {
                    id : this.data.id,
                    type : this.data.type
                };
                var datas = JSON.stringify(params);
                this.opt_obj = {type : PLAYER_MSG_ID_MAIL_OPT, mail_id : params.id, mail_type : params.type}
                KBEngine.app.player().req_player_msg(PLAYER_MSG_ID_MAIL_OPT, datas);
            }
        }
    },
    onExit: function() {
        KKVS.Event.deregister("on_player_msg", this);
        this._super();
    }
});