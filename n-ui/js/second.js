var second = document.getElementById('second');
// app接收数据的处理
function dataChange(res) {
    let data = undefined;
    let dataStr = res;
    dataStr = dataStr.replace(/"{/g, '{');
    dataStr = dataStr.replace(/}"/g, '}');
    dataStr = dataStr.replace(/\\|\n|\r|\t|\f|\t/g, '');
    data = JSON.parse(dataStr);
    console.log("数据", data);
    return data;
}

var seIphone = document.getElementsByClassName("seIphone")[0];

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

getStatusBarHeight();

// 设定状态栏高度
function setStatusBarHeight(num) {
    seIphone.style.height = num + 'px';
}

//返回上一页
var second = document.getElementById('second');


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
// desc 获取手机信息,包含系统和屏幕
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
        console.log("ua", ua);
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
        //此页面paid和折叠屏无区分，做相同处理
        if (isFold) {
            isPortrait = isFold;
            isPad = isScreenSpreaded;
        } else {
            isPortrait = window.screen.width === width && window.screen.height === height;
            isPad = isUaPad;
        }
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
var revocation = document.getElementsByClassName("revocation")[0];
var stopAppear = document.getElementsByClassName("stopAppear")[0];
var sContent = document.getElementsByClassName("sContent")[0];

// 根据是否是pad竖屏做适配
if (isPad && isPortrait) {
    revocation.style.width = "calc(100vw - (100vw - 1.2rem *7) / 8 * 5 - 1.2rem * 6)";
    stopAppear.style.bottom = '50%'
    stopAppear.style.transform = 'translate(-50%,50%)'
    sContent.style.width = "calc((100vw - 1.2rem)/8 *6)"
    sContent.style.margin = "0 auto"
    if (window.screen.width / height > 3 / 4) {
        stopAppear.style.width = "calc(100vw - (100vw - 1.2rem *7) / 8 * 4 - 1.2rem * 6)";
    } else if (window.screen.width / height <= 3 / 4) {
        stopAppear.style.width = "calc(100vw - (100vw - 1.2rem * 7) / 8 * 3 - 1.2rem * 5)";
    }
}
// 判断是安卓还是iOS
var isColorWhite;
function getVersionOs() {
    if (type === 'ios') {
        try {
            window.hilink.getDarkMode('resCallback');
            window.resCallback = res => {
                if (res == 2) {
                    isColorWhite = true;
                    second.style.background = 'black';
                    second.classList.add("dark");
                } else {
                    isColorWhite = false;
                    second.classList.remove("dark")
                    second.style.background = '#f1f3f5';
                }
            };
        } catch (err) {
            console.log('getDarkMode-------------', err);
        }
    } else {
        getDarkMode();
    }
}
getVersionOs();


// 暗黑模式适配处理
function getDarkMode() {
    if (window.hilink) {
        var dark = hilink.getDarkMode();
        if (dark == 2) {//暗黑模式
            isColorWhite = true;
            second.style.background = 'black';
            second.classList.add("dark");
        } else {
            isColorWhite = false;
            second.classList.remove("dark");
            second.style.background = '#f1f3f5';
        }
    }
}
getDarkMode();

//暗黑模式标题颜色

var bg = isColorWhite ? '#ffffff' : '#000000';
if (window.hilink) {
    console.log('bg', bg);
    console.log('更改标题颜色11', isColorWhite);
    window.hilink.modifyTitleBar(isColorWhite, bg, 'setTextresultCallback');
    window.setTextresultCallback = res => {
        let data = JSON.parse(res);
        console.log('更改标题颜色', data);
    };
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
getAppLanguage()

// 取消授权弹窗
var revocation = document.getElementsByClassName("revocation")[0];
var stopPopup = document.getElementsByClassName("stopPopup")[0];
var backgroundColor = document.getElementsByClassName("backgroundColor")[0];
var stopLeft = document.getElementsByClassName("stopFn")[0];
var stopRight = document.getElementsByClassName("stopFn")[1];



revocation.addEventListener('click', function (event) {
    stopPopup.style.display = 'block';
    backgroundColor.style.display = 'block';
    event.stopPropagation();
})


stopLeft.addEventListener('click', function (event) {
    stopPopup.style.display = 'none';
    backgroundColor.style.display = 'none';
    event.stopPropagation();
})


stopRight.addEventListener('click', function (event) {
    localStorage.setItem("devId", '');
    if (window.hilink) {
        hilink.finishDeviceActivity();
    }
    event.stopPropagation();
})


var seBack = document.getElementsByClassName("seBack")[0];

seBack.addEventListener('click', function (event) {
    window.history.go(-1);
    event.stopPropagation();
})









