var DialogViewComp = require('DialogViewComp');

cc.Class({
    extends: DialogViewComp,
    init : function (data) {
        //cc.log("=> TxtDialogComponent::init");
        this.prefab = "perfabs/Alert";
        this._title = data.title || "";
        this._txt = data.txt || "";
        this._type = data.type; //0 = 无按钮(此时colse buton自动加上去), 1 = 1个按钮, 2 = 2个按钮
        this._type = (this._type == 0 || this._type == 1 || this._type == 2) ? this._type : 1;
        this._cb = data.cb;
        this._target = data.target;
        this._param = data.param;
        this._cb2 = data.cb2;
        this._target2 = data.target2;
        this._param2 = data.param2;
        this._body = null;
        this._modalLayer = null;
    },
    onLoadRes : function (prefabNode) {
        //cc.log("=> TxtDialogComponent::onLoadRes");
        this._modalLayer = cc.find("singleColor", prefabNode);
        this._body = cc.find("alertBackground", prefabNode);
        //var title_txt = cc.find("alertBackground/detailLabel", prefabNode).getComponent(cc.Label);
        var msg_txt = cc.find("alertBackground/detailLabel", prefabNode).getComponent(cc.Label);
        var no_btn = cc.find("alertBackground/cancelButton", prefabNode);
        var yes_btn = cc.find("alertBackground/enterButton", prefabNode);
        //var close_btn = cc.find("alertBackground/enterButton", prefabNode);
        no_btn.on('click', function (event) {
            this.enabled = false;
            this.node.close();
            if (typeof (this._cb2) == 'function') {
                if (this._target2) {
                    this._cb2.call(this._target2, this._param2);
                } else {
                    this._cb2(this._param2);
                }
            }
            cc.log("click no btn");
        }, this);
        yes_btn.on('click', function (event) {
            this.enabled = false;
            this.node.close();
            if (typeof (this._cb) == 'function') {
                if (this._target) {
                    this._cb.call(this._target, this._param);
                } else {
                    this._cb(this._param);
                }
            }
            cc.log("click yes btn");
        }, this);
        //close_btn.on('click', function (event) {
        //    this.node.close();
        //}, this);
        //title_txt.string = this._title;
        msg_txt.string = this._txt;
        if (this._type == 0) {
            yes_btn.active = false;
            no_btn.active = false;
            //close_btn.active = true;
        } else if (this._type == 1) {
            yes_btn.active = true;
            no_btn.active = false;
            //close_btn.active = false;
        } else {
            yes_btn.active = true;
            no_btn.active = true;
            //close_btn.active = false;
        }
    },
    getBody : function () {
        //cc.log("=> TxtDialogComponent::getBody");
        return this._body;
    },
    getModalLayer : function () {
        //cc.log("=> TxtDialogComponent::getModalLayer");
        return this._modalLayer;
    }
});
