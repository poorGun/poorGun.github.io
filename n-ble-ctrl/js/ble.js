
window.onload = function(){
    if(window.hilink){
        onBluetoothAdapterStateChange();  // 监听蓝牙模块开启/关闭 触发
        onBLEConnectionStateChange();     // 监听低功耗蓝牙设备连接状态的改变
        getBluetoothAdapterState();       // 蓝牙模块状态是否打开
    }
}

var deviceIdMac = '';  //注册时候的mac地址
var UUID_OR_Mac = '';  //通过扫描设备拿到的devicesID, 安卓是mac地址, ios是UUID
var isDiscover = false;
var notifyUuids = [
    {
        switchOn:'00',  //下发数据为16进制, 不要带0x
        switchOff:'01',
        serviceUuid:'0000fee9-000-1000-8000-00805f9b34fb',
        characteristicUuid:'D44BC439-ABFD-45A2-B575-925416129601'
    }
];

var isIOS = !!navigator.userAgent.match(/iPhone/i);

// 滑动开关-----控制设备
var fnSlider = document.getElementsByClassName("fnSlider")[0];
var sliderBtn = document.getElementsByClassName("sliderBtn")[0];
var devStatus = document.getElementsByClassName("devStatus")[0];
var statusLeft =devStatus.firstElementChild;
var fnSubtitle = document.getElementsByClassName("fnSubtitle")[0];
var val = false;

fnSlider.addEventListener('click',function(event){
    if (statusLeft.innerHTML == '已连接') {
        if (isColorWhite == true) {
            if (val) {
                sliderBtn.style.right = 1.8 + 'rem'; 
                fnSlider.style.background = 'rgba(255,255,255,0.1)';
                fnSubtitle.style.display = 'none';
                // writeBLECharacteristicValue(notifyUuids[0].switchOn);
                val = false;
            } else{
                sliderBtn.style.right = 0.2 + 'rem'; 
                fnSlider.style.background = '#317AF7';
                fnSubtitle.style.display = 'block';
                // writeBLECharacteristicValue(notifyUuids[0].switchOff);
                val = true;
            }
        } else {
            if (val) {
                sliderBtn.style.right = 1.8 + 'rem'; 
                fnSlider.style.background = 'rgba(0,0,0,0.1)';
                fnSubtitle.style.display = 'none';
                val = false;
            } else {
                sliderBtn.style.right = 0.2 + 'rem'; 
                fnSlider.style.background = '#0A59F7';
                fnSubtitle.style.display = 'block';
                val = true;
            }
        }
    } else {
        console.log('蓝牙未连接');
    }
    
    event.stopPropagation();
})


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

// 监听蓝牙模块--蓝牙模块开启和关闭的时候触发
function onBluetoothAdapterStateChange(){
    window.hilink.onBluetoothAdapterStateChange('bluetoothStateChangeCallback');

    window.bluetoothStateChangeCallback = res =>{
        let data = dataChange(res);
        console.log('主动打开或关闭蓝牙模块:',data.available);
        if(data.available){ 
            getCurrentRegisteredDevice(); // 获取当前设备的mac地址
        }else{
            window.hilink.openBluetoothAdapter();
        }
    }
}

// 蓝牙设备连接-----
// 1.获取当前蓝牙模块状态，判断当前蓝牙是否处于打开状态。
function getBluetoothAdapterState(){
    window.hilink.getBluetoothAdapterState('getBluetoothAdapterStateCallback');

    window.getBluetoothAdapterStateCallback = res =>{
        let data = dataChange(res);
        console.log('当前蓝牙模块状态:',data.available);
        if(data.available){ 
            getCurrentRegisteredDevice(); // 获取当前设备的mac地址
        }else{ 
            window.hilink.openBluetoothAdapter(); // 蓝牙未打开，则请求打开
        }
    }
}

// 2.监听蓝牙设备连接状态，连接结果通过回调得知(先监听后连接)
function onBLEConnectionStateChange(){
    window.hilink.onBLEConnectionStateChange('bleConnectionStateCallBack');

    // 有设备连接后才会触发回调
    window.bleConnectionStateCallBack = res => {
        let data = dataChange(res);
        console.log('蓝牙设备连接结果:',data.connected);
        
        if(data.connected){ 
            statusLeft.innerHTML = '已连接';
            onBLECharacteristicValueChange(); // 监听低功耗蓝牙设备的特征值变化
            notifyBle();                      // 信道建立
        }else{ 
            isDiscover = false;
            onBluetoothDeviceFound();         // 重新发现，匹配
        }
    }
}

