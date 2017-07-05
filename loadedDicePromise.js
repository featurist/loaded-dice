const RealPromise = global.Promise

function LoadedDicePromise (promise, {name} = {}) {
  if (typeof promise === 'function') {
    this.promise = new RealPromise(promise)
  } else {
    this.promise = promise
  }
  this.name = name
  LoadedDicePromise.promises.push(this)
  this.resolved = false
  this.rejected = false
  this.thens = []
  this.catches = []
  this.promise.then((r) => {
    this.result = r
    this.resolved = true
  }, (e) => {
    this.error = e
    this.rejected = true
  })
}

LoadedDicePromise.promises = []

LoadedDicePromise.reset = function () {
  LoadedDicePromise.promises.length = 0
}

LoadedDicePromise.all = RealPromise.all.bind(RealPromise)

LoadedDicePromise.install = function () {
  LoadedDicePromise.reset()
  global.Promise = LoadedDicePromise
}

LoadedDicePromise.uninstall = function () {
  global.Promise = RealPromise
}

LoadedDicePromise.prototype.resolve = function () {
  if (this.resolved) {
    return RealPromise.all(this.thens.map(fn => fn(this.result)))
  } else if (this.rejected) {
    return RealPromise.all(this.catches.map(fn => fn(this.error)))
  } else {
    return this.promise.then(() => this.resolve(), () => this.resolve())
  }
}

LoadedDicePromise.prototype.then = function (fn) {
  return new RealPromise((resolve, reject) => {
    this.thens.push(function (result) {
      try {
        RealPromise.resolve(fn(result)).then(resolve, reject)
      } catch (e) {
        reject(e)
      }
    })
  })
}

LoadedDicePromise.prototype.catch = function (fn) {
  return new RealPromise((resolve, reject) => {
    this.catches.push(function (result) {
      try {
        RealPromise.resolve(fn(result)).then(resolve, reject)
      } catch (e) {
        reject(e)
      }
    })
  })
}

module.exports = LoadedDicePromise
