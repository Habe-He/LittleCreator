modulelobby.WelfareCenter = modulelobby.DialogView.extend({
    ctor: function(){
        this._super();
        var json = ccs.load("res/welfare_center.json");
        var visibleSize = cc.director.getVisibleSize();
        var origin = cc.director.getVisibleOrigin();
        json.node.x = origin.x + visibleSize.width / 2 - json.node.getContentSize().width / 2;
        json.node.y = origin.y + visibleSize.height / 2 - json.node.getContentSize().height / 2;
        this.addChild(json.node);
        var self = this;
        this.reward_lable = null;//救济金剩余次数
        this.m_reward_num = 2;//救济金总次数
        this._layer = json.node.getChildByName("back");
        this.m_bg = json.node.getChildByName("m_bg");
        var btnClose = this.m_bg.getChildByName("close_btn");
        btnClose.addClickEventListener(function (sender) {
            sender.setTouchEnabled(false);
            sender.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function() {
                sender.setTouchEnabled(true);
            })));
            playEffect();
            self.close();
        });
        if (KKVS.BoxData == null) {
            KBEngine.app.player().req_box_record();
        } else {
            this.on_box_record();
        }
        var how_much = [
            {icon:"function/promotion_04.png", titleText:"function/promotion_07.png", contentText:"百万金币签到送，每天可参加一次", tag: 0},
            {icon:"function/promotion_05.png", titleText:"function/promotion_08.png", contentText:"金币低于4000，可免费领取救济金，每天2次", tag: 1},
            {icon:"function/promotion_06.png", titleText:"function/promotion_09.png", contentText:"幸运红包等你抽，每日登录即可免费抽奖!", tag: 2},
            {icon:"function/promotion_14.png", titleText:"function/limitopen_03.png", contentText:"暂无", tag: 3}
        ];
        //对局累计送豪礼活动开启
        if (KKVS.LimitOpen) {
            how_much[3].contentText = "限时开启:" + KKVS.LimitOpen.start_time.toString() + " 到 " + KKVS.LimitOpen.end_time.toString();
        }
        if (KKVS.LimitOpen && KKVS.LimitOpen.status == 0) {
            how_much.splice(3,1);
        }
        var view = this.m_bg.getChildByName("view");
        var item_model = view.getItem(0);
        view.setItemModel(item_model);
        view.removeItem(0);
        this.btnType = [];
        for (var i = 0, len = how_much.length; i < len; ++i) {
            view.pushBackDefaultItem();
            var item = view.getItem(view.getItems().length - 1);
            var cloneNode = item.getChildByName("cloneNode");
            var png_6 = cloneNode.getChildByName("png_6");
            png_6.ignoreContentAdaptWithSize(true);
            png_6.loadTexture(how_much[i].icon , 1);
            var png_7 = cloneNode.getChildByName("png_7");
            png_7.ignoreContentAdaptWithSize(true);
            png_7.loadTexture(how_much[i].titleText , 1);
            var login_lable = cloneNode.getChildByName("login_lable");
            login_lable.ignoreContentAdaptWithSize(true);
            //if (!cc.sys.isNative) {
            //    //H5版本clone()引起的问题(不够全面,克隆之后描边不见了)
            //    login_lable.enableOutline(cc.color(89, 54, 131), 3);
            //}
            login_lable.setString(how_much[i].contentText);
            this.btnType.push(cloneNode.getChildByName("btnType"));
            this.btnType[i].icon = this.btnType[i].getChildByName("icon");
            var lable = this.btnType[i].getChildByName("lable");
            lable.ignoreContentAdaptWithSize(true);
            lable.setVisible(false);
            if (how_much[i].tag == 0) {
                this.btnType[i].icon.setPositionY( 70 );
                if(KKVS.CheckInData.can_check){//有可操作
                    //btn.setEnabled(true);
                    this.btnType[i].loadTextures( "currency/currency_07.png" , "" , "" , 1 );
                    this.btnType[i].icon.loadTexture( "function/promotion_03.png" , 1 );
                }else{//没有操作了
                    //btn.setEnabled(false);
                    this.btnType[i].loadTextures( "currency/currency_21.png" , "" , "" , 1 );
                    this.btnType[i].icon.loadTexture( "function/promotion_12.png" , 1 );
                }
            } else if (how_much[i].tag == 1) {
                this.btnType[i].icon.setPositionY( 75 );
                lable.setVisible(true);
                this.reward_lable = lable;
                if( KKVS.BoxData.sub_count <= 0 ){  //没有次数了
                    this.btnType[i].loadTextures( "currency/currency_21.png" , "" , "" , 1 );
                    this.reward_lable.setString( "0"+"/"+this.m_reward_num.toString() );
                    this.btnType[i].icon.loadTexture( "function/promotion_13.png" , 1 );
                }else{
                    cc.log( "(parseInt(KKVS.KGOLD) + parseInt(KKVS.KGOLD_BANK)   " + (parseInt(KKVS.KGOLD) + parseInt(KKVS.KGOLD_BANK) ) );
                    cc.log( "KKVS.BoxData.sub_count   " + KKVS.BoxData.sub_count );
                    if( (parseInt(KKVS.KGOLD) + parseInt(KKVS.KGOLD_BANK) ) < m_MinimumRelief ){
                        this.btnType[i].loadTextures( "currency/currency_08.png" , "" , "" , 1 );
                        this.btnType[i].icon.loadTexture( "function/promotion_10.png" , 1 );
                    }else{
                        this.btnType[i].loadTextures( "currency/currency_21.png" , "" , "" , 1 );
                        this.btnType[i].icon.loadTexture( "function/promotion_13.png" , 1 );
                    }
                    this.reward_lable.setString(KKVS.BoxData.sub_count.toString()+"/"+this.m_reward_num.toString());
                }
            } else if (how_much[i].tag == 2) {
                this.btnType[i].icon.setPositionY( 70 );
                this.btnType[i].loadTextures( "currency/currency_07.png" , "" , "" , 1 );
                this.btnType[i].icon.loadTexture( "function/promotion_03.png" , 1 );
            }else if (how_much[i].tag == 3) {
                this.btnType[i].icon.setPositionY( 70 );
                //if( 0 < KKVS.TurntableData ){
                this.btnType[i].loadTextures( "currency/currency_07.png" , "" , "" , 1 );
                this.btnType[i].icon.loadTexture( "function/promotion_03.png" , 1 );
            }
            //点击
            this.btnType[i].setTag(i);
            this.btnType[i].addClickEventListener(function (sender) {
                sender.setTouchEnabled(false);
                sender.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function () {
                    sender.setTouchEnabled(true);
                })));
                playEffect();
                if (how_much[sender.getTag()].tag == 0) {
                    (new modulelobby.signUi()).show();
                    self.close();
                }else if (how_much[sender.getTag()].tag == 1) {
                    if (( m_MinimumRelief <= parseInt(KKVS.KGOLD) + parseInt(KKVS.KGOLD_BANK) )) {
                        (new modulelobby.TipDialog({txt: "不满足领取救济金的最低标准哦!"})).show();
                    } else {
                        KBEngine.app.player().req_box(KKVS.BoxData.sub_count);
                    }
                }else if (how_much[sender.getTag()].tag == 2) {
                    (new modulelobby.Turntable()).show();
                    self.close();
                }else if (how_much[sender.getTag()].tag == 3) {
                    (new modulelobby.LimitOpen()).show();
                    self.close();
                }
            });
        }

        return true;
    },
    on_box_record: function() {
        //player
    },
    on_box_result: function( prizes_id ) {
        KKVS.BoxData.sub_count = parseInt( KKVS.BoxData.sub_count - 1 );
        if( KKVS.BoxData.sub_count < 0 ){
            KKVS.BoxData.sub_count = 0;
        }
        if (this.reward_lable) {
            this.reward_lable.setString(KKVS.BoxData.sub_count.toString()+"/"+this.m_reward_num.toString());
        }
        var dialog = new modulelobby.Prizes(m_rFund[prizes_id].value, 0);
        dialog.show();
    },
    on_sign_record : function (args) {
        //签到
        if (this.btnType[0]) {
            this.btnType[0].icon.setPositionY( 70 );
            if(KKVS.CheckInData.can_check){	// 有可操作
                this.btnType[0].loadTextures( "currency/currency_07.png" , "" , "" , 1 );
                this.btnType[0].icon.loadTexture( "function/promotion_03.png" , 1 );
            }else{	//没有操作了
                this.btnType[0].loadTextures( "currency/currency_21.png" , "" , "" , 1 );
                this.btnType[0].icon.loadTexture( "function/promotion_12.png" , 1 );
            }
        }
        //救济金
        if (this.btnType[1]) {
            this.btnType[1].icon.setPositionY( 75 );
            if( KKVS.BoxData.sub_count <= 0 ){  //没有次数了
                this.btnType[1].loadTextures( "currency/currency_21.png" , "" , "" , 1 );
                this.reward_lable.setString( "0"+"/"+this.m_reward_num.toString() );
                this.btnType[1].icon.loadTexture( "function/promotion_13.png" , 1 );
            }else{
                if( (parseInt(KKVS.KGOLD) + parseInt(KKVS.KGOLD_BANK) ) < m_MinimumRelief ){
                    this.btnType[1].loadTextures( "currency/currency_08.png" , "" , "" , 1 );
                    this.btnType[1].icon.loadTexture( "function/promotion_10.png" , 1 );
                }else{
                    this.btnType[1].loadTextures( "currency/currency_21.png" , "" , "" , 1 );
                    this.btnType[1].icon.loadTexture( "function/promotion_13.png" , 1 );
                }
                this.reward_lable.setString(KKVS.BoxData.sub_count.toString()+"/"+this.m_reward_num.toString());
            }
        }
    },
    getBody : function () {
        return this.m_bg;
    },
    getLayer : function () {
        return this._layer;
    },
    onEnter: function() {
        this._super();
        KKVS.Event.register("on_box_result", this, "on_box_result");
        KKVS.Event.register("refreshMyScore", this, "on_sign_record");
        KKVS.Event.register("on_sign_record", this, "on_sign_record");//断线重连数据刷新
        KKVS.Event.register("on_box_record", this, "on_box_record");
        cc.spriteFrameCache.addSpriteFrames("res/ui/currency/currency_1.plist", "res/ui/currency/currency_1.png");
        cc.spriteFrameCache.addSpriteFrames("res/ui/function/popup_0.plist", "res/ui/function/popup_0.png");
    },
    onExit: function() {
        this._super();
        KKVS.Event.deregister("on_box_result", this);
        KKVS.Event.deregister("refreshMyScore", this);
        KKVS.Event.deregister("on_sign_record", this);
        KKVS.Event.deregister("on_box_record", this);
    }
});

