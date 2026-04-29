require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();



console.log("ENV CHECK:", process.env.MONGO_URI);
const app = express();
app.use(cors());
app.use(express.json());
app.use(cors({
  origin: "*"
}));
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.log("❌ MongoDB connection error:", err));

// ====== SCHEMAS ======
const clientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  passport: String,
  departure: String,
  returnDate: String,
  travellers: { type: Number, default: 1 },
  package: String,
  batchId: String,
  status: { type: String, enum: ['Paid', 'Partial', 'Unpaid', 'Installment'], default: 'Unpaid' },
  paid: { type: Number, default: 0 },
  paymentType: { type: String, default: 'full' },
  installments: [{
    date: String,
    amount: Number,
    status: { type: String, enum: ['pending', 'paid', 'overdue'], default: 'pending' }
  }],
  notes: String,
  costs: {
    flight: Number, hotel: Number, monuments: Number, transport: Number,
    gifts: Number, events: Number, meals: Number, insurance: Number,
    visa: Number, other: Number
  },
  totalPerPerson: Number,
  total: Number,
  sellingPrice: Number,
  costPrice: Number,
  commission: Number,
  otherIncome: Number,
  profit: Number
}, { timestamps: true });

const batchSchema = new mongoose.Schema({
  name: { type: String, required: true },
  month: String,
  departure: String,
  returnDate: String,
  capacity: { type: Number, default: 20 },
  notes: String
}, { timestamps: true });

const expenseSchema = new mongoose.Schema({
  desc: { type: String, required: true },
  category: String,
  amount: { type: Number, required: true },
  date: String,
  batchId: String,
  ref: String
}, { timestamps: true });

const Client = mongoose.model('Client', clientSchema);
const Batch = mongoose.model('Batch', batchSchema);
const Expense = mongoose.model('Expense', expenseSchema);

// ====== CLIENT ROUTES ======
app.get('/api/clients', async (req, res) => {
  try {
    const clients = await Client.find().sort({ createdAt: -1 });
    res.json(clients);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/clients', async (req, res) => {
  try {
    const client = new Client(req.body);
    await client.save();
    res.status(201).json(client);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

app.put('/api/clients/:id', async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!client) return res.status(404).json({ error: 'Client not found' });
    res.json(client);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

app.delete('/api/clients/:id', async (req, res) => {
  try {
    await Client.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ====== BATCH ROUTES ======
app.get('/api/batches', async (req, res) => {
  try {
    const batches = await Batch.find().sort({ createdAt: -1 });
    res.json(batches);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/batches', async (req, res) => {
  try {
    const batch = new Batch(req.body);
    await batch.save();
    res.status(201).json(batch);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

app.put('/api/batches/:id', async (req, res) => {
  try {
    const batch = await Batch.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!batch) return res.status(404).json({ error: 'Batch not found' });
    res.json(batch);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

app.delete('/api/batches/:id', async (req, res) => {
  try {
    await Batch.findByIdAndDelete(req.params.id);
    // Unlink clients from this batch
    await Client.updateMany({ batchId: req.params.id }, { $set: { batchId: '' } });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ====== EXPENSE ROUTES ======
app.get('/api/expenses', async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ createdAt: -1 });
    res.json(expenses);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/expenses', async (req, res) => {
  try {
    const expense = new Expense(req.body);
    await expense.save();
    res.status(201).json(expense);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

app.delete('/api/expenses/:id', async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "VoyageFinance API is live 🚀"
  });
});
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});