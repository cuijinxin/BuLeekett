/*
 * @Description: 
 * @Version: 2.0
 * @Autor: cuijinxin
 * @Date: 2021-02-03 15:25:58
 * @LastEditors: cuijinxin
 * @LastEditTime: 2021-02-03 20:45:15
 */
// 161725;501205;001500;004854;160629;010955
// 封装http请求
let getFundData = (fundCode, resolve) => {
  console.log(fundCode)
  let xhr = new XMLHttpRequest();
  xhr.onreadystatechange = (res) => {
    if(res.target.readyState === 4 && res.target.response){
      let json = JSON.parse( `{
        ${res.target.response.split("({")[1].split("})")[0]}
      }` );
      resolve(json)
    }
  };
  xhr.open("GET", `http://fundgz.1234567.com.cn//js/${fundCode}.js?rt=${(new Date()).getTime()}`, true);
  xhr.send();
}

// 获取数据
let searchData = (fundList) => {
  let fund = fundList.split(";")
  let request = [];
  for(let i = 0; i < fund.length; i++) {
    request.push( new Promise((resolve) => {
      getFundData(fund[i], resolve)
    }))
  }
  Promise.all(request).then( res => {
    let fundData = {};
    res.forEach( data => {
      fundData[data.fundcode] = { ...data };
    })
    initfundHTML(fundData)
    console.log(fundData)
  })
}
// 渲染dom
let initfundHTML = (data) => {
  let content = document.getElementById("fundInfoList");
  content.innerHTML = ""; //清空
  let len = Object.keys(data).length;
  let ele = ""
  for(let i = 0; i < len; i++){
    let info = Object.values(data)[i];
    ele += '<div class="content"> \
      <img class="icon" src="./static/' + (info.gszzl > 0 ? "up" : "down") +'.png" ></img> \
      <span class="precent" style="color:' + (info.gszzl > 0 ? "red" : "green") +'">' + info.gszzl +'%</span> \
      <span class="fundName">' + info.name + '</span> \
      <span class="updateTime">' + info.gztime.split(" ")[0] + '</span> \
    </div>'
  }
  content.innerHTML = ele;
}
(function() {
  chrome.storage.sync.get("fundCode", (res) => {
    document.getElementById("fundList").value = res.fundCode;
    searchData(res.fundCode)
  })
  document.getElementById("setFund").onclick = () => {
    chrome.storage.sync.set(
      { "fundCode": document.getElementById("fundList").value }, () => {
        console.log("保存成功")
      }
    );
  }
})();