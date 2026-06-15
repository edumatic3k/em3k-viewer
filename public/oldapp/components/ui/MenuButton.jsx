
export function MenuButton() {
    return (
        <div>
            <div className="d-flex flex-row align-items-center" style={{width: '200px'}}>
                <div>
                    <button id="ocmbtn" className="btn p-0" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasMenu" aria-controls="offcanvasMenu" title="Click Here to Open The Lesson Menu" tabIndex={1}>
                        <i className="bi bi-layout-text-sidebar fs-4"></i> 
                    </button>
                </div>
                <div className="ss-text ms-2">
                    Lesson Menu
                </div>
            </div>
        </div>        
    );
}