// 播放 prefab 动画
var StringDef = require('./../tool/StringDef');

var AniMnger = AniMnger || {};

AniMnger.Show = function(name) {
    var self = this;
    var pbName = null;
    if (name == StringDef.CHUNTIAN) {
        pbName = "perfabs/chuntian";

    } else if (name == StringDef.FEIJI) {
        pbName = "perfabs/feiji";

    } else if (name == StringDef.HUOJIAN) {
        pbName = "perfabs/huojian";

    } else if (name == StringDef.LIANDUI) {
        pbName = "perfabs/liandui";

    } else if (name == StringDef.SHUNZI) {
        pbName = "perfabs/shunzi";

    } else if (name == StringDef.ZHADAN) {
        pbName = "perfabs/zhadang";
    }

    if (pbName == null) {
        cc.error("没有当前预制");
        return;
    }

    cc.loader.loadRes(pbName, cc.Prefab, function(err, prefab) {
        if (err) {
            cc.error("AniMnger " + err);
            return;
        };

        self._animate = cc.instantiate(prefab);
        self._animate.parent = cc.find('Canvas');

        var spine = self._animate.getComponent('sp.Skeleton');
        spine.setAnimation(0, 'animation', false);

        spine.setCompleteListener((trackEntry, loopCount) => {
            cc.log(pbName + "播放结束");
            self._animate.destroy();
        });
    });
};

module.exports = AniMnger;