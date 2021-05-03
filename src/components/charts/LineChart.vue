<template>
 <div class="line-chart-app" v-loading="loading">
     <div class="function-bar" :class="{'show':show_options_bar}" @click="show_options_bar = true">
        <div class="function-item" style="margin-right:2%">
            <el-select v-model="weather_type_select"  placeholder="请选择气象信息">
                <el-option
                    v-for="item in weather_type_options"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                </el-option>
            </el-select>
        </div>
        <div class="function-item" >
             <el-select v-model="realSelectedStations"
              multiple
              collapse-tags
              clearable
              placeholder="目前已选择的气象站点"
              @clear="clearAllSelectedStation">
                <el-option
                    v-for="item in selectedStations"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                </el-option>
            </el-select>
         </div>
         <div class="function-item">
             <el-date-picker
                v-model="rangeTime"
                :editable="false"
                :clearable="false"
                :picker-options="pickerOption"
                :default-value="defaultValue"
                value-format="yyyy-MM-dd HH:mm:ss"
                type="datetimerange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期">
            </el-date-picker>
         </div>
         <div class="function-item" style="flex-basis:217px;">
            <el-button :type="btn_type" style="width:100%" @click="submit">{{btn_content}}</el-button>
         </div>
        <div class="function-item">
            <div style="padding: 0 15px;">
                <el-switch
                    v-model="allowAddStation"
                    active-text="添加站点"
                    inactive-text="">
                </el-switch>
            </div>
        </div>
     </div>
     <div class="line-chart" ref="chart">

     </div>
 </div>
</template>

