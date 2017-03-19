let axios = require('axios');
var EventEmitter = require('events').EventEmitter;

/**
 * map of exposed request properties to internal xhr library properties
 * additional properties will be added, as needed.
 */
const map = {
    url: 'url',
    method: 'method',
    headers: 'headers',
    params: 'params',
    data: 'data',
    responseType: 'responseType',
    xsrfCookieName: 'xsrfCookieName',
    xsrfHeaderName: 'xsrfHeaderName'
}

/**
 * Encapsulates Ajax request
 * 
 * Provides additional functionalities
 *  external + internal events
 * Currently simply wraps the axios library
 * Request object 
 * 
 */
class Xhr extends EventEmitter 
{
    /**
     * EventRequest
     */
    static get EventRequest() { return 'event-request' }

    /**
     * EventResponse
     */
    static get EventResponse() { return 'event-response' }

    /**
     * 
     */
    constructor() {
        super();
        this.map = map;
        axios.interceptors.request.use( this.onRequest.bind(this));
        axios.interceptors.response.use(this.onResponse.bind(this));
    }

    /**
     * Send the request using ajax
     *
     * @param {Request}
     * @return {Promise}
     */
    send(request) {
        console.info('Xhr send request arrived:', request);
        this.normalize(request);
        return axios(request);
    }

    /**
     * 
     * @param {*} request 
     */
    onRequest(request) {
        this.emit(Xhr.EventRequest, request, this);

        return request;
    }

    /**
     * @param {object} response 
     */
    onResponse(response) {
        this.emit(Xhr.EventResponse, response, response.config);
        
        return response;
    }

    /**
     * 
     * @param {object} obj 
     */
    normalize(obj) {
        for(let key in map) {
            if(!obj.hasOwnProperty(key)) {
                continue;
            }

            let mapped = map[key];
            if(mapped == key) continue;

            obj[mapped] = obj[key];
        }

        return obj;
    }
}

module.exports = Xhr;