cc.Class({
    extends: cc.Component,
    properties: {
        prefab : "",
    },
    ctor : function () {
        //cc.log("=> ViewComponent::ctor");
    },
    onLoad : function () {
        //cc.log("=> ViewComponent::onLoad");
        if (this.prefab == "") {
            cc.log("this.prefab is empty");
            return;
        }
        cc.loader.loadRes(this.prefab, cc.Prefab, function (error, prefab) {
            if (error) {
                cc.log("loadRes [" + this.prefab + "] failed");
                return;
            }
            try {
                var prefabNode = cc.instantiate(prefab);
                this.onLoadRes(prefabNode);
                this.onLoadResDidFinish(prefabNode);
                this.node.addChild(prefabNode);
            } catch (e) {
                cc.log(e);
            }
        }.bind(this));
    },
    onLoadRes : function (prefabNode) {
        //cc.log("=> ViewComponent::onLoadRes");
    },
    onLoadResDidFinish : function (prefabNode) {
        //cc.log("=> ViewComponent::onLoadResDidFinish");
    }
});
