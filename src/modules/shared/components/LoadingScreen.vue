<template>
  <div class="loading-screen">
    <div class="spinner"></div>
    <p>Cargando...</p>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.loading-screen {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #ffffff;

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #ccc;
    border-top: 4px solid #7a5fff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 12px;
  }

  p {
    font-size: 1.1rem;
    color: #555;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
}
</style>
