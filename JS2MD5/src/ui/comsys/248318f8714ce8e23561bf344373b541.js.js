modulelobby.ComSysWar = modulelobby.DialogView.extend({
    ctor: function() {
        this._super();
        var json = ccs.load("res/comsys_war.json");
        var visibleSize = cc.director.getVisibleSize();
        var origin = cc.director.getVisibleOrigin();
        json.node.x = origin.x + visibleSize.width / 2 - json.node.getContentSize().width / 2;
        json.node.y = origin.y + visibleSize.height / 2 - json.node.getContentSize().height / 2;
        this.addChild(json.node);
        var rootNode = json.node;
        var self = this;
        // 数组初始化
        this.initData();
        this._layer = rootNode.getChildByName("back");
        this.body = rootNode.getChildByName("body");

        var close_btn = this.body.getChildByName("close_btn");
        close_btn.addClickEventListener(function() {
            close_btn.setTouchEnabled(false);
            playEffect();
            self.close();
        });
        // 输入按钮
        for (var n = 0; n < 10; ++ n) {
            var btn = this.body.getChildByName("btn_" + n.toString());
            btn.setTag(n);
            btn.addTouchEventListener(this.btnClick, this);
        }
        // 显示文本
        for (var i = 1; i < 7; ++i) {
            var num_text = this.body.getChildByName("number_" + i.toString());
            num_text.setString("");
            this.pwdText.push(num_text);
        }
        var resetInput = this.body.getChildByName("btn_reset");
        resetInput.addClickEventListener(function() {
            playEffect();
            this.clickCount = 0;
            for (var m in this.pwdText) {
                this.pwdText[m].setString("");
            }
        }.bind(this));
        var deleteInput = this.body.getChildByName("btn_delete");
        deleteInput.addClickEventListener(function() {
            playEffect();
            if (this.clickCount == 0)
                return;

            this.pwdText[this.clickCount - 1].setString("");
            this.clickCount --;
        }.bind(this));
        var btn_create = this.body.getChildByName("btn_create");
        btn_create.addClickEventListener(function(sender) {
            sender.setTouchEnabled(false);
            sender.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function() {
                sender.setTouchEnabled(true);
            })));
            playEffect();
            self.close();
            (new modulelobby.ComSysCreate).show();
        });

        return true;
    },
    initData: function() {
        this.pwdText = [];
        this.clickCount = 0;
    },
    btnClick: function(sender, type) {
        var tag = sender.getTag();
        if (type == ccui.Widget.TOUCH_ENDED) {
            playEffect();
            console.log("tag = " + tag);
            if (this.clickCount >= 6)
                return;
            this.pwdText[this.clickCount].setString(tag.toString());
            this.clickCount ++;

            if (this.clickCount == 6) {
                var cID = "";
                for (var i = 0; i < 6; ++i)
                    cID += this.pwdText[i].getString();
                //console.log("请求加入俱乐部 ID = " + cID);
                //KBEngine.app.player().reqJoinInSociatyMsg(parseInt(cID));
                console.log("请求加入房间 ID = " + cID);
                KBEngine.app.player().joinGameRoom(parseInt(cID), "000000");
                this.close();
            }
        }
    },
    sendJoinClubSuccess: function() {
        var self = this;
        self.close();
    },
    getBody : function () {
        return this.body;
    },
    getLayer : function () {
        return this._layer;
    },
    onEnter: function() {
        this._super();
        KKVS.Event.register("sendJoinClubSuccess", this, "sendJoinClubSuccess");
    },
    onExit: function() {
        KKVS.Event.deregister("sendJoinClubSuccess", this);
        this._super();
    }
});











