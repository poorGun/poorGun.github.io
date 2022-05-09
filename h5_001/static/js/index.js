/* 蓝牙方案模板代码勿动 begin*/
window.onload = function() {
    // 初始化蓝牙模块
    init()
    registerNotifyCallBack("NotifyCallBack")
    // refreshStyle()
    //设置弹出框宽度
    document.querySelector(".spinnerWrap").style.width = document.querySelector(".spinner_cd").clientWidth+"px"
    rang = document.querySelector(".rang")
    slider = document.querySelector(".slider")
    stripLeft = document.querySelector(".stripLeft")
    target = rang.offsetWidth
}



var LINK_STATUS = {
    CONNECT : '1',
    CONNECTINT : '2',
    DISCONNECT : '3'
}

// 蓝牙连接状态
var linkStatus = LINK_STATUS.DISCONNECT   //LINK_STATUS
var status_title = ""   //开关标题
/* 蓝牙方案模板代码勿动 end*/
var title_disconnect = ""
var title_connecting = ""
var title_work = ""
var title_pause = ""
// /** 需要根据具体UI修改 **/
// 工作状态判断
var workstatus = ''; //0,开 ； 1关
//展示区数据
var work_time = ""; //工作时长
var battery = ""; //电量
var speed = ""; //转速
var leftTimeUnit = ""
//控制区数据
var warmOn = 0; //加热模式  0,开;1，关

//倒计时 格式 00:00 分钟
// var listName = "" //倒计时
// var sliderStatus = ''; //挡位

var power_img = "" 

// var timer_img = "./static/img/ic_countdown_blue.png"
var timer_img = "./static/img/ic_daojishi_on.png"
var timer_img_disable = ""
var warm_img = ""
var level_unit = ""
var warm_enable = ""
var warm_disable = ""
var pause_img = ""
var loading_img = ""
var time_left = 0
// 倒计时列表弹窗
var spinnerWrap = document.getElementsByClassName("spinnerWrap")[0];
var gears = []
var CHINES = {
    RELINK : "重新连接",
    MIN : "分钟",
    WORK_TIME : "工作时长",
    BATTERY_INFO : "剩余电量",
    SPEED_ROUND : "转/分",
    SPEED_INFO : "转速",
    WARM_MODE : "加热模式",
    TIME_LEFT : "倒计时",
    STRONG_LEVEL : "按摩力度",
    LEVEL_UNIT : "档",
}

var EN = {
    RELINK : "Relink",
    MIN : "min",
    WORK_TIME : "Working Time",
    BATTERY_INFO : "Battery",
    SPEED_ROUND : "rpm",
    SPEED_INFO : "Speed",
    WARM_MODE : "Heating",
    TIME_LEFT : "Timer",
    STRONG_LEVEL : "Strength",
    LEVEL_UNIT : "tier"
}

// 按摩力度——滑动条
let rang = document.querySelector(".rang")
let slider = document.querySelector(".slider")
let stripLeft = document.querySelector(".stripLeft")
let target = rang.offsetWidth
let sliderStatusInfo
window.addEventListener('resize', function(e) {
    target = rang.offsetWidth //滑动条滑动的最大距离
});

function moveSlider(e) {
    let part = target / 5
    if (e.changedTouches[0].pageX - rang.offsetLeft < target && e.changedTouches[0].pageX - rang.offsetLeft > 0) {
        resetSlider(Math.floor((e.changedTouches[0].pageX - rang.offsetLeft) / (target / 6)))
        // stripLeft.style.width = (part * Math.floor((e.changedTouches[0].pageX - rang.offsetLeft) / (target / 6))) + "px"
        // slider.style.left = (part * Math.floor((e.changedTouches[0].pageX - rang.offsetLeft) / (target / 6))) - 12 + "px"
        // sliderStatusInfo = Math.floor((e.changedTouches[0].pageX - rang.offsetLeft) / (target / 6))
        // document.getElementById("massagelevel").innerHTML = Math.floor((e.changedTouches[0].pageX - rang.offsetLeft) / (target / 6)) + level_unit
    }
}

