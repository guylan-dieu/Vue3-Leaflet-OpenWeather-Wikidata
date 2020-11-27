import axios from "axios";

const AXIOS = axios.create({
  baseURL: "https://api.openweathermap.org/data/2.5"
});

const config = {
  units: "metric",
  lang: "fr",
  appid: "4115aefb68b0efd07a9e4cf8db1bd358"
};

function currentWeather(lat, lon) {
  return AXIOS({
    method: "get",
    url: "/weather",
    params: {
      lat: lat,
      lon: lon,
      ...config
    }
  });
}

function forecastWeather(lat, lon) {
  return AXIOS({
    method: "get",
    url: "/onecall",
    params: {
      lat: lat,
      lon: lon,
      ...config
    }
  });
}

export { currentWeather, forecastWeather };
