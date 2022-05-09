// 定义消息类型
// 注意，MESSAGE_SEND和MESSAGE_RECEIVE要一一对应，否则会接收无法解析导致失败
// TODO:自己修改消息类型
var MESSAGE_SEND = {
    WORK_STATUS: '81', // MSGID -> CMD
    SPEED_LEVEL: "82", // MSGID -> CMD
    WARM: "83", // MSGID -> CMD
    SET_TIME: "84", // MSGID -> CMD
}

var MESSAGE_RECEIVE = {
    WORK_STATUS: '52', // MSGID -> CMD
    SPEED_LEVEL: "53", // MSGID -> CMD
    WARM: "54", // MSGID -> CMD
    SET_TIME: "55", // MSGID -> CMD
}

// 蓝牙返回结果
var BT_RETURN_RESULT = {
    SUCCESS: 0,
    FAIL: 1
}
var nottifyCallBack = ""
var lastNotify
var ERR_CODE = {
    ERR_CODE_SEND_SUCCESS: 0, //发送成功       
    ERR_CODE_INPUT_MSG_NOT_DEFINE: 1001, //错误码1001，消息类型未定义，修改MESSAGE_SEND，增加相关消息定义
    ERR_CODE_INPUT_DATA_NOT_JSON: 1002, //错误码1002，入参传json格式不正确，或者json格式中包含device_ret_val字段
    ERR_CODE_PREPARE_BT_COMMAND_ERROR: 1003, //错误码1003，蓝牙组包失败，一般是因为传的json跟命令对不上，请检查parpareSendCommand函数，是否适配了最新的协议规范
    ERR_CODE_BLE_SEND_FAIL: 1004, //错误码1004，蓝牙发送命令失败，请检查蓝牙服务相关日志报错
    ERR_CODE_BLE_SEND_IN_PROCESS: 1005, //错误码1005，蓝牙命令正在发送，没有超时或者返回结果，忽略此条消息
    ERR_CODE_CALL_BACK_NOT_STRING: 1006, //错误码1006，回调函数非函数名称。
    ERR_CODE_SEND_MSG_TIMEOUT: 1007, //错误码1007，发送超时
    ERR_CODE_WAIT_MSG_MISSING: 1008, //错误码1008，等待蓝牙命令执行结果时，消息异常丢失
}

// 存储发送命令的Map,key为MESSAGE_SEND的枚举
var CommandMap = new Map()
    //暴露变量
var result = {};

// 暴露接口
function sendBle(message, data, CallBack) {
    console.log("begin sendBle Session.");
    let callbackJson
    if (typeof(CallBack) != 'string') {
        console.log('sendSession fail:call back name is not string');
        return
    }
    console.log('sendSession success 0:call back name is string');

    // 检查方法名字是否为已定义的函数
    if (typeof(eval(CallBack)) != "function") {
        console.log('callback is not a function!')
        return
    }

    var obj = null
    try {
        obj = JSON.parse(data)
        if (obj.hasOwnProperty('device_ret_val')) {
            // data含有返回标志device_ret_val，不合法
            callbackJson = '{"err_code":' + ERR_CODE.ERR_CODE_INPUT_DATA_NOT_JSON + ',"data":{"messageid":' + message + ',"sourceData":' + data + '},"info":"ERR_CODE_INPUT_DATA_NOT_JSON"}'
            return
        }
        console.log('sendSession success 1:parse input data jason success');
        // 判断消息是否定义
        var findMsg = false
        for (let key in MESSAGE_SEND) {
            if (MESSAGE_SEND[key] == message) {
                findMsg = true
                break;
            }
        }
        if (!findMsg) {
            // 消息遍历失败,流程结束
            callbackJson = '{"err_code":' + ERR_CODE.ERR_CODE_INPUT_MSG_NOT_DEFINE + ',"data":{"messageid":' + message + ',"sourceData":' + data + '},"info":"ERR_CODE_INPUT_MSG_NOT_DEFINE"}'
            return
        } else {
            // 消息成功，解析成功
            console.log('sendSession success 2:find msg success');

            //发送蓝牙命令
            callbackJson = sendBlecommand(message, data, CallBack)
            return
        }
    } catch (err) {
        // json解析失败
        callbackJson = '{"err_code":' + ERR_CODE.ERR_CODE_INPUT_DATA_NOT_JSON + ',"data":{"messageid":' + message + ',"sourceData":' + "data" + '},"info":"ERR_CODE_INPUT_DATA_NOT_JSON"}'
    } finally {
        if (callbackJson != null) {
            eval(CallBack + '(' + callbackJson + ')');
        }
    }
}

