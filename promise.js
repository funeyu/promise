var FuPromise = function(defered, thenable){
  this.thens = [];
  this.result;
  this.nextPromise;
  this.defered = defered;
  // thenable is true on the condition Promise initialized in then function
  // in that case promise not needed to be called immediately
  if(!thenable) {
    this.calledSoon();
  }
}

FuPromise.prototype.calledSoon = function() {
  var self = this;
  setTimeout(function() {
    for (var i = 0, ii = self.thens.length; i < ii; i ++) {
      self.defered.call(null, self.thens[i].resolve, self.thens[i].reject);
    }
  }, 0);
}

FuPromise.prototype.then = function(resolve, reject){
  var me = this;
  var defered = function(resolvedHandler, rejectionHandler, value) {
  }
  var p = new FuPromise(defered, true);
  this.nextPromise = p;

  var onResolved = function(value) {
    me.result = resolve(value);
    if(me.result instanceof FuPromise) {
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
    else {//not find catch function, throwing the unCaught Exception
      throw Error(error);
    }
  };
  this.thens.push({'resolve': onResolved, 'reject': onRejected});
  return p;
}

FuPromise.prototype.catch = function(reject) {
  return this.then(void 0, reject);
}

FuPromise.all = function(promises) {
  if(!promises instanceof Array) {
    throw Error('all() only called with series of promises!');
  }

  var results = new Array(promises.length);
  var finished = 0;
  var delegates = new FuPromise(function(resolve, reject){});
  for(var i = 0, ii = promises.length; i < ii; i ++) {
    promises[i].then(function(result) {
      results[finished] = result;
      if((++finished) == promises.length) {
        delegates.nextPromise.defered(delegates.thens[0].resolve, void 0, results);
      }
    })
  }

  return delegates;
}

FuPromise.race = function(promises) {
  if(!promises instanceof Array) {
    throw Error('race() only called with series of promises!')
  }

  var ranking = 0;

  var fastest = new FuPromise(function(resolve, reject){});
  for(var i = 0, ii = promises.length; i < ii; i ++) {
    promises[i].then(function(result){
      if(++ranking === 1) {
        fastest.nextPromise.defered(fastest.thens[0].resolve, void 0, result);
      }
    });
  }

  return fastest;
}
