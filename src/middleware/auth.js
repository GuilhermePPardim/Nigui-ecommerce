const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.status(401).json({ message: 'Token de autenticação não fornecido.' });
    }
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token inválido ou expirado.' });
        }
        req.user = user;

        next();
    });
}
function authorizeRole(role) {
    return (req, res, next) => {

        if (req.user && req.user.role === role) {

            next();
        } else {

            res.status(403).json({ message: 'Acesso negado. Permissões insuficientes.' });
        }
    };
}
module.exports = {
    authenticateToken,
    authorizeRole,
};