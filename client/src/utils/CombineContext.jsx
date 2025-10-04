export default function combineContext(...providers){
    /*
        This combines multiple contextProviders together and 
        return a single context
    */

     return ({children})=>{
        return providers.reduce((acc, Currentprovider)=>{
            return <Currentprovider>{acc}</Currentprovider>;
        }, children); // initial value of acc is children
     };
};

