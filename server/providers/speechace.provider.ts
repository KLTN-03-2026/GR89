import axios from "axios"
import ErrorHandler from "../utils/ErrorHandler"
import FormData from "form-data"

// Tham số đầu vào chấm điểm phát âm
interface AssessParams {
  referenceText: string // Văn bản đối chiếu
  audioBuffer: Buffer // Buffer âm thanh
  language?: string // Ngôn ngữ
}

export class SpeechAceProvider {
  private readonly API_KEY: string
  private readonly BASE_URL = process.env.SPEECHACE_BASE_URL || 'https://api.speechace.co'


  constructor() {
    const apiKey = process.env.SPEECHACE_API_KEY || ''
    if (!apiKey) {
      throw new ErrorHandler('Speechace api key không tồn tại', 500)
    }
    else {
      this.API_KEY = apiKey
    }
  }

  async assessGuidedPronunciation(params: AssessParams): Promise<any> {
    const { referenceText, audioBuffer, language = 'en-gb' } = params

    if (!referenceText || !referenceText.trim()) {
      throw new ErrorHandler('Văn bản đối chiếu không được để trống', 400)
    }
    if (!audioBuffer || audioBuffer.length === 0) {
      throw new ErrorHandler('Vui lòng ghi âm lại và thử lại', 400)
    }

    const endpoint = '/api/scoring/text/v9/json'
    const url = new URL(`${this.BASE_URL}${endpoint}`)
    url.searchParams.append('key', this.API_KEY)
    url.searchParams.append('dialect', language)

    const formData = new FormData()
    formData.append('user_audio_file', audioBuffer, {
      filename: 'audio.wav', contentType: 'audio/wav'
    })
    formData.append('text', referenceText)
    formData.append('detect_dialect', 1)
    formData.append('enforce_dialect', 1)


    const headers = formData.getHeaders()
    return await axios.post(url.toString(), formData, { headers })
      .then(response => {
        return response.data
      })
      .catch(() => {
        throw new ErrorHandler('Lỗi khi chấm điểm phát âm qua', 500)
      })
  }
}