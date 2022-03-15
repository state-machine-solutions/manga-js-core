const Signal = require('signals') ;
const DataController = require('./modules/data/DataController') ;
const PersistData = require('./modules/data/PersistData');   
const EventDispatcher = require('./modules/listeners/EventDispatcher');
const {ListenerInfo, ListenerClient} = require('./modules/listeners/ListenerClasses')
function MangaCore(){
    let me = this ;
    let dataController = new DataController({}) ;
    let eventDispatcher = new EventDispatcher({maxFrequence:50}) ;
    eventDispatcher.setMethodToGetValue( dataController.get ) ;
    let persistData = new PersistData(eventDispatcher) ;
    this.onClear = new Signal() ;

    let queueMessages2save = [] ;
    
    /* TODO: Fix await call
    var last = await persistData.getLast();
    if(last){
        dataController.set("", last) ;
    }
    */
   let paused = false ;
   let info = {
       started: new Date(),
       stats:{
            gets:0,
            sets:0,
            listeners:0,
            clear:0,
            delete:0,
            reset:0,
            message:0
       }
   };
    this.getInfo = ()=>{
        return info ;
    }

    
    dataController.onChange.add(( changes )=>{
        for( var i in changes ){
            eventDispatcher.setChange( changes[i].path, changes[i].value);    
        }
        eventDispatcher.dispatchNow() ;
    });

    this.create = (token)=>{}
    this.clear = (token)=>{
        info.stats.clear ++;
        dataController.clear();
        eventDispatcher.clear() ;
        this.onClear.dispatch();
    }
    this.get = (path)=>{
        if(paused){
            return ;
        }
        info.stats.get ++;
        return dataController.get( path );
    }

    this.validate = async (path)=>{
        
        return dataController.validateData( path );
    }
    
    this.delete = (path)=>{
        if(paused){
            return ;
        }
        info.stats.delete ++;
        return dataController.delete( path );
    }
    this.set = async (path, value, validate = true, dispatchEvent = true)=>{
        if(paused){
            return ;
        }
        info.stats.set ++;
        //console.log( 'SET:', path);
        return dataController.set( path, value, validate, dispatchEvent );
    }
    this.reset = async (path, value, validate = true,dispatchEvent = true)=>{
        if(paused){
            return ;
        }
        info.stats.reset ++;
        return dataController.reset( path, value, validate, dispatchEvent );
    }
    this.message = async (path, value, save = false, reset = false )=>{
        if(paused){
            return ;
        }
        info.stats.message ++;
        //despacha sem salvar para mais agilidade
        
        eventDispatcher.sendMessage( path, value);    
        //adiciona na fila de salvar
        if(save){
            queueMessages2save.push({path, value, id:info.stats.message, reset}) ;
        }
        return {success:true, id:info.stats.message} ;
    }
    this.setValidateFN = (fn)=>{
        if( typeof fn != "function" || fn.length != 2 )
        {
            var err = "Validation must receive an function with 2 parameters: "+ 
            "\n\n\n(path, data)=>{"+
            "\n  if(isValid){"+
            "\n    return true;"+
            "\n  }"+
            "\n  return errorMessage || errorObject;"+
            "\n}\n\n"+
            "\nThe fail request will be received as {success:false,dada:d} , d will be the result of your validantion function"
            ;

            throw err;
        }
        dataController.setValidate(fn);
    }
    let listenersCache = new Map();
    function getListenerCacheByClient(listenerClient){
        if(!listenersCache.has(listenerClient)){
            listenersCache.set(listenerClient, new Map())
        }
        return listenersCache.get(listenerClient) ;
    }
    function getKeyStringByObj(ob){
        var result = "";
        if(ob?.listener){
            if(ob?.listener?.property){
                result += ob.listener.property ;
            }
            if(ob?.listener?.updateMode){
                result += "___"+ob.listener.updateMode;
            }
        }
        return result;
    }

    function normalizeListenerObj (ob){
        if( ob.listener.hasOwnProperty('path') && !ob.listener.hasOwnProperty('property')){
            ob.listener.property = ob.listener.path;
            delete ob.listener.path;
        }
        return ob;
    }

    function isRestricted(ob, listenerClient){
        if(paused){
            return true;
        }

        //CHECK if is repeated
        var listenerCache   = getListenerCacheByClient(listenerClient) ;
        var keyByObj        = getKeyStringByObj(ob) ;
        if(keyByObj == ""){
            return true;
        }
        if(listenerCache.has(keyByObj)){
            if(!listenerClient.repeatedListeners){
                listenerClient.repeatedListeners = 0 ;
            }
            listenerClient.repeatedListeners ++ ;
            return true;
        }
        listenerCache.set( keyByObj, true ) ;

        return false;
    }

    this.addMessageListener = (ob, listenerClient)=>{
        this.addListener(ob,listenerClient,true);
    }
    /**
     * ver referencia em algum lugar
     */
    this.addListener = (ob, listenerClient, isMessage = false )=>{
        ob = normalizeListenerObj( ob );
        if( isRestricted(ob,listenerClient))
        {
            return;
        }

        info.stats.listeners ++;
        eventDispatcher.addListener(ob, listenerClient, isMessage ) ;
    }
    this.getListeners = ()=>{
        paused = true ;
        var lis = eventDispatcher.getListeners() ;
        let result = {
            totalPaths:0,
            paths:[],
            clients:{},
            totalClients:0,
            stats: info.stats
        } ;
        lis.forEach((val, ind)=>{
            //console.log(val, ind) ;
            let path = ind ;
            if( result.paths.indexOf(path) < 0 ){
                result.paths.push(path) ;
            }
            result.totalPaths = result.paths.length ;
            //console.log(">>> ",path, result.totalPaths) ;
            val.forEach((v, i)=>{
                let clientKey = i;
                //console.log(v,i) ;
                if(!result.clients.hasOwnProperty(clientKey)) {
                    result.totalClients ++ ;
                    result.clients[clientKey] = {
                        name:v.listenerClient.clientName,
                        totalListeners:0,
                        paths:[]
                    }
                }
                if( result.clients[clientKey].paths.indexOf(path) < 0 ){
                    result.clients[clientKey].paths.push(path) ;
                }
                result.clients[clientKey].totalListeners = result.clients[clientKey].paths.length ;
            }) ;
        }) ;
        paused = false ;
        return result;
    }
    this.removeMessageListener = ( ob, listenerClient )=>{
        this.removeListener(ob, listenerClient, true);
    }
    this.removeListener = (ob, listenerClient, isMessage = false )=>{
        if(paused){
            return ;
        }
        
        var listenerCache   = getListenerCacheByClient(listenerClient) ;
        listenerCache.clear();
        listenersCache.delete(listenerClient) ;
        info.stats.listeners --;
        eventDispatcher.removeListener(ob, listenerClient, isMessage ) ;
    }
    this.removeAllListener = (listenerClient)=>{
        if(paused){
            return ;
        }
        info.stats.listeners = 0;
        listenersCache.clear();
        eventDispatcher.removeAll( listenerClient ) ;
    }
    function saveMessagesQueue(){
        if( queueMessages2save.length > 0 ){
            let oldestMessage = queueMessages2save.shift() ;
            let metod = (oldestMessage.reset)?me.reset: me.set ;
            metod(oldestMessage.path, oldestMessage.value, false ).then((r)=>{
                setTimeout( saveMessagesQueue, 100 );
            }).catch( ( er ) => {
                console.log("saveMessageQueue error ", er ) ;
                setTimeout( saveMessagesQueue, 100 );
            }) ;
            return;
        }
        setTimeout( saveMessagesQueue, 500 );
    }
    saveMessagesQueue();
}

module.exports = {MangaCore, ListenerInfo, ListenerClient} ;
