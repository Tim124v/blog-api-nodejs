const Joi = require('joi');

const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({
                message: 'Ошибка валидации',
                details: error.details.map(detail => detail.message)
            });
        }
        next();
    };
};

const schemas = {
    register: Joi.object({
        name: Joi.string().min(2).max(30).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required()
    }),
    
    login: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    }),
    
    post: Joi.object({
        title: Joi.string().min(3).max(100).required(),
        content: Joi.string().min(10).required(),
        tags: Joi.array().items(Joi.string().min(2).max(20)),
        status: Joi.string().valid('draft', 'published')
    }),
    
    comment: Joi.object({
        content: Joi.string().min(2).max(500).required()
    })
};

module.exports = { validate, schemas }; 