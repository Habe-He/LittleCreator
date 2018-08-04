var gameEngine = require('./../plugin/gameEngine');
var KKVS = require('./../plugin/KKVS');

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

        // init leftNode 
        var left_icon = leftNode.getChildByName('pvpIcon').getComponent(cc.Sprite);
        var leftScore = leftNode.getChildByName('score').getComponent(cc.Label);
        var leftlock = leftNode.getChildByName('lock').getComponent(cc.Sprite);
        var leftReward_01 = leftNode.getChildByName('reward_01');
        var leftRewardIcon_01 = leftReward_01.getChildByName('iconLevel').getComponent(cc.Sprite);
        var leftRewardDesc_01 = leftReward_01.getChildByName('pro01_desc').getComponent(cc.Label);
        var leftReward_02 = leftNode.getChildByName('reward_02');
        var leftRewardIcon_02 = leftReward_02.getChildByName('diamonds').getComponent(cc.Sprite);
        var leftRewardDesc_02 = leftReward_02.getChildByName('pro02_desc').getComponent(cc.Label);
        // init middleNode 
        var middle_icon = middleNode.getChildByName('pvpIcon').getComponent(cc.Sprite);
        var middleScore = middleNode.getChildByName('score').getComponent(cc.Label);
        var middlelock = middleNode.getChildByName('lock').getComponent(cc.Sprite);
        var middleReward_01 = middleNode.getChildByName('reward_01');
        var middleRewardIcon_01 = middleReward_01.getChildByName('iconLevel').getComponent(cc.Sprite);
        var middleRewardDesc_01 = middleReward_01.getChildByName('pro01_desc').getComponent(cc.Label);
        var middleReward_02 = middleNode.getChildByName('reward_02');
        var middleRewardIcon_02 = middleReward_02.getChildByName('diamonds').getComponent(cc.Sprite);
        var middleRewardDesc_02 = middleReward_02.getChildByName('pro02_desc').getComponent(cc.Label);
        
        // init rightNode
        var right_icon = rightNode.getChildByName('pvpIcon').getComponent(cc.Sprite);
        var rightScore = rightNode.getChildByName('score').getComponent(cc.Label);
        var rightlock = rightNode.getChildByName('lock').getComponent(cc.Sprite);
        var rightReward_01 = rightNode.getChildByName('reward_01');
        var rightRewardIcon_01 = rightReward_01.getChildByName('iconLevel').getComponent(cc.Sprite);
        var rightRewardDesc_01 = rightReward_01.getChildByName('pro01_desc').getComponent(cc.Label);
        var rightReward_02 = rightNode.getChildByName('reward_02');
        var rightRewardIcon_02 = rightReward_02.getChildByName('diamonds').getComponent(cc.Sprite);
        var rightRewardDesc_02 = rightReward_02.getChildByName('pro02_desc').getComponent(cc.Label);

        var bg = self._pvpInfo.getChildByName("bg");

        var labelDesc = bg.getChildByName("Desc").getComponent(cc.Label);
        var iconDesc = bg.getChildByName("unused_08").getComponent(cc.Sprite);
        var labelDesc_02 = bg.getChildByName("Desc_01").getComponent(cc.Label);

        closeBtn.on('click', self.closeClick, self);
        detailBtn.on('click',self.showDetailInfo,self);
    });

    
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

