var FuPromise = function(excutor){
  if(typeof excutor !== 'function') {
    return new Error('excutor should be a function')
  }
  this.follow;
  this.state = 'PENDING';
  this.result;
  this.thens = [];
  this._execute(excutor)
}

FuPromise.prototype._execute = function(excutor) {

  excutor.call(this, this.onFulfilled.bind(this), this.onRejected)
}

FuPromise.prototype.onFulfilled = function(value) {
  if(this.state !== 'PENDING') return

  this.state = 'FULFILLED'
  this.result = value;
  this._async(this, void 0, void 0)
}

FuPromise.prototype.onRejected = function(reason) {
  if(this.state !== 'PENDING') return

  this.state = 'REJECTED'
  this.result = reason;
}

FuPromise.prototype._async = function(promise, handler, arg) {
  var me = this

  setTimeout(function() {

    for(var i = 0; i < me.thens.length; i ++) {
      console.log('result', me)
      me.thens[i].fulfillmentHandler.call(me, me.result)
    }
  }, 0)
}

FuPromise.prototype.then = function(onFulfilled, onRejected) {
  var promise = new FuPromise(function(resolve, reject) {})
  this.follow = promise
  var me = this
  this.thens.push({
    fulfillmentHandler: function(result) {
      onFulfilled(result)
    },
    rejectionHandler: function(reason) {
      onRejected(reason)
    }
  })

  return promise
}
