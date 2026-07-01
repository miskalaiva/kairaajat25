<template>
  <div class="container">
    <div v-if="!isLoggedIn" class="login-form">
      <h2>Syötä avain</h2>
      <div class="form-group">
        <label for="key">Avain</label>
        <input
          type="password"
          id="key"
          v-model="key"
          @keyup.enter="loginWithKey"
          placeholder="Avain"
        />
      </div>
      <button @click="loginWithKey" class="button">Kirjaudu</button>
      <div v-if="error" class="error-message">{{ error }}</div>
    </div>

    <div v-else>
      <div class="header">
        <h2>Tapahtumat</h2>
        <button @click="logout" class="logout-button">Kirjaudu ulos</button>
      </div>

      <h2 class="text-2xl">Lisää uusi tapahtuma</h2>
      <form @submit.prevent="submitEvent" class="form">
        <div class="form-group">
          <label for="name"></label>
          <input
            type="text"
            placeholder="Tapahtuman nimi"
            id="name"
            v-model="event.name"
            required
          />
        </div>

        <div class="form-group">
          <label for="date">Lähtö</label>
          <input type="date" id="date" v-model="event.date" required />
        </div>

        <div class="form-group">
          <label for="endDate">Paluu (valinnainen):</label>
          <input
            type="date"
            id="endDate"
            v-model="event.endDate"
            :min="event.date"
          />
        </div>

        <div class="form-group">
          <label for="description">Kuvaus:</label>
          <textarea
            id="description"
            v-model="event.description"
            required
          ></textarea>
        </div>

        <button type="submit" class="button">
          <span>Lisää tapahtuma</span>
        </button>
      </form>

      <hr />

      <h2>Kaikki tapahtumat</h2>
      <div v-if="events.length > 0" class="event-list">
        <div v-for="e in events" :key="e.id" class="event-item">
          <div class="event-details">
            <h3>{{ e.name }}</h3>
            <p class="event-date py-2">
              {{ formatDateRange(e.date, e.endDate) }}
            </p>
            <p>{{ e.description }}</p>
          </div>
          <button @click="deleteEvent(e.id)" class="delete-button">
            Poista
          </button>
        </div>
      </div>
      <p v-else>Ei tapahtumia.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  doc,
} from 'firebase/firestore'

// Hae Firebase-instanssi Nuxtin kautta
const { $db } = useNuxtApp()
// Hae Nuxtin runtimeConfig
const config = useRuntimeConfig()

// --- Kirjautumisen tilat ---
const key = ref('')
const error = ref(null)
const isLoggedIn = ref(false)
const router = useRouter()
// Korvaa kovakoodattu arvo ympäristömuuttujasta luetulla arvolla
const correctKey = config.public.secretKey

const loginWithKey = () => {
  error.value = null
  if (key.value == correctKey) {
    isLoggedIn.value = true
    localStorage.setItem('isLoggedIn', 'true')
  } else {
    error.value = 'Virheellinen avain.'
  }
}

const logout = () => {
  isLoggedIn.value = false
  localStorage.removeItem('isLoggedIn')
}

// --- Tapahtumanhallinnan tilat ja logiikka ---
const event = ref({
  name: '',
  date: '',
  endDate: '',
  description: '',
})

const events = ref([])

const formatDateRange = (startString, endString) => {
  if (!startString) return ''
  const [sy, sm, sd] = startString.split('-')
  if (!endString) return `${sd}.${sm}.${sy}`
  const [ey, em, ed] = endString.split('-')
  if (sm === em && sy === ey) return `${sd}.–${ed}.${em}.${ey}`
  if (sy === ey) return `${sd}.${sm}.–${ed}.${em}.${ey}`
  return `${sd}.${sm}.${sy}–${ed}.${em}.${ey}`
}

const submitEvent = async () => {
  if (!event.value.name || !event.value.date) {
    alert('Anna tapahtumalle nimi ja päivämäärä.')
    return
  }

  try {
    await addDoc(collection($db, 'events'), {
      name: event.value.name,
      date: event.value.date,
      endDate: event.value.endDate || null,
      description: event.value.description,
      createdAt: new Date(),
    })

    event.value.name = ''
    event.value.date = ''
    event.value.endDate = ''
    event.value.description = ''
  } catch (e) {
    console.error('Virhe tapahtuman lisäämisessä: ', e)
    alert('Virhe tapahtuman luomisessa.')
  }
}

const deleteEvent = async (id) => {
  if (confirm('Haluatko varmasti poistaa tämän tapahtuman?')) {
    try {
      await deleteDoc(doc($db, 'events', id))
    } catch (e) {
      console.error('Virhe tapahtuman poistamisessa: ', e)
      alert('Virhe tapahtuman poistamisessa.')
    }
  }
}

const fetchEvents = () => {
  const q = query(collection($db, 'events'), orderBy('createdAt', 'desc'))
  onSnapshot(q, (snapshot) => {
    events.value = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }))
  })
}

onMounted(() => {
  if (localStorage.getItem('isLoggedIn') === 'true') {
    isLoggedIn.value = true
  }
  fetchEvents()
})
</script>

<style scoped>
/* Yhteiset tyylit */
.container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #f9f9f9;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial,
    sans-serif;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  color: #333;
}

.button {
  width: 100%;
  padding: 0.75rem 1.5rem;
  background-color: #4b633e;
  color: #d7c6a0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  transition: background-color 0.3s ease;
}

.button:hover:not(:disabled) {
  background-color: #78885f;
}

/* Kirjautumisen tyylit */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group label {
  font-weight: bold;
  color: #555;
  margin-bottom: 0.5rem;
  display: block;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 1rem;
}

.error-message {
  color: #d9534f;
  font-weight: bold;
  text-align: center;
  margin-top: 1rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.logout-button {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s;
}

.logout-button:hover {
  background-color: #d32f2f;
}

/* Tapahtumienhallinnan tyylit */
.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  margin-top: 2rem;
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

hr {
  margin: 2rem 0;
  border-color: #ccc;
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
}

.event-details {
  flex-grow: 1;
}

.event-date {
  font-style: italic;
  color: #555;
}

.delete-button {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.delete-button:hover {
  background-color: #c0392b;
}
</style>
