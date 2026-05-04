import { ref, shallowReactive, watchEffect } from 'vue'
import { reset } from '../data-utils'

const Func = Function

export function useGlobalState() {
  const globalState = ref([])

  const setGlobalState = (data = []) => {
    globalState.value = data
  }
  const stores = shallowReactive({})
  watchEffect(() => {
    reset(stores)
    globalState.value.forEach(({ id, state = {}, getters = {} }) => {
      const computedGetters = Object.keys(getters).reduce(
        (acc, key) => ({
          ...acc,
          [key]: new Func('return ' + getters[key].value)().call(acc, state)
        }),
        {}
      )
      stores[id] = { ...state, ...computedGetters }
    })
  })
  return {
    globalState,
    setGlobalState,
    stores
  }
}
