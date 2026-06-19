import { useLibrary } from '../contexts/LibraryContext.jsx';
import { Link } from '../components/ui/Link.jsx';
import DefaultLayout from '../layouts/DefaultLayout.jsx';

/**
 * @typedef {import('../contexts/LibraryContext.jsx').Course} Course
 */

export const Library = () => {
  const {
    activeCourses,
    installedCourses,
    systemCourses,
    loading,
    error,
  } = useLibrary();

  if (loading) {
    return (
      <DefaultLayout title="Library">
        <div className="p-5 text-center">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-3">Loading your library...</p>
        </div>
      </DefaultLayout>
    );
  }

  if (error) {
    return (
      <DefaultLayout title="Error">
        <div className="alert alert-danger mt-4">
          Error loading library: {error}
        </div>
      </DefaultLayout>
    );
  }

  /** @type {Course[]} */
  const visibleCourses = [...(installedCourses || []), ...(systemCourses || [])];

  return (
    <DefaultLayout title="My Library">
      <div className="container-fluid mt-3">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>My Library</h2>

          <div className="d-flex gap-2">
            <input
              type="text"
              className="form-control"
              placeholder="Search courses..."
              style={{ width: '280px' }}
            />
            <select className="form-select" style={{ width: 'auto' }}>
              <option value="all">All Content</option>
              <option value="active">Active Only</option>
              <option value="installed">Installed Only</option>
            </select>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Course Title</th>
                <th>Teacher</th>
                <th>Status</th>
                <th>Last Viewed</th>
                <th>Progress</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleCourses.map((course) => {
                /** @type {boolean} */
                const isActive = Array.isArray(activeCourses)
                  ? activeCourses.some((c) => c?.slug === course.slug)
                  : false;

                return (
                  <tr key={course.slug}>
                    <td>
                      <strong>{course.name || course.slug}</strong>
                    </td>
                    <td>{course.teacherSlug || 'EM3K System'}</td>
                    <td>
                      <span className={`badge ${isActive ? 'bg-success' : 'bg-secondary'}`}>
                        {isActive ? 'Active' : 'Installed'}
                      </span>
                    </td>
                    <td>—</td>
                    <td>
                      <div className="progress" style={{ width: '140px', height: '8px' }}>
                        <div className="progress-bar bg-primary" style={{ width: '45%' }}></div>
                      </div>
                    </td>
                    <td className="text-end">
                      <Link
                        href={`/course/${course.slug}`}
                        className="btn btn-sm btn-primary me-2"
                      >
                        Details
                      </Link>
                      <button className="btn btn-sm btn-outline-danger">Uninstall</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {visibleCourses.length === 0 && (
          <div className="alert alert-info text-center py-5">
            Your library is empty.<br />
            Visit the Catalog to install your first course.
          </div>
        )}
      </div>
    </DefaultLayout>
  );
};