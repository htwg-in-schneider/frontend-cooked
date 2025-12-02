// src/data.js
import img1 from '@/assets/essen1.webp'
import img2 from '@/assets/essen2.webp'
import img3 from '@/assets/essen3.webp'

export const products = [
  {
    id: 1,
    title: 'Marry Me Chicken Ramen',
    category: 'ASIATISCH',
    time: '1h40',
    image: img1,
    description: 'Ein cremiges Nudelgericht mit Hähnchen, das so gut schmeckt, dass man sofort einen Heiratsantrag bekommt!'
  },
  {
    id: 2,
    title: 'Kartoffelwedges mit Gurkensalat',
    category: 'VEGETARISCH',
    time: '1h20',
    image: img2,
    description: 'Knusprige Kartoffelspalten aus dem Ofen, serviert mit einem frischen, dilligen Gurkensalat.'
  },
  {
    id: 3,
    title: 'Spaghetti Bolognese',
    category: 'ITALIENISCH',
    time: '1h',
    image: img3,
    description: 'Der Klassiker schlechthin. Fruchtige Tomatensoße, Hackfleisch und viel Liebe.'
  }
]