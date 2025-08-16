<template>
  <div>
    <!-- Avainappi -->
    <button
      @click="isOpen = true"
      class="bg-m05green text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
    >
      Katso kuvat
    </button>

    <!-- Modal -->
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
    >
      <div
        class="bg-black rounded-2xl p-4 max-w-3xl w-11/12 relative shadow-lg"
      >
        <!-- Sulkunappi -->
        <button
          @click="isOpen = false"
          class="absolute top-3 right-3 bg-white text-black rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-900"
        >
          ✕
        </button>

        <!-- Kuvakaruselli -->
        <div class="flex flex-col items-center">
          <img
            :src="images[currentIndex]"
            alt="Puolijoukkueteltta kasattuna"
            title="Puolijoukkueteltta"
            class="max-h-[70vh] rounded-lg shadow-md"
          />
          <div class="flex justify-between items-center w-full mt-4">
            <button
              @click="prevImage"
              class="px-4 py-2 text-black bg-white rounded-lg"
            >
              ‹
            </button>
            <span class="text-gray-600">
              {{ currentIndex + 1 }} / {{ images.length }}
            </span>
            <button
              @click="nextImage"
              class="px-4 py-2 text-black bg-white rounded-lg"
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const isOpen = ref(false);
const currentIndex = ref(0);

const images = ["/kamiina.jpeg", "/teltta1.jpeg", "/teltta2.jpeg"];

const nextImage = () => {
  currentIndex.value = (currentIndex.value + 1) % images.length;
};

const prevImage = () => {
  currentIndex.value = (currentIndex.value - 1 + images.length) % images.length;
};
</script>

<style scoped>
/* Voit lisätä halutessasi fade-animaation */
</style>
