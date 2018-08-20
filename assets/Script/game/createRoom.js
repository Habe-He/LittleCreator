var gameEngine = require('./../plugin/gameEngine');
var AppHelper = require('./../AppHelper');
var KKVS = require('./../plugin/KKVS');

var CreateRoom = CreateRoom || {};

CreateRoom.Show = function () {

    AppHelper.get().hideLoading();
    var self = this;

    // 当前选中的局数
    self.currentTimes = 0;

    // 当前选中的倍数
    self.currentMultiple = 0;
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
        var modelType = cc.find('bg/con/TypeContent/Model', self._creatRoom).getComponent(cc.Toggle);
        modelType.interactable = false;

        self.timesArray = [];
        for (var i = 0; i < 3; ++i) {
            var timesStr = 'bg/con/TypeContent/Times_' + i.toString();
            var timesNode = cc.find(timesStr, self._creatRoom).getComponent(cc.Toggle);
            timesNode.tag = i.toString();
            timesNode.node.on("toggle", self.timesClick, self);
            self.timesArray.push(timesNode);
        }

        self.multipleArray = [];
        for (var i = 0; i < 3; ++i) {
            var multipleStr = 'bg/con/TypeContent/Multiple_' + i.toString();
            var multipleNode = cc.find(multipleStr, self._creatRoom).getComponent(cc.Toggle);
            multipleNode.tag = i.toString();
            multipleNode.node.on('toggle', self.multipleClick, self);
            self.multipleArray.push(multipleNode);
        }

        // 按钮事件响应
        closeBtn.on('click', self.closeClick, self);
        creatBtn.on('click', self.createClick, self);
    });

    self.createClick = function (event) {
        var self = this;
        cc.log('点击创建房间');
        
        var roundDes = [3, 6, 9];
        var multipleDes = [8, 16, 0];
        AppHelper.get().showLoading(null, null, 15);
        KKVS.GAME_MODEL = 2;
        var game_id = 2;
        var round = roundDes[self.currentTimes];
        var multiple = multipleDes[self.currentMultiple];
        cc.log("创建房间选择的局数 = " + round + " 倍数 = " + multiple);
        // game_id, round, multiples, field_type, roles, pwd , room_type , bring, base_score
        gameEngine.app.player().createGameRoom(game_id, round, multiple, 0, 3, "123456", 0, 0, 1);
    },

    self.multipleClick = function(event) {
        var self = this;
        for (var i in self.multipleArray) {
            self.multipleArray[i].isChecked = false;
            self.multipleArray[i].interactable = true;
        }

        self.currentMultiple = event.detail.tag;
        if (self.multipleArray[self.currentMultiple].isChecked) {
            self.multipleArray[self.currentMultiple].isChecked = true;
        } else {
            self.multipleArray[self.currentMultiple].isChecked = true;
        }
        cc.log("选中的倍数 = " + self.currentMultiple);
    },

    self.timesClick = function(event) {
        var self = this;
        for (var i in self.timesArray) {
            self.timesArray[i].isChecked = false;
            self.timesArray[i].interactable = true;
        }

        self.currentTimes = event.detail.tag;
        if (self.timesArray[self.currentTimes].isChecked) {
            self.timesArray[self.currentTimes].isChecked = true;
        } else {
            self.timesArray[self.currentTimes].isChecked = true
        }
        cc.log("选中的场次 = " + self.currentTimes);
    },

    self.closeClick = function (event) {
        self._creatRoom.destroy();
    };
};

module.exports = CreateRoom;