<script>
export default {
    mounted(){
        this.initChart();
    },
    data(){
        return {
            loading:false,
            weather_type_select:'',
            weather_type_options: [
                {label:'温度',value:'TEM'},
                // {label:'最高温度',value:'TEM_Max'},
                // {label:'最低温度',value:'TEM_Min'},
                {label:'相对湿度',value:'RHU'},
                // {label:'水汽压',value:'VAP'},
                {label:'气压',value:'PRS'},
                // {label:'海平面气压',value:'PRS_Sea'},
                // {label:'最高气压',value:'PRS_Max'},
                // {label:'最低气压',value:'PRS_Min'},
                {label:'一小时降雨量',value:'PRE_1h'},
                {label:'体感温度',value:'tigan'},
                {label:'风力',value:'windpower'},
                {label:'能见度',value:'VIS'},
                {label:'总云量',value:"CLO_Cov"},
                // {label:'现在天气',value:"WEP_Now"}
            ],
            selectedStations:[],
            realSelectedStations:[],
            rangeTime:[],
            pickerOption:{
                disabledDate(time) {
                    let start = new Date(2021,2,10,0,0,0);
                    let end = new Date(2021,3,23,12,0,0);
                    // console.log(+start);
                    return time.getTime() < start || time.getTime() > end ;
                },
            },
            defaultValue:new Date(2021,2,10,0,0,0),
            allowAddStation:false,
            show_options_bar:true,
            btn_type:'primary',
            btn_content:'提交查询(oﾟvﾟ)ノ',
            zhongwen:'',
            unit:''
        }
    },
    watch:{
        allowAddStation(){
            if(this.allowAddStation){
                this.$bus.$on('addNewStation',this.addNewStation);
            }else{
                this.$bus.$off('addNewStation',this.addNewStation);
            }
        }
    },
    methods:{
        initChart(){
            if(!this.$refs.chart) return;
            this.echart = echarts.init(this.$refs.chart);
            this.echart.on('click',(e)=>{
                console.log(e);
                // this.$bus.$emit('mid-pileBar-select',{range:e.seriesName,chartOrigin:'mid_pileBar_multFilter',weatherType:this.weather_type_select,date:e.name});   

            });
                
        },
        renderChart(series,xAxisData){
           let lineOption = {
               title:{
                   text:`气象站-${this.zhongwen}-随时间变化情况`
               },
                tooltip: {
                    trigger: 'axis'
                },
                legend: {
                    top:"24px"
                },
               dataZoom: [{
                    type: 'inside'
                }],
                grid: {
                    top:"76px",
                    left: '3%',
                    right: '4%',
                    bottom: '-10px',
                    containLabel: true
                },
               
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    axisTick: {
                        alignWithLabel: true,
                        interval:23
                    },
                    axisLabel:{
                        showMinLabel:true,
                        interval: 23,
                        rotate:20,
                        margin:28,
                        align:'center'
                    },
                    data: xAxisData
                },
                yAxis: {
                    type: 'value'
                },
                series
           };
           this.echart.setOption(lineOption);
        },
        dealWeatherDataToEchartSeries(weatherData){
            let _weather_type_select = this.weather_type_select;
            // let chartData = [];
            // let counts = 0;
            let series = [];
            let stationMap = {}
            weatherData.forEach((d)=>{
                 stationMap[d.Station_Id_C] = stationMap[d.Station_Id_C] || [];
                 stationMap[d.Station_Id_C].push(d);
            });
            for (const sid in stationMap) {
                if (Object.hasOwnProperty.call(stationMap, sid)) {
                    let data = [];
                    let name = '';
                    stationMap[sid].forEach((i)=>{
                        if(i[_weather_type_select] != 999999)
                            data.push([i.Date,i[_weather_type_select]]);
                    })
                    this.selectedStations.some(s=>{
                        return  s.value == sid ? name = s.label:false;
                        // if(s.value == sid){
                        //     name = s.label;
                        //     return true;
                        // }
                    })
                    series.push({
                        name,
                        type:'line',
                        // stack:'value',
                        data
                    })
                    series.reverse();
                }
            }
            return series;
        },
        createEveryHoursStringFromFormatStringDate(startDate,endDate){
            let everyHoursStringArr = [];
            startDate = this.createDateByformatString(startDate);
            endDate = this.createDateByformatString(endDate);
            let currDate = startDate;
            while(currDate.getTime() <= endDate.getTime()){
                everyHoursStringArr.push(currDate.format("yyyy-MM-dd hh:mm:ss"));
                currDate.setTime(currDate.getTime()+3600000);
            }
            return everyHoursStringArr;
        },
        createDateByformatString(timeStr){
            let ps = timeStr.split(" ");
            let pd = ps[0].split("-");
            let pt = ps.length > 1 ? ps[1].split(":") : [0, 0, 0];
            return new Date(pd[0], pd[1] - 1, pd[2], pt[0], pt[1], pt[2]);
        },
        addNewStation({stationId,province,stationName}){
            console.log("receive data",stationId,province,stationName);
            let _selectedStations = this.selectedStations;
            for (let index = 0; index < _selectedStations.length; index++) if(_selectedStations[index].value == stationId) return;
            let selectStationOption = {label:`${province}省${stationName}站`,value:stationId}
            this.selectedStations.push(selectStationOption);
            this.realSelectedStations.push(selectStationOption.value);
            

        },
        submit(){
            if (this.weather_type_select == '' || this.realSelectedStations.length == 0 || this.rangeTime.length == 0) {
                this.btn_type = 'danger';
                this.btn_content = '请填入所有内容w(ﾟДﾟ)w';
                setTimeout(()=>{
                    this.btn_type = 'primary';
                    this.btn_content = '提交查询(oﾟvﾟ)ノ';
                },2000);
                return;
            }
            switch (this.weather_type_select) {
                case 'TEM_Max':
                case 'TEM_Min':
                case 'TEM':
                    this.unit = '℃';
                    this.zhongwen = '温度';
                    break;
                case 'RHU':
                    this.unit = '%';
                    this.zhongwen = '相对湿度';
                    break;
                case 'PRS':
                case 'PRS_Max':
                case 'PRS_Min':
                    this.unit = 'hPa';
                    this.zhongwen = '气压';
                    break;
                case 'PRE_1h':
                    this.unit = 'mm';
                    this.zhongwen = '一小时降雨量'
                    break;
                case 'windpower':
                    this.unit = '级';
                    this.zhongwen = '风力'
                    break;
                case 'VIS':
                    this.unit = 'KM';
                    this.zhongwen = '能见度'
                    break;
                case 'CLO_Cov':
                    this.unit = '%';
                    this.zhongwen = '总云量'
                    break;
                case 'tigan':
                     this.unit = '℃';
                    this.zhongwen = '体感温度'
                    break;
                default:
                    break;
            }
            this.loading = true;
             let params = {
                type:this.weather_type_select,
                rangeTime:JSON.stringify(this.rangeTime),
                stations:JSON.stringify(this.realSelectedStations)
            };
            this.$axios.get('/querybystationandtype',{params}).then(({data})=>{
                let series = this.dealWeatherDataToEchartSeries(data);
                this.renderChart(series,xAxisData);
                this.show_options_bar = false;
                this.loading = false;
            });
            let xAxisData = this.createEveryHoursStringFromFormatStringDate(this.rangeTime[0],this.rangeTime[1]);

            // setTimeout(()=>{
            //      console.log("666");
            //     this.show_options_bar = false;
            // })
           
        },
        clearAllSelectedStation(){
            this.selectedStations = [];
            this.realSelectedStations = [];
        },
        
    }
}
</script>

<style lang="less" scoped>
.line-chart-app{
    height: 100%;
    width: 100%;
    position: relative;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    
    .function-bar{
        width:94%;
        display: flex;
        flex-wrap: wrap;
        position: absolute;
        z-index: 1000;
        justify-content: center;
        transform: translateX(98%);
        transition: left 0.5s, transform 0.5s;
        background-color: rgba(255, 255, 255,.8);
        padding: 10px;
        margin-left: calc(3% - 10px);
        border-radius: 3px;
        top:1px;
        box-shadow: 4px 5px 12px rgb(0 0 0 / 20%);
        &:hover{
        //    left: 50%;
            transform: translateX(0%);
        }
        &.show{
            // left: 50%;
            transform: translateX(0%);
        }
        .function-item{
            flex-shrink: 1;
            // flex-grow: 1;
        }
    }
    .line-chart{
        flex-grow: 1;
        // padding: 4% 0;
        // height: 100%;
        width: 100%;
    }
}
</style>