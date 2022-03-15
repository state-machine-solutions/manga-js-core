function string2Object (path, finalValue)  {
    var numberRegex = /\.([0-9]+)$|\.([0-9]+)\./igm;
    

    var objFromString =(keys, value)=>{
        
        var depthIndexes = keys.split(".");
        var depth = depthIndexes.length - 1;
        var regex = /([a-zA-Z-_0-9]+)(\.?)/gm;
        keys = keys.replace(regex, '"$1":{');
        var closure = new Array(depth)
        keys += `}` + closure.fill('}', 0, depth).join('');
        
        keys = `{${keys}}`

        try{
            var data = JSON.parse(keys);
        }catch(e){
            console.log( 'BIG ERROR MF:' + path );
            console.log( keys )
        }
        let pointer = data;
        while( depthIndexes.length-1 >0 ){
            pointer = pointer[depthIndexes.shift()];
        }
        pointer[depthIndexes.shift()] = value;
        return (data);
    }

    var getArrVal =  (path, finalValue)=>{
        var x = path.search(numberRegex);    
        var initialPath = path.substring(0,x);


        var strIndex = path.match(/[0-9]+/)

        var arrIndex = parseInt(strIndex );
        var value = [];
        var arrValue = path.substring(x + strIndex[0].length+2  ,path.length);
        

        if( arrValue.search(numberRegex) >= 0 ){
            arrValue = getArrVal( arrValue, finalValue )
            value[arrIndex] = arrValue;
            return  objFromString( initialPath, value );
        }

        if( arrValue.length == 0){
            value[arrIndex] = finalValue;
            return  objFromString( initialPath, value );
        }

        arrValue = objFromString( arrValue, finalValue );    
        value[arrIndex] = arrValue;
        return  objFromString( initialPath, value );
            
        
    }
    //se não tem número no path segue pelo simples
    return path.search(numberRegex) >= 0 ? getArrVal(path, finalValue) : objFromString( path, finalValue ); 
    
    
}

module.exports = string2Object