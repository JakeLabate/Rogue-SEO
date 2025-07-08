import fs from 'fs/promises';
async function loadSchema() {

    // get current page
    let path = window.location.pathname.replace(/\/$/, ''); // remove trailing slash
    path = `https://seo.gorogue.net/iddi/schema${path || '/home'}.json`;

    try {

        // load corresponding json file
        await fs.readFile(path, 'utf-8').then(schemaJson => {

            // create script tag to wrap json
            const script = document.createElement('script');
            script.type = 'application/ld+json';
            script.textContent = JSON.stringify(schemaJson);

            // add to page
            document.appendChild(script);
            console.log('Schema Loaded Successfully!');

        });

    } catch (e) {
        console.warn('Error Loading Schema:', e);
    }

}

loadSchema();