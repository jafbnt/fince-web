import axios, { AxiosError, type AxiosRequestConfig, type AxiosInstance } from "axios"
import { AUTH_TOKEN_STORAGE_KEY } from "@/app/auth/types"

type SuccessCallback<TResponse> = (data: TResponse) => void
type ErrorCallback<TError> = (error: TError) => void
type FinallyCallback = () => void

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3340"

export class ClientHttp {
  private readonly client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        "Content-Type": "application/json",
      },
    })

    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)

      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }

      return config
    })
  }

  private async request<TResponse, TError>(
    config: AxiosRequestConfig,
    onSuccess: SuccessCallback<TResponse>,
    onError: ErrorCallback<TError>,
    onFinally: FinallyCallback,
  ): Promise<void> {
    try {
      const response = await this.client.request<TResponse>(config)
      onSuccess(response.data)
    } catch (error) {
      const axiosError = error as AxiosError<TError>
      const fallbackError = { message: "Erro inesperado na requisição." } as TError
      onError(axiosError.response?.data ?? fallbackError)
    } finally {
      onFinally()
    }
  }

  async get<TResponse, TError>(
    url: string,
    onSuccess: SuccessCallback<TResponse>,
    onError: ErrorCallback<TError>,
    onFinally: FinallyCallback,
  ): Promise<void> {
    await this.request<TResponse, TError>({ method: "GET", url }, onSuccess, onError, onFinally)
  }

  async post<TResponse, TError, TPayload>(
    url: string,
    payload: TPayload,
    onSuccess: SuccessCallback<TResponse>,
    onError: ErrorCallback<TError>,
    onFinally: FinallyCallback,
  ): Promise<void> {
    await this.request<TResponse, TError>(
      { method: "POST", url, data: payload },
      onSuccess,
      onError,
      onFinally,
    )
  }

  async put<TResponse, TError, TPayload>(
    url: string,
    payload: TPayload,
    onSuccess: SuccessCallback<TResponse>,
    onError: ErrorCallback<TError>,
    onFinally: FinallyCallback,
  ): Promise<void> {
    await this.request<TResponse, TError>(
      { method: "PUT", url, data: payload },
      onSuccess,
      onError,
      onFinally,
    )
  }

  async patch<TResponse, TError, TPayload>(
    url: string,
    payload: TPayload,
    onSuccess: SuccessCallback<TResponse>,
    onError: ErrorCallback<TError>,
    onFinally: FinallyCallback,
  ): Promise<void> {
    await this.request<TResponse, TError>(
      { method: "PATCH", url, data: payload },
      onSuccess,
      onError,
      onFinally,
    )
  }

  async delete<TResponse, TError>(
    url: string,
    onSuccess: SuccessCallback<TResponse>,
    onError: ErrorCallback<TError>,
    onFinally: FinallyCallback,
  ): Promise<void> {
    await this.request<TResponse, TError>({ method: "DELETE", url }, onSuccess, onError, onFinally)
  }
}
