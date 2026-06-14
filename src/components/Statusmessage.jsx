export function Statusmessage({message}) {
    return (
        <span id="statusmsg" className="navbar-text m-0 p-0 ms-2 small font-monospace">
            {message}
        </span>       
    );
}