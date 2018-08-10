var KKVS = require('./../plugin/KKVS');
var gameModel = require('./gameModel');
var Tool = require('./../tool/Tool');
var TotalResult = TotalResult || {};

TotalResult.Show = function (resultData) {
    var self = this;
    self.m_resultData = resultData;
    cc.loader.loadRes("perfabs/totalReuslt", cc.Prefab, function (error, prefab) {
        if (error) {
            cc.error(error);
            return;
        }
        // 实例 
        self._totalReuslt = cc.instantiate(prefab);
        self._totalReuslt.parent = cc.find('Canvas');
        // self.m_resultData = resultData
        var closeBtn = cc.find('bg/btn', self._totalReuslt);
        closeBtn.on('click', self.closeClick, self);


        var bg = self._totalReuslt.getChildByName("bg");
        // 基本信息
        var infoBg = bg.getChildByName("infobg");
        var nickName = infoBg.getChildByName("name").getComponent(cc.Label);
        cc.log("self.result = " + self.m_resultData.fangzhu);
        nickName.string = self.m_resultData.fangzhu;
        cc.log("this.m_resultData.fangzhu = " + self.m_resultData.fangzhu);

        var fanghao = infoBg.getChildByName("number").getComponent(cc.Label);
        fanghao.string = self.m_resultData.fanghao;

        var jushuCount = infoBg.getChildByName("jushuCount").getComponent(cc.Label);
        jushuCount.string = gameModel.curRun + '/' + gameModel.maxRun;
        var day = infoBg.getChildByName("day").getComponent(cc.Label);
        day.string = Tool.getByTime(self.m_resultData.time);
        var time = infoBg.getChildByName("time").getComponent(cc.Label);
        time.string = Tool.getHourAndMin(self.m_resultData.time);
        var arrayNode = [];
        var userNode = bg.getChildByName('userNode');
        var leftNode = userNode.getChildByName('leftBg');
        arrayNode.push(leftNode);
        var middleNode = userNode.getChildByName('middleBg');
        var rightNode = userNode.getChildByName('rightBg'); 
        arrayNode.push(middleNode);
        arrayNode.push(rightNode);

        var node_008 = bg.getChildByName('node_008').getComponent(cc.Sprite).spriteFrame;
        var node_009 = bg.getChildByName('node_009').getComponent(cc.Sprite).spriteFrame;

        for( var i = 0 ; i < 3; i++){
            var curNode = arrayNode[i];
            var name = curNode.getChildByName('nickName').getComponent(cc.Label);
            name.string = self.m_resultData.names[i];
            // 怎么判断是否是自己
            var isMeIcon = curNode.getChildByName('result_me');

            if ( i == KKVS.myChairID){
                isMeIcon.active = true;
            } else{
                isMeIcon.active = false;
            }

            var springCount = curNode.getChildByName('springCount').getComponent(cc.Label);
            springCount.string = self.m_resultData.springs[i].toString();

            var boomCount = curNode.getChildByName('boomCount').getComponent(cc.Label);
            boomCount.string = self.m_resultData.booms[i].toString();

            var scoreBg = curNode.getChildByName('scoreBg');
            var scoreIcon = scoreBg.getChildByName('scoreIcon').getComponent(cc.Sprite);
            var winScore = scoreBg.getChildByName('winScore').getComponent(cc.Label);
            var loseScore = scoreBg.getChildByName('loseScore').getComponent(cc.Label);
          
            if( self.m_resultData.scores[i] >= 0 ){
                winScore.node.active = true;
                loseScore.node.active = false;
                scoreIcon.spriteFrame = node_009;
                // iconFiles = 'result/result_009';
            } else{
                winScore.node.active = false;
                loseScore.node.active = true;
                // iconFiles = 'result/result_008';
                scoreIcon.spriteFrame = node_008;
            }
            loseScore.string = Math.abs(self.m_resultData.scores[i]).toString();
            winScore.string = Math.abs(self.m_resultData.scores[i]).toString();
            // self.loadResIcon(scoreIcon , iconFiles);
            // 
            var head = curNode.getChildByName("head");
            var headIcon = head.getChildByName('headIcon').getComponent(cc.Sprite);
            Tool.weChatHeadFile(headIcon, self.m_resultData.headArray[i],null);
        }
    });

    self.closeClick = function (event) {
        self._totalReuslt.destroy();
        cc.log("退出游戏");
        gameModel.isWaiting = false;
        KKVS.Event.fire("onExitClick");

    };
    self.loadResIcon = function(iconNode , files){
        cc.loader.loadRes(files, cc.SpriteFrame, function(err, spriteFrame) {
            if (err) {
                cc.log("Lobby getLobbyLevel err = " + err);
                return;
            }
            iconNode.spriteFrame = spriteFrame
        });
    };
};

module.exports = TotalResult;

