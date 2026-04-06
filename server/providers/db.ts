//Đây là một đoạn code kết nối MongoDB bằng mongoose, đồng thời tự động thử lại nếu kết nối thất bại.
import mongoose from 'mongoose'

require('dotenv').config()

const dbUrl = process.env.MONGO_URI || ''

const connectDB = async () => {
  try {
    await mongoose.connect(dbUrl).then((data: any) => {
      console.log(`Database connected with ${data.connection.host}`)
    })
  } catch (error: any) {
    console.log(`Error connect database: ${error.message}`)
    setTimeout(connectDB, 5000)
  }
}

export default connectDB
