export const safeLocalStorage = {
  get: (key) => {
    try {
      return window?.localStorage?.getItem?.(key);
    } catch (e) {
      return null;
    }
  },
  set: (key, value) => {
    try {
      window?.localStorage?.setItem?.(key, String(value));
      return true;
    } catch (e) {
      return false;
    }
  },
  remove: (key) => {
    try {
      window?.localStorage?.removeItem?.(key);
      return true;
    } catch (e) {
      return false;
    }
  },
};
