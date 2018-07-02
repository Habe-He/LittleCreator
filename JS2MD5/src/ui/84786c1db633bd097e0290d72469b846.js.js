modulelobby.RedpacketUI = modulelobby.DialogView.extend({
    ctor : function () {
        this._super();

        this.opt_obj = null;
        this.json = ccs.load("res/redpacket_ui.json");
        var visibleSize = cc.director.getVisibleSize();
        var origin = cc.director.getVisibleOrigin();
        this.json.node.x = origin.x + visibleSize.width / 2 - this.json.node.getContentSize().width / 2;
        this.json.node.y = origin.y + visibleSize.height / 2 - this.json.node.getContentSize().height / 2;
        this.addChild(this.json.node);
        var rootNode = this.json.node;
        this.json.action.retain();
        this.rootAction = this.json.action;
        rootNode.runAction(this.rootAction);
        this.rootAction.play("show_1", true);

        var self = this;
        this._layer = rootNode.getChildByName("back");
        var body = rootNode.getChildByName("body");
        this._body = body;
        this.body_3 = body.getChildByName("body_3");
        this.body_2 = body.getChildByName("body_2");
        this.body_2.setVisible(false);
        var close_btn = body.getChildByName("close_btn");
        this.exchange_text = body.getChildByName("exchange_text");
        this.exchange_text.ignoreContentAdaptWithSize(true);
        close_btn.addClickEventListener(function(sender) {
            sender.setTouchEnabled(false);
            playEffect();
            self.close();
        });
        var exchange_btn = body.getChildByName("exchange_btn");
        exchange_btn.addClickEventListener(function(sender) {
            sender.setTouchEnabled(false);
            sender.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function() {
                sender.setTouchEnabled(true);
            })));
            cc.log("+++++++兑换红包");
            playEffect();
            self.close();
            KKVS.Event.fire("Skip_Recharge_Center", 1);
            //this.opt_obj = {type : PLAYER_MSG_ID_PROP, prop_id : 1004};
            //KBEngine.app.player().use_prop(1004, 1);
        });
        var follow_btn = body.getChildByName("follow_btn");
        follow_btn.addClickEventListener(function(sender) {
            sender.setTouchEnabled(false);
            sender.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function() {
                sender.setTouchEnabled(true);
            })));
            cc.log("+++++++关注公众号");
            playEffect();
            copyToClipboardMain(wechat_public_number);
            (new modulelobby.TxtDialog({title : "系统提示", txt : "复制成功，请打开微信黏贴公众号并关注\n\n公众号：kk_ddz                      "})).show();
        });

        this.redPacketItem = [{prop_id : 1000, prop_name : "红包(小)", count : 0, expire : 0}, {prop_id : 1001, prop_name : "红包(中)", count : 0, expire : 0}, {prop_id : 1002, prop_name : "红包(大)", count : 0, expire : 0}];
        for (var i = 1; i <= 3; ++i) {
            var item = body.getChildByName("item_" + i.toString());
            item.png = item.getChildByName("png");
            item.txt = item.getChildByName("txt");
            item.txt.ignoreContentAdaptWithSize(true);
            item.txt_c = item.txt.getChildByName("txt2");
            item.png.setTag(this.redPacketItem[i - 1].prop_id);
            item.png.addClickEventListener(function (sender) {
                sender.setTouchEnabled(false);
                sender.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function() {
                    sender.setTouchEnabled(true);
                })));
                playEffect();
                self.onRedPacket(sender.getTag());
            });
            this.redPacketItem[i - 1]["node"] = item;
        }
        this.red_balance_on = -1;
        this.red_balance_off = -1;

        return true;
    },
    getRedPacketItem : function (prop_id) {
        for (var i = 0, l = this.redPacketItem.length; i < l; ++i) {
            if (this.redPacketItem[i].prop_id == prop_id) {
                return this.redPacketItem[i];
            }
        }
        return null;
    },
    onRedPacket : function (prop_id) {
        var item = this.getRedPacketItem(prop_id);
        if (!item) {
            return;
        }
        if (item.count <= 0) {
            (new modulelobby.TxtDialog({title : "系统提示", txt : "您已没有抽奖机会，请下次再抽."})).show();
            return;
        }
        modulelobby.showLoading(null, null, 10);
        cc.log("使用道具 prop_id=" + prop_id);
        this.opt_obj = {type : PLAYER_MSG_ID_PROP, prop_id : prop_id};
        KBEngine.app.player().use_prop(prop_id, 1);
    },
    on_prop_list : function () {
        modulelobby.hideLoading();
        if (!KKVS.PropList) {
            return;
        }
        for (var i = 0, l = KKVS.PropList.length; i < l; ++i) {
            var item = this.getRedPacketItem(KKVS.PropList[i].prop_id);
            if (item) {
                item.count = KKVS.PropList[i].count;
                item.expire = KKVS.PropList[i].expire;
                item.node.txt.setString(item.count.toString());
                item.node.txt_c.setPositionX(item.node.txt.getContentSize().width);
            }
        }
        for (var n = 0, m = KKVS.PropList.length; n < m; ++n) {
            if (KKVS.PropList[n].prop_id == 1004){
                this.exchange_text.setString(getRedPacketTxt(KKVS.PropList[n].count));
                this.red_balance_on = KKVS.PropList[n].count;
                break;
            }
        }
    },
    opt_ret : function (args) {
        modulelobby.hideLoading();
        if (args.code == 1) {
            //
        } else {
            var msg = args.msg || "操作失败";
            (new modulelobby.TxtDialog({title : "系统提示", txt : msg})).show();
        }
    },
    on_player_msg : function (cmd, params) {
        if (this.opt_obj && this.opt_obj.type == cmd) {
            if (cmd == PLAYER_MSG_ID_PROP) {
                if (typeof params == 'object' && typeof params.prop_id == 'number' && params.prop_id == 1004) {
                    if (this.opt_obj.prop_id == 1000 || this.opt_obj.prop_id == 1001 || this.opt_obj.prop_id == 1002) {
                        var item = this.getRedPacketItem(this.opt_obj.prop_id);
                        if (item) {
                            item.count = item.count - 1 < 0 ? 0 : item.count - 1;
                            item.node.txt.setString(item.count.toString());
                            item.node.txt_c.setPositionX(item.node.txt.getContentSize().width);
                        }
                        if (params.ch <= 0) {
                            this.showTipDialog("没有抽中红包,下次加油!");
                        } else {
                            //this.showTipDialog("恭喜您抽中" + params.ch.toString() + "个红包");
                            //this.exchange_text.setString(getRedPacketTxt(params.num));
                            //(new modulelobby.RedpacketUIOpen(this.body_3, params.ch)).show();
                            var self = this;
                            this.red_balance_off = params.num;
                            this.body_2.setVisible(true);
                            var png = this.body_2.getChildByName("png");
                            var layout = this.body_2.getChildByName("layout");
                            if (this.opt_obj.prop_id == 1000) {
                                png.setPosition(480, 594);
                                layout.setPosition(480, 742);
                                png.setSpriteFrame("function/red_03.png");
                            }else if (this.opt_obj.prop_id == 1001) {
                                png.setPosition(1440, 594);
                                layout.setPosition(1440, 742);
                                png.setSpriteFrame("function/red_04.png");
                            }else if (this.opt_obj.prop_id == 1002) {
                                png.setPosition(960, 594);
                                layout.setPosition(960, 742);
                                png.setSpriteFrame("function/red_05.png");
                            }
                            this.rootAction.play("show_2", false);
                            this.body_2.runAction(cc.sequence(cc.delayTime(1.7), cc.callFunc(function() {
                                self.rootAction.play("show_1", true);
                                (new modulelobby.RedpacketUIOpen(self.body_3, params.ch)).show();
                            })));

                        }
                    }
                }
            }
            this.opt_obj = null;
        }
    },
    showTipDialog : function (msg) {
        (new modulelobby.TipDialog({txt : msg})).show();
    },
    red_balance : function () {
        var self = this;
        this.exchange_text.stopAllActions();
        this.exchange_text.runAction(cc.repeatForever(cc.sequence(cc.delayTime(0.1), cc.callFunc(function(sender) {
            if (self.red_balance_off <= self.red_balance_on + 5) {
                sender.stopAllActions();
                sender.setString(getRedPacketTxt(self.red_balance_off));
                self.red_balance_on = self.red_balance_off;
                return;
            }else {
                self.red_balance_on = self.red_balance_on + 5;
                sender.setString(getRedPacketTxt(self.red_balance_on));
            }
        }))));
        this.body_2.setVisible(false);
    },
    getBody : function () {
        return this._body;
    },
    getLayer : function () {
        return this._layer;
    },
    onEnter : function () {
        this._super();
        KKVS.Event.register("red_balance", this, "red_balance");
        KKVS.Event.register("on_prop_list", this, "on_prop_list");
        KKVS.Event.register("opt_ret", this, "opt_ret");
        KKVS.Event.register("on_player_msg", this, "on_player_msg");
        cc.spriteFrameCache.addSpriteFrames("res/ui/function/red_0.plist", "res/ui/function/red_0.png");
        cc.spriteFrameCache.addSpriteFrames("res/ui/animation/red/red_1.plist", "res/ui/animation/red/red_1.png");
        cc.spriteFrameCache.addSpriteFrames("res/ui/animation/red/red_2.plist", "res/ui/animation/red/red_2.png");
        //if (KKVS.PropList) {
        //    this.on_prop_list();
        //} else {
        if (KBEngine.app.player() != undefined) {
            modulelobby.showLoading(null, null, 10);
            KBEngine.app.player().req_prop_list();
        }
        //}
    },
    onExit : function () {
        KKVS.Event.deregister("red_balance", this);
        KKVS.Event.deregister("on_prop_list", this);
        KKVS.Event.deregister("opt_ret", this);
        KKVS.Event.deregister("on_player_msg", this);
        this.json.action.release();
        this._super();
    }
});






