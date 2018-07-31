var gameEngine = require('./../plugin/gameEngine');
var AppHelper = require('./../AppHelper');
var KKVS = require('./../plugin/KKVS');

var CreateRoom = CreateRoom || {};

CreateRoom.Show = function () {

    var self = this;

    cc.loader.loadRes("perfabs/CreateRoom", cc.Prefab, function (error, prefab) {

        if (error) {
            cc.error(error);
            return;
        }

        // 实例 
        self._creatRoom = cc.instantiate(prefab);
        self._creatRoom.parent = cc.find('Canvas');

        // 界面上面节点
        var closeBtn = cc.find('bg/close', self._creatRoom);
        var creatBtn = cc.find('bg/BtnCreate', self._creatRoom);
        creatBtn.tag = 0;

        // 玩法选择
        var modelType = cc.find('bg/com/TypeContent/Model', self._creatRoom);
        // modelType.interactable = false;

        self.timesArray = [];
        for (var i = 0; i < 3; ++i) {
            var timesStr = 'bg/con/TypeContent/Times_' + i.toString();
            var timesNode = cc.find(timesStr, self._creatRoom);
            self.timesArray.push(timesNode);
        }

        self.multipleArray = [];
        for (var i = 0; i < 3; ++i) {
            var multipleStr = 'bg/con/TypeContent/Multiple_' + i.toString();
            var multipleNode = cc.find(multipleStr, self._creatRoom);
            multipleNode.name = 'mu_' + i.toString();
            multipleNode.on('toggle', self.multipleClick, self);
            self.multipleArray.push(multipleNode);
        }

        // 按钮事件响应
        closeBtn.on('click', self.closeClick, self);
        creatBtn.on('click', self.createClick, self);
    });

    self.createClick = function (event) {
        cc.log('点击创建房间' + event.tag);
        // AppHelper.get().showLoading(null, null, 15);
        // KKVS.GAME_MODEL = 2;
        // // game_id, round, multiples, field_type, roles, pwd , room_type , bring, base_score
        // gameEngine.app.player().createGameRoom(2, 3, 1, 0, 3, "123456", 0, 0, 1);
    },

    self.multipleClick = function(event) {
        // var toggle = event.detail.name;
        // var toggle = event.name;
        // cc.log(toggle);
    },

    self.closeClick = function (event) {
        self._creatRoom.destroy();
    };
};

module.exports = CreateRoom;