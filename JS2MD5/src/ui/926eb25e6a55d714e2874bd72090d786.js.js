modulelobby.RuleDialog = modulelobby.DialogView.extend({
    ctor : function (param) {
        this._super();

        var json = ccs.load("res/noticedialog_ui.json");
        var visibleSize = cc.director.getVisibleSize();
        var origin = cc.director.getVisibleOrigin();
        json.node.x = origin.x + visibleSize.width / 2 - json.node.getContentSize().width / 2;
        json.node.y = origin.y + visibleSize.height / 2 - json.node.getContentSize().height / 2;
        this.addChild(json.node);
        var rootNode = json.node;
        var self = this;
        this._layer = rootNode.getChildByName("back");
        var body = rootNode.getChildByName("body");
        this._body = body;
        this._title_txt = body.getChildByName("title_txt");
        this._title_txt.ignoreContentAdaptWithSize(true);
        this._noticeview = body.getChildByName("noticeview");
        this._content = this._noticeview.getChildByName("content");
        var close_btn = body.getChildByName("close_btn");
        close_btn.addClickEventListener(function() {
            close_btn.setTouchEnabled(false);
            playEffect();
            self.close();
        });

        this.m_pColorDefault = cc.color(178, 102, 27);
        this._title_txt.setString("游戏规则");
        this.addContent(!param ? "暂无" : param);
        return true;
    },
    getBody : function () {
        return this._body;
    },
    getLayer : function () {
        return this._layer;
    },
    onEnter : function () {
        this._super();
    },
    onExit : function () {
        this._super();
    },
    addContent : function (data) {
        var c_size = this._noticeview.getInnerContainerSize(); //this._content.getContentSize();
        var richText = new ccui.RichText();
        richText.ignoreContentAdaptWithSize(false);
        richText.setContentSize(c_size.width, 0);
        richText.setAnchorPoint(cc.p(0.5, 0.5)); //请把这个值强制设置为(0.5, 0.5)
        var r_text = new ccui.RichElementText(1, this.m_pColorDefault, 255, data, "res/fonts/tengxiangyuan.ttf", 35);
        richText.pushBackElement(r_text);
        richText.formatText(); //修改引擎RichText::formatRenderers()
        this._content.removeFromParent();
        var rt_size = richText.getContentSize();
        if (c_size.height < rt_size.height) {
            richText.setPosition(rt_size.width * 0.5, rt_size.height * 0.5);
            this._noticeview.setInnerContainerSize(rt_size);
        } else {
            richText.setPosition(rt_size.width * 0.5, c_size.height - rt_size.height * 0.5);
        }
        this._noticeview.getInnerContainer().addChild(richText);
    }
});