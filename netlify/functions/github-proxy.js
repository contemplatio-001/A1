const axios = require('axios');

exports.handler = async (event) => {
    const GITHUB_TOKEN = process.env.GH_TOKEN;
    const REPO_OWNER = process.env.GH_OWNER;
    const REPO_NAME = process.env.GH_REPO;
    const FILE_PATH = 'data.json';
    const URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;

    const headers = {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json'
    };

    try {
        if (event.httpMethod === 'GET') {
            const res = await axios.get(URL, { headers });
            return { 
                statusCode: 200, 
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(res.data) 
            };
        }

        if (event.httpMethod === 'POST') {
            const currentFile = await axios.get(URL, { headers });
            const sha = currentFile.data.sha;
            const newContent = Buffer.from(event.body).toString('base64');

            await axios.put(URL, {
                message: 'Update family data via Nasab Pro',
                content: newContent,
                sha: sha
            }, { headers });

            return { statusCode: 200, body: JSON.stringify({ message: "Success" }) };
        }
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};