<template>
  <div class="events-container">
    <p class="text-m05beige text-2xl mb-2">{{ title }}</p>
    <div v-if="pastEvents.length > 0" class="event-list">
      <div v-for="event in pastEvents" :key="event.id" class="event-item">
        <div class="event-details">
          <h3>{{ event.name }}</h3>
          <p class="event-date">{{ formatDate(event.date) }}</p>
          <p>{{ event.description }}</p>
        </div>
      </div>
    </div>
    <p v-else>Ei menneitä tapahtumia.</p>
  </div>
</template>

<script setup>
import { ref, onMounted, defineProps } from "vue";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

const { $db } = useNuxtApp();

// Määritellään propsit
const props = defineProps({
  title: {
    type: String,
    default: "Menneet tapahtumat",
  },
});

const pastEvents = ref([]);

const fetchEvents = () => {
  const q = query(collection($db, "events"), orderBy("date", "desc"));
  const today = new Date().toISOString().slice(0, 10);

  onSnapshot(q, (snapshot) => {
    const allEvents = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    // Suodatetaan vain menneet tapahtumat ja otetaan 2 uusinta
    pastEvents.value = allEvents
      .filter((event) => event.date < today)
      .slice(0, 2);
  });
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-");
  return `${day}.${month}.${year}`;
};

onMounted(() => {
  fetchEvents();
});
</script>

<style scoped>
.events-container {
}

.event-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.event-item {
  padding: 1.5rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.event-details {
  width: 100%;
}

.event-details h3 {
  font-weight: bold;
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
}

.event-date {
  font-style: italic;
  color: #555;
  margin: 0.5rem 0;
}

.event-details p {
  margin-top: 1rem;
}
</style>
