<template>
  <div id="app">
    <div class="center-map">
      <Map/>
    </div>
    <div class="left-chart">
      <div class="chart-item">
        <Zzt/>
      </div>
      <div class="chart-item">
        <Zzt/>
      </div>
      <div class="chart-item">
        <Zzt/>
      </div>
      
    </div>
    
    <div class="right-chart">
      <div class="chart-item">
        <Zzt/>
      </div>
      <div class="chart-item">
        <Zzt/>
      </div>
      <div class="chart-item">
        <Zzt/>
      </div>
    </div>
    <!-- <div class="zzt">
      <Zzt/>
    </div> -->

  </div>
</template>


<script>
import Map from './views/Map.vue';
import Zzt from './components/zhuzhuangtu.vue'

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
      Zzt
  }
}
</script>

<style lang="less" scoped>
#app {
  display: flex;
  height: 100%;

  .left-chart{
    order: 0;
    width:24%;
    .chart-item{
      width: 100%;
      height: 33.3%;
    }
  }
  .center-map{
    order: 1;
    width: 50%;
  }
  .right-chart{
    order: 2;
    width:26%;
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