//***************************************签到****************************************
modulelobby.signUi = modulelobby.DialogView.extend({
    ctor: function () {
        this._super();
        var json = ccs.load("res/sign_ui.json");
        var visibleSize = cc.director.getVisibleSize();
        var origin = cc.director.getVisibleOrigin();
        json.node.x = origin.x + visibleSize.width / 2 - json.node.getContentSize().width / 2;
        json.node.y = origin.y + visibleSize.height / 2 - json.node.getContentSize().height / 2;
        this.addChild(json.node);
        var self = this;
        this._layer = json.node.getChildByName("back");
        this.m_bg = json.node.getChildByName("body");
        this.m_btnSign = this.m_bg.getChildByName("btn");
        this.m_btnSign.addClickEventListener(function(sender){
            sender.setTouchEnabled(false);
            sender.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function() {
                sender.setTouchEnabled(true);
            })));
            if(KKVS.CheckInData.can_check){
                self.m_pWaitBg.setVisible(true);
                var seq = cc.sequence(cc.rotateBy(2, 360));
                self.m_pWait.runAction(cc.repeatForever(seq));
                self.m_pWaitBg.runAction(cc.sequence(cc.delayTime(10), cc.callFunc(function() {
                    self.m_pWait.stopAllActions();
                    self.m_pWaitBg.setVisible(false);
                    (new modulelobby.TxtDialog({title : "系统提示", txt : "签到请求超时，请检查网络"})).show();
                }, self)));
                KBEngine.app.player().req_sign();
            }else{
                (new modulelobby.TipDialog({txt : "已经签过了，请下次再来吧"})).show();
            }
        });
        this.m_btnSign.png = this.m_btnSign.getChildByName("png");
        var close_btn = this.m_bg.getChildByName("close_btn");
        close_btn.addClickEventListener(function(sender){
            sender.setTouchEnabled(false);
            playEffect();
            self.close();
        });
        //var png = this.m_bg.getChildByName("png");
        this.test = this.m_bg.getChildByName("test");
        this.test.ignoreContentAdaptWithSize(true);
        this.test.setString("累计签到:" + (KKVS.CheckInData.days).toString() + "天");
        this.m_pWaitBg = this.m_bg.getChildByName("waitbg");
        this.m_pWait = this.m_pWaitBg.getChildByName("wait");
        this.m_itemList = [];
        //this.m_body = null;
        for (var i = 0; i < 7; ++i) {
            this.m_itemList[i] = this.m_bg.getChildByName("oneday_" + i.toString());
            var png_2 = this.m_itemList[i].getChildByName("png_2");
            if (m_sSign[i].type == 0) {
                png_2.setSpriteFrame("function/shop_20.png");
                //}else if (m_sSign[i].type == 1){
                //    png_2.setSpriteFrame("function/shop_20.png");
            }else if (m_sSign[i].type == 2) {
                png_2.setSpriteFrame("function/shop_22.png");
            }
            var text = this.m_itemList[i].getChildByName("text");
            text.ignoreContentAdaptWithSize(true);
            text.setString(m_sSign[i].name);
        }
        this.m_pWaitBg.runAction(cc.sequence(cc.delayTime(10), cc.callFunc(function() {
            self.m_pWait.stopAllActions();
            self.m_pWaitBg.setVisible(false);
            (new modulelobby.TxtDialog({title : "系统提示", txt : "获取签到数据失败"})).show();
        }, self)));
        if (KKVS.CheckInData == null) {
            KBEngine.app.player().req_sign_record();
        } else {
            self.on_sign_record({days:KKVS.CheckInData.days , can_check: KKVS.CheckInData.can_check});
        }
        //this.ation("res/ation_red.json", png, false);
    },
    //ation : function (data, view, _type) {
    //    var n_data = ccs.load(data);
    //    var body = n_data.node.getChildByName("body");
    //    view.addChild(n_data.node);
    //    var rootAction = n_data.action;
    //    n_data.node.runAction(rootAction);
    //    rootAction.play("show", true);
    //
    //    var view_size = view.getContentSize();
    //    body.setPosition(cc.p(view_size.width * 0.5, view_size.height * 0.5));
    //    if (_type) {
    //        this.m_body = n_data.node;
    //    }
    //},
    can_play : function (data) {
        var _data = [0, 1, 2, 4, 6, 13, 29];
        var many = -1;
        for (var i = 0, len = _data.length; i < len; ++i) {
            if (data == _data[i]) {
                many = i;
                return many;
            }
        }
        return many;
    },
    how_many : function (data) {
        if (data == 0) {
            return 0;
        }else if (data == 1) {
            return 1;
        }else if (data == 2) {
            return 2;
        }else if (2 < data && data <= 4) {
            return 3;
        }else if (4 < data && data <= 6) {
            return 4;
        }else if (6 < data && data <= 13) {
            return 5;
        }else if (13 < data && data <= 29) {
            return 6;
        }
    },
    on_sign_record: function(args) {
        var self = this;
        this.m_pWait.stopAllActions();
        this.m_pWaitBg.stopAllActions();
        this.m_pWaitBg.setVisible(false);
        KKVS.INFO_MSG("days = " + args.days + ", can_check = " + args.can_check);

        if (KKVS.CheckInData.can_check) {
            //var _play = this.can_play(args.days);
            //if (!this.m_body && _play != -1) {
            //    this.ation("res/ation_sign.json", this.m_itemList[_play], true);
            //}
            //if (!this.m_body) {
            //    this.ation("res/ation_sign.json", this.m_itemList[KKVS.CheckInData.days], true);
            //}
            this.m_btnSign.loadTextures("currency/currency_07.png", "", "", 1);
            this.m_btnSign.setEnabled(true);
            this.m_btnSign.png.setSpriteFrame("function/sign_03.png");
        }else {
            //if (this.m_body) {
            //    this.m_body.removeFromParent();
            //}
            this.m_btnSign.loadTextures("currency/currency_21.png", "", "", 1);
            this.m_btnSign.setEnabled(false);
            this.m_btnSign.png.setSpriteFrame("function/sign_04.png");
        }
        var how_many = this.how_many(args.days);
        for (var n = 0; n < 7; ++n) {
            var dayCheck = this.m_itemList[n];
            var png_3 = dayCheck.getChildByName("png_3");
            png_3.setVisible(false);
            dayCheck.setTag(n);
            if (how_many == 0) {
                if (n == 0) {
                    this.m_pCanCheckBtn = dayCheck;
                    //dayCheck.addTouchEventListener(function(sender, type){
                    //    switch (type) {
                    //        case ccui.Widget.TOUCH_ENDED: {
                    //            self.checkIn(sender);
                    //            break;
                    //        }
                    //    }
                    //});
                }
            }else {
                if (args.can_check && how_many == n) {     //可以签到到的
                    this.m_pCanCheckBtn = dayCheck;
                    //dayCheck.addTouchEventListener(function(sender, type){
                    //    switch (type) {
                    //        case ccui.Widget.TOUCH_ENDED: {
                    //            self.checkIn(sender);
                    //            break;
                    //        }
                    //    }
                    //});
                }else if( how_many >= n + 1 ){
                    png_3.setVisible( true );
                }
            }
        }
    },
    on_sign_result: function(bSuccess) {
        KKVS.INFO_MSG("bSuccess = " + bSuccess);
        if (this.m_pCanCheckBtn !== null && bSuccess) {
            var _type = this.can_play(KKVS.CheckInData.days);
            //var _type = KKVS.CheckInData.days;
            KKVS.CheckInData.days = KKVS.CheckInData.days + 1;
            KKVS.CheckInData.can_check = false;
            this.m_pWaitBg.setVisible(false);
            this.m_pWait.stopAllActions();
            this.m_pWaitBg.stopAllActions();
            //if (this.m_body) {
            //    this.m_body.removeFromParent();
            //}
            this.m_btnSign.loadTextures("currency/currency_21.png", "", "", 1);
            this.m_btnSign.setEnabled(false);
            this.m_btnSign.png.setSpriteFrame("function/sign_04.png");
            if (_type == -1) {
                (new modulelobby.TipDialog({txt : "签到成功"})).show();
            }else {
                var png_3 = this.m_pCanCheckBtn.getChildByName("png_3");
                png_3.setVisible(true);
                (new modulelobby.Prizes(m_sSign[_type].value, _type)).show();
            }
            this.test.setString("累计签到:" + (KKVS.CheckInData.days).toString() + "天");
            //um
            var bonus = parseFloat(m_sSign[_type].value);
            UMengAgentMain.bonus(bonus, 2);
        }else {
            this.m_pWaitBg.setVisible(false);
            this.m_pWait.stopAllActions();
            this.m_pWaitBg.stopAllActions();
            (new modulelobby.TipDialog({txt : "已经签过了，请下次再来吧"})).show();
        }
    },
    getBody : function () {
        return this.m_bg;
    },
    getLayer : function () {
        return this._layer;
    },
    onEnter : function () {
        this._super();
        KKVS.Event.register("on_sign_record", this, "on_sign_record");
        KKVS.Event.register("on_sign_result", this, "on_sign_result");
        cc.spriteFrameCache.addSpriteFrames("res/ui/currency/currency_1.plist", "res/ui/currency/currency_1.png");
        cc.spriteFrameCache.addSpriteFrames("res/ui/function/shop_0.plist", "res/ui/function/shop_0.png");
        cc.spriteFrameCache.addSpriteFrames("res/ui/function/popup_1.plist", "res/ui/function/popup_1.png");
    },
    onExit: function() {
        KKVS.Event.deregister("on_sign_record", this);
        KKVS.Event.deregister("on_sign_result", this);
        this._super();
    }
});

