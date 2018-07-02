m_sErr = [
    "成功",
    "服务器没有准备好。",
    "服务器负载过重。",
    "非法登录。",
    "用户名或者密码不正确。",
    "用户名不正确。",
    "密码不正确。",
    "创建账号失败（已经存在一个相同的账号）。",
    "操作过于繁忙",
    "当前账号在另一处登录了。",
    "账号已登陆。",
    "游戏正在维护中,请稍后尝试登录.",
    "EntityDefs不匹配。",
    "服务器正在关闭中。",
    "Email地址错误。",
    "账号被冻结。",
    "账号已过期。",
    "账号未激活。",
    "与服务端的版本不匹配。",
    "操作失败。",
    "服务器正在启动中。",
    "未开放账号注册功能。",
    "不能使用email地址。",
    "找不到此账号。",
    "数据库错误(请检查dbmgr日志和DB)。"
];
//type 0金币  1K宝  2红包
//签到
m_sSign = [
    {"type": 0, "name": "1000K币", "value": "×1000"},
    {"type": 0, "name": "3000K币", "value": "×3000"},
    {"type": 0, "name": "3000K币", "value": "×3000"},
    {"type": 0, "name": "5000K币", "value": "×5000"},
    {"type": 0, "name": "8000K币", "value": "×8000"},
    {"type": 0, "name": "10000K币", "value": "×10000"},
    {"type": 0, "name": "20000K币", "value": "×20000"}
];
//救济金
m_MinimumRelief = 4000;//最低救济金
m_rFund = [
    {"value" : "×4000K币"},
    {"value" : "×4000K币"},
    {"value" : "×4000K币"},
    {"value" : "×4000K币"},
    {"value" : "×4000K币"},
    {"value" : "×4000K币"}
];
//转盘
m_sLobbyTurntable = [
    {"type": 0, "rotate": 0, "value": "0"},//没用的
    {"type": 2, "rotate": 225, "value": "×1元红包余额"},
    {"type": 2, "rotate": 0, "value": "×3988K币"},
    {"type": 0, "rotate": 135, "value": "×3188K币"},
    {"type": 0, "rotate": 45, "value": "×2588K币"},
    {"type": 0, "rotate": 90, "value": "×1988K币"},
    {"type": 0, "rotate": 180, "value": "×1388K币"},
    {"type": 0, "rotate": 270, "value": "×888K币"},
    {"type": 0, "rotate": 315, "value": "×588K币"}
];
//限时活动
m_sLimitOpen = [
    {"explain": "高级场对局60/180/360/620局，可获得48888/128888/248888/408888K币"},
    {"explain": "中级场对局40/100/200/360局，可获得16666/36666/86666/206666K币"},
    {"explain": "初级场对局20/50/100/180局，可获得2666/8666/20666/40666K币"}
];
//K币K宝
m_sCurrency = [
    {"type": 0, "amount": "60000", "money": "6", "paymentstr": "8001", "hotshow": false, "gifts": "0"},
    {"type": 0, "amount": "190000", "money": "18", "paymentstr": "8002", "hotshow": false, "gifts": "10000"},
    {"type": 0, "amount": "320000", "money": "30", "paymentstr": "8003", "hotshow": false, "gifts": "20000"},
    {"type": 0, "amount": "730000", "money": "68", "paymentstr": "8004", "hotshow": false, "gifts": "50000"},
    {"type": 0, "amount": "1380000", "money": "128", "paymentstr": "8005", "hotshow": true, "gifts": "100000"},
    {"type": 0, "amount": "2150000", "money": "198", "paymentstr": "8006", "hotshow": false, "gifts": "170000"},
    {"type": 0, "amount": "4030000", "money": "348", "paymentstr": "8007", "hotshow": false, "gifts": "350000"},
    {"type": 0, "amount": "7080000", "money": "648", "paymentstr": "8008", "hotshow": false, "gifts": "600000"}
    //{"type": 1, "amount": "10", "money": "1"},
    //{"type": 1, "amount": "60", "money": "6"},
    //{"type": 1, "amount": "190", "money": "18"},
    //{"type": 1, "amount": "480", "money": "45"},
    //{"type": 1, "amount": "730", "money": "68"},
    //{"type": 1, "amount": "1400", "money": "128"},
    //{"type": 1, "amount": "3830", "money": "348"},
    //{"type": 1, "amount": "7150", "money": "648"}
];
//红包兑换
m_sExchange = [
    {"type": 0, "amount": "30000", "money": "3"},
    {"type": 0, "amount": "55000", "money": "5"},
    {"type": 0, "amount": "110000", "money": "10"},
    {"type": 0, "amount": "600000", "money": "50"},
    {"type": 2, "amount": "5", "money": "5"},
    {"type": 2, "amount": "10", "money": "10"},
    {"type": 2, "amount": "20", "money": "20"},
    {"type": 2, "amount": "50", "money": "50"}
];
//创建房间数据
//{"game_id": 18, "name": "拼十", "game_number": [4, 8], "man_number": [2, 3, 4, 5, 6], "cap": [0, 6, 8], "play": ["对战拼十", "抢庄拼十"], "field_type": [0, 1]}
m_sCreateRoom = [
    {"game_id": 2, "name": "斗地主", "game_number": [6, 9, 15], "difen": [50, 100, 200, 500, 1000, 2000], "man_number": [3], "cap": [32, 64, 128], "play": ["斗地主"], "field_type": [0], "lowestgold": 16},
    {"game_id": 89, "name": "血流成河", "game_number": [4, 8], "difen": [100, 500, 1000, 5000, 10000], "man_number": [4], "cap": [8, 16, 0], "play": ["血流成河"], "field_type": [0], "lowestgold": 16},
    {"game_id": 6, "name": "湖北麻将", "game_number": [4, 8, 16], "difen": [50, 100, 200, 500, 1000, 2000], "man_number": [4], "cap": [8, 16, 32], "play": ["一癞到底", "无癞到底"], "field_type": [1, 2], "lowestgold": 16},
    {"game_id": 8, "name": "铁支", "game_number": [1, 10], "difen": [1000], "man_number": [2], "cap": [0], "play": ["铁支"], "field_type": [1], "lowestgold": 0.005, "explain" : "注：创建房间需要vip5 加入房间需要vip2."}
];