<template>
  <div class="registration-form">
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
      <button type="submit" class="submit-button">Lähetä</button>
    </form>
    <p v-if="confirmationMessage" class="confirmation-message">
      {{ confirmationMessage }}
    </p>
  </div>

  <div
    v-if="event.registrations && event.registrations.length > 0"
    class="registrations-summary"
  >
    <div class="summary-item">
      <span>
        Osallistuu: {{ countStatus(event.registrations, "Osallistun") }}
      </span>
      <button @click="openModal('Osallistun')" class="toggle-button">
        Näytä
      </button>
    </div>
    <div class="summary-item">
      <span>
        Ei osallistu: {{ countStatus(event.registrations, "En osallistu") }}
      </span>
      <button @click="openModal('En osallistu')" class="toggle-button">
        Näytä
      </button>
    </div>
  </div>

  <!-- MODAL -->
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
        >
          <strong>{{ reg.name }}</strong>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNuxtApp } from "#app";

const { $db } = useNuxtApp();

const props = defineProps({
  event: {
    type: Object,
    required: true,
  },
});

const registrationForm = ref({
  name: "",
  status: "Osallistun",
});
const confirmationMessage = ref("");
const activeModal = ref({ show: false, status: null, title: "" });

const handleRegistration = async () => {
  if (!registrationForm.value.name) return;

  const eventRef = doc($db, "events", props.event.id);

  try {
    const docSnap = await getDoc(eventRef);
    const existingRegistrations = docSnap.exists()
      ? docSnap.data().registrations || []
      : [];

    const updatedRegistrations = existingRegistrations.filter(
      (reg) => reg.name !== registrationForm.value.name
    );

    updatedRegistrations.push({
      name: registrationForm.value.name,
      status: registrationForm.value.status,
      timestamp: new Date(),
    });

    await updateDoc(eventRef, {
      registrations: updatedRegistrations,
    });

    confirmationMessage.value = "Ilmoittautuminen päivitetty!";
    setTimeout(() => {
      registrationForm.value.name = "";
      registrationForm.value.status = "Osallistun";
      confirmationMessage.value = "";
    }, 3000);
  } catch (error) {
    console.error("Error updating document: ", error);
    confirmationMessage.value = "Virhe ilmoittautumisessa.";
  }
};

const countStatus = (registrations, status) => {
  return registrations.filter((reg) => reg.status === status).length;
};

const filteredRegistrations = (status) => {
  if (!props.event.registrations) return [];
  return props.event.registrations.filter((reg) => reg.status === status);
};

const openModal = (status) => {
  const title =
    status === "Osallistun"
      ? `Osallistujat: ${props.event.name}`
      : `Poissaolijat: ${props.event.name}`;
  activeModal.value = { show: true, status, title };
};

const closeModal = () => {
  activeModal.value = { show: false, status: null, title: "" };
};

// propsin päivityksien resetointi
watch(
  () => props.event.id,
  () => {
    registrationForm.value = { name: "", status: "Osallistun" };
    confirmationMessage.value = "";
  }
);
</script>

<style scoped>
.registration-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
  margin-top: 1rem;
}

.registration-form form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
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
  transition: background-color 0.2s;
  font-size: 1rem;
}

.submit-button:hover {
  background-color: #45a049;
}

.confirmation-message {
  font-size: 0.9rem;
  color: #008000;
  text-align: left;
  margin-top: 0.5rem;
}

.registrations-summary {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
  width: 100%;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
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

/* MODAL */
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

.modal-content li {
  background-color: #f9f9f9;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 0.5rem;
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
