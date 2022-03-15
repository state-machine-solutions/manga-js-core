function PersistData( eventDispatcher ){
    eventDispatcher.addListener({
        path:"",
        type:"internal",
        method:(data)=>{
            persistData.save( data ) ;
        },
        frequence: 5000
    })
    this.getLast = async ()=> {
        //
        return 1
    }
    this.getSaved = ( token )=>{
        //
    }
    this.save = (token, data)=>{
        //
    }
}
module.exports = PersistData ;