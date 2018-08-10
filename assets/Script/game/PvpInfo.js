var gameEngine = require('./../plugin/gameEngine');
var KKVS = require('./../plugin/KKVS');
var Tool = require('./../tool/Tool');

var PvpInfo = PvpInfo || {};

PvpInfo.Show = function () {

    var self = this;
    cc.loader.loadRes("perfabs/PvpInfo", cc.Prefab, function (error, prefab) {

        if (error) {
            cc.error(error);
            return;
        }
        // 实例 
        self._pvpInfo = cc.instantiate(prefab);
        self._pvpInfo.parent = cc.find('Canvas');
        var closeBtn = cc.find('bg/close', self._pvpInfo);
        var detailBtn = cc.find('bg/buttonDetail',self._pvpInfo);

        self.m_nodeArray = [];
        var leftNode = cc.find('bg/leftNode',self._pvpInfo);
        var middleNode = cc.find('bg/middleNode',self._pvpInfo);
        var rightNode = cc.find('bg/rightNode',self._pvpInfo);
        self.m_nodeArray.push(leftNode);
        self.m_nodeArray.push(middleNode);
        self.m_nodeArray.push(rightNode);

        self.iconArray = [];
        self.refreshInfo();
        
        closeBtn.on('click', self.closeClick, self);
        detailBtn.on('click',self.showDetailInfo,self);


    });

    self.refreshInfo = function(){
        var my_data = Tool.getLevelInfo(KKVS.PVPSCORES);
        cc.log("my_data.bigLevel = " + my_data.bigLevel);
        cc.log("my_data.star = " + my_data.star);
        cc.log("my_data.name = " + my_data.name);
        var array = [];
        if( my_data.bigLevel == 1) {
            array = [0,1,2];
        } else if( my_data.bigLevel == 7){
            array = [4,5,6];
        } else {
            array = [my_data.bigLevel - 2, my_data.bigLevel - 1 , my_data.bigLevel ];
        }

        for( var i = 0 ; i < 3; i++) {
            var node = self.m_nodeArray[i];
            var icon = node.getChildByName('pvpIcon').getComponent(cc.Sprite);
            var score = node.getChildByName('score').getComponent(cc.Label);
            var lock = node.getChildByName('lock');
            var reward_01 = node.getChildByName('reward_01');
            var rewardIcon_01 = reward_01.getChildByName('iconLevel').getComponent(cc.Sprite);
            var reawrdDesc_01 = reward_01.getChildByName('pro01_desc').getComponent(cc.Label);
            var reward_02 = node.getChildByName('reward_02');
            var rewardIcon_02 = reward_02.getChildByName('diamonds').getComponent(cc.Sprite);
            var reawrdDesc_02 = reward_02.getChildByName('pro02_desc').getComponent(cc.Label);
            var data = Tool.getLevelInfoByLevelId(array[i]);
            var files = "Lobby/Lv_" + (data.big_level - 1).toString();
            self.loadResIcon(icon , files);
            score.string = Tool.goldSplit(data.minScore) + " - " + Tool.goldSplit(data.maxScore);
            if( my_data.bigLevel >= data.big_level){
                icon.node.color = cc.color(255,255,255,255);;
                lock.active = false;
            } else{
                icon.node.color = cc.color(125,125,125,125);;
                lock.active = true;
            }

            if( my_data.bigLevel == data.big_level){
                icon.node.scale = 0.8;
            } else{
                icon.node.scale = 0.7;
            }

            if( data.reward_01 == 0){
                reward_01.active = false;
            } else{
                reward_01.active = true;
                var files_reward = "headFrame/headFrame_" + data.reward_01.toString();
                self.loadResIcon(rewardIcon_01 , files_reward);
            }
            // 图像2 默认不修改图标
            if( data.reward_02 == 0 ){
                reward_02.active = false;
            } else {
                reward_02.active = true;
                reawrdDesc_02.string = data.reward_02.toString();
            }
        }

        var bg = self._pvpInfo.getChildByName("bg");
        var labelDesc = bg.getChildByName("Desc").getComponent(cc.Label);
        var iconDesc = bg.getChildByName("unused_08").getComponent(cc.Sprite);
        var labelDesc_02 = bg.getChildByName("Desc_01").getComponent(cc.Label);

        if(my_data.bigLevel == 7){
            labelDesc.active = false;
            iconDesc.active = false;
            labelDesc_02.active = false;
        } else{
            labelDesc.active = true;
            iconDesc.active = true;
            labelDesc_02.active = true;

            var nextData = Tool.getLevelInfoByLevelId(my_data.bigLevel);
            var nextExp = nextData.minScore - KKVS.PVPSCORES;
            labelDesc.string = "距离下一个段位" +nextData.name + "还差";
            labelDesc_02.string = Tool.goldSplit(nextExp);
        }

    };


    self.loadResIcon = function(iconNode , files){
        cc.loader.loadRes(files, cc.SpriteFrame, function(err, spriteFrame) {
            if (err) {
                cc.log("Lobby getLobbyLevel err = " + err);
                return;
            }
            iconNode.spriteFrame = spriteFrame
        });
    },

    self.showDetailInfo = function(event){
        cc.log("showDetailInfo");
        var detailInfo = require('./PVPDetail');
        detailInfo.Show();
    };
    self.closeClick = function (event) {
        self._pvpInfo.destroy();
    };
};

module.exports = PvpInfo;

