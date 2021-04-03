<template>
  <div id="app">
    <Map/>
    
    
    <div class="zzt">
      <Zzt/>
    </div>

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
  height: 100%;
  .zzt{
    position: absolute;
    width:90%;
    height: 500px;
  }
}
</style>