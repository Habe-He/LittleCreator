/**
 * Created by hades on 2017/2/17.
 * 组件系统UI
 */
var ComSysUI = cc.Node.extend({
    m_pConfig : null,
    m_pSys : null,
    ctor: function (com_sys, com_config) {
        this._super();
        this.init(com_sys, com_config);
    },
    init : function (com_sys, com_config) {
        this.m_pSys = com_sys;
        this.m_pConfig = com_config;
        this.m_pCurCfg = null;
        this.m_nLevel = 0;
        this.loadPng();
        var self = this;
        var configLen = this.m_pConfig.length;
        //this.often = cc.sys.localStorage.getItem(KKVS.UID.toString());
        //if (!this.often) {
        //    this.often = [];
        //    for (var n = 0; n < configLen; ++n) {
        //        this.often.push({"name" : this.m_pConfig[n].name, "game_often" : 0, "datetime" : 0});
        //    }
        //}else {
        //    this.often = JSON.parse(this.often);
        //}
        //var common = 0;
        this.common_tag = 3;
        //for (var i = 3; i < configLen; ++i) {
        //    if (common < this.often[i].game_often) {
        //        common = this.often[i].game_often;
        //        this.common_tag = i;
        //    }else if (common == this.often[i].game_often) {
        //        if (this.often[this.common_tag].datetime < this.often[i].datetime) {
        //            common = this.often[i].game_often;
        //            this.common_tag = i;
        //        }
        //    }
        //}
        //m_pConfig 0,1,2固定3是默认常玩游戏
        //第一界面
        var json_1 = ccs.load("res/comsys_item_1.json");
        var visibleSize = cc.director.getVisibleSize();
        var origin = cc.director.getVisibleOrigin();
        json_1.node.x = origin.x + visibleSize.width / 2 - json_1.node.getContentSize().width / 2;
        json_1.node.y = origin.y + visibleSize.height / 2 - json_1.node.getContentSize().height / 2;
        this.addChild(json_1.node);
        var body = json_1.node.getChildByName("body");
        this.bg_1 = body.getChildByName("bg_1");
        this.bg_2 = body.getChildByName("bg_2");
        var more_game = this.bg_2.getChildByName("more_game");
        more_game.addClickEventListener(function (sender) {
            playEffect();
            if (!modulelobby.isScreenLocked()) {
                modulelobby.lockScreen(0.9);
                KKVS.Event.fire("Lobby_Hide");
                sender.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function() {
                    self.m_nLevel = 1;
                    self.LobbyShow();
                })));
            }
        });
        for (var p = 0; p < 3; ++p) {
            this.createItem(p);
        }
        this.createItem(this.common_tag);
        //第2界面
        this.m_pViewBody = new ccui.Layout();
        this.m_pViewBody.setTouchEnabled(false);
        this.m_pViewBody.setContentSize(1920, 1080);
        this.m_pViewBody.setAnchorPoint(0.5, 0.5);
        this.m_pViewBody.setPosition(960, 540);
        //this.m_pViewBody.setBackGroundColorType(ccui.Layout.BG_COLOR_SOLID);
        //this.m_pViewBody.setBackGroundColor(cc.color(0, 0, 255));
        //this.m_pViewBody.setBackGroundColorOpacity(128);
        this.m_pViewBody.setVisible(false);
        this.addChild(this.m_pViewBody);
        this.MoreGameUI = new modulelobby.MoreGame(this, this.common_tag, configLen);
        this.m_pViewBody.addChild(this.MoreGameUI);
    },
    createItem : function (p, pos, _self, _body) {
        var self = this;
        var pItem;
        if (p == 0) {
            pItem = this.bg_1.getChildByName("game_0");
            var spine_node = pItem.getChildByName("spine_node");
            spine_node.setScale(0.8);
            //spine
            this.m_SiChuanBgSpine = new sp.SkeletonAnimation("res/ui/spine/sichuan_girl.json", "res/ui/spine/sichuan_girl.atlas");
            spine_node.addChild(this.m_SiChuanBgSpine);
            this.m_SiChuanBgSpine.setPosition(0, 0);
            this.m_SiChuanBgSpine.setAnimation(0, "animation", true);
        }else if (p == 1) {
            pItem = this.bg_2.getChildByName("game_1");
        }else if (p == 2) {
            pItem = this.bg_2.getChildByName("game_2");
        }else if (p == this.common_tag) {
            pItem = this.bg_2.getChildByName("game_3");
        }else {
            pItem = _body.clone();
            pItem.setVisible(true);
            pItem.setAnchorPoint(0.5, 0.5);
            pItem.setPosition(pos);
            _self.addChild(pItem);
        }
        var com = {};
        com.id = this.m_pConfig[p].id;
        com.body = pItem;
        com.icon = com.body.getChildByName("icon");
        com.download = com.body.getChildByName("download");
        com.version = com.body.getChildByName("version");
        com.version.ignoreContentAdaptWithSize(true);
        com.body.setTag(p);
        com.body.setTouchEnabled(true);
        com.body.addTouchEventListener(function(sender, type){
            switch (type) {
                case ccui.Widget.TOUCH_BEGAN:
                    sender.setScale(1.01);
                    break;
                case ccui.Widget.TOUCH_ENDED:
                    sender.setScale(1.0);
                    sender.setTouchEnabled(false);
                    sender.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function () {
                        sender.setTouchEnabled(true);
                    })));
                    playEffect();
                    var config = self.m_pConfig[sender.getTag()];
                    self.onLaunch(config);
                    break;
                case ccui.Widget.TOUCH_CANCELED:
                    sender.setScale(1.0);
                    break;
                default:
                    break;
            }
        });
        var fieldid = this.m_pConfig[p]['fieldid'];
        if (typeof fieldid == 'number') {
            com.icon.loadTexture("com_" + com.id + "/icon_" + com.id + "_" + fieldid + ".png", ccui.Widget.PLIST_TEXTURE);
            //com.name.loadTexture("com_" + com.id + "/name_" + com.id + "_" + fieldid + ".png", ccui.Widget.PLIST_TEXTURE);
            //this._ation("res/com_item_" + com.id + "_" + fieldid + ".json", com.body_ation);
        } else {
            com.icon.loadTexture("com_" + com.id + "/icon_" + com.id + ".png", ccui.Widget.PLIST_TEXTURE);
            //com.name.loadTexture("com_" + com.id + "/name_" + com.id + ".png", ccui.Widget.PLIST_TEXTURE);
            //this._ation("res/com_item_" + com.id +".json", com.body_ation);
        }
        this.m_pConfig[p].com = com;
        this.updateComConfig(this.m_pConfig[p]);
    },
    onfastrase : function () {
        //快速进入斗地主比赛
        this.onLaunch(this.m_pConfig[1]);
    },
    LobbyHide : function () {
        if (this.m_nLevel == 0) {
            this.m_pViewBody.setVisible(false);
            this.bg_1.runAction(cc.moveTo(0.3, cc.p(-430, 385)).easing(cc.easeSineOut()));
            this.bg_2.runAction(cc.moveTo(0.3, cc.p(2400, 385)).easing(cc.easeSineOut()));
        }else if (this.m_nLevel == 1) {
            this.m_pViewBody.setVisible(true);
            this.MoreGameUI._hide();
        }
    },
    LobbyShow : function () {
        if (this.m_nLevel == 0) {
            this.m_pViewBody.setVisible(false);
            this.bg_1.runAction(cc.moveTo(0.4, cc.p(420, 385)).easing(cc.easeElasticOut()));
            this.bg_2.runAction(cc.sequence(cc.delayTime(0.2), cc.moveTo(0.15, cc.p(1325, 385)).easing(cc.easeElasticOut())));
        }else if (this.m_nLevel == 1) {
            this.m_pViewBody.setVisible(true);
            this.MoreGameUI._show();
        }
    },
    MoreGameHide : function () {
        if (this.m_nLevel == 0) {
            KKVS.Event.fire("Lobby_Show");
        }else if (this.m_nLevel == 1) {
            this.m_pViewBody.setVisible(true);
            this.MoreGameUI._show();
        }
    },
    playgamesoften : function (data) {
        //for (var n = 0, len = this.m_pConfig.length; n < len; ++n) {
        //    if (this.often[n].name == data) {
        //        ++this.often[n].game_often;
        //        this.often[n].datetime = Date.parse(new Date());
        //        break;
        //    }
        //}
        //cc.sys.localStorage.setItem(KKVS.UID.toString(), JSON.stringify(this.often));
    },
    loadPng : function () {
        var configLen = this.m_pConfig.length;
        for (var s = 0; s < configLen; ++s) {
            var id = this.m_pConfig[s]["id"];
            cc.spriteFrameCache.addSpriteFrames("res/ui/comsys/com_" + id + ".plist", "res/ui/comsys/com_" + id + ".png");
        }
    },
    updateComConfig : function (config) {
        if (!config || !config.com) {
            return;
        }
        var com = config.com;
        if (config.online) {
            var version = this.m_pSys.getVersion(config);
            version = !version ? "0.0.0" : version;
            var localVersion = this.m_pSys.getLocalVersion(config);
            localVersion = !localVersion ? "0.0.0" : localVersion;
            if (localVersion == "0.0.0") {
                com.version.setString("立即下载");
            } else if (localVersion != version) {
                com.version.setString("立即更新");
            } else {
                com.version.setString(localVersion);
            }
        } else {
            com.version.setString("敬请期待!");
        }
    },
    onLaunch : function (config) {
        this.m_pCurCfg = config;
		KKVS.Event.fire("onLaunchComponent", config);
    },
    onDownload : function (config) {
        if (!config || !config.id) {
            return;
        }
        for (var i = 0, len = this.m_pConfig.length; i < len; ++i) {
            if (this.m_pConfig[i].id == config.id) {
                this.updateComConfig(this.m_pConfig[i]);
            }
        }
    },
    onSwitchGo : function (param) {
        var level = param;
        if (level < 0) {
            KKVS.Event.fire("ComSys_Return");
        } else {
            this.onSwitch(this.m_pCurCfg, level);
        }
    },
    onSwitch : function (config, level) {
        if (level == 0) { // 0=menu level
            //this.m_nLevel = 0;
            //this.scrollView(0);
        }else if (level == 1) { // 1=class level
            if (!KKVS.RoomListInfo || KKVS.RoomListInfo.length == 0) {
                return;
            }
            //room level
            if (typeof config.fieldid == 'number') {
                KKVS.SelectFieldID = config.fieldid;
            } else {
                KKVS.SelectFieldID = KKVS.RoomListInfo[0].field_id;
            }
            var room_field = null;
            for (var i = 0, s = KKVS.RoomListInfo.length; i < s; ++i) {
                var field = KKVS.RoomListInfo[i]["field_id"];
                if (field == KKVS.SelectFieldID) {
                    room_field = KKVS.RoomListInfo[i];
                    break;
                }
            }
            if (!room_field) {
                this.m_pSys.showDialog("游戏维护中...");
                return;
            }
            if (room_field['field_mode'] == ComSysData_RoomMode3) {
                var room_select = room_field["roomList"][0];
                KKVS.MinScore = room_select.min_score;
                KKVS.MaxScore = room_select.max_score;
                KKVS.GameType = room_select.room_type;
                KKVS.ServicePay = room_select.service_pay;
                KKVS.EnterRoomID = room_select.room_id;
                //KKVS.Event.fire("onInstallComponent", config);
                KKVS.Event.fire("Lobby_Hide");
                this.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function() {
                    KKVS.Event.fire("onInstallComponent", config);
                })));
            } else if (room_field['field_mode'] == ComSysData_RoomMode2) {
                //(new modulelobby.ComSysMatchUI(config)).show();
                KKVS.Event.fire("Lobby_Hide");
                this.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function() {
                    modulelobby.pushScene(modulelobby.ComSysMatchUI, config);
                })));
            } else {
                //(new modulelobby.ComSysRoom(config)).show();
                KKVS.Event.fire("Lobby_Hide");
                this.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function() {
                    modulelobby.pushScene(modulelobby.ComSysRoom, config);
                })));
            }
        }
    },
    onEnter : function () {
        cc.Node.prototype.onEnter.call(this);
        this.loadPng();
        KKVS.Event.register("PlayGamesOften", this, "playgamesoften");
        KKVS.Event.register("FastRase", this, "onfastrase");
        KKVS.Event.register("Lobby_Hide", this, "LobbyHide");
        KKVS.Event.register("Lobby_Show", this, "LobbyShow");
        KKVS.Event.register("More_Game_Hide", this, "MoreGameHide");
        this.LobbyShow();//因为好友拼十没有经过选场直接进入子游戏。退出时界面没还原（只是牛牛）
    },
    onExit : function () {
        KKVS.Event.deregister("PlayGamesOften", this);
        KKVS.Event.deregister("FastRase", this);
        KKVS.Event.deregister("Lobby_Hide", this);
        KKVS.Event.deregister("Lobby_Show", this);
        KKVS.Event.deregister("More_Game_Hide", this);
        cc.Node.prototype.onExit.call(this);
    }
});
//********************************************更多游戏******************************************************
modulelobby.MoreGame = cc.Layer.extend({
    ctor: function (com_sys, commonId, configLen) {
        this._super();
        var json = ccs.load("res/comsys_item_2.json");
        var visibleSize = cc.director.getVisibleSize();
        var origin = cc.director.getVisibleOrigin();
        json.node.x = origin.x + visibleSize.width / 2 - json.node.getContentSize().width / 2;
        json.node.y = origin.y + visibleSize.height / 2 - json.node.getContentSize().height / 2;
        this.addChild(json.node);
        var self = this;
        this.m_nNum = 3;
        this.m_nPageNum = null;
        //view
        var back = json.node.getChildByName("back");
        this.view_node = back.getChildByName("view_node");
        this.view_node.setPosition(2880, 540);
        var game = back.getChildByName("game");
        game.setVisible(false);
        this.top = back.getChildByName("top");
        this.top.setPosition(960, 1230);
        var clone_btn = this.top.getChildByName("clone_btn");
        this.m_pViewSize = cc.size(1700, 690);
        this.m_pView = new ccui.PageView();
        this.m_pView.setContentSize(this.m_pViewSize);
        this.m_pView.setAnchorPoint(0.5, 0.5);
        this.m_pView.setPosition(0, 0);
        if (!cc.sys.isNative) {
            this.m_pView.setCustomScrollThreshold(250);
        }
        this.view_node.addChild(this.m_pView);
        this.m_pView.addEventListener(function (sender, type) {
            switch (type) {
                case ccui.PageView.EVENT_TURNING:
                    self.scrollView(0);
                    break;
                default:
                    break;
            }
        });
        this.m_pBtnLeft = new ccui.Button("res/ui/comsys/arrow.png");
        this.m_pBtnLeft.setRotation(180);
        this.m_pBtnLeft.setScale(0.75);
        var btn_x = this.m_pViewSize.width * 0.5;
        this.m_pBtnLeft.setPosition(-btn_x, 0);
        this.m_pBtnLeft.addClickEventListener(function (sender) {
            sender.setTouchEnabled(false);
            sender.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function () {
                sender.setTouchEnabled(true);
            })));
            playEffect();
            self.scrollView(-1);
        });
        this.view_node.addChild(this.m_pBtnLeft);
        this.m_pBtnRight = new ccui.Button("res/ui/comsys/arrow.png");
        //this.m_pBtnRight.setRotation(180);
        this.m_pBtnRight.setScale(0.75);
        this.m_pBtnRight.setPosition(btn_x, 0);
        this.m_pBtnRight.addClickEventListener(function (sender) {
            sender.setTouchEnabled(false);
            sender.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function () {
                sender.setTouchEnabled(true);
            })));
            playEffect();
            self.scrollView(1);
        });
        this.view_node.addChild(this.m_pBtnRight);
        //init
        var configInd = 3;
        var pageNum = Math.ceil((configLen - 4) / this.m_nNum);
        this.m_nPageNum = pageNum;
        for (var p = 0; p < pageNum; ++p) {
            var page = new ccui.Layout();
            page.setTouchEnabled(false);
            page.setContentSize(this.m_pViewSize);
            this.m_pView.addPage(page);
            var hw = this.m_pViewSize.width / (this.m_nNum * 2);
            var hh = this.m_pViewSize.height / 2;
            for (var i = 0; i < this.m_nNum && configInd < configLen; ++i) {
                if (commonId == configInd) {
                    --i;
                }else {
                    com_sys.createItem(configInd, cc.p(hw + i * 2 * hw, hh), page, game);
                }
                ++configInd;
            }
        }
        if (cc.sys.isNative) {
            this.m_pView.setCurrentPageIndex(0);
        }
        this.scrollView(0);
        clone_btn.addClickEventListener(function (sender) {
            playEffect();
            if (!modulelobby.isScreenLocked()) {
                modulelobby.lockScreen(0.7);
                self._hide();
                sender.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function() {
                    com_sys.m_nLevel = 0;
                    KKVS.Event.fire("Lobby_Show");
                })));
            }
        });

        return true;
    },
    scrollView : function (ind) {
        var curPage = 0;
        if (!cc.sys.isNative) {
            curPage = this.m_pView.getCurPageIndex();
        } else {
            curPage = this.m_pView.getCurrentPageIndex();
        }
        if (ind != 0) {
            this.m_pView.scrollToPage(curPage + ind);
        }
        if (this.m_nPageNum < 2) {
            this.m_pBtnLeft.setVisible(false);
            this.m_pBtnRight.setVisible(false);
        }else {
            if (curPage + ind == 0) {
                this.m_pBtnLeft.setVisible(false);
                this.m_pBtnRight.setVisible(true);
            } else if (curPage + ind == (this.m_nPageNum - 1)) {
                this.m_pBtnLeft.setVisible(true);
                this.m_pBtnRight.setVisible(false);
            } else {
                this.m_pBtnLeft.setVisible(true);
                this.m_pBtnRight.setVisible(true);
            }
        }
    },
    _show : function () {
        this.view_node.runAction(cc.sequence(cc.delayTime(0.15),cc.moveTo(0.3, cc.p(960, 540)).easing(cc.easeElasticOut())));
        this.top.runAction(cc.moveTo(0.5, cc.p(960, 1080)).easing(cc.easeElasticOut()));
    },
    _hide : function () {
        this.view_node.runAction(cc.moveTo(0.3, cc.p(2880, 540)).easing(cc.easeSineOut()));
        this.top.runAction(cc.moveTo(0.3, cc.p(960, 1230)).easing(cc.easeSineOut()));
    }
});
//********************************************选场******************************************************
modulelobby.ComSysRoom = cc.Layer.extend({
    ctor: function (config) {
        this._super();
        this.m_pCurCfg = config;
        this.room_select = -1;
        this.room_list = [];
        this.room_field = {};
        this.room_bg = ["game/game_room_00.png", "game/game_room_01.png", "game/game_room_02.png", "game/game_room_02.png"];
        for (var i = 0, s = KKVS.RoomListInfo.length; i < s; ++i) {
            var field = KKVS.RoomListInfo[i]["field_id"];
            if (field == KKVS.SelectFieldID) {
                this.room_list = KKVS.RoomListInfo[i]["roomList"];
                this.room_field = KKVS.RoomListInfo[i];
                break;
            }
        }
        if (typeof this.room_field.description != "string") {
            this.room_field.description = "";
        }
        var json = ccs.load("res/comsys_room.json");
        var visibleSize = cc.director.getVisibleSize();
        var origin = cc.director.getVisibleOrigin();
        json.node.x = origin.x + visibleSize.width / 2 - json.node.getContentSize().width / 2;
        json.node.y = origin.y + visibleSize.height / 2 - json.node.getContentSize().height / 2;
        this.addChild(json.node);
        var self = this;
        var back = json.node.getChildByName("back");
        this.top = back.getChildByName("top");
        this.top.setPosition(cc.p(960, 1230));
        var title = this.top.getChildByName("title");
        var exitbtn = this.top.getChildByName("clone_btn");
        var rulebtn = this.top.getChildByName("rulebtn");
        var classLen = KKVS.RoomListInfo.length;
        if (classLen == 0) {
            title.setVisible(false);
        } else {
            var roomname_txt = "";
            if (typeof this.m_pCurCfg.fieldid == 'number') {
                roomname_txt = "com_" + this.m_pCurCfg.id + "/name_" + this.m_pCurCfg.id + "_" + KKVS.SelectFieldID.toString() + ".png";
            } else {
                roomname_txt = classLen == 1 ? ("com_" + this.m_pCurCfg.id + "/name_" + this.m_pCurCfg.id + ".png") : ("com_" + this.m_pCurCfg.id + "/name_" + this.m_pCurCfg.id + "_" + KKVS.SelectFieldID.toString() + ".png");
            }
            title.setSpriteFrame(roomname_txt);
        }
        exitbtn.addClickEventListener(function (sender) {
            sender.setTouchEnabled(false);
            playEffect();
            //var level = 1 < classLen ? 1 : 0;
            //modulelobby.popScene();
            //KKVS.Event.fire("ComSys_Switch", level, config);
            if (!modulelobby.isScreenLocked()) {
                modulelobby.lockScreen(0.8);
                self._hide();
                self.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function() {
                    modulelobby.popScene();
                    KKVS.Event.fire("More_Game_Hide");
                })));
            }
        });
        rulebtn.addClickEventListener(function (sender) {
            sender.setTouchEnabled(false);
            sender.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function() {
                sender.setTouchEnabled(true);
            })));
            playEffect();
            self._openRule(self.room_field.description);
        });
        this.bg = back.getChildByName("bg");
        this.bg.setPosition(cc.p(2880, 475.2));
        var quickbtn = this.bg.getChildByName("quickbtn");
        quickbtn.addClickEventListener(function (sender) {
            sender.setTouchEnabled(false);
            sender.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function() {
                sender.setTouchEnabled(true);
            })));
            playEffect();
            self.quickStart();
        });
        this.listview = this.bg.getChildByName("listview");
        var item_model = this.listview.getItem(0);
        this.listview.setItemModel(item_model);
        this.listview.removeItem(0);
        var roomLen = this.room_list.length;
        if (0 < roomLen) {
            for (var rnd = roomLen - 1; 0 <= rnd; --rnd) {
                this._roomItem(this.m_pCurCfg, this.room_list[rnd], rnd, this.room_list[rnd - 1]);
            }
        }
        this._show();
    },
    showDialog: function (str) {
        var dialog = new modulelobby.TxtDialog({title : "系统提示", txt : str});
        dialog.show();
    },
    _openRule : function (data) {
        var dialog = new modulelobby.RuleDialog(data);
        dialog.show();
    },
    quickStart : function () {
        modulelobby.showLoading(null, null, 5);
        this.room_select = 65535;
        KBEngine.app.player().req_player_pos();
    },
    _quickStart : function () {
        var room_list = this.room_list;
        if (!room_list || room_list.length == 0 || !this.m_pCurCfg) {
            this.showDialog("进入房间失败!");
            return;
        }
        var my_gold = parseInt(KKVS.KGOLD);
        var room_select = null;
        var room_min_score = -1;
        var room_max_score = -1;
        for(var r = room_list.length - 1; 0 <= r; --r) {
            var room = room_list[r];
            if(my_gold >= room.min_score && (room.max_score == 0 || my_gold <= room.max_score)) {
                room_select = room;
                break;
            }else if (my_gold < room.min_score){
                if (room_min_score == -1) {
                    room_min_score = room.min_score;
                }else {
                    room_min_score = room_min_score < room.min_score ? room_min_score : room.min_score;
                }
            }else if (room.max_score < my_gold) {
                if (room_max_score == -1) {
                    room_max_score = room.max_score;
                }else {
                    room_max_score = room_max_score < room.max_score ? room.max_score : room_max_score;
                }
            }
        }
        if (!room_select) {
            if (my_gold < room_min_score) {
                this._showDialog({title : "系统提示", txt : "金币不足请前往充值", type : 2, halign : cc.TEXT_ALIGNMENT_CENTER, cb : this.gotoscene, target: this});
            }
            if (room_max_score!= -1 && room_max_score < my_gold) {
                this.showDialog("进入房间失败，金币大于" + getGoldTxt(room_max_score));
            }
        } else {
            KKVS.MinScore = room_select.min_score;
            KKVS.MaxScore = room_select.max_score;
            KKVS.GameType = room_select.room_type;
            KKVS.ServicePay = room_select.service_pay;
            KKVS.EnterRoomID = room_select.room_id;
            KKVS.Event.fire("onInstallComponent", this.m_pCurCfg);
            KKVS.Event.fire("PlayGamesOften", this.m_pCurCfg.name);
        }
    },
    _showDialog : function (data, cvisible) {
        var dialog = new modulelobby.TxtDialog(data);
        if (cvisible) {
            dialog.addCloseButton();
        }
        dialog.show(this);
    },
    gotoscene : function () {
        if (KKVS.FirstFlushSign == 0) {
            (new modulelobby.FirstFlush(true)).show();
        }else if (KKVS.FirstFlushSign == 1) {
            this._hide();
            this.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function() {
                modulelobby.popScene();
                modulelobby.pushScene(modulelobby.RechargeCenter);
                //KKVS.Event.fire("More_Game_Hide");
            })));
        }
    },
    _roomItem : function (config, roomdata, roomInd, roomdata_previous) {
        var self = this;
        this.listview.insertDefaultItem(0);
        var item = this.listview.getItem(0);
        var com = {};
        com.body = item;
        com.id = roomdata.room_id;
        com.png_1 = com.body.getChildByName("png_1");
        com.png_2 = com.body.getChildByName("png_2");
        com.basescore = com.body.getChildByName("basescore");
        com.basescore.ignoreContentAdaptWithSize(true);
        com.minscore = com.body.getChildByName("minscore");
        com.minscore.ignoreContentAdaptWithSize(true);
        com.fish_text = com.body.getChildByName("fish_text");
        com.fish_text.ignoreContentAdaptWithSize(true);
        com.body.setTag(com.id);
        com.body.setTouchEnabled(true);
        com.body.addTouchEventListener(function(sender, type){
            switch (type) {
                case ccui.Widget.TOUCH_BEGAN:
                    sender.setScale(1.05);
                    break;
                case ccui.Widget.TOUCH_ENDED:
                    sender.setScale(1.0);
                    sender.setTouchEnabled(false);
                    sender.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function() {
                        sender.setTouchEnabled(true);
                    })));
                    playEffect();
                    modulelobby.showLoading(null, null, 5);
                    self.room_select = roomInd;
                    KBEngine.app.player().req_player_pos();
                    //var data = roomdata;
                    //var my_gold = parseInt(KKVS.KGOLD);
                    //if (my_gold >= data.min_score && (data.max_score == 0 || my_gold <= data.max_score)) {
                    //    KKVS.MinScore = data.min_score;
                    //    KKVS.MaxScore = data.max_score;
                    //    KKVS.GameType = data.room_type;
                    //    KKVS.SelectFieldID = KKVS.GameType;
                    //    KKVS.ServicePay = data.service_pay;
                    //    KKVS.EnterRoomID = data.room_id;
                    //    KKVS.Event.fire("onInstallComponent", config);
                    //} else {
                    //    var str = my_gold < data.min_score ? "进入房间失败，金币少于" + getGoldTxt(data.min_score) : "进入房间失败，金币大于" + getGoldTxt(data.max_score);
                    //    self.showDialog(str);
                    //}
                    break;
                case ccui.Widget.TOUCH_CANCELED:
                    sender.setScale(1.0);
                    break;
                default:
                    break;
            }
        });
        com.body.loadTexture(this.room_bg[roomInd % 4], ccui.Widget.PLIST_TEXTURE);
        //var base_num = typeof (roomdata.base_score) == 'number' ? roomdata.base_score / 100.00 : 0.00;
        //var min_num = typeof (roomdata.min_score) == 'number' ? roomdata.min_score / 100.00 : 0.00;
        //base_num = base_num.toFixed(2);
        //min_num = min_num.toFixed(2);
        //var room_color = com.id == 1 ? cc.color(209, 202, 255) : (com.id == 2 ? cc.color(239, 181, 255) : (com.id == 3 ? cc.color(240, 230, 154) : (com.id == 4 ? cc.color(209, 202, 255) : cc.color(255, 255, 255))));
        //var room_stroke = com.id == 1 ? cc.color(52, 31, 118) : (com.id == 2 ? cc.color(71, 30, 126) : (com.id == 3 ? cc.color(120, 60, 9) : (com.id == 4 ? cc.color(52, 31, 118) : cc.color(255, 255, 255))));
        var base_num = typeof (roomdata.base_score) == 'number' ? roomdata.base_score : 0;
        var min_num = typeof (roomdata.min_score) == 'number' ? roomdata.min_score : 0;
        com.basescore.setString(base_num.toString());
        //com.basescore.setString("底分" + base_num.toString());
        //com.basescore.setTextColor(room_color);
        //com.basescore.enableOutline(room_stroke, 3);
        com.basescore.setVisible(base_num == 0 ? false : true);
        com.minscore.setString(min_num.toString());
        //com.minscore.setString(min_num.toString() + "金币进入");
        //com.minscore.setTextColor(room_color);
        //com.minscore.enableOutline(room_stroke, 3);
        //var room_txt = com.id == 1 ? "工薪场" : (com.id == 2 ? "中产场" : (com.id == 3 ? "富裕场" : (com.id == 4 ? "土豪场" : "")));
        //com.room.setString(room_txt);
        var pos_1 = parseInt((com.body.getContentSize().width - (com.png_1.getContentSize().width + com.basescore.getContentSize().width)) / 2);
        var pos_2 = parseInt((com.body.getContentSize().width - (com.png_2.getContentSize().width + com.minscore.getContentSize().width)) / 2);
        com.png_1.setPositionX(pos_1);
        com.basescore.setPositionX((com.body.getContentSize().width - pos_1));
        com.png_2.setPositionX((com.body.getContentSize().width - pos_2));
        com.minscore.setPositionX(pos_2);
        if (config.lobbyid == 20) {
            com.fish_text.setVisible(true);
            var base_previous_num;
            if (roomdata_previous) {
                base_previous_num = roomdata_previous.base_score;
            }else {
                base_previous_num = 1;
            }
            com.fish_text.setString(base_previous_num.toString() + "-" + base_num.toString() + "炮");
            com.png_1.setVisible(false);
            com.basescore.setVisible(false);
        }
    },
    on_player_pos : function (lobbyID) {
        cc.log("ComSysUI::on_player_pos lobbyID = ", lobbyID);
        modulelobby.hideLoading();
        var room_select = this.room_select;
        this.room_select = -1;
        if (typeof lobbyID == 'undefined' || (typeof lobbyID == 'number' && lobbyID == 0)) {
            if (room_select == 65535) {
                this._quickStart();
                return;
            }
            var data = this.room_list[room_select];
            if (typeof data == 'undefined') {
                return;
            }
            var my_gold = parseInt(KKVS.KGOLD);
            if (my_gold >= data.min_score && (data.max_score == 0 || my_gold <= data.max_score)) {
                KKVS.MinScore = data.min_score;
                KKVS.MaxScore = data.max_score;
                KKVS.GameType = data.room_type;
                KKVS.SelectFieldID = KKVS.GameType;
                KKVS.ServicePay = data.service_pay;
                KKVS.EnterRoomID = data.room_id;
                KKVS.Event.fire("onInstallComponent", this.m_pCurCfg);
                KKVS.Event.fire("PlayGamesOften", this.m_pCurCfg.name);
            } else {
                if (my_gold < data.min_score) {
                    this._showDialog({title : "系统提示", txt : "金币不足请前往充值", type : 2, halign : cc.TEXT_ALIGNMENT_CENTER, cb : this.gotoscene, target: this});
                }
                if (data.max_score!= 0 && data.max_score < my_gold) {
                    this.showDialog("进入房间失败，金币大于" + getGoldTxt(data.max_score));
                }
                //var str = my_gold < data.min_score ? "进入房间失败，金币少于" + getGoldTxt(data.min_score) : "进入房间失败，金币大于" + getGoldTxt(data.max_score);
                //this.showDialog(str);
            }
        } else {
            KKVS.Event.fire("ComSys_RestartComponent", {game_id : lobbyID});
        }
    },
    _show : function () {
        this.top.runAction(cc.moveTo(0.5, cc.p(960, 1080)).easing(cc.easeElasticOut()));
        this.bg.runAction(cc.moveTo(0.5, cc.p(960, 475.2)).easing(cc.easeElasticOut()));
    },
    _hide : function () {
        this.top.runAction(cc.moveTo(0.3, cc.p(960, 1230)).easing(cc.easeSineOut()));
        this.bg.runAction(cc.moveTo(0.3, cc.p(2880, 475.2)).easing(cc.easeSineOut()));
    },
    onEnter : function () {
        this._super();
        KKVS.Event.register("on_player_pos", this, "on_player_pos");
    },
    onExit : function () {
        KKVS.Event.deregister("on_player_pos", this);
        this._super();
    }
});