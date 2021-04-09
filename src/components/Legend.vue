<template>
  <div class="legend-area">
    <div class="legend">
        <div v-for="i in rangeColor" :key="i.range">
            <i :style="{background:i.color}"></i><span>{{i.range}}</span>
        </div>
    </div>
  </div>
</template>

<script>
export default {
    props:['range_color'],
    data(){
        return{
            rangeColor: this.range_color
        }
    }
};
</script>

<style lang="less" scoped>
.legend-area { 
    .legend{
        background-color: rgba(255, 255, 255, 1);
        border-radius: 6px;
        padding: 10px;
        box-shadow: 0px 5px 15px rgba(0,0,0,0.3);
        line-height: 18px;
        font-size: 15px;
        div{
            height: 18px;
        }
        span{
            vertical-align: top;
        }
        i{
            width: 18px;
            height: 18px;
            // float: left;
            display: inline-block;

            margin-right: 5px;
        }
    }
}
</style>