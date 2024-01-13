/**
 * @param {import("../../public-types").Receiver<any>} receiver
 */
export function checkReceiver(receiver) {
    if (receiver === Function.prototype ||
        typeof receiver !== "function" ||
        receiver.length !== 1)
        throw Object.assign(
            new Error("receivers must be functions of one argument"),
            { reason: receiver });
}

/**
 * @param {import("../../public-types").Requestor<any>} requestor
 */
export function checkRequestor(requestor) {
    if (requestor === Function.prototype ||
        typeof requestor !== "function" ||
        requestor.length < 1 ||
        requestor.length > 2)
        throw Object.assign(
            new Error("receivers must be functions of one or two arguments"),
            { reason: requestor });
}

/**
 * @param {import("../../public-types").Requestor<any>[]} requestors
 */
export function checkRequestors(requestors) {
    if (!Array.isArray(requestors)) throw Object.assign(
        new Error("must be an array of requestors"),
        { reason: requestors });
    requestors.forEach(checkRequestor);
}

/** @type {import("../../public-types").GetSafetyWrapper<any>} */
export function getSafetyWrapper(receiver) {
    let allowReceiver = true;

    /** @param {import("../../public-types").Result<any>} result */
    function tryReceiver(result) {
        if (!allowReceiver) return;
        checkReceiver(receiver);
        receiver(result);
        allowReceiver = false;
    }

    /** @type {import("../../public-types").SafetyWrapper<any>} */
    let wrapper;

    /**
     * @param {import("../../public-types").Effect<any>} effect 
     * @param {import("../../public-types").OnError|undefined} onError 
     */
    function doEffect(effect, onError) {
        try {
            const value = effect(wrapper);
            if (value !== undefined) tryReceiver({ value });
        }
        catch(error) {
            if (onError === undefined || typeof onError !== "function")
                onError = (reason, tryReceiver) =>
                    tryReceiver({ reason });
            onError(error, tryReceiver);
        }
    }

    /**
     * @param {import("../../public-types").Effect<any>} effect 
     * @param {import("../../public-types").OnError|undefined} onError 
     * @returns {() => void}
     */
    function getEffect(effect, onError) {
        return () => {
            doEffect(effect, onError);
        };
    }

    wrapper = Object.assign(Object.create(null), {
        doEffect,
        getEffect,
        tryReceiver
    });

    return Object.freeze(wrapper);
}

const utils = Object.freeze({
    checkReceiver,
    checkRequestor,
    checkRequestors,
    getSafetyWrapper
});

export default utils;
 