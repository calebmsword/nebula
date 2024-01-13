import { getSafetyWrapper } from "../utils/utils.js";

/**
 * Gets the status message corresponding to the provided statusCode.
 * If the statusCode is unrecognized or not a number, then `null` is returned.
 * @param {number} statusCode 
 * @returns {string|undefined}
 */
export function getStatusMessage(statusCode) {
    switch (statusCode) {
        case 100:
            return "Continue";
        case 101:
            return "Switching Protocols";
        case 102:
            return "Processing";
        case 103:
            return "Early Hints";
        case 200:
            return "OK";
        case 201:
            return "Created";
        case 202:
            return "Accepted";
        case 203:
            return "Non-Authoritative Information";
        case 204:
            return "No Content";
        case 205:
            return "Reset Content";
        case 206:
            return "Partial Content";
        case 207:
            return "Multi-Status";
        case 208:
            return "Already Reported";
        case 226:
            return "IM Used"
        case 300:
            return "Multiple Choices";
        case 301:
            return "Moved Permanently";
        case 302:
            return "Found";
        case 303:
            return "Not Modified";
        case 307:
            return "Temporary Redirect";
        case 308:
            return "Permanent Redirect";
        case 400:
            return "Bad Request";
        case 401:
            return "Unauthorized";
        case 403:
            return "Forbidden";
        case 404:
            return "Not Found";
        case 405:
            return "Method Not Allowed";
        case 406:
            return "Not Acceptable";
        case 407:
            return "Proxy Authentication Required";
        case 408:
            return "Request Timeout";
        case 409:
            return "Conflict";
        case 410:
            return "Gone";
        case 411:
            return "Length Required";
        case 412:
            return "Precondition Failed";
        case 413:
            return "Payload Too Large";
        case 414:
            return "URI Too Long";
        case 415:
            return "Unsupported Media Type";
        case 416:
            return "Range Not Satisfiable";
        case 417:
            return "Expectation Failed";
        case 418:
            return "I'm a teapot"
        case 421:
            return "Misdirected Request";
        case 422:
            return "Unprocessable Content";
        case 423:
            return "Locked";
        case 424:
            return "Failed Dependency";
        case 426:
            return "Upgrade Required";
        case 428:
            return "Precondition Required";
        case 429:
            return "Too Many Requests";
        case 431:
            return "Request Header Fields Too Large";
        case 451:
            return "Unavailable For Legal Reasons";
        case 500:
            return "Internal Server Error";
        case 501:
            return "Not Implemented";
        case 502:
            return "Bad Gateway";
        case 503:
            return "Service Unavailable";
        case 504:
            return "Gateway Timeout";
        case 505:
            return "HTTP Version Not Supported";
        case 506:
            return "Variant Also Negotiates";
        case 507:
            return "Insufficient Storage";
        case 508:
            return "Loop Detected";
        case 510:
            return "Not Extended";
        case 511:
            return "Network Authentication Required";
        default:
            return;
    }
}

