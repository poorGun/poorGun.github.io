var app = document.getElementById('app');
var backgroundColor = document.getElementsByClassName("backgroundColor")[0];
var appMargin = document.getElementsByClassName("appMargin")[0];
var headerWrap = document.getElementsByClassName("headerWrap")[0];

var statusLeft = document.getElementsByClassName("statusLeft")[0];
var statusMiddle = document.getElementsByClassName("statusMiddle")[0];
var statusRight = document.getElementsByClassName("statusRight")[0];
var modeWrap = document.getElementsByClassName("modeWrap")[0];
var iphone = document.getElementsByClassName("iphone")[0];


var spinner = document.getElementsByClassName("spinner")[0];
var spinnerWrap = document.getElementsByClassName("spinnerWrap")[0];
var spinnerItem = document.getElementsByClassName("spinnerItem")[0];

var singleList = document.getElementsByClassName("singleList")[0];
var modeList = document.getElementsByClassName("modeList")[0];

var fnbtnLeft = document.getElementsByClassName("fnbtn")[0];
var fnbtnRight = document.getElementsByClassName("fnbtn")[1];

var iphoneStatus = document.getElementsByClassName("iphoneStatus")[0];
var devTop = document.getElementsByClassName("devTop")[0];

var barLeft = document.getElementsByClassName("barLeft")[0];

var statement = document.getElementsByClassName("statement")[0];
var isColorWhite = false;
var statementWrap = document.getElementsByClassName("statementWrap")[0];

var padThreeItem1 = document.getElementsByClassName("padThreeItem1")[0];
var padThreeItem2 = document.getElementsByClassName("padThreeItem2")[0];
var padThreeItem3 = document.getElementsByClassName("padThreeItem3")[0];
var padTwoItem1 = document.getElementsByClassName("padTwoItem1")[0];
var padTwoItem2 = document.getElementsByClassName("padTwoItem2")[0];

//开关动图变量
var lottieAnimation;
const Range = [0, 229];
StatusOff = 0;
StatusOn = 114;
OpenStart = [36, 114];
CloseStart = [152, 229];

Animation()
//开关动图引入
function Animation() {
    lottieAnimation = lottie.loadAnimation({ //初始化
        container: document.getElementById("statusRight"),//在哪个dom容器中生效
        renderer: 'svg',//渲染方式svg
        loop: false,//循环
        autoplay: false,//自动播放
        animationData: isColorWhite ? JSON.parse(switch_dark) : JSON.parse(switch_json),//动画数据
    })
    lottieAnimation.goToAndStop(StatusOn, true);
}

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
function setStatusBarHeight(num) {
    iphoneStatus.style.height = num / 10 + 'rem';
    devTop.style.height = (5.6 + num) / 10 + 'rem';
}
getStatusBarHeight();

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

//根据是否是pad竖屏做适配
if (isPad && isPortrait) {
    iphone.getAttribute("class").replace("iphone", "");
    statusLeft.className = "statusLeftIpad";
    statusMiddle.style.width = "calc(100%/3)";
    statusRight.className = "statusRightIpad";
    console.log("width / height", width / height, 3 / 4);
    statementWrap.style.margin = '0 auto'
    modeWrap.style.position = 'absolute'
    modeWrap.style.top = '50%'
    modeWrap.style.left = '50%'
    modeWrap.style.right = '50%'
    modeWrap.style.transform = 'translate(-50%, -50%)'
    padThreeItem1.style.width = 'calc((100% - 4.8rem)/3)';
    padThreeItem1.style.marginLeft = '0'
    padThreeItem2.style.width = 'calc((100% - 4.8rem)/3)';
    padThreeItem2.style.marginLeft = '1.2rem'
    padThreeItem3.style.width = 'calc((100% - 4.8rem)/3)';
    padThreeItem3.style.marginLeft = '1.2rem'
    padTwoItem1.style.width = 'calc((100% - 3.6rem)/2)'
    padTwoItem1.style.marginLeft = '0'
    padTwoItem2.style.width = 'calc((100% - 3.6rem)/2)'
    padTwoItem2.style.marginLeft = '1.2rem'
    appMargin.style.margin = "0 2.4rem";
    headerWrap.style.margin = "0 2.4rem";
    if (width / height > 3 / 4) {
        modeWrap.style.width = "calc(100vw - (100vw - 1.2rem *9) / 8 * 4 - 1.2rem * 6)"
        statementWrap.style.width = "calc(100vw - (100vw - 1.2rem *9) / 8 * 4 - 1.2rem * 6)"
    } else if (width / height <= 3 / 4) {
        modeWrap.style.width = "calc(100vw - (100vw - 1.2rem * 9) / 8 * 3 - 1.2rem * 5)"
        statementWrap.style.width = "calc(100vw - (100vw - 1.2rem * 9) / 8 * 3 - 1.2rem * 5)"

    }
}
//根据是否是折叠屏做适配
if (isFold && isScreenSpreaded) {
    appMargin.style.margin = "0 1.2rem";
    headerWrap.style.margin = "0 1.2rem";
    iphone.getAttribute("class").replace("iphone", "");
    statusLeft.className = "statusLeftIpad";
    statusMiddle.style.width = "calc(100%/3)";
    statusRight.className = "statusRightIpad";
    if (window.screen.width / window.screen.height > 3 / 4) {
        modeWrap.style.width = "calc(100vw - (100vw - 1.2rem *9) / 8 * 4 - 1.2rem * 6)"
    } else if (window.screen.width / window.screen.height <= 3 / 4) {
        modeWrap.style.width = "calc(100vw - (100vw - 1.2rem * 9) / 8 * 3 - 1.2rem * 5)"
    }
}
// 暗黑模式适配处理
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
    }
};

