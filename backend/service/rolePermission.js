const db = require("../models");
const pagination = require("../utils/pagination");
const _ = require("underscore");

exports.getData = async (query, roleId) => {
  const { search, offset, pageSize } = pagination.paginationWithFromTo(
    query.search,
    query.page,
    query.limit
  );
  const whereCondition = {};
  if (roleId) {
    whereCondition.roleId = roleId;
  }
  const result = await db.rolePermission.findAll({
    offset: offset,
    where: whereCondition,
    include: [
      {
        model: db.role,
        as: "role",
      },
      {
        model: db.permission,
        as: "permission",
      },
    ],
    order: [['updatedAt', 'DESC']]
  });
  if (result && result.length) {
    return {
      success: true,
      message: "Role Permission Found",
      data: result,
      count: result.length,
    };
  } else {
    return {
      success: false,
      message: "Role Permission Not Found",
      data: result,
    };
  }
};

exports.getDataById = async (id, options) => {
  const result = await db.rolePermission.findOne({
    ...options,
    where: { id },
    include: [
      {
        model: db.role,
        as: "role",
      },
      {
        model: db.permission,
        as: "permission",
      },
    ],
  });
  if (result) {
    return { success: true, message: "Role Permission Found", data: result };
  } else {
    return {success: false,message: "Role Permission Not Found",data: result};
  }
};

exports.addData = async ({ role_id, permissionArr }) => {
  const RoleData = await db.role.findOne({ where: { id: role_id } });
  if (!RoleData) {
    return { success: false, message: "Data Not exist with given roleId" };
  }
  const PermissionArr = await Promise.all(
    permissionArr.map(async (permissionId) => {
      const permissionData = await db.permission.findOne({
        where: { id: permissionId },
      });
      if (permissionData) {
        return permissionData;
      }
      throw new Error(
        `Data Not exist With given permission id ${permissionId}`
      );
    })
  );
  const data = await RoleData.addPermissions(PermissionArr);
  return { success: true , message: "Data Added", data };
};

exports.addBulkData = async (data) => {
  data = data.permissionId.map((e) => ({
    roleId: data.roleId,
    permissionId: e,
  }));
  const result = await db.rolePermission.bulkCreate(data);
  if (result && result.length) {
    return { success: true, message: "Role Permission Added", data: result };
  } else {
    return {success: false,message: "Role Permission Not Added in Bulk",data: result};
  }
};

exports.updateDataById = async (role_id, permissionArr) => {
  const RoleData = await db.role.findOne({ where: { id: role_id } });
  if (!RoleData) {
    return { success: false, message: "Data Not exist with given roleId" };
  }

  let oldRolePermission = await db.rolePermission.findAll({
    where: { roleId: role_id },
    attributes: ["permissionId"],
  });
  const oldPermissions = await oldRolePermission.map(
    (data) => data.permissionId
  );
  let deleteValue = _.difference(oldPermissions, permissionArr);
  let addValues = _.difference(permissionArr, oldPermissions);

  if (addValues.length) {
    const PermissionArr = await Promise.all(
      addValues.map(async (permissionId) => {
        const permissionData = await db.permission.findOne({
          where: { id: permissionId },
        });
        if (!permissionData) {
          throw new Error(
            `Data Not exist With given permission id ${permissionId}`
          );
        }
        const RolePermission = await db.rolePermission.findOne({
          where: { roleId: role_id, permissionId },
          paranoid: false,
        });
        if (RolePermission) {
          await db.rolePermission.restore({where: { roleId: role_id, permissionId }});
        } else {
          const PermissionData = await db.permission.findOne({
            where: { id: permissionId },
          });
          await RoleData.addPermission(PermissionData);
        }
      })
    );
  }
  if (deleteValue.length) {
    const PermissionArr = await Promise.all(
      deleteValue.map(async (permissionId) => {
        const permissionData = await db.permission.findOne({
          where: { id: permissionId },
        });
        if (permissionData) {
          return permissionData;
        }
        throw new Error(
          `Data Not exist With given permission id ${permissionId}`
        );
      })
    );

    await RoleData.removePermissions(PermissionArr);
  }
  return { success: true, message: "Data Updated" };
};

exports.deleteDataById = async (id) => {
  const result = await db.rolePermission.destroy({ where: { id } });
  if (result) {
    return { success: true, result, message: "Role Permission Deleted" };
  } else {
    return { success: false, result, message: "Role Permission Not found" };
  }
};

exports.restoreDataById = async (id) => {
  const result = await db.rolePermission.restore({ where: { id } });
  if (result) {
    return { success: true, result, message: "Role Permission Restored" };
  } else {
    return { success: false, result, message: "Role Permission Not found" };
  }
};
