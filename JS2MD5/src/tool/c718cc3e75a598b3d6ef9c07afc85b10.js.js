/*
    creater kent by 2016/3/4
    register callback interface
*/
var ON_REFRESH_SIZE = "onRefreshSize";
var REFRESH_WINDOW = "refreshSize";
var RegisterInterface = {
    registerRecvCallBack: function() {
        cc.log("register interface success!");
        if (!cc.sys.isNative) {
            return;
        }
        var pLobby = LobbyManager.getInstance();

        /**
         * Callback listener
         * @Parameter1          type: string, callback key
         * @Parameter2          type: function, callback function
         */
        //pLobby.on("onTest", function(data){
        //    cc.log("******* onTest");
        //    //KKVS.Login_type = CHEETAH_LOGIN
        //    var s = new KKVS.MemoryStream(data.data);
        //    var n = s.readBlob();
        //    var d = s.readBlob();
        //    n = KKVS.utf8ArrayToString(n);
        //    d = KKVS.utf8ArrayToString(d);
        //    cc.log("n = " + n);
        //    cc.log("d = " + d);
        //    //var acc = s.readBlob();
        //    //var pwd = s.readBlob();
        //    //KKVS.SelectFieldID = s.readUint8();
        //    //KKVS.Acc = KKVS.utf8ArrayToString(acc);
        //    //KKVS.Pwd = KKVS.utf8ArrayToString(pwd);
        //    //KKVS.INFO_MSG("acc = " + KKVS.Acc);
        //    //KKVS.INFO_MSG("pwd = " + KKVS.Pwd);
        //    //KKVS.Event.fire("cheetahReturn");
        //});
        //pLobby.on("onCheetahChangeLogin", function(data){
        //    cc.log("******* onCheetahChangeLogin");
        //    //RecvManager.onUserData(data);
        //});
        // pLobby.on(ON_CLOSE_CLIENT, function(data){
        //     console.log("******* on close client");
        //     RecvManager.onCloseClient(data);
        // });
        // pLobby.on(ON_GAME_MSG, function (data) {
        //     cc.log("****** on game msg");
        //     RecvManager.onGameMsg(data);
        // });
        //pLobby.on(ON_REFRESH_SIZE, function(data){
        //    cc.log("******* change size");
        //    onRefreshSize(data);
        //});
        pLobby.on("sendGameAccInfo", function (data) {
            cc.log("****** sendGameAccInfo");
            goLogin(data);
        });
    },
};