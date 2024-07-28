const db = require('../models');
const pagination = require('../utils/pagination');

exports.getData = async (query) => {
    const { search, offset, pageSize } = pagination.paginationWithFromTo(
        query.search,
        query.page,
        query.limit
    );   
     const result = await db.role.findAll({
        offset: offset,
        limit: pageSize, 
        order: [['updatedAt', 'DESC']]
    })
    if (result && result.length) {
        let count = await db.role.count()
        return { success: true, message: "Role Found",data: result ,count}
    }else{
        return { success: false, message: "Role Not Found", data: result }
    }
}

exports.getDataById = async (id, options) => {
    const result = await db.role.findOne({
        ...options,
        where: { id }
    })
    if (result) {
        return { success: true,message: "Role Found", data: result }
    }else{
        return { success: false, message: "Role Not Found", data: result }
    }
    
}

exports.addData = async ({ roleName, roleDescription }) => {
    const result = await db.role.create({ roleName, roleDescription })
    if (result) {
        return { success: true, data: result, message: "Role Added" }
    }else{
        return { success: false, message: "Role Not Added", data: result }
    }
}

exports.addBulkData = async (data) => {
    const result = await db.role.bulkCreate(data)
    if (result) {
        return { success: true , message: "Role Added", data: result }
    }else{
        return { success: false, message: "Role Not Added", data: result }
    }
}

exports.updateDataById = async (id, { roleName, roleDescription }) => {
    const result = await db.role.update({ roleName, roleDescription },{ where: { id } })
    if (result[0]) {
        return { success: true , message: "Role Updated", data: result }
    }else{
        return { success: false, message: "Data Not updated", data: result }
    }
    
}

exports.deleteDataById = async (id) => {
    const result = await db.role.destroy({ where: { id } })
    if (result) {
        return { success: true , message: "Role Deleted" , result}
    }else{
        return { success: false, message: "Role Not found", result }
    }
}

exports.restoreDataById = async (id) => {
    const result = await db.role.restore({ where: { id } })
    if (result) {
        return { success: true, message: "Role Restored" , result}
    }else{
        return { success: false, message: "Role Not found" , result }
    }
}