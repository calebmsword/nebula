import parsec from "cms-parsec";
import { 
    httpRequestor, 
    httpRequestorGet, 
    httpRequestorPost, 
    httpRequestorPut, 
    httpRequestorDelete 
} from "../http/http.js";
import { getSafetyWrapper } from "../utils/utils.js";

/**
 * @template T 
 * @template [M = any] 
 * @typedef {import("../../public-types").Requestor<T, M>} Requestor
 */

/**
 * Creates a requestor whose {@link Result} value is a mapping of its message.
 * 
 * @template T
 * The type returned by the mapper function passed to the factory.
 * @template M 
 * The type of the message passed to the requestor.
 * 
 * @param {(message?: M) => T} mapper 
 * A callback which takes the message and returns its mapping.
 * @returns {import("../../public-types").Requestor<T, M>}
 * A requestor whose receiver Result contains the mapped message.
 */
export function map(mapper) {
    return function mapRequestor(receiver, message) {
        getSafetyWrapper(receiver).doEffect(() => {
            const mapped = mapper(message);
            console.log(mapped)
            if (mapped === undefined) throw new Error(
                "map requestor returned undefined");
            return mapped;
        });
    }
}

/**
 * Creates a requestor which conditionally runs one of two requestors.
 * 
 * @template M 
 * 
 * @template T 
 * 
 * @template F
 * 
 * @param {(message?: M) => boolean} condition 
 * A callback which takes the message and returns a boolean.
 * @param {import("../../public-types").Requestor<T, M>} ifTrue
 * The requestor performed if `condition` returns `true`.
 * @param {import("../../public-types").Requestor<F, M>} ifFalse
 * The requestor performed if `condition` returns `false`.
 * @returns {import("../../public-types").Requestor<T|F, M>}
 */
export function branch(condition, ifTrue, ifFalse) {
    return function branchRequestor(receiver, message) {

        /** @type {import("../../public-types.js").Cancellor|void|undefined} */
        let cancellor;

        getSafetyWrapper(receiver).doEffect(() => {
            const boolean = condition(message);
            if (typeof boolean !== "boolean") 
                throw Object.assign(
                    new Error("branch condition did not return a boolean"),
                    { evidence: boolean });

            cancellor = boolean 
                ? ifTrue(receiver, message) 
                : ifFalse(receiver, message);
        });

        if (cancellor !== undefined) return cancellor;
    }
}

/**
 * Creates a requestor whose {@link Result} value is its message.
 * 
 * @template M 
 * 
 * @param {(message?: M) => M} [sideEffect] 
 * @returns {import("../../public-types").Requestor<M, M>}
 * A side effect that can be used to log the message passed through.
 */
export function thru(sideEffect) {
    return function thruRequestor(receiver, message) {

        /** @type {any} */
        let messageProxy = message;

        getSafetyWrapper(receiver).doEffect(() => {
            if (typeof message === "object" && message !== null)
                messageProxy = new Proxy(message, {
                    set() {
                        throw new TypeError(
                            "This object is a read-only proxy of the message " + 
                            "sent to the receiver!");
                    }
                });
            
            if (typeof sideEffect === "function")
                sideEffect(messageProxy);

            return message;
        });
    }
}

/**
 * Creates a requestor which whose {@link Result} is a {@link Failure}.
 * 
 * @template M
 * 
 * @param {string|((message?: M) => string)} excuse 
 * The message in the error object contained in the Result. If a function, then 
 * it must take the message provided to the requestor and return a string.
 * @param {import("../../private-types").NotAFunction|((message?: M) => any)} [createEvidence]
 * Adds an optional `evidence` property to the error object. If a function, then 
 * it must take the message provided to the requestor and return the something 
 * of any type.
 * @returns {import("../../public-types").Requestor<undefined, M>}
 * A requestor which fails.
 */
export function fail(excuse, createEvidence) {
    return function failRequestor(receiver, message) {
        getSafetyWrapper(receiver).doEffect(() => {

            const evidence = typeof createEvidence === "function"
                ? createEvidence(message)
                : message;

            excuse = typeof excuse === "function"
                ? excuse(message)
                : excuse;

            throw Object.assign(
                new Error(excuse),
                evidence !== null && evidence !== undefined
                    ? { evidence }
                    : {});
        });
    }
}

/**
 * Creates a requestor which wraps a promise.
 * 
 * @template T 
 * 
 * @template M 
 * 
 * @param {Promise<T>} thenable 
 * The promise or thenable to wrap.
 * @param {object} [spec] 
 * Configures the requestor.
 * @param {boolean} [spec.cancellable=true]
 * Whether or not the promise is cancellable.
 * @param {(reject: (reason?: any) => void) => (reason?: any) => void} [spec.customCancel]
 * If provided, must be a function factory which returns a new cancellor. The 
 * function factory receives a function which forces the promise to reject.
 * @returns {import("../../public-types").Requestor<T, M>}
 */
export function usePromise(thenable, spec) {
    let {
        cancellable = true,
        customCancel
    } = spec || {};

    /** @type {((reason?: any) => void)|undefined} */
    let cancel;

    /** @type {Promise<T>} */
    const promise = new Promise((resolve, reject) => {
        Promise.resolve(thenable)
            .then(resolve)
            .catch(reject);
        if (cancellable === true) cancel = reject;
    });

    if (cancellable === true) {
        if (typeof customCancel !== "function")
            customCancel = reject => () => reject();

        if (customCancel !== undefined && cancel !== undefined)
            cancel = customCancel(cancel);

        if (typeof cancel !== "function") 
            throw Object.assign(
                new Error("customCancel must return a function"),
                { evidence: cancel });
    }

    return function promiseRequestor(receiver) {
        promise
            .then(value => receiver({ value }))
            .catch(reason => receiver({ reason }));
        if (cancellable === true) return cancel;
    }
}


