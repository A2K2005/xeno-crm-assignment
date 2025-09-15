const mongoose = require('mongoose');

const connectDatabase = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set');
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 10
  });
  const { host, name } = mongoose.connection;
  console.log(`Mongo connected -> host: ${host}, db: ${name}`);
};

module.exports = { connectDatabase };


