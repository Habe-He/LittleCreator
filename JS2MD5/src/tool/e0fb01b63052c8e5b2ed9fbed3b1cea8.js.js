/**
* 全局定义 错误消息 By Kent
*  */


var register_err_account_len = "手机号码长度填写错误";              //账号长度错误
var register_err_account_format = "手机号码格式填写错误";           //账号格式错误
var register_err_account_empty = "手机号码不可为空";                //账号不可为空
var register_err_account_change = "手机号码有变，请重新获取验证码";

var register_err_pwd_len = "密码必须是6~16位英文或数字";            //密码长度错误
var register_err_pwd_empty = "密码不可为空";                        //密码不可为空

var register_err_code_len = "验证码长度错误";
var register_err_code_empty = "验证码不可为空";
var register_err_code_foramt = "验证码格式错误";

var logon_err_acc_format = "账号或密码包含非法字符，请重新输入";
var logon_err_acc_empty = "账号不可为空，请填写账号";

var err_nickname_small = "昵称太短，请重新输入";
var err_nickname_big = "昵称过长，请重新输入";

var register_success = "success";
var check_success = "success";

var password_min_len = 6;       //密码最小长度

var bag_bank_success = 1;
var bag_bank_err_empty = -1;                                             //背包输入的存取金额错误

var get_mail_type_success = "1";
var get_mail_type_nomsg = "2";
var get_mail_type_err = "3";
var task_prizes_type = 1;

var server_faile_err_msg = [];
server_faile_err_msg[0] = "未知错误";
server_faile_err_msg[1] = "该任务还没有完成哦,不能领取奖励!";
server_faile_err_msg[2] = "正在游戏房间内,请退出游戏房间再进行领取!";
server_faile_err_msg[3] = "您正在背包处理的过程中哦,需要退出背包再领取奖励!";

//支付SDK回调地址（正式）
//var pay_sdk_callback_url = "http://pay.kkvs.com/pay/mobilepay/SdkPaysucceed.ashx";
var pay_sdk_callback_url = "http://pay.kkvs.com/Pay/mobilepay/SdkPaysucceedByMedal.ashx";
//支付SDK回调地址（测试）
//var pay_sdk_callback_url = "http://60.191.221.17:8011/pay/mobilepay/SdkPaysucceed.ashx";


//支付订单提交地址（测试）
//var pay_send_orderid_url = "http://60.191.221.17:8011/pay/mobilepay/SDKMobileOrder.aspx";
//支付订单提交地址（正式）
var pay_send_orderid_url = "http://pay.kkvs.com/pay/mobilepay/SDKMobileOrder.aspx";


//手机绑定/解绑（测试）
//var phone_bind_url = "http://60.191.221.17:8071/Mobile/MobileBindAccounts.aspx";
//手机绑定/解绑（正式）
var phone_bind_url = "http://kkgame.kkvs.com/Mobile/MobileBindAccounts.aspx";


//找回密码（测试）
//var forget_url = "http://60.191.221.12:8071/Mobile/MobileVerifyPhone.aspx";
//找回密码（正式）
var forget_url = "http://kkgame.kkvs.com/Mobile/MobileVerifyPhone.aspx";

//发送验证码（测试）
//var send_code_url = "http://60.191.221.12:8071/Mobile/MobileSendCode.aspx";
//发送验证码（正式）
//var send_code_url = "http://61.164.110.71:8100/Module/NewGameWeb/api_agent_sendcode.aspx";
var send_code_url = "http://clientweb.kkvs.com/MobileApi/SendCode";
//实名验证
var is_there_any_real_name = "http://clientweb.kkvs.com/MobileApi/GetIDCard";
var real_name_validation = "http://clientweb.kkvs.com/MobileApi/SubmitUpdateIDCard";

//第三方支付 http://qp.liebao.cn/Cheetah/CheetahPay.aspx
var tp_pay_url = "http://testkkgame.kkvs.com/Pay/WebGamePay.aspx";

var http_url_prefix = "http://122.228.193.235:8014/Module/NewGameWeb/"; //122.228.193.235:8013
// var http_url_prefix = "http://kkddz.kkvs.com/Module/NewGameWeb/";
// var http_url_prefix = "http://60.191.221.163:8013/Module/NewGameWeb/";
//微信公众号
var wechat_public_number = "kk_ddz";