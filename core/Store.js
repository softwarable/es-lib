
var EventEmitter = require('events').EventEmitter;

/**
 * Simple state management store
 * 
 * Instead of having multiple mutators for states,
 * a single set(key, val) method 
 */
class Store extends EventEmitter 
{
    constructor() {
        super();
        this.state = {}
    }

    static get EventSet() { return 'state_set' }
    static get EventGet() { return 'state_get' }
    get eventSet() { return Store.EventSet }
    get eventGet() { return Store.EventGet }

    /**
     * access state information
     * @note currently not performing access validation
     * @param {String} key
     * @param {any} defaultValue if key is not found, it will return back this value
     */
    get(key, defaultValue) {
        this.emit(Store.EventGet, key, this);
        if(key in this.state) return this.state[key];
        else return defaultValue;
    }

    /**
     * store information in the state
     * @note currently not performing any validation
     * @param {String} key
     * @param {any} value
     */
    set(key, value) {
        this.emit(Store.EventSet, key, value, this);
        this.state[key] = value;
    }
}

module.exports = Store;