function SetLanguage() {
    let language;
	if (window.hilink && hilink.getAppLanguageSync) {
		language = hilink.getAppLanguageSync()
	}
    if (language == "en-UK") {
        this.document.getElementById("relink").innerHTML = EN.RELINK
        this.document.getElementById("min").innerHTML = EN.MIN
        this.document.getElementById("workTime").innerHTML = EN.WORK_TIME
        this.document.getElementById("batteryinfo").innerHTML = EN.BATTERY_INFO
        this.document.getElementById("min2").innerHTML = EN.SPEED_ROUND
        this.document.getElementById("speedinfo").innerHTML = EN.SPEED_INFO
        this.document.getElementById("warm").innerHTML = EN.WARM_MODE
        this.document.getElementById("classctr").innerHTML = EN.TIME_LEFT
        this.document.getElementById("massage").innerHTML = EN.STRONG_LEVEL
        level_unit = EN.LEVEL_UNIT
		time_unit_min = EN.MIN
        title_work = "Working"
        title_pause = "Paused"
        title_connecting = "Connecting"
        title_disconnect = "Disconnected"
        leftTimeUnit = "min"
		switch_on = "On"
        if (gears[0] == "Off") {
            // 语言环境没有变，啥都不干
        } else {
            gears = ["Off", "5min", "10min", "15min"];
            // let content = ""
            // for (let i = 0; i < gears.length; i++) {
            //     content = content + "<li  class='spinnerList'>" + gears[i] + "</li>";    
            // }
            // document.getElementById("gearsList").innerHTML = content

            //获取所有spinnerList节点
            var spinnerList = document.getElementsByClassName("spinnerList")
            for (let i = 0; i < spinnerList.length; i++) {
                (function(n) {
                    spinnerList[i].innerHTML = gears[i]
                    spinnerList[i].onclick = function() {
                        // leaveTime( i * 5)
                        sendBle(MESSAGE_SEND.SET_TIME, '{"cmd":"84","value":"0' + i + '"}', "sendMsgCallback")
                        // spinnerWrap.style.display = 'none'
                    }
                })(i)
            }
        }
    } else {
        this.document.getElementById("relink").innerHTML = CHINES.RELINK
        this.document.getElementById("min").innerHTML = CHINES.MIN
        this.document.getElementById("workTime").innerHTML = CHINES.WORK_TIME
        this.document.getElementById("batteryinfo").innerHTML = CHINES.BATTERY_INFO
        this.document.getElementById("min2").innerHTML = CHINES.SPEED_ROUND
        this.document.getElementById("speedinfo").innerHTML = CHINES.SPEED_INFO
        this.document.getElementById("warm").innerHTML = CHINES.WARM_MODE
        this.document.getElementById("classctr").innerHTML = CHINES.TIME_LEFT
        this.document.getElementById("massage").innerHTML = CHINES.STRONG_LEVEL
        level_unit = CHINES.LEVEL_UNIT
		time_unit_min = CHINES.MIN
        title_work = "工作中"
        title_pause = "已暂停"
        title_connecting = "连接中"
        title_disconnect = "未连接"
        leftTimeUnit = "分钟"
		switch_on = "已开启"
        if (gears[0] == "关闭") {
            // 语言环境没有变，啥都不干
        } else {
            gears = ["关闭", "5分钟", "10分钟", "15分钟"];
            // let content = ""
            // for (let i = 0; i < gears.length; i++) {
            //     content = content + "<li  class='spinnerList'>" + gears[i] + "</li>";    
            // }
            // document.getElementById("gearsList").innerHTML = content

            //获取所有spinnerList节点
            //动态增加列表标签
            var spinnerList = document.getElementsByClassName("spinnerList")
            
            for (let i = 0; i < spinnerList.length; i++) {
                (function(n) {
                    spinnerList[i].innerHTML = gears[i]
                    spinnerList[i].onclick = function() {
                        // leaveTime( i * 5)
                        sendBle(MESSAGE_SEND.SET_TIME, '{"cmd":"84","value":"0' + i + '"}', "sendMsgCallback")
                        // spinnerWrap.style.display = 'none'
                    }
                })(i)
            }
            
        }
    }
}

