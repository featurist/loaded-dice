const LoadedDicePromise = require('../loadedDicePromise')
const expect = require('chai').expect
const wait = require('./wait')

describe('LoadedDicePromise', () => {
  afterEach(() => {
    LoadedDicePromise.reset()
  })

  it('can stand in for a real promise', () => {
    const promise = new LoadedDicePromise(r => setTimeout(r, 1))

    let resolved = false
    const all = Promise.all([promise]).then(() => {
      resolved = true
    })

    return wait(0).then(() => {
      expect(resolved).to.equal(false)

      promise.resolve()

      return wait(2).then(() => {
        expect(resolved).to.equal(true)
      })
    })
  })

  it('can resolve with a result', () => {
    const promise = new LoadedDicePromise(r => setTimeout(() => r('result'), 1))

    promise.resolve()

    return promise.then((result) => {
      expect(result).to.equal('result')
    })
  })

  it('can be rejected with an error', () => {
    const error = new Error('yikes')
    const promise = new LoadedDicePromise((resolve, reject) => setTimeout(() => reject(error), 0))
    let actualError

    promise.resolve()

    promise.catch((e) => {
      actualError = e
    })

    return wait(1).then(() => {
      expect(actualError).to.equal(error)
    })
  })

  it('resolves only when told to', () => {
    let timeoutFired = false
    let promiseResolved = false

    const promise = new LoadedDicePromise(r => {
      setTimeout(() => {
        r('result')
        timeoutFired = true
      }, 0)
    })
    
    promise.then(() => {
      promiseResolved = true
    })

    return wait(1).then(function () {
      expect(timeoutFired).to.equal(true)
      expect(promiseResolved).to.equal(false)

      promise.resolve()

      return wait(1).then(function () {
        expect(promiseResolved).to.equal(true)
      })
    })
  })
})
