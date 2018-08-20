var gameEngine = require('./../plugin/gameEngine');
var KKVS = require('./../plugin/KKVS');
var Tool = require('./../tool/Tool');
var LevelConfig = require("./../tool/config");
var gameModel = require('./gameModel');
var wxSDK = require('./../tool/wxSDK');
var pvpGameEnd = pvpGameEnd || {};

pvpGameEnd.Show = function ( addScore ) {
    var self = this;
    cc.loader.loadRes("perfabs/pvpGameEnd", cc.Prefab, function (error, prefab) {
        if (error) {
            cc.error(error);
            return;
        }

        var isWin = true;
        if( addScore > 0 ){
            isWin = true;
        } else{
            isWin = false;
        }
        self._pvpGameEnd = cc.instantiate(prefab);
        self._pvpGameEnd.parent = cc.find('Canvas');
        var closeBtn = cc.find('exit', self._pvpGameEnd);
        var continueBtn = cc.find('con',self._pvpGameEnd);

        var bg = self._pvpGameEnd.getChildByName("bg");
        self.icon =  bg.getChildByName('lv').getComponent(cc.Sprite);

        if( isWin == false){
            var files = "GameEnd/conbg";
            self.loadResIcon(bg.getComponent(cc.Sprite),files);
        }

        self.addScore = addScore;
        var isLevelChanged = false;
        var lastScore = KKVS.PVPSCORES - addScore;
        self.lastScore = lastScore;
        var curScore = KKVS.PVPSCORES;
        cc.log("lastScore = " + lastScore);
        var lastinfo = Tool.getLevelInfo(lastScore);
        var curInfo = Tool.getLevelInfo(curScore);
        var iconFiles = "Lobby/Lv_" + (lastinfo.bigLevel - 1).toString();
        self.starCount = bg.getChildByName('starCount').getComponent(cc.Label);
        self.starIcon = bg.getChildByName('star');
        if( lastinfo.star >= 0 ){
            self.starCount.node.active = true;
            self.starIcon.active = true;
            self.starCount.string = lastinfo.star.toString();
        } else {
            self.starCount.node.active = false;
            self.starIcon.active = false;
        }

        self.loadResIcon(self.icon,iconFiles);
        self.exp = bg.getChildByName("exp").getComponent(cc.Label);
        self.exp.string = addScore.toString();
        self.exp.string = '0';
        self.lv_desc = bg.getChildByName("lv_desc").getComponent(cc.Label);
        self.scoreLable = bg.getChildByName("score").getComponent(cc.Label);
        self.lv_desc.string = lastinfo.name;
        self.scoreLable.string = lastScore.toString();
        self.proBar = bg.getChildByName('barBg').getComponent(cc.ProgressBar);
        
        self.initInfo = lastinfo;
        var initInfo = LevelConfig.g_levelScore[lastinfo.index_id];
        var percent = (self.lastScore - initInfo.minScore) / (initInfo.maxScore - initInfo.minScore);
        self.proBar.progress = percent;
        closeBtn.on('click', self.closeClick, self);
        continueBtn.on('click',self.continueClick,self);
    
        // 
        self.levelNode = self._pvpGameEnd.getChildByName("levelUpNode_001");
        self.levelNode.active = false;

        self.closeLevelNode = self.levelNode.getChildByName("closeLevelNode");
        self.closeLevelNode.on('click', self.closeLevelNodeClick, self);

        var titleBg = self.levelNode.getChildByName("titleBg");
        self.title_star = titleBg.getChildByName("titleStar");
        self.title_level = titleBg.getChildByName("titleLevel");
        self.levelNode_icon = self.levelNode.getChildByName("icon_001").getComponent(cc.Sprite);

        self.btnShareGroup = self.levelNode.getChildByName("btnShareGruop");
        self.btnShareGroup.on('click', self.shareBtnClick, self);

        self.levelNodeStar = self.levelNode.getChildByName("levelNodeStar");
        self.levelNodeCount = self.levelNode.getChildByName("levelStarCount").getComponent(cc.Label);


        if( addScore != 0){
            self.ShowAction();
        }
    }),


    self.ShowIconAction = function(info){
        if( info.star >= 0 ){
            self.starCount.node.active = true;
            self.starIcon.active = true;
            self.starCount.string = info.star.toString();
        } else {
            self.starCount.node.active = false;
            self.starIcon.active = false;
        }
        var iconFiles = "Lobby/Lv_" + (info.bigLevel - 1).toString();
        self.loadResIcon(self.icon,iconFiles);
    },

    
    // 默认判断只有一次段位的级别变更
    self.refreshUiInfo = function(){
        self.lastScore +=  self.addPercentScore;
        self.lastScore = parseInt(self.lastScore);
        self.expScore += self.addPercentScore;
        self.expScore = parseInt(self.expScore);

        if( self.addPercentScore > 0 ){
            if( self.lastScore > KKVS.PVPSCORES){
                self.lastScore = KKVS.PVPSCORES;
            } 
            if( self.expScore > self.addScore){
                self.expScore = self.addScore;
            }                 
        } else {
            if( self.lastScore < KKVS.PVPSCORES){
                self.lastScore = KKVS.PVPSCORES;
            }
            if( self.expScore < self.addScore){
                self.expScore = self.addScore;
            }  
        }
        cc.log("self.lastScore = " + self.lastScore);
        var curInfo = Tool.getLevelInfo(self.lastScore);
        cc.log("curInfo.bigLevel = " + curInfo.bigLevel);
        cc.log("curInfo.star = " + curInfo.star);
        cc.log("curInfo.name = " + curInfo.name);
        cc.log("curInfo.index_id = " + curInfo.index_id);
        cc.log("self.initInfo.bigLevel = " + self.initInfo.bigLevel);
        cc.log("self.initInfo.star = " + self.initInfo.star);
        cc.log("self.initInfo.name = " + self.initInfo.name);
        cc.log("self.initInfo.index_id = " + self.initInfo.index_id);

        if( curInfo.index_id != self.initInfo.index_id ){
            cc.log(" 不相等");
            // curInfo.star != self.initInfo.star
            if(self.addScore > 0  ){
                // 表示升级

                if( curInfo.big_level == self.initInfo.big_level){
                    self.showLevelNode(curInfo ,0);
                } else{
                    self.showLevelNode(curInfo ,1);
                }

                self.ShowIconAction(curInfo);
                // self.showLevelNode(curInfo ,0);
                self.initInfo = curInfo;
                self.proBar.unscheduleAllCallbacks();
                return;
            } else{
                self.initInfo = curInfo;
                self.ShowIconAction(curInfo);
            }
        } else{
            cc.log("相等");
            if( curInfo.star != self.initInfo.star){
                self.initInfo = curInfo;
                if (curInfo.star >= 0) {
                    self.starCount.node.active = true;
                    self.starIcon.active = true;
                    self.starCount.string = curInfo.star.toString();
                } else {
                    self.starCount.node.active = false;
                    self.starIcon.active = false;
                }
                if(self.addScore > 0 ){
                    self.showLevelNode(curInfo , 1);
                    self.proBar.unscheduleAllCallbacks();
                    return;
                }
            }
        }

        if( curInfo.star >= 0 ){
            self.starCount.node.active = true;
            self.starIcon.active = true;
        } else {
            self.starCount.node.active = false;
            self.starIcon.active = false;
        }
        if( curInfo.index_id == LevelConfig.g_levelScore.length - 1){
            // 最大段位
            self.lv_desc.string = '牌神';
            percent = (self.lastScore - 1000000 * curInfo.star - 10000001)/1000000;
            self.proBar.progress = percent;


        } else {
            var curIndexInfo = LevelConfig.g_levelScore[curInfo.index_id];
            self.lv_desc.string = curIndexInfo.desc;
            var percent = (self.lastScore - curIndexInfo.minScore ) / (curIndexInfo.maxScore - curIndexInfo.minScore);
            self.proBar.progress = percent;
        }
        self.scoreLable.string = (parseInt(self.lastScore)).toString();
        self.exp.string = (parseInt(self.expScore)).toString();
        
        if( self.addScore > 0 ){
            if(self.lastScore >= KKVS.PVPSCORES){
                self.proBar.unscheduleAllCallbacks();
            }
        } else{
            if( self.lastScore < KKVS.PVPSCORES){
                self.proBar.unscheduleAllCallbacks();
            }
        }
    },

    // type = 0 (表示升级)
    // type = 1 (表示升星)
    self.showLevelNode = function(info , type){
        self.levelNode.active = true;
        if( type == 0 ){
            self.title_level.active = true;
            self.title_star.active = false;
        } else {
            self.title_level.active = false;
            self.title_star.active = true;
        }

        cc.log("info.star = " + info.star);
        if( info.star >= 0 ){
            self.levelNodeCount.node.active = true;
            self.levelNodeStar.active = true;
            self.levelNodeCount.string = info.star.toString();
        } else {
            self.levelNodeCount.node.active = false;
            self.levelNodeStar.active = false;
        }
        var iconFiles = "Lobby/Lv_" + (info.bigLevel - 1).toString();
        cc.log("iconFiles = " + iconFiles);
        // self.levelNode_icon.scale = 4;
        self.loadResIcon(self.levelNode_icon,iconFiles);
    },


    self.ShowAction = function(){
        // 动画的总共运行时间
        self.addPercentScore = self.addScore/ 100;
        self.expScore = 0 ;
        self.proBar.schedule(function(){
            self.refreshUiInfo(self.lastScore)
        },0.016,600,0.5);
    },

    self.loadResIcon = function(iconNode , files){
        cc.loader.loadRes(files, cc.SpriteFrame, function(err, spriteFrame) {
            if (err) {
                cc.log("Lobby getLobbyLevel err = " + err);
                return;
            }
            iconNode.spriteFrame = spriteFrame;
        });
    },


    self.shareBtnClick = function(event){
        KKVS.onHideType = 1;
        wxSDK.shareToGroup(1);
    },

    self.closeLevelNodeClick = function(event){
        self.levelNode.active = false;
        self.proBar.schedule(function(){
            self.refreshUiInfo(self.lastScore)
        },0.016,600,0.01);
    },

    self.continueClick = function(event){
        cc.log("继续按钮");
        gameModel.isWaiting = false;
        KKVS.Event.fire("onContClick");
        KKVS.onHideType = 0;
        self._pvpGameEnd.destroy();
    },

    self.closeClick = function (event) {
        gameModel.isWaiting = false;
        KKVS.Event.fire("onExitClick");
        self._pvpGameEnd.destroy();
    };
};

module.exports = pvpGameEnd;

