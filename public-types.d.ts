/**
 * How the result of a requestor's unit of work is represented.
 * @Template T
 * The type of the `value` property will have if the Result is successful. If 
 * no type is provided, then `T` will be `any`.
 */
export interface Result<T> {
    value?: T,
    reason?: any
}

/**
 * Represents the result of a requestor whose unit of work resulted in success.
 * This is a specific type of {@link Result}.
 * @template T
 * The type of the `value` property in the {@link Result} object. 
 */
export type Success<T extends number|string|boolean|object|symbol|bigint|null> = 
    Result<T>

/**
 * Represents a requestor whose unit of work resulted in failure.
 * This is a specific type of {@link Result}.
 */
export type Failure = Result<undefined>;

/**
 * A function which should cancel the work associated with a requestor.
 * Many requestors make some request to a remote server, so a `Cancellor` cannot 
 * guarantee that the cancellation will occur. It can only guarantee an attempt.
 * @param {any} [reason]
 * An optional `reason` which can be provided to the `Cancellor`.
 */
export type Cancellor = (reason?: any) => void;

/**
 * A callback that is executed when a requestor completes its work.
 * @template T
 * The type of the `value` property of the result if the requestor is 
 * successful.
 * @param {Success|Failure} result
 * The result of the requestor's work.
 */
export type Receiver<T> = (result: Result<T>) => void;

/**
 * Requestors are the building blocks of asynchronous logic in Parsec.
 * Requestors are functions which perform "one unit of work". This work is 
 * typically asynchronous, but it can be synchronous. Upon completion, the 
 * requestor should call its {@link Receiver} with a {@link Success} or 
 * {@link Failure}. Requestors may optionally receive a `message` which is a 
 * second argument to the function.
 * Requestors may optionally return a {@link Cancellor}.
 * @template T
 * The type of the `value` parameter in the Result passed to the receiver.
 * @template M
 * The type of the message which can be passed to the requestor. If not 
 * provided, the message can be `any`.
 * @param {Receiver<S>} receiver
 * A callback which is executed with the {@link Result} of the requestor's unit 
 * of work.
 * @param {M} [message]
 * Can be used to configure the requestor call. Can be used in `parsec.sequence` 
 * to allow distributed message passing between `Requestor`s.
 */
export type Requestor<T, M = any> =
    (receiver: Receiver<T>, message?: M) => Cancellor|void;

export type ContentType = 
    "json" | 
    "application/json" | 
    "default" | 
    "x-www-form-urlencoded" | 
    "application/x-www-form-urlencoded" |
    string | 
    symbol;

export type JsonPrimitives = boolean|number|string|undefined|null;

/**
 * Represents an object which can be serialized into JSON.
 */
export interface Json {
    [key: string|number]: JsonPrimitives|JsonPrimitives[]|Json
}

/**
 * The factory function which can be passed to `http`.
 */
export type CustomCancellorFactory = (
    abortRequest: () => void, 
    tryReceiver?: (result: Result<HttpResultValue>) => void
) => (reason?: any) => void;

export type HttpMethod = 
    "GET" |
    "HEAD" |
    "POST" |
    "PUT" |
    "DELETE" |
    "CONNECT" |
    "OPTIONS" |
    "TRACE" |
    "PATCH" |
    string;

/** 
 * A function which logs an error.
*/
export type Log = (error: Error|unknown) => void;

