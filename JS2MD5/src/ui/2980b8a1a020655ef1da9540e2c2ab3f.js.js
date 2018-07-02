/**
 * Created by hades on 2017/6/20.
 */
modulelobby.NoticeDialog = modulelobby.DialogView.extend({
    ctor : function () {
        this._super();

        var json = ccs.load("res/noticedialog_ui.json");
        var visibleSize = cc.director.getVisibleSize();
        var origin = cc.director.getVisibleOrigin();
        json.node.x = origin.x + visibleSize.width / 2 - json.node.getContentSize().width / 2;
        json.node.y = origin.y + visibleSize.height / 2 - json.node.getContentSize().height / 2;
        this.addChild(json.node);
        var rootNode = json.node;
        var self = this;
        this._layer = rootNode.getChildByName("back");
        var body = rootNode.getChildByName("body");
        this._body = body;
        this._title_txt = body.getChildByName("title_txt");
        this._title_txt.ignoreContentAdaptWithSize(true);
        this._noticeview = body.getChildByName("noticeview");
        this._content = this._noticeview.getChildByName("content");
        var close_btn = body.getChildByName("close_btn");
        close_btn.addClickEventListener(function() {
            close_btn.setTouchEnabled(false);
            playEffect();
            self.close();
        });

        this.m_pColorDefault = cc.color(255, 255, 255); //默认颜色
        this.m_pColorConfig = {};   //颜色配置,可以外部添加
        this.m_pColorConfig.red = cc.color(255, 0, 0);
        this.m_pColorConfig.green = cc.color(0, 255, 0);
        this.m_pColorConfig.blue = cc.color(0, 0, 255);
        this.m_pColorConfig.white = cc.color(255, 255, 255);
        this.m_pColorConfig.black = cc.color(0, 0, 0);
        this.m_pColorConfig.yellow = cc.color(255, 255, 0);
        this.m_pColorConfig.grey = cc.color(128, 128, 128); //灰
        this.m_pColorConfig.purple = cc.color(128, 0, 128); //紫
        this.m_pColorConfig.pink = cc.color(255, 192, 203); //粉红
        this.m_pColorConfig.brown = cc.color(165, 42, 42); //棕
        this.m_pColorConfig.orange = cc.color(255, 165, 0);

        return true;
    },
    on_lobby_msg : function (cmd, params) {
        if (cmd == LOBBY_MSG_NOTICE) {
            var data = params[0];
            var _title = data.title || "";
            var _txt = data.content || "";
            var _type = data.type;
            this._title_txt.setString(_title);
            this.addContent(_txt);
        }
    },
    getBody : function () {
        return this._body;
    },
    getLayer : function () {
        return this._layer;
    },
    onEnter : function () {
        this._super();
        KKVS.Event.register("on_lobby_msg", this, "on_lobby_msg");
        if (KBEngine.app.player() != undefined) {
            var params = {};
            var datas = JSON.stringify(params);
            KBEngine.app.player().req_lobby_msg(LOBBY_MSG_NOTICE, datas);
        }
    },
    onExit : function () {
        KKVS.Event.deregister("on_lobby_msg", this);
        this._super();
    },
    addContent : function (data) {
        var c_size = this._noticeview.getInnerContainerSize(); //this._content.getContentSize();
        var richText = new ccui.RichText();
        richText.ignoreContentAdaptWithSize(false);
        richText.setContentSize(c_size.width, 0);
        richText.setAnchorPoint(cc.p(0.5, 0.5)); //请把这个值强制设置为(0.5, 0.5)
        //parse text
        var txt_arr = this.parseText(data.toString());
        var txt_arr_len = txt_arr.length;
        for (var i = 0; i < txt_arr_len; ++i) {
            var txt_obj = txt_arr[i];
            //每个数据格式 {text:"***", color:"red"}
            var r_text_color = this.getColor(txt_obj.color);
            var r_text = new ccui.RichElementText(1, r_text_color, 255, txt_obj.text, "res/fonts/tengxiangyuan.ttf", 45);
            richText.pushBackElement(r_text);
        }
        richText.formatText(); //修改引擎RichText::formatRenderers()
        this._content.removeFromParent();
        var rt_size = richText.getContentSize();
        if (c_size.height < rt_size.height) {
            richText.setPosition(rt_size.width * 0.5, rt_size.height * 0.5);
            this._noticeview.setInnerContainerSize(rt_size);
        } else {
            richText.setPosition(rt_size.width * 0.5, c_size.height - rt_size.height * 0.5);
        }
        this._noticeview.getInnerContainer().addChild(richText);
    },
    getColor : function (key) {
        var color = this.m_pColorConfig[key];
        if (!color) {
            return this.m_pColorDefault;
        }
        return color;
    },
    parseText : function (text) {
        var txt_arr = [];
        var txt_val_temp = text;
        var txt_obj;
        var txt_str = "";
        while(0 < txt_val_temp.length) {
            var ret = txt_val_temp.match(/<[a-z]+>/); //开头
            if(ret) {
                //KKVS.INFO_MSG(ret[0]);
                //KKVS.INFO_MSG(ret["index"]);
                //KKVS.INFO_MSG(ret["input"]);
                var match_str_start = ret[0];
                var match_ind_start = ret["index"];
                //cc.log("->匹配头:" + match_str_start + " match_ind_start=" + match_ind_start);
                if (0 < match_ind_start) {
                    txt_str += txt_val_temp.slice(0, match_ind_start);
                }
                txt_val_temp = txt_val_temp.slice((match_ind_start + match_str_start.length));
                if (txt_val_temp.length == 0) {
                    txt_str += match_str_start;
                    break;
                }
                var match_str_key = match_str_start.slice(1, (match_str_start.length - 1));
                var match_str_end = "</" + match_str_key + ">";
                var end_ret = txt_val_temp.match(match_str_end);
                if (end_ret) {
                    //cc.log("->匹配尾:" + match_str_end);
                    if(0 < txt_str.length) {
                        txt_obj = {text : txt_str};
                        txt_arr.push(txt_obj);
                    }
                    var match_ind_end = end_ret["index"];
                    if(0 < match_ind_end) {
                        txt_str = txt_val_temp.slice(0, match_ind_end);
                        txt_obj = {text : txt_str, color : match_str_key};
                        txt_arr.push(txt_obj);
                    }
                    txt_str = "";
                    txt_val_temp = txt_val_temp.slice((match_ind_end + match_str_end.length));
                } else {
                    txt_str += match_str_start + txt_val_temp;
                    break;
                }
            } else {
                txt_str += txt_val_temp;
                break;
            }
        }
        if(0 < txt_str.length) {
            txt_obj = {text : txt_str};
            txt_arr.push(txt_obj);
        }

        return txt_arr;
    }
});