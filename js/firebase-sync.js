(function(){
'use strict';
var cfg={apiKey:"AIzaSyD_mmnXJtGLDpkyRV8o9SXJUG4WwIJIEtY",authDomain:"cedrick-353a7.firebaseapp.com",databaseURL:"https://cedrick-353a7-default-rtdb.firebaseio.com",projectId:"cedrick-353a7",storageBucket:"cedrick-353a7.firebasestorage.app",messagingSenderId:"824923397663",appId:"1:824923397663:web:c998882defe0f0629cbf2a"};
if(!firebase.apps.length){firebase.initializeApp(cfg);}
var db=firebase.database();
var KEYS=['cs_products','cs_categories','cs_brands','cs_coupons','cs_banners','cs_testimonials','cs_orders','cs_users','cs_settings','cs_wallets','cs_wallet_txs','cs_digital_products','cs_seeded_v1'];
var oSet=localStorage.setItem.bind(localStorage);
var oRem=localStorage.removeItem.bind(localStorage);
var s=false;
function push(k){if(s)return;var v=localStorage.getItem(k);if(v===null){db.ref('store/'+k).remove();}else{try{db.ref('store/'+k).set(JSON.parse(v));}catch(e){db.ref('store/'+k).set(v);}}}
function pushAll(){var d={};KEYS.forEach(function(k){var v=localStorage.getItem(k);if(v){try{d[k]=JSON.parse(v);}catch(e){d[k]=v;}}});db.ref('store').update(d);}
function pullAll(cb){db.ref('store').once('value').then(function(snap){var d=snap.val();if(d){s=true;KEYS.forEach(function(k){if(d[k]!==undefined&&d[k]!==null){oSet(k,JSON.stringify(d[k]));}});s=false;}if(cb)cb(!!d);});}
localStorage.setItem=function(k,v){oSet(k,v);if(!s&&KEYS.includes(k)){push(k);}};
localStorage.removeItem=function(k){oRem(k);if(!s&&KEYS.includes(k)){db.ref('store/'+k).remove();}};
db.ref('store').on('value',function(snap){var d=snap.val();if(!d||s)return;s=true;var ch=false;KEYS.forEach(function(k){if(d[k]!==undefined){var c=localStorage.getItem(k);var r=JSON.stringify(d[k]);if(c!==r){oSet(k,r);ch=true;}}});s=false;if(ch&&window.CS){CS.emit('cart');CS.emit('auth');CS.emit('digital');CS.emit('wallet');CS.emit('orders');}});
pullAll(function(had){if(!had){pushAll();}});
window.firebaseSync={pushAll:pushAll,pullAll:pullAll,db:db};
console.log('[Firebase] Sync ON');
})();
