var gameModel = {
    // 游戏中玩家信息
    playerData: [],

    // 有椅子数值待初始化
    isWaiting: false,

    // 存储待初始化视图号
    isWaitingData: [],

    // 自己手牌数据
    cardData: [],

    // // 提示点击次数 出牌以后重置为 0
    tipsClickNum: 0,

    // 本局地主的椅子号ID
    diZhuCharId: 65535,

    // 游戏是否开始了
    isInGameStart: false,

    // 是否走了断线重现
    isOnReconnection: false,

    // 大厅房间配置
    roomConfig: [],

    // 玩家道具信息
    propsMsg: [],

    // 倍数
    multiple: 0,

    // 当前出牌玩家
    nowplayID: 0,

    // 背景音乐开关
    BGM_OPEN: true,

    // 音效开关
    EFFECT_OPEN: true,

    // 排位赛积分
    PVPSCORES: [],

    // 房卡模式用户积分
    FKSCORES: [],

    // 当前局数
    curRun: 0,
    
    // 总局数
    maxRun: 0,
    lastJu:false,
    totalResultData:{},

    // 邮件列表
    mailList: [],

    // 邀请好友弹窗是否已显示
    isInviteVaild: false,
};


module.exports = gameModel;