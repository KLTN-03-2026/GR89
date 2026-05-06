import connectDB from './providers/db'
import { server } from './socket'

require('dotenv').config()

const PORT = process.env.PORT || 8000

server.listen(PORT, () => {
  connectDB()
    .then(() => {
      console.log(`Server is running on port http://localhost:${PORT}`)
    })
    .catch((err) => {
      console.log(err)
    })
})
