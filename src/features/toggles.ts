/**
 * Toggle this on to use the newer form data API. This is a breaking change, and should be toggled on in v4,
 * at which point the old functionality should be removed.
 *
 * This new functionality:
 *  - Stores the form data in a deep object (not dot-separated keys), so it will support and keep empty objects
 *    the server sends us.
 *  - Repeating groups will create a new empty object when you add a new row, instead of creating a fake index
 *    in Redux. This means we also send that empty object to the server, and the server can fill it with data
 *    if it wants to. See #555.
 *  - We debounce, so we don't always send a request to save the form data for every component update. This debouncing
 *    now happens globally, so we don't have to debounce each component separately. It also causes expressions to
 *    run more often, and makes the form feel more responsive to the user. However, it breaks the functionality
 *    where we always send which component triggered the save request, because many components may have changed
 *    since the last save. We will also wait until after the save to trigger validations.
 *  - Supports better tools for handling arrays and objects, because they can be treated as regular javascript arrays
 *    and objects. This makes it a better platform for developing features in the future.
 */
export const UseNewFormDataHook = false;
