/**
 * Created by hades on 2017/8/7.
 */
modulelobby.RechargeCenterAgentInvestUI = cc.Node.extend({
    ctor: function () {
        this._super();
        this.httpCnt = 0;
        var json = ccs.load("res/rechargecenter_agentinvest_ui.json");
        this.addChild(json.node);
        var rootNode = json.node;
        var self = this;
        var bg = rootNode.getChildByName("bg");
        var mobile_input = bg.getChildByName("mobile_input_bg").getChildByName("input");
        mobile_input = new InputExView(mobile_input);
        mobile_input.setFontColor(cc.color(255, 255, 255), cc.color(255, 255, 255));
        var qq_input = bg.getChildByName("qq_input_bg").getChildByName("input");
        qq_input = new InputExView(qq_input);
        qq_input.setFontColor(cc.color(255, 255, 255), cc.color(255, 255, 255));
        var submit_btn = bg.getChildByName("submit_btn");
        submit_btn.addClickEventListener(function(sender) {
            sender.setTouchEnabled(false);
            sender.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function() {
                sender.setTouchEnabled(true);
            })));
            self.onSubmit(mobile_input.getString().trim(), qq_input.getString().trim());
        });
        return true;
    },
    onSubmit: function (strMobile, strQQ) {
        if (strMobile.length == 0) {
            this.showErrMsg("手机号码不能为空!");
            return;
        }
        if (!isMoblieNumber(strMobile)) {
            this.showErrMsg("手机号码填写格式不正确!");
            return;
        }
        if (strQQ.length == 0) {
            this.showErrMsg("QQ号码不能为空!");
            return;
        }
        if (!isQQNumber(strQQ)) {
            this.showErrMsg("QQ号码填写格式不正确!");
            return;
        }
        this.httpCnt = 0;
        this.onAgentInvest(strMobile, strQQ);
    },
    onAgentInvest : function (strMobile, strQQ) {
        var self = this;
        modulelobby.showLoading(null, null, 10);
        var params = {
            phone : strMobile,
            qq : strQQ
        };
        HttpManager.GetMessage(http_url_prefix + "api_agent_agentinfo.aspx", params, METHOD_POST, function (data) {
            var ret = null;
            try {
                ret = JSON.parse(data);
            } catch (e) {
                //
            }
            if (!ret && ++self.httpCnt < 5) {
                self.onAgentInvest(strMobile, strQQ);
                return;
            }
            modulelobby.hideLoading();
            var dialog = null;
            if (ret && typeof (ret['success']) == 'string' && ret['success'] == "true") {
                dialog = new modulelobby.TipDialog({txt : "提交成功"});
            } else {
                dialog = new modulelobby.TipDialog({txt : "提交失败"});
            }
            dialog.show();
        });
    },
    showErrMsg: function (args) {
        var dialog = new modulelobby.TxtDialog({title : "系统提示", txt : args});
        dialog.show();
    },
    onEnter : function () {
        cc.Node.prototype.onEnter.call(this);
    },
    onExit: function() {
        cc.Node.prototype.onExit.call(this);
    }
});
