/*
 * @Description: 
 * @Version: 2.0
 * @Autor: cuijinxin
 * @Date: 2021-02-03 15:25:58
 * @LastEditors: cuijinxin
 * @LastEditTime: 2021-03-04 15:42:55
 */
// 161725|501205|001500|004854|160629|010955
// 基金实时信息：http://fundgz.1234567.com.cn/js/001186.js?rt=1463558676006

// 001186为基金代号

// 返回值：jsonpgz({"fundcode":"001186","name":"富国文体健康股票","jzrq":"2016-05-17","dwjz":"0.7420","gsz":"0.7251","gszzl":"-2.28","gztime":"2016-05-18 15:00"});

// 基金详细信息：http://fund.eastmoney.com/pingzhongdata/001186.js?v=20160518155842

// http://fund.eastmoney.com/js/fundcode_search.js
// 所有基金名称列表代码

// http://fund.eastmoney.com/js/jjjz_gs.js?dt=1463791574015
// 所有基金公司名称列表代码
import fundDefault from "./js/fundAll.js";
import {loadJS} from "./common.js"
// 变量定义
let step = 0; // 0 列表页 1 设置页
let fundAll = []; // 所有韭菜品种列表
// 获取所有韭菜列表
let getFundAll = () => {
  let xhr = new XMLHttpRequest();
  xhr.onreadystatechange = (res) => {
    try {
      if(res.target.readyState === 4 && res.target.response){
        fundAll = ((res.target.response.split("var r = ")[1]).replaceAll("[","")).split("],").map( item => {
          return item.split(",")
        });
      }
    } catch(e) {
      console.error(e)
      fundAll = fundDefault; // 获取实时信息失败 就用默认的数据
    }
  };
  xhr.open("GET", `http://fund.eastmoney.com/js/fundcode_search.js`, true);
  xhr.send();
}
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
  return new Promise( resolve => {
    let fund = fundList.split("|")
    let request = [];
    for(let i = 0; i < fund.length; i++) {
      request.push( new Promise((rsv, rjc) => {
        getFundData(fund[i], rsv, rjc)
      }))
    }
    Promise.all(request).then( res => {
      let fundData = {};
      res.forEach( data => {
        fundData[data.fundcode] = { ...data };
      })
      resolve(fundData)
    });
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
// 设置页初始化
let initSetPage = async (fundCode) => {
  let table = $("#fundSettingTable")
  let tableHead = "<tr><td>长势</td><td>韭菜品种</td><td>更新时间</td></tr>";
  table.empty();
  table.append(tableHead);
  let data = await searchData(fundCode);
  fundCode.split("|").forEach( (fund, index) => {
    console.log(data[fund])
    if(fund){
      table.append(initSettingDom(data[fund], index));
    }
  })
}
// 设置页Dom渲染
let initSettingDom = (data, index) => {
  const dom = `<tr> \
    <td> \
      <img class="icon" src="./static/${(data.gszzl > 0 ? "up" : "down")}.png" ></img>
      <span style="color:${(data.gszzl > 0 ? "red" : "green")}">${data.gszzl}%</span> \
    </td> \
    <td><span>${data.name} <b>[${data.fundcode}]</b></span></td> \
    <td><span>${data.gztime.split(" ")[1]}</span></td></tr>`
  return dom;
}

// 初始化时绑定相关事件
let bindEvent = () => {
  // 设置
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
  // 打开模态框
  document.getElementById("openModal").onclick = () => {
    $("#editModal").modal();
  }
  // 刷新
  document.getElementById("refresh").onclick = () => {
    chrome.storage.sync.get("fundCode", async (res) => {
      document.getElementById("fundList").value = res.fundCode || "";
      if(res.fundCode){
        initSetPage(res.fundCode);
      }
    })
  }
}

(function() {
  chrome.storage.sync.get("fundCode", async (res) => {
    document.getElementById("fundList").value = res.fundCode || "";
    if(res.fundCode){
      initSetPage(res.fundCode);
    }
  })
  bindEvent();
  getFundAll();
})();