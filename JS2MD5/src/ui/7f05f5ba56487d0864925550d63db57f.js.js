/**
 * Created by hades on 2017/3/28.
 */
modulelobby.VisitorDialog = modulelobby.DialogView.extend({
    ctor : function () {
        this._super();

        var json = ccs.load("res/visitordialog_ui.json");
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
        var acc_input = body.getChildByName("acc_input_bg").getChildByName("input");
        this.m_pAccInput = new InputExView(acc_input);
        this.m_pAccInput.setFontColor(cc.color(147, 100, 46), cc.color(147, 100, 46));
        this.initAccStr = this.getRandomAcc();
        this.m_pAccInput.setString(this.initAccStr);
        this.accStr = "";
        var close_btn = body.getChildByName("close_btn");
        var ok_btn = body.getChildByName("ok_btn");
        close_btn.addClickEventListener(function() {
            close_btn.setTouchEnabled(false);
            playEffect();
            self.close();
        });
        ok_btn.addClickEventListener(function() {
            ok_btn.setTouchEnabled(false);
            ok_btn.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function() {
                ok_btn.setTouchEnabled(true);
            })));
            playEffect();
            self.onClickOK();
        });

        return true;
    },
    getRandomAcc : function () {
        var str = "";
        var enChars = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
        var enCharCnt = Math.floor(Math.random() * 3) + 3;
        for (var c = 0; c < enCharCnt; ++c) {
            var ind = Math.floor(Math.random() * 26);
            str += enChars[ind];
        }
        str += (new Date()).getTime().toString();
        if (str.length < 6) {
            str += "1314";
        }
        if (32 < str.length) {
            str = str.substr(0, 32);
        }
        return str;
    },
    onClickOK: function () {
        //this.doLogin("qdod1509107415154");
        //return;
        var strAcc = this.m_pAccInput.getString();
        var strLen = strAcc.length;
        if (strLen < 6 || 32 < strLen) {
            this.showErrMsg();
            return;
        }
        if (/^[a-zA-Z]+[0-9]+[a-zA-Z0-9]*$/.test(strAcc)) {
            if (this.initAccStr == strAcc) {
                this.doLogin(strAcc); //qdoc1509107415153
            } else {
                this.checkRegist(strAcc, 5);
            }
        } else {
            this.showErrMsg();
        }
    },
    showErrMsg: function (msgTxt) {
        if (!msgTxt) {
            msgTxt = "游客帐号由英文字母加数字组成(英文字母为首)，最大长度为32，最小长度为6";
        }
        var dialog = new modulelobby.TxtDialog({title : "系统提示", txt : msgTxt});
        dialog.show();
    },
    getBody : function () {
        return this._body;
    },
    getLayer : function () {
        return this._layer;
    },
    doLogin : function (strAcc) {
        KKVS.Acc = strAcc;
        KKVS.Login_type = VISITOR_LOGIN;
        modulelobby.runScene(modulelobby.Preloading);
    },
    checkRegist : function (strAcc, times) {
        var self = this;
        if (times <= 0) {
            self.showErrMsg("账号检测失败。");
            return;
        }
        var params = {
            accounts : strAcc
        };
        modulelobby.showLoading(null, null, 10);
        HttpManager.GetMessage(http_url_prefix + "api_register_verify.aspx", params, METHOD_POST, function (data) {
            modulelobby.hideLoading();
            var ret = null;
            try {
                ret = JSON.parse(data.trim());
            } catch (e) {
                //
            }
            if (!ret) {
                times -= 1;
                self.checkRegist(strAcc, times);
                return;
            }
            if (ret && typeof(ret['success']) == 'string' && ret['success'] == "true") {
                self.doLogin(strAcc);
            } else {
                self.showErrMsg("该账号已经存在，请重新填写。");
            }
        });
    }
});