// /* 需要根据具体UI修改 */
window.sendMsgCallback = res => {
	// 解析res 中的数据
	refreshUI(res)
} //不动  

window.NotifyCallBack = res => {
	refreshNotify(res)
}

// 点击重新连接的时候调用这个方法
function resetSlider(index) {
	let part = (target - 16) / 5
	stripLeft.style.width = (part * index + 8) + "px"
	slider.style.left = (part * index) + "px"
	sliderStatusInfo = index
	document.getElementById("massagelevel").innerHTML = index + level_unit
}

// 连接蓝牙设备
function link() {
	if (linkStatus == LINK_STATUS.DISCONNECT) {}
	connectDevice();
}


function refreshUI(res) {
	refreshStyle()
	// if(res.device_ret_val != BT_RETURN_RESULT.SUCCESS) {
	//     //如果没有发送成功 刷新seekbar还有时间
	//     switch(res.data.sourceData.cmd) {
	//         case MESSAGE_SEND.SPEED_LEVEL:
	//             resetSlider(sliderStatusInfo)
	//             break;
	//     }
	//     resetSlider()
	// }
	if (res.data.sourceData.cmd == MESSAGE_SEND.SET_TIME) {
		closeMenu()
	}
	 switch(res.err_code) {
		 case ERR_CODE.ERR_CODE_SEND_SUCCESS:
				if(res.device_ret_val == BT_RETURN_RESULT.FAIL) {break;}
				switch(res.data.sourceData.cmd) {
					case MESSAGE_SEND.WORK_STATUS:
						switch(res.data.sourceData.value) {
							case "01":
								workstatus = 0
								document.getElementById("power_img").setAttribute('src', power_img);
								break;
							case "00":
								workstatus = 1
								document.getElementById("power_img").setAttribute('src', pause_img);
								break;
							}
							// 根据连接状态以及开关状态，初始化不同的界面
							if (workstatus == 0) {
								work()
							} else {
								pause()
							}
							this.document.getElementById("statustitle").innerHTML = status_title
						break;
					case MESSAGE_SEND.SPEED_LEVEL:
						// sliderStatusInfo = Number(res.data.sourceData.value)
						resetSlider(Number(res.data.sourceData.value))
						break;
					case MESSAGE_SEND.WARM:
						switch(res.data.sourceData.value) {
							case "01":
								// 启动加热成功
								warmOn = 0
								document.getElementById("warm_img").setAttribute('src', warm_enable);
								document.getElementById("warmState").innerHTML = switch_on
								break;
							case "00":
								// 停止加热成功
								warmOn = 1
								document.getElementById("warm_img").setAttribute('src', warm_disable);
								document.getElementById("warmState").innerHTML = ''
								break;
						}
					break;
					case MESSAGE_SEND.SET_TIME:
						switch(res.data.sourceData.value) {
							case "00":
								time_left = 0
								leaveTime(0)
								break;
							case "01":
								time_left = 1
								leaveTime(5 * 60)
								break;
							case "02":
								time_left = 2
								leaveTime(10 * 60)
								break;
							case "03":
								time_left = 3
								leaveTime(15 * 60)
								break;
							}
					break;
				}
			break;
		default:
			return;
	}

}

