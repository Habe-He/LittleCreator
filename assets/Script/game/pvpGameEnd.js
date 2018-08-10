var gameEngine = require('./../plugin/gameEngine');
var KKVS = require('./../plugin/KKVS');
var Tool = require('./../tool/Tool');
var LevelConfig = require("./../tool/config");
var gameModel = require('./gameModel');
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

        if( curInfo.index_id != self.initInfo.index_id){
            cc.log(" 不相等");
            self.initInfo = curInfo;
            self.ShowIconAction(curInfo);
        } else{
            cc.log("相等");
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
            self.proBar.progress = 0;
            self.lv_desc.string = '牌神';
        } else {
            var curIndexInfo = LevelConfig.g_levelScore[curInfo.index_id];
            self.lv_desc.string = curIndexInfo.desc;
            var percent = (self.lastScore - curIndexInfo.minScore ) / (curIndexInfo.maxScore - curIndexInfo.minScore);
            self.proBar.progress = percent;
        }
        self.scoreLable.string = (parseInt(self.lastScore)).toString();
        self.exp.string = (parseInt(self.expScore)).toString();

    },


    self.ShowAction = function(){
        // 动画的总共运行时间
        self.addPercentScore = self.addScore/ 100;
        self.expScore = 0 ;
        self.proBar.schedule(function(){
            self.refreshUiInfo(self.lastScore)
        },0.016,105,0.5);
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

    self.continueClick = function(event){
        cc.log("继续按钮");
        gameModel.isWaiting = false;
        KKVS.Event.fire("onContClick");
        self._pvpGameEnd.destroy();
    },

    self.closeClick = function (event) {
        gameModel.isWaiting = false;
        KKVS.Event.fire("onExitClick");
        self._pvpGameEnd.destroy();
    };
};

module.exports = pvpGameEnd;

