import axios from "axios"
import { toast } from "react-hot-toast"

// Global flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false
let failedQueue: any[] = []

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BASE_URL,
    timeout: 30000, // 30 seconds timeout
})

// Detect if a message from API is in French
function detectLang(text: string): "fr" | "en" {
    const frenchWords = ["le", "la", "une", "pas", "de", "pour", "avec", "et", "sur"]
    const lower = text?.toLowerCase() || ""
    const score = frenchWords.filter((w) => lower.includes(w)).length
    return score > 2 ? "fr" : "en"
}

api.interceptors.request.use((config) => {
    // Don't add token to login/auth endpoints or password-reset endpoints
    const isAuthEndpoint = config.url?.includes('auth/login') || config.url?.includes('auth/refresh') || config.url?.includes('auth/password-reset')

    if (!isAuthEndpoint) {
        const token = localStorage.getItem("access_token")
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
            console.log("🔐 Adding Bearer token to request:", config.url, "(token length:", token.length + ")")
        } else {
            console.log("⚠️ No access token found for request:", config.url)
        }
    } else {
        console.log("🔐 Skipping token for auth endpoint:", config.url)
    }

    return config
})

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config

        // 🔁 Handle token refresh for 401 errors
        if (error.response?.status === 401 && !original._retry) {
            console.log("🔐 401 Error detected for:", original.url)
            console.log("🔐 Full error response:", error.response?.data)

            // If already refreshing, queue this request
            if (isRefreshing) {
                console.log("🔐 Already refreshing, queuing request")
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject })
                }).then(() => {
                    return api(original)
                }).catch(err => {
                    return Promise.reject(err)
                })
            }

            original._retry = true
            isRefreshing = true

            const errorMessage = error.response?.data?.details || error.response?.data?.detail || error.response?.data?.error || error.response?.data?.message || ""
            console.log("🔐 Error message:", errorMessage)

            // For 401 errors, we should always attempt refresh regardless of error message
            console.log("🔐 Attempting token refresh for 401 error")

            const refresh = localStorage.getItem("refresh_token")
            console.log("🔐 Attempting token refresh, refresh token exists:", !!refresh)

            if (!refresh) {
                console.log("🔐 No refresh token available, clearing auth and redirecting")
                // No refresh token, clear everything and redirect
                localStorage.clear()
                document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
                document.cookie = "refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
                window.location.href = "/login"
                return Promise.reject(new Error("No refresh token available"))
            }

            console.log("🔐 Calling refresh endpoint:", `${process.env.NEXT_PUBLIC_BASE_URL}auth/refresh`)

            return axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}auth/refresh`, { refresh })
                .then(response => {
                    console.log("🔐 Refresh response:", response.data)
                    const newToken = response.data.access || response.data.token

                    if (!newToken) {
                        throw new Error("No access token in refresh response")
                    }

                    console.log("🔐 Refresh successful, updating tokens")

                    // Update both localStorage and cookies
                    localStorage.setItem("access_token", newToken)
                    const isProduction = process.env.NODE_ENV === 'production'
                    const cookieOptions = isProduction
                        ? 'path=/; max-age=604800; secure; samesite=strict'
                        : 'path=/; max-age=604800; samesite=strict'
                    document.cookie = `access_token=${newToken}; ${cookieOptions}`

                    // Update authorization header for future requests
                    api.defaults.headers.Authorization = `Bearer ${newToken}`

                    // Process queued requests
                    failedQueue.forEach(({ resolve }) => {
                        resolve()
                    })
                    failedQueue = []
                    isRefreshing = false

                    // Retry the original request
                    original.headers.Authorization = `Bearer ${newToken}`
                    return api(original)
                })
                .catch(refreshError => {
                    console.log("🔐 Token refresh failed:", refreshError?.response?.data || refreshError.message)

                    // Check if refresh token is also invalid (401 from refresh endpoint)
                    if (refreshError?.response?.status === 401) {
                        console.log("🔐 Refresh token is also invalid - user needs to login again")
                    }

                    // Reject all queued requests
                    failedQueue.forEach(({ reject }) => {
                        reject(refreshError)
                    })
                    failedQueue = []

                    // Token refresh failed - clear tokens and redirect to login
                    localStorage.clear()
                    document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
                    document.cookie = "refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
                    console.log("🔐 Redirecting to login due to refresh failure")
                    isRefreshing = false
                    window.location.href = "/login"
                    return Promise.reject(refreshError)
                })
        }

        // 🚫 Handle permission errors (403) - logout immediately
        if (error.response?.status === 403) {
            const errorMessage = error.response?.data?.details || error.response?.data?.detail || error.response?.data?.error || ""
            const isPermissionError =
                errorMessage.includes("You do not have permission to perform this action") ||
                errorMessage.includes("Permission denied") ||
                errorMessage.includes("Forbidden")

            if (isPermissionError) {
                // Clear all auth data and redirect to login
                localStorage.clear()
                document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
                document.cookie = "refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
                window.location.href = "/login"
                return Promise.reject(error)
            }
        }

        // 🌐 Handle network errors (no response from server)
        if (!error.response) {
            const userLang = navigator.language.startsWith("fr") ? "fr" : "en"
            const networkErrorMsg = userLang === "fr"
                ? "Erreur de connexion. Vérifiez votre connexion internet et réessayez."
                : "Connection error. Check your internet connection and try again."

            toast.error(networkErrorMsg, {
                style: {
                    direction: "ltr",
                    fontFamily: "sans-serif",
                },
            })
            return Promise.reject(error)
        }

        // 🚫 Handle 404 Not Found errors
        if (error.response?.status === 404) {
            const notFoundMsg = "Page ou ressource non trouvée. Vérifiez l'URL et réessayez."
            toast.error(notFoundMsg, {
                style: {
                    direction: "ltr",
                    fontFamily: "sans-serif",
                },
            })
            return Promise.reject(error)
        }

        // 💥 Handle 500+ Server errors
        if (error.response?.status >= 500) {
            const serverErrorMsg = "Erreur serveur interne. Le problème a été signalé, veuillez réessayer plus tard."
            toast.error(serverErrorMsg, {
                style: {
                    direction: "ltr",
                    fontFamily: "sans-serif",
                },
            })
            return Promise.reject(error)
        }

        // 🌍 Smart language-aware error display
        const userLang = navigator.language.startsWith("fr") ? "fr" : "en"
        const fallback =
            userLang === "fr"
                ? "Une erreur est survenue. Veuillez réessayer."
                : "An unexpected error occurred. Please try again."

        const backendMsg =
            error.response?.data?.detail ||
            error.response?.data?.details ||
            error.response?.data?.error ||
            error.response?.data?.message ||
            (typeof error.response?.data === "string" ? error.response.data : fallback)

        const backendLang = detectLang(backendMsg)

        // Don't show toast for authentication errors that are being handled
        if (error.response?.status !== 401 || !original._retry) {
            toast.error(backendMsg, {
                style: {
                    direction: "ltr",
                    fontFamily: "sans-serif",
                },
            })
        }

        return Promise.reject(error)
    },
)

export default api
