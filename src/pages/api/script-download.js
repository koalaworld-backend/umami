import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

// Preload the script.js file into memory
const filePath = path.join(process.cwd(), 'public', 'script0.js');
const scriptContent = fs.readFileSync(filePath, 'utf8'); // Read the file content into memory
const contentLength = Buffer.byteLength(scriptContent);
console.log("content length:", contentLength);

// Simulated database for download count (Replace with your actual database logic)
let downloadCount = 0;

export default function handler(req, res) {
    if (req.method === 'GET') {
        // Increment the download count
        downloadCount++;
        console.log(`Total Download count: `, downloadCount); // Replace this with your database logic

        // Serve the preloaded script.js content
        res.writeHead(200, {
            'Content-Type': 'application/javascript',
            'Content-Length': contentLength, // Use the length of the in-memory content
        });
        res.end(scriptContent); // Send the preloaded content directly

    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}