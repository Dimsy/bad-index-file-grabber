const request = require('request');
const fs = require('fs');
const http = require('http');
Stream = require('stream').Transform;

const URL = 'http://our-url.com/wp-content/uploads/cool/images';
const downloadFolder = 'C:/downloaded';
const fileType = '.jpg';

function allGrab() {
    request(URL, function (err, res, body) {
        if (err) throw err;
        //Get index and parse to array by linebreak separator
        const arr = body.split('\n');

        console.log('All items length:', arr.length);
        lineHandle(arr, 0);
    });
}

lineHandle = (arr, index) => {
    // Interrupt recursion
    if (index > arr.length) return;

    // Fast and dirty grab <a> link substring
    const line = arr[index];
    const start = line.indexOf('<a');
    const end = line.indexOf('</a>');

    if (start !== -1 && end !== -1) {
        const dirtyLink = line.substr(start + 9, end - start)
        const linkEnd = dirtyLink.indexOf('">');

        if (linkEnd !== -1) {
            // Cleaner href link from <a>
            const cleanLink = dirtyLink.substr(0, linkEnd);

            if (cleanLink.indexOf(fileType) !== -1) {
                http.request(URL + cleanLink, function (response) {
                    let data = new Stream();

                    response.on('data', function (chunk) {
                        data.push(chunk);
                    });

                    response.on('end', function () {
                        // Write file as 'folder/link'
                        fs.writeFileSync(downloadFolder + cleanLink, data.read());
                        console.log(downloadFolder + cleanLink + ' is Saved!')
                    });
                }).end(() => {
                    lineHandle(arr, index + 1)
                });
            } else {
                lineHandle(arr, index + 1)
            }
        }
    } else {
        lineHandle(arr, index + 1)
    }
};

allGrab();