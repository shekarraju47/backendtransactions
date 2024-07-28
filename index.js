const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

mongoose
  .connect(
    "mongodb+srv://shekarraju8:Shekar@cluster0.qkbxoh7.mongodb.net/chat?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("DB Connetion Successfull");
  })
  .catch((err) => {
    console.log(err.message);
  });

// mongoose post method inputs types of schema
const transactionSchema = new mongoose.Schema({
  description: String,
  amount: Number,
  type: { type: String, enum: ["credit", "debit"], required: true },
  date: { type: Date, default: Date.now },
  balance: Number,
});

const Transaction = mongoose.model("Transaction", transactionSchema);

app.get("/", (req, res) => {
  res.json({ msg: "hello world" });
});

// Get all transactions
app.get("/api/transactions", async (req, res) => {
  const transactions = await Transaction.find();
  res.json(transactions);
});

// Add a new transaction and calculate the balance
app.post("/api/transactions", async (req, res) => {
  const transactions = await Transaction.find().sort({ date: 1 });
  let balance =
    transactions.length > 0 ? transactions[transactions.length - 1].balance : 0;

  const { description, amount, type } = req.body;
  balance = type === "credit" ? balance + amount : balance - amount;

  const transaction = new Transaction({ description, amount, type, balance });
  await transaction.save();
  res.json(transaction);
});

app.delete("/api/delete/:id", async (req, res) => {
  try {
    await Transaction.findByIdAndDelete({ _id: req.params.id });
    res.status(200).send("delete SuccessFull");
  } catch (error) {
    res.status(400).send("something wrong");
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
