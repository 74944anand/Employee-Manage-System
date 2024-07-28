const rolePermissionService = require('../service/rolePermission');
const response = require('../utils/response');

exports.getData = async (req, res) => {
    const { limit, page } = req.query;
    const result = await rolePermissionService.getData({ limit, page})
    if (result.success) { 
        return response.ok(res, {...result})
     }
    else { 
        return response.noData(res, {...result}) 
    }
}

exports.getDataById = async (req, res) => {
    const { roleId } = req.params
    const result = await rolePermissionService.getData({},roleId)
    if (result.success)  {
         return response.ok(res, {...result})
         }
    else { 
        return response.noData(res, {...result})
     }
}

exports.addData = async (req, res) => {
    const {role_id}  = req.params
    const { permissionArr} = req.body 
    const result = await rolePermissionService.addData({ role_id, permissionArr })
    if (result.success) { 
        return response.created(res, {...result})
     }
    else { 
        return response.badRequest(res, {...result}) 
    }
}

exports.addBulkData = async (req, res) => {
    const result = await rolePermissionService.addBulkData(req.body)
    if (result.success) { 
        return response.created(res, {...result})
     }
    else { 
        return response.badRequest(res, {...result}) 
    }
}

exports.updateDataById = async (req, res) => {
    const { id } = req.params
    const {permissionArr} = req.body
    const result = await rolePermissionService.updateDataById(id, permissionArr)
    if (result.success)  { 
        return response.ok(res, {...result}) 
    }
    else { 
        return response.noData(res, {...result})
     }
}

exports.deleteDataById = async (req, res) => {
    const { id } = req.params
    const result = await rolePermissionService.deleteDataById(id)
    if (result.success) { 
        return response.deleted(res, {...result}) 
    }
    else { 
        return response.noContent(res, {...result})
     }
}

exports.restoreDataById = async (req, res) => {
    const { id } = req.params
    const result = await rolePermissionService.restoreDataById(id)
    if (result.success)  { 
        return response.ok(res, {...result})
     }
    else { 
        return response.noData(res, {...result})
     }
}