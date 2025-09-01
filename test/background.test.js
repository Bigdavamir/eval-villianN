// Mock the browser API that background.js uses
global.browser = {
  commands: {
    onCommand: {
      addListener: jest.fn(),
    },
  },
  runtime: {
    onMessage: {
      addListener: jest.fn(),
    },
    onInstalled: {
      addListener: jest.fn(),
    },
  },
  storage: {
    local: {
      get: jest.fn().mockResolvedValue({ evalVillainActive: false }),
      set: jest.fn().mockResolvedValue(),
    },
  },
  webNavigation: {
    onBeforeNavigate: {
      addListener: jest.fn(),
    },
    onCommitted: {
        addListener: jest.fn()
    }
  },
};

const { arraysEqual } = require('../src/js/background.js');

describe('arraysEqual', () => {
  test('should return true for equal arrays', () => {
    const arr1 = [1, 2, 3];
    const arr2 = [1, 2, 3];
    expect(arraysEqual(arr1, arr2)).toBe(true);
  });

  test('should return false for arrays with different lengths', () => {
    const arr1 = [1, 2, 3];
    const arr2 = [1, 2];
    expect(arraysEqual(arr1, arr2)).toBe(false);
  });

  test('should return false for arrays with different elements', () => {
    const arr1 = [1, 2, 3];
    const arr2 = [1, 5, 3];
    expect(arraysEqual(arr1, arr2)).toBe(false);
  });

  test('should return true for empty arrays', () => {
    const arr1 = [];
    const arr2 = [];
    expect(arraysEqual(arr1, arr2)).toBe(true);
  });
});
