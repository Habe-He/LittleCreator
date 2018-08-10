// 段位配置
var LevelConfig = LevelConfig || {};
LevelConfig.g_LevelName = [
	"业余牌手",
	"初级牌手",
	"中级牌手",
	"高级牌手",
	"牌王",
	"牌圣",
	"牌神"
]



LevelConfig.g_LevelScoreArea = [
	{ "big_level": 1, "minScore": 4000, "maxScore": 5000, "reward_01": 0 ,"reward_02" :0 ,"name":"业余牌手"}, 
	{ "big_level": 2, "minScore": 5001, "maxScore": 10000, "reward_01": 2000 ,"reward_02" :0 ,"name":"初级牌手"}, 
	{ "big_level": 3, "minScore": 10001, "maxScore": 70000, "reward_01": 2001 ,"reward_02" :100 ,"name":"中级牌手"}, 
	{ "big_level": 4, "minScore": 70001, "maxScore": 360000,"reward_01": 2002 ,"reward_02" :300 ,"name":"高级牌手"}, 
	{ "big_level": 5, "minScore": 360001, "maxScore": 2000000,"reward_01": 2003 ,"reward_02" :500 ,"name":"牌王"}, 
	{ "big_level": 6, "minScore": 2000001, "maxScore": 100000000 ,"reward_01": 2004 ,"reward_02" :1000 ,"name":"牌圣"}, 
	{ "big_level": 7, "minScore": 100000001, "maxScore": 0, "reward_01": 2005 ,"reward_02" :1500 ,"name":"牌神"}
]

// LevelConfig.g_bigLevelScore = [
// ]

// -1 代表没星  非 0星  -2代表 最大值

LevelConfig.g_levelScore = [
	{"big_level":1 ,"minScore":4000 , "maxScore":5000 , "levelBase":100,"star":-1,"desc":'业余牌手',"index_id":0},
	
	{"big_level":2 ,"minScore":5001 , "maxScore":10000 , "levelBase":500,"star":-1,"desc":'初级牌手',"index_id":1},
	
	{"big_level":3 ,"minScore":10001 , "maxScore":30000 , "levelBase":1000,"star":0,"desc":'中级牌手',"index_id":2},
	{"big_level":3 ,"minScore":30001 , "maxScore":50000 , "levelBase":1000,"star":1,"desc":'中级牌手',"index_id":3},
	{"big_level":3 ,"minScore":50001 , "maxScore":70000 , "levelBase":1000,"star":2,"desc":'中级牌手',"index_id":4},


	{"big_level":4 ,"minScore":70001 , "maxScore":200000 , "levelBase":2000,"star":0,"desc":'高级牌手',"index_id":5},
	{"big_level":4 ,"minScore":200001 , "maxScore":330000 , "levelBase":2000,"star":1,"desc":'高级牌手',"index_id":6},
	{"big_level":4 ,"minScore":330001 , "maxScore":360000 , "levelBase":2000,"star":2,"desc":'高级牌手',"index_id":7},

	{"big_level":5 ,"minScore":360001 , "maxScore":800000 , "levelBase":5000,"star":0,"desc":'牌王',"index_id":8},
	{"big_level":5 ,"minScore":800001 , "maxScore":1250000 , "levelBase":5000,"star":1,"desc":'牌王',"index_id":9},
	{"big_level":5 ,"minScore":1250001 , "maxScore":1600000 , "levelBase":5000,"star":2,"desc":'牌王',"index_id":10},
	{"big_level":5 ,"minScore":1600001 , "maxScore":2000000 , "levelBase":5000,"star":3,"desc":'牌王',"index_id":11},

	{"big_level":6 ,"minScore":2000001 , "maxScore":3500000 , "levelBase":10000,"star":0,"desc":'牌圣',"index_id":12},
	{"big_level":6 ,"minScore":3500001 , "maxScore":5000000 , "levelBase":10000,"star":1,"desc":'牌圣',"index_id":13},
	{"big_level":6 ,"minScore":5000001 , "maxScore":6500000 , "levelBase":10000,"star":2,"desc":'牌圣',"index_id":14},
	{"big_level":6 ,"minScore":6500001 , "maxScore":8000000 , "levelBase":10000,"star":3,"desc":'牌圣',"index_id":15},
	{"big_level":6 ,"minScore":8000001 , "maxScore":100000000 , "levelBase":10000,"star":4,"desc":'牌圣',"index_id":16},

	{"s_level":7 ,"minScore":100000001 , "maxScore":0 , "levelBase":10000,"star":-2,"desc":'牌神',"index_id":17}
]

module.exports = LevelConfig;