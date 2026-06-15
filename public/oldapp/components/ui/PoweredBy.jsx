import { useConfig } from '@contexts/ConfigContext.jsx';

export function PoweredBy() {

    const { app } = useConfig();
    
    return(
        <>
            <div id="poweredby" title="Powered by em3k">
                Powered by: <a href={app?.engineUrl || '#'} target="_blank" rel="noopener noreferrer" className="link-dark text-decoration-none fw-bold ms-1" title="Open the em3k site in a new tab or window">em3k</a>
            </div>   
            <br/>
        </>     
    );
}