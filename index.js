import nebula from "./src/nebula.js"

export const { 
    utils,

    get,
    post,
    put,

    GET,
    POST,
    PUT,
    DELETE
} = nebula;

export const {
    checkReceiver,
    checkRequestor,
    checkRequestors,
    getSafetyWrapper
} = nebula.utils;

export {
    map,
    branch,
    thru,
    fail,
    usePromise,

    http,
    httpGet,
    httpPost,
    httpPut,
    httpDelete,

    isStatus,
    isOk,
    isCreated,
    is2xx
} from "./src/factories/factories.js";

export default nebula;
