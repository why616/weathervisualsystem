import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  // strict:true,
  state: {
    provinceData:[],
    weatherType:'TEM',
    showMarkers:[]
  },
  mutations: {
    updateProvinceData(state, newProvinceData){
      console.log("触发更新ShowData");
        state.provinceData = newProvinceData;
    },
    updateWeatherType(state, newWeatherType){
      console.log("触发更新WeatherType");
        state.weatherType = newWeatherType;
    },
    updateShowMarkers(state,newShowMarkers){
      state.showMarkers = newShowMarkers;
    }
  },
  actions: {
  },
  modules: {
  }
})
