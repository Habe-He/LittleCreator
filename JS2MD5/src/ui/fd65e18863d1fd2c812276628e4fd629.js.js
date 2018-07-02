modulelobby.RankingList = modulelobby.DialogView.extend({
    ctor: function () {
        this._super();
        var self = this;
        var json = ccs.load("res/ranking_list.json");
        var visibleSize = cc.director.getVisibleSize();
        var origin = cc.director.getVisibleOrigin();
        json.node.x = origin.x + visibleSize.width / 2 - json.node.getContentSize().width / 2;
        json.node.y = origin.y + visibleSize.height / 2 - json.node.getContentSize().height / 2;
        this.addChild(json.node);
        this.m_pRankingListTag = 0;
        this.layout = json.node.getChildByName("body");
        this.layout.setVisible(false);
        var body = json.node.getChildByName("bg");
        this.body = body;
        var btn = [];
        for (var i = 0; i < 2; ++i) {
            btn[i] = body.getChildByName("btn_" + i.toString());
            btn[i].png_1 = btn[i].getChildByName("png_1");
            btn[i].png_2 = btn[i].getChildByName("png_2");
        }
        btn[0].setTouchEnabled(false);
        this.listview = [];
        for (var ii = 0; ii < 2; ++ii) {
            this.listview[ii] = body.getChildByName("view_" + ii.toString());
        }
        for (var k = 0, len = btn.length; k < len; ++k) {
            btn[k].setTag(k);
            btn[k].addClickEventListener(function (sender) {
                playEffect();
                for (var n = 0; n < len; ++n) {
                    if (n == sender.getTag()) {
                        btn[n].setTouchEnabled(false);
                        btn[n].png_1.setVisible(true);
                        btn[n].png_2.setVisible(true);
                        self.listview[n].setVisible(true);
                    } else {
                        btn[n].setTouchEnabled(true);
                        btn[n].png_1.setVisible(false);
                        btn[n].png_2.setVisible(false);
                        self.listview[n].setVisible(false);
                    }
                }
            });
        }
        this.btn_exit = body.getChildByName("btn_exit");
        this.btn_exit.png = this.btn_exit.getChildByName("png");
        this.btn_exit.addClickEventListener(function(){
            playEffect();
            if (!modulelobby.isScreenLocked()) {
                modulelobby.lockScreen(0.6);
                if (self.m_pRankingListTag) {
                    self._hide();
                }else {
                    self._display();
                }
            }
        });
        var began = cc.p(0, 0);
        var end = cc.p(0, 0);
        this.layout.addTouchEventListener(function(sender, type){
            switch (type) {
                case ccui.Widget.TOUCH_BEGAN:
                    began = sender.getTouchBeganPosition();
                    break;
                case ccui.Widget.TOUCH_ENDED:
                    sender.setTouchEnabled(false);
                    sender.runAction(cc.sequence(cc.delayTime(0.5), cc.callFunc(function () {
                        sender.setTouchEnabled(true);
                    })));
                    end = sender.getTouchEndPosition();
                    if (end.x - began.x <= 0) {
                        self._hide();
                    }
                    break;
                case ccui.Widget.TOUCH_CANCELED:
                    break;
                default:
                    break;
            }
        });
        this.red_list();
        this.rank_list();

        return true;
    },
    _display : function () {
        var self = this;
        this.m_pRankingListTag = 1;
        this.layout.setVisible(true);
        this.btn_exit.setTouchEnabled(false);
        this.body.setPosition(cc.p(-1708, 0));
        this.body.runAction(cc.sequence(cc.moveTo(0.5, cc.p(-960, 0)).easing(cc.easeElasticOut()), cc.callFunc(function() {
            self.btn_exit.setTouchEnabled(true);
            self.btn_exit.png.setSpriteFrame("lobby/rankinglist_13.png");
        })));
    },
    _hide : function () {
        var self = this;
        this.m_pRankingListTag = 0;
        this.btn_exit.setTouchEnabled(false);
        this.body.runAction(cc.sequence(cc.moveTo(0.5, cc.p(-1708, 0)).easing(cc.easeElasticOut()), cc.callFunc(function() {
            self.btn_exit.setTouchEnabled(true);
            self.layout.setVisible(false);
            self.btn_exit.png.setSpriteFrame("lobby/rankinglist_14.png");
        })));

    },
    red_list : function () {
        this.listview[0].setItemModel(this.listview[0].getItem(0));
        this.listview[0].removeItem(0);

        for (var i = 0, len = KKVS.RedList.length; i < len; ++i) {
            this.listview[0].pushBackDefaultItem();
            var item = this.listview[0].getItem(this.listview[0].getItems().length - 1);
            item._image = item.getChildByName("image");
            item.png_1 = item._image.getChildByName("png_1");
            item.text_1 = item._image.getChildByName("text_1");
            if (i < 3) {
                item.png_1.setVisible(true);
                item.png_1.loadTexture("lobby/rankinglist_0" + (5 + i).toString() +".png", ccui.Widget.PLIST_TEXTURE);
                item.png_1.ignoreContentAdaptWithSize(true);
                item.text_1.setVisible(false);
            }else {
                item.png_1.setVisible(false);
                item.text_1.setVisible(true);
                item.text_1.ignoreContentAdaptWithSize(true);
                item.text_1.setString((i + 1).toString());
            }
            item.png_2 = item._image.getChildByName("png_2");
            var face;
            if (typeof (KKVS.RedList[i].head) != 'number') {
                KKVS.RedList[i].head = 1;
            }
            if (typeof (KKVS.RedList[i].gender) != 'number') {
                KKVS.RedList[i].gender = 1;
            }
            KKVS.RedList[i].head = Math.floor(KKVS.RedList[i].head);
            KKVS.RedList[i].head = (KKVS.RedList[i].head < 1 || 10 < KKVS.RedList[i].head) ? 1 : KKVS.RedList[i].head;
            if (KKVS.RedList[i].gender == 0) {//0=men, 1=women
                face = "res/ui/icon/face_" + KKVS.RedList[i].head.toString() + "_m.png";
            } else {
                face = "res/ui/icon/face_" + KKVS.RedList[i].head.toString() + ".png";
            }
            item.png_2.loadTexture(face, ccui.Widget.LOCAL_TEXTURE);
            item.text_2 = item._image.getChildByName("text_2");
            item.text_2.ignoreContentAdaptWithSize(true);
            item.text_2.setString(InterceptDiyStr(encryptMoblieNumber(KKVS.RedList[i].nick_name), 5));
            item.text_3 = item._image.getChildByName("text_3");
            item.text_3.ignoreContentAdaptWithSize(true);
            item.text_3.setString(getRedPacketTxt(KKVS.RedList[i].prop_num.low));
            item._image.setTag(i);
            item._image.addTouchEventListener(function(sender, type) {
                switch (type) {
                    case ccui.Widget.TOUCH_ENDED:
                        sender.setTouchEnabled(false);
                        sender.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function() {
                            sender.setTouchEnabled(true);
                        })));
                        playEffect();
                        var data = {gender : KKVS.RedList[sender.getTag()].gender,
                            face_id : KKVS.RedList[sender.getTag()].head,
                            nick_name : KKVS.RedList[sender.getTag()].nick_name,
                            money : KKVS.RedList[sender.getTag()].game_money.low,
                            sign : KKVS.RedList[sender.getTag()].sign,
                            win : KKVS.RedList[sender.getTag()].fight[0].win_times.low,
                            lose : KKVS.RedList[sender.getTag()].fight[0].lose_times.low};
                        (new modulelobby.Personal(data)).show();
                        break;
                    default:
                        break;
                }
            });
        }
        cc.log("->红包排行榜");
    },
    rank_list : function () {
        this.listview[1].setItemModel(this.listview[1].getItem(0));
        this.listview[1].removeItem(0);

        for (var i = 0, len = KKVS.RankList.length; i < len; ++i) {
            this.listview[1].pushBackDefaultItem();
            var item = this.listview[1].getItem(this.listview[1].getItems().length - 1);
            item._image = item.getChildByName("image");
            item.png_1 = item._image.getChildByName("png_1");
            item.text_1 = item._image.getChildByName("text_1");
            if (i < 3) {
                item.png_1.setVisible(true);
                item.png_1.loadTexture("lobby/rankinglist_0" + (5 + i).toString() +".png", ccui.Widget.PLIST_TEXTURE);
                item.png_1.ignoreContentAdaptWithSize(true);
                item.text_1.setVisible(false);
            }else {
                item.png_1.setVisible(false);
                item.text_1.setVisible(true);
                item.text_1.ignoreContentAdaptWithSize(true);
                item.text_1.setString((i + 1).toString());
            }
            item.png_2 = item._image.getChildByName("png_2");
            var face;
            if (typeof (KKVS.RankList[i].head) != 'number') {
                KKVS.RankList[i].head = 1;
            }
            if (typeof (KKVS.RankList[i].gender) != 'number') {
                KKVS.RankList[i].gender = 1;
            }
            KKVS.RankList[i].head = Math.floor(KKVS.RankList[i].head);
            KKVS.RankList[i].head = (KKVS.RankList[i].head < 1 || 10 < KKVS.RankList[i].head) ? 1 : KKVS.RankList[i].head;
            if (KKVS.RankList[i].gender == 0) {//0=men, 1=women
                face = "res/ui/icon/face_" + KKVS.RankList[i].head.toString() + "_m.png";
            } else {
                face = "res/ui/icon/face_" + KKVS.RankList[i].head.toString() + ".png";
            }
            item.png_2.loadTexture(face, ccui.Widget.LOCAL_TEXTURE);
            item.text_2 = item._image.getChildByName("text_2");
            item.text_2.ignoreContentAdaptWithSize(true);
            item.text_2.setString(InterceptDiyStr(encryptMoblieNumber(KKVS.RankList[i].nick_name), 5));
            item.text_3 = item._image.getChildByName("text_3");
            item.text_3.ignoreContentAdaptWithSize(true);
            item.text_3.setString(getGoldTxt(KKVS.RankList[i].game_money.low));
            item._image.setTag(i);
            item._image.addTouchEventListener(function(sender, type) {
                switch (type) {
                    case ccui.Widget.TOUCH_ENDED:
                        sender.setTouchEnabled(false);
                        sender.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function() {
                            sender.setTouchEnabled(true);
                        })));
                        playEffect();
                        var win = 0;
                        var lose = 0;
                        for (var n = 0, onlen = KKVS.OnRankList.length; n < onlen; ++n) {
                            if (KKVS.RankList[sender.getTag()].player_dbid.low == KKVS.OnRankList[n].player_dbid.low) {
                                win = KKVS.OnRankList[n].win_times.low;
                                lose = KKVS.OnRankList[n].lose_times.low;
                                break;
                            }
                        }
                        var data = {gender : KKVS.RankList[sender.getTag()].gender,
                            face_id : KKVS.RankList[sender.getTag()].head,
                            nick_name : KKVS.RankList[sender.getTag()].nick_name,
                            money : KKVS.RankList[sender.getTag()].game_money.low,
                            sign : KKVS.RankList[sender.getTag()].sign,
                            win : win,
                            lose : lose};
                        (new modulelobby.Personal(data)).show();
                        break;
                    default:
                        break;
                }
            });
        }
        cc.log("->金币排行榜");
    },
    onEnter : function () {
        this._super();
        cc.spriteFrameCache.addSpriteFrames("res/ui/lobby/lobby_0.plist", "res/ui/lobby/lobby_0.png");
    },
    onExit : function () {
        this._super();
    }
});





