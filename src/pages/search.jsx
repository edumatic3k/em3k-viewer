import { useLocation } from 'preact-iso';
import DefaultLayout from '../layouts/DefaultLayout';

export default function Search() {

    const { query } = useLocation();

    return (
        <DefaultLayout title="Search Results">
            <h1 class="display-5 mb-4">Search Results</h1>
            <p>You searched for: <b>"{ query.keyword }"</b></p>
            <p>Found 0 results</p>
            <br/><br/>
        </DefaultLayout>        
    );
}