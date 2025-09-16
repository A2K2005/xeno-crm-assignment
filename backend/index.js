const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
require('dotenv').config();
const customerRoutes = require('./routes/customer');
const orderRoutes = require('./routes/orderRoutes');
const queryRoutes = require('./routes/queryRoutes');
const segmentRoutes = require('./routes/segmentRoutes');
const queryAiRoute = require('./routes/queryAiRoute');
const mailRoutes = require('./routes/mailRoutes');
const communicationRoutes = require('./routes/communicationRoutes');



app.use(cors());
app.use(express.json());
app.use('/api/customer', customerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/query', queryRoutes);
app.use('/api/segments', segmentRoutes);
app.use('/api/ai', queryAiRoute);
app.use('/api/mail', mailRoutes);
app.use('/api/communications', communicationRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Hello World' });
});


mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Login = require('./models/Login');

app.post('/api/login', async (req, res) => {
  try {
    const { name, email } = req.body;
    console.log('Received login:', { name, email }); 

    const login = new Login({ name, email });
    await login.save();

    console.log('Saved login to DB'); 

    res.status(201).send({ message: 'Login recorded' });
  } catch (err) {
    console.error('Error saving login:', err); 
    res.status(500).send({ message: 'Error saving login' });
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
