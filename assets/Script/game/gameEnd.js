var KKVS = require('./../plugin/KKVS');
var gameModel = require('./gameModel');
var Tool = require('./../tool/Tool');

cc.Class({
    extends: cc.Component,

    properties: {},

    onLoad() {},

    start() {},

    setData: function (data, prefab) {
        var self = this;
        var bg = cc.find('bg', prefab).getComponent(cc.Sprite);
        var line = cc.find('bg/line', prefab).getComponent(cc.Sprite);

        var win = cc.find('bg/win', prefab);
        var lost = cc.find('bg/lost', prefab);
        var winNum = cc.find('bg/win/num', prefab).getComponent(cc.Label);
        var lostNum = cc.find('bg/lost/num', prefab).getComponent(cc.Label);

        var playerNode = [];
        for (var i = 0; i < 3; ++i) {
            var nodeStr = 'bg/node_' + i.toString();
            var name = cc.find(nodeStr + '/name', prefab).getComponent(cc.Label);
            var flag = cc.find(nodeStr + '/flag', prefab);
            var nodebg = cc.find(nodeStr + '/bg', prefab);
            var difen = cc.find(nodeStr + '/difen', prefab).getComponent(cc.Label);
            var multiple = cc.find(nodeStr + '/beishu', prefab).getComponent(cc.Label);
            var money = cc.find(nodeStr + '/money', prefab).getComponent(cc.Label);
            var localOp = {
                'nodebg': nodebg,
                'flag': flag,
                'name': name,
                'difen': difen,
                'multiple': multiple,
                'money' : money
            };
            playerNode.push(localOp);
        }
        
        win.active = false;
        lost.active = false;

        var exit = cc.find("exit", prefab);
        var con = cc.find("con", prefab);

        exit.on("touchend", self.onExitClick, this);
        con.on("touchend", self.onContClick, this);

        for (var i in data) {
            if (data[i].chairID == KKVS.myChairID) {
                if (data[i].score < 0) {
                    lost.active = true;
                    lostNum.string = data[i].score;
                    cc.loader.loadRes("GameEnd/blueL", cc.SpriteFrame, function (err, spriteFrame) {
                        line.getComponent(cc.Sprite).spriteFrame = spriteFrame;
                    });

                    cc.loader.loadRes("GameEnd/conbg", cc.SpriteFrame, function (err, spriteFrame) {
                        bg.getComponent(cc.Sprite).spriteFrame = spriteFrame;
                    });
                } else {
                    win.active = true;
                    winNum.string = data[i].score;
                }
            }
            if (data[i].chairID == gameModel.diZhuCharId) {
                playerNode[i].name.string = Tool.InterceptDiyStr(Tool.encryptMoblieNumber(data[i].name), 4);
                playerNode[i].difen.string = data[i].baseScore;
                playerNode[i].multiple.string = data[i].multiple;
                playerNode[i].money.string = data[i].score;
                playerNode[i].nodebg.active = true;
                playerNode[i].flag.active = true;
            } else {
                playerNode[i].name.string = Tool.InterceptDiyStr(Tool.encryptMoblieNumber(data[i].name), 4);
                playerNode[i].difen.string = data[i].baseScore;
                playerNode[i].multiple.string = data[i].multiple;
                playerNode[i].money.string = data[i].score;
            }
        }
    },

    onExitClick: function (event) {
        cc.log("退出游戏");
        cc.director.loadScene('Lobby');
    },

    onContClick: function (event) {
        cc.log("继续游戏");
        cc.director.loadScene('GameUI');
    },

    addEvent: function () {
        var self = this;
        // self.exitBtn.node.on("touchend", self.onExitClick, this);
        // self.contBtn.node.on("touchend", self.onContClick, this);
    },

    onDestroy() {
        cc.log("GameEnd has been destroy");
        this.playerNode = [];
    },
});