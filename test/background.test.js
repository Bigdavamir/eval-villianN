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
    onStartup: {
        addListener: jest.fn(),
    },
    getURL: jest.fn(path => `moz-extension://<uuid>${path}`),
  },
  storage: {
    local: {
      get: jest.fn().mockResolvedValue({}),
      set: jest.fn().mockResolvedValue(),
      clear: jest.fn().mockResolvedValue(),
    },
  },
  contentScripts: {
      register: jest.fn().mockResolvedValue({
          unregister: jest.fn(),
      }),
  },
  browserAction: {
      setTitle: jest.fn(),
      setIcon: jest.fn(),
  }
};

const { arraysEqual } = require('../src/js/background.js');

describe('arraysEqual', () => {
    beforeEach(() => {
        // Clear mock history before each test
        jest.clearAllMocks();
    });

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
