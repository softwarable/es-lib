let validate = require("validate.js");
let moment = require('moment');

const Message = {
    required : "Required",
    validationFailed : "Validation failed"
}


/**
 *
 */
class Validator
{
    constructor()
    {
        this.constraints = {};
        this.validators = {};

        // // initialize validateJS library
        // // we need this initialization for dealing with date validation
        // validate.extend(validate.validators.datetime, {
        //     // The value is guaranteed not to be null or undefined but otherwise it
        //     // could be anything.
        //     parse: function(value, options) {
        //         // @note  return the unix timestamp for that date or NaN if it's invalid
        //         // @todo do additional validation here
        //         if(util.isNumber(value)) {
        //             return NaN;
        //         }

        //         if(options.fixedFormat) { // only allow YYYY-MM-DD format
        //             var regEx = /^\d{4}-\d{2}-\d{2}$/;
        //             if(!value.match(regEx))
        //                 return NaN;
        //         }

        //         return +moment.utc(value);
        //     },

        //     // Input is a unix timestamp
        //     format: function(value, options) {
        //         var format = options.dateOnly ? "YYYY-MM-DD" : "YYYY-MM-DD hh:mm:ss";
        //         return moment.utc(value).format(format);
        //     }
        // });
        // validate.validators.presence.message = Message.Required;
    }

    /**
     * Add a constraint
     *
     * @param name
     * @param constraint
     */
    addConstraint(name, constraint)
    {
        this.constraints[name] = Object.assign({}, this.constraints[name], constraint);
    }

    /**
     * Add multiple constraint definition
     * @param constraints
     */
    addConstraints(constraints)
    {
        for(let key in constraints) {
            let constraint = constraints[key];
            this.addConstraint(key, constraint);
        }
    }

    /**
     * Add additional custom validator
     * @param {string} name 
     * @param {function} validator 
     */
    addValidator(name, validator) 
    {
        this.validators[name] = validator;
    }


    /**
     * Allows ability to add constraints from arbitrary object with given keys
     *
     * @param definitions
     * @param nameKey
     * @param constraintKey
     */
    addConstraintsFromDefinitions(definitions, nameKey = 'name', constraintKey = 'constraints')
    {
        for(let key in definitions) {
            let definition = definitions[key];
            this.addConstraint(definition[nameKey], definition[constraintKey]);
        }
    }

    /**
     * invoked before performing validation for given key
     * @param values
     * @param errors
     */
    preValidate(key, value, errors, values) {}

    /**
     * Perform actual validation
     *
     * @param key
     * @param value
     * @param options
     * @param errors
     * @param values
     */
    onValidate(constraint, key, value, errors, options, values)
    {
        // generate subclass validate method name for the constraint
        let method = this.generateValidatorMethodName(constraint);

        // check if specialized validate method implemented by subclass
        if(this[method] && typeof this[method] == 'function') {
            // invoke the validator method
            this[method](key, value, errors, options, values);
        }

        else if(this.validators[constraint]) { // custom validator avaialable
            let validator = this.validators[constraint];
            let verrors = validator(key, value, errors, options, values);
            Validator.addErrorMessage(errors, key, verrors);
        }

        // check if validator is supported by the library, if so perform it
        else if(validate.validators[constraint]) {
            let verrors = validate(
                {[key] : value},   // first arg is key/value pair
                {[key]: {          // second arg is additional option for the key
                    [constraint]: options
                }}, {
                    fullMessages: false
                });

            if(verrors && verrors[key]) { // validation failed
                errors[key] = verrors[key];
            }
        }

        else {
            throw "Validator not found for constraint: " + constraint;
        }
    }

    /**
     * invoked after performing validation for given key
     * @param values
     * @param errors
     */
    postValidate(key, value, errors, values) {}

    /**
     * Perform validation on given values
     *
     * @param values
     * @returns {undefined|object}
     */
    validate(values)
    {
        let errors = {}; // hold errors
        for(let name in values) { // loop through all values to be validated
            this.preValidate(name, value, errors, values); // pre event

            if(!values.hasOwnProperty(name)) continue;
            if(!this.constraints[name]) continue;

            // start performing
            let value = values[name];
            let constraints = this.constraints[name];
            for(let constraint in constraints) {
                let options = constraints[constraint];
                this.onValidate(constraint, name, value, errors, options, values);
            }

            this.postValidate(name, value, errors, values); // post event
        }

        if(Object.keys(errors).length) { // if errors, return
            return errors;
        }
    }

    /**
     * Generates internal validator method name for given name
     *
     * @param name
     * @returns null|string
     */
    generateValidatorMethodName(name)
    {
        if(!name) return null;

        let clean = validate.capitalize(name.replace('-', ' ')).replace(' ', '');
        let method = 'validate' + clean;

        return method;
    }

    /**
     * Helper method to had error
     * @param {object} errors 
     * @param {string} key 
     * @param {array|string} messages 
     */
    static addErrorMessage(errors, key, messages) {
        if(!messages) return;

        //check if error is array, if not set it to empty array so we can push a new error message
        if (!Array.isArray(errors[key])) {
            errors[key] = []
        }

        if(!Array.isArray(messages)) {
            messages = [messages];
        }

        if(messages.length == 0) return;

        errors[key].push(...messages);
    }

    setError(errors, key, messages) {
        //check if error is array, if not set it to empty array so we can push a new error message
        if (!Array.isArray(errors[key])) {
            errors[key] = []
        }
        if (options.message) {
            errors[key].push(options.message)
            return
        }
        errors[key].push(Message.validationFailed)
    }
}

module.exports = Validator;