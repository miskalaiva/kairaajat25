<template>
  <!-- Banneri -->
  <section class="relative w-full overflow-hidden">
    <!-- Bannerikuva -->
    <img
      :src="bannerImage"
      alt="Kairaajat banneri"
      class="w-full h-full object-cover"
    />

    <!-- Avauksen nappi -->
    <button
      @click="showModal = true"
      class="absolute bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg"
    >
      Näytä tiedote
    </button>
  </section>

  <!-- Sisältö -->
  <div class="min-h-screen text-black px-6 py-8 space-y-10 max-w-3xl mx-auto">
    <ViimeisimmatJulkaisut />
    <TulevatTapahtumat />
    <MenneetTapahtumat />
  </div>

  <!-- Teleportoitu modal -->
  <teleport to="body">
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal p-6">
        <h3 class="font-semibold mb-4 text-lg">Etusivun tiedote</h3>
        <p class="text-gray-800">
          Tämä modal avautuu koko näytön päälle, myös mobiilissa. Se ei enää jää
          karusellin sisälle, koska se teleportataan suoraan bodyyn.
        </p>
        <button @click="showModal = false" class="close-button px-4 py-2 mt-6">
          Sulje
        </button>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { ref, onMounted } from "vue";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import TulevatTapahtumat from "../components/TulevatTapahtumat.vue";
import MenneetTapahtumat from "../components/MenneetTapahtumat.vue";

// Bannerin tuonti
import bannerImage from "~/assets/images/etusivu/kairaajatbanner.jpg";

const { $db } = useNuxtApp();
const julkaisut = ref([]);
const carousel = ref(null);
const showModal = ref(false); // 👈 modalin tila

const formatDate = (dateValue, includeTime = false) => {
  if (!dateValue) return "Päivämäärää ei saatavilla";

  let date;
  if (typeof dateValue === "string") {
    const [year, month, day] = dateValue.split("-");
    return `${day}.${month}.${year}`;
  } else if (dateValue.toDate) {
    date = dateValue.toDate();
  } else {
    return "Virheellinen päivämäärä";
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  let formattedDate = `${day}.${month}.${year}`;

  if (includeTime) {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    formattedDate += ` ${hours}:${minutes}`;
  }

  return formattedDate;
};

const fetchLatestPosts = () => {
  const q = query(
    collection($db, "posts"),
    orderBy("createdAt", "desc"),
    limit(6)
  );

  onSnapshot(q, (snapshot) => {
    julkaisut.value = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  });
};

const scrollCarousel = (direction) => {
  if (!carousel.value) return;
  const scrollAmount = 352;
  if (direction === "left") {
    carousel.value.scrollLeft -= scrollAmount;
  } else {
    carousel.value.scrollLeft += scrollAmount;
  }
};

onMounted(() => {
  fetchLatestPosts();
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999; /* 👈 varmistaa että modal on kaiken päällä */
}
.modal {
  background-color: #fff;
  color: #000;
  border-radius: 10px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
}
.close-button {
  border: none;
  border-radius: 5px;
  background-color: #1e90ff;
  color: #fff;
  cursor: pointer;
}
</style>
