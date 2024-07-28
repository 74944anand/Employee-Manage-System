// **
//  * Define every responses which we going to
//  * use while building product CRUD.
//  */

const httpStatus = require('http-status');

module.exports = {
  /**
     * successful response
     * @param {Object<response>} res response object of express.js
     * @param {Object} options options.
     * @param {String} options.message message to be pass.
     * @param {Any}   options.data data be send.
     */

  ok: (res, options = { message: 'data found'}) => {
    const opts = {statusCode: httpStatus.OK, ...options};
    return res.status(httpStatus.OK).send(opts);
  },

  /**
    * successful creation
    * @param {Object<response>} res response object of express.js
    * @param {Object} options options.
    * @param {String} options.message message to be pass.
    * @param {Any}   options.data data be send.
    */

  created: (res, options = { message: 'data inserted' }) => {
    const opts = {statusCode: httpStatus.CREATED, ...options};
    return res.status(httpStatus.CREATED).send(opts);
  },

  /**
    * Bad Request
    * @param {Object<response>} res response object of express.js
    * @param {Object} options options.
    * @param {String} options.message message to be pass.
    * @param {Any}   options.data data be send.
    */

  badRequest: (res, options = { message: 'bad request' }) => {
    const opts = {statusCode: httpStatus.BAD_REQUEST, ...options};
    return res.status(httpStatus.BAD_REQUEST).send(opts);
  },

  /**
     * No Data Found.
     * @param {Object<response>} res response object of express.js
     * @param {Object} options options.
     * @param {String} options.message message to be pass.
     * @param {Any}   options.data data be send.
     */

  noData: (res, options = { message: 'no data found' }) => {
    const opts = {statusCode: httpStatus.NOT_FOUND, ...options};
    return res.status(httpStatus.NOT_FOUND).send(opts);
  },

  /**
    * NO CONTENT
    * @param {Object<response>} res response object of express.js
    * @param {Object} options options.
    * @param {String} options.message message to be pass.
    * @param {Any}   options.data data be send.
    */

  noContent: (res, options = {message:'no content'}) => {
    const opts = {statusCode: httpStatus.BAD_REQUEST, ...options};
    return res.status(httpStatus.BAD_REQUEST).send(opts);
  },

  /**
  * Unauthorized
  * @param {Object<response>} res response object of express.js
  * @param {Object} options options.
  * @param {String} options.message message to be pass.
  * @param {Any}   options.data data be send.
  */

  unauthorized: (res, options = { message: 'Unauthorized' }) => {
    const opts = {statusCode: httpStatus.UNAUTHORIZED, ...options};
    return res.status(httpStatus.UNAUTHORIZED).send(opts);
  },

  /**
* Unprocessable Entity
* @param {Object<response>} res response object of express.js
* @param {Object} options options.
* @param {String} options.message message to be pass.
* @param {Any}   options.data data be send.
*/
  unprocessableEntity: (res, options = { message: 'Unprocessable Entity' }) => {
    const opts = {statusCode: httpStatus.UNPROCESSABLE_ENTITY, ...options};
    return res.status(httpStatus.UNPROCESSABLE_ENTITY).send(opts);
  },


   /**
* Deleted Entity
* @param {Object<response>} res response object of express.js
* @param {Object} options options.
* @param {String} options.message message to be pass.
* @param {Any}   options.data data be send.
*/
deleted: (res, options = { message: 'Deleted Successfully' }) => {
  const opts = {statusCode:httpStatus.OK , ...options};
  return res.status(httpStatus.OK).send(opts);
},

internalServerError: (res, options = { message: 'Deleted Successfully' }) => {
  const opts = {statusCode: 500, ...options};
  return res.status(500).send(opts);
},

forbidden: (res, options = { message: 'Validation Error' }) => {
  const opts = {statusCode: httpStatus.FORBIDDEN, ...options};
  return res.status(httpStatus.FORBIDDEN).send(opts);
},
};

