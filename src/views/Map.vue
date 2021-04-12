<template>
<div class="map-app" v-loading.fullscreen.lock="fullscreenLoading" >
  <div id="map">
     
  </div>
  <div class="restrict_select">
    <el-select v-model="provinceSelect" @change="updateMarkerAndShowDataByProvice"  label="全国" placeholder="请选择" :disabled="provinceSelecterDisable">
      <el-option
        v-for="item in proviceList"
        :key="item.value"
        :label="item.label"
        :value="item.value">
      </el-option>
    </el-select> 
     <el-date-picker
      v-model="dateSelect"
      type="datetime"
      placeholder="选择日期"
      :picker-options="pickerOption"
      :default-value="defaultValue"
      :editable="false"
      :clearable="false"
      value-format="yyyy-MM-dd HH:mm:ss"
      @change="updateMarkerAndShowDataByDate"
      >
    </el-date-picker>
  </div>
  <div class="legend">
      <Legend :range_color="legend"/>
  </div>
  <div class="map_axis_msg">
      <pre>地图中心-> Lat（纬度）：{{currentLatLng.lat}} Lng（经度）：{{currentLatLng.lng}}           地图层级->  {{currentZoomLev}}</pre>
  </div>
  <div class="function-bar">
      <el-button type="primary" icon="el-icon-edit" @click="changeSelectProvinceMode" circle></el-button>
  </div>
</div>
</template>