/**
 * A requestor factory. Creates requestors that make one HTTP request.
 * This is a wrapper around XMLHttpRequest.
 * 
 * @example
 * ```
 * const doPostRequest = createAjaxRequestor({
 *   url: "endpoint/of/request",
 *   method: "POST",  // or "GET", "PUT", etc...
 *   headers: {
 *       Authorization: `Bearer ${ACCESS_TOKEN}`
 *   },
 *   body: { id: "1" , user: "username" }
 * });
 * 
 * doPostRequest(({ value, reason }) => {
 *   if (value === undefined) {
 *     console.log("failure because", reason);
 *     return;
 *   }
 *   
 *   console.log(
 *     value.statusCode, 
 *     value.statusMessage, 
 *     value.headers,
 *     // if response is JSON, 
 *     // `value.data` will be an object.
 *     // Otherwise `value.data` must be 
 *     // parsed manually.
 *     value.data);
 * });
 * ```
 * 
 * For convenience, the request body is automatically parsed into a string if an 
 * object is provided. This string will typically be a JSON string, but if you 
 * specify a `contentType` of "x-www-form-urlencoded" or provide a header which 
 * specifies the MIME content type, the request body will be automatically 
 * stringified into a URL query parameter string. You can disable this automatic
 * parsing if you would like by setting `spec.autoParseRequest` to `false`. If 
 * you do this, you will need to provide a string to the request body instead of 
 * an object.
 * 
 * If the response data is sent as JSON, it is automatically parsed into an 
 * object. This behavior can be disabled by setting `spec.autoParseResponse` to 
 * `false`.
 * 
 * The cancellor for the requestor, by default, uses the `abort` method from 
 * the XMLHttpRequest API. This means that the default cancellor will let the 
 * server process your request, and whatever response is sent will simply be 
 * ignored. If you would like more control over how the cancellor behaves, then 
 * use `spec.customCancel`. See the following example. 
 * 
 * @example
 * ```
 * const getExpensiveRequest = createAjaxRequestor({
 *     url: "endpoint/of/request",
 *     
 *     // customCancel must be a function factory
 *     customCancel: (abortRequest, tryReceiver) => () => {
 *         
 *         // Suppose our server was designed such 
 *         // that this particular expensive request 
 *         // can be cancelled if another specific 
 *         // request is made before the server 
 *         // responds to the expensive request
 *         createAjaxRequestor({ 
 *             url: "endpoint/to/request/cancel" 
 *         })(() => {
 *             // no-op
 *         });
 *         
 *         // abortRequest simply calls 
 *         // XMLHttpRequest.abort.
 *         // If server sends response before the
 *         // cancel request is received, calling 
 *         // this function will still lead us to 
 *         // ignore the response.
 *         // The receiver will NOT be called if you 
 *         // execute abortRequest!!!
 *         abortRequest();
 *         
 *         // You don't have to call abortRequest(), 
 *         // for example, if you expect to receive 
 *         // some sort of response from the server 
 *         // if the cancel is sent in time.
 * 
 *         // You have access to the receiver for 
 *         // the requestor. Use this is you would  
 *         // like to call the receiver even if 
 *         // abortRequest is called.
 *         // If the receiver is already called by the 
 *         // time cancel is run, then this function 
 *         // will no-op
 *         tryReceiver({ reason: "cancelled!" });
 *         
 *         // If you call tryReceiver but don't call
 *         // abortRequest, then the receiver will 
 *         // never be called again, even if a 
 *         // the expensive request receives a 
 *         // response. 
 *     }
 * });
 * ```
 * 
 * @param {object} spec 
 * Configures the returned requestor.
 * @param {string} [spec.url] 
 * The endpoint of the request. This can include 
 * passwords, hashes, ports, and query parameters.
 * @param {{ [key: string]: string }} [spec.params] 
 * Represents query parameter keys and their values.  
 * @param {import("../../public-types").HttpMethod} [spec.method] 
 * "GET", "POST", "PUT", "DELETE", etc. If none is 
 * provided, then defaults to "GET".
 * @param {import("../../public-types").OutgoingHttpHeaders} [spec.headers]
 * The provided object should map header keys to 
 * their values.
 * @param {import("../../public-types").Json|string} [spec.body] 
 * If an object, then it is parsed into a 
 * string based on the provided content type (either from the header or the 
 * `spec.contentType`). If it is a string, then it is already parsed.
 * @param {import("../../public-types").ContentType} [spec.contentType] 
 * Determines how `value.body` is parsed into a 
 * string. If  `"x-www-form-urlencoded"` or 
 * `"application/x-www-form-urlencoded"`, `value.body` is transformed into the 
 * format used by URL query parameters. If `"json"`, `"application/json"`, or 
 * `"default"`, `value.body` is transformed into a string by JSON.stringify. If 
 * no `contentType` is provided, then `"application/json"` is used by default. 
 * Specifying the content-type in the header overrides this property completely.
 * @param {import("../../public-types").CustomCancellorFactory} [spec.customCancel]
 * A function factory. It takes a method 
 * which destroys the request object represented by the requestor and returns a 
 * new function. Use this if you would like to make a request to the server to 
 * tell it to stop processing a request, since by default, the cancel function 
 * simply ignores whatever response is sent by the server.
 * @param {boolean} [spec.autoParseRequest]
 * If false, requests will not be 
 * automatically parsed. You must provide strings instead of objects as the 
 * request body.
 * @param {boolean} [spec.autoParseResponse]
 * If false, responses will be sent to 
 * the receiver as strings instead of objects. The receiver must manually parse 
 * the response.
 * @param {import("../../public-types").Log} [spec.log] 
 * Any errors will be sent to this function if it is 
 * provided. This should be used for logging purposes. Currently, only errors 
 * which occur during autoparsing with JSON.parse causes this function to be 
 * called.
 * @returns {import("../../public-types").HttpRequestor} 
 * An HTTP/HTTPS requestor. The returned requestor can take an 
 * optional `message` hash which can further configure the http request. See the 
 * documentation for the `HttpMessage` type.
 * 
 * The value sent to the receiver is a hash with four properties: `statusCode`, 
 * `statusMessage`, `headers`, and `data`.
 */
