/**
 * Created by User on 2017/10/31.
 */
modulelobby.ComSysMatchUI = cc.Layer.extend({
    ctor : function (config) {
        this._super();
        this.m_pCurCfg = config;
        this.matchData = null;
        this.room_field = {};
        this.m_ArrayImage = [];
        for (var i = 0, s = KKVS.RoomListInfo.length; i < s; ++i) {
            var field = KKVS.RoomListInfo[i]["field_id"];
            if (field == KKVS.SelectFieldID) {
                this.room_field = KKVS.RoomListInfo[i];
                break;
            }
        }
        this.room_field["roomList"] = [];
        var json = ccs.load("res/landlords_competition.json");
        var visibleSize = cc.director.getVisibleSize();
        var origin = cc.director.getVisibleOrigin();
        json.node.x = origin.x + visibleSize.width / 2 - json.node.getContentSize().width / 2;
        json.node.y = origin.y + visibleSize.height / 2 - json.node.getContentSize().height / 2;
        this.addChild(json.node);

        var self = this;
        var back = json.node.getChildByName("back");
        this.bg = back.getChildByName("bg");
        this.bg.setPosition(cc.p(2880, 475.2));
        this.top = back.getChildByName("top");
        this.top.setPosition(cc.p(960, 1230));
        var close_btn = this.top.getChildByName("clone_btn");
        close_btn.addClickEventListener(function (sender) {
            sender.setTouchEnabled(false);
            playEffect();
            if (!modulelobby.isScreenLocked()) {
                modulelobby.lockScreen(0.6);
                self._hide();
                self.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function() {
                    modulelobby.popScene();
                    KKVS.Event.fire("More_Game_Hide");
                })));
                //modulelobby.popScene();
                //KBEngine.app.player().req_focus(0);
            }
        });

        this.listview = this.bg.getChildByName("list");
        var item_model = this.listview.getItem(0);  //取到列表容器第一个
        this.listview.setItemModel(item_model);
        this.listview.removeItem(0);      //删除所选的
        this._show();

        return true;
    },
    fixTimeNum : function (num) {
        var length = 2;
        return ('' + num).length < length ? ((new Array(length + 1)).join('0') + num).slice(-length) : '' + num;
    },
    on_room_msg : function (cmd, params) {
        if (cmd == ROOM_MSG_ID_MATCH_LIST) {
            var create_tag = true;
            var match_list = params.list;
            if (this.matchData) {
                if (match_list.length == this.room_field["roomList"].length) {
                    create_tag = false;
                    for (var ii = 0, ss = match_list.length; ii < ss; ++ii) {
                        if (match_list[ii]["MatchID"] == this.room_field["roomList"][ii]["MatchID"]) {
                            this.room_field["roomList"][ii]["count"] = match_list[ii]["count"];
                            this.room_field["roomList"][ii]["time"] = match_list[ii]["time"];
                            this.room_field["roomList"][ii]["Status"] = match_list[ii]["Status"];
                            this.room_field["roomList"][ii]["status"] = match_list[ii]["Status"];
                        } else {
                            create_tag = true;
                            break;
                        }
                    }
                }
            }
            if (create_tag) {
                this.matchData = params;
                for (var i = 0, s = match_list.length; i < s; ++i) {
                    match_list[i].status = match_list[i].Status;
                    match_list[i].name = match_list[i].Name;
                    match_list[i].condition = "";
                    if (match_list[i].MatchType == 1) {
                        match_list[i].condition = "满" + match_list[i].max.toString() + "人开赛";
                    } else if (match_list[i].MatchType == 2) {
                        match_list[i].condition = "每" + (match_list[i].limit / 60).toString() + "分钟开赛";
                    } else if (match_list[i].MatchType == 3) {
                        var hour = Math.floor(match_list[i].time / 3600);
                        var minute = Math.floor((match_list[i].time - hour * 3600) / 60);
                        var second = match_list[i].time - hour * 3600 - minute * 60;
                        match_list[i].condition = this.fixTimeNum(hour) + ":" + this.fixTimeNum(minute) + ":" + this.fixTimeNum(second) + "开赛";
                    }
                    match_list[i].localconfig = null;
                    for (var n = 0, m = this.room_field["list"].length; n < m; ++n) {
                        if (match_list[i]["MatchID"] == this.room_field["list"][n]["id"]) {
                            match_list[i].localconfig = this.room_field["list"][n];
                            break;
                        }
                    }
                }
                this.room_field["roomList"] = match_list;
                this.listview.removeAllItems();
                var roomLen = this.room_field["roomList"].length;
                this.m_ArrayImage = [];
                if (0 < roomLen) {
                    for (var rnd = 0; rnd <= roomLen - 1;) {
                        this.listview.pushBackDefaultItem();
                        var item = this.listview.getItem(this.listview.getItems().length - 1);
                        item.image_1 = item.getChildByName("image_1");
                        item.image_1.setVisible(false);
                        this._createItem(this.m_pCurCfg, rnd++, item.image_1);
                    }
                }
                //关闭其它弹框
                KKVS.Event.fire("closeMatchItem");
            } else {
                //检测并更新
                for (var iii = 0, len = this.room_field["roomList"].length; iii < len; ++iii) {
                    if (typeof KKVS.MatchData[this.room_field["roomList"][iii]["MatchID"]] == 'undefined' || KKVS.MatchData[this.room_field["roomList"][iii]["MatchID"]] == null) {
                        this.m_ArrayImage[iii].setVisible(false);
                    } else {
                        this.m_ArrayImage[iii].setVisible(true);
                    }
                }
                KKVS.Event.fire("checkMatchItem");
            }
        } else if (cmd == ROOM_MSG_ID_MATCH_DETAIL_INFO) {
            var t_ind = -1;
            for (var ii = 0, ss = this.room_field["roomList"].length; ii < ss; ++ii) {
                if (params["MatchID"] == this.room_field["roomList"][ii]["MatchID"]) {
                    this.room_field["roomList"][ii]["count"] = params["count"];
                    this.room_field["roomList"][ii]["time"] = params["time"];
                    this.room_field["roomList"][ii]["Status"] = params["Status"];
                    this.room_field["roomList"][ii]["status"] = params["Status"];
                    t_ind = ii;
                    break;
                }
            }
            var t_node = this._getItemByIndex(t_ind);
            if (t_node) {
                this._updateItem(this.m_pCurCfg, t_ind, t_node);
                KKVS.Event.fire("updateMatchItem");
            }
        } else if (cmd == ROOM_MSG_ID_MATCH_SIGNUP) {
            if (params["success"]) {
                this.isArrayImage(params, true);
            }
            KKVS.Event.fire("signupMatchItem", params);
        } else if (cmd == ROOM_MSG_ID_MATCH_CANCEL_SIGNUP) {
            if (params["success"]) {
                this.isArrayImage(params, false);
            }
            KKVS.Event.fire("cancelSignupMatchItem", params);
        } else if (cmd == ROOM_MSG_ID_MATCH_SIGNUP_INFO) {
            if (params["Status"] == 2) {
                this.isArrayImage(params, false);
            }
            //KKVS.Event.fire("closeMatchItem", params);
        } else {
        }
    },
    isArrayImage : function (params, bool) {
        for (var n = 0, len = this.room_field["roomList"].length; n < len; ++n) {
            if (params["MatchID"] == this.room_field["roomList"][n]["MatchID"]) {
                this.m_ArrayImage[n].setVisible(bool);
                break;
            }
        }
    },
    _getItemByIndex : function (ind) {
        var item = this.listview.getItem(Math.floor(ind));
        //var item = this.listview.getItem(Math.floor(ind / 2));
        if (!item) {
            return null;
        }

        return item.image_1;
        //if (ind % 2 == 0) {
        //    return item.image_1;
        //} else {
        //    return item.image_2;
        //}
    },
    _updateItem : function (config, roomInd, node) {
        var roomData = this.room_field["roomList"][roomInd];
        if (!roomData) {
            return;
        }
        //if (roomData.MatchType == 2) {
        //    node.getChildByName("text_3").setString("每" + (roomData.time / 60).toString() + "分钟开赛");
        //}
    },
    _createItem : function (config, roomInd, node) {
        var roomData = this.room_field["roomList"][roomInd];
        if (!roomData) {
            return;
        }
        var nodeImage = node.getChildByName("image");
        if (typeof KKVS.MatchData[roomData["MatchID"]] != 'undefined' && KKVS.MatchData[roomData["MatchID"]]) {
            nodeImage.setVisible(true);
        } else {
            nodeImage.setVisible(false);
        }
        this.m_ArrayImage.push(nodeImage);
        node.getChildByName("text_0").setString(roomData.name);
        node.getChildByName("text_0").ignoreContentAdaptWithSize(true);
        if (roomData.MatchType == 3) {
            node.getChildByName("text_1").setString("定点开放");
        } else {
            node.getChildByName("text_1").setString("全天开放");
        }
        node.getChildByName("text_1").ignoreContentAdaptWithSize(true);
        node.getChildByName("text_2").setString("冠军:" + (roomData.localconfig ? roomData.localconfig.reward : ""));
        node.getChildByName("text_2").ignoreContentAdaptWithSize(true);
        //if (roomData.MatchType == 1) {
        //    node.getChildByName("text_3").setString("满" + roomData.max.toString() + "人开赛");
        //} else if (roomData.MatchType == 2) {
        //    node.getChildByName("text_3").setString("每" + (roomData.time / 60).toString() + "分钟开赛");
        //} else if (roomData.MatchType == 3) {
        //    var hour = Math.floor(roomData.time / 3600);
        //    var minute = Math.floor((roomData.time - hour * 3600) / 60);
        //    var second = roomData.time - hour * 3600 - minute * 60;
        //    node.getChildByName("text_3").setString(this.fixTimeNum(hour) + ":" + this.fixTimeNum(minute) + ":" + this.fixTimeNum(second) + "开赛");
        //}
        node.getChildByName("text_3").setString(roomData.condition);
        node.getChildByName("text_3").ignoreContentAdaptWithSize(true);
        node.addTouchEventListener(function(sender, type) {
            switch (type) {
                case ccui.Widget.TOUCH_BEGAN:
                    //sender.setScale(1.05);
                    break;
                case ccui.Widget.TOUCH_ENDED:
                    //sender.setScale(1.0);
                    sender.setTouchEnabled(false);
                    sender.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function() {
                        sender.setTouchEnabled(true);
                    })));
                    playEffect();
                    //未开赛|已开赛|已报名|未报名
                    if (typeof KKVS.MatchData[roomData["MatchID"]] != 'undefined' && KKVS.MatchData[roomData["MatchID"]]) {
                        //已报名
                        if (KKVS.MatchData[roomData["MatchID"]]["Status"] == 1) {
                            //已开赛
                            KKVS.Event.fire("ComSys_MatchComponent", KKVS.MatchData[roomData["MatchID"]]);
                        } else {
                            //未开赛
                            if (roomData.MatchType == 1) {
                                (new modulelobby.ComSysMatchUICancel(roomData)).show();
                            } else {
                                (new modulelobby.ComSysMatchUIEnroll(roomData, 2)).show();
                            }
                        }
                    } else {
                        //未报名
                        (new modulelobby.ComSysMatchUIEnroll(roomData, 1)).show();
                    }
                    break;
                case ccui.Widget.TOUCH_CANCELED:
                    //sender.setScale(1.0);
                    break;
                default:
                    break;
            }
        });
        node.setVisible(true);
    },
    updateLobbyUI : function () {
        var params = {};
        var datas = JSON.stringify(params);
        KBEngine.app.player().req_room_msg(ROOM_MSG_ID_MATCH_LIST, datas);
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
        KKVS.Event.register("on_room_msg", this, "on_room_msg");
        KKVS.Event.register("updateLobbyUI", this, "updateLobbyUI");
        //load match data
        if (!this.matchData) {
            var params = {};
            var datas = JSON.stringify(params);
            if (KBEngine.app.player() != undefined) {
                KBEngine.app.player().req_room_msg(ROOM_MSG_ID_MATCH_LIST, datas);
            }
        } else {
            //===
            for (var i = 0, len = this.room_field["roomList"].length; i < len; ++i) {
                if (typeof KKVS.MatchData[this.room_field["roomList"][i]["MatchID"]] == 'undefined' || KKVS.MatchData[this.room_field["roomList"][i]["MatchID"]] == null) {
                    this.m_ArrayImage[i].setVisible(false);
                } else {
                    this.m_ArrayImage[i].setVisible(true);
                }
            }
            if (KBEngine.app.player() != undefined) {
                KBEngine.app.player().req_focus(1);
            }
        }
    },
    onExit : function () {
        KKVS.Event.deregister("on_room_msg", this);
        KKVS.Event.deregister("updateLobbyUI", this);
        if (KBEngine.app.player() != undefined) {
            KBEngine.app.player().req_focus(0);
        }
        this._super();
    }
});



