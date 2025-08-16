<template>
  <!-- Banneri -->
  <section class="relative w-full overflow-hidden">
    <!-- Bannerikuva -->
    <img
      :src="bannerImage"
      alt="Kairaajat banneri"
      class="w-full h-full object-cover"
    />

    <!-- Tekstikerros kuvan päällä -->
  </section>

  <!-- Sisältö -->
  <div class="min-h-screen text-black px-6 py-8 space-y-10 max-w-3xl mx-auto">
    <ViimeisimmatJulkaisut />
    <TulevatTapahtumat />
    <MenneetTapahtumat />
  </div>
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
