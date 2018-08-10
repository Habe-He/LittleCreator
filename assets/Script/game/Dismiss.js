var KKVS = require("./../plugin/KKVS");
var gameModel = require('./gameModel');
var Tool = require('./../tool/Tool');
var gameEngine = require('./../plugin/gameEngine');

cc.Class({
    extends: cc.Component,

    properties: {},

    onLoad() {
        this.nodeArray = [];
        KKVS.Event.register("updateUserDismiss" ,this ,"updateUserDismiss");
        KKVS.Event.register("reMoveFrom" ,this ,"reMoveFrom");
    }, 

    start() {
        var self = this;

        var bg = this.node.getChildByName("bg");

        self.agreeBtn = bg.getChildByName('agreeBtn').getComponent(cc.Button);
        self.disAgreeBtn = bg.getChildByName('Disagree').getComponent(cc.Button);
        self.agreeBtn.node.on("click", function() {
            cc.log("点击同意");
            gameEngine.app.player().request_disband_game(KKVS.myChairID, 1);
        }, this);

        self.disAgreeBtn.node.on("click", function() {
            cc.log("点击拒绝");
            gameEngine.app.player().request_disband_game(KKVS.myChairID, 0);
        }, this);

        var userInfo = bg.getChildByName('userInfo');
        for (var i = 0; i < 3; ++i) {
            var nodeInfo = userInfo.getChildByName("Node_" + i.toString());
            nodeInfo.active = false;

            var headBg = nodeInfo.getChildByName("headBg");
            var head = headBg.getChildByName("headIcon").getComponent(cc.Sprite);
            var headFrame = nodeInfo.getChildByName('headFrame');
            var userName = nodeInfo.getChildByName('userName').getComponent(cc.Label);
            var state_1 = nodeInfo.getChildByName('state_01');
            var state_2 = nodeInfo.getChildByName('state_02');
            var state_3 = nodeInfo.getChildByName('state_03');
            var faqiren = nodeInfo.getChildByName('faqiIcon');

            var data = {
                'nodeInfo': nodeInfo,
                'headBg': headBg,
                'head': head,
                'headFrame': headFrame,
                'userName': userName,
                'state_1': state_1,
                'state_2': state_2,
                'state_3': state_3,
                'faqiren': faqiren
            };
            this.nodeArray.push(data);
        }
        cc.log('222222222222222222');
        // this.node.active = false;
        this.showResult(this.mAgreeArray,
            this.mLastResult,
            this.mFristName);

    },

    updateUserDismiss: function() {
        return;
        var self = this;
        for (var i = 0; i < gameModel.playerData.length; ++i) {
            this.nodeArray[i].nodeInfo.active = true;
            this.nodeArray[i].userName.string = Tool.InterceptDiyStr(Tool.encryptMoblieNumber(gameModel.playerData[i].name), 5) ;
            this.nodeArray[i].state_1.active = true;
            this.loadResBySprite(this.nodeArray[i].head, gameModel.playerData[i].head_url);
        }
    },

    setData: function(mAgreeArray, mLastResult, mFristName){
        this.mAgreeArray = mAgreeArray;
        this.mLastResult = mLastResult;
        this.mFristName = mFristName;

    },
    
    showResult: function(mAgreeArray, mLastResult, mFristName) {
        // mLastResult -1继续等待 0解散失败 1解散成功
        // mAgreeArray -1继续等待 0 不同意 1 同意
        cc.log("this.nodeArray = " + this.nodeArray.length);
        var self = this;
        for (var i = 0; i < gameModel.playerData.length; ++i) {
            var cID = gameModel.playerData[i].chairID;
            this.nodeArray[cID].nodeInfo.active = true;
            this.nodeArray[cID].userName.string = Tool.InterceptDiyStr(Tool.encryptMoblieNumber(gameModel.playerData[i].name), 5) ;
            this.nodeArray[cID].state_1.active = true;
            Tool.weChatHeadFile(this.nodeArray[cID].head, gameModel.playerData[i].head_url, null);
        }

        for (var i = 0; i < mAgreeArray.length; ++i) {
            if (mAgreeArray[i] == 0) {
                this.nodeArray[i].state_1.active = false;
                this.nodeArray[i].state_3.active = true;
            } else if (mAgreeArray[i] == 1) {
                this.nodeArray[i].state_1.active = false;
                this.nodeArray[i].state_2.active = true;
            }

            if (i == KKVS.myChairID) {
                if (mAgreeArray[i] != -1) {
                    self.agreeBtn.node.active = false;
                    self.disAgreeBtn.node.active = false;
                }
            }
        }

        for (var i = 0; i < gameModel.playerData.length; ++i) {
            var cID = gameModel.playerData[i].chairID;
            cc.log("cid " + cID);
            cc.log("mFristName " + mFristName);
            cc.log("gameModel.playerData[i].name = " + gameModel.playerData[i].name);
            if (gameModel.playerData[i].name == mFristName) {
                this.nodeArray[cID].faqiren.active = true;
            } else {
                this.nodeArray[cID].faqiren.active = false;
            }
        }

        if (mLastResult == 0) {
            this.reMoveFrom();
        } else if (mLastResult == 1) {
            this.reMoveFrom();
        }
    },

    reMoveFrom: function() {
        // KKVS.Event.fire("DisssRemove");
        this.node.destroy();
        
    },

    onDestroy() {
        KKVS.Event.deregister("updateUserDismiss", this);
        KKVS.Event.deregister("reMoveFrom", this);
    },
});