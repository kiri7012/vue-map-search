<template>
  <section class="main-wrapper">
    <header class="header-wrapper">
      <div class="search bar6">
        <div class="form-div">
          <input type="text" v-model="inpuTxt" v-on:input="change" placeholder="请输入内容">
          <!--<button type="submit" @click="doSearch()"></button>-->
          <span @click="clearText">×</span>
        </div>
      </div>
      <div class="search-div">
        <!--:class="{'dealing':item.userHandler=='1'}"-->
        <ul class="searchResult" :class="{'dealing':loadMore}">
          <li v-for="suggestTxt in suggestResults" @click="doSuggest(suggestTxt.name)">
            <p><span></span>{{suggestTxt.name}}</p>
            <span>{{suggestTxt.address}}</span></li>
        </ul>
        <p class="more" v-show="loadMore" @click="addMore">加载更多</p>
      </div>
      <div class="search-div" v-show="searchPanel">
        <span class="close-ico" @click="closeSearchPanel()"><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAADFUlEQVRYR+2WXVITQRSFEwLhRQ0uQMgKBN0AgXd/WAGyAA08AMWT8JQfqoiugGQHoAsAdAOh9N2gGwjqC4QfvzPVbXUmPcNkrJIXumpqkp6+95w+997um83c8sjeMn7mjkAqBer1+gyhK/DMZLPZzvX1dXdsbOx4ZWWlO2xIExOoVCrFXC73FrB5QCYB/ovFXEb/ee8xube+vt5KSiQRAXb8DodlB+gYwEPtXED8Ll1dXT0dGRm5b9a0mV5aW1vTO3bEEmg0GhO9Xu9AUgPwC6Ad3s2NjY2Oz2utVnvJ/CbrpiGi9W8g0YxjEEnABcfB18vLy2dRwGEAiIiEwqVPC4REofGOSAI4aeJkESfH+Xy+NGyCEbZXIO6i2E98TEeR9xLY3t4uYXQg4/Hx8SmBQ2iZGBdWV1e3onZjqqOMWlsCVO7gp2wSc8Fn5yWA4SGLZ00iBTFkTnGf4mkS16WwM4EDJrsCROcgeqgwnp2dnfD/AfNPfEk5QMCU2zcMfmAwaYEEgCJHxlkfCQtOyAqQaBFzyR8MKcerwbf3+NPvvjFAQLHDyS6r+hwZFQZIxIHLRhuCtDb0HWJSMJ6AzWBWqY6bPqmtEhD9wPdZ385du2q1eirl8DewYZ8CKpkXOA3iGCbgKPEZp/f0Pyy7h7T8zHJcPwxXU2oCgH6CpD35vIlpidikTkQgSQiU7ZKdUHzUznyJ6aoAgeBEShqC2CS04Fb2uOpwkxDCJxAo3piEtgwB6MvauGyPIzF0GZokC5LGrQQcdeOy3ZJgjQ6d4PzXQXR+ft6RHXPJDiIRsEcxKpxyDxTtUcynCRxv+irDVgc2y+TGpnsUQ2Af+XVTDozYy4jVixi3yd65NJeRDjRdyzyPh7qMRNPIp1BMQ+ILF8zz/3oduyTUYOhmpCXbubi4aMU1JKYP0MX0m/J8nbohcYPlNhimF1Sr1VZDqnWABS2ZSUC1aEdML/9zS+aSMJeKOp15AB/5mlLW7/Ps3bRr12+ipjScuio5CEywa7XnHaTujo6OtodNVPlNRSCqDNPM3xG4dQX+AKveLj9+YY8HAAAAAElFTkSuQmCC"></span>
        <ul class="searchResult">
          <li v-for="searchTxt in searchResults" @click="addPointIco(searchTxt)">
            <p>{{searchTxt.name}}</p>
            <span>{{searchTxt.address}}</span></li>
        </ul>
      </div>
    </header>
    <main class="map-wrapper">
      <div id="map"></div>
    </main>
  </section>
</template>

<script>
import "maptalks/dist/maptalks.css";
import * as maptalks from "maptalks";
import Axios from "axios";

