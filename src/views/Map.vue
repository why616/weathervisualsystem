<template>
<div class="map-app" v-loading.fullscreen.lock="fullscreenLoading" >
  <div id="map">
     
  </div>
  <div class="restrict_select">
    <el-select v-model="provinceSelect" @change="updateMarkerAndprovinceDataByProvice"  label="全国" placeholder="请选择" :disabled="provinceSelecterDisable">
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
      @change="updateMarkerAndprovinceDataByDate"
      >
    </el-date-picker>
     <el-select v-model="weatherType" @change="changeShowWeatherType" label="温度" placeholder="请选择">
      <el-option
        v-for="item in weatherTyes_options"
        :key="item.value"
        :label="item.label"
        :value="item.value">
      </el-option>
    </el-select>
  </div>
  <div class="filter-area">
      
  </div>
  <div class="legend">
      <Legend :range_color="legend" />
  </div>
  <div class="map_axis_msg">
      <pre>地图中心-> Lat（纬度）：{{currentLatLng.lat}} Lng（经度）：{{currentLatLng.lng}}           地图层级->  {{currentZoomLev}}</pre>
  </div>
  <div class="function-bar">
      <el-button type="primary" icon="el-icon-cloudy" @click="changeShowWeatherIcon"  circle></el-button>
      <el-button type="primary" icon="el-icon-map-location" @click="changeSelectProvinceMode" circle></el-button>
  </div>
  <div class="filter-area">
      <filter-controller v-for="f in filterList" :filterList="f" @filterControllerCancel="handleBarChartCancelSelect" :key="f.key" />
  </div>
</div>
</template>

