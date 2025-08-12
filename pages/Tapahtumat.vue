<template>
  <div class="container">
    <section>
      <p class="text-m05beige text-2xl mb-2">Tulevat tapahtumat</p>
      <div v-if="tulevatTapahtumat.length > 0" class="event-list">
        <div v-for="e in tulevatTapahtumat" :key="e.id" class="event-item">
          <div class="event-details">
            <h3>{{ e.name }}</h3>
            <p class="event-date">{{ formatDate(e.date) }}</p>
            <p>{{ e.description }}</p>
          </div>
        </div>
      </div>
      <p v-else>Ei tulevia tapahtumia.</p>
    </section>

    <hr />

    <section>
      <p class="text-m05beige text-2xl mb-2">Menneet tapahtumat</p>
      <div v-if="menneetTapahtumat.length > 0" class="event-list">
        <div v-for="e in menneetTapahtumat" :key="e.id" class="event-item">
          <div class="event-details">
            <h3>{{ e.name }}</h3>
            <p class="event-date">{{ formatDate(e.date) }}</p>
            <p>{{ e.description }}</p>
          </div>
        </div>
      </div>
      <p v-else>Ei menneitä tapahtumia.</p>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { db } from "@/utils/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

// Tapahtuman tilat
const tulevatTapahtumat = ref([]);
const menneetTapahtumat = ref([]);

// Funktio kaikkien tapahtumien hakemiseksi ja suodattamiseksi
const fetchEvents = () => {
  const q = query(collection(db, "events"), orderBy("date", "asc"));

  const today = new Date().toISOString().slice(0, 10);

  onSnapshot(q, (snapshot) => {
    const allEvents = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    tulevatTapahtumat.value = allEvents.filter((event) => event.date >= today);
    menneetTapahtumat.value = allEvents.filter((event) => event.date < today);
  });
};

// Funktio päivämäärän muotoilua varten
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
.container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 1rem;
}

h2 {
  text-align: center;
  color: #333;
  margin-bottom: 2rem;
}

hr {
  margin: 3rem 0;
  border-color: #ccc;
}

section {
  margin-bottom: 3rem;
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
  justify-content: space-between;
  align-items: center;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.event-details {
  flex-grow: 1;
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
