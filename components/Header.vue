<template>
  <header class="header">
    <nav class="container">
      <NuxtLink to="/" class="logo">
        <h1
          class="md:text-4xl logo-text text-3xl font-extrabold mb-2 tracking-wide"
        >
          Kairankesyttäjät
        </h1>
      </NuxtLink>
      <button class="menu-toggle" @click="toggleMenu">
        <div class="hamburger"></div>
        <div class="hamburger"></div>
        <div class="hamburger"></div>
      </button>

      <ul :class="['nav-links', { open: isMenuOpen }]">
        <li>
          <NuxtLink to="/" @click="closeMenu">Etusivu</NuxtLink>
        </li>
        <li>
          <NuxtLink to="/">Teltan varauskalenteri (tulossa)</NuxtLink>
        </li>
        <li>
          <NuxtLink to="/julkaisut" @click="closeMenu">Julkaisut</NuxtLink>
        </li>
        <li>
          <NuxtLink to="/tapahtumat" @click="closeMenu">Tapahtumat</NuxtLink>
        </li>
        <li>
          <NuxtLink to="/lisaatapahtuma" @click="closeMenu"
            >Lisää tapahtuma</NuxtLink
          >
        </li>
      </ul>
    </nav>
  </header>
</template>

<script setup>
import { ref } from "vue";
const isMenuOpen = ref(false);
const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};
const closeMenu = () => {
  isMenuOpen.value = false;
};
</script>

<style scoped>
.header {
  background-color: #000000; /* tumma vihreä */
  color: #d7c6a0; /* beige */
  padding: 1rem 0;
}
.container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1rem;
}
.logo {
  text-decoration: none;
}
.logo-text {
  font-size: 1.5rem;
  font-weight: bold;
  color: #d7c6a0; /* beige */
}
.nav-links {
  list-style: none;
  display: flex;
  gap: 1.5rem;
  margin: 0;
  padding: 0;
}
.nav-links a {
  color: #d7c6a0; /* beige */
  text-decoration: none;
  font-weight: bold;
  transition: color 0.3s ease;
}
.nav-links a:hover {
  color: #78885f; /* vaaleampi vihreä */
}
/* Mobiilityylit */
.menu-toggle {
  display: none; /* Piilotetaan oletuksena */
  flex-direction: column;
  justify-content: space-between;
  width: 30px;
  height: 21px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
}

.hamburger {
  width: 100%;
  height: 3px;
  background-color: #d7c6a0;
  transition: all 0.3s ease;
}
@media (max-width: 768px) {
  .header {
    padding: 1rem 0.5rem;
  }
  .container {
    flex-wrap: wrap;
    justify-content: space-between;
  }
  .menu-toggle {
    display: flex; /* Näytetään pienillä näytöillä */
  }
  .nav-links {
    display: none; /* Piilotetaan oletuksena mobiilissa */
    flex-direction: column;
    width: 100%;
    text-align: left;
    margin-top: 1rem;
    gap: 1rem;
  }
  .nav-links.open {
    display: flex; /* Näytetään, kun valikko on auki */
  }
  .nav-links li {
    width: 100%;
  }
  .nav-links a {
    display: block;
    padding: 0.5rem;
    background-color: #000000;
  }
  .nav-links a:hover {
    background-color: rgba(120, 136, 95, 0.8);
  }
}
</style>
