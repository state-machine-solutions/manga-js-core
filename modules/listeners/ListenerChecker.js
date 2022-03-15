const Signal = require('signals') ;
function ListenerChecker(){
    var me = this ;
    this.onDispatchEvent = new Signal();
    this.onDispatchMessageEvent = new Signal();
    let mapsPaths = new Map() ;
    let mapsMessagePaths = new Map() ;
    let mapsPathsBoolean = new Map() ;
    let pathsOfWho = new Map() ;
    let pathsOfMessgeWho = new Map() ;

    let listener2dispatch = new Map() ;
    function createAndGetMapOfPath(path, isMessage = false,  autoCreate = true){
        var map = isMessage ?  mapsMessagePaths : mapsPaths;
        if(!map.has(path)){
            if(autoCreate){
                map.set(path, new Map());
            }
        }
        return map.get(path) ;
    }
    function createAndGetWhoMaps(who,  isMessage = false, autoCreate = true){
        var map = isMessage ?  pathsOfMessgeWho : pathsOfWho;
        if(!map.has(who)){
            if(autoCreate){
                map.set(who, new Map()) ;
            }
        }
        return map.get(who) ;
    }
    /**
     * Check has listener to path
     */
    this.setListener = (path, who, level = 0, isMessage = false)=>{
        var map = createAndGetMapOfPath(path, isMessage) ;
        if( ! map.has(who) ){
            map.set( who, level ) ;
            mapsPathsBoolean.set(path, level);
            var mapWho = createAndGetWhoMaps(who, isMessage) ;
            mapWho.set(path, level)
        }
    }
    this.removeListener = (path, who, isMessage = false)=>{
        var baseMap = isMessage? mapsMessagePaths : mapsPaths;
        if(baseMap.has(path)){
            var map = baseMap.get(path) ;
            if( map.has(who) ){
                map.delete(who) ;
                var whoMap = createAndGetWhoMaps( who,isMessage, false ) ;
                whoMap.delete(path) ;
                if(map.size == 0){
                    //zerou
                    baseMap.delete(path) ;
                }
            }
        }
        //se não existir mais, remove
        //mapsPathsBoolean.delete(path);
    }
    this.removeAll = (who, isMessage = false)=>{
        let whoMap = createAndGetWhoMaps( who, isMessage, false ) ;
        if(whoMap && whoMap.size> 0 ){
            whoMap.forEach((value, key)=>{
                me.removeListener( key, who, isMessage ) ;
            });
            whoMap.delete(who) ;
        }
    }
    function dispatch2Path(path, value){
        let listeners = mapsPaths.get( path ) ;
        if(listeners && listeners.size > 0){
            me.onDispatchEvent.dispatch( path, value ) ;
        }
    }
    this.dispatchNow = ()=>{
        //dispara nesse momento tudo que marcou como alterado
        if( listener2dispatch.size ) {
            listener2dispatch.forEach((value, key)=>{
                dispatch2Path( key, value ) ;
            });
            listener2dispatch.clear();
        }
        
    }
    this.dispatchMessage = ( path, value )=>{
        let listeners = mapsMessagePaths.get( path ) ;
         if(listeners && listeners.size > 0){
             me.onDispatchMessageEvent.dispatch( path, value ) ;
        }
    }
    function setPathHasChange (path, value = null, fromCascade = false ){
        let listeners = mapsPaths.get( path ) ;
        if(listeners && listeners.size > 0){
            listener2dispatch.set(path, {value, fromCascade}) ;
        }
    }
    /**
     * Fazer o filtro do que foi modificado e que tem algum listener interessado
     */
    this.setChanged = async (path, value)=>{
        //pega a lista de listener para o path da ponta
        setPathHasChange ( path, value, false ) ;
        //verifica na cadeia de listeners antes disso
        let pathArray = path.split(".") ;
        while(pathArray.length > 0){
            pathArray.pop();
            {
                let partialPath = pathArray.join(".") ;
                setPathHasChange ( partialPath, null, true ) ;
            }
        }
        //coloca numa lista o evento para fazer o dispatcher no próximo loop
    }
    this.clear = ()=>{
        listener2dispatch.clear() ;
        //whoMap.clear();
        mapsPaths.clear();
        mapsPathsBoolean.clear() ;
    }
}
module.exports = ListenerChecker ;