var gameEngine = require("./gameEngine");

cc.Class({
    extends: cc.Component,

    properties: {
        ip : "127.0.0.1",
        port:"20013",
    },

    // use this for initialization
    onLoad: function () {
        gameEngine.destroy();
        var args = new gameEngine.gameEngineArgs();
		args.ip = this.ip;
		args.port = this.port;
        gameEngine.create(args);
    },
});
