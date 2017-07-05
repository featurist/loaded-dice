const loadedDice = require('..')
const expect = require('chai').expect

describe('loaded dice', () => {
  let order

  function operation(name) {
    return new Promise(r => setTimeout(r, 10), {name}).then(() => order.push(name))
  }

  it('can enumerate all 3 race conditions for 2 promises + one dependent on the second', async () => {
    const conditions = []

    await loadedDice(async () => {
      order = []

      const a = operation('a')
      let c
      const b = operation('b').then(() => {
        c = operation('c')
      })
      Promise.all([a, b]).then(function () {
        c.then(function () {
          conditions.push(order)
        })
      })
    })

    expect(conditions).to.eql([
      ['a', 'b', 'c'],
      ['b', 'a', 'c'],
      ['b', 'c', 'a']
    ])
  })

  it('can enumerate all 6 race conditions for 3 promises', async () => {
    const conditions = []

    await loadedDice(async () => {
      order = []

      const a = operation('a')
      const b = operation('b')
      const c = operation('c')

      Promise.all([a, b, c]).then(function () {
        conditions.push(order)
      })
    })

    expect(conditions).to.eql([
      ['a', 'b', 'c'],
      ['a', 'c', 'b'],
      ['b', 'a', 'c'],
      ['b', 'c', 'a'],
      ['c', 'a', 'b'],
      ['c', 'b', 'a']
    ])
  })
})
