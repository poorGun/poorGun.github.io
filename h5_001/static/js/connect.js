window.onload = function() {

    internationalizes();
    setImg();
    if (window.hilink) {
        setDarkMode();

        getSystemInfo();

        listeningBleChange();
    }

    //注册30s以上，提示连接超时
    setTimeout(() => {
        this.document.getElementById("btnContainer").style.cssText = "display:flex";
        if (isDark) {
            this.document.getElementById("btnContainer").style.background = "#000000";
            this.document.getElementsByClassName("btn")[0].style.background = "rgba(255,255,255,0.1)";
            this.document.getElementsByClassName("btn")[0].style.color = "#3F97E9 ";
        }
        this.document.getElementById("alertContainer").style.cssText = "display:block";
        this.document.getElementById("progressContainer").style.cssText = "display:none";
    }, 30 * 1000);

    let i = 1;
    let timer = setInterval(() => {
        if (i >= 91) {
            clearInterval(timer);
            return
        }
        this.document.getElementById("progressValue").innerHTML = i;
        i++;
    }, 150);
}

var isIOS = false;
var deviceId = '';
var mac = '';
var serviceId = '15f1e600-a277-43fc-a484-dd39ef8a9100';
var characteristicId = '15f1e602-a277-43fc-a484-dd39ef8a9100';
var notifyServiceUuid = "15f1e600-a277-43fc-a484-dd39ef8a9100";
var notifyCharacteristicUuid = "15f1e601-a277-43fc-a484-dd39ef8a9100";
var fwv = '1.0';
var hwv = '1.0';
var isDark = false;

// 暗黑模式适配
function setDarkMode() {
    try {
        isDark = window.hilink.getDarkMode() === 2;
    } catch (error) {

    }
    if (isDark) {
        this.document.getElementsByClassName("connect-content")[0].style.background = "#000000";
        this.document.getElementsByClassName("btnContainer")[0].style.background = "#000000";
        this.document.getElementById("app").style.background = "#000000";
        this.document.getElementsByClassName("detail")[0].style.color = "rgba(255,255,255,0.86)";
        this.document.getElementsByClassName("failConnect")[0].style.color = "rgba(255,255,255,0.86)";
        this.document.getElementsByClassName("progress")[0].style.color = "rgba(255,255,255,0.86)";
        this.document.getElementsByClassName("progressDes")[0].style.color = "rgba(255,255,255,0.66)";
        this.document.getElementsByClassName("btn")[0].style.background = "rgba(255,255,255,0.1)";
        this.document.getElementsByClassName("btn")[0].style.color = "#5291FF";
    }
}

// 监听蓝牙变化,主动打开或关闭蓝牙会触发
function listeningBleChange() {
    window.hilink.onBluetoothAdapterStateChange('onBlueToothAdapterStateChangeCallback')

    window.onBlueToothAdapterStateChangeCallback = res => { // 监听蓝牙状态回调函数
        let data = JSON.parse(res)
        console.log('打开/关闭蓝牙开关:', data.available)
        if (data.available) { // 检测到蓝牙打开
            getUnRegisterDeviceFun();
        } else { // 监测到蓝牙被关闭
            openBlueTooth();
        }
    }
}

// 获取手机系统信息,判断手机操作系统是 Android 还是 iOS
function getSystemInfo() {
    window.hilink.getSystemInfoSync('getSystemInfoSyncCallBack')
    window.getSystemInfoSyncCallBack = info => {
        let data = JSON.parse(info);
        console.log('设备信息~~~~~~~~~~~~~~~~', data);
        if (data.platform == "iOS") {
            console.log("iOS设备")
            isIOS = true;
        } else {
            console.log("andorid设备")
            isIOS = false;
        }
        getBluetoothAdapterState();
    }
}

