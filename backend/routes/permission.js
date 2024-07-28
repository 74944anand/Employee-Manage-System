const express = require('express')
const router = express.Router()
const { errorWrapper } = require('../utils/error')
const permissionController = require('../controller/permission')
const { add, addBulk, validateId } = require('../validation/permission');
const { validateError } = require('../utils/validateError');
const { checkPermission } = require('../middleware/checkPermission');
const { checkAuth } = require('../middleware/checkAuth');


router.get('/', checkAuth, checkPermission, errorWrapper(permissionController.getData));
router.get('/:id', validateId, validateError, checkAuth, checkPermission, errorWrapper(permissionController.getDataById));
router.post('/', add, validateError, checkAuth, checkPermission, errorWrapper(permissionController.addData));
router.post('/bulk', addBulk, validateError, errorWrapper(permissionController.addBulkData));
router.put('/:id', validateId, validateError, checkAuth, checkPermission, errorWrapper(permissionController.updateDataById));
router.delete('/:id', validateId, validateError, checkAuth, checkPermission, errorWrapper(permissionController.deleteDataById));
router.put('/restore/:id', validateId, validateError, checkAuth, checkPermission, errorWrapper(permissionController.restoreDataById));


module.exports = router