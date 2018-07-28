var gameEngine = require('./../plugin/gameEngine');
var AppHelper = require('./../AppHelper');

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

        var layer = cc.find('singleColor', self._creatRoom);

        layer.on(cc.Node.EventType.TOUCH_START, function (event) {
            event.stopPropagation();
            cc.log("createRomm touch");
        });

        // 界面上面节点
        var closeBtn = cc.find('bg/close', self._creatRoom);
        var creatBtn = cc.find('bg/BtnCreate', self._creatRoom);
        

        // 按钮事件响应
        closeBtn.on('click', self.closeClick, self);
        creatBtn.on('click', self.createClick, self);
    });

    self.createClick = function(event) {
        cc.log('点击创建房间');
        AppHelper.get().showLoading(null, null, 15);
        // game_id, round, multiples, field_type, roles, pwd , room_type , bring, base_score
        gameEngine.app.player().createGameRoom(2, 3, 1, 0, 3, "123456", 0, 0, 1);
    },

    self.closeClick = function (event) {
        self._creatRoom.destroy();
    };
};

module.exports = CreateRoom;