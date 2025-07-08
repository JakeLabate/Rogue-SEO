const storageRoot = 'https://seo.gorogue.net/iddi/schema/storage';

let path = window.location.pathname.replace(/\/$/, ''); // remove trailing slash
path = `${storageRoot}${path || '/home'}.json`; // construct the full path

fetch(path).then(response => {
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
}).then(schemaJson => {

    // Create script to wrap JSON
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schemaJson);

    // Add to page
    document.head.appendChild(script);
    console.log('Schema Loaded Successfully!');

}).catch(e => {
    console.warn('Error Loading Schema:', e);
});