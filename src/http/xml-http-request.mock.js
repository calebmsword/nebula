import { doRequestHttp, doRequestHttps } from "./server.mock.js";

/**
 * An incomplete mock of XMLHttpRequest.
 * 
 * With this, we can use XMLHttpRequest in Node in (most of) the same ways it 
 * can be used in the browser:
 * 
 * @example
 * ```
 * if (typeof globalThis.XMLHttpRequest !== "function")
 *     globalThis.XMLHttpRequest = MockXMLHttpRequest;
 * 
 * // this will work like it does in the browser
 * const request = new XMLHttpRequest();
 * ```
 * 
 * This class wraps usage of Node's `http.request` or `https.request` API (or 
 * the `fs` module, if you use XMLHttpRequest to grab a local file).
 * 
 * This mock was created to emulate the subset of the XMLHttpRequest API that 
 * nebula uses and it should not be used for any other purpose. There are many 
 * features in the browser specification for XMLHttpRequest that are missing or 
 * incorrect. Let "request" represent an XMLHttpRequest instance:
 *  - request.responseXML is always null.
 *  - request.overrideMimeType() is not implemented.
 *  - request.upload is not present.
 *  - request.timeout is not present.
 *  - events are not passed a mock of the event object.
 *  - Cookies are not persisted between requests.
 *  - Synchronous behavior is NOT implemented. (This is for security reasons, as
 * the current known methods for running async http requests with node utilize 
 * extremely insecure interactions between JSON.parse and child processes.)
 *  - Local file access encodes all files as UTF-8.
 * 
 * This mock is nearly an exact copy of that from 
 * https://github.com/driverdan/node-XMLHttpRequest. The differences from the 
 * original implementation remove deprecated method calls, uses modern ES6 
 * syntax, and excludes the extremely insecure implementation of synchronous 
 * http.request calls. The original repo uses the MIT license, so this is fine.
 * 
 * I also consulted 
 * https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest for much of 
 * the documentation for this class.
 */
class MockXMLHttpRequest {

    // properties ----------------------------------------

    /**
     * Represents the UNSENT readystate.
     * @type {number}
     */
    static UNSENT = 0;

    /**
     * Represents the OPENED readystate.
     * @type {number}
     */
    static OPENED = 1;

    /**
     * Represents the HEADERS_RECEIVED readystate.
     * @type {number}
     */
    static HEADERS_RECEIVED = 2;
    
    /**
     * Represents the LOADING readystate.
     * @type {number}
     */
    static LOADING = 3;
    
    /**
     * Represents the DONE readystate.
     * @type {number}
     */
    static DONE = 4;

    /**
     * Represents the UNSENT readystate.
     * @type {number}
     */
    UNSENT = 0;
    
    /**
     * Represents the OPENED readystate.
     * @type {number}
     */
    OPENED = 1;
    
    /**
     * Represents the HEADERS_RECEIVED readystate.
     * @type {number}
     */
    HEADERS_RECEIVED = 2;
    
    /**
     * Represents the LOADING readystate.
     * @type {number}
     */
    LOADING = 3;
    
    /**
     * Represents the DONE readystate.
     * @type {number}
     */
    DONE = 4;

    /**
     * The current state of the request.
     * @type {number}
     */
    readyState = this.UNSENT;

    /**
     * Handler called once an opened request is sent.
     * This function is called, without arguments, every time `readyState`
     * changes value.
     * @type {(() => void)|null}
     */
    onreadystatechange = null;

    /**
     * "loadstart" event handler.
     * @type {(() => void)|null}
     */
    onloadstart = null;

    /**
     * "abort" event handler.
     * @type {(() => void)|null}
     */
    onabort = null;

    /**
     * "load" event handler.
     * @type {(() => void)|null}
     */
    onload = null;

    /**
     * "loadend" event handler.
     * @type {(() => void)|null}
     */
    onloadend = null;

    /**
     * "error" event handler.
     * @type {(() => void)|null}
     */
    onerror = null;

    /**
     * This is the text body sent by a server request.
     * @type {String}
     */
    responseText = "";

