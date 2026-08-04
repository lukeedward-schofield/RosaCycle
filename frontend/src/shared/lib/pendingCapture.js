// Plain in-memory singleton for passing a captured File between screens.
// Not router state: a File riding through navigate(path, { state }) is
// unusual, under-documented browser behavior — this sidesteps it entirely.
// Only one capture flow is ever active at a time, so a module-level
// singleton is enough.
let pendingFile = null;

export function setPendingCapture(file) {
  pendingFile = file;
}

export function getPendingCapture() {
  return pendingFile;
}

export function clearPendingCapture() {
  pendingFile = null;
}
