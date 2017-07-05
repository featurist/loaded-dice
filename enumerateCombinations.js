const LoadedDicePromise = require('./loadedDicePromise')

module.exports = async function enumerateCombinations(items, run, next) {
  const takeItem = async (index) => {
    if (index >= items.length) {
      throw new Error('arg')
    }
    const item = items[index]
    items.splice(index, 1)
    await next(item)
    return item.name
  }

  const rerun = async (choices) => {
    run()
    const makeChoice = async (index) => {
      const item = await takeItem(index)
      return {
        index,
        item,
        items: items.map(i => i.name),
        itemsLength: items.length,
        rest: await makeChoices()
      }
    }

    const followChoice = async (choice) => {
      await takeItem(choice.index)
      if (items.length !== choice.itemsLength) {
        throw new Error('race condition detected')
      }
      await makeChoices(choice.rest)
      return choice
    }

    const makeChoices = async (choices) => {
      if (choices) {
        const withRemaining = choices.choicesMade.find(c => choicesRemaining(c.rest))

        if (withRemaining) {
          await followChoice(withRemaining)
        } else if (choices.choicesMade.length < choices.total) {
          const index = choices.choicesMade.length
          choices.choicesMade.push(await makeChoice(index))
        }

        return choices
      } else {
        const total = items.length
        const _choices = {
          total,
          choicesMade: []
        }

        if (total) {
          _choices.choicesMade.push(await makeChoice(0))
        }

        return _choices
      }
    }

    const newChoices = await makeChoices(choices)

    if (choicesRemaining(newChoices)) {
      await rerun(newChoices)
    }
  }

  await rerun()
}

function choicesRemaining (choices) {
  return (choices.total > choices.choicesMade.length)
    || choices.choicesMade.some(c => choicesRemaining(c.rest))
}
