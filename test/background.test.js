// Mock the browser API that background.js uses
// This MUST be defined before require('../src/js/background.js')
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
    sendMessage: jest.fn().mockResolvedValue(),
  },
  tabs: {
      query: jest.fn().mockResolvedValue([]),
      sendMessage: jest.fn().mockResolvedValue(),
  },
  storage: {
    local: {
      get: jest.fn().mockResolvedValue({ evalVillainActive: true }),
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

// Now we can require the background script.
const { arraysEqual, defaultConfig } = require('../src/js/background.js');

// We need to mock the implementation of 'get' again here because the
// background script will have been loaded and the mock above will have been
// used. For the actual tests, we want to return the full defaultConfig.
browser.storage.local.get.mockImplementation(keys => {
    if (Array.isArray(keys) && keys.includes('evalVillainActive')) {
        return Promise.resolve({ evalVillainActive: true });
    }
    return Promise.resolve(defaultConfig);
});

// Since the `require` statement is at the top, the background script's top-level
// code has already run. We can now clear any mocks that were called during import.
beforeEach(() => {
    jest.clearAllMocks();
});

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
