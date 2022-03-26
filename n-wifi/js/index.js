var app = document.getElementById('app');
var statusLeft = document.getElementsByClassName("statusLeft")[0];
var statusLeft = document.getElementsByClassName("statusLeft")[0];
var statusRight = document.getElementsByClassName("statusRight")[0];
var iphoneStatus = document.getElementsByClassName("iphoneStatus")[0];
var devTop = document.getElementsByClassName("devTop")[0];
var barLeft = document.getElementsByClassName("barLeft")[0];
//开关动图变量
var switchStatus = true;
var lottieAnimation;
const Range = [0, 229];
StatusOff = 0;
StatusOn = 114;
OpenStart = [36, 114];
CloseStart = [152, 229];
Animation()
updateSwitch()
//开关动图引入
function Animation() {
    lottieAnimation = lottie.loadAnimation({ //初始化
        container: document.getElementById("statusRight"),//在哪个dom容器中生效
        renderer: 'svg',//渲染方式svg
        loop: false,//循环
        autoplay: false,//自动播放
        animationData: isColorWhite ? JSON.parse(switch_dark) : JSON.parse(switch_json),//动画数据
    })
}

//开关动图状态
function updateSwitch() {
    lottieAnimation.goToAndPlay(0);
    range = Range;
    var status = switchStatus ? StatusOn : StatusOff;
    lottieAnimation.goToAndStop(status, true);
}

window.infoCallback = res => {
    let data = dataChange(res)
    console.log('获取设备缓存全集：', data);
    // 根据获取到的数据，更新UI ...
}

window.switchResult = res => {
    let data = dataChange(res)
    console.log('开关状态:', data);
}

