// src/config/api.ts

// Utilise l'URL définie dans les variables d'environnement (pour Vercel) ou fallback local
const API_CONFIG = {
    BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:8081/api'
};

export default API_CONFIG;