// src/components/Statusbar.jsx
import { Statusmessage } from "./Statusmessage.jsx";
import { Progressbar } from "./Progressbar.jsx";
import { Onlinestatus } from "./Onlinestatus.jsx";
import { statusMessage, progressPercent } from "../../stores/status.js";

export function Statusbar() {

    const message = statusMessage.value;
    const percent = progressPercent.value;

    return (
        <footer>
            <nav className="navbar fixed-bottom bg-body-secondary border-top border-1 border-dark m-0 p-0" style="height: 40px;">
                <Statusmessage>
                    {message}
                </Statusmessage>
                {percent > 0 && <Progressbar percentage={`${percent}%`} />}
                <Onlinestatus/>
            </nav>
        </footer>        
    );
}