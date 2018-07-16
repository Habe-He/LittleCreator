var KKVS = require("./plugin/KKVS");

cc.Class({
    extends: cc.Component,
    properties: {
        btnJinBI: {
            default: null,
            type: cc.Node
        },
        headIcon:{
            default:null,
            type:cc.Sprite
        },
        weChatID: {
            default: null,
            type: cc.Label
        },
        money:{
            default:null,
            type:cc.Label
        },
        shareBtn:{
            default:null,
            type: cc.Node
        },
        rankBtn:{
            default:null,
            type:cc.Node
        }
    },

    onLoad: function(){
        var self = this;
        this.btnJinBI.on("touchend", self.jinBiBtnTouchEvent, this);
        this.rankBtn.on("touchend", self.rankBtnTouchEvent, this);
        this.shareBtn.on("touchend", self.shareBtnTouchEvent, this);
        this.setInfomation();
    },

    setInfomation:function(){
        this.money.string = "金币：" + KKVS.KGOLD.toString();
        this.weChatID.string = "ID:" + KKVS.NICKNAME.toString();
        // this.headIcon.
    },


    rankBtnTouchEvent:function(event){
        cc.log(" 点击排行榜");
    },

    jinBiBtnTouchEvent:function(event){
        cc.log("点击金币场次");
        cc.director.loadScene("GameUI");

    },

    shareBtnTouchEvent:function(event){
        cc.log(" 点击分享");
    },

    start () {

    },

});
