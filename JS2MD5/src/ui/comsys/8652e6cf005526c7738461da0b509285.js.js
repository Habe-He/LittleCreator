/**
 * Created by hades on 2017/2/16.
 * 组件下载器: (热更新)使用jsb.AssetsManager
 */
var ComDownLoader = cc.Node.extend({
    ctor: function (com_config, com_data) {
        this._super();
        this.m_pConfig = com_config;
        this.m_pUserData = com_data;
        this.m_pPathRoot = !this.m_pConfig.directory ? "" : this.m_pConfig.directory;
        this.m_pPathManifest = !this.m_pConfig.localmanifest ? "res/project.manifest" : this.m_pConfig.localmanifest;
        this.m_bDebugHotupdate = false;
        this.m_nFailCount = 0;
        //this.m_nTimeout = 5 * 60;
        this._am = null;
        this._percent = 0;
        //this._percentTask = 0;
        if (cc.sys.isNative && cc.sys.os == cc.sys.OS_WINDOWS) {
            this.m_bDebugHotupdate = true;
        }
        this.m_state = 0; // 0=等待下载, 1=下载中, 2=下载结束
        //var json = ccs.load("res/downloader_ui.json");
        //var visibleSize = cc.director.getVisibleSize();
        //var origin = cc.director.getVisibleOrigin();
        //json.node.x = origin.x + visibleSize.width / 2 - json.node.getContentSize().width / 2;
        //json.node.y = origin.y + visibleSize.height / 2 - json.node.getContentSize().height / 2;
        //this.addChild(json.node, 1);
        //var self = this;
        //
        //this._layer = json.node.getChildByName("back");
        //var body = json.node.getChildByName("body");
        //this._body = body;
        //this.m_pTipsTxt = body.getChildByName("tiptxt");
        //this.m_pTipsTxt.ignoreContentAdaptWithSize(true);
        //if (typeof (this.m_pConfig.name) == 'string') {
        //    this.m_pTipsTxt.setString("正在下载\'" + this.m_pConfig.name.toString() + "\'资源,请稍候!");
        //}
        //this.m_pProgressBarTxt = body.getChildByName("loadingbar_txt");
        //this.m_pProgressBarTxt.ignoreContentAdaptWithSize(true);
        //this.m_pProgressBar = body.getChildByName("loadingbar");
        //this.m_pProgressBar.setPercent(0.0);
        //this.m_pProgressBarTxt.setString("检测资源更新...");
        //
        //var cancelbtn = body.getChildByName("cancelbtn");
        //cancelbtn.addClickEventListener(function (sender) {
        //    cancelbtn.setTouchEnabled(false);
        //    self.onCloseDialog();
        //});
        //var closebtn = body.getChildByName("closebtn");
        //closebtn.addClickEventListener(function (sender) {
        //    closebtn.setTouchEnabled(false);
        //    self.onCloseDialog();
        //});
        //new downloader圆形进度条
        var json_new = ccs.load("res/downloader_new.json");
        this.addChild(json_new.node);
        var body_new = json_new.node.getChildByName("body");
        this.progressbartext = json_new.node.getChildByName("text");
        this.progressbartext.ignoreContentAdaptWithSize(true);
        this.count_down = body_new.getChildByName("png");
        this.m_progresstimer = new cc.ProgressTimer(this.count_down);
        this.m_progresstimer.setType(cc.ProgressTimer.TYPE_RADIAL);
        this.m_progresstimer.setReverseDirection(false);
        this.m_progresstimer.setPercentage(0);
        this.m_progresstimer.setPosition(cc.p(this.count_down.getPositionX(), this.count_down.getPositionY()));
        body_new.addChild(this.m_progresstimer);
        ////条形进度条
        //var json_new = ccs.load("res/downloader_new.json");
        //this.addChild(json_new.node);
        //var body_new = json_new.node.getChildByName("body");
        //var body = body_new.getChildByName("png");
        //body.setVisible(false);
        //this.progressbartext = json_new.node.getChildByName("text");
        //this.progressbartext.ignoreContentAdaptWithSize(true);
        //this.m_progresstimer = new cc.ProgressTimer(body);
        //this.m_progresstimer.setType(cc.ProgressTimer.TYPE_BAR);
        //this.m_progresstimer.setMidpoint(cc.p(0, 1));
        //this.m_progresstimer.setBarChangeRate(cc.p(0,1));
        //this.m_progresstimer.setPercentage(100);
        //this.m_progresstimer.setPosition(cc.p(body.getPositionX(), body.getPositionY()));
        //body_new.addChild(this.m_progresstimer);

        return true;
    },
    //getBody : function () {
    //    return this._body;
    //},
    //getLayer : function () {
    //    return this._layer;
    //},
    show : function (parentNode) {
        if (parentNode) {
            parentNode.addChild(this);
        }
    },
    startDownLoad : function () {
        this.unscheduleUpdate();
        //KKVS.Event.register("onLoaderLoad", this, "onLoaderLoad");
        var self = this;
        self.runAction(cc.sequence(cc.delayTime(0.01), cc.callFunc(function () {
            self.checkUpdate();
        })));
    },
    getState : function () {
        return this.m_state;
    },
    onEnter : function () {
        this._super();
        //this.unscheduleUpdate();
        ////KKVS.Event.register("onLoaderLoad", this, "onLoaderLoad");
        //var self = this;
        //self.runAction(cc.sequence(cc.delayTime(0.01), cc.callFunc(function () {
        //    self.checkUpdate();
        //})));
    },
    onExit : function () {
        cc.log("com down loader onExit");
        //KKVS.Event.deregister("onLoaderLoad", this);
        this.m_pConfig = null;
        try {
            if(this._am){
                this._am.release();
            }
            this.unscheduleUpdate();
        } catch(e) {
        }
        KKVS.Event.fire("ComSys_DownLoader_Close");
        this._super();
    },
    //httpDownload : function () {
    //    var self = this;
    //    var url = "/component/GameOx.zip"; + "?" + new Date().getTime().toString();
    //    var xhr = cc.loader.getXMLHttpRequest();
    //    var errInfo = "load " + url + " failed!";
    //    xhr.open("GET", url, true);
    //    if (/msie/i.test(navigator.userAgent) && !/opera/i.test(navigator.userAgent)) {
    //        // IE-specific logic here
    //        xhr.setRequestHeader("Accept-Charset", "utf-8");
    //        xhr.onreadystatechange = function () {
    //            if(xhr.readyState === 4) {
    //                xhr.status === 200 ? self.httpDownloadCb(null, xhr.responseText) : self.httpDownloadCb({status:xhr.status, errorMessage:errInfo}, null);
    //            } else {
    //                self.httpDownloadCb({status:xhr.status, errorMessage:errInfo}, null);
    //            }
    //        };
    //    } else {
    //        if (xhr.overrideMimeType) xhr.overrideMimeType("text\/plain; charset=utf-8");
    //        xhr.onload = function () {
    //            if(xhr.readyState === 4)
    //                xhr.status === 200 ? self.httpDownloadCb(null, xhr.responseText) : self.httpDownloadCb({status:xhr.status, errorMessage:errInfo}, null);
    //        };
    //        xhr.onerror = function(){
    //            self.httpDownloadCb({status:xhr.status, errorMessage:errInfo}, null);
    //        };
    //    }
    //    xhr.send(null);
    //},
    //httpDownloadCb : function (msg, data) {
    //    if (!data) {
    //        cc.log("->下载失败");
    //        logObj(msg);
    //        ++this.m_nFailCount
    //        cc.log("UPDATE_FAILED:" + this.m_nFailCount);
    //        if (this.m_nFailCount > 5) {
    //            this.m_nFailCount = 0;
    //            this.showDialog("文件下载失败,请稍后重试!");
    //        } else {
    //            this.httpDownload();
    //        }
    //    } else {
    //        cc.log("->下载成功");
    //        cc.log("->data:");
    //        logObj(data);
    //        cc.log("->开始解压");
    //        var self = this;
    //        var unzipCb = function (err, zdata) {
    //            if (zdata) {
    //                cc.log("->解压成功");
    //                self.onCloseDialog();
    //                KKVS.Event.fire("onDownloadComponent", this.m_pConfig);
    //            } else {
    //                cc.log("->解压失败");
    //                self.showDialog("文件解压失败!");
    //            }
    //        };
    //        this.unzipBlob("/component/GameOx.zip", unzipCb);
    //    }
    //},
    //unzipBlob : function (blob, callback) {
    //    if (!cc.sys.isNative) {
    //        zip.createReader(new zip.BlobReader(blob), function(zipReader) {
    //            zipReader.getEntries(function(entries) {
    //                entries[0].getData(new zip.BlobWriter(zip.getMimeType(entries[0].filename)), function(data) {
    //                    zipReader.close();
    //                    callback(null, data);
    //                });
    //            });
    //        }, function (message) {
    //            callback(message, null);
    //        });
    //    }
    //},
    //onLoaderLoad : function (config) {
    //    KKVS.Event.fire("onDownloadComponent", config);
    //},
    checkUpdate : function () {
        this.m_state = 1;
        if (this.m_bDebugHotupdate) {
            this.scheduleUpdate();
        } else if (!cc.sys.isNative) {
            //this.httpDownload();
            var self = this;
            var manifest = null;
            var _v = typeof (this.m_pConfig.version) == 'string' ? this.m_pConfig.version : (new Date() - 0);
            var manifestPath = this.m_pPathRoot + this.m_pConfig.manifest + "?_v=" + _v;
            cc.log("->mainfestPath=" + manifestPath);
            try {
                manifest = JSON.parse(cc.loader._loadTxtSync(manifestPath));
            } catch(e) {
                //not exist manifest file
            }
            if (!manifest || typeof (manifest.assets) != 'object') {
                this.showDialog("文件下载失败,请稍后重试!");
                return;
            }
            var endsWith = function (str, regtxt) { //some browser not support like string.endsWith(regtxt)
                var reg = new RegExp(regtxt + "$");
                return reg.test(str);
            };
            var res_download = []; //not include ('.js','.jsc','.zip','.rar') files
            for (var k in manifest.assets) {
                if (endsWith(k, ".js") == false && endsWith(k, ".jsc") == false && endsWith(k, ".zip") == false && endsWith(k, ".rar") == false) {
                    res_download.push(this.m_pPathRoot + k + "?_v=" + manifest.assets[k]["md5"]);
                }
            }
            cc.loader.load(res_download,
                function (result, count, loadedCount) {
                    var percent = (loadedCount / count * 100) | 0;
                    self._percent = Math.min(percent, 100);
                    self.updateProgress(0);
                }, function () {
                    //KKVS.Event.fire("onLoaderLoad", self.m_pConfig);
                    //self.onCloseDialog();
                    KKVS.Event.fire("onDownloadComponent", self.m_pConfig, self.m_pUserData);
                    self.onCloseDialog();
                }
            );
        } else {
            var storagePath = (jsb.fileUtils ? jsb.fileUtils.getWritablePath() : "./");
            storagePath += this.m_pPathRoot;
            var manifestFile = this.m_pPathManifest;
            if (jsb.fileUtils && jsb.fileUtils.isFileExist(this.m_pPathRoot + "comproject.manifest")) {
                manifestFile = this.m_pPathRoot + "comproject.manifest";
            }
            cc.log("->storegePath : " + storagePath );
            cc.log("->manifestFile : " + manifestFile);
            this._am = new jsb.AssetsManager(manifestFile, storagePath);
            this._am.retain();
            this.startUpdate();
        }
    },
    updateProgress:function(dt) {
        if (this._percent >= 100) {
            return;
        }
        if (this.m_bDebugHotupdate) {
            this._percent += Math.random(1.5);
        }
        if (this._percent <= 0) {
            return;
        }
        if (this._percent >= 100) {
            this._percent = 100.0000;
        }
        //var str = "资源文件下载..." + this._percent.toFixed(1).toString() + "\%";
        //this.m_pProgressBarTxt.setString(str);
        //this.m_pProgressBar.setPercent(this._percent);
        this.progressbartext.setString(this._percent.toFixed(1).toString());
        this.m_progresstimer.setPercentage(this._percent);
        if (this.m_bDebugHotupdate && this._percent >= 100) {
            this.unscheduleUpdate();
            //this.onCloseDialog();
            KKVS.Event.fire("onDownloadComponent", this.m_pConfig, this.m_pUserData);
            this.onCloseDialog();
        }
    },
    update: function (dt) {
        this.updateProgress(dt);
    },
    startUpdate: function () {
        if (!this._am.getLocalManifest().isLoaded()) {
            //not exist manifestFile
            //shut down dialog and tip
            this.showDialog("版本检测失败,请检查网络连接后重试!");
        } else {
            this.scheduleUpdate();
            var that = this;
            var listener = new jsb.EventListenerAssetsManager(this._am, function(event) {
                switch (event.getEventCode()) {
                    case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                    case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
                    case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                        that.showDialog("版本检测失败,请检查网络连接后重试!");
                        break;
                    case jsb.EventAssetsManager.NEW_VERSION_FOUND:
                        cc.log("------------发现新版本,开始更新----------");
                        break;
                    case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                        cc.log("-------------没有更新,已是最新版本-----------------");
                        //that.onCloseDialog();
                        KKVS.Event.fire("onDownloadComponent", that.m_pConfig, that.m_pUserData);
                        that.onCloseDialog();
                        break;
                    case jsb.EventAssetsManager.UPDATE_PROGRESSION:
                        that._percent = event.getPercentByFile();
                        //that._percentTask = event.getPercent();
                        //cc.log("_percent "+ that._percent + "%");
                        break;
                    case jsb.EventAssetsManager.ASSET_UPDATED:
                        //cc.log("ASSET_UPDATED:" + event.getMessage() + ", AssetId:" + event.getAssetId());
                        break;
                    case jsb.EventAssetsManager.ERROR_UPDATING:
                        //cc.log("ERROR_UPDATING:" + event.getMessage() + ", AssetId:" + event.getAssetId());
                        break;
                    case jsb.EventAssetsManager.UPDATE_FAILED:
                        ++that.m_nFailCount;
                        cc.log("UPDATE_FAILED:" + that.m_nFailCount);
                        if (that.m_nFailCount > 5) {
                            that.m_nFailCount = 0;
                            that.showDialog("文件下载失败,请稍后重试!");
                        } else {
                            that._am.downloadFailedAssets();
                        }
                        break;
                    case jsb.EventAssetsManager.UPDATE_FINISHED:
                        cc.log("-------------有更新，更新完成 ！-----------------");
                        //that.onCloseDialog();
                        KKVS.Event.fire("onDownloadComponent", that.m_pConfig, that.m_pUserData);
                        that.onCloseDialog();
                        break;
                    case jsb.EventAssetsManager.ERROR_DECOMPRESS:
                        //that.showDialog("文件解压失败,请稍后重试!");
                        cc.log("---------------文件解压失败---------------");
                        break;
                    default:
                        break;
                }
            });
            cc.eventManager.addListener(listener, 1);
            this._am.update();
        }
    },
    onCloseDialog: function () {
        this.m_state = 2;
        this.removeFromParent();
        KKVS.Event.fire("onDownloadState");
        KKVS.Event.fire("ComSys_GameDownloadOnly", false);
    },
    showDialog: function (str) {
        var dialog = new modulelobby.TxtDialog({txt : str, cb : this.onCloseDialog, target : this});
        dialog.show();
    }
});