let myMap, markerLyr, self, timeInteval;
const SAVE_KEY = "history_search";
export default {
  name: "vueMapSearch",
  props: {
    x: {
      type: Number,
      default: 114.316200103
    },
    y: {
      type: Number,
      default: 30.5810841269
    },
    xyChange: {
      type: Function
    }
  },
  data() {
    return {
      olmap: null,
      inpuTxt: "",
      searchPanel: false,
      searchResults: [],
      suggestTxt: "",
      suggestResults: [],
      loadMore: false
    };
  },
  methods: {
//    doSearch() {
//      search(this.inpuTxt);
//    },
    addMore() {
      this.loadMore = false
    },
    clearText() {
      this.inpuTxt = ''
      this.change()
    },
    doSuggest(txt) {
      this.inpuTxt = txt;
      this.suggestResults = [];
      search(txt);
    },
    addPointIco(obj) {
      saveData(SAVE_KEY, obj);
      var xys = obj.lonlat.split(" ");
      drawPoint(xys[0], xys[1]);
    },
    closeSearchPanel() {
      this.searchPanel = false;
    },
    change() {
      timeInteval && clearTimeout(timeInteval);
      timeInteval = setTimeout(() => {
        suggest(self.inpuTxt);
      }, 200);
    }
  },
  mounted() {
    self = self || this;
    this.$nextTick(function() {
      initMap();
    });
  }
};
function suggest(txt) {
  let url = "http://map.tianditu.com/data/suggest";
  let postString =
    'postStr={"yingjiType":1,"sourceType":0,"keyWord":"{0}","level":12,"mapBound":"{1}","queryType":"4","count":"10","start":"0"}';
  let searchExtent = "110.58838,29.25286,118.09204,31.98012";
  postString = postString.replace("{0}", txt);
  postString = postString.replace("{1}", searchExtent);
  Axios.get(url + "?" + postString)
    .then(function(response) {
      resolveSuggestResult(response.data);
    })
    .catch(function(error) {
      console.log(error);
    });
}
function resolveSuggestResult(obj) {
  let data = filterData(SAVE_KEY, self.inpuTxt);
  let result = obj.suggests;
  if(self.suggestResults.length > 5) {
    self.loadMore = true
  }else {
    self.loadMore = false
  }
  if (obj.suggests) {
    for (let index = 0; index < data.length; index++) {
      const element = data[index];
      result = duplicateData(result, element.name);
      if (result.length == 0) break;
    }
    data = data.concat(result);
  }
  self.suggestResults = data;
}
function search(txt) {
  self.searchPanel = false;
  let url = "http://map.tianditu.com/query.shtml";
  let postString =
    'postStr={"keyWord":"{0}","level":"12","mapBound":"{1}","queryType":"1","count":"10","start":"0"}&type=query';
  let searchExtent = "110.58838,29.25286,118.09204,31.98012";
  postString = postString.replace("{0}", txt);
  postString = postString.replace("{1}", searchExtent);
  Axios.get(url + "?" + postString)
    .then(function(response) {
      resolveResult(response.data);
    })
    .catch(function(error) {
      console.log(error);
    });
}
function resolveResult(json) {
  var noResult = true;
  if (json.area) {
    noResult = false;
    var xys = json.area.lonlat.split(",");
    drawPoint(xys[0], xys[1]);
  }
  if (json.pois) {
    noResult = false;
    if (json.pois.length === 1) {
      self.addPointIco(json.pois[0]);
    } else {
      let data = filterData(SAVE_KEY, self.inpuTxt);
      let result = json.pois;
      if (result) {
        for (let index = 0; index < data.length; index++) {
          const element = data[index];
          result = duplicateData(result, element.name);
          if (result.length == 0) break;
        }
        data = data.concat(result);
      }
      self.searchResults = data;
      self.searchPanel = true;
    }
  }
  if (noResult) {
    alert("没有搜索结果请重试");
  }
}
function drawPoint(x, y) {
  x = parseFloat(x);
  y = parseFloat(y);
  let geometry = markerLyr.getGeometryById("outPositionIco");
  geometry && geometry.remove();
  new maptalks.Marker([x, y], {
    id: "outPositionIco",
    draggable: false,
    symbol: {
      markerFile:
        "data:image/png;base64,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",
      markerWidth: 32,
      markerHeight: 38,
      markerDx: 0,
      markerDy: 0,
      markerOpacity: 1
    }
  }).addTo(markerLyr);
  myMap.setCenter([x, y]);
  notify("center", { x: x, y: y });
}
function createPointStyle(src, img) {
  return new ol.style.Style({
    image: new ol.style.Icon({
      anchorXUnits: "pixels",
      anchorYUnits: "pixels",
      anchor: [16, 38],
      src: src,
      img: img,
      imgSize: img ? [img.width, img.height] : undefined
    })
  });
}
function initMap() {
  myMap = new maptalks.Map("map", {
    center: [self.x, self.y],
    zoom: 12,
    minZoom: 1,
    maxZoom: 18,
    spatialReference: {
      projection: "EPSG:4326"
    },
    baseLayer: new maptalks.TileLayer("base", {
      tileSystem: [1, -1, -180, 90],
      urlTemplate:
        "http://t{s}.tianditu.com/DataServer?T=vec_c&x={x}&y={y}&l={z}",
      subdomains: ["1", "2", "3", "4", "5"],
      attribution:
        '&copy; <a target="_blank" href="http://www.tianditu.cn">Tianditu</a>'
    }),
    layers: [
      new maptalks.TileLayer("road", {
        urlTemplate:
          "http://t{s}.tianditu.com/DataServer?T=cva_c&x={x}&y={y}&l={z}",
        subdomains: ["1", "2", "3", "4", "5"],
        opacity: 1
      })
    ]
  });
  markerLyr = new maptalks.VectorLayer("vector").addTo(myMap);
  myMap.on("click", function(evt) {
    let coordinate = evt.coordinate;
    notify("click", coordinate);
  });
  drawPoint(self.x, self.y);
}
function saveData(key, value) {
  if (!window.localStorage) {
    console.log("not support localstorage");
    return false;
  } else if (key) {
    if (!value) return false;
    var storage = window.localStorage;
    if (value instanceof Array) {
    } else {
      value = [value];
    }
    let preDta = fetchData(key);
    if (preDta) {
      let data2 = duplicateData(preDta, value[0].name);
      if(data2.length >0 ){
        value = value.concat(data2);
      }
    }
    value = JSON.stringify(value);
    storage.setItem(key, value);
  } else {
    console.log("no data");
    return false;
  }
}
function filterData(key, value) {
  let array = fetchData(key);
  let arr = [];
  if (!value || value == "") return arr;
  for (let index = 0; index < array.length; index++) {
    const element = array[index];
    if (element.name && element.name.indexOf(value) >= 0) {
      arr.push(element);
    }
  }
  return arr;
}
function duplicateData(array, value) {
  let arr = [];
  for (let index = 0; index < array.length; index++) {
    const element = array[index];
    if (element.name === value) {
    } else {
      arr.push(element);
    }
  }
  return arr;
}
function fetchData(key) {
  if (!window.localStorage) {
    console.log("not support localstorage");
    return false;
  } else if (key) {
    let storage = window.localStorage;
    let data = storage.getItem(key);
    if (!data) {
      return [];
    }
    return JSON.parse(data);
  } else {
    console.log("no key");
    return false;
  }
}
function clearData(key, value) {
  var data = fetchData(key);
  var arr = [];
  for (let i = 0; i < data.length; i++) {
    if(data[i].name===value){

    }else{
      arr.push(data[i]);
    }
  }
  saveData(key, arr);
}
function notify(type, coordinate, opts) {
  self.xyChange({
    type: type,
    coordinate: coordinate,
    opts: {}
  });
}
</script>

