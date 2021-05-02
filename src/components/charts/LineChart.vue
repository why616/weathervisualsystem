<template>
 <div class="line-chart-app" v-loading="loading">
     <div class="function-bar" :class="{'show':show_options_bar}" @click="show_options_bar = true">
        <div class="function-item" style="margin-right:2%">
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
             <el-select v-model="realSelectedStations"
              multiple
              collapse-tags
              placeholder="目前已选择的气象站点">
                <el-option
                    v-for="item in selectedStations"
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
         <div class="function-item" style="flex-basis:217px;">
            <el-button :type="btn_type" style="width:100%" @click="submit">{{btn_content}}</el-button>
         </div>
        <div class="function-item">
            <div style="padding: 0 15px;">
                <el-switch
                    v-model="allowAddStation"
                    active-text="添加站点"
                    inactive-text="">
                </el-switch>
            </div>
        </div>
     </div>
     <div class="line-chart">

     </div>
 </div>
</template>

<script>
export default {
    data(){
        return {
            loading:false,
            weather_type_select:'',
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
            selectedStations:[],
            realSelectedStations:[],
            rangeTime:[],
            pickerOption:{
                disabledDate(time) {
                    let start = new Date(2021,2,10,0,0,0);
                    let end = new Date(2021,3,23,12,0,0);
                    // console.log(+start);
                    return time.getTime() < start || time.getTime() > end ;
                },
            },
            defaultValue:new Date(2021,2,10,0,0,0),
            allowAddStation:false,
            show_options_bar:true,
            btn_type:'primary',
            btn_content:'提交查询(oﾟvﾟ)ノ'
        }
    },
    watch:{
        allowAddStation(){
            if(this.allowAddStation){
                this.$bus.$on('addNewStation',this.addNewStation);
            }else{
                this.$bus.$off('addNewStation',this.addNewStation);
            }
        }
    },
    methods:{
        addNewStation({stationId,province,stationName}){
            console.log("receive data",stationId,province,stationName);
            let selectStationOption = {label:`${province}省${stationName}站`,value:stationId}
            this.selectedStations.push(selectStationOption);
            this.realSelectedStations.push(selectStationOption.value);
            

        },
        submit(){
            setTimeout(()=>{
                 console.log("666");
                this.show_options_bar = false;
            })
           
        }
    }
}
</script>

<style lang="less" scoped>
.line-chart-app{
    height: 100%;
    width: 100%;
    position: relative;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    
    .function-bar{
        width:94%;
        display: flex;
        flex-wrap: wrap;
        position: absolute;
        z-index: 1000;
        justify-content: center;
        transform: translateX(98%);
        transition: left 0.5s, transform 0.5s;
        background-color: rgba(255, 255, 255,.8);
        padding: 10px;
        margin-left: calc(3% - 10px);
        border-radius: 3px;
        top:1px;
        box-shadow: 4px 5px 12px rgb(0 0 0 / 20%);
        &:hover{
        //    left: 50%;
            transform: translateX(0%);
        }
        &.show{
            // left: 50%;
            transform: translateX(0%);
        }
        .function-item{
            flex-shrink: 1;
            // flex-grow: 1;
        }
    }
    .line-chart{
        flex-grow: 1;
        // padding: 4% 0;
        // height: 100%;
        width: 100%;
    }
}
</style>