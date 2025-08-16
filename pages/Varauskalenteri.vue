<template>
  <div class="calendar-container">
    <h2 class="calendar-title">Teltan varauskalenteri</h2>
    <div class="mb-8">
      <p class="mb-2 text-lg">
        Ruotsin armeijan puolijoukkueteltta ja kamiina.
      </p>
      <ul class="list-disc ml-8">
        <li>Halkaisija: 6 metriä</li>
        <li>Keskikorkeus: 2,5 metriä</li>
        <li>Reunakorkeus: 1,1 metriä</li>
        <li>Lattiapinta-ala: 20 neliömetriä</li>
      </ul>
    </div>

    <div v-if="!isLoaded" class="loading">Ladataan kalenteria...</div>

    <div v-if="isLoaded" class="calendar">
      <div class="calendar-header">
        <button @click="prevMonth">&lt;</button>
        <span>{{ monthNames[currentMonth] }} {{ currentYear }}</span>
        <button @click="nextMonth">&gt;</button>
      </div>

      <div class="calendar-weekdays">
        <span v-for="day in weekDays" :key="day">{{ day }}</span>
      </div>

      <div class="calendar-days">
        <span
          v-for="(day, index) in blankDays"
          :key="'blank-' + index"
          class="blank-day"
        ></span>

        <button
          v-for="day in daysInMonth"
          :key="day"
          :class="{
            booked: isBooked(day),
            selected: isSelected(day),
            inRange: isInRange(day),
          }"
          @click="selectDay(day)"
          :disabled="isBooked(day) || isPast(day)"
        >
          {{ day }}
        </button>
      </div>
    </div>

    <div class="pricing mt-4">
      <p><strong>30€ / yö</strong></p>
      <div v-if="startDay && endDay">
        <p class="py-2">
          Valittu aikaväli: {{ formatDate(startDay) }} -
          {{ formatDate(endDay) }}
        </p>
        <p class="pt- font-semibold">Kokonaishinta: {{ totalPrice }}€</p>
      </div>
    </div>

    <div class="booking-info">
      <input
        v-model="name"
        type="text"
        placeholder="Varaajan nimi"
        class="booking-input"
      />
      <input
        v-model="phone"
        type="text"
        placeholder="Puhelinnumero"
        class="booking-input"
      />
      <input
        v-model="email"
        type="email"
        placeholder="Sähköpostiosoite"
        class="booking-input"
      />
      <button
        @click="bookDays"
        :disabled="
          !startDay || !endDay || isRangeBooked || !name || !phone || !email
        "
        class="book-button"
      >
        {{
          !name || !phone || !email
            ? "Täytä tiedot"
            : isRangeBooked
            ? "Varattu"
            : "Varaa valitut päivät"
        }}
      </button>

      <div v-if="bookingSuccess" class="success-message">
        <p>
          Kiitos varauksestasi! Saat noutoa koskevat tiedot viestillä
          vuorokauden kuluessa.
        </p>
        <p>
          Jos varauksesi alkaa kuitenkin alle vuorokauden sisällä, pyydä noutoa
          koskevat tiedot numerosta 040 193 7715.
        </p>
      </div>

      <span>Varaamalla valitut päivät hyväksyt varauksen ehdot.</span>
      <button @click="showTerms = true" class="terms-button">
        Varauksen ehdot
      </button>
    </div>

    <div v-if="showTerms" class="modal-overlay" @click.self="showTerms = false">
      <div class="modal p-4">
        <h3 class="font-semibold mb-2">Varauksen ehdot</h3>
        <ul class="list-decimal list-inside space-y-2 text-gray-800">
          <li>Maksu suoritetaan paikan päällä noudon yhteydessä.</li>
          <li>
            Peruutukset tulee tehdä vähintään 48 tuntia ennen varattua aikaa.
          </li>
          <li>Asiakas on vastuussa teltan kunnosta ja siisteydestä.</li>
          <li>Tupakointi ja avotulen teko teltassa on kielletty.</li>
          <li>
            Varauksen ehtoja muutetaan vain ilmoittamalla asiakkaille etukäteen.
          </li>
        </ul>

        <button @click="showTerms = false" class="close-button px-4 py-2 mt-4">
          Sulje
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { collection, addDoc, getDocs } from "firebase/firestore";
definePageMeta({
  layout: "no-layout",
});
const { $db } = useNuxtApp();

