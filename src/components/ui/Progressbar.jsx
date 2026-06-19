// src/components/ui/Progressbar.jsx

export function Progressbar({percentage}) {
    return (
        <div id="progressbar" className="progress progbar ms-2 border border-1 border-dark">
            <div className="progress-bar progress-bar-striped bg-primary" role="progressbar" style="width:64%">{percentage}</div>
        </div>    
    );
}