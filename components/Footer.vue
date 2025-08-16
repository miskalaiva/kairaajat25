<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-section about">
          <h2 class="text-xl font-bold">Kairankesyttäjät</h2>
          <!-- <p class="mt-2">Tekstiä</p> -->
          <div class="contact-info">
            <p>Sähköposti: tulossa</p>
          </div>
        </div>
        <div class="footer-section links">
          <h2 class="text-xl font-bold">Linkit</h2>
          <ul class="mt-2">
            <li><NuxtLink to="/">Etusivu</NuxtLink></li>
            <li><NuxtLink to="/julkaisut">Julkaisut</NuxtLink></li>
            <li><NuxtLink to="/tapahtumat">Tapahtumat</NuxtLink></li>
          </ul>
        </div>
        <div class="footer-section social">
          <h2 class="text-xl font-bold">Seuraa meitä</h2>
          <div class="social-links mt-2">
            <a
              href="https://www.instagram.com/kairankesyttajat/"
              target="_blank"
            >
              <p>Instagram</p>
            </a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <p>
          &copy; {{ new Date().getFullYear() }} Kairankesyttäjät. Kaikki
          oikeudet pidätetään.
        </p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background-color: #000000; /* tumma vihreä */
  color: #d7c6a0; /* beige */
  padding: 1rem 1rem 3rem;
  margin-top: auto; /* Push footer to the bottom */
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.footer-content {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 2rem;
  border-bottom: 1px solid rgba(215, 198, 160, 0.3);
  padding-bottom: 2rem;
}

.footer-section h2 {
  color: #d7c6a0;
  margin-bottom: 1rem;
}

.footer-section p {
  color: #d7c6a0;
  line-height: 1.6;
}

.footer-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-section a {
  color: #d7c6a0;
  text-decoration: none;
  transition: color 0.3s ease;
  line-height: 2;
}

.footer-section a:hover {
  color: #78885f;
}

.social-links {
  display: flex;
  gap: 1rem;
}

.footer-bottom {
  text-align: center;
  margin-top: 1.5rem;
  color: #d7c6a0;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
    text-align: center;
  }

  .social-links {
    justify-content: center;
  }
}
</style>
