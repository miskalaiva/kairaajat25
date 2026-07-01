<template>
  <div class="events-container">
    <p class="text-m05beige text-2xl mb-2">{{ title }}</p>

    <div v-if="loading" class="event-list">
      <div class="event-item skeleton" v-for="n in 2" :key="n">
        <div class="skeleton-line skeleton-title"></div>
        <div class="skeleton-line skeleton-date"></div>
        <div class="skeleton-line skeleton-desc"></div>
      </div>
    </div>

    <div v-else-if="pastEvents.length > 0">
      <div class="event-list">
        <div v-for="event in visibleEvents" :key="event.id" class="event-item">
          <div class="event-details">
            <h3>{{ event.name }}</h3>
            <p class="event-date">
              {{ formatDateRange(event.date, event.endDate) }}
            </p>
            <p class="event-desc">{{ event.description }}</p>
          </div>
        </div>
      </div>

      <div v-if="pastEvents.length > visibleCount" class="show-more-wrap">
        <button @click="visibleCount += STEP" class="show-more-btn">
          Näytä lisää ({{ pastEvents.length - visibleCount }} jäljellä)
        </button>
      </div>
    </div>

    <p v-else>Ei menneitä tapahtumia.</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'

const { $db } = useNuxtApp()

const props = defineProps({
  title: { type: String, default: 'Menneet tapahtumat' },
})

const STEP = 3
const pastEvents = ref([])
const loading = ref(true)
const visibleCount = ref(STEP)
let unsubscribe = null

const visibleEvents = computed(() =>
  pastEvents.value.slice(0, visibleCount.value),
)

const fetchEvents = () => {
  const q = query(collection($db, 'events'), orderBy('date', 'desc'))
  const today = new Date().toISOString().slice(0, 10)

  unsubscribe = onSnapshot(q, (snapshot) => {
    const allEvents = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
    pastEvents.value = allEvents.filter(
      (event) => (event.endDate || event.date) < today,
    )
    loading.value = false
  })
}

const formatDateRange = (startString, endString) => {
  if (!startString) return ''
  const [sy, sm, sd] = startString.split('-')
  if (!endString) return `${sd}.${sm}.${sy}`
  const [ey, em, ed] = endString.split('-')
  if (sm === em && sy === ey) return `${sd}.–${ed}.${em}.${ey}`
  if (sy === ey) return `${sd}.${sm}.–${ed}.${em}.${ey}`
  return `${sd}.${sm}.${sy}–${ed}.${em}.${ey}`
}

onMounted(() => {
  fetchEvents()
})
onUnmounted(() => {
  unsubscribe?.()
})
</script>

<style scoped>
.event-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.event-item {
  padding: 1.25rem 1.5rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  background-color: #f8f8f6;
  opacity: 0.85;
  position: relative;
}

.event-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 0.5rem;
}

.past-badge {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  color: #f05151;
  padding: 0.15rem 0.5rem;
}

.event-details h3 {
  font-weight: bold;
  font-size: 1.1rem;
  color: #444;
  margin-bottom: 0.25rem;
}

.event-date {
  font-style: italic;
  color: #e82e2e;
  font-size: 0.9rem;
  margin: 0.25rem 0;
}

.event-desc {
  color: #666;
  font-size: 0.95rem;
  margin-top: 0.5rem;
}

.show-more-wrap {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}

.show-more-btn {
  background: none;
  border: 1px solid #e2dede;
  color: #bbb;
  padding: 0.5rem 1.5rem;
  border-radius: 99px;
  cursor: pointer;
  font-size: 0.9rem;
  transition:
    background-color 0.2s,
    color 0.2s;
}

.show-more-btn:hover {
  background-color: #eee;
  color: #333;
}

/* Skeleton */
.skeleton {
  pointer-events: none;
  opacity: 1;
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
