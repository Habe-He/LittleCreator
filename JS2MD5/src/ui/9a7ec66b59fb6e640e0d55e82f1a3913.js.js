modulelobby.UserCenterRealName = cc.Node.extend({
    ctor: function () {
        this._super();
        var self = this;
        var json = ccs.load("res/usercenter_real_name.json");
        this.addChild(json.node);
        var body = json.node.getChildByName("body");
        this.rightbar_1 = body.getChildByName("rightbar_1");
        var name_input = this.rightbar_1.getChildByName("name_bg").getChildByName("input");
        var id_input = this.rightbar_1.getChildByName("id_bg").getChildByName("input");
        var real = this.rightbar_1.getChildByName("real");
        //成功后显示text
        this.rightbar_2 = body.getChildByName("rightbar_2");
        this.text_3 = this.rightbar_2.getChildByName("text_3");//姓名
        this.text_3.ignoreContentAdaptWithSize(true);
        this.text_4 = this.rightbar_2.getChildByName("text_4");//身份证
        this.text_4.ignoreContentAdaptWithSize(true);
        this.name_input = new InputExView(name_input, true);
        this.name_input.setFontColor(cc.color(147, 100, 46), cc.color(147, 100, 46));
        this.name_input.setEditBox(0, 1, 1);
        this.id_input = new InputExView(id_input, true);
        this.id_input.setFontColor(cc.color(147, 100, 46), cc.color(147, 100, 46));
        this.id_input.setEditBox(0, 1, 1);
        real.addClickEventListener(function(sender) {
            sender.setTouchEnabled(false);
            sender.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function() {
                sender.setTouchEnabled(true);
            })));
            playEffect();
            self.onGetCode();
        });
        if (KKVS.RealName.Success) {
            this.rightbar_1.setVisible(false);
            this.rightbar_2.setVisible(true);
            this.text_3.setString(KKVS.RealName.name.toString());
            var str = KKVS.RealName.pass_portid.toString();
            str = str.substring(0, 6) + "********" + str.substring(14);
            this.text_4.setString(str);
        }else {
            this.rightbar_1.setVisible(true);
            this.rightbar_2.setVisible(false);
        }

        return true;
    },
    onGetCode : function () {
        //点击验证
        var self = this;
        var bool_estimate = this.estimate();
        if (bool_estimate == "success") {
            //请求服务器
            var params = {
                UserID : parseInt(KKVS.GUID),
                Compellation : this.name_input.getString(),
                PassPortID : this.id_input.getString()
            };
            HttpManager.GetMessage(real_name_validation, params, METHOD_POST, function (data) {
                var ret = null;
                try {
                    ret = JSON.parse(data);
                } catch (e) {
                    //
                }
                if (!ret) {
                    return;
                }
                if (typeof (ret['Success']) == 'boolean' && ret['Success'] == true) {
                    self.rightbar_1.setVisible(false);
                    self.rightbar_2.setVisible(true);
                    KKVS.RealName.Success = true;
                    KKVS.RealName.name = self.name_input.getString();
                    KKVS.RealName.pass_portid = self.id_input.getString();
                    self.text_3.setString(KKVS.RealName.name);
                    var str = KKVS.RealName.pass_portid;
                    str = str.substring(0, 6) + "********" + str.substring(14);
                    self.text_4.setString(str);
                    self.showErrMsg(ret['Msg'].toString());
                } else {
                    self.showErrMsg(ret['Msg'].toString());
                }
            });
        }else {
            this.showErrMsg(bool_estimate);
        }
    },
    estimate : function () {
        var name = this.name_input.getString();
        var id = this.id_input.getString();
        //姓名或身份证是否为空
        if (name == null || name == "") {
            return "姓名不能为空";
        }
        if (id == null || id == "") {
            return "身份证号不能为空";
        }
        //判断姓名是不是中文
        var temp_name = /[\u4e00-\u9fa5]/;
        var bool_name = temp_name.test(name);
        if (!bool_name) {
            return "姓名必须是中文";
        }
        var len_name = name.length;
        if (len_name < 2) {
            return "请输入姓名在二个汉字以上";
        }
        if (6 < len_name) {
            return "请输入姓名在六个汉字以下";
        }
        //var temp_name = /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/;
        //var bool_name = temp_name.test(name);
        //if (!bool_name) {
        //    return "姓名必须是中文，英文，数字";
        //}
        var len = id.length;
        var temp_id;
        if (len == 15) {
            temp_id = /[1-9]\d{14}/;
        }else if (len == 18) {
            temp_id = /[1-9]\d{17}|[1-9]\d{16}x|[1-9]\d{16}X/;
        }else {
            return "身份证长度不对";
        }
        var bool_id = temp_id.test(id);
        if (!bool_id) {
            return "身份证格式不对";
        }
        return "success";
    },
    showErrMsg : function (args) {
       (new modulelobby.TxtDialog({title : "系统提示", txt : args})).show();
    },
    onEnter : function () {
        this._super();
    },
    onExit: function() {
        this._super();
    }
});