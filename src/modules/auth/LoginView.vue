<template>
  <div class="login-container">
    <div class="login-card">
      <h1>Gestor Financiero</h1>
      <p>Iniciar sesión</p>
      <button class="google-btn" @click="handleLogin">
        <img
          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
          alt="Google"
        />
        Inicia con Google
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import router from '@/router'
import { useAuthStore } from './auth.store'
import { loginWithGoogle } from './firebaseAuth'

const authStore = useAuthStore()

const handleLogin = async () => {
  try {
    const user = await loginWithGoogle()
    authStore.setUser(user)
    localStorage.setItem('user', JSON.stringify(user))
    router.push('/')
  } catch (e) {
    alert('Error al iniciar sesión')
  }
}
</script>

<style lang="scss" scoped>
.login-container {
  background-image:
    linear-gradient(
      to bottom,
      rgba(255, 255, 255, 0.2),
      rgba(245, 247, 250, 0.92)
    ),
    url('../../../assets/background.jpeg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  font-family: $font;

  .login-card {
    background: white;
    padding: 30px;
    border-radius: 16px;
    text-align: center;
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
    width: 100%;
    width: 350px;
    height: 350px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    h1 {
      font-size: 22px;
      font-weight: 400;
      margin-bottom: 8px;
    }

    p {
      font-size: 14px;
      color: #555;
      margin-bottom: 24px;
    }

    .google-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      background-color: white;
      color: #444;
      border: 1px solid #ccc;
      padding: 12px;
      border-radius: 8px;
      font-weight: 400;
      cursor: pointer;
      width: 100%;
      transition:
        background 0.3s,
        transform 0.1s ease-in-out,
        box-shadow 0.2s;

      img {
        width: 20px;
        height: 20px;
      }

      &:hover {
        background-color: #f3f3f3;
      }

      &:active {
        transform: scale(0.97);
        box-shadow: 0 0 0 2px rgba(123, 44, 191, 0.2);
      }
    }
  }
}
</style>
