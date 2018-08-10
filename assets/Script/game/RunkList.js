var AppHelper = require('./../AppHelper');
var Tool = require('Tool');

cc.Class({
    extends: cc.Component,

    properties: {
        ContentInfo: cc.Sprite,
    },

    onLoad () {
        AppHelper.get().hideLoading();

        var self = this;
        self._pb = null;
        self.bg = null;
        self.isInFisish = false;
        self.isOutFisish = false;
        self.bgX = 0;
        self.bgY = 0;
    },

    moveInFinish: function (event) {
        cc.log("排行榜 进场 动画执行完成");
        var self = this;
        self.isInFisish = true;
        self.bgX = self.bg.getComponent(cc.Sprite).node.getPositionX();
        self.bgY = self.bg.getComponent(cc.Sprite).node.getPositionY();
    },

    moveOutFinish: function(event) {
        cc.log("排行榜 退场 动画执行完成");
        this._pb.destroy();
    },

    setPB (pb) {
        this._pb = pb;
    },

    start () {
        var self = this;

        // TODO - 后续测试使用getChildByName
        self.bg = cc.find('bg', this.node);
        self.anim = self.bg.getComponent(cc.Animation);
        self.anim.play('runkList');
        self.anim.on("finished", self.moveInFinish, this);

        var anim1 = self.anim.getAnimationState('runkListBack');
        anim1.on('finished', this.moveOutFinish, this);

        var size = self.bg.getComponent(cc.Sprite).node.getContentSize();
        this.node.on(cc.Node.EventType.TOUCH_END, function (event) {
            var point = event.getLocation();
            var wPoint = self.bg.parent.convertToNodeSpaceAR(point);
            var rect = cc.rect(self.bgX - size.width / 2, self.bgY - size.height / 2, size.width, size.height);
            if (!cc.rectContainsPoint(rect, wPoint) && self.isInFisish) {
                cc.log("触摸在节点外");
                self._pb.destroy();
            }
        });

        // 排位 - 金币
        var MSG_RUNK = 0;
        var MSG_COIN = 1;

        // 国服 - 好友
        var MSG_GF = 0;
        var MSG_HY = 1;

        // 
        this.tex = new cc.Texture2D();

        // 发送信息到子域
        var openDataContext = wx.getOpenDataContext()
        window.sharedCanvas = openDataContext.canvas;
        window.sharedCanvas.width = 680;
        window.sharedCanvas.height = 710;
        cc.log("发送消息到子域工程");
        wx.postMessage({
            messageType: MSG_RUNK,
            messageData: MSG_HY
        });
    },

    // 刷新子域的纹理
    _updateSubDomainCanvas() {
        if (!this.tex || window.sharedCanvas == undefined) {
            return;
        }        
        this.tex.initWithElement(window.sharedCanvas);
        this.tex.handleLoadedTexture();
        this.ContentInfo.spriteFrame = new cc.SpriteFrame(this.tex);
    },

    update() {
        // 更新子域UI
        this._updateSubDomainCanvas();
    },
});