export function httpRequestor(spec) {

    if (typeof spec !== "object")
        spec = {}

    let {
        url,
        params,
        method,
        headers,
        body,
        contentType,
        customCancel,
        autoParseRequest = true,
        autoParseResponse = true,
        log,
    } = spec

    if (typeof headers !== "object")
        headers = {};

    if (typeof params !== "object")
        params = {};

    const __other__ = Symbol("other");
    
    /** @type {{ [key: string]: string, [key: symbol]: symbol }} */
    const ContentType = {
        "json": "application/json",
        "application/json": "application/json",
        "default": "application/json",
        "x-www-form-urlencoded": "application/x-www-form-urlencoded",
        "application/x-www-form-urlencoded": "application/x-www-form-urlencoded",
        [__other__]: __other__
    }

    /** @param {{ [key: string]: string }} object */
    const searchParamatize = object => new URLSearchParams(
        Object.entries(object)).toString();
    
    /** @type {{ [key: string|symbol]: Function}} */
    const Stringify = {
        "json": JSON.stringify,
        "application/json": JSON.stringify,
        "default": JSON.stringify,
        "x-www-form-urlencoded": searchParamatize,
        "application/x-www-form-urlencoded": searchParamatize,
        /** @param body {any} */
        [__other__]: body => String(body)
    }

    return function httpRequestor(receiver, message) {

        /** @type {import("../../public-types").Cancellor|undefined} */
        let cancellor;     

        /** @type {import("../../public-types").SafetyWrapper<import("../../public-types").HttpResultValue|undefined>} */
        const wrapper = getSafetyWrapper(receiver)
        
        wrapper.doEffect(wrapper => {

            if (typeof message !== "object") message = {};

            // requestor can override body, contentType, or customCancel
            body = typeof message.body === "object" ? message.body : body;
            contentType = message.contentType !== null &&
                          message.contentType !== undefined 
                            ? message.contentType 
                            : contentType;
            customCancel = message.customCancel !== null &&
                           message.contentType !== undefined
                            ? message.customCancel 
                            : customCancel;

            let additionalHeaders = message.headers;
            let additionalParams = message.params;
            let additionalPath = message.pathname;

            // requestor can disable automatic request parsing
            if (typeof message.autoParseRequest === "boolean")
                autoParseRequest = message.autoParseRequest;

            // requestor can disable automatic response parsing
            if (typeof message.autoParseResponse === "boolean")
                autoParseResponse = message.autoParseResponse;

            // if the `contentType` is not recognized, use default 
            if (typeof contentType !== "string" || 
                !Object.keys(ContentType).includes(contentType))
                contentType = "default";

            // concantentate factory headers with any provided from requestor
            if (typeof additionalHeaders === "object")
                headers = { ...headers, ...additionalHeaders };
            
            // concantenate factory query parameters with those from requestor
            if (typeof additionalParams === "object")
                params = { ...params, ...additionalParams };

            // let headers override `contentType` if headers defines it
            const contentTypeKey = Object.keys(headers || {}).find(key => 
                key.toLowerCase().includes("content-type"));
            if (contentTypeKey !== undefined && headers !== undefined) {
                const _contentType = headers[contentTypeKey];
    
                if (_contentType !== undefined &&
                    _contentType.includes(ContentType["x-www-form-urlencoded"]))
                    contentType = ContentType["x-www-form-urlencoded"];
                else if (_contentType !== undefined &&
                        _contentType.includes(ContentType.json))
                    contentType = ContentType.json;
                else
                    contentType = ContentType[__other__];
            }

            // If improper log provided, use default log
            if (typeof log !== "function")
                log = function logWarning(error) {
                    console.log("Could not autoparse response:\n", error);
                }
    
            // requestor can append URL
            if (typeof additionalPath === "string")
                url += additionalPath;

            // determine query parameters
            if (typeof params === "object" && Object.keys(params).length > 0)
                url += `?${
                        new URLSearchParams(Object.entries(params))
                            .toString()
                    }`;
            
            // If headers didn't override `contentType`, apply `contentType`
            if (typeof contentType === "string" && headers !== undefined)
                headers["Content-Type"] = ContentType[contentType];
            
            // Automatically parse request
            if (typeof body === "object" && autoParseRequest !== false)
                body = Stringify[contentType](body)
            
            // XMLHttpRequest isn't allowed to assign content-length, toss it
            Object.keys(headers || {}).forEach(header => {
                if (headers && header.toLowerCase() === "content-length")
                    delete headers[header];
            });
            
            const request = new XMLHttpRequest();
            
            request.onreadystatechange = wrapper.getEffect(() => {
                if (request.readyState !== XMLHttpRequest.DONE) return;

                let statusCode = request.status;

                let statusMessage = getStatusMessage(request.status);

                /** @type {import("../../public-types").IncomingHttpHeaders} */
                let headers = {};

                /** @type {import("../../public-types").Json|string} */
                let data = "";

                headers = Object.create(null);
                request.getAllResponseHeaders().split("\r\n").forEach(line => {
                    if (line === "") return;
                    const [header, headerValue] = line
                        .split(":")
                        .map(string => string.trim());
                    headers[header] = headerValue;
                });

                /** 
                 * @type {(s: string) => string|import("../../public-types").Json}
                 * */
                let responseHandler = unparsed => unparsed;

                // If auto-parsing response, JSON.parse response if it is 
                // JSON content type
                if (autoParseResponse !== false &&
                    Object.keys(headers)
                        .some(key =>
                            key.toLowerCase().includes("content-type") && 
                            (headers[key] || "")
                                .toLowerCase()
                                .includes("application/json")))
                    responseHandler = JSON.parse;
                
                try {
                    data = responseHandler(request.responseText)
                }
                catch(error) {
                    if (typeof log === "function") log(error);
                    data = request.responseText;
                }

                return {
                    statusCode,
                    statusMessage,
                    headers,
                    data
                }
            });

            request.onerror = wrapper.getEffect(() => {
                throw new Error("An error occurred in XMLHttpRequest.");
            });

            request.open(method || "GET", url || "", true);

            Object.keys(headers || {}).forEach(header => {
                request.setRequestHeader(header, 
                                        headers && headers[header] || "");
            });

            request.send(typeof body === "string" ? body : undefined);

            cancellor = typeof customCancel === "function"
                ? customCancel(request.abort, wrapper.tryReceiver)
                : () => request.abort
            
            if (typeof cancellor !== "function")
                throw Object.assign(
                    new Error("customCancel did not return a function"),
                    { evidence: cancellor });
        });

        return cancellor;
    }
}

