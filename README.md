## 自己实现的promise 小轮子
> 目前支持的功能包括：
 + 简单的resolve, reject方法；
 + 链式调用加

## 使用的范例
``` javascript

new FuPromise(function(resolve){
   window.setTimeout(function(){resolve(10000)}, 4000);
}).then(function(value){
  console.log(value);
  return new FuPromise(function(resolve, reject) {
    window.setTimeout(function(){
      resolve(20000)
    }, 4000);
  });
}).then(function(val){
  console.log(val + 'dfa');
  return new FuPromise(function(resolve,reject) {
    window.setTimeout(function(){
      reject(val + 'ddd');
    }, 1000);
  })
}).then(function(value){
  console.log(value);
}).catch(function(error){
  console.log(error);
});

```
> 如上代码支持链式写法，catch的链式捕捉

+ Promise的all方法使用范例：
``` javascript
var promise1 = new FuPromise(function(resolve, reject){
  window.setTimeout(function(){resolve('promise1')}, 1000);
});
var promise2 = new FuPromise(function(resolve, reject){
  window.setTimeout(function() {
    resolve('promise2')
  }, 2000);
});
FuPromise.all([promise1, promise2]).then(function(results){
  console.log(results);
});
```
+ Promise的race 方法使用范例：
``` javascript
var promise1 = new FuPromise(function(resolve, reject){
  window.setTimeout(function(){resolve('promise1')}, 1000);
});
var promise2 = new FuPromise(function(resolve, reject){
  window.setTimeout(function() {
    resolve('promise2')
  }, 2000);
});
FuPromise.race([promise1, promise2]).then(function(results){
  console.log(results);
});
```

## ajax的请求范例
``` javascript
function getURL(URL) {
    return new FuPromise(function (resolve, reject) {
        var req = new XMLHttpRequest();
        req.open('GET', URL, true);
        req.onload = function () {
            if (req.status === 200) {
                resolve(req.responseText);
            } else {
                reject(new Error(req.statusText));
            }
        };
        req.onerror = function () {
            reject(new Error(req.statusText));
        };
        req.send();
    });
}
// 运行示例
var URL = "http://www.fengjr.com/";
getURL(URL).then(function (value){
    console.log('value');
    console.log(value);
}).catch(function (error){
    console.error(error);
});
```
