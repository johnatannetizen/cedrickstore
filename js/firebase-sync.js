(function(){
'use strict';
var cfg={apiKey:"AIzaSyCEkdFB6EgoCFANhH_BxfHkdq3uAoyl2og",authDomain:"cedrickstore-e94e5.firebaseapp.com",databaseURL:"https://cedrickstore-e94e5-default-rtdb.firebaseio.com",projectId:"cedrickstore-e94e5",storageBucket:"cedrickstore-e94e5.firebasestorage.app",messagingSenderId:"668418475850",appId:"1:668418475850:web:27ad47cd15be3e69d2e3b3"};
if(!firebase.apps.length)firebase.initializeApp(cfg);
var db=firebase.database();
var KEYS=['cs_products','cs_categories','cs_brands','cs_coupons','cs_banners','cs_testimonials','cs_orders','cs_users','cs_settings','cs_wallets','cs_wallet_txs','cs_digital_products','cs_seeded_v1','cs_product_codes'];
var oSet=localStorage.setItem.bind(localStorage);
var oRem=localStorage.removeItem.bind(localStorage);
var syncing=false;
function pushKey(k){if(syncing)return;var v=localStorage.getItem(k);if(v===null)db.ref('store/'+k).remove();else{try{db.ref('store/'+k).set(JSON.parse(v));}catch(e){db.ref('store/'+k).set(v);}}}
function pushAll(){var d={};KEYS.forEach(function(k){var v=localStorage.getItem(k);if(v){try{d[k]=JSON.parse(v);}catch(e){d[k]=v;}}});return db.ref('store').update(d);}
function pullAll(cb){return db.ref('store').once('value').then(function(snap){var d=snap.val();if(d){syncing=true;KEYS.forEach(function(k){if(d[k]!==undefined&&d[k]!==null)oSet(k,JSON.stringify(d[k]));});syncing=false;}if(cb)cb(!!d);});}
localStorage.setItem=function(k,v){oSet(k,v);if(!syncing&&KEYS.indexOf(k)>=0)pushKey(k);};
localStorage.removeItem=function(k){oRem(k);if(!syncing&&KEYS.indexOf(k)>=0)db.ref('store/'+k).remove();};
KEYS.forEach(function(k){db.ref('store/'+k).on('value',function(snap){if(syncing)return;var val=snap.val();if(val===null||val===undefined)return;var remote=JSON.stringify(val);var local=localStorage.getItem(k);if(local!==remote){syncing=true;oSet(k,remote);syncing=false;if(window.CS){try{if(k==='cs_users')CS.emit('auth');else if(k==='cs_orders')CS.emit('orders');else if(k==='cs_cart')CS.emit('cart');else if(k==='cs_wallets'||k==='cs_wallet_txs')CS.emit('wallet');else if(k==='cs_digital_products')CS.emit('digital');else if(k==='cs_settings')CS.emit('settings');}catch(e){}}}});});
function init(){db.ref('store/cs_seeded_v1').once('value').then(function(snap){if(snap.val()){pullAll(function(){if(window.CS){try{CS.emit('cart');CS.emit('auth');CS.emit('digital');CS.emit('wallet');CS.emit('orders');CS.emit('settings');}catch(e){}}});}else{pushAll();}});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
window.firebaseSync={pushAll:pushAll,pullAll:pullAll,pushKey:pushKey,db:db};
console.log('[Firebase] Sync v3 - cedrickstore-e94e5');
})();
