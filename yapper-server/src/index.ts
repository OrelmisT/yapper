import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const PORT = 3000;


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
})

console.log("Hello, Yapper!")