getVersionOs()
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

// 列表弹窗
spinner.addEventListener('click', function (event) {
    let val = spinnerWrap.style.display;
    if (val === 'block') {
        spinnerWrap.style.display = 'none';
    } else {
        spinnerWrap.style.display = 'block';
    }
    event.stopImmediatePropagation();
})

spinnerWrap.addEventListener('click', function (event) {
    spinnerWrap.style.display = 'none';
    event.stopPropagation(); // 阻止事件冒泡
})

singleList.addEventListener('click', function (event) {
    backgroundColor.style.display = 'block';
    modeList.style.display = 'block';
    if (isPad && isPortrait) {
        modeList.style.bottom = '0';
        modeList.style.height = '100%';
    }
    event.stopPropagation();
})

fnbtnLeft.addEventListener('click', function (event) {
    backgroundColor.style.display = 'none';
    modeList.style.display = 'none';
    event.stopPropagation();
})

fnbtnRight.addEventListener('click', function (event) {
    backgroundColor.style.display = 'none';
    modeList.style.display = 'none';
    event.stopPropagation();
})

app.addEventListener('click', function (event) {
    spinnerWrap.style.display = 'none';
    event.stopPropagation();
})

// 退出当前设备页，返回APP设备列表页
barLeft.addEventListener('click', function (event) {
    if (window.hilink) {
        hilink.finishDeviceActivity();
    }
    event.stopPropagation();
})


// 隐私声明弹窗处理
var stateLeft = document.getElementsByClassName("stateFn")[0];
var stateRight = document.getElementsByClassName("stateFn")[1];
var statementPopup = document.getElementsByClassName("statementPopup")[0];

var deviceId = undefined;
var isAgree = localStorage.getItem("devId");

if (window.hilink) {
    window.hilink.getDevInfoAll('0', '', 'getDevInfoAllResult');
    window.getDevInfoAllResult = (res) => {
        deviceId = dataChange(res).devId;
        console.log('设备devId:', deviceId);

        if (deviceId === isAgree) {
            statementPopup.style.display = 'none';
            backgroundColor.style.display = 'none';
        } else {
            backgroundColor.style.display = 'block';
            statementPopup.style.display = 'block';
            if (isPad && isPortrait) {
                statementPopup.style.bottom = '50%';
                statementPopup.style.transform = 'translateY(50%)';
            }
        }
    }
}


stateRight.addEventListener('click', function (event) {
    localStorage.setItem("devId", deviceId);
    statementPopup.style.display = 'none';
    backgroundColor.style.display = 'none';
    event.stopPropagation();
})


stateLeft.addEventListener('click', function (event) {
    if (window.hilink) {
        hilink.finishDeviceActivity();
    }
    event.stopPropagation();
})


// 查看隐私协议&取消协议
var statement = document.getElementsByClassName("statement")[0];

statement.addEventListener('click', function (event) {

    window.location.href = "second.html";
    event.stopPropagation();
})

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
