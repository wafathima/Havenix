// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import tailwindcss from '@tailwindcss/vite'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react(),
//   tailwindcss(),
//   ],
//   server:{
//     port:4000
//   }
// })
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  server: {
    port: 4000,
    proxy: {
      '/api': {
        target: 'https://havenix-backend.onrender.com',
        changeOrigin: true,
        secure: true,
      }
    }
  },

  define: {
    'process.env': {}
  }
})
})
