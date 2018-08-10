var KKVS = require('./../plugin/KKVS');
var gameModel = require('./../game/gameModel');
var Tool = require('./../tool/Tool');
var gameEngine = require('./../plugin/gameEngine');

cc.Class({
    extends: cc.Component,

    properties: {
        nick_name: cc.Label,
        game_gold: cc.Label,
        game_money: cc.Label,
        name_btn: cc.Button,
        face_btn: cc.Button,

        max_win: cc.Label,
        all_count: cc.Label,
        win_rate: cc.Label,
        duanwei: cc.Label,

        spring_count: cc.Label,
        win_score: cc.Label,
        double_count: cc.Label,
        boom_count: cc.Label,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.addEvent();
    },

    start () {
        this.nick_name.string = KKVS.NICKNAME;
        this.game_gold.string = KKVS.KGOLD.toString();
        this.game_money.string = KKVS.ROOM_CARD.toString();
        /* 如果头像信息已经保存 再这里就可以修改头像和头像框*/
    },

    addEvent() {
        var self = this;
        self.name_btn.node.on("touchend", self.onShowChangeName, this);
        self.face_btn.node.on("touchend", self.onShowChangeFace, this);
        self.closeBtn.node.on("touchend", self.close, this);
    },

    InitGameInfo: function(args) {
        var self = this;
        self.max_win.string = args.max_win.toString();
        self.all_count.string = args.all_count.toString();
        self.win_rate.string = args.win_rate.toString();
        self.duanwei.string = args.duanwei;
        self.spring_count.string = args.spring_count.toString();
        self.win_score.string = args.win_score.toString();
        self.double_count.string = args.double_count.toString();
        self.boom_count.string = args.boom_count.toString();
    },

    onShowChangeName: function(event) {
        cc.log("=== onShowChangeName ===");
    },

    onShowChangeFace: function(event) {
        cc.log("=== onShowChangeFace ===");
    },

    close: function(event) {
        var self = this;
        self.node.close();
    },

    // update (dt) {},
});