function sendBlecommand(message, data, CallBack) {
    var retJson;
    //通过msg 和data 组包，检查参数和msgId的合法性 如果不合法
    var sendByte = parpareSendCommand(message, data)
    if (sendByte != null) {
        console.log('sendSession success 3:parpareSendCommand sucess:');
        if (CommandMap.has(message)) {
            // 判断发送命令是否已经在队列中
            retJson = '{"err_code":' + ERR_CODE.ERR_CODE_BLE_SEND_IN_PROCESS + ',"data":{"messageid":' + message + ',"sourceData":' + data + '},"info":"ERR_CODE_BLE_SEND_IN_PROCESS"}'
            return retJson;
        } else {
            /********************************************************/
            // TODO:蓝牙命令组包成功,调用蓝牙发送命令接口
            // var sendResult = hilink.sendBle(xxxxxxx)

            var sendResult = true
            if (window.hilink) {
				window.getsendCommandCallback = res => {
						let data = JSON.parse(res)
						console.info('4444 writeBLECharacteristicValue callback:')
						console.info(data)
				}
                var ret_val = window.hilink.writeBLECharacteristicValue(deviceId, serviceId, characteristicId, sendByte, "getsendCommandCallback")
                console.log("发向蓝牙的命令 sendByte:" + sendByte + ",deviceId:" + deviceId + ",serviceId:" + serviceId + ",characteristicId:" + characteristicId + ",ret_val:" + ret_val);
                
                // if (ret_val != 0) {
                //     sendResult = false
                // }
            }
            if (sendResult) {
                // 发送成功,存入数组
                CommandMap.set(message, data);
                waitMessageProcess(10, message, data, CallBack)
                    console.log('sendSession success 5:ble send msg is send success');

            } else {
                // 发送失败
                retJson = '{"err_code":' + ERR_CODE.ERR_CODE_BLE_SEND_FAIL + ',"data":{"messageid":' + message + ',"sourceData":' + data + '},"info":"ERR_CODE_BLE_SEND_FAIL"}'
                return retJson;
            }
        }
    } else {
        // 组包失败，参数有问题
        retJson = '{"err_code":' + ERR_CODE.ERR_CODE_PREPARE_BT_COMMAND_ERROR + ',"data":{"messageid":' + message + ',"sourceData":' + data + '},"info":"ERR_CODE_PREPARE_BT_COMMAND_ERROR"}'
        return retJson;
    }
}

// TODO : 待完善,命令编码函数
function parpareSendCommand(message, data) {
    // console.log('parpareSendCommand:message' + message + ',data:' + data)
        // 将data转换为字节码流
    data = JSON.parse(data)
    let code = parseInt(data.cmd, 16) + parseInt(data.value, 16)
    code = code.toString(16)
    let cs = code.substring(code.length - 2)
    switch (data.cmd) {
        case '81':
        case '82':
        case '83':
        case '84':
            break
        default:
            return null
    }
    var instructionString = '55aa06' + data.cmd + data.value + cs;


    console.log('parpareSendCommand sendCommandaaa:' + "," + data.cmd + "," + data.value + "," + cs)

    return instructionString
}

// 此处修改等待时间，建议时间为3s以上
function waitMessageProcess(num, message, data, CallBack) {
    var retJson
        //判断map中是否有该命令
    if (!CommandMap.has(message)) {
        // 没有该命令，说明流程异常,等待结束
        console.log('sendSession error:wait message is missing');
        retJson = '{"err_code":' + ERR_CODE.ERR_CODE_WAIT_MSG_MISSING + ',"data":{"messageid":' + message + ',"sourceData":' + data + '},"info":"ERR_CODE_WAIT_MSG_MISSING"}'
        eval(CallBack + '(' + retJson + ')');
        return
    } else {
        //TODO:取出执行结果，执行结果在收到蓝牙反馈时塞进去，此处定义字段device_ret_val,最后删除这个map,此处的data是map中的data
        var mapdata = CommandMap.get(message)
            // console.log(mapdata)
            console.log("waitMessageProcess:" + JSON.stringify(mapdata))
        mapdata = JSON.parse(mapdata)
        if (mapdata.hasOwnProperty('device_ret_val')) {
            retJson = '{"err_code":' + ERR_CODE.ERR_CODE_SEND_SUCCESS + ',"data":{"messageid":' + message + ',"sourceData":' + data + '},"info":"ERR_CODE_SEND_SUCCESS","device_ret_val":' + "mapdata.device_ret_val" + '}'
                // 清除map
            CommandMap.delete(message);
            eval(CallBack + '(' + retJson + ')');
            return
        }
    }
    if (num == 0) {
        // 等待超时
        retJson = '{"err_code":' + ERR_CODE.ERR_CODE_SEND_MSG_TIMEOUT + ',"data":{"messageid":' + message + ',"sourceData":' + data + '},"info":"ERR_CODE_SEND_MSG_TIMEOUT"}'
            //等待查实删除message
        CommandMap.delete(message);
        eval(CallBack + '(' + retJson + ')');
        return
    } else {
        // TODO 此处修改循时间 建议50ms  30次
        sleep(150).then(() => {
            // 这里写sleep之后需要去做的事情
            return (num - 1) * waitMessageProcess(num - 1, message, data, CallBack)
        })
    }
}


