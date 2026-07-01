<template>
  <div class="registration-wrapper">
    <!-- Osallistujamäärä + avausnappi -->
    <div class="reg-summary">
      <span v-if="participantCount > 0" class="participant-count">
        {{ participantCount }}
        {{ participantCount === 1 ? 'osallistuja' : 'osallistujaa' }}
      </span>
      <button @click="formOpen = !formOpen" class="toggle-form-button">
        {{ formOpen ? 'Sulje' : 'Ilmoittaudu' }}
      </button>
    </div>

    <!-- Ilmoittautumislomake (piilossa oletuksena) -->
    <div v-if="formOpen" class="registration-form">
      <form @submit.prevent="handleRegistration">
        <input
          type="text"
          v-model="registrationForm.name"
          placeholder="Nimi"
          required
          class="name-input"
        />
        <select v-model="registrationForm.status" class="status-select">
          <option value="Osallistun">Osallistun</option>
          <option value="En osallistu">En osallistu</option>
        </select>
        <button type="submit" class="submit-button">Ilmoita</button>
      </form>
      <p v-if="confirmationMessage" class="confirmation-message">
        {{ confirmationMessage }}
      </p>
    </div>

    <!-- Näytä osallistujat / poissaolijat -->
    <div
      v-if="event.registrations && event.registrations.length > 0"
      class="registrations-summary"
    >
      <button @click="openModal('Osallistun')" class="toggle-button">
        Osallistujat ({{ countStatus(event.registrations, 'Osallistun') }})
      </button>
      <button @click="openModal('En osallistu')" class="toggle-button">
        Poissaolijat ({{ countStatus(event.registrations, 'En osallistu') }})
      </button>
    </div>
  </div>

  <teleport to="body">
    <div v-if="activeModal.show" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content" @click.stop>
        <button class="close-button" type="button" @click="closeModal">
          &times;
        </button>
        <h3>{{ activeModal.title }}</h3>
        <ul>
          <li
            v-for="(reg, index) in filteredRegistrations(activeModal.status)"
            :key="index"
            class="reg-item"
          >
            <strong>{{ reg.name }}</strong>
            <button
              v-if="isAdmin"
              @click="deleteRegistration(reg.name)"
              class="delete-reg-button"
              title="Poista ilmoittautuminen"
            >
              &times;
            </button>
          </li>
        </ul>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { useNuxtApp } from '#app'

const { $db } = useNuxtApp()

const props = defineProps({
  event: { type: Object, required: true },
})

const registrationForm = ref({ name: '', status: 'Osallistun' })
const confirmationMessage = ref('')
const activeModal = ref({ show: false, status: null, title: '' })
const isAdmin = ref(false)
const formOpen = ref(false)

onMounted(() => {
  isAdmin.value = localStorage.getItem('isLoggedIn') === 'true'
})

const participantCount = computed(
  () =>
    (props.event.registrations || []).filter((r) => r.status === 'Osallistun')
      .length,
)

const handleRegistration = async () => {
  if (!registrationForm.value.name) return

  const eventRef = doc($db, 'events', props.event.id)
  try {
    const docSnap = await getDoc(eventRef)
    const existing = docSnap.exists() ? docSnap.data().registrations || [] : []
    const updated = existing.filter(
      (r) => r.name !== registrationForm.value.name,
    )
    updated.push({
      name: registrationForm.value.name,
      status: registrationForm.value.status,
      timestamp: new Date(),
    })
    await updateDoc(eventRef, { registrations: updated })

    confirmationMessage.value = 'Ilmoittautuminen päivitetty!'
    setTimeout(() => {
      registrationForm.value = { name: '', status: 'Osallistun' }
      confirmationMessage.value = ''
      formOpen.value = false
    }, 2000)
  } catch (error) {
    console.error('Error updating document: ', error)
    confirmationMessage.value = 'Virhe ilmoittautumisessa.'
  }
}

const countStatus = (registrations, status) =>
  registrations.filter((r) => r.status === status).length

const filteredRegistrations = (status) =>
  (props.event.registrations || []).filter((r) => r.status === status)

const openModal = (status) => {
  const title =
    status === 'Osallistun'
      ? `${props.event.name} – osallistujat`
      : `${props.event.name} – poissaolijat`
  activeModal.value = { show: true, status, title }
}

const closeModal = () => {
  activeModal.value = { show: false, status: null, title: '' }
}

const deleteRegistration = async (name) => {
  if (!confirm(`Poistetaanko ilmoittautuminen: ${name}?`)) return
  const eventRef = doc($db, 'events', props.event.id)
  try {
    const docSnap = await getDoc(eventRef)
    const existing = docSnap.exists() ? docSnap.data().registrations || [] : []
    await updateDoc(eventRef, {
      registrations: existing.filter((r) => r.name !== name),
    })
  } catch (error) {
    console.error('Virhe poistossa: ', error)
  }
}

watch(
  () => props.event.id,
  () => {
    registrationForm.value = { name: '', status: 'Osallistun' }
    confirmationMessage.value = ''
    formOpen.value = false
  },
)
</script>

<style scoped>
.registration-wrapper {
  width: 100%;
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.reg-summary {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.participant-count {
  font-size: 0.9rem;
  color: #555;
}

.toggle-form-button {
  padding: 0.5rem 1.2rem;
  background-color: #4b633e;
  color: #ebe3e3;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: bold;
  transition: background-color 0.2s;
}

.toggle-form-button:hover {
  background-color: #78885f;
}

.registration-form form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.name-input,
.status-select,
.submit-button {
  width: 100%;
}

.name-input,
.status-select {
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
}

.submit-button {
  padding: 0.75rem 1rem;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
}

.submit-button:hover {
  background-color: #45a049;
}

.confirmation-message {
  font-size: 0.9rem;
  color: #008000;
  margin-top: 0.5rem;
}

.registrations-summary {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  padding-top: 0.75rem;
  border-top: 1px solid #eee;
}

.toggle-button {
  background: none;
  border: 1px solid #ccc;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.toggle-button:hover {
  background-color: #f0f0f0;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-content {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  position: relative;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  max-height: 80vh;
  overflow-y: auto;
}

.close-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  line-height: 1;
}

.modal-content h3 {
  margin-top: 0;
  margin-bottom: 1.5rem;
}

.modal-content ul {
  list-style-type: none;
  padding: 0;
}

.reg-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f9f9f9;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.delete-reg-button {
  background: none;
  border: 1px solid #e74c3c;
  color: #e74c3c;
  border-radius: 4px;
  width: 1.8rem;
  height: 1.8rem;
  font-size: 1.2rem;
  cursor: pointer;
  line-height: 1;
  flex-shrink: 0;
  transition:
    background-color 0.2s,
    color 0.2s;
}

.delete-reg-button:hover {
  background-color: #e74c3c;
  color: white;
}

@media (min-width: 768px) {
  .registration-form form {
    flex-direction: row;
  }

  .name-input,
  .status-select {
    width: auto;
  }

  .submit-button {
    width: auto;
  }
}
</style>
