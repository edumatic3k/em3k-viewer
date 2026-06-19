import DefaultLayout from "../layouts/DefaultLayout";

export function Settings() {
    return (
        <DefaultLayout title="Settings">

            <h1 class="display-5 mb-5">Em3k Settings</h1>

            <div class="container-fluid fs-4 my-3 ms-5">
                <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" id="switch1" checked />
                    <label class="form-check-label" for="switch1">Option 1</label>
                </div>
            </div>

            <div class="container-fluid fs-4 mb-3 ms-5">
                <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" id="switch2" />
                    <label class="form-check-label" for="switch2">Option 2</label>
                </div>
            </div>

            <div class="container-fluid fs-4 mb-3 ms-5">
                <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" id="switch3" />
                    <label class="form-check-label" for="switch3">Option 3</label>
                </div>
            </div>

            <div class="container-fluid fs-4 mb-3 ms-5">
                <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" id="switch4" checked />
                    <label class="form-check-label" for="switch4">Option 4</label>
                </div>
            </div>

            <div class="container-fluid fs-4 mb-3 ms-5">
                <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" id="switch5" />
                    <label class="form-check-label" for="switch5">Option 5</label>
                </div>
            </div>

            <div class="container-fluid fs-4 mb-3 ms-5">
                <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" id="switch6" />
                    <label class="form-check-label" for="switch6">Option 6</label>
                </div>
            </div>

            <div class="container-fluid fs-4 mb-3 ms-5">
                <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" id="switch7" checked />
                    <label class="form-check-label" for="switch7">Option 7</label>
                </div>
            </div>

            <br/><br/>
        </DefaultLayout>        
    );
}