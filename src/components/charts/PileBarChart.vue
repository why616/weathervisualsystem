<template>
 <div class="any-chart-app" v-loading="loading">
     <div class="function-bar" :class="{'show':show_options_bar}" @click="show_options_bar = true">
         <div class="function-item">
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
             <el-select v-model="rangeValue"
              multiple
              collapse-tags
              placeholder="请选择数据范围">
                <el-option
                v-for="item in valueRangesByWeatherType"
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
         <div class="function-item">
             <el-select v-model="provinceSelect"  placeholder="请选择省份" >
                <el-option
                    v-for="item in proviceList"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                </el-option>
            </el-select> 
         </div>
         <div class="function-item" style="flex-basis:217px;">
            <el-button :type="btn_type" style="width:100%" @click="submit">{{btn_content}}</el-button>
         </div>
         <!-- <div class="function-item">
             
         </div> -->
     </div>
    <div class="any-chart" ref="chart">

    </div>
    
    <!-- <div style="display:none;">
        <div v-for="(d) in showData" :key="d.stationId" >
        </div>
     </div> -->
 </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
    mounted(){
        this.initChart();
        
    },
    data(){
        return {
            loading:false,
            show_options_bar:true,
            echart:undefined,
            selectRange:{},
            weather_type_select:'',
            rangeTime:'',
            rangeValue:[],
            unit:'',
            zhongwen:'',
            defaultValue:new Date(2021,2,10,0,0,0),
            pickerOption:{
                disabledDate(time) {
                    let start = new Date(2021,2,10,0,0,0);
                    let end = new Date(2021,3,23,12,0,0);
                    // console.log(+start);
                    return time.getTime() < start || time.getTime() > end ;
                },
            },
            counts : 0,
            provinceSelect:'',
            proviceList:[{"label":"全国","value":"全国"},{"label":"黑龙江","value":"黑龙江"},{"label":"内蒙古","value":"内蒙古"},{"label":"吉林","value":"吉林"},{"label":"新疆","value":"新疆"},{"label":"甘肃","value":"甘肃"},{"label":"青海","value":"青海"},{"label":"河北","value":"河北"},{"label":"山西","value":"山西"},{"label":"宁夏","value":"宁夏"},{"label":"陕西","value":"陕西"},{"label":"河南","value":"河南"},{"label":"辽宁","value":"辽宁"},{"label":"北京","value":"北京"},{"label":"天津","value":"天津"},{"label":"山东","value":"山东"},{"label":"西藏","value":"西藏"},{"label":"四川","value":"四川"},{"label":"云南","value":"云南"},{"label":"贵州","value":"贵州"},{"label":"湖北","value":"湖北"},{"label":"重庆","value":"重庆"},{"label":"湖南","value":"湖南"},{"label":"江西","value":"江西"},{"label":"广西","value":"广西"},{"label":"广东","value":"广东"},{"label":"江苏","value":"江苏"},{"label":"安徽","value":"安徽"},{"label":"上海","value":"上海"},{"label":"浙江","value":"浙江"},{"label":"福建","value":"福建"},{"label":"海南","value":"海南"},{"label":"极地","value":"极地"}],

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
            btn_type:'primary',
            btn_content:'提交查询(oﾟvﾟ)ノ'
        }
    },
    methods:{
        initChart(){
                // console.log(this.$refs.chart);
            if(!this.$refs.chart) return;
            this.echart = echarts.init(this.$refs.chart);
            this.echart.on('click',(e)=>{
                console.log(e);
                this.$bus.$emit('mid-pileBar-select',{range:e.seriesName,chartOrigin:'mid_pileBar_multFilter',weatherType:this.weather_type_select,date:e.name});   
                // if(this.selectRange[e.name]){
                //     this.$bus.$emit('bar-chart-cancel-select',{chartOrigin:'left_2_multFilter',cancelRange:e.name,weatherType:this.weather_type_select});
                //     this.selectRange[e.name] = undefined;
                // }else{
                //     this.selectRange[e.name] = true;
                //     this.$bus.$emit('bar-chart-select',{range:e.name,chartOrigin:'left_2_multFilter',weatherType:this.weather_type_select});   
                // }
            })
                
        },
        renderChart(series,xAxisData){
           let lineOption = {
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                        type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                    }
                },
                legend: {
                    // data: ['直接访问', '邮件营销', '联盟广告', '视频广告', '搜索引擎', '百度', '谷歌', '必应', '其他']
                },
                dataZoom: [{
                    type: 'inside'
                }],
                grid: {
                    left: '3%',
                    right: '1%',
                    bottom: '1%',
                    containLabel: true
                },
                xAxis: [
                    {
                        type: 'category',
                        // data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
                        data:xAxisData,
                        axisTick: {
                            alignWithLabel: true,
                            interval:23
                        },
                        axisLabel:{
                            interval: 23,
                            rotate:11,
                            margin:20,
                            align:'center'
                        }
                    }
                ],
                yAxis: [
                    {
                        type: 'value'
                    }
                ],
                series
            };
            
            this.echart.setOption(lineOption);
        },
        dealWeatherDataToEchartData(weatherData){
            //  let chartData = [];
            
            let rangeMap = {
                'TEM':{
                    '999999':[],
                    '40+':[] ,
                    '40~35':[] ,
                    '35~30':[] ,
                    '30~25':[] ,
                    '25~20':[] ,
                    '20~15':[] ,
                    '15~10':[] ,
                    '10~5':[] ,
                    '5~0':[] ,
                    '0~-5':[] ,
                    '-5~-10':[] ,
                    '-10~-15':[] ,
                    '-15~-20':[] ,
                    '-20~-25':[] ,
                    '-25~-30':[] ,
                    '-30~-35':[] ,
                    '-35+':[]
                },
                'tigan':{
                    '999999':[],
                    '40+':[] ,
                    '40~35':[] ,
                    '35~30':[] ,
                    '30~25':[] ,
                    '25~20':[] ,
                    '20~15':[] ,
                    '15~10':[] ,
                    '10~5':[] ,
                    '5~0':[] ,
                    '0~-5':[] ,
                    '-5~-10':[] ,
                    '-10~-15':[] ,
                    '-15~-20':[] ,
                    '-20~-25':[] ,
                    '-25~-30':[] ,
                    '-30~-35':[] ,
                    '-35+':[]
                },
                'RHU':{
                    '999999':[],
                    '100':[],
                    '100~90':[],
                    '90~80':[],
                    '80~70':[],
                    '70~60':[],
                    '60~50':[],
                    '50~40':[],
                    '40~30':[],
                    '30~20':[],
                    '20~10':[],
                    '10~0':[]
                },
                'PRE_1h':{
                    '999999':[],
                    '50':[],
                    '50~20':[],
                    '20~10':[],
                    '10~8':[],
                    '8~6':[],
                    '6~4':[],
                    '4~2':[],
                    '2~1':[],
                    '1~0.01':[],
                    '0':[]
                },
                'PRS':{
                    '999999':[],
                    '1030':[],
                    '1030~1020':[],
                    '1020~1010':[],
                    '1010~1000':[],
                    '1000~990':[],
                    '990~980':[],
                    '980~970':[],
                    '970~920':[],
                    '920~870':[],
                    '870~820':[],
                    '820~770':[],
                    '770~720':[],
                    '720~670':[],
                    '670~620':[],
                    '620~570':[],
                    '520':[]
                },
                'windpower':{
                    '999999':[],
                    '7':[],
                    '7~6':[],
                    '6~5':[],
                    '5~4':[],
                    '4~3':[],
                    '3~2':[],
                    '2~1':[],
                    '0':[]
                },
                'VIS':{
                    '999999':[],
                    '30':[],
                    '30~20':[],
                    '20~10':[],
                    '10~5':[],
                    '5~3':[],
                    '3~2':[],
                    '2~1':[],
                    '1~0.5':[],
                    '0.5~0.2':[],
                    '0':[]
                },
                'CLO_Cov':{
                    '100':[],
                    '90':[],
                    '90~80':[],
                    '80~70':[],
                    '70~60':[],
                    '60~30':[],
                    '30~20':[],
                    '20~10':[],
                    '10~0':[]
                }
            }
            rangeMap['TEM_Max'] = rangeMap['TEM_Min'] = rangeMap['TEM'];
            rangeMap['PRS_Max'] = rangeMap['PRS_Min'] = rangeMap["PRS_Sea"] = rangeMap['PRS'];


                // console.log(rangeMap);

            rangeMap = rangeMap[this.weather_type_select];
            // xAxisData = xAxisData[this.weather_type_select];

            let series = [];
            let counts = 0;
            if(this.weather_type_select != 'VIS')
                weatherData.forEach((d)=>{
                //    console.log(d.Date.split(' '));
                    rangeMap[this.getRange(d[this.weather_type_select])].push(d);
                    // totalCounts++;
                    counts++;
                });
            else
                weatherData.forEach((d)=>{
                //    console.log(d.Date.split(' '));
                    rangeMap[this.getRange(d[this.weather_type_select]/1000)].push(d);
                    // totalCounts++;
                    counts++;
                });

            this.counts = counts;
            for (const range in rangeMap) {
                if (Object.hasOwnProperty.call(rangeMap, range)) {
                    if (rangeMap[range].length == 0) continue;
                    let  value = range.split("~")[1];
                    value = value || range;

                    let seriesItem = {
                        name: range,
                        type: 'bar',
                        stack:this.weather_type_select,
                        emphasis: {
                            focus: 'series'
                        },
                        itemStyle:{
                            color:this.getColor(parseFloat(value)),
                        }
                    }

                    let timeMap = {};
                    rangeMap[range].forEach(i=>{
                        timeMap[i.Date] = timeMap[i.Date]+1 || 1;
                    })
                    let data = [];
                    for (const time in timeMap) {
                        if (Object.hasOwnProperty.call(timeMap, time)) {
                            data.push([time,timeMap[time]]);
                        }
                    }
                    seriesItem.data = data;
                    series.push(seriesItem);
                }
            }
            // xAxisData.forEach(range=>{
            //     //  console.log(range);
            //        let  value = range.split("~")[1];
            //         value = value || range;
            //        chartData.push({
            //            name:range,
            //            value:rangeMap[range],
            //             itemStyle:{
            //                 color:this.getColor(parseFloat(value)),
            //             }
            //        });
            // })
            // for (const range in rangeMap) {
            //     if (rangeMap.hasOwnProperty.call(rangeMap, range)) {
            //         console.log(range);
            //        let  value = range.split("~")[1];
            //         value = value || range;
            //        chartData.push({
            //            name:range,
            //            value:rangeMap[range],
            //         itemStyle:{
            //                 color:this.getColor(parseFloat(value)),
            //             }
            //        });
            //     }
            // }
            // console.log(chartData);
            return series
        },
        getRange(value){
            let range = '999999'
            switch (this.weather_type_select) {
                 case 'TEM_Max':
                case 'TEM_Min':
                case 'TEM':
                case 'tigan':
                    range = value == 999999 ? '999999' :
                    value >= 40 ? '40+' :
                    value >= 35 ? '40~35' :
                    value >= 30 ? '35~30' :
                    value >= 25 ? '30~25' :
                    value >= 20 ? '25~20' :
                    value >= 15 ? '20~15' :
                    value >= 10 ? '15~10' :
                    value >= 5 ? '10~5' :
                    value >= 0 ? '5~0' :
                    value >= -5 ? '0~-5' :
                    value >= -10 ? '-5~-10' :
                    value >= -15 ? '-10~-15' :
                    value >= -20 ? '-15~-20' :
                    value >= -25 ? '-20~-25' :
                    value >= -30 ? '-25~-30' :
                    value >= -35 ? '-30~-35' :
                    value >= -40 ? '-35+' : '-35+'
                    break;
                case 'RHU':
                    range = value == 999999 ? '999999' :
                            value >= 100 ? '100' :
                            value >= 90 ?  '100~90':
                            value >= 80 ?  '90~80':
                            value >= 70 ?  '80~70':
                            value >= 60 ?  '70~60':
                            value >= 50 ?  '60~50':
                            value >= 40 ?  '50~40':
                            value >= 30 ?  '40~30':
                            value >= 20 ?  '30~20':
                            value >= 10 ?  '20~10':
                            value >= 0 ?   '10~0':'10~0'
                        break;
                case 'PRE_1h':
                    range = value == 999999 ? '999999' :
                            value == 50 ? '50' :
                            value >= 20 ? '50~20' :
                            value >= 10 ? '20~10' :
                            value >= 8 ? '10~8' :
                            value >= 6 ? '8~6' :
                            value >= 4 ? '6~4' :
                            value >= 2 ? '4~2' :
                            value >= 1 ? '2~1' :
                            value >= 0.01 ? '1~0.01' :
                            value >= 0 ? '0' : '0'
                            break;
                case 'PRS':
                 case 'PRS_Sea':
                case 'PRS_Max':
                case 'PRS_Min':
                     range = value == 999999 ? '999999' :
                            value == 1030 ? '1030' :
                            value >= 1020 ? '1030~1020' :
                            value >= 1010 ? '1020~1010' :
                            value >= 1000 ? '1010~1000' :
                            value >= 990 ? '1000~990' :
                            value >= 980 ? '990~980' :
                            value >= 970 ? '980~970' :
                            value >= 920 ? '970~920' :
                            value >= 870 ? '920~870' :
                            value >= 820 ? '870~820' :
                            value >= 770 ? '820~770' :
                            value >= 720 ? '770~720' :
                            value >= 670 ? '720~670' :
                            value >= 620 ? '670~620' :
                            value >= 570 ? '620~570' :
                            value >= 520 ? '520' : '520'
                    break;
                case 'windpower':
                     range = value == 999999 ? '999999' :
                            value >= 7 ? '7' :
                            value >= 6 ? '7~6' :
                            value >= 5 ? '6~5' :
                            value >= 4 ? '5~4' :
                            value >= 3 ? '4~3' :
                            value >= 2 ? '3~2' :
                            value >= 1 ? '2~1' :
                            value >= 0 ? '0' : '0'
                    break;
                case 'VIS':
                    range = value == 999999 ? '999999' :
                            value >= 30 ? '30' :
                            value >= 20 ? '30~20' :
                            value >= 10 ? '20~10' :
                            value >= 5 ? '10~5' :
                            value >= 3 ? '5~3' :
                            value >= 2 ? '3~2' :
                            value >= 1 ? '2~1' :
                            value >= 0.5 ? '1~0.5' :
                            value >= 0.2 ? '0.5~0.2' :
                            value >= 0 ? '0' : '0'
                    break;
                case 'CLO_Cov':
                   range =  value == 100 ? '100' :
                            value >= 90 ? '90' :
                            value >= 80 ? '90~80' :
                            value >= 70 ? '80~70' :
                            value >= 60 ? '70~60' :
                            value >= 30 ? '60~30' :
                            value >= 20 ? '30~20' :
                            value >= 10 ? '20~10' :
                            value >= 0 ? '0' : '0'
                    break;
                default:
                    break;
            }
            // console.log(value,range);
            return range;
        },
        getColor(value){
            let color = 'rgba(0,0,0,1)';
            switch (this.weather_type_select) {
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
        submit(){
             if(this.weather_type_select == '' || this.rangeValue.length==0 || this.rangeTime=='' || this.provinceSelect==''){
                this.btn_type = 'danger';
                this.btn_content = '请填入所有内容w(ﾟДﾟ)w';
                setTimeout(()=>{
                    this.btn_type = 'primary';
                    this.btn_content = '提交查询(oﾟvﾟ)ノ';
                },2000);
                return;
             }
            this.loading = true;
            let stations = [];
           
            if (this.provinceSelect != '全国') {
                let Sid_Province = [{"stationId":50136,"province":"黑龙江"},{"stationId":50137,"province":"黑龙江"},{"stationId":50246,"province":"黑龙江"},{"stationId":50247,"province":"黑龙江"},{"stationId":50349,"province":"黑龙江"},{"stationId":50353,"province":"黑龙江"},{"stationId":50425,"province":"内蒙古"},{"stationId":50431,"province":"内蒙古"},{"stationId":50434,"province":"内蒙古"},{"stationId":50442,"province":"黑龙江"},{"stationId":50445,"province":"内蒙古"},{"stationId":50468,"province":"黑龙江"},{"stationId":50514,"province":"内蒙古"},{"stationId":50524,"province":"内蒙古"},{"stationId":50525,"province":"内蒙古"},{"stationId":50526,"province":"内蒙古"},{"stationId":50527,"province":"内蒙古"},{"stationId":50548,"province":"内蒙古"},{"stationId":50557,"province":"黑龙江"},{"stationId":50564,"province":"黑龙江"},{"stationId":50566,"province":"黑龙江"},{"stationId":50603,"province":"内蒙古"},{"stationId":50618,"province":"内蒙古"},{"stationId":50639,"province":"内蒙古"},{"stationId":50645,"province":"内蒙古"},{"stationId":50646,"province":"黑龙江"},{"stationId":50647,"province":"内蒙古"},{"stationId":50655,"province":"黑龙江"},{"stationId":50656,"province":"黑龙江"},{"stationId":50658,"province":"黑龙江"},{"stationId":50659,"province":"黑龙江"},{"stationId":50673,"province":"黑龙江"},{"stationId":50674,"province":"黑龙江"},{"stationId":50727,"province":"内蒙古"},{"stationId":50739,"province":"黑龙江"},{"stationId":50741,"province":"黑龙江"},{"stationId":50742,"province":"黑龙江"},{"stationId":50745,"province":"黑龙江"},{"stationId":50749,"province":"黑龙江"},{"stationId":50750,"province":"黑龙江"},{"stationId":50755,"province":"黑龙江"},{"stationId":50756,"province":"黑龙江"},{"stationId":50758,"province":"黑龙江"},{"stationId":50767,"province":"黑龙江"},{"stationId":50772,"province":"黑龙江"},{"stationId":50774,"province":"黑龙江"},{"stationId":50775,"province":"黑龙江"},{"stationId":50776,"province":"黑龙江"},{"stationId":50778,"province":"黑龙江"},{"stationId":50779,"province":"黑龙江"},{"stationId":50787,"province":"黑龙江"},{"stationId":50788,"province":"黑龙江"},{"stationId":50834,"province":"内蒙古"},{"stationId":50842,"province":"黑龙江"},{"stationId":50844,"province":"黑龙江"},{"stationId":50850,"province":"黑龙江"},{"stationId":50851,"province":"黑龙江"},{"stationId":50852,"province":"黑龙江"},{"stationId":50853,"province":"黑龙江"},{"stationId":50854,"province":"黑龙江"},{"stationId":50858,"province":"黑龙江"},{"stationId":50859,"province":"黑龙江"},{"stationId":50861,"province":"黑龙江"},{"stationId":50862,"province":"黑龙江"},{"stationId":50867,"province":"黑龙江"},{"stationId":50871,"province":"黑龙江"},{"stationId":50873,"province":"黑龙江"},{"stationId":50877,"province":"黑龙江"},{"stationId":50878,"province":"黑龙江"},{"stationId":50879,"province":"黑龙江"},{"stationId":50880,"province":"黑龙江"},{"stationId":50884,"province":"黑龙江"},{"stationId":50888,"province":"黑龙江"},{"stationId":50892,"province":"黑龙江"},{"stationId":50913,"province":"内蒙古"},{"stationId":50915,"province":"内蒙古"},{"stationId":50924,"province":"内蒙古"},{"stationId":50928,"province":"内蒙古"},{"stationId":50934,"province":"内蒙古"},{"stationId":50936,"province":"吉林"},{"stationId":50937,"province":"内蒙古"},{"stationId":50939,"province":"吉林"},{"stationId":50940,"province":"吉林"},{"stationId":50945,"province":"吉林"},{"stationId":50946,"province":"吉林"},{"stationId":50948,"province":"吉林"},{"stationId":50949,"province":"吉林"},{"stationId":50950,"province":"黑龙江"},{"stationId":50953,"province":"黑龙江"},{"stationId":50954,"province":"黑龙江"},{"stationId":50956,"province":"黑龙江"},{"stationId":50958,"province":"黑龙江"},{"stationId":50960,"province":"黑龙江"},{"stationId":50962,"province":"黑龙江"},{"stationId":50963,"province":"黑龙江"},{"stationId":50964,"province":"黑龙江"},{"stationId":50965,"province":"黑龙江"},{"stationId":50968,"province":"黑龙江"},{"stationId":50971,"province":"黑龙江"},{"stationId":50973,"province":"黑龙江"},{"stationId":50978,"province":"黑龙江"},{"stationId":50979,"province":"黑龙江"},{"stationId":50983,"province":"黑龙江"},{"stationId":50985,"province":"黑龙江"},{"stationId":50987,"province":"黑龙江"},{"stationId":51053,"province":"新疆"},{"stationId":51058,"province":"新疆"},{"stationId":51060,"province":"新疆"},{"stationId":51068,"province":"新疆"},{"stationId":51076,"province":"新疆"},{"stationId":51087,"province":"新疆"},{"stationId":51133,"province":"新疆"},{"stationId":51137,"province":"新疆"},{"stationId":51145,"province":"新疆"},{"stationId":51156,"province":"新疆"},{"stationId":51232,"province":"新疆"},{"stationId":51238,"province":"新疆"},{"stationId":51241,"province":"新疆"},{"stationId":51243,"province":"新疆"},{"stationId":51334,"province":"新疆"},{"stationId":51357,"province":"新疆"},{"stationId":51359,"province":"新疆"},{"stationId":51367,"province":"新疆"},{"stationId":51368,"province":"新疆"},{"stationId":51369,"province":"新疆"},{"stationId":51377,"province":"新疆"},{"stationId":51378,"province":"新疆"},{"stationId":51468,"province":"新疆"},{"stationId":51469,"province":"新疆"},{"stationId":51470,"province":"新疆"},{"stationId":51477,"province":"新疆"},{"stationId":51482,"province":"新疆"},{"stationId":51526,"province":"新疆"},{"stationId":51542,"province":"新疆"},{"stationId":51567,"province":"新疆"},{"stationId":51571,"province":"新疆"},{"stationId":51572,"province":"新疆"},{"stationId":51573,"province":"新疆"},{"stationId":51627,"province":"新疆"},{"stationId":51628,"province":"新疆"},{"stationId":51636,"province":"新疆"},{"stationId":51639,"province":"新疆"},{"stationId":51656,"province":"新疆"},{"stationId":51704,"province":"新疆"},{"stationId":51705,"province":"新疆"},{"stationId":51707,"province":"新疆"},{"stationId":51709,"province":"新疆"},{"stationId":51717,"province":"新疆"},{"stationId":51720,"province":"新疆"},{"stationId":51722,"province":"新疆"},{"stationId":51730,"province":"新疆"},{"stationId":51747,"province":"新疆"},{"stationId":51765,"province":"新疆"},{"stationId":51802,"province":"新疆"},{"stationId":51810,"province":"新疆"},{"stationId":51811,"province":"新疆"},{"stationId":51814,"province":"新疆"},{"stationId":51815,"province":"新疆"},{"stationId":51818,"province":"新疆"},{"stationId":51826,"province":"新疆"},{"stationId":51827,"province":"新疆"},{"stationId":51828,"province":"新疆"},{"stationId":51829,"province":"新疆"},{"stationId":51839,"province":"新疆"},{"stationId":51855,"province":"新疆"},{"stationId":51931,"province":"新疆"},{"stationId":52101,"province":"新疆"},{"stationId":52112,"province":"新疆"},{"stationId":52118,"province":"新疆"},{"stationId":52203,"province":"新疆"},{"stationId":52313,"province":"新疆"},{"stationId":52323,"province":"甘肃"},{"stationId":52515,"province":"甘肃"},{"stationId":52533,"province":"甘肃"},{"stationId":52546,"province":"甘肃"},{"stationId":52557,"province":"甘肃"},{"stationId":52602,"province":"青海"},{"stationId":52643,"province":"甘肃"},{"stationId":52652,"province":"甘肃"},{"stationId":52656,"province":"甘肃"},{"stationId":52674,"province":"甘肃"},{"stationId":52679,"province":"甘肃"},{"stationId":52681,"province":"甘肃"},{"stationId":52707,"province":"青海"},{"stationId":52784,"province":"甘肃"},{"stationId":52787,"province":"甘肃"},{"stationId":52797,"province":"甘肃"},{"stationId":52818,"province":"青海"},{"stationId":52825,"province":"青海"},{"stationId":52836,"province":"青海"},{"stationId":52854,"province":"青海"},{"stationId":52856,"province":"青海"},{"stationId":52863,"province":"青海"},{"stationId":52866,"province":"青海"},{"stationId":52868,"province":"青海"},{"stationId":52869,"province":"青海"},{"stationId":52875,"province":"青海"},{"stationId":52876,"province":"青海"},{"stationId":52877,"province":"青海"},{"stationId":52881,"province":"甘肃"},{"stationId":52884,"province":"甘肃"},{"stationId":52885,"province":"甘肃"},{"stationId":52895,"province":"甘肃"},{"stationId":52896,"province":"甘肃"},{"stationId":52908,"province":"青海"},{"stationId":52941,"province":"青海"},{"stationId":52943,"province":"青海"},{"stationId":52955,"province":"青海"},{"stationId":52957,"province":"青海"},{"stationId":52963,"province":"青海"},{"stationId":52968,"province":"青海"},{"stationId":52972,"province":"青海"},{"stationId":52974,"province":"青海"},{"stationId":52978,"province":"甘肃"},{"stationId":52980,"province":"甘肃"},{"stationId":52981,"province":"甘肃"},{"stationId":52982,"province":"甘肃"},{"stationId":52983,"province":"甘肃"},{"stationId":52984,"province":"甘肃"},{"stationId":52985,"province":"甘肃"},{"stationId":52986,"province":"甘肃"},{"stationId":52988,"province":"甘肃"},{"stationId":52993,"province":"甘肃"},{"stationId":52995,"province":"甘肃"},{"stationId":52996,"province":"甘肃"},{"stationId":52998,"province":"甘肃"},{"stationId":53068,"province":"内蒙古"},{"stationId":53083,"province":"内蒙古"},{"stationId":53149,"province":"内蒙古"},{"stationId":53192,"province":"内蒙古"},{"stationId":53231,"province":"内蒙古"},{"stationId":53289,"province":"内蒙古"},{"stationId":53336,"province":"内蒙古"},{"stationId":53337,"province":"内蒙古"},{"stationId":53348,"province":"内蒙古"},{"stationId":53352,"province":"内蒙古"},{"stationId":53357,"province":"内蒙古"},{"stationId":53362,"province":"内蒙古"},{"stationId":53367,"province":"内蒙古"},{"stationId":53368,"province":"内蒙古"},{"stationId":53378,"province":"内蒙古"},{"stationId":53384,"province":"内蒙古"},{"stationId":53385,"province":"内蒙古"},{"stationId":53391,"province":"内蒙古"},{"stationId":53392,"province":"河北"},{"stationId":53397,"province":"河北"},{"stationId":53399,"province":"河北"},{"stationId":53419,"province":"内蒙古"},{"stationId":53420,"province":"内蒙古"},{"stationId":53433,"province":"内蒙古"},{"stationId":53446,"province":"内蒙古"},{"stationId":53455,"province":"内蒙古"},{"stationId":53457,"province":"内蒙古"},{"stationId":53463,"province":"内蒙古"},{"stationId":53464,"province":"内蒙古"},{"stationId":53466,"province":"内蒙古"},{"stationId":53467,"province":"内蒙古"},{"stationId":53469,"province":"内蒙古"},{"stationId":53472,"province":"内蒙古"},{"stationId":53475,"province":"内蒙古"},{"stationId":53478,"province":"山西"},{"stationId":53480,"province":"内蒙古"},{"stationId":53481,"province":"内蒙古"},{"stationId":53483,"province":"内蒙古"},{"stationId":53484,"province":"内蒙古"},{"stationId":53486,"province":"山西"},{"stationId":53487,"province":"山西"},{"stationId":53488,"province":"山西"},{"stationId":53490,"province":"山西"},{"stationId":53491,"province":"河北"},{"stationId":53492,"province":"河北"},{"stationId":53498,"province":"河北"},{"stationId":53499,"province":"河北"},{"stationId":53512,"province":"内蒙古"},{"stationId":53513,"province":"内蒙古"},{"stationId":53517,"province":"宁夏"},{"stationId":53518,"province":"宁夏"},{"stationId":53519,"province":"宁夏"},{"stationId":53522,"province":"内蒙古"},{"stationId":53529,"province":"内蒙古"},{"stationId":53533,"province":"内蒙古"},{"stationId":53543,"province":"内蒙古"},{"stationId":53545,"province":"内蒙古"},{"stationId":53553,"province":"内蒙古"},{"stationId":53562,"province":"内蒙古"},{"stationId":53564,"province":"山西"},{"stationId":53565,"province":"山西"},{"stationId":53567,"province":"陕西"},{"stationId":53573,"province":"山西"},{"stationId":53574,"province":"山西"},{"stationId":53575,"province":"山西"},{"stationId":53576,"province":"山西"},{"stationId":53577,"province":"山西"},{"stationId":53578,"province":"山西"},{"stationId":53579,"province":"山西"},{"stationId":53582,"province":"山西"},{"stationId":53584,"province":"山西"},{"stationId":53585,"province":"山西"},{"stationId":53588,"province":"山西"},{"stationId":53590,"province":"山西"},{"stationId":53593,"province":"河北"},{"stationId":53594,"province":"山西"},{"stationId":53596,"province":"河北"},{"stationId":53599,"province":"河北"},{"stationId":53603,"province":"宁夏"},{"stationId":53610,"province":"宁夏"},{"stationId":53611,"province":"宁夏"},{"stationId":53612,"province":"宁夏"},{"stationId":53614,"province":"宁夏"},{"stationId":53615,"province":"宁夏"},{"stationId":53617,"province":"宁夏"},{"stationId":53618,"province":"宁夏"},{"stationId":53619,"province":"宁夏"},{"stationId":53644,"province":"内蒙古"},{"stationId":53646,"province":"陕西"},{"stationId":53651,"province":"陕西"},{"stationId":53658,"province":"陕西"},{"stationId":53659,"province":"山西"},{"stationId":53660,"province":"山西"},{"stationId":53662,"province":"山西"},{"stationId":53663,"province":"山西"},{"stationId":53664,"province":"山西"},{"stationId":53665,"province":"山西"},{"stationId":53666,"province":"山西"},{"stationId":53669,"province":"山西"},{"stationId":53673,"province":"山西"},{"stationId":53674,"province":"山西"},{"stationId":53676,"province":"山西"},{"stationId":53677,"province":"山西"},{"stationId":53678,"province":"山西"},{"stationId":53679,"province":"山西"},{"stationId":53680,"province":"河北"},{"stationId":53681,"province":"山西"},{"stationId":53682,"province":"河北"},{"stationId":53685,"province":"山西"},{"stationId":53687,"province":"山西"},{"stationId":53688,"province":"河北"},{"stationId":53689,"province":"河北"},{"stationId":53690,"province":"河北"},{"stationId":53691,"province":"河北"},{"stationId":53692,"province":"河北"},{"stationId":53693,"province":"河北"},{"stationId":53694,"province":"河北"},{"stationId":53695,"province":"河北"},{"stationId":53696,"province":"河北"},{"stationId":53697,"province":"河北"},{"stationId":53699,"province":"河北"},{"stationId":53704,"province":"宁夏"},{"stationId":53705,"province":"宁夏"},{"stationId":53707,"province":"宁夏"},{"stationId":53723,"province":"宁夏"},{"stationId":53725,"province":"陕西"},{"stationId":53727,"province":"宁夏"},{"stationId":53730,"province":"内蒙古"},{"stationId":53732,"province":"内蒙古"},{"stationId":53735,"province":"陕西"},{"stationId":53738,"province":"陕西"},{"stationId":53740,"province":"陕西"},{"stationId":53748,"province":"陕西"},{"stationId":53750,"province":"陕西"},{"stationId":53751,"province":"陕西"},{"stationId":53753,"province":"山西"},{"stationId":53754,"province":"陕西"},{"stationId":53756,"province":"陕西"},{"stationId":53757,"province":"陕西"},{"stationId":53759,"province":"山西"},{"stationId":53760,"province":"山西"},{"stationId":53763,"province":"山西"},{"stationId":53764,"province":"山西"},{"stationId":53767,"province":"山西"},{"stationId":53768,"province":"山西"},{"stationId":53769,"province":"山西"},{"stationId":53770,"province":"山西"},{"stationId":53771,"province":"山西"},{"stationId":53772,"province":"山西"},{"stationId":53773,"province":"河北"},{"stationId":53774,"province":"山西"},{"stationId":53775,"province":"山西"},{"stationId":53776,"province":"山西"},{"stationId":53777,"province":"山西"},{"stationId":53778,"province":"山西"},{"stationId":53780,"province":"山西"},{"stationId":53781,"province":"河北"},{"stationId":53782,"province":"山西"},{"stationId":53783,"province":"山西"},{"stationId":53784,"province":"河北"},{"stationId":53785,"province":"河北"},{"stationId":53786,"province":"山西"},{"stationId":53787,"province":"山西"},{"stationId":53788,"province":"山西"},{"stationId":53789,"province":"河北"},{"stationId":53790,"province":"河北"},{"stationId":53791,"province":"河北"},{"stationId":53792,"province":"河北"},{"stationId":53794,"province":"河北"},{"stationId":53795,"province":"河北"},{"stationId":53796,"province":"河北"},{"stationId":53797,"province":"河北"},{"stationId":53798,"province":"河北"},{"stationId":53799,"province":"河北"},{"stationId":53806,"province":"宁夏"},{"stationId":53810,"province":"宁夏"},{"stationId":53817,"province":"宁夏"},{"stationId":53821,"province":"甘肃"},{"stationId":53829,"province":"甘肃"},{"stationId":53832,"province":"陕西"},{"stationId":53841,"province":"陕西"},{"stationId":53848,"province":"陕西"},{"stationId":53850,"province":"陕西"},{"stationId":53852,"province":"山西"},{"stationId":53853,"province":"山西"},{"stationId":53854,"province":"陕西"},{"stationId":53856,"province":"山西"},{"stationId":53857,"province":"陕西"},{"stationId":53859,"province":"山西"},{"stationId":53860,"province":"山西"},{"stationId":53861,"province":"山西"},{"stationId":53862,"province":"山西"},{"stationId":53863,"province":"山西"},{"stationId":53864,"province":"山西"},{"stationId":53865,"province":"山西"},{"stationId":53866,"province":"山西"},{"stationId":53868,"province":"山西"},{"stationId":53869,"province":"山西"},{"stationId":53871,"province":"山西"},{"stationId":53872,"province":"山西"},{"stationId":53873,"province":"山西"},{"stationId":53874,"province":"山西"},{"stationId":53875,"province":"山西"},{"stationId":53877,"province":"山西"},{"stationId":53878,"province":"山西"},{"stationId":53879,"province":"山西"},{"stationId":53880,"province":"山西"},{"stationId":53881,"province":"宁夏"},{"stationId":53882,"province":"山西"},{"stationId":53883,"province":"河北"},{"stationId":53884,"province":"山西"},{"stationId":53885,"province":"山西"},{"stationId":53886,"province":"河北"},{"stationId":53888,"province":"山西"},{"stationId":53889,"province":"河南"},{"stationId":53890,"province":"河北"},{"stationId":53891,"province":"河北"},{"stationId":53892,"province":"河北"},{"stationId":53893,"province":"河北"},{"stationId":53894,"province":"河北"},{"stationId":53895,"province":"河北"},{"stationId":53896,"province":"河北"},{"stationId":53897,"province":"河北"},{"stationId":53898,"province":"河南"},{"stationId":53899,"province":"河北"},{"stationId":53903,"province":"宁夏"},{"stationId":53906,"province":"甘肃"},{"stationId":53908,"province":"甘肃"},{"stationId":53910,"province":"宁夏"},{"stationId":53914,"province":"宁夏"},{"stationId":53915,"province":"甘肃"},{"stationId":53916,"province":"宁夏"},{"stationId":53917,"province":"甘肃"},{"stationId":53923,"province":"甘肃"},{"stationId":53924,"province":"甘肃"},{"stationId":53925,"province":"甘肃"},{"stationId":53926,"province":"甘肃"},{"stationId":53927,"province":"甘肃"},{"stationId":53928,"province":"甘肃"},{"stationId":53929,"province":"陕西"},{"stationId":53930,"province":"甘肃"},{"stationId":53931,"province":"陕西"},{"stationId":53934,"province":"甘肃"},{"stationId":53935,"province":"甘肃"},{"stationId":53937,"province":"甘肃"},{"stationId":53938,"province":"陕西"},{"stationId":53941,"province":"陕西"},{"stationId":53942,"province":"陕西"},{"stationId":53944,"province":"陕西"},{"stationId":53945,"province":"陕西"},{"stationId":53946,"province":"陕西"},{"stationId":53947,"province":"陕西"},{"stationId":53948,"province":"陕西"},{"stationId":53949,"province":"陕西"},{"stationId":53950,"province":"陕西"},{"stationId":53953,"province":"山西"},{"stationId":53954,"province":"山西"},{"stationId":53956,"province":"山西"},{"stationId":53957,"province":"山西"},{"stationId":53958,"province":"山西"},{"stationId":53959,"province":"山西"},{"stationId":53961,"province":"山西"},{"stationId":53962,"province":"山西"},{"stationId":53963,"province":"山西"},{"stationId":53964,"province":"山西"},{"stationId":53965,"province":"山西"},{"stationId":53966,"province":"山西"},{"stationId":53967,"province":"山西"},{"stationId":53968,"province":"山西"},{"stationId":53970,"province":"山西"},{"stationId":53972,"province":"河南"},{"stationId":53973,"province":"山西"},{"stationId":53974,"province":"河南"},{"stationId":53975,"province":"山西"},{"stationId":53976,"province":"山西"},{"stationId":53978,"province":"河南"},{"stationId":53979,"province":"河南"},{"stationId":53980,"province":"河北"},{"stationId":53981,"province":"山西"},{"stationId":53982,"province":"河南"},{"stationId":53983,"province":"河南"},{"stationId":53984,"province":"河南"},{"stationId":53985,"province":"河南"},{"stationId":53986,"province":"河南"},{"stationId":53987,"province":"河南"},{"stationId":53988,"province":"河南"},{"stationId":53989,"province":"河南"},{"stationId":53991,"province":"河南"},{"stationId":53992,"province":"河南"},{"stationId":53993,"province":"河南"},{"stationId":53994,"province":"河南"},{"stationId":53995,"province":"河南"},{"stationId":53996,"province":"河北"},{"stationId":53997,"province":"河南"},{"stationId":53998,"province":"河南"},{"stationId":54012,"province":"内蒙古"},{"stationId":54024,"province":"内蒙古"},{"stationId":54026,"province":"内蒙古"},{"stationId":54027,"province":"内蒙古"},{"stationId":54031,"province":"内蒙古"},{"stationId":54039,"province":"内蒙古"},{"stationId":54041,"province":"吉林"},{"stationId":54047,"province":"内蒙古"},{"stationId":54049,"province":"吉林"},{"stationId":54063,"province":"吉林"},{"stationId":54064,"province":"吉林"},{"stationId":54065,"province":"吉林"},{"stationId":54069,"province":"吉林"},{"stationId":54072,"province":"吉林"},{"stationId":54076,"province":"吉林"},{"stationId":54080,"province":"黑龙江"},{"stationId":54092,"province":"黑龙江"},{"stationId":54093,"province":"黑龙江"},{"stationId":54094,"province":"黑龙江"},{"stationId":54096,"province":"黑龙江"},{"stationId":54098,"province":"黑龙江"},{"stationId":54099,"province":"黑龙江"},{"stationId":54102,"province":"内蒙古"},{"stationId":54113,"province":"内蒙古"},{"stationId":54115,"province":"内蒙古"},{"stationId":54117,"province":"内蒙古"},{"stationId":54122,"province":"内蒙古"},{"stationId":54132,"province":"内蒙古"},{"stationId":54134,"province":"内蒙古"},{"stationId":54135,"province":"内蒙古"},{"stationId":54142,"province":"吉林"},{"stationId":54154,"province":"吉林"},{"stationId":54155,"province":"吉林"},{"stationId":54157,"province":"吉林"},{"stationId":54161,"province":"吉林"},{"stationId":54164,"province":"吉林"},{"stationId":54165,"province":"吉林"},{"stationId":54169,"province":"吉林"},{"stationId":54171,"province":"吉林"},{"stationId":54172,"province":"吉林"},{"stationId":54181,"province":"吉林"},{"stationId":54186,"province":"吉林"},{"stationId":54187,"province":"吉林"},{"stationId":54192,"province":"吉林"},{"stationId":54195,"province":"吉林"},{"stationId":54204,"province":"内蒙古"},{"stationId":54205,"province":"内蒙古"},{"stationId":54208,"province":"内蒙古"},{"stationId":54213,"province":"内蒙古"},{"stationId":54214,"province":"内蒙古"},{"stationId":54218,"province":"内蒙古"},{"stationId":54223,"province":"内蒙古"},{"stationId":54225,"province":"内蒙古"},{"stationId":54226,"province":"内蒙古"},{"stationId":54231,"province":"内蒙古"},{"stationId":54234,"province":"内蒙古"},{"stationId":54236,"province":"辽宁"},{"stationId":54243,"province":"辽宁"},{"stationId":54244,"province":"辽宁"},{"stationId":54245,"province":"辽宁"},{"stationId":54248,"province":"辽宁"},{"stationId":54249,"province":"辽宁"},{"stationId":54252,"province":"辽宁"},{"stationId":54254,"province":"辽宁"},{"stationId":54259,"province":"辽宁"},{"stationId":54260,"province":"吉林"},{"stationId":54261,"province":"吉林"},{"stationId":54263,"province":"吉林"},{"stationId":54266,"province":"吉林"},{"stationId":54267,"province":"吉林"},{"stationId":54273,"province":"吉林"},{"stationId":54274,"province":"吉林"},{"stationId":54276,"province":"吉林"},{"stationId":54279,"province":"吉林"},{"stationId":54284,"province":"吉林"},{"stationId":54285,"province":"吉林"},{"stationId":54286,"province":"吉林"},{"stationId":54290,"province":"吉林"},{"stationId":54291,"province":"吉林"},{"stationId":54292,"province":"吉林"},{"stationId":54293,"province":"吉林"},{"stationId":54301,"province":"河北"},{"stationId":54304,"province":"河北"},{"stationId":54305,"province":"内蒙古"},{"stationId":54308,"province":"河北"},{"stationId":54311,"province":"河北"},{"stationId":54313,"province":"内蒙古"},{"stationId":54316,"province":"内蒙古"},{"stationId":54318,"province":"河北"},{"stationId":54319,"province":"河北"},{"stationId":54320,"province":"内蒙古"},{"stationId":54321,"province":"辽宁"},{"stationId":54323,"province":"辽宁"},{"stationId":54324,"province":"辽宁"},{"stationId":54325,"province":"辽宁"},{"stationId":54326,"province":"辽宁"},{"stationId":54327,"province":"辽宁"},{"stationId":54328,"province":"辽宁"},{"stationId":54332,"province":"辽宁"},{"stationId":54333,"province":"辽宁"},{"stationId":54336,"province":"辽宁"},{"stationId":54338,"province":"辽宁"},{"stationId":54339,"province":"辽宁"},{"stationId":54340,"province":"辽宁"},{"stationId":54342,"province":"辽宁"},{"stationId":54345,"province":"辽宁"},{"stationId":54346,"province":"辽宁"},{"stationId":54347,"province":"辽宁"},{"stationId":54348,"province":"辽宁"},{"stationId":54351,"province":"辽宁"},{"stationId":54353,"province":"辽宁"},{"stationId":54362,"province":"吉林"},{"stationId":54363,"province":"吉林"},{"stationId":54371,"province":"吉林"},{"stationId":54374,"province":"吉林"},{"stationId":54377,"province":"吉林"},{"stationId":54386,"province":"吉林"},{"stationId":54398,"province":"北京"},{"stationId":54399,"province":"北京"},{"stationId":54401,"province":"河北"},{"stationId":54404,"province":"河北"},{"stationId":54405,"province":"河北"},{"stationId":54406,"province":"北京"},{"stationId":54408,"province":"河北"},{"stationId":54416,"province":"北京"},{"stationId":54419,"province":"北京"},{"stationId":54420,"province":"河北"},{"stationId":54421,"province":"北京"},{"stationId":54423,"province":"河北"},{"stationId":54424,"province":"北京"},{"stationId":54425,"province":"河北"},{"stationId":54428,"province":"天津"},{"stationId":54429,"province":"河北"},{"stationId":54430,"province":"河北"},{"stationId":54431,"province":"北京"},{"stationId":54432,"province":"河北"},{"stationId":54433,"province":"北京"},{"stationId":54434,"province":"河北"},{"stationId":54436,"province":"河北"},{"stationId":54437,"province":"河北"},{"stationId":54438,"province":"河北"},{"stationId":54439,"province":"河北"},{"stationId":54449,"province":"河北"},{"stationId":54452,"province":"辽宁"},{"stationId":54453,"province":"辽宁"},{"stationId":54454,"province":"辽宁"},{"stationId":54455,"province":"辽宁"},{"stationId":54470,"province":"辽宁"},{"stationId":54471,"province":"辽宁"},{"stationId":54474,"province":"辽宁"},{"stationId":54475,"province":"辽宁"},{"stationId":54476,"province":"辽宁"},{"stationId":54483,"province":"辽宁"},{"stationId":54486,"province":"辽宁"},{"stationId":54493,"province":"辽宁"},{"stationId":54494,"province":"辽宁"},{"stationId":54497,"province":"辽宁"},{"stationId":54499,"province":"北京"},{"stationId":54501,"province":"北京"},{"stationId":54502,"province":"河北"},{"stationId":54503,"province":"河北"},{"stationId":54505,"province":"北京"},{"stationId":54506,"province":"河北"},{"stationId":54507,"province":"河北"},{"stationId":54510,"province":"河北"},{"stationId":54511,"province":"北京"},{"stationId":54512,"province":"河北"},{"stationId":54513,"province":"北京"},{"stationId":54514,"province":"北京"},{"stationId":54515,"province":"河北"},{"stationId":54518,"province":"河北"},{"stationId":54519,"province":"河北"},{"stationId":54520,"province":"河北"},{"stationId":54521,"province":"河北"},{"stationId":54522,"province":"河北"},{"stationId":54523,"province":"天津"},{"stationId":54525,"province":"天津"},{"stationId":54526,"province":"天津"},{"stationId":54527,"province":"天津"},{"stationId":54528,"province":"天津"},{"stationId":54529,"province":"天津"},{"stationId":54530,"province":"天津"},{"stationId":54531,"province":"河北"},{"stationId":54532,"province":"河北"},{"stationId":54533,"province":"河北"},{"stationId":54534,"province":"河北"},{"stationId":54535,"province":"河北"},{"stationId":54539,"province":"河北"},{"stationId":54540,"province":"河北"},{"stationId":54541,"province":"河北"},{"stationId":54563,"province":"辽宁"},{"stationId":54565,"province":"辽宁"},{"stationId":54568,"province":"辽宁"},{"stationId":54569,"province":"辽宁"},{"stationId":54575,"province":"辽宁"},{"stationId":54579,"province":"辽宁"},{"stationId":54584,"province":"辽宁"},{"stationId":54590,"province":"辽宁"},{"stationId":54594,"province":"北京"},{"stationId":54596,"province":"北京"},{"stationId":54597,"province":"北京"},{"stationId":54601,"province":"河北"},{"stationId":54602,"province":"河北"},{"stationId":54603,"province":"河北"},{"stationId":54604,"province":"河北"},{"stationId":54605,"province":"河北"},{"stationId":54606,"province":"河北"},{"stationId":54607,"province":"河北"},{"stationId":54608,"province":"河北"},{"stationId":54609,"province":"河北"},{"stationId":54610,"province":"河北"},{"stationId":54611,"province":"河北"},{"stationId":54612,"province":"河北"},{"stationId":54613,"province":"河北"},{"stationId":54614,"province":"河北"},{"stationId":54615,"province":"河北"},{"stationId":54616,"province":"河北"},{"stationId":54617,"province":"河北"},{"stationId":54618,"province":"河北"},{"stationId":54619,"province":"天津"},{"stationId":54620,"province":"河北"},{"stationId":54621,"province":"河北"},{"stationId":54622,"province":"天津"},{"stationId":54623,"province":"天津"},{"stationId":54624,"province":"河北"},{"stationId":54626,"province":"河北"},{"stationId":54627,"province":"河北"},{"stationId":54628,"province":"河北"},{"stationId":54631,"province":"河北"},{"stationId":54632,"province":"河北"},{"stationId":54633,"province":"河北"},{"stationId":54636,"province":"河北"},{"stationId":54640,"province":"河北"},{"stationId":54644,"province":"河北"},{"stationId":54645,"province":"天津"},{"stationId":54662,"province":"辽宁"},{"stationId":54700,"province":"河北"},{"stationId":54701,"province":"河北"},{"stationId":54702,"province":"河北"},{"stationId":54703,"province":"河北"},{"stationId":54704,"province":"河北"},{"stationId":54705,"province":"河北"},{"stationId":54706,"province":"河北"},{"stationId":54707,"province":"河北"},{"stationId":54708,"province":"河北"},{"stationId":54709,"province":"山东"},{"stationId":54710,"province":"河北"},{"stationId":54711,"province":"河北"},{"stationId":54712,"province":"山东"},{"stationId":54713,"province":"河北"},{"stationId":54714,"province":"山东"},{"stationId":54715,"province":"山东"},{"stationId":54716,"province":"山东"},{"stationId":54717,"province":"河北"},{"stationId":54719,"province":"河北"},{"stationId":54722,"province":"山东"},{"stationId":54723,"province":"山东"},{"stationId":54724,"province":"山东"},{"stationId":54725,"province":"山东"},{"stationId":54726,"province":"山东"},{"stationId":54727,"province":"山东"},{"stationId":54728,"province":"山东"},{"stationId":54729,"province":"山东"},{"stationId":54734,"province":"山东"},{"stationId":54736,"province":"山东"},{"stationId":54744,"province":"山东"},{"stationId":54749,"province":"山东"},{"stationId":54751,"province":"山东"},{"stationId":54752,"province":"山东"},{"stationId":54753,"province":"山东"},{"stationId":54755,"province":"山东"},{"stationId":54759,"province":"山东"},{"stationId":54764,"province":"山东"},{"stationId":54765,"province":"山东"},{"stationId":54776,"province":"山东"},{"stationId":54777,"province":"山东"},{"stationId":54800,"province":"河北"},{"stationId":54801,"province":"河北"},{"stationId":54802,"province":"山东"},{"stationId":54804,"province":"河北"},{"stationId":54806,"province":"山东"},{"stationId":54807,"province":"山东"},{"stationId":54808,"province":"山东"},{"stationId":54809,"province":"河北"},{"stationId":54812,"province":"山东"},{"stationId":54814,"province":"山东"},{"stationId":54815,"province":"山东"},{"stationId":54816,"province":"山东"},{"stationId":54817,"province":"河南"},{"stationId":54818,"province":"山东"},{"stationId":54819,"province":"山东"},{"stationId":54820,"province":"河北"},{"stationId":54821,"province":"山东"},{"stationId":54822,"province":"山东"},{"stationId":54823,"province":"山东"},{"stationId":54824,"province":"山东"},{"stationId":54825,"province":"山东"},{"stationId":54826,"province":"山东"},{"stationId":54827,"province":"山东"},{"stationId":54828,"province":"山东"},{"stationId":54829,"province":"山东"},{"stationId":54830,"province":"山东"},{"stationId":54831,"province":"山东"},{"stationId":54832,"province":"山东"},{"stationId":54833,"province":"山东"},{"stationId":54834,"province":"山东"},{"stationId":54835,"province":"山东"},{"stationId":54836,"province":"山东"},{"stationId":54837,"province":"山东"},{"stationId":54841,"province":"山东"},{"stationId":54842,"province":"山东"},{"stationId":54843,"province":"山东"},{"stationId":54844,"province":"山东"},{"stationId":54846,"province":"山东"},{"stationId":54848,"province":"山东"},{"stationId":54849,"province":"山东"},{"stationId":54851,"province":"山东"},{"stationId":54852,"province":"山东"},{"stationId":54853,"province":"山东"},{"stationId":54855,"province":"山东"},{"stationId":54857,"province":"山东"},{"stationId":54861,"province":"山东"},{"stationId":54863,"province":"山东"},{"stationId":54871,"province":"山东"},{"stationId":54900,"province":"河南"},{"stationId":54901,"province":"河南"},{"stationId":54902,"province":"河南"},{"stationId":54903,"province":"河南"},{"stationId":54904,"province":"山东"},{"stationId":54905,"province":"山东"},{"stationId":54906,"province":"山东"},{"stationId":54907,"province":"山东"},{"stationId":54908,"province":"山东"},{"stationId":54909,"province":"山东"},{"stationId":54910,"province":"山东"},{"stationId":54911,"province":"山东"},{"stationId":54912,"province":"山东"},{"stationId":54913,"province":"山东"},{"stationId":54914,"province":"山东"},{"stationId":54915,"province":"山东"},{"stationId":54916,"province":"山东"},{"stationId":54917,"province":"山东"},{"stationId":54918,"province":"山东"},{"stationId":54919,"province":"山东"},{"stationId":54920,"province":"山东"},{"stationId":54921,"province":"山东"},{"stationId":54922,"province":"山东"},{"stationId":54923,"province":"山东"},{"stationId":54925,"province":"山东"},{"stationId":54927,"province":"山东"},{"stationId":54929,"province":"山东"},{"stationId":54932,"province":"山东"},{"stationId":54935,"province":"山东"},{"stationId":54936,"province":"山东"},{"stationId":54938,"province":"山东"},{"stationId":54939,"province":"山东"},{"stationId":54940,"province":"山东"},{"stationId":54943,"province":"山东"},{"stationId":54945,"province":"山东"},{"stationId":55228,"province":"西藏"},{"stationId":55248,"province":"西藏"},{"stationId":55299,"province":"西藏"},{"stationId":55437,"province":"西藏"},{"stationId":55493,"province":"西藏"},{"stationId":55569,"province":"西藏"},{"stationId":55572,"province":"西藏"},{"stationId":55593,"province":"西藏"},{"stationId":55597,"province":"西藏"},{"stationId":55598,"province":"西藏"},{"stationId":55655,"province":"西藏"},{"stationId":55664,"province":"西藏"},{"stationId":55680,"province":"西藏"},{"stationId":56004,"province":"青海"},{"stationId":56016,"province":"青海"},{"stationId":56018,"province":"青海"},{"stationId":56021,"province":"青海"},{"stationId":56029,"province":"青海"},{"stationId":56033,"province":"青海"},{"stationId":56034,"province":"青海"},{"stationId":56038,"province":"四川"},{"stationId":56043,"province":"青海"},{"stationId":56045,"province":"青海"},{"stationId":56046,"province":"青海"},{"stationId":56065,"province":"青海"},{"stationId":56067,"province":"青海"},{"stationId":56071,"province":"甘肃"},{"stationId":56074,"province":"甘肃"},{"stationId":56079,"province":"四川"},{"stationId":56080,"province":"甘肃"},{"stationId":56081,"province":"甘肃"},{"stationId":56082,"province":"甘肃"},{"stationId":56084,"province":"甘肃"},{"stationId":56091,"province":"甘肃"},{"stationId":56092,"province":"甘肃"},{"stationId":56093,"province":"甘肃"},{"stationId":56094,"province":"甘肃"},{"stationId":56095,"province":"甘肃"},{"stationId":56096,"province":"甘肃"},{"stationId":56097,"province":"四川"},{"stationId":56116,"province":"西藏"},{"stationId":56125,"province":"青海"},{"stationId":56128,"province":"西藏"},{"stationId":56137,"province":"西藏"},{"stationId":56144,"province":"四川"},{"stationId":56146,"province":"四川"},{"stationId":56147,"province":"四川"},{"stationId":56151,"province":"青海"},{"stationId":56152,"province":"四川"},{"stationId":56158,"province":"四川"},{"stationId":56164,"province":"四川"},{"stationId":56167,"province":"四川"},{"stationId":56168,"province":"四川"},{"stationId":56171,"province":"四川"},{"stationId":56172,"province":"四川"},{"stationId":56173,"province":"四川"},{"stationId":56178,"province":"四川"},{"stationId":56180,"province":"四川"},{"stationId":56181,"province":"四川"},{"stationId":56182,"province":"四川"},{"stationId":56183,"province":"四川"},{"stationId":56184,"province":"四川"},{"stationId":56185,"province":"四川"},{"stationId":56186,"province":"四川"},{"stationId":56187,"province":"四川"},{"stationId":56188,"province":"四川"},{"stationId":56189,"province":"四川"},{"stationId":56192,"province":"甘肃"},{"stationId":56197,"province":"四川"},{"stationId":56198,"province":"四川"},{"stationId":56199,"province":"四川"},{"stationId":56223,"province":"西藏"},{"stationId":56227,"province":"西藏"},{"stationId":56228,"province":"西藏"},{"stationId":56247,"province":"四川"},{"stationId":56251,"province":"四川"},{"stationId":56257,"province":"四川"},{"stationId":56263,"province":"四川"},{"stationId":56267,"province":"四川"},{"stationId":56272,"province":"四川"},{"stationId":56273,"province":"四川"},{"stationId":56276,"province":"四川"},{"stationId":56278,"province":"四川"},{"stationId":56279,"province":"四川"},{"stationId":56280,"province":"四川"},{"stationId":56281,"province":"四川"},{"stationId":56284,"province":"四川"},{"stationId":56285,"province":"四川"},{"stationId":56286,"province":"四川"},{"stationId":56288,"province":"四川"},{"stationId":56289,"province":"四川"},{"stationId":56290,"province":"四川"},{"stationId":56296,"province":"四川"},{"stationId":56297,"province":"四川"},{"stationId":56298,"province":"四川"},{"stationId":56312,"province":"西藏"},{"stationId":56317,"province":"西藏"},{"stationId":56331,"province":"西藏"},{"stationId":56357,"province":"四川"},{"stationId":56371,"province":"四川"},{"stationId":56373,"province":"四川"},{"stationId":56374,"province":"四川"},{"stationId":56376,"province":"四川"},{"stationId":56378,"province":"四川"},{"stationId":56380,"province":"四川"},{"stationId":56381,"province":"四川"},{"stationId":56382,"province":"四川"},{"stationId":56383,"province":"四川"},{"stationId":56384,"province":"四川"},{"stationId":56385,"province":"四川"},{"stationId":56386,"province":"四川"},{"stationId":56387,"province":"四川"},{"stationId":56389,"province":"四川"},{"stationId":56390,"province":"四川"},{"stationId":56391,"province":"四川"},{"stationId":56393,"province":"四川"},{"stationId":56394,"province":"四川"},{"stationId":56395,"province":"四川"},{"stationId":56396,"province":"四川"},{"stationId":56399,"province":"四川"},{"stationId":56434,"province":"西藏"},{"stationId":56441,"province":"四川"},{"stationId":56443,"province":"四川"},{"stationId":56444,"province":"云南"},{"stationId":56459,"province":"四川"},{"stationId":56462,"province":"四川"},{"stationId":56473,"province":"四川"},{"stationId":56474,"province":"四川"},{"stationId":56475,"province":"四川"},{"stationId":56478,"province":"四川"},{"stationId":56479,"province":"四川"},{"stationId":56480,"province":"四川"},{"stationId":56483,"province":"云南"},{"stationId":56485,"province":"四川"},{"stationId":56487,"province":"四川"},{"stationId":56489,"province":"云南"},{"stationId":56490,"province":"四川"},{"stationId":56491,"province":"四川"},{"stationId":56492,"province":"四川"},{"stationId":56493,"province":"四川"},{"stationId":56494,"province":"四川"},{"stationId":56496,"province":"四川"},{"stationId":56497,"province":"云南"},{"stationId":56498,"province":"四川"},{"stationId":56499,"province":"四川"},{"stationId":56533,"province":"云南"},{"stationId":56543,"province":"云南"},{"stationId":56548,"province":"云南"},{"stationId":56565,"province":"四川"},{"stationId":56567,"province":"云南"},{"stationId":56569,"province":"四川"},{"stationId":56571,"province":"四川"},{"stationId":56575,"province":"四川"},{"stationId":56578,"province":"四川"},{"stationId":56580,"province":"四川"},{"stationId":56582,"province":"云南"},{"stationId":56584,"province":"四川"},{"stationId":56585,"province":"云南"},{"stationId":56586,"province":"云南"},{"stationId":56592,"province":"四川"},{"stationId":56593,"province":"四川"},{"stationId":56594,"province":"云南"},{"stationId":56595,"province":"云南"},{"stationId":56596,"province":"云南"},{"stationId":56598,"province":"贵州"},{"stationId":56641,"province":"云南"},{"stationId":56643,"province":"云南"},{"stationId":56645,"province":"云南"},{"stationId":56646,"province":"云南"},{"stationId":56649,"province":"云南"},{"stationId":56651,"province":"云南"},{"stationId":56652,"province":"云南"},{"stationId":56654,"province":"云南"},{"stationId":56664,"province":"云南"},{"stationId":56665,"province":"四川"},{"stationId":56666,"province":"四川"},{"stationId":56669,"province":"云南"},{"stationId":56670,"province":"四川"},{"stationId":56671,"province":"四川"},{"stationId":56673,"province":"云南"},{"stationId":56674,"province":"四川"},{"stationId":56675,"province":"四川"},{"stationId":56684,"province":"云南"},{"stationId":56688,"province":"云南"},{"stationId":56691,"province":"贵州"},{"stationId":56697,"province":"云南"},{"stationId":56739,"province":"云南"},{"stationId":56742,"province":"云南"},{"stationId":56745,"province":"云南"},{"stationId":56746,"province":"云南"},{"stationId":56748,"province":"云南"},{"stationId":56751,"province":"云南"},{"stationId":56752,"province":"云南"},{"stationId":56755,"province":"云南"},{"stationId":56757,"province":"云南"},{"stationId":56761,"province":"云南"},{"stationId":56764,"province":"云南"},{"stationId":56766,"province":"云南"},{"stationId":56767,"province":"云南"},{"stationId":56772,"province":"云南"},{"stationId":56774,"province":"云南"},{"stationId":56777,"province":"云南"},{"stationId":56778,"province":"云南"},{"stationId":56782,"province":"云南"},{"stationId":56783,"province":"云南"},{"stationId":56785,"province":"云南"},{"stationId":56790,"province":"云南"},{"stationId":56792,"province":"贵州"},{"stationId":56793,"province":"贵州"},{"stationId":56835,"province":"云南"},{"stationId":56836,"province":"云南"},{"stationId":56839,"province":"云南"},{"stationId":56840,"province":"云南"},{"stationId":56841,"province":"云南"},{"stationId":56842,"province":"云南"},{"stationId":56843,"province":"云南"},{"stationId":56844,"province":"云南"},{"stationId":56846,"province":"云南"},{"stationId":56849,"province":"云南"},{"stationId":56851,"province":"云南"},{"stationId":56854,"province":"云南"},{"stationId":56856,"province":"云南"},{"stationId":56862,"province":"云南"},{"stationId":56863,"province":"云南"},{"stationId":56867,"province":"云南"},{"stationId":56869,"province":"云南"},{"stationId":56870,"province":"云南"},{"stationId":56871,"province":"云南"},{"stationId":56873,"province":"云南"},{"stationId":56875,"province":"云南"},{"stationId":56876,"province":"云南"},{"stationId":56878,"province":"云南"},{"stationId":56879,"province":"云南"},{"stationId":56880,"province":"云南"},{"stationId":56881,"province":"云南"},{"stationId":56882,"province":"云南"},{"stationId":56883,"province":"云南"},{"stationId":56885,"province":"云南"},{"stationId":56886,"province":"云南"},{"stationId":56889,"province":"云南"},{"stationId":56891,"province":"云南"},{"stationId":56898,"province":"云南"},{"stationId":56944,"province":"云南"},{"stationId":56946,"province":"云南"},{"stationId":56948,"province":"云南"},{"stationId":56949,"province":"云南"},{"stationId":56950,"province":"云南"},{"stationId":56951,"province":"云南"},{"stationId":56952,"province":"云南"},{"stationId":56954,"province":"云南"},{"stationId":56958,"province":"云南"},{"stationId":56962,"province":"云南"},{"stationId":56964,"province":"云南"},{"stationId":56966,"province":"云南"},{"stationId":56969,"province":"云南"},{"stationId":56970,"province":"云南"},{"stationId":56975,"province":"云南"},{"stationId":56976,"province":"云南"},{"stationId":56977,"province":"云南"},{"stationId":56978,"province":"云南"},{"stationId":56982,"province":"云南"},{"stationId":56984,"province":"云南"},{"stationId":56987,"province":"云南"},{"stationId":56991,"province":"云南"},{"stationId":56992,"province":"云南"},{"stationId":56994,"province":"云南"},{"stationId":56995,"province":"云南"},{"stationId":57001,"province":"甘肃"},{"stationId":57002,"province":"甘肃"},{"stationId":57003,"province":"陕西"},{"stationId":57004,"province":"甘肃"},{"stationId":57006,"province":"甘肃"},{"stationId":57007,"province":"甘肃"},{"stationId":57008,"province":"甘肃"},{"stationId":57011,"province":"甘肃"},{"stationId":57012,"province":"甘肃"},{"stationId":57014,"province":"甘肃"},{"stationId":57016,"province":"陕西"},{"stationId":57020,"province":"陕西"},{"stationId":57021,"province":"陕西"},{"stationId":57022,"province":"陕西"},{"stationId":57023,"province":"陕西"},{"stationId":57024,"province":"陕西"},{"stationId":57025,"province":"陕西"},{"stationId":57026,"province":"陕西"},{"stationId":57027,"province":"陕西"},{"stationId":57028,"province":"陕西"},{"stationId":57029,"province":"陕西"},{"stationId":57030,"province":"陕西"},{"stationId":57031,"province":"陕西"},{"stationId":57033,"province":"陕西"},{"stationId":57034,"province":"陕西"},{"stationId":57035,"province":"陕西"},{"stationId":57037,"province":"陕西"},{"stationId":57038,"province":"陕西"},{"stationId":57041,"province":"陕西"},{"stationId":57042,"province":"陕西"},{"stationId":57043,"province":"陕西"},{"stationId":57045,"province":"陕西"},{"stationId":57046,"province":"陕西"},{"stationId":57048,"province":"陕西"},{"stationId":57051,"province":"河南"},{"stationId":57052,"province":"山西"},{"stationId":57053,"province":"山西"},{"stationId":57054,"province":"陕西"},{"stationId":57055,"province":"陕西"},{"stationId":57056,"province":"河南"},{"stationId":57057,"province":"陕西"},{"stationId":57060,"province":"山西"},{"stationId":57061,"province":"山西"},{"stationId":57063,"province":"河南"},{"stationId":57066,"province":"河南"},{"stationId":57070,"province":"河南"},{"stationId":57071,"province":"河南"},{"stationId":57072,"province":"河南"},{"stationId":57074,"province":"河南"},{"stationId":57075,"province":"河南"},{"stationId":57076,"province":"河南"},{"stationId":57078,"province":"河南"},{"stationId":57079,"province":"河南"},{"stationId":57080,"province":"河南"},{"stationId":57081,"province":"河南"},{"stationId":57082,"province":"河南"},{"stationId":57083,"province":"河南"},{"stationId":57084,"province":"河南"},{"stationId":57085,"province":"河南"},{"stationId":57086,"province":"河南"},{"stationId":57087,"province":"河南"},{"stationId":57088,"province":"河南"},{"stationId":57089,"province":"河南"},{"stationId":57090,"province":"河南"},{"stationId":57091,"province":"河南"},{"stationId":57093,"province":"河南"},{"stationId":57094,"province":"河南"},{"stationId":57095,"province":"河南"},{"stationId":57096,"province":"河南"},{"stationId":57098,"province":"河南"},{"stationId":57099,"province":"河南"},{"stationId":57102,"province":"甘肃"},{"stationId":57105,"province":"甘肃"},{"stationId":57106,"province":"陕西"},{"stationId":57110,"province":"甘肃"},{"stationId":57111,"province":"甘肃"},{"stationId":57113,"province":"陕西"},{"stationId":57119,"province":"陕西"},{"stationId":57123,"province":"陕西"},{"stationId":57124,"province":"陕西"},{"stationId":57127,"province":"陕西"},{"stationId":57128,"province":"陕西"},{"stationId":57131,"province":"陕西"},{"stationId":57134,"province":"陕西"},{"stationId":57137,"province":"陕西"},{"stationId":57140,"province":"陕西"},{"stationId":57143,"province":"陕西"},{"stationId":57144,"province":"陕西"},{"stationId":57153,"province":"陕西"},{"stationId":57154,"province":"陕西"},{"stationId":57155,"province":"陕西"},{"stationId":57156,"province":"河南"},{"stationId":57162,"province":"河南"},{"stationId":57169,"province":"河南"},{"stationId":57173,"province":"河南"},{"stationId":57175,"province":"河南"},{"stationId":57176,"province":"河南"},{"stationId":57177,"province":"河南"},{"stationId":57178,"province":"河南"},{"stationId":57179,"province":"河南"},{"stationId":57180,"province":"河南"},{"stationId":57181,"province":"河南"},{"stationId":57182,"province":"河南"},{"stationId":57183,"province":"河南"},{"stationId":57184,"province":"河南"},{"stationId":57185,"province":"河南"},{"stationId":57186,"province":"河南"},{"stationId":57187,"province":"河南"},{"stationId":57188,"province":"河南"},{"stationId":57189,"province":"河南"},{"stationId":57190,"province":"河南"},{"stationId":57191,"province":"河南"},{"stationId":57192,"province":"河南"},{"stationId":57193,"province":"河南"},{"stationId":57194,"province":"河南"},{"stationId":57195,"province":"河南"},{"stationId":57196,"province":"河南"},{"stationId":57197,"province":"河南"},{"stationId":57198,"province":"河南"},{"stationId":57204,"province":"四川"},{"stationId":57206,"province":"四川"},{"stationId":57208,"province":"四川"},{"stationId":57211,"province":"陕西"},{"stationId":57213,"province":"陕西"},{"stationId":57216,"province":"四川"},{"stationId":57217,"province":"四川"},{"stationId":57231,"province":"陕西"},{"stationId":57232,"province":"陕西"},{"stationId":57233,"province":"陕西"},{"stationId":57237,"province":"四川"},{"stationId":57238,"province":"陕西"},{"stationId":57242,"province":"陕西"},{"stationId":57245,"province":"陕西"},{"stationId":57247,"province":"陕西"},{"stationId":57248,"province":"陕西"},{"stationId":57249,"province":"湖北"},{"stationId":57251,"province":"湖北"},{"stationId":57253,"province":"湖北"},{"stationId":57254,"province":"陕西"},{"stationId":57256,"province":"湖北"},{"stationId":57257,"province":"湖北"},{"stationId":57259,"province":"湖北"},{"stationId":57260,"province":"湖北"},{"stationId":57261,"province":"河南"},{"stationId":57265,"province":"湖北"},{"stationId":57268,"province":"湖北"},{"stationId":57271,"province":"河南"},{"stationId":57273,"province":"河南"},{"stationId":57274,"province":"河南"},{"stationId":57278,"province":"湖北"},{"stationId":57279,"province":"湖北"},{"stationId":57281,"province":"河南"},{"stationId":57285,"province":"河南"},{"stationId":57290,"province":"河南"},{"stationId":57292,"province":"河南"},{"stationId":57293,"province":"河南"},{"stationId":57294,"province":"河南"},{"stationId":57295,"province":"河南"},{"stationId":57296,"province":"河南"},{"stationId":57297,"province":"河南"},{"stationId":57298,"province":"河南"},{"stationId":57299,"province":"河南"},{"stationId":57303,"province":"四川"},{"stationId":57306,"province":"四川"},{"stationId":57307,"province":"四川"},{"stationId":57308,"province":"四川"},{"stationId":57309,"province":"四川"},{"stationId":57313,"province":"四川"},{"stationId":57314,"province":"四川"},{"stationId":57315,"province":"四川"},{"stationId":57317,"province":"四川"},{"stationId":57318,"province":"四川"},{"stationId":57320,"province":"四川"},{"stationId":57324,"province":"四川"},{"stationId":57326,"province":"四川"},{"stationId":57328,"province":"四川"},{"stationId":57329,"province":"四川"},{"stationId":57333,"province":"重庆"},{"stationId":57338,"province":"重庆"},{"stationId":57339,"province":"重庆"},{"stationId":57343,"province":"陕西"},{"stationId":57345,"province":"重庆"},{"stationId":57348,"province":"重庆"},{"stationId":57349,"province":"重庆"},{"stationId":57355,"province":"湖北"},{"stationId":57359,"province":"湖北"},{"stationId":57361,"province":"湖北"},{"stationId":57362,"province":"湖北"},{"stationId":57363,"province":"湖北"},{"stationId":57370,"province":"湖北"},{"stationId":57377,"province":"湖北"},{"stationId":57378,"province":"湖北"},{"stationId":57381,"province":"湖北"},{"stationId":57386,"province":"湖北"},{"stationId":57387,"province":"湖北"},{"stationId":57388,"province":"湖北"},{"stationId":57389,"province":"湖北"},{"stationId":57390,"province":"河南"},{"stationId":57395,"province":"湖北"},{"stationId":57396,"province":"河南"},{"stationId":57398,"province":"湖北"},{"stationId":57399,"province":"湖北"},{"stationId":57401,"province":"四川"},{"stationId":57402,"province":"四川"},{"stationId":57405,"province":"四川"},{"stationId":57407,"province":"四川"},{"stationId":57408,"province":"四川"},{"stationId":57409,"province":"重庆"},{"stationId":57411,"province":"四川"},{"stationId":57413,"province":"四川"},{"stationId":57414,"province":"四川"},{"stationId":57415,"province":"四川"},{"stationId":57416,"province":"四川"},{"stationId":57417,"province":"四川"},{"stationId":57420,"province":"四川"},{"stationId":57425,"province":"重庆"},{"stationId":57431,"province":"重庆"},{"stationId":57432,"province":"重庆"},{"stationId":57437,"province":"重庆"},{"stationId":57438,"province":"重庆"},{"stationId":57439,"province":"湖北"},{"stationId":57445,"province":"湖北"},{"stationId":57447,"province":"湖北"},{"stationId":57453,"province":"湖北"},{"stationId":57458,"province":"湖北"},{"stationId":57461,"province":"湖北"},{"stationId":57464,"province":"湖北"},{"stationId":57465,"province":"湖北"},{"stationId":57469,"province":"湖北"},{"stationId":57475,"province":"湖北"},{"stationId":57476,"province":"湖北"},{"stationId":57477,"province":"湖北"},{"stationId":57481,"province":"湖北"},{"stationId":57482,"province":"湖北"},{"stationId":57483,"province":"湖北"},{"stationId":57484,"province":"湖北"},{"stationId":57485,"province":"湖北"},{"stationId":57486,"province":"湖北"},{"stationId":57489,"province":"湖北"},{"stationId":57492,"province":"湖北"},{"stationId":57494,"province":"湖北"},{"stationId":57495,"province":"湖北"},{"stationId":57496,"province":"湖北"},{"stationId":57498,"province":"湖北"},{"stationId":57499,"province":"湖北"},{"stationId":57502,"province":"重庆"},{"stationId":57503,"province":"四川"},{"stationId":57505,"province":"重庆"},{"stationId":57506,"province":"重庆"},{"stationId":57507,"province":"四川"},{"stationId":57508,"province":"四川"},{"stationId":57509,"province":"重庆"},{"stationId":57510,"province":"重庆"},{"stationId":57511,"province":"重庆"},{"stationId":57512,"province":"重庆"},{"stationId":57513,"province":"重庆"},{"stationId":57514,"province":"重庆"},{"stationId":57516,"province":"重庆"},{"stationId":57517,"province":"重庆"},{"stationId":57518,"province":"重庆"},{"stationId":57519,"province":"重庆"},{"stationId":57520,"province":"重庆"},{"stationId":57523,"province":"重庆"},{"stationId":57525,"province":"重庆"},{"stationId":57536,"province":"重庆"},{"stationId":57537,"province":"重庆"},{"stationId":57540,"province":"湖北"},{"stationId":57541,"province":"湖北"},{"stationId":57543,"province":"湖北"},{"stationId":57544,"province":"湖南"},{"stationId":57545,"province":"湖北"},{"stationId":57554,"province":"湖南"},{"stationId":57558,"province":"湖南"},{"stationId":57562,"province":"湖南"},{"stationId":57564,"province":"湖南"},{"stationId":57565,"province":"湖南"},{"stationId":57566,"province":"湖南"},{"stationId":57571,"province":"湖北"},{"stationId":57573,"province":"湖北"},{"stationId":57574,"province":"湖南"},{"stationId":57575,"province":"湖南"},{"stationId":57577,"province":"湖南"},{"stationId":57581,"province":"湖北"},{"stationId":57582,"province":"湖北"},{"stationId":57583,"province":"湖北"},{"stationId":57584,"province":"湖南"},{"stationId":57585,"province":"湖南"},{"stationId":57586,"province":"湖北"},{"stationId":57589,"province":"湖北"},{"stationId":57590,"province":"湖北"},{"stationId":57596,"province":"湖北"},{"stationId":57598,"province":"江西"},{"stationId":57600,"province":"四川"},{"stationId":57603,"province":"四川"},{"stationId":57606,"province":"贵州"},{"stationId":57608,"province":"四川"},{"stationId":57612,"province":"重庆"},{"stationId":57623,"province":"贵州"},{"stationId":57625,"province":"贵州"},{"stationId":57633,"province":"重庆"},{"stationId":57634,"province":"贵州"},{"stationId":57635,"province":"重庆"},{"stationId":57636,"province":"贵州"},{"stationId":57637,"province":"贵州"},{"stationId":57640,"province":"湖南"},{"stationId":57642,"province":"湖南"},{"stationId":57643,"province":"湖南"},{"stationId":57646,"province":"湖南"},{"stationId":57647,"province":"贵州"},{"stationId":57649,"province":"湖南"},{"stationId":57655,"province":"湖南"},{"stationId":57657,"province":"湖南"},{"stationId":57658,"province":"湖南"},{"stationId":57661,"province":"湖南"},{"stationId":57662,"province":"湖南"},{"stationId":57663,"province":"湖南"},{"stationId":57666,"province":"湖南"},{"stationId":57669,"province":"湖南"},{"stationId":57671,"province":"湖南"},{"stationId":57673,"province":"湖南"},{"stationId":57674,"province":"湖南"},{"stationId":57678,"province":"湖南"},{"stationId":57679,"province":"湖南"},{"stationId":57680,"province":"湖南"},{"stationId":57682,"province":"湖南"},{"stationId":57687,"province":"湖南"},{"stationId":57688,"province":"湖南"},{"stationId":57694,"province":"江西"},{"stationId":57696,"province":"江西"},{"stationId":57698,"province":"江西"},{"stationId":57699,"province":"江西"},{"stationId":57707,"province":"贵州"},{"stationId":57708,"province":"贵州"},{"stationId":57710,"province":"贵州"},{"stationId":57714,"province":"贵州"},{"stationId":57717,"province":"贵州"},{"stationId":57718,"province":"贵州"},{"stationId":57719,"province":"贵州"},{"stationId":57722,"province":"贵州"},{"stationId":57723,"province":"贵州"},{"stationId":57728,"province":"贵州"},{"stationId":57729,"province":"贵州"},{"stationId":57731,"province":"贵州"},{"stationId":57732,"province":"贵州"},{"stationId":57734,"province":"贵州"},{"stationId":57735,"province":"贵州"},{"stationId":57736,"province":"贵州"},{"stationId":57737,"province":"贵州"},{"stationId":57738,"province":"贵州"},{"stationId":57739,"province":"贵州"},{"stationId":57740,"province":"湖南"},{"stationId":57741,"province":"贵州"},{"stationId":57742,"province":"贵州"},{"stationId":57743,"province":"湖南"},{"stationId":57744,"province":"湖南"},{"stationId":57745,"province":"湖南"},{"stationId":57752,"province":"湖南"},{"stationId":57754,"province":"湖南"},{"stationId":57760,"province":"湖南"},{"stationId":57761,"province":"湖南"},{"stationId":57762,"province":"湖南"},{"stationId":57763,"province":"湖南"},{"stationId":57771,"province":"湖南"},{"stationId":57772,"province":"湖南"},{"stationId":57773,"province":"湖南"},{"stationId":57774,"province":"湖南"},{"stationId":57776,"province":"湖南"},{"stationId":57777,"province":"湖南"},{"stationId":57778,"province":"湖南"},{"stationId":57779,"province":"湖南"},{"stationId":57780,"province":"湖南"},{"stationId":57781,"province":"湖南"},{"stationId":57783,"province":"江西"},{"stationId":57786,"province":"江西"},{"stationId":57789,"province":"江西"},{"stationId":57792,"province":"江西"},{"stationId":57793,"province":"江西"},{"stationId":57794,"province":"江西"},{"stationId":57796,"province":"江西"},{"stationId":57798,"province":"江西"},{"stationId":57799,"province":"江西"},{"stationId":57800,"province":"贵州"},{"stationId":57803,"province":"贵州"},{"stationId":57805,"province":"贵州"},{"stationId":57806,"province":"贵州"},{"stationId":57807,"province":"贵州"},{"stationId":57808,"province":"贵州"},{"stationId":57809,"province":"贵州"},{"stationId":57811,"province":"贵州"},{"stationId":57814,"province":"贵州"},{"stationId":57816,"province":"贵州"},{"stationId":57821,"province":"贵州"},{"stationId":57822,"province":"贵州"},{"stationId":57824,"province":"贵州"},{"stationId":57825,"province":"贵州"},{"stationId":57827,"province":"贵州"},{"stationId":57828,"province":"贵州"},{"stationId":57829,"province":"贵州"},{"stationId":57832,"province":"贵州"},{"stationId":57834,"province":"贵州"},{"stationId":57835,"province":"贵州"},{"stationId":57837,"province":"贵州"},{"stationId":57839,"province":"贵州"},{"stationId":57840,"province":"贵州"},{"stationId":57844,"province":"贵州"},{"stationId":57845,"province":"湖南"},{"stationId":57859,"province":"广西"},{"stationId":57865,"province":"湖南"},{"stationId":57866,"province":"湖南"},{"stationId":57867,"province":"湖南"},{"stationId":57868,"province":"湖南"},{"stationId":57870,"province":"湖南"},{"stationId":57871,"province":"湖南"},{"stationId":57872,"province":"湖南"},{"stationId":57874,"province":"湖南"},{"stationId":57875,"province":"湖南"},{"stationId":57876,"province":"湖南"},{"stationId":57881,"province":"湖南"},{"stationId":57882,"province":"湖南"},{"stationId":57883,"province":"江西"},{"stationId":57886,"province":"湖南"},{"stationId":57887,"province":"湖南"},{"stationId":57889,"province":"湖南"},{"stationId":57891,"province":"江西"},{"stationId":57894,"province":"江西"},{"stationId":57895,"province":"江西"},{"stationId":57896,"province":"江西"},{"stationId":57899,"province":"江西"},{"stationId":57900,"province":"贵州"},{"stationId":57902,"province":"贵州"},{"stationId":57903,"province":"贵州"},{"stationId":57905,"province":"贵州"},{"stationId":57906,"province":"贵州"},{"stationId":57907,"province":"贵州"},{"stationId":57908,"province":"贵州"},{"stationId":57909,"province":"贵州"},{"stationId":57910,"province":"贵州"},{"stationId":57911,"province":"贵州"},{"stationId":57912,"province":"贵州"},{"stationId":57913,"province":"贵州"},{"stationId":57914,"province":"贵州"},{"stationId":57915,"province":"贵州"},{"stationId":57916,"province":"贵州"},{"stationId":57921,"province":"贵州"},{"stationId":57922,"province":"贵州"},{"stationId":57923,"province":"贵州"},{"stationId":57926,"province":"贵州"},{"stationId":57927,"province":"广西"},{"stationId":57932,"province":"贵州"},{"stationId":57936,"province":"贵州"},{"stationId":57941,"province":"广西"},{"stationId":57942,"province":"广西"},{"stationId":57947,"province":"广西"},{"stationId":57948,"province":"广西"},{"stationId":57949,"province":"广西"},{"stationId":57954,"province":"广西"},{"stationId":57955,"province":"广西"},{"stationId":57956,"province":"广西"},{"stationId":57957,"province":"广西"},{"stationId":57960,"province":"广西"},{"stationId":57962,"province":"湖南"},{"stationId":57964,"province":"广西"},{"stationId":57965,"province":"湖南"},{"stationId":57966,"province":"湖南"},{"stationId":57969,"province":"湖南"},{"stationId":57971,"province":"湖南"},{"stationId":57972,"province":"湖南"},{"stationId":57973,"province":"湖南"},{"stationId":57974,"province":"湖南"},{"stationId":57975,"province":"湖南"},{"stationId":57976,"province":"湖南"},{"stationId":57978,"province":"湖南"},{"stationId":57981,"province":"湖南"},{"stationId":57985,"province":"湖南"},{"stationId":57988,"province":"广东"},{"stationId":57989,"province":"广东"},{"stationId":57990,"province":"江西"},{"stationId":57991,"province":"江西"},{"stationId":57992,"province":"江西"},{"stationId":57993,"province":"江西"},{"stationId":57994,"province":"江西"},{"stationId":57995,"province":"江西"},{"stationId":57996,"province":"广东"},{"stationId":58001,"province":"河南"},{"stationId":58002,"province":"山东"},{"stationId":58003,"province":"山东"},{"stationId":58004,"province":"河南"},{"stationId":58005,"province":"河南"},{"stationId":58006,"province":"河南"},{"stationId":58007,"province":"河南"},{"stationId":58008,"province":"河南"},{"stationId":58011,"province":"山东"},{"stationId":58012,"province":"江苏"},{"stationId":58013,"province":"江苏"},{"stationId":58015,"province":"安徽"},{"stationId":58016,"province":"安徽"},{"stationId":58017,"province":"河南"},{"stationId":58020,"province":"山东"},{"stationId":58021,"province":"山东"},{"stationId":58022,"province":"山东"},{"stationId":58024,"province":"山东"},{"stationId":58025,"province":"山东"},{"stationId":58026,"province":"江苏"},{"stationId":58027,"province":"江苏"},{"stationId":58030,"province":"山东"},{"stationId":58032,"province":"山东"},{"stationId":58035,"province":"江苏"},{"stationId":58036,"province":"江苏"},{"stationId":58038,"province":"江苏"},{"stationId":58040,"province":"江苏"},{"stationId":58041,"province":"江苏"},{"stationId":58044,"province":"江苏"},{"stationId":58045,"province":"江苏"},{"stationId":58047,"province":"江苏"},{"stationId":58048,"province":"江苏"},{"stationId":58049,"province":"江苏"},{"stationId":58100,"province":"河南"},{"stationId":58101,"province":"河南"},{"stationId":58102,"province":"安徽"},{"stationId":58104,"province":"河南"},{"stationId":58107,"province":"安徽"},{"stationId":58108,"province":"安徽"},{"stationId":58109,"province":"安徽"},{"stationId":58111,"province":"河南"},{"stationId":58112,"province":"安徽"},{"stationId":58113,"province":"安徽"},{"stationId":58114,"province":"安徽"},{"stationId":58116,"province":"安徽"},{"stationId":58117,"province":"安徽"},{"stationId":58118,"province":"安徽"},{"stationId":58122,"province":"安徽"},{"stationId":58125,"province":"安徽"},{"stationId":58126,"province":"安徽"},{"stationId":58127,"province":"安徽"},{"stationId":58128,"province":"安徽"},{"stationId":58129,"province":"安徽"},{"stationId":58130,"province":"江苏"},{"stationId":58131,"province":"江苏"},{"stationId":58132,"province":"江苏"},{"stationId":58135,"province":"江苏"},{"stationId":58138,"province":"江苏"},{"stationId":58139,"province":"江苏"},{"stationId":58140,"province":"江苏"},{"stationId":58141,"province":"江苏"},{"stationId":58143,"province":"江苏"},{"stationId":58145,"province":"江苏"},{"stationId":58146,"province":"江苏"},{"stationId":58147,"province":"江苏"},{"stationId":58148,"province":"江苏"},{"stationId":58150,"province":"江苏"},{"stationId":58154,"province":"江苏"},{"stationId":58158,"province":"江苏"},{"stationId":58202,"province":"安徽"},{"stationId":58203,"province":"安徽"},{"stationId":58205,"province":"河南"},{"stationId":58207,"province":"河南"},{"stationId":58208,"province":"河南"},{"stationId":58210,"province":"安徽"},{"stationId":58212,"province":"安徽"},{"stationId":58214,"province":"安徽"},{"stationId":58215,"province":"安徽"},{"stationId":58220,"province":"安徽"},{"stationId":58221,"province":"安徽"},{"stationId":58222,"province":"安徽"},{"stationId":58223,"province":"安徽"},{"stationId":58224,"province":"安徽"},{"stationId":58225,"province":"安徽"},{"stationId":58234,"province":"安徽"},{"stationId":58235,"province":"江苏"},{"stationId":58236,"province":"安徽"},{"stationId":58237,"province":"江苏"},{"stationId":58238,"province":"江苏"},{"stationId":58240,"province":"安徽"},{"stationId":58241,"province":"江苏"},{"stationId":58242,"province":"江苏"},{"stationId":58243,"province":"江苏"},{"stationId":58244,"province":"江苏"},{"stationId":58245,"province":"江苏"},{"stationId":58246,"province":"江苏"},{"stationId":58247,"province":"江苏"},{"stationId":58249,"province":"江苏"},{"stationId":58250,"province":"江苏"},{"stationId":58251,"province":"江苏"},{"stationId":58252,"province":"江苏"},{"stationId":58254,"province":"江苏"},{"stationId":58255,"province":"江苏"},{"stationId":58257,"province":"江苏"},{"stationId":58259,"province":"江苏"},{"stationId":58264,"province":"江苏"},{"stationId":58265,"province":"江苏"},{"stationId":58268,"province":"江苏"},{"stationId":58269,"province":"江苏"},{"stationId":58301,"province":"河南"},{"stationId":58306,"province":"安徽"},{"stationId":58311,"province":"安徽"},{"stationId":58314,"province":"安徽"},{"stationId":58316,"province":"安徽"},{"stationId":58317,"province":"安徽"},{"stationId":58319,"province":"安徽"},{"stationId":58320,"province":"安徽"},{"stationId":58321,"province":"安徽"},{"stationId":58323,"province":"安徽"},{"stationId":58326,"province":"安徽"},{"stationId":58327,"province":"安徽"},{"stationId":58329,"province":"安徽"},{"stationId":58330,"province":"安徽"},{"stationId":58331,"province":"安徽"},{"stationId":58334,"province":"安徽"},{"stationId":58335,"province":"安徽"},{"stationId":58336,"province":"安徽"},{"stationId":58337,"province":"安徽"},{"stationId":58338,"province":"安徽"},{"stationId":58339,"province":"江苏"},{"stationId":58340,"province":"江苏"},{"stationId":58341,"province":"江苏"},{"stationId":58342,"province":"江苏"},{"stationId":58344,"province":"江苏"},{"stationId":58345,"province":"江苏"},{"stationId":58346,"province":"江苏"},{"stationId":58349,"province":"江苏"},{"stationId":58351,"province":"江苏"},{"stationId":58352,"province":"江苏"},{"stationId":58353,"province":"江苏"},{"stationId":58354,"province":"江苏"},{"stationId":58356,"province":"江苏"},{"stationId":58358,"province":"江苏"},{"stationId":58359,"province":"江苏"},{"stationId":58360,"province":"江苏"},{"stationId":58361,"province":"上海"},{"stationId":58362,"province":"上海"},{"stationId":58365,"province":"上海"},{"stationId":58366,"province":"上海"},{"stationId":58367,"province":"上海"},{"stationId":58369,"province":"上海"},{"stationId":58370,"province":"上海"},{"stationId":58377,"province":"江苏"},{"stationId":58401,"province":"湖北"},{"stationId":58402,"province":"湖北"},{"stationId":58404,"province":"湖北"},{"stationId":58408,"province":"湖北"},{"stationId":58409,"province":"湖北"},{"stationId":58417,"province":"安徽"},{"stationId":58429,"province":"安徽"},{"stationId":58431,"province":"安徽"},{"stationId":58432,"province":"安徽"},{"stationId":58433,"province":"安徽"},{"stationId":58435,"province":"安徽"},{"stationId":58436,"province":"安徽"},{"stationId":58437,"province":"安徽"},{"stationId":58441,"province":"安徽"},{"stationId":58442,"province":"安徽"},{"stationId":58443,"province":"浙江"},{"stationId":58446,"province":"浙江"},{"stationId":58448,"province":"浙江"},{"stationId":58449,"province":"浙江"},{"stationId":58450,"province":"浙江"},{"stationId":58451,"province":"浙江"},{"stationId":58452,"province":"浙江"},{"stationId":58453,"province":"浙江"},{"stationId":58454,"province":"浙江"},{"stationId":58455,"province":"浙江"},{"stationId":58456,"province":"浙江"},{"stationId":58457,"province":"浙江"},{"stationId":58458,"province":"浙江"},{"stationId":58459,"province":"浙江"},{"stationId":58460,"province":"上海"},{"stationId":58461,"province":"上海"},{"stationId":58462,"province":"上海"},{"stationId":58463,"province":"上海"},{"stationId":58464,"province":"浙江"},{"stationId":58467,"province":"浙江"},{"stationId":58468,"province":"浙江"},{"stationId":58472,"province":"浙江"},{"stationId":58477,"province":"浙江"},{"stationId":58484,"province":"浙江"},{"stationId":58500,"province":"湖北"},{"stationId":58501,"province":"湖北"},{"stationId":58502,"province":"江西"},{"stationId":58503,"province":"江西"},{"stationId":58505,"province":"江西"},{"stationId":58506,"province":"江西"},{"stationId":58507,"province":"江西"},{"stationId":58508,"province":"江西"},{"stationId":58509,"province":"江西"},{"stationId":58510,"province":"江西"},{"stationId":58512,"province":"江西"},{"stationId":58514,"province":"江西"},{"stationId":58517,"province":"江西"},{"stationId":58519,"province":"江西"},{"stationId":58520,"province":"安徽"},{"stationId":58523,"province":"安徽"},{"stationId":58524,"province":"江西"},{"stationId":58527,"province":"江西"},{"stationId":58529,"province":"江西"},{"stationId":58530,"province":"安徽"},{"stationId":58531,"province":"安徽"},{"stationId":58534,"province":"安徽"},{"stationId":58537,"province":"浙江"},{"stationId":58542,"province":"浙江"},{"stationId":58543,"province":"浙江"},{"stationId":58544,"province":"浙江"},{"stationId":58546,"province":"浙江"},{"stationId":58547,"province":"浙江"},{"stationId":58548,"province":"浙江"},{"stationId":58549,"province":"浙江"},{"stationId":58550,"province":"浙江"},{"stationId":58553,"province":"浙江"},{"stationId":58555,"province":"浙江"},{"stationId":58556,"province":"浙江"},{"stationId":58557,"province":"浙江"},{"stationId":58558,"province":"浙江"},{"stationId":58559,"province":"浙江"},{"stationId":58560,"province":"浙江"},{"stationId":58561,"province":"浙江"},{"stationId":58562,"province":"浙江"},{"stationId":58563,"province":"浙江"},{"stationId":58565,"province":"浙江"},{"stationId":58566,"province":"浙江"},{"stationId":58567,"province":"浙江"},{"stationId":58568,"province":"浙江"},{"stationId":58569,"province":"浙江"},{"stationId":58570,"province":"浙江"},{"stationId":58600,"province":"江西"},{"stationId":58601,"province":"江西"},{"stationId":58602,"province":"江西"},{"stationId":58605,"province":"江西"},{"stationId":58606,"province":"江西"},{"stationId":58607,"province":"江西"},{"stationId":58608,"province":"江西"},{"stationId":58609,"province":"江西"},{"stationId":58612,"province":"江西"},{"stationId":58614,"province":"江西"},{"stationId":58615,"province":"江西"},{"stationId":58616,"province":"江西"},{"stationId":58618,"province":"江西"},{"stationId":58619,"province":"江西"},{"stationId":58620,"province":"江西"},{"stationId":58622,"province":"江西"},{"stationId":58623,"province":"江西"},{"stationId":58624,"province":"江西"},{"stationId":58625,"province":"江西"},{"stationId":58626,"province":"江西"},{"stationId":58627,"province":"江西"},{"stationId":58629,"province":"江西"},{"stationId":58631,"province":"浙江"},{"stationId":58632,"province":"浙江"},{"stationId":58634,"province":"江西"},{"stationId":58635,"province":"江西"},{"stationId":58637,"province":"江西"},{"stationId":58642,"province":"浙江"},{"stationId":58643,"province":"浙江"},{"stationId":58644,"province":"浙江"},{"stationId":58646,"province":"浙江"},{"stationId":58647,"province":"浙江"},{"stationId":58648,"province":"浙江"},{"stationId":58652,"province":"浙江"},{"stationId":58654,"province":"浙江"},{"stationId":58656,"province":"浙江"},{"stationId":58657,"province":"浙江"},{"stationId":58658,"province":"浙江"},{"stationId":58659,"province":"浙江"},{"stationId":58660,"province":"浙江"},{"stationId":58664,"province":"浙江"},{"stationId":58665,"province":"浙江"},{"stationId":58666,"province":"浙江"},{"stationId":58667,"province":"浙江"},{"stationId":58693,"province":"江西"},{"stationId":58701,"province":"江西"},{"stationId":58704,"province":"江西"},{"stationId":58705,"province":"江西"},{"stationId":58706,"province":"江西"},{"stationId":58707,"province":"江西"},{"stationId":58710,"province":"江西"},{"stationId":58712,"province":"江西"},{"stationId":58713,"province":"江西"},{"stationId":58714,"province":"江西"},{"stationId":58715,"province":"江西"},{"stationId":58718,"province":"江西"},{"stationId":58719,"province":"江西"},{"stationId":58724,"province":"福建"},{"stationId":58725,"province":"福建"},{"stationId":58730,"province":"福建"},{"stationId":58731,"province":"福建"},{"stationId":58734,"province":"福建"},{"stationId":58735,"province":"福建"},{"stationId":58736,"province":"福建"},{"stationId":58737,"province":"福建"},{"stationId":58742,"province":"浙江"},{"stationId":58744,"province":"福建"},{"stationId":58745,"province":"浙江"},{"stationId":58746,"province":"浙江"},{"stationId":58747,"province":"福建"},{"stationId":58748,"province":"福建"},{"stationId":58749,"province":"福建"},{"stationId":58750,"province":"浙江"},{"stationId":58751,"province":"浙江"},{"stationId":58752,"province":"浙江"},{"stationId":58754,"province":"福建"},{"stationId":58804,"province":"江西"},{"stationId":58806,"province":"江西"},{"stationId":58813,"province":"江西"},{"stationId":58814,"province":"江西"},{"stationId":58818,"province":"福建"},{"stationId":58819,"province":"福建"},{"stationId":58820,"province":"福建"},{"stationId":58822,"province":"福建"},{"stationId":58823,"province":"福建"},{"stationId":58824,"province":"福建"},{"stationId":58826,"province":"福建"},{"stationId":58828,"province":"福建"},{"stationId":58836,"province":"福建"},{"stationId":58837,"province":"福建"},{"stationId":58839,"province":"福建"},{"stationId":58843,"province":"福建"},{"stationId":58844,"province":"福建"},{"stationId":58845,"province":"福建"},{"stationId":58846,"province":"福建"},{"stationId":58847,"province":"福建"},{"stationId":58848,"province":"福建"},{"stationId":58850,"province":"福建"},{"stationId":58903,"province":"江西"},{"stationId":58905,"province":"江西"},{"stationId":58906,"province":"江西"},{"stationId":58907,"province":"江西"},{"stationId":58911,"province":"福建"},{"stationId":58917,"province":"福建"},{"stationId":58918,"province":"福建"},{"stationId":58923,"province":"福建"},{"stationId":58926,"province":"福建"},{"stationId":58927,"province":"福建"},{"stationId":58928,"province":"福建"},{"stationId":58929,"province":"福建"},{"stationId":58931,"province":"福建"},{"stationId":58932,"province":"福建"},{"stationId":58934,"province":"福建"},{"stationId":58935,"province":"福建"},{"stationId":58938,"province":"福建"},{"stationId":58941,"province":"福建"},{"stationId":58942,"province":"福建"},{"stationId":58944,"province":"福建"},{"stationId":58946,"province":"福建"},{"stationId":59001,"province":"广西"},{"stationId":59004,"province":"广西"},{"stationId":59007,"province":"云南"},{"stationId":59012,"province":"广西"},{"stationId":59015,"province":"广西"},{"stationId":59017,"province":"广西"},{"stationId":59021,"province":"广西"},{"stationId":59023,"province":"广西"},{"stationId":59025,"province":"广西"},{"stationId":59027,"province":"广西"},{"stationId":59031,"province":"广西"},{"stationId":59034,"province":"广西"},{"stationId":59037,"province":"广西"},{"stationId":59038,"province":"广西"},{"stationId":59041,"province":"广西"},{"stationId":59044,"province":"广西"},{"stationId":59045,"province":"广西"},{"stationId":59046,"province":"广西"},{"stationId":59047,"province":"广西"},{"stationId":59052,"province":"广西"},{"stationId":59053,"province":"广西"},{"stationId":59055,"province":"广西"},{"stationId":59057,"province":"广西"},{"stationId":59058,"province":"广西"},{"stationId":59059,"province":"广西"},{"stationId":59063,"province":"湖南"},{"stationId":59065,"province":"广西"},{"stationId":59071,"province":"广东"},{"stationId":59072,"province":"广东"},{"stationId":59074,"province":"广东"},{"stationId":59075,"province":"广东"},{"stationId":59081,"province":"广东"},{"stationId":59082,"province":"广东"},{"stationId":59087,"province":"广东"},{"stationId":59088,"province":"广东"},{"stationId":59090,"province":"广东"},{"stationId":59091,"province":"江西"},{"stationId":59092,"province":"江西"},{"stationId":59093,"province":"江西"},{"stationId":59094,"province":"广东"},{"stationId":59096,"province":"广东"},{"stationId":59097,"province":"广东"},{"stationId":59099,"province":"广东"},{"stationId":59102,"province":"江西"},{"stationId":59106,"province":"广东"},{"stationId":59107,"province":"广东"},{"stationId":59109,"province":"广东"},{"stationId":59113,"province":"福建"},{"stationId":59114,"province":"广东"},{"stationId":59116,"province":"广东"},{"stationId":59117,"province":"广东"},{"stationId":59122,"province":"福建"},{"stationId":59124,"province":"福建"},{"stationId":59125,"province":"福建"},{"stationId":59127,"province":"福建"},{"stationId":59129,"province":"福建"},{"stationId":59130,"province":"福建"},{"stationId":59131,"province":"福建"},{"stationId":59133,"province":"福建"},{"stationId":59134,"province":"福建"},{"stationId":59205,"province":"云南"},{"stationId":59209,"province":"广西"},{"stationId":59211,"province":"广西"},{"stationId":59215,"province":"广西"},{"stationId":59218,"province":"广西"},{"stationId":59224,"province":"广西"},{"stationId":59227,"province":"广西"},{"stationId":59228,"province":"广西"},{"stationId":59229,"province":"广西"},{"stationId":59230,"province":"广西"},{"stationId":59235,"province":"广西"},{"stationId":59237,"province":"广西"},{"stationId":59238,"province":"广西"},{"stationId":59241,"province":"广西"},{"stationId":59242,"province":"广西"},{"stationId":59246,"province":"广西"},{"stationId":59255,"province":"广西"},{"stationId":59256,"province":"广西"},{"stationId":59264,"province":"广东"},{"stationId":59265,"province":"广西"},{"stationId":59266,"province":"广西"},{"stationId":59268,"province":"广东"},{"stationId":59269,"province":"广东"},{"stationId":59270,"province":"广东"},{"stationId":59271,"province":"广东"},{"stationId":59276,"province":"广东"},{"stationId":59278,"province":"广东"},{"stationId":59279,"province":"广东"},{"stationId":59280,"province":"广东"},{"stationId":59284,"province":"广东"},{"stationId":59285,"province":"广东"},{"stationId":59287,"province":"广东"},{"stationId":59288,"province":"广东"},{"stationId":59289,"province":"广东"},{"stationId":59290,"province":"广东"},{"stationId":59293,"province":"广东"},{"stationId":59294,"province":"广东"},{"stationId":59297,"province":"广东"},{"stationId":59298,"province":"广东"},{"stationId":59303,"province":"广东"},{"stationId":59304,"province":"广东"},{"stationId":59306,"province":"广东"},{"stationId":59310,"province":"广东"},{"stationId":59312,"province":"广东"},{"stationId":59313,"province":"广东"},{"stationId":59314,"province":"广东"},{"stationId":59315,"province":"广东"},{"stationId":59316,"province":"广东"},{"stationId":59317,"province":"广东"},{"stationId":59318,"province":"广东"},{"stationId":59319,"province":"广东"},{"stationId":59320,"province":"福建"},{"stationId":59322,"province":"福建"},{"stationId":59324,"province":"广东"},{"stationId":59419,"province":"广西"},{"stationId":59421,"province":"广西"},{"stationId":59429,"province":"广西"},{"stationId":59431,"province":"广西"},{"stationId":59435,"province":"广西"},{"stationId":59441,"province":"广西"},{"stationId":59446,"province":"广西"},{"stationId":59448,"province":"广西"},{"stationId":59449,"province":"广西"},{"stationId":59451,"province":"广西"},{"stationId":59452,"province":"广西"},{"stationId":59454,"province":"广西"},{"stationId":59456,"province":"广东"},{"stationId":59457,"province":"广西"},{"stationId":59462,"province":"广东"},{"stationId":59469,"province":"广东"},{"stationId":59470,"province":"广东"},{"stationId":59471,"province":"广东"},{"stationId":59473,"province":"广东"},{"stationId":59475,"province":"广东"},{"stationId":59476,"province":"广东"},{"stationId":59477,"province":"广东"},{"stationId":59478,"province":"广东"},{"stationId":59480,"province":"广东"},{"stationId":59481,"province":"广东"},{"stationId":59485,"province":"广东"},{"stationId":59487,"province":"广东"},{"stationId":59488,"province":"广东"},{"stationId":59492,"province":"广东"},{"stationId":59493,"province":"广东"},{"stationId":59500,"province":"广东"},{"stationId":59501,"province":"广东"},{"stationId":59502,"province":"广东"},{"stationId":59632,"province":"广西"},{"stationId":59635,"province":"广西"},{"stationId":59640,"province":"广西"},{"stationId":59644,"province":"广西"},{"stationId":59650,"province":"广东"},{"stationId":59653,"province":"广东"},{"stationId":59654,"province":"广东"},{"stationId":59655,"province":"广东"},{"stationId":59656,"province":"广东"},{"stationId":59658,"province":"广东"},{"stationId":59659,"province":"广东"},{"stationId":59663,"province":"广东"},{"stationId":59664,"province":"广东"},{"stationId":59673,"province":"广东"},{"stationId":59750,"province":"广东"},{"stationId":59754,"province":"广东"},{"stationId":59757,"province":"海南"},{"stationId":59758,"province":"海南"},{"stationId":59838,"province":"海南"},{"stationId":59842,"province":"海南"},{"stationId":59843,"province":"海南"},{"stationId":59845,"province":"海南"},{"stationId":59847,"province":"海南"},{"stationId":59848,"province":"海南"},{"stationId":59849,"province":"海南"},{"stationId":59851,"province":"海南"},{"stationId":59854,"province":"海南"},{"stationId":59855,"province":"海南"},{"stationId":59856,"province":"海南"},{"stationId":59941,"province":"海南"},{"stationId":59945,"province":"海南"},{"stationId":59951,"province":"海南"},{"stationId":89058,"province":"极地"},{"stationId":89573,"province":"极地"}];
                Sid_Province.forEach(s=>{
                    s.province == this.provinceSelect && stations.push(s.stationId);
                })
            }
            
            let params = {
                type:this.weather_type_select,
                rangeValue:JSON.stringify(this.rangeValue),
                rangeTime:JSON.stringify(this.rangeTime),
                stations:JSON.stringify(stations)
            };
            // console.log(params);

            this.$axios.get('/querybymanyoptions',{params}).then(({data})=>{
                // console.log("any:",data);
                let series = this.dealWeatherDataToEchartData(data);
                this.renderChart(series,xAxisData);
                this.show_options_bar = false;
                this.loading = false;

            });
            let xAxisData = [];
            let startDate = this.createDateByformatString(this.rangeTime[0]);
            let endDate = this.createDateByformatString(this.rangeTime[1]);
            let currDate = startDate;
            while(currDate.getTime() <= endDate.getTime()){
                xAxisData.push(currDate.format("yyyy-MM-dd hh:mm:ss"));
                currDate.setTime(currDate.getTime()+3600000);
            }
            

        },
        createDateByformatString(timeStr){
            let ps = timeStr.split(" ");
            let pd = ps[0].split("-");
            let pt = ps.length > 1 ? ps[1].split(":") : [0, 0, 0];
            return new Date(pd[0], pd[1] - 1, pd[2], pt[0], pt[1], pt[2]);
        }
    },
    watch:{
        // showData(){
        //     if(this.weather_type_select)
        //     if (this.echart) {
        //         switch (this.weather_type_select) {
        //         case 'TEM_Max':
        //         case 'TEM_Min':
        //         case 'TEM':
        //             this.unit = '℃';
        //             this.zhongwen = '温度';
        //             break;
        //         case 'RHU':
        //             this.unit = '%';
        //             this.zhongwen = '相对湿度';
        //             break;
        //         case 'PRS':
        //         case 'PRS_Max':
        //         case 'PRS_Min':
        //             this.unit = 'hPa';
        //             this.zhongwen = '气压';
        //             break;
        //         case 'PRE_1h':
        //             this.unit = 'mm';
        //             this.zhongwen = '一小时降雨量'
        //             break;
        //         case 'windpower':
        //             this.unit = '级';
        //             this.zhongwen = '风力'
        //             break;
        //         case 'VIS':
        //             this.unit = 'KM';
        //             this.zhongwen = '能见度'
        //             break;
        //         case 'CLO_Cov':
        //             this.unit = '%';
        //             this.zhongwen = '总云量'
        //             break;
        //         case 'tigan':
        //              this.unit = '℃';
        //             this.zhongwen = '体感温度'
        //             break;
        //         default:
        //             break;
        //     }
        //         let res = this.dealWeatherDataToEchartData(this.showData);
        //         this.renderChart(res);
        //     }
        // },
        weather_type_select(){
            this.rangeValue = [];
        }
    },
    computed:{
        ...mapState({
            showData: state => state.showMarkers,
        }),
        valueRangesByWeatherType(){
            switch (this.weather_type_select) {
                 case 'TEM_Max':
                case 'TEM_Min':
                case 'TEM':
                case 'tigan':
                    return[{label:'40+',value:'40+'},
                        {label:'40~35',value:'40~35'},
                        {label:'35~30',value:'35~30'},
                        {label:'30~25',value:'30~25'},
                        {label:'25~20',value:'25~20'},
                        {label:'20~15',value:'20~15'},
                        {label:'15~10',value:'15~10'},
                        {label:'10~5',value:'10~5'},
                        {label:'5~0',value:'5~0'},
                        {label:'0~-5',value:'0~-5'},
                        {label:'-5~-10',value:'-5~-10'},
                        {label:'-10~-15',value:'-10~-15'},
                        {label:'-15~-20',value:'-15~-20'},
                        {label:'-20~-25',value:'-20~-25'},
                        {label:'-25~-30',value:'-25~-30'},
                        {label:'-30~-35',value:'-30~-35'},
                        {label:'-35+',value:'-35+'},
                        {label:'999999',value:'999999'}]
                    break;
                case 'RHU':
                    return[{label:'100',value:'100'},
                        {label:'100~90',value:'100~90'},
                        {label:'90~80',value:'90~80'},
                        {label:'80~70',value:'80~70'},
                        {label:'70~60',value:'70~60'},
                        {label:'60~50',value:'60~50'},
                        {label:'50~40',value:'50~40'},
                        {label:'40~30',value:'40~30'},
                        {label:'30~20',value:'30~20'},
                        {label:'20~10',value:'20~10'},
                        {label:'10~0',value:'10~0'},
                        {label:'999999',value:'999999'}]
                        break;
                case 'PRE_1h':
                    return [{label:'50',value:'50'},
                            {label:'50~20',value:'50~20'},
                            {label:'20~10',value:'20~10'},
                            {label:'10~8',value:'10~8'},
                            {label:'8~6',value:'8~6'},
                            {label:'6~4',value:'6~4'},
                            {label:'4~2',value:'4~2'},
                            {label:'2~1',value:'2~1'},
                            {label:'1~0.01',value:'1~0.01'},
                            {label:'0',value:'0'},
                            {label:'999999',value:'999999'}]
                            break;
                case 'PRS':
                 case 'PRS_Sea':
                case 'PRS_Max':
                case 'PRS_Min':
                     return[{label:'1030',value:'1030'},
                        {label:'1030~1020',value:'1030~1020'},
                        {label:'1020~1010',value:'1020~1010'},
                        {label:'1010~1000',value:'1010~1000'},
                        {label:'1000~990',value:'1000~990'},
                        {label:'990~980',value:'990~980'},
                        {label:'980~970',value:'980~970'},
                        {label:'970~920',value:'970~920'},
                        {label:'920~870',value:'920~870'},
                        {label:'870~820',value:'870~820'},
                        {label:'820~770',value:'820~770'},
                        {label:'770~720',value:'770~720'},
                        {label:'720~670',value:'720~670'},
                        {label:'670~620',value:'670~620'},
                        {label:'620~570',value:'620~570'},
                        {label:'520',value:'520'},
                        {label:'999999',value:'999999'}]
                    break;
                case 'windpower':
                     return[{label:'7',value:'7'},
                        {label:'7~6',value:'7~6'},
                        {label:'6~5',value:'6~5'},
                        {label:'5~4',value:'5~4'},
                        {label:'4~3',value:'4~3'},
                        {label:'3~2',value:'3~2'},
                        {label:'2~1',value:'2~1'},
                        {label:'0',value:'0'},
                        {label:'999999',value:'999999'}]
                    break;
                case 'VIS':
                    return[{label:'30',value:'30'},
                        {label:'30~20',value:'30~20'},
                        {label:'20~10',value:'20~10'},
                        {label:'10~5',value:'10~5'},
                        {label:'5~3',value:'5~3'},
                        {label:'3~2',value:'3~2'},
                        {label:'2~1',value:'2~1'},
                        {label:'1~0.5',value:'1~0.5'},
                        {label:'0.5~0.2',value:'0.5~0.2'},
                        {label:'0',value:'0'},
                        {label:'999999',value:'999999'}]
                    break;
                case 'CLO_Cov':
                        return [{label:'100',value:'100'},
                        {label:'90',value:'90'},
                        {label:'90~80',value:'90~80'},
                        {label:'80~70',value:'80~70'},
                        {label:'70~60',value:'70~60'},
                        {label:'60~30',value:'60~30'},
                        {label:'30~20',value:'30~20'},
                        {label:'20~10',value:'20~10'},
                        {label:'10~0',value:'10~0'},
                        {label:'999999',value:'999999'}]
                    break;
                default:
                    break;
            }
        }
    }
}
</script>

<style lang="less" scoped>
.any-chart-app{
    height: 100%;
    width: 100%;
    position: relative;
    display: flex;
    flex-direction: column;
    overflow: hidden;
   
    .function-bar{
        width:100%;
        display: flex;
        flex-wrap: wrap;
        position: absolute;
        z-index: 1000;
        justify-content: space-around;
        transform: translateX(97%);
        transition: transform 0.5s;
        background-color: rgba(255, 255, 255,.8);
        padding: 10px;
        border-radius: 3px;

        box-shadow: 0px 0px 15px rgba(0,0,0,0.3);
        &:hover{
            transform: translateX(0);
        }
        &.show{
            transform: translateX(0);
        }
        .function-item{
            flex-shrink: 1;
            // flex-grow: 1;
        }
    }
    .any-chart{
        flex-grow: 1;
        // padding: 4% 0;
        // height: 100%;
        width: 100%;
    }
}
</style>