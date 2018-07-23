var getDialogViewShowAction = function () {
    return cc.spawn(cc.fadeTo(0.08, 255), cc.sequence(cc.scaleTo(0.08, 1.05), cc.scaleTo(0.125, 1)));
};
var getDialogViewCloseAction = function () {
    return cc.spawn(cc.sequence(cc.delayTime(0.08), cc.fadeTo(0.125, 0)), cc.sequence(cc.scaleTo(0.08, 1.05), cc.scaleTo(0.125, 0.8)));
};

var ViewComp = require('ViewComp');
cc.Class({
    extends: ViewComp,
    properties: {
        autoAnimate : true
    },
    ctor : function () {
        //cc.log("=> DialogViewComponent::ctor");
        this._action = null;
    },
    init : function (args) {
        //cc.log("=> DialogViewComponent::init");
    },
    getBody : function () {
        //cc.log("=> DialogViewComponent::getBody");
        return null;
    },
    getModalLayer : function () {
        //cc.log("=> DialogViewComponent::getModalLayer");
        return null;
    },
    onLoadResDidFinish : function (prefabNode) {
        //cc.log("=> DialogViewComponent::onLoadResDidFinish");
        var action = this._action;
        this._action = null;
        var body = this.getBody();
        var layer = this.getModalLayer();
        if (layer) {
            layer.on(cc.Node.EventType.TOUCH_START, function (event) {
                event.stopPropagation();
                cc.log("=> modalLayer touch");
            });
        }
        if (this.autoAnimate && body) {
            body.setScale(0.8);
            //body.setCascadeOpacityEnabled(false);
            body.opacity = 122;
            body.active = false;
            action = action ? action : getDialogViewShowAction();
            if (layer) {
                //layer.setCascadeOpacityEnabled(false);
                layer.opacity = 0;
                layer.runAction(cc.sequence(cc.fadeTo(0.2, 180), cc.callFunc(function() {
                    body.active = true;
                    body.runAction(action);
                })));
            } else {
                body.active = true;
                body.runAction(action);
            }
        }
    },
    //private
    _show : function (args, action) {
        //cc.log("=> DialogViewComponent::_show");
        this._action = action;
        this.init(args);
    },
    _close : function (action) {
        //cc.log("=> DialogViewComponent::_close");
        var self = this;
        var body = this.getBody();
        if (this.autoAnimate && body) {
            action = action ? action : getDialogViewCloseAction();
            body.runAction(cc.sequence(action, cc.callFunc(function () {
                self.node.destroy();
            })));
        } else {
            self.node.destroy();
        }
    }
});