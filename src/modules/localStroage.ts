/* eslint-disable */

export const set = (key: any, value: any) => {
  if (checkifSupport()) {
    localStorage.setItem(key, JSON.stringify(value))
  }
}
export const get = (key: any) => {
  let data = localStorage.getItem(key)

  return data && JSON.parse(data)
}
export const getAll = () => {
  const array = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    array.push(get(key))
  }
  return array
}

export const remove = (key: any) => {
  localStorage.removeItem(key)
  return true
}

export const clearAll = () => {
  localStorage.clear()
  return true
}

export const checkifSupport = () => {
  return 'localStorage' in window && window['localStorage'] !== null
}
