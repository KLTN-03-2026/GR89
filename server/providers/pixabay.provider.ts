import axios from "axios"
import ErrorHandler from "../utils/ErrorHandler"
import { Media } from "../models/media.model"
import crypto from 'crypto'

interface IPixabayImage {
  imageUrl: string
  width: number
  height: number
  format: string
  imageId: number
}

export class PixabayProvider {
  private static readonly API_KEY = process.env.PIXABAY_API_KEY || ''
  private static readonly API_URL = process.env.PIXABAY_API_URL || 'https://pixabay.com/api'


  //Tìm ảnh từ pixabay
  static async searchImages(keyword: string): Promise<IPixabayImage | null> {
    if (!this.API_KEY) {
      throw new ErrorHandler('PIXABAY_API_KEY chưa được cấu hình trong .env', 500)
    }

    try {
      // Gọi Pixabay API
      const res = await axios.get(this.API_URL, {
        params: {
          key: this.API_KEY,
          q: keyword,
          image_type: 'photo',
          orientation: 'horizontal',
          per_page: 1,
          safesearch: 'true',
          order: 'popular'
        },
        timeout: 15000
      })

      // Kiểm tra response
      const hits = res.data?.hits
      if (!hits || hits.length === 0) {
        return null
      }

      const image = hits[0] // Lấy ảnh đầu tiên

      // Lấy URL ảnh chất lượng cao nhất
      const imageUrl = image.largeImageURL ||
        image.fullHDURL ||
        image.webformatURL ||
        image.imageURL

      if (!imageUrl) {
        return null
      }

      // Lấy metadata từ Pixabay
      return {
        imageUrl,
        width: image.imageWidth || image.webformatWidth || 0,
        height: image.imageHeight || image.webformatHeight || 0,
        format: 'jpg',
        imageId: image.id
      } as IPixabayImage

    } catch {
      return null
    }
  }
}