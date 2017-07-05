const enumerateCombinations = require('./enumerateCombinations')
const LoadedDicePromise = require('./loadedDicePromise')

module.exports = async function loadedDice (fn) {
  try {
    LoadedDicePromise.install()
    await enumerateCombinations(LoadedDicePromise.promises, fn, p => p.resolve())
  } catch (e) {
    LoadedDicePromise.uninstall()
  }
}
