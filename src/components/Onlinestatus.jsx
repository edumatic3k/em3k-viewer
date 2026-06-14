export function Onlinestatus() {
    return (
        <div className="ms-auto m-0 p-0 me-1">
            <button id="greenbtn" type="button" className="d-none btn btn-sm" title="Status: Online">🟢</button>
            <button id="redbtn" type="button" className="btn btn-sm" title="Status: Offline">🔴</button>
        </div>        
    );
}