/**
 * A factory which creates a requestor for a specific method type.
 * @param {import("../../public-types").HttpMethod} method 
 * @returns {import("../../private-types").SpecificHttpRequestor}
 */
export function createSpecificMethodRequestor(method) {
    return function specificMethodRequestor(urlOrSpec, spec) {
        if (
            typeof urlOrSpec === "string" && 
            ["null", "undefined", "object"].includes(typeof spec)
        ) {
            return httpRequestor({ ...spec, url: urlOrSpec, method });
        }
        else if (typeof urlOrSpec !== "object")
            throw Object.assign(
                new Error(
                "if you provide one argument, it must be a `spec` object you " + 
                "could pass to `createHttpsRequestor`. Otherwise, it must " + 
                "take two arguments, where the first is the endpoint of the " + 
                "request and the second is a `spec` object you could pass to " + 
                "`createHttpsRequestor`."),
                { evidence: { urlOrSpec, spec } }
            );
        else{
            /** @type {import("../../public-types").HttpSpec} */
            const spec = { method, ...urlOrSpec };
            return httpRequestor(spec);
        }
    }
}

/**
 * Creates an ajax requestor for making GET requests.
 * @param {import("../../public-types").SpecificHttpSpec|string} url 
 * If a string, then the endpoint of the GET request. 
 * If you pass a `spec` object as the first argument, then the second parameter 
 * is ignored.
 * @param {import("../../public-types").SpecificHttpSpec} spec 
 * See the documentation for the `spec` parameter in 
 * {@link httpRequestor}.. If you provide a method property in this spec, it is 
 * ignored.
 * @returns {import("../../public-types").HttpRequestor} 
 * A requestor. See documentation for the return value of 
 * {@link httpRequestor}.
 */
