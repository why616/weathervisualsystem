<template>
 <div class="any-chart-app">
     <div class="function-bar">
         <div class="function-item">

         </div>
         <div class="function-item">

         </div>
         <div class="function-item">
             
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
export default {
 methods:{
     initChart(){
            // console.log(this.$refs.chart);
            if(!this.$refs.chart) return;
            this.echart = echarts.init(this.$refs.chart);
            this.echart.on('click',(e)=>{
                if(this.selectRange[e.name]){
                    this.$bus.$emit('bar-chart-cancel-select',{chartOrigin:'left_1_multFilter',cancelRange:e.name});
                    this.selectRange[e.name] = undefined;
                }else{
                    this.selectRange[e.name] = true;
                    this.$bus.$emit('bar-chart-select',{range:e.name,chartOrigin:'left_1_multFilter'});   
                }
            })
            
        },
 }
}
</script>

<style lang="less" scoped>
.any-chart-app{
    height: 100%;
    width: 100%;
    position: relative;
    .function-bar{
        width:100%;
        display: flex;
        .function-item{
            flex-shrink: 1;
            flex-grow: 1;

        }
    }
    .any-chart{
        // padding: 4% 0;
        // height: 100%;
        width: 100%;
    }
}
</style>