// Huge thanks to @types/node.
interface IncomingHttpHeaders {
    [key: string]: string | undefined;
    accept?: string | undefined;
    "accept-language"?: string | undefined;
    "accept-patch"?: string | undefined;
    "accept-ranges"?: string | undefined;
    "access-control-allow-credentials"?: string | undefined;
    "access-control-allow-headers"?: string | undefined;
    "access-control-allow-methods"?: string | undefined;
    "access-control-allow-origin"?: string | undefined;
    "access-control-expose-headers"?: string | undefined;
    "access-control-max-age"?: string | undefined;
    "access-control-request-headers"?: string | undefined;
    "access-control-request-method"?: string | undefined;
    age?: string | undefined;
    allow?: string | undefined;
    "alt-svc"?: string | undefined;
    authorization?: string | undefined;
    "cache-control"?: string | undefined;
    connection?: string | undefined;
    "content-disposition"?: string | undefined;
    "content-encoding"?: string | undefined;
    "content-language"?: string | undefined;
    "content-length"?: string | undefined;
    "content-location"?: string | undefined;
    "content-range"?: string | undefined;
    "content-type"?: string | undefined;
    cookie?: string | undefined;
    date?: string | undefined;
    etag?: string | undefined;
    expect?: string | undefined;
    expires?: string | undefined;
    forwarded?: string | undefined;
    from?: string | undefined;
    host?: string | undefined;
    "if-match"?: string | undefined;
    "if-modified-since"?: string | undefined;
    "if-none-match"?: string | undefined;
    "if-unmodified-since"?: string | undefined;
    "last-modified"?: string | undefined;
    location?: string | undefined;
    origin?: string | undefined;
    pragma?: string | undefined;
    "proxy-authenticate"?: string | undefined;
    "proxy-authorization"?: string | undefined;
    "public-key-pins"?: string | undefined;
    range?: string | undefined;
    referer?: string | undefined;
    "retry-after"?: string | undefined;
    "sec-websocket-accept"?: string | undefined;
    "sec-websocket-extensions"?: string | undefined;
    "sec-websocket-key"?: string | undefined;
    "sec-websocket-protocol"?: string | undefined;
    "sec-websocket-version"?: string | undefined;
    "set-cookie"?: string | undefined;
    "strict-transport-security"?: string | undefined;
    tk?: string | undefined;
    trailer?: string | undefined;
    "transfer-encoding"?: string | undefined;
    upgrade?: string | undefined;
    "user-agent"?: string | undefined;
    vary?: string | undefined;
    via?: string | undefined;
    warning?: string | undefined;
    "www-authenticate"?: string | undefined;
}

// Huge thanks to @types/node.
export interface OutgoingHttpHeaders {
    [key: string]: string | undefined;
    accept?: string | undefined;
    "accept-charset"?: string | undefined;
    "accept-encoding"?: string | undefined;
    "accept-language"?: string | undefined;
    "accept-ranges"?: string | undefined;
    "access-control-allow-credentials"?: string | undefined;
    "access-control-allow-headers"?: string | undefined;
    "access-control-allow-methods"?: string | undefined;
    "access-control-allow-origin"?: string | undefined;
    "access-control-expose-headers"?: string | undefined;
    "access-control-max-age"?: string | undefined;
    "access-control-request-headers"?: string | undefined;
    "access-control-request-method"?: string | undefined;
    age?: string | undefined;
    allow?: string | undefined;
    authorization?: string | undefined;
    "cache-control"?: string | undefined;
    "cdn-cache-control"?: string | undefined;
    connection?: string | undefined;
    "content-disposition"?: string | undefined;
    "content-encoding"?: string | undefined;
    "content-language"?: string | undefined;
    "content-length"?: string | undefined;
    "content-location"?: string | undefined;
    "content-range"?: string | undefined;
    "content-security-policy"?: string | undefined;
    "content-security-policy-report-only"?: string | undefined;
    cookie?: string | undefined;
    dav?: string | undefined;
    dnt?: string | undefined;
    date?: string | undefined;
    etag?: string | undefined;
    expect?: string | undefined;
    expires?: string | undefined;
    forwarded?: string | undefined;
    from?: string | undefined;
    host?: string | undefined;
    "if-match"?: string | undefined;
    "if-modified-since"?: string | undefined;
    "if-none-match"?: string | undefined;
    "if-range"?: string | undefined;
    "if-unmodified-since"?: string | undefined;
    "last-modified"?: string | undefined;
    link?: string | undefined;
    location?: string | undefined;
    "max-forwards"?: string | undefined;
    origin?: string | undefined;
    pragma?: string | undefined;
    "proxy-authenticate"?: string | undefined;
    "proxy-authorization"?: string | undefined;
    "public-key-pins"?: string | undefined;
    "public-key-pins-report-only"?: string | undefined;
    range?: string | undefined;
    referer?: string | undefined;
    "referrer-policy"?: string | undefined;
    refresh?: string | undefined;
    "retry-after"?: string | undefined;
    "sec-websocket-accept"?: string | undefined;
    "sec-websocket-extensions"?: string | undefined;
    "sec-websocket-key"?: string | undefined;
    "sec-websocket-protocol"?: string | undefined;
    "sec-websocket-version"?: string | undefined;
    server?: string | undefined;
    "set-cookie"?: string | undefined;
    "strict-transport-security"?: string | undefined;
    te?: string | undefined;
    trailer?: string | undefined;
    "transfer-encoding"?: string | undefined;
    "user-agent"?: string | undefined;
    upgrade?: string | undefined;
    "upgrade-insecure-requests"?: string | undefined;
    vary?: string | undefined;
    via?: string| undefined;
    warning?: string | undefined;
    "www-authenticate"?: string | undefined;
    "x-content-type-options"?: string | undefined;
    "x-dns-prefetch-control"?: string | undefined;
    "x-frame-options"?: string | undefined;
    "x-xss-protection"?: string | undefined;
}