// 当前蓝牙模块状态
function getBluetoothAdapterState() {
    window.hilink.getBluetoothAdapterState("getBlueToothAdapterStateCallback")

    window.getBlueToothAdapterStateCallback = res => {
        let data = JSON.parse(res);
        console.log('蓝牙模块当前状态:', data.available);

        if (data.available) { // 蓝牙处于打开状态,进入注册流程
            getUnRegisterDeviceFun();
        } else { // 蓝牙处于打开状态
            openBlueTooth();
        }
    }
}

// 打开蓝牙
function openBlueTooth() {
    hilink.openBluetoothAdapter()
}

// 获取当前页面被选中的未注册的设备,拿去注册
function getUnRegisterDeviceFun() {
    window.hilink.getCurrentUnregisteredDevice('getCurrentUnregisteredDeviceCallback')

    window.getCurrentUnregisteredDeviceCallback = res => {
        let data = JSON.parse(res);
        deviceId = data.deviceId
        console.log('获取安卓的MAC地址(ios的uuid):', data.deviceId);

        if (isIOS) { // IOS设备注册
            getIOSdevices();
        } else { // 安卓设备注册
            mac = deviceId;

            connectDevice();
        }
    }
}

// 先监听，后连接
function connectDevice() {
    console.log('开始尝试连接蓝牙设备...');

    window.hilink.onBLEConnectionStateChange('onBLEConnectionStateChangeCallback'); // 监听蓝牙设备连接结果
    window.onBLEConnectionStateChangeCallback = res => {
        let data = JSON.parse(res)
        console.log('蓝牙设备连接结果', data.connected);

        if (data.connected) { // 连接成功，去到云端注册设备。
            registerBleDevice(mac);
        } else { // 连接失败，重新获取未注册的设备，进行连接。
            getUnRegisterDeviceFun();
        }
    }

    if (isIOS) {
        window.hilink.createBLEConnection(deviceId);
    } else {
        window.hilink.createBleConnection(deviceId, 2); // 指定蓝牙连接方式
    }
}

// 注册设备,注册成功后会在APP设备列表页显示设备
function registerBleDevice(mac) {
    console.log('开始注册蓝牙设备:', mac)
    window.hilink.registerBleDevice(mac, fwv, hwv, 'registerBleDeviceCallback')
    window.registerBleDeviceCallback = res => {
        console.log('蓝牙设备注册结果:', res)
    }
}

// IOS发现附近蓝牙
function getIOSdevices() {
    console.log('IOS,发现附近蓝牙设备,获取其MAC地址')
    window.hilink.onBluetoothDeviceFound("onBluetoothDeviceFoundCallBack");

    window["onBluetoothDeviceFoundCallBack"] = info => {
        let data = JSON.parse(info);

        let macInfo = getMAC(data); // 处理设备信息，获取设备MAC

        if (macInfo[0] === 1) {
            mac = macInfo[1]
            connectDevice();
        } else if (macInfo[0] === 2) {
            console.log('IOS,本蓝牙设备无advertisData字段，直接去连接设备')
            getMacByRead();
        }
    }

    window.hilink.startBluetoothDevicesDiscovery([], 0, 1);
}

// IOS处理附近蓝牙设备信息，获取其MAC地址
// 0 未扫描到设备, 1 匹配到设备, 2匹配到设备没有mac地址
function getMAC(data) {
    console.log('IOS,开始进行设备匹配...')
    if (data.deviceId === deviceId) { // 附近设备MAC地址，与当前设备UUID匹配
        console.log("IOS,匹配到蓝牙设备:" + data.deviceId + ' ,并停止扫描.')

        window.hilink.stopBluetoothDevicesDiscovery() // 关闭扫描

        console.log('IOS,匹配到的蓝牙设备信息：', data)

        if (data.advertisData) {
            let advertisData = data.advertisData;
            advertisData = advertisData.replace(/ /g, '');
            advertisData = advertisData.slice(advertisData.length - 13, advertisData.length - 1).toLocaleUpperCase();
            let macAdress = this.analysisMac(advertisData);
            console.log("ios mac", macAdress);
            return [1, macAdress];
        } else {
            return [2, '']
        }
    }
    return [0, ''];

}

// IOS连接设备
function getMacByRead() {
    // 监听蓝牙特征值变化
    window.hilink.onBLECharacteristicValueChange("onBLECharacteristicValueChangeCallback")
    window.onBLECharacteristicValueChangeCallback = res => {
        console.log(res);
    }

    // 连接设备
    window.hilink.createBLEConnection(deviceId)
    window.hilink.onBLEConnectionStateChange('onIOSBLEConnectionStateChangeCallback')
    window.onIOSBLEConnectionStateChangeCallback = res => {
        console.log('IOS,开始连接设备...')
        let data = JSON.parse(res)
        if (data.connected) {
            let timer = null
            clearInterval(timer);
            timer = setInterval(() => {
                let status = window.hilink.notifyBLECharacteristicValueChange(deviceId, serviceId, characteristicId, true)
                console.log('notify status:', status)
                if (status === 0) {
                    clearInterval(timer);
                    window.hilink.readBLECharacteristicValue(deviceId, serviceId, characteristicId, 'readBLECharacteristicValueCallback')
                    window.readBLECharacteristicValueCallback = res => {
                        let tempMac = JSON.parse(res).data;
                        tempMac = analysisMac(tempMac)

                        console.log('readBLECharacteristicValueCallback:', tempMac);

                        registerBleDevice(tempMac)
                    }
                }
            }, 200)
        } else {
            getUnRegisterDeviceFun();
        }
    }

}

function finishDeviceActivity() {
    window.hilink && window.hilink.finishDeviceActivity();
}

// 中英文翻译
function internationalizes() {
    this.currentLanguage = (function getAppLanguage() {
        // 判定规则:如果不是以'zh-'开始则显示为en-US
        let language,
            defualtLanguage = 'zh-CN';
        let reg = /^zh-/i;
        if (navigator && navigator.language) {
            language = reg.test(navigator.language) ? defualtLanguage : 'en-US';
        } else {
            language = defualtLanguage;
        }
        return language;
    })();

    if (this.currentLanguage !== 'zh-CN') {
        this.document.getElementsByClassName("progressDes")[0].innerHTML = 'Connecting…'
        this.document.getElementsByClassName("failConnect")[0].innerHTML = 'Unable to connect'
        this.document.getElementsByClassName("details")[0].innerHTML = 'While connecting, make sure:'
        this.document.getElementsByClassName("details")[1].innerHTML = '1.The phone\'s Bluetooth is enabled.'
        this.document.getElementsByClassName("details")[2].innerHTML = '2.The device is within 5 meters of the phone.'
        this.document.getElementsByClassName("details")[3].innerHTML = '3.The phone is connected to the Internet.'
        this.document.getElementsByClassName("details")[4].innerHTML = '4.The device is not paired with the current account before.'
        this.document.getElementsByClassName("btn")[0].innerHTML = 'Try again'
    }
}

// 设备图片
function setImg() {
    try {
        var imgSrc = 'img/fanMain.png';// 'img/1440.png'
        if (window.location.href && window.location.href.indexOf('h5_001') > -1) {
            imgSrc = 'img/fanMain.png';
        } else if (window.location.href && window.location.href.indexOf('template') > -1) {
            imgSrc = 'img/fanMain.png';
        }
        this.document.getElementsByClassName("deviceImg")[0].src = imgSrc;
    } catch (e) {
        console.log('图片设置报错:', e)
    }
}

// 解析mac地址
function analysisMac(str) {
    str = this.hexArarryAddSpace(str, 2)
    let arr = str.split(' ')
    arr.reverse()
    let result = '';
    arr.map(item => {
        result += item + ':'
    })
    result = result.slice(0, result.length - 1)
    return result
}

function hexArarryAddSpace(str, split_len = 2) { /** 16进制字符串 每2个字符用一个空格隔开 **/
    let result = '';
    for (let i = 0; i < str.length; i += split_len) {
        if (result !== '') result += ' ';
        result += str[i] + str[i + 1];
    }
    return result;
}