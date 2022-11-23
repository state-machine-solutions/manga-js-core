const smsObj = require('../utils/smsObject');
const { mergeAdvanced } = require("object-merge-advanced");

const { diff, addedDiff, deletedDiff, detailedDiff, updatedDiff } = require("deep-object-diff");

function DataBind( dataHolder ){

    this.getChanges = (oldData, newData )=>{

        
        if( isEqual( oldData, newData) ){
            return null;
        }
        if( smsObj.isObject( oldData ) && smsObj.isObject( newData ) ){
            var addDiffResult = addedDiff(oldData,newData);
            var updatedDiffResult = updatedDiff(oldData,newData);
            var changes =  mergeAdvanced( addDiffResult, updatedDiffResult );
            if( Object.keys(changes).length > 0 ){
                return changes;
            }
            return null;
        }
        return newData;
    }

    function isEqual(a,b){
        //TODO:
        return false;
    }

    this.bind = async (path, value)=>{
       
        //1 - Colocar todos os primitivos como _val #SQN
        //value = await smsObj.normalize(value);

        // converte o path em um objeto SMSico
        // coloca o value, dentro de um objeto que segue o PATH para poder fazer o merge
        var newContent = await  smsObj.fromString( path, value ); //<<< BUG! Value não é string
        

        //filtra o conteudo do que foi enviado pro path para comparar com o dado do HOLDER
        var newData = await smsObj.extract( newContent, path );
        var oldData = await  dataHolder.get( path );
       
        
        
        //var diffResult = diff(oldData,newData)
        //var dataChanged  = Object.keys( diffResult ).length !== 0 ;
 
        var changes = this.getChanges( oldData, newData)

        if( changes !== null ){

                //registra dados novos
                await dataHolder.set( newContent );
                //2 - montar lista como todos os paths que mudaram
                // pega o path e diffResult pra mandar pra trás
                var returnData = smsObj.data2list(changes, path);
                
                // 3 mandar a lista no retorno da solicitação
                return returnData
        }
        return [];

    }
}
module.exports = DataBind ;