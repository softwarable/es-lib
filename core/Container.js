/**
 * very simple Dependency Container for JavaScript
 *
 * Usage:
 *  service binding (lazy loading):
 *      bind(name, factory). Factory param must be a function that returns the service - function(container) { return service }
 *  to store services:
 *      set(name, service).
*   to get a service:
 *      get(name)
 *  to check if has a service
 *      has(name)
 *
 */
class Container
{
    /**
     * Create a new container
     * @param {object|null} services 
     * @param {object|null} factories 
     */
    constructor(services = null, factories = null) {
        this._services = {};
        this._factories = {}

        if(services) {
            this.setMany(services);
        }

        if(factories) {
            this.bindMany(factories);
        }
    }

    /**
     * Resolves and gets a service from the container
     *
     * @throws
     * @param name
     * @return {*}
     */
    get(name) {
        if(this._services[name]) {
           return this._services[name];
        }

        if(!this._factories[name]) {
            throw "Unable to resolve service: " + name;
        }

        let factory = this._factories[name];
        let service = factory(this);
        if(!service) {
            throw "Service factory must return an instance object. (" + name + ")";
        }

        this._services[name] = service;
        return service;
    }

    /**
     * Get multiple services from the container
     * @throws
     * @param {Array} keys 
     */
    getMany(keys) {
        let result = {};
        for(let key in keys) {
            result[key] = this.get(key);
        }

        return result;
    }

    /**
     *
     * @param name
     * @param service
     */
    set(name, service, force = false) {
        this._validateExistance(name, force);
        this._services[name] = service;
    }

    /**
     * Add multiple services at once
     * @param {object} obj 
     */
    setMany(obj) {
        for(let key in obj) {
            this.set(key, obj[key]);
        }
    }

    /**
     *
     * @param name
     * @return {*|boolean}
     */
    has(name) {
        return this._services[name] || this._factories[name] || false;
    }

    /**
     *
     * @param name
     */
    unset(name) {
       if(this._services[name]) delete this._services[name];
       if(this._factories[name]) delete this._factories[name];
    }

    /**
     *
     * @param name
     * @param factory
     */
    bind(name, factory, force = false) {
        this._validateExistance(name, force);
        if(!this._checkIfFactory(factory)) {
            throw "Service factory must be a function.";
        }

        this._factories[name] = factory;
    }

    /**
     * Bind multiple factories
     * @param {object} obj 
     */
    bindMany(obj) {
        for(let key in obj) {
            this.bind(key, obj[key]);
        }
    }

    /**
     *
     * @param name
     * @param force
     * @private
     */
    _validateExistance(name, force) {
        if(this.has(name) && !force) {
            throw "Service already exists for: " + name;
        }
    }

    /**
     * 
     * @param {*} factory 
     */
    _checkIfFactory(factory) {
        return (typeof factory === 'function');
    }
}

module.exports = Container;