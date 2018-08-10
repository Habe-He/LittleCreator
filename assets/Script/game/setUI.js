var KKVS = require('./../plugin/KKVS');
var Tool = require('./../tool/Tool');
var AudioMnger = require('./AudioMnger');
var gameModel = require("./gameModel");


var SetUI = SetUI || {};
SetUI.Show = function () {
    var self = this;
    cc.loader.loadRes("perfabs/setUI", cc.Prefab, function (error, prefab) {

        if (error) {
            cc.error(error);
            return;
        }
        // 实例 
        self._setUI = cc.instantiate(prefab);
        self._setUI.parent = cc.find('Canvas');
        var bg = self._setUI.getChildByName("bg");
        var closeBtn = bg.getChildByName("close");
        closeBtn.on('click', self.closeClick, self);
        self.m_musicSelect = bg.getChildByName("musicSelect").getComponent(cc.Sprite);
        self.m_effectSelect = bg.getChildByName("effectSelect").getComponent(cc.Sprite);
        

        self.selectFrame = self.m_effectSelect.spriteFrame;
        self.unSelectFrame = self.m_musicSelect.spriteFrame;

        self.m_musicSelect.node.on('click',self.musicSelectClick ,self);
        self.m_effectSelect.node.on('click',self.effectSelectClick ,self);

        // init data BGM_OPEN
        if(gameModel.BGM_OPEN){
            self.m_musicSelect.spriteFrame = self.selectFrame;
        } else{
            self.m_musicSelect.spriteFrame = self.unSelectFrame;
        }
    });

    self.musicSelectClick = function(event){
        if( gameModel.BGM_OPEN){
            gameModel.BGM_OPEN = false;

            self.m_musicSelect.spriteFrame = self.unSelectFrame;
            AudioMnger.pauseMusic();
        } else{
            gameModel.BGM_OPEN = true;
            self.m_musicSelect.spriteFrame = self.selectFrame;
            // self.loadResIcon(self.m_musicSelect , "setui/setui_select");
            AudioMnger.playBGM();
        }

    };

    self.effectSelectClick = function(event){
        if( gameModel.EFFECT_OPEN){
            gameModel.EFFECT_OPEN = false;
            self.m_effectSelect.spriteFrame = self.unSelectFrame;
            AudioMnger.pauseAllEffects();
        } else{
            gameModel.EFFECT_OPEN = true;
            self.m_effectSelect.spriteFrame = self.selectFrame;
            // self.loadResIcon(self.m_effectSelect , "setui/setui_select");
        }
    };

    self.loadResIcon = function(iconNode, files) {
        cc.loader.loadRes(files, cc.SpriteFrame, function(err, spriteFrame) {
            if (err) {
                return;
            }
            iconNode.spriteFrame = spriteFrame
        });
    };

    self.closeClick = function (event) {
        self._setUI.destroy();
    };
};

module.exports = SetUI;

