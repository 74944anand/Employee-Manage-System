const db = require("../models");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

exports.checkPermission = async (req, res, next) => {
  let arr = [];
  try {
    const userId = req.decoded.id;
    const userRoles = await db.userRole.findAll({ where: { userId } });
    const roleIds = userRoles.map((e) => e.roleId);
    const permitted = await db.rolePermission.findAll({
      where: { roleId: roleIds },
      attributes: ["permissionId"],
    });

    if (permitted.length <= 0) {
      return res
        .status(404)
        .send({ message: `No roleId found in permissions.` });
    } else {
      for (let i = 0; i < permitted.length; i++) {
        arr.push(permitted[i].permissionId);
      }
      const count = arr.map((perId) => perId);
      if (!count) {
        return res.status(404).send({ result: `No Permission Found` });
      } else {
        const access = await db.permission.findAll({
          where: {
            id: { [Op.in]: count },
          },
          attributes: ["method", "path", "baseUrl"],
        });
        if (!access) {
          return res.status(400).send("Not a valid route for user");
        } else {
          let match = false;
          access.map((e) => {
            if (
              e.dataValues.method === req.method &&
              e.dataValues.path == req.route.path &&
              e.dataValues.baseUrl == req.baseUrl
            ) {
              match = true;
            }
          });
          if (match) {
            next();
          } else {
            res
              .status(403)
              .json({ message: "You don't have permission for this!" });
          }
        }
      }
    }
  } catch (error) {
    return res.send({ result: `${error}` });
  }
};
