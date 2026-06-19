/**
 * @param {{
 *   href: string;
 *   children: import('preact').ComponentChildren;
 *   className?: string;
 *   [key: string]: any;
 * }} props
 */
export const Link = ({ href, children, ...props }) => {
  return <a href={href} {...props}>{children}</a>;
};