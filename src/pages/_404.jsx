import Lost from '/assets/img/lost.svg';

export function NotFound() {
	return (
		<main className="container-fluid text-center">
			<h1>Page Not Found</h1>
			<p>The page you are looking for couldn't be found. Please try again.</p>
			<p className="my-4"><a href="/" className="btn btn-primary btn-lg">Go Home</a></p>
			<p><img src={Lost} width="250" alt="Confused" title="Confused" /></p>
		</main>
	);
}