const today = new Date();
const currentMonth = ref(today.getMonth());
const currentYear = ref(today.getFullYear());

const startDay = ref(null);
const endDay = ref(null);
const bookedDays = ref([]);
const isLoaded = ref(false);
const showTerms = ref(false);
const bookingSuccess = ref(false); // Uusi muuttuja onnistuneelle varaukselle

const name = ref("");
const phone = ref("");
const email = ref("");

const monthNames = [
  "Tammikuu",
  "Helmikuu",
  "Maaliskuu",
  "Huhtikuu",
  "Toukokuu",
  "Kesäkuu",
  "Heinäkuu",
  "Elokuu",
  "Syyskuu",
  "Lokakuu",
  "Marraskuu",
  "Joulukuu",
];
const weekDays = ["Ma", "Ti", "Ke", "To", "Pe", "La", "Su"];

const daysInMonth = computed(() => {
  return new Array(
    new Date(currentYear.value, currentMonth.value + 1, 0).getDate()
  )
    .fill(null)
    .map((_, i) => i + 1);
});

const blankDays = computed(() => {
  const firstDay = new Date(currentYear.value, currentMonth.value, 1).getDay();
  return new Array(firstDay === 0 ? 6 : firstDay - 1).fill(null);
});

const isPast = (day, month = currentMonth.value, year = currentYear.value) => {
  const date = new Date(year, month, day);
  return (
    date < new Date(today.getFullYear(), today.getMonth(), today.getDate())
  );
};

const selectDay = (day) => {
  const selectedDate = new Date(currentYear.value, currentMonth.value, day);
  if (isPast(day)) return;

  if (!startDay.value || (startDay.value && endDay.value)) {
    startDay.value = selectedDate;
    endDay.value = null;
  } else if (selectedDate > startDay.value) {
    // Tarkistetaan, ettei välillä ole varattuja päiviä
    let tempDate = new Date(startDay.value);
    let conflict = false;
    while (tempDate <= selectedDate) {
      const dateString = `${tempDate.getFullYear()}-${
        tempDate.getMonth() + 1
      }-${tempDate.getDate()}`;
      if (bookedDays.value.includes(dateString)) {
        conflict = true;
        break;
      }
      tempDate.setDate(tempDate.getDate() + 1);
    }

    if (!conflict) {
      endDay.value = selectedDate;
    } else {
      alert(
        "Valitsemasi ajankohta sisältää jo varattuja päiviä. Valitse toinen ajankohta."
      );
      startDay.value = selectedDate;
      endDay.value = null;
    }
  } else {
    startDay.value = selectedDate;
    endDay.value = null;
  }
};

const isBooked = (day) => {
  const dateString = `${currentYear.value}-${currentMonth.value + 1}-${day}`;
  return bookedDays.value.includes(dateString);
};

const isSelected = (day) => {
  const date = new Date(currentYear.value, currentMonth.value, day);
  return (
    (startDay.value && date.getTime() === startDay.value.getTime()) ||
    (endDay.value && date.getTime() === endDay.value.getTime())
  );
};

const isInRange = (day) => {
  if (!startDay.value || !endDay.value) return false;
  const date = new Date(currentYear.value, currentMonth.value, day);
  return date > startDay.value && date < endDay.value;
};

