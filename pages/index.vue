<template>
  <div
    class="min-h-screen text-m05beige px-6 py-8 space-y-12 max-w-3xl mx-auto"
  >
    <section class="bg-m05brown rounded-lg p-6 text-center shadow-lg">
      <p class="text-lg">
        Vuonna 2013 perustettu metsää ja sen elinympäristöä kunnioittava seura.
      </p>
    </section>

    <section>
      <h2 class="text-2xl font-bold mb-4 pb-1">Uusimmat julkaisut</h2>
      <div
        v-if="julkaisut.length > 0"
        class="flex space-x-4 overflow-x-scroll snap-x snap-mandatory pb-4 md:grid md:grid-cols-3 md:gap-4 md:space-x-0"
      >
        <div
          v-for="julkaisu in julkaisut"
          :key="julkaisu.id"
          class="bg-m05brown rounded-lg p-4 shadow-md flex-shrink-0 w-80 snap-center md:w-auto md:flex-1"
        >
          <div
            v-if="julkaisu.images && julkaisu.images.length > 0"
            class="mb-4"
          >
            <img
              :src="julkaisu.images[0]"
              alt="Julkaisun kuva"
              class="rounded-md w-full h-48 object-cover"
            />
          </div>

          <p class="mt-1 break-words">{{ julkaisu.text }}</p>
          <p class="font-semibold mt-4">-{{ julkaisu.publisher }}</p>
          <p class="text-sm text-m05greenLight">
            {{ formatDate(julkaisu.createdAt, true) }}
          </p>
        </div>
      </div>
      <p v-else class="text-m05greenLight italic">Ei julkaisuja.</p>
    </section>

    <section>
      <h2 class="text-2xl font-bold mb-4 pb-1">Tulevat tapahtumat</h2>
      <ul class="space-y-4">
        <li
          v-for="event in tulevatTapahtumat"
          :key="event.id"
          class="bg-m05brown rounded-lg p-4 shadow-md"
        >
          <h3 class="font-semibold text-lg">{{ event.name }}</h3>
          <p class="text-m05greenLight">{{ formatDate(event.date) }}</p>
          <p class="mt-1">{{ event.description }}</p>
        </li>
        <li
          v-if="tulevatTapahtumat.length === 0"
          class="text-m05greenLight italic"
        >
          Ei tulevia tapahtumia.
        </li>
      </ul>
    </section>

    <section>
      <h2 class="text-2xl font-bold mb-4 pb-1">Menneet tapahtumat</h2>
      <ul class="space-y-4">
        <li
          v-for="event in menneetTapahtumat"
          :key="event.id"
          class="bg-m05greenLight rounded-lg p-4 shadow-inner"
        >
          <h3 class="font-semibold text-lg">{{ event.name }}</h3>
          <p class="text-m05green">{{ formatDate(event.date) }}</p>
          <p class="mt-1">{{ event.description }}</p>
        </li>
        <li v-if="menneetTapahtumat.length === 0" class="text-m05beige italic">
          Ei menneitä tapahtumia.
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { ref, onMounted } from "vue";
import { db } from "@/utils/firebase";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";

const router = useRouter();

// Tapahtumatilojen alustus
const tulevatTapahtumat = ref([]);
const menneetTapahtumat = ref([]);

// Firestore-julkaisut
const julkaisut = ref([]);

// Funktio päivämäärän ja kellonajan muotoiluun suomalaiseen muotoon
const formatDate = (dateValue, includeTime = false) => {
  if (!dateValue) return "Päivämäärää ei saatavilla";

  let date;
  // Tarkista, onko arvo Firestore Timestamp vai ISO-muotoinen merkkijono
  if (typeof dateValue === "string") {
    // Tapahtumien päivämäärät ovat jo merkkijonoja
    const [year, month, day] = dateValue.split("-");
    return `${day}.${month}.${year}`;
  } else if (dateValue.toDate) {
    // Julkaisujen päivämäärät ovat Firestore Timestamp -objekteja
    date = dateValue.toDate();
  } else {
    return "Virheellinen päivämäärä";
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  let formattedDate = `${day}.${month}.${year}`;

  // Lisää kellonaika, jos includeTime on tosi
  if (includeTime) {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    formattedDate += ` ${hours}:${minutes}`;
  }

  return formattedDate;
};

// Funktio viimeisimpien julkaisujen hakemiseksi
const fetchLatestPosts = () => {
  const q = query(
    collection(db, "posts"),
    orderBy("createdAt", "desc"),
    limit(3)
  );

  onSnapshot(q, (snapshot) => {
    julkaisut.value = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  });
};

// Funktio tapahtumien hakemiseksi ja suodattamiseksi
const fetchEvents = () => {
  const q = query(collection(db, "events"), orderBy("date", "asc"));
  const today = new Date().toISOString().slice(0, 10);

  onSnapshot(q, (snapshot) => {
    const allEvents = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    tulevatTapahtumat.value = allEvents.filter((event) => event.date >= today);
    menneetTapahtumat.value = allEvents.filter((event) => event.date < today);
  });
};

onMounted(() => {
  fetchLatestPosts();
  fetchEvents();
});
</script>
