import { createStore } from "vuex";
import {Responses} from "@/models/CurrentWeather";

export default createStore({
  state: {
    currentWeather: null as any as Responses.CurrentWeather
  },
  getters: {
    city: state => {
      return state.currentWeather.name;
    }
  },
  mutations: {
    setCurrentWeather(state, weather: Responses.CurrentWeather) {
      state.currentWeather = weather;
    }
  },
  actions: {
    setCurrentWeather(context, weather: Responses.CurrentWeather) {
      context.commit('weather', weather);
    }
  }
});