<script>
// import 'leaflet/dist/leaflet.css'
// import L from 'leaflet'
// import 'leaflet-canvas-marker';
import HeatmapOverlay from "leaflet-heatmap"
import Legend from "@/components/Legend.vue"
import "../../src/assets/css/panel.less"
// import Filter from "@/components/Filter.vue"
import FilterController from '../components/FilterController.vue'
export default {
    created(){
        // this.createNewWeatherTypeData();
    },
    mounted(){
        
        this.fullscreenLoading = true; 
        //设置chart传递的事件的监听
        this.$bus.$on('bar-chart-select',this.handleBarChartSelect);
        this.$bus.$on('bar-chart-cancel-select',this.handleBarChartCancelSelect);
        this.$bus.$on('mid-pileBar-select',this.handleMidPileBarSelect);

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
        
        
        this.map.on('zoomend',this.onZoomLevChange);
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
            provinceData:{},
            showData:[],
            requestData:{},
            //地图上所有的点，要显示的点将在所有点中进行筛选后形成
            provinceMarkers:[],
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
                    let end = new Date(2021,3,23,12,0,0);
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
            provinceSelecterDisable:false,
            weatherType:'TEM',
            weatherTyes_options:[
                {label:'温度',value:'TEM'},
                {label:'最高温度',value:'TEM_Max'},
                {label:'最低温度',value:'TEM_Min'},
                {label:'相对湿度',value:'RHU'},
                // {label:'水汽压',value:'VAP'},
                {label:'气压',value:'PRS'},
                {label:'海平面气压',value:'PRS_Sea'},
                {label:'最高气压',value:'PRS_Max'},
                {label:'最低气压',value:'PRS_Min'},
                {label:'一小时降雨量',value:'PRE_1h'},
                {label:'体感温度',value:'tigan'},
                {label:'风力',value:'windpower'},
                {label:'能见度',value:'VIS'},
                {label:'总云量',value:"CLO_Cov"},
                {label:'现在天气',value:"WEP_Now"}
            ],
            preZoomRange:7,
            showWeatherFlag:false,
            markersFilters:{},
            provinceDataFilters:{},
            chartFilterList:{
                left_1_multFilter:{},
                left_2_multFilter:{},
                right_1_multFilter:{},
                right_2_multFilter:{},
                right_3_multFilter:{},
                mid_pileBar_multFilter:{}
            },
            filterList:[],
            lastDate:''

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
           this.updateProvinceData();
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
            //     // this.provinceData = data;
                
            //     let heatData = this.stationMappingWeatherData(data);
            //     this.requestData = heatData;
            //     this.provinceData = heatData;
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
            // let id_province = [
            //      'stationId',
            //      'province',
            // ]
            let newStations = this.copyStationsRestrictAttr(...attrArr);
            // let newStations1 = this.copyStationsRestrictAttr(...id_province);
            let t = 0;
            // console.log("id_province",JSON.stringify(newStations1));
            // console.log("data",data);
            let lostDataStationsErrMsg = ['<div style="width:103%;max-height:210px;overflow:auto;padding-right:11px">'];
            newStations.forEach( s =>{
                if(data[t] && s.stationId == parseInt(data[t].Station_Id_C)){
                    //需要的服务器点天气数据从这里添加
                    s.Date = data[t].Date;
                    s.TEM = data[t].TEM;
                    // console.log("数据匹配中：",s.province,data[t].province);
                    // s.province = data[t].province;
                    // console.log("数据匹配后：",s.province);
                    // s.TEM = data[t].TEM;
                    s.TEM_Max = data[t].TEM_Max;
                    s.TEM_Min = data[t].TEM_Min;
                    s.RHU = data[t].RHU;
                    s.PRS = data[t].PRS;
                    s.VAP = data[t].VAP;
                    s.PRE_1h = data[t].PRE_1h;
                    s.WEP_Now = data[t].WEP_Now;
                    s.tigan = data[t].tigan;
                    s.windpower = data[t].windpower;
                    s.VIS = data[t].VIS/1000;
                    s.CLO_Cov = data[t].CLO_Cov;
                    s.WEP_Now = data[t].WEP_Now;
                    s.PRS_Sea = data[t].PRS_Sea;
                    s.PRS_Max = data[t].PRS_Max;
                    s.PRS_Min = data[t].PRS_Min;

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
                    s.RHU = 999999;
                    // s.TEM = 999999;
                    s.TEM_Max = 999999;
                    s.TEM_Min = 999999;
                    // s.RHU = 999999;
                    s.PRS = 999999;
                    s.VAP = 999999;
                    s.PRE_1h = 999999;
                    s.WEP_Now = 999999;
                    s.tigan = 999999;
                    s.windpower = 999999;
                    s.VIS = 999999;
                    s.CLO_Cov = 999999;
                    s.WEP_Now = 999999;
                    s.TEM = 999999;
                    s.PRS_Sea = 999999;
                    s.PRS_Max = 999999;
                    s.PRS_Min = 999999;
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
        addMarkersToCiLayer(filtersFn,baseMarkers,keepShowMarker,dontAdd){
            // keepShowMarker = !keepShowMarker;
            // dontAdd = !dontAdd;
            // console.log("pre");
            // this.map.eachLayer(l=>{
            //     console.log(l);
            // })
            // console.log(markers);
            let newMarkers = [];
            
            filtersFn = filtersFn || {'provinceMarkerFilter':this.provinceMarkerFilter};
            
            
            baseMarkers = baseMarkers || this.markers;
            // console.log("将移除",baseMarkers.length);
            // this.removeAllMarkers();
            baseMarkers.forEach((marker)=>{
                // this.ciLayer.removeMarker(marker);
                for (const filter in filtersFn) {
                    if (Object.hasOwnProperty.call(filtersFn, filter) && filtersFn[filter]) {
                       if(!filtersFn[filter](marker)) return ; 
                    }
                }
                newMarkers.push(marker);
            });

            // console.log(markers);
            // this.ciLayer.redraw();
            // this.ciLayer.bringToFront();
            // console.log(this.ciLayer);
            
            if(!dontAdd){
                this.ciLayer.addLayers(newMarkers);
                this.showMarkers = newMarkers;
                this.$store.commit('updateShowMarkers',newMarkers);
                console.log("本次将添加点",newMarkers);
            } 
            else console.log("本次不会添加点");
            if(!keepShowMarker)
                this.provinceMarkers = newMarkers;
            else
                console.log("本次不更新provincedata");
            console.log("筛选器：",this.left_1_multFilter);
            
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
                // console.log(this.provinceData);
            if(data.province == this.provinceSelect 
                         || this.provinceSelect == '全国') return data;
        },
        rangeMarkerHighLevFilter(max,min,weatherType){
            weatherType = weatherType || this.weatherType;
            return (marker)=>{
                // console.log("该marker的TEM:",marker.TEM,"最大最小值:",max,min);
                if (marker[weatherType] < max && marker[weatherType] >= min){
                    //  console.log(`合格: max:${max} min:${min} value:${marker[weatherType]}`);
                    return marker;
                }  
                // else console.log(`不合格: max:${max} min:${min} value:${marker[weatherType]}`);
            }
        },
        onZoomLevChange(e){
            this.currentZoomLev = Math.round(this.map.getZoom());
            // console.log(this.currentZoomLev);
            // this.handleIconSizeByZoomLev(this.currentZoomLev);
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
        updateProvinceData(filtersFn,baseWeatherData){
            let newProvinceData = [];

            filtersFn = filtersFn || {'provinceWeatherDataFilter':this.provinceWeatherDataFilter};
            
            
            baseWeatherData = baseWeatherData || this.requestData;

            // console.log("将移除",baseMarkers.length);
            // this.removeAllMarkers();
            baseWeatherData.forEach((data)=>{
                // this.ciLayer.removeMarker(marker);
                for (const filter in filtersFn) {
                    if (Object.hasOwnProperty.call(filtersFn, filter)) {
                       if(!filtersFn[filter](data)) return ; 
                    }
                }
                newProvinceData.push(data);
            });
            this.$store.commit('updateProvinceData',newProvinceData);
            this.provinceData = newProvinceData;
        },
        createMarkers(data,orderedWeatherType){
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
               
                let icon = this.getIcon(s[orderedWeatherType || this.weatherType],orderedWeatherType);
                let marker =  L.marker({lng:s.lng,lat:s.lat},{icon});
                //这里是固定内容，但是还没写完全
                let weather_now = undefined;
                switch (s.WEP_Now) {
                    case '0.0000':
                        weather_now = "晴";
                        break;
                    
                    case '5.0000':
                    case '6.0000':
                    case '7.0000':
                         weather_now = "尘";
                        break;
                    case '10.0000':
                         weather_now = "薄雾";
                        break;
                    case '21.0000':
                    case '20.0000':
                    case '60.0000':
                    case '62.0000':
                    case '50.0000':
                         weather_now = "雨";
                        break;
                    case '28.0000':
                    case '44.0000':
                    case '45.0000':
                    case '46.0000':
                         weather_now = "大雾";
                        break;
                    case '70.0000':
                    case '22.0000':
                    case '74.0000':
                         weather_now = "雪";
                        break;
                    case 999999:
                    case '999999.0000':
                         weather_now = "天气缺测";   
                    default:
                        break;
                }
                marker.bindPopup(`
                    <div class="weather-panel">
                        <div class="weather-panel-title">
                            <span>${s.province}省${s.stationName}站（${s.Date}）</span>
                        </div>
                        <div class="weather-panel-content">
                            <div class="weather-panel-content-line">
                                <div class="item">  
                                    <div class="img qiwen"></div>
                                    <span>${parseFloat(s.TEM).toFixed(1)==999999.0?'缺测':parseFloat(s.TEM).toFixed(1)}℃</span>
                                </div>
                                <div class="item ">
                                    <div class="img gaowen"></div>
                                    <span>${parseFloat(s.TEM_Max).toFixed(1)==999999.0?'缺测':parseFloat(s.TEM_Max).toFixed(1)}℃</span>
                                </div>
                                <div class="item ">
                                    <div class="img diwen"></div>
                                    <span>${parseFloat(s.TEM_Min).toFixed(1)==999999.0?'缺测':parseFloat(s.TEM_Min).toFixed(1)}℃</span>
                                </div>
                                <div class="item">
                                    <div class="img tigan"></div>
                                    <span>${parseFloat(s.tigan).toFixed(1)==999999.0?'缺测':parseFloat(s.tigan).toFixed(1)}℃</span>
                                </div>
                                <div class="item">
                                    <div class="img rhu"></div>
                                    <span>${parseFloat(s.RHU).toFixed(1)==999999.0?'缺测':parseFloat(s.RHU).toFixed(1)}%</span>
                                </div>
                            </div>
                            <div class="weather-panel-content-line">  
                                <div class="item"> 
                                    <div class="img prs"></div>
                                    <span>${parseFloat(s.PRS).toFixed(0)==999999.0?'缺测':parseFloat(s.PRS).toFixed(0)}hPa </span>
                                </div>
                                <div class="item">
                                    <div class="img pre"></div>
                                    <span> ${parseFloat(s.PRE_1h).toFixed(1)==999999.0?'缺测':parseFloat(s.PRE_1h).toFixed(1)}mm</span>
                                </div>
                                <div class="item">
                                    <div class="img windpower"></div>
                                    <span>${parseFloat(s.windpower).toFixed(0)==999999.0?'缺测':parseFloat(s.windpower).toFixed(0)}级</span>
                                </div>
                                <div class="item">
                                    <div class="img vis"></div>
                                    <span>${parseFloat(s.VIS).toFixed(1)==999999.0?'缺测':parseFloat(s.VIS).toFixed(1)}KM</span>
                                </div>
                                <div class="item">
                                    <div class="img clo-cov"></div>
                                    <span>${parseFloat(s.CLO_Cov).toFixed(0)==999999.0?'缺测':parseFloat(s.CLO_Cov).toFixed(0)}%</span>
                                </div>
                            
                            </div>
                        </div>
                    </div>
                    `
                );
                if(!weather_now) console.log(`${s.province} ${s.stationName} ${s.WEP_Now}`)
                 
                //在这里附上值，供Filter筛选
                marker.province = s.province;
                marker.TEM = s.TEM;
                marker.TEM_Max = s.TEM_Max;
                marker.TEM_Min = s.TEM_Min;
                marker.RHU = s.RHU;
                marker.PRS = s.PRS;
                marker.VAP = s.VAP;
                marker.PRE_1h = s.PRE_1h;
                marker.WEP_Now = s.WEP_Now;
                marker.tigan = s.tigan;
                marker.windpower = s.windpower;
                marker.VIS = s.VIS;
                marker.CLO_Cov = s.CLO_Cov;
                marker.WEP_Now = s.WEP_Now;
                marker.PRS_Sea = s.PRS_Sea;
                marker.PRS_Max = s.PRS_Max;
                marker.PRS_Min = s.PRS_Min;

                return marker;
            }); 
            this.markers = markers;
        },
        async updateMarkerAndprovinceDataByDate(date){
            date = date || this.dateSelect.substring(0,13) + ':00:00';
            this.dateSelect = date;
            // console.log(typeof this.dateSelect);
            let params = {
                date
            }
            try {
                this.fullscreenLoading = true;
                let {data} = await this.getMapWeatherData(params);
                data = this.stationMappingWeatherData(data);
                this.updateRequestData(data);
                this.removeAllMarkers();
                if(this.showWeatherFlag)
                    this.createMarkers(data,'WEP_Now');
                else
                    this.createMarkers(data);
                //    this.updateMarkerAndprovinceDataByProvice();
                this.clearGeoJsonLayer();
                this.updateGeoJson(this.weatherType);
                this.addChinaGeoJson();
                // this.addFilter(this.markersFilters,this.provinceMarkerFilter,'provinceMarkerFilter');
                // this.addFilter(this.provinceDataFilters,this.provinceWeatherDataFilter,'provinceWeatherDataFilter');
                if(!this.ciLayerRemoved){
                    this.updateprovinceMarkers();
                    this.addMarkersToCiLayer(this.markersFilters,this.provinceMarkers,true);
                }
                this.updateProvinceData();
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
        updateMarkerAndprovinceDataByProvice(){
            
            this.removeAllMarkers();
            // this.addFilter(this.markersFilters,this.provinceMarkerFilter,'provinceMarkerFilter');
            // this.addFilter(this.provinceDataFilters,this.provinceWeatherDataFilter,'provinceWeatherDataFilter');
            this.showCiLayerFromMap();
            this.updateprovinceMarkers();
            
            this.addMarkersToCiLayer(this.markersFilters,this.provinceMarkers,true);
            this.ciLayerRemoved = false;
            
            this.updateProvinceData();
            if(this.provinceSelect != '全国')
            this.moveMap();
        },
        moveMap(latlng){
            latlng = latlng || this.provinceMarkers[Math.round(this.provinceMarkers.length/2)].getLatLng();
            this.map.flyTo(latlng);
        },
        removeAllMarkers(markers){
            markers = markers || this.markers;
           markers.forEach((marker)=>{
                this.ciLayer.removeMarker(marker);
            }); 
             this.ciLayer.redraw();
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
            let {data} = await this.$axios.get(/*`https://geo.datav.aliyun.com/areas_v2/bound/100000_full.json`*/`http://localhost:8080/geojson/100000.json`);
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
        getColor(value){
            let color = 'rgba(0,0,0,1)';
            switch (this.weatherType) {
                case 'TEM':
                case 'TEM_Max':
                case 'TEM_Min':
                 case 'tigan':
                   color =  value == 999999 ? 'rgba(0,0,0,1)':
                            value >= 40 ? 'rgba(225,84,86,1)':
                            value >= 35 ? 'rgba(254,1,1,1)':
                            value >= 30 ? 'rgba(254,97,1,1)':
                            value >= 25 ? 'rgba(254,129,1,1)':
                            value >= 20 ? 'rgba(254,194,1,1)':
                            value >= 15 ? 'rgba(254,254,1,1)':
                            value >= 10 ? 'rgba(221,254,1,1)':
                            value >= 5 ? 'rgba(147,254,1,1)':
                            value >= 0 ? 'rgba(17,254,1,1)':
                            value >= -5 ? 'rgba(0,254,180,1)':
                            value >= -10 ? 'rgba(0,254,246,1)':
                            value >= -15 ? 'rgba(0,234,254,1)':
                            value >= -20 ? 'rgba(0,234,254,1)':
                            value >= -25 ? 'rgba(0,165,254,1)':
                            value >= -30 ? 'rgba(0,100,254,1)':
                            value >= -35 ? 'rgba(0,13,254,1)':
                            value >= -40 ? 'rgba(0,13,254,1)':'rgba(0,13,254,1)'
                    break;
                case 'RHU':
                    color = value == 999999 ? 'rgba(0,0,0,1)':
                            value >= 100 ? 'rgba(8,0,0,1)':
                            value >= 90 ? 'rgba(51,13,128,1)':
                            value >= 80 ? 'rgba(70,33,164,1)':
                            value >= 70 ? 'rgba(84,64,182,1)':
                            value >= 60 ? 'rgba(67,73,201,1)':
                            value >= 50 ? 'rgba(238,253,202,1)':
                            value >= 40 ? 'rgba(249,250,213,1)':
                            value >= 30 ? 'rgba(247,79,20,1)':
                            value >= 20 ? 'rgba(252,38,3,1)':
                            value >= 10 ? 'rgba(231,0,0,1)':
                            value >= 0 ? 'rgba(213,6,55,1)':'rgba(213,6,55,1)'
                    break;
                case 'PRE_1h':
                    color = value == 999999 ? 'rgba(0,0,0,1)':
                            value >= 50 ? 'rgba(141,45,105,1)':
                            value >= 20 ? 'rgba(217,106,55,1)':
                            value >= 10 ? 'rgba(237,45,251,1)':
                            value >= 8 ? 'rgba(41,137,112,1)':
                            value >= 6 ? 'rgba(41,45,231,1)':
                            value >= 4 ? 'rgba(117,189,255,1)':
                            value >= 2 ? 'rgba(89,191,103,1)':
                            value >= 1 ? 'rgba(171,235,167,1)':
                            value >= 0.01 ? 'rgba(203,244,202,1)':
                            value >= 0 ? 'rgba(245,245,245,1)':'rgba(245,245,245,1)'
                    break;
                case 'PRS':
                case 'PRS_Sea':
                case 'PRS_Max':
                case 'PRS_Min':
                    color = value == 999999 ? 'rgba(0,0,0,1)':
                            value >= 1030 ? 'rgba(0,18,218,1)':
                            value >= 1020 ? 'rgba(0,117,255,1)':
                            value >= 1010 ? 'rgba(87,216,253,1)':
                            value >= 1000 ? 'rgba(9,234,203,1)':
                            value >= 990 ? 'rgba(14,211,119,1)':
                            value >= 980 ? 'rgba(10,179,21,1)':
                            value >= 970 ? 'rgba(132,217,142,1)':
                            value >= 920 ? 'rgba(189,244,9,1)':
                            value >= 870 ? 'rgba(244,244,15,1)':
                            value >= 820 ? 'rgba(255,218,8,1)':
                            value >= 770 ? 'rgba(252,179,8,1)':
                            value >= 720 ? 'rgba(250,135,3,1)':
                            value >= 670 ? 'rgba(255,71,0,1)':
                            value >= 620 ? 'rgba(251,8,1,1)':
                            value >= 570 ? 'rgba(190,4,51,1)':
                            value >= 520 ? 'rgba(124,3,108,1)':'rgba(124,3,108,1)'
                    break;
                case 'windpower':
                    color = value == 999999 ? 'rgba(0,0,0,1)':
                            value >= 7 ? 'rgba(4,54,250,1)':
                            value >= 6 ? 'rgba(2,209,251,1)':
                            value >= 5 ? 'rgba(0,237,196,1)':
                            value >= 4 ? 'rgba(26,187,11,1)':
                            value >= 3 ? 'rgba(123,215,8,1)':
                            value >= 2 ? 'rgba(254,190,1,1)':
                            value >= 1 ? 'rgba(255,39,2,1)':
                            value >= 0 ? 'rgba(88,0,135,1)':'rgba(88,0,135,1)'
                    break;
                case 'VIS':
                    color = value == 999999 ? 'rgba(0,0,0,1)':
                            value >= 30 ? 'rgba(241,245,253,1)':
                            value >= 20 ? 'rgba(197,232,252,1)':
                            value >= 10 ? 'rgba(152,220,253,1)':
                            value >= 5 ? 'rgba(135,244,89,1)':
                            value >= 3 ? 'rgba(240,240,56,1)':
                            value >= 2 ? 'rgba(240,181,114,1)':
                            value >= 1 ? 'rgba(240,109,55,1)':
                            value >= 0.5 ? 'rgba(234,50,55,1)':
                            value >= 0.2 ? 'rgba(162,56,255,1)':
                            value >= 0 ? 'rgba(130,73,55,1)':'rgba(130,73,55,1)'
                    break;
                case 'CLO_Cov':
                    color = value == 100 ? 'rgba(213,213,205,1)':
                            value >= 90 ? 'rgba(207,208,202,1)':
                            value >= 80 ? 'rgba(195,197,196,1)':
                            value >= 70 ? 'rgba(177,186,185,1)':
                            value >= 60 ? 'rgba(178,186,185,1)':
                            value >= 30 ? 'rgba(154,161,160,1)':
                            value >= 20 ? 'rgba(122,118,101,1)':
                            value >= 10 ? 'rgba(132,119,70,1)':
                            value >= 0 ? 'rgba(164,154,118,1)':'rgba(164,154,118,1)'
                    break;
                default:
                    break;
            }
            return color
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
                            fillOpacity: .6,
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
            this.ciLayerRemoved = false;
            // this.addFilter(this.markersFilters,this.provinceMarkerFilter,'provinceMarkerFilter');
            // this.addFilter(this.provinceDataFilters,this.provinceWeatherDataFilter,'provinceWeatherDataFilter');
            this.updateprovinceMarkers();
            // this.removeAllMarkers();
            this.addMarkersToCiLayer(this.markersFilters,this.provinceMarkers,true);
            this.updateProvinceData();
            this.showCiLayerFromMap();
            // this.map.setMaxBounds(e.target.getBounds());
            let center = e.target.feature.properties.center;
            // this.map.flyToBounds(e.target.getBounds());
            // this.map.flyTo({lat:center[1],lng:center[0]});
            
            
            
        },
        addCiLayerToMap(){
            this.ciLayer.addTo(this.map);
        },
        hideCiLayerFromMap(){
            // this.ciLayerLayersGroup.setZIndex(99);
            this._data._ciLayerDOM.style.zIndex = '-999999';
            
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
        getIcon(value,orderedWeatherType){
            let url  = 'TEM999999.svg';
            switch (orderedWeatherType || this.weatherType) {
                case 'tigan':
                case 'TEM_Min':
                case 'TEM_Max':
                case 'TEM':
                    // console.log('获得当前选择：温度',this.weatherType);
                    url =  
                        value == 999999 ? 'TEM999999.svg':
                        value >= 40 ? 'TEM40.svg':
                        value >= 35 ? 'TEM35.svg':
                        value >= 30 ? 'TEM30.svg':
                        value >= 25 ? 'TEM25.svg':
                        value >= 20 ? 'TEM20.svg':
                        value >= 15 ? 'TEM15.svg':
                        value >= 10 ? 'TEM10.svg':
                        value >= 5 ? 'TEM5.svg': 
                        value >= 0 ? 'TEM0.svg':
                        value >= -5 ? 'TEM-5.svg':
                        value >= -10 ? 'TEM-10.svg':
                        value >= -15 ? 'TEM-15.svg':
                        value >= -20 ? 'TEM-20.svg':
                        value >= -25 ? 'TEM-25.svg':
                        value >= -30 ? 'TEM-30.svg':
                        value >= -35 ? 'TEM-35.svg':
                        value >= -40 ? 'TEM-40.svg':'TEM-40.svg';
                    url = 'TEMdots/' + url;

                    break;
                case 'PRS':
                case 'PRS_Sea':
                case 'PRS_Max':
                case 'PRS_Min':
                    //待填入，气压
                    // console.log('获得当前选择：气压',this.weatherType);
                    url = 
                        value == 999999 ? 'PRS999999.svg':
                        value >= 1030 ? 'PRS1030.svg':
                        value >= 1020 ? 'PRS1020.svg':
                        value >= 1010 ? 'PRS1010.svg':
                        value >= 1000 ? 'PRS1000.svg':
                        value >= 990 ? 'PRS990.svg':
                        value >= 980 ? 'PRS980.svg':
                        value >= 970 ? 'PRS970.svg':
                        value >= 920 ? 'PRS920.svg':
                        value >= 870 ? 'PRS870.svg':
                        value >= 820 ? 'PRS820.svg':
                        value >= 770 ? 'PRS770.svg':
                        value >= 720 ? 'PRS720.svg':
                        value >= 670 ? 'PRS670.svg':
                        value >= 620 ? 'PRS620.svg':
                        value >= 570 ? 'PRS570.svg':
                        value >= 520 ? 'PRS520.svg':'PRS520.svg'
                    url = 'PRSdots/' + url;

                    break;
                case 'RHU':
                    //相对湿度
                    // console.log('获得当前选择：相对湿度',this.weatherType);
                    url = 
                        value == 999999 ? 'RHU999999.svg':
                        value >= 100 ? 'RHU100.svg':
                        value >= 90 ? 'RHU90.svg':
                        value >= 80 ? 'RHU80.svg':
                        value >= 70 ? 'RHU70.svg':
                        value >= 60 ? 'RHU60.svg':
                        value >= 50 ? 'RHU50.svg':
                        value >= 40 ? 'RHU40.svg':
                        value >= 30 ? 'RHU30.svg':
                        value >= 20 ? 'RHU20.svg':
                        value >= 10 ? 'RHU10.svg':
                        value >= 0 ? 'RHU0.svg':'RHU0.svg'
                    url = 'RHUdots/' + url;
                    break;

                case 'PRE_1h':
                    // console.log('获得当前选择：一小时降雨',this.weatherType);
                    url = 
                        value == 999999 ? 'PRE_1h999999.svg':
                        value == 50 ? 'PRE_1h50.svg':
                        value >= 20 ? 'PRE_1h20.svg':
                        value >= 10 ? 'PRE_1h10.svg':
                        value >= 8 ? 'PRE_1h8.svg':
                        value >= 6 ? 'PRE_1h6.svg':
                        value >= 4 ? 'PRE_1h4.svg':
                        value >= 2 ? 'PRE_1h2.svg':
                        value >= 1 ? 'PRE_1h1.svg':
                        value >= 0.01 ? 'PRE_1h0.01.svg':
                        value >= 0 ? 'PRE_1h0.svg':'PRE_1h0.svg'
                    url = 'PRE_1hdots/' + url;
                    break;
                case 'windpower':
                    // console.log('获得当前选择：风力',this.weatherType);
                    url = value == 999999 ? 'windpower999999.svg':
                            value >= 7 ? 'windpower7.svg':
                            value >= 6 ? 'windpower6.svg':
                            value >= 5 ? 'windpower5.svg':
                            value >= 4 ? 'windpower4.svg':
                            value >= 3 ? 'windpower3.svg':
                            value >= 2 ? 'windpower2.svg':
                            value >= 1 ? 'windpower1.svg':
                            value >= 0 ? 'windpower0.svg':'windpower0.svg'
                    url = 'windpowerdots/' + url;
                    
                    break;
                case 'VIS':
                    // console.log('获得当前选择：能见度',this.weatherType);
                    url = value == 999999 ? 'VIS999999.svg':
                        value >= 30 ? 'VIS30.svg':
                        value >= 20 ? 'VIS20.svg':
                        value >= 10 ? 'VIS10.svg':
                        value >= 5 ? 'VIS5.svg':
                        value >= 3 ? 'VIS3.svg':
                        value >= 2 ? 'VIS2.svg':
                        value >= 1 ? 'VIS1.svg':
                        value >= 0.5 ? 'VIS0.5.svg':
                        value >= 0.2 ? 'VIS0.2.svg':
                        value >= 0 ? 'VIS0.svg':'VIS0.svg'
                    url = 'VISdots/' + url;

                    break;
                case 'CLO_Cov':
                    // console.log('获得当前选择：能见度',this.weatherType);
                    url = 
                        value == 100 ? 'CLO_Cov100.svg':
                        value >= 90 ? 'CLO_Cov90.svg':
                        value >= 80 ? 'CLO_Cov80.svg':
                        value >= 70 ? 'CLO_Cov70.svg':
                        value >= 60 ? 'CLO_Cov60.svg':
                        value >= 30 ? 'CLO_Cov30.svg':
                        value >= 20 ? 'CLO_Cov20.svg':
                        value >= 10 ? 'CLO_Cov10.svg':
                        value >= 0 ? 'CLO_Cov0.svg':'CLO_Cov0.svg'
                    url = 'CLO_Covdots/' + url;
                    
                    break;
                case 'WEP_Now':
                    // console.log('获得当前选择：能见度',this.weatherType);
                  let weather_now;
                  switch (value) {
                    case '0.0000':
                        weather_now = "sunny.png";
                        break;
                    
                    case '5.0000':
                    case '6.0000':
                    case '7.0000':
                         weather_now = "dust.png";
                        break;
                    case '10.0000':
                         weather_now = "cloudy.png";
                        break;
                    case '21.0000':
                    case '20.0000':
                    case '60.0000':
                    case '62.0000':
                    case '50.0000':
                         weather_now = "rain.png";
                        break;
                    case '28.0000':
                    case '44.0000':
                    case '45.0000':
                    case '46.0000':
                         weather_now = "cloudy.png";
                        break;
                    case '70.0000':
                    case '22.0000':
                    case '74.0000':
                         weather_now = "snow.png";
                        break;
                    case 999999:
                    case '999999.0000':
                         weather_now = "lost.svg";   
                    default:
                         weather_now = "lost.svg";   

                        break;
                }

                    url = 'WEP_Nowdots/'+weather_now;
                    if (this.iconList[url])  return  this.iconList[url];
                    icon =L.icon({
                        iconUrl: url,
                        iconSize: [30, 30],
                        iconAnchor: [15, 15]
                    });
                    this.iconList[url] = icon;
                    break;
                default:
                    console.log('该选择不存在！：',this.weatherType);

                    break;
            }
            // console.log(url); 
            // let currZoom = this.map.getZoom();
            let icon = undefined;
            if (this.iconList[url])  return  this.iconList[url];
            icon =L.icon({
                iconUrl: url,
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            });
            this.iconList[url] = icon;
            return icon;
        },
        handleBarChartSelect({range,chartOrigin,weatherType}){
            weatherType = weatherType || this.weatherType;
            // console.log("得到范围：",range);
            let selectTEMRange = range.split("~");
            let max,min;
            // console.log(selectTEMRange);
                if(selectTEMRange.length==2){
                   max = parseFloat(selectTEMRange[0]);
                   min = parseFloat(selectTEMRange[1]);
                }else{
                  selectTEMRange =  range.split("+");
                  let exValue = parseFloat(selectTEMRange[0]);
                  if(exValue == 999999){
                      max = 1000000;
                      min = 999999
                  }
                  else if (exValue > 0) {
                      //此处为筛选超过最大值的
                      max = 999999;
                      min = exValue;
                  }else{
                      //此处为筛选低于最小值的
                      max = exValue+0.000000001;
                      min = -999999;
                  }
                }

                this.chartFilterList[chartOrigin][weatherType] = this.chartFilterList[chartOrigin][weatherType] || {};
                let left_1_mult_weatherTypeFilter = this.chartFilterList[chartOrigin][weatherType];
                // console.log("得到最大最小值：",max,min);
                //让Map执行removeAllMarkers
                this.removeAllMarkers();
                //对provinceMarkers执行addMarkersToCiLayer操作
                if(this.provinceSelect == '全国' && this.map.getZoom()>5)
                    this.map.setZoom(6);
                left_1_mult_weatherTypeFilter[weatherType+'&'+range] = this.rangeMarkerHighLevFilter(max,min,weatherType);
                let filterList = [];
                // for (const filter in this.left_1_multFilter) {
                //     if (Object.hasOwnProperty.call(this.left_1_multFilter, filter)) {
                //         this.left_1_multFilter[filter];
                        
                //     }
                // }
                for(const filter in left_1_mult_weatherTypeFilter){
                   if(left_1_mult_weatherTypeFilter[filter]){
                    //    console.log("push",this.left_1_multFilter[filter]);
                       filterList.push(left_1_mult_weatherTypeFilter[filter]);

                   } 

                }
                    // console.log(filterList);
                
                //这里最好加上来源名作为name，比如左固定的筛选
                this.addFilter(this.markersFilters,this.multiFilter(...filterList),'rangeMarkerHighLevFilterBy'+weatherType+`From${chartOrigin}`);
                console.log("添加rangeMarkerHighLevFilter筛选器");
                this.addMarkersToCiLayer(this.markersFilters,this.provinceMarkers,true);
                this.createNewFliterList();

                //不需要改变provinceData
        },
        handleBarChartCancelSelect({cancelRange,chartOrigin,weatherType}){
            weatherType = weatherType || this.weatherType;
            this.removeAllMarkers();
            //对provinceMarkers执行addMarkersToCiLayer操作
                console.log("移除rangeMarkerHighLevFilter筛选器");
            let filterList = [];
            let left_1_mult_weatherTypeFilter = this.chartFilterList[chartOrigin][weatherType];

            left_1_mult_weatherTypeFilter[weatherType+'&'+cancelRange] = undefined;
            console.log("取消的key",weatherType+'&'+cancelRange);
            for(const filter in left_1_mult_weatherTypeFilter){
                left_1_mult_weatherTypeFilter[filter] && filterList.push(left_1_mult_weatherTypeFilter[filter]);
            }
            this.addFilter(this.markersFilters,this.multiFilter(...filterList),'rangeMarkerHighLevFilterBy'+weatherType+`From${chartOrigin}`);
            // this.removeFilter(this.markersFilters,`rangeMarkerHighLevFilterBy${this.weatherType}From${chartOrigin}`);
            this.addMarkersToCiLayer(this.markersFilters,this.provinceMarkers,true);
            this.createNewFliterList();

        },
        changeShowWeatherType(){
            this.removeAllMarkers();
            if(this.showWeatherFlag)
                this.createMarkers(this.requestData,'WEP_Now');
            else
                this.createMarkers(this.requestData);
            // this.addFilter(this.markersFilters,this.provinceMarkerFilter,'provinceMarkerFilter');
            this.updateprovinceMarkers();
            this.addMarkersToCiLayer(this.markersFilters,this.provinceMarkers,true);
            this.updateLegend();
            this.clearGeoJsonLayer();
            this.updateGeoJson(this.weatherType);
            this.addChinaGeoJson();
            this.$store.commit('updateWeatherType',this.weatherType);
            
        },
        updateLegend(){
            let legendMap = {
                'TEM':[
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
                'tigan':[
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
                'RHU':[
                    {range:'100',color: 'rgba(8,0,0,1)'},
                    {range:'100~90',color: 'rgba(51,13,128,1)'},
                    {range:'90~80',color: 'rgba(70,33,164,1)'},
                    {range:'80~70',color:  'rgba(84,64,182,1)'},
                    {range:'70~60',color: 'rgba(67,73,201,1)'},
                    {range:'60~50',color: 'rgba(238,253,202,1)'},
                    {range:'50~40',color: 'rgba(249,250,213,1)'},
                    {range:'40~30',color: 'rgba(247,79,20,1)'},
                    {range:'30~20',color: 'rgba(252,38,3,1)'},
                    {range:'20~10',color: 'rgba(231,0,0,1)'},
                    {range:'10~0',color: 'rgba(213,6,55,1)'}
                ],
                'PRE_1h':[
                    {range:'50',color:'rgba(141,45,105,1)'},
                    {range:'50~20',color:'rgba(217,106,55,1)'},
                    {range:'20~10',color:'rgba(237,45,251,1)'},
                    {range:'10~8',color:'rgba(41,137,112,1)'},
                    {range:'8~6',color:'rgba(41,45,231,1)'},
                    {range:'6~4',color:'rgba(117,189,255,1)'},
                    {range:'4~2',color:'rgba(89,191,103,1)'},
                    {range:'2~1',color:'rgba(171,235,167,1)'},
                    {range:'1~0.01',color:'rgba(203,244,202,1)'},
                    {range:'0',color:'rgba(245,245,245,1)'}
                ],
                'PRS':[
                    {range:'1030',color:'rgba(0,18,218,1)'},
                    {range:'1030~1020',color:'rgba(0,117,255,1)'},
                    {range:'1020~1010',color:'rgba(87,216,253,1)'},
                    {range:'1010~1000',color:'rgba(9,234,203,1)'},
                    {range:'1000~990',color:'rgba(14,211,119,1)'},
                    {range:'990~980',color:'rgba(10,179,21,1)'},
                    {range:'980~970',color:'rgba(132,217,142,1)'},
                    {range:'970~920',color:'rgba(189,244,9,1)'},
                    {range:'920~870',color:'rgba(244,244,15,1)'},
                    {range:'870~820',color:'rgba(255,218,8,1)'},
                    {range:'820~770',color:'rgba(252,179,8,1)'},
                    {range:'770~720',color:'rgba(250,135,3,1)'},
                    {range:'720~670',color:'rgba(255,71,0,1)'},
                    {range:'670~620',color:'rgba(251,8,1,1)'},
                    {range:'620~570',color:'rgba(190,4,51,1)'},
                    {range:'520',color:'rgba(124,3,108,1)'}
                ],
                'windpower':[
                    {range:'7',color:'rgba(4,54,250,1)'},
                    {range:'7~6',color:'rgba(2,209,251,1)'},
                    {range:'6~5',color:'rgba(0,237,196,1)'},
                    {range:'5~4',color:'rgba(26,187,11,1)'},
                    {range:'4~3',color:'rgba(123,215,8,1)'},
                    {range:'3~2',color:'rgba(254,190,1,1)'},
                    {range:'2~1',color:'rgba(255,39,2,1)'},
                    {range:'0',color:'rgba(88,0,135,1)'}
                ],
                'VIS':[
                    {range:'30',color:'rgba(241,245,253,1)'},
                    {range:'30~20',color:'rgba(197,232,252,1)'},
                    {range:'20~10',color:'rgba(152,220,253,1)'},
                    {range:'10~5',color:'rgba(135,244,89,1)'},
                    {range:'5~3',color:'rgba(240,240,56,1)'},
                    {range:'3~2',color:'rgba(240,181,114,1)'},
                    {range:'2~1',color:'rgba(240,109,55,1)'},
                    {range:'1~0.5',color:'rgba(234,50,55,1)'},
                    {range:'0.5~0.2',color:'rgba(162,56,255,1)'},
                    {range:'0',color:'rgba(130,73,55,1)'}
                ],
                'CLO_Cov':[
                    {range:'90',color:'rgba(207,208,202,1)'},
                    {range:'90~80',color:'rgba(195,197,196,1)'},
                    {range:'80~70',color:'rgba(177,186,185,1)'},
                    {range:'70~60',color:'rgba(178,186,185,1)'},
                    {range:'60~30',color:'rgba(154,161,160,1)'},
                    {range:'30~20',color:'rgba(122,118,101,1)'},
                    {range:'20~10',color:'rgba(132,119,70,1)'},
                    {range:'0~10',color:'rgba(164,154,118,1)'}
                ]
            }
            legendMap['TEM_Max'] = legendMap['TEM_Min'] = legendMap['TEM'];
            legendMap['PRS_Max'] = legendMap['PRS_Min'] = legendMap["PRS_Sea"] = legendMap['PRS'];
            
            
            this.legend = legendMap[this.weatherType];
        },
        createNewWeatherTypeData(){
            let context = [
                // {value:999999,color:'rgba(0,0,0,1)',icon:'PRE_1h'},
                // {value:50,color:'rgba(141,45,105,1)',icon:'PRE_1h'},
                // {value:20,color:'rgba(217,106,55,1)',icon:'PRE_1h'},
                // {value:10,color:'rgba(237,45,251,1)',icon:'PRE_1h'},
                // {value:8,color:'rgba(41,137,112,1)',icon:'PRE_1h'},
                // {value:6,color:'rgba(41,45,231,1)',icon:'PRE_1h'},
                // {value:4,color:'rgba(117,189,255,1)',icon:'PRE_1h'},
                // {value:2,color:'rgba(89,191,103,1)',icon:'PRE_1h'},
                // {value:1,color:'rgba(171,235,167,1)',icon:'PRE_1h'},
                // {value:0.01,color:'rgba(203,244,202,1)',icon:'PRE_1h'},
                // {value:0,color:'rgba(255,255,255,0)',icon:'PRE_1h'}
                // {value:999999,color:'rgba(0,0,0,1)',icon:'PRS'},
                // {value:1030,color:'rgba(0,18,218,1)',icon:'PRS'},
                // {value:1020,color:'rgba(0,117,255,1)',icon:'PRS'},
                // {value:1010,color:'rgba(87,216,253,1)',icon:'PRS'},
                // {value:1000,color:'rgba(9,234,203,1)',icon:'PRS'},
                // {value:990,color:'rgba(14,211,119,1)',icon:'PRS'},
                // {value:980,color:'rgba(10,179,21,1)',icon:'PRS'},
                // {value:970,color:'rgba(132,217,142,1)',icon:'PRS'},
                // {value:920,color:'rgba(189,244,9,1)',icon:'PRS'},
                // {value:870,color:'rgba(244,244,15,1)',icon:'PRS'},
                // {value:820,color:'rgba(255,218,8,1)',icon:'PRS'},
                // {value:770,color:'rgba(252,179,8,1)',icon:'PRS'},
                // {value:720,color:'rgba(250,135,3,1)',icon:'PRS'},
                // {value:670,color:'rgba(255,71,0,1)',icon:'PRS'},
                // {value:620,color:'rgba(251,8,1,1)',icon:'PRS'},
                // {value:570,color:'rgba(190,4,51,1)',icon:'PRS'},
                // {value:520,color:'rgba(124,3,108,1)',icon:'PRS'},
                
                // {value:999999,color:'rgba(0,0,0,1)',icon:'windpower'},
                // {value:7,color:'rgba4,54,250,1)',icon:'windpower'},
                // {value:6,color:'rgba(2,209,251,1)',icon:'windpower'},
                // {value:5,color:'rgba(0,237,196,1)',icon:'windpower'},
                // {value:4,color:'rgba(26,187,11,1)',icon:'windpower'},
                // {value:3,color:'rgba(123,215,8,1)',icon:'windpower'},
                // {value:2,color:'rgba(254,190,1,1)',icon:'windpower'},
                // {value:1,color:'rgba(255,39,2,1)',icon:'windpower'},
                // {value:0,color:'rgba(88,0,135,1)',icon:'windpower'},
                // {value:999999,color:'rgba(0,0,0,1)',icon:'VIS'},
                // {value:30,color:'rgba(241,245,253,1)',icon:'VIS'},
                // {value:20,color:'rgba(197,232,252,1)',icon:'VIS'},
                // {value:10,color:'rgba(152,220,253,1)',icon:'VIS'},
                // {value:5,color:'rgba(135,244,89,1)',icon:'VIS'},
                // {value:3,color:'rgba(240,240,56,1)',icon:'VIS'},
                // {value:2,color:'rgba(240,181,114,1)',icon:'VIS'},
                // {value:1,color:'rgba(240,109,55,1)',icon:'VIS'},
                // {value:0.5,color:'rgba(234,50,55,1)',icon:'VIS'},
                // {value:0.2,color:'rgba(162,56,255,1)',icon:'VIS'},
                // {value:0,color:'rgba(130,73,55,1)',icon:'VIS'},

                {value:100,color:'rgba(213,213,205,1)',icon:'CLO_Cov'},
                {value:90,color:'rgba(207,208,202,1)',icon:'CLO_Cov'},
                {value:80,color:'rgba(195,197,196,1)',icon:'CLO_Cov'},
                {value:70,color:'rgba(177,186,185,1)',icon:'CLO_Cov'},
                {value:60,color:'rgba(178,186,185,1)',icon:'CLO_Cov'},
                {value:30,color:'rgba(154,161,160,1)',icon:'CLO_Cov'},
                {value:20,color:'rgba(122,118,101,1)',icon:'CLO_Cov'},
                {value:10,color:'rgba(132,119,70,1)',icon:'CLO_Cov'},
                {value:0,color:'rgba(164,154,118,1)',icon:'CLO_Cov'},
                


            ];
                 
            
            let getColor = '';
            let getIcon = '';
            let legend = '';
            let xAxisData = '';
            let rangeMap = '';
            let getRange = '';
            context.forEach((item,index,arr)=>{
                if(index == 0){
                    item.range = item.value;
                    getColor += `value == ${item.value} ? '${item.color}':\n`;
                    getIcon += `value == ${item.value} ? '${item.icon}${item.value}.svg':\n`;
                    legend += ``
                    xAxisData += `'${item.range}',\n`
                    rangeMap += `'${item.range}':0,\n`
                    getRange += `value == ${item.value} ? '${item.range}' :\n`
                }else if( index == 1){
                    item.range = item.value;
                    getColor += `value >= ${item.value} ? '${item.color}':\n`;
                    getIcon += `value >= ${item.value} ? '${item.icon}${item.value}.svg':\n`;
                    legend += `{range:'${item.range}',color:'${item.color}'},\n`
                    xAxisData += `'${item.range}',\n`
                    rangeMap += `'${item.range}':0,\n`
                    getRange += `value >= ${item.value} ? '${item.range}' :\n`
                }else if (index != context.length-1) {
                    item.range = `${arr[index-1].value}~${item.value}`;
                    getColor += `value >= ${item.value} ? '${item.color}':\n`;
                    getIcon += `value >= ${item.value} ? '${item.icon}${item.value}.svg':\n`;
                    legend += `{range:'${item.range}',color:'${item.color}'},\n`
                    xAxisData += `'${item.range}',\n`
                    rangeMap += `'${item.range}':0,\n`
                    getRange += `value >= ${item.value} ? '${item.range}' :\n`
                }else{
                    item.range = item.value;
                    getColor += `value >= ${item.value} ? '${item.color}':'${item.color}'`;
                    getIcon += `value >= ${item.value} ? '${item.icon}${item.value}.svg':'${item.icon}${item.value}.svg'`;
                    legend += `{range:'${item.range}',color:'${item.color}'}`
                    xAxisData += `'${item.range}'`
                    rangeMap += `'${item.range}':0`
                    getRange += `value >= ${item.value} ? '${item.range}' : '${item.range}'`
                }
            })
            console.log({
                getColor,
                getIcon,
                legend,
                xAxisData,
                rangeMap,
                getRange
            });
            // return 
        },
        changeShowWeatherIcon(){
            
            if(this.showWeatherFlag){
                this.removeAllMarkers();
                this.createMarkers(this.requestData);
                // this.markers.forEach(m=>{
                //     m.setIcon(this.getIcon(m[this.weatherType]));
                // })
                this.updateprovinceMarkers();
                this.addMarkersToCiLayer(this.markersFilters,this.provinceMarkers,true);

                this.showWeatherFlag = false;
            }else{
                this.removeAllMarkers();
                // this.markers.forEach(m=>{
                //     m.setIcon(this.getIcon(m.WEP_Now,'WEP_Now'))
                // })
                this.createMarkers(this.requestData,'WEP_Now');
                //只依赖省选择更新showMarker
                this.updateprovinceMarkers();
                //根据其他筛选器进一步筛选，对showMarker处理，并且不改变showmarker
                this.addMarkersToCiLayer(this.markersFilters,this.provinceMarkers,true);
                this.showWeatherFlag = true;

            }
            
            
        },
        addFilter(filter,filterFn,name){
            filter[name] = filterFn;
        },
        removeFilter(filter,name){
            filter[name] = undefined;
        },
        updateprovinceMarkers(){
            //用省过滤器筛选
            //对所有markers操作
            //更新provinceMarkers
            //不添加上地图
            this.addMarkersToCiLayer(undefined,undefined,false,true);

        },
        multiFilter(...filters){
            return (marker)=>{
                // console.log("MultFilter",filters);
                if(filters.length == 0) return marker;
                for (let index = 0; index < filters.length; index++) {
                    if(filters[index](marker)){
                        // console.log("MultFilter觉得合格",marker.TEM);
                        return marker ;
                    } 
                }
                return false;
            }
           
        },
        createNewFliterList(){
            let filterList = {
            //    left_1_multFilter: {
            //         chartOrigin:'left_1_multFilter',
            //         filters:[]
            //     },
            };
            let chartFilterList = this.chartFilterList;
            for (const chartFliterName in chartFilterList) {
                if (Object.hasOwnProperty.call(chartFilterList, chartFliterName)) {
                   let chartFilter = chartFilterList[chartFliterName];
                    for (const weatherType in chartFilter) {
                        if (Object.hasOwnProperty.call(chartFilter, weatherType)) {
                            let filters = chartFilter[weatherType];
                            for (const filter in filters) {
                                if (Object.hasOwnProperty.call(filters, filter) && filters[filter]) {
                                    let filterName = filter.split('&');
                                    let filterMsg = {};
                                    filterMsg.type = filterName[0];
                                    filterMsg.range = filterName[1];
                                    filterMsg.chartOrigin = chartFliterName;
                                    filterMsg.key = chartFliterName+'&'+filter;
                                    filterList[chartFliterName] = filterList[chartFliterName] || {filters:[]};
                                    filterList[chartFliterName].filters.push(filterMsg);
                                }
                            }                    
                        }
                    }
                }
            }
            let filterArray = [];
            for (const chartFilter in filterList) {
                if (Object.hasOwnProperty.call(filterList, chartFilter)) {
                    filterList[chartFilter].chartOrigin = chartFilter;
                    filterArray.push(filterList[chartFilter]);
                }
            }
            this.filterList = filterArray;      
            console.log("filterArray",filterArray);

        },
        handleMidPileBarSelect({range,chartOrigin,weatherType,date}){
            if(this.lastDate != date){
                this.updateMarkerAndprovinceDataByDate(date); 
                this.lastDate = date;
            } 
            let selectTEMRange = range.split("~");
            let max,min;
            // console.log(selectTEMRange);
                if(selectTEMRange.length==2){
                   max = parseFloat(selectTEMRange[0]);
                   min = parseFloat(selectTEMRange[1]);
                }else{
                  selectTEMRange =  range.split("+");
                  let exValue = parseFloat(selectTEMRange[0]);
                  if(exValue == 999999){
                      max = 1000000;
                      min = 999999
                  }
                  else if (exValue > 0) {
                      //此处为筛选超过最大值的
                      max = 999999;
                      min = exValue;
                  }else{
                      //此处为筛选低于最小值的
                      max = exValue+0.000000001;
                      min = -999999;
                  }
                }
                this.chartFilterList[chartOrigin][weatherType] = this.chartFilterList[chartOrigin][weatherType] || {};
                let chartWeatherTypeFilter = this.chartFilterList[chartOrigin][weatherType];
                // console.log("得到最大最小值：",max,min);
                //让Map执行removeAllMarkers
                this.removeAllMarkers();
                //对provinceMarkers执行addMarkersToCiLayer操作
                if(this.provinceSelect == '全国' && this.map.getZoom()>5)
                    this.map.setZoom(6);
                chartWeatherTypeFilter[weatherType+'&'+range] = this.rangeMarkerHighLevFilter(max,min,weatherType);
                let filterList = [];
                // for (const filter in this.left_1_multFilter) {
                //     if (Object.hasOwnProperty.call(this.left_1_multFilter, filter)) {
                //         this.left_1_multFilter[filter];
                        
                //     }
                // }
                for(const filter in chartWeatherTypeFilter){
                   if(chartWeatherTypeFilter[filter]){
                    //    console.log("push",this.left_1_multFilter[filter]);
                       filterList.push(chartWeatherTypeFilter[filter]);

                   } 

                }
                    // console.log(filterList);
                
                //这里最好加上来源名作为name，比如左固定的筛选
                this.addFilter(this.markersFilters,this.multiFilter(...filterList),'rangeMarkerHighLevFilterBy'+weatherType+`From${chartOrigin}`);
                console.log("添加rangeMarkerHighLevFilter筛选器");
                this.addMarkersToCiLayer(this.markersFilters,this.provinceMarkers,true);
                this.createNewFliterList();
        }
            
        
        // handleIconSizeByZoomLev(currZoomLev){
        //     if(this.preZoomRange == 7){
        //         if(currZoomLev <7){
        //             // this.removeAllMarkers();
        //             // this.createMarkers(this.requestData);
        //             this.changeAllMarkersIcon();
        //             this.ciLayer.redraw();
        //             // this.addMarkersToCiLayer(undefined,this.provinceMarkers,true);
        //             this.preZoomRange = 6;
        //         }
        //     }
        //     else{
        //         if(currZoomLev > 6){
        //             this.changeAllMarkersIcon();
        //             this.ciLayer.redraw();

        //             this.preZoomRange = 7;
        //         }
        //     }
        // },
        // changeAllMarkersIcon(){
        //     let newIcon;
        //     this.markers.forEach(marker=>{
        //         newIcon = this.getIcon(marker[this.weatherType]);
        //         marker.setIcon(newIcon);
        //     })
        // }
    },
    
    components:{
        Legend,
        // Filter
        FilterController
    },
    
    
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
    overflow: hidden;
    height: 66.6%;
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
            margin-right: 15px;
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
        display: flex;
        top:5px;
        right: 5px;
        
        z-index: 2001;
    }
    .filter-area{
        position: absolute;
        top:70px;
        right: 5px;
        z-index: 2001;
        
    }
}
</style>