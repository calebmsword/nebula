import { IncomingHttpHeaders } from "node:http"
import { 
    SpecificHttpSpec, 
    HttpRequestor, 
    Json, 
    OutgoingHttpHeaders, 
    HttpMethod
} from "./public-types"

export interface Response {
    headers: IncomingHttpHeaders
}

export interface Settings {
    method?: HttpMethod,
    url?: string,
    async?: boolean,
    user?: string,
    password?: string
}

export interface EventMap {
    [key: string]: (() => void)|null|undefined
}

export type SpecificHttpRequestor = (
    urlOrSpec: SpecificHttpSpec|string, 
    spec?: SpecificHttpSpec
) => HttpRequestor;

export type Hostname = string;
export type Port = string|number;
export type MethodOrProtocol = string;

export interface MockServerResponse {
    responseText: string,
    headers: IncomingHttpHeaders,
    status: number
}

export interface Endpoint {
    [key: MethodOrProtocol]:
        ((
                headers?: OutgoingHttpHeaders,
                params?: {
                    [key: string]: string
                }, 
                body?: Json|string
            ) => MockServerResponse
        ) | boolean | undefined,
    http?: boolean,
    https?: boolean
}

export interface MockServerConfig {
    [key: Hostname]: {
        [key: Port]: Endpoint
    }
}

export interface MockStorage {
    [key: Hostname]: {
        [key: Port]: {
            [key: number|string]: Json
        }
    }
}

export type NotAFunction = 
    boolean|number|string|undefined|null|symbol|bigint|object;
