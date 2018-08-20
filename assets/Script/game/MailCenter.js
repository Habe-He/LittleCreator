var DialogViewComp = require('./../widget/DialogViewComp');
var Tool = require('./../tool/Tool');
var md5 = require("./../tool/md5");
var KKVS = require("./../plugin/KKVS");
var DialogView = require('./../widget/DialogView');
var MailDialog = require("./MailDialog");
var gameModel = require('./gameModel');
var gameEngine = require('./../plugin/gameEngine');

cc.Class({
    extends: DialogViewComp,

    properties: {
        // listview : {
        //     default : null,
        //     type : cc.ScrollView
        // },
        // spacing : 15
    },

    init : function (data) {
        this.prefab = "perfabs/MailCenter";
        this._body = null;
        this._modalLayer = null;
        this._listData = [];
        // this._items = [];
        // this._totalCount = 0;
        // this._centerPosInView = 0;
        // this._lastContentPos = 0;
        // this._loadEnabled = false;
        // this._bufferPosT = 0;
        // this._bufferPosB = 0;

        // this.addEvent();
    },
    onLoadRes : function (prefabNode) {
        this._modalLayer = cc.find("back", prefabNode);

        var delAllRead = cc.find("body/delButton", prefabNode);
        delAllRead.on("click", this.delMail, this);
        
        this._body = cc.find("body", prefabNode);
        this.itemTemplate = cc.find("bg/item", prefabNode);
        prefabNode.on("click", function () {
            this.node.close();
        }, this);
        this.listview = prefabNode.getComponent('TableViewComp');

        this.empty = cc.find('body/empty', prefabNode);
        this.empty.active = false;

        var closeBtn = cc.find('body/closeBtn', prefabNode);
        closeBtn.on('click', function () {
            this.node.close();
        }, this);
        // this.listview.content.anchorY = 1;
        // this.listview.content.height = 0;
        // this._centerPosInView = this.listview.node.height * (0.5 - this.listview.node.anchorY);
        this.addEvent();
        this.wait(0.1, function () {
            this.loadItemData();
        }.bind(this));
    },

    delMail: function(event) {
        var delArr = [];
        for (var i = 0; i < gameModel.mailList.length; ++i) {
            if (gameModel.mailList[i].status == 1) {
                delArr.push(gameModel.mailList[i].id);
            }
        }

        if (delArr.length != 0) {
            cc.log('删除邮件');
            
            
            // 更新界面
            for (var k = 0; k < delArr.length; ++k) {
                for (var t = 0; t < gameModel.mailList.length; ++t) {
                    if (delArr[k] == gameModel.mailList[t].id) {
                        gameModel.mailList.splice(t, 1);
                    }
                }
            }

            gameEngine.app.player().req_del_mail(delArr);
        }
        cc.log("删除后的邮件 = " + gameModel.mailList.length)
        if (gameModel.mailList.length == 0) {
            this.empty.active = true;
        }
    },

    getBody : function () {
        return this._body;
    },
    getModalLayer : function () {
        // return this._modalLayer;
    },
    wait : function (time, cb) {
        if (!this.node) {
            return;
        }
        this.node.stopAllActions();
        this.node.runAction(cc.sequence(cc.delayTime(time), cc.callFunc(cb)));
    },
    cancelWait : function () {
        if (!this.node) {
            return;
        }
        this.node.stopAllActions();
    },
    loadItemData : function () {
        this.loadItemDataSuccuss();
        return;
        var self = this;
        this.wait(7, function () {
            self.loadItemDataFailed();
        });
        var param = {
            userid : KKVS.GUID.toString()
        };
        param.sign = md5.hex_md5(param.userid + Tool.client_key);
        Tool.logObj(param)
        HttpUtils.getInstance().httpPost(Tool.http_url_prefix + "ScoreOperationRecord.aspx", param, function (respone) {
            cc.log(respone);
            if (respone == -1) {
                return;
            }
            var ret = null;
            try {
                ret = JSON.parse(respone);
            } catch(e) {
            }
            if (ret && ret.operationInfo) {
                self.loadItemDataSuccuss(ret.operationInfo);
            }
        });
    },
    loadItemDataFailed : function () {
        this.loadItemData();
    },
    loadItemDataSuccuss : function (data) {
        this.cancelWait();
        this._listData = [];
        cc.log('邮件长度 = ' + gameModel.mailList.length);
        if (gameModel.mailList.length == 0) {
            this.empty.active = true;
        }

        for (var i = 0; i < gameModel.mailList.length; ++i) {
            var from = gameModel.mailList[i].title;
            var body = gameModel.mailList[i].content;
            var status = gameModel.mailList[i].status;
            var create_time = gameModel.mailList[i].create_time;
            var type = gameModel.mailList[i].type;
            var id = gameModel.mailList[i].id;
            this._listData.push({'from': from, 'body' : body, 'read' : status, 'date' : create_time, 'type': type, 'id': id});
        }

        // for (var i = 0; i < 40; ++i) {
        //     this._listData.push({'from': '系统邮件' + i.toString(), 'body' : '这是一个测试邮件', 'read' : 0, 'date' : '2018/8/10 15:10:04'});
        // }
        // this._totalCount = this._listData.length;
        // this.loadItems();
        this.listview.setUpdateItemCB(this.updateItem, this);
        this.listview.setItemsCount(this._listData.length);
        this.listview.loadData();
    },
    // loadItems : function () { //结合update实现table view的功能
    //     if (this._totalCount == 0) {
    //         this._loadEnabled = false;
    //         return;
    //     }
    //     var needcnt = Math.ceil(this.listview.node.height / this.itemTemplate.height);
    //     var totalCountInView = needcnt;
    //     needcnt += 2;
    //     if (this._totalCount < needcnt) {
    //         needcnt = this._totalCount;
    //     }
    //     var viewcontent = this.listview.content;
    //     var itemHeight = this.itemTemplate.height;
    //     for (var i = 0; i < needcnt; ++i) {
    //         var item = cc.instantiate(this.itemTemplate);
    //         item.itemID = 0;
    //         item.setAnchorPoint(0.5, 0.5);
    //         viewcontent.addChild(item);
    //         item.setPosition(0, -itemHeight * (0.5 + i) - this.spacing * (1 + i));
    //         item.on("click", function(event){
    //             (new DialogView()).build(MailDialog, this._listData[event.target.itemID]).show();
    //         }, this);
    //         this.updateItem(item, i);
    //         this._items.push(item);
    //     }
    //     viewcontent.height = this._totalCount * (itemHeight + this.spacing) + this.spacing;
    //     //this._lastContentPos = viewcontent.y;
    //     if (needcnt == this._totalCount) {
    //         this._loadEnabled = false;
    //     } else {
    //         var bufCnt = Math.floor((needcnt - totalCountInView) / 2);
    //         this._bufferPosT = this._centerPosInView + this.listview.node.height * 0.5 + itemHeight * (bufCnt - 0.5) + this.spacing * bufCnt;
    //         this._bufferPosB = this._centerPosInView - this.listview.node.height * 0.5 - itemHeight * (bufCnt - 0.5) - this.spacing * bufCnt;
    //         this._loadEnabled = true;
    //     }
    // },
    updateItem : function (item, i) {
        if (!this._listData[i] || !item) {
            return;
        }
        item.itemID = i;
        item.getChildByName('text_1').getComponent(cc.Label).string = this._listData[i]['from'];
        item.getChildByName('text_2').getComponent(cc.Label).string = this._listData[i]['body'];
        item.getChildByName('text_3').getComponent(cc.Label).string = this._listData[i]['date'];
        if (this._listData[i]['read'] == 1) {
            item.getChildByName('png_3').active = true;
        } else {
            item.getChildByName('png_2').active = true;
        }
        if (!item.clickTag) {
            item.clickTag = true;
            item.on("click", function(event){
                (new DialogView()).build(MailDialog, this._listData[event.target.itemID]).show();
            }, this);
        }
    },
    // getPositionInView : function (item) {
    //     var worldPos = item.parent.convertToWorldSpaceAR(item.position);
    //     var viewPos = this.listview.node.convertToNodeSpaceAR(worldPos);
    //     return viewPos;
    // },
    // update : function (dt) {
    //     if (!this._loadEnabled) {
    //         return;
    //     }
    //     var items = this._items;
    //     var itemsLen = items.length;
    //     var tPos = items[0].itemID;
    //     var bPos = items[itemsLen - 1].itemID;
    //     var itemHeight = items[0].height;
    //     var viewcontent = this.listview.content;
    //     var moveD = viewcontent.y - this._lastContentPos;
    //     var needN = 0;
    //     var tempItems = [];
    //     var itemId = 0;
    //     if (moveD < 0 && 0 < tPos) { //down
    //         for (var t = itemsLen - 1; 0 <= t; --t) {
    //             if (this._bufferPosB < this.getPositionInView(items[t]).y) {
    //                 break;
    //             }
    //             ++needN;
    //         }
    //         if (0 < needN) {
    //             for (var t = 0; t < needN; ++t) {
    //                 itemId = tPos - 1 - t;
    //                 items[itemsLen - 1 - t].setPosition(0, -itemHeight * (0.5 + itemId) - this.spacing * (1 + itemId));
    //                 this.updateItem(items[itemsLen - 1 - t], itemId);
    //                 tempItems.push(items[itemsLen - 1 - t]);
    //             }
    //             for (var t = itemsLen - needN - 1; 0 <= t; --t) {
    //                 items[t + needN] = items[t];
    //             }
    //             for (var t = needN - 1, ti = 0; 0 <= t; --t) {
    //                 items[ti++] = tempItems[t];
    //             }
    //         }
    //     } else if (0 < moveD && bPos < this._totalCount - 1) { //up
    //         for (var t = 0; t < itemsLen; ++t) {
    //             if (this.getPositionInView(items[t]).y < this._bufferPosT) {
    //                 break;
    //             }
    //             ++needN;
    //         }
    //         if (0 <  needN) {
    //             for (var t = 0; t < needN; ++t) {
    //                 itemId = bPos + 1 + t;
    //                 items[t].setPosition(0, -itemHeight * (0.5 + itemId) - this.spacing * (1 + itemId));
    //                 this.updateItem(items[t], itemId);
    //                 tempItems.push(items[t]);
    //             }
    //             for (var t = needN; t < itemsLen; ++t) {
    //                 items[t - needN] = items[t];
    //             }
    //             for (var t = 0, ti = itemsLen - needN; t < needN; ++t) {
    //                 items[ti++] = tempItems[t];
    //             }
    //         }
    //     }
    //     this._lastContentPos = viewcontent.y;
    // },

    updateMail: function() {
        var _listData = [];
        cc.log('邮件长度 = ' + gameModel.mailList.length);
        if (gameModel.mailList.length == 0) {
            this.empty.active = true;
        }

        for (var i = 0; i < gameModel.mailList.length; ++i) {
            var from = gameModel.mailList[i].title;
            var body = gameModel.mailList[i].content;
            var status = gameModel.mailList[i].status;
            var create_time = gameModel.mailList[i].create_time;
            var type = gameModel.mailList[i].type;
            var id = gameModel.mailList[i].id;
            _listData.push({'from': from, 'body' : body, 'read' : status, 'date' : create_time, 'type': type, 'id': id});
        }
        this.listview.setItemsCount(_listData.length);
        this._listData = _listData;
        this.listview.loadData();
    },
    
    addEvent : function () {
        KKVS.Event.register("updateMail", this, "updateMail");
    },
    onDestroy : function () {
        KKVS.Event.deregister("updateMail", this);
    }
});
