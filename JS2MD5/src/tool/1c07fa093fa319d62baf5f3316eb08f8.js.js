/**
 * Created by yves on 2015/9/21.
 * String, ByteBuffer 工具类
 */

/**
 * 发送EventCustom消息.
 * @param   strValue   源字符串
 * @param   uLen   字符串长度
 * @returns byteBuffer
 */

//定时器事件
var EVENT_TIMER = "EVENT_TIMER";                                //定时器事件
var EVENT_SET_TIMER = "EVENT_SET_TIMER";                        //设置定时器事件
var EVENT_KILL_TIMER = "EVENT_KILL_TIMER";                      //删除定时器事件

//UI网络事件
var EVENT_ENTER_ROOM = "EVENT_ENTER_ROOM";                      //进入房间事件

//键盘事件
var EVENT_KEYBOARD_BACK = "EVENT_KEYBOARD_BACK";                //返回按钮事件
//后台事件
var EVENT_GAME_SHOW = "EVENT_GAME_SHOW";
var EVENT_GAME_HIDE = "EVENT_GAME_HIDE";

var EVENT_LOADING = "EVENT_LOADING";//通用loading显示
var EVENT_LOADING_SHOW = "EVENT_LOADING_SHOW";//通用loading显示
var EVENT_LOADING_HIDE = "EVENT_LOADING_HIDE";//通用loading隐藏

var EVENT_SHOW_VIEW = "EVENT_SHOW_VIEW";                        //显示VIEW事件
var EVENT_ADD_VIEW = "EVENT_ADD_VIEW";                          //添加一个VIEW节点事件

var EVENT_SHOW_UI = "EVENT_SHOW_UI";                            //显示UI事件
var EVENT_SHOW_DIALOG = "EVENT_SHOW_DIALOG";                    //显示提示框事件
//var EVENT_SHOW_VIEW = "EVENT_SHOW_DISPLAY_VIEW";                //显示view事件
var EVENT_DISMISS_UI = "EVENT_DISMISS_UI";                      //消失UI事件
var EVENT_SHOW_LOADING = "EVENT_SHOW_LOADING";                  //显示LOADING事件
var EVENT_SHOW_SUB_UI = "EVENT_SHOW_SUB_UI";
var EVENT_DISMISS_SUB_UI = "EVENT_DISMISS_SUB_UI";

//银行操作成功
var MSG_ON_CHANGE_BANK_SUCCESS = "MSG_ON_CHANGE_BANK_SUCCESS";
//银行操作失败
var MSG_ON_CHANGE_BANK_FAIL = "MSG_ON_CHANGE_BANK_FAIL";
//大厅顶条刷新
var MSG_ON_PLAZA_TOP = "MSG_ON_PLAZA_TOP";
//VIP签到成功
var MSG_ON_VIP_CHECKIN = "MSG_ON_VIP_CHECKIN";
//操作成功
var MSG_ON_OPERATION = "MSG_ON_OPERATION";
//操作失败
var MSG_ON_OPERATION_FAIL = "MSG_ON_OPERATION_FAIL"
//手机绑定或者解绑
var MSG_ON_PHONE_BIND = "MSG_ON_PHONE_BIND";
//大厅顶条头像修改
var MSG_ON_USERINFO_HEAD = "MSG_ON_USERINFO_HEAD";
//用户信息框中的头像修改
var MAS_ON_PLAZATOP_HEAD = "MAS_ON_PLAZATOP_HEAD";
//任务
var MAS_ON_TASK = "MAS_ON_TASK";
//任务领取完成,删除任务
var MAS_ON_DEL_TASK = "MAS_ON_DEL_TASK";
//消息显示成功 请求删除消息
var MAS_ON_DEL_MSG = "MAS_ON_DEL_MSG";
//更新顶条金币
var MAS_ON_REFRESH_GOLD_TOP = "MAS_ON_REFRESH_GOLD";
//金币排行榜
var MAS_ON_GOLD_RAK = "MAS_ON_GOLD_RAK";
//击杀排行榜
var MAS_ON_KILL_RAK = "MAS_ON_KILL_RAK";
//游戏中的事件
var MSG_GAME_UPDATE_PLAYERINFO = "MSG_GAME_UPDATE_PLAYERINFO";
//账号重复登录被T
var MSG_GAME__LOGON_SWITCH = "MSG_GAME__LOGON_SWITCH";
//支付成功的回调
var MSG_PAY_CALLBACK = "MSG_PAY_CALLBACK";