// 3.获取当前设备的mac地址
function getCurrentRegisteredDevice(){
    window.hilink.getCurrentRegisteredDevice('currentRegisteredDeviceCallBack');

    window.currentRegisteredDeviceCallBack = res =>{
        let data = dataChange(res);
        deviceIdMac = data.deviceId;
        console.log('当前设备mac地址:',deviceIdMac)
    
        // 开始扫描
        onBluetoothDeviceFound();
    }
}

// 4.发现附近蓝牙设备（先监听，后发现）
function onBluetoothDeviceFound(){
    window.hilink.onBluetoothDeviceFound('bluetoothDeviceCallBack');
    window.bluetoothDeviceCallBack = res =>{
        let data = dataChange(res);
        statusLeft.innerHTML = '连接中...';
        // console.log('附近设备的信息:',data);
    
        // 把被扫描到的蓝牙设备的mac地址与当前要建立连接设备的mac地址做对比，
        if(isIOS){
            // ios mac地址需要硬件配合暴露出来,此例子是暴露在广播名的advertisData字段里面
            // 解析advertisData拿到mac地址
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
            if(mac === deviceIdMac){  
                window.hilink.stopBluetoothDevicesDiscovery();    // 停止扫描
                UUID_OR_Mac = data.deviceId;
                bleConnection(UUID_OR_Mac);
            }
        }else{
            console.log('安卓:附近设备的MAC:',data[0].deviceId);
            if(data[0].deviceId == deviceIdMac){
                isDiscover = true;
                window.hilink.stopBluetoothDevicesDiscovery();
                UUID_OR_Mac = data[0].deviceId;
                bleConnection(UUID_OR_Mac);  
            }
        }
    }

    if (isDiscover) {
        window.hilink.stopBluetoothDevicesDiscovery();
    } else {
        // 注意:当短时间重复多次搜寻附近蓝牙设备时，安卓手机概率不执行搜寻操作。
        console.log('发现附近蓝牙设备,获取其MAC地址，进行匹配...')
        window.hilink.startBluetoothDevicesDiscovery([],false,1);  // 开始扫描
    }

}

// 5.使用mac地址去连接蓝牙设备
function bleConnection(mac){
    console.log('匹配成功，开始尝试连接蓝牙设备...');
    if(isIOS){
        window.hilink.createBLEConnection(mac);
    } else {
        window.hilink.createBleConnection(mac,2); // 指定蓝牙连接方式
    }
    
}

// 蓝牙设备操控：
// 1.监听低功耗蓝牙设备的特征值变化（设备侧变化，app接收变化值）
function onBLECharacteristicValueChange(){
    window.hilink.onBLECharacteristicValueChange ('CharacteristicChangeCallBack');
    window.CharacteristicChangeCallBack = res =>{
        let data = dataChange(res);
        console.log('监听到低功耗蓝牙设备的特征值变化:',data);
        doSomething();
    }
}

// 通知低功耗蓝牙设备的特征值的值 ,返回0表示通知成功。
function notifyBle() {
    console.log('信道建立...')
    try {
        let i = 0;
        var timer = setInterval(() => {
            if(i < notifyUuids.length){
                // console.log(UUID_OR_Mac,  notifyUuids[i].serviceUuid, notifyUuids[i].characteristicUuid);
                var status = window.hilink.notifyBLECharacteristicValueChange(UUID_OR_Mac,  notifyUuids[i].serviceUuid, notifyUuids[i].characteristicUuid, true);
                console.log(notifyUuids[i].sid + " notify status" + status);
                if(status === 0){
                    i++
                }
            }else{
                console.log('notify 成功');
                clearInterval(timer);
            }
        }, 100);
    } catch (error) {
        console.log('notifyBLECharacteristicValueChange error')
    }
}

// 3.对蓝牙设备发送数据 
function writeBLECharacteristicValue(data){
    window.hilink.writeBLECharacteristicValue(UUID_OR_Mac,notifyUuids[0].serviceUuid,notifyUuids[0].characteristicUuid, data,'writeBLECharacteristicValueCallBack');
    window.writeBLECharacteristicValueCallBack = res =>{
        let data = dataChange(res);
        console.log('对蓝牙设备发送数据-开',data)
    }
}
 
function doSomething(){
    console.log('do something...')
}

