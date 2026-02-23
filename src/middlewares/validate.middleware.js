const Joi = require('joi');

const schemas = {
    register: Joi.object({
        name: Joi.string().min(2).max(50).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).max(100).required(),
    }),

    login: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
    }),

    createTask: Joi.object({
        title: Joi.string().min(1).max(200).required(),
        description: Joi.string().max(1000).allow('').optional(),
        priority: Joi.string().valid('low', 'medium', 'high').optional(),
        dueDate: Joi.date().iso().allow(null).optional(),
        status: Joi.string().valid('pending', 'completed').optional(),
    }),

    updateTask: Joi.object({
        title: Joi.string().min(1).max(200).optional(),
        description: Joi.string().max(1000).allow('').optional(),
        priority: Joi.string().valid('low', 'medium', 'high').optional(),
        dueDate: Joi.date().iso().allow(null).optional(),
        status: Joi.string().valid('pending', 'completed').optional(),
    }).min(1),

    createHabit: Joi.object({
        name: Joi.string().min(1).max(100).required(),
        description: Joi.string().max(500).allow('').optional(),
    }),

    logFocus: Joi.object({
        focusMinutes: Joi.number().integer().min(1).max(480).required(),
    }),

    fcmToken: Joi.object({
        fcmToken: Joi.string().required(),
    }),
};

const validate = (schemaName) => (req, res, next) => {
    const schema = schemas[schemaName];
    if (!schema) return next();

    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
        const messages = error.details.map((d) => d.message).join('; ');
        return res.status(422).json({ success: false, message: `Validation error: ${messages}` });
    }
    next();
};

module.exports = validate;