//*******************************报名************************************
modulelobby.ComSysMatchUIEnroll = modulelobby.DialogView.extend({
    ctor : function (params, step) {
        this._super();
        this.roomData = params;
        this.step = (step == 1 || step == 2) ? step : 1;
        var json = ccs.load("res/landlords_competition_enroll.json");
        var visibleSize = cc.director.getVisibleSize();
        var origin = cc.director.getVisibleOrigin();
        json.node.x = origin.x + visibleSize.width / 2 - json.node.getContentSize().width / 2;
        json.node.y = origin.y + visibleSize.height / 2 - json.node.getContentSize().height / 2;
        this.addChild(json.node);
        var self = this;
        this._layer = json.node.getChildByName("back");
        var body = json.node.getChildByName("body");
        this._body = body;
        var close_btn = body.getChildByName("close_btn");
        close_btn.addClickEventListener(function (sender) {
            sender.setTouchEnabled(false);
            playEffect();
            self.close();
        });
        //this.scroll_Bar_1 = null;
        //this.scroll_Bar_2 = null;
        this.enroll_btn = body.getChildByName("enroll_btn");
        this.cancel_btn = body.getChildByName("cancel_btn");
        if (this.step == 1) {
            this.enroll_btn.setVisible(true);
            this.cancel_btn.setVisible(false);
        } else {
            this.enroll_btn.setVisible(false);
            this.cancel_btn.setVisible(true);
        }
        this.btnlen = [];
        for (var i = 0; i < 3; ++i) {
            self.btnlen[i] = body.getChildByName("btn_" + i.toString());
            self.btnlen[i].png = self.btnlen[i].getChildByName("png");
            self.btnlen[i].txt = self.btnlen[i].getChildByName("text");
        }
        self.btnlen[0].setTouchEnabled(false);
        this.layerslen = [];
        for (var ii = 0; ii < 3; ++ii) {
            self.layerslen[ii] = body.getChildByName("layout_" + ii.toString());
        }
        this.layerstag = [true, true, true];
        this.layersfun = [this.pageSignUp, this.pageReward, this.pageIntroduction];
        this.enroll_btn.addClickEventListener(function (sender) {
            sender.setTouchEnabled(false);
            sender.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function() {
                sender.setTouchEnabled(true);
            })));
            playEffect();
            modulelobby.showLoading(null, null, 10);
            var t_params = {"MatchID" : self.roomData["MatchID"]};
            var datas = JSON.stringify(t_params);
            KBEngine.app.player().req_room_msg(ROOM_MSG_ID_MATCH_SIGNUP, datas);
        });
        this.cancel_btn.addClickEventListener(function (sender) {
            sender.setTouchEnabled(false);
            sender.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function() {
                sender.setTouchEnabled(true);
            })));
            playEffect();
            modulelobby.showLoading(null, null, 10);
            var t_params = {"MatchID" : self.roomData["MatchID"], "MatchOrderID" : KKVS.MatchData[self.roomData["MatchID"]]["MatchOrderID"]};
            var datas = JSON.stringify(t_params);
            KBEngine.app.player().req_room_msg(ROOM_MSG_ID_MATCH_CANCEL_SIGNUP, datas);
        });

        for (var k = 0, len = this.btnlen.length; k < len; ++k) {
            self.btnlen[k].setTag(k);
            self.btnlen[k].addClickEventListener(function (sender) {
                playEffect();
                for (var n = 0; n < len; ++n) {
                    if (n == sender.getTag()) {
                        self.btnlen[n].setTouchEnabled(false);
                        self.btnlen[n].png.setVisible(true);
                        self.btnlen[n].txt.setVisible(true);
                        self.layerslen[n].setVisible(true);
                        self.layersfun[n].call(self);
                    } else {
                        self.btnlen[n].setTouchEnabled(true);
                        self.btnlen[n].png.setVisible(false);
                        self.btnlen[n].txt.setVisible(false);
                        self.layerslen[n].setVisible(false);
                    }
                }
            });
        }
        var title = body.getChildByName("title");
        title.ignoreContentAdaptWithSize(true);
        title.setString(this.roomData["name"]);
        this.pageSignUp();
        if (this.roomData["MatchType"] != 1) {
            var temp_params = {"MatchID" : this.roomData["MatchID"]};
            var temp_datas = JSON.stringify(temp_params);
            KBEngine.app.player().req_room_msg(ROOM_MSG_ID_MATCH_DETAIL_INFO, temp_datas);
        }

        return true;
    },
    getBody : function () {
        return this._body;
    },
    getLayer : function () {
        return this._layer;
    },
    pageSignUp : function () {
        if (!this.layerstag[0]) {
            return;
        }
        this.layerstag[0] = false;
        var lay_0_text_2 = this.layerslen[0].getChildByName("text_2");
        lay_0_text_2.ignoreContentAdaptWithSize(true);
        lay_0_text_2.setString(this.roomData.condition);
        var lay_0_text_8 = this.layerslen[0].getChildByName("text_8");
        lay_0_text_8.ignoreContentAdaptWithSize(true);
        lay_0_text_8.setString(this.roomData.localconfig ? this.roomData.localconfig.ticket_fee : "");
        var lay_0_text_6 = this.layerslen[0].getChildByName("text_6");
        lay_0_text_6.ignoreContentAdaptWithSize(true);
        lay_0_text_6.setString(this.roomData["count"].toString() + "人");
    },
    pageReward : function () {
        if (!this.layerstag[1]) {
            return;
        }
        //滚动文本问题
        //this.layerslen[1].getChildByName("view").getChildByName("text_1").setString(this.roomData.localconfig ? this.roomData.localconfig.reward_list : "");
        this.addScrollText(this.layerslen[1], (this.roomData.localconfig ? this.roomData.localconfig.reward_list : ""));
        //右边拉动条
        //if (!this.scroll_Bar_1) {
        //    this.scroll_Bar_1 = new modulelobby.ScrollViewBar(null, "res/ui/scrollbar.png", this.layerslen[1], modulelobby.ScrollViewBar_Direction_Vertical);
        //    var scrollBarPos = this.layerslen[1].convertToWorldSpace(cc.p(this.layerslen[1].getContentSize().width, this.layerslen[1].getContentSize().height * 0.5));
        //    scrollBarPos = this.layerslen[0].convertToNodeSpace(scrollBarPos);
        //    this.scroll_Bar_1.setPosition(cc.p(scrollBarPos.x - 30, scrollBarPos.y + 30));
        //    this.layerslen[1].addChild(this.scroll_Bar_1);
        //    this.scroll_Bar_1.setAutoUpdate(true);
        //}
    },
    pageIntroduction : function () {
        if (!this.layerstag[2]) {
            return;
        }
        //滚动文本问题
        //this.layerslen[2].getChildByName("view").getChildByName("text_1").setString(this.roomData.localconfig ? this.roomData.localconfig.introduction : "");
        this.addScrollText(this.layerslen[2], (this.roomData.localconfig ? this.roomData.localconfig.introduction : ""));
        //右边拉动条
        //if (!this.scroll_Bar_2) {
        //    this.scroll_Bar_2 = new modulelobby.ScrollViewBar(null, "res/ui/scrollbar.png", this.layerslen[2], modulelobby.ScrollViewBar_Direction_Vertical);
        //    var scrollBarPos = this.layerslen[2].convertToWorldSpace(cc.p(this.layerslen[2].getContentSize().width, this.layerslen[2].getContentSize().height * 0.5));
        //    scrollBarPos = this.layerslen[0].convertToNodeSpace(scrollBarPos);
        //    this.scroll_Bar_2.setPosition(cc.p(scrollBarPos.x - 30, scrollBarPos.y + 30));
        //    this.layerslen[2].addChild(this.scroll_Bar_2);
        //    this.scroll_Bar_2.setAutoUpdate(true);
        //}
    },
    addScrollText : function (view, text) {
        var c_size = view.getInnerContainerSize();
        var richText = new ccui.RichText();
        richText.ignoreContentAdaptWithSize(false);
        richText.setContentSize(c_size.width, 0);
        richText.setAnchorPoint(cc.p(0.5, 0.5));
        var r_text = new ccui.RichElementText(1, cc.color(87, 53, 12), 255, text, "res/fonts/tengxiangyuan.ttf", 45);
        richText.pushBackElement(r_text);
        richText.formatText();
        var rt_size = richText.getContentSize();
        if (c_size.height < rt_size.height) {
            richText.setPosition(rt_size.width * 0.5, rt_size.height * 0.5);
            view.setInnerContainerSize(rt_size);
        } else {
            richText.setPosition(rt_size.width * 0.5, c_size.height - rt_size.height * 0.5);
        }
        view.getInnerContainer().addChild(richText);
    },
    updateCB : function () {
        this.layerslen[0].getChildByName("text_6").setString(this.roomData["count"].toString() + "人");
    },
    signupCB : function (params) {
        modulelobby.hideLoading();
        if (params["success"]) {
            if (typeof KKVS.MatchData[this.roomData["MatchID"]] == 'undefined' || !KKVS.MatchData[this.roomData["MatchID"]]) {
                KKVS.MatchData[this.roomData["MatchID"]] = {"MatchID": this.roomData["MatchID"], "Status": this.roomData["Status"], "MatchOrderID": params["room_id"]};
            }
            this.step = 2;
            if (this.roomData["MatchType"] == 1) {
                this.close();
                (new modulelobby.ComSysMatchUICancel(this.roomData)).show();
            } else {
                this.enroll_btn.setVisible(false);
                this.cancel_btn.setVisible(true);
                //不实时的人数
                this.roomData["count"] = this.roomData["count"] + 1;
                this.updateCB();
                (new modulelobby.TxtDialog({title : "系统提示", txt : "报名成功"})).show();
            }
        } else {
            (new modulelobby.TxtDialog({title : "系统提示", txt : params["error"]})).show();
        }
    },
    cancelSignupCB : function (params) {
        modulelobby.hideLoading();
        if (params["success"]) {
            this.close();
            //不实时的人数
            //this.roomData["count"] = 0 < this.roomData["count"] - 1 ? this.roomData["count"] - 1 : 0;
            (new modulelobby.TxtDialog({title : "系统提示", txt : "退赛成功"})).show();
        } else {
            (new modulelobby.TxtDialog({title : "系统提示", txt : params["error"]})).show();
        }
    },
    enterMatch : function () {
        this.close();
    },
    checkMatchItem : function () {
        if (typeof KKVS.MatchData[this.roomData["MatchID"]] == 'undefined' || KKVS.MatchData[this.roomData["MatchID"]] == null) {
            this.enterMatch();
        } else {
            this.updateCB();
        }
    },
    onEnter : function () {
        this._super();
        KKVS.Event.register("updateMatchItem", this, "updateCB");
        KKVS.Event.register("signupMatchItem", this, "signupCB");
        KKVS.Event.register("cancelSignupMatchItem", this, "cancelSignupCB");
        KKVS.Event.register("ComSys_EnterComponent", this, "enterMatch");
        KKVS.Event.register("checkMatchItem", this, "checkMatchItem");
        KKVS.Event.register("closeMatchItem", this, "enterMatch");
    },
    onExit : function () {
        KKVS.Event.deregister("updateMatchItem", this);
        KKVS.Event.deregister("signupMatchItem", this);
        KKVS.Event.deregister("cancelSignupMatchItem", this);
        KKVS.Event.deregister("ComSys_EnterComponent", this);
        KKVS.Event.deregister("checkMatchItem", this);
        KKVS.Event.deregister("closeMatchItem", this);
        this._super();
    }
});








