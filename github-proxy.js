const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    const { GITHUB_API_TOKEN, GITHUB_OWNER, GITHUB_REPO } = process.env;
    const GITHUB_PATH = 'data.json';

    if (!GITHUB_API_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
        return { statusCode: 500, body: 'Environment variables not set correctly.' };
    }

    const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_PATH}`;
    const headers = {
        'Authorization': `token ${GITHUB_API_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
    };

    try {
        if (event.httpMethod === 'GET') {
            const response = await fetch(url, { headers });
            if (!response.ok) { return { statusCode: response.status, body: await response.text() }; }
            const data = await response.json();
            return { statusCode: 200, body: JSON.stringify(data) };
        }

        if (event.httpMethod === 'POST') {
            const getResponse = await fetch(url, { headers });
            if (!getResponse.ok && getResponse.status !== 404) {
                 return { statusCode: getResponse.status, body: 'Could not get current file SHA from GitHub.' };
            }
            const fileData = await getResponse.json().catch(() => ({}));
            const sha = fileData.sha;

            const requestBody = {
                message: `Cloud Update from NasabPro: ${new Date().toISOString()}`,
                content: Buffer.from(event.body).toString('base64'),
                sha: sha
            };
            
            const putResponse = await fetch(url, {
                method: 'PUT',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            if (!putResponse.ok) { return { statusCode: putResponse.status, body: await putResponse.text() }; }
            const result = await putResponse.json();
            return { statusCode: 200, body: JSON.stringify(result) };
        }

        return { statusCode: 405, body: 'Method Not Allowed' };

    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};
