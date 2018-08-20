var DialogView = require('./../widget/DialogView');
var TxtDialogComp = require('./../widget/TxtDialogComp');
var Tool = require('./Tool');
var OnLineManager = require('./OnLineManager');
var AppHelper = require('./../AppHelper');
var KKVS = require('./../plugin/KKVS');
var gameEngine = require('./../plugin/gameEngine');
var httpUtils = require('./../plugin/httpUtils');
var AppComp = require('./../AppComp');
var UserInfo = require('./../selfinfo/SelfInfo');
var gameModel = require('./../game/gameModel');

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




wxSDK.shareAppMessageOnly = function () {
    var titleArray = [
        "兄弟，来一局！我已经是斗地主的王者哦！不服来战！",
        "斗地主约战，别只会说你打的好，来局练练撒！",
        "斗地主竞技排位，听说你是高手，是骡子是马赶紧来秀秀！",
        "畅爽斗地主，还看《开开斗地主》，就缺你，来玩呗！",
        "玩过忘不掉，好兄弟快上《开开斗地主》来一局！等你哦！",
        "斗地主，今天你抢地主了吗？就缺你，来玩呗！",
        "我是地主我做主！来试试斗倒我啊！come on baby！",
        "一二三四五，快来帮我斗地主！我快输光啦！",
        "千山万水总是情，斗下地主行不行！我等你，不见不散！"
    ];
    var shareImgArray = [
        "share_01.png",
        "share_02.png",
        "share_03.png",
    ];
    var imageUrl = "share_01.png";
    var title = "兄弟，来一局！我已经是斗地主的王者哦！不服来战！";
    var titleIndex = parseInt(Math.random() * 9);
    if( titleIndex < 0 || titleIndex > 8){
        titleIndex = 5;
    }

    var imageIndex = parseInt(Math.random() * 3);
    if( imageIndex < 0 || imageIndex > 2){
        imageIndex = 1;
    }
    var imgUrl = "https://sjddz-yxjh.17fengyou.com/game/res/shareImg/" + shareImgArray[imageIndex];
    cc.log("imgUrl = " + imgUrl);
    title = titleArray[titleIndex];

    wx.shareAppMessage({
        title: title,
        imageUrl: imgUrl,
        success: function(res) {
            // cc.log("res.")
            KKVS.isShareSuccess = true;
        }.bind(this)
    });
};


