<template>
 <div class="bar-chart-app">
     
    <div class="bar-chart" ref="chart">

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
    // props:['showData'],
    mounted(){
        this.initChart();

    },
    data(){
        return {
            echart:undefined,
            selectRange:''
            // k:0
        }
    },
    methods:{
        initChart(){
            // console.log(this.$refs.chart);
            if(!this.$refs.chart) return;
            this.echart = echarts.init(this.$refs.chart);
            this.echart.on('click',(e)=>{
                if(this.selectRange == e.name){
                    this.$bus.$emit('bar-chart-cancel-select');
                    this.selectRange = '';
                }else{
                    this.selectRange = e.name;
                    this.$bus.$emit('bar-chart-select',e.name);
                }
            })
            
        },
        renderChart(data){
            let TEMoptions = {
                title:{
                    text:'地图点-温度-数量分布'
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                        type: 'shadow',        // 默认为直线，可选为：'line' | 'shadow'
                        snap: true
                    }
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
                        data:[  '40+',
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
                        axisTick: {
                            alignWithLabel: true,
                            interval:0
                        },
                        axisLabel:{
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
                        
                        // showBackground: true,
                        data
                    }
                ]
            };
            this.echart.setOption(TEMoptions);
        },
        dealTEMDataToEchartData(weatherData){
            // if(weatherData.map) return [];
            // console.log(weatherData);
            let chartData = [];
            let rangeMap = {
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
            }
             weatherData.forEach((d)=>{
            //    console.log(d.Date.split(' '));
                rangeMap[this.getRange(d.TEM)]++;
               
            });
            for (const range in rangeMap) {
                if (rangeMap.hasOwnProperty.call(rangeMap, range)) {
                   chartData.push({
                       value:[range,rangeMap[range]],
                        itemStyle:{
                            color:this.getColor(parseInt(range)),
                        }
                   
                   });
                }
            }
            return chartData
             
        },
        getRange(tem){
            return tem == 999999 ? '999999' :
                    tem > 40 ? '40+' :
                    tem > 35 ? '40~35' :
                    tem > 30 ? '35~30' :
                    tem > 25 ? '30~25' :
                    tem > 20 ? '25~20' :
                    tem > 15 ? '20~15' :
                    tem > 10 ? '15~10' :
                    tem > 5 ? '10~5' :
                    tem > 0 ? '5~0' :
                    tem > -5 ? '0~-5' :
                    tem > -10 ? '-5~-10' :
                    tem > -15 ? '-10~-15' :
                    tem > -20 ? '-15~-20' :
                    tem > -25 ? '-20~-25' :
                    tem > -30 ? '-25~-30' :
                    tem > -35 ? '-30~-35' :
                    tem > -40 ? '-35+' : '-35+'
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
    },
    watch:{
        showData(newShowData){
            console.log("监听到更新");
            if(this.echart){
                let res = this.dealTEMDataToEchartData(newShowData);
                // console.log(res);
                this.renderChart(res);
            }
        }
    },
    computed:{
        ...mapState({
            showData: state => state.showData
        })
    }
}
</script>

<style lang="less" scoped>
.bar-chart-app{
    height: 100%;
    width: 100%;
    position: relative;
    .bar-chart{
        padding: 2% 0;
        height: 98%;
        width: 100%;
    }
}
</style>