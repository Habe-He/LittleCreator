var KKVS = require('./../plugin/KKVS');
var gameModel = require('./gameModel');
var Tool = require('./../tool/Tool');
var gameEngine = require('./../plugin/gameEngine');
var AudioMnger = require('./AudioMnger');

cc.Class({
    extends: cc.Component,

    properties: {},

    onLoad() {},

    start() {},

    setData: function (data, prefab) {
        gameModel.isOnReconnection = false;
        var self = this;
        self._endNodePB = prefab;
        var bg = cc.find('bg', prefab).getComponent(cc.Sprite);
        var line = cc.find('bg/line', prefab).getComponent(cc.Sprite);

        var win = cc.find('bg/win', prefab);
        var lost = cc.find('bg/lost', prefab);
        var winNum = cc.find('bg/win/num', prefab).getComponent(cc.Label);
        var lostNum = cc.find('bg/lost/num', prefab).getComponent(cc.Label);
        var kbLabel = cc.find("bg/line/kBi", prefab).getComponent(cc.Label);
        if (gameModel.GAME_MODEL == 2) {
            kbLabel.string = "积分";
        }

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
        var next = cc.find("next", prefab);

        if (KKVS.GAME_MODEL == 2) {
            exit.active = false;
            con.active = false;
            if (gameModel.lastJu == true) {
                gameModel.lastJu = false;
                next.active = true;
            }
        }

        exit.on("touchend", self.onExitClick, this);
        con.on("touchend", self.onContClick, this);
        next.on("touchend", self.showTotalResult, this);
        for (var i in data) {
            if (data[i].chairID == KKVS.myChairID) {
                if (data[i].score < 0) {
                    lost.active = true;
                    lostNum.string = data[i].score;
                    var realUrl = cc.url.raw("resources/GameEnd/blueL.png");
                    line.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(realUrl);

                    var bgUrl = cc.url.raw("resources/GameEnd/conbg.png");
                    bg.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(bgUrl);

                    AudioMnger.playEffect('voice/music/lose');
                } else {
                    win.active = true;
                    winNum.string = data[i].score;
                    AudioMnger.playEffect('voice/music/win');
                }
            }
            var viewID = Tool.getViewChairID(data[i].chairID);
            playerNode[viewID].name.string = Tool.InterceptDiyStr(Tool.encryptMoblieNumber(data[i].name), 4);
            playerNode[viewID].difen.string = data[i].baseScore;
            playerNode[viewID].multiple.string = data[i].multiple;
            if (data[i].score < 0) {
                playerNode[viewID].money.string = data[i].score;
            } else {
                playerNode[viewID].money.string = "+" + data[i].score;
            }


            if (data[i].chairID == gameModel.diZhuCharId) {
                playerNode[viewID].nodebg.active = true;
                playerNode[viewID].flag.active = true;
            }
        }

        this.node.runAction(cc.sequence(cc.delayTime(3.0), cc.callFunc(function () {
            if (KKVS.GAME_MODEL == 2 && !gameModel.lastJu) {
                self._endNodePB.destroy();
            }
        })));
    },

    onExitClick: function (event) {
        cc.log("退出游戏");
        gameModel.isWaiting = false;
        KKVS.Event.fire("onExitClick");
    },

    showTotalResult: function (event) {
        cc.log(" showTotalResult");
        var self = this;
        gameModel.isWaiting = false;
        self._endNodePB.destroy();

        var totalResult = require('totalResult');
        totalResult.Show(gameModel.totalResultData);
    },

    onContClick: function (event) {
        var self = this;
        cc.log("继续游戏");
        gameModel.isWaiting = false;
        KKVS.Event.fire("onContClick");
        self._endNodePB.destroy();
    },

    onDestroy() {
        cc.log("GameEnd has been destroy");
        this.playerNode = [];
    },
});