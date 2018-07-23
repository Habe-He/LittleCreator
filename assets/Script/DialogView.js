//node + component
//node => 载体
//component => 渲染ui
var DialogView = cc.Class({
    name : "DialogView",
    extends : cc.Node,
    properties : {
        component : {
            default : null,
            type : cc.Component
        },
    },
    //__ctor__ : function (args) {
    //    this._super();
    //    this._comObject = null;
    //    this._comArgs = args;
    //},
    ctor: function () {
        //cc.log("=> DialogView::ctor");
        this._comObject = null;
    },
    build : function (comp, args) {
        this.component = comp;
        this._comArgs = args;
        return this;
    },
    //init : function (comp, args) {
    //    this.component = comp;
    //    this._comArgs = args;
    //},
    show : function (scene, zorder, action) {
        //cc.log("=> DialogView::show");
        if (this.component == null) {
            cc.log("this.component is null");
            return;
        }
        this._comObject = this.addComponent(this.component);
        if (this._comObject == null) {
            cc.log("addComponent failed");
        } else {
            this._comObject._show(this._comArgs, action);
        }
        this._comArgs = null;
        if (!scene) {
            scene = cc.find("Canvas");
        }
        if (!zorder) {
            scene.addChild(this);
        } else {
            scene.addChild(this, zorder);
        }
    },
    close : function (action) {
        //cc.log("=> DialogView::close");
        if (this._comObject == null) {
            this.destroy();
        } else {
            this._comObject._close(action);
            this._comObject = null;
        }
    }
});

module.exports = DialogView;