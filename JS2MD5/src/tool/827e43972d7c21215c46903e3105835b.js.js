/**
 * Created by hades on 2016/11/14.
 * 对应事件名
 * mousedown 当鼠标在目标节点区域按下时触发一次
 * mouseenter 当鼠标移入目标节点区域时，不论是否按下
 * mousemove 当鼠标在目标节点在目标节点区域中移动时，不论是否按下
 * mouseleave 当鼠标移出目标节点区域时，不论是否按下
 * mouseup 当鼠标从按下状态松开时触发一次
 * mousewheel 当鼠标滚轮滚动时触发
 * 测试用例:
 * 添加事件侦听
 * MouseManager.on("mousemove", node, function(event) {
 *  event是cc.EventMouse结构
 *  event.stopPropagation(); 停止事件传递
 *  var node = event.getCurrentTarget(); 当前事件触发节点
 *  ...
 * }, target); 或
 * MouseManager.on("mousemove", node, function(event) {...});
 * 移除事件侦听
 * MouseManager.off("mousemove", node); 或 MouseManager.offNode(node);
 */
var MouseManager = {};
MouseManager.m_bPropagation = true; //传递事件标志(一个总控制)
MouseManager.m_pTypeCode = {
    "mousedown" : 1,        //000001
    "mouseenter" : 2,       //000010
    "mousemove" : 4,        //000100
    "mouseleave" : 8,       //001000
    "mouseup" : 16,         //010000
    "mousewheel" : 32       //100000
};
MouseManager.enablePropagation = function (propagation) {
    MouseManager.m_bPropagation = propagation;
};
MouseManager.mouseDown = function (event) {
    var node = event.getCurrentTarget();
    var event_node = MouseManager._getEventNode(node);
    if (!event_node) {
        return;
    }
    var pos = event.getLocation();
    //cc.log("->MouseManager::pressDown x = " + pos.x + ", y = " + pos.y);
    var propagation = MouseManager.m_bPropagation;
    var nsize = node.getBoundingBox();
    var npos = node.convertToWorldSpace(cc.p(0, 0));
    var nrect = cc.rect(npos.x, npos.y, nsize.width, nsize.height);
    if (node.isVisible() && cc.rectContainsPoint(nrect, pos)) {
        //on mouse down
        if (event_node["mousedown"] && typeof event_node["mousedown"].cb == 'function') {
            if (event_node["mousedown"].target) {
                event_node["mousedown"].cb.call(event_node["mousedown"].target, event);
            } else {
                (event_node["mousedown"].cb)(event);
            }
        }
        event_node.downtag = 1;
        //stop propagation
        if (!propagation) {
            event.stopPropagation();
        }
    }
};
MouseManager.mouseUp = function (event) {
    var node = event.getCurrentTarget();
    var event_node = MouseManager._getEventNode(node);
    if (!event_node) {
        return;
    }
    var pos = event.getLocation();
    //cc.log("->MouseManager::pressUp x = " + pos.x + ", y = " + pos.y);
    var nsize = node.getBoundingBox();
    var npos = node.convertToWorldSpace(cc.p(0, 0));
    var nrect = cc.rect(npos.x, npos.y, nsize.width, nsize.height);
    if (event_node.downtag == 1 && node.isVisible() && cc.rectContainsPoint(nrect, pos)) { //event_node.downtag == 1 &&
        //on mouse up
        if (event_node["mouseup"] && typeof event_node["mouseup"].cb == 'function') {
            if (event_node["mouseup"].target) {
                event_node["mouseup"].cb.call(event_node["mouseup"].target, event);
            } else {
                (event_node["mouseup"].cb)(event);
            }
        }
    }
    event_node.downtag = 0;
};
MouseManager.mouseMove = function (event) {
    var node = event.getCurrentTarget();
    var event_node = MouseManager._getEventNode(node);
    if (!event_node) {
        return;
    }
    var pos = event.getLocation();
    //cc.log("->MouseManager::mouseMove x = " + pos.x + ", y = " + pos.y);
    var propagation = MouseManager.m_bPropagation;
    var nsize = node.getBoundingBox();
    var npos = node.convertToWorldSpace(cc.p(0, 0));
    var nrect = cc.rect(npos.x, npos.y, nsize.width, nsize.height);
    if (node.isVisible() && cc.rectContainsPoint(nrect, pos)) {
        //on mouse enter
        if (!event_node.movetag || event_node.movetag == 0) {
            if (event_node["mouseenter"] && typeof event_node["mouseenter"].cb == 'function') {
                if (event_node["mouseenter"].target) {
                    event_node["mouseenter"].cb.call(event_node["mouseenter"].target, event);
                } else {
                    (event_node["mouseenter"].cb)(event);
                }
            }
        }
        event_node.movetag = 1;
        //on mouse move
        if (event_node["mousemove"] && typeof event_node["mousemove"].cb == 'function') {
            if (event_node["mousemove"].target) {
                event_node["mousemove"].cb.call(event_node["mousemove"].target, event);
            } else {
                (event_node["mousemove"].cb)(event);
            }
        }
        //stop propagation
        if (!propagation) {
            event.stopPropagation();
        }
    } else {
        if (event_node.movetag == 1) {
            if (event_node["mouseleave"] && typeof event_node["mouseleave"].cb == 'function') {
                if (event_node["mouseleave"].target) {
                    event_node["mouseleave"].cb.call(event_node["mouseleave"].target, event);
                } else {
                    (event_node["mouseleave"].cb)(event);
                }
            }
        }
        event_node.movetag = 0;
    }
};
MouseManager.mouseScroll = function (event) {
    var node = event.getCurrentTarget();
    var event_node = MouseManager._getEventNode(node);
    if (!event_node) {
        return;
    }
    var pos = event.getLocation();
    //cc.log("-> mouse scroll pos = " + pos.x + ", " + pos.y);
    var propagation = MouseManager.m_bPropagation;
    var nsize = node.getBoundingBox();
    var npos = node.convertToWorldSpace(cc.p(0, 0));
    var nrect = cc.rect(npos.x, npos.y, nsize.width, nsize.height);
    if (node.isVisible() && cc.rectContainsPoint(nrect, pos)) {
        //on mouse scroll
        if (event_node["mousewheel"] && typeof event_node["mousewheel"].cb == 'function') {
            if (event_node["mousewheel"].target) {
                event_node["mousewheel"].cb.call(event_node["mousewheel"].target, event);
            } else {
                (event_node["mousewheel"].cb)(event);
            }
        }
        //stop propagation
        if (!propagation) {
            event.stopPropagation();
        }
    }
};
MouseManager.isMouseType = function (event_type) {
    if (event_type == "mousedown" || event_type == "mouseenter" || event_type == "mousemove" || event_type == "mouseleave" || event_type == "mouseup" || event_type == "mousewheel") {
        return true;
    }
    return false;
};
MouseManager._getEventNode = function (node) {
    return node._a_event_node;
};
MouseManager._createEventNode = function (node) {
    event_node = {};
    event_node.node = node;
    event_node.typecode = 0;
    event_node.listener = cc.EventListener.create({
        event : cc.EventListener.MOUSE,
        onMouseDown : function(event){
            MouseManager.mouseDown(event);
        },
        onMouseUp : function(event){
            MouseManager.mouseUp(event);
        },
        onMouseMove : function(event){
            MouseManager.mouseMove(event);
        },
        onMouseScroll : function (event) {
            MouseManager.mouseScroll(event);
        }
    });
    cc.eventManager.addListener(event_node.listener, node);
    node._a_event_node = event_node;
    return event_node;
};
MouseManager._deleteEventNode = function (node) {
    if (!node._a_event_node) {
        return;
    }
    if (node._a_event_node.listener) {
        cc.eventManager.removeListener(node._a_event_node.listener);
    }
    node._a_event_node = null;
};
MouseManager.on = function (type, node, cb, target) {
    if (!MouseManager.isMouseType(type) || !node || typeof cb != 'function') {
        return;
    }
    var event_node = MouseManager._getEventNode(node);
    if (!event_node) {
        event_node = MouseManager._createEventNode(node);
    }
    event_node[type] = {cb : cb, target : target};
    event_node.typecode |= MouseManager.m_pTypeCode[type];
};
MouseManager.off = function (type, node) {
    if (!MouseManager.isMouseType(type) || !node) {
        return;
    }
    var event_node = MouseManager._getEventNode(node);
    if (!event_node) {
        return;
    }
    var maskcode = ~MouseManager.m_pTypeCode[type];
    event_node.typecode &= maskcode;
    if (event_node.typecode == 0) {
        MouseManager._deleteEventNode(node);
    } else {
        event_node[type] = null;
    }
};
MouseManager.offNode = function (node) {
    if (!node) {
        return;
    }
    MouseManager._deleteEventNode(node);
};