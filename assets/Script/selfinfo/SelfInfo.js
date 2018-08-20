var KKVS = require('./../plugin/KKVS');
var gameModel = require('./../game/gameModel');
var Tool = require('./../tool/Tool');
var gameEngine = require('./../plugin/gameEngine');
var StringDef = require('./../tool/StringDef');

var UserInfo = UserInfo || {};

UserInfo.Show = function() {
    var self = this;
    cc.loader.loadRes("perfabs/SelfInfo", cc.Prefab, function (error, prefab) {
        if (error) {
            cc.error(error);
            return;
        }
        // 实例 
        self._creatRoom = cc.instantiate(prefab);
        self._creatRoom.parent = cc.find('Canvas');

        // 界面上面节点
        var closeBtn = cc.find('bg/close', self._creatRoom);
        closeBtn.on('click', function () {
            self._creatRoom.destroy();
        }, self);

        var name = cc.find('bg/NameBg/Name', self._creatRoom).getComponent(cc.Label);
        name.string = Tool.InterceptDiyStr(Tool.encryptMoblieNumber(KKVS.NICKNAME), 10);

        var kb = cc.find('bg/NameBg/goldicon/goldnum', self._creatRoom).getComponent(cc.Label);
        kb.string = Tool.goldSplit(KKVS.KGOLD);

        var zs = cc.find('bg/NameBg/zsicon/money', self._creatRoom).getComponent(cc.Label);
        for (var i in gameModel.propsMsg) {
            if (gameModel.propsMsg[i].prop_id == StringDef.Diamond) {
                zs.string = gameModel.propsMsg[i].count;
            }
        }

        var head = cc.find('bg/NameBg/Face', self._creatRoom);
        Tool.weChatHeadFile(head.getComponent(cc.Sprite), KKVS.HEAD_URL, null);
    });
};

module.exports = UserInfo;