// 转发
wxSDK.onShareAppMessage = function () {
    var titleArray = [
        "兄弟，来一局！我已经是斗地主的王者哦！不服来战！",
        "斗地主约战，别只会说你打的好，来局练练撒！",
        "斗地主竞技排位，听说你是高手，是骡子是马赶紧来秀秀！",
        "畅爽斗地主，还看《开开斗地主》，就缺你，来玩呗！",
        "玩过忘不掉，好兄弟快上《开开斗地主》来一局！等你哦！",
        "斗地主，今天你抢地主了吗？就缺你，来玩呗！",
        "我是地主我做主！来试试斗倒我啊！come on baby！",
        "一二三四五，快来帮我斗地主！我快输光啦！",
        "千山万水总是情，斗下地主行不行！我等你，不见不散！"
    ];
    var shareImgArray = [
        "share_01.png",
        "share_02.png",
        "share_03.png",
    ];
    var imageUrl = "share_01.png";
    var title = "兄弟，来一局！我已经是斗地主的王者哦！不服来战！";
    var titleIndex = parseInt(Math.random() * 9);
    if( titleIndex < 0 || titleIndex > 8){
        titleIndex = 5;
    }

    var imageIndex = parseInt(Math.random() * 3);
    if( imageIndex < 0 || imageIndex > 2){
        imageIndex = 1;
    }
    var imgUrl = "https://sjddz-yxjh.17fengyou.com/game/res/shareImg/" + shareImgArray[imageIndex];
    cc.log("imgUrl = " + imgUrl);
    title = titleArray[titleIndex];
    wx.onShareAppMessage(function () {
        return {
            title: title,
            imageUrl: imgUrl,
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
        if (gameModel.isInviteVaild) {
            return;
        }
        LaunchOption = wx.getLaunchOptionsSync();
    }
    Tool.logObj(LaunchOption);

    LaunchOption.query.roomID = parseInt(LaunchOption.query.roomID);

    // LaunchOption.shareTicket
    if (isNaN(LaunchOption.query.roomID)) return;

    cc.log("LaunchOption.query.roomID = " + LaunchOption.query.roomID);
    var strNae = "是否要加入" + LaunchOption.query.roomID + "房间";
    gameModel.isInviteVaild = true;
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

// 已获取的权限 -- 此处仅判断用户授权用户信息
wxSDK.getSetting = function () {

    if( KKVS.HEAD_URL == ""){
        wxSDK.openSetting();
    } else{
        cc.log("弹出用户中心界面");
        UserInfo.Show();
    }
    return;
    wx.getSetting({
        success: function(get_res) {
            if (!get_res.authSetting['scope.userInfo']) {
                (new DialogView()).build(TxtDialogComp, {
                    txt: '获取不到你的昵称和头像，请开启授权后重试',
                    type: 2,
                    cb: function () {
                        wxSDK.openSetting();
                    }
                }).show();
                
            } else {
                cc.log("弹出用户中心界面");
                UserInfo.Show();
            }
        },

        fail: function() {},
        complete: function() {},
    });
},


wxSDK.getVersion = function() {
    wx.getSystemInfo({
        success: function(res) {
            var version = res.SDKVersion;
            version = version.replace(/\./g, "")
            console.log("111 = " + version)
            if (parseInt(version) < 120) { // 小于1.2.0的版本

            }
        }
    });
},


// 获取微信授权
wxSDK.openSetting = function () {
    // wx.login({
    //     success: function (data) {
    //         cc.log("登录成功 code = " + data.code);
    //         wx.getUserInfo({
    //             success: function (res) {
    //                 var avatarUrl = res.userInfo.avatarUrl;
    //                 var city = res.userInfo.city;
    //                 var gender = res.userInfo.gender;
    //                 if (gender == 1) {
    //                     gender = 0;
    //                 } else if (gender == 2) {
    //                     gender = 1;
    //                 }
    //                 var nickName = res.userInfo.nickName;
    //                 cc.log("avatarUrl = " + avatarUrl);
    //                 cc.log("gender = " + gender);
    //                 cc.log("nickName = " + nickName);
    //                 wx.setStorageSync("nickName", nickName);
    //                 wx.setStorageSync("avatarUrl", avatarUrl);
    //                 wx.setStorageSync("gender", gender);
    //                 wxSDK._serverLogin(data.code);
    //             },
    
    //             // 061nxiVf1vWfkA0mynXf1yH1Vf1nxiVo
    //             fail: function (res) {
    //                 cc.log("用户未确认授权 " + data.code);
    //                 wxSDK._serverLogin(data.code);
    //             },
    //         });
    //     },

    //     fail: function (res) {
    //         cc.log("调用小游戏登录失败 code = " + res.errMsg.code);
    //     },
    // });

    // return;

    // 使用微信基础库 1.9.97
    wx.openSetting({
        success: function(open_res) {
            cc.log('ffffffffffffffff');
            cc.log(open_res.authSetting['scope.userInfo']);
            wx.login({
                success: function (data) {
                    cc.log("登录成功 code = " + data.code);
                    wx.getUserInfo({
                        success: function (res) {
                            var avatarUrl = res.userInfo.avatarUrl;
                            var city = res.userInfo.city;
                            var gender = res.userInfo.gender;
                            if (gender == 1) {
                                gender = 0;
                            } else if (gender == 2) {
                                gender = 1;
                            }
                            var nickName = res.userInfo.nickName;
                            cc.log("avatarUrl = " + avatarUrl);
                            cc.log("gender = " + gender);
                            cc.log("nickName = " + nickName);
                            wx.setStorageSync("nickName", nickName);
                            wx.setStorageSync("avatarUrl", avatarUrl);
                            wx.setStorageSync("gender", gender);
                            wxSDK._serverLogin(data.code);
                        },
            
                        // 061nxiVf1vWfkA0mynXf1yH1Vf1nxiVo
                        fail: function (res) {
                            cc.log("用户未确认授权 " + data.code);
                            wxSDK._serverLogin(data.code);
                        },
                    });
                },
    
                fail: function (res) {
                    cc.log("调用小游戏登录失败 code = " + res.errMsg.code);
                },
            });
        }
    });

    // var button = wx.createUserInfoButton({
    //     type: 'text',
    //     text: '获取用户信息',
    //     style: {
    //         left: 10,
    //         top: 76,
    //         width: 200,
    //         height: 40,
    //         lineHeight: 40,
    //         backgroundColor: '#ff0000',
    //         color: '#ffffff',
    //         textAlign: 'center',
    //         fontSize: 16,
    //         borderRadius: 4
    //     }
    // })
    // button.onTap(function (res) {
    //     console.log(res)
    // })
},

wxSDK._serverLogin = function (code) {
    OnLineManager.reset();
    OnLineManager.offLine();
    var nickName = null;
    var avatarUrl = null;
    var gender = null;

    try {
        nickName = wx.getStorageSync('nickName');
        avatarUrl = wx.getStorageSync('avatarUrl');
        gender = wx.getStorageSync('gender');
    } catch (e) {
        cc.log("get getStorageSync errr");
    }

    if (nickName == null || avatarUrl == null || gender == null) {
        wx.showToast({
            title: '获取本地保存数据失败',
            icon: 'none',
            duration: 1000
        })
        return;
    }


    if (gender == 1) {
        gender = 0;
    } else if (gender == 2) {
        gender = 1;
    } else {
        gender = 0;
    }
    var datas = {
        'Code': code,
        'nickname': nickName,
        'faceurl': avatarUrl,
        'gender': gender
    };



    var reqURL = "https://sjddz-yxjh.17fengyou.com/public/login";
    // var reqURL = "https://sjddz-yxjh.17fengyou.com/publictest/login";
    var newUrl = reqURL + "?Code=" + datas.Code.toString() + "&nickname=" + datas.nickname.toString() +
        "&faceurl=" + datas.faceurl.toString() + "&gender=" + datas.gender.toString();
    cc.log("newUrl = " + newUrl);
    httpUtils.getInstance().httpGets(newUrl, function (data) {
        cc.log("_serverLogin " + data);
        if (data == -1) {
            cc.log('请检查网络！');
        } else {
            var jsonD = JSON.parse(data);
            cc.log("jsonD.data = " + jsonD.data[0].Accounts);
            KKVS.Login_type = Tool.VISITOR_LOGIN;
            KKVS.Acc = jsonD.data[0].Accounts;
            KKVS.Pwd = jsonD.data[0].PassWord;
            OnLineManager.onLine();
        }
    });
},

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

wxSDK.getSystemInfoSync = function () {
    return wx.getSystemInfoSync();
};


// type = 0 是 lobby  type = 1 是pvpgameend
wxSDK.shareToGroup = function(type){
    var titleArray = [
        "兄弟，来一局！我已经是斗地主的王者哦！不服来战！",
        "斗地主约战，别只会说你打的好，来局练练撒！",
        "斗地主竞技排位，听说你是高手，是骡子是马赶紧来秀秀！",
        "畅爽斗地主，还看《开开斗地主》，就缺你，来玩呗！",
        "玩过忘不掉，好兄弟快上《开开斗地主》来一局！等你哦！",
        "斗地主，今天你抢地主了吗？就缺你，来玩呗！",
        "我是地主我做主！来试试斗倒我啊！come on baby！",
        "一二三四五，快来帮我斗地主！我快输光啦！",
        "千山万水总是情，斗下地主行不行！我等你，不见不散！"
    ];
    var shareImgArray = [
        "share_01.png",
        "share_02.png",
        "share_03.png",
    ];
    var imageUrl = "share_01.png";
    var title = "兄弟，来一局！我已经是斗地主的王者哦！不服来战！";
    var titleIndex = parseInt(Math.random() * 9);
    if( titleIndex < 0 || titleIndex > 8){
        titleIndex = 5;
    }

    var imageIndex = parseInt(Math.random() * 3);
    if( imageIndex < 0 || imageIndex > 2){
        imageIndex = 1;
    }
    var imgUrl = "https://sjddz-yxjh.17fengyou.com/game/res/shareImg/" + shareImgArray[imageIndex];
    cc.log("imgUrl = " + imgUrl);
    title = titleArray[titleIndex];

    wx.shareAppMessage({
        title: title,
        imageUrl: imgUrl,
        success: function(res) {
            cc.log("分享成功 开始判断回调");
            cc.log("res.shareTickets = " + res.shareTickets);
            if(res.shareTickets == null || res.shareTickets == undefined || res.shareTickets == ""){ 
                cc.log("分享的不是群 ");
                // gameEngine.app.player().joinGameRoom(LaunchOption.query.roomID, "");
            } else {
                if( type == 1){
                    gameEngine.app.player().reqShareSuccess(3,res.shareTickets)
                }
            }
        }.bind(this)
    });
};

module.exports = wxSDK;