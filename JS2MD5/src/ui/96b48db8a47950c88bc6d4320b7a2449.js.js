/**
 * Created by hades on 2017/3/2.
 */
var shareCallBack = function (args) {
    var objArr = args.split(",");
    var sys_name = objArr[0];
    var platform = objArr[1];
    if (sys_name == "android" && platform == "wx") {
        var data = objArr[2];
        var reg_web = new RegExp("^" + "wechat_sdk_share_web_");
        if (reg_web.test(data)) {
            var cur_date_str = (new Date()).toLocaleDateString();
            cc.sys.localStorage.setItem("wechat_sdk_share_date_" + KKVS.GUID.toString(), cur_date_str);
        }
    } else if(sys_name == "ios" && platform == "wx"){
        var cur_date_str = (new Date()).toLocaleDateString();
        cc.sys.localStorage.setItem("wechat_sdk_share_date_" + KKVS.GUID.toString(), cur_date_str);
       
    }
};
modulelobby.ExchangeCenter = modulelobby.DialogView.extend({
    ctor: function () {
        this._super();
        this.split_char = ':';
        //this.opt_obj = null;
        this.httpCnt = 0;
        this.shareTxt = KKVS.serverConfigData['分享的文字']['StatusString'];
        this.safeMoney = KKVS.serverConfigData['预存金额']['StatusValue'];
        var json = ccs.load("res/exchangecenter.json");
        var visibleSize = cc.director.getVisibleSize();
        var origin = cc.director.getVisibleOrigin();
        json.node.x = origin.x + visibleSize.width / 2 - json.node.getContentSize().width / 2;
        json.node.y = origin.y + visibleSize.height / 2 - json.node.getContentSize().height / 2;
        this.addChild(json.node);
        var rootNode = json.node;
        var self = this;
        var bg = rootNode.getChildByName("bg");
        var returnBtn = bg.getChildByName("top").getChildByName("return_btn");
        var user_gold = bg.getChildByName("gold");
        user_gold.ignoreContentAdaptWithSize(true);
        this.gold = user_gold;
        var alipay = bg.getChildByName("alipay");
        alipay.ignoreContentAdaptWithSize(true);
        var bind_alipay_btn = bg.getChildByName("bind_alipay_btn");
        var exmoney_input = bg.getChildByName("exmoney_input_bg").getChildByName("input");
        exmoney_input = new InputExView(exmoney_input, true);
        exmoney_input.setFontColor(cc.color(255, 255, 255), cc.color(255, 255, 255));
        exmoney_input.setEditBox(3, 1, 1);
        var exchange_btn = bg.getChildByName("exchange_btn");

        user_gold.setString(getGoldTxt(KKVS.KGOLD_BANK));
        if (typeof (KKVS.ALIPAY) == 'string' && KKVS.ALIPAY != "") {
            var arr = KKVS.ALIPAY.split(this.split_char, 2);
            alipay.setString((arr[0] || ""));
            if (alipay.getString() == "") {
                bind_alipay_btn.setVisible(true);
            } else {
                bind_alipay_btn.setVisible(false);
            }
        } else {
            alipay.setString("未绑定");
            bind_alipay_btn.setVisible(true);
        }
        bind_alipay_btn.addClickEventListener(function (sender) {
            sender.setTouchEnabled(false);
            sender.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function() {
                sender.setTouchEnabled(true);
            })));
            self.onBindAlipay();
        });
        returnBtn.addClickEventListener(function() {
            returnBtn.setTouchEnabled(false);
            //self.removeFromParent();
            modulelobby.popScene();
        });
        exchange_btn.addClickEventListener(function() {
            exchange_btn.setTouchEnabled(false);
            exchange_btn.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function() {
                exchange_btn.setTouchEnabled(true);
            })));
            self.httpCnt = 0;
            exmoney_input.setString(exmoney_input.getString().trim());
            self.onExchange(exmoney_input.getString().trim());
        });

        return true;
    },
    onBindAlipay : function () {
        //var dialog = new modulelobby.UserCenter(1);
        //dialog.show();
        //this.close();
        modulelobby.runScene(modulelobby.UserCenter, 2);
    },
    onExchange: function (strMoney, tag) {
        var self = this;
        //check money 1
        if (strMoney.length == 0) {
            self.showDialog("输入兑换金额");
            return;
        }
        //var reg = /^\d+(\.\d+)?$/;
        //var isFloat = reg.test(strMoney);
        //var money = 0;
        //if (isFloat) {
        //    money = parseFloat(strMoney);
        //    money = isNaN(money) ? 0.0 : money;
        //    money = money.toFixed(2);
        //}
        var reg = /^\d+$/;
        var isInt = reg.test(strMoney);
        var money = 0;
        if (isInt) {
            money = parseInt(strMoney);
            money = isNaN(money) ? 0 : money;
        }
        if (money <= 0) {
            self.showDialog("金额输入无效！");
            return;
        }
        //if (typeof self.safeMoney != 'number') {
        //    self.httpCnt = 0;
        //    self.onSafeMoney(strMoney);
        //    return;
        //}
        var my_gold = parseInt(KKVS.KGOLD_BANK);
        //if (my_gold < money * 100) { // 100 : 1
        //    self.showDialog("兑换金额不能大于持有金币！");
        //    return;
        //}
        var beishu = Math.floor(money / 50);
        var yushu = money % 50;
        if (beishu <= 0 || yushu != 0) {
            self.showDialog("兑换金额不符合条件!");
            return;
        } else {
            var safeMoney = self.safeMoney; //留存
            var xiaofei = beishu * 50 * 0.02;
            xiaofei = xiaofei < 2 ? 2 : xiaofei;
            if (my_gold < (xiaofei + beishu * 50 + safeMoney) * 100) {
                self.showDialog("兑换金额不符合条件!");
                return;
            }
        }
        //check alipay
        var aliAccount = null;
        if (typeof (KKVS.ALIPAY) == 'string' && KKVS.ALIPAY != "") {
            var arr = KKVS.ALIPAY.split(this.split_char, 2);
            aliAccount = arr[0];
            aliAccount = aliAccount.trim()
        }
        if (!aliAccount || aliAccount == "") {
            var dialog_b = new modulelobby.TxtDialog({title : "系统提示", txt : "需绑定支付宝", cb : this.onBindAlipay, target : this});
            dialog_b.show();
            return;
        }
        //check bind mobile
        if (isVisitorLogin()) {
            self.showDialog("游客账号不能进行兑换!");
            return;
        }
        //qrcode
        if (!cc.sys.isNative) {
            this.addChild(new modulelobby.ExchangeCenterQrCodeUI());
            return;
        }
        //check share
        var wx_share_date = cc.sys.localStorage.getItem("wechat_sdk_share_date_" + KKVS.GUID.toString());
        var wx_share_vist = true;
        if (!wx_share_date || wx_share_date == "") {
        } else {
            var cur_date_str = (new Date()).toLocaleDateString();
            if (wx_share_date == cur_date_str) {
                wx_share_vist = false;
            }
        }
        if (wx_share_vist) {
            //if (!self.shareTxt && !tag) {
            //    self.httpCnt = 0;
            //    self.onShare(strMoney);
            //} else {
                var shareTxt = !self.shareTxt ? "豹子K游戏大厅" : self.shareTxt;
                shareTxt = shareTxt.replace('$', strMoney);
                var share_fuc = function () {
                    var shareUrl = "https://app-yscbuh.openinstall.io/c/3"; //KKVS.serverConfigData['下载地址']['StatusString'] + "?wakeup=1";
                    if (cc.sys.os == cc.sys.OS_IOS) {
                        //
                        var shareStr = shareUrl + "," + shareTxt + "," + "";
                        cc.log("shareStr = " + shareStr);
                        wxShareTimeLine(shareStr);
                    } else if (cc.sys.os == cc.sys.OS_ANDROID) {
                        var jsonTxt = "{\"type\":\"web\",\"scene\":1,\"data\":\"" + shareUrl + "\",\"title\":\"" + shareTxt + "\",\"des\":\"一款高大上的游戏平台。好玩，刺激!小伙伴们，速来参与吧\"}";
                        jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "share", "(Ljava/lang/String;Ljava/lang/String;)V", "wx", jsonTxt);
                    }
                };
                var dialog = new modulelobby.TxtDialog({title : "系统提示", txt : "完成每天一次的朋友圈发送方可提款", cb : share_fuc});
                dialog.show();
            //}
            return;
        }

        modulelobby.showLoading(null, null, 10);
        //self.opt_obj = {type : 1, money : money};
        //KBEngine.app.player().exchange_k_bao(money, strPwd);
        var params = {
            UserID : KKVS.GUID.toString(),
            AliAccount : aliAccount,
            Money : money.toString(),
            Time : (new Date()).getTime().toString()
        };
        params.Sign = hex_md5(params.AliAccount + params.Money + params.Time + params.UserID + "DK1NwRRXvlCpcnqo");
        params.Sign = params.Sign.toUpperCase();
        HttpManager.GetMessage(http_url_prefix + "api_agent_exchange.aspx", params, METHOD_POST, function (data) {
            var ret = null;
            try {
                ret = JSON.parse(data);
            } catch (e) {
                //
            }
            if (!ret) {
                if (++self.httpCnt < 5) {
                    self.onExchange(strMoney);
                } else {
                    modulelobby.hideLoading();
                }
                return;
            }
            modulelobby.hideLoading();
            var dialog = null;
            if (typeof (ret.success) == 'string' && ret.success == "true") {
                dialog = new modulelobby.TipDialog({txt : "提交成功"});
            } else {
                dialog = new modulelobby.TipDialog({txt : "提交失败"});
            }
            dialog.show();
        });
    },
    onSafeMoney : function (strMoney) {
        var self = this;
        modulelobby.showLoading(null, null, 10);
        HttpManager.GetMessage(http_url_prefix + "api_agent_keepscore.aspx", {}, METHOD_POST, function (data) {
            var ret = null;
            try {
                ret = JSON.parse(data);
            } catch (e) {
                //
            }
            if (!ret && ++self.httpCnt < 5) {
                self.onSafeMoney(strMoney);
                return;
            }
            modulelobby.hideLoading();
            if (ret && typeof (ret['score']) == 'number') {
                self.safeMoney = ret['score'];
                self.onExchange(strMoney);
            } else {
                self.showDialog("留存金额获取失败!");
            }
        });
    },
    onShare : function (strMoney) {
        var self = this;
        modulelobby.showLoading(null, null, 10);
        HttpManager.GetMessage(http_url_prefix + "api_agnet_friends.aspx", {}, METHOD_POST, function (data) {
            var ret = null;
            try {
                ret = JSON.parse(data);
            } catch (e) {
                //
            }
            if (!ret && ++self.httpCnt < 5) {
                self.onShare(strMoney);
                return;
            }
            modulelobby.hideLoading();
            if (ret && typeof (ret[0]) == 'object' && typeof (ret[0]['m_value']) == 'string') {
                self.shareTxt = ret[0]['m_value'];
            }
            self.onExchange(strMoney, true);
        });
    },
    showDialog: function (args) {
        var dialog = new modulelobby.TxtDialog({title : "系统提示", txt : args});
        dialog.show();
    },
    //opt_ret : function (args) {
    //    modulelobby.hideLoading();
    //    if (args.code == 1) {
    //        if (this.opt_obj && this.opt_obj.type == 1) {
    //            cc.log("刷新兑换");
    //        }
    //    } else {
    //        var msg = args.msg || "操作失败";
    //        this.showDialog(msg);
    //        this.opt_obj = null;
    //    }
    //},
    onGold : function () {
        this.gold.setString(getGoldTxt(KKVS.KGOLD_BANK));
    },
    on_player_msg : function (cmd, params) {
        if (cmd == PLAYER_MSG_ID_UPDATE_PLAYER_INFO) {
            this.onGold();
        }
    },
    onEnter : function () {
        cc.Layer.prototype.onEnter.call(this);
        //KKVS.Event.register("opt_ret", this, "opt_ret");
        //KKVS.Event.register("refreshMyScore", this, "onGold");
        KKVS.Event.register("on_player_msg", this, "on_player_msg");
    },
    onExit: function() {
        //KKVS.Event.deregister("opt_ret", this);
        //KKVS.Event.deregister("refreshMyScore", this);
        KKVS.Event.deregister("on_player_msg", this);
        cc.Layer.prototype.onExit.call(this);
    }
});