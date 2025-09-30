
const express = require('express');
const db = require('./database');
const bcrypt = require('bcryptjs'); // Corrigido: 'bcrypt' em vez de 'brypt'
const jwt = require('jsonwebtoken');
const { authenticateToken, authorizeRole } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

app.use(express.json());

app.post('/api/register', async (req, res) => {

    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios: nome, email e senha.' });
    }
    try {
        const userExists = await db.getAsync('SELECT * FROM users WHERE email = ?', [email]);
        if (userExists) {
            return res.status(409).json({ message: 'Email já cadastrado.' });
        } 
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);
        const userRole = role === 'admin' ? 'admin' : 'customer'; 
        await db.runAsync(
            'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
            [name, email, password_hash, userRole]
        );
        res.status(201).json({ message: 'Usuário registrado com sucesso!', role: userRole });

    } catch (error) {
        console.error('Erro ao registrar usuário:', error.message);
        res.status(500).json({ message: 'Erro interno do servidor.' });'message'
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
    }
    try {
        const user = await db.getAsync('SELECT * FROM users WHERE email = ?', [email]); // 
        if (!user) {
            return res.status(400).json({ message: 'Credenciais inválidas.' });
        }
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(400).json({ message: 'Credenciais inválidas.' });
        }
        const token = jwt.sign(
            { id: user.id, role: user.role },
            JWT_SECRET,                      
            { expiresIn: '1h' }              
        );
        res.json({ message: 'Login realizado com sucesso!', token, user: { id: user.id, name: user.name, role: user.role } });

    } catch (error) {
        console.error('Erro ao fazer login:', error.message);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

app.get('/', (req, res) => {
    res.send('Bem-vindo à TechStore API!');
});

app.get('/api/products', async (req, res) =>{
    try {
        const products = await new Promise((resolve, reject) =>{
            db.all('SELECT * FROM products', [], (err, rows) =>{
                if (err) reject(err);
                resolve(rows);
            });
        });
        res.json(products);
    }catch (error){
        console.error('ERRO de listar produtos', error.message);
        res.status(500).json({massage:'erro interno no servidor.'});
    }
});


app.post('/api/products', authenticateToken, authorizeRole('admin'), async(req, res) =>{
    const{name, description, price, stock, image_url} = req.body;

    if (!name || price){
        return res.status(400).json({massage: 'Nome e preço são obrigatorios'});
    }
    try{
        const lastID = await db.runAsync(
            'INSERT INTO products(name, description, price, stock, imagem_url)' VAlUES (?, ?, ?, ?, ?)
            [name, description, price, stock || 0, image_url]
        );
        res.status(201).json({massage: 'Produto adicionado com sucesso!', products: lastID});

    } catch(error){
        console.log('ERRO ao adicionar produto: ', error.massage);
        res.status(500).json({massage: 'ERRO interno no servidor. '});

    }
});


app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesse: http://localhost:${PORT}`);
});
