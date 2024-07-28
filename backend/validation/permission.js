const { body, param } = require('express-validator');


exports.addBulk = [
    body('').notEmpty().withMessage('glCode must be specified.')
    // .isLength({ min: 9, max: 50 }).trim()
]

exports.add = [
    body('entityId').notEmpty().withMessage('entityId must be specified.').matches(/^\d+$/).withMessage('Invalid integer format in entityId'),
    body('actionName').notEmpty().withMessage('actionName must be specified.').trim(),
    body('description').notEmpty().withMessage('description must be specified.').trim(),
    body('baseUrl').notEmpty().withMessage('baseUrl must be specified.').trim(),
    body('path').notEmpty().withMessage('path must be specified.').trim(),
    body('method').notEmpty().withMessage('method must be specified.').trim(),
]

// exports.update = [
//     param('id').notEmpty().withMessage('id is required parameter').matches(/^\d+$/).withMessage('Invalid integer format in parameter'),
//     body('').notEmpty().withMessage('glCode must be specified.')
//     // .isLength({ min: 9, max: 50 }).trim()
// ]

exports.validateId = [
    param('id').notEmpty().withMessage('id is required parameter').matches(/^\d+$/).withMessage('Invalid integer format in parameter'),
]