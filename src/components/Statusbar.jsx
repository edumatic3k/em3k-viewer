import { Statusmessage } from "./Statusmessage.jsx";
import { Progressbar } from "./Progressbar.jsx";
import { Onlinestatus } from "./Onlinestatus.jsx";

export function Statusbar() {
    return (
        <footer>
            <nav className="navbar fixed-bottom bg-body-secondary border-top border-1 border-dark m-0 p-0" style="height: 40px;">

                <Statusmessage message={'Downloading lesson files...'} />

                <Progressbar percentage={'64%'} />

                <Onlinestatus/>

            </nav>
        </footer>        
    );
}