<style>
  .form-div {
    position: relative;
    width: 100%;
    background-color: #fff;
    padding: 5px 10px;
    box-sizing: border-box;
  }
  .form-div span {
    position: absolute;
    top: 12px;
    right: 22px;
    width: 40;
    width: 16px;
    height: 16px;
    background: rgba(44,44,44,.3);
    border-radius: 50%;
    text-align: center;
    line-height: 16px;
    color: #fff;
  }
  input,
  button {
    border: none;
    outline: none;
  }
  input {
    width: 100%;
    height: 30px;
    padding-left: 13px;
  }
  button {
    height: 30px;
    width: 42px;
    cursor: pointer;
    position: absolute;
  }
  /*搜索框6*/
  .more {
    margin: 0;
    text-align: center;
    color: #aaa;
    padding: 5px 0;
    font-size: 14px;
  }
  .bar6 input {
    border: 1px solid #d2d4d5;
    border-radius: 5px;
    background: transparent;
    font-size: 14px;
    box-sizing: border-box;
  }
  .bar6 button {
    background: #08c;
    border-radius: 0 5px 5px 0;
    width: 60px;
    top: 5px;
    right: 10px;
  }
  .bar6 button:before {
    content: "搜索";
    font-size: 13px;
    color: #f9f0da;
  }
  main,
  section {
    display: block;
  }
  .main-wrapper {
    width: 100vw;
    height: 100vh;
    position: relative;
  }
  .header-wrapper,
  .map-wrapper {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
  }
  .header-wrapper {
    position: absolute;
    z-index: 1;
    width: 100%;
    height: 46px;
    top: 0;
  }
  #map {
    width: 100%;
    height: 100%;
  }
  .maptalks-attribution {
    display: none;
  }
  .search-div {
    position: relative;
    background-color: white;
  }
  .search-div > span > img {
    display: block;
  }
  .searchResult {
    margin: 0;
    padding: 0;
    /*max-height: 280px;*/
    /*overflow-y: auto;*/
    overflow: hidden;
  }
  .searchResult.dealing {
    max-height: 400px;
  }
  .searchResult > li {
    cursor: pointer;
    padding: 2px 10px;
    font-size: 15px;
    list-style-type: none;
  }
  .searchResult > li:hover {
    background-color: #f5f5f5;
  }
  .searchResult > li > span {
    color: #ccc;
    font-size: 13px;
    padding-left: 25px;
  }
  .searchResult > li > p {
    margin: 0;
  }
  .searchResult > li > p > span {
    display: inline-block;
    margin-right: 9px;
    width: 16px;
    height: 16px;
    background: url("../../dist/search.png") no-repeat;
    vertical-align: middle;
  }
  .close-ico {
    position: absolute;
    right: 5px;
    cursor: pointer;
    z-index: 3;
  }
</style>