// 定时器
function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

//TODO：测试函数，此处要将这个逻辑和蓝牙接收命令融合,这个里面赛一个device_ret_val的值，这个值可以直接透传 (值为true和false，根据上传的信息确定)
function receiveMsg(data) {
    var resolver = dealWithCharacteristicValue(0, 0, data);
    // 获取到蓝牙回调
    for (let key in MESSAGE_RECEIVE) {
        // console.log("resolver.cmd:" + resolver.cmd + ",MESSAGE_RECEIVE:" + MESSAGE_RECEIVE[key]+ "resolver.setResult:" + resolver.setResult);
        if (MESSAGE_RECEIVE[key] == resolver.cmd) {
            if (CommandMap.has(MESSAGE_SEND[key])) {
                console.log("sendSession success 6 receive msg:" + key)
                var jsontmp = CommandMap.get(MESSAGE_SEND[key])
                jsontmp = JSON.parse(jsontmp)
                console.log("sendSession success 7 setReceiveResult:" + JSON.stringify(jsontmp))
                jsontmp.device_ret_val = resolver.setResult
                console.log("sendSession success 8 setReceiveResult:" + JSON.stringify(jsontmp))
                CommandMap.set(MESSAGE_SEND[key], JSON.stringify(jsontmp))
            }
        }
    }
    return null
}


function dealWithCharacteristicValue(deviceId, characteristicId, rawData) {
    if (typeof(rawData) != 'string') {
        return
    }
    // console.log("dealWithCharacteristicValue:" + rawData)
    rawData = rawData.toLowerCase();
    let head1 = rawData.substring(0, 2);
    let head2 = rawData.substring(2, 4);
    let len = parseInt(rawData.substring(4, 6), 16);

    if (head1 == '55' && head2 == 'aa' && len == (rawData.length / 2)) {
        let cmd = rawData.substring(6, 8);
        result.cmd = cmd;
        if (cmd == '51' && lastNotify != rawData) { //设备信息上报
            console.log("dealWithCharacteristicValue:" + rawData)
            lastNotify = rawData
            result.runStatus = rawData.substring(9, 10);
            result.heatStatus = rawData.substring(11, 12);
            result.speed = parseInt(rawData.substring(12, 14) + rawData.substring(14, 16), 16);
            result.speedMode = rawData.substring(17, 18);
            result.power = parseInt(rawData.substring(18, 20), 16);
            result.runTime = parseInt(rawData.substring(20, 22), 16);
            result.surplusTime = parseInt(rawData.substring(22, 24), 16);
            result.timeSet = rawData.substring(25, 26);
            // 此处回调notify
            eval(nottifyCallBack + '(' + JSON.stringify(result) + ')');
        } else if (cmd == '52') { //启动或停止
            console.log("dealWithCharacteristicValue:" + rawData)
            if(rawData.substring(8, 10) == '00') {
                result.setResult = BT_RETURN_RESULT.SUCCESS
            } else {
                result.setResult = BT_RETURN_RESULT.FAIL
            }
            // result.data = rawData.substring(8, 10) == "00" ? BT_RETURN_RESULT.SUCCESS : BT_RETURN_RESULT.FAIL;
        } else if (cmd == '53') { //挡位调节
            console.log("dealWithCharacteristicValue:" + rawData)
            if(rawData.substring(8, 10) == '00') {
                result.setResult = BT_RETURN_RESULT.SUCCESS
            } else {
                result.setResult = BT_RETURN_RESULT.FAIL
            }
            // result.setResult = rawData.substring(8, 10) == "00" ? BT_RETURN_RESULT.SUCCESS : BT_RETURN_RESULT.FAIL;
        } else if (cmd == '54') { //控制加热
            console.log("dealWithCharacteristicValue:" + rawData)
            if(rawData.substring(8, 10) == '00') {
                result.setResult = BT_RETURN_RESULT.SUCCESS
            } else {
                result.setResult = BT_RETURN_RESULT.FAIL
            }
            // result.setResult = rawData.substring(8, 10) == "00" ? BT_RETURN_RESULT.SUCCESS : BT_RETURN_RESULT.FAIL;
        } else if (cmd == '55') { //设置倒计时
            console.log("dealWithCharacteristicValue:" + rawData)
            if(rawData.substring(8, 10) == '00') {
                result.setResult = BT_RETURN_RESULT.SUCCESS
            } else {
                result.setResult = BT_RETURN_RESULT.FAIL
            }
            // result.setResult = rawData.substring(8, 10) == "00" ? BT_RETURN_RESULT.SUCCESS : BT_RETURN_RESULT.FAIL;
        }
    }
    return result;
}

function registerNotifyCallBack(CallBack) {
    if (typeof(CallBack) != 'string') {
        return false
    }
    // 检查方法名字是否为已定义的函数
    if (typeof(eval(CallBack)) != "function") {
        return false
    }
    nottifyCallBack = CallBack
    return true
}