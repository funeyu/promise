
var FuPromise = function(excutor){
  if(typeof excutor !== 'function') {
    return new Error('excutor should be a function')
  }
  this.follow
  this.state = 'PENDING'
  this.result
  this.thens = []

  this._execute(excutor)
}

FuPromise.prototype.followee = function() {
  return this.follow
}

FuPromise.prototype._execute = function(excutor) {

  excutor.call(this, this.onFulfilled.bind(this), this.onRejected.bind(this))
}

FuPromise.prototype.onFulfilled = function(value) {
  if(this.state !== 'PENDING') return

  this.state = 'FULFILLED'
  this.result = value
  this._async(this, void 0, void 0)
}

FuPromise.prototype.onRejected = function(reason) {
  if(this.state !== 'PENDING') return

  this.state = 'REJECTED'
  this.result = reason
  this._async(this, void 0, void 0)
}

FuPromise.prototype._async = function(promise, handler, arg) {
  var me = this

  FuPromise.schedule(function() {
    for(var i = 0; i < me.thens.length; i ++) {
      var followee = me.thens[i].promise
      if(me.state === 'FULFILLED') {
        try {
          var result = me.thens[i].fulfillmentHandler.call(me, me.result)
          if(result && typeof result.then !== 'undefined') {
            // 如果then返回的是promise就直接将后继promise的thens 接到此promise上
            result.thens = followee.thens
          }
          else {
            followee.onFulfilled(result)
          }
        } catch(error) {

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
    fulfillmentHandler: function(result) {
      return onFulfilled(result)
    },
    rejectionHandler: function(reason) {
      return onRejected(reason)
    }
  })

  return promise
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
