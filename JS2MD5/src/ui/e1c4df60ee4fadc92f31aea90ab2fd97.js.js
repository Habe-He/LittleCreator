/**
 * Created by hades on 2017/6/23.
 */
modulelobby.RechargeCenterAgentUI = cc.Node.extend({
    ctor: function () {
        this._super();
        this.dataSet = [];
        this.httpCnt = 0;
        var json = ccs.load("res/rechargecenter_agent_ui.json");
        this.addChild(json.node);
        var rootNode = json.node;
        this.agentlist = rootNode.getChildByName("agentlist");
        var item_model = this.agentlist.getItem(0);
        item_model.retain();
        this.agentlist.setItemModel(item_model);
        this.agentlist.removeItem(0);
        this.loadingbar = rootNode.getChildByName("loading");
        //add scroll bar
        if (cc.sys.isNative) {
            this.agentlist.setScrollBarEnabled(false);
        }
        this.scrollBar = new modulelobby.ScrollViewBar(null, "res/ui/scrollbar.png", this.agentlist, modulelobby.ScrollViewBar_Direction_Vertical);
        var scrollBarPos = this.agentlist.convertToWorldSpace(cc.p(this.agentlist.getContentSize().width, this.agentlist.getContentSize().height * 0.5));
        scrollBarPos = rootNode.convertToNodeSpace(scrollBarPos);
        this.scrollBar.setPosition(scrollBarPos);
        rootNode.addChild(this.scrollBar, 10);
        this.scrollBar.setAutoUpdate(true);
        //add mouse scroll event
        if (!cc.sys.isMobile) {
            MouseManager.on("mousewheel", this.agentlist, function(event) {
                event.stopPropagation();
                var agentlist = event.getCurrentTarget();
                var sy = event.getScrollY();
                if (-10 < sy && sy < 10) {
                    return;
                }
                var dy = agentlist.getInnerContainer().getPositionY();
                dy += sy;
                var minY = agentlist.getContentSize().height - agentlist.getInnerContainerSize().height;
                var h = -minY;
                var percent = (dy - minY) * 100 / h;
                percent = percent < 0 ? 0 : (100 < percent ? 100 : percent);
                //agentlist.jumpToPercentVertical(percent);
                agentlist.scrollToPercentVertical(percent, 0.05, true);
            });
        }
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
    loadDataSet : function () {
        var self = this;
        var params = {
            Method : "GetList",
            UserID : KKVS.GUID.toString()
        };
        HttpManager.GetMessage(http_url_prefix + "api_agent_message.aspx", params, METHOD_POST, function (data) {
            var ret = null;
            try {
                ret = JSON.parse(data);
            } catch (e) {
                //
            }
            if (!ret) {
                if (++self.httpCnt < 5) {
                    self.loadDataSet();
                }
                return;
            }
            self.dataSet = ret;
            if (1 < self.dataSet.length) {
                self.dataSet.sort(function () {
                    return 0.5 - Math.random();
                });
            }
            self.loadAllAgent();
        });
    },
    loadAllAgent : function () {
        var list = this.dataSet;
        if (!list) {
            return;
        }
        this.agentlist.removeAllItems();
        try {
            for (var i = 0, len = list.length; i < len;) {
                this.agentlist.pushBackDefaultItem();
                var item = this.agentlist.getItem(this.agentlist.getItems().length - 1);
                item.body1 = item.getChildByName("body1");
                item.body1.setVisible(false);
                item.body2 = item.getChildByName("body2");
                item.body2.setVisible(false);
                item.body3 = item.getChildByName("body3");
                item.body3.setVisible(false);
                this.loadAgent(i++, item.body1);
                this.loadAgent(i++, item.body2);
                this.loadAgent(i++, item.body3);
            }
        } catch (e) {
        }
        this.hiddenLoading();
    },
    loadAgent : function (ind, node) {
        var data = this.dataSet[ind];
        if (!data) {
            return;
        }
        node.data = data;
        node.wx_txt = node.getChildByName("wx_txt");
        node.wx_txt.ignoreContentAdaptWithSize(true);
        node.recharge_btn = node.getChildByName("recharge_btn");
        node.recharge_btn.setTag(data.id);
        node.call_btn = node.getChildByName("call_btn");
        node.call_btn.setTag(data.id);

        node.wx_txt.setString(InterceptDiyStr(data.agent_wx, 25));
        node.recharge_btn.addClickEventListener(function (sender) {
            sender.setTouchEnabled(false);
            sender.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function () {
                sender.setTouchEnabled(true);
            })));
            var dailog = new modulelobby.AgentMailDialog(node.data);
            dailog.show();
        });
        node.call_btn.addClickEventListener(function (sender) {
            sender.setTouchEnabled(false);
            sender.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function () {
                sender.setTouchEnabled(true);
            })));
            var dailog = new modulelobby.AgentMailDialog(node.data);
            dailog.show();
        });
        node.setVisible(true);
    },
    onEnter : function () {
        cc.Node.prototype.onEnter.call(this);
        this.showLoading();
        this.runAction(cc.sequence(cc.delayTime(0.05), cc.callFunc(function () {
            this.loadDataSet();
        }, this)));
    },
    onExit: function() {
        //remove mouse scroll event
        MouseManager.offNode(this.agentlist);
        cc.Node.prototype.onExit.call(this);
    }
});