function refreshNotify(res) {
	if(res.cmd == "51") {
		switch(Number(res.runStatus)) {
			case 1:
				workstatus = 0
				document.getElementById("power_img").setAttribute('src', power_img);
				work()
				this.document.getElementById("statustitle").innerHTML = status_title
				break;
			case 0:
				workstatus = 1
				document.getElementById("power_img").setAttribute('src', pause_img);
				pause()
				this.document.getElementById("statustitle").innerHTML = status_title
				break;
		}
		switch(Number(res.heatStatus)) {
			case 1:
				// 启动加热成功
				if (warmOn != 0) {
					warmOn = 0
					document.getElementById("warm_img").setAttribute('src', warm_enable);
					document.getElementById("warmState").innerHTML = switch_on;
				}
				break;
			case 0:
				// 停止加热成功
				if(warmOn != 1) {
					warmOn = 1
					document.getElementById("warm_img").setAttribute('src', warm_disable);
					document.getElementById("warmState").innerHTML = '';
				}
				break;
		}

		//转速
		document.getElementById("speed").innerHTML = res.speed
		if (res.speed >= 10000 && (normalPhone || landPad)) {
			document.getElementById("speed").style.fontSize = '2.0rem'
		} else {
			document.getElementById("speed").style.fontSize = '2.4rem'
		}

		if (sliderStatusInfo != Number(res.speedMode)) {
			resetSlider(Number(res.speedMode))
		}

		document.getElementById("battery").innerHTML = res.power

		document.getElementById("work_time").innerHTML = res.runTime

		//刷新倒计时
		time_left = Number(result.timeSet)
		leaveTime(Number(res.surplusTime))

		return
	}
}

let spreadedFold = false, portPad = false, landPad = false, normalPhone = false
function refreshStyle() {
	if (isFold && isScreenSpreaded) {
		spreadedFold = true
		app.classList.add("spreadedFold");
		app.classList.remove("portPad");
		app.classList.remove("landPad");
		app.classList.remove("normalPhone");
	} else if ((isPad && isPortrait) || width >= 600) {
		portPad = true
		app.classList.remove("spreadedFold");
		app.classList.add("portPad");
		app.classList.remove("landPad");
		app.classList.remove("normalPhone");
	} else if (isPad) {
		landPad = true
		app.classList.remove("spreadedFold");
		app.classList.remove("portPad");
		app.classList.add("landPad");
		app.classList.remove("normalPhone");
	} else {
		normalPhone = true
		app.classList.remove("spreadedFold");
		app.classList.remove("portPad");
		app.classList.remove("landPad");
		app.classList.add("normalPhone");
	}
	
	// alert(isFold + '/' + isScreenSpreaded + '/' + isPad + '/' + isPortrait + '\n' +
	//       spreadedFold + '/' + portPad + '/' + landPad + '/' + normalPhone + '\n'
	//       );
	// alert(window.devicePixelRatio + '\n' +
	// 			window.screen.width + ',' + window.screen.height + '\n' +
	// 			window.screen.availWidth + ',' + window.screen.availHeight + '\n' +
	// 			'=================\n' +
	// 			window.outerWidth + ',' + window.outerHeight + '\n' +
	// 			window.innerWidth + ',' + window.innerHeight + '\n' +
	// 			'=================\n' +
	// 			document.documentElement.scrollWidth + ',' + document.documentElement.scrollHeight + '\n' +
	// 			document.documentElement.offsetWidth + ',' + document.documentElement.offsetHeight + '\n' +
	// 			document.documentElement.clientWidth + ',' + document.documentElement.clientHeight + '\n'
	// 			);
	
	// 判断黑夜模式，加上黑夜的样式
	if (window.hilink) {
		var dark = hilink.getDarkMode();
		
		const isDarkMode = (dark === 2)
		const textColor = isDarkMode ? '#ffffff' : '#000000'
		hilink.modifyTitleBar(isDarkMode, textColor, 'setTextresultCallback')
		if (dark == 2) { 
			//暗黑模式
			app.classList.add("dark");
			// hilink.changeTitleStyle(2);
			pause_img = "./static/img/work_dark.svg"
			power_img = "./static/img/pause_dark.svg"
			loading_img = "./static/img/loading_dark.png"
			warm_disable = "./static/img/dark/public/ic_enum_off.png"
			warm_enable = "./static/img/ic_pattern_on.png"
			// timer_img_disable = "./static/img/dark/public/ic_countdown.svg"
			timer_img_disable = "./static/img/dark/public/ic_daojishi_off.png"
		} else {
			app.classList.remove("dark");
			// hilink.changeTitleStyle(2);
			pause_img = "./static/img/work_light.svg"
			power_img = "./static/img/pause_light.svg"
			loading_img = "./static/img/loading.png"
			warm_disable = "./static/img/ic_enum_off.png"
			warm_enable = "./static/img/ic_pattern_on.png"
			// timer_img_disable = "./static/img/light/ic_countdown.svg"
			timer_img_disable = "./static/img/ic_daojishi_off.png"
		}
	}
	// 根据连接状态以及开关状态，初始化不同的界面
	switch(linkStatus) {
		case LINK_STATUS.CONNECT:
			if (workstatus == 0) {
				work()
			} else {
				pause()
			}
			break;
		case LINK_STATUS.CONNECTINT:
			connecting()
			break;
		case LINK_STATUS.DISCONNECT:
			disconnect()
			break;
	}
	this.document.getElementById("statustitle").innerHTML = status_title
}

