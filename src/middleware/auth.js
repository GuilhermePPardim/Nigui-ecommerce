// src/middleware/auth.js

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// Middleware para verificar o token JWT enviado na requisição
function authenticateToken(req, res, next) {
    // 1. Procura pelo cabeçalho de autorização na requisição.
    const authHeader = req.headers['authorization'];
    // 2. O cabeçalho deve ser no formato "Bearer TOKEN". Extraímos apenas o token.
    const token = authHeader && authHeader.split(' ')[1];

    // 3. Se não houver token, retorna um erro 401 (Não Autorizado).
    if (token == null) {
        return res.status(401).json({ message: 'Token de autenticação não fornecido.' });
    }

    // 4. Verifica se o token é válido usando a nossa chave secreta.
    jwt.verify(token, JWT_SECRET, (err, user) => {
        // 5. Se o token for inválido ou expirado, retorna um erro 403 (Proibido).
        if (err) {
            return res.status(403).json({ message: 'Token inválido ou expirado.' });
        }

        // 6. Se o token for válido, adicionamos os dados do utilizador (payload do token) ao objeto `req`.
        // Assim, as próximas rotas terão acesso a `req.user`.
        req.user = user;

        // 7. Chama a próxima função/middleware na cadeia.
        next();
    });
}

// Middleware para verificar se o utilizador tem uma role específica (ex: 'admin')
function authorizeRole(role) {
    return (req, res, next) => {
        // 1. Verifica se a role do utilizador (adicionada pelo middleware `authenticateToken`)
        //    corresponde à role necessária para aceder à rota.
        if (req.user && req.user.role === role) {
            // 2. Se a role for a correta, permite que a requisição continue.
            next();
        } else {
            // 3. Se não, retorna um erro 403 (Proibido).
            res.status(403).json({ message: 'Acesso negado. Permissões insuficientes.' });
        }
    };
}

// Exporta as funções para que possamos usá-las no server.js
module.exports = {
    authenticateToken,
    authorizeRole,
};
