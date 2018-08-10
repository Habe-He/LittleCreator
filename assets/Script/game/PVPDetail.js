var KKVS = require('./../plugin/KKVS');
var Tool = require('./../tool/Tool');
var PVPDetail = PVPDetail || {};
PVPDetail.Show = function () {

    var self = this;

    cc.loader.loadRes("perfabs/PVPDetail", cc.Prefab, function (error, prefab) {

        if (error) {
            cc.error(error);
            return;
        }
        // 实例 
        self._pvpDetail = cc.instantiate(prefab);
        self._pvpDetail.parent = cc.find('Canvas');
        var bg = self._pvpDetail.getChildByName("bg");
        var closeBtn = bg.getChildByName("close");
        var detailDesc = bg.getChildByName("desc").getComponent(cc.Label);
        closeBtn.on('click', self.closeClick, self);
        var beginStr = Tool.getByTimeDetail(KKVS.levelMsg.start);
        var endStr = Tool.getByTimeDetail(KKVS.levelMsg.end);
        cc.log("beginStr = " + beginStr);
        cc.log("endStr = " + endStr);

        var desc = bg.getChildByName('desc').getComponent(cc.Label);
        desc.string = "当前赛季开启时间：" + beginStr  + "本赛季结束时间：" + endStr + ",奖励按照赛季段位于次日发放";



    });
    self.closeClick = function (event) {
        self._pvpDetail.destroy();
    };
};

module.exports = PVPDetail;

