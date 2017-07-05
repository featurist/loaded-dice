module.exports = function wait (n) {
  return new Promise(r => setTimeout(r, n))
}
