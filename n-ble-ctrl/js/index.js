var app = document.getElementById('app');
// app接收数据的处理
function dataChange(res) {
    let data = undefined;
    let dataStr = res;
    dataStr = dataStr.replace(/"{/g, '{');
    dataStr = dataStr.replace(/}"/g, '}');
    dataStr = dataStr.replace(/\\|\n|\r|\t|\f|\t/g, '');
    data = JSON.parse(dataStr);
    return data;
}

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

// 设定状态栏高度
var iphoneStatus = document.getElementsByClassName("iphoneStatus")[0];
var devTop = document.getElementsByClassName("devTop")[0];
function setStatusBarHeight(num) {
    iphoneStatus.style.height = num + 'px';
    devTop.style.height = (56 + num) + 'px';
}
getStatusBarHeight();


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
    console.log("browserWidth", browserWidth);
    document.documentElement.setAttribute('style', `font-size:${(isPad && isPortrait) ? 10 : (browserWidth / 36)}px`);
}
getPhoneInfo()

var appMargin = document.getElementsByClassName("appMargin")[0];
var headerWrap = document.getElementsByClassName("headerWrap")[0];
var devStatus = document.getElementsByClassName("devStatus")[0];
var statusLeft = document.getElementsByClassName("statusLeft")[0];

//根据是否是pad竖屏做适配
if (isPad && isPortrait) {
    //margin改为24px
    appMargin.style.margin = "0 2.4rem";
    headerWrap.style.margin = "0 2.4rem";
    statusLeft.style.width = "calc(100%/3)";
    statusLeft.style.left = "0";
    statusLeft.style.textAlign = "center";
}


// isScreenSpreaded=true;isFold=true;
//根据是否是折叠屏做适配
if (isFold && isScreenSpreaded) {
    document.documentElement.setAttribute('style', `font-size:10px`);
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

var isColorWhite;
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

//暗黑模式标题颜色
var bg = isColorWhite ? '#ffffff' : '#000000';
if (window.hilink) {
    window.hilink.modifyTitleBar(isColorWhite, bg, 'setTextresultCallback');
    window.setTextresultCallback = res => {
        let data = JSON.parse(res);
        console.log('更改标题颜色', data);
    };
}

// 退出当前设备页，返回APP设备列表页
var barLeft = document.getElementsByClassName("barLeft")[0];
barLeft.addEventListener('click', function (event) {
    if (window.hilink) {
        hilink.finishDeviceActivity();
    }
    event.stopPropagation();
})

