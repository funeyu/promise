## 自己实现的promise 小轮子
> 目前支持的功能包括：
 + 简单的resolve, reject方法；
 + 链式调用加

## 使用的范例
``` javascript

new Promise(function(resolve){
   window.setTimeout(function(){resolve(10000)}, 4000);
}).then(function(value){
  console.log(value);
  return new Promise(function(resolve, reject) {
    window.setTimeout(function(){
      resolve(20000)
    }, 4000);
  });
}).then(function(val){
  console.log(val + 'dfa');
  return new Promise(function(resolve,reject) {
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
var promise1 = new Promise(function(resolve, reject){
  window.setTimeout(function(){resolve('promise1')}, 1000);
});
var promise2 = new Promise(function(resolve, reject){
  window.setTimeout(function() {
    resolve('promise2')
  }, 2000);
});
Promise.all([promise1, promise2]).then(function(results){
  console.log(results);
});
```
