<template>
  <div class="container">
    <TulevatTapahtumat />

    <hr />

    <MenneetTapahtumat />
  </div>
</template>

<script setup>
// Tuodaan molemmat komponentit
import TulevatTapahtumat from "../components/TulevatTapahtumat.vue";
import MenneetTapahtumat from "../components/MenneetTapahtumat.vue";
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 1rem;
}

hr {
  margin: 3rem 0;
  border-color: #ccc;
}
</style>
