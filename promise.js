var Promise = function(defered, thenable){
  this.thens = [];
  this.result;
  this.nextPromise;
  this.defered = defered;
  if(!thenable) {
    this.calledSoon();
  }
}

Promise.prototype.calledSoon = function() {
  setTimeout(function() {
    for (var i = 0, ii = this.thens.length; i < ii; i ++) {
      this.defered.call(null, this.thens[i].resolve, this.thens[i].reject);
    }
  }.bind(this), 0);
}

Promise.prototype.then = function(resolve, reject){
  var me = this;
  var defered = function(resolve, reject, value) {}
  var p = new Promise(defered, true);
  this.nextPromise = p;

  var onResolved = function(value) {
    me.result = resolve(value);
    if(me.result instanceof Promise) {
      me.result.thens = me.nextPromise.thens;
      return me.result;
    }
    if(me.nextPromise.nextPromise) {
      for(var i = 0, ii = me.nextPromise.thens.length; i < ii; i ++ ){
        me.nextPromise.defered(me.nextPromise.thens[i].resolve, void 0, value);
      }
    }
  }

  var onRejected = function(error) {
    if(reject) {
      return reject(error);
    }
    if(me.nextPromise.nextPromise){
      for(var i = 0, ii = me.nextPromise.thens.length; i < ii; i ++) {
        me.nextPromise.thens[i].reject(error);
      }
    }
    else {//没找到catch函数，抛出未处理的错误；
      throw Error(error);
    }
  };
  this.thens.push({'resolve': onResolved, 'reject': onRejected});
  return p;
}

Promise.prototype.catch = function(reject) {
  return this.then(void 0, reject);
}