//disconnect状态 这里修改值
function disconnect() {
	status_title = title_disconnect
	document.getElementById("work_time").innerHTML = "--"
	document.getElementById("speed").innerHTML = "--"
	document.getElementById("speed").style.fontSize = '2.4rem'
	document.getElementById("battery").innerHTML = "--"
	warmOn = 1
	// listName = ""
	mode_disconnect()
}
// console.log(document.querySelector(".spinner_cd").clientWidth,"width")  
// 这里修改风格，以及监听事件，不改值
function mode_disconnect() {
	app.classList.add("disconnect");
	document.getElementById("relink").style.display = "block";
	document.getElementById("power_img").style.display = "none";
	//加热模式,除了颜色，右侧图片，还有点击监听
	document.getElementById("warm_ctrl").removeEventListener('click', sendCommandWarm)
	document.getElementById("warm_img").setAttribute('src', warm_disable);
	document.getElementById("warmState").innerHTML = '';
		// 倒计时，除了颜色，右侧图片，还有点击监听
	document.querySelector(".spinner_cd").removeEventListener("click", ShowMenu);
	// 滑动条不能点击
	resetSlider(0)
	document.querySelector(".rang").classList.add("disable");
	// rang.removeEventListener("click", clickSlider)
	rang.removeEventListener("touchmove", moveSlider)
	rang.removeEventListener("touchend", sendSpeedCmd)
	leaveTime(0)
	document.getElementById("listName").innerHTML = '';
	document.getElementById("massagelevel").style.display = "none";
	spinnerWrap.style.display = 'none';
}

function connecting() {
	status_title = title_connecting
	document.getElementById("work_time").innerHTML = "--"
	document.getElementById("speed").innerHTML = "--"
	document.getElementById("speed").style.fontSize = '2.4rem'
	document.getElementById("battery").innerHTML = "--"
	warmOn = 1
	// listName = ""
	mode_connecting()
}

function mode_connecting() {
	app.classList.add("disconnect");
	// app.classList.add("disabled");
	document.getElementById("relink").style.display = "none";
	document.getElementById("power_img").setAttribute('src', loading_img);
	document.getElementById("power_img").style.display = "block";
	//加热模式,除了颜色，右侧图片，还有点击监听
	document.getElementById("warm_ctrl").removeEventListener('click', sendCommandWarm)
	document.getElementById("warm_img").setAttribute('src', warm_disable);
	document.getElementById("warmState").innerHTML = '';
		// 倒计时，除了颜色，右侧图片，还有点击监听
	document.querySelector(".spinner_cd").removeEventListener("click", ShowMenu);

	// 滑动条不能点击
	resetSlider(0)
	document.querySelector(".rang").classList.add("disable");
	// rang.removeEventListener("click", clickSlider)
	rang.removeEventListener("touchmove", moveSlider)
	rang.removeEventListener("touchend", sendSpeedCmd)
	document.getElementById("listName").innerHTML = ''
	document.getElementById("massagelevel").style.display = "none";
}

