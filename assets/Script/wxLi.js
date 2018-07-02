// //微信登录
// wxLogin() {
//         //判断是否拥有openid
//         var self = this;
//         var _openid = wxsdk.get('openid');
//         var _userInfo = wxsdk.get('userInfo');
//         if (_openid && _userInfo) {
//             //判断登录状态是否失效
//             wx.checkSession({
//                 success: function () {
//                     //显示正常登录按钮
//                     //获取code 登录服务器
//                     self._wxLoginCode(function (data) {
//                         if (_userInfo) {
//                             self._serverLogin(data.code, _userInfo.nickName, _userInfo.avatarUrl);
//                         }
//                     });
//                 },
//                 fail: function () {
//                     self._wxLoginCode(function (data) {
//                         //显示授权登录按钮
//                         self._showUserInfoButton(data);
//                     });
//                 },
//             });
//         } else {
//             self._wxLoginCode(function (data) {
//                 //显示授权登录按钮
//                 self._showUserInfoButton(data);
//             });
//         }
//         //打开右上角分享
//         wxsdk.showShareMenu();
//     },

//     //调用微信登录
//     _wxLoginCode(callback) {
//         wx.login({
//             success: function (data) {
//                 console.log(data);
//                 wxsdk.set('code', data.code);
//                 callback(data);
//             },
//             fail: function (err) {
//                 this.loginState = true;
//                 //微笑sdk.showToast('微信登录失败，请检查网络状态');
//             },
//         });
//     },

//     //显示微信登录按钮
//     _showUserInfoButton(data) {
//         var self = this;
//         var _w = 0.2265625 * window.innerWidth;
//         var _h = 0.68326118 * window.innerHeight;
//         var _bw = window.innerWidth; //0.546875 * window.innerWidth;
//         var _bh = window.innerHeight; //0.1010101 * window.innerHeight;
//         //创建授权按钮
//         try {
//             wxsdk.userInfoButton(_w, _h, _bw, _bh, data, function (res) {
//                 console.log(res);
//                 if (res.userInfo) {
//                     //登录成功 保存用户信息
//                     wxsdk.set('userInfo', res.userInfo);
//                     self.loginState = false;
//                     self._serverLogin(res.code, res.userInfo.nickName, res.userInfo.avatarUrl);
//                 } else {
//                     self.loginState = true;
//                     //微笑sdk.showToast('获取微信用户信息失败，请检查网络状态');
//                 }
//             });
//         } catch (error) {
//             console.log(error);
//             wx.getUserInfo({
//                 success: function (ret) {
//                     console.log(ret);
//                     self._serverLogin(data.code, ret.userInfo.nickName, ret.userInfo.avatarUrl);
//                 },
//                 fail: function (err) {
//                     this.loginState = true;
//                     wxsdk.showToast('获取微信用户信息失败');
//                 },
//             });
//         }
//     },

//     function login(callback) {
//         wx.login({
//             success: function (data) {
//                 callback(data);
//             },
//             fail: function (data) {
//                 showToast('微信登录失败，请检查网络状态');
//             },
//         });
//     }

// //绘制登录button
// function userInfoButton(w, h, bw, bh, data, callback) {
//     var button = wx.createUserInfoButton({
//         type: 'image',
//         image: '[图片]http://*/white.png',
//         style: {
//             left: 0,
//             top: 0,
//             width: bw,
//             height: bh,
//             lineHeight: 40,
//             opacity: 0.1,
//             backgroundColor: '#ff0000',
//             color: '#ffffff',
//             textAlign: 'center',
//             fontSize: 16,
//             borderRadius: 4
//         }
//     });
//     button.onTap((res) => {
//         callback({
//             code: data.code,
//             encryptedData: res.encryptedData,
//             iv: res.iv,
//             userInfo: res.userInfo,
//         });
//         //获取到用户信息隐藏按钮
//         button.hide();
//     });
//     return button;
// }

// //获取缓存key
// function get(key) {
//     return wx.getStorageSync(key) || null;
// }

// //写入缓存key
// function set(key, value) {
//     wx.setStorageSync(key, value);
// }