import { app } from "./app"
import connectDB from "./providers/db"
require('dotenv').config()

const PORT = process.env.PORT || 8000

// Create server
app.listen(PORT, () => {
  connectDB()
    .then(() => {
      console.log(`Server is running on port http://localhost:${PORT}`)
    })
    .catch((err) => {
      console.log(err)
    })
})