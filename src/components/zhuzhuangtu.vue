<template>
 <div id="zzt">
     <el-select v-model="zzt_select" @change="loadData_updatePage" label="温度" placeholder="请选择">
      <el-option
        v-for="item in zzt_options"
        :key="item.value"
        :label="item.label"
        :value="item.value">
      </el-option>
    </el-select>
     <div id="chart">

     </div>
     <div class="analyze">
         <p>平均值：{{avg+curr_unit}}</p>
         <p>最大值：{{max+curr_unit}}</p>
         <p>最小值：{{min+curr_unit}}</p>
         <p>极差值：{{movingRange+curr_unit}}</p>
         <p>中位值：{{mid+curr_unit}}</p>
         <p>众数值：{{mult+curr_unit}}</p>
     </div>
 </div>
</template>

<script>
// import * as echarts from 'echarts'
export default {
 mounted(){
     this.loadData_updatePage();
 },
 data(){
     return{
         data:[],
         max:0,
         min:0,
         avg:0,
         mid:0,
         mult:0,
        //  type:'温度',
         zzt_select:'TEM',
         curr_unit:'℃',
         unit:{
            'TEM':'℃',
            'TEM_Max':'℃',
            'TEM_Min':'℃',
            'RHU':'%',
            'VAP':' BPa',
            'PRS':' BPa',
            'PRS_Sea':' BPa',
            'PRS_Max':' BPa',
            'PRS_Min':' BPa',
            'PRE_1h':'mm',
            'tigan':'℃',
            'windpower':'级',
            'VIS':'米',
            'CLO_Cov':'%',
            'WEP_Now':''
         },
         zzt_options: [
            {label:'温度',value:'TEM'},
            {label:'最高温度',value:'TEM_Max'},
            {label:'最低温度',value:'TEM_Min'},
            {label:'相对湿度',value:'RHU'},
            {label:'水汽压',value:'VAP'},
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
         ]
     }
 },
 methods:{
     loadData_updatePage(){
        
        let params ={
            type:this.zzt_select
        }
        this.$axios.get('/querybytype',{params}).then(res =>{
            let unit = this.curr_unit = this.unit[this.zzt_select];
            let {data} = res;
            //  console.log(data);
            this.data = data;
            this.min = data[0][params.type];
            this.max = data[data.length-2][params.type];
            this.mid = data[parseInt(data.length/2)][params.type];
        //处理掉异常值
            data.splice(-1,1);
            //计算平均数和众数
            this.avg_mult_Handler(data,params.type);
            //将data处理成ECharts能渲染的
            data = this.dataHandleTochartData(data);
            // this.mult = maxCounts;
            //  console.log(echarts);
            this.initEcharts(data);

        })
     },
     initEcharts(data){
         var myChart = echarts.init(document.getElementById('chart'));

        // 指定图表的配置项和数据
         var option = {
             title:{
                 text:'数量分布'
             },
            tooltip: {
                trigger: 'axis',
                axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                    type: 'cross',        // 默认为直线，可选为：'line' | 'shadow'
                    snap: true
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            dataZoom: [{
                type: 'inside'
            }, {
                type: 'slider'
            }],
            xAxis: [
                {
                    type: 'category',
                    // data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    axisTick: {
                        alignWithLabel: true
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
         // 使用刚指定的配置项和数据显示图表。
         myChart.setOption(option);
     },
     dataHandleTochartData(data){
        return data.map(element => {
            let itemData = [];
            let flag = true;
            for (const key in element) {
                if (Object.hasOwnProperty.call(element, key)) {
                    flag ? itemData.push(element[key] + this.curr_unit) :
                           itemData.push(element[key]);
                    flag = !flag;
                }
            }
            return itemData;
        });
     },
     avg_mult_Handler(data,key){
         let avg = 0,
             maxCounts = 0,
             value = 0,
             mult = 0;
             
         data.forEach(element => {
             value = element[key];
             if(maxCounts < element.Counts){
                maxCounts = element.Counts;
                mult = value;
             }
            //  console.log(value,'*',element.Counts);
             avg += parseFloat(value)*element.Counts;
         });
         this.avg = (avg/804156).toFixed(4);
         this.mult = mult ;
     }
 },
 computed:{
     movingRange(){
         return this.max - this.min;
     }
 }
}
</script>

<style lang="less" scoped>
#zzt{
    height: 100%;
    width: 100%;
    #chart{
        padding: 10px;
        height: 100%;
        width: 100%;
    }
    .analyze{
        position: absolute;
        right: 5px;
        top: 8px;
        background-color: rgba(245, 245, 245, 0.822);
        border-radius: 6px;
        padding: 5px;
        box-shadow: 0px 5px 15px rgba(0,0,0,0.3);
    }
}

</style>