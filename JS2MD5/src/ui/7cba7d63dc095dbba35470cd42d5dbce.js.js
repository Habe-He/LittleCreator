/**
 * Created by hades on 2017/2/21.
 */
modulelobby.MainLobby = cc.Layer.extend({
    ctor: function () {
        this._super();
        this.opt_obj = null;
        OnLineManager._autoConnect = true;
        KKVS.CurScene = 1;
        var json = ccs.load("res/lobby.json");
        var visibleSize = cc.director.getVisibleSize();
        var origin = cc.director.getVisibleOrigin();
        json.node.x = origin.x + visibleSize.width / 2 - json.node.getContentSize().width / 2;
        json.node.y = origin.y + visibleSize.height / 2 - json.node.getContentSize().height / 2;
        this.addChild(json.node);
        var rootNode = json.node;
        var self = this;
        this.m_gameDownloadOnly = false;
        // 苹果补单
        checkTransaction();
        //var back = rootNode.getChildByName("back");
        //back.setContentSize(visibleSize);
        var bg = rootNode.getChildByName("bg");
        var centerPosX = bg.getContentSize().width / 2;
        var centerPosY = bg.getContentSize().height / 2;
        var comsys_node = bg.getChildByName("comsys_node");
        this.rank_node = bg.getChildByName("rank_node");
        var bottombar = bg.getChildByName("bottombar");
        this.bottombar = bottombar;
        var recharge_btn = bottombar.getChildByName("recharge_btn");
        var exchange_btn = bottombar.getChildByName("exchange_btn");
        var mail_btn = bottombar.getChildByName("mail_btn");
        this.mail_reddot = mail_btn.getChildByName("reddot");
        this.mail_txt = this.mail_reddot.getChildByName("txt");
        this.mail_txt.ignoreContentAdaptWithSize(true);
        var fast_rase = bottombar.getChildByName("fast_rase");
        var still_more = bottombar.getChildByName("still_more");
        this.first_flush = bottombar.getChildByName("first_flush");
        var topbar = bg.getChildByName("topbar");
        this.topbar = topbar;
        //userinfo
        var userinfo = topbar.getChildByName("userinfo");
        this.userinfo = userinfo;
        this.head_node = userinfo.getChildByName("head_node");
        this.userinfo.head = this.head_node.getChildByName("head");
        this.userinfo.id = userinfo.getChildByName("id_bg").getChildByName("id");
        this.userinfo.id.ignoreContentAdaptWithSize(true);
        this.vip_node = userinfo.getChildByName("btn_vip");
        this.vip_node.ignoreContentAdaptWithSize(true);
        var gold_bg = userinfo.getChildByName("gold_bg");
        var gold_png = gold_bg.getChildByName("png");
        this.userinfo.gold = gold_bg.getChildByName("gold");
        this.userinfo.gold.ignoreContentAdaptWithSize(true);
        var acer_bg = userinfo.getChildByName("acer_bg");
        var acer_png = acer_bg.getChildByName("png");
        this.userinfo.acer = acer_bg.getChildByName("acer");
        this.userinfo.acer.ignoreContentAdaptWithSize(true);
        var get_red = topbar.getChildByName("get_red");
        this.get_red_list = topbar.getChildByName("get_red_list");
        var get_room = topbar.getChildByName("get_room");
        var prove = topbar.getChildByName("prove");
        var prove_png = prove.getChildByName("png");
        var more = topbar.getChildByName("more");
        var btns = topbar.getChildByName("btns");
        var set_btn = btns.getChildByName("set_btn");
        var custom_btn = btns.getChildByName("custom_btn");
        var exit_btn = btns.getChildByName("exit_btn");
        this.m_getredlist = [];
        this.setUserInfo();
        setWechatHead(KKVS.HEAD_URL, this.userinfo.head, getWechatHeadMask(), getWechatHeadBorder());
        //gold spine
         this.m_spineGold = sp.SkeletonAnimation("res/ui/spine/jinbi.json", "res/ui/spine/jinbi.atlas");
         gold_png.getParent().addChild(this.m_spineGold);
         this.m_spineGold.setPosition(gold_png.getPosition());
         this.m_spineGold.setAnimation(0, "animation", true);
        //this.m_spineGold.setCompleteListener(function(traceIndex, loopCount){
        //});
        //acer spine
        this.m_spineAcer = sp.SkeletonAnimation("res/ui/spine/dismond.json", "res/ui/spine/dismond.atlas");
        acer_png.getParent().addChild(this.m_spineAcer);
        this.m_spineAcer.setPosition(acer_png.getPosition());
        this.m_spineAcer.setAnimation(0, "animation", true);
        //fast_rase spine
        this.m_fastSpine = new sp.SkeletonAnimation("res/ui/spine/kuaisukaishi.json", "res/ui/spine/kuaisukaishi.atlas");
        fast_rase.getParent().addChild(this.m_fastSpine);
        this.m_fastSpine.setPosition(fast_rase.getPositionX() + 20, fast_rase.getPositionY() - 20);
        this.m_fastSpine.setAnimation(0, "animation", true);
        //get_room spine
        this.m_getRoomSpine = new sp.SkeletonAnimation("res/ui/spine/yuezhang.json", "res/ui/spine/yuezhang.atlas");
        get_room.getParent().addChild(this.m_getRoomSpine);
        this.m_getRoomSpine.setPosition(get_room.getPositionX() + 10, get_room.getPositionY() + 3);
        this.m_getRoomSpine.setAnimation(0, "animation", true);
        this.ation("res/ation_firstflush.json", this.first_flush);
        if (KKVS.RealName.Success) {
            prove_png.setVisible(false);
        }else {
            prove_png.setVisible(true);
            prove_png.runAction(cc.sequence(cc.delayTime(15), cc.callFunc(function() {
                prove_png.setVisible(false);
            })));
        }
        this.head_node.addTouchEventListener(function(sender, type){
            switch (type) {
                case ccui.Widget.TOUCH_ENDED:
                    playEffect();
                    if (!modulelobby.isScreenLocked()) {
                        self.goUserCenter();
                    }
                    break;
                default:
                    break;
            }
        });
        this.vip_node.addTouchEventListener(function(sender, type){
            switch (type) {
                case ccui.Widget.TOUCH_ENDED:
                    playEffect();
                    if (!modulelobby.isScreenLocked()) {
                        self.isSkipShop();
                    }
                    break;
                default:
                    break;
            }
        });
        prove.addClickEventListener(function (sender) {
            playEffect();
            if (!modulelobby.isScreenLocked()) {
                modulelobby.lockScreen(0.9);
                KKVS.Event.fire("Lobby_Hide");
                self.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function() {
                    modulelobby.pushScene(modulelobby.UserCenter, 1);
                })));
            }
        });
        gold_bg.addTouchEventListener(function(sender, type){
            switch (type) {
                case ccui.Widget.TOUCH_ENDED:
                    playEffect();
                    if (!modulelobby.isScreenLocked()) {
                        self.isSkipShop();
                    }
                    break;
                default:
                    break;
            }
        });
        acer_bg.addTouchEventListener(function(sender, type){
            switch (type) {
                case ccui.Widget.TOUCH_ENDED:
                    playEffect();
                    if (!modulelobby.isScreenLocked()) {
                        self.isSkipShop();
                    }
                    break;
                default:
                    break;
            }
        });
        get_red.addClickEventListener(function (sender) {
            playEffect();
            if (!modulelobby.isScreenLocked()) {
                modulelobby.lockScreen(0.6);
                (new modulelobby.RedpacketUI()).show();
            }
        });
        more.addClickEventListener(function (sender) {
            playEffect();
            btns.stopAllActions();
            var btns_visible = btns.isVisible();
            btns.setVisible(!btns_visible);
            if (!btns_visible) {
                sender.loadTextures("lobby/lobby_24.png", "", "", ccui.Widget.PLIST_TEXTURE);
                btns.runAction(cc.sequence(cc.delayTime(3.0), cc.callFunc(function() {
                    btns.setVisible(false);
                    sender.loadTextures("lobby/lobby_03.png", "", "", ccui.Widget.PLIST_TEXTURE);
                })));
            }else {
                sender.loadTextures("lobby/lobby_03.png", "", "", ccui.Widget.PLIST_TEXTURE);
            }
        });
        //notice_btn.addClickEventListener(function (sender) {
        //    sender.setTouchEnabled(false);
        //    sender.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function() {
        //        sender.setTouchEnabled(true);
        //    })));
        //    var dialog = new modulelobby.NoticeDialog();
        //    dialog.show(self);
        //    //self.showDialog({title : "公告", txt : "亲爱的玩家：\n    欢迎来到***游戏，本公司提供斗地主，牛牛，扎金花，麻将以及百家乐游戏。我们秉承着公平公正的经营理念，致力为您提供最优质的服务；如遇到游戏问题请联系在线客服，祝您游戏愉快！\n\n                官方网站：www.kkkuc.com", type : 0, halign : cc.TEXT_ALIGNMENT_LEFT});
        //});
        mail_btn.addClickEventListener(function (sender) {
            playEffect();
            if (!modulelobby.isScreenLocked()) {
                modulelobby.lockScreen(0.4);
                KKVS.Event.fire("Lobby_Hide");
                self.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function() {
                    modulelobby.pushScene(modulelobby.MailCenter);
                })));
            }
        });
        set_btn.addClickEventListener(function (sender) {
            playEffect();
            if (!modulelobby.isScreenLocked()) {
                modulelobby.lockScreen(0.6);
                (new modulelobby.SetDialog()).show();
            }
        });
        exit_btn.addClickEventListener(function (sender) {
            playEffect();
            if (!modulelobby.isScreenLocked()) {
                modulelobby.lockScreen(0.3);
                KKVS.Event.fire("ComSys_Switch_Go", -1);
            }
        });
        custom_btn.addClickEventListener(function (sender) {
            playEffect();
            if (!modulelobby.isScreenLocked()) {
                modulelobby.lockScreen(0.6);
                (new modulelobby.CallDialog()).show();
            }
        });
        //bank_btn.addClickEventListener(function (sender) {
        //    sender.setTouchEnabled(false);
        //    sender.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function() {
        //        sender.setTouchEnabled(true);
        //    })));
        //    //var dialog = new modulelobby.BankCenter();
        //    //dialog.show(self);
        //    modulelobby.pushScene(modulelobby.BankCenter);
        //});
        exchange_btn.addClickEventListener(function (sender) {
            playEffect();
            if (!modulelobby.isScreenLocked()) {
                modulelobby.lockScreen(0.6);
                var dialog = new modulelobby.WelfareCenter();
                dialog.show(self);
            }
        });
        recharge_btn.addClickEventListener(function (sender) {
            playEffect();
            if (!modulelobby.isScreenLocked()) {
                self.isSkipShop();
            }
        });
        get_room.addClickEventListener(function (sender) {
            playEffect();
            if (!self.m_gameDownloadOnly) {
                if (!modulelobby.isScreenLocked()) {
                    modulelobby.lockScreen(0.6);
                    (new modulelobby.ComSysWar()).show();
                }
            }else {
                (new modulelobby.TipDialog({txt : "目前有游戏正在下载，请稍后在进行约战！"})).show();
            }
        });
        fast_rase.addClickEventListener(function (sender) {
            sender.setTouchEnabled(false);
            sender.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function() {
                sender.setTouchEnabled(true);
            })));
            playEffect();
            KKVS.Event.fire("FastRase");
        });
        still_more.addClickEventListener(function (sender) {
            playEffect();
            (new modulelobby.TipDialog({txt : "敬请期待!"})).show();
        });
        this.first_flush.addClickEventListener(function (sender) {
            playEffect();
            if (!modulelobby.isScreenLocked()) {
                modulelobby.lockScreen(0.6);
                (new modulelobby.FirstFlush(false)).show();
            }
        });
        //comsys
        var componentFile = (typeof cc.channelcode == 'number') ? ("res/config/component_" + cc.channelcode.toString() + ".json") : "res/config/component.json";
        var comsys = new ComSys(componentFile, modulelobby.network);
        //comsys.setPosition(centerPosX, centerPosY);
        comsys_node.addChild(comsys);
        //notice
        var noticebar = new modulelobby.NoticeBar();
        noticebar.setPosition(centerPosX, centerPosY + 375);
        bg.addChild(noticebar);

        //entry into the hall
        (new modulelobby.RankingList()).show(this.rank_node);
        if (isVisitorLogin()) {
            //var addMoney = KKVS.serverConfigData['升级赠送']['StatusValue'];
            //this.showDialog({title : "系统提示", txt : "亲爱的玩家：\n    您可以使用游客帐号体验游戏，但无法兑换，赶快升级成为正式帐号吧，正式帐号另赠送" + addMoney.toString() + "元。", type : 2, halign : cc.TEXT_ALIGNMENT_LEFT, cb : this.goUserCenter, target: this});
            this.showDialog({title : "系统提示", txt : "亲爱的玩家：\n    您可以使用游客账号体验游戏, 为了更佳的游戏体验以及账号安全, 建议升级成正式账号。升级账号成功即送1元红包余额。", type : 2, halign : cc.TEXT_ALIGNMENT_LEFT, cb : this.goUserCenter, target: this});
        }
        this.onFirst_Flush();
        //(new modulelobby.Advertising()).show(this);
        //if (KKVS.CheckInData.can_check) {
        //    (new modulelobby.signUi()).show(this);
        //}

        return true;
    },
    gameDownloadOnly : function (bool) {
        this.m_gameDownloadOnly = bool;
    },
    isSkipShop : function () {
        modulelobby.lockScreen(1.0);
        if (KKVS.FirstFlushSign == 0) {
            (new modulelobby.FirstFlush(true)).show();
        }else if (KKVS.FirstFlushSign == 1) {
            this.skipRechargeCenter();
        }else if (KKVS.FirstFlushSign == -1) {
            this.showTipDialog("获取服务数据失败!");
        }
    },
    skipRechargeCenter : function (index) {
        KKVS.Event.fire("Lobby_Hide");
        this.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function() {
            if (typeof (index) == 'number') {
                modulelobby.pushScene(modulelobby.RechargeCenter, index);
            } else {
                modulelobby.pushScene(modulelobby.RechargeCenter);
            }
        })));
    },
    updateLobbyUI : function () {
        this.setUserInfo();
        KBEngine.app.player().req_box_record();
        KBEngine.app.player().req_sign_record();
        //KBEngine.app.player().req_turntable_record();
        KBEngine.app.player().req_prop_list();
        KBEngine.app.player().req_turntable_left_times();
        KBEngine.app.player().req_activity_info();
        KKVS.Event.fire("ComSys_AutoComponent");
    },
    LobbyHide : function () {
        this.bottombar.runAction(cc.moveTo(0.3, cc.p(960, -150)).easing(cc.easeSineOut()));
        this.topbar.runAction(cc.moveTo(0.3, cc.p(960, 1105)).easing(cc.easeSineOut()));
        this.rank_node.runAction(cc.moveTo(0.1, cc.p(-70, 0)).easing(cc.easeSineOut()));
    },
    LobbyShow : function () {
        this.bottombar.runAction(cc.moveTo(0.5, cc.p(960, 150)).easing(cc.easeElasticOut()));
        this.topbar.runAction(cc.moveTo(0.5, cc.p(960, 950)).easing(cc.easeElasticOut()));
        this.rank_node.runAction(cc.moveTo(0.5, cc.p(0, 0)).easing(cc.easeElasticOut()));
    },
    ation : function (data, view) {
        var n_data = ccs.load(data);
        var body = n_data.node.getChildByName("body");
        view.addChild(n_data.node);
        var rootAction = n_data.action;
        n_data.node.runAction(rootAction);
        rootAction.play("show", true);

        var view_size = view.getContentSize();
        body.setPosition(cc.p(view_size.width * 0.5, view_size.height * 0.5));
    },
    on_player_get_prop : function (data) {
        //for (var i = 0, data_len = data.length; i < data_len; ++i) {
        //    this.m_getredlist.push(data[i]);
        //}
        //logObj(data);
        this.get_red_list.stopAllActions();
        var self = this;
        this.m_getredlist.push(data);
        this.get_red_list.runAction(cc.repeatForever(cc.sequence(cc.delayTime(0.34), cc.callFunc(function(sender){
            var len = self.m_getredlist.length;
            if (len <= 0) {
                self.m_getredlist = [];
                self.get_red_list.stopAllActions();
                return;
            }
            var list = self.get_red_list.clone();
            var text_1 = list.getChildByName("text_1");
            text_1.ignoreContentAdaptWithSize(true);
            var text_4 = list.getChildByName("text_4");
            text_1.ignoreContentAdaptWithSize(true);
            text_1.setString(InterceptDiyStr(encryptMoblieNumber(self.m_getredlist[0].name), 5));
            text_4.setString(getRedPacketTxt(self.m_getredlist[0].prop_num));
            list.setPosition(1650, 67.6);
            self.topbar.addChild(list);
            self.m_getredlist.shift();
            list.runAction(cc.sequence(cc.spawn(cc.moveBy(1.0, cc.p(0, 71.5)), cc.fadeTo(1.0, 10)),cc.callFunc(function(sender){
                sender.removeFromParent();
            })));
        }))));
    },
    //on_login_finish : function () {
    //    KKVS.Event.fire("ComSys_AutoComponent");
    //},

    // sunzw add new sys :roomCard mode 
    create_room_success:function(data){
        modulelobby.showLoading(null, null, 10);
        this.room_id = data.room_id;
        this.pwd = data.pwd;
        var self = this;
        this.runAction(cc.sequence(cc.delayTime(1), cc.callFunc(function() {
            KBEngine.app.player().joinGameRoom(self.room_id,self.pwd);
        })));
    },

    onEnter : function () {
        this._super();
        KKVS.Event.register("on_lobby_msg", this, "on_lobby_msg");
        KKVS.Event.register("on_player_msg", this, "on_player_msg");
        KKVS.Event.register("ComSys_Return", this, "exitLobby");
        KKVS.Event.register("refreshMyScore", this, "onGold");
        KKVS.Event.register("rankingList", this, "rankingList");
        KKVS.Event.register("on_player_get_prop", this, "on_player_get_prop");
        KKVS.Event.register("updateLobbyUI", this, "updateLobbyUI");//断线重连数据刷新
        //KKVS.Event.register("on_login_finish", this, "on_login_finish");
        KKVS.Event.register("Lobby_Hide", this, "LobbyHide");
        KKVS.Event.register("Lobby_Show", this, "LobbyShow");
        KKVS.Event.register("Skip_Recharge_Center", this, "skipRechargeCenter");
        KKVS.Event.register("Skip_User_Center", this, "goUserCenter");
        KKVS.Event.register("FirstFlushSuccessVanish", this, "onFirst_Flush");
        KKVS.Event.register("ComSys_GameDownloadOnly", this, "gameDownloadOnly");
        // 创建房间成功
        KKVS.Event.register("create_room_success", this, "create_room_success");

        cc.spriteFrameCache.addSpriteFrames("res/ui/lobby/lobby_0.plist", "res/ui/lobby/lobby_0.png");
        cc.spriteFrameCache.addSpriteFrames("res/ui/lobby/vip.plist", "res/ui/lobby/vip.png");
        this.onGold();
        //mail refresh
        this.mail_txt.runAction(cc.repeatForever(cc.sequence(cc.callFunc(function (sender) {
            if (!KBEngine.app || !KBEngine.app.player()) {
                return;
            }
            var params = {};
            var datas = JSON.stringify(params);
            this.opt_obj = {type : PLAYER_MSG_ID_MAIL_LIST};
            KBEngine.app.player().req_player_msg(PLAYER_MSG_ID_MAIL_LIST, datas);
        }, this), cc.delayTime(5))));
        //自动跳出领取低保框
        if ((parseInt(KKVS.KGOLD) + parseInt(KKVS.KGOLD_BANK)) < m_MinimumRelief && 0 < KKVS.BoxData.sub_count) {
            (new modulelobby.WelfareCenter()).show(this);
        }
        //reset background music
        resetAudioRes();
        playMusic();
    },

    onExit: function() {
        this.mail_txt.stopAllActions();
        KKVS.Event.deregister("on_lobby_msg", this);
        KKVS.Event.deregister("on_player_msg", this);
        KKVS.Event.deregister("ComSys_Return", this);
        KKVS.Event.deregister("refreshMyScore", this);
        KKVS.Event.deregister("rankingList", this);
        KKVS.Event.deregister("on_player_get_prop", this);
        KKVS.Event.deregister("updateLobbyUI", this);
        //KKVS.Event.deregister("on_login_finish", this);
        KKVS.Event.deregister("Lobby_Hide", this);
        KKVS.Event.deregister("Lobby_Show", this);
        KKVS.Event.deregister("Skip_Recharge_Center", this);
        KKVS.Event.deregister("Skip_User_Center", this);
        KKVS.Event.deregister("FirstFlushSuccessVanish", this);
        KKVS.Event.deregister("ComSys_GameDownloadOnly", this);

        KKVS.Event.deregister("create_room_success", this);

        if (cc.sys.isNative) {
            var fileNamePlist = [
                "res/ui/comsys/com_4",
                "res/ui/comsys/com_6",
                "res/ui/comsys/com_7",
                "res/ui/comsys/com_8",
                "res/ui/comsys/com_9",
                "res/ui/comsys/com_10",
                "res/ui/comsys/com_12",
                "res/ui/comsys/com_13",
                "res/ui/comsys/game_0",
                "res/ui/comsys/game_1",
                "res/ui/comsys/game_2",
                "res/ui/currency/currency_0",
                "res/ui/currency/currency_1",
                "res/ui/function/extension_0",
                "res/ui/function/firstflush_0",
                "res/ui/function/popup_0",
                "res/ui/function/popup_1",
                "res/ui/function/red_0",
                "res/ui/function/shop_0",
                "res/ui/landing/landing_0",
                "res/ui/landing/landing_1",
                "res/ui/lobby/lobby_0",
                // "res/ui/lobby/vip",
                "res/ui/animation/red/red_1",
                "res/ui/animation/red/red_2"
            ];
            var S_ImageName = [
                "res/ui/artnum/270x41.png",
                "res/ui/artnum/312x33_shop.png",
                "res/ui/artnum/336x32_rank.png",
                "res/ui/artnum/384x42_game.png",
                "res/ui/artnum/384x42_shop.png",
                "res/ui/artnum/432x47_dow.png",
                "res/ui/icon/qrcode.png",
                "res/ui/icon/gold.png",
                "res/ui/icon/acer.png",
                "res/ui/icon/face_1.png",
                "res/ui/icon/face_1_m.png",
                "res/ui/icon/face_2.png",
                "res/ui/icon/face_2_m.png",
                "res/ui/icon/face_3.png",
                "res/ui/icon/face_3_m.png",
                "res/ui/icon/face_4.png",
                "res/ui/icon/face_4_m.png",
                "res/ui/icon/face_5.png",
                "res/ui/icon/face_5_m.png",
                "res/ui/icon/face_6.png",
                "res/ui/icon/face_6_m.png",
                "res/ui/icon/face_7.png",
                "res/ui/icon/face_7_m.png",
                "res/ui/icon/face_8.png",
                "res/ui/icon/face_8_m.png",
                "res/ui/icon/face_9.png",
                "res/ui/icon/face_9_m.png",
                "res/ui/icon/face_10.png",
                "res/ui/icon/face_10_m.png",
                "res/ui/icon/face_mask.png",
                "res/ui/icon/face_border.png",
                "res/ui/company_logo.jpg",
                "res/ui/green_bulletin.png",
                "res/ui/loading.jpg",
                "res/ui/bg.jpg",
                "res/ui/loading_t.png",
                "res/ui/loading_tbg.png",
                "res/ui/comsys/arrow.png",
                "res/ui/comsys/game_match_00.png",
                "res/ui/comsys/war_04.png",
                "res/ui/function/turntable_05.png",
                "res/ui/function/limitopen_05.png",
                "res/ui/function/red_00.png",
                "res/ui/loading_xz.png",
                "res/ui/scrollbar.png",
                "res/ui/animation/red/red_10_01.png",
                "res/ui/animation/red/red_11_01.png",
                "res/ui/animation/red/red_12_01.png"
            ];
            for(var i = 0 ; i < fileNamePlist.length ; ++i){
                var name = fileNamePlist[i];
                cc.spriteFrameCache.removeSpriteFramesFromFile(name + ".plist");
                var i_texture = cc.textureCache.getTextureForKey(name + ".png");
                if(i_texture){
                    cc.log("remove name is = " + name);
                    cc.textureCache.removeTexture(i_texture);
                } else{
                    cc.log("can not remove name is = " + name);
                }
            }
            cc.log("remove texture");
            for(var n = 0 ; n < S_ImageName.length ; ++n){
                var n_texture = cc.textureCache.getTextureForKey(S_ImageName[n]);
                if(n_texture){
                    cc.log("remove textureName is = " + S_ImageName[n]);
                    cc.textureCache.removeTexture(n_texture);
                } else{
                    cc.log("can not remove textureName is = " + S_ImageName[n]);
                }
            }
            cc.spriteFrameCache.removeUnusedSpriteFrames();
            cc.textureCache.removeUnusedTextures();
            cc.sys.garbageCollect();
        }
        this._super();
    },
    exitLobby : function () {
        //var cbFunc = null;
        //if (cc.sys.os == cc.sys.OS_ANDROID && cc.sys.isNative) {
        //    cbFunc = function(){
        //        //UMengAgentMain.end(); //um
        //        cc.director.end();
        //    }
        //} else {
        //    cbFunc = function(){
        //        modulelobby.runScene(modulelobby.Login);
        //    }
        //}
        //modulelobby.showTxtDialog({title : "系统提示",txt : "退出荆都麻将？", type : 2, cb : cbFunc});
        //2018-03-28需求
        var cbFunc = function(){
            modulelobby.rootScene(modulelobby.Login);
        };
        modulelobby.showTxtDialog({title : "系统提示",txt : "是否切换账号？", type : 2, cb : cbFunc});
    },
    on_lobby_msg : function (cmd, params) {
        if (cmd == LOBBY_MSG_UPDATE_HORN) {
            //重置滚动公告消息,游戏当中才有,必须在每个游戏中进行修改
        } else if (cmd == LOBBY_MSG_NOTICE) {
            //公告
        } else if (cmd == LOBBY_MSG_FEEDBACK) {
            //反馈
            this.showTipDialog("数据提交成功!");
        } else if (cmd == LOBBY_MSG_PLAYER_OFFLINE_RECONNECT) {
            //KKVS.Event.fire("ComSys_RestartComponent", params);
        }
    },
    on_player_msg : function (cmd, params) {
        if (cmd == PLAYER_MSG_ID_UPDATE_PLAYER_INFO) {
            this.setUserInfo();
        } else if (this.opt_obj && this.opt_obj.type == cmd) {
            if (cmd == PLAYER_MSG_ID_MAIL_LIST) {
                this.updateMails(params);
            }
            this.opt_obj = null;
        }
    },
    updateMails : function (datas) {
        var mail_data = datas;
        if (!(mail_data instanceof Array)) {
            mail_data = [];
        }
        var mailUnReadCnt = 0;
        var len = mail_data.length;
        for (var i = 0; i < len; ++i) {
            if (typeof (mail_data[i].status) == 'number' && mail_data[i].status == 0) {
                mailUnReadCnt++;
            }
        }
        if (mailUnReadCnt == 0) {
            this.mail_reddot.setVisible(false);
        } else {
            var str_cnt = mailUnReadCnt < 100 ? mailUnReadCnt.toString() : "...";
            this.mail_txt.setString(str_cnt);
            this.mail_reddot.setVisible(true);
        }
        KKVS.Event.fire("MailCenter_Update", mail_data);
    },
    showDialog : function (data, cvisible) {
        var dialog = new modulelobby.TxtDialog(data);
        if (cvisible) {
            dialog.addCloseButton();
        }
        dialog.show(this);
    },
    showTipDialog : function (args) {
        var dialog = new modulelobby.TipDialog({txt : args});
        dialog.show(this);
    },
    goUserCenter : function () {
        modulelobby.lockScreen(0.9);
        KKVS.Event.fire("Lobby_Hide");
        this.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function() {
            modulelobby.pushScene(modulelobby.UserCenter);
        })));
    },
    onGold : function () {
        this.userinfo.gold.setString(getGoldTxt(KKVS.KGOLD));
        this.userinfo.acer.setString(getGoldTxt(KKVS.KBAO));
        this.vip_node.loadTexture("vip/v" + KKVS.VIP.toString() +".png", ccui.Widget.PLIST_TEXTURE);
    },
    onFirst_Flush : function () {
        if (KKVS.FirstFlushSign == 0) {
            this.first_flush.setVisible(true);
        }else if (KKVS.FirstFlushSign == 1){
            this.first_flush.setVisible(false);
        }
    },
    setUserInfo : function () {
        cc.log("KKVS.GUID=" + KKVS.GUID);
        this.onGold();
        this.userinfo.id.setString(InterceptDiyStr(KKVS.NICKNAME, 5));
        //this.userinfo.head.setSpriteFrame(getGenderHead());
        this.userinfo.head.setTexture(getFace().png);
    }
});