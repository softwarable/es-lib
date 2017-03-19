/**
 * Created by Alamin on 2017-01-28.
 */
export class NestedObject
{
    constructor() {
        this.objectKey = 'name';
        this.nestingKey = 'children';
        this.root = {};
    }

    add(obj) {
        if(!obj[this.objectKey]) {
            throw "Given object does not have key: " + this.objectKey;
        }

        this.root[obj[this.objectKey]] = obj;
    }

    get(key) {
        return NestedObject.getRecursive(key, this.root, this.nestingKey);
    }

    static getRecursive(key, obj, nestingKey) {
        if(!obj) return null;

        // first check if key is available directly
        if(obj[key]) {
            return obj[key];
        }

        // we will attempt to get key using recursive
        for(let k in obj) {
            let obj = obj[k];
            if(obj[nestingKey]) {
                return NestedObject.getRecursive(key, obj[nestingKey], nestingKey);
            }
        }
    }
}