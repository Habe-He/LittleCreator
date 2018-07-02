//  Creatr by Kent on 2016.03.03.
//  lobby interface
//  auxiliary C++ | JS Call each other

var LobbyInterface = 
{
    /*
        unified send interface
        @interfaceID     interface id
        @pBuffer         Binary data stream
    */
    send_data: function (interfaceID, pBuffer) {
        cc.log("Interface name = " + interfaceID);
        if (!cc.sys.isNative) {
            return;
        }
        var lobbyInterface = LobbyManager.getInstance();

        lobbyInterface.fireEvent(interfaceID, pBuffer);
    }
};