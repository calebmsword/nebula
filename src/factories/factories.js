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
 * @template M
 * @type {import("../../public-types").MapRequestorFactory<T, M>} 
 */
export function map(mapper) {
    return function mapRequestor(receiver, message) {
        getSafetyWrapper(receiver).doEffect(() => {
            return mapper(message);
        });
    }
}

/** 
 * @type {import("../../public-types").BranchRequestorFactory<any, any, any>} 
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

/** @type {import("../../public-types.js").ThruRequestorFactory<any>} */
export function thru(sideEffect) {
    return function thruRequestor(receiver, message) {

        /** @type {any} */
        let messageProxy = message;

        getSafetyWrapper(receiver).doEffect(() => {
            if (typeof message === "object")
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

/** @type {import("../../public-types.js").FailRequestorFactory<any, any>} */
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

/** @type {import("../../public-types.js").PromiseRequestorFactory<any>} */
export function usePromise(thenable, spec) {
    let {
        cancellable = true,
        customCancel
    } = spec || {};

    /** @type {((reason?: any) => void)|undefined} */
    let cancel;

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
        getSafetyWrapper(receiver).doEffect(() => {
            promise
                .then(value => receiver({ value }))
                .catch(reason => receiver({ reason }));
            if (cancellable === true) return cancel;
        });
    }
}


/**
 * @param {(response?: import("../../public-types").HttpResultValue|undefined) => boolean} condition
 * @param {string|((message: any) => string)} [excuse]
 * @param {(message: any) => boolean} [evidence]
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

/** @type {import("../../public-types").HttpRequestorNotMessagableFactory} */
export function httpGet(url, spec) {
    return parsec.sequence([
        httpRequestorGet(url, spec),
        is2xx()
    ]);
}

/** @type {import("../../public-types").HttpRequestorMessagableFactory} */
export function httpPost(url, spec) {
    return parsec.sequence([
        function httpOrHttpsRequestor(receiver, message) {
            httpRequestorPost({ ...spec, url })
                (receiver, { body: message })
        },
        is2xx()
    ]);
}

/** @type {import("../../public-types").HttpRequestorMessagableFactory} */
export function httpPut(url, spec) {
    return parsec.sequence([
        function httpOrHttpsRequestor(receiver, message) {
            httpRequestorPut({ ...spec, url })
                (receiver, { body: message })
        },
        is2xx()
    ]);
}

/** @type {import("../../public-types").HttpRequestorNotMessagableFactory} */
export function httpDelete(url, spec) {
    return parsec.sequence([
        httpRequestorDelete(url, spec),
        is2xx(),
    ]);
}
