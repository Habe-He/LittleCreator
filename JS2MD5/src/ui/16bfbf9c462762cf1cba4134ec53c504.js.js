var DEBUG_HOTUPDATE = false;
var TIMEOUT_HOTUPDATE = 5*60;
var __failCount = 0;
modulelobby.Loading = cc.Layer.extend({
    m_pTipsTxt: null,
    m_pDownLoadBar: null,
    m_pLoadingBar: null,
    m_pProgressBar: null,

    _am: null,
    _percent: 0,
    //_percentByFile: 0,
    _localBigVersion: 1,
    m_bSimulator: false,
    m_fTime: 0,
    m_downloadTag : false,
    m_aTips: [],
    m_nTipsIndex: 0,

    ctor: function () {
        this._super();

        this._am = null;
        this.m_bSimulator = false;
        this.m_fTime = 0;
        this._percent = 0;
        //this._percentByFile = 0;
        this._localBigVersion = typeof (cc.versioncode) == 'number' ? cc.versioncode : 1;
        this._localPendingVersion = typeof (cc.pendingcode) == 'string' ? cc.pendingcode : "";
        this.m_downloadTag = false;
        this.m_bTimeOut = false;
        if (cc.sys.isNative && cc.sys.os == cc.sys.OS_WINDOWS)
        {
            DEBUG_HOTUPDATE = true;
        }
        __failCount = 0;
        var json = ccs.load("res/loading.json");
        var visibleSize = cc.director.getVisibleSize();
        var origin = cc.director.getVisibleOrigin();
        json.node.x = origin.x + visibleSize.width / 2 - json.node.getContentSize().width / 2;
        json.node.y = origin.y + visibleSize.height / 2 - json.node.getContentSize().height / 2;
        this.addChild(json.node);
        var rootNode = json.node;

        this.m_nTipsIndex = 1;
        this.m_aTips = [
            //"开开游戏中心，天天精彩，天天有戏，更多好玩的游戏等着您。",
            //"棋牌包括有飞禽走兽、抢庄斗牛、湖北麻将、四川麻将、斗地主等时尚游戏。",
            //"我们专注为玩家提供一个公平公正，绿色健康的娱乐平台。官网网址：www.kkvs.com"
            "斗地主赢3局即可开红包，微信或手机号登录即送1元红包余额。",
            "斗地主赢3局即可开红包，微信或手机号登录即送1元红包余额。",
            "斗地主赢3局即可开红包，微信或手机号登录即送1元红包余额。"
        ]

        var bg = rootNode.getChildByName("bg");
        //var tipsBg = bg.getChildByName("tipsbg");
        this.m_pTipsTxt = bg.getChildByName("txt");
        //this.m_pTipsTxt.ignoreContentAdaptWithSize(true);
        this.m_pDownLoadBar = bg.getChildByName("download");
        this.m_pDownLoadBar.setString("0.0%");
        this.m_pDownLoadBar.ignoreContentAdaptWithSize(true);

        this.m_pLoadingBar = bg.getChildByName("loading");
        this.m_pLoadingBar.ignoreContentAdaptWithSize(true);
        //this.m_pLoadingBar.setVisible(false);
		this.m_pProgressBar = bg.getChildByName("loadingBg").getChildByName("LoadingBar");
        this.m_pProgressBar.setPercent(0.0);
		var self = this;
        var times = cc.delayTime(3);
        var callback = cc.callFunc(function () {
            self.m_pTipsTxt.setString(self.m_aTips[self.m_nTipsIndex]);
            self.m_nTipsIndex = parseInt(self.m_nTipsIndex + 1);
            if (self.m_nTipsIndex >= self.m_aTips.length) {
                self.m_nTipsIndex = 0;
            }
        }, this);
        var seq = cc.sequence(times, callback)
        this.m_pTipsTxt.runAction(cc.repeatForever(seq));

        //var icon = bg.getChildByName("icon");
        //var icon_act = json.action;
        //icon.runAction(icon_act);
        //icon_act.play("run", true);
        this.m_bInstallCB = true;
        return true;
    },
    installCB : function () {
        var self = this;
        if (self.m_bInstallCB) {
            self.stopAllActions();
            self.runAction(cc.sequence(cc.delayTime(0.01), cc.callFunc(function () {
                //获取服务器配置
                getServerConfig();
            })));
        }
    },
    serverConfigCB : function (tag) {
        if (!tag) {
            cc.log("读取网络配置失败,则读取本地配置");
            try {
                var config = null;
                if (cc.sys.isNative) {
                    config = JSON.parse(jsb.fileUtils.getStringFromFile("res/config/serverconfig.json"));
                } else {
                    config = JSON.parse(cc.loader._loadTxtSync("res/config/serverconfig.json"));
                }
                KKVS.serverConfigData = {};
                for (var i = 0, l = config.length; i < l; ++i) {
                    var temp = config[i];
                    KKVS.serverConfigData[temp['StatusName']] = temp;
                }
                //logObj(config)
                this.checkUpdate();
            } catch (e) {
                cc.log(e.toString());
                this.showDialog("读取配置失败,请检查网络连接后重试");
            }
        } else {
            this.checkUpdate();
        }
    },
    onEnter : function () {
        cc.Layer.prototype.onEnter.call(this);
        this.unscheduleUpdate();
        KKVS.Event.register("INSTALLCB", this, "installCB");
        KKVS.Event.register("SERVERCONFIGCB", this, "serverConfigCB");
        var self = this;
        if (!cc.sys.isNative || DEBUG_HOTUPDATE) {
            self.runAction(cc.sequence(cc.delayTime(0.01), cc.callFunc(function () {
                self.m_bInstallCB = false;
                getServerConfig();
            })));
        } else {
            self.runAction(cc.sequence(cc.delayTime(0.01), cc.callFunc(function () {
                self.m_bInstallCB = false;
                getServerConfig();
            })));
            //获取渠道包信息
            //getInstallData();
        }
    },

    onExit : function () {
        KKVS.Event.deregister("INSTALLCB", this);
        KKVS.Event.deregister("SERVERCONFIGCB", this);
        try{
            //this.unscheduleUpdate();
            if(this._am){
                this._am.release();
            }
        }
        catch(e){
        }
        this.m_pTipsTxt.stopAllActions();
        cc.Layer.prototype.onExit.call(this);
    },

    checkUpdate : function () {
        var self = this;
        if (DEBUG_HOTUPDATE) {
            this.startUpdate();
        } else if (!cc.sys.isNative) {
            //浏览器
            cc.loader.load(modulelobby.g_res_hot,
                function (result, count, loadedCount) {
                    var percent = (loadedCount / count * 100) | 0;
                    self._percent = Math.min(percent, 100);
                    var str = self._percent.toString() + "%";
                    self.m_pDownLoadBar.setString(str);
                    self.m_pProgressBar.setPercent(self._percent);
                    //cc.log("加载中... " + self._percent.toString() + "%");
                }, function () {
                    self.gotoNextScene();
                });
        }else
        {
            var storagePath = (jsb.fileUtils ? jsb.fileUtils.getWritablePath() : "./");
            if (cc.sys.os == cc.sys.OS_WINDOWS) {
                //storagePath += "publish/win32/download";
            }
            cc.log("storegePath : " + storagePath );
            this._am = new jsb.AssetsManager("res/project.manifest", storagePath);
            this._am.retain();

            var localVersion = this._am.getLocalManifest().getVersion();
            cc.log("localVersion : " + localVersion);
            //var versionArray = localVersion.split('.');
            //this._localBigVersion = versionArray != undefined && versionArray.length > 0 ?  versionArray[0] : 1;
            //this._localBigVersion = parseInt(this._localBigVersion);
            cc.log("_localBigVersion : " + this._localBigVersion);

            this.m_bTimeOut = true;
            this.runAction(cc.sequence(cc.delayTime(TIMEOUT_HOTUPDATE),cc.callFunc(self.notifyTimeOut,self)));
            this.GetRemoteBigVersion();
        }
    },

    GetRemoteBigVersion: function () {
        cc.log("GetRemoteBigVersion1");
        var self = this;
        try{
            var url = this._am.getLocalManifest().getPackageUrl();
            url =  url + "bigversion.manifest?_t=" + (new Date()).getTime().toString();
            cc.log("url " + url);
            var xmlHttp = cc.loader.getXMLHttpRequest();
            xmlHttp.open("GET", url, true);
            xmlHttp.send();
            xmlHttp.onerror = function(){
                cc.log("ERROR");
                if (self._errorCallBack) {
                    self._errorCallBack();
                }
            };
            //回调
            xmlHttp.onreadystatechange = function () {
                cc.log(" xmlHttp.onreadystatechange ");
                if (xmlHttp.readyState == 4) {
                    if (xmlHttp.status == 200) {
                        var strData = "";
                        if (xmlHttp.responseText.length > 0) {
                            strData = xmlHttp.responseText;
                            self._succCallback(strData);
                        } else {
                            cc.log("什么都没有，请检查网络");
                            return;
                        }
                    }
                    else {
                        //网络错误处理
                        if (self._errorCallBack) {
                            self._errorCallBack();
                        }
                    }
                } else {
                    //网络错误处理
                    if (self._errorCallBack) {
                        self._errorCallBack();
                    }
                }
            }
        }
        catch(e){
            //网络错误处理
            if (self._errorCallBack) {
                self._errorCallBack();
            }
        }
    },

    _succCallback: function (strData) {
        cc.log("获取大版本成功 :" + JSON.stringify(strData));
        this.m_bTimeOut = false;
        var jsonData = JSON.parse(strData);
        if (jsonData.pendingversion && this._localPendingVersion != "") {
            var pendingversion = [];
            if (typeof jsonData.pendingversion == 'string') {
                pendingversion.push(jsonData.pendingversion);
            } else if (jsonData.pendingversion instanceof Array) {
                pendingversion = jsonData.pendingversion;
            }
            for (var i = 0, l = pendingversion.length; i < l; ++i) {
                if (pendingversion[i] == this._localPendingVersion) {
                    cc.log("审核版本 直接进游戏");
                    KKVS.IsPendingVersion = true;
                    this.loadGame();
                    return;
                }
            }
        }
        //var downloadURL = jsonData.downloadUrl;
        var remoteBigVersion = parseInt(jsonData.bigversion);
        //var version = jsonData.version;
        cc.log("remoteBigVersion = " + remoteBigVersion);
        cc.log("_localBigVersion = " + this._localBigVersion);
        //cc.gameversion = version ;
        if(remoteBigVersion != this._localBigVersion){
            cc.log("大版本不相同 重新下载安装包");
            this.m_downloadTag = true;
            this.showDialog("有新版本需要更新，本次更新为强制更新");
        }
        else
        {
            cc.log("大版本相同 不需要重新下载安装包");
            this.startUpdate();
        }
    },

    _errorCallBack: function () {
        this.m_bTimeOut = false;
        //this.showDialog("版本检测失败,请检查网络连接后重试");
        //大版本检测失败,直接进入游戏
        this.loadGame();
    },

    updateProgress:function(dt){
        if(this._percent >=100){
            return;
        }
        this.m_fTime += dt;
        if(DEBUG_HOTUPDATE || this.m_bSimulator == true){
            //this._percent += dt;
            this._percent += Math.random(1.5);
        }
        else{
            if (!cc.sys.isNative) {//浏览器 模拟
                this._percent += Math.random(1.5);
            }
        }
        if(this._percent >=100){
            this._percent = 100.0000;
        }

        if(this.m_pDownLoadBar) {
            var str = this._percent.toFixed(1).toString() + "%";
            //var str = "玩命更新中... " + this._percent.toFixed(1) + "%";
            this.m_pDownLoadBar.setString(str);
            this.m_pProgressBar.setPercent(this._percent);
        }

        if ((!cc.sys.isNative || DEBUG_HOTUPDATE || this.m_bSimulator == true) && this._percent >= 100 ) {//浏览器 模拟
            cc.log("---------更新进度完成-------");
            this.unscheduleUpdate();
            this.loadGame();
        }
    },

    update: function (dt) {
        this.updateProgress(dt);
    },

    notifyTimeOut: function () {
        cc.log("更新 操作超时");
        if(this.m_bTimeOut) {
            this.m_bTimeOut = false;
            //cc.game.restart();
            this.restart();
        }
    },

    startUpdate: function () {
        if(DEBUG_HOTUPDATE || !cc.sys.isNative ){
            this.scheduleUpdate();
            return;
        }
        if (!this._am.getLocalManifest().isLoaded())
        {
            this.loadGame();
        }
        else
        {
            this.scheduleUpdate();
            var that = this;
            var listener = new jsb.EventListenerAssetsManager(this._am, function(event) {
                switch (event.getEventCode()){
                    case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                    case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
                    case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                        that.loadGame();
                        break;
                    case jsb.EventAssetsManager.NEW_VERSION_FOUND:
                        cc.log("------------发现新版本,开始更新----------");
                        break;
                    case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                        cc.log("-------------没有更新，直接加载游戏-----------------");
                        that.loadGame(); //true
                        break;
                    case jsb.EventAssetsManager.UPDATE_PROGRESSION:
                        that._percent = event.getPercentByFile();
                        //that._percent = event.getPercent();
                        break;
                    case jsb.EventAssetsManager.ASSET_UPDATED:
                        //cc.log("ASSET_UPDATED:" + event.getMessage() + ", AssetId:" + event.getAssetId());
                        break;
                    case jsb.EventAssetsManager.ERROR_UPDATING:
                        //cc.log("ERROR_UPDATING:" + event.getMessage() + ", AssetId:" + event.getAssetId());
                        break;
                    case jsb.EventAssetsManager.UPDATE_FAILED:
                        __failCount ++;
                        cc.log("Update failed. failCount = " + __failCount);
                        if (__failCount > 5) {
                            __failCount = 0;
                            that.loadGame();
                        } else {
                            that._am.downloadFailedAssets();
                        }
                        break;
                    case jsb.EventAssetsManager.UPDATE_FINISHED:
                        cc.log("-------------有更新，更新完成 重新加载脚本！-----------------");
                        cc.log("Update finished.");
                        //cc.game.restart();
                        that.restart();
                        break;
                    case jsb.EventAssetsManager.ERROR_DECOMPRESS:
                        cc.log("ERROR_DECOMPRESS"+event.getMessage());
                        that.loadGame();
                        break;
                    default:
                        break;
                }
            });

            cc.eventManager.addListener(listener, 1);
            this._am.update();
        }
    },

    loadGame:function(bSimulator){

        if( bSimulator == true && this._percent == 0 ){//没有更新  模拟一下假的进度
            this.m_bSimulator = true;
            return ;
        }

        cc.log("----this.m_fTime----- " + this.m_fTime);
        if( bSimulator == true && parseInt(this.m_fTime - 3) <= 0 ){//更新 太快 模拟一下假的进度
            this._percent = 0;
            this.m_bSimulator = true;
            return ;
        }

        this.gotoNextScene();
    },

    gotoNextScene: function () {
        if (cc.sys.isNative) {
            var visit = cc.sys.localStorage.getItem("local_data_visit");
            visit = !visit ? "" : parseInt(visit);
            modulelobby.AUTOMATIC_LOGON = visit;
            if (modulelobby.AUTOMATIC_LOGON) {
                modulelobby.runScene(modulelobby.Preloading, modulelobby.AUTOMATIC_LOGON);
            } else {
                modulelobby.rootScene(modulelobby.Login);
            }
        } else {
            modulelobby.rootScene(modulelobby.Login);
        }
    },

    restart : function () {
        //cc.game.restart();
        var self = this;
        //cc.director.popToSceneStackLevel(0);
        // Clean up audio
        cc.audioEngine && cc.audioEngine.end();
        try {
            cc.loader.loadJs('', ["src/files.js"], function() {
                cc.loader.loadJs('', jsFiles, function(){
                    modulelobby.EntryViewClass = 1;
                    modulelobby.rootScene(modulelobby.EntryView);
                });
            });
        } catch (e) {
            cc.log(e.toString());
            self.showDialog("游戏启动失败!");
        }
    },

    onCloseDialog: function () {
        if (this.m_downloadTag) {
            this.m_downloadTag = false;
            //下载大版本
            var downloadurl = KKVS.serverConfigData['下载地址']['StatusString'];
            if (/\?/.test(downloadurl)) {
                cc.sys.openURL(downloadurl + "&wakeup=0");
            } else {
                cc.sys.openURL(downloadurl + "?wakeup=0");
            }
        }
        UMengAgentMain.end(); //um

        if (cc.sys.os == cc.sys.OS_IOS) {

        } else {
            cc.director.end();
        }
    },

    showDialog: function (str) {
        if (!cc.sys.isNative) {
            window.alert(str); //此时还没有下载好弹框的资源
        } else {
            var dialog = new modulelobby.TxtDialog({txt : str, cb : this.onCloseDialog, target : this});
            dialog.show();
        }
    }
});