//**********************************奖励框*****************************************
modulelobby.Prizes = modulelobby.DialogView.extend({
    ctor : function (text, _type) {
        this._super();
        var json = ccs.load("res/prizes.json");
        var visibleSize = cc.director.getVisibleSize();
        var origin = cc.director.getVisibleOrigin();
        json.node.x = origin.x + visibleSize.width / 2 - json.node.getContentSize().width / 2;
        json.node.y = origin.y + visibleSize.height / 2 - json.node.getContentSize().height / 2;
        this.addChild(json.node);
        var rootNode = json.node;
        var rootAction = json.action;
        rootNode.runAction(rootAction);
        rootAction.play("show", false);
        var self = this;
        var msg_txt = rootNode.getChildByName("msg_txt");
        msg_txt.ignoreContentAdaptWithSize(true);
        msg_txt.setString(text);
        var image = rootNode.getChildByName("image");

        if (m_sSign[_type].type == 0) {
            image.loadTexture("function/shop_20.png", ccui.Widget.PLIST_TEXTURE);
        //}else if (m_sSign[_type].type == 1){
        //    image.loadTexture("function/shop_20.png", ccui.Widget.PLIST_TEXTURE);
        }else if (m_sSign[_type].type == 2) {
            image.loadTexture("function/shop_22.png", ccui.Widget.PLIST_TEXTURE);
        }
        rootNode.runAction(cc.sequence(cc.delayTime(2.0), cc.callFunc(function() {
            self.close();
        })));

        return true;
    },
    onEnter : function () {
        this._super();
        cc.spriteFrameCache.addSpriteFrames("res/ui/function/shop_0.plist", "res/ui/function/shop_0.png");
    }
});




