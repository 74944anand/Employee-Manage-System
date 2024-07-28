const express = require('express')
const router = express.Router()
const { errorWrapper } = require('../utils/error')
const { validateError } = require('../utils/validateError')
const roleController = require('../controller/role')
const { addRole, validateId } = require('../validation/role');
const { checkPermission } = require('../middleware/checkPermission')
const { checkAuth } = require('../middleware/checkAuth')

router.get('/', checkAuth, checkPermission, errorWrapper(roleController.getData))
router.get('/:id', validateId, validateError, checkAuth, checkPermission, errorWrapper(roleController.getDataById))
router.post('/', addRole, validateError, checkAuth, checkPermission, errorWrapper(roleController.addData))
router.post('/bulk', checkAuth, checkPermission, errorWrapper(roleController.addBulkData))
router.put('/:id', validateId, validateError, checkAuth, checkPermission, errorWrapper(roleController.updateDataById))
router.delete('/:id', validateId, validateError, checkAuth, checkPermission, errorWrapper(roleController.deleteDataById))
router.put('/restore/:id', validateId, validateError, checkAuth, checkPermission, errorWrapper(roleController.restoreDataById))


module.exports = router