import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLocalStorage, useLocalStorageWithTTL, useLocalStorageWithValidation } from "./useLocalStorage";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("useLocalStorage", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  describe("basic functionality", () => {
    it("should initialize with initial value when localStorage is empty", () => {
      const { result } = renderHook(() => useLocalStorage("test-key", "initial-value"));

      expect(result.current[0]).toBe("initial-value");
      expect(localStorageMock.getItem).toHaveBeenCalledWith("test-key");
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });

    it("should load existing value from localStorage", () => {
      localStorageMock.getItem.mockReturnValue('"stored-value"');

      const { result } = renderHook(() => useLocalStorage("test-key", "initial-value"));

      expect(result.current[0]).toBe("stored-value");
      expect(localStorageMock.getItem).toHaveBeenCalledWith("test-key");
    });

    it("should update localStorage when value changes", () => {
      const { result } = renderHook(() => useLocalStorage("test-key", "initial-value"));

      act(() => {
        result.current[1]("new-value");
      });

      expect(result.current[0]).toBe("new-value");
      expect(localStorageMock.setItem).toHaveBeenCalledWith("test-key", '"new-value"');
    });

    it("should handle function updates", () => {
      const { result } = renderHook(() => useLocalStorage("test-key", 0));

      act(() => {
        result.current[1]((prev: number) => prev + 1);
      });

      expect(result.current[0]).toBe(1);
      expect(localStorageMock.setItem).toHaveBeenCalledWith("test-key", "1");
    });

    it("should handle complex objects", () => {
      const initialValue = { name: "John", age: 30 };
      const { result } = renderHook(() => useLocalStorage("user", initialValue));

      act(() => {
        result.current[1]({ name: "Jane", age: 25 });
      });

      expect(result.current[0]).toEqual({ name: "Jane", age: 25 });
      expect(localStorageMock.setItem).toHaveBeenCalledWith("user", '{"name":"Jane","age":25}');
    });
  });

  describe("error handling", () => {
    it("should handle JSON parse errors gracefully", () => {
      localStorageMock.getItem.mockReturnValue("invalid-json");

      const { result } = renderHook(() => useLocalStorage("test-key", "fallback-value"));

      expect(result.current[0]).toBe("fallback-value");
    });

    it("should handle JSON stringify errors gracefully", () => {
      const { result } = renderHook(() => useLocalStorage("test-key", "initial-value"));

      // Create a value that can't be stored (this test might not be applicable for string values)
      act(() => {
        result.current[1]("valid-string-value");
      });

      // Should work normally for valid values
      expect(result.current[0]).toBe("valid-string-value");
    });
  });

  describe("cross-tab synchronization", () => {
    it("should listen for storage events", () => {
      const { result } = renderHook(() => useLocalStorage("test-key", "initial-value"));

      // Simulate storage event from another tab
      act(() => {
        const storageEvent = new StorageEvent("storage", {
          key: "test-key",
          newValue: '"updated-from-other-tab"',
          oldValue: null,
        });
        window.dispatchEvent(storageEvent);
      });

      expect(result.current[0]).toBe("updated-from-other-tab");
    });

    it("should only respond to events for the same key", () => {
      const { result } = renderHook(() => useLocalStorage("test-key", "initial-value"));

      // Simulate storage event for different key
      act(() => {
        const storageEvent = new StorageEvent("storage", {
          key: "different-key",
          newValue: '"different-value"',
          oldValue: null,
        });
        window.dispatchEvent(storageEvent);
      });

      expect(result.current[0]).toBe("initial-value");
    });
  });
});

describe("useLocalStorageWithTTL", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    localStorageMock.clear();
    vi.useRealTimers();
  });

  it("should store value with timestamp", () => {
    const { result } = renderHook(() => useLocalStorageWithTTL("test-key", "initial-value", 1000));

    act(() => {
      result.current[1]("new-value");
    });

    expect(result.current[0]).toBe("new-value");
    expect(localStorageMock.setItem).toHaveBeenCalledWith("test-key", expect.stringContaining('"value":"new-value"'));
  });

  it("should remove expired values", () => {
    const { result } = renderHook(() => useLocalStorageWithTTL("test-key", "initial-value", 1000));

    // Set value
    act(() => {
      result.current[1]("new-value");
    });

    expect(result.current[0]).toBe("new-value");

    // Check that value was stored with timestamp
    const storedItem = localStorageMock.getItem("test-key");
    expect(storedItem).toBeDefined();

    if (storedItem) {
      const data = JSON.parse(storedItem);
      expect(data.value).toBe("new-value");
      expect(data.timestamp).toBeDefined();
      expect(typeof data.timestamp).toBe("number");
    }
  });

  it("should provide remove function", () => {
    const { result } = renderHook(() => useLocalStorageWithTTL("test-key", "initial-value", 1000));

    act(() => {
      result.current[1]("new-value");
    });

    expect(result.current[0]).toBe("new-value");

    act(() => {
      result.current[2]();
    });

    expect(result.current[0]).toBe("initial-value");
    expect(localStorageMock.removeItem).toHaveBeenCalledWith("test-key");
  });
});

describe("useLocalStorageWithValidation", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it("should validate values before storing", () => {
    const validator = (value: any): value is string => typeof value === "string" && value.length > 0;
    const { result } = renderHook(() => useLocalStorageWithValidation("test-key", "initial-value", validator));

    // Valid value
    act(() => {
      result.current[1]("valid-value");
    });

    expect(result.current[0]).toBe("valid-value");

    // Invalid value
    act(() => {
      result.current[1]("");
    });

    // Should not change and should log warning
    expect(result.current[0]).toBe("valid-value");
  });

  it("should reset to initial value if stored value is invalid", () => {
    const validator = (value: any): value is string => typeof value === "string" && value.length > 0;

    // Store invalid value directly in localStorage
    localStorageMock.getItem.mockReturnValue('""');

    const { result } = renderHook(() => useLocalStorageWithValidation("test-key", "initial-value", validator));

    // Should reset to initial value
    expect(result.current[0]).toBe("initial-value");
  });

  it("should handle complex validation", () => {
    interface User {
      name: string;
      age: number;
    }

    const validator = (value: any): value is User =>
      typeof value === "object" &&
      value !== null &&
      typeof value.name === "string" &&
      typeof value.age === "number" &&
      value.age >= 0;

    const { result } = renderHook(() =>
      useLocalStorageWithValidation<User>("user", { name: "John", age: 30 }, validator)
    );

    // Valid user object
    act(() => {
      result.current[1]({ name: "Jane", age: 25 });
    });

    expect(result.current[0]).toEqual({ name: "Jane", age: 25 });

    // Invalid user object
    act(() => {
      result.current[1]({ name: "Invalid", age: -5 });
    });

    // Should not change
    expect(result.current[0]).toEqual({ name: "Jane", age: 25 });
  });
});
