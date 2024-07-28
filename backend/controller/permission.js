const permissionService = require('../service/permission');
const response = require('../utils/response');

exports.getData = async (req, res) => {
     const { limit, page } = req.query;
    const result = await permissionService.getData({ limit, page }) 
    if (result.success) { 
     return response.ok(res, {...result}) 
    }
    else {
      return response.noData(res, {...result}) 
    }
}

exports.getDataById = async (req, res) => {
    const { id } = req.params
    const result = await permissionService.getDataById(id)
    if (result.success)  { 
        return response.ok(res, {...result})
     }
    else { 
        return response.noData(res, {...result})
         }
}

exports.addData = async (req, res) => {
    const result = await permissionService.addData(req.body)
    if (result.success) { 
        return response.created(res, {...result}) 
    }
    else { 
        return response.badRequest(res, {...result})
         }
}

exports.addBulkData = async (req, res) => {
    const result = await permissionService.addBulkData(req.body)
    if (result.success) { 
        return response.created(res, {...result}) 
    }
    else {
         return response.badRequest(res, {...result})
         }
}

exports.updateDataById = async (req, res) => {
    const { id } = req.params
    const result = await permissionService.updateDataById(id, req.body)
    if (result.success)  {
         return response.ok(res, {...result})
         }
    else { 
        return response.noData(res, {...result}) 
    }
}

exports.deleteDataById = async (req, res) => {
    const { id } = req.params
    const result = await permissionService.deleteDataById(id)
    if (result.success) {
         return response.deleted(res, {...result})
         }
    else { 
        return response.noContent(res, {...result})
     }
}

exports.restoreDataById = async (req, res) => {
    const { id } = req.params
    const result = await permissionService.restoreDataById(id)
    if (result.success)  { 
        return response.ok(res, {...result})
     }
    else { 
        return response.noData(res, {...result}) 
    }
}