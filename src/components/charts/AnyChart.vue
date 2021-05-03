<template>
 <div class="any-chart-app" v-loading="loading">
     <div class="function-bar">
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
         <div class="function-item">
             <div>
                 <el-switch
                    v-model="followShowData"
                    active-text="跟随地图点"
                    inactive-text="保持不变">
                </el-switch>
             </div>
             <div>
                  <el-switch
                    v-model="pie_or_bar"
                    active-text="饼图"
                    inactive-text="直柱状图">
                </el-switch>
             </div>
             
           
         </div>
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
    props:['chartOrigin'],
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
            unit:'',
            zhongwen:'',
            pie_or_bar:true,
            followShowData:true,
            counts : 0,
             weather_type_options: [
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
             ]
        }
    },
    methods:{
        initChart(){
                // console.log(this.$refs.chart);
            if(!this.$refs.chart) return;
            this.echart = echarts.init(this.$refs.chart);
            this.echart.on('click',(e)=>{
                if(this.selectRange[e.name]){
                    this.$bus.$emit('bar-chart-cancel-select',{chartOrigin:this.chartOrigin,cancelRange:e.name,weatherType:this.weather_type_select});
                    this.selectRange[e.name] = undefined;
                }else{
                    this.selectRange[e.name] = true;
                    this.$bus.$emit('bar-chart-select',{range:e.name,chartOrigin:this.chartOrigin,weatherType:this.weather_type_select});   
                }
            })
                
        },
        renderChart(data,pie_or_bar){
            let xAxisData = {
                'TEM':[  
                    '40+',
                    '40~35',
                    '35~30',
                    '30~25',
                    '25~20',
                    '20~15',
                    '15~10',
                    '10~5',
                    '5~0',
                    '0~-5',
                    '-5~-10',
                    '-10~-15',
                    '-15~-20',
                    '-20~-25',
                    '-25~-30',
                    '-30~-35',
                    '-35+',
                    '999999'
                ],
                'tigan':[  
                    '40+',
                    '40~35',
                    '35~30',
                    '30~25',
                    '25~20',
                    '20~15',
                    '15~10',
                    '10~5',
                    '5~0',
                    '0~-5',
                    '-5~-10',
                    '-10~-15',
                    '-15~-20',
                    '-20~-25',
                    '-25~-30',
                    '-30~-35',
                    '-35+',
                    '999999'
                ],
                'RHU':[
                    '100',
                    '100~90',
                    '90~80',
                    '80~70',
                    '70~60',
                    '60~50',
                    '50~40',
                    '40~30',
                    '30~20',
                    '20~10',
                    '10~0',
                    '999999'
                ],
                'PRE_1h':[
                    '50',
                    '50~20',
                    '20~10',
                    '10~8',
                    '8~6',
                    '6~4',
                    '4~2',
                    '2~1',
                    '1~0.01',
                    '0',
                    '999999',
                ],
                'PRS':[
                    '1030',
                    '1030~1020',
                    '1020~1010',
                    '1010~1000',
                    '1000~990',
                    '990~980',
                    '980~970',
                    '970~920',
                    '920~870',
                    '870~820',
                    '820~770',
                    '770~720',
                    '720~670',
                    '670~620',
                    '620~570',
                    '520',
                    '999999',
                ],
                'windpower':[
                    '7',
                    '7~6',
                    '6~5',
                    '5~4',
                    '4~3',
                    '3~2',
                    '2~1',
                    '0',
                    '999999',
                ],
                'VIS':[
                    '30',
                    '30~20',
                    '20~10',
                    '10~5',
                    '5~3',
                    '3~2',
                    '2~1',
                    '1~0.5',
                    '0.5~0.2',
                    '0',
                    '999999',
                ],
                'CLO_Cov':[
                    '100',
                    '90',
                    '90~80',
                    '80~70',
                    '70~60',
                    '60~30',
                    '30~20',
                    '20~10',
                    '10~0',
                    '999999',
                ]
            }
            xAxisData['TEM_Max'] = xAxisData['TEM_Min'] = xAxisData['TEM'];
            xAxisData['PRS_Max'] = xAxisData['PRS_Min'] = xAxisData["PRS_Sea"] = xAxisData['PRS'];
            let option = pie_or_bar ? 
            {
                title:{
                    text:`任意图-${this.zhongwen}-比例分布`
                },
                
                tooltip: {
                    trigger: 'item',
                    
                },
                legend: {
                    type:'scroll',
                    top: '10%',
                    left:'3%',
                    height:'80%',
                    orient:'vertical',
                    
                },
                series: [
                    {
                        // name:'百分比',
                        type: 'pie',
                        clockwise:false,

                        // selectMode:true,
                        radius: ['40%', '70%'],
                        center:['60%','50%'],
                        avoidLabelOverlap: false,
                        label: {
                            show: false,
                            position: 'center',
                            formatter:`{b}${this.unit}: {d}%`
                        },
                        
                        // labelLine:{
                        //     show:true,
                        //     showAbove:true
                        // },
                        emphasis: {
                            label: {
                                show: true,
                                fontSize: '16',
                                fontWeight: 'bold'
                            },
                             itemStyle: {
                                shadowBlur: 5,
                                shadowOffsetX: 0,
                                shadowColor: 'rgba(0, 0, 0, 0.5)'
                            }
                        },
                        labelLine: {
                            show: false
                        },
                        data
                    }
                    
                ]
            }
            : 
            {
                title:{
                    text:`任意图-${this.zhongwen}-数量分布`
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                        type: 'shadow',        // 默认为直线，可选为：'line' | 'shadow'
                        snap: true
                    },
                    
                },
                grid: {
                    // top:'1%',
                    left: '2%',
                    right: '3%',
                    bottom: '3%',
                    containLabel: true
                },
                dataZoom: [{
                    type: 'inside'
                }],
                xAxis: [
                    {
                        type: 'category',
                        // data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                        data:xAxisData[this.weather_type_select],
                        axisTick: {
                            alignWithLabel: true,
                            interval:0
                        },
                        axisLabel:{
                            showMinLabel:true,
                            interval: 0,
                            rotate:45
                        }
                    }
                ],
                yAxis: [
                    {
                        type: 'value'
                    }
                ],
                
                series: [
                    {
                        name: '数量',
                        type: 'bar',
                        barWidth: '60%',
                        // label:{
                        //     formatter:`{b}${this.unit}: {c}`
                        // },
                        // showBackground: true,
                        data
                    }
                ]
            }
            console.log(option,data);
            this.echart.setOption(option);
        },
        dealWeatherDataToEchartData(weatherData,pie_or_bar){
             let chartData = [];
             let xAxisData = {
                'TEM':[  
                    '40+',
                    '40~35',
                    '35~30',
                    '30~25',
                    '25~20',
                    '20~15',
                    '15~10',
                    '10~5',
                    '5~0',
                    '0~-5',
                    '-5~-10',
                    '-10~-15',
                    '-15~-20',
                    '-20~-25',
                    '-25~-30',
                    '-30~-35',
                    '-35+',
                    '999999'
                ],
                'tigan':[  
                    '40+',
                    '40~35',
                    '35~30',
                    '30~25',
                    '25~20',
                    '20~15',
                    '15~10',
                    '10~5',
                    '5~0',
                    '0~-5',
                    '-5~-10',
                    '-10~-15',
                    '-15~-20',
                    '-20~-25',
                    '-25~-30',
                    '-30~-35',
                    '-35+',
                    '999999'
                ],
                'RHU':[
                    '100',
                    '100~90',
                    '90~80',
                    '80~70',
                    '70~60',
                    '60~50',
                    '50~40',
                    '40~30',
                    '30~20',
                    '20~10',
                    '10~0',
                    '999999'
                ],
                'PRE_1h':[
                    '50',
                    '50~20',
                    '20~10',
                    '10~8',
                    '8~6',
                    '6~4',
                    '4~2',
                    '2~1',
                    '1~0.01',
                    '0',
                    '999999',
                ],
                'PRS':[
                    '1030',
                    '1030~1020',
                    '1020~1010',
                    '1010~1000',
                    '1000~990',
                    '990~980',
                    '980~970',
                    '970~920',
                    '920~870',
                    '870~820',
                    '820~770',
                    '770~720',
                    '720~670',
                    '670~620',
                    '620~570',
                    '520',
                    '999999',
                ],
                'windpower':[
                    '7',
                    '7~6',
                    '6~5',
                    '5~4',
                    '4~3',
                    '3~2',
                    '2~1',
                    '0',
                    '999999',
                ],
                'VIS':[
                    '30',
                    '30~20',
                    '20~10',
                    '10~5',
                    '5~3',
                    '3~2',
                    '2~1',
                    '1~0.5',
                    '0.5~0.2',
                    '0',
                    '999999',
                ],
                'CLO_Cov':[
                    '100',
                    '90',
                    '90~80',
                    '80~70',
                    '70~60',
                    '60~30',
                    '30~20',
                    '20~10',
                    '10~0',
                    '999999',
                ]
            }
            xAxisData['TEM_Max'] = xAxisData['TEM_Min'] = xAxisData['TEM'];
            xAxisData['PRS_Max'] = xAxisData['PRS_Min'] = xAxisData["PRS_Sea"] = xAxisData['PRS'];
            let rangeMap = {
                'TEM':{
                    '999999':0,
                    '40+':0 ,
                    '40~35':0 ,
                    '35~30':0 ,
                    '30~25':0 ,
                    '25~20':0 ,
                    '20~15':0 ,
                    '15~10':0 ,
                    '10~5':0 ,
                    '5~0':0 ,
                    '0~-5':0 ,
                    '-5~-10':0 ,
                    '-10~-15':0 ,
                    '-15~-20':0 ,
                    '-20~-25':0 ,
                    '-25~-30':0 ,
                    '-30~-35':0 ,
                    '-35+':0
                },
                'tigan':{
                    '999999':0,
                    '40+':0 ,
                    '40~35':0 ,
                    '35~30':0 ,
                    '30~25':0 ,
                    '25~20':0 ,
                    '20~15':0 ,
                    '15~10':0 ,
                    '10~5':0 ,
                    '5~0':0 ,
                    '0~-5':0 ,
                    '-5~-10':0 ,
                    '-10~-15':0 ,
                    '-15~-20':0 ,
                    '-20~-25':0 ,
                    '-25~-30':0 ,
                    '-30~-35':0 ,
                    '-35+':0
                },
                'RHU':{
                    '999999':0,
                    '100':0,
                    '100~90':0,
                    '90~80':0,
                    '80~70':0,
                    '70~60':0,
                    '60~50':0,
                    '50~40':0,
                    '40~30':0,
                    '30~20':0,
                    '20~10':0,
                    '10~0':0
                },
                'PRE_1h':{
                    '999999':0,
                    '50':0,
                    '50~20':0,
                    '20~10':0,
                    '10~8':0,
                    '8~6':0,
                    '6~4':0,
                    '4~2':0,
                    '2~1':0,
                    '1~0.01':0,
                    '0':0
                },
                'PRS':{
                    '999999':0,
                    '1030':0,
                    '1030~1020':0,
                    '1020~1010':0,
                    '1010~1000':0,
                    '1000~990':0,
                    '990~980':0,
                    '980~970':0,
                    '970~920':0,
                    '920~870':0,
                    '870~820':0,
                    '820~770':0,
                    '770~720':0,
                    '720~670':0,
                    '670~620':0,
                    '620~570':0,
                    '520':0
                },
                'windpower':{
                    '999999':0,
                    '7':0,
                    '7~6':0,
                    '6~5':0,
                    '5~4':0,
                    '4~3':0,
                    '3~2':0,
                    '2~1':0,
                    '0':0
                },
                'VIS':{
                    '999999':0,
                    '30':0,
                    '30~20':0,
                    '20~10':0,
                    '10~5':0,
                    '5~3':0,
                    '3~2':0,
                    '2~1':0,
                    '1~0.5':0,
                    '0.5~0.2':0,
                    '0':0
                },
                'CLO_Cov':{
                    '999999':0,
                    '100':0,
                    '90':0,
                    '90~80':0,
                    '80~70':0,
                    '70~60':0,
                    '60~30':0,
                    '30~20':0,
                    '20~10':0,
                    '10~0':0
                }
            }
            rangeMap['TEM_Max'] = rangeMap['TEM_Min'] = rangeMap['TEM'];
            rangeMap['PRS_Max'] = rangeMap['PRS_Min'] = rangeMap["PRS_Sea"] = rangeMap['PRS'];


                // console.log(rangeMap);

            rangeMap = rangeMap[this.weather_type_select];
            xAxisData = xAxisData[this.weather_type_select];
            let counts = 0;
             weatherData.forEach((d)=>{
            //    console.log(d.Date.split(' '));
                rangeMap[this.getRange(d[this.weather_type_select])]++;
                // totalCounts++;
                counts++;
            });
            this.counts = counts;
            if(pie_or_bar){
                xAxisData.forEach(range=>{
                    //  console.log(range);
                    let  value = range.split("~")[1];
                        value = value || range;
                    chartData.push({
                        name:range,
                        value:rangeMap[range],
                            itemStyle:{
                                color:this.getColor(parseFloat(value)),
                            }
                    });
                })
            }else{
                for (const range in rangeMap) {
                    if (rangeMap.hasOwnProperty.call(rangeMap, range)) {
                        let  value = range.split("~")[1];
                        value = value || range;
                    chartData.push({
                        value:[range,rangeMap[range]],
                            itemStyle:{
                                color:this.getColor(parseFloat(value))
                            }
                    
                    });
                    }
                }
            }
            
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
            return chartData
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
        
    },
    watch:{
        pie_or_bar(){
            this.echart.clear();
            let res = this.dealWeatherDataToEchartData(this.showData,this.pie_or_bar);
            this.renderChart(res,this.pie_or_bar);
        },
        showData(){
            if(this.weather_type_select)
            if(this.followShowData)
            if (this.echart) {
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
                let res = this.dealWeatherDataToEchartData(this.showData,this.pie_or_bar);
                this.renderChart(res,this.pie_or_bar);
            }
        },
        weather_type_select(){
            if (this.echart) {
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
                 let res = this.dealWeatherDataToEchartData(this.showData,this.pie_or_bar);
                this.renderChart(res,this.pie_or_bar);
            }
        }
    },
    computed:{
        ...mapState({
            showData: state => state.showMarkers,
        }),
        
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
    .function-bar{
        width:100%;
        display: flex;
        flex-wrap: wrap;
        // position: absolute;
        // z-index: 1000;
        justify-content: space-around;
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