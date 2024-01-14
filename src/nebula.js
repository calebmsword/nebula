import utilities from "./utils/utils.js";

import {
    map,
    branch,
    thru,
    fail,
    usePromise,
    isStatus,
    isOk,
    isCreated,
    is2xx,
    http,
    httpGet,
    httpPost,
    httpPut,
    httpDelete
} from "./factories/factories.js";

const nebula = Object.freeze({
    utils: utilities,

    http,

    httpGet,
    httpPost,
    httpPut,
    httpDelete,

    get: httpGet,
    post: httpPost,
    put: httpPut,
    "delete": httpDelete,

    GET: httpGet,
    POST: httpPost,
    PUT: httpPut,
    DELETE: httpDelete,

    map,
    branch,
    thru,
    fail,
    usePromise,

    isStatus,
    is2xx,
    isOk,
    isCreated
});

export const utils = utilities;
export default nebula;
