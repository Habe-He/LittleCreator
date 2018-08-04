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
    });
    self.closeClick = function (event) {
        self._pvpDetail.destroy();
    };
};

module.exports = PVPDetail;

