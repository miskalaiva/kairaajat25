<template>
  <section>
    <p class="text-m05beige text-2xl mb-2">{{ title }}</p>

    <!-- Lataustila -->
    <div v-if="loading" class="skeleton-carousel">
      <div class="skeleton-card" v-for="n in 3" :key="n">
        <div class="skeleton-line skeleton-img"></div>
        <div class="skeleton-line skeleton-text"></div>
        <div class="skeleton-line skeleton-author"></div>
      </div>
    </div>

    <div v-else-if="posts.length > 0" class="relative">
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

    <p v-else-if="!loading" class="text-m05greenLight italic">Ei julkaisuja.</p>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
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
const loading = ref(true);
let unsubscribe = null;

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

  unsubscribe = onSnapshot(q, (snapshot) => {
    posts.value = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    loading.value = false;
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

onMounted(() => { fetchLatestPosts(); });
onUnmounted(() => { unsubscribe?.(); });
</script>

<style scoped>
.relative { position: relative; }
.absolute { position: absolute; }

/* Skeleton */
.skeleton-carousel {
  display: flex;
  gap: 1rem;
  overflow: hidden;
}

.skeleton-card {
  flex: 0 0 20rem;
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.skeleton-line {
  background: linear-gradient(90deg, #e0e0e0 25%, #f5f5f5 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
  border-radius: 4px;
  margin-bottom: 0.75rem;
}

.skeleton-img    { height: 12rem; width: 100%; }
.skeleton-text   { height: 3rem;  width: 90%; }
.skeleton-author { height: 1rem;  width: 40%; }

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
