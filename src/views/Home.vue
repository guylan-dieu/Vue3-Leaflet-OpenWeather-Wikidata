<template>
  <h1>Vue3-Leaflet-OpenWeather-Wikidata</h1>
  <Map></Map>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Map from "@/components/Map.vue";

export default defineComponent({
  name: "Home",
  components: { Map }
});
</script>
