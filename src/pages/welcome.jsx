import DefaultLayout from "../layouts/DefaultLayout";

export function Welcome() {

    function errMsg() {
        alert('Not implemented yet!');
    }
    
    return (
        <DefaultLayout title="Welcome">
            <h1 class="display-5 mb-4">Welcome to EM3K</h1>
            <img src="/assets/img/teacher.svg" class="float-end mx-3 my-1" alt="Teacher" style="min-width: 150px; max-width: 220px;" />
            <p>Lorem ipsum dolor sit amet, officia excepteur ex fugiat reprehenderit enim labore culpa sint ad nisi Lorem pariatur mollit ex esse exercitation amet. Nisi anim cupidatat excepteur officia. Reprehenderit nostrud nostrud ipsum Lorem est aliquip amet voluptate voluptate dolor minim nulla est proident. Nostrud officia pariatur ut officia. Sit irure elit esse ea nulla sunt ex occaecat reprehenderit commodo officia dolor Lorem duis laboris cupidatat officia voluptate. Culpa proident adipisicing id nulla nisi laboris ex in Lorem sunt duis officia eiusmod. Aliqua reprehenderit commodo ex non excepteur duis sunt velit enim. Voluptate laboris sint cupidatat ullamco ut ea consectetur et est culpa et culpa duis.</p>
            <p>Lorem ipsum dolor sit amet, officia excepteur ex fugiat reprehenderit enim labore culpa sint ad nisi Lorem pariatur mollit ex esse exercitation amet. Nisi anim cupidatat excepteur officia. Reprehenderit nostrud nostrud ipsum Lorem est aliquip amet voluptate voluptate dolor minim nulla est proident. Nostrud officia pariatur ut officia. Sit irure elit esse ea nulla sunt ex occaecat reprehenderit commodo officia dolor Lorem duis laboris cupidatat officia voluptate. Culpa proident adipisicing id nulla nisi laboris ex in Lorem sunt duis officia eiusmod. Aliqua reprehenderit commodo ex non excepteur duis sunt velit enim. Voluptate laboris sint cupidatat ullamco ut ea consectetur et est culpa et culpa duis.</p>
            <p class="text-center my-5">
                <a href="/home" type="button" class="btn btn-outline-success btn-lg me-5 shadow">
                    Go Home
                </a>
                <button type="button" class="btn btn-outline-primary btn-lg shadow" onClick={errMsg}>
                    Take the Tutorial
                </button>
            </p>
            <br/><br/>
        </DefaultLayout>        
    );
}