    /**
     * The `Document` containing the HTML/XML retrieved by the request.
     * This is the interface used by the DOM. This can be `null` if the request 
     * is unsuccessful or the if the data can't be parsed as XML.
     * @type {Document|null}
     */
    responseXML = null;

    /**
     * The status code of the request, or null if request is unfinished.
     * @type {number|null}
     */
    status = null;

    /**
     * The status message sent by the server.
     * Any response over an HTTP/2 will be an empty string since that protocol 
     * does not support status messages.
     * @type {string|null}
     */
    statusText = "";

    /**
     * Whether cross-site Access-Control requests need credentials.
     * "Credentials" could cookies or authorization headers, etc.
     * @type {boolean}
     */
    withCredentials = false;

    /**
     * Aborts the request.
     * This is the cancellor returned by `doRequestHttp` or `doRequestHttps`.
     * @type {import("../../public-types.js").Cancellor|null}
     */
    #abort = null;

    /**
     * Contains the response result.
     * This is the response object passed to the callback in `http.request` or 
     * `https.request`.
     * @type {import("../../private-types.js").Response}
     */
    #response = {
        headers: {}
    };

    /**
     * A hash representing internal settings for this request.
     * @type {import("../../private-types.js").Settings}
     */
    #settings = {};

    /**
     * Whether or not forbidden headers should be excluded from requests. 
     * @type {boolean}
     */
    #disableHeaderCheck = false;
    
    /**
     * Maps headers to their values.
     * @type {any}
     */
    #headers = Object.create(null);

    /**
     * A case-insensitive collection of contained headers.
     * Specifically, this maps *lowercased* header names to their values.
     * @type {any}
     */
    #headersCase = Object.create(null);

    /**
     * The default HTTP headers to use if none are provided.
     * This object maps header names to their values.
     * @readonly @type {{[key: string]: string}}
     */
    #defaultHeaders = {
        "User-Agent": "node-XMLHttpRequest",
        "Accept": "*/*",
    };

    /**
     * HTTP headers the user cannot set.
     * Note that user-agent is allowed, even though it is banned in the spec.
     * @readonly @type {string[]}
     */
    #forbiddenRequestHeaders = [
        "accept-charset",
        "accept-encoding",
        "access-control-request-headers",
        "access-control-request-method",
        "connection",
        "content-length",
        "content-transfer-encoding",
        "cookie",
        "cookie2",
        "date",
        "expect",
        "host",
        "keep-alive",
        "origin",
        "referer",
        "te",
        "trailer",
        "transfer-encoding",
        "upgrade",
        "via"
    ];

    /**
     * HTTP methods that XMLHttpRequest is not allowed to send.
     * @readonly @type {string[]}
     */
    #forbiddenRequestMethods = [
        "TRACE",
        "TRACK",
        "CONNECT"
    ];

    /**
     * Used internally. Indicates whether `send` has been called.
     * @type {boolean}
     */
    #sendFlag = false;

    /**
     * Used internally. Indicates whether an error has occurred.
     * @type {boolean}
     */
    #errorFlag = false;

    /**
     * Used to contain array of event handlers for various events.
     * @type {{[key: string]: Function[]}}
     */
    #listeners = {};


    // methods ----------------------------------------

    /**
     * Open the connection.
     * @param {import("../../public-types.js").HttpMethod} method 
     * "GET", "POST", etc.
     * @param {string} url The endpoint for the request.
     * @param {boolean} async Whether or not the request is asynchronous. 
     * Currently, all requests are asynchronous no matter the value the user 
     * chooses.
     * @param {string} user Username for basic authentication.
     * @param {string} password Password for basic authentication.
     */
    open(method, url, async, user, password) {
        // Don't allow synchronous XMLHttpRequest (we never use it in repo)
        async = true;

        this.abort();
        this.#errorFlag = false;

        if (!this.#isAllowedHttpMethod(method))
            throw new Error("SecurityError: Request method not allowed");

        if (typeof url !== "string")
            url = String(url);
        
        this.#settings = {
            method,
            url,
            async,
            user,
            password
        }

        this.#setState(this.OPENED);
    }

    /**
     * Sets a header for the request, or appends the value if already set.
     * @param {string} header Header name
     * @param {string} value Header value
     */
    setRequestHeader(header, value) {
        if (this.readyState !== this.OPENED)
            throw new Error("INVALID_STATE_ERR: setRequestHeader can only be " + 
                            "called when state is OPEN");
        
        if (!this.#isAllowedHttpHeader(header))
            return console.warn(`Refused to set unsafe header "${header}"`);

        if (this.#sendFlag)
            throw new Error("INVALID_STATE_ERR: send flag is true");

        header = this.#headersCase[header.toLowerCase()] || header;
        this.#headersCase[header.toLowerCase()] = header;
        this.#headers[header] = this.#headers[header]
                          ? `${this.#headers[header]}, ${value}`
                          : value;
    }

    /**
     * Gets header from server response.
     * @param {string} header 
     * Name of header to get.
     * @returns {string|string[]|null|undefined} 
     * Header value, or null if it doesn't exist or if the response has not yet 
     * been received. 
     */
    getResponseHeader(header) {
        if (typeof header === "string"
            && this.readyState > this.OPENED
            && this.#response 
            && this.#response.headers
            && this.#response.headers[header.toLowerCase()]
            && !this.#errorFlag
        ) 
            return this.#response.headers[header.toLowerCase()];

        return null;
    }

    /**
     * Get all response headers.
     * @returns {String} 
     * All response headers separated by CR + LF ("\r\n").
     */
    getAllResponseHeaders() {
        if (this.readyState < this.HEADERS_RECEIVED || this.#errorFlag)
            return "";

        let result = "";

        Object.keys(this.#response.headers).forEach(header => {
            if (header !== "set-cookie" && header !== "set-cookie2")
                result += `${header}: ${this.#response.headers[header]}\r\n`
        });

        return result.substring(0, result.length - 1);
    }

    /**
     * Sends the request to the server.
     * @param {string|null} data 
     * Optional data to send as the request body.
     */
    send(data) {
        if (this.readyState !== this.OPENED)
            throw new Error("INVALID_STATE_ERR: connection must be opened " + 
                            "before send() is called");

        if (this.#sendFlag)
            throw new Error("INVALID_STATE_ERR: send has already been called");

        let ssl = false;
        let local = false;
        let url = new URL(this.#settings.url || "");
        let host;

        switch(url.protocol) {
            case "https:":
                ssl = true;
                host = url.hostname;
                break;
            case "http:":
                host = url.hostname;
                break;
            case "file:":
                local = true;
                break;
            case undefined:
            case null:
            case "":
                host = "localhost";
                break;
            default:
                throw new Error("Protocol not supported.");

        }

        // default to 443 for https, 80 for http
        let port = url.port || (ssl ? 443 : 80);

        // includes query string if present
        let uri = url.pathname + (url.search ? url.search : "");

        // Include default headers if not already provided
        Object.keys(this.#defaultHeaders).forEach(header => {
            if (!this.#headersCase[header.toLowerCase()])
                this.#headers[header] = this.#defaultHeaders[header]; 
        });

        // Set basic authentication if provided
        if (this.#settings.user) {
            if (typeof this.#settings.password === "undefined")
                this.#settings.password = "";

            const authBuffer = Buffer.from(
                `${this.#settings.user}:${this.#settings.password}`);
            
                this.#headers.Authorization = 
                    `Basic ${authBuffer.toString("base64")}`;
        }

        if (this.#settings.method === "GET" || this.#settings.method === "HEAD")
            data = null;
        else if (data) {
            this.#headers["Content-Length"] = Buffer.isBuffer(data)
                                              ? data.length
                                              : Buffer.byteLength(data);
            if (!this.#headers["Content-Type"])
                this.#headers["Content-Type"] = "text/plain;charset=UTF-8";
        }
        else if (this.#settings.method === "POST")
            // Required by buggy servers the don't satisfy specifications.
            this.#headers["Content-Length"] = 0;

        const options = {
            host,
            port,
            path: uri,
            method: this.#settings.method || "GET",
            headers: this.#headers, 
            body: data || ""
        }
        
        this.#errorFlag = false;

        const doRequest = ssl ? doRequestHttps : doRequestHttp;

        this.#sendFlag = true;

        this.#dispatchEvent("readystatechange");

        this.#abort = doRequest(({ value, reason }) => {
            if (value === undefined) {
                this.#handleError(reason);
                return;
            }

            this.#response.headers = value.headers;

            this.#setState(this.HEADERS_RECEIVED);

            this.status = value.status || null;

            if (this.#sendFlag) this.#setState(this.LOADING);

            this.#dispatchEvent("loadstart");

            this.responseText = value.responseText;

            if (this.#sendFlag) {
                this.#setState(this.DONE);
                this.#sendFlag = false;
            }

        }, options)
    }

    /**
     * Aborts the request.
     * This sets the readyState to UNSENT and status code to 0.
     */
    abort() {
        if (this.#abort) {
            this.#abort();
            this.#abort = null;
        }

        this.#headers = this.#defaultHeaders;
        this.status = 0;
        this.responseText = "";
        this.responseXML = null;

        this.#errorFlag = true;

        if (this.readyState !== this.UNSENT
            && (this.readyState !== this.OPENED || this.#sendFlag)
            && this.readyState !== this.DONE
        ) {
            this.#sendFlag = false;
            this.#setState(this.DONE);
        }
        this.readyState = this.UNSENT;
        this.#dispatchEvent("abort");
    }

    /**
     * Returns true if the specified header is allowed, false otherwise.
     * @param {string} header Header to validate
     * @return {boolean}
     */
    #isAllowedHttpHeader(header) {
        return this.#disableHeaderCheck ||
            (typeof header === "string"
            && this.#forbiddenRequestHeaders.every(forbidden => 
                forbidden.toLowerCase() !== header.toLowerCase()
            ));
    }

    /**
     * Returns true if the provided method is allowed, false otherwise.
     * @param {string} method 
     * @returns {boolean}
     */
    #isAllowedHttpMethod(method) {
        return typeof method === "string" &&
               this.#forbiddenRequestMethods.every(forbidden => 
                    forbidden.toLowerCase() !== method.toLowerCase()
               );
    }

    /**
     * Changes `readyState` and calls `onreadystatechange`.
     * @param {Number} state New state
     */
    #setState(state) {
        if (this.readyState === state && state !== this.LOADING) return;

        this.readyState = state;
        
        if (   this.#settings.async 
            || this.readyState < this.OPENED 
            || this.readyState === this.DONE
        )
            this.#dispatchEvent("readystatechange");
        
        if (this.readyState === this.DONE && !this.#errorFlag) {
            this.#dispatchEvent("load");
            // @TODO figure out InspectorInstrumentation::didLoadXHR(cookie)
            this.#dispatchEvent("loadend");
        }
    }

    /**
     * Dispatch an event.
     * This includes the "on" method and any events attached with 
     * `addEventListener`.
     * @param {string} event 
     */
    #dispatchEvent(event) {

        /** @type{import("../../private-types.js").EventMap} */
        const handlerFor = {
            readystatechange: this.onreadystatechange,
            loadstart: this.onloadstart,
            abort: this.onabort,
            load: this.onload,
            loadend: this.onloadend,
            error: this.onerror
        }

        const handler = handlerFor[event];

        if (typeof handler === "function") handler();

        if (event in this.#listeners && Array.isArray(this.#listeners[event]))
            this.#listeners[event].forEach(listener => listener.call(this));
    }

    /**
     * Deals with any internal error.
     * @param {Error} error 
     */
    #handleError(error) {
        this.status = 0;
        this.statusText = error.message;
        this.responseText = error.stack || "";
        this.#errorFlag = true;
        this.#setState(this.DONE);
        this.#dispatchEvent("error");
    }
};

export default MockXMLHttpRequest;
