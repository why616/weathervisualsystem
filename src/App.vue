<template>
  <div id="app">
    <div class="center-map">
      <Map/>
      <div class="line-chart-area">
        <pile-bar-chart/>
      </div>
    </div>
    <div class="left-chart">
      <div class="chart-item">
        <bar-chart />
      </div>
      <div class="chart-item">
        <pie-chart/>
      </div>
      <div class="chart-item">
        <any-chart chartOrigin="left_2_multFilter"/>
      </div>
      
    </div>
    
    <div class="right-chart">
      <div class="chart-item">
       <any-chart chartOrigin="right_1_multFilter"/>
      </div>
      <div class="chart-item">
        <any-chart chartOrigin="right_2_multFilter"/>
      </div>
      <div class="chart-item">
        <line-chart chartOrigin="right_3_multFilter"/>
      </div>
    </div>  
    <!-- <div class="zzt">
      <Zzt/>
    </div>-->

  </div>
</template>


<script>
import Map from './views/Map.vue';
import Zzt from './components/zhuzhuangtu.vue'
import BarChart from "@/components/charts/BarChart.vue"
import PieChart from "@/components/charts/PieChart.vue"
import AnyChart from './components/charts/AnyChart.vue';
import PileBarChart from './components/charts/PileBarChart.vue';
import LineChart from './components/charts/LineChart.vue';
// import PieChart from './components/charts/PieChart.vue';
// import BarChart from './components/charts/BarChart.vue';

export default {
  data(){
    return {
      zzt_select:'',
      zzt_options: [
        {label:'温度',value:'TEM'},
        {label:'湿度',value:'wet'}
      ]
    }
    
  },
  components: {
      Map,
      Zzt,
      BarChart,
      PieChart,
      AnyChart,
      PileBarChart,
    LineChart,
    // PieChart
    // BarChart
  }
}
</script>

<style lang="less" scoped>
#app {
  display: flex;
  height: 100%;

  .left-chart{
    order: 0;
    width:25%;
    
    .chart-item{
      width: 100%;
      height: 33.3%;
    }
  }
  .center-map{
    order: 1;
    flex-grow: 1;
    .line-chart-area{
      height: 33.3%;
    }
    // width: 50%;
  }
  .right-chart{
    order: 2;
    width:25%;
    overflow: hidden;
    .chart-item{
      width: 100%;
      height: 33.3%;
    }
  }
  .zzt{
    position: absolute;
    width:90%;
    height: 500px;
  }
}
</style>