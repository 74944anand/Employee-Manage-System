const express = require('express')
const router = express.Router()
const { errorWrapper } = require('../utils/error')
const rolePermissionController = require('../controller/rolePermission')
const { updateRolePermission, validateId } = require('../validation/rolePermission');
const { validateError } = require('../utils/validateError');
const { checkPermission } = require('../middleware/checkPermission')
const { checkAuth } = require('../middleware/checkAuth')

router.get('/', checkAuth, checkPermission, errorWrapper(rolePermissionController.getData))
router.get('/:roleId', checkAuth, checkPermission, errorWrapper(rolePermissionController.getDataById))
router.post('/bulk', errorWrapper(rolePermissionController.addBulkData))
router.put('/:id', updateRolePermission, validateError, checkAuth, checkPermission, errorWrapper(rolePermissionController.updateDataById))
router.delete('/:id', validateId, validateError, checkAuth, checkPermission, errorWrapper(rolePermissionController.deleteDataById))
router.put('/restore/:id', validateId, validateError, checkAuth, checkPermission, errorWrapper(rolePermissionController.restoreDataById))
router.post('/:roleId', checkAuth, checkPermission, errorWrapper(rolePermissionController.addData))

module.exports = router