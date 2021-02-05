/*
 * @Description: 
 * @Version: 2.0
 * @Autor: cuijinxin
 * @Date: 2021-02-03 15:25:58
 * @LastEditors: cuijinxin
 * @LastEditTime: 2021-02-04 17:02:28
 */
// 161725|501205|001500|004854|160629|010955

// 变量定义
let step = 0; // 0 列表页 1 设置页

// 封装http请求
let getFundData = (fundCode, resolve, reject) => {
  let xhr = new XMLHttpRequest();
  xhr.onreadystatechange = (res) => {
    try {
      if(res.target.readyState === 4 && res.target.response){
        let json = JSON.parse( `{
          ${res.target.response.split("({")[1].split("})")[0]}
        }` );
        resolve(json)
      }
    } catch {
      reject()
    }
  };
  xhr.open("GET", `http://fundgz.1234567.com.cn//js/${fundCode}.js?rt=${(new Date()).getTime()}`, true);
  xhr.send();
}

// 获取数据
let searchData = (fundList) => {
  let fund = fundList.split("|")
  let request = [];
  for(let i = 0; i < fund.length; i++) {
    request.push( new Promise((resolve, reject) => {
      getFundData(fund[i], resolve, reject)
    }))
  }
  Promise.all(request).then( res => {
    let fundData = {};
    res.forEach( data => {
      fundData[data.fundcode] = { ...data };
    })
    initfundHTML(fundData)
    console.log(fundData)
  }).catch( () => {
    console.log("error")
  })
}
// 渲染dom
let initfundHTML = (data) => {
  let content = document.getElementById("fundInfoList");
  let len = Object.keys(data).length;
  let ele = '<div class="header">\
              <span class="headerL">长势</span>\
              <span class="headerM">韭菜品种</span>\
              <span class="headerR">更新时间</span>\
            </div>'
  for(let i = 0; i < len; i++){
    let info = Object.values(data)[i];
    ele += '<div class="content"> \
      <img class="icon" src="./static/' + (info.gszzl > 0 ? "up" : "down") +'.png" ></img> \
      <span class="precent" style="color:' + (info.gszzl > 0 ? "red" : "green") +'">' + info.gszzl +'%</span> \
      <span class="fundName">' + `${info.name} [${info.fundcode}]` + '</span> \
      <span class="updateTime">' + info.gztime.split(" ")[1] + '</span> \
    </div>'
  }
  content.innerHTML = ele;
}
// 页面切换
let changeCurPage = (step) => {
  let fundInfoContent = document.getElementById("fundInfoContent");
  let fundSetting = document.getElementById("fundSetting");
  if(step === 0) { // 列表页
    fundInfoContent.style.display = "block";
    fundSetting.style.display = "none";
    chrome.storage.sync.get("fundCode", (res) => {
      document.getElementById("fundList").value = res.fundCode || "";
      if(res.fundCode){
        searchData(res.fundCode)
        document.getElementById("errorTips").style.display = "none";
      } else {
        document.getElementById("fundInfoList").innerHTML = "";
        document.getElementById("errorTips").style.display = "block";
      }
    })
  } else if( step === 1) { // 配置页
    fundInfoContent.style.display = "none";
    fundSetting.style.display = "block";
  }
}
// 初始化时绑定相关事件
let bindEvent = () => {
  // 
  document.getElementById("setFund").onclick = () => {
    chrome.storage.sync.set(
      { "fundCode": document.getElementById("fundList").value }, () => {
        document.getElementById("setFundTips").style.opacity = 1;
        setTimeout( () => {
          document.getElementById("setFundTips").style.opacity = 0;
        }, 1000)
      }
    );
  }
  // 切换页面
  document.getElementById("stepLeft").onclick = () => {
    step -= 1
    step = step < 0 ? 1 : step
    changeCurPage(step)
  }
  document.getElementById("stepRight").onclick = () => {
    step += 1
    step = step > 1 ? 0 : step
    changeCurPage(step)
  }
  // 跳转到设置页
  document.getElementById("goSetting").onclick = () => {
    step = 1
    changeCurPage(step)
  }
}

(function() {
  chrome.storage.sync.get("fundCode", (res) => {
    document.getElementById("fundList").value = res.fundCode || "";
    if(res.fundCode){
      searchData(res.fundCode)
      document.getElementById("errorTips").style.display = "none";
    } else {
      document.getElementById("fundInfoList").innerHTML = "";
      document.getElementById("errorTips").style.display = "block";
    }
  })
  bindEvent()
})();