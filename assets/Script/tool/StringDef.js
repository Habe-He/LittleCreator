var StringDef = StringDef || {};

// 排位赛季信息
StringDef.PLAYER_MSG_ID_REQ_COMPETITIVE_RANKING = 15;

// 创建房间
StringDef.LOBBY_MSG_BASE_ACT_CREATE_ROOM = 150;

// 加入房间
StringDef.LOBBY_MSG_BASE_ACT_JOIN_ROOM = 151;

// 离开房间
StringDef.LOBBY_MSG_BASE_ACT_LEAVE_ROOM = 153;

// 金币排行
StringDef.LOBBY_MSG_RANK_LIST_GOLD = 180;

// 积分排行
StringDef.LOBBY_MSG_RANK_LIST_SCORE = 181;

// 玩家邮件列表
StringDef.PLAYER_MSG_ID_MAIL_LIST = 20;

// 玩家邮件查看|领取
StringDef.PLAYER_MSG_ID_MAIL_OPT = 21;

// 玩家邮件删除
StringDef.PLAYER_MSG_ID_MAIL_DEL = 22;

StringDef.LOBBY_MSG_SHARE_RECORD = 190; //请求获取分享记录
StringDef.LOBBY_MSG_SHARE_SUCCESS = 191; //通知服务器分享成功



// 兑换钻石
StringDef.CMD_DIAMOND_EXCHANGE_GM = 5;// # 命令码 5:钻石 兑换 游戏币

// 钻石 | 房卡 数字ID
StringDef.Diamond = 1050;

// 特效 起始ID 7000
// 春天
StringDef.CHUNTIAN = 7001;

// 飞机
StringDef.FEIJI = 7002;

// 火箭
StringDef.HUOJIAN = 7003;

// 连对
StringDef.LIANDUI = 7004;

// 顺子
StringDef.SHUNZI = 7005;

// 炸弹
StringDef.ZHADAN = 7006;

// 音效 起始ID 6000
// 炸弹
StringDef.ZHADAN_EF = {'ID': 6001, 'Name': "boom"};

// 不出
StringDef.BUCHU_EF = {'ID': 6002, 'Name': "buchu"};

// 飞机
StringDef.FEIJI_EF = {'ID': 6003, 'Name': "Plane"};

// 火箭
StringDef.HUOJIAN_EF = {'ID': 6004, 'Name': "rocket"};

// 不叫
StringDef.BUJIAO_EF = {'ID': 6005, 'Name': "score0"};

// 一分
StringDef.YIFEN_EF = {'ID': 6006, 'Name': "score1"};

// 二分
StringDef.ERFEN_EF = {'ID': 6007, 'Name': "score2"};

// 三分
StringDef.SANFEN_EF = {'ID': 6008, 'Name': "score3"};

// 双顺
StringDef.SHUANGSHUN_EF = {'ID': 6009, 'Name': "shuangshun"};

// 顺子
StringDef.SHUNZI_EF = {'ID': 6010, 'Name': "shunzi"};

module.exports = StringDef;