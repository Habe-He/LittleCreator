var DialogViewComp = require("DialogViewComp");

cc.Class({
    extends: DialogViewComp,
    init : function () {
        this.autoAnimate = false;
        this.prefab = "perfabs/LoadingUI";
        this._cb = null;
        this._target = null;
        this._timeout = 60;
        this._body = null;
        this._modalLayer = null;
    },
    onLoadRes : function (prefabNode) {
        this._modalLayer = prefabNode;
        this._modalLayer.setCascadeOpacityEnabled(false);
        this._body = cc.find("body", prefabNode);
        this._body.runAction(cc.rotateBy(3, 360.0).repeatForever());
    },
    getBody : function () {
        return this._body;
    },
    getModalLayer : function () {
        return this._modalLayer;
    },
    showLoading : function (cb, target, time) {
        this._cb = cb || null;
        this._target = target || null;
        time = time || this._timeout;
        this.node.stopAllActions();
        this.node.active = true;
        this.node.runAction(cc.sequence(cc.delayTime(time), cc.callFunc(this._dismiss, this)));
    },
    hideLoading : function () {
        if (this._cb){
            this._cb.call(this._target);
        }
        this._dismiss();
    },
    _dismiss: function () {
        this.node.stopAllActions();
        this.node.active = false;
        if(this._target)
            this._target = null;
        if(this._cb)
            this._cb = null;
    }
});
