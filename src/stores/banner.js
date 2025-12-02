import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useBannerStore = defineStore('banner', () => {
  const storedState = localStorage.getItem('bannerHidden')
  const isVisible = ref(storedState ? false : true)

  function hideBanner() {
    isVisible.value = false
    localStorage.setItem('bannerHidden', 'true')
  }

  return { isVisible, hideBanner }
})