function pause() {
	status_title = title_pause
	warmOn = 1
	mode_pause()
}
// 暂停状态，这里修改样式和模式
function mode_pause() {
	app.classList.add("disabled");
		//加热模式,除了颜色，右侧图片，还有点击监听
	document.getElementById("relink").style.display = "none";
	document.getElementById("power_img").style.display = "block";
	document.getElementById("power_img").setAttribute('src', pause_img);
	// 倒计时不显示，取消倒计时点击事件
	document.getElementById("gearsList").style.display = "none"
	document.querySelector(".spinner_cd").removeEventListener("click", ShowMenu);
	leaveTime(0)
	document.getElementById("listName").innerHTML = '';

	// 取消加热点击事件
	document.getElementById("warm_ctrl").removeEventListener('click', sendCommandWarm)
	document.getElementById("warm_img").setAttribute('src', warm_disable);
	document.getElementById("warmState").innerHTML = '';
	// 档位，除了颜色，右侧图片，还有点击监听
	document.getElementById("massagelevel").style.display = "none";
	document.querySelector(".rang").classList.add("disable");
	resetSlider(0)
	rang.removeEventListener("touchmove", moveSlider)
	rang.removeEventListener("touchend", sendSpeedCmd)
}

// 工作状态，这里修改值
function work() {
	status_title = title_work
	mode_work()
}

// 工作状态，这里修改样式和模式
function mode_work() {
	app.classList.remove("disabled")
	app.classList.remove("disconnect")
		//加热模式,除了颜色，右侧图片，还有点击监听
	document.querySelector(".rang").classList.remove("disable");
	document.getElementById("relink").style.display = "none";
	document.getElementById("power_img").style.display = "block"
	document.getElementById("power_img").setAttribute('src', power_img);
		// 倒计时，除了颜色，右侧图片，还有点击监听
	document.querySelector(".spinner_cd").addEventListener("click", ShowMenu)

	document.getElementById("massagelevel").style.display = "block";
	document.getElementById("warm_ctrl").addEventListener('click', sendCommandWarm)

	rang.addEventListener("touchmove", moveSlider)
	rang.addEventListener("touchend", sendSpeedCmd)
}

function sendSpeedCmd(e) {
	let part = target / 5
	if ((e.changedTouches[0].pageX - rang.offsetLeft)/(target/6) < 0) {
		resetSlider(0)
		sendBle(MESSAGE_SEND.SPEED_LEVEL, '{"cmd":"82","value":"00"}', "sendMsgCallback")
	} else if ((e.changedTouches[0].pageX - rang.offsetLeft)/(target/6) > 6) {
		resetSlider(5)
		sendBle(MESSAGE_SEND.SPEED_LEVEL, '{"cmd":"82","value":"05"}', "sendMsgCallback")
	} else {
		resetSlider(Math.floor((e.changedTouches[0].pageX - rang.offsetLeft) / (target / 6)))
		sendBle(MESSAGE_SEND.SPEED_LEVEL, '{"cmd":"82","value":"0' + Math.floor((e.changedTouches[0].pageX - rang.offsetLeft) / (target / 6)) + '"}', "sendMsgCallback")
	}
}

//点击使工作状态变化
//点击方法
function sendCommandSwitch() {
	if (workstatus == 0 && linkStatus == LINK_STATUS.CONNECT) {
		sendBle(MESSAGE_SEND.WORK_STATUS, '{"cmd":"81","value":"00"}', "sendMsgCallback")
	} else if (workstatus == 1 && linkStatus == LINK_STATUS.CONNECT) {
		sendBle(MESSAGE_SEND.WORK_STATUS, '{"cmd":"81","value":"01"}', "sendMsgCallback")
	}
}

function sendCommandWarm() {
	if (warmOn == 0 && linkStatus == LINK_STATUS.CONNECT) {
		sendBle(MESSAGE_SEND.WARM, '{"cmd":"83","value":"00"}', "sendMsgCallback")
	} else if (warmOn == 1 && linkStatus == LINK_STATUS.CONNECT) {
		sendBle(MESSAGE_SEND.WARM, '{"cmd":"83","value":"01"}', "sendMsgCallback")
	}
}

