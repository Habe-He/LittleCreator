var DialogView = require('./../widget/DialogView');
var TxtDialogComp = require('./../widget/TxtDialogComp');
var Tool = require('./Tool');
var OnLineManager = require('./OnLineManager');
var AppHelper = require('./../AppHelper');
var KKVS = require('./../plugin/KKVS');
var gameEngine = require('./../plugin/gameEngine');

var wxSDK = wxSDK || {};

// 主动拉起转发，进入选择通讯录界面 分享创建房间的信息
/*
 * title 转发标题，不传则默认使用当前小游戏的昵称
 * imageUrl 转发显示图片的链接，可以是网络图片路径或本地图片文件路径或相对代码包根目录的图片文件路径。显示图片长宽比是 5:4
 * query 查询字符串，从这条转发消息进入后，可通过 wx.getLaunchInfoSync() 或 wx.onShow() 获取启动参数中的 query。必须是 key1=val1&key2=val2 的格式
 */
wxSDK.shareAppMessage = function (title, imageUrl, roomID) {
    wx.shareAppMessage({
        title: title,
        imageUrl: canvas.toTempFilePathSync({
            destWidth: 500,
            destHeight: 400
        }),
        query: 'roomID='+ roomID
    });
};

// 转发
wxSDK.onShareAppMessage = function () {
    wx.onShareAppMessage(function () {
        return {
            title: '起手4个炸，请问怎么输？',
            imageUrl: canvas.toTempFilePathSync({
                destWidth: 500,
                destHeight: 400
            }),
            success: function () {
                cc.log("转发成功");
            },
            fail: function () {
                cc.log("转发失败");
            },
            complete: function () {
                cc.log("转发完成");
            }
        };
    });
};

wxSDK.getScheme = function () {
    return scheme;
},

// 返回小程序启动参数
// API https://developers.weixin.qq.com/miniprogram/dev/framework/app-service/scene.html
wxSDK.getLaunchOptionsSync = function (bOnShow, res) {
    cc.log('wxSDK.getLaunchOptionsSync bOnShow = ' + bOnShow);
    var LaunchOption = null;
    if (bOnShow) {
        LaunchOption = res;
    } else {
        LaunchOption = wx.getLaunchOptionsSync();
    }
    Tool.logObj(LaunchOption);

    LaunchOption.query.roomID = parseInt(LaunchOption.query.roomID);

    // LaunchOption.shareTicket
    if (isNaN(LaunchOption.query.roomID)) return;

    cc.log("LaunchOption.query.roomID = " + LaunchOption.query.roomID);
    var strNae = "是否要加入" + LaunchOption.query.roomID + "房间";
    (new DialogView()).build(TxtDialogComp, {
        txt: strNae,
        type: 2,
        cb: function () {
            AppHelper.get().showLoading(null, null, 15);
            KKVS.GAME_MODEL = 2;
            KKVS.COM_ROOM_NUMBER = LaunchOption.query.roomID;
            gameEngine.app.player().joinGameRoom(LaunchOption.query.roomID, "");
        }
    }).show();
    // if (LaunchOption.scene == 1007 || LaunchOption.scene == 1008) {

    // }
};

// 退出微信小游戏
wxSDK.exitMiniProgram = function () {
    wx.exitMiniProgram();
},

wxSDK.onNetworkStatusChange = function () {
    // wx.onNetworkStatusChange(function (res) {
    //     cc.log('res.isConnected = ' + res.isConnected);

    //     if (!res.isConnected) {
    //         AppHelper.get().showTheTxtDialog({
    //             txt: "手机没有网络连接，请打开网络开关后重试",
    //             type: 2,
    //             cb: function () {
    //                 OnLineManager.reset();
    //                 OnLineManager.onLine();
    //             },
    //             cb2: function () {
    //                 wxSDK.exitMiniProgram();
    //             }
    //         });
    //     }
    // });
},

wxSDK.setKeepScreenOn = function () {
    wx.setKeepScreenOn({keepScreenOn: true});
};

wxSDK.showShareMenu = function () {
    wx.showShareMenu({
        withShareTicket: true
    });
};

// 微信小游戏的更新
wxSDK.updateManager = function () {
    cc.log("wxSDK.updateManager");
    var hasUpdate = false;
    const updateManager = wx.getUpdateManager();

    updateManager.onCheckForUpdate(function (res) {
        // 请求完新版本信息的回调
        if (res.hasUpdate) {
            cc.log("有可更新版本");
            hasUpdate = true;
        } else {
            cc.log("无可更新版本");
            hasUpdate = false;
        }
    });

    updateManager.onUpdateReady(function () {
        wx.showModal({
            title: '更新提示',
            content: '新版本已经准备好，是否重启应用？',
            success: function (res) {
                if (res.confirm) {
                    // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                    updateManager.applyUpdate();
                } else if (res.cancel) {
                    cc.log("用户点击取消更新");
                    wxSDK.exitMiniProgram();
                }
            }
        });
    });

    updateManager.onUpdateFailed(function () {
        // 新的版本下载失败
        hasUpdate = false;
    });

    return hasUpdate;
};

module.exports = wxSDK;