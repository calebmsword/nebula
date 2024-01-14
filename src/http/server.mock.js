const jsonMimeBoilerplate = { "Content-Type": "application/json" };

/** @param {any} message  */
const jsonMessage = message => ({ message });

/** 
 * @param {import("../../public-types").Json} body
 * @returns {import("../../private-types").MockServerResponse} 
 */
const failureBoilerplate = (body = {}) => ({
    responseText: JSON.stringify({ ...body }),
    status: 404,
    headers: { ...jsonMimeBoilerplate }
});

let id = 0;
const getId = () => id++;

/** @type {import("../../private-types").MockStorage} */
const store = Object.create(null);

/**
 * @param {import("../../private-types").Hostname} hostname 
 * @param {import("../../private-types").Port} port 
 * @param {number|string} id 
 */
const get = (hostname, port, id) => {
    try {
        return store[hostname][port][id]
    }
    catch(error) {
        return;
    }
}

/**
 * @param {import("../../private-types").Hostname} hostname 
 * @param {import("../../private-types").Port} port 
 * @param {import("../../public-types").Json} json 
 */
const save = (hostname, port, json) => {
    try {
        if (typeof json === "object" &&
            !Array.isArray(json) &&
            typeof json.id === "number"
        ) {
            json.id = getId();
            store[hostname][port][json.id] = json;
            return json;
        }

    }
    catch(error) {
        return;
    }
}

/**
 * @param {import("../../private-types").Hostname} hostname 
 * @param {import("../../private-types").Port} port 
 * @param {string|number} id 
 * @param {import("../../public-types").Json} json 
 */
const update = (hostname, port, id, json) => {
    try {
        if (store[hostname][port][id] === undefined) return;
        store[hostname][port][id] = Object.assign(json, { id });
        return json;
    }
    catch(error) {
        return;
    }

}

/**
 * @param {import("../../private-types").Hostname} hostname 
 * @param {import("../../private-types").Port} port 
 * @param {string|number} id
 */
const remove = (hostname, port, id) => {
    try {
        delete store[hostname][port][id];
        return jsonMessage("deletion successful");
    }
    catch(error) {
        return;
    }
}

/** @type {import("../../private-types").MockServerConfig} */
const mockServerConfig = {
    "cheese.com/api": {
        80: {
            https: false,
            GET: () => ({
                responseText: JSON.stringify({ 
                    cheese: "gruyere" 
                }),
                status: 200,
                headers: { ...jsonMimeBoilerplate }
            }),
        },
        443: {
            http: false,
            POST: (headers, params, body) => ({ 
                responseText: JSON.stringify({
                    createdAt: Date.now(),
                    ...(typeof body === "string" 
                            ? JSON.parse(body) 
                            : body 
                        || {})
                }), 
                status: 201,
                headers: { ...jsonMimeBoilerplate }
            }),
        }
    }
};

/**
 * @param {import("../../public-types").Receiver<import("../../private-types").MockServerResponse>} receiver 
 * @param {object} options 
 * @param {"http"|"https"} options.protocol
 * @param {string} [options.host]
 * @param {string|number} [options.port]
 * @param {import("../../public-types").HttpMethod} options.method
 * @param {import("../../public-types").Json|string} [options.body]
 * @param {{ [key: string]: string }} [options.params]
 * @param {import("../../public-types").OutgoingHttpHeaders} [options.headers]
 * @return {import("../../public-types").Cancellor}
 */
export function doRequest(receiver, options) {
    try {
        const {
            protocol,
            host,
            port,
            method,
            body,
            params,
            headers
        } = options;
    
        const endpoint = mockServerConfig
            [host || String(host)]
            [port || protocol === "https" ? 443 : 80];
    
        /** @type {import("../../private-types").MockServerResponse}|undefined */
        let result;
        const getResponse = endpoint[method];
    
        if (endpoint[protocol] === false) 
            result = failureBoilerplate({
                error: "protocol not supported"
            });
        else if (typeof getResponse !== "function") 
            result = failureBoilerplate({
                error: "HTTP method not supported"
            });
        else if (getResponse !== undefined) 
            result = getResponse(headers, params, body);

        const id = setTimeout(() => {
            receiver({ value: result });
        }, 0);

        return () => clearTimeout(id);
    }
    catch(reason) {
        const id = setTimeout(() => {
            receiver({ reason });
        }, 0);
        return () => clearTimeout(id);  
    }
}

/**
 * @param {import("../../public-types").Receiver<import("../../private-types").MockServerResponse>} receiver 
 * @param {object} options 
 * @param {string} [options.host]
 * @param {string|number} [options.port=80]
 * @param {import("../../public-types").HttpMethod} options.method
 * @param {import("../../public-types").Json|string} [options.body]
 * @param {{ [key: string]: string }} [options.params]
 * @param {import("../../public-types").OutgoingHttpHeaders} [options.headers]
 * @return {import("../../public-types").Cancellor}
 */
export function doRequestHttp(receiver, options) {
    return doRequest(receiver, {
        protocol: "http",
        port: options.port || 80,
        ...options
    });
}

/**
 * @param {import("../../public-types").Receiver<import("../../private-types").MockServerResponse>} receiver 
 * @param {object} options 
 * @param {string} [options.host]
 * @param {string|number} [options.port=443]
 * @param {import("../../public-types").HttpMethod} options.method
 * @param {import("../../public-types").Json|string} [options.body]
 * @param {{ [key: string]: string }} [options.params]
 * @param {import("../../public-types").OutgoingHttpHeaders} [options.headers]
 * @return {import("../../public-types").Cancellor}
 */
export function doRequestHttps(receiver, options) {
    return doRequest(receiver, {
        protocol: "https",
        port: options.port || 443,
        ...options
    });
}
