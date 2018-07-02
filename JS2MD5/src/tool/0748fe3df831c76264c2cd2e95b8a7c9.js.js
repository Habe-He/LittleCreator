/**
 * 游戏音频管理工具类
 *
 */
var audioEngine = cc.audioEngine;

var MUSIC_BGM = "res/voice/Sound/bgm.mp3";
var EFFECT_FILE = "res/voice/Sound/btn.wav";
var EFFECT_JETTON_FILE = "res/voice/Sound/chooseError.wav";
// var EFFECT_PAOPAO = "res/Sound/paopao.mp3";
var resetAudioRes = function () {
    MUSIC_BGM = "res/voice/Sound/bgm.mp3";
    EFFECT_FILE = "res/voice/Sound/btn.wav";
    EFFECT_JETTON_FILE = "res/voice/Sound/chooseError.wav";
};

var soundId = null;
var MUSIC_OPEN = true;
var EFFECT_OPEN = true;

var MUSIC_CONTROL = false;

var playMusic = function () {
    cc.log("play background music");
    if(MUSIC_OPEN) {
        audioEngine.playMusic(MUSIC_BGM, true);
    }
};

var stopMusic = function () {
    cc.log("stop background music");
    audioEngine.stopMusic(false);
};

var pauseMusic = function () {
    cc.log("pause background music");
    audioEngine.pauseMusic();
};

var resumeMusic = function () {
    cc.log("resume background music");
    audioEngine.resumeMusic();
};

var rewindMusic = function () {
    cc.log("rewind background music");
    audioEngine.rewindMusic();
};

// is background music playing
var isMusicPlaying = function () {
    if (audioEngine.isMusicPlaying()) {
        cc.log("background music is playing");
        return true;
    }
    else {
        cc.log("background music is not playing");
        return false;
    }
};

var playEffect = function (effectName) {
    cc.log("play effect");
    if(EFFECT_OPEN){
        soundId = audioEngine.playEffect((effectName != undefined ? effectName : EFFECT_FILE));
    }
};

var playEffectRepeatly = function () {
    cc.log("play effect repeatly");
    soundId = audioEngine.playEffect(EFFECT_FILE, true);
};

var stopEffect = function () {
    cc.log("stop effect");
    audioEngine.stopEffect(soundId);
};

var unloadEffect = function () {
    cc.log("unload effect");
    audioEngine.unloadEffect(EFFECT_FILE);
};

var addMusicVolume = function () {
    cc.log("add bakcground music volume");
    audioEngine.setMusicVolume(audioEngine.getMusicVolume() + 0.1);
};

var subMusicVolume = function () {
    cc.log("sub backgroud music volume");
    audioEngine.setMusicVolume(audioEngine.getMusicVolume() - 0.1);
};

var addEffectsVolume = function () {

    cc.log("add effects volume");
    audioEngine.setEffectsVolume(audioEngine.getEffectsVolume() + 0.1);
};

var subEffectsVolume = function () {
    cc.log("sub effects volume");
    audioEngine.setEffectsVolume(audioEngine.getEffectsVolume() - 0.1);
};

var pauseEffect = function () {
    cc.log("pause effect");
    audioEngine.pauseEffect(soundId);
};

var resumeEffect = function () {
    cc.log("resume effect");
    audioEngine.resumeEffect(soundId);
};

var pauseAllEffects = function () {
    cc.log("pause all effects");
    audioEngine.pauseAllEffects();
};
var resumeAllEffects = function () {
    cc.log("resume all effects");
    audioEngine.resumeAllEffects();
};
var stopAllEffects = function () {
    cc.log("stop all effects");
    audioEngine.stopAllEffects();
};

var playButtonVoice = function() {
    playEffect(EFFECT_FILE);
};

audioEngine.pengEffect = 1;
audioEngine.dapaiEffect = 2;
var playMusicEffect = function( gender , value , type){
    if( EFFECT_OPEN ){
        if( type == audioEngine.pengEffect ){
            audioEngine.playEffect("res/voice/sound/common/peng.mp3", false);
        } else if( type == audioEngine.dapaiEffect){
            audioEngine.playEffect("res/voice/sound/common/chu.mp3", false);
        }
    }
};