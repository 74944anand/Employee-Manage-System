const { param, body } = require("express-validator")


// exports.addBulk = [
//     body('roleId').exists()
//     .withMessage('roleId is required'),
//     body('permissionId').exists()
//     .withMessage('permissionId is required')
// ]

exports.addRolePermission = [
    body('roleId').notEmpty().withMessage('roleId is required parameter').matches(/^\d+$/).withMessage('Invalid integer format in roleId'),
    body('permissionId').notEmpty().withMessage('permissionId is required parameter').matches(/^\d+$/).withMessage('Invalid integer format in permissionId'),
]

exports.updateRolePermission = [
    param('id').notEmpty().withMessage('id is required parameter').matches(/^\d+$/).withMessage('Invalid integer format in parameter'),
]
exports.validateId = [
    param('id').notEmpty().withMessage('id is required parameter').matches(/^\d+$/).withMessage('Invalid integer format in parameter'),

]

