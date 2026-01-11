import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    role: null, // 'ADMIN' | 'USER' | null
    me: null
  }),
  actions: {
    setMe(me) {
      this.me = me
      this.role = me?.role || null
    },
    clear() {
      this.me = null
      this.role = null
    }
  }
})
