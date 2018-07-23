var TipDialog_Time_Long = 3;
var TipDialog_Time_Short = 1.25;
var DialogViewComp = require("DialogViewComp");

cc.Class({
    extends: DialogViewComp,
    properties: {
    },
    init : function (data) {
        this.prefab = "perfabs/TipUI";
        this._txt = data.txt || "";
        this._time = data.time || TipDialog_Time_Short;
        this._maxWidth = 1920 * 0.8;
        this._maxHeight = 1080 * 0.8;
        this._minWidth = 200; //boder width not text width
        this._minHeight = 100;
        this._paddingV = 25;
        this._paddingH = 25;
        this._body = null;
        this._txtComp = null;
    },
    setMaxContentSize : function (w, h) {
        if (typeof (w) == 'number' && 0 < w) {
            this._maxWidth = w;
            this._minWidth = this._maxWidth < this._minWidth ? this._maxWidth : this._minWidth;
        }
        if (typeof (h) == 'number' && 0 < h) {
            this._maxHeight = h;
            this._minHeight = this._maxHeight < this._minHeight ? this._maxHeight : this._minHeight;
        }
    },
    setMinContentSize : function (w, h) {
        if (typeof (w) == 'number' && 0 < w) {
            this._minWidth = w;
            this._maxWidth = this._maxWidth < this._minWidth ? this._minWidth : this._maxWidth;
        }
        if (typeof (h) == 'number' && 0 < h) {
            this._minHeight = h;
            this._maxHeight = this._maxHeight < this._minHeight ? this._minHeight : this._maxHeight;
        }
    },
    setPadding : function (paddingH, paddingV) {
        if (typeof (paddingH) == 'number' && 0 < paddingH) {
            this._paddingH = paddingH;
        }
        if (typeof (paddingV) == 'number' && 0 < paddingV) {
            this._paddingV = paddingV;
        }
    },
    onLoadRes : function (prefabNode) {
        this._body = prefabNode;
        var txtNode = cc.find("txt", prefabNode);
        this._txtComp = txtNode.getComponent(cc.Label);
        txtNode.on('size-changed', function (event) {
            var width = this._txtComp.node.width + this._paddingH * 2;
            var height = this._txtComp.node.height + this._paddingV * 2;
            width = width < this._minWidth ? this._minWidth : width;
            height = height < this._minHeight ? this._minHeight : height;
            this._body.width = width;
            this._body.height = height;
        }, this);
        this.showText(this._txt);
    },
    getBody : function () {
        return this._body;
    },
    showText : function (txt) {
        var self = this;
        this._txt = txt;
        this.node.stopAllActions();
        this.node.x = 0;
        this.node.y = 0;
        if (!this._txtComp) {
            return;
        }
        //-------粗略计算尺寸-----------//
        var nWidth = 0;
        for (var i = 0, l = this._txt.length; i < l; ++i) {
            var once = this._txt.substring(i, i + 1)
            if (/.*[\u4e00-\u9fa5]+.*$/.test(once)) {
                nWidth += 1; //chinese
            } else {
                nWidth += 0.5;
            }
        }
        nWidth *= 40;
        nWidth = nWidth > (this._maxWidth - this._paddingH * 2) ? (this._maxWidth - this._paddingH * 2) : nWidth;
        //------------------//
        this._txtComp.node.width = nWidth;
        this._txtComp.string = this._txt;
        this.node.runAction(cc.sequence(cc.delayTime(this._time), cc.moveBy(0.08, 0, 40), cc.callFunc(function () {
            self.node.destroy();
        })));
    }
});
