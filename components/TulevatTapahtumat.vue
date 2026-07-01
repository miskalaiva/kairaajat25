<template>
  <div class="events-container relative">
    <p class="text-m05beige text-2xl mb-2">{{ title }}</p>

    <!-- Lataustila -->
    <div v-if="loading" class="event-list">
      <div class="event-item skeleton" v-for="n in 2" :key="n">
        <div class="skeleton-line skeleton-title"></div>
        <div class="skeleton-line skeleton-date"></div>
        <div class="skeleton-line skeleton-desc"></div>
      </div>
    </div>

    <div v-else-if="upcomingEvents.length > 0" class="relative">
      <div ref="eventList" class="event-list">
        <div v-for="event in upcomingEvents" :key="event.id" class="event-item">
          <div class="event-details">
            <h3>{{ event.name }}</h3>
            <p class="event-date py-2">
              {{ formatDateRange(event.date, event.endDate) }}
            </p>
            <p>{{ event.description }}</p>
          </div>
          <IlmoitaTapahtumaan v-if="showRegistration" :event="event" />
        </div>
      </div>

      <!-- Vasemman nuolen nappi -->
      <div v-if="showLeft" class="arrow arrow-left">
        <button @click="scrollEvents('left')" class="arrow-btn">
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

      <!-- Oikean nuolen nappi -->
      <div v-if="showRight" class="arrow arrow-right">
        <button @click="scrollEvents('right')" class="arrow-btn">
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

    <p v-else>Ei tulevia tapahtumia.</p>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'
import IlmoitaTapahtumaan from './IlmoitaTapahtumaan.vue'

const { $db } = useNuxtApp()

const props = defineProps({
  title: { type: String, default: 'Tulevat tapahtumat' },
  showRegistration: { type: Boolean, default: true },
})

const upcomingEvents = ref([])
const eventList = ref(null)
const showLeft = ref(false)
const showRight = ref(false)
const loading = ref(true)

let unsubscribeSnapshot = null

const fetchEvents = () => {
  const q = query(collection($db, 'events'), orderBy('date', 'asc'))
  const today = new Date().toISOString().slice(0, 10)

  unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
    const allEvents = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
    upcomingEvents.value = allEvents.filter(
      (event) => (event.endDate || event.date) >= today,
    )
    loading.value = false
    nextTick(updateArrows)
  })
}

const weekdays = ['Su', 'Ma', 'Ti', 'Ke', 'To', 'Pe', 'La']

const formatDateRange = (startString, endString) => {
  if (!startString) return ''
  const [sy, sm, sd] = startString.split('-')
  const startDate = new Date(Number(sy), Number(sm) - 1, Number(sd))
  const weekday = weekdays[startDate.getDay()]
  if (!endString) return `${weekday} ${sd}.${sm}.${sy}`
  const [ey, em, ed] = endString.split('-')
  if (sm === em && sy === ey) return `${weekday} ${sd}.–${ed}.${em}.${ey}`
  if (sy === ey) return `${weekday} ${sd}.${sm}.–${ed}.${em}.${ey}`
  return `${weekday} ${sd}.${sm}.${sy}–${ed}.${em}.${ey}`
}

const updateArrows = () => {
  if (!eventList.value) return
  const el = eventList.value
  showLeft.value = el.scrollLeft > 0
  showRight.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 1
}

const scrollEvents = (direction) => {
  if (!eventList.value) return
  const scrollAmount = eventList.value.clientWidth * 0.9
  eventList.value.scrollLeft +=
    direction === 'left' ? -scrollAmount : scrollAmount
  setTimeout(updateArrows, 300)
}

onMounted(() => {
  fetchEvents()
  nextTick(() => {
    eventList.value?.addEventListener('scroll', updateArrows)
  })
})

onUnmounted(() => {
  unsubscribeSnapshot?.()
  eventList.value?.removeEventListener('scroll', updateArrows)
})
</script>

<style scoped>
.event-date {
  font-style: italic;
  color: #555;
  margin: 0.5rem 0;
}

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
  padding: 0.5rem 0rem 1rem;
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

/* Nuolipainikkeet sivuilla */
.arrow {
  position: absolute;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
}

.arrow-left {
  left: 0;
}
.arrow-right {
  right: 0;
}

.arrow-btn {
  background: white;
  border: 1px solid #ccc;
  border-radius: 50%;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  padding: 0.2rem;
  cursor: pointer;
  color: black;
  display: flex;
  align-items: center;
  justify-content: center;
}

.arrow-btn:hover {
  background: #f5f5f5;
}

/* Skeleton loader */
.skeleton {
  pointer-events: none;
}

.skeleton-line {
  background: linear-gradient(90deg, #e0e0e0 25%, #f5f5f5 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
  border-radius: 4px;
  margin-bottom: 0.75rem;
}

.skeleton-title {
  height: 1.4rem;
  width: 60%;
}
.skeleton-date {
  height: 1rem;
  width: 35%;
}
.skeleton-desc {
  height: 3rem;
  width: 90%;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