/**
 * @param {(response?: import("../../public-types").HttpResultValue|undefined) => boolean} condition
 * @param {string|((message: any) => string)} [excuse]
 * @param {(message?: any) => any} [evidence]
 */
export function isStatus(condition, excuse, evidence) {
    return branch(
        condition,
        thru(),
        fail(
            excuse === undefined
                ? res => `${res.statusCode}: ${res.statusMessage}`
                : excuse,
            evidence)
    );
}

/**
 * @param {string|((message: any) => string)} [excuse]
 * @param {(message: any) => boolean} [evidence]
 */
export function isOk(excuse, evidence) {
    return isStatus(response => response?.statusCode === 200, excuse, evidence);
}

/**
 * @param {string|((message: any) => string)} [excuse]
 * @param {(message: any) => boolean} [evidence]
 */
export function isCreated(excuse, evidence) {
    return isStatus(response => response?.statusCode === 201, excuse, evidence);
}

/**
 * @param {string|((message: any) => string)} [excuse]
 * @param {(message: any) => boolean} [evidence]
 */
export function is2xx(excuse, evidence) {
    return isStatus(response => response?.statusCode !== undefined && 
                                Number.isSafeInteger(response.statusCode) && 
                                response.statusCode > 199 && 
                                response.statusCode < 300,
                    excuse, 
                    evidence);
}

export const http = httpRequestor;

/**
 * @typedef {import("../../public-types").Json} Json
 */

/**
 * @template [T = Json]
 * @typedef {import("../../public-types").HttpResultValue} HttpResultValue<T>
 */

/**
 * @template T 
 * 
 * @param {import("../../public-types").SpecificHttpSpec|string} url 
 * If a string, then the endpoint of the GET request. If you pass a `spec` 
 * object as the first argument, then the second parameter is ignored.
 * @param {import("../../public-types").SpecificHttpSpec} spec 
 * See the documentation for the `spec` parameter in {@link httpRequestor}. If 
 * you provide a method property in this spec, it is ignored.
 * @returns {Requestor<HttpResultValue<T>|undefined, any>} 
 * A requestor. See documentation for the return value of {@link httpRequestor}.
 */
export function httpGet(url, spec) {
    
    return parsec.sequence([
        // no matter the message, pass empty config hash to httpRequestorGet
        map(() => ({})),
        httpRequestorGet(url, spec),
        is2xx(),
    ]);
}

/**
 * @param {import("../../public-types").SpecificHttpSpec|string} url 
 * If a string, then the endpoint of the POST request. If you pass a `spec` 
 * object as the first argument, then the second parameter is ignored.
 * @param {import("../../public-types").SpecificHttpSpec} spec 
 * See the documentation for the `spec` parameter in {@link httpRequestor}. If 
 * you provide a method property in this spec, it is ignored.
 * @returns {import("../../public-types").HttpRequestor<Json, Json>} 
 * A requestor. See documentation for the return value of 
 * {@link httpRequestor}.
 */
export function httpPost(url, spec) {
    return parsec.sequence([
        map(
            /** @type {(message?: Json|string) => { body: Json|string }}*/ 
            message => typeof message === "object" || 
                       typeof message === "string"
                        ? ({ body: message })
                        : ({ body: {} })
        ),
        httpRequestorPost(url, spec),
        is2xx()
    ]);
} 

/**
 * @param {import("../../public-types").SpecificHttpSpec|string} url 
 * If a string, then the endpoint of the PUT request. If you pass a `spec` 
 * object as the first argument, then the second parameter is ignored.
 * @param {import("../../public-types").SpecificHttpSpec} spec 
 * See the documentation for the `spec` parameter in {@link httpRequestor}. If 
 * you provide a method property in this spec, it is ignored.
 * @returns {import("../../public-types").HttpRequestor<Json, Json>} 
 * A requestor. See documentation for the return value of 
 * {@link httpRequestor}.
 */
export function httpPut(url, spec) {
    return parsec.sequence([
        map(
            /** @type {(message?: Json|string) => { body: Json|string }}*/ 
            message => typeof message === "object" || 
                       typeof message === "string"
                        ? ({ body: message })
                        : ({ body: {} })
        ),
        httpRequestorPut(url, spec),
        is2xx()
    ]);
}

/**
 * @param {import("../../public-types").SpecificHttpSpec|string} url 
 * If a string, then the endpoint of the DELETE request. If you pass a `spec` 
 * object as the first argument, then the second parameter is ignored.
 * @param {import("../../public-types").SpecificHttpSpec} spec 
 * See the documentation for the `spec` parameter in {@link httpRequestor}. If 
 * you provide a method property in this spec, it is ignored.
 * @returns {import("../../public-types").HttpRequestor<Json, any>} 
 * A requestor. See documentation for the return value of 
 * {@link httpRequestor}.
 */
export function httpDelete(url, spec) {
    return parsec.sequence([
        map(() => ({})),
        httpRequestorDelete(url, spec),
        is2xx(),
    ]);
}
