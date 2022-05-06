const Middleware = require('@manga-js/middleware')
function MiddlewareController(){
    let middlewares = new Middleware()
    this.middleware = {
        getInfo:(path, method)=>{
            middlewares.registerMiddle("getInfo", method)
        },
        get:(path, method)=>{
            middlewares.registerMiddle("get|"+path, method)
        },
        set:(path, method)=>{
            middlewares.registerMiddle("set|"+path, method)
        },
        reset:(path, method)=>{
            middlewares.registerMiddle("reset|"+path, method)
        },
        delete:(path, method)=>{
            middlewares.registerMiddle("delete|"+path, method)
        },
        addListener:(path, method)=>{
            middlewares.registerMiddle("addListener|"+path, method)
        },
        //all types of save, set, reset, delete
        save:(path, method)=>{
            middlewares.registerMiddle("save|"+path, method)
        },
        //all types of read, get or addListener
        read:(path, method)=>{
            middlewares.registerMiddle("read|"+path, method)
        }
    }
    this.call = {
        getInfo:async(path, value)=>{
            middlewares.dispatch("getInfo", value)
        },
        get:async(path, value)=>{
            middlewares.dispatch("get|"+path, value)
        },
        set:async(path, value)=>{
            middlewares.dispatch("set|"+path, value)
        },
        reset:async(path, value)=>{
            middlewares.dispatch("reset|"+path, value)
        },
        delete:async(path, value)=>{
            middlewares.dispatch("delete|"+path, value)
        },
        addListener:async(path, value)=>{
            middlewares.dispatch("addListener|"+path, value)
        },
        //all types of save, set, reset, delete
        save:async(path, value)=>{
            middlewares.dispatch("save|"+path, value)
        },
        //all types of read, get or addListener
        read:async(path, value)=>{
            middlewares.dispatch("read|"+path, value)
        }
    }
}
module.exports = MiddlewareController