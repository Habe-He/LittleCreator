cc.Class({
    extends: cc.Component,

    properties: {
        exitBtn: cc.Button,
        contBtn: cc.Button,
    },

    onLoad() {
        this.playerNode = [];
    },

    start() {
        var self = this;
        // var root_M = this.node.getChildByName("GameEnd");
        // var bg = root_M.getChildByName('GameEnd/bg');

        // self.win = cc.find('GameEnd/bg/win', this.node);
        // self.win.active = false;
        // self.winNum = cc.find('GameEnd/bg/win/num');
        // self.lost = cc.find('GameEnd/bg/lost');
        // self.lost.node.active = false;
        // self.lostNum = cc.find('GameEnd/bg/lost/num');

        // self.line = cc.find('GameEnd/bg/line');

        // for (var i = 0; i < 3; ++i) {
        //     var node = bg.getChildByName('node_' + i.toString());
        //     var flag = node.getChildByName('flag');
        //     var name = node.getChildByName('name');
        //     var difen = node.getChildByName('difen');
        //     var beishu = node.getChildByName('beishu');
        //     var money = node.getChildByName('money');
        //     var data = {
        //         'flag': flag,
        //         'name': name,
        //         'difen': difen,
        //         'beishu': beishu,
        //         'money': money
        //     };
        //     this.playerNode.push(data);
        // }
    },

    setData: function (data, prefab) {
        // self.win = cc.find('GameEnd/bg/win', this.node);
        // self.win.active = false;
    },

    onExitClick: function (event) {
        cc.log("退出游戏");
    },

    onContClick: function (event) {
        cc.log("继续游戏");
    },

    addEvent: function () {
        var self = this;
        self.exitBtn.node.on("touchend", self.onExitClick, this);
        self.contBtn.node.on("touchend", self.onContClick, this);
    },

    onDestroy() {
        cc.log("GameEnd has been destroy");
        this.playerNode = [];
    },
});