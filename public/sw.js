self.addEventListener('install', (event)=>{
    console.log('service worker Installed');
    caches.open('public').then(()=>{
        cache.addAll([
            '/',
            '/css/bootstrap.min.css',
            '/css/mdb.min.css',
            '/css/style.css',
            '/css/sticky.css',
            '/css/dashboard.css',
            '/images/jPay.jpg',
            '/auth/login',
            '/auth/signup',
            '/dashboard',
            'https://kit.fontawesome.com/eba3306b09.js',
            'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.0.0/animate.min.css'
        ]);
        
    })
});

self.addEventListener('activate', ()=>{
    console.log('service worker Activated');
});

self.addEventListener('fetch', (event)=>{
    event.respondWith(
        caches.match(event.request)
            .then((res)=>{
                if(res){
                    return res;
                }else{
                    return fetch(event.request);
                }
            })
    );
});