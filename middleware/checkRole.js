const checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Необходима авторизация' });
        }
        
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Доступ запрещен' });
        }
        
        next();
    };
};

module.exports = checkRole; 