<script>
// import 'leaflet/dist/leaflet.css'
// import L from 'leaflet'
// import 'leaflet-canvas-marker';
import HeatmapOverlay from "leaflet-heatmap"
import Legend from "@/components/Legend.vue"
// import Legend from '../components/legend.vue';
export default {
    mounted(){
        this.fullscreenLoading = true; 
        //设置chart传递的事件的监听
        this.$bus.$on('bar-chart-select',this.handleBarChartSelect);
        this.$bus.$on('bar-chart-cancel-select',this.handleBarChartCancelSelect);
        //请求站点数据       
        this.$axios.get("http://localhost:8080/station.json").then(({data})=>{
            // console.log(data);
            // console.log(data.length);
            // let tempS = [];
            this.stations = data;
            
            {/*这里是创建proviceList的代码
                let newS = this.copyStationsRestrictAttr('province');
                let nnewS = {}
                let proviceList = [];
                newS = newS.forEach(i=>{
                    nnewS[i.province] = {province:i.province,value:''};
                    
                })
                for (const key in nnewS) {
                    if (Object.hasOwnProperty.call(nnewS, key)) {
                        proviceList.push(nnewS[key]);
                        
                    }
                }
                console.log(JSON.stringify(proviceList));
            */}
    
        })
        // this.icon = L.icon({
        //     iconUrl: 'TEMdots/TEM40.svg',
        //     iconSize: [20, 20],
        //     iconAnchor: [10, 10]
        // });
        this.initMap();
        
        console.log("Ready");
        //给Date添加格式化处理
        Date.prototype.format = function(fmt){
            var o = {
            "M+" : this.getMonth()+1,                 //月份
            "d+" : this.getDate(),                    //日
            "h+" : this.getHours(),                   //小时
            "m+" : this.getMinutes(),                 //分
            "s+" : this.getSeconds(),                 //秒
            "q+" : Math.floor((this.getMonth()+3)/3), //季度
            "S"  : this.getMilliseconds()             //毫秒
            };
        
            if(/(y+)/.test(fmt)){
            fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
            }
                
            for(var k in o){
            if(new RegExp("("+ k +")").test(fmt)){
                fmt = fmt.replace(
                RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));  
            }       
            }
        
            return fmt;
        }
        
        
        this.map.on('zoom',this.onZoomLevChange);
        this.map.on('move',this.onMoveStart);
        //  L.Icon.Default.prototype.options.iconUrl="marker-icon.png";
        //  L.Icon.Default.prototype.options.shadowUrl="https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png";
        //  L.Icon.Default.imagePath="https://unpkg.com/leaflet@1.7.1/dist/images/";
        
        // this.map.on("click",(e)=>{
        //    let marker =  L.marker(e.latlng).addTo(this.map);
        //    marker.bindPopup(`<p>经度${e.latlng.lng}</p><p>纬度${e.latlng.lat}</p>`).openPopup();
        // })
        // let attrArr = [
        //     'stationId',
        //     'stationName',
        //     'province'
            
        // ];
        // console.log(this.copyStationsRestrictAttr(...attrArr));
    },
    data(){
        return {
            //地图的层
            map:{},
            ciLayer:{},
            heatmapLayer:{},
            //上点的图标
            iconList:{},
            //请求到的数据与当前展示的数据
            showData:{},
            requestData:{},
            //地图上所有的点，要显示的点将在所有点中进行筛选后形成
            showMarkers:[],
            markers:[],
            //本地存储的站点信息
            stations:[],
            //省选择组件
            provinceSelect:'全国',
            proviceList:[{"label":"全国","value":"全国"},{"label":"黑龙江","value":"黑龙江"},{"label":"内蒙古","value":"内蒙古"},{"label":"吉林","value":"吉林"},{"label":"新疆","value":"新疆"},{"label":"甘肃","value":"甘肃"},{"label":"青海","value":"青海"},{"label":"河北","value":"河北"},{"label":"山西","value":"山西"},{"label":"宁夏","value":"宁夏"},{"label":"陕西","value":"陕西"},{"label":"河南","value":"河南"},{"label":"辽宁","value":"辽宁"},{"label":"北京","value":"北京"},{"label":"天津","value":"天津"},{"label":"山东","value":"山东"},{"label":"西藏","value":"西藏"},{"label":"四川","value":"四川"},{"label":"云南","value":"云南"},{"label":"贵州","value":"贵州"},{"label":"湖北","value":"湖北"},{"label":"重庆","value":"重庆"},{"label":"湖南","value":"湖南"},{"label":"江西","value":"江西"},{"label":"广西","value":"广西"},{"label":"广东","value":"广东"},{"label":"江苏","value":"江苏"},{"label":"安徽","value":"安徽"},{"label":"上海","value":"上海"},{"label":"浙江","value":"浙江"},{"label":"福建","value":"福建"},{"label":"海南","value":"海南"},{"label":"极地","value":"极地"}],
            //日期选择组件
            dateSelect:'2021-03-10 12:00:00',
            defaultValue:new Date(2021,2,10,0,0,0),
            pickerOption:{
                disabledDate(time) {
                    let start = new Date(2021,2,10,0,0,0);
                    let end = new Date(2021,3,9,12,0,0);
                    // console.log(+start);
                    return time.getTime() < start || time.getTime() > end ;
                },
            },
            //当前地图的中心和层级
            currentLatLng:{},
            currentZoomLev:{},
            fullscreenLoading:false,
            chinaGeoJson:'',
            provincesGeoJsons:[],
            geoJsonLayerGroup:{},
            ciLayerRemoved:false,
            legend:[
                {range:'40+',color:'rgba(225,84,86,.6)'},
                {range:'40~35',color:'rgba(254,1,1,.6)'},
                {range:'35~30',color:'rgba(254,97,1,.6)'},
                {range:'30~25',color:'rgba(254,129,1,.6)'},
                {range:'25~20',color:'rgba(254,194,1,.6)'},
                {range:'20~15',color:'rgba(254,254,1,.6)'},
                {range:'15~10',color:'rgba(221,254,1,.6)'},
                {range:'10~5',color:'rgba(147,254,1,.6)'},
                {range:'5~0',color:'rgba(17,254,1,.6)'},
                {range:'0~-5',color:'rgba(0,254,180,.6)'},
                {range:'-5~-10',color:'rgba(0,254,246,.6)'},
                {range:'-10~-15',color:'rgba(0,234,254,.6)'},
                {range:'-15~-20',color:'rgba(0,203,255,.6)'},
                {range:'-20~-25',color:'rgba(0,165,254,.6)'},
                {range:'-25~-30',color:'rgba(0,100,254,.6)'},
                {range:'-30~-35',color:'rgba(0,70,254,.6)'},
                {range:'-35+',color:'rgba(0,13,254,.6)'}
            ],
            _ciLayerDOM:{},
            provinceSelecterDisable:false

        };
    },
    methods:{
        async initMap() {
            //地图初始化
            this.map = L.map("map", {
                minZoom: 4,
                maxZoom: 11,
                // 30.92754182882566,118.7462081940612
                center: [30.92754182882566,118.74488639936317],
                zoom: 8,
                zoomControl: true,
                attributionControl: true,
                crs: L.CRS.EPSG3857,
                preferCanvas: true
            });
            this.currentLatLng = this.map.getCenter();
            this.currentZoomLev = this.map.getZoom();
            //添加地图底图
            L.tileLayer(
                // "http://wprd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}"
                "http://rt0.map.gtimg.com/realtimerender?z={z}&x={x}&y={-y}&type=vector&style=0",{preferCanvas: true}
            ).addTo(this.map);
            
            //海量点组件
            this.ciLayer = L.canvasIconLayer({});
            
            var cfg = {
                // radius should be small ONLY if scaleRadius is true (or small radius is intended)
                // if scaleRadius is false it will be the constant radius used in pixels
                "radius": 0.26,
                
                "maxOpacity": 1,
                // "minOpacity":.3,
                // scales the radius based on map zoom
                "scaleRadius": true,
                // if set to false the heatmap uses the global maximum for colorization
                // if activated: uses the data maximum within the current map boundaries
                //   (there will always be a red spot with useLocalExtremas true)
                "useLocalExtrema": false,
                // which field name in your data represents the latitude - default "lat"
                latField: 'lat',
                // which field name in your data represents the longitude - default "lng"
                lngField: 'lng',
                // which field name in your data represents the data value - default "value"
                valueField: 'TEM',
                gradient: {   "0.9": "rgba(255,0,0,1)",
                    "0.8": "rgba(255,255,0,1)",
                    "0.7": "rgba(0,255,0,1)",
                    "0.5": "rgba(0,255,255,1)",
                    "0": "rgba(0,0,255,1)"
                },

            };
            this.heatmapLayer = new HeatmapOverlay(cfg).addTo(this.map);
            
            
            //添加geoJson的LayerGroup
            this.geoJsonLayerGroup =  new L.LayerGroup();
            this.geoJsonLayerGroup.addTo(this.map);
            
            // console.log(M);
            //接下来要xhr请求数据
            let params={
                date:this.dateSelect
            }
           let {data} = await this.getMapWeatherData(params);
           let geoJson = await this.getGeoJson();
            // console.log(geoJson);
           data = this.stationMappingWeatherData(data);
           this.updateRequestData(data);
           this.updateShowData();
           this.createMarkers(data);
           this.addProvincesGeoJsons(geoJson);
           this.updateGeoJson();
           this.addChinaGeoJson();
           this.addCiLayerToMap();
           this.addMarkersToCiLayer();
        //    this.ciLayer.addTo(this.map);
        //    this.ciLayer.addLayers(this.markers);


        //    this.updateGeoJson()
        //    this.requestDataMappingGeoJsonDataByStationName();
           this._data._ciLayerDOM = document.getElementsByClassName('leaflet-canvas-icon-layer')[0];
           this.fullscreenLoading = false;
            this.$message({
                message: '加载完成',
                type: 'success',
                duration:1000,
                offset:60
            });
           { // this.$axios.get('/querysql',{params}).then( res => {
            //     let {data} = res;
            //     // console.log("获取到的",data);
            //     // this.showData = data;
                
            //     let heatData = this.stationMappingWeatherData(data);
            //     this.requestData = heatData;
            //     this.showData = heatData;
            //     let markers = heatData.map(s => {
            //         // console.log(s);
            //         //  if(s.stationType != "基准站") return;
            //         //  console.log();
            //         //  let parse = this.parseLatLng({lng:s.lng,lat:s.lat});
            //         //  s.lng = parse.lng;
            //         //  s.lat = parse.lat;
            //         //  tempS.push(s);
            //         //  console.log("parsed:",parse);
            //         let icon = this.icon;
            //         let marker =  L.marker({lng:s.lng,lat:s.lat},{icon});
            //         marker.bindPopup(`
            //             <p>站点：${s.stationName}</p>
            //             <p>省份：${s.province}</p>
            //             <p>经度：${s.lng}</p>
            //             <p>纬度：${s.lat}</p>
            //             <p>温度：${s.TEM}</p>
            //             `
            //         );
            //         marker.province = s.province;
            //         return marker;
            //     }); 
            //     this.markers = markers;
            //     // console.log(JSON.stringify(tempS));
            //     this.ciLayer.addTo(this.map);
            //    this.addMarkersToCiLayer(markers);
            //    // heatData = {"max":40, data:heatData};
            //    // console.log("heat",heatData);

            //    // this.heatmapLayer.setData(heatData);
           // })
           }
        },   
        parseLatLng({lat,lng}){
            console.log("parse");
            let intege = parseInt(lat = lat / 100);
            lat = intege + (lat - intege)/0.6;
            intege = parseInt(lng = lng / 100);
            lng = intege + (lng - intege)/0.6;
            return {lng,lat};
        },
        stationMappingWeatherData(data,attr){
            //需要的本地点信息从这里添加
            let attrArr = [
                'stationId',
                'stationName',
                'province',
                'lng',
                'lat' 
            ];
            let newStations = this.copyStationsRestrictAttr(...attrArr);
            let t = 0;
            // console.log("newS",newStations);
            // console.log("data",data);
            let lostDataStationsErrMsg = ['<div style="width:103%;max-height:210px;overflow:auto;padding-right:11px">'];
            newStations.forEach( s =>{
                if(data[t] && s.stationId == parseInt(data[t].Station_Id_C)){
                    //需要的服务器点天气数据从这里添加
                    s.Date = data[t].Date;
                    s.TEM = data[t].TEM;
                    t++;
                }
                else{
                    {// console.log(`ERR：在${t}，${s.stationId}时得到了${data[t].Station_Id_C}的数据`);
                    // let tempT = t+1;
                    // while(data[tempT]){
                    //     if (s.stationId == parseInt(data[tempT].Station_Id_C)) {
                    //         console.log(`save:${tempT} to ${t}`);
                    //         t = tempT;
                    //         s.TEM = data[t].TEM;
                    //         t++;
                    //         return;
                    //     }
                    //     tempT++;
                    // }
                    }
                    s.TEM = 999999;
                    s.Date = '该数据缺测';
                    lostDataStationsErrMsg.push(`<p>在${s.stationName}的数据缺失</p>`)
                    // console.log(`ERR：在${t},${s.stationId},${s.stationName}的数据缺失`);
                } 
            })
            if(lostDataStationsErrMsg.length !=0){
                lostDataStationsErrMsg.push('</div>');
                this.$notify({
                    title: '提示',
                    duration:2000,
                    dangerouslyUseHTMLString: true,
                    type:'info',
                    message: lostDataStationsErrMsg.join(''),
                    customClass:'notifyclass'
                });
            }
            return newStations;
         },
        copyStationsRestrictAttr(...attrs){
            let newStations = this.stations.map( s =>{
                let newStationData = {};
                attrs.forEach( attr =>{
                    newStationData[attr] = s[attr];
                });
                return newStationData;
            });
            return newStations;
        },
        addMarkersToCiLayer(filterFn,baseMarkers,keepShowMarker){
            keepShowMarker = !keepShowMarker;
            // console.log("pre");
            // this.map.eachLayer(l=>{
            //     console.log(l);
            // })
            // console.log(markers);
            let newMarkers = [];

            filterFn = filterFn || function(e){return e};
            
            
            baseMarkers = baseMarkers || this.markers;
            // console.log("将移除",baseMarkers.length);
            // this.removeAllMarkers();
            baseMarkers.forEach((marker)=>{
                // this.ciLayer.removeMarker(marker);
                filterFn(marker) && newMarkers.push(marker);
            });

            // console.log(markers);
            // this.ciLayer.redraw();
            // this.ciLayer.bringToFront();
            // console.log(this.ciLayer);
            this.ciLayer.addLayers(newMarkers);
            if(keepShowMarker)
                this.showMarkers = newMarkers;
            // this.map.flyTo(newMarkers[Math.round(newMarkers.length/2)].getLatLng());
            // console.log("then");
            // this.map.eachLayer(l=>{
            //     console.log(l);
            // })
        //    console.log( this.map.hasLayer(this.ciLayer));
            // 
        },
        provinceMarkerFilter(marker){
            // console.log("现在",this.provinceSelect);
            if (marker.province == this.provinceSelect
                                    || this.provinceSelect == '全国') return marker;
            
        },
        provinceWeatherDataFilter(data){
                // console.log(this.showData);
            if(data.province == this.provinceSelect 
                         || this.provinceSelect == '全国') return data;
        },
        rangeMarkerHighLevFilter(max,min){
            return (marker)=>{
                // console.log("该marker的TEM:",marker.TEM,"最大最小值:",max,min);
                if (marker.TEM <= max && marker.TEM > min)  return marker;
            }
        },
        onZoomLevChange(e){
            this.currentZoomLev = Math.round(this.map.getZoom());
            //有了筛选功能后，地图zoom过小不需要自动隐藏ciLayer
            // if(this.provinceSelect =='全国')
            // if(this.currentZoomLev <= 5 && !this.ciLayerRemoved){
            //     console.log("全国");
            //     this.removeAllMarkers();
            //     // this.geoJsonLayerGroup.setZIndex(99999);
            //     // this.ciLayer.setZIndex(0);
            //     // console.log(L);
            //     // this.ciLayer = L.canvasIconLayer = null;
            //     // this.map.removeLayer();
            //     // this.allLayersGroup.setZIndex(900);
            //     this.hideCiLayerFromMap();
            //     this.ciLayerRemoved = true;
            // }else if(this.currentZoomLev > 5 && this.ciLayerRemoved){
            //     // this.addCiLayerToMap();
            //     this.showCiLayerFromMap();
            //     // this.geoJsonLayerGroup.bringToBack();
            //     this.addMarkersToCiLayer(this.provinceMarkerFilter);
            //     this.ciLayerRemoved = false;
            // }
            
            
            // console.log();
        },
        onMoveStart(e){
            this.currentLatLng = this.map.getCenter();
            //  console.log();
        },
        getMapWeatherData(params){
            return this.$axios.get('/querysql',{params});
        },
        updateRequestData(reqData){
            this.requestData = reqData;
        },
        updateShowData(filterFn,baseWeatherData){
            filterFn = filterFn || function(e){return e};

            let newShowData = [];
                
            
            baseWeatherData = baseWeatherData || this.requestData;
            
            baseWeatherData.forEach((data)=>{
                filterFn(data) && newShowData.push(data);
            });
            this.$store.commit('updateShowData',newShowData);
            this.showData = newShowData;
        },
        createMarkers(data){
            let markers = data.map(s => {
               { // console.log(s);
                //  if(s.stationType != "基准站") return;
                //  console.log();
                //  let parse = this.parseLatLng({lng:s.lng,lat:s.lat});
                //  s.lng = parse.lng;
                //  s.lat = parse.lat;
                //  tempS.push(s);
                //  console.log("parsed:",parse);
               }
                let icon = this.getIcon(s.TEM);
                let marker =  L.marker({lng:s.lng,lat:s.lat},{icon});
                marker.bindPopup(`
                    <p>站点：${s.stationName}</p>
                    <p>省份：${s.province}</p>
                    <p>时间：${s.Date}</p>
                    <p>经度：${s.lng}</p>
                    <p>纬度：${s.lat}</p>
                    <p>温度：${s.TEM}</p>
                    `
                );
                marker.province = s.province;
                marker.TEM = s.TEM;
                return marker;
            }); 
            this.markers = markers;
        },
        async updateMarkerAndShowDataByDate(){
            this.dateSelect = this.dateSelect.substring(0,13) + ':00:00';
            console.log(typeof this.dateSelect);
            let params = {
                date:this.dateSelect
            }
            try {
                this.fullscreenLoading = true;
                let {data} = await this.getMapWeatherData(params);
                data = this.stationMappingWeatherData(data);
                this.updateRequestData(data);
                this.removeAllMarkers();
                this.createMarkers(data);
                //    this.updateMarkerAndShowDataByProvice();
                this.clearGeoJsonLayer();
                this.updateGeoJson();
                this.addChinaGeoJson();
                if(!this.ciLayerRemoved)
                    this.addMarkersToCiLayer(this.provinceMarkerFilter);
                this.updateShowData(this.provinceWeatherDataFilter);
                this.fullscreenLoading = false;
                this.$message({
                    message: '日期更新完成',
                    type: 'success',
                    duration:1500,
                    offset:60

                });
            } catch (error) {
                this.fullscreenLoading = false;
                this.$message({
                    message: '更新失败：'+error,
                    type: 'error',
                    duration:1500
                });
            }
        },
        updateMarkerAndShowDataByProvice(){
            this.removeAllMarkers();

                this.showCiLayerFromMap();
                this.addMarkersToCiLayer(this.provinceMarkerFilter);
                this.ciLayerRemoved = false;
            
            this.updateShowData(this.provinceWeatherDataFilter);
            if(this.provinceSelect != '全国')
            this.moveMap();
        },
        moveMap(latlng){
            latlng = latlng || this.showMarkers[Math.round(this.showMarkers.length/2)].getLatLng();
            this.map.flyTo(latlng);
        },
        removeAllMarkers(markers){
            markers = markers || this.markers;
           markers.forEach((marker)=>{
                this.ciLayer.removeMarker(marker);
            }); 
             this.ciLayer.redraw();
        },
        addShowMarkers(){

        },
        async getGeoJson(){
           {/*颜色比例卡
             // let colorList = {
            //     '40+':'rgba(225,84,86,.7)',
            //     '40-35':'rgba(254,1,1,.7)',
            //     '35-30':'rgba(254,97,1,.7)',
            //     '30-25':'rgba(254,129,1,.7)',
            //     '25-20':'rgba(254,194,1,.7)',
            //     '20-15':'rgba(254,254,1,.7)',
            //     '15-10':'rgba(221,254,1,.7)',
            //     '10-5':'rgba(147,254,1,.7)',
            //     '5-0':'rgba(17,254,1,.7)',
            //     '0~-5':'rgba(0,254,180,.7)',
            //     '-5~-10':'rgba(0,254,246,.7)',
            //     '-10~-15':'rgba(0,234,254,.7)',
            //     '-15~-20':'rgba(0,234,254,.7)',
            //     '-20~-25':'rgba(0,165,254,.7)',
            //     '-25~-30':'rgba(0,100,254,.7)',
            //     '-30~-35':'rgba(0,13,254,.7)',
            //     '-35~-':'rgba(0,13,254,.7)'
            // };
            */}
            {/*geojson的省份与adcode的映射
            // let list = [
            //     {
            //         "province": "黑龙江",
            //         "value": "230000"
            //     },
            //     {
            //         "province": "内蒙古",
            //         "value": "150000"
            //     },
            //     {
            //         "province": "吉林",
            //         "value": "220000"
            //     },
            //     {
            //         "province": "新疆",
            //         "value": "650000"
            //     },
            //     {
            //         "province": "甘肃",
            //         "value": "620000"
            //     },
            //     {
            //         "province": "青海",
            //         "value": "630000"
            //     },
            //     {
            //         "province": "河北",
            //         "value": "130000"
            //     },
            //     {
            //         "province": "山西",
            //         "value": "140000"
            //     },
            //     {
            //         "province": "宁夏",
            //         "value": "640000"
            //     },
            //     {
            //         "province": "陕西",
            //         "value": "610000"
            //     },
            //     {
            //         "province": "河南",
            //         "value": "410000"
            //     },
            //     {
            //         "province": "辽宁",
            //         "value": "210000"
            //     },
            //     {
            //         "province": "北京",
            //         "value": "110000"
            //     },
            //     {
            //         "province": "天津",
            //         "value": "120000"
            //     },
            //     {
            //         "province": "山东",
            //         "value": "370000"
            //     },
            //     {
            //         "province": "西藏",
            //         "value": "540000"
            //     },
            //     {
            //         "province": "四川",
            //         "value": "510000"
            //     },
            //     {
            //         "province": "云南",
            //         "value": "530000"
            //     },
            //     {
            //         "province": "贵州",
            //         "value": "520000"
            //     },
            //     {
            //         "province": "湖北",
            //         "value": "420000"
            //     },
            //     {
            //         "province": "重庆",
            //         "value": "500000"
            //     },
            //     {
            //         "province": "湖南",
            //         "value": "430000"
            //     },
            //     {
            //         "province": "江西",
            //         "value": "360000"
            //     },
            //     {
            //         "province": "广西",
            //         "value": "450000"
            //     },
            //     {
            //         "province": "广东",
            //         "value": "440000"
            //     },
            //     {
            //         "province": "江苏",
            //         "value": "320000"
            //     },
            //     {
            //         "province": "安徽",
            //         "value": "340000"
            //     },
            //     {
            //         "province": "上海",
            //         "value": "310000"
            //     },
            //     {
            //         "province": "浙江",
            //         "value": "330000"
            //     },
            //     {
            //         "province": "福建",
            //         "value": "350000"
            //     },
            //     {
            //         "province": "海南",
            //         "value": "460000"
            //     }
            // ];
            */}
            // let _map={};
            
            // list.forEach(e=>{
            //     _map[e.value] = e.province;
            // })
            // this._map = _map;

            let geo = ["230000", "150000", "220000", "650000", "620000", "630000", "130000", "140000", "640000", "610000", "410000", "210000", "110000", "120000", "370000", "540000", "510000", "530000", "520000", "420000", "500000", "430000", "360000", "450000", "440000", "320000", "340000", "310000", "330000", "350000", "460000"];
    
            let promises = [];
            geo.forEach((p)=>{
                promises.push(this.$axios.get(`http://localhost:8080/geojson/${p}.json`));
                {/*
                    // data = JSON.parse(data);
                // console.log(data);
                // data.features.forEach = Array.forEach;
                // data.features.forEach();

                // Array.prototype.forEach.call(data.features,(feature)=>{
                //     // console.log(feature.properties.name);
                // })
                // L.geoJSON(data,{style:_style}).addTo(this.map);
                */}
            })
            let res =  Promise.all(promises);
            // console.log(res);
            let {data} = await this.$axios.get(`https://geo.datav.aliyun.com/areas_v2/bound/100000_full.json`);
            this.chinaGeoJson = data;
            return res;
            {/*
                // let {data} = await this.$axios.get('https://geo.datav.aliyun.com/areas_v2/bound/100000_full.json');
                // console.log(data);
                // // let countryGeo = JSON.parse(data);
                // let countryGeoLayer = L.geoJSON(data,{style:_style}).addTo(this.map);

                // countryGeoLayer.on('click',function(e){
                //     console.log(e.layer.feature.properties.name) //当前点击的物体的名称
                // });
                // // countryGeoLayer
                // this.map.eachLayer(l=>{
                //     console.log(l);
                // })
                // console.log(this.map);
                // geo.forEach(async (p)=>{
                //     let {data} = await this.$axios.get(`https://geo.datav.aliyun.com/areas_v2/bound/${p}_full.json`);
                //     L.geoJSON(data,{style:_style}).addTo(this.map)
                // })
                // console.log(geo);
                // console.log();
            */}
        },
        addChinaGeoJson(){
            let myStyle = {
                "color": "#00f",
                "weight": 2,
                "opacity": 0.5,
                fillColor: 'rgba(255, 255, 255,0)'
            };
            L.geoJSON(this.chinaGeoJson,{style:myStyle,onEachFeature:this.onEachFeature}).addTo(this.geoJsonLayerGroup);
        },
        getColor(tem){
            return  tem == 999999 ? 'rgba(0,0,0,1)':
                    tem > 40 ? 'rgba(225,84,86,1)':
                    tem > 35 ? 'rgba(254,1,1,1)':
                    tem > 30 ? 'rgba(254,97,1,1)':
                    tem > 25 ? 'rgba(254,129,1,1)':
                    tem > 20 ? 'rgba(254,194,1,1)':
                    tem > 15 ? 'rgba(254,254,1,1)':
                    tem > 10 ? 'rgba(221,254,1,1)':
                    tem > 5 ? 'rgba(147,254,1,1)':
                    tem > 0 ? 'rgba(17,254,1,1)':
                    tem > -5 ? 'rgba(0,254,180,1)':
                    tem > -10 ? 'rgba(0,254,246,1)':
                    tem > -15 ? 'rgba(0,234,254,1)':
                    tem > -20 ? 'rgba(0,234,254,1)':
                    tem > -25 ? 'rgba(0,165,254,1)':
                    tem > -30 ? 'rgba(0,100,254,1)':
                    tem > -35 ? 'rgba(0,13,254,1)':
                    tem > -40 ? 'rgba(0,13,254,1)':'rgba(0,13,254,1)'
        },
        requestDataMappingGeoJsonDataByStationName(){
            let mappingData = {};
            let reqdata = this.requestData;
            reqdata.forEach((d)=>{
                mappingData[d.stationName] = d;
            })
            // console.log(mappingData);
            return mappingData;
        },
        updateGeoJson(weatherMsg){
            weatherMsg = weatherMsg || 'TEM';
            let t = 0;
            // let news =['嫩江','青冈','呼中','达茂旗','鄂托克旗','海拉尔','临河','集宁','锡林浩特','乌海','永吉','延吉','米泉','呼图壁','博乐','焉耆','阿克苏','乌恰','喀什','和田','精河','托里','阿克达拉','玛纳斯','柯坪','昌吉','福海','库尔勒','博乐','精河','墨玉','克拉玛依','榆中','酒泉','永昌','崆峒','西峰','安定','武都','临夏','合作','平安','互助','同仁','共和','玛沁','玉树','格尔木','正定','榆次','忻府区','离石','泾河','秦都','甘泉','商州','伊川','宝丰','淇县','川汇区','盘山','彰武','大洼','兴城','朝阳','海淀','东丽','东丽','东丽','东丽','东丽','塘沽','文登','墨竹工卡','拉孜','泽当','改则','双流','泸县','什邡','三台','东兴区','蓬安','达川','芦山','马尔康','新龙','德昌','思茅','牟定','个旧','砚山','勐海','大理','芒市','福贡','香格里拉','六枝','桐梓','贞丰','凯里','平塘','大冶','恩施','神农架','长寿','沙坪坝','沙坪坝','沙坪坝','沙坪坝','沙坪坝','垫江','长寿','忠县','石柱','秀山','酉阳','彭水','冷水江','赫山','芷江','吉首','南康','吉安县','宜黄','平南','北流','大新','南海','新会','高要','惠阳','梅县','金坛','盐都','丹徒','桐城','黟县','徐家汇','徐家汇','徐家汇','徐家汇','浦东','浦东','鄞州','柯桥','龙游','定海','洪家','安溪','南靖','建阳','保亭','白沙','昌江','五指山','保亭','保亭','琼中'];
            let mappingData = this.requestDataMappingGeoJsonDataByStationName();
            // console.log(this.provincesGeoJsons);
            let _style = (feature)=>{
                // console.log('得到数值：',feature.properties.value,'得到颜色:',this.getColor(feature.properties.value));
                return {
                            weight: 2,
                            opacity: 1,
                            color: 'white',
                            dashArray: '5',
                            fillOpacity: .5,
                            // rgb(254, 178, 76)
                            //默认是0.2，不重新设置color会很淡     
                            fillColor: this.getColor(feature.properties.value)
                        };
            } 
            this.provincesGeoJsons.forEach((province)=>{
                let features = province.features;
                // let prov = features[0].properties.parent.adcode;
                features.forEach(({properties})=>{
                    // console.log();
                    let data = mappingData[properties.name.slice(0,-1)] || mappingData[properties.name2];
                    if(data){
                        // console.log('已找到数据：',data);
                        //这里的value只能是一个值，用于渲染热力图，默认为TEM，实际上应该通过参数传入
                        properties.value = data[weatherMsg];
                    }else{
                        console.log('geojso地区名为：',properties.name,' 的数据缺失');
                        // properties.name2 = news[t];
                        properties.value = 999999;
                        t++;
                    }
                })
                    // console.log(prov,JSON.stringify(province));
                    //渲染上图
                L.geoJSON(province,{style:_style}).addTo(this.geoJsonLayerGroup);
            })
            console.log(t);
        },
        addProvincesGeoJsons(geojson){
            geojson.forEach(({data})=>{
                this.provincesGeoJsons.push(data);
            })
            // this.provincesGeoJsons  = geojson;
        },
        clearGeoJsonLayer(){
            this.map.removeLayer(this.geoJsonLayerGroup);
            this.geoJsonLayerGroup = new L.LayerGroup();
            this.geoJsonLayerGroup.addTo(this.map);
        },
        onEachFeature(feature, layer){
            layer.on({
                mouseover: this.highlightFeature,
                mouseout: this.resetHighlight,
                click: this.zoomToFeature
            })
        },
        highlightFeature(e){
            let layer = e.target;
            layer.setStyle({
                fillColor: "rgba(255, 255, 255,1)",
                fillOpacity:0.7
            });
            // console.log("highlight",layer);

        },
        resetHighlight(e){
            let layer = e.target;
            layer.setStyle(layer.defaultOptions.style);
        },
        zoomToFeature(e){
            console.log(e.target);
            let specialName = {
                '广西壮族自治区':'广西',
                '西藏自治区':'西藏',
                '新疆维吾尔自治区':'新疆',
                '宁夏回族自治区':'宁夏',
                '内蒙古自治区':'内蒙古'

            }
            this.provinceSelect = specialName[e.target.feature.properties.name] || e.target.feature.properties.name.slice(0,-1);
            this.map.fitBounds(e.target.getBounds());
            this.provinceSelecterDisable = false;
            this.addMarkersToCiLayer(this.provinceMarkerFilter);
            this.updateShowData(this.provinceMarkerFilter);
            this.showCiLayerFromMap();

            let center = e.target.feature.properties.center;
            // this.map.flyToBounds(e.target.getBounds());
            // this.map.flyTo({lat:center[1],lng:center[0]});
            
            
            
        },
        addCiLayerToMap(){
            this.ciLayer.addTo(this.map);
        },
        hideCiLayerFromMap(){
            // this.ciLayerLayersGroup.setZIndex(99);
            this._data._ciLayerDOM.style.zIndex = '99';
            
        },
        showCiLayerFromMap(){
            this._data._ciLayerDOM.style.zIndex = '100';
        },
        changeSelectProvinceMode(){
            // console.log(e);
            this.ciLayerRemoved = true;
            this.provinceSelect = '选择中';
            this.provinceSelecterDisable = true;
            this.removeAllMarkers();
            this.hideCiLayerFromMap();
            this.$message({
                    message: '点击高亮区域选择省份',
                    type: 'info',
                    duration:2000,
                    offset:60

                });
        },
        getIcon(tem){

            //假设是温度
            let url =  
                    tem == 999999 ? 'TEM999999.svg':
                    tem > 40 ? 'TEM40.svg':
                    tem > 35 ? 'TEM35.svg':
                    tem > 30 ? 'TEM30.svg':
                    tem > 25 ? 'TEM25.svg':
                    tem > 20 ? 'TEM20.svg':
                    tem > 15 ? 'TEM15.svg':
                    tem > 10 ? 'TEM10.svg':
                    tem > 5 ? 'TEM5.svg': 
                    tem > 0 ? 'TEM0.svg':
                    tem > -5 ? 'TEM-5.svg':
                    tem > -10 ? 'TEM-10.svg':
                    tem > -15 ? 'TEM-15.svg':
                    tem > -20 ? 'TEM-20.svg':
                    tem > -25 ? 'TEM-25.svg':
                    tem > -30 ? 'TEM-30.svg':
                    tem > -35 ? 'TEM-35.svg':
                    tem > -40 ? 'TEM-40.svg':'TEM-40.svg';
            url = 'TEMdots/' + url;
            // console.log(url);
            if (this.iconList[url])  return  this.iconList[url];
            let icon =L.icon({
                iconUrl: url,
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            });
            this.iconList[url] = icon;
            return icon;
        },
        handleBarChartSelect(range){
            // console.log("得到范围：",range);
            let selectTEMRange = range.split("~");
            let max,min;
            // console.log(selectTEMRange);
                if(selectTEMRange.length==2){
                   max = parseInt(selectTEMRange[0]);
                   min = parseInt(selectTEMRange[1]);
                }else{
                  selectTEMRange =  range.split("+");
                  let exValue = parseInt(selectTEMRange[0]);
                  if (exValue > 0) {
                      //此处为筛选超过40度的
                      max = 99;
                      min = exValue;
                  }else{
                      //此处为筛选低于-35度的
                      max = exValue;
                      min = -99;
                  }
                }
                // console.log("得到最大最小值：",max,min);
                //让Map执行removeAllMarkers
                this.removeAllMarkers();
                //对showMarkers执行addMarkersToCiLayer操作
                if(this.provinceSelect == '全国' && this.map.getZoom()>5)
                    this.map.setZoom(5);
                this.addMarkersToCiLayer(this.rangeMarkerHighLevFilter(max,min),this.showMarkers,true);
                //不需要改变showData
        },
        handleBarChartCancelSelect(){
            this.removeAllMarkers();
            //对showMarkers执行addMarkersToCiLayer操作
            this.addMarkersToCiLayer(undefined,this.showMarkers,true);
        }

    },
    components:{
        Legend,
    }
    
}
</script>

<style lang="less" scoped>
.el-notification.notifyclass.right{
    right: 25%;
}
.z-down{
    z-index: 101;
}
.map-app{
    height: 100%;
    position: relative;
    #map{
        height: 100%;
        overflow: hidden;
    }
    .legend{
        position: absolute;
        bottom: 17px;
        right: 0px;
        width: 15%;
        z-index: 1900;

    }
    .restrict_select{
        position: absolute;
        top: 10px;
        left: 60px;
        z-index: 1900;
        .el-date-editor.el-input.el-input--prefix.el-input--suffix.el-date-editor--datetime{
            margin-left: 15px;
        }
    }
    .map_axis_msg{
        position: absolute;
        bottom: 0px;
        width: 99%;
        height: 15px;
        overflow: hidden;

        // padding: 0 2px;
        padding: 1px 0;
        padding-left: 1%;
        background-color: rgba(255, 255, 255, 0.6);
        z-index: 1900;
        font-size: 15px;
        font-weight: bold;
    }
    .function-bar{
        position: absolute;
        top:5px;
        right: 5px;
        width: 40px;
        height: 40px;
        z-index: 2001;

    }
}

</style>