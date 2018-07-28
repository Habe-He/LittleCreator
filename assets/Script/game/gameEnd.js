var KKVS = require('./../plugin/KKVS');
var gameModel = require('./gameModel');
var Tool = require('./../tool/Tool');

cc.Class({
    extends: cc.Component,

    properties: {},

    onLoad() {},

    start() {},

    setData: function (data, prefab) {
        gameModel.isOnReconnection = false;
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
                'money': money
            };
            playerNode.push(localOp);
        }

        win.active = false;
        lost.active = false;

        var exit = cc.find("exit", prefab);
        var con = cc.find("con", prefab);

        exit.on("touchend", self.onExitClick, this);
        con.on("touchend", self.onContClick, this);

        cc.log("gameModel.diZhuCharId = " + gameModel.diZhuCharId);
        for (var i in data) {
            if (data[i].chairID == KKVS.myChairID) {
                if (data[i].score < 0) {
                    lost.active = true;
                    lostNum.string = data[i].score;
                    // line.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(cc.url.raw("GameEnd/blueL"));
                    cc.loader.loadRes("GameEnd/blueL", cc.SpriteFrame, function (err, spriteFrame) {
                        line.getComponent(cc.Sprite).spriteFrame = spriteFrame;
                    });

                    // bg.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(cc.url.raw("GameEnd/conbg"));
                    cc.loader.loadRes("GameEnd/conbg", cc.SpriteFrame, function (err, spriteFrame) {
                        bg.getComponent(cc.Sprite).spriteFrame = spriteFrame;
                    });
                } else {
                    win.active = true;
                    winNum.string = data[i].score;
                }
            }
            var viewID = Tool.getViewChairID(data[i].chairID);
            playerNode[viewID].name.string = Tool.InterceptDiyStr(Tool.encryptMoblieNumber(data[i].name), 4);
            playerNode[viewID].difen.string = data[i].baseScore;
            playerNode[viewID].multiple.string = data[i].multiple;
            playerNode[viewID].money.string = data[i].score;

            if (data[i].chairID == gameModel.diZhuCharId) {
                playerNode[viewID].nodebg.active = true;
                playerNode[viewID].flag.active = true;
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
    },

    onDestroy() {
        cc.log("GameEnd has been destroy");
        this.playerNode = [];
    },
});