import { clearAll, get, getAll, remove, set } from './localStroage'

describe('LocalStorage', () => {
  describe('when localStorage handlers invoked', () => {
    it('should set item to localStorage', () => {
      const setMock = jest.fn(set)

      setMock('KEY', 'VALUE')
      setMock('KEY2', 'VALUE2')
      expect(localStorage.getItem('KEY')).toBe('"VALUE"')
    })

    it('should getItem item to localStorage', () => {
      const getMock = jest.fn(get)
      const value = getMock('KEY')

      expect(value).toBe('VALUE')
    })

    it('should getallItems item to localStorage', () => {
      const getAllMock = jest.fn(getAll)
      const values = getAllMock()

      expect(values).toStrictEqual(['VALUE', 'VALUE2'])
    })

    it('should removeItem item to localStorage', () => {
      const removeMock = jest.fn(remove)
      const result = removeMock('KEY2')

      expect(result).toBeTruthy()
    })

    it('should clearAll item to localStorage', () => {
      const clearAllMock = jest.fn(clearAll)
      const result = clearAllMock()

      expect(result).toBeTruthy()
    })
  })
})
