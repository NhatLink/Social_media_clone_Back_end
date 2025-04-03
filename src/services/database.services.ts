import { MongoClient, ServerApiVersion } from 'mongodb'
import { config } from 'dotenv'
config()
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASS}@socialmedia.9regswy.mongodb.net/?retryWrites=true&w=majority&appName=SocialMedia`

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true
//   }
// })

// export async function run() {
//   try {
//     // Connect the client to the server	(optional starting in v4.7)
//     await client.connect()
//     // Send a ping to confirm a successful connection
//     await client.db('admin').command({ ping: 1 })
//     console.log('Pinged your deployment. You successfully connected to MongoDB!')
//   } finally {
//     // Ensures that the client will close when you finish/error
//     await client.close()
//   }
// }
// run().catch(console.dir)

class DatabaseService {
  private client: MongoClient
  constructor() {
    this.client = new MongoClient(uri) // 👉 Lưu đối tượng MongoClient trong class
  }

  async connect() {
    try {
      await this.client.db('admin').command({ ping: 1 })
      console.log("'Pinged your deployment. You successfully connected to MongoDB!'")
    } catch (error) {
      console.error('Lỗi kết nối MongoDB:', error)
    } finally {
      await this.client.close()
    }
  }

  async close() {
    await this.client.close()
    console.log('🔌 Đã đóng kết nối MongoDB.')
  }
}

const databaseService = new DatabaseService()
export default databaseService
