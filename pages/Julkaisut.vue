<template>
  <div class="container">
    <button @click="openModal" class="button create-post-button">
      Luo uusi julkaisu
    </button>

    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <h2>Luo uusi julkaisu</h2>
        <button class="close-modal-button" @click="closeModal">X</button>
        <form @submit.prevent="submitPost" class="form">
          <div class="form-group">
            <label for="publisher">Julkaisijan nimi:</label>
            <input
              type="text"
              id="publisher"
              v-model="post.publisher"
              required
            />
          </div>

          <div class="form-group">
            <label for="text">Teksti:</label>
            <textarea id="text" v-model="post.text" required></textarea>
          </div>

          <div class="form-group">
            <label for="images">Kuvat:</label>
            <input
              type="file"
              id="images"
              multiple
              @change="handleImageUpload"
              accept="image/*"
            />

            <div v-if="imagePreviews.length > 0" class="image-previews">
              <div
                v-for="(preview, index) in imagePreviews"
                :key="index"
                class="preview-item"
              >
                <img
                  :src="preview"
                  alt="Kuvan esikatselu"
                  class="preview-image"
                />
                <button
                  type="button"
                  @click="removeImage(index)"
                  class="remove-image-button"
                >
                  X
                </button>
              </div>
            </div>
          </div>

          <button type="submit" class="button" :disabled="isUploading">
            <span v-if="isUploading">Ladataan...</span>
            <span v-else>Julkaise</span>
          </button>
        </form>
      </div>
    </div>

    <p class="text-2xl text-m05beige">Kaikki julkaisut</p>
    <div v-if="posts.length > 0" class="post-list">
      <div
        v-for="p in posts"
        :key="p.id"
        class="post-item border-1 border-b border-black pb-4"
      >
        <div v-if="p.images && p.images.length > 0" class="post-images">
          <img
            v-for="(image, index) in p.images"
            :key="index"
            :src="image"
            alt="Julkaisun kuva"
            class="post-image"
          />
        </div>
        <p class="text-sm">{{ formatDate(p.createdAt, true) }}</p>
        <p class="py-4">{{ p.text }}</p>
        <h3 class="font-semibold">-{{ p.publisher }}</h3>
      </div>
    </div>
    <p v-else>Ei julkaisuja.</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { db } from "@/utils/firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";

const post = ref({
  publisher: "",
  text: "",
});

const posts = ref([]);
const selectedImages = ref([]);
const imagePreviews = ref([]);
const isUploading = ref(false);
const showModal = ref(false);

const handleImageUpload = (event) => {
  const files = Array.from(event.target.files);
  selectedImages.value = files;

  imagePreviews.value = files.map((file) => URL.createObjectURL(file));
};

const removeImage = (index) => {
  selectedImages.value.splice(index, 1);
  imagePreviews.value.splice(index, 1);

  const fileInput = document.getElementById("images");
  if (fileInput) {
    fileInput.value = null;
  }
};

const submitPost = async () => {
  if (!post.value.publisher || !post.value.text) {
    alert("Anna julkaisijan nimi ja teksti.");
    return;
  }

  isUploading.value = true;

  try {
    const base64Images = await convertImagesToBase64();

    await addDoc(collection(db, "posts"), {
      publisher: post.value.publisher,
      text: post.value.text,
      images: base64Images,
      createdAt: new Date(),
    });

    post.value.publisher = "";
    post.value.text = "";
    selectedImages.value = [];
    imagePreviews.value = [];
    document.getElementById("images").value = null;
    closeModal();
  } catch (e) {
    console.error("Virhe julkaisun lisäämisessä: ", e);
    alert("Virhe julkaisun luomisessa.");
  } finally {
    isUploading.value = false;
  }
};

const convertImagesToBase64 = async () => {
  if (selectedImages.value.length === 0) {
    return [];
  }

  const compressedImages = await Promise.all(
    selectedImages.value.map((file) => compressImage(file))
  );

  const base64Promises = compressedImages.map((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  });

  return Promise.all(base64Promises);
};

const compressImage = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const MAX_WIDTH = 1000;
        const MAX_HEIGHT = 1000;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = height * (MAX_WIDTH / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = width * (MAX_HEIGHT / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);

        let quality = 0.8;
        let dataUrl;
        let compressedFile;

        do {
          dataUrl = canvas.toDataURL("image/jpeg", quality);
          compressedFile = dataURLtoFile(dataUrl, file.name);
          quality -= 0.05;
        } while (compressedFile.size > 200000 && quality > 0.1);

        resolve(compressedFile);
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

const dataURLtoFile = (dataurl, filename) => {
  const arr = dataurl.split(",");
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};

// Funktio päivämäärän ja kellonajan muotoiluun suomalaiseen muotoon
const formatDate = (dateValue, includeTime = false) => {
  if (!dateValue) return "Päivämäärää ei saatavilla";

  let date;
  if (dateValue.toDate) {
    date = dateValue.toDate();
  } else {
    return "Virheellinen päivämäärä";
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  let formattedDate = `${day}.${month}.${year}`;

  if (includeTime) {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    formattedDate += ` ${hours}:${minutes}`;
  }

  return formattedDate;
};

const fetchPosts = () => {
  const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));

  onSnapshot(q, (snapshot) => {
    posts.value = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  });
};

const openModal = () => {
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

onMounted(() => {
  fetchPosts();
});
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 1rem;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: 8px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.form-group input,
.form-group textarea {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.image-previews {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1rem;
}

.preview-item {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #ccc;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-image-button {
  position: absolute;
  top: 5px;
  right: 5px;
  background-color: rgba(255, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.8rem;
}

.remove-image-button:hover {
  background-color: rgba(255, 0, 0, 1);
}

.button {
  padding: 0.75rem 1.5rem;
  background-color: #3b552e;
  color: #d7c6a0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  transition: background-color 0.3s;
}

.button:hover:not(:disabled) {
  background-color: #78885f;
}

.button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.create-post-button {
  margin-bottom: 1rem;
}

hr {
  margin: 2rem 0;
  border-color: #ccc;
}

.post-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.post-item {
}

.post-images {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.post-image {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
}

/* Uudet tyylit modaalille */
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
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 90%;
  max-width: 600px;
  position: relative;
}

.close-modal-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #333;
}
</style>
