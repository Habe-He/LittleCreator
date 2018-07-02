modulelobby.FaceDialog = modulelobby.DialogView.extend({
    ctor : function (gender) {
        this._super();
        this.opt_obj = null;
        var json = ccs.load("res/facedialog_ui.json");
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
        var close_btn = body.getChildByName("close_btn");
        close_btn.addClickEventListener(function(sender) {
            close_btn.setTouchEnabled(false);
            playEffect();
            self.close();
        });

        //face
        var opt_lock = false; //单一操作锁
        for (var i = 1; i <= 10; ++i) {
            var face_btn = body.getChildByName("face_" + i.toString());
            face_btn.setTag(i);
            var face = getFace(i, gender);
            face_btn.loadTextureNormal(face.png, ccui.Widget.LOCAL_TEXTURE);
            face_btn.addClickEventListener(function (sender) {
                if (opt_lock) {
                    return;
                }
                opt_lock = true;
                sender.setTouchEnabled(false);
                playEffect();
                //sender.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function (tnode) {
                //    opt_lock = false;
                //    sender.setTouchEnabled(true);
                //})));
                var face_id = sender.getTag();
                //var params = {
                //    head_id : face_id
                //};
                //var datas = JSON.stringify(params);
                //modulelobby.showLoading(null, null, 10);
                //self.opt_obj = {type : PLAYER_MSG_ID_UPDATE_PLAYER_INFO, head_id : params.head_id};
                //KBEngine.app.player().req_player_msg(PLAYER_MSG_ID_UPDATE_PLAYER_INFO, datas);
                self.close();
                KKVS.Event.fire("setUserFace", face_id);
            });
        }
        return true;
    },
    getBody : function () {
        return this._body;
    },
    getLayer : function () {
        return this._layer;
    }
    //opt_ret : function (args) {
    //    if (args.code == 1) {
    //        //
    //    } else {
    //        this.opt_obj = null;
    //    }
    //},
    //on_player_msg : function (cmd) {
    //    modulelobby.hideLoading();
    //    if (this.opt_obj && this.opt_obj.type == cmd) {
    //        this.close();
    //        KKVS.Event.fire("setUserFace");
    //    }
    //    this.opt_obj = null;
    //},
    //onEnter : function () {
    //    cc.Node.prototype.onEnter.call(this);
    //    KKVS.Event.register("opt_ret", this, "opt_ret");
    //    KKVS.Event.register("on_player_msg", this, "on_player_msg");
    //},
    //onExit: function () {
    //    KKVS.Event.deregister("opt_ret", this);
    //    KKVS.Event.deregister("on_player_msg", this);
    //    cc.Node.prototype.onExit.call(this);
    //}
});