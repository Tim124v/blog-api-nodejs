const Joi = require('joi');
const { AppError } = require('./errorHandler');

const validate = (schemaName) => {
    return (req, res, next) => {
        const schema = schemas[schemaName];
        if (!schema) {
            throw new AppError(`Схема валидации '${schemaName}' не найдена`, 500);
        }

        const { error } = schema.validate(req.body, { 
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const details = error.details.map(detail => detail.message).join(', ');
            throw new AppError(`Ошибка валидации: ${details}`, 400);
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
        content: Joi.string().min(10).required()
    }),
    
    comment: Joi.object({
        content: Joi.string().min(2).max(500).required()
    })
};

module.exports = { validate, schemas }; 