//**************************************open*********************************************
modulelobby.RedpacketUIOpen = modulelobby.DialogView.extend({
    ctor : function (add, params) {
        this._super();
        this.json = ccs.load("res/redpacket_open.json");
        var visibleSize = cc.director.getVisibleSize();
        var origin = cc.director.getVisibleOrigin();
        this.json.node.x = origin.x + visibleSize.width / 2 - this.json.node.getContentSize().width / 2;
        this.json.node.y = origin.y + visibleSize.height / 2 - this.json.node.getContentSize().height / 2;
        add.addChild(this.json.node);
        this.json.action.retain();
        var rootNode = this.json.node;

        var body = rootNode.getChildByName("body");
        var text_num = body.getChildByName("text_num");
        text_num.ignoreContentAdaptWithSize(true);
        var txt = body.getChildByName("txt");
        txt.ignoreContentAdaptWithSize(true);
        var btn = body.getChildByName("btn");
        text_num.setString(getRedPacketTxt(params));
        txt.setString("恭喜获得" + getRedPacketTxt(params) +"元红包");

        var rootAction = this.json.action;
        rootNode.runAction(rootAction);
        rootAction.play("show_1", false);

        rootNode.runAction(cc.sequence(cc.delayTime(0.8), cc.callFunc(function() {
            rootAction.play("show_2", true);
        })));

        btn.addClickEventListener(function (sender) {
            sender.setTouchEnabled(false);
            playEffect();
            rootAction.play("show_3", false);
            sender.runAction(cc.sequence(cc.delayTime(1.3), cc.callFunc(function() {
                KKVS.Event.fire("red_balance");
                add.removeAllChildren();
            })));
        });

        return true;
    },
    onEnter : function () {
        this._super();
    },
    onExit : function () {
        this.json.action.release();
        this._super();
    }
});