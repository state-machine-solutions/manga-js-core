const ListenerChecker = require('./ListenerChecker');

function EventDispatcher(config) {
    let listeners = new Map();
    let messageListeners = new Map();
    let pathListeners = new Map();
    let messagePathListeners = new Map();
    let listenerChecker = new ListenerChecker();
    listenerChecker.onDispatchMessageEvent.add(
        (path, val) => {
            let listeners = messagePathListeners.get(path);
            var listenerInfos = Array.from(listeners.values());
            for (var i in listenerInfos) {
                var info = listenerInfos[i];
                let ioClient = info.ioClient;
                let method = info.info.handler.method;

                ioClient.emit(method, val, (result) => {
                    console.log("chegou");
                })
            }
        }
    );
    listenerChecker.onDispatchEvent.add(
        (path, value) => {
            if (methodToGetValue && !value.value) {
                methodToGetValue(path).then((res) => {
                    doDispatchNow(path, { value: res, fromCascade: value.fromCascade });
                })
            } else {
                doDispatchNow(path, value);
            }
            //temos o path e o value, precisa dar o dispatch para os listeners desse path passando o value

        });
    let methodToGetValue = null;
    this.setMethodToGetValue = (p_methodToGetValue) => {
        methodToGetValue = p_methodToGetValue;
    }
    
    /**
     * Here real sent values to listeners
     * @param {*} path 
     * @param {*} value 
     */
    function doDispatchNow(path, value) {
        var fromCascade = value.fromCascade;
        let listeners = pathListeners.get(path);
        var listenerInfos = Array.from(listeners.values());
        for (var i in listenerInfos) {
            var info = listenerInfos[i];
            let ioClient = info.ioClient;
            if (info.info.listener.cascade === false && fromCascade) {
                //não quer saber de mudanças cascade ( recursivo pra dentro ).
                continue;
            }

            let method = info.info.handler.method;
            var val = value.value;

            if (info.info.listener.updateMode == "onChangeLength") {
                var currentLenth = getLength(val);
                if (info.info.listener.lastLength == currentLenth) {
                    continue;
                }
                info.info.listener.lastLength = currentLenth;
            }
            ioClient.emit(method, val, (result) => {
                console.log("chegou");
            })
        }
    }
    function getLength(thing) {
        if (!thing) {
            return 0;
        }
        if (thing.hasOwnProperty("length")) {
            return thing.length;
        }
        if (typeof thing == "object") {
            return Object.keys(thing).length;
        }
        return 0;
    }
    /**
        info:{
            "listener":{
                "property":"scenario.weather.barometer.pressure",
                "updateMode":"onChange|onSet|onInterval|onChangeLength",
                "frequency":1000
            },
            "handler":{
                "method":"myMethod",
                "filter":{
                "mode":"full|changed",
                "data":"scenario.weather"
                }
            }
        },
        ioClient:{}
     */
    function addPathListeners(completeInfo, isMessage = false) {
        let path = completeInfo.info.listener.property;
        let updateMode = completeInfo.info.listener.updateMode ? completeInfo.info.listener.updateMode : "onChange";
        if (updateMode == "onChangeLength" && methodToGetValue) {
            methodToGetValue(path).then((v) => {
                //Salva o length atual para na hora de disparar usar como comparação
                completeInfo.info.listener.lastLength = getLength(v);
            });
        }

        var listenerMap = isMessage ? messagePathListeners : pathListeners;

        if (!listenerMap.has(path)) {
            listenerMap.set(path, new Map());
        }
        let mapPath = listenerMap.get(path);
        mapPath.set(completeInfo.ioClient.id, completeInfo);
        //marcando listener para o path
        var level = completeInfo.info.depth || 0;
        listenerChecker.setListener(path, completeInfo.ioClient.id, level, isMessage);
    }
    function addListenerPaths(completeInfo, isMessage = false) {
        var lMap = isMessage ? messageListeners:listeners;
        if (!lMap.has(completeInfo.ioClient.id)) {
            lMap.set(completeInfo.ioClient.id, new Map());
        }
        var listenerMap = lMap.get(completeInfo.ioClient.id);
        let path = completeInfo.info.listener.property;
        if (!listenerMap.has(path)) {
            listenerMap.set(path, completeInfo);
        }
    }

    this.sendMessage = (path, value) => {
        listenerChecker.dispatchMessage(path, value);
    }

    this.dispatchNow = () => {
        //dispara assim que possível ou espera o próximo loop
        listenerChecker.dispatchNow();
    }
    {
        /**
            info:{
                "listener":{
                    "property":"scenario.weather.barometer.pressure",
                    "updateMode":"onChange|onSet|onInterval|onChangeLength",
                    "frequency":1000
                },
                "handler":{
                    "method":"myMethod",
                    "filter":{
                    "mode":"full|changed",
                    "data":"scenario.weather"
                    }
                }
            }
         */
    }
    this.addListener = (info, ioClient, isMessage = false) => {
        if (!info || info.hasOwnProperty("path")) {
            return { success: false, message: "info?" };
        }
        let completeInfo = { info, ioClient, active: true };
        //mapeando o listener do path para avisar os clients com seus metodos
        addPathListeners(completeInfo, isMessage);
        //agora anotando todos os listeners desse client para facilitar remover todos os listeners do client
        addListenerPaths(completeInfo, isMessage);
        return { success: true, info, client_id: ioClient.id };
    }


    this.getListeners = () => {
        return pathListeners;
    }
    this.removeMessageListener = (info, ioClient)=>{
        this.removeListener(info, ioClient, true);
    }
    this.removeListener = (info, ioClient, isMessage = false) => {
        listenerChecker.removeListener(info.path, ioClient.id, isMessage);
        //
    }
    this.removeAll = (ioClient) => {
        listenerChecker.removeAll(ioClient.id);
    }
    this.setChange = (path, value) => {
        //seta o valor e conforme a configuração ele dispara o evento avisando que precisa avisar os listeners
        listenerChecker.setChanged(path, value);
    }
    this.clear = () => {
        listenerChecker.clear();
        listeners.clear();
        pathListeners.clear();
    }
}
module.exports = EventDispatcher;