const formatDate = (date) =>
  `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;

const totalPrice = computed(() => {
  if (!startDay.value || !endDay.value) return 0;
  const nights = Math.ceil(
    (endDay.value - startDay.value) / (1000 * 60 * 60 * 24)
  );
  return nights * 30;
});

const isRangeBooked = computed(() => {
  if (!startDay.value || !endDay.value) return false;
  let current = new Date(startDay.value);
  while (current <= endDay.value) {
    const dateString = `${current.getFullYear()}-${
      current.getMonth() + 1
    }-${current.getDate()}`;
    if (bookedDays.value.includes(dateString)) return true;
    current.setDate(current.getDate() + 1);
  }
  return false;
});

const bookDays = async () => {
  if (
    !startDay.value ||
    !endDay.value ||
    isRangeBooked.value ||
    !name.value ||
    !phone.value ||
    !email.value
  ) {
    alert("Täytä kaikki pakolliset tiedot ennen varausta.");
    return;
  }

  try {
    let current = new Date(startDay.value);
    while (current <= endDay.value) {
      const dayString = `${current.getFullYear()}-${
        current.getMonth() + 1
      }-${current.getDate()}`;
      await addDoc(collection($db, "bookedDays"), {
        day: dayString,
        name: name.value,
        phone: phone.value,
        email: email.value,
      });
      current.setDate(current.getDate() + 1);
    }

    // Varauksen onnistuttua, lisätään varatut päivät käyttöliittymään
    await fetchBookedDays();

    const bookingData = {
      name: name.value,
      phone: phone.value,
      email: email.value,
      startDate: formatDate(startDay.value),
      endDate: formatDate(endDay.value),
      totalPrice: totalPrice.value,
    };

    const response = await $fetch("/api/send-email", {
      method: "POST",
      body: bookingData,
    });

    if (response.success) {
      // alert("Varaus onnistui! Vahvistusviestit lähetetty.");
    } else {
      // alert("Varaus onnistui, mutta vahvistusviestin lähetys epäonnistui.");
      console.error(response.error);
    }

    // Asetetaan onnistunut varaus -muuttuja todeksi
    bookingSuccess.value = true;

    // Tyhjennetään lomake
    startDay.value = null;
    endDay.value = null;
    name.value = "";
    phone.value = "";
    email.value = "";
  } catch (error) {
    console.error("Varauksen tai sähköpostin lähetysvirhe:", error);
    alert("Varauksen tekemisessä tapahtui virhe. Yritä uudelleen.");
  }
};

const fetchBookedDays = async () => {
  const querySnapshot = await getDocs(collection($db, "bookedDays"));
  bookedDays.value = querySnapshot.docs.map((doc) => doc.data().day);
  isLoaded.value = true;
};

onMounted(() => fetchBookedDays());

const prevMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11;
    currentYear.value--;
  } else {
    currentMonth.value--;
  }
};

const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0;
    currentYear.value++;
  } else {
    currentMonth.value++;
  }
};
</script>

<style scoped>
.calendar-container {
  max-width: 400px;
  margin: 2rem auto;
  padding: 1rem;
  background-color: #000;
  color: #d7c6a0;
  border-radius: 10px;
}
.calendar-title {
  text-align: center;
  margin-bottom: 3rem;
  font-weight: bold;
  font-size: 1.5rem;
}
.pricing {
  text-align: center;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}
.loading {
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: #888;
}
.calendar {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.calendar-header button {
  background: #78885f;
  color: #fff;
  border: none;
  padding: 0.3rem 0.6rem;
  border-radius: 5px;
  cursor: pointer;
}
.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-weight: bold;
  margin-top: 0.5rem;
}
.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  gap: 0.2rem;
  margin-top: 0.2rem;
}
.calendar-days button {
  padding: 0.5rem;
  border: none;
  border-radius: 5px;
  background-color: #222;
  color: #d7c6a0;
  cursor: pointer;
  transition: background 0.3s;
}
.calendar-days button:hover:not(:disabled) {
  background-color: #78885f;
}
.calendar-days button.selected,
.calendar-days button.inRange {
  background-color: #78885f;
}
.calendar-days button.booked {
  background-color: #555;
  cursor: not-allowed;
}
.calendar-days button:disabled {
  background-color: #333;
  color: #888;
  cursor: not-allowed;
}
.blank-day {
  height: 2rem;
}
.booking-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
}
.booking-input {
  padding: 0.5rem;
  border-radius: 5px;
  border: 1px solid #555;
  background-color: #222;
  color: #d7c6a0;
  width: 100%;
}
.booking-input::placeholder {
  color: #888;
}
.book-button {
  padding: 0.5rem;
  border-radius: 5px;
  border: none;
  background-color: #78885f;
  color: #fff;
  cursor: pointer;
  margin-top: 0.5rem;
}
.terms-button {
  padding: 0.5rem;
  border-radius: 5px;
  border: none;
  background-color: #1e90ff;
  color: #fff;
  cursor: pointer;
  margin-top: 0.5rem;
}
.book-button:disabled {
  background-color: #555;
  cursor: not-allowed;
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
}
.modal {
  background-color: #fff;
  color: #000;

  border-radius: 10px;
  max-width: 400px;
  width: 90%;
}
.close-button {
  border: none;
  border-radius: 5px;
  background-color: #78885f;
  color: #fff;
  cursor: pointer;
}

.success-message {
  color: #d7c6a0;
  background-color: #222;
  border: 1px solid #78885f;
  padding: 1rem;
  border-radius: 5px;
  margin-top: 1rem;
}
</style>
