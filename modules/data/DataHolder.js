const {mergeAdvanced} = require('object-merge-advanced')
const smsObj = require('../utils/smsObject');


function DataHolder() {
    let data = {};

    let mergeOptions = {
        //concatInsteadOfMerging:false,
        //oneToManyArrayObjectMerge:true,
        hardArrayConcat: true,
        cb: (inputArg1, inputArg2, resultAboutToBeReturned, infoObj) => {
            if (typeof inputArg1 == 'boolean' && typeof inputArg2 == 'boolean') {
                return inputArg2;
            }
            if (Array.isArray(inputArg1) && Array.isArray(inputArg2)) {
                const res = [];
                const big = inputArg1.length > inputArg2.length ? inputArg1.length : inputArg2.length;
                for (let i = 0; i < big; i++) {

                    if (typeof inputArg2[i] != 'undefined') {
                        if (typeof inputArg1[i] != 'undefined') {
                            res[i] = mergeAdvanced(inputArg1[i], inputArg2[i], mergeOptions)
                        } else {
                            res[i] = inputArg2[i];
                        }
                    } else if (typeof inputArg1[i] != 'undefined') {
                        res[i] = inputArg1[i];
                    }
                }
                return res;
            }
            return resultAboutToBeReturned;
        }
    };

    this.clear = async () => {
        data = {};
        return true;
    }
    this.get = async (path) => {
        if(path){
            //check if last value is __length
            let pathList = path.split(".");
            if(pathList.length > 0 && pathList[pathList.length-1] == "__length"){
                //magic key __length get just the length if exists
                pathList.pop();
                path = pathList.join(".");
                let obj = await smsObj.extract(data, path);
                if(!obj){
                    return 0;
                }
                if(Array.isArray(obj)){
                    return obj.length;
                }
                if(obj.hasOwnProperty("length")){
                    return obj.length;
                }
                if(typeof obj == "object"){
                    let keys = Object.keys(obj);
                    return keys.length;
                }
                return obj;
            }
        }
        return smsObj.extract(data, path);
    }

    this.delete = async (path) => {
        if (path.length == 0) {
            data = {};
            return true;
        }
        data = smsObj.delete(data, path);
        return true;
    }

    this.reset = async function (path, newData) {
        data = smsObj.inject(data, path, newData);
        return true;

    }

    this.set = async function (newData) {
        const newData = mergeAdvanced(data, newData, mergeOptions);
        data = newData;
        return true;
    }

}
module.exports = DataHolder;