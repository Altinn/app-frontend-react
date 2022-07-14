/* should do basically the same as getInstanceIdRegExp in shared, but we don't have loader for this in cypress yet*/
const instanceIdRegExp = /(\d+\/[\d,a-f]{8}-[\d,a-f]{4}-[1-5][\d,a-f]{3}-[89ab][\d,a-f]{3}-[\d,a-f]{12})/i;
export function instanceIdExp(arg) {
  const { postfix, prefix } = {
    postfix: '',
    prefix: '',
    ...(arg || {}),
  };
  if (!(prefix || postfix)) {
    return instanceIdRegExp;
  }
  return new RegExp(
    `${prefix}${prefix && '/'}${instanceIdRegExp.source}${postfix && (postfix !== '$' ? '/' + postfix : postfix)}`,
    instanceIdRegExp.flags,
  );
}
