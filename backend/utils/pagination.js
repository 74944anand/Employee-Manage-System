let paginationWithFromTo = (searchParameter, fromParameter, toParameter) => {
  let search = isEmpty(searchParameter) ? "" : searchParameter;
  let from = isEmpty(fromParameter) ? 1 : fromParameter;
  let to = isEmpty(toParameter) ? 1000 : toParameter;
  let pageSize = Number(to);
  let offset = (from - 1) * pageSize;
  return { search, offset, pageSize };
};

let paginationWithFromToAndSort = (
  searchParameter,
  fromParameter,
  toParameter,
  sortParamater,
  orderByParamater
) => {
  let search = isEmpty(searchParameter) ? "" : searchParameter;

  let from = !fromParameter ? 1 : fromParameter;
  let to = !toParameter ? 1000 : toParameter;

  let sort =
    !sortParamater || sortParamater == "undefined"
      ? "created_at"
      : sortParamater;
  let orderby =
    !orderByParamater || orderByParamater == "undefined"
      ? "DESC"
      : orderByParamater;

  let pageSize = Number(to - from + 1);
  let offset = Number(from - 1);

  return { search, offset, pageSize, sort, orderby };
};

let paginationWithPageNumberPageSize = (
  searchParameter,
  pageNumberParameter,
  pageSizeParameter
) => {
  let search = isEmpty(searchParameter) ? "" : searchParameter;
  let pageNumber = !isEmpty(pageNumberParameter) ? pageNumberParameter : 1;
  let pageSize = pageSizeParameter || 10;
  if (pageSize != 0 && pageNumber != 0) {
    userOffset = pageSize * (pageNumber - 1);
  }
  return { search, userOffset, pageSize, pageNumber };
};

let NextAndPrevPageNumber = (
  pageNumberParameter,
  pageSizeParameter,
  userCount
) => {
  let currentObject = pageNumberParameter * pageSizeParameter;
  let prev =
    currentObject == pageSizeParameter ? null : Number(pageNumberParameter) - 1;
  let next =
    currentObject >= userCount ? null : Number(pageNumberParameter) + 1;
  let lastPage = Math.ceil(userCount / pageSizeParameter);

  return { next, prev, lastPage };
};
let trim = (x) => {
  let value = String(x);
  return value.replace(/^\s+|\s+$/gm, "");
};

let isEmpty = (value) => {
  if (
    value === null ||
    value === undefined ||
    trim(value) === "" ||
    value.length === 0 ||
    Object.entries(value).length === 0
  ) {
    return true;
  } else {
    return false;
  }
};

module.exports = {
  paginationWithFromTo: paginationWithFromTo,
  paginationWithPageNumberPageSize: paginationWithPageNumberPageSize,
  NextAndPrevPageNumber: NextAndPrevPageNumber,
  paginationWithFromToAndSort: paginationWithFromToAndSort,
};
