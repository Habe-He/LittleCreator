var gameModel = {
    // 是否在游戏场景中
    isInGameScene: false,

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

    isInGameStart: false,

    // 是否走了断线重现
    isOnReconnection: false,

    // 大厅房间配置
    roomConfig: [],

    // 玩家段位信息
    levelMsg: [],

    // 玩家道具信息
    propsMsg: [],

    
    // 
};


module.exports = gameModel;