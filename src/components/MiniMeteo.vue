<template>
  <div>
    <p>{{ weather.name }} ({{ weather.sys.country }})</p>
    <div class="weather-local">
      <img
        :src="
          `http://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`
        "
        :alt="weather.weather[0].icon"
      />
      <span class="weather-local-current">
        {{ weather.main.temp.toFixed(1) }}°C</span
      >
      <div class="weather-local-min-max">
        <span>{{ weather.main.temp_min.toFixed(1) }}°C</span>
        <span>{{ weather.main.temp_max.toFixed(1) }}°C</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "MiniMeteo",
  props: {
    weather: {
      type: Object,
      required: true
    }
  }
};
</script>

<style scoped>
p {
  padding: 0 0 0 8px;
  margin: 0;
  font-weight: bold;
  text-align: left;
}
img {
  width: 52px;
}
.tooltip {
  text-align: left;
}
.weather-local {
  display: flex;
  align-items: center;
}
.weather-local-current {
  font-size: large;
  font-weight: bold;
}
.weather-local-min-max {
  display: flex;
  flex-direction: column;
  margin: 0 5px;
}
.weather-local-min-max > span:first-child {
  color: #5fb7c4;
}
.weather-local-min-max > span:last-child {
  color: #cf523b;
}
</style>
