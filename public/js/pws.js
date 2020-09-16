if('serviceWorker' in navigator){
    navigator.serviceWorker.register('/serviceW.js')
        .then(function(){
            console.log('serviceWorker registered');
        });
}