/**
 * The type of object which can be used as the `spec` argument to `httpGet`, 
 * `httpPost`, `httpPut`, and `httpDelete`.
 */
export interface SpecificHttpSpec {
    url: string,
    params: { [key: string]: string },
    headers: OutgoingHttpHeaders,
    body: Json|string,
    contentType: ContentType,
    customCancel: CustomCancellorFactory,
    autoParseRequest: boolean,
    autoParseResponse: boolean,
    log: Log
}

/**
 * The type of object which can be used as the `spec` argument to `http`.
 */
export interface HttpSpec extends SpecificHttpSpec {
    method: HttpMethod
}

/** 
*  - `pathname`: string. Appends the url path. Should start with a "/".
*  - `params`: object. Represents query parameter keys and their values. 
Appends any params provided by the factory.
*  - `body`: Json|string. The request body. If provided, this will 
override any value given to the factory.
*  - `headers`: object. Additional headers to use in the request. These 
* are concantentated with any headers provided from the factory `spec`.
*  - `contentType`: String. See documentation for `spec.contentType`.
* Specifying the content-type in the header overrides this property completely.
*  - `autoParseRequest`: Boolean. See `spec.autoParseRequest`
* documentation. This will override the value provided in the factory.
*  - `autoParseResponse`: Boolean. See `spec.autoParseResponse` 
* documentation. This will override the value provided in the factory.
*  - `customCancel`: Function. A function factory. If provided, this 
* `customCancel` will override that provided by the factory. See 
* `spec.customCancel` documentations.
*/
export interface HttpMessage {
    pathname?: string,
    params?: { [key: string]: string },
    body?: Json | string,
    headers?: OutgoingHttpHeaders,
    contentType?: ContentType,
    autoParseRequest?: boolean,
    autoParseResponse?: boolean,
    customCancel?: CustomCancellorFactory
}

/**
 * A successful {@link Result} from
 * `http`/`httpGet`/`httpPost`/`httpPut`/`httpDelete` will have a `value` of 
 * the following type.
 * @template T
 * The type of the `data` property. It must be JSON serializable.
 */
export interface HttpResultValue<T extends Json = Json> {
    data: T|string,
    headers: IncomingHttpHeaders,
    statusCode?: number,
    statusMessage?: string
}

export type HttpRequestor<T extends Json = Json> = 
    Requestor<HttpResultValue<T>|undefined, HttpMessage>;

/**
 * The optional error callback which can be passed to effect callbacks in safety
 * wrapper methods. By default, this callback causes the receiver contained in 
 * the safety wrapper to receive a {@link Failure} whose `reason` property is 
 * the thrown value.  
 */
export type OnError = (error: unknown, tryReceiver: Receiver<any>) => void;

/**
 * The callback which can be passed to `doEffect` or `getEffect`.
 * The callback does not guarantee that the receiver contained in the safety 
 * wrapper is called. If the callback throws an error, that error is handled by 
 * the `onError` callback. If the callback returns any value that is not 
 * `undefined`, a {@link Result} with that value is passed to the receiver.  
 * @template T
 * The receiver contained in the safety wrapper receives a {@link Result} with 
 * a `value` property of this type. 
 * @param {SafetyWrapper<T>} safetyWrapper
 * A pointer to the safety wrapper. This allows the {@link Effect} to easily 
 * to perform pass another effect as a callback to some API, or to safely call 
 * the receiver using `tryReceiver`.
 */
