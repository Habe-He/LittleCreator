//modulelobby.SetDialog = modulelobby.DialogView.extend({
//    ctor : function () {
//        this._super();
//
//        var json = ccs.load("res/setdialog_ui.json");
//        var visibleSize = cc.director.getVisibleSize();
//        var origin = cc.director.getVisibleOrigin();
//        json.node.x = origin.x + visibleSize.width / 2 - json.node.getContentSize().width / 2;
//        json.node.y = origin.y + visibleSize.height / 2 - json.node.getContentSize().height / 2;
//        this.addChild(json.node);
//        var rootNode = json.node;
//        var self = this;
//        var body = rootNode.getChildByName("body");
//        this._body = body;
//        var music_box = body.getChildByName("music_box").getChildByName("slider");
//        var sound_box = body.getChildByName("sound_box").getChildByName("slider");
//        var close_btn = body.getChildByName("close_btn");
//        var logout_btn = body.getChildByName("logout_btn");
//        close_btn.addClickEventListener(function() {
//            close_btn.setTouchEnabled(false);
//            self.close();
//        });
//        logout_btn.addClickEventListener(function() {
//            logout_btn.setTouchEnabled(false);
//            self.close();
//            modulelobby.runScene(modulelobby.Login);
//        });
//        this.setSelected(music_box, MUSIC_OPEN);
//        this.setSelected(sound_box, EFFECT_OPEN);
//        music_box.addEventListener(function (sender, type) {
//            switch (type) {
//                case 2: //up
//                    var temp_open = MUSIC_OPEN;
//                    MUSIC_OPEN = 50 < sender.getPercent() ? true : false;
//                    self.setSelected(sender, MUSIC_OPEN);
//                    if (temp_open != MUSIC_OPEN) {
//                        if (MUSIC_OPEN) {
//                            playMusic();
//                        } else {
//                            stopMusic();
//                        }
//                    }
//                    break;
//                default :
//                    break;
//            }
//        });
//        sound_box.addEventListener(function (sender, type) {
//            switch (type) {
//                case 2: //up
//                    EFFECT_OPEN = 50 < sender.getPercent() ? true : false;
//                    self.setSelected(sender, EFFECT_OPEN);
//                    break;
//                default :
//                    break;
//            }
//        });
//
//        return true;
//    },
//    getBody : function () {
//        return this._body;
//    },
//    setSelected : function (box, select) {
//        var open = select ? 100 : 0;
//        box.setPercent(open);
//    }
//});
modulelobby.SetDialog = modulelobby.DialogView.extend({
    ctor : function () {
        this._super();

        var json = ccs.load("res/setdialog_ui.json");
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
        var music_box = body.getChildByName("music_box").getChildByName("slider");
        var music_boxbg = body.getChildByName("music_box").getChildByName("bg");
        var sound_box = body.getChildByName("sound_box").getChildByName("slider");
        var sound_boxbg = body.getChildByName("sound_box").getChildByName("bg");
        var close_btn = body.getChildByName("close_btn");
        var logout_btn = body.getChildByName("logout_btn");
        close_btn.addClickEventListener(function() {
            close_btn.setTouchEnabled(false);
            playEffect();
            self.close();
        });
        logout_btn.addClickEventListener(function() {
            logout_btn.setTouchEnabled(false);
            playEffect();
            self.close();
            modulelobby.rootScene(modulelobby.Login);
        });
        this.setSelected(music_boxbg, MUSIC_OPEN);
        this.setSelected(sound_boxbg, EFFECT_OPEN);
        music_box.addClickEventListener(function (sender) {
            sender.setTouchEnabled(false);
            sender.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function() {
                sender.setTouchEnabled(true);
            })));
            playEffect();
            var temp_open = MUSIC_OPEN;
            MUSIC_OPEN = 0 < music_boxbg.getPositionX() ? false : true;
            self.setSelected(music_boxbg, MUSIC_OPEN);
            if (temp_open != MUSIC_OPEN) {
                if (MUSIC_OPEN) {
                    playMusic();
                } else {
                    stopMusic();
                }
            }
        });
        sound_box.addClickEventListener(function (sender) {
            sender.setTouchEnabled(false);
            sender.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function() {
                sender.setTouchEnabled(true);
            })));
            playEffect();
            EFFECT_OPEN = 0 < sound_boxbg.getPositionX() ? false : true;
            self.setSelected(sound_boxbg, EFFECT_OPEN);
        });

        return true;
    },
    getBody : function () {
        return this._body;
    },
    getLayer : function () {
        return this._layer;
    },
    setSelected : function (box, select) {
        var open = select ? cc.p(112, -10) : cc.p(-70, -10);
        box.setPosition(open);
    }
});