// 测试,v0.1版本和原生Promise执行结果不一致
new Promise(resolve=>{
    resolve(new Promise(reject=>{
        setTimeout(()=>{
    reject(Promise.resolve(1))
},3000)
}))
})
.then(console.log).catch(console.log)
