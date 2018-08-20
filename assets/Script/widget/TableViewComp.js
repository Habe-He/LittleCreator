
cc.Class({
    extends: cc.Component,

    properties: {
        listview : {
            default : null,
            type : cc.ScrollView
        },
        itemtemplate : {
            default : null,
            type : cc.Node
        },
        spacing : 10
    },
    ctor : function () {
        this._centerPosInView = 0;
        this._bufferPosT = 0;
        this._bufferPosB = 0;
        this._lastContentPos = 0;
        //回调原型 _updateItem(itemNode, itemInd)
        this._updateItem = null;
        this._updateItemTarget = null;
        this._items = [];
        this._totalCount = 0;
        this._loadEnabled = false;
    },
    onLoad : function () {
        cc.log("TVC onLoad");
        if (!this.listview || !this.itemtemplate) {
            cc.log("=>this.listview or this.itemtemplate is null");
            return;
        }
        var listHeight = this.listview.node.height;
        this._centerPosInView = listHeight * (0.5 - this.listview.node.anchorY);
        this._bufferPosT = this._centerPosInView + listHeight * 0.5 + this.itemtemplate.height * 0.5 + this.spacing;
        this._bufferPosB = this._centerPosInView - listHeight * 0.5 - this.itemtemplate.height * 0.5 - this.spacing;
        this.listview.content.setAnchorPoint(0.5, 1);
        this.listview.content.height = 0;
        this.listview.content.setPosition(0, this._centerPosInView + this.listview.node.height * 0.5);
        this._lastContentPos = this.listview.content.y;
    },
    getPositionInView : function (item) {
        var worldPos = item.parent.convertToWorldSpaceAR(item.position);
        var viewPos = this.listview.node.convertToNodeSpaceAR(worldPos);
        return viewPos;
    },
    update : function (dt) {
        if (!this._loadEnabled) {
            return;
        }
        var items = this._items;
        var itemsLen = items.length;
        var tPos = items[0]['_TVC_ITEM_ID_'];
        var bPos = items[itemsLen - 1]['_TVC_ITEM_ID_'];
        var itemHeight = this.itemtemplate.height;
        var viewcontent = this.listview.content;
        var moveD = viewcontent.y - this._lastContentPos;
        var needN = 0;
        var tempItems = [];
        var itemId = 0;
        if (moveD < 0 && 0 < tPos) { //down
            for (var t = itemsLen - 1; 0 <= t; --t) {
                if (this._bufferPosB < this.getPositionInView(items[t]).y) {
                    break;
                }
                ++needN;
            }
            if (0 < needN) {
                for (var t = 0; t < needN; ++t) {
                    itemId = tPos - 1 - t;
                    items[itemsLen - 1 - t]['_TVC_ITEM_ID_'] = itemId;
                    items[itemsLen - 1 - t].setPosition(0, -itemHeight * (0.5 + itemId) - this.spacing * (1 + itemId));
                    if (typeof this._updateItem == 'function') {
                        this._updateItem.call(this._updateItemTarget, items[itemsLen - 1 - t], itemId);
                    }
                    tempItems.push(items[itemsLen - 1 - t]);
                }
                for (var t = itemsLen - needN - 1; 0 <= t; --t) {
                    items[t + needN] = items[t];
                }
                for (var t = needN - 1, ti = 0; 0 <= t; --t) {
                    items[ti++] = tempItems[t];
                }
            }
        } else if (0 < moveD && bPos < this._totalCount - 1) { //up
            for (var t = 0; t < itemsLen; ++t) {
                if (this.getPositionInView(items[t]).y < this._bufferPosT) {
                    break;
                }
                ++needN;
            }
            if (0 <  needN) {
                for (var t = 0; t < needN; ++t) {
                    itemId = bPos + 1 + t;
                    items[t]['_TVC_ITEM_ID_'] = itemId;
                    items[t].setPosition(0, -itemHeight * (0.5 + itemId) - this.spacing * (1 + itemId));
                    if (typeof this._updateItem == 'function') {
                        this._updateItem.call(this._updateItemTarget, items[t], itemId);
                    }
                    tempItems.push(items[t]);
                }
                for (var t = needN; t < itemsLen; ++t) {
                    items[t - needN] = items[t];
                }
                for (var t = 0, ti = itemsLen - needN; t < needN; ++t) {
                    items[ti++] = tempItems[t];
                }
            }
        }
        this._lastContentPos = viewcontent.y;
    },
    //
    getItem : function (ind) {
        var node = null;
        var items = this._items;
        for (var i = 0, l = items.length; i < l; ++i) {
            if (items[i]['_TVC_ITEM_ID_'] == ind) {
                node = items[i];
                break;
            }
        }
        return node;
    },
    setUpdateItemCB : function (cb, target) {
        if (typeof cb == 'function') {
            this._updateItem = cb;
            this._updateItemTarget = target;
        }
    },
    setItemsCount : function (cnt) {
        if (typeof cnt != 'number') {
            return;
        }
        this._loadEnabled = false;
        this._totalCount = cnt < 0 ? 0 : cnt;
    },
    loadData : function () {
        this._loadEnabled = false;
        this._items = [];
        var viewcontent = this.listview.content;
        viewcontent.removeAllChildren();
        if (this._totalCount == 0) {
            viewcontent.height = 0;
            return;
        }
        var itemHeight = this.itemtemplate.height;
        var totalCountInView = Math.ceil(this.listview.node.height / itemHeight);
        var needcnt = totalCountInView + 2;
        if (this._totalCount < needcnt) {
            needcnt = this._totalCount;
        }
        for (var i = 0; i < needcnt; ++i) {
            var item = cc.instantiate(this.itemtemplate);
            item['_TVC_ITEM_ID_'] = i;
            item.setAnchorPoint(0.5, 0.5);
            viewcontent.addChild(item);
            item.setPosition(0, -itemHeight * (0.5 + i) - this.spacing * (1 + i));
            if (typeof this._updateItem == 'function') {
                this._updateItem.call(this._updateItemTarget, item, i);
            }
            this._items.push(item);
        }
        viewcontent.height = this._totalCount * (itemHeight + this.spacing) + this.spacing;
        viewcontent.y = this._centerPosInView + this.listview.node.height * 0.5;
        this._lastContentPos = viewcontent.y;
        if (needcnt < this._totalCount) {
            this._loadEnabled = true;
        }
    }
});