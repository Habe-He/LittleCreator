modulelobby.MailCenter = cc.Layer.extend({
    ctor: function () {
        this._super();
        //this.mailallow = false;
        this.opt_obj = null;

        var json = ccs.load("res/mailcenter.json");
        var visibleSize = cc.director.getVisibleSize();
        var origin = cc.director.getVisibleOrigin();
        json.node.x = origin.x + visibleSize.width / 2 - json.node.getContentSize().width / 2;
        json.node.y = origin.y + visibleSize.height / 2 - json.node.getContentSize().height / 2;
        this.addChild(json.node);
        var rootNode = json.node;
        var self = this;
        this.record = [];
        var back = rootNode.getChildByName("back");
        this.top = back.getChildByName("top");
        this.top.setPosition(cc.p(960, 1230));
        var returnBtn = this.top.getChildByName("return_btn");
        //var call_btn = back.getChildByName("top").getChildByName("call_btn");
        this.bg = back.getChildByName("bg");
        this.bg.setPosition(cc.p(2880, 475.2));
        var _text = this.bg.getChildByName("text");
        _text.ignoreContentAdaptWithSize(true);
        _text.setString("微信公众号:" + wechat_public_number);
        var copy = this.bg.getChildByName("copy");
        this.no_mail = this.bg.getChildByName("no_mail");
        this.maillist = this.bg.getChildByName("maillist");
        this.maillock = false;
        this.select_box = this.bg.getChildByName("select_box");
        var del_btn = this.bg.getChildByName("del_btn");

        copy.addClickEventListener(function() {
            copy.setTouchEnabled(false);
            copy.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function() {
                copy.setTouchEnabled(true);
            })));
            playEffect();
            copyToClipboardMain(wechat_public_number);
            (new modulelobby.TxtDialog({title : "系统提示", txt : "复制成功，请打开微信粘贴公众号并关注\n\n公众号：kk_ddz                      "})).show();
        });
        returnBtn.addClickEventListener(function() {
            returnBtn.setTouchEnabled(false);
            playEffect();
            self._hide();
            self.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function() {
                modulelobby.popScene();
                KKVS.Event.fire("Lobby_Show");
            })));
            //modulelobby.popScene();
        });
        //call_btn.addClickEventListener(function() {
        //    call_btn.setTouchEnabled(false);
        //    call_btn.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function() {
        //        call_btn.setTouchEnabled(true);
        //    })));
        //    var dialog = new modulelobby.CallDialog();
        //    dialog.show();
        //});
        del_btn.addClickEventListener(function() {
            del_btn.setTouchEnabled(false);
            del_btn.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function() {
                del_btn.setTouchEnabled(true);
            })));
            playEffect();
            self.onDelete();
        });
        this.select_box.addEventListener(function (sender, type) {
            switch (type) {
                case ccui.CheckBox.EVENT_SELECTED:
                    KKVS.Event.fire("MailCenter_Select", true);
                    break;
                case ccui.CheckBox.EVENT_UNSELECTED:
                    KKVS.Event.fire("MailCenter_Select", false);
                    break;
                default:
                    break;
            }
        });
        var item_model = this.maillist.getItem(0);
        this.maillist.setItemModel(item_model);
        this.maillist.removeItem(0);
        //test
        //var params = {uid : parseInt(KKVS.GUID), title: "系统邮件", content: "系统说：欢迎！", type: 0, fr: "系统", status: 0, gift_id: 0};
        //var datas = JSON.stringify(params);
        //KBEngine.app.player().req_gm_msg(20, 50, datas);
        this._show();

        return true;
    },
    on_lobby_msg : function (cmd, params) {
        if (cmd == LOBBY_MSG_FEEDBACK) {
            //反馈
            this.showTipDialog("数据提交成功!");
        }
    },
    onEnter : function () {
        this._super();
        var self = this;
        KKVS.Event.register("opt_ret", this, "opt_ret");
        //KKVS.Event.register("mailCountChange", this, "onMail");
        KKVS.Event.register("on_player_msg", this, "on_player_msg");
        KKVS.Event.register("MailCenter_Select", this, "onSelect");
        KKVS.Event.register("MailCenter_Operate", this, "onOperate");
        KKVS.Event.register("MailCenter_Load", this, "onLoad");
        KKVS.Event.register("MailCenter_Update", this, "onUpdate");
        KKVS.Event.register("on_lobby_msg", this, "on_lobby_msg");
        if (KBEngine.app.player() != undefined) {
            modulelobby.showLoading(null, null, 10);
            this.runAction(cc.sequence(cc.delayTime(0.05), cc.callFunc(function () {
                var params = {};
                var datas = JSON.stringify(params);
                self.opt_obj = {type : PLAYER_MSG_ID_MAIL_LIST};
                KBEngine.app.player().req_player_msg(PLAYER_MSG_ID_MAIL_LIST, datas);
                //self.mailallow = true;
            })));
        }
    },
    onExit: function() {
        KKVS.Event.deregister("opt_ret", this);
        //KKVS.Event.deregister("mailCountChange", this);
        KKVS.Event.deregister("on_player_msg", this);
        KKVS.Event.deregister("MailCenter_Select", this);
        KKVS.Event.deregister("MailCenter_Load", this);
        KKVS.Event.deregister("MailCenter_Operate", this);
        KKVS.Event.deregister("MailCenter_Update", this);
        KKVS.Event.deregister("on_lobby_msg", this);
        this._super();
    },
    showDialog : function (args) {
        var dialog = new modulelobby.TxtDialog({title : "系统提示", txt : args});
        dialog.show(this);
    },
    showTipDialog : function (args) {
        var dialog = new modulelobby.TipDialog({txt : args});
        dialog.show(this);
    },
    opt_ret : function(args) {
        modulelobby.hideLoading();
        if (args.code == 1) {
            //
        } else {
            var msg = args.msg || "操作失败";
            this.showTipDialog(msg);
            this.opt_obj = null;
        }
    },
    //onMail : function () {
    //    cc.log("->MailCenter::onMail");
    //    if (!this.mailallow) {
    //        return;
    //    }
    //    cc.log("->有新邮件");
    //},
    on_player_msg : function (cmd, args) {
        if (this.opt_obj && this.opt_obj.type == cmd) {
            if (cmd == PLAYER_MSG_ID_MAIL_LIST) {
                this.loadAllMail(args);
            } else if (cmd == PLAYER_MSG_ID_MAIL_OPT) {
            } else if (cmd == PLAYER_MSG_ID_MAIL_DEL) {
                if (args.success == true && this.opt_obj.data) {
                    if (this.opt_obj.data.is_all == 1) {
                        this.maillist.removeAllItems();
                    } else {
                        var select_items = this.opt_obj.items;
                        var select_items_len = select_items.length;
                        for (var d = 0; d < select_items_len; ++d) {
                            this.deleteMail(select_items[d]);
                        }
                    }
                    this.select_box.setSelected(false);
                }
                var msg = args.code || "操作失败";
                this.showTipDialog(msg);
            }
        }
        modulelobby.hideLoading();
        this.opt_obj = null;
    },
    onLoad : function () {
        var m_mails = [];
        var n_iten = this.maillist.getItems();
        for (var n = 0, nn = n_iten.length; n < nn; ++n) {
            m_mails.push(n_iten[n].data);
        }
        this.loadAllMail(m_mails);
    },
    onOperate : function (data) {
        if (!data || !data.success) {
            return;
        }
        var items = this.maillist.getItems();
        var item = null;
        for (var i = 0, len = items.length; i < len; ++i) {
            if (items[i].data.type == data.mail_type && items[i].data.id == data.mail_id) {
                item = items[i];
                break;
            }
        }
        if (!item) {
            return;
        }
        if (item.data.type == 1) {// && item.data.status == 1
            item.data.status = 1;
            item.readtag_txt.setTextColor(cc.color.YELLOW);
            item.readtag_txt.setString("已领取");
            item.box.setVisible(true);
        }
        this.onLoad();
        //var m_mails = [];
        //var n_iten = this.maillist.getItems();
        //for (var n = 0, nn = n_iten.length; n < nn; ++n) {
        //    m_mails.push(n_iten[n].data);
        //}
        //this.loadAllMail(m_mails);
    },
    onSelect : function (select) {
        var items = this.maillist.getItems();
        for (var i = 0, len = items.length; i < len; ++i) {
            var item = items[i];
            if (item.box.isVisible()) {
                item.box.setSelected(select);
            }
        }
    },
    onDelete : function () {
        modulelobby.showLoading(null, null, 10);
        var select_items = [];
        var items = this.maillist.getItems();
        var len = items.length;
        for (var i = 0; i < len; ++i) {
            var item = items[i];
            if (item.box.isSelected()) {
                select_items.push(item);
            }
        }
        var select_items_len = select_items.length;
        if (select_items_len == 0) {
            modulelobby.hideLoading();
            this.showTipDialog("未选中任何邮件");
        } else {
            var params = {};
            params.id = [];
            if (select_items_len == len) {
                params.is_all = 1;
            } else {
                params.is_all = 0;
                for (var m = 0; m < select_items_len; ++m) {
                    params.id.push(select_items[m].data.id);
                }
            }
            var datas = JSON.stringify(params);
            this.opt_obj = {type : PLAYER_MSG_ID_MAIL_DEL, data : params, items : select_items};
            KBEngine.app.player().req_player_msg(PLAYER_MSG_ID_MAIL_DEL, datas);
        }
    },
    _sort : function (data) {
        var load = data;
        var mai = [];
        var mails = [];
        for (var n = 0, leng = load.length; n < leng; ++n) {
            if (load[n].status == 0) {
                mai.push(load[n]);
            } else {
                mails.push(load[n]);
            }
        }
        for (var m = 0, le = mai.length; m < le; ++m) {
            mails.push(mai[m]);
        }
        return mails;
    },
    onUpdate : function (datas) {
        //邮件列表是一个有序(按时间排序)列表
        var mails = datas;
        if (!mails || this.maillock) {
            return;
        }
        var len = mails.length;
        //var mailcnt = (this.maillist.getItems()).length;
        var mailcnt = this.record.length;
        if (len == 0) {
            if (0 < mailcnt) {
                this.maillist.removeAllItems();
            }
            this.no_mail.setVisible(true);
            this.maillist.setVisible(false);
            return;
        }
        this.no_mail.setVisible(false);
        this.maillist.setVisible(true);
        //var f_item = this.maillist.getItem(0);
        var f_item = this.record[mailcnt - 1];
        var f_mail = mails[len - 1];
        var b_update = true;
        //if (len == mailcnt && f_item && f_item.data && f_item.data.id == f_mail.id && f_item.data.create_time == f_mail.create_time) {
        if (len == mailcnt && f_item && f_item.id == f_mail.id && f_item.create_time == f_mail.create_time) {
            b_update = false; //限制频繁刷新
        }
        if (b_update) {
            //if (0 < mailcnt) {
            //    this.maillist.removeAllItems();
            //}
            this.loadAllMail(mails);
        }
    },
    loadAllMail : function (datas) {
        var mails = datas;
        if (!mails || this.maillock) {
            return;
        }
        this.record = datas;
        mails = this._sort(mails);
        //mail = {id:0, title:"title", content:"content", type:0, status:0, gift_id:0, fr:"sender", create_time:"2017.3.10 0:00"}
        this.maillock = true;
        try {
            this.maillist.removeAllItems();
            var len = mails.length;
            for (var i = 0; i < len; ++i) {
                this.loadMail(mails[i]);
            }
        } catch (e) {
        }
        this.maillock = false;
    },
    loadMail : function (data) {
        var self = this;
        //this.maillist.pushBackDefaultItem();
        this.maillist.insertDefaultItem(0);
        var item = this.maillist.getItem(0);
        item.data = data;
        item.box = item.getChildByName("box");
        item.body = item.getChildByName("body");
        item.title_txt = item.body.getChildByName("title_txt");
        item.title_txt.ignoreContentAdaptWithSize(true);
        item.sender_txt = item.body.getChildByName("sender_txt");
        item.sender_txt.ignoreContentAdaptWithSize(true);
        item.time_txt = item.body.getChildByName("time_txt");
        item.time_txt.ignoreContentAdaptWithSize(true);
        item.readtag_txt = item.body.getChildByName("readtag_txt");
        item.readtag_txt.ignoreContentAdaptWithSize(true);
        item.box.setTag(data.id);
        item.box.addEventListener(function (sender, type) {
            switch (type) {
                case ccui.CheckBox.EVENT_SELECTED:
                    var select_all = true;
                    var items = self.maillist.getItems();
                    for (var i = 0, len = items.length; i < len; ++i) {
                        if (items[i].box.isVisible() && !items[i].box.isSelected()) {
                            select_all = false;
                            break;
                        }
                    }
                    if (select_all) {
                        self.select_box.setSelected(true);
                    }
                    break;
                case ccui.CheckBox.EVENT_UNSELECTED:
                    self.select_box.setSelected(false);
                    break;
                default:
                    break;
            }
        });
        item.body.setTag(data.id);
        item.body.addClickEventListener(function (sender) {
            if (item.data.type == 0 && item.data.status == 0) {
                item.readtag_txt.setTextColor(cc.color.YELLOW);
                item.readtag_txt.setString("已读");
            }
            playEffect();
            var dialog = new modulelobby.MailDialog(item.data);
            dialog.show();
        });
        item.title_txt.setString(InterceptDiyStr(data.title, 24));
        item.sender_txt.setString("发件人:" + InterceptDiyStr(data.fr, 24));
        item.time_txt.setString(data.create_time);
        if (data.type == 0) {
            if (data.status == 0) {
                item.readtag_txt.setTextColor(cc.color.GREEN);
                item.readtag_txt.setString("未读");
            } else {
                item.readtag_txt.setTextColor(cc.color.YELLOW);
                item.readtag_txt.setString("已读");
            }
        } else if (data.type == 1) {
            if (data.status == 0) {
                item.readtag_txt.setTextColor(cc.color.GREEN);
                item.readtag_txt.setString("未领取");
                item.box.setVisible(false);
            } else {
                item.readtag_txt.setTextColor(cc.color.YELLOW);
                item.readtag_txt.setString("已领取");
                item.box.setVisible(true);
            }
        } else {
            item.readtag_txt.setVisible(false);
        }
    },
    deleteMail : function (item) {
        if (!item) {
            return;
        }
        this.maillock = true;
        try {
            this.maillist.removeItem(this.maillist.getIndex(item));
        } catch (e) {
        }
        this.maillock = false;
    },
    _show : function () {
        this.top.runAction(cc.moveTo(0.5, cc.p(960, 1080)).easing(cc.easeElasticOut()));
        this.bg.runAction(cc.moveTo(0.5, cc.p(960, 475.2)).easing(cc.easeElasticOut()));
    },
    _hide : function () {
        this.top.runAction(cc.moveTo(0.3, cc.p(960, 1230)).easing(cc.easeSineOut()));
        this.bg.runAction(cc.moveTo(0.3, cc.p(2880, 475.2)).easing(cc.easeSineOut()));
    }
});