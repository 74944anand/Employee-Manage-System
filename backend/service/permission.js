const db = require('../models');
const pagination = require('../utils/pagination');

exports.getData = async (query) => {
    const { search, offset, pageSize } = pagination.paginationWithFromTo(
        query.search,
        query.page,
        query.limit
    ); 
    const result = await db.permission.findAll({
        offset: offset,
        limit: pageSize, 
        order: [['updatedAt', 'DESC']]
       })

    if (result && result.length) {
         let count = await db.permission.count()
        return { success: true, message: "Permission Found", data: result,count} 
    }else{
        return { success: false, message: "Permission Not Found", data: result }
    }
}

exports.getDataById = async (id) => {
    const result = await db.permission.findOne({
        where: { id }
    })
    if (result) {
        return { success: true,message: "Permission Found", data: result }
    }else{
        return { success: false, message: "Permission Not Found", data: result }
    }
}

exports.addData = async ({ actionName, description,entityId, baseUrl, path, method }) => {    
    const result = await db.permission.create({ actionName, description,entityId, baseUrl, path, method })
    if (result) {
        return { success: true,message: "Permission Added", data: result }
    }else{
        return { success: false, message: "Permission Not Added", data: result }
    }
}

exports.addBulkData = async (data) => {
    const result = await db.permission.bulkCreate(data)
    if (result) {
        return { success: true , message: "Role Added",data: result }
    }else{
        return { success: false, message: "Role Not Added", data: result }
    }
}

exports.updateDataById = async (id, { actionName, description,entityId, baseUrl, path, method }) => {
    const result = await db.permission.update({ actionName, description,entityId, baseUrl, path, method },{ where: { id } })
    if (result[0]){
        return { success: true, data: result, message: "Permission found" }
    }else{
        return { success: false, data: result, message: "Permission Not updated"}
    }
   
}

exports.deleteDataById = async (id) => {
    const result = await db.permission.destroy({ where: { id } })
    if (result) {
        return { success: true, result, message: "permission Deleted" }
    }else{
        return { success: false, result, message: "permission Not found" }
    }
}

exports.restoreDataById = async (id) => {
    const result = await db.permission.restore({ where: { id } })
    if (result) {
        return { success: true, result, message: "permission Restored" }
    }else{
        return { success: false, result, message: "permission Not found" }
    }
}