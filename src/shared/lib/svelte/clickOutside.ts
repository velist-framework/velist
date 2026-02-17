import type { Action } from 'svelte/action';

export interface ClickOutsideAttributes {
  'on:click_outside'?: (event: CustomEvent) => void;
}

/**
 * Svelte action to detect clicks outside an element
 * Dispatches 'clickOutside' custom event when clicked outside
 * 
 * Svelte 4 Usage:
 * ```svelte
 * <div use:clickOutside on:click_outside={() => closeModal()}>
 *   Modal content
 * </div>
 * ```
 * 
 * Svelte 5 Usage (runes mode):
 * ```svelte
 * <script>
 *   let open = $state(false);
 * </script>
 * <div use:clickOutside onclick_outside={() => open = false}>
 *   Modal content
 * </div>
 * ```
 */
export const clickOutside: Action<HTMLElement, undefined, ClickOutsideAttributes> = (node) => {
  const handleClick = (event: MouseEvent) => {
    if (node && !node.contains(event.target as Node) && !event.defaultPrevented) {
      node.dispatchEvent(
        new CustomEvent('click_outside', { detail: { target: event.target } })
      );
    }
  };

  document.addEventListener('click', handleClick, true);

  return {
    destroy() {
      document.removeEventListener('click', handleClick, true);
    }
  };
};

/**
 * Alternative: clickOutside with escape key support
 * Dispatches 'clickOutside' on outside click or Escape key
 */
export const clickOutsideWithEscape: Action<HTMLElement, undefined, ClickOutsideAttributes> = (node) => {
  const handleClick = (event: MouseEvent) => {
    if (node && !node.contains(event.target as Node) && !event.defaultPrevented) {
      node.dispatchEvent(new CustomEvent('click_outside'));
    }
  };

  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      node.dispatchEvent(new CustomEvent('click_outside'));
    }
  };

  document.addEventListener('click', handleClick, true);
  document.addEventListener('keydown', handleKeydown);

  return {
    destroy() {
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('keydown', handleKeydown);
    }
  };
};
