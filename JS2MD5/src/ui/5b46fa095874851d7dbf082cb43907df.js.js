/**
 * Created by hades on 2017/3/9.
 */
modulelobby.TipDialog_Time_Long = 3;
modulelobby.TipDialog_Time_Short = 1;
modulelobby.TipDialog = modulelobby.DialogView.extend({
    ctor : function (data) {
        this._super();
        var visibleSize = cc.director.getVisibleSize();
        var origin = cc.director.getVisibleOrigin();
        this._txt = data.txt || "";
        this._font = data.font || "Arial";
        this._fsize = data.fsize || 35;
        this._color = data.color || cc.color.WHITE;
        this._pos = data.pos || cc.p(origin.x + visibleSize.width / 2, origin.y + visibleSize.height / 2);
        this._time = data.time || modulelobby.TipDialog_Time_Short;
        this._bg = data.bg || cc.color.BLACK;
        this._maxWidth = visibleSize.width * 0.8;
        this._maxHeight = visibleSize.height * 0.8;
        this._minWidth = 50;
        this._minHeight = 50;
        this._paddingV = 5;
        this._paddingH = 10;
        this.setPosition(this._pos);
        return true;
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
    show : function (scene, zorder) {
        var len = this._txt.length;
        var txtSize = cc.size(this._minWidth + this._paddingH * 2, this._minHeight + this._paddingV * 2);
        //txt
        var txtLayout = null;
        if (0 < len) {
            var w = 0;
            var h = 0;
            var x = 0;
            var y = 0;
            var txtNode = new cc.Node();
            for (var i = 0; i < len; ++i) {
                var label = new cc.LabelTTF(this._txt[i], this._font, this._fsize);
                label.setColor(this._color);
                label.setAnchorPoint(0,1);
                txtNode.addChild(label);
                var ls = label.getContentSize();
                var lw = ls.width;
                var lh = ls.height;
                if (this._maxWidth < x + lw) {
                    x = 0;
                    y += lh;
                    label.setPosition(x, y);
                    h += lh;
                } else {
                    label.setPosition(x, y);
                    x += lw;
                    w = w < x ? x : w;
                    h = h < (y + lh) ? (y + lh) : h;
                }
            }
            w = this._maxWidth < w ? this._maxWidth : Math.ceil(w);
            h = this._maxHeight < h ? this._maxHeight : Math.ceil(h);
            txtLayout = new ccui.Layout();
            txtLayout.setTouchEnabled(false);
            txtLayout.setClippingEnabled(true);
            txtLayout.setContentSize(cc.size(w, h));
            txtLayout.setAnchorPoint(0.5, 0.5);
            txtNode.setPosition(0, h);
            txtLayout.addChild(txtNode);
            txtSize.width = w < this._minWidth ? this._minWidth : w;
            txtSize.height = h < this._minHeight ? this._minHeight : h;
            txtSize.width += this._paddingH * 2;
            txtSize.height += this._paddingV * 2;
        }
        //txtbg
        var txtBg = new ccui.Layout();
        txtBg.setTouchEnabled(false);
        txtBg.setContentSize(txtSize);
        txtBg.setAnchorPoint(0.5, 0.5);
        txtBg.setPosition(0, 0);
        if (typeof (this._bg) == 'string') {
            var textype = ccui.Widget.LOCAL_TEXTURE;
            if (this._bg[0] == '#') {
                this._bg = this._bg.slice(1);
                textype = ccui.Widget.PLIST_TEXTURE;
            }
            txtBg.setBackGroundImageScale9Enabled(true);
            txtBg.setBackGroundImage(this._bg, textype);
        } else {
            txtBg.setBackGroundColorType(ccui.Layout.BG_COLOR_SOLID);
            txtBg.setBackGroundColor(this._bg);
            txtBg.setBackGroundColorOpacity(128);
        }
        if (txtLayout) {
            txtLayout.setPosition(txtSize.width * 0.5, txtSize.height * 0.5);
            txtBg.addChild(txtLayout);
        }
        this.addChild(txtBg);
        this.runAction(cc.sequence(cc.delayTime(this._time), cc.removeSelf()));
        //call supper.show()
        modulelobby.DialogView.prototype.show.call(this, scene, zorder, null);
    }
});