import DefaultLayout from "../layouts/DefaultLayout";

export function Library() {
    
    return (
        <DefaultLayout title="Library">
            <div className="row w-100">
                <div className="col-3">

                    {/* <!-- Sidebar --> */}
                    <div className="d-flex flex-column flex-shrink-0 p-3 bg-body-tertiary" style="width: 220px">
                        <a href="/" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto link-body-emphasis text-decoration-none">
                        <span className="fs-4">Sidebar</span>
                        </a>
                        <hr />
                        <ul className="nav nav-pills flex-column mb-auto">
                        <li className="nav-item">
                            <a href="#" className="nav-link active" aria-current="page">
                            Home
                            </a>
                        </li>
                        <li>
                            <a href="#" className="nav-link link-body-emphasis">
                            Dashboard
                            </a>
                        </li>
                        <li>
                            <a href="#" className="nav-link link-body-emphasis">
                            Orders
                            </a>
                        </li>
                        <li>
                            <a href="#" className="nav-link link-body-emphasis">
                            Products
                            </a>
                        </li>
                        <li>
                            <a href="#" className="nav-link link-body-emphasis">
                            Customers
                            </a>
                        </li>
                        </ul>
                        <hr />
                        <div>
                            <a href="#" className="d-flex align-items-center link-body-emphasis text-decoration-none">
                                <img
                                src="https://github.com/mdo.png"
                                alt=""
                                width="32"
                                height="32"
                                className="rounded-circle me-2"
                                />
                                <strong>mdo</strong>
                            </a>
                        </div>
                    </div>

                </div>
                <div className="col-9 pb-5">

                    <h1 className="display-5 mb-4">Library</h1>

                    <p>This page would allow the user to manage their library of courses/lessons. There are two distinct states: downloaded and installed. The only courses/lessons which appear on the lesson index page are those that have been installed. But, the user might have many more courses/lessons that are downloaded but, not yet installed. This is the part of the app where they would manage all their content (Add, Remove, Update, Share, etc.).</p>

                    <div className="container mb-2 bg-body-tertiary">&nbsp;<button className="float-end btn btn-secondary btn-sm">Button</button></div>
                    <div className="container mb-2 bg-body-tertiary">&nbsp;<button className="float-end btn btn-secondary btn-sm">Button</button></div>
                    <div className="container mb-2 bg-body-tertiary">&nbsp;<button className="float-end btn btn-secondary btn-sm">Button</button></div>
                    <div className="container mb-2 bg-body-tertiary">&nbsp;<button className="float-end btn btn-secondary btn-sm">Button</button></div>
                    <div className="container mb-2 bg-body-tertiary">&nbsp;<button className="float-end btn btn-secondary btn-sm">Button</button></div>
                    <div className="container mb-2 bg-body-tertiary">&nbsp;<button className="float-end btn btn-secondary btn-sm">Button</button></div>
                    <div className="container mb-2 bg-body-tertiary">&nbsp;<button className="float-end btn btn-secondary btn-sm">Button</button></div>
                    <div className="container mb-2 bg-body-tertiary">&nbsp;<button className="float-end btn btn-secondary btn-sm">Button</button></div>
                    <div className="container mb-2 bg-body-tertiary">&nbsp;<button className="float-end btn btn-secondary btn-sm">Button</button></div>
                    <div className="container mb-2 bg-body-tertiary">&nbsp;<button className="float-end btn btn-secondary btn-sm">Button</button></div>
                    <div className="container mb-2 bg-body-tertiary">&nbsp;<button className="float-end btn btn-secondary btn-sm">Button</button></div>
                    <div className="container mb-2 bg-body-tertiary">&nbsp;<button className="float-end btn btn-secondary btn-sm">Button</button></div>
                    <div className="container mb-2 bg-body-tertiary">&nbsp;<button className="float-end btn btn-secondary btn-sm">Button</button></div>
                    <div className="container mb-2 bg-body-tertiary">&nbsp;<button className="float-end btn btn-secondary btn-sm">Button</button></div>
                    <div className="container mb-2 bg-body-tertiary">&nbsp;<button className="float-end btn btn-secondary btn-sm">Button</button></div>
                    <div className="container mb-2 bg-body-tertiary">&nbsp;<button className="float-end btn btn-secondary btn-sm">Button</button></div>
                    <div className="container mb-2 bg-body-tertiary">&nbsp;<button className="float-end btn btn-secondary btn-sm">Button</button></div>
                    <div className="container mb-2 bg-body-tertiary">&nbsp;<button className="float-end btn btn-secondary btn-sm">Button</button></div>
                    <div className="container mb-2 bg-body-tertiary">&nbsp;<button className="float-end btn btn-secondary btn-sm">Button</button></div>
                    <div className="container mb-2 bg-body-tertiary">&nbsp;<button className="float-end btn btn-secondary btn-sm">Button</button></div>
                    <div className="container mb-2 bg-body-tertiary">&nbsp;<button className="float-end btn btn-secondary btn-sm">Button</button></div>
                    <div className="container mb-2 bg-body-tertiary">&nbsp;<button className="float-end btn btn-secondary btn-sm">Button</button></div>

                </div>
            </div>
            <br/><br/>            
        </DefaultLayout>      
    );
}