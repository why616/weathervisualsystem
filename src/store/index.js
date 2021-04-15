import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  // strict:true,
  state: {
    showData:[],
    weatherType:'TEM'
  },
  mutations: {
    updateShowData(state, newShowData){
      console.log("触发更新ShowData");
        state.showData = newShowData;
    },
    updateWeatherType(state, newWeatherType){
      console.log("触发更新WeatherType");
        state.weatherType = newWeatherType;
    }
  },
  actions: {
  },
  modules: {
  }
})
