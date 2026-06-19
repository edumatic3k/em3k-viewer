// src/components/ui/Statusmessage.jsx

/**
 * @param {object} props
 * @param {import('preact').ComponentChildren} props.children
 * @param {string} [props.title]
 */
export function Statusmessage({ children }) {
    if (!children) return null;

    return (
        <span 
            id="statusmsg" 
            className="navbar-text m-0 p-0 ms-2 small font-monospace"
        >
            {children}
        </span>
    );
}