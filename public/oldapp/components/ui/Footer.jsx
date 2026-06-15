import { h } from 'preact';
import { IpfsBranding } from './IpfsBranding.jsx';
import { PoweredBy } from './PoweredBy.jsx';

export default function Footer() {
	return (
		<footer className="site-footer bg-light border-top py-3">
			<div className="container text-center">

				<PoweredBy />
				<IpfsBranding />

                <div className="mt-5 text-muted" style="font-size: x-small;">Edumatic 3000 (em3k) © {new Date().getFullYear()}</div>
			</div>
		</footer>
	);
}
