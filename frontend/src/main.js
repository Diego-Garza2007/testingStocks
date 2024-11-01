import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import './scss/Stocks.scss'
import './scss/Reset.scss'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
