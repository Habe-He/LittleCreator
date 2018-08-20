var AppHelper = require('./../AppHelper');
var Tool = require('Tool');
var gameEngine = require('./../plugin/gameEngine');
var KKVS = require('./../plugin/KKVS');

cc.Class({
    extends: cc.Component,

    properties: {
        ContentInfo: cc.Sprite,
    },

    onLoad() {
        AppHelper.get().hideLoading();

        var self = this;
        self._pb = null;
        self.bg = null;
        self.isInFisish = false;
        self.isOutFisish = false;
        self.bgX = 0;
        self.bgY = 0;

        // 好友 = 0
        // 国服 = 1
        self.typeIndex = 0;

        // 排位 = 0
        // 金币 = 1
        self.scopeIndex = 0;

        // 刷新间隔
        self.updateTime = 0;

        this.addEvent();
    },

    moveInFinish: function (event) {
        cc.log("排行榜 进场 动画执行完成");
        var self = this;
        self.isInFisish = true;
        self.bgX = self.bg.getComponent(cc.Sprite).node.getPositionX();
        self.bgY = self.bg.getComponent(cc.Sprite).node.getPositionY();
    },

    moveOutFinish: function () {
        cc.log("排行榜 退场 动画执行完成");
        self.isInFisish = false;
        this.node.destroy();
    },

    setPB: function (pb) {
        this._pb = pb;
    },

    start() {
        var self = this;

        // TODO - 后续测试使用getChildByName
        self.bg = cc.find('bg', this.node);
        self.anim = self.bg.getComponent(cc.Animation);
        self.anim.play('runkList');
        self.anim.on("finished", self.moveInFinish, this);



        var back = cc.find('bg/Back', this.node);
        back.on('click', function () {
            self.node.destroy();
        }, this);

        var size = self.bg.getComponent(cc.Sprite).node.getContentSize();
        this.node.on(cc.Node.EventType.TOUCH_END, function (event) {
            var point = event.getLocation();
            var wPoint = self.bg.parent.convertToNodeSpaceAR(point);
            var rect = cc.rect(self.bgX - size.width / 2, self.bgY - size.height / 2, size.width, size.height);
            if (!cc.rectContainsPoint(rect, wPoint) && self.isInFisish) {
                // cc.log("可以移除");
                // self.node.destroy();
                self.anim.off('finished');
                self.anim.play('runkListBack');
                var anim1 = self.anim.getAnimationState('runkListBack');
                anim1.on('finished', self.moveOutFinish, self);
            }
        });

        var toggleRight = self.bg.getChildByName("ToggleRight");
        var guofu = toggleRight.getChildByName("GuoFu").getComponent(cc.Toggle);
        var haoYou = toggleRight.getChildByName("HaoYou").getComponent(cc.Toggle);
        guofu.node.on("toggle", self.onGuoFu, self);
        haoYou.node.on("toggle", self.onHaoYou, self);

        var toggleLeft = self.bg.getChildByName("ToggleLeft");
        var runk = toggleLeft.getChildByName("Runk").getComponent(cc.Toggle);
        var coin = toggleLeft.getChildByName("Coin").getComponent(cc.Toggle);
        runk.node.on("toggle", self.onRunk, self);
        coin.node.on("toggle", self.onCoin, self);

        // 
        this.tex = new cc.Texture2D();

        // 发送信息到子域
        var openDataContext = wx.getOpenDataContext()
        window.sharedCanvas = openDataContext.canvas;
        window.sharedCanvas.width = 880;
        window.sharedCanvas.height = 900;
        cc.log("发送消息到子域工程");
        this.postMessageToSub(0, 0);
    },

    onGuoFu: function (event) {
        var self = this;
        self.typeIndex = 1;
        this.updateScrollData();
    },

    onHaoYou: function (event) {
        var self = this;
        self.typeIndex = 0;
        this.updateScrollData();
    },

    onRunk: function (event) {
        var self = this;
        self.scopeIndex = 0;
        this.updateScrollData();
    },

    onCoin: function (event) {
        var self = this;
        self.scopeIndex = 1;
        this.updateScrollData();
    },

    updateScrollData: function () {
        var self = this;
        if (self.typeIndex == 0) {
            if (self.scopeIndex == 0) {
                cc.log("好友排位");
                this.postMessageToSub(0, 0);
            } else {
                cc.log("好友金币");
                this.postMessageToSub(0, 1);
            }
        } else if (self.typeIndex == 1) {
            if (self.scopeIndex == 0) {
                cc.log("国服排位");
                gameEngine.app.player().req_runk_scores();
            } else {
                cc.log("国服金币");
                gameEngine.app.player().req_runk_coin();
            }
        }
    },

    postMessageToSub: function (type, hy) {
        wx.postMessage({
            messageType: type,
            messageData: hy
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

    update(dt) {
        this.updateTime += dt;
        if (this.updateTime > 0.2) {
            this.updateTime = 0;
            // 更新子域UI
            this._updateSubDomainCanvas();
        }
    },

    runkListGold: function (data) {
        var name = KKVS.NICKNAME;
        var url = KKVS.HEAD_URL;
        var score = KKVS.PVPSCORES;
        var ccci = parseInt(KKVS.KGOLD);
        wx.postMessage({
            messageType: 1,
            messageData: 1,
            messageArrar: data,
            messageName: name,
            messageUrl: url,
            messageScore: score,
            messageCoin: ccci
        });
    },

    runkListScore: function (data) {
        var name = KKVS.NICKNAME;
        var url = KKVS.HEAD_URL;
        var score = KKVS.PVPSCORES;
        var ccci = parseInt(KKVS.KGOLD);
        wx.postMessage({
            messageType: 1,
            messageData: 0,
            messageArrar: data,
            messageName: name,
            messageUrl: url,
            messageScore: score,
            messageCoin: ccci
        });
    },

    addEvent: function () {
        KKVS.Event.register("runkListGold", this, "runkListGold");
        KKVS.Event.register("runkListScore", this, "runkListScore");
    },

    onDestroy() {
        KKVS.Event.deregister("runkListGold", this);
        KKVS.Event.deregister("runkListScore", this);
    },
});