import { IDailySuggestion } from "@/features/dashboard/types"
import { AuthorizedAxios } from "@/libs/apis/authorizedAxios"

interface ApiResponse<T = unknown> {
  success: boolean
  data: T
  message: string
}

export const getDailySuggestion = async () => {
  const res = await AuthorizedAxios.get<ApiResponse<IDailySuggestion>>('/daily-suggestion/today')
  return res.data
}