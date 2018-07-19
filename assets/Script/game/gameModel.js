var gameModel = {
    // 是否在游戏场景中
    isInGameScene: false,

    // 游戏中玩家信息
    playerData: [],

    // 有椅子数值待初始化
    isWaiting: false,

    // 存储待初始化视图号
    isWaitingData: [],

    // // 倍数
    // gameModel.callbeishu = 0;

    // 自己手牌数据
    cardData: [],

    // // 当前癞子值
    // gameModel.laiZiCardValue = null;

    // // 提示点击次数 出牌以后重置为 0
    tipsClickNum: 0,

    // // 当前是否自己出牌
    // gameModel.isMySelfToPlay = false;

    // // 当前操作玩家变量
    // gameModel.nowPlayer = null;

    // 本局地主的椅子号ID
    diZhuCharId: 65535,

    // // 地主三张底牌数据
    // gameModel.diCardData = [];

    // // 当前自己是否一定要出牌
    // gameModel.mustPlay = false;

    // // 托管了
    // gameModel.isTrusteeship = false;

    // // 倍数
    // gameModel.beiShu = 0;

    // // 重连的数据
    // gameModel.reConnectData = null;

    // // 游戏结果 1：胜利 -1：失败
    // gameModel.RESULT_TYPE = 1;

    // // 结算数据  结算KB
    // gameModel.resultData = null;

    // // 当前出牌用户ViewID
    // gameModel.outCardViewID = -1;

    // //上次的牌数据
    // gameModel.lastCardData = null;
    isInGameStart: false,

    // // 底分
    // gameModel.baseScore = 0;

    // // 晋级排名
    // gameModel.Promotion_rank = 0;

    // // 比赛房间配置
    // gameModel.ComRoomConfig = null;

    // // 房卡模式带入金额
    // gameModel.Bring = 0;
};


module.exports = gameModel;