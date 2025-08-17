<template>
  <section>
    <p class="text-m05beige text-2xl mb-2">{{ title }}</p>
    <div v-if="posts.length > 0" class="relative">
      <div
        ref="carousel"
        class="flex space-x-4 overflow-x-scroll snap-x snap-mandatory pb-4 scroll-smooth"
      >
        <div
          v-for="post in posts"
          :key="post.id"
          class="text-black bg-white rounded-lg p-4 shadow-md flex-shrink-0 w-80 snap-center"
        >
          <div v-if="post.images && post.images.length > 0" class="mb-4">
            <img
              :src="post.images[0]"
              alt="Julkaisun kuva"
              class="rounded-md w-full h-48 object-cover"
            />
          </div>

          <p class="mt-1 break-words">
            {{ post.text }}
          </p>
          <p class="font-semibold mt-4">-{{ post.publisher }}</p>
          <p class="text-sm text-m05greenLight">
            {{ formatDate(post.createdAt, true) }}
          </p>
        </div>
      </div>

      <div class="absolute inset-y-0 -left-1 flex items-center">
        <button @click="scrollCarousel('left')" class="text-black rounded-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="size-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      </div>

      <div class="absolute inset-y-0 -right-1 flex items-center">
        <button
          @click="scrollCarousel('right')"
          class="text-black rounded-full"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="size-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>

    <p v-else class="text-m05greenLight italic">Ei julkaisuja.</p>
  </section>
</template>

<script setup>
import { ref, onMounted, defineProps } from "vue";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";

const { $db } = useNuxtApp();

const props = defineProps({
  title: {
    type: String,
    default: "Uusimmat julkaisut",
  },
});

const posts = ref([]);
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
    posts.value = snapshot.docs.map((doc) => ({
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
.relative {
  position: relative;
}

.absolute {
  position: absolute;
}
</style>
