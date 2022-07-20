const instanceIdRegExp =
  /(\d{1,6}\/[\d,a-f]{8}-[\d,a-f]{4}-[1-5][\d,a-f]{3}-[89ab][\d,a-f]{3}-[\d,a-f]{12})/i;

export function getInstanceIdRegExp(arg?: {
  prefix?: string;
  postfix?: string;
  flags?: string;
}) {
  const { postfix, prefix, flags } = {
    postfix: '',
    prefix: '',
    ...(arg || {}),
  };
  if (!(prefix || postfix)) {
    return instanceIdRegExp;
  }
  return new RegExp(
    `${prefix}${prefix && '/'}${instanceIdRegExp.source}${
      postfix && (postfix !== '$' ? `/${postfix}` : postfix)
    }`,
    flags || instanceIdRegExp.flags,
  );
}
