const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

require('./database'); 

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Bem-vindo à TechStore API!');
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesse: http://localhost:${PORT}`);
});