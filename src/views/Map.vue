<template>
<div class="map-app" v-loading.fullscreen.lock="fullscreenLoading" >
  <div id="map">
     
  </div>
  <div class="restrict_select">
    <el-select v-model="provinceSelect" @change="updateMarkerAndShowDataByProvice"  label="全国" placeholder="请选择">
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
  
  <div class="map_axis_msg">
      <pre>地图中心-> Lat（纬度）：{{currentLatLng.lat}} Lng（经度）：{{currentLatLng.lng}}           地图层级->  {{currentZoomLev}}</pre>
  </div>
</div>
</template>

<script>
// import 'leaflet/dist/leaflet.css'
// import L from 'leaflet'
// import 'leaflet-canvas-marker';
import HeatmapOverlay from "leaflet-heatmap"

export default {
    mounted(){
        this.fullscreenLoading = true;
        this.$axios.get("http://localhost:8080/station.json").then(({data})=>{
            // console.log(data);
            // console.log(data.length);
            // let tempS = [];
            this.stations = data;
            
            // let newS = this.copyStationsRestrictAttr('province');
            // let nnewS = {}
            {/*这里是创建proviceList的代码
                // let proviceList = [];
                // newS = newS.forEach(i=>{
                //     nnewS[i.province] = {label:i.province,value:i.province};
                    
                // })
                // for (const key in nnewS) {
                //     if (Object.hasOwnProperty.call(nnewS, key)) {
                //         proviceList.push(nnewS[key]);
                        
                //     }
                // }
                // console.log(JSON.stringify(proviceList));
            */}

        })
        this.icon = L.icon({
            iconUrl: 'dot.svg',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });
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
    },
    data(){
        return {
            //地图的层
            map:{},
            ciLayer:{},
            heatmapLayer:{},
            //上点的图标
            icon:{},
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
            dateSelect:'2021-03-10 00:00:00',
            defaultValue:new Date(2021,2,10,0,0,0),
            pickerOption:{
                disabledDate(time) {
                    let start = new Date(2021,2,10,0,0,0);
                    let end = new Date(2021,3,2,23,0,0);
                    // console.log(+start);
                    return time.getTime() < start || time.getTime() > end ;
                },
            },
            //当前地图的中心和层级
            currentLatLng:{},
            currentZoomLev:{},
            fullscreenLoading:false
        };
    },
    methods:{
        async initMap() {
            //地图初始化
            this.map = L.map("map", {
                minZoom: 1,
                maxZoom: 18,
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
            this.ciLayer.addOnClickListener(function(e, data) {
                // console.log(data);
                // markerIconShow(data[0].data);
            }); 
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
            
            // console.log(M);
            //接下来要xhr请求数据
            let params={
                date:this.dateSelect
            }
           let {data} = await this.getMapWeatherData(params);
           data = this.stationMappingWeatherData(data);
           this.updateRequestData(data);
           this.updateShowData();
           this.createMarkers(data);
           this.ciLayer.addTo(this.map);
           this.ciLayer.addLayers(this.markers);
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
                    s.TEM = 0;
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
        addMarkersToCiLayer(filterFn,baseMarkers){
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

            this.ciLayer.addLayers(newMarkers);
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
        onZoomLevChange(e){
            this.currentZoomLev = Math.round(this.map.getZoom());
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
                let icon = this.icon;
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
            this.addMarkersToCiLayer(this.provinceMarkerFilter);
            this.updateShowData(this.provinceWeatherDataFilter);
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
        }



    },

    
}
</script>

<style lang="less" scoped>
.el-notification.notifyclass.right{
    right: 25%;
}
.map-app{
    height: 100%;
    position: relative;
    #map{
        height: 100%;
        overflow: hidden;
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
}

</style>