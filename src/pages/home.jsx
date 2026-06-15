import DefaultLayout from '../layouts/DefaultLayout.jsx';

export function Home() {
	return (
        <DefaultLayout title="">
            <main className="container-fluid">
                <div className="row">
                    <div className="col-12">
                        <h1 className="display-5 mb-4">Home</h1>
                        <p>This would be the main page that users normally see when using the app. The welcome.html page would only appear on the first run to give users an overview and help them get started. But, on subsequent loads, the user would land on this page. We would have links to their installed content, maybe show their history, provide news, or curated content recommendations from the catalog.</p>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-3 mb-2">
                        <div className="card">
                            <div className="card-body">
                                <h5 className="card-title">Item 1</h5>
                                <p className="card-text">Lorem ipsum dolor sit amet.</p>
                                <a href="#" className="btn btn-primary">Button</a>
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-3 mb-2">
                        <div className="card">
                            <div className="card-body">
                                <h5 className="card-title">Item 2</h5>
                                <p className="card-text">Lorem ipsum dolor sit amet.</p>
                                <a href="#" className="btn btn-primary">Button</a>
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-3 mb-2">
                        <div className="card">
                            <div className="card-body">
                                <h5 className="card-title">Item 3</h5>
                                <p className="card-text">Lorem ipsum dolor sit amet.</p>
                                <a href="#" className="btn btn-primary">Button</a>
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-3 mb-2">
                        <div className="card">
                            <div className="card-body">
                                <h5 className="card-title">Item 4</h5>
                                <p className="card-text">Lorem ipsum dolor sit amet.</p>
                                <a href="#" className="btn btn-primary">Button</a>
                            </div>
                        </div>
                    </div>              
                </div>
                <div className="row">
                    <div className="col-12 mt-4 mb-5">
                        <p>Lorem ipsum dolor sit amet, officia excepteur ex fugiat reprehenderit enim labore culpa sint ad nisi Lorem pariatur mollit ex esse exercitation amet. Nisi anim cupidatat excepteur officia. Reprehenderit nostrud nostrud ipsum Lorem est aliquip amet voluptate voluptate dolor minim nulla est proident. Nostrud officia pariatur ut officia. Sit irure elit esse ea nulla sunt ex occaecat reprehenderit commodo officia dolor Lorem duis laboris cupidatat officia voluptate. Culpa proident adipisicing id nulla nisi laboris ex in Lorem sunt duis officia eiusmod. Aliqua reprehenderit commodo ex non excepteur duis sunt velit enim. Voluptate laboris sint cupidatat ullamco ut ea consectetur et est culpa et culpa duis.</p>
                        <p>Lorem ipsum dolor sit amet, officia excepteur ex fugiat reprehenderit enim labore culpa sint ad nisi Lorem pariatur mollit ex esse exercitation amet. Nisi anim cupidatat excepteur officia. Reprehenderit nostrud nostrud ipsum Lorem est aliquip amet voluptate voluptate dolor minim nulla est proident. Nostrud officia pariatur ut officia. Sit irure elit esse ea nulla sunt ex occaecat reprehenderit commodo officia dolor Lorem duis laboris cupidatat officia voluptate. Culpa proident adipisicing id nulla nisi laboris ex in Lorem sunt duis officia eiusmod. Aliqua reprehenderit commodo ex non excepteur duis sunt velit enim. Voluptate laboris sint cupidatat ullamco ut ea consectetur et est culpa et culpa duis.</p>
                    </div>
                </div>
                <br/><br/>
            </main>
        </DefaultLayout>
	);
}
