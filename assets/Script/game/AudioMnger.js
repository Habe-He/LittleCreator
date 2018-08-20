var gameModel = require('./../game/gameModel');

var AudioMnger = AudioMnger || {};

AudioMnger.playBGM = function () {
    if (gameModel.BGM_OPEN) {
        cc.loader.loadRes('voice/music/bgmusic', cc.AudioClip, function (err, clip) {
            cc.audioEngine.playMusic(clip, true);
        });
    }
};

AudioMnger.playEffect = function(effectName) {
    if (gameModel.EFFECT_OPEN) {
        if (!effectName) {
            cc.log('没有此音效 ' + effectName);
            return;
        }
        cc.loader.loadRes(effectName, cc.AudioClip, function (err, clip) {
            cc.audioEngine.playEffect(clip, false);
        });
    }
};

AudioMnger.resumeMusic = function () {
    cc.audioEngine.resumeMusic();
};

AudioMnger.resumeAllEffects = function () {
    cc.audioEngine.resumeAllEffects();
};

AudioMnger.pauseMusic = function () {
    cc.audioEngine.pauseMusic();
};

AudioMnger.pauseAllEffects = function () {
    cc.audioEngine.pauseAllEffects();
};

AudioMnger.stopMusic = function () {
    audioEngine.stopMusic( true );
    // cc.audioEngine.pauseMusic();
};


module.exports = AudioMnger;