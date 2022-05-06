//TODO: verificar o uso
const DataHolder = require('./DataHolder');

const Signal = require('signals');

const DataBind = require('./DataBind');
function DataController(config) {
    let me = this;
    var holder = new DataHolder();
    var binder = new DataBind(holder);
    this.onChange = new Signal();
    //holder proxy
    this.clear = holder.clear;
    this.setValidate = (fn) => {
        me.validate = fn;
    };
    function isValid(key, value) {

        if (me.validate == null) {
            return { success: true };
        }
        var validateResult = me.validate(key, value);
        if (typeof validateResult == 'boolean') {
            return { success: validateResult }
        }
        return validateResult;


    }

    this.get = async (path) => {
        return await holder.get(path)
    };
    this.delete = async (path, dispatchEvent = true) => {
        return holder.delete(path).then((changed) => {
            if (dispatchEvent) {
                this.onChange.dispatch([{ path: path, value: null }])
            }
            return { success: true, message: "path " + path + " DELETED  with success " }

        }).catch((e) => {
            console.log(e);
            result.success = false;
            result.message = e.toString();
            return result;
        });
        
    };

    this.validateData = async (key) => {

        if( me.validate == null ){
            return {message:"No validation method was set"};
        }

        var data = await holder.get(key);
        return isValid(key, data);
    };


    this.set = async (key, value, validate = true, dispatchEvent = true) => {
        var result = { success: true };
        if (validate) {
            result = isValid(key, value);
            if (result.success == false) {
                return result;
            }
        }

        return binder.bind(key, value).then((changed) => {
            if (dispatchEvent && changed.length > 0) {
                this.onChange.dispatch(changed)
            }
            result.message = "path " + key + " updated with values ";
            return result;
        }).catch((e) => {
            console.log(e);
            result.success = false;
            result.message = e.toString();
            return result;
        });
       

    };
    this.reset = async (key, value, validate = true, dispatchEvent = true) => {
        var result = { success: true };
        if (validate) {
            result = isValid(key, value);
            if (result.success == false) {
                return result;
            }
        }

        return holder.reset(key, value).then((changed) => {
            if (dispatchEvent) {
                this.onChange.dispatch([{ path: key, value }])
            }
            result.message = "path " + key + " updated with values ";
            return result;
        }).catch((e) => {
            console.log(e);
            result.success = false;
            result.message = e.toString();
            return result;
            //real error
        });
       
    }

}
module.exports = DataController;
