var AppHelper = {};

AppHelper.get = function () {
    var comp = cc.find('AppNode').getComponent('AppComp');
    return comp;
};

module.exports = AppHelper;
