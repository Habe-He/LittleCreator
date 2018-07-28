var KKVS = require("./plugin/KKVS");
var OnLineManager = require("./tool/OnLineManager");
var Tool = require('./tool/Tool');
var AppHelper = require('./AppHelper');
var httpUtils = require('./plugin/httpUtils');
var gameModel = require('./game/gameModel');
var CreateRoom = require('./game/createRoom');

var DialogView = require('./widget/DialogView');
var TxtDialogComp = require('./widget/TxtDialogComp');
var gameEngine = require('./plugin/gameEngine');
var StringDef = require('./tool/StringDef');

cc.Class({
    extends: cc.Component,
    properties: {
        btnJinBI: cc.Button,
    },

    onLoad: function () {
        cc.log("=> Lobby::onLoad()");
        OnLineManager._autoConnect = true;
        var self = this;
        self.addEvent();
        self._serversRoomConfig();

        this.btnJinBI.node.on("touchend", self.jinBiBtnTouchEvent, this);

        var redBagBtn = cc.find('bg/Btn_Red', this.node);
        var paiWeiBtn = cc.find('bg/Btn_PaiWei', this.node);
        var friendBtn = cc.find('bg/Btn_Friends', this.node);

        redBagBtn.on('touchend', self.redBtnTouchEvent, this);
        paiWeiBtn.on('touchend', self.paiBtnTouchEvent, this);
        friendBtn.on('touchend', self.friendBtnTouchEvent, this);

        var bg = this.node.getChildByName('bg');
        var nameBG = bg.getChildByName('NameBG');
        var name = nameBG.getChildByName('name').getComponent(cc.Label);
        name.string = Tool.InterceptDiyStr(Tool.encryptMoblieNumber(KKVS.NICKNAME), 5);

        var coinbg = bg.getChildByName('coin');
        var coinCount = coinbg.getChildByName('count').getComponent(cc.Label);
        coinCount.string = KKVS.KGOLD.toString();

        var diamond = bg.getChildByName('ZuanShi');
        var diamondCount = diamond.getChildByName('count').getComponent(cc.Label);
        for (var i in gameModel.propsMsg) {
            if (gameModel.propsMsg[i].prop_id == StringDef.Diamond) {
                diamondCount.string = gameModel.propsMsg[i].count;
            }
        }
        
        var mSprite = bg.getChildByName("msak");
        var head = mSprite.getChildByName('Head_0').getComponent(cc.Sprite);
        Tool.weChatHeadFile(head, KKVS.HEAD_URL);

        var sprite_Level = bg.getChildByName("Sprite_Level");
        self.lv = sprite_Level.getChildByName("Lv").getComponent(cc.Sprite);
        self.datetime = sprite_Level.getChildByName("datetime").getComponent(cc.Label);
        
        self._updateLobbyLevel();
    },

    jinBiBtnTouchEvent: function (event) {
        cc.log("点击金币场次");
        // // KKVS.SelectFieldID = 2;
        // cc.director.loadScene("GameUI");
        // AppHelper.get().showLoading(null, null, 15);
        // // gameEngine.app.player().req_start_game(0);
    },

    redBtnTouchEvent: function (event) {
        cc.log("点击红包场次");
        // 283762
        KKVS.GAME_MODEL = 6;
        KKVS.COM_ROOM_NUMBER = 203657;
        gameEngine.app.player().joinGameRoom(203657, "asddd");

        // (new DialogView()).build(TxtDialogComp, {txt : "erorStr", type : 1, cb : function () {
        //     cc.director.loadScene('Lobby');
        // }}).show();
    },

    paiBtnTouchEvent: function(event) {
        cc.log("排位");
        // KKVS.SelectFieldID = 99;
        // KKVS.EnterRoomID = 99;
        // cc.director.loadScene("GameUI");
        // AppHelper.get().showLoading(null, null, 15);
    },

    friendBtnTouchEvent: function(event) {
        cc.log("好友对战");
        CreateRoom.Show();
    },

    _serversRoomConfig: function () {
        var reqURL = "https://apiwxgame.kkvs.com/MobileApi/GetRoomConfig";
        httpUtils.getInstance().httpGets(reqURL, function (data) {
            if (data == -1) {
                cc.log('获取大厅房间配置失败！');
            } else {
                var jsonD = JSON.parse(data);
                gameModel.roomConfig = jsonD;
            }
        });
    },

    _updateLobbyLevel: function() {
        var self = this;
        self.datetime.string = Tool.getByTime(gameModel.levelMsg[0].start) + "-" + Tool.getByTime(gameModel.levelMsg[0].end);
        
        // TODO 不使用loadRes方式加载替换资源
        // self.updateMyLevel(gameModel.levelMsg[0].score);
        var realUrl = cc.url.raw(self._getLevel(gameModel.levelMsg[0].score));
        self.lv.spriteFrame = new cc.SpriteFrame(realUrl);
    },

    _getLevel: function(score) {
        var lvStr = '';
        if (score >= 1000 && score <= 1199) {
            lvStr = 'Lv_0';
        } else if (score >= 1200 && score <= 1399) {
            lvStr = 'Lv_1';
        } else if (score >= 1400 && score <= 1599) {
            lvStr = 'Lv_2';
        } else if (score >= 1600 && score <= 1799) {
            lvStr = 'Lv_3';
        } else if (score >= 1800 && score <= 1999) {
            lvStr = 'Lv_4';
        } else if (score >= 2000 && score <= 2199) {
            lvStr = 'Lv_5';
        } else if (score >= 2200) {
            lvStr = 'Lv_6';
        } else {
            lvStr = 'Lv_0';
        }
        return "resources/Lobby/" + lvStr + ".png";
    },

    updateMyLevel: function(args) {
        // var realUrl = cc.url.raw(self._getLevel(args.score));
        // self.lv.spriteFrame = new cc.SpriteFrame(realUrl);
    },

    create_room_success: function(args) {
        AppHelper.get().showLoading(null, null, 15);
        // args.room_id === table ID

        // KKVS.EnterRoomID = parseInt(args.room_id);
        cc.director.loadScene("GameUI");
        // this.pwd = args.pwd;
        // var self = this;
        // this.node.runAction(cc.sequence(cc.delayTime(1), cc.callFunc(function() {
        //     gameEngine.app.player().joinGameRoom(self.room_id, self.pwd);
        // })));
    },

    on_player_join_room: function(args) {
        AppHelper.get().showLoading(null, null, 15);
        cc.director.loadScene("GameUI");
    },

    addEvent: function () {
        cc.log("Lobby addEvent");
        KKVS.Event.register("create_room_success", this, "create_room_success");
        KKVS.Event.register("on_player_join_room", this, "on_player_join_room");
    },

    onDestroy() {
        cc.log("=> Lobby::onDestroy()");
        KKVS.Event.deregister("create_room_success", this);
        KKVS.Event.deregister("on_player_join_room", this);
    },

});