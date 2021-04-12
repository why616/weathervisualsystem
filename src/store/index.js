import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  // strict:true,
  state: {
    showData:[]
  },
  mutations: {
    updateShowData(state, newShowData){
      console.log("触发更新");
        state.showData = newShowData;
    },
  },
  actions: {
  },
  modules: {
  }
})
