import axios from 'axios'
import { supabase } from './supabase'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({
    baseURL: API_URL,
    timeout: 120000,  // 120 s — first-run JIT compilation can be slow
})

// Request interceptor to add Supabase JWT
api.interceptors.request.use(async (config) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`
    }
    return config
})

export const analyzeImage = async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post('/analyze-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
}

export const assessRisk = async (answers) => {
    const response = await api.post('/risk-score', { answers })
    return response.data
}

export const simulateScam = async (scamType) => {
    const response = await api.post('/simulate-scam', { scam_type: scamType })
    return response.data
}

export default api
