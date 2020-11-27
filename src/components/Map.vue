<template>
  <div>
    <p>Click on the map to change the position.</p>
    <l-map
      :zoom="zoom"
      v-model:zoom="zoom"
      :center="center"
      :zoom-animation="true"
      :marker-zoom-animation="true"
      style="height: 400px"
      @click="changeMarker"
    >
      <l-tile-layer :url="url" :attribution="attribution" />
      <l-marker v-if="marker" :lat-lng="marker">
        <l-tooltip :permanent="true" v-if="currentWeatherData">
          <mini-meteo :weather="currentWeatherData"></mini-meteo>
        </l-tooltip>
      </l-marker>
    </l-map>
    <div v-if="loadingWikidata" class="city">Loading...</div>
    <div
      v-else-if="wikidata && wikidata.data && wikidata.data.entities"
      class="city"
    >
      <div v-for="(entity, id, index) in wikidata.data.entities" :key="id">
        <template v-if="entity.claims && entity.claims.P18">
          <p class="city-name" v-html="imageName"></p>
          <p class="city-description" v-html="imageDescription"></p>
          <img
            class="city-thumbnail"
            @click="openImage(entity.claims.P18[0].mainsnak.datavalue.value)"
            :src="getThumbnail(entity.claims.P18[0].mainsnak.datavalue.value)"
            @load="
              getImageAttribution(entity.claims.P18[0].mainsnak.datavalue.value)
            "
            alt="noImg"
          />
          <p class="image-attribution" v-html="imageAttribution"></p>
        </template>
        <div
          v-else-if="index === Object.values(wikidata.data.entities).length - 1"
        >
          No image for this city.
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { LMap, LTileLayer, LMarker, LTooltip } from "@vue-leaflet/vue-leaflet";

import { currentWeather, forecastWeather } from "@/services/openweather";
import wdk from "wikidata-sdk";
import axios from "axios";
import md5 from "md5";
import fetch from "node-fetch";
import { LeafletMouseEvent } from "leaflet";
import MiniMeteo from "@/components/MiniMeteo.vue";

export default {
  name: "Map",
  components: {
    MiniMeteo,
    LMap,
    LTileLayer,
    LMarker,
    LTooltip
  },
  async created() {
    const weather = await this.getCurrentWeatherData();
    this.currentWeatherData = weather;
    await this.getWikidata(weather);
  },
  data() {
    return {
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" as string,
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> | <a href="https://openweathermap.org/">OpenWeather</a>' as string,
      zoom: 6 as number,
      center: [48.69, 6.18] as number[],
      marker: [48.69, 6.18] as number[],
      loadingCurrentWeatherData: false as boolean,
      loadingForecastWeatherData: false as boolean,
      loadingWikidata: false as boolean,
      imageAttribution: "" as string,
      imageDescription: "" as string,
      imageName: "" as string,
      currentWeatherData: null as object,
      forecastWeatherData: null as object,
      wikidata: undefined
    };
  },
  methods: {
    async changeMarker(event: LeafletMouseEvent) {
      if (event.latlng) {
        console.log("event", event);
        this.marker = [event.latlng.lat, event.latlng.lng];
        this.center = [event.latlng.lat, event.latlng.lng];

        const weather = await this.getCurrentWeatherData();
        this.currentWeatherData = weather;
        await this.getWikidata(weather);
      }
    },
    openImage: function(filename) {
      window.open(this.getImage(filename), "_blank");
    },
    getThumbnail(filename) {
      filename = filename.replace(/ /gi, "_");
      return (
        "http://commons.wikimedia.org/wiki/Special:FilePath/" +
        filename +
        "?width=300px&height=300px"
      );
    },
    getImage(filename) {
      filename = filename.replace(/ /gi, "_");
      const hash = md5(filename);
      return (
        "https://upload.wikimedia.org/wikipedia/commons/" +
        hash[0] +
        "/" +
        hash[0] +
        "" +
        hash[1] +
        "/" +
        filename
      );
    },
    getImageAttribution(filename) {
      const url =
        "https://commons.wikimedia.org/w/api.php?action=query&titles=Image:" +
        filename +
        "&prop=imageinfo&iiprop=extmetadata|url&origin=*&format=json";

      this.imageAttribution = "";
      axios.get(url).then(res => {
        console.log(
          "getImageAttribution",
          Object.values(res.data.query.pages)[0]
        );

        const metadata = Object.values(res.data.query.pages)[0].imageinfo[0]
          .extmetadata;
        const artist = metadata.Artist ? metadata.Artist.value : "";
        const licenseUrl = metadata.LicenseUrl ? metadata.LicenseUrl.value : "";
        const licenseName = metadata.LicenseShortName
          ? metadata.LicenseShortName.value
          : "";
        const separator = artist && licenseName ? " / " : "";

        this.imageAttribution =
          artist +
          separator +
          "<a href='" +
          licenseUrl +
          "' target='_blank'>" +
          licenseName +
          "</a>";

        this.imageName = metadata.ObjectName ? metadata.ObjectName.value : "";
        this.imageDescription = metadata.ImageDescription
          ? metadata.ImageDescription.value
          : "";
      });
    },
    getWikidata(weather) {
      this.loadingWikidata = true;
      const country = weather.sys.country
        ? weather.sys.country.toLocaleLowerCase()
        : "en";

      const url = wdk.getEntitiesFromSitelinks({
        titles: weather.name,
        languages: ["en", "fr"],
        sites: [country + "wiki", "enwiki"]
      });

      axios.get(url).then(res => {
        console.log("getWikidata", res);
        this.wikidata = res;
        this.loadingWikidata = false;
      });
    },
    searchWikidata(weather) {
      const url = wdk.searchEntities({
        search: weather.name,
        language: weather.sys.country.toLocaleLowerCase(),
        uselang: "en",
        limit: 1
      });

      fetch(url)
        .then(response => response.json())
        .then(entities => {
          console.log("searchWikidata", entities);
        });
    },
    async getCurrentWeatherData() {
      this.loadingCurrentWeatherData = true;
      const result: object = await currentWeather(
        this.marker[0],
        this.marker[1]
      );
      this.loadingCurrentWeatherData = false;

      console.log("result", result.data);
      return result.data;
    },
    async getForecastWeatherData() {
      this.loadingForecastWeatherData = true;
      const result: object = await forecastWeather(
        this.marker[0],
        this.marker[1]
      );
      this.loadingForecastWeatherData = false;

      console.log("result2", result);
      this.forecastWeatherData = result.data;
    }
  }
};
</script>

<style scoped>
.city {
  max-width: 300px;
  padding-top: 15px;
  margin: auto;
}
.city-thumbnail {
  cursor: pointer;
  max-height: 300px;
  max-width: 300px;
}
.image-attribution {
  font-size: 11px;
  margin: 2px;
}
.image-attribution::v-deep(a) {
  color: #0078a8;
  text-decoration: none;
}
.image-attribution::v-deep(a:hover) {
  text-decoration: underline;
}
.city-name {
  font-weight: bold;
  margin: 10px;
}
.city-description {
  font-size: smaller;
  margin: 0 0 8px 0;
}
</style>
