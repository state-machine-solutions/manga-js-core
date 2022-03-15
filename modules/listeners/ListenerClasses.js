let countClients = 1
class ListenerInfo{
    constructor(propertyPath = "", updateMode = "onChange"){
        this.listener = {
            path:propertyPath,
            property: propertyPath,
            updateMode
        }
        this.handler = {
            method:propertyPath
        }
        this.repeatedListeners = 0
        this.clientName = "no name "+countClients++
    }
}
ListenerInfo.updateMode = [
    "onChange",
    "onSet",
    "onInterval",
    "onChangeLength"
];
class ListenerClient{
    constructor(id){
        this.id = id || countClients++
        this.callback = new Map()
    }
    registerListener(eventName, callback){
        this.callback.set(eventName, callback)
    }
    getListenerInfo(path, mode, callback){
        let info = new ListenerInfo(path, mode)
        this.registerListener(path, callback)
        return info
    }
    emit(eventName, value, callback){
        if(this.callback.has(eventName)){
            let cbk = this.callback.get(eventName)
            if(cbk && typeof(cbk) == "function"){
                let callbackResult = cbk(eventName, value)
                if(callbackResult && callbackResult?.then){
                    callbackResult.then(callback)
                    return;
                }
            }
        }
        callback(value)
    }
}
module.exports = {ListenerInfo, ListenerClient}