//**********************************转盘************************************
modulelobby.Turntable = modulelobby.DialogView.extend({
    ctor: function () {
        this._super();

        var json = ccs.load("res/turntable.json");
        var visibleSize = cc.director.getVisibleSize();
        var origin = cc.director.getVisibleOrigin();
        json.node.x = origin.x + visibleSize.width / 2 - json.node.getContentSize().width / 2;
        json.node.y = origin.y + visibleSize.height / 2 - json.node.getContentSize().height / 2;
        this.addChild(json.node,1);
        var self = this;
        this._layer = json.node.getChildByName("body");
        var back = json.node.getChildByName("back");
        this.back = back;
        this.png = back.getChildByName("png");
        this.task = [];
        for (var i = 0; i < 4; ++i) {
            this.task[i] = back.getChildByName("task_" + i.toString());
            this.task[i].text_2 = this.task[i].getChildByName("text_2");
            this.task[i].text_2.ignoreContentAdaptWithSize(true);
            this.task[i].text_4 = this.task[i].getChildByName("text_4");
            this.task[i].text_4.ignoreContentAdaptWithSize(true);
        }
        var cloos_btn = back.getChildByName("cloos_btn");
        cloos_btn.addClickEventListener(function(sender) {
            sender.setTouchEnabled(false);
            playEffect();
            self.close();
        });
        var go_bg = back.getChildByName("go_bg");
        this.take = go_bg.getChildByName("take");
        this.take_test = this.take.getChildByName("take_test");
        this.take_test.ignoreContentAdaptWithSize(true);
        this.take.addClickEventListener(function(sender){
            sender.setTouchEnabled(false);
            sender.runAction(cc.sequence(cc.delayTime(10), cc.callFunc(function() {
                sender.setTouchEnabled(true);
                sender.setBright(true);
                (new modulelobby.TxtDialog({title : "系统提示", txt : "转盘请求超时，请检查网络"})).show();
            })));
            playEffect();
            KBEngine.app.player().req_turntable_new();//转动转盘
        });
        KBEngine.app.player().req_turntable_left_times();

        return true;
    },
    on_turntable_new : function (data) {
        var self = this;
        var _data = data;
        this.take.stopAllActions();
        this.take.setTouchEnabled(false);
        this.take.setBright(false);
        if (_data.success) {
            KKVS.TurntableData = KKVS.TurntableData - 1;
            if (KKVS.TurntableData <= 0) {
                KKVS.TurntableData = 0;
            }
            self.take_test.setString(KKVS.TurntableData.toString());
            cc.log("award_id->" + _data.award_id.toString());
            if (typeof _data.award_id == 'number' && 1 <= _data.award_id && _data.award_id <= 8) {
                var rotate_count = parseInt(m_sLobbyTurntable[_data.award_id].rotate + Math.round(Math.random()* 35 + 5) + 360 * 10);
                var rotateAct = cc.rotateTo(10, rotate_count);
                var rotateEase = rotateAct.easing(cc.easeExponentialInOut());
                this.png.runAction(cc.sequence(rotateEase, cc.callFunc(function() {
                    self.take.setTouchEnabled(true);
                    self.take.setBright(true);
                    //跳出奖励框
                    (new modulelobby.Prizes(m_sLobbyTurntable[_data.award_id].value, m_sLobbyTurntable[_data.award_id].type)).show();
                })));
            }else {
                self.take.setTouchEnabled(true);
                self.take.setBright(true);
                (new modulelobby.TxtDialog({title : "系统提示", txt : "服务器数据异常"})).show();
            }
        }else {
            self.take.setTouchEnabled(true);
            self.take.setBright(true);
            (new modulelobby.TxtDialog({title : "系统提示", txt : "启动转盘失败"})).show();
        }
    },
    on_turntable_left_times : function () {
        this.take_test.setString(KKVS.TurntableData.toString());
    },
    on_turntable_progress : function (data) {
        if (data.task_id == 10001) {
            this.task[0].text_2.setString(data.progress.toString());
            this.task[0].text_4.setString(data.total.toString());
        }else if (data.task_id == 10002) {
            this.task[1].text_2.setString(data.progress.toString());
            this.task[1].text_4.setString(data.total.toString());
        }else if (data.task_id == 10003) {
            this.task[2].text_2.setString(data.progress.toString());
            this.task[2].text_4.setString(data.total.toString());
        }else if (data.task_id == 10004) {
            this.task[3].text_2.setString(data.progress.toString());
            this.task[3].text_4.setString(data.total.toString());
        }
    },
    update_turntable_left_times : function () {
        this.take_test.setString(KKVS.TurntableData.toString());
    },
    getBody : function () {
        return this.back;
    },
    getLayer : function () {
        return this._layer;
    },
    onEnter : function () {
        this._super();
        KKVS.Event.register("on_turntable_new", this, "on_turntable_new");
        KKVS.Event.register("on_turntable_left_times", this, "on_turntable_left_times");
        KKVS.Event.register("on_turntable_progress", this, "on_turntable_progress");
        KKVS.Event.register("update_turntable_left_times", this, "update_turntable_left_times");
    },
    onExit : function() {
        KKVS.Event.deregister("on_turntable_new", this);
        KKVS.Event.deregister("on_turntable_left_times", this);
        KKVS.Event.deregister("on_turntable_progress", this);
        KKVS.Event.deregister("update_turntable_left_times", this);
        this._super();
    }
});



