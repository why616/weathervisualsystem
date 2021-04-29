<template>
 <div class="filter-app">
     <div class="filter">
         <div class="title">
             <span>{{title}}过滤器</span>
         </div>
         <div class="content">
             <div class="filter-item" v-for="i in items" :key="i.key" @click="clickToCancelFilter(i.chartOrigin,i.range,i.type)">
                 <span>{{i.type}} </span><span>{{i.range}} </span><span>选择</span>
             </div>
         </div>
     </div>
 </div>
</template>

<script>
export default {
 props:['filterList'],
 mounted(){
    //  console.log(this.filterList);
    let newList = this.filterList
     console.log(newList,newList.chartOrigin);
        this.title = newList.chartOrigin;
        this.items = newList.filters;
 },
 data(){
     return{
         title:'',
         items:[],
         
     }
 },
 methods:{
     clickToCancelFilter(chartOrigin,cancelRange,weatherType){
         console.log(chartOrigin,cancelRange);
        this.$emit('filterControllerCancel',{chartOrigin,cancelRange,weatherType});
     }
 },
 watch:{
     filterList(newList){
         console.log(newList,newList.chartOrigin);
        this.title = newList.chartOrigin;
        this.items = newList.filters;
        
     }
 }
}
</script>

<style lang="less" scoped>
.filter-app{
    transform: translateX(100%);
    transition: transform 0.5s;
    &:hover{

        transform: translateX(0);
    }
    .filter{
        background-color: rgba(255, 255, 255, 1);
        border-radius: 6px;
        padding: 10px 5px;
        box-shadow: 0px 5px 15px rgba(0,0,0,0.3);
        line-height: 18px;
        font-size: 15px;
        line-height: 1.5em;
        .title{
            border-bottom: 2px solid rgba(100,100,100,0.8);
            margin-bottom: 3px;
            span{
                padding: 0 5px;
                font-size: 16px;
                font-weight: 600;
            }
        }
        .content{
            
            .filter-item{
                padding: 0 5px;
                border-radius: 5px;
                &:hover{ 
                    background-color: rgba(100,100,100,0.1);
                    cursor: pointer;
                }

            }
        }
    }
}
</style>