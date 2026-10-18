import DefaultLayout from "../layouts/DefaultLayout";
import { useLibrary } from "../contexts/LibraryContext";
import { Link } from "../components/ui/Link";

export default function Help() {
    const { helpCourses, loading } = useLibrary();

    return (
        <DefaultLayout title="Help">
            <h1 class="display-5 mb-4">EM3K Help</h1>
            {loading ? (
                <p>Loading help courses...</p>
            ) : (
                <div class="list-group" style={{ maxWidth: '760px' }}>
                    {helpCourses.map((course) => (
                        <Link key={course.id} href={`/course/${encodeURIComponent(course.id)}`} className="list-group-item list-group-item-action">
                            <span class="fw-semibold">{course.title}</span>
                            {course.description && <span class="d-block small text-secondary mt-1">{course.description}</span>}
                        </Link>
                    ))}
                    {!helpCourses.length && <p class="text-secondary">No bundled help courses are available.</p>}
                </div>
            )}
        </DefaultLayout>        
    );
}