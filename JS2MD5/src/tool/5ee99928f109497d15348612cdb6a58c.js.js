/**
 * umeng agent
 * Created by hades on 2016/7/23.
 */


var UMengAgentMain = {};

/*
 * 结束游戏前调用
 */
UMengAgentMain.end = function () {
    //var args = [];
    ////args.push(new KKVS.DATATYPE_UINT8());
    //sendCpp(args, "req_ag_end");
};

/*
 * 帐号登出
 */
UMengAgentMain.profileSignOff = function () {
    //var args = [];
    ////args.push(new KKVS.DATATYPE_UINT8());
    //sendCpp(args, "req_ag_profileSignOff");
};

/*
 * 帐号登录统计
 * @puid 玩家帐号ID
 * @provider 帐号来源[AND_QQ,AND_WX,AND_KK,AND_MOB,AND_YK]
 */
UMengAgentMain.profileSignIn = function (puid, provider) {
    //if(!puid || puid == "" || !provider || provider == "") {
    //    return;
    //}
    //if (cc.sys.os == cc.sys.OS_IOS) {
    //    provider = "IOS_" + provider;
    //}else if (cc.sys.os == cc.sys.OS_ANDROID) {
    //    provider = "AND_" + provider;
    //}else if(cc.sys.os == cc.sys.OS_WINDOWS) {
    //    provider = "WIN_" + provider;
    //}
    //var args = [];
    //args.push(new KKVS.DATATYPE_BLOB());
    //args.push(new KKVS.DATATYPE_BLOB());
    //sendCpp(args, "req_ag_profileSignIn", puid, provider);
    if (cc.sys.os == cc.sys.OS_ANDROID) {
        jsb.reflection.callStaticMethod(
            "org/cocos2dx/javascript/AppActivity",
            "userLogin",
            "(Ljava/lang/String;)V",
            puid);
    }
};

/*
 * 等级统计,这里用于vip [无]
 * @level >1的整数，最大1000
 */
UMengAgentMain.setUserLevel = function (level) {
    //var args = [];
    //args.push(new KKVS.DATATYPE_INT32());
    //sendCpp(args, "req_ag_setUserLevel", level);
};

/*
 * 充值
 * @cash rmb
 * @channel 支付渠道,固定为50=wx
 * @coin 充值后获得的虚拟币数量,这里指K宝
 */
UMengAgentMain.prePay = function (cash, coin, channel) {
    UMengAgentMain.payData = {cash : cash, coin : coin, channel : channel};
};
UMengAgentMain.pay = function (cash, coin, channel) {
    //var args = [];
    //args.push(new KKVS.DATATYPE_DOUBLE());
    //args.push(new KKVS.DATATYPE_INT32());
    //args.push(new KKVS.DATATYPE_DOUBLE());
    //sendCpp(args, "req_ag_pay", cash, 21, coin);
    if (cc.sys.os == cc.sys.OS_ANDROID) {
        jsb.reflection.callStaticMethod(
            "org/cocos2dx/javascript/AppActivity",
            "userPay",
            "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V",
            cash,
            coin,
            channel);
    }
};
/*
 * 充值并购买道具 [无]
 * @item 道具id,非空字符串
 * @amount 道具数量
 * @price 道具单价
 */
UMengAgentMain.payForItem = function (cash, item, amount, price) {
    //var args = [];
    //args.push(new KKVS.DATATYPE_DOUBLE());
    //args.push(new KKVS.DATATYPE_INT32());
    //args.push(new KKVS.DATATYPE_BLOB());
    //args.push(new KKVS.DATATYPE_INT32());
    //args.push(new KKVS.DATATYPE_DOUBLE());
    //sendCpp(args, "req_ag_payForItem", cash, 21, item, amount, price);
};

/*
 * 购买 [无]
 * @item 道具id,非空字符串
 * @amount 道具数量
 * @price 道具单价
 */
UMengAgentMain.buy = function (item, amount, price) {
    //var args = [];
    //args.push(new KKVS.DATATYPE_BLOB());
    //args.push(new KKVS.DATATYPE_INT32());
    //args.push(new KKVS.DATATYPE_DOUBLE());
    //sendCpp(args, "req_ag_buy", item, amount, price);
};
/*
 * 消耗 [无]
 * @item 道具id,非空字符串
 * @amount 道具数量
 * @price 道具单价
 */
UMengAgentMain.use = function (item, amount, price) {
    //var args = [];
    //args.push(new KKVS.DATATYPE_BLOB());
    //args.push(new KKVS.DATATYPE_INT32());
    //args.push(new KKVS.DATATYPE_DOUBLE());
    //sendCpp(args, "req_ag_use", item, amount, price);
};

/*
 * 奖励金币
 * @coin K币数量
 * @source 奖励渠道[2 = 签到奖励, 3 = 转盘奖励, 4 = 绑定手机奖励]
 */
UMengAgentMain.bonus = function (coin, source) {
    //var args = [];
    //args.push(new KKVS.DATATYPE_DOUBLE());
    //args.push(new KKVS.DATATYPE_INT32());
    //sendCpp(args, "req_ag_bonus", coin, source);
};
/*
 * 奖励道具 [无]
 */
UMengAgentMain.bonusItem = function (item, amount, price, source) {
    //var args = [];
    //args.push(new KKVS.DATATYPE_BLOB());
    //args.push(new KKVS.DATATYPE_INT32());
    //args.push(new KKVS.DATATYPE_DOUBLE());
    //args.push(new KKVS.DATATYPE_INT32());
    //sendCpp(args, "req_ag_bonusItem", item, amount, price, source);
};

/*
 * 进入关卡,调用finishLevel/failLevel时都会计算从startLevel开始的时长作为这一关卡的耗时(sdk默认送去程序切入后台的时间)
 * @level 关卡标记符["1-1" = 欢乐斗牛新手场,...]
 */
UMengAgentMain.startLevel = function (level) {
    //var args = [];
    //args.push(new KKVS.DATATYPE_BLOB());
    //sendCpp(args, "req_ag_startLevel", level);
};

/*
 * 通过关卡
 * @level 关卡标记符["1-1" = 欢乐斗牛新手场,...]
 */
UMengAgentMain.finishLevel = function (level) {
    //var args = [];
    //args.push(new KKVS.DATATYPE_BLOB());
    //sendCpp(args, "req_ag_finishLevel", level);
};

/*
 * 未通过关卡 [无]
 * @level 关卡标记符["1-1" = 欢乐斗牛新手场,...]
 */
UMengAgentMain.failLevel = function (level) {
    //var args = [];
    //args.push(new KKVS.DATATYPE_BLOB());
    //sendCpp(args, "req_ag_failLevel", level);
};

/*
 * 事件
 * @eventId 事件id
 * @label  当前事件的属性和取值
 */
UMengAgentMain.event = function (eventId, label) {
    //var args = [];
    //args.push(new KKVS.DATATYPE_BLOB());
    //args.push(new KKVS.DATATYPE_BLOB());
    //sendCpp(args, "req_ag_event", eventId, label);
};


//页面 [无]
UMengAgentMain.beginLogPageView = function (page) {
    //var args = [];
    //args.push(new KKVS.DATATYPE_BLOB());
    //sendCpp(args, "req_ag_beginLogPageView", page);
};
UMengAgentMain.endLogPageView = function (page) {
    //var args = [];
    //args.push(new KKVS.DATATYPE_BLOB());
    //sendCpp(args, "req_ag_endLogPageView", page);
};