export const httpRequestorGet = createSpecificMethodRequestor("GET");

/**
 * Creates an ajax requestor for making POST requests.
 * @param {import("../../public-types").SpecificHttpSpec|string} url 
 * If a string, then the endpoint of the GET request. 
 * If you pass a `spec` object as the first argument, then the second parameter 
 * is ignored.
 * @param {import("../../public-types").SpecificHttpSpec} [spec] 
 * See the documentation for the `spec` parameter in 
 * {@link httpRequestor}. If you provide a method property in this spec, it is 
 * ignored.
 * @returns {import("../../public-types").HttpRequestor} A requestor. 
 * See documentation for the return value of 
 * {@link httpRequestor}.
 */
export const httpRequestorPost = createSpecificMethodRequestor("POST");

/**
 * Creates an ajax requestor for making PUT requests.
 * @param {import("../../public-types").SpecificHttpSpec|string} url 
 * If a string, then the endpoint of the GET request. 
 * If you pass a `spec` object as the first argument, then the second parameter 
 * is ignored.
 * @param {import("../../public-types").SpecificHttpSpec} spec 
 * See the documentation for the `spec` parameter in 
 * {@link httpRequestor}. If you provide a method property in this spec, it is 
 * ignored.
 * @returns {import("../../public-types").HttpRequestor} 
 * A requestor. See documentation for the return value of 
 * {@link httpRequestor}.
 */
export const httpRequestorPut = createSpecificMethodRequestor("PUT");

/**
 * Creates an ajax requestor for making DELETE requests.
 * @param {import("../../public-types").SpecificHttpSpec|string} url 
 * If a string, then the endpoint of the GET request. 
 * If you pass a `spec` object as the first argument, then the second parameter 
 * is ignored.
 * @param {import("../../public-types").SpecificHttpSpec} spec 
 * See the documentation for the `spec` parameter in 
 * {@link httpRequestor}. If you provide a method property in this spec, it is 
 * ignored.
 * @returns {import("../../public-types").HttpRequestor} 
 * A requestor. See documentation for the return value of 
 * {@link httpRequestor}.
 */
export const httpRequestorDelete = createSpecificMethodRequestor("DELETE");