//*******************************退赛***********************************
modulelobby.ComSysMatchUICancel = modulelobby.DialogView.extend({
    ctor : function (params) {
        this._super();
        this.roomData = params;
        this.maxChair = params.max;
        var json = ccs.load("res/landlords_competition_cancel.json");
        var visibleSize = cc.director.getVisibleSize();
        var origin = cc.director.getVisibleOrigin();
        json.node.x = origin.x + visibleSize.width / 2 - json.node.getContentSize().width / 2;
        json.node.y = origin.y + visibleSize.height / 2 - json.node.getContentSize().height / 2;
        this.addChild(json.node);

        var self = this;
        this._layer = json.node.getChildByName("back");
        var body = json.node.getChildByName("body");
        this._body = body;
        var cancel_btn = body.getChildByName("cancel_btn");
        cancel_btn.addClickEventListener(function (sender) {
            sender.setTouchEnabled(false);
            sender.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function() {
                sender.setTouchEnabled(true);
            })));
            playEffect();
            modulelobby.showLoading(null, null, 10);
            var t_params = {"MatchID" : self.roomData["MatchID"], "MatchOrderID" : KKVS.MatchData[self.roomData["MatchID"]]["MatchOrderID"]};
            var datas = JSON.stringify(t_params);
            KBEngine.app.player().req_room_msg(ROOM_MSG_ID_MATCH_CANCEL_SIGNUP, datas);
        });
        var title = body.getChildByName("title");
        title.ignoreContentAdaptWithSize(true);
        title.setString(this.roomData["name"]);
        var text_2 = body.getChildByName("text_2");
        text_2.ignoreContentAdaptWithSize(true);
        text_2.setString(this.roomData.localconfig ? this.roomData.localconfig.reward : "");
        this.loadingbar = body.getChildByName("loadingbar");
        this.loadingbarTxt = body.getChildByName("num");
        this.loadingbarTxt.ignoreContentAdaptWithSize(true);
        this.updateInfo();
        return true;
    },
    getBody : function () {
        return this._body;
    },
    getLayer : function () {
        return this._layer;
    },
    updateInfo : function () {
        var percent = (this.roomData["count"] / this.maxChair) * 100;
        percent = 100 < percent ? 100 : percent;
        this.loadingbar.setPercent(percent.toString());
        this.loadingbarTxt.setString(this.roomData["count"].toString() + "/" + this.maxChair.toString());
    },
    cancelSignupCB : function (params) {
        modulelobby.hideLoading();
        if (params["success"]) {
            this.close();
            (new modulelobby.TxtDialog({title : "系统提示", txt : "退赛成功"})).show();
        } else {
            (new modulelobby.TxtDialog({title : "系统提示", txt : params["error"]})).show();
        }
    },
    enterMatch : function () {
        this.close();
    },
    checkMatchItem : function () {
        if (typeof KKVS.MatchData[this.roomData["MatchID"]] == 'undefined' || KKVS.MatchData[this.roomData["MatchID"]] == null) {
            this.enterMatch();
        } else {
            this.updateInfo();
        }
    },
    onEnter : function () {
        this._super();
        KKVS.Event.register("updateMatchItem", this, "updateInfo");
        KKVS.Event.register("cancelSignupMatchItem", this, "cancelSignupCB");
        KKVS.Event.register("ComSys_EnterComponent", this, "enterMatch");
        KKVS.Event.register("checkMatchItem", this, "checkMatchItem");
        KKVS.Event.register("closeMatchItem", this, "enterMatch");
    },
    onExit : function () {
        KKVS.Event.deregister("updateMatchItem", this);
        KKVS.Event.deregister("cancelSignupMatchItem", this);
        KKVS.Event.deregister("ComSys_EnterComponent", this);
        KKVS.Event.deregister("checkMatchItem", this);
        KKVS.Event.deregister("closeMatchItem", this);
        this._super();
    }
});