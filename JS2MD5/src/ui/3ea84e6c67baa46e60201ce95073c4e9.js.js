modulelobby.NoticeBar = cc.Node.extend({
    ctor : function () {
        this._super();
        var json = ccs.load("res/noticebar_ui.json");
        this.addChild(json.node);
        var rootNode = json.node;
        var bg = rootNode.getChildByName("bg");
        this.m_pTxtBg = bg.getChildByName("txtBg");
        this.m_pSystemTxt = this.m_pTxtBg.getChildByName("txt");
        this.m_pSystemTxt.setAnchorPoint(0, 0.5);
        this.m_pSystemTxt.ignoreContentAdaptWithSize(true);
        this.m_pSystemInitPos = cc.p(this.m_pTxtBg.getContentSize().width, this.m_pTxtBg.getContentSize().height * 0.5);
        //{"id": id, "txt": 内容, "times" : 次数, "frequency" : 单位秒}
        KKVS.SystemNotice = typeof (KKVS.SystemNotice) != 'object' ? [] : KKVS.SystemNotice;//消息数据(即时)
        KKVS.NoticeUpdate = typeof (KKVS.NoticeUpdate) != 'boolean' ? true : KKVS.NoticeUpdate;//数据更新标记(即时)
        KKVS.NoticeTag = typeof (KKVS.NoticeTag) != 'boolean' ? false : KKVS.NoticeTag; //当前显示标志
        KKVS.NoticeIndex = typeof (KKVS.NoticeIndex) != 'number' ? 0 : KKVS.NoticeIndex;//当前消息下标
        KKVS.NoticeTick = typeof (KKVS.NoticeTick) != 'number' ? 0 : KKVS.NoticeTick;   //当前消息时长[单位:秒]
        this.setVisible(false);
        return true;
    },
    on_lobby_msg : function (cmd, params) {
        if (cmd == LOBBY_MSG_UPDATE_HORN) {
            KKVS.SystemNotice = [];
            KKVS.NoticeUpdate = true;
            this.m_pSystemTxt.stopAllActions();
            this.setVisible(false);
            KKVS.NoticeTag = false;
            KKVS.NoticeIndex = 0;
            KKVS.NoticeTick = 0;
        }
    },
    showNotice : function () {
        if (!KKVS.NoticeUpdate) {
            this._notice(KKVS.SystemNotice[KKVS.NoticeIndex], KKVS.NoticeTag);
        }
    },
    _notice : function (data, tag) {
        if (!data) {
            KKVS.NoticeTag = false;
            this.setVisible(false);
            return;
        }
        KKVS.NoticeTag = true;
        if (typeof (data.times) != 'number') {
            data.times = 1;
        }
        if (typeof (data.frequency) != 'number' || data.frequency == 0) {
            data.frequency = 5; //show time
        }
        this.setVisible(true);
        this.m_pSystemTxt.stopAllActions();
        this.m_pSystemTxt.setString(data.txt);
        var leftX = -this.m_pSystemTxt.getBoundingBox().width;
        var actions = [];
        var dt;
        if (!tag) {
            data.times -= 1;
            this.m_pSystemTxt.setPosition(this.m_pSystemInitPos);
            dt = data.frequency;
        } else {
            dt = (data.frequency - KKVS.NoticeTick < 0.1) ? 0.1 : (data.frequency - KKVS.NoticeTick);
            var dis = (this.m_pSystemInitPos.x - leftX) < 0 ? 0 : (this.m_pSystemInitPos.x - leftX);
            this.m_pSystemTxt.setPosition(this.m_pSystemInitPos.x - (dis / data.frequency) * KKVS.NoticeTick, this.m_pSystemInitPos.y);
        }
        actions.push(cc.moveTo(dt, cc.p(leftX, this.m_pSystemInitPos.y)));
        var callback = cc.callFunc(function() {
            KKVS.NoticeTag = false;
            this.setVisible(false);
        }, this);
        actions.push(callback);
        this.m_pSystemTxt.runAction(cc.sequence(actions));
    },
    work : function () {
        if (0 == KKVS.SystemNotice.length) {
            return;
        }
        if (KKVS.NoticeUpdate) {
            KKVS.NoticeUpdate = false;
        } else {
            if (KKVS.NoticeTag) {
                KKVS.NoticeTick += 1;
                return;
            }
            KKVS.NoticeTick = 0;
            var data = KKVS.SystemNotice[KKVS.NoticeIndex];
            if (typeof (data) == 'undefined') {
                KKVS.NoticeIndex = 0;
            } else {
                if (typeof (data.times) != 'number') {
                    data.times = 1;
                }
                if (data.times <= 0) {
                    KKVS.SystemNotice.splice(KKVS.NoticeIndex, 1);
                } else {
                    KKVS.NoticeIndex++;
                }
            }
        }
        KKVS.NoticeIndex = KKVS.SystemNotice.length <= KKVS.NoticeIndex ? 0 : KKVS.NoticeIndex;
        this._notice(KKVS.SystemNotice[KKVS.NoticeIndex], false);
    },
    onEnter : function () {
        this._super();
        KKVS.Event.register("on_lobby_msg", this, "on_lobby_msg");
        this.showNotice();
        this.schedule(this.work, 1, cc.REPEAT_FOREVER, 0.5);
    },
    onExit : function () {
        this.unschedule(this.work);
        KKVS.Event.deregister("on_lobby_msg", this);
        this._super();
    }
});