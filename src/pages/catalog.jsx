import DefaultLayout from "../layouts/DefaultLayout";
import { Link } from "../components/ui/Link";

export default function courseCatalog() {

    return (
        <DefaultLayout title="Catalog">
            <h1 class="display-5 mb-4">Course Catalog</h1>
            <div class="alert alert-info" style={{ maxWidth: '760px' }}>
                <h2 class="h5">Catalog connection is not available yet</h2>
                <p>Bundled courses are ready in your Library. You can also install a course package from a ZIP file.</p>
                <Link href="/library" className="btn btn-primary">Open Library</Link>
            </div>
        </DefaultLayout>        
    );
}