/**
 * Created by hades on 2017/9/5.
 */
modulelobby.ScrollViewBar_Direction_None = -1;
modulelobby.ScrollViewBar_Direction_Horizontal = 0;
modulelobby.ScrollViewBar_Direction_Vertical = 1;

modulelobby.ScrollViewBar = cc.Node.extend({
    m_pSV : null,       //滚动视图
    m_nDirection : modulelobby.ScrollViewBar_Direction_None,
    m_pBg : null,       //背景
    m_pSlider : null,   //滑块

    m_pContentSize : null,
    m_pViewSize : null,

    m_nMinSize : 12,

    ctor : function(bg, slider, sv, direction) {
        this._super();

        this.m_pSV = sv;
        this.m_nDirection = direction;

        if(bg) {
            this.m_pBg = new cc.Scale9Sprite(bg);
            this.addChild(this.m_pBg, 1);
        }
        if(slider) {
            this.m_pSlider = new cc.Scale9Sprite(slider);
            this.addChild(this.m_pSlider, 2);
        }

        this.setVisible(false);
    },
    //设置滑块最小尺寸
    setMinSize : function (size) {
        if(typeof size == 'number') {
            this.m_nMinSize = size;
        }
    },
    //设置自动刷新
    setAutoUpdate : function (auto) {
        if (typeof auto == 'boolean' && auto) {
            this.scheduleUpdate();
        } else {
            this.unscheduleUpdate();
        }
    },
    update : function (dt) {
        this.updateSlider();
    },
    //设置滑块
    updateSlider : function () {
        if (this.m_pSV instanceof ccui.ScrollView) {
            this.m_pContentSize = this.m_pSV.getInnerContainerSize();
            this.m_pViewSize = this.m_pSV.getContentSize();
        } else if (this.m_pSV instanceof cc.ScrollView) {
            this.m_pContentSize = this.m_pSV.getContainer().getContentSize();
            this.m_pViewSize = this.m_pSV.getViewSize();
        } else {
            cc.log("updateSlider error: this.m_pSV is not a ccui.ScrollView or cc.ScrollView instance");
            return;
        }
        var ratio = 0.0;
        if(this.m_nDirection == modulelobby.ScrollViewBar_Direction_Horizontal) {
            if(this.m_pBg) {
                this.m_pBg.setContentSize(this.m_pViewSize.width, this.m_pBg.getContentSize().height);
            }
            if(this.m_pSlider) {
                ratio = this.m_pViewSize.width / this.m_pContentSize.width;
                var cw = this.m_pViewSize.width * ratio;
                cw = cw < this.m_nMinSize ? this.m_nMinSize : cw;
                this.m_pSlider.setContentSize(cw, this.m_pSlider.getContentSize().height);
            }
        }else if(this.m_nDirection == modulelobby.ScrollViewBar_Direction_Vertical) {
            if(this.m_pBg) {
                this.m_pBg.setContentSize(this.m_pBg.getContentSize().width, this.m_pViewSize.height);
            }
            if(this.m_pSlider) {
                ratio = this.m_pViewSize.height / this.m_pContentSize.height;
                var ch = this.m_pViewSize.height * ratio;
                ch = ch < this.m_nMinSize ? this.m_nMinSize : ch;
                this.m_pSlider.setContentSize(this.m_pSlider.getContentSize().width, ch);
            }
        }
        if(ratio < 1) {
            this.setVisible(true);
        }else {
            this.setVisible(false);
        }
        //设置位置点
        this.onScrolled();
    },

    //滚动滑块
    onScrolled : function () {
        if(!this.m_pSlider || !this.isVisible()) {
            return;
        }
        var offset_pos = null;
        if (this.m_pSV instanceof ccui.ScrollView) {
            offset_pos = this.m_pSV.getInnerContainer().getPosition();
        } else if (this.m_pSV instanceof cc.ScrollView) {
            offset_pos = this.m_pSV.getContentOffset();
        } else {
            cc.log("onScrolled error: this.m_pSV is not a ccui.ScrollView or cc.ScrollView instance");
            return;
        }
        var slider_size = this.m_pSlider.getContentSize();
        if(this.m_nDirection == modulelobby.ScrollViewBar_Direction_Horizontal) {
            var x = offset_pos.x - (this.m_pContentSize.width - this.m_pViewSize.width) * 0.5;
            x = -x / (this.m_pViewSize.width - this.m_pContentSize.width) * (this.m_pViewSize.width - slider_size.width);
            if(Math.abs(x) > (this.m_pViewSize.width - slider_size.width) * 0.5) {
                return;
            }
            this.m_pSlider.setPositionX(x);
        }else if(this.m_nDirection == modulelobby.ScrollViewBar_Direction_Vertical) {
            //var y = offset_pos.y + (this.m_pContentSize.height - this.m_pViewSize.height) * 0.5;
            //y = y / (this.m_pViewSize.height - this.m_pContentSize.height) * (this.m_pViewSize.height - slider_size.height);
            //if(Math.abs(y) > (this.m_pViewSize.height - slider_size.height) * 0.5) {
            //    return;
            //}
            var y = ((this.m_pViewSize.height * 0.5 - offset_pos.y) / this.m_pContentSize.height - 0.5) * this.m_pViewSize.height;
            var dY = (this.m_pViewSize.height - slider_size.height) * 0.5;
            if(y < -dY) {
                y = -dY;
            }else if(dY < y) {
                y = dY;
            }
            this.m_pSlider.setPositionY(y);
        }
    },
    onEnter : function () {
        cc.Node.prototype.onEnter.call(this);
    },
    onExit : function () {
        this.unscheduleUpdate();
        cc.Node.prototype.onExit.call(this);
    }
});