//*********************************限时开启活动****************************************
modulelobby.LimitOpen = modulelobby.DialogView.extend({
    ctor: function () {
        this._super();

        var json = ccs.load("res/limitopen.json");
        var visibleSize = cc.director.getVisibleSize();
        var origin = cc.director.getVisibleOrigin();
        json.node.x = origin.x + visibleSize.width / 2 - json.node.getContentSize().width / 2;
        json.node.y = origin.y + visibleSize.height / 2 - json.node.getContentSize().height / 2;
        this.addChild(json.node,1);
        var self = this;
        this._layer = json.node.getChildByName("back");
        var body = json.node.getChildByName("body");
        this.body = body;
        var cloos_btn = body.getChildByName("close_btn");
        cloos_btn.addClickEventListener(function(sender) {
            sender.setTouchEnabled(false);
            self.close();
        });
        var bg = body.getChildByName("bg");
        var text = body.getChildByName("text");
        text.setString("活动期间内，除了飞禽走兽，红黑大战，好友拼十外，其他任意玩法的高级，中级，初级场完成相应对局数可领取共【125万k币】奖励！");
        this.task_data = [];
        for (var i = 0; i < 3; ++i) {
            var task = bg.getChildByName("task").clone();
            task.setAnchorPoint(0.5, 0.5);
            task.setPosition(cc.p(625, 539.5 - i * 205));
            bg.addChild(task);
            var loadingbar = task.getChildByName("bar_bg").getChildByName("loadingbar");
            loadingbar.setPercent(0);
            this.task_data[i] = {};
            this.task_data[i].loadingbar = loadingbar;//完成进度
            var text_1 = task.getChildByName("text_1");
            text_1.ignoreContentAdaptWithSize(true);
            text_1.setString(m_sLimitOpen[i].explain);
            var text_2 = task.getChildByName("text_2");
            text_2.ignoreContentAdaptWithSize(true);
            this.task_data[i].text_2 = text_2;//胜场
            var text_4 = task.getChildByName("text_4");
            text_4.ignoreContentAdaptWithSize(true);
            this.task_data[i].text_4 = text_4;//总场
            this.task_data[i].receive = [];
            for (var n = 0; n < 4; ++n) {
                var receive = task.getChildByName("receive_" + n.toString());
                this.task_data[i].receive[n] = receive;
                var receive_png_1 = receive.getChildByName("png_1");
                receive_png_1.setVisible(false);
                this.task_data[i].receive[n].receive_png_1 = receive_png_1;
                var receive_png_2 = receive.getChildByName("png_2");
                receive_png_2.setVisible(false);
                this.task_data[i].receive[n].receive_png_2 = receive_png_2;
                var txt = receive.getChildByName("txt");
                txt.ignoreContentAdaptWithSize(true);
                this.task_data[i].receive[n].txt = txt;
            }
        }
        KBEngine.app.player().req_activity_info();

        return true;
    },
    on_activity_info : function (data) {
        //限时开启
    },
    on_activity_config : function () {
        var n_status = 0;
        for (var n = 0, n_len = this.task_data.length; n < n_len; ++n) {
            var nn = 4 * n + 3;
            this.task_data[n].text_4.setString(KKVS.WealthyData[nn].win_times.toString());
            for (var m = 0, m_len = this.task_data[n].receive.length; m < m_len; ++m) {
                this.task_data[n].receive[m].txt.setString(KKVS.WealthyData[n_status].win_times.toString());
                this.task_data[n].receive[m].setTag(n_status);
                this.task_data[n].receive[m].addTouchEventListener(function(sender, type){
                    switch (type) {
                        case ccui.Widget.TOUCH_BEGAN:
                            sender.setScale(1.05);
                            break;
                        case ccui.Widget.TOUCH_ENDED:
                            sender.setScale(1);
                            sender.setTouchEnabled(false);
                            sender.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function() {
                                sender.setTouchEnabled(true);
                            })));
                            playEffect();
                            KBEngine.app.player().req_activity_award(KKVS.WealthyData[sender.getTag()].id);
                            break;
                        case ccui.Widget.TOUCH_CANCELED:
                            sender.setScale(1);
                            break;
                        default:
                            break;
                    }
                });
                if (KKVS.WealthyData[n_status].status == 0) {
                    this.task_data[n].receive[m].receive_png_1.setVisible(false);
                    this.task_data[n].receive[m].receive_png_2.setVisible(false);
                }else if (KKVS.WealthyData[n_status].status == 1){
                    this.task_data[n].receive[m].receive_png_1.setVisible(true);
                    this.task_data[n].receive[m].receive_png_2.setVisible(false);
                }else if (KKVS.WealthyData[n_status].status == 2) {
                    this.task_data[n].receive[m].receive_png_1.setVisible(false);
                    this.task_data[n].receive[m].receive_png_2.setVisible(true);
                }
                ++n_status;
            }
        }
    },
    on_activity_player_progress : function (finish, status) {
        for (var i = 0, len = KKVS.WealthyData.length; i < len; ++i) {
            if (KKVS.WealthyData[i].id == finish) {
                KKVS.WealthyData[i].status = status;
                break;
            }
        }
        var h = parseInt((finish - 1) / 4);
        var w = (finish - 1) % 4;
        if (status == 1) {
            this.task_data[h].receive[w].receive_png_1.setVisible(true);
            this.task_data[h].receive[w].receive_png_2.setVisible(false);
        }else if (status == 2){
            this.task_data[h].receive[w].receive_png_1.setVisible(false);
            this.task_data[h].receive[w].receive_png_2.setVisible(true);
        }
    },
    on_activity_player_win_times : function (lobby, field, room, win) {
        var _loadingbar;
        var win_data;
        if (room == 3) {
            this.task_data[0].text_2.setString(win.toString());
            win_data = KKVS.WealthyData[0].win_times;
            if (win_data <= win) {
                win_data = KKVS.WealthyData[1].win_times;
                if (win_data <= win) {
                    win_data = KKVS.WealthyData[2].win_times;
                    if (win_data <= win) {
                        win_data = KKVS.WealthyData[3].win_times;
                    }
                }
            }
            this.task_data[0].text_4.setString(win_data.toString());
            _loadingbar = parseFloat(win / parseInt(KKVS.WealthyData[3].win_times)) * 100;
            this.task_data[0].loadingbar.setPercent(_loadingbar);
        }else if (room == 2) {
            this.task_data[1].text_2.setString(win.toString());
            win_data = KKVS.WealthyData[4].win_times;
            if (win_data <= win) {
                win_data = KKVS.WealthyData[5].win_times;
                if (win_data <= win) {
                    win_data = KKVS.WealthyData[6].win_times;
                    if (win_data <= win) {
                        win_data = KKVS.WealthyData[7].win_times;
                    }
                }
            }
            this.task_data[1].text_4.setString(win_data.toString());
            _loadingbar = parseFloat(win / parseInt(KKVS.WealthyData[7].win_times)) * 100;
            this.task_data[1].loadingbar.setPercent(_loadingbar);
        }else if (room == 1) {
            this.task_data[2].text_2.setString(win.toString());
            win_data = KKVS.WealthyData[8].win_times;
            if (win_data <= win) {
                win_data = KKVS.WealthyData[9].win_times;
                if (win_data <= win) {
                    win_data = KKVS.WealthyData[10].win_times;
                    if (win_data <= win) {
                        win_data = KKVS.WealthyData[11].win_times;
                    }
                }
            }
            this.task_data[2].text_4.setString(win_data.toString());
            _loadingbar = parseFloat(win / parseInt(KKVS.WealthyData[11].win_times)) * 100;
            this.task_data[2].loadingbar.setPercent(_loadingbar);
        }
    },
    on_activity_award : function (data) {
        //finish_id，status状态0不满足1可领取2已领取
        for (var i = 0, len = KKVS.WealthyData.length; i < len; ++i) {
            if (KKVS.WealthyData[i].id == data.finish_id) {
                KKVS.WealthyData[i].status = data.status;
                break;
            }
        }
        if (data.success == 1) {
            var h = parseInt((data.finish_id - 1) / 4);
            var w = (data.finish_id - 1) % 4;
            this.task_data[h].receive[w].receive_png_1.setVisible(false);
            this.task_data[h].receive[w].receive_png_2.setVisible(true);
            (new modulelobby.TxtDialog({title : "系统提示", txt : "奖励已通过邮件发放"})).show();
        }else {
            if (data.status == 0) {
                (new modulelobby.TxtDialog({title : "系统提示", txt : "任务未完成"})).show();
            }else if (data.status == 2){
                (new modulelobby.TxtDialog({title : "系统提示", txt : "任务已完成"})).show();
            }
        }
    },
    getBody : function () {
        return this.body;
    },
    getLayer : function () {
        return this._layer;
    },
    onEnter : function () {
        this._super();
        KKVS.Event.register("on_activity_info", this, "on_activity_info");
        KKVS.Event.register("on_activity_config", this, "on_activity_config");
        KKVS.Event.register("on_activity_player_progress", this, "on_activity_player_progress");
        KKVS.Event.register("on_activity_player_win_times", this, "on_activity_player_win_times");
        KKVS.Event.register("on_activity_award", this, "on_activity_award");
    },
    onExit : function() {
        KKVS.Event.deregister("on_activity_info", this);
        KKVS.Event.deregister("on_activity_config", this);
        KKVS.Event.deregister("on_activity_player_progress", this);
        KKVS.Event.deregister("on_activity_player_win_times", this);
        KKVS.Event.deregister("on_activity_award", this);
        this._super();
    }
});