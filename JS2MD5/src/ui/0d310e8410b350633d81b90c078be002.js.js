/**
 * 扩展输入框视图(win32下才有效果,其他平台采用cc.EditBox)
 * cc.EditBox在H5上有一个问题:它接收输入事件的优先级非常高,可以无视层级关系[这是cc.EditBox的一个bug]
 *
 * win32下
 * 旧方案:通过载体接收到插入文本,再将插入文本添加到要插入的位置并清除载体的内容(为下次接收作准备)
 * 问题:在pc上可以完美地工作,但在pc浏览器上输入中文时,错误地将相应中文(所需)的字母也当作插入文本
 *
 * 新方案:通过载体获取到当前文本,再将当前文本与扩展视图(InputExView)文本数据(_input_text)进行对比,若不相等则进行更新使它们始终保持一致(此过程当中涉及文本插入与删除操作)
 * 新方案在pc浏览器下完美解决中文输入问题
 * 问题:在pc浏览器上无法使用左右方向键和回车键,在pc上可以完美工作
 *
 * + 区分mobile与pc,本地与浏览器(2017/10/18)
 *
 * 得到显示的文本内容请使用InputExView.getString()
 * Created by hades on 2017/7/7.
 */
var InputExView = cc.Node.extend({
    /**
     * @param inputText ccui.TextField对象,作为win32下接收输入的载体
     * @param editBoxEnabled 指定是否采用cc.EditBox
     * @param inputTextParent 指定cc.EditBox的父节点(当inputText所在根节点是一个.json ui时,而你又把这个.json ui加载到当前场景,这时请把该.json ui根节点作为参数传递进来,否则ui显示错乱[这是cc.EditBox的一个bug])
     */
    ctor : function (inputText, editBoxEnabled, inputTextParent) {
        this._super();

        this._input = inputText;
        //文本数据 它时刻与this._input文本保持一致,与this.getString()不是同一个东西
        this._input_text = this._input.getString();
        this._input_size = this._input.getContentSize();
        this._input_w = this._input_size.width;
        this._input_h = this._input_size.height;
        this._fonts_size = this._input.getFontSize();
        this._fonts_name = this._input.getFontName();
        //this._fonts_size = fontsSize ? fontsSize : 20;
        //this._fonts_name = fontsName ? fontsName : "Arial";
        this._passwordEnabled = this._input.isPasswordEnabled(); //启用pwd
        this._passwordStyleText = this._passwordEnabled == true ? this._input.getPasswordStyleText() : '*';
        var maxLengthEnabled = this._input.isMaxLengthEnabled(); //启用最大字符数
        this._maxLength = maxLengthEnabled == true ? this._input.getMaxLength() : 0;
        this._editBoxEnabled = false;
        //cc.sys.isMobile cc.sys.isNative
        if(cc.sys.isMobile) { //other platform use cc.EditBox
            if (!cc.sys.isNative) {
                inputText.addChild(this);
                inputText.addEventListener(this.textFieldEventM, this);
                return;
            }
            if (!inputTextParent) {
                inputTextParent = inputText.getParent();
            }
            if (!editBoxEnabled || !inputTextParent) {
                inputText.addChild(this);
                return;
            }
            inputText.setVisible(false);
            var point = inputText.convertToWorldSpace(cc.p(0, 0));
            point = inputTextParent.convertToNodeSpace(point);
            this.setPosition(point);
            inputTextParent.addChild(this);
            this._input = new cc.EditBox(this._input_size, new cc.Scale9Sprite());
            this._input.setAnchorPoint(cc.p(0, 0));
            this._input.setPosition(0, 0);
            this._input.setPlaceholderFont(this._fonts_name, this._fonts_size);
            //browser下inputText.getPlaceHolderColor()出现bug
            //this._input.setPlaceholderFontColor(inputText.getPlaceHolderColor());
            this._input.setPlaceHolder(inputText.getPlaceHolder());
            this._input.setFont(this._fonts_name, this._fonts_size);
            this._input.setFontColor(cc.color(0, 0, 0));
            //设置字体,字体大小后没有效果,需在引擎中修改ccui.TextField.setString()实现
            this._input.setString(this._input_text);
            //启用密码后部分mobile browser无法输入(如华为浏览器)
            this._passwordEnabled ? this._input.setInputFlag(cc.EDITBOX_INPUT_FLAG_PASSWORD) : this._input.setInputFlag(cc.EDITBOX_INPUT_FLAG_SENSITIVE);
            if (maxLengthEnabled) {
                this._input.setMaxLength(this._maxLength);
            }
            //var delegate = {
            //    editBoxEditingDidBegin: function (editBox) {
            //    },
            //    editBoxEditingDidEnd: function (editBox) {
            //    },
            //    editBoxTextChanged: function (editBox, text) {
            //    },
            //    editBoxReturn: function (editBox) {
            //    }
            //};
            //this._input.setDelegate(delegate);
            this.addChild(this._input);
            this._editBoxEnabled = true;
            return;
        }
        inputText.setMaxLengthEnabled(false);           //使用_maxLength替换
        inputText.addChild(this);
        if (cc.sys.isNative) {
            this._input.setFontSize(1.0);
            this._input.setTextColor(cc.color(0, 0, 0, 0));
        } else {
            this._input.setFontSize(0.0);
        }
        this._textList = [];                            //输入文本
        this._shadowPos = 0;                            //当前光标插入位置[0,_textList.length]
        this._selectTextIndexList = [];                 //当前选中文本位置,有序数组
        this._select_color = cc.color(255, 255, 255);
        this._unselect_color = cc.color(0, 0, 0);
        //var input_color = this._input.getColor();
        this._activeIME = false;
        //this._isInInputArea = false;
        this._enableEnter = false;                      //启用回车
        this._enterCallback = null;                     //回车回调
        this._enterTarget = null;                       //回车目标
        //容器
        this._text_field = new ccui.Layout();
        this._text_field.setTouchEnabled(false);
        this._text_field.setClippingEnabled(true);
        //this._text_field.setBackGroundColorType(ccui.Layout.BG_COLOR_SOLID);
        //this._text_field.setBackGroundColor(cc.color(128, 128, 128));
        //this._text_field.setBackGroundColorOpacity(128);
        this._text_field.setContentSize(this._input_size);
        this._text_field.setAnchorPoint(0, 0);
        this._text_field.setPosition(0, 0);
        this.addChild(this._text_field);
        //文本节点
        this._text_node = new ccui.Layout();
        this._text_node.setTouchEnabled(false);
        this._text_node.setContentSize(this._input_size);
        this._text_node.setAnchorPoint(0, 0);
        this._text_node.setPosition(0, 0);
        this._text_field.addChild(this._text_node);
        //文本选择底框
        this._text_back = new ccui.Layout();
        this._text_back.setTouchEnabled(false);
        this._text_back.setContentSize(cc.size(0, 0));
        this._text_back.setAnchorPoint(0, 0.5);
        this._text_back.setPosition(0, this._input_h * 0.5);
        this._text_back.setBackGroundColorType(ccui.Layout.BG_COLOR_SOLID);
        this._text_back.setBackGroundColor(cc.color(0, 0, 255));
        this._text_back.setBackGroundColorOpacity(128);
        this._text_back.setVisible(false);
        this._text_node.addChild(this._text_back);
        //光标
        var drawNode = new cc.DrawNode();
        drawNode.drawSegment(cc.p(0, 0), cc.p(0, this._fonts_size), 1, this._unselect_color);
        drawNode.setAnchorPoint(0, 0);
        drawNode.setPosition(1, 0);
        this._text_shadow = new cc.Node();
        this._text_shadow.addChild(drawNode);
        this._text_shadow.drawNode = drawNode;
        this._text_shadow.setAnchorPoint(0, 0.5);
        this._text_shadow.setPosition(0, this._input_h * 0.5);
        this._text_shadow.setContentSize(cc.size(2, this._fonts_size));
        this._text_node.addChild(this._text_shadow, 1000);
        //var oneAction = cc.fadeOut(0.1);
        //var seccond = cc.fadeIn(0.1);
        var oneAction = cc.show();
        var seccond = cc.hide();
        var delayTime = cc.delayTime(0.5);
        var delayTime2 = cc.delayTime(0.5);
        var pseq = cc.sequence(oneAction,delayTime2,seccond,delayTime);
        drawNode.runAction(cc.repeatForever(pseq));
        this.hideCursor();

        var self = this;
        //鼠标事件
        self._touchListener = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: false,

            onTouchBegan: function(touch, event){
                var t_pos = touch.getLocation();
                if(self.hitTest(t_pos)) {
                    //self._isInInputArea = true;
                    var n_pos = self._text_node.convertToNodeSpace(t_pos);
                    var c_pos = self.findCursorPos(n_pos.x);   //[0,self._textList.length]
                    //self.showCursor(c_pos);
                    //self._beganPos = self._shadowPos;
                    self._beganPos = c_pos;
                    return true;
                }
                //self._isInInputArea = false;
                self._beganPos = 0;
                //self.hideCursor();
                return false;
            },

            onTouchMoved: function(touch, event) {
                var txt_len = self._textList.length;
                if(txt_len == 0) {
                    //self.showCursor(0);
                    return;
                }
                var t_pos = touch.getLocation();
                var n_pos = self._text_node.convertToNodeSpace(t_pos);
                //最大,最小点限制
                var n_x = self._text_node.getPositionX(); // <= 0
                var t_x = n_pos.x + n_x;
                if(t_x < 0) {
                    t_x = 0;
                }else if(self._input_w < t_x) {
                    t_x = self._input_w;
                }
                n_pos.x = Math.abs(n_x) + t_x;
                var c_pos = self.findCursorPos(n_pos.x);   //[0,self._textList.length]
                //清空,选中输入
                var low, high;
                if(self._beganPos < c_pos) {
                    low = self._beganPos;
                    high = c_pos;
                }else {
                    low = c_pos;
                    high = self._beganPos;
                }
                self.unselectText();
                if(0 <= low && low < txt_len) {
                    for(var i = low; i < high; ++i) {
                        self._selectTextIndexList.push(i);
                        self._textList[i].setColor(self._select_color);
                    }
                }
                var selectTextListLen = self._selectTextIndexList.length;
                if(0 < selectTextListLen) {
                    self.hideCursor();
                    var pos1 = self._textList[self._selectTextIndexList[0]].getPositionX();
                    var pos2 = self._textList[self._selectTextIndexList[selectTextListLen - 1]].getPositionX();
                    var size2 = self._textList[self._selectTextIndexList[selectTextListLen - 1]].getContentSize();
                    pos2 = pos2 + size2.width;
                    self._text_back.setContentSize(cc.size(pos2 - pos1, size2.height));
                    self._text_back.setPositionX(pos1);
                    self._text_back.setVisible(true);
                }else {
                    self.showCursor(self._beganPos);
                }
            },

            onTouchEnded: function(touch, event){
                self._beganPos = 0;
            }
        });
        cc.eventManager.addListener(self._touchListener, self._text_field);
        this._input.addEventListener(this.textFieldEvent, this); //pc浏览器下会吞食键盘事件
        //键盘事件 左右方向键 enter键
        self._keyboardListener = cc.EventListener.create({
            event: cc.EventListener.KEYBOARD,
            onKeyPressed:  function(keyCode, event) {
                if (!self._activeIME) {
                    return;
                }
                if (keyCode == 37) { // left key
                    self.moveCursor(-1);
                } else if (keyCode == 39) { // right key
                    self.moveCursor(1);
                }
            },
            onKeyReleased: function(keyCode, event) {
                if (!self._activeIME) {
                    return;
                }
                if (keyCode == 13) { //enter key
                    if(!self._enableEnter) {
                        return;
                    }
                    var str = self.flush();
                    if (self._enterCallback) {
                        if (!self._enterTarget) {
                            self._enterCallback(str);
                        } else {
                            self._enterCallback.call(self._enterTarget, str);
                        }
                    }
                }
            }
        });
        cc.eventManager.addListener(self._keyboardListener, self._input);
    },
    onEnter : function () {
        cc.Node.prototype.onEnter.call(this);
    },
    onExit : function () {
        cc.Node.prototype.onExit.call(this);
    },
    //
    //输入中文浏览器体现:输入中文过程中每个输入字符都会触发1次EVENT_INSERT_TEXT,确定所选中文字再1次触发EVENT_INSERT_TEXT并且会删除中文的输入字符,后触发1次EVENT_DELETE_BACKWARD
    //输入中文win32体现:输入中文过程中没有触发EVENT_INSERT_TEXT,确定所选中文后才会触发1次EVENT_INSERT_TEXT
    // 键盘事件吞食情况:
    // 平台           方向键         回车键             其它键
    // 浏览器         吞食           吞食按下,传递松开    吞食
    // win32         传递           传递               传递
    textFieldEvent: function(textField, type) {
        switch (type) {
            case ccui.TextField.EVENT_ATTACH_WITH_IME:
                this._activeIME = true;
                this.showCursor(this._beganPos);
                this._beganPos = this._shadowPos;
                break;
            case ccui.TextField.EVENT_DETACH_WITH_IME:
                this._activeIME = false;
                this.hideCursor();
                this.unselectText();
                break;
            case ccui.TextField.EVENT_INSERT_TEXT:
                var input_str = this._input.getString();
                var input_str_len = input_str.length; // must be > 0
                if (input_str_len == 0) {
                    return;
                }
                var input_text_len = this._input_text.length;
                if (input_text_len == 0) {
                    this.insertWords(input_str);
                    this._input_text = input_str; //保持一致
                    return;
                }
                //input_str_len > 0 && input_text_len > 0
                //从首开始查找不同字符,从尾开始查找不同字符,从而确定要插入的文本(以及要删除的文本:该情况仅限于中文输入)
                var len =  input_text_len < input_str_len ? input_text_len : input_str_len;
                var start_ind = 0;
                var end_ind = 0;
                for (; start_ind < len; ++start_ind) {
                    if (input_str[start_ind] != this._input_text[start_ind]) {
                        break;
                    }
                }
                for (; end_ind < len - start_ind; ++end_ind) {
                    if (input_str[input_str_len - end_ind - 1] != this._input_text[input_text_len - end_ind - 1]) {
                        break;
                    }
                }
                var delete_text = this._input_text.slice(start_ind, (input_text_len - end_ind));
                var inser_text = input_str.slice(start_ind, (input_str_len - end_ind));
                this.insertWords(inser_text, delete_text);
                if (inser_text != "") {
                    this._input_text = input_str; //保持一致
                }
                break;
            case ccui.TextField.EVENT_DELETE_BACKWARD:
                var back_str = this._input.getString();
                var back_str_len = back_str.length;
                var back_text_len = this._input_text.length;

                if (back_str_len != back_text_len) { // || (0 < back_str_len && 0 < back_text_len && back_str[back_str_len - 1] != this._input_text[back_text_len - 1])
                    this.deletWords();
                }
                if (back_str == "") {
                    back_str = this.getString();
                    this._input.setString(back_str);
                }
                this._input_text = back_str; //保持一致
                break;
            default:
                break;
        }
    },
    textFieldEventM : function (textField, type) {
        switch (type) {
            case ccui.TextField.EVENT_ATTACH_WITH_IME:
                var input_str = window.prompt("请输入:", this.getString());
                if (typeof input_str != 'undefined' && input_str != null) {
                    this.setString(input_str);
                }
                break;
            case ccui.TextField.EVENT_DETACH_WITH_IME:
                break;
            case ccui.TextField.EVENT_INSERT_TEXT:
                break;
            case ccui.TextField.EVENT_DELETE_BACKWARD:
                break;
            default:
                break;
        }
    },
    //
    //update: function (dt) {
    //    cc.log("->update");
    //    var str = this._input.getString();
    //    cc.log("->update text=" + str);
    //    //str = str.trim();
    //    if (str != "") {
    //        //清空input
    //        this._input.setString("");
    //        this.insertWords(str);
    //    }
    //},
    //
    //
    //
    //

    // sun
    // this._input.setInputFlag


    // cc.EDITBOX_INPUT_MODE_ANY  0
    // cc.EDITBOX_INPUT_MODE_URL  1
    // cc.EDITBOX_INPUT_MODE_DECIMAL 2
    // cc.EDITBOX_INPUT_MODE_NUMERIC 3
    // cc.EDITBOX_INPUT_MODE_EMAILADDR 4
    // cc.EDITBOX_INPUT_MODE_SINGLELINE 5
    // cc.EDITBOX_INPUT_MODE_PHONENUMBER 6
    

    // cc.EDITBOX_INPUT_FLAG_PASSWORD
    // cc.EDITBOX_INPUT_FLAG_SENSITIVE
    // cc.EDITBOX_INPUT_FLAG_INITIAL_CAPS_WORD
    // cc.EDITBOX_INPUT_FLAG_INITIAL_CAPS_SENTENCE
    // cc.EDITBOX_INPUT_FLAG_INITIAL_CAPS_ALL_CHARACTERS

    // cc.KEYBOARD_RETURNTYPE_GO
    // cc.KEYBOARD_RETURNTYPE_DONE
    // cc.KEYBOARD_RETURNTYPE_SEND
    // cc.KEYBOARD_RETURNTYPE_SEARCH
    // cc.KEYBOARD_RETURNTYPE_DEFAULT
    setEditBox : function(inputModetype, inputFlag, returnType){
         if(!cc.sys.isMobile || !this._editBoxEnabled) {
            return;
        }
        var newType = cc.EDITBOX_INPUT_MODE_ANY;
        switch (inputModetype) {
            case 0:
                newType = cc.EDITBOX_INPUT_MODE_ANY;
                break;
            case 1:
                newType = cc.EDITBOX_INPUT_MODE_URL;
                break;
            case 2:
                newType = cc.EDITBOX_INPUT_MODE_DECIMAL;
                break;
            case 3:
                newType = cc.EDITBOX_INPUT_MODE_NUMERIC;
                break;
            case 4:
                newType = cc.EDITBOX_INPUT_MODE_EMAILADDR;
                break;
            case 5:
                newType = cc.EDITBOX_INPUT_MODE_URL|cc.EDITBOX_INPUT_MODE_SINGLELINE;
                break;
            case 6:
                newType = cc.EDITBOX_INPUT_MODE_PHONENUMBER;
                break;
        }

        var newInputFlag = cc.EDITBOX_INPUT_FLAG_PASSWORD;
        switch (inputFlag) {
            case 0:
                newInputFlag = cc.EDITBOX_INPUT_FLAG_PASSWORD;
                break;
            case 1:
                newInputFlag = cc.EDITBOX_INPUT_FLAG_SENSITIVE;
                break;
            case 2:
                newInputFlag = cc.EDITBOX_INPUT_FLAG_INITIAL_CAPS_WORD;
                break;
            case 3:
                newInputFlag = cc.EDITBOX_INPUT_FLAG_INITIAL_CAPS_SENTENCE;
                break;
            case 4:
                newInputFlag = cc.EDITBOX_INPUT_FLAG_INITIAL_CAPS_ALL_CHARACTERS;
                break;
        }

        var newReturnFlag = cc.KEYBOARD_RETURNTYPE_GO;
        switch (returnType) {
            case 0:
                newReturnFlag = cc.KEYBOARD_RETURNTYPE_GO;
                break;
            case 1:
                newReturnFlag = cc.KEYBOARD_RETURNTYPE_DONE;
                break;
            case 2:
                newReturnFlag = cc.KEYBOARD_RETURNTYPE_SEND;
                break;
            case 3:
                newReturnFlag = cc.KEYBOARD_RETURNTYPE_SEARCH;
                break;
            case 4:
                newReturnFlag = cc.KEYBOARD_RETURNTYPE_DEFAULT;
                break;
        }
        this._input.setInputMode(newType);
        this._input.setInputFlag(newInputFlag);
        this._input.setReturnType(newReturnFlag);

    },
    insertWords : function(newStr, delStr) {
        if(!newStr || newStr == "") {
            return;
        }

        var self = this;
        //var strArr = str.split("");
        var len = newStr.length;
        if(0 < self._selectTextIndexList.length) {
            self.deletWords();
        }
        var t_len = self._textList.length;  //插入之前的总长度
        var f_pos = t_len < self._shadowPos ? t_len : self._shadowPos; //[0,self._textList.length]
        //var c_pos = f_pos;
        self.hideCursor();

        //insert words before
        if (!delStr || delStr == "") {
        } else if (0 < t_len) {
            for (var del_ind = delStr.length - 1; 0 <= del_ind; --del_ind) {
                var delLabel = self._textList[f_pos - 1];
                if (!delLabel || delLabel.val != delStr[del_ind]) {
                } else {
                    --f_pos;
                    self._textList.splice(f_pos, 1);
                    delLabel.removeFromParent();
                }
            }
            t_len = self._textList.length;
        }
        //一次性插入所有字符并更新(插入位置之后所有)字符位置
        var temp_pos;
        if(t_len == 0  || f_pos == 0) {
            f_pos = 0;
            temp_pos = 0;
        }else if(t_len <= f_pos) {
            f_pos = t_len;
            temp_pos = self._textList[t_len - 1].getPositionX() + self._textList[t_len - 1].getContentSize().width;
        }else {
            temp_pos = self._textList[f_pos - 1].getPositionX() + self._textList[f_pos - 1].getContentSize().width;
        }
        var c_pos = f_pos;
        if (0 < this._maxLength && this._maxLength < len + t_len) { //最大长度检测
            len = this._maxLength - t_len;
            len = len < 0 ? 0 : len;
        }
        for (var i = 0; i < len; ++i) {
            var label_key = self._passwordEnabled ? self._passwordStyleText : newStr[i];
            var label = new cc.LabelTTF(label_key, self._fonts_name, self._fonts_size);
            label.val = newStr[i];  //值
            label.setColor(self._unselect_color);
            label.setAnchorPoint(0,0);
            self._textList.splice(c_pos, 0, label);
            ++c_pos;
            self._text_node.addChild(label, 100);
        };
        var text_len = self._textList.length;
        for(var n = f_pos; n < text_len; ++n) {
            var t_t_s = self._textList[n].getContentSize();
            self._textList[n].setPosition(temp_pos, (self._input_h - t_t_s.height) * 0.5);
            temp_pos += t_t_s.width;
        }
        //显示光标
        self.showCursor(c_pos);
        //调整显示位置
        self.adjustTextPos();
    },
    deletWords : function () {
        var self = this;

        var t_len = self._textList.length;
        if(t_len == 0) {
            return;
        }

        var select_len = self._selectTextIndexList.length;
        var f_pos = 0;
        var temp_pos = 0;
        var del_tag = false;
        if(0 < select_len) {
            //删除多个字符
            f_pos = self._selectTextIndexList[0];
            //if(f_pos < t_len) {
            del_tag = true;
            temp_pos = self._textList[f_pos].getPositionX();
            for (var m = 0; m < select_len; ++m) {
                self._textList[self._selectTextIndexList[m]].removeFromParent(); //没做空值检测
            }
            self._textList.splice(f_pos, select_len);
            //}
            self._selectTextIndexList = [];
        }else if(0 < self._shadowPos) {
            //删除单个字符
            del_tag = true;
            f_pos = self._shadowPos - 1;
            f_pos = t_len - 1 < f_pos ? t_len - 1 : f_pos; // [0,self._textList.length-1]
            temp_pos = self._textList[f_pos].getPositionX();
            self._textList[f_pos].removeFromParent();
            self._textList.splice(f_pos, 1);
        }

        if(del_tag) {
            var text_len = self._textList.length;
            for(var n = f_pos; n < text_len; ++n) {
                var t_t_s = self._textList[n].getContentSize();
                self._textList[n].setPositionX(temp_pos);
                temp_pos += t_t_s.width;
            }
            //显示光标
            self.showCursor(f_pos);
            //调整显示位置
            self.adjustTextPos();
        }
    },
    _findCharPos : function (pos) {
        //二分查找法
        var arr = this._textList;
        var left = 0;
        var right = arr.length - 1;
        var mid;
        while (left <= right) {
            mid = Math.floor((left + right) * 0.5);
            var cx = arr[mid].x;
            if (cx <= pos && pos <= cx + arr[mid].getContentSize().width) {
                return mid;
            }else if(pos < cx) {
                right = mid - 1;
            }else if(cx < pos) {
                left = mid + 1;
            }
        }
        return -1;
    },
    findCursorPos : function (pos) { //考虑异步输入进程冲突
        var len = this._textList.length;
        if(len == 0) {
            return 0;
        }

        var char_pos = this._findCharPos(pos);
        if(char_pos == -1) {
            return len; //新的插入点
        }

        var node = this._textList[char_pos];
        if(node.getContentSize().width * 0.5 + node.x < pos) {
            ++char_pos;
        }

        return char_pos;
    },
    unselectText : function () {
        var slt_list = this._selectTextIndexList;
        var s = slt_list.length;
        if(0 < s) {
            this._selectTextIndexList = [];
            for(var n = 0; n < s; ++n) {
                this._textList[slt_list[n]].setColor(this._unselect_color);
            }
        }
        this._text_back.setContentSize(cc.size(0, 0));
        this._text_back.setPositionX(0);
        this._text_back.setVisible(false);
    },
    moveCursor : function (d) {
        this.showCursor(this._shadowPos + d);
        //调整显示位置
        this.adjustTextPos();
    },
    showCursor : function (pos) {
        var max = this._textList.length;
        if(!pos) {
            this._shadowPos = 0;
        }else {
            pos = pos < 0 ? 0 : pos;
            pos = max < pos ? max : pos;
            this._shadowPos = pos;
        }
        if(this._shadowPos == 0) {
            this._text_shadow.setPositionX(0);
        }else if(this._shadowPos == max) {
            this._text_shadow.setPositionX(this._textList[max - 1].x + this._textList[max - 1].getContentSize().width);
        }else {
            this._text_shadow.setPositionX(this._textList[this._shadowPos].x);
        }
        this.unselectText();
        this._text_shadow.setVisible(true);
        //InputTextManger.updateFocus(this);
    },
    hideCursor : function () {
        this._text_shadow.setVisible(false);
        this._shadowPos = 0;
        this._text_shadow.setPositionX(0);
    },
    hitTest : function (pt) {
        var nsp = this._text_field.convertToNodeSpace(pt);
        var bb = cc.rect(0, 0, this._input_w, this._input_h);
        return cc.rectContainsPoint(bb, nsp);
    },
    adjustTextPos : function () {
        //根据光标位置来调整文本显示
        var n_pos = this._text_shadow.getPositionX();
        //最大,最小点限制
        var n_x = this._text_node.getPositionX(); // <= 0
        var t_x = n_pos + n_x;
        if(t_x < 0) {
            this._text_node.setPositionX(-n_pos);
            //n_x = -n_pos;
        }else if(this._input_w < t_x) {
            this._text_node.setPositionX(n_x - t_x + this._input_w);
            //n_x = n_x - t_x + this._input_w;
        }

        //var t_len = this._textList.length;
        //if(t_len == 0) {
        //    this._text_node.setPositionX(0);
        //}else {
        //    var n_width = this._textList[t_len - 1].x + this._textList[t_len - 1].getContentSize().width;
        //    if(this._input_w < n_width) {
        //        this._text_node.setPositionX(this._input_w - n_width);
        //    }else {
        //        this._text_node.setPositionX(0);
        //    }
        //}
    },
    //external call
    updateView : function () {
        //if(cc.sys.isMobile) {
        //    return;
        //}
        //this._input_size = this._input.getContentSize();
        //this._input_w = this._input_size.width;
        //this._input_h = this._input_size.height;
        //this._fonts_size = this._input.getFontSize();
        //this._fonts_name = this._input.getFontName();
        //this._text_field.setContentSize(this._input_size);
        //this._text_node.setContentSize(this._input_size);
        //this._text_shadow.setContentSize(cc.size(2, this._fonts_size));
        //this._text_shadow.setPositionY(this._input_h * 0.5);
    },
    addListener : function (cb, target) {
        //if(!cc.sys.isMobile) {
        //    this._cb = cb;
        //    this._tg = target;
        //}
    },
    getString : function () {
        if(!cc.sys.isMobile) {
            var str = "";
            for (var i = 0, l = this._textList.length; i < l; ++i) {
                str += this._textList[i].val; //.getString();
            }
            return str;
        }else {
            return this._input.getString();
        }
    },
    setString : function (str, cursor) {
        if(!cc.sys.isMobile) {
            this.reset();
            if(typeof str == 'string') {
                //this._input.setString(str);
                this.insertWords(str);
            }
            if(!cursor) {
                this.hideCursor();
            }
        }
         //保持一致
        if( typeof str == 'string'){
            this._input.setString(str);
            this._input_text = str;
        }
        //if (this._editBoxEnabled) { //cc.EditBox的一个bug
        //    this._input.setFontName(this._fonts_name);
        //    //this._input.setFontSize(this._fonts_size);
        //}
    },
    flush : function () {
        var str = this.getString();
        this.reset();
        return str;
    },
    reset : function () {
        this._input_text = "";
        this._input.setString("");
        if(cc.sys.isMobile) {
            return;
        }
        for(var i = 0, l = this._textList.length; i < l; ++i) {
            this._textList[i].removeFromParent();
        }
        this._textList = [];
        this._shadowPos = 0;
        this._selectTextIndexList = [];

        this._text_field.stopAllActions();
        this.showCursor();
        this.adjustTextPos();
    },
    enableEnter : function (enable, cb, target) {
        this._enableEnter = enable;
        if (cc.sys.isMobile || !cb) {
            return;
        }
        this._enterCallback = cb;
        this._enterTarget = target;
    },
    setPlaceholderFontColor : function (color) {
        if (this._editBoxEnabled) {
            this._input.setPlaceholderFontColor(color);
        } else {
            this._input.setPlaceHolderColor(color);
        }
    },
    setFontColor : function (color1, color2, color3) {
        this._select_color = color2;
        this._unselect_color = color1;
        if(cc.sys.isMobile) {
            if (this._editBoxEnabled) {
                this._input.setFontColor(color1);
            } else {
                this._input.setTextColor(color1);
            }
            return;
        }
        if (!color3) {
        } else {
            this._text_back.setBackGroundColor(color3);
        }
        this._text_shadow.drawNode.clear();
        this._text_shadow.drawNode.drawSegment(cc.p(0, 0), cc.p(0, this._fonts_size), 1, this._unselect_color);
    },
    setPasswordEnabled : function (enable) {
        this._passwordEnabled = enable;
        if (!cc.sys.isMobile || !this._editBoxEnabled) {
            this._input.setPasswordEnabled(enable);
        }
        //else {
        //    this._passwordEnabled ? this._input.setInputFlag(cc.EDITBOX_INPUT_FLAG_PASSWORD) : this._input.setInputFlag(cc.EDITBOX_INPUT_FLAG_SENSITIVE);
        //}
    },
    setPasswordStyleText : function (styleText) {
        this._passwordStyleText = styleText;
        if (!cc.sys.isMobile || !this._editBoxEnabled) {
            this._input.setPasswordStyleText(styleText);
        }
    },
    setMaxLength : function (len) {
        if (0 < len) {
            this._maxLength = len;
            this._input.setMaxLength(len);
        } else {
            this._maxLength = 0;
        }
    },
    setVisible : function (visible) {
        this._input.setVisible(visible);
        cc.Node.prototype.setVisible.call(this, visible);
    }
});