export type Effect<T> = (
    safetyWrapper: SafetyWrapper<T>
) => void;

/**
 * Safely performs the {@link Effect} provided. Any errors thrown will be 
 * handled by the provided {@link OnError}. If no `onError` is provided, then 
 * the receiver contained by the safety wrapper will get a {@link Failure} 
 * containing the thrown value.
 * @param {Work<T>} work
 * @param {onError} [onError]
 */
export type DoEffect<T> = (
    effect: Effect<T>,
    onError?: OnError 
)  => void;

/**
 * Returns a {@link DoEffect} callback. Use this to pass effects as 
 * callbacks to APIs like `setTimeout`, `XMLHttpRequest`, Node APIs, etc.
 * @param {Work<T>} work
 * The work callback.
 * @param {onError} [onError]
 * The error handler.
 */
export type GetEffect<T> = (
    effect: Effect<T>,
    onError?: OnError 
)  => () => void;

/**
 * Wraps a {@link Receiver} with a collection of helper methods. Use this to 
 * remove the try-catch boilerplate that is present in well-designed requestors.
 * For example
 * 
 * @example
 * ```javascript
 * const myRequestor(receiver) {
 *     let id;
 * 
 *     try {
 *          
 *         // Do some stuff 
 * 
 *         id = setTimeout(() => {
 *             // This is async so it needs its 
 *             // own try catch
 *             try {
 *                 let value;
 * 
 *                 // Do async stuff
 * 
 *                 receiver({ value });
 *             }
 *             catch(reason) {
 *                 receiver({ reason });
 *             }
 *         }, 1000);
 *     }
 *     catch(reason) {
 *         receiver({ reason });
 *     }
 *     // provide cancellor
 *     return () => clearTimeout(id);
 * }
 * ```
 * 
 * is equivalent to
 * 
 * @example
 * ```javascript
 * import { utils } from "cms-nebula";
 * 
 * const { getSafetyWrapper } = utils;
 * 
 * const myRequestor(receiver) {
 *     let id;
 *     getSafetyWrapper(receiver).doEffect(({ getEffect }) => {
 * 
 *         // Do some stuff 
 *         
 *         id = setTimeout(getEffect(() => {
 *             let value;
 *             
 *             // Do async stuff
 * 
 *             return value;
 *         }), 1000);
 *     });
 *     
 *     // provide cancellor
 *     return () => clearTimeout(id);
 * }
 * ```
 * 
 * @template T
 * The receiver contained in this wrapper can receive results of this type.
 */
export interface SafetyWrapper<T> {
    doEffect: DoEffect<T>,
    getEffect: GetEffect<T>,
    tryReceiver: Receiver<T>
}

export type GetSafetyWrapper<T> = (receiver: Receiver<T>) => SafetyWrapper<T>;

export type MapRequestor<M, T> = Requestor<T, M>;

export type MapRequestorFactory<M, T> = 
    (mapper: (message?: M) => T) => MapRequestor<M, T>;

/**
 * @template M
 * The type of the message the requestor will receive.
 * @template T
 * The success value of the requestor for the `true` branch.
 * @template F
 * The success value of the requestor for the `false` branch.
 */
export type BranchRequestorFactory<M, T, F> = (
    condition: (message?: M) => boolean,
    ifTrue: Requestor<T, M>,
    ifFalse: Requestor<F, M>
) => Requestor<T|F, M>;

/**
 * @template M
 * The type of the message which is passed through.
 */
export type ThruRequestorFactory<M> = (
    sideEffect?: ((message: M) => void)
) => Requestor<M, M>

/**
 * @template M
 * The type of the message which is passed through.
 * @template T
 * The type of the evidence property attached to the failure reason. If not 
 * provided, the type is `never`.
 */
export type FailRequestorFactory<M, T = never> = (
    excuse?: string | ((message: M) => string),
    createEvidence?: (message: M) => T
) => Requestor<undefined, M>