//***********************************创建房间*********************************************
modulelobby.ComSysCreate = modulelobby.DialogView.extend({
    ctor: function() {
        this._super();
        var json = ccs.load("res/comsys_create.json");
        var visibleSize = cc.director.getVisibleSize();
        var origin = cc.director.getVisibleOrigin();
        json.node.x = origin.x + visibleSize.width / 2 - json.node.getContentSize().width / 2;
        json.node.y = origin.y + visibleSize.height / 2 - json.node.getContentSize().height / 2;
        this.addChild(json.node);
        var rootNode = json.node;
        var self = this;
        this.current = -1; //当前页
        this.lowestgold = -1;
        this._layer = rootNode.getChildByName("back");
        this.body = rootNode.getChildByName("body");
        var close_btn = this.body.getChildByName("close_btn");
        close_btn.addClickEventListener(function() {
            close_btn.setTouchEnabled(false);
            playEffect();
            self.close();
        });
        var view = this.body.getChildByName("view");
        var item_model = view.getItem(0);
        view.setItemModel(item_model);
        view.removeItem(0);
        var btn = [];
        var len = m_sCreateRoom.length;
        try {
            for (var i = 0; i < len; ++i) {
                view.pushBackDefaultItem();
                var item = view.getItem(view.getItems().length - 1);
                btn[i] = item.getChildByName("btn");
                btn[i].png = btn[i].getChildByName("png");
                btn[i].png.setVisible(false);
                btn[i].text_1 = btn[i].getChildByName("text_1");
                btn[i].text_1.ignoreContentAdaptWithSize(true);
                btn[i].text_1.setString(m_sCreateRoom[i].name);
                btn[i].text_1.setVisible(true);
                btn[i].text_2 = btn[i].getChildByName("text_2");
                btn[i].text_2.ignoreContentAdaptWithSize(true);
                btn[i].text_2.setString(m_sCreateRoom[i].name);
                btn[i].text_2.setVisible(false);
                if (!cc.sys.isNative) {
                    //H5版本clone()引起的问题(不够全面,克隆之后描边不见了)
                    btn[i].text_1.enableOutline(cc.color(137, 45, 0), 3);
                    btn[i].text_2.enableOutline(cc.color(7, 88, 41), 3);
                }
                btn[i].setTag(i);
                btn[i].addClickEventListener(function(sender) {
                    playEffect();
                    self.enableBtn(sender, false);
                    self.enableBtn(btn[self.current], true);
                    self.showLayout(sender.getTag());
                });
            }
        } catch (e) {
        }
        this.layout = [];
        this.layout_model = this.body.getChildByName("lay");
        this.layout_model.setVisible(false);
        this.enableBtn(btn[0], false);
        this.showLayout(0);
        //
        var create_btn = this.body.getChildByName("create_btn");
        create_btn.addClickEventListener(function (sender) {
            sender.setTouchEnabled(false);
            sender.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function() {
                sender.setTouchEnabled(true);
            })));
            cc.log("点击了创建房间");
            playEffect();
            if (self.current == -1 || !self.layout[self.current]) {
                cc.log("create room : index = -1");
                return;
            }
            var game_id = m_sCreateRoom[self.current].game_id;
            var round = m_sCreateRoom[self.current].game_number[self.layout[self.current].one.selected];
            var multiples = m_sCreateRoom[self.current].cap[self.layout[self.current].two.selected];
            var field_type = m_sCreateRoom[self.current].field_type[self.layout[self.current].three.selected];
            var roles = m_sCreateRoom[self.current].man_number[0];
            var base_score = m_sCreateRoom[self.current].difen[self.layout[self.current].four.selected];
            // 游戏带入
            var bting_bool = self.onGoldInfo();
            var bring = 1;
            if (bting_bool == "success") {
                bring = parseInt(self.layout[self.current].five_Input.getString());
                if (bring < self.lowestgold) {
                    (new modulelobby.TxtDialog({title : "系统提示", txt : "输入金币少于最低携带金币，请重新输入！"})).show();
                }else {
                    // 2 斗地主   89 四川麻将  6:癞油麻将 8:铁支
                    if (game_id == 8) {
                        bring = bring * 10000;
                    }
                    var pwd = "000000";
                    cc.log("game_id = " + game_id);
                    cc.log("round = " + round);
                    cc.log("multiples = " + multiples);
                    cc.log("field_type = " + field_type);
                    cc.log("roles = " + roles);
                    modulelobby.showLoading(null, null, 10);
                    KBEngine.app.player().createGameRoom(game_id, round, multiples, field_type, roles, pwd, 0 , bring, base_score);
                }
            }else {
                (new modulelobby.TxtDialog({title : "系统提示", txt : bting_bool})).show();
            }
        });

        return true;
    },
    enableBtn : function (btn, enable) {
        if (!btn) {
            return;
        }
        btn.setTouchEnabled(enable);
        btn.png.setVisible(!enable);
        btn.text_1.setVisible(enable);
        btn.text_2.setVisible(!enable);
    },
    selectChkBox : function (boxObj, ind, enable) {
        if (boxObj && boxObj.chkbox && boxObj.chkbox[ind]) {
            boxObj.chkbox[ind].setSelected(enable);
            boxObj.chkbox[ind].setTouchEnabled(!enable);
            boxObj.selected = enable ? ind : -1;
        }
    },
    setlowestgold : function (ind) {
        var jushu_0 = m_sCreateRoom[ind].game_number[this.layout[ind].one.selected];
        var difen_0 = m_sCreateRoom[ind].difen[this.layout[ind].four.selected];
        this.lowestgold = jushu_0 * difen_0 * m_sCreateRoom[ind].lowestgold;
        this.layout[ind].five_Input.setString(this.lowestgold.toString());
    },
    showLayout : function (ii) {
        //create layout
        if (!m_sCreateRoom[ii]) {
            cc.log("showLayout : m_sCreateRoom[ii] is null");
            return;
        }
        if (!this.layout[ii]) {
            var lay = this.layout_model;
            this.layout[ii] = lay.clone();
            //this.layout[ii].setVisible(false);
            this.layout[ii].setPosition(cc.p(lay.getPositionX(), lay.getPositionY()));
            this.body.addChild(this.layout[ii]);
            //携带金币
            var five_Input = this.layout[ii].getChildByName("five_bg").getChildByName("input");
            var five_text = this.layout[ii].getChildByName("five_bg").getChildByName("text_1");
            //vip
            var vip_show = this.layout[ii].getChildByName("vip_show");
            //局数
            this.layout[ii].one = {};
            this.layout[ii].one.chkbox = [];
            this.layout[ii].one.selected = -1;
            for (var m = 0, m_len = m_sCreateRoom[ii].game_number.length; m < m_len; ++m) {
                this.layout[ii].one.chkbox[m] = this.layout[ii].getChildByName("onebox_" + m.toString());
                this.layout[ii].one.chkbox[m].setVisible(true);
                var onetext = this.layout[ii].getChildByName("onetext_" + m.toString());
                onetext.setVisible(true);
                onetext.ignoreContentAdaptWithSize(true);
                onetext.setString(m_sCreateRoom[ii].game_number[m].toString() + "局");
                this.layout[ii].one.chkbox[m].setTag(m);
                this.layout[ii].one.chkbox[m].addEventListener(function (sender, type) {
                    switch (type) {
                        case ccui.CheckBox.EVENT_SELECTED:
                            this.selectChkBox(this.layout[ii].one, this.layout[ii].one.selected, false);
                            this.selectChkBox(this.layout[ii].one, sender.getTag(), true);
                            this.setlowestgold(ii);
                            if (m_sCreateRoom[ii].game_id == 8) {
                                if (sender.getTag() == 0) {
                                    vip_show.setVisible(true);
                                }else if (sender.getTag() == 1) {
                                    vip_show.setVisible(false);
                                }
                            }
                            break;
                        case ccui.CheckBox.EVENT_UNSELECTED:
                            break;
                        default:
                            break;
                    }
                }.bind(this));
            }
            //底分
            this.layout[ii].four = {};
            this.layout[ii].four.chkbox = [];
            this.layout[ii].four.selected = -1;
            var e_len = m_sCreateRoom[ii].difen.length;
            for (var e = 0; e < e_len; ++e) {
                this.layout[ii].four.chkbox[e] = this.layout[ii].getChildByName("fourbox_" + e.toString());
                this.layout[ii].four.chkbox[e].setVisible(true);
                var fourtext = this.layout[ii].getChildByName("fourtext_" + e.toString());
                fourtext.setVisible(true);
                fourtext.ignoreContentAdaptWithSize(true);
                fourtext.setString(m_sCreateRoom[ii].difen[e].toString());
                this.layout[ii].four.chkbox[e].setTag(e);
                this.layout[ii].four.chkbox[e].addEventListener(function (sender, type) {
                    switch (type) {
                        case ccui.CheckBox.EVENT_SELECTED:
                            this.selectChkBox(this.layout[ii].four, this.layout[ii].four.selected, false);
                            this.selectChkBox(this.layout[ii].four, sender.getTag(), true);
                            this.setlowestgold(ii);
                            break;
                        case ccui.CheckBox.EVENT_UNSELECTED:
                            break;
                        default:
                            break;
                    }
                }.bind(this));
            }
            //封顶
            this.layout[ii].two = {};
            this.layout[ii].two.chkbox = [];
            this.layout[ii].two.selected = -1;
            for (var q = 0, q_len = m_sCreateRoom[ii].cap.length; q < q_len; ++q) {
                this.layout[ii].two.chkbox[q] = this.layout[ii].getChildByName("twobox_" + q.toString());
                this.layout[ii].two.chkbox[q].setVisible(true);
                var twotext = this.layout[ii].getChildByName("twotext_" + q.toString());
                twotext.setVisible(true);
                twotext.ignoreContentAdaptWithSize(true);
                if (m_sCreateRoom[ii].cap[q] == 0) {
                    twotext.setString("不封顶");
                }else {
                    twotext.setString(m_sCreateRoom[ii].cap[q].toString() + "倍");
                }
                this.layout[ii].two.chkbox[q].setTag(q);
                this.layout[ii].two.chkbox[q].addEventListener(function (sender, type) {
                    switch (type) {
                        case ccui.CheckBox.EVENT_SELECTED:
                            this.selectChkBox(this.layout[ii].two, this.layout[ii].two.selected, false);
                            this.selectChkBox(this.layout[ii].two, sender.getTag(), true);
                            break;
                        case ccui.CheckBox.EVENT_UNSELECTED:
                            break;
                        default:
                            break;
                    }
                }.bind(this));
            }
            //玩法
            this.layout[ii].three = {};
            this.layout[ii].three.chkbox = [];
            this.layout[ii].three.selected = -1;
            for (var w = 0, w_len = m_sCreateRoom[ii].play.length; w < w_len; ++w) {
                this.layout[ii].three.chkbox[w] = this.layout[ii].getChildByName("threebox_" + w.toString());
                this.layout[ii].three.chkbox[w].setVisible(true);
                var threetext = this.layout[ii].getChildByName("threetext_" + w.toString());
                threetext.setVisible(true);
                threetext.ignoreContentAdaptWithSize(true);
                threetext.setString(m_sCreateRoom[ii].play[w]);
                this.layout[ii].three.chkbox[w].setTag(w);
                this.layout[ii].three.chkbox[w].addEventListener(function (sender, type) {
                    switch (type) {
                        case ccui.CheckBox.EVENT_SELECTED:
                            this.selectChkBox(this.layout[ii].three, this.layout[ii].three.selected, false);
                            this.selectChkBox(this.layout[ii].three, sender.getTag(), true);
                            break;
                        case ccui.CheckBox.EVENT_UNSELECTED:
                            break;
                        default:
                            break;
                    }
                }.bind(this));
            }
            //vip和携带金币
            if (m_sCreateRoom[ii].game_id == 8) {
                five_text.setVisible(true);
            }else {
                five_text.setVisible(false);
            }
            if (m_sCreateRoom[ii].explain) {
                vip_show.setVisible(true);
                vip_show.setString(m_sCreateRoom[ii].explain);
            } else {
                vip_show.setVisible(false);
            }
            this.layout[ii].five_Input = new InputExView(five_Input, true);
            this.layout[ii].five_Input.setFontColor(cc.color(147, 100, 46), cc.color(147, 100, 46));
            this.layout[ii].five_Input.setEditBox(3, 1, 1);
            this.selectChkBox(this.layout[ii].one, 0, true);
            this.selectChkBox(this.layout[ii].two, 0, true);
            this.selectChkBox(this.layout[ii].three, 0, true);
            this.selectChkBox(this.layout[ii].four, 0, true);
            this.setlowestgold(ii);
        }
        if (this.layout[this.current]) {
            this.layout[this.current].setVisible(false);
        }
        this.layout[ii].setVisible(true);
        this.setlowestgold(ii);
        this.current = ii;
    },
    onGoldInfo: function () {
        var self = this;
        var bring = self.layout[self.current].five_Input.getString();
        var temp = /^\d+$/;
        if (bring == null || bring == "") {
            return "输入金币为空!";
        }
        if (parseInt(bring) == 0) {
            return "输入金币不能为0！";
        }
        var bool_bring = temp.test(bring);
        if (!bool_bring) {
            return "输入金币必须为正整数!";
        }
        if (parseInt(KKVS.KGOLD) < parseInt(bring)) {
            return "输入金币大于身上携带金币!";
        }

        return "success";
    },
    getBody : function () {
        return this.body;
    },
    getLayer : function () {
        return this._layer;
    },
    on_player_join_room:function  () {
        // body...
        this.close();
    },
    onEnter: function() {
        this._super();
        // 创建房间
        KKVS.Event.register("on_player_join_room", this, "on_player_join_room");
    },
    onExit: function() {
        this._super();
        KKVS.Event.deregister("on_player_join_room", this);
    }
});