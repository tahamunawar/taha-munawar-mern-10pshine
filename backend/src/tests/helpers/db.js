const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// Connect to the in-memory database and return the connection
async function connectDB() {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  
  // Configure mongoose to use the MongoDB Memory Server
  await mongoose.connect(uri);
  
  return mongoose.connection;
}

// Disconnect and cleanup
async function closeDB() {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
}

// Clear all collections
async function clearDB() {
  const collections = mongoose.connection.collections;
  
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
}

module.exports = {
  connectDB,
  closeDB,
  clearDB
}; 