export interface PromiseRequestorFactorySpec {
    cancellable?: boolean,
    customCancel?: (
        (reject: (reason?: any) => void) => (reason?: any) => void
    )
}

/**
 * @template T
 * The type of the value that the promise will resolve with.
 */
export type PromiseRequestorFactory<T> = (
    promise: Promise<T>,
    spec?: PromiseRequestorFactorySpec
) => Requestor<T>;

export type HttpRequestorMessagableFactory = (
    url: string,
    spec: HttpSpec
) => Requestor<HttpResultValue|undefined, string|Json|undefined>;

export type HttpRequestorNotMessagableFactory = (
    url: string,
    spec: HttpSpec
) => Requestor<HttpResultValue|undefined>;


declare module "cms-nebula" {

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
 * import { http } from "cms-nebula";
 * 
 * const doExpensiveRequest = http({
 *     url: "endpoint/of/request",
 *     
 *     // customCancel must be a function factory
 *     customCancel: (abortRequest, tryReceiver) => () => {
 *         
 *         // Request that server cancel expensive operation
 *         http({ 
 *             url: "endpoint/to/request/cancel" 
 *         })(() => {
 *             // no-op
 *         });
 *         
 *         // abortRequest simply calls 
 *         // XMLHttpRequest.abort.
 *         // The receiver will NOT be called if you 
 *         // execute `abortRequest` in time.
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
 * @template T 
 * The type of the result value returned by this requestor. The provided type 
 * must implement the Json interface. If no type is provided for `T`, then it 
 * defaults to the Json interface. 
 * 
 * @param {object} spec 
 * Configures the returned requestor.
 * @param {string} [spec.url] 
 * The endpoint of the request. This can include a username + password, port, 
 * query parameters, and a hash.
 * @param {{ [key: string]: string }} [spec.params] 
 * Represents query parameter keys and their values.  
 * @param {import("../../public-types").HttpMethod} [spec.method] 
 * "GET", "POST", "PUT", "DELETE", etc. If none is provided, then defaults to 
 * "GET".
 * @param {import("../../public-types").OutgoingHttpHeaders} [spec.headers]
 * The provided object should map header keys to their values.
 * @param {import("../../public-types").Json|string} [spec.body] 
 * If an object, then it is parsed into a string based on the provided content 
 * type (either from the header or the `spec.contentType`). If it is a string, 
 * then it is already parsed.
 * @param {import("../../public-types").ContentType} [spec.contentType] 
 * Determines how `value.body` is parsed into a string. If  
 * `"x-www-form-urlencoded"` or `"application/x-www-form-urlencoded"`, 
 * `value.body` is transformed into the format used by URL query parameters. If 
 * `"json"`, `"application/json"`, or `"default"`, `value.body` is transformed 
 * into a string by JSON.stringify. If no `contentType` is provided, then 
 * `"application/json"` is used by default. Specifying the content-type in the 
 * header overrides this property completely.
 * @param {import("../../public-types").CustomCancellorFactory} [spec.customCancel]
 * A function factory. It takes a method which destroys the request object 
 * represented by the requestor and returns a new function. Use this if you 
 * would like to make a request to the server to tell it to stop processing a 
 * request, since by default, the cancel function simply ignores whatever 
 * response is sent by the server.
 * @param {boolean} [spec.autoParseRequest]
 * If false, requests will not be automatically parsed. You must provide strings 
 * instead of objects as the request body.
 * @param {boolean} [spec.autoParseResponse]
 * If `false`, responses will be sent to the receiver as strings instead of 
 * objects. The receiver must manually parse the response.
 * @param {import("../../public-types").Log} [spec.log] 
 * Any errors will be sent to this function if it is provided. This should be 
 * used for logging purposes. Currently, only errors which occur during 
 * autoparsing with JSON.parse causes this function to be called.
 * @returns {import("../../public-types").HttpRequestor} 
 * An HTTP/HTTPS requestor. The returned requestor can take an optional 
 * `message` hash which can further configure the http request. See the 
 * documentation for the {@link HttpMessage}.
 */
export function http<T extends Json = Json>(spec: HttpSpec) : HttpRequestor<T>;

/**
 * Creates a requestor that makes a GET request.
 * 
 * For convenience, the requestor {@link Result} is a {@link Failure} if the 
 * status code of the HTTP request is not an integer in the 200's. This is 
 * *different* behavior from {@link http} which only fails if an error is thrown 
 * or if `XMLHttpRequest` calls the `onerror` listener.
 *  
 * @param {import("../../public-types").SpecificHttpSpec|string} url 
 * If a string, then the endpoint of the GET request. 
 * If you pass a `spec` object as the first argument, then the second parameter 
 * is ignored.
 * @param {import("../../public-types").SpecificHttpSpec} [spec] 
 * See the documentation for the `spec` parameter in 
 * {@link httpRequestor}. If you provide a method property in this spec, it is 
 * ignored.
 * @returns {import("../../public-types").HttpRequestor} 
 * An {@link HttpRequestor}.
 */
export function httpGet<T extends Json = Json>(
    url: string, 
    spec?: SpecificHttpSpec) 
: HttpRequestor<T>;

/**
 * Creates a requestor that makes a POST request.
 * 
 * For convenience, the requestor {@link Result} is a {@link Failure} if the 
 * status code of the HTTP request is not an integer in the 200's. This is 
 * *different* behavior from {@link http} which only fails if an error is thrown 
 * or if `XMLHttpRequest` calls the `onerror` listener.
 * 
 * @param {import("../../public-types").SpecificHttpSpec|string} url 
 * If a string, then the endpoint of the GET request. 
 * If you pass a `spec` object as the first argument, then the second parameter 
 * is ignored.
 * @param {import("../../public-types").SpecificHttpSpec} [spec] 
 * See the documentation for the `spec` parameter in 
 * {@link httpRequestor}. If you provide a method property in this spec, it is 
 * ignored.
 * @returns {import("../../public-types").HttpRequestor} 
 * An {@link HttpRequestor}.
 */
export function httpPost<T extends Json = Json>(
    url: string, 
    spec?: SpecificHttpSpec) 
: HttpRequestor<T>;

/**
 * Creates a requestor that makes a PUT request.
 * 
 * For convenience, the requestor {@link Result} is a {@link Failure} if the 
 * status code of the HTTP request is not an integer in the 200's. This is 
 * *different* behavior from {@link http} which only fails if an error is thrown 
 * or if `XMLHttpRequest` calls the `onerror` listener.
 * 
 * @param {import("../../public-types").SpecificHttpSpec|string} url 
 * If a string, then the endpoint of the GET request. 
 * If you pass a `spec` object as the first argument, then the second parameter 
 * is ignored.
 * @param {import("../../public-types").SpecificHttpSpec} [spec] 
 * See the documentation for the `spec` parameter in 
 * {@link httpRequestor}. If you provide a method property in this spec, it is 
 * ignored.
 * @returns {import("../../public-types").HttpRequestor} 
 * An {@link HttpRequestor}.
 */
export function httpPut<T extends Json = Json>(
    url: string, 
    spec?: SpecificHttpSpec) 
: HttpRequestor<T>;

/**
 * Creates a requestor that makes a DELETE request.
 * @param {import("../../public-types").SpecificHttpSpec|string} url 
 * If a string, then the endpoint of the GET request. 
 * If you pass a `spec` object as the first argument, then the second parameter 
 * is ignored.
 * @param {import("../../public-types").SpecificHttpSpec} [spec] 
 * See the documentation for the `spec` parameter in 
 * {@link httpRequestor}. If you provide a method property in this spec, it is 
 * ignored.
 * @returns {import("../../public-types").HttpRequestor} 
 * An {@link HttpRequestor}.
 */
export function httpDelete<T extends Json = Json>(
    url: string, 
    spec?: SpecificHttpSpec) 
: HttpRequestor<T>;

/** An alias for {@link httpGet}. */
export function get<T extends Json = Json>(
    url: string, 
    spec?: SpecificHttpSpec) 
: HttpRequestor<T>;

/** An alias for {@link httpPost}. */
export function post<T extends Json = Json>(
    url: string, 
    spec?: SpecificHttpSpec) 
: HttpRequestor<T>;

/** An alias for {@link httpPut}. */
export function put<T extends Json = Json>(
    url: string, 
    spec?: SpecificHttpSpec) 
: HttpRequestor<T>;

/** An alias for {@link httpGet}. */
export function GET<T extends Json = Json>(
    url: string, 
    spec?: SpecificHttpSpec) 
: HttpRequestor<T>;

/** An alias for {@link httpPost}. */
export function POST<T extends Json = Json>(
    url: string, 
    spec?: SpecificHttpSpec) 
: HttpRequestor<T>;

/** An alias for {@link httpPut}. */
export function PUT<T extends Json = Json>(
    url: string, 
    spec?: SpecificHttpSpec) 
: HttpRequestor<T>;

/** An alias for {@link httpDelete}. */
export function DELETE<T extends Json = Json>(
    url: string, 
    spec?: SpecificHttpSpec) 
: HttpRequestor<T>;

/**
 * Creates a requestor whose {@link Result} value is a mapping of its message.
 * 
 * This is most useful in {@link sequence} to link requestors whose Result value 
 * and message would otherwise fail to coordinate.
 * 
 * @example
 * ```javascript
 * import parsec from "cms-parsec";
 * import { get, map, post } from "cms-nebula";
 * 
 * // get item and save it to database
 * parsec.sequence([
 *     get("https://api.com/item"),
 * 
 *     map(response => response.data),
 * 
 *     post("https://database.com/api/items")
 * ])(({ value, reason }) => {
 *     if (!value) {
 *         console.log(reason);
 *     }
 * 
 *     console.log(value.data);
 * });
 * 
 * ```
 * 
 * @param mapper 
 * A callback which takes the message and returns its mapping.
 * @returns 
 * A requestor whose receiver Result contains the mapped message.
 */
export function map<M, T>(
    mapper: (message?: M) => T
) : Requestor<T, M>;

/**
 * Creates a requestor whose {@link Result} value is its message.
 * @param sideEffect 
 * A side effect that can be used to log the message passed through.
 */
export function thru<M>(sideEffect?: (message: M) => void) : Requestor<M, M>;

/**
 * Creates a requestor which conditionally runs one of two requestors.
 * @param condition 
 * A callback which takes the message and returns a boolean.
 * @param ifTrue
 * The requestor performed if `condition` returns `true`.
 * @param ifFalse
 * The requestor performed if `condition` returns `false`.
 */
export function branch<M, T, F>(
    condition: (message: M) => boolean,
    ifTrue: Requestor<T, M>,
    ifFalse: Requestor<F, M>
) : Requestor<T, M>|Requestor<F, M>;

/**
 * Creates a requestor which whose {@link Result} is a {@link Failure}.
 * @param excuse 
 * The message in the error object contained in the Result. If a function, then 
 * it must take the message provided to the requestor and return a string.
 * @param evidence 
 * Adds an optional `evidence` property to the error object. If a function, then 
 * it must take the message provided to the requestor and return the something 
 * of any type.
 * @returns 
 * A requestor which fails.
 */
export function fail<M>(
    excuse: string | ((message?: M) => string),
    evidence?: import("./private-types").NotAFunction | ((message?: M) => any)
) : Requestor<undefined, M>;

/**
 * Creates a requestor which wraps a promise.
 * When the promise resolves, the receiver is called with the resolved value. If 
 * the promise rejects, the receiver result gets an undefined value and a reason 
 * containing the rejected reason.
 * 
 * By default, the cancellor for this function simply forces the promise to 
 * reject. If you would also like to send a request to a server (say, an attempt 
 * to cancel an expensive calculation that was requested), then use can use 
 * `spec.customCancel`. See the following example:
 * 
 * @example
 * ```
 * const getRequestor = usePromise(fetch(ENDPOINT), {
 *     cancellable: true,
 *     customCancel: (reject) => () => {
 *         
 *         // use whatever tools you have 
 *         // to make a request to the 
 *         // server to try to cancel the 
 *         // expensive request
 *         fetch(CANCEL_ENDPOINT);
 *         
 *         // force promise to reject
 *         reject(); 
 *     }
 * });
 * 
 * @param thenable 
 * The promise or thenable to wrap.
 * @param [spec] 
 * Configures the requestor.
 * @param [spec.cancellable]
 * 
 * @param [spec.customCancellor]
 * If provided, must be a function factory which returns a new cancellor. The 
 * function factory receives a function which forces the promise to reject.
 */
export function usePromise<T, M = any>(
    thenable: Promise<T>, 
    spec: { 
        cancellable?: true,
        customCancellor?: (reject: (reason?: any) => void) => 
            (reason?: any) => void;
}) : Requestor<T, M>;

/**
 * Sends `HttpResponseValue` thru only if it adheres to a condition.
 * 
 * @template T
 * The type of the `data` property contained in the `HttpResponseValue`. If none 
 * is provided, `Json` is used. Any provided value must inherit the `Json` 
 * interface.
 * 
 * @param condition 
 * A function which takes an `HttpResponseValue` and returns a boolean.
 * @param [excuse]
 * On failure, determines the message in the error object provided as the 
 * reason. It must be a string or a function which takes an `HttpResponseValue` 
 * and returns a string.
 * @param [evidence]
 * On failure, determines the `evidence` property on the returned object. If a 
 * function, it must take an `HttpResponseValue` and returns any value.
 */
export function isStatus<T extends Json = Json>(
    condition: (message?: HttpResultValue<T>) => boolean,
    excuse?: string|((message?: HttpResultValue<T>) => string),
    evidence?: (message?: HttpResultValue<T>) => any,
) : Requestor<T, HttpResultValue<T>>;

/**
 * Passes `HttpResponseValue` thru if it has the status code 200.
 * 
 * @template T
 * The type of the `data` property contained in the `HttpResponseValue`. If none 
 * is provided, `Json` is used. Any provided value must inherit the `Json` 
 * interface.
 * 
 * @param [excuse]
 * On failure, determines the message in the error object provided as the 
 * reason. It must be a string or a function which takes an `HttpResponseValue` 
 * and returns a string.
 * @param [evidence]
 * On failure, determines the `evidence` property on the returned object. If a 
 * function, it must take an `HttpResponseValue` and returns any value.
 */
export function isOk<T extends Json = Json>(
    excuse?: string|((message?: HttpResultValue<T>) => string),
    evidence?: (message?: HttpResultValue<T>) => any,
) : Requestor<T, HttpResultValue<T>>;

/**
 * Passes `HttpResponseValue` thru if it has the status code 201.
 * 
 * @template T
 * The type of the `data` property contained in the `HttpResponseValue`. If none 
 * is provided, `Json` is used. Any provided value must inherit the `Json` 
 * interface.
 * 
 * @param [excuse]
 * On failure, determines the message in the error object provided as the 
 * reason. It must be a string or a function which takes an `HttpResponseValue` 
 * and returns a string.
 * @param [evidence]
 * On failure, determines the `evidence` property on the returned object. If a 
 * function, it must take an `HttpResponseValue` and returns any value.
 */
export function isCreated<T extends Json = Json>(
    excuse?: string|((message?: HttpResultValue<T>) => string),
    evidence?: (message?: HttpResultValue<T>) => any,
) : Requestor<T, HttpResultValue<T>>;


/**
 * Passes `HttpResponseValue` thru if it has the status code in the 200's.
 * 
 * @template T
 * The type of the `data` property contained in the `HttpResponseValue`. If none 
 * is provided, `Json` is used. Any provided value must inherit the `Json` 
 * interface.
 * 
 * @param [excuse]
 * On failure, determines the message in the error object provided as the 
 * reason. It must be a string or a function which takes an `HttpResponseValue` 
 * and returns a string.
 * @param [evidence]
 * On failure, determines the `evidence` property on the returned object. If a 
 * function, it must take an `HttpResponseValue` and returns any value.
 */
export function is2xx<T extends Json = Json>(
    excuse?: string|((message?: HttpResultValue<T>) => string),
    evidence?: (message?: HttpResultValue<T>) => any,
) : Requestor<T, HttpResultValue<T>>
}