// 处理app接收的数据
function dataChange(res) {
    let data = undefined;
    let dataStr = res;
    dataStr = dataStr.replace(/"{/g, '{');
    dataStr = dataStr.replace(/}"/g, '}');
    dataStr = dataStr.replace(/\\|\n|\r|\t|\f|\t/g, '');
    data = JSON.parse(dataStr);
    return data;
}

// APP从后台恢复了
window.onResume = () => {
    console.log('APP从后台恢复到设备页了')
}

// 接收设备上报数据
window.deviceEventCallback = res => {
    updateSwitch();
    let data = dataChange(res);
    console.log('设备上报数据：', data);
    // 根据上报的数据，更新UI
    var start = switchStatus ? OpenStart : CloseStart;
    if (data.sid === 'switch') {
        lottieAnimation.playSegments(start, true);
        statusLeft.innerHTML = data.data.on == 1 ? '已开启' : '已关闭';
    }
}

// 获取设备当前所有状态的数据
function getDevCacheAll() {
    if (window.hilink) {
        window.hilink.getDevCacheAll('0', '', 'infoCallback');
    }
}

// app下发数据给设备
statusRight.addEventListener('click', function (event) {
    let switchvalue;
    let devReport;   // 模拟设备上报数据
    if (switchStatus) {
        switchvalue = 0;
    } else {
        switchvalue = 1;
    }

    let json_data = JSON.stringify({ switch: { on: switchvalue } });

    console.log('APP下发:', json_data)

    if (typeof hilink != "undefined") {
        hilink.setDeviceInfo("0", json_data, "switchResult");
    } else { // 本地模拟指令下发成功
        if (switchvalue) {
            switchStatus = true;
            devReport = '{"sid":"switch","data":{"on":1}}';
        } else {
            switchStatus = false;
            devReport = '{"sid":"switch","data":{"on":0}}';
        }
        // 模拟接收设备上报，自动触发 deviceEventCallback()
        deviceEventCallback(devReport);
    }
    event.stopPropagation();
})

// 退出当前设备页，返回APP设备列表页
barLeft.addEventListener('click', function (event) {
    if (window.hilink) {
        hilink.finishDeviceActivity();
    }
    event.stopPropagation();
})

// 获取手机状态栏高度
function getStatusBarHeight() {
    if (window.hilink) {
        hilink.getStatusBarHeight('BarHeightRes');
    }
    window.BarHeightRes = (res) => {
        let data = dataChange(res).statusBarHeight;
        console.log('手机状态栏高度:', data);
        setStatusBarHeight(data);
    }
}

// 设置状态栏高度
function setStatusBarHeight(num) {
    iphoneStatus.style.height = num / 10 + 'rem';
    devTop.style.height = (5.6 + num / 10) + 'rem';
}

// 隐藏原生标题栏
// if (window.hilink) {
//     try {
//         hilink.setTitleVisible(false);   // ble设备
//     } catch {
//         hilink.setTitleVisible(false, "resultCallback")  // wlan设备

//         window.resultCallback = (res) => {
//             console.log('res:', res);
//         }
//     }
// }


//缩放
var resizeTimer = null;
window.addEventListener('resize', () => {
    console.log('resize');
    if (resizeTimer !== null) {
        clearTimeout(resizeTimer);
        resizeTimer = null;
    }
    resizeTimer = setTimeout(() => {
        getStatusBarHeight();
        getPhoneInfo();
        clearTimeout(resizeTimer);
        resizeTimer = null;
    }, 300);
});

let type = 'android';
let version = '10.0.0';
let isPad = false;
let isPortrait = true;
let isFold = false;
let width = window.innerWidth;
let height = window.innerHeight;
let DPR = window.devicePixelRatio;
let isScreenSpreaded;
let isUaPad;
// desc 获取手机信息,包含系统和屏幕
function getPhoneInfo() {
    try {
        let ua = navigator.userAgent.toLowerCase();
        let reg, matchInfo;
        if (ua.indexOf('like mac os x') > 0) {
            reg = /os [\d._]+/gi;
            type = 'ios';
        } else if (ua.indexOf('android') > 0) {
            reg = /android [\d._]+/gi;
            type = 'android';
        } else if (ua.indexOf('harmony') > 0) {
            reg = /harmony [\d._]+/gi;
            type = 'harmony';
        }
        matchInfo = ua.match(reg);
        version = String(matchInfo).replace(/[^0-9|_.]/gi, '').replace(/_/gi, '.');
        isScreenSpreaded = (window.hilink && window.hilink.isScreenSpreaded && window.hilink.isScreenSpreaded()) || false;
        isUaPad = /(?:ipad|playbook)/.test(ua) || (['android', 'harmony'].indexOf(type) !== -1 && !/(?:mobile)/.test(ua));
        if (ua.indexOf('huawei') !== -1) { // 目前只适配了华为的三款折叠屏手机
            if (ua.indexOf('tah-an00') !== -1
                || ua.indexOf('tah-an00m') !== -1
                || ua.indexOf('tet-an00') !== -1
            ) {
                isFold = true;
            }
        }
        isPortrait = window.screen.width === width && window.screen.height === height;
        isPad = isUaPad;
    } catch (err) {
        console.log('通过 navigator.userAgent 获取系统类型和版本报错,使用默认配置android 和 10');
    }
    console.log(
        // new Time().logTime,
        `获取type为${type + version}, webview为${width}*${height},screenWidth为${window.screen.width}, ${(isPad ? '平板' : '手机') + ',' + (isFold ? '折叠屏' : '非折叠屏')},${isPortrait ? '竖屏' : '横屏'}`
    );
    let browserWidth = document.documentElement.clientWidth;
    document.documentElement.setAttribute('style', `font-size:${(isPad && isPortrait) ? 10 : (browserWidth / 36)}px`);
}
getPhoneInfo()
var appMargin = document.getElementsByClassName("appMargin")[0];
var headerWrap = document.getElementsByClassName("headerWrap")[0];
var statusLeft = document.getElementsByClassName("statusLeft")[0];
var statusRight = document.getElementsByClassName("statusRight")[0];

//根据是否是pad竖屏做适配
if (isPad && isPortrait) {
    //margin改为24px
    appMargin.style.margin = "0 2.4rem";
    headerWrap.style.margin = "0 2.4rem";
    statusLeft.className = "statusLeftIpad";
    statusRight.className = "statusRightIpad";
}

//根据是否是折叠屏做适配
if (isFold && isScreenSpreaded) {
    statusLeft.className = "statusLeftIpad";
    statusRight.className = "statusRightIpad";
}
// 判断当前手机语言
function getAppLanguage() {
    let language = undefined;
    let reg = /^zh-/i;
    let DEFAULT_LANGUAGE = 'zh-CN';

    if (window.hilink && window.hilink.getAppLanguageSync) {
        language = window.hilink.getAppLanguageSync().toLowerCase();
    } else if (navigator && navigator.language) {
        language = navigator.language.toLowerCase();
    } else {
        language = DEFAULT_LANGUAGE;
    }

    let test = reg.test(language);

    if (test) {
        language = 'zh-CN';
    } else if (language === 'bo-cn') { //藏语处理
        language = 'zh-CN';
    } else { //非中文或藏语，则均默认为英文
        language = 'en-UK';
    }
    console.log('当前语言:', language);
    return language;
}

//判断是安卓还是iOS
var isColorWhite = true;
function getVersionOs() {
    if (type === 'ios') {
        try {
            window.hilink.getDarkMode('resCallback');
            window.resCallback = res => {
                if (res == 2) {
                    isColorWhite = true;
                    app.style.background = 'black';
                    app.classList.add("dark");

                } else {
                    isColorWhite = false;
                    app.classList.remove("dark")
                    app.style.background = '#f1f3f5';
                }
            };
        } catch (err) {
            console.log('getDarkMode-------------', err);
        }
    } else {
        getDarkMode();
    };
}
getVersionOs();
// 暗黑模式适配处理
function getDarkMode() {
    if (window.hilink) {
        var dark = hilink.getDarkMode();
        if (dark == 2) {//暗黑模式
            isColorWhite = true;
            app.style.background = 'black';
            app.classList.add("dark");
        } else {
            isColorWhite = false;
            app.classList.remove("dark")
            app.style.background = '#f1f3f5';
        }
    }
}

//暗黑模式标题颜色

var bg = isColorWhite ? '#ffffff' : '#000000';
if (window.hilink) {
    window.hilink.modifyTitleBar(isColorWhite, bg, 'setTextresultCallback');
    window.setTextresultCallback = res => {
        let data = JSON.parse(res);
        console.log('更改标题颜色', data);
    };
}

getAppLanguage();      // 获取当前系统语言
getStatusBarHeight();  // 获取手机状态栏高度
getDevCacheAll();      // 获取设备当前所有状态的数据