modulelobby.Personal = modulelobby.DialogView.extend({
    ctor: function (data) {
        //var data = {gender, face_id, nick_name, money, sign, win, lose};
        this._super();
        var self = this;
        var json = ccs.load("res/personal.json");
        var visibleSize = cc.director.getVisibleSize();
        var origin = cc.director.getVisibleOrigin();
        json.node.x = origin.x + visibleSize.width / 2 - json.node.getContentSize().width / 2;
        json.node.y = origin.y + visibleSize.height / 2 - json.node.getContentSize().height / 2;
        this.addChild(json.node);

        this._layer = json.node.getChildByName("body");
        var body = json.node.getChildByName("bg");
        this.body = body;
        var head = body.getChildByName("head_node").getChildByName("head");//头像
        var face;
        if (data.gender == 0) {//0=men, 1=women
            face = "res/ui/icon/face_" + data.face_id.toString() + "_m.png";
        } else {
            face = "res/ui/icon/face_" + data.face_id.toString() + ".png";
        }
        head.loadTexture(face, ccui.Widget.LOCAL_TEXTURE);
        var name = body.getChildByName("name");//名字
        name.ignoreContentAdaptWithSize(true);
        name.setString(encryptMoblieNumber(data.nick_name));
        var gold = body.getChildByName("gold");//金币
        gold.ignoreContentAdaptWithSize(true);
        gold.setString(getGoldTxt(data.money));
        var win_text = body.getChildByName("png_7").getChildByName("win_text");//胜
        win_text.ignoreContentAdaptWithSize(true);
        win_text.setString(data.win.toString());
        var lose_text = body.getChildByName("png_7").getChildByName("lose_text");//输
        lose_text.ignoreContentAdaptWithSize(true);
        lose_text.setString(data.lose.toString());
        var trades_text = body.getChildByName("png_10").getChildByName("text");//签名
        trades_text.setString(data.sign);
        var btn_exit = body.getChildByName("btn_exit");
        btn_exit.addClickEventListener(function(sender){
            sender.setTouchEnabled(false);
            playEffect();
            self.close();
        });

        return true;
    },
    getBody : function () {
        return this.body;
    },
    getLayer : function () {
        return this._layer;
    }
});