//房间事件
var MSG_CLOSE_ROOM = "MSG_CLOSE_ROOM";//关闭房间事件
var EVENT_UPDATE_MESTATUS = "EVENT_UPDATE_MESTATUS";//更新我的状态

var PLAYER_MSG_ID_BIND_MOB = 1; //绑定手机
var PLAYER_MSG_ID_UPDATE_PLAYER_INFO = 2; //更新玩家信息
var PLAYER_MSG_ID_REQ_BANK_BIND_INFO = 3; //银行绑定信息
var PLAYER_MSG_ID_MAIL_LIST = 20; //玩家邮件列表
var PLAYER_MSG_ID_MAIL_OPT = 21; //玩家邮件查看|领取
var PLAYER_MSG_ID_MAIL_DEL = 22; //玩家邮件删除
var PLAYER_MSG_ID_PROP = 50; //更新道具
var LOBBY_MSG_NOTICE = 10; //公告
var LOBBY_MSG_UPDATE_HORN = 111; //喇叭更新(由服务端主推)
var LOBBY_MSG_FEEDBACK = 11; //反馈
var LOBBY_MSG_PLAYER_OFFLINE_RECONNECT = 400; //断线重连
var ROOM_MSG_ID_MATCH_LIST = 80; //比赛列表
var ROOM_MSG_ID_MATCH_SIGNUP = 81; //比赛报名
var ROOM_MSG_ID_MATCH_CANCEL_SIGNUP = 82; //比赛取消
var ROOM_MSG_ID_MATCH_SIGNUP_INFO = 90; //比赛报名信息
var ROOM_MSG_ID_MATCH_DETAIL_INFO = 91; //比赛详情

//SendEventMessage = function (eventName, userData) {
//    //var event = new cc.EventCustom(eventName);
//    //event.setUserData(userData);
//    //cc.eventManager.dispatchEvent(event);
//    KKVS.Event.fire(eventName, userData);
//};

// sun add new msg cmd 
var LOBBY_MSG_SOCIATY_BASE_USER = 59; // 玩家所属公会基本信息
var LOBBY_MSG_SOCIATY_ACT_CREATE = 60; //公会创建
var LOBBY_MSG_SOCIATY_ACT_JOIN = 61; //公会加入
var LOBBY_MSG_SOCIATY_ACT_JOIN_AGREE_OR_NOT = 62; //公会申请拒绝|同意
var LOBBY_MSG_SOCIATY_ACT_MENBER_LIST = 63; //成员列表
var LOBBY_MSG_SOCIATY_ACT_DEL_MEMBER = 64; //会长删除会员
var LOBBY_MSG_SOCIATY_ACT_EXIT = 65; //会员退出公会
var LOBBY_MSG_SOCIATY_ACT_QUERY_MAIN_INFO = 66; // 查询公会的基本信息


var LOBBY_MSG_SOCIATY_ACT_CREATE_ROOM  = 80;// 创建 房间（玩法）
var LOBBY_MSG_SOCIATY_ACT_JOIN_ROOM = 81; // 加入 房间（玩法）
var LOBBY_MSG_SOCIATY_ACT_DESTORY_ROOM = 82; // 销毁 房间（玩法）


var LOBBY_MSG_BASE_ACT_CREATE_ROOM = 150;// 创建房间(普通)
var LOBBY_MSG_BASE_ACT_JOIN_ROOM = 151; // 加入 房间（普通）
var LOBBY_MSG_BASE_ACT_DESTORY_ROOM = 152; // 销毁 房间（普通)
var LOBBY_MSG_BASE_ACT_LEAVE_ROOM = 153; //  离开 房间
