<template>
  <div class="events-container relative">
    <p class="text-m05beige text-2xl mb-2">{{ title }}</p>

    <div v-if="upcomingEvents.length > 0" class="relative">
      <div ref="eventList" class="event-list">
        <div v-for="event in upcomingEvents" :key="event.id" class="event-item">
          <div class="event-details">
            <h3>{{ event.name }}</h3>
            <p class="event-date py-2">{{ formatDate(event.date) }}</p>
            <p>{{ event.description }}</p>
          </div>
          <IlmoitaTapahtumaan v-if="showRegistration" :event="event" />
        </div>
      </div>

      <!-- Vasemman nuolen nappi -->
      <div v-if="showLeft" class="absolute inset-y-0 left-0 flex items-center">
        <button
          @click="scrollEvents('left')"
          class="bg-m05greenDark text-m05beige p-2 rounded-full shadow-lg"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
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

      <!-- Oikean nuolen nappi -->
      <div
        v-if="showRight"
        class="absolute inset-y-0 right-0 flex items-center"
      >
        <button
          @click="scrollEvents('right')"
          class="bg-m05greenDark text-m05beige p-2 rounded-full shadow-lg"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
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

    <p v-else>Ei tulevia tapahtumia.</p>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, defineProps } from "vue";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import IlmoitaTapahtumaan from "./IlmoitaTapahtumaan.vue";

const { $db } = useNuxtApp();

const props = defineProps({
  title: { type: String, default: "Tulevat tapahtumat" },
  showRegistration: { type: Boolean, default: true },
});

const upcomingEvents = ref([]);
const eventList = ref(null);
const showLeft = ref(false);
const showRight = ref(false);

const fetchEvents = () => {
  const q = query(collection($db, "events"), orderBy("date", "asc"));
  const today = new Date().toISOString().slice(0, 10);

  onSnapshot(q, (snapshot) => {
    const allEvents = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    upcomingEvents.value = allEvents.filter((event) => event.date >= today);

    // päivitä nuolien näkyvyys kun DOM on valmis
    nextTick(() => {
      updateArrows();
    });
  });
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-");
  return `${day}.${month}.${year}`;
};

const updateArrows = () => {
  if (!eventList.value) return;
  const el = eventList.value;
  showLeft.value = el.scrollLeft > 0;
  showRight.value = el.scrollLeft + el.clientWidth < el.scrollWidth;
};

const scrollEvents = (direction) => {
  if (!eventList.value) return;
  const scrollAmount = eventList.value.clientWidth * 0.9;
  if (direction === "left") {
    eventList.value.scrollLeft -= scrollAmount;
  } else {
    eventList.value.scrollLeft += scrollAmount;
  }
  setTimeout(updateArrows, 300);
};

onMounted(() => {
  fetchEvents();
  eventList.value?.addEventListener("scroll", updateArrows);
});
</script>

<style scoped>
.events-container {
  width: 100%;
}

.event-list {
  display: flex;
  flex-direction: row;
  gap: 1.5rem;

  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 1rem;
}

.event-item {
  flex: 0 0 100%;
  scroll-snap-align: start;

  padding: 1.5rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
</style>
