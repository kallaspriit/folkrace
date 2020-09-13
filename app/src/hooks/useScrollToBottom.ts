export function useScrollToBottom(ref: React.RefObject<HTMLElement>, isEnabled = true) {
  if (!isEnabled) {
    return;
  }

  // get the dom node from the reference
  const el = ref.current;

  // return if element could not be found
  if (!el) {
    return;
  }

  // check whether we're aready near the bottom
  const isNearBottom = el.scrollHeight - el.clientHeight <= el.scrollTop + 50;

  // only force the scroll if near bottom
  if (!isNearBottom) {
    return;
  }

  // execute next frame in case height changes
  setImmediate(() => {
    const el = ref.current;

    // element might have gone away
    if (!el) {
      return;
    }

    // scroll to bottom
    el.scrollTo({
      top: el.scrollHeight,
    });
  });
}
