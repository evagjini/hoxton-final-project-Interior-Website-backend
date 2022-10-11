import  express  from "express";
import cors from 'cors'



const app = express()
app.use(cors())
app.use(express.json())

const port = 5666






app.listen(port, () =>{
    console.log(`yay: http://localhost:${port}`)
})