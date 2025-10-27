const express = require('express');
const app = express();
require('dotenv').config();
const connectDB = require('./config/db')
const cors = require('cors');
const authRoutes = require('./routes/auth')
const issueRoutes = require('./routes/issue');
const adminIssueRoutes = require('./routes/admin');
const path = require('path');
connectDB();

app.get('/ping',(req,res)=>{
    res.send('pong');
})

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/issues', adminIssueRoutes);

const port = process.env.PORT;
app.listen(port,(req,res)=>{
    console.log(`app is listening on port ${port}`);
})

