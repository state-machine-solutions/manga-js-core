function injecData( sourceObject, path, value ){
    refObj = sourceObject;
    var nodes = path.split('.');
    
    var drillDown = (obj)=>{
        var index = nodes.shift();
        if(!obj.hasOwnProperty(index) || ( obj[index] == null && nodes.length > 0 )  ){
            obj[index] = {};
        }
        
        if(obj.hasOwnProperty(index) && nodes.length == 0){
            obj[index] = value;
            return;
        }
        
        drillDown(obj[index]);
        return ;

    };
    drillDown(sourceObject);
    return sourceObject;
}

module.exports = injecData