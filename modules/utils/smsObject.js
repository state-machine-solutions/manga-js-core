function isObject( ob ){
    if(ob ==null )
        return false;
    return   (  typeof ob === 'object' && !ob.hasOwnProperty('length') );//Object.keys(ob).length > 0;
}

/*
    Pega um objeto e retorna um array com o "path" até o respectivo valor
    usado para depois do diff para gerar lista de mudanças
*/
function data2list( object, prepend){

    var list = []
    this.append = (path, value)=>{
        list.push({path,value});
    }
    this.drillDown = (refObj, path)=>{
        var keys = Object.keys( refObj );
        for( var k in keys ){
            var key = keys[k];
            if( isObject(refObj[key]) ){

                this.drillDown( refObj[key], `${path}.${key}` );
            }else{
                this.append( `${path}.${key}`, refObj[key]);
            }
        }
    }
    if( !isObject(object) ){
        this.append( prepend, object );
        return list;
    }
    this.drillDown( object, prepend );

    return list;

}

function removeNode( obj, path ){
    var originalObj = obj;
    var nodes = path.split('.');
    var removeNode = nodes.pop();
    
    this.drillDown = ()=>{
        var node = nodes.shift()
        if( obj != undefined&&  obj.hasOwnProperty( node ) ){
            obj = obj[node];
            if( nodes.length == 0 ){
                delete obj[removeNode];
                return originalObj;
            }
            return this.drillDown()
        }else{
            // Se vier um path inválido nada acontece
            console.log( " non data for delete at: " + path )
            return originalObj;
            
        }
    }

    return this.drillDown();
}

module.exports = {
    delete:removeNode,
    isObject,
    inject:require('./sms/injecData'),
    fromString:require('./sms/string2Object'),
    normalize:require('./sms/objectNormalize'),
    extract:require('./sms/objectDataFromPath'),
    data2list
};