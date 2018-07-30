var DialogView = require('./../widget/DialogView');
var TxtDialogComp = require('./../widget/TxtDialogComp');
var Tool = require('./Tool');

var wxSDK = wxSDK || {};

// 主动拉起转发，进入选择通讯录界面
/*
 * title 转发标题，不传则默认使用当前小游戏的昵称
 * imageUrl 转发显示图片的链接，可以是网络图片路径或本地图片文件路径或相对代码包根目录的图片文件路径。显示图片长宽比是 5:4
 * query 查询字符串，从这条转发消息进入后，可通过 wx.getLaunchInfoSync() 或 wx.onShow() 获取启动参数中的 query。必须是 key1=val1&key2=val2 的格式
 */
wxSDK.shareAppMessage = function (title, imageUrl, roomID) {
    var data = {
        'roomID': roomID
    };
    wx.shareAppMessage({
        title: title,
        imageUrl: imageUrl,
        query: 'roomID='+ roomID
    });
};

// 返回小程序启动参数
// API https://developers.weixin.qq.com/miniprogram/dev/framework/app-service/scene.html
wxSDK.getLaunchOptionsSync = function () {
    cc.log('wxSDK.getLaunchOptionsSync');
    // cc.log(JSON.stringify(wx.getLaunchOptionsSync().query));
    var LaunchOption = wx.getLaunchOptionsSync();
    // Tool.logObj(LaunchOption)
    // cc.log("5555555558");
    if (LaunchOption.scene == 1007 || LaunchOption.scene == 1008) {
        cc.log('LaunchOption = ' + LaunchOption.query.roomID);

        // var strNae = "是否要加入" + LaunchOption.query.roomID + "房间";
        // (new DialogView()).build(TxtDialogComp, {
        //     txt: strNae,
        //     type: 2,
        //     cb: function () {
        //         // KKVS.GAME_MODEL = 6;
        //         // KKVS.COM_ROOM_NUMBER = 203657;
        //         // gameEngine.app.player().joinGameRoom(203657, "asddd");
        //     }
        // }).show();
    }
};


// 退出微信小游戏
wxSDK.exitMiniProgram = function () {
    wx.exitMiniProgram();
},
module.exports = wxSDK;