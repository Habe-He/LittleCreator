var DialogViewComp = require('./../widget/DialogViewComp');
var Tool = require('./../tool/Tool');
var md5 = require("./../tool/md5");
var KKVS = require("./../plugin/KKVS");

var gameEngine = require('./../plugin/gameEngine');

cc.Class({
    extends: DialogViewComp,

    properties: {
    },
    init : function (data) {
        this.prefab = "perfabs/MailDialog";
        this._body = null;
        this._modalLayer = null;
        this._data = data;
    },
    onLoadRes : function (prefabNode) {
        this._modalLayer = cc.find("back", prefabNode);
        this._body = cc.find("body", prefabNode);
        prefabNode.on("click", function () {
            this.node.close();
        }, this);
        var lqbtn = cc.find("body/Button", prefabNode);
        lqbtn.on("click", function () {
            cc.log("lqbtn click");
            gameEngine.app.player().req_opt_mail(this._data.id, this._data.type);
            this.node.close();
        }, this);
        if (this._data.type == 1) {
            lqbtn.active = true;
        } else {
            lqbtn.active = false;
            gameEngine.app.player().req_opt_mail(this._data.id, this._data.type);
        }
        
        cc.find("body/text_1", prefabNode).getComponent(cc.Label).string = this._data.from;
        cc.find("body/text_2", prefabNode).getComponent(cc.Label).string = this._data.body;
        this.addEvent();
    },
    getBody : function () {
        return this._body;
    },
    getModalLayer : function () {
        // return this._modalLayer;
    },
    wait : function (time, cb) {
        if (!this.node) {
            return;
        }
        this.node.stopAllActions();
        this.node.runAction(cc.sequence(cc.delayTime(time), cc.callFunc(cb)));
    },
    cancelWait : function () {
        if (!this.node) {
            return;
        }
        this.node.stopAllActions();
    },
    addEvent : function () {
    },
    onDestroy : function () {
    }
});
