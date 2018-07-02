/**
 * Created by hades on 2017/2/28.
 */
modulelobby.TxtDialog = modulelobby.DialogView.extend({
    ctor : function (data) {
        this._super();
        this._title = data.title || "";
        this._txt = data.txt || "";
        this._halign = data.halign;
        this._valign = data.valign;
        this._type = data.type; //0 = 无按钮(此时colse buton自动加上去), 1 = 1个按钮, 2 = 2个按钮
        this._type = (this._type == 0 || this._type == 1 || this._type == 2) ? this._type : 1;
        this._cb = data.cb;
        this._target = data.target;
        this._param = data.param;
        this._cb2 = data.cb2;
        this._target2 = data.target2;
        this._param2 = data.param2;

        var json = ccs.load("res/dialog_ui.json");
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
        var title_txt = body.getChildByName("title_txt");
        title_txt.ignoreContentAdaptWithSize(true);
        var msg_txt = body.getChildByName("msg_txt");
        var close_btn = body.getChildByName("close_btn");
        var ok_btn = body.getChildByName("ok_btn");
        var yes_btn = body.getChildByName("yes_btn");
        var no_btn = body.getChildByName("no_btn");

        close_btn.setVisible(false);
        this._close_btn = close_btn;
        title_txt.setString(this._title);
        msg_txt.setString(this._txt);
        if (this._halign == cc.TEXT_ALIGNMENT_LEFT || this._halign == cc.TEXT_ALIGNMENT_CENTER || this._halign == cc.TEXT_ALIGNMENT_RIGHT) {
            msg_txt.setTextHorizontalAlignment(this._halign);
        }
        if (this._valign == cc.VERTICAL_TEXT_ALIGNMENT_TOP || this._valign == cc.VERTICAL_TEXT_ALIGNMENT_CENTER || this._valign == cc.VERTICAL_TEXT_ALIGNMENT_BOTTOM) {
            msg_txt.setTextVerticalAlignment(this._valign);
        }
        if (this._type == 0) {
            ok_btn.setVisible(false);
            yes_btn.setVisible(false);
            no_btn.setVisible(false);
            this.addCloseButton();
        } else if (this._type == 1) {
            ok_btn.setVisible(true);
            yes_btn.setVisible(false);
            no_btn.setVisible(false);
            ok_btn.addClickEventListener(function() {
                ok_btn.setTouchEnabled(false);
                playEffect();
                self.close();
                if (typeof (self._cb) == 'function') {
                    if (self._target) {
                        self._cb.call(self._target, self._param);
                    } else {
                        self._cb(self._param);
                    }
                }
            });
        } else {
            ok_btn.setVisible(false);
            yes_btn.setVisible(true);
            no_btn.setVisible(true);
            no_btn.addClickEventListener(function() {
                no_btn.setTouchEnabled(false);
                playEffect();
                self.close();
                if (typeof (self._cb2) == 'function') {
                    if (self._target2) {
                        self._cb2.call(self._target2, self._param2);
                    } else {
                        self._cb2(self._param2);
                    }
                }
            });
            yes_btn.addClickEventListener(function() {
                yes_btn.setTouchEnabled(false);
                playEffect();
                self.close();
                if (typeof (self._cb) == 'function') {
                    if (self._target) {
                        self._cb.call(self._target, self._param);
                    } else {
                        self._cb(self._param);
                    }
                }
            });
        }
        close_btn.addClickEventListener(function() {
            close_btn.setTouchEnabled(false);
            playEffect();
            self.close();
        });

        return true;
    },
    addCloseButton : function () {
        this._close_btn.setVisible(true);
    },
    getBody : function () {
        return this._body;
    },
    getLayer : function () {
        return this._layer;
    }
});