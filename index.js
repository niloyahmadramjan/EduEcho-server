const express = require('express');
const app = express();
const cors = require('cors');

const port = process.env.PORT || 3000;

// Midleware 
app.use(express.json());
app.use(cors())


app.get("/",(req,res)=>{
    res.send(`EduEcho server is running on ${port}`)
})

app.listen(port,()=>{
    console.log(`server is running on ${port}`)
})