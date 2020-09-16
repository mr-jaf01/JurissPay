self.addEventListener('install', function(event){
    console.log('serviceWorker Install');
    event.waitUntil(
        caches.open('static')
        .then(function(cache){
            cache.addAll([
                '/',
                '/auth/login',
                '/auth/signup',
                '/images/jPay.jpg',
                '/dashboard',
                'https://kit.fontawesome.com/eba3306b09.js',
                '/css/bootstrap.min.css',
                '/css/mdb.min.css',
                '/css/style.css',
                '/css/sticky.css',
                '/css/dashboard.css',
                'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.0.0/animate.min.css',

            ]);
        })
    );
    
});

self.addEventListener('activate', function(){
    console.log('serviceWorker activate');
});

self.addEventListener('fetch', function(event){
    event.respondWith(
        caches.match(event.request)
            .then(function(res){
                if(res){
                    return res;
                }else{
                    return fetch(event.request);
                }
            })
    );
});