modulelobby.AgentMailDialog = modulelobby.DialogView.extend({
    ctor : function (data) {
        this._super();
        this.data = data;
        this.httpCnt = 0;
        var json = ccs.load("res/agentmaildialog_ui.json");
        var visibleSize = cc.director.getVisibleSize();
        var origin = cc.director.getVisibleOrigin();
        json.node.x = origin.x + visibleSize.width / 2 - json.node.getContentSize().width / 2;
        json.node.y = origin.y + visibleSize.height / 2 - json.node.getContentSize().height / 2;
        this.addChild(json.node);
        var rootNode = json.node;
        var self = this;
        var body = rootNode.getChildByName("body");
        this._body = body;
        var titlebg = body.getChildByName("titlebg");
        var to_txt = titlebg.getChildByName("to_txt");
        to_txt.ignoreContentAdaptWithSize(true);
        to_txt.setString("收件人:" + InterceptDiyStr(data.agent_wx, 32));
        var input = body.getChildByName("msgbg").getChildByName("input");
        var close_btn = body.getChildByName("close_btn");
        close_btn.addClickEventListener(function(sender) {
            sender.setTouchEnabled(false);
            self.close();
        });
        var submit_btn = body.getChildByName("submit_btn");
        submit_btn.addClickEventListener(function(sender) {
            sender.setTouchEnabled(false);
            sender.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function () {
                sender.setTouchEnabled(true);
            })));
            var str = input.getString().trim();
            if (!self.checkTxt(str)) {
                var dialog = new modulelobby.TxtDialog({title : "系统提示", txt : "内容长度必须大于0且小于100"});
                dialog.show();
                return;
            }
            modulelobby.showLoading(null, null, 10);
            self.onSubmit(str);
        });

        return true;
    },
    getBody : function () {
        return this._body;
    },
    checkTxt : function (txt) {
        var len = txt.length;
        return (0 < len && len < 100);
    },
    onSubmit : function (str) {
        var self = this;
        var params = {
            UserID : KKVS.GUID.toString(),
            MessageTitle : "联系代理",
            MessageContent : str,
            AgentID : this.data.agent_id.toString()
        };
        HttpManager.GetMessage(http_url_prefix + "api_agent_message.aspx", params, METHOD_POST, function (data) {
            var ret = null;
            try {
                ret = JSON.parse(data);
            } catch (e) {
                //
            }
            if (!ret) {
                if (++self.httpCnt < 5) {
                    self.onSubmit();
                }
                return;
            }
            modulelobby.hideLoading();
            self.close();
            var dialog = null;
            if (typeof (ret.success) == 'string' && ret.success == "true") {
                dialog = new modulelobby.TipDialog({txt : "提交成功"});
            } else {
                dialog = new modulelobby.TipDialog({txt : "提交失败"});
            }
            dialog.show();
        });
    }
});