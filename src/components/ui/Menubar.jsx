// src/components/ui/Menubar.jsx
import { useState, useEffect } from "preact/hooks";
import mainLogo from '/assets/img/em3k.svg';

export function Menubar() {
    
    // remember state of fullscreen and show correct icon
    const [isFullScreen, setIsFullScreen] = useState(false);

    const syncFullScreenState = () => {
        const apiFullScreen = !!document.fullscreenElement;
        const browserFullScreen =
        window.outerWidth === screen.width && window.outerHeight === screen.height;
        setIsFullScreen(apiFullScreen || browserFullScreen);
    };

    const handleFullScreen = async () => {
        try {
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen();
            } else {
                await document.exitFullscreen();
            }
        } catch (err) {
            console.error("Failed to toggle fullscreen:", err);
        }
    };

    const fullScreenLabel = isFullScreen ? "Exit Fullscreen" : "Full Screen";

    useEffect(() => {
        syncFullScreenState();
        document.addEventListener("fullscreenchange", syncFullScreenState);
        window.addEventListener("resize", syncFullScreenState);
        return () => {
            document.removeEventListener("fullscreenchange", syncFullScreenState);
            window.removeEventListener("resize", syncFullScreenState);
        };
    }, []);

	function closeApp() {
		if (confirm("Are you sure you want to quit em3k?") == true) {
			alert('You clicked OK!\n\nThis feature is not implemented yet.');
		} else {
			return false;
		}
	}

	return (
        <header>
            <nav className="navbar fixed-top navbar-expand bg-body-secondary border-bottom border-1 border-dark py-0" style="height: 50px;">
                <div className="container-fluid px-2">

                    <a className="navbar-brand m-0 p-0 me-3 d-flex align-items-center" href="/home" title="Em3k Home">
                        <img src={mainLogo} height="38" alt="logo" /> 
                    </a>

                    <ul className="navbar-nav flex-row align-items-center me-auto">
                        <li className="nav-item dropdown">
                            <a className="nav-link px-2 py-1 text-decoration-none" 
                            href="#" 
                            role="button" 
                            data-bs-toggle="dropdown" 
                            aria-expanded="false">
                                File
                            </a>
                            <ul className="dropdown-menu">
                                <li><a className="dropdown-item" href="#">Import Lesson...</a></li>
                                <li><a className="dropdown-item" href="#">Share Lesson</a></li>
                                <li><a className="dropdown-item" href="#">Backup Library</a></li>
                                <hr/>
                                <li><a className="dropdown-item" href="#">🔴 Go Online</a></li>
                                <li><a className="dropdown-item" href="#">🟢 Work Offline</a></li>
                                <hr/>
                                <li><a className="dropdown-item" href="#">Exit</a></li>
                            </ul>
                        </li>
                        <li className="nav-item dropdown">
                            <a className="nav-link px-2 py-1 text-decoration-none" 
                            href="#" 
                            role="button" 
                            data-bs-toggle="dropdown" 
                            aria-expanded="false">
                                Edit
                            </a>
                            <ul className="dropdown-menu">
                                <li><a className="dropdown-item" href="/settings">Settings</a></li>
                            </ul>
                        </li>
                        <li className="nav-item dropdown">
                            <a className="nav-link px-2 py-1 text-decoration-none" 
                            href="#" 
                            role="button" 
                            data-bs-toggle="dropdown" 
                            aria-expanded="false">
                                Go
                            </a>
                            <ul className="dropdown-menu">
                                <li><a className="dropdown-item" href="/">Root</a></li>
                                <li><a className="dropdown-item" href="/home">Home</a></li>
                                <li><a className="dropdown-item" href="/welcome">Welcome</a></li>
                                <li><a className="dropdown-item" href="/search">Search</a></li>
                                <li><a className="dropdown-item" href="/library">Library</a></li>
                                <li><a className="dropdown-item" href="https://catalog.em3k.org" target="_blank">Course Catalog<i class="bi bi-box-arrow-up-right ms-2"></i></a></li>
                                <li><a className="dropdown-item" href="/lessons">Lesson Index</a></li>
                            </ul>
                        </li>
                        <li className="nav-item dropdown">
                            <a className="nav-link px-2 py-1 text-decoration-none" 
                            href="#" 
                            role="button" 
                            data-bs-toggle="dropdown" 
                            aria-expanded="false">
                                Help
                            </a>
                            <ul className="dropdown-menu">
                                <li><a className="dropdown-item" href="#">Em3k Tutorial</a></li>
                                <li><a className="dropdown-item" href="/help">Em3k Help</a></li>
                                <hr/>
                                <li><a className="dropdown-item" href="/report">Report A Problem</a></li>
                                <li><a className="dropdown-item" href="/share">Share</a></li>
                                <li><a className="dropdown-item" href="/donate">Donate</a></li>
                                <hr/>
                                <li><a className="dropdown-item" href="/about">About Em3k</a></li>
                            </ul>
                        </li>
                    </ul>

                    <form method="GET" action="/search" className="d-flex ms-auto me-3 me-md-4" role="search">
                        <div className="input-group text-nowrap">
                            <input name="keyword" className="form-control form-control-sm searchquery" type="search" placeholder="Search all..." aria-label="Search" required/>
                            <button className="btn btn-outline-secondary btn-sm" type="submit" title="Search"><i class="bi bi-search"></i></button>
                        </div>
                    </form>

                    <button 
                    className="btn me-2" 
                    aria-label={fullScreenLabel} 
                    title={fullScreenLabel} 
                    onClick={handleFullScreen}
                    >
                        <i className={isFullScreen ? "bi bi-fullscreen-exit" : "bi bi-fullscreen"}></i>
                    </button>
                    <button type="button" className="btn-close me-1" title="Close" aria-label="Close" onClick={closeApp}></button>
                    
                </div>
            </nav>
        </header>		
	);
}
