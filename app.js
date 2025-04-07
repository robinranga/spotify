
import express from "express";
import fs from "fs/promises"
import path from "path";

const app = express();

app.set('view engine', 'ejs');
app.use(express.static('Public'))

let data = {};
const folders = await fs.readdir('./Public/Songs')

for (const folder of folders) {
    let info = await fs.readFile(`./Public/Songs/${folder}/info.json`)
    data[info] = await fs.readdir(`./Public/Songs/${folder}`)
}


app.get('/', (req, res) => {
    res.render('index')
})

app.get('/get-songs', (req, res) => {
    res.json(data)
})

app.get('/account', (req, res) => {
    res.render('account')
})

app.listen(3000)