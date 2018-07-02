/**
 * Created by hades on 2017/2/17.
 * 组件系统
 * [下载器]:可进行组件热更新/下载
 * [系统UI]:显示所有的组件UI,包括状态(可更新/可下载, 无需更新)
 * [配置表]:包含所有组件的信息(id=id,name=名称,version=最新版本,manifest=组件配置文件,localmanifest=本地组件配置文件,directory=组件根目录,js=组件入口js文件,online=上线标志)
 * 配置表json格式如下:
 * [
 * {
 * "id" : 1,
 * "name" : "斗牛牛",
 * "version" : "1.0.0",
 * "directory" : "res/GameOx/",
 * "manifest" : "res/project.manifest",
 * "localmanifest" : "res/config/com_1_manifest.json",
 * "online" : true
 * },
 * ...
 * ]
 */
/**
 * 组件入口ComEntry : 具有统一的接口(安装/卸载)
 * =>安装install (添加相应的命名空间,加载js,push scene)
 * =>卸载uninstall (释放相应的命名空间,释放js,pop scene)
 */
var ComEntry = {};
var ComSys = cc.Node.extend({
    m_pConfig : null,
    m_pSysUI : null,
    m_pUserData : null,
    ctor : function (configPath, userData) {
        this._super();
        this.m_pConfig = [];
        this.m_pUserData = userData;
        this.httpCnt = 0;
        this.debug = true;
        this.isComLaunch = false;
        this.comLaunchNode = new cc.Node();
        this.comDownLoaderTask = [];
        this.comWakeUpDialog = null;
        this.m_pLimitClickFast = true;
        this.addChild(this.comLaunchNode);
        try {
            if (cc.sys.isNative) {
                this.m_pConfig = JSON.parse(jsb.fileUtils.getStringFromFile(configPath));
            } else {
                this.m_pConfig = JSON.parse(cc.loader._loadTxtSync(configPath));
            }
        } catch (e) {
        }
        if (cc.sys.isNative) {
            this.m_pSearchPaths = [];
            var searchPaths = jsb.fileUtils.getSearchPaths();
            for (var i = 0, len = searchPaths.length; i < len; ++i) {
                this.m_pSearchPaths.push(searchPaths[i]);
            }
        } else {
            this.m_pCCPath = cc.loader.resPath;
        }
        this.m_pSysUI = new ComSysUI(this, this.m_pConfig);
        this.addChild(this.m_pSysUI, 1);
    },

    getConfig : function (key) {
        for (var i = 0, len = this.m_pConfig.length; i < len; ++i) {
            var config = this.m_pConfig[i];
            if (config.id == key) {
                return config;
            }
        }
        return null;
    },
    getManifestPath : function (config) {
        if (!config) {
            return null;
        }
        return (config.directory + config.manifest);
    },
    getLocalManifestPath : function (config) {
        if (!config) {
            return null;
        }
        return config.localmanifest;
    },
    getManifest : function (config) {
        var manifest = null;
        var localmanifestPath = this.getLocalManifestPath(config);
        var manifestPath = this.getManifestPath(config);
        if (!localmanifestPath) {
            //local manifest path must exist
            return null;
        }
        if (manifestPath) {
            try {
                if (cc.sys.isNative) {
                    manifest = JSON.parse(jsb.fileUtils.getStringFromFile(manifestPath));
                } else {
                    manifest = JSON.parse(cc.loader._loadTxtSync(manifestPath));
                }
            } catch(e) {
                //not exist manifest file
            }
        }
        if (!manifest) {
            try {
                if (cc.sys.isNative) {
                    manifest = JSON.parse(jsb.fileUtils.getStringFromFile(localmanifestPath));
                } else {
                    manifest = JSON.parse(cc.loader._loadTxtSync(localmanifestPath));
                }
            } catch(e) {
                //not exist manifest file
            }
        }
        return manifest;
    },
    getVersion : function (config) {
        if (!config) {
            return null;
        }
        return config.version;
    },
    getLocalVersion : function (config) {
        var manifest = this.getManifest(config);
        if (!manifest) {
            return null;
        }
        return manifest.version;
    },
    getLocalConfig : function (config) {
        if (!config || !config.localconfig) {
            return null;
        }
        var localconfig = null;
        try {
            if (cc.sys.isNative) {
                localconfig = JSON.parse(jsb.fileUtils.getStringFromFile(config.localconfig));
            } else {
                localconfig = JSON.parse(cc.loader._loadTxtSync(config.localconfig));
            }
        } catch(e) {
            //not exist manifest file
        }
        return localconfig;
    },
    getServerConfig : function (config, tag, reconnect) { //tag : 强制加载标记, reconnect : 数据[包括:单款断线重连标记]
        var self = this;
        if (!config || typeof (config.lobbyid) != 'number') {
            self.showDialog("读取房间配置失败");
            return;
        }
        var curTick = (new Date()).getTime();
        var loadNew = tag;
        //5分钟刷新一次配置
        if (typeof (config.serverconfigtick) == 'undefined' || typeof (config.serverconfig) == 'undefined' || 5 * 60000 < curTick - config.serverconfigtick) {
            loadNew = true;
        }
        if (!loadNew) {
            KKVS.Event.fire("onServerConfig", config, reconnect);
            return;
        }
        modulelobby.showLoading(null, null, 10);
        var params = {
            lobby_id : config.lobbyid.toString(),
            load_time : curTick.toString()
        };
        HttpManager.GetMessage(http_url_prefix + "api_agnet_room_list.aspx", params, METHOD_POST, function (data) {
            var ret = null;
            try {
                ret = JSON.parse(data.trim());
            } catch (e) {
                //
            }
            if (!ret) {
                if (++self.httpCnt < 5) {
                    self.getServerConfig(config, true, reconnect);
                } else {
                    modulelobby.hideLoading();
                    self.showDialog("读取房间配置失败");
                }
                return;
            }
            modulelobby.hideLoading();
            self.httpCnt = 0;
            config.serverconfig = ret;
            config.serverconfigtick = curTick;
            KKVS.Event.fire("onServerConfig", config, reconnect);
        });
    },
    showDialog: function (str) {
        var dialog = new modulelobby.TxtDialog({title : "系统提示", txt : str});
        dialog.show();
    },
    resetSearchPaths : function () {
        if (cc.sys.isNative) {
            jsb.fileUtils.setSearchPaths(this.m_pSearchPaths);
        } else {
            cc.loader.resPath = this.m_pCCPath;
        }
    },
    onLaunch : function (config) {
        if (typeof(this.m_pSysUI.onSwitch) == 'function') {
            this.m_pSysUI.onSwitch(config, 1);
        } else {
            this.showDialog("组件启动失败!");
        }
    },
    onDownload : function (config, data) {
        //弹框
        //var downloader = new ComDownLoader(config, data);
        ////this.addChild(downloader, 2);
        //downloader.show();
        //圆形下载框
        var downloader = new ComDownLoader(config, data);
        downloader.show(config.com.download);
        this.comDownLoaderTask.push(downloader);
        //only one task doing
        var downloadTask = this.comDownLoaderTask[0];
        if (downloadTask.getState() == 0) {
            downloadTask.startDownLoad();
        } else {
            cc.log("current task state = " + downloadTask.getState().toString());
        }
    },
    downloadState : function () {
        var downloadTask = this.comDownLoaderTask[0];
        if (downloadTask && downloadTask.getState() == 2) {
            this.comDownLoaderTask.shift();
        }
        downloadTask = this.comDownLoaderTask[0];
        if (downloadTask && downloadTask.getState() == 0) {
            downloadTask.startDownLoad();
        }
    },
    serverConfig : function (config, userdata) {
        if (!config) {
            return;
        }
        KKVS.RoomListInfo = [];
        if (typeof (config.serverconfig) != 'undefined') {
            var tempRoomList = {};
            for (var c_ind = 0, c_len = config.serverconfig.length; c_ind < c_len; ++c_ind) {
                var c_data = config.serverconfig[c_ind];
                if (typeof (tempRoomList[c_data.field_id]) == 'undefined') {
                    var des = null;
                    if (typeof (ComSysData[config.id]) != 'undefined' && typeof (ComSysData[config.id][c_data.field_id]) != 'undefined') {
                        des = ComSysData[config.id][c_data.field_id];
                    }
                    KKVS.RoomListInfo.push({"field_mode" : ComSysData_RoomMode1, "field_id" : c_data.field_id, "name" : config.name, "description" : des});
                    tempRoomList[c_data.field_id] = [];
                }
                c_data.status = c_data.room_status;
                c_data.name = c_data.room_name;
                tempRoomList[c_data.field_id].push(c_data);
            }
            for (var rc_ind = 0, rc_len = KKVS.RoomListInfo.length; rc_ind < rc_len; ++rc_ind) {
                KKVS.RoomListInfo[rc_ind]["roomList"] = tempRoomList[KKVS.RoomListInfo[rc_ind]["field_id"]];
            }
        }
        //KKVS.RoomListInfo = []; //test
        if (!KKVS.RoomListInfo || KKVS.RoomListInfo.length == 0) {
            if (this.debug) {
                cc.log("++++++++++++++++++");
                cc.log("读取本地测试配置表");
                if (cc.sys.isNative) {
                    KKVS.RoomListInfo = JSON.parse(jsb.fileUtils.getStringFromFile(config.localconfig));
                } else {
                    KKVS.RoomListInfo = JSON.parse(cc.loader._loadTxtSync(config.localconfig));
                }
                for (var rc_ind = 0, rc_len = KKVS.RoomListInfo.length; rc_ind < rc_len; ++rc_ind) {
                    KKVS.RoomListInfo[rc_ind]["field_mode"] = ComSysData_RoomMode1;
                }
                cc.log("++++++++++++++++++");
            } else {
                this.showDialog("读取房间配置失败");
                return;
            }
        }
        //Custom(only one)
        if (typeof ComSysData_RoomCustom[config.id] != 'undefined') {
            for (var rc_ind = 0, rc_len = KKVS.RoomListInfo.length; rc_ind < rc_len; ++rc_ind) {
                if (KKVS.RoomListInfo[rc_ind]["field_id"] == ComSysData_RoomCustom[config.id]["field_id"]) {
                    KKVS.RoomListInfo[rc_ind]["field_mode"] = ComSysData_RoomMode3;
                    break;
                }
            }
        }
        //Match(only one)
        if (typeof ComSysData_RoomMatch[config.id] != 'undefined') {
            ComSysData_RoomMatch[config.id]["field_mode"] = ComSysData_RoomMode2;
            KKVS.RoomListInfo.push(ComSysData_RoomMatch[config.id]);
        }
        //logObj(KKVS.RoomListInfo);
        if (userdata && typeof userdata.lobbyid == 'number' && typeof userdata.mode == 'number') {
            cc.log("进入特定模式......");
            //mode : 1=断线模式 2=比赛模式 3=开房模式
            if (userdata.mode == 1 && userdata.lobbyid == config.lobbyid) {
                KKVS.SelectFieldID = -1; //0
                KKVS.EnterRoomID = -1;
                this.installComponent(config, userdata);
            } else if (userdata.mode == 2 && typeof config.matchid == 'number' && userdata.lobbyid == config.matchid) {
                this.installComponent(config, userdata);
            } else if (userdata.mode == 3 && userdata.lobbyid == config.lobbyid) {
                this.installComponent(config, userdata);
            } else {
                cc.log("->ComSys::serverConfig => invalid mode or other error");
            }
        } else {
            cc.log("进入正常模式......");
            this.onLaunch(config);
        }
    },
    launchComponent : function (config) {
        if (typeof config.online == 'boolean' && config.online == false) {
            cc.log("->ComSys::launchComponent => config.online == false");
            modulelobby.showTipDialog({txt : "敬请期待"});
            return;
        }
        var version = this.getVersion(config);
        var localVersion = this.getLocalVersion(config);
        if (!version || !localVersion) {
            cc.log("->ComSys::launchComponent => !version || !localVersion");
            return;
        }
        //if (version == localVersion && cc.sys.isNative) {
        //    this.getServerConfig(config, false, null);
        //} else {
        //    this.onDownload(config, null);
        //}
        var self = this;
        if (this.m_pLimitClickFast) {//快速点击2个已下载的游戏||同1个，会造成程序崩
            this.m_pLimitClickFast = false;
            this.runAction(cc.sequence(cc.delayTime(0.5), cc.callFunc(function () {
                self.m_pLimitClickFast = true;
            })));
            if (this.comDownLoaderTask.length == 0) {
                if (version == localVersion && cc.sys.isNative) {
                    this.getServerConfig(config, false, null);
                } else {
                    KKVS.Event.fire("ComSys_GameDownloadOnly", true);
                    this.onDownload(config, null);
                }
            }else {
                (new modulelobby.TipDialog({txt : "目前有游戏正在下载，请耐心等候！"})).show();
            }
        }
    },
    downloadComponent : function (config, data) {
        if (!config) {
            return;
        }
        if (typeof(this.m_pSysUI.onDownload) == 'function') {
            this.m_pSysUI.onDownload(config);
        }
        this.getServerConfig(config, false, data);
    },
    installComponent : function (config, cdata) {
        //cc.log("->ComSys::installComponent->" + config.name);
        if (KKVS.Kicked || OnLineManager._kicked) {
            cc.log("->ComSys::installComponent => (KKVS.Kicked || OnLineManager._kicked)");
            return;
        }
        if (!cc.sys.isNative) {
            //浏览器
            //加载js文件两个规范:
            //CommonJS => 同步加载, 例: var math = require('math'); math.add(2, 3);
            //AMD => 异步加载, 例: require([module], callback);
            //注: cocos使用的是 同步加载
            //为了让同名资源具有唯一性,每个资源都使用了全路径,修改有:
            //ccBoot.js
            //cc.Audio;
            //cc.textureCache;
            //TexturesWebGL.js 两种渲染方法,canvas和webgl
            //cc.spriteFrameCache; 帧名使用了原始名称,文件名使用全路径(帧名如果使用全路径则需要修改cocos studio数据加载底层)
            var _v = this.getVersion(config);
            _v = !_v ? (new Date() - 0) : _v;
            var comAppJsFile = !config.appjs ? ("src/game.min.js" + "?_v=" + _v) : config.appjs;
            this._installComponent(config, comAppJsFile, cdata);
        } else {
            var comJsFile = !config.js ? "src/ComJs.js" : config.js;
            this._installComponent(config, comJsFile, cdata);
        }
    },
    _installComponent : function (config, comJsFile, cdata) {
        var self = this;
        modulelobby.showLoading(null, null, 1);
        var directory = !config.directory ? "" : config.directory;
        //reset ComEntry
        //ComEntry = {};
        //ComEntry.install = null;
        //ComEntry.uninstall = null;
        //cc.log("->gameEngine = {}");
        //gameEngine = {};
        //logObj(gameEngine);
        self.comLaunchNode.stopAllActions();
        self.isComLaunch = true;
        self.m_pUserData.cdata = cdata;
        KKVS.Event.fire("ComSys_EnterComponent", config, cdata);
        self.runAction(cc.sequence(cc.delayTime(0.1), cc.callFunc(function () {
            try {
                cc.loader.loadJs(directory, [comJsFile], function (error) {
                    if (error) {
                        cc.log(error);
                        self.resetSearchPaths();
                        self.showDialog("组件下载失败!");
                        self.isComLaunch = false;
                    } else if (typeof (ComEntry.install) == 'function') {
                        self.comLaunchNode.runAction(cc.sequence(cc.delayTime(3), cc.callFunc(function (sender) {
                            self.isComLaunch = false;
                        })));
                        ComEntry.install(config, self.m_pUserData);
                    } else {
                        self.resetSearchPaths();
                        self.showDialog("组件加载失败!");
                        self.isComLaunch = false;
                    }
                });
            } catch (e) {
                cc.log(e.toString());
                self.resetSearchPaths();
                self.showDialog("组件加载失败!");
                self.isComLaunch = false;
            }
            modulelobby.hideLoading();
        })));
    },
    switchGo : function (param) {
        if (typeof(this.m_pSysUI.onSwitchGo) == 'function') {
            this.m_pSysUI.onSwitchGo(param);
        }
    },
    restartComponent : function (param) {
        cc.log("=>ComSys::restartComponent, gameid=" + param.game_id);
        if (this.isComLaunch) {
            cc.log("restartComponent => 当前存在已启动或正在准备启动的组件,不需要启动第二个");
            return;
        }
        var lobby_id = param.game_id;
        var config = null;
        for (var i = 0, len = this.m_pConfig.length; i < len; ++i) {
            if (this.m_pConfig[i].lobbyid == lobby_id) {
                config = this.m_pConfig[i];
                break;
            }
        }
        if (!config) {
            cc.log("->ComSys::restartComponent => config is null");
            return;
        }
        var version = this.getVersion(config);
        var localVersion = this.getLocalVersion(config);
        if (!version || !localVersion) {
            cc.log("->ComSys::restartComponent => !version || !localVersion");
            return;
        }

        if( param.room_id && typeof param.room_id != 'undefined'){
            cc.log("@@@@@启动房卡模式组件@@@@@ " + config.name);
            userData = {lobbyid : lobby_id, mode : 3, param : param};
        } else{
            cc.log("@@@@@启动普通场组件@@@@@ " + config.name);
            userData = {lobbyid : lobby_id, mode : 1, param : null};
        }

        
        if (version == localVersion && cc.sys.isNative) {
            this.getServerConfig(config, false, userData);
        } else {
            cc.log("==>onDownload");
            this.onDownload(config, userData);
        }
    },
    matchComponent : function (param) {
        if (this.isComLaunch) {
            cc.log("matchComponent => 当前存在已启动或正在准备启动的组件,不需要启动第二个(可为提示框的形式)");
            return;
        }
        var lobby_id = 110; //暂时只有 斗地主 比赛
        var config = null;
        for (var i = 0, len = this.m_pConfig.length; i < len; ++i) {
            if (typeof (this.m_pConfig[i].matchid) == 'number' && this.m_pConfig[i].matchid == lobby_id) {
                config = this.m_pConfig[i];
                break;
            }
        }
        if (!config) {
            cc.log("->ComSys::addMatchComponent => config is null");
            return;
        }
        var version = this.getVersion(config);
        var localVersion = this.getLocalVersion(config);
        if (!version || !localVersion) {
            cc.log("->ComSys::addMatchComponent => !version || !localVersion");
            return;
        }
        cc.log("@@@@@启动比赛组件@@@@@ " + config.name);
        var userData = {lobbyid : lobby_id, mode : 2, param : param};
        if (version == localVersion && cc.sys.isNative) {
            this.getServerConfig(config, false, userData);
        } else {
            this.onDownload(config, userData);
        }
    },
    autoComponent : function () {
        cc.log("==>autoComponent");
        this._autoAddComponent();
    },
    _autoAddComponent : function () {
        if (KKVS.Kicked || OnLineManager._kicked) {
            cc.log("->ComSys::_autoAddComponent => (KKVS.Kicked || OnLineManager._kicked)");
            return;
        }
        //优先级 比赛->普通
        if (this.isComLaunch) {
            cc.log("_autoAddComponent => 当前存在已启动或正在准备启动的组件,不需要启动第二个");
            return;
        }
        if (KKVS.CurMatchData) {
            //比赛房间[强制性]
            if (KKVS.MatchData[KKVS.CurMatchData.MatchID] && KKVS.MatchData[KKVS.CurMatchData.MatchID]["Status"] == 1) {
                this.matchComponent(KKVS.CurMatchData);
            } else {
                modulelobby.showTxtDialog({title : "系统提示",txt : "您报名的比赛已经结束了"});
            }
            KKVS.CurMatchData = null;
            return;
        }
        //邀请房间[可选择]
        if (!KKVS.ReRoomData) {
            this._optionalWakeUpComponent();
        }
        //比赛房间[可选择] 按优先级[高->低]选择
        for (var key in KKVS.MatchData) {
            cc.log("==>key=" + key.toString());
            if (KKVS.MatchData[key] && KKVS.MatchData[key]["Status"] == 1) {
                this._optionalMatchComponent();
                return;
            }
        }
        if (KKVS.ReRoomData) {
            //断线重连[强制性]
            this.restartComponent(KKVS.ReRoomData);
            KKVS.ReRoomData = null;
            return;
        }
        //邀请房间[可选择]
        this._optionalWakeUpComponent();
    },
    _optionalWakeUpComponent : function () {
        var self = this;
        var wakeupData = getWakeUpData();
        if (wakeupData && wakeupData.roomid) {
            if (this.comWakeUpDialog) {
                this.comWakeUpDialog.close();
                this.comWakeUpDialog = null;
            }
            this.comWakeUpDialog = modulelobby.showTxtDialog({title : "系统提示",txt : "确定进入邀请房间" + wakeupData.roomid.toString() + "?", type : 2, cb : function () {
                self.comWakeUpDialog = null;
                KBEngine.app.player().joinGameRoom(parseInt(wakeupData.roomid), "******");
            }, cb2 : function () {
                self.comWakeUpDialog = null;
            }});
        }
    },
    _optionalMatchComponent : function () {
        modulelobby.showTxtDialog({title : "系统提示",txt : "您报名的比赛开始了,确定进入?", type : 2, cb : this.isMatchComponent, target : this});
    },
    isMatchComponent : function () {
        var matchCom = [];
        for (var key in KKVS.MatchData) {
            if (KKVS.MatchData[key] && KKVS.MatchData[key]["Status"] == 1) {
                matchCom.push(KKVS.MatchData[key]);
            }
        }
        if (0 < matchCom.length) {
            matchCom.sort(function (a, b) {
                var priority_a = ComSysData_RoomMatchPriority[a["MatchID"]] ? ComSysData_RoomMatchPriority[a["MatchID"]] : 1;
                var priority_b = ComSysData_RoomMatchPriority[b["MatchID"]] ? ComSysData_RoomMatchPriority[b["MatchID"]] : 1;
                if (priority_a == priority_b) {
                    return 0;
                } else if (priority_a < priority_b) {
                    return 1;
                } else {
                    return -1;
                }
            });
            this.matchComponent(matchCom[0]);
        } else {
            modulelobby.showTxtDialog({title : "系统提示",txt : "您报名的比赛已经结束了"});
        }
    },
    // new function for RoomCardMode
    on_player_join_room:function(params) {
        cc.log("on_player_join_room lobbyID = " + params.game_id);
        KKVS.SelectFieldID = params.field_type;
        cc.log("KKVS.SelectFieldID = " + KKVS.SelectFieldID);
        this.restartComponent(params);
    },
    onEnter : function () {
        cc.Node.prototype.onEnter.call(this);
        KKVS.Event.register("onLaunchComponent", this, "launchComponent");
        KKVS.Event.register("onDownloadComponent", this, "downloadComponent");
        KKVS.Event.register("onInstallComponent", this, "installComponent");
        KKVS.Event.register("onDownloadState", this, "downloadState");
        KKVS.Event.register("ComSys_Switch_Go", this, "switchGo");
        KKVS.Event.register("ComSys_DownLoader_Close", this, "resetSearchPaths");
        KKVS.Event.register("onServerConfig", this, "serverConfig");
        KKVS.Event.register("ComSys_RestartComponent", this, "restartComponent");
        KKVS.Event.register("ComSys_MatchComponent", this, "matchComponent");
        KKVS.Event.register("ComSys_AutoComponent", this, "autoComponent");
        KKVS.Event.register("on_player_join_room", this, "on_player_join_room");
        var self = this;
        this.comLaunchNode.stopAllActions();
        this.isComLaunch = false;
        if (KKVS.Kicked || OnLineManager._kicked) {
            cc.log("KKVS.Kicked == true || OnLineManager._kicked == true");
        } else {
            this.runAction(cc.sequence(cc.delayTime(0.01), cc.callFunc(function () {
                self._autoAddComponent();
            })));
        }
    },
    onExit : function () {
        KKVS.Event.deregister("onLaunchComponent", this);
        KKVS.Event.deregister("onDownloadComponent", this);
        KKVS.Event.deregister("onInstallComponent", this);
        KKVS.Event.deregister("onDownloadState", this);
        KKVS.Event.deregister("ComSys_Switch_Go", this);
        KKVS.Event.deregister("ComSys_DownLoader_Close", this);
        KKVS.Event.deregister("onServerConfig", this);
        KKVS.Event.deregister("ComSys_RestartComponent", this);
        KKVS.Event.deregister("ComSys_MatchComponent", this);
        KKVS.Event.deregister("ComSys_AutoComponent", this);
        KKVS.Event.deregister("on_player_join_room", this);
        cc.Node.prototype.onExit.call(this);
    }
});