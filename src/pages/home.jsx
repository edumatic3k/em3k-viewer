import DefaultLayout from '../layouts/DefaultLayout.jsx';
import { Link } from '../components/ui/Link.jsx';
import { useLibrary } from '../contexts/LibraryContext.jsx';

/**
 * @typedef {import('../contexts/LibraryContext.jsx').Course} Course
 */

export function Home() {
  const { activeCourses, loading } = useLibrary();

  /** @type {Course | undefined} */
  const resumeCourse = activeCourses?.[0];

  return (
    <DefaultLayout title="My Dashboard">
      <div className="container-fluid py-3">
        <div className="row mb-4">
          <div className="col-12">
            <div className="p-4 p-md-5 bg-body-tertiary border rounded-3 shadow-sm">
              <div className="row align-items-center">
                <div className="col-lg-8">
                  <h1 className="display-5 fw-semibold mb-3">My Dashboard</h1>
                  <p className="lead mb-4">
                    Return to your current work, open active courses, browse your library,
                    or jump back into the last lesson you were viewing.
                  </p>

                  <div className="d-flex flex-wrap gap-2">
                    <Link
                      href={resumeCourse ? `/course/${resumeCourse.slug}` : '/library'}
                      className="btn btn-primary btn-lg"
                    >
                      {resumeCourse ? 'Resume Last Lesson' : 'Go to Library'}
                    </Link>
                    <Link href="/library" className="btn btn-outline-secondary btn-lg">
                      Open Library
                    </Link>
                    <Link href="/catalog" className="btn btn-outline-secondary btn-lg">
                      Browse Catalog
                    </Link>
                  </div>
                </div>

                <div className="col-lg-4 mt-4 mt-lg-0">
                  <div className="card border-0 bg-dark text-white">
                    <div className="card-body">
                      <h5 className="card-title">Current Status</h5>
                      <ul className="list-unstyled mb-0">
                        <li className="mb-2">Active courses: {activeCourses?.length || 0}</li>
                        <li className="mb-2">Completed lessons: 0</li>
                        <li className="mb-2">Storage used: 4.5 MB</li>
                        <li>Last activity: Today</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-3 mb-4">
          <div className="col-md-6 col-xl-3">
            <div className="card h-100 shadow-sm">
              <div
                style={{
                  height: '140px',
                  overflow: 'hidden',
                  backgroundColor: '#f8f9fa',
                }}
              >
                <img
                  src="/assets/img/placeholder.svg"
                  className="w-100 h-100"
                  style={{ objectFit: 'cover' }}
                  alt={resumeCourse?.name || resumeCourse?.slug || 'Resume course'}
                />
              </div>
              <div className="card-body">
                <div className="text-secondary small mb-1">Resume</div>
                <h5 className="card-title mb-2">
                  {resumeCourse?.name || resumeCourse?.slug || 'No active course yet'}
                </h5>
                <p className="card-text text-secondary">
                  Pick up where you left off.
                </p>
                <Link
                  href={resumeCourse ? `/course/${resumeCourse.slug}` : '/library'}
                  className="btn btn-sm btn-primary"
                >
                  Open
                </Link>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-xl-3">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <div className="text-secondary small mb-1">Library</div>
                <h5 className="card-title mb-2">Installed Content</h5>
                <p className="card-text text-secondary">
                  Manage active and inactive courses.
                </p>
                <Link href="/library" className="btn btn-sm btn-outline-secondary">
                  Open Library
                </Link>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-xl-3">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <div className="text-secondary small mb-1">Catalog</div>
                <h5 className="card-title mb-2">Find New Courses</h5>
                <p className="card-text text-secondary">
                  Browse downloadable content from the catalog.
                </p>
                <Link href="/catalog" className="btn btn-sm btn-outline-secondary">
                  Browse
                </Link>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-xl-3">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <div className="text-secondary small mb-1">Storage</div>
                <h5 className="card-title mb-2">4.5 MB Used</h5>
                <div className="progress mb-3" style={{ height: '8px' }}>
                  <div className="progress-bar" style={{ width: '30%' }}></div>
                </div>
                <p className="card-text text-secondary mb-0">
                  Lesson content stored on your device.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-3">
          <div className="col-12 col-lg-8">
            <div className="card shadow-sm">
              <div className="card-header bg-body-tertiary d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Active Courses</h5>
                <span className="text-secondary small">
                  {activeCourses?.length || 0} items
                </span>
              </div>

              <div className="list-group list-group-flush">
                {loading && (
                  <div className="list-group-item">
                    Loading active courses...
                  </div>
                )}

                {!loading && activeCourses?.length === 0 && (
                  <div className="list-group-item text-secondary">
                    No active courses yet. Activate one in the Library to see it here.
                  </div>
                )}

                {!loading && activeCourses?.map((course) => (
                  <div key={course.slug} className="list-group-item">
                    <div className="d-flex justify-content-between align-items-start gap-3">
                      <div>
                        <div className="fw-semibold">
                          {course.name || course.slug}
                        </div>
                        <div className="text-secondary small">
                          Teacher: {course.teacherSlug || 'EM3K System'}
                        </div>
                        <div className="text-secondary small">
                          Progress: In progress
                        </div>
                      </div>

                      <div className="text-end">
                        <Link
                          href={`/course/${course.slug}`}
                          className="btn btn-sm btn-primary mb-2"
                        >
                          Resume
                        </Link>
                        <div>
                          <Link
                            href="/library"
                            className="btn btn-sm btn-outline-secondary"
                          >
                            Manage
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-4">
            <div className="card shadow-sm">
              <div className="card-header bg-body-tertiary">
                <h5 className="mb-0">Recent Activity</h5>
              </div>
              <div className="card-body">
                <p className="text-secondary mb-0">
                  Recent lesson launches, completed pages, and recommendations could appear here.
                </p>
              </div>
            </div>

            <div className="card shadow-sm mt-3">
              <div className="card-header bg-body-tertiary">
                <h5 className="mb-0">Completed</h5>
              </div>
              <div className="card-body">
                <p className="text-secondary mb-0">
                  Finished lessons and archived courses could live here later.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <br/><br/><br/><br/>
    </DefaultLayout>
  );
}