function closeMenu() {
	let val = spinnerWrap.style.display;
	if (val === 'block') {
		spinnerWrap.style.display = 'none';
		leaveTime(time_left * 5 * 60)
	}
}

// 倒计时弹框
function ShowMenu() {
	// let val = spinnerWrap.style.display;
	// if (val === 'block') {
	//     spinnerWrap.style.display = 'none';
	//     leaveTime(time_left * 5)
	// } else {
		if (spinnerWrap.style.display === 'none') {
			spinnerWrap.style.display = 'block';
			var spinnerList = document.getElementsByClassName("spinnerList")
			for (let i = 0; i < spinnerList.length; i++) {
				(function(n) {
					spinnerList[i].classList.remove("choose")
					if(i == time_left) {
						spinnerList[i].classList.add("choose")
					}
				})(i)
			}
		}
	// }
}

function leaveTime(second) {
	if (second == 0) {
		document.getElementById("timer_img").setAttribute('src', timer_img_disable);
		document.getElementById("listName").innerHTML = ''
	} else {
		let num = Math.round(second / 60);
		document.getElementById("timer_img").setAttribute('src', timer_img);
		document.getElementById("listName").innerHTML = num + time_unit_min;
	}
	var spinnerList = document.getElementsByClassName("spinnerList")
	for (let i = 0; i < spinnerList.length; i++) {
		(function(n) {
			spinnerList[i].classList.remove("choose")
			if(i == time_left) {
				spinnerList[i].classList.add("choose")
			}
		})(i)
	}
}

function NumToString(num,len) {
	var numlen = num.toString().length; //得到num的长度
	var strChar = "0";  //空缺位填充字符
	var str = num;
	for (var i = 0; i < len - numlen; i++) {
		str = strChar + str;
	}
	return str;
}



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
let browserWidth;
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
            if (ua.indexOf('huaweitah-') !== -1 ||
              ua.indexOf('huaweitet-') !== -1
            ) {
                isFold = true;
            }
        }
        isPortrait = (window.screen.height >= window.screen.width)
        isPad = isUaPad;
    } catch (err) {
        console.log('通过 navigator.userAgent 获取系统类型和版本报错,使用默认配置android 和 10');
    }
    console.log(
        // new Time().logTime,
        `获取type为${type + version}, webview为${width}*${height},screenWidth为${window.screen.width}, ${(isPad ? '平板' : '手机') + ',' + (isFold ? '折叠屏' : '非折叠屏')},${isPortrait ? '竖屏' : '横屏'}`
    );
    browserWidth = document.documentElement.clientWidth;
    // document.documentElement.setAttribute('style', `font-size:${(isPad && isPortrait) ? 10 : (browserWidth / 36)}px`);
}
getPhoneInfo()

let statusBar = document.querySelector(".statusBar")
let titleBar = document.querySelector(".titleBar")
let statusBarHolder = document.querySelector(".statusBarHolder")
let titleBarHolder = document.querySelector(".titleBarHolder")
function setStatusBarHeight(num){
	if (isPad && !isPortrait) {
		statusBar.style.height = 1.2 + 'rem';
		statusBarHolder.style.height = 1.2 + 'rem';
	} else {
		statusBar.style.height = num / 10.0 + 'rem';
		statusBarHolder.style.height = num / 10.0 + 'rem';
	}
    titleBar.style.height = 5.6 + 'rem';
    titleBarHolder.style.height = 5.6 + 'rem';
}
setStatusBarHeight(24);

// 获取手机状态栏高度
function getStatusBarHeight(){
    window.BarHeightRes = (res) => {
        let data = JSON.parse(res).statusBarHeight;
        console.log('手机状态栏高度:',data);
        setStatusBarHeight(data);
    }
    if(window.hilink){
        hilink.getStatusBarHeight('BarHeightRes');
    }
}
getStatusBarHeight();

SetLanguage()
linkStatus = LINK_STATUS.DISCONNECT
refreshStyle()