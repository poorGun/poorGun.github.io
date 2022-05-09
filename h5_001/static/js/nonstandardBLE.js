function init() {
    getSystemInfo();
    listeningBleChange();
}

var deviceId = '';
var serviceId = '15f1e600-a277-43fc-a484-dd39ef8a9100';
var characteristicId = '15f1e602-a277-43fc-a484-dd39ef8a9100';
var notifyServiceUuid = "15f1e600-a277-43fc-a484-dd39ef8a9100";
var notifyCharacteristicUuid = "15f1e601-a277-43fc-a484-dd39ef8a9100";
var fwv = '1.0';
var hwv = '1.0';
var isIOS = false;

// 监听蓝牙变化,主动打开或关闭蓝牙会触发
function listeningBleChange() {
    hilink.onBluetoothAdapterStateChange('onBlueToothAdapterStateChangeCallback')
    window.onBlueToothAdapterStateChangeCallback = res => { // 监听蓝牙状态回调函数
        let data = JSON.parse(res)
		console.info('onBluetoothAdapterStateChange callback:')
		console.info(data)
        console.log('打开/关闭蓝牙开关:', data.available)
        if (data.available) { // 检测到蓝牙打开
            getRegisterDeviceFun();
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
		console.info('getSystemInfoSync callback:')
		console.info(data)
        if (data.platform == "iOS") {
            isIOS = true;
        } else {
            // console.log("andorid设备")
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
		console.info('getBluetoothAdapterState callback:')
		console.info(data)
        console.log('蓝牙模块当前状态', data.available);
        if (data.available) { // 蓝牙处于打开状态,进入注册流程
            getRegisterDeviceFun();
        } else { // 蓝牙处于打开状态
            openBlueTooth();
        }
    }
}

// 打开蓝牙
function openBlueTooth() {
    hilink.openBluetoothAdapter()
}


function getRegisterDeviceFun() {
    window.hilink.getCurrentRegisteredDevice('getCurrentRegisteredDevice')
    window.getCurrentRegisteredDevice = res => {
        // dataInfo.innerHTML = res
        let data = JSON.parse(res);
		console.info('getCurrentRegisteredDevice callback:')
		console.info(data)
        deviceId = data.deviceId;
        if (isIOS) { // IOS设备注册
            getIOSdevices();
        } else { // 安卓设备注册
            connectDevice();
        }
		// 连接状态发生变化时，更新UI
		linkStatus = LINK_STATUS.CONNECTINT
		refreshStyle()
    }
}

function connectDevice() {
    // 先监听，后连接
    window.hilink.onBLEConnectionStateChange('onBLEConnectionStateChangeCallback'); // 监听蓝牙连接状态变化
    window.onBLEConnectionStateChangeCallback = res => {
        let data = JSON.parse(res)
		console.info('0000 onBLEConnectionStateChange callback:')
		console.info(data)
        if (data.connected) {
            linkStatus = LINK_STATUS.CONNECT
            refreshStyle()
			
			window.onBLEServicesDiscoveredCallback = res => {
				let data = JSON.parse(res)
				console.info('1111 onBLEServicesDiscovered callback:')
				console.info(data)
			    notifystatus = window.hilink.notifyBLECharacteristicValueChange(deviceId, notifyServiceUuid, notifyCharacteristicUuid, true)
				console.info('notifystatus: ' + notifystatus)
				
				window.getsendCommandCallback = res => {
					let data = JSON.parse(res)
					console.info('3333 writeBLECharacteristicValue callback:')
					console.info(data)
				}
				lastNotify = ''
				var ret_val = window.hilink.writeBLECharacteristicValue(deviceId, serviceId, characteristicId, "05AA06020002", "getsendCommandCallback")
				console.info('3333 call writeBLECharacteristicValue')
				console.info("发向蓝牙的命令 sendByte:" + "05AA06020002" + ",deviceId:" + deviceId + ",serviceId:" + serviceId + ",characteristicId:" + characteristicId + ",ret_val:" + ret_val);
			}
            window.hilink.onBLEServicesDiscovered("onBLEServicesDiscoveredCallback") //发现蓝牙服务
			console.info('1111 call onBLEServicesDiscovered:')
			
			window.ValueChangeCallback = async res => {
				let data = JSON.parse(res)
				console.info('2222 onBLECharacteristicValueChange callback:')
				console.info(data)
			    receiveMsg(JSON.parse(res).data)
			}
            window.hilink.onBLECharacteristicValueChange("ValueChangeCallback") //监听返回值的变化
			 console.info('2222 call onBLECharacteristicValueChange:')
			 
        } else {
            // 连接状态发生变化时，更新UI
            console.log("连接状态变化：未连接")
            linkStatus = LINK_STATUS.DISCONNECT
            refreshStyle()
        }
    }
    if (isIOS) {
        window.hilink.createBLEConnection(deviceId);
    } else {
        console.log("创建蓝牙连接....")
        window.hilink.createBleConnection(deviceId, 2); // 指定蓝牙连接方式
    }
	console.info('0000 call createBleConnection')
}


// IOS发现附近蓝牙
function getIOSdevices() {
    console.log('IOS,发现附近蓝牙设备,获取其MAC地址')
    window.hilink.onBluetoothDeviceFound("onBluetoothDeviceFoundCallBack");

    window.onBluetoothDeviceFoundCallBack = info => {
        let data = JSON.parse(info);
		console.info('onBluetoothDeviceFound callback:')
		console.info(data)
		
		data = dataChange(info)
		let advertisData = data.advertisData;
		let mac = (function analysisMac(str){
		    str = str.replace(/ /g, '');
		    str = str.slice(str.length - 13, str.length - 1).toLocaleUpperCase();
		    let tmp1 = '';
		    for(let i = 0; i < str.length; i += 2) {
		        if(tmp1 !== '') tmp1 += ' ';
		        tmp1 += str[i] + str[i + 1];
		    }
		    let arr = tmp1.split(' ')
		    arr.reverse()
		    
		    let tmp2 = '';
		    arr.map(item => {
		        tmp2 += item + ':'
		    })
		    tmp2 = tmp2.slice(0, tmp2.length - 1);
		    return tmp2
		})(advertisData);
		
		console.log('ios：附近设备mac:',mac)
		if(mac === deviceId){  
		    window.hilink.stopBluetoothDevicesDiscovery();    // 停止扫描
			deviceId = data.deviceId
			connectDevice()
		}
    }
    window.hilink.startBluetoothDevicesDiscovery([], 0, 1);
}

// 接口返回数据格式的转换
function dataChange(res) {
    let data = undefined;
    let dataStr = res;
    dataStr = dataStr.replace(/"{/g, '{');
    dataStr = dataStr.replace(/}"/g, '}');
    dataStr = dataStr.replace(/\\|\n|\r|\t|\f|\t/g, '');
    data = JSON.parse(dataStr);

    return data;
}