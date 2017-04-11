
var FuPromise = function(excutor){
  if (typeof excutor !== 'function') {
    return new Error('excutor should be a function')
  }
  //.then 生成的promise，形成promise链
  this.follow
  this.state = 'PENDING'
  this.result
  this.thens = []

  this._execute(excutor)
}

FuPromise.prototype.getFollowee = function() {

  return this.follow
}

FuPromise.prototype._execute = function(excutor) {

  excutor.call(this, this.onFulfilled.bind(this), this.onRejected.bind(this))
}

FuPromise.prototype.onFulfilled = function(value) {
  if(this.state !== 'PENDING') return

  this.state = 'FULFILLED'
  this.result = value
  this._async()
}

FuPromise.prototype.onRejected = function(reason) {
  if(this.state !== 'PENDING') return

  this.state = 'REJECTED'
  this.reason = reason
  this._async()
}

// 异步调用then的回调
FuPromise.prototype._async = function(promise, handler, arg) {
  var me = this

  FuPromise.schedule(function() {
    for(var i = 0; i < me.thens.length; i ++) {
      var followee = me.thens[i].promise
      if(me.state === 'FULFILLED') {
        // 如果.then没有成功回调，则将此result传递给follow
        if (!me.thens[i].fulfillmentHandler) {
          followee.onFulfilled(me.result)
        }
        else { //成功回调
          try {
            var result = me.thens[i].fulfillmentHandler.call(me, me.result)
            if (result && typeof result.then !== 'undefined') {
              // 如果then返回的是promise就直接将后继promise的thens 接到此promise上
              result.thens = followee.thens
            }
            else {
              followee.onFulfilled(result)
            }
          } catch (error) {
            me.thens[i].rejectionHandler.call(me, error)
          }
        }
      }

      if (me.state === 'REJECTED') {
        if (!me.thens[i].rejectionHandler) {
          if (!followee.getFollowee()) throw new Error(me.reason + 'error produced by promise should be caught')
          followee.onRejected(me.reason)
        }
        else {
          var result = me.thens[i].rejectionHandler.call(me, me.reason)
          if(result && typeof result.then !== 'undefined') {
            result.thens = followee.thens
          }
          else {
            followee.onFulfilled(result)
          }
        }
      }

    }
  })
}

FuPromise.prototype.then = function(onFulfilled, onRejected) {
  var promise = new FuPromise(function(resolve, reject) {})
  this.follow = promise
  var me = this
  this.thens.push({
    promise: promise,
    fulfillmentHandler: onFulfilled
      ? function(result) {
        return onFulfilled(result)
      }
      : void 0,

    rejectionHandler: onRejected
      ? function(reason) {
        return onRejected(reason)
      }
      : void 0
  })

  return promise
}

FuPromise.prototype.catch = function(reject) {
  return this.then(void 0, reject)
}

// static method
FuPromise.reject = function(reason) {
  return new FuPromise(function(resolve, reject) {
    reject(reason)
  })
}

FuPromise.resolve = function(result) {
  return new FuPromise(function(resolve, reject) {
    resolve(result)
  })
}

FuPromise.all = function(promiseArray) {
  if(!promiseArray instanceof Array) {
    throw Error('all() only called with series of promises!')
  }

  var results = new Array(promiseArray.length)
  var finished = 0
  var p = new FuPromise(function(resolve, reject){})
  for(var i = 0; i < promiseArray.length; i ++) {
    promiseArray[i].then(function(data) {
      results[finished++] = data
      if(finished === promiseArray.length) {
        p.onFulfilled(results)
      }
    }).catch(function(reason){
      // 这里是p已经settled，下面的p.onResolved(results)就会不起作用
      p.onRejected(reason)
    })
  }

  return p
}

FuPromise.race = function(promiseArray) {
  if(!promiseArray instanceof Array) {
    throw Error('race() only called with series of promises!')
  }

  var p = new FuPromise(function(resolve, reject){})
  var first = 0
  var errorCount = 0
  for(var i = 0; i < promiseArray.length; i ++) {
    promiseArray[i].then(function(data) {
      if(++first === 1) {
        p.onFulfilled(data)
      }
    }).catch(function(error){
      if(++errorCount === promiseArray.length) {
        p.onRejected('no promise resolved!!!')
      }
    })
  }

  return p
}

// 根据浏览器环境设置异步调用
if(typeof MutationObserver !== 'undefined' && typeof window !== 'undefined') {
  FuPromise.schedule = (function() {
    var div = document.createElement('div')
    var opts = {attributes: true}
    var div2 = document.createElement('div')
    toggleScheduled = false
    var o2 = new MutationObserver(function() {
      div.classList.toggle('foo')
      toggleScheduled = false
    })
    o2.observe(div2, opts)

    var scheduleToggle = function() {
      if(toggleScheduled) return
      toggleScheduled = true
      div2.classList.toggle('foo')
    }

    return function schedule(fn) {
      var o = new MutationObserver(function() {
        o.disconnect()
        fn()
      })
      o.observe(div, opts)
      scheduleToggle()
    }
  })()
}
else if(typeof setTimeout !== 'undefined') {
  FuPromise.schedule = function(fn) {
    setTimeout(fn, 0)
  }
}
