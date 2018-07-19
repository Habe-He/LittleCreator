var KKVS = require("./plugin/KKVS");

cc.Class({
    extends: cc.Component,
    properties: {
        btnJinBI: cc.Button,
    },

    onLoad: function () {
        var self = this;
        this.btnJinBI.node.on("touchend", self.jinBiBtnTouchEvent, this);
        // this.rankBtn.on("touchend", self.rankBtnTouchEvent, this);
        // this.shareBtn.on("touchend", self.shareBtnTouchEvent, this);
        // this.setInfomation();

        gameEnd.show(null);
    },

    setInfomation: function () {
        this.money.string = "金币：" + KKVS.KGOLD.toString();
        this.weChatID.string = "ID:" + KKVS.NICKNAME.toString();
        // this.headIcon.
    },


    rankBtnTouchEvent: function (event) {
        cc.log(" 点击排行榜");
    },

    jinBiBtnTouchEvent: function (event) {
        cc.log("点击金币场次");
        cc.director.loadScene("GameUI");

    },

    shareBtnTouchEvent: function (event) {
        cc.log(" 点击分享");
    },

    start() {

    },

});