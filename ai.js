import { IncomingForm } from 'formidable';
import { DocumentProcessorServiceClient } from '@google-cloud/documentai';
import fs from 'fs';
import path from 'path';

export const config = {
    api: {
        bodyParser: false,
    },
};

const client = new DocumentProcessorServiceClient();

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const form = new IncomingForm();
        form.uploadDir = './uploads';
        form.keepExtensions = true;

        form.parse(req, async (err, fields, files) => {
            if (err) {
                return res.status(500).json({ error: 'Error parsing the files' });
            }

            const file = files.file[0];
            const filePath = file.filepath;
            const mimeType = file.mimetype;

            // Replace these with your actual project details
            const PROJECT_ID = 'your-project-id';
            const LOCATION = 'us'; // or 'eu'
            const PROCESSOR_ID = 'your-processor-id';
            const resourceName = client.processorPath(PROJECT_ID, LOCATION, PROCESSOR_ID);

            const fileContent = fs.readFileSync(filePath);

            const rawDocument = {
                content: fileContent,
                mimeType: mimeType,
            };

            const request = {
                name: resourceName,
                rawDocument: rawDocument,
            };

            try {
                const [result] = await client.processDocument(request);
                // Process the result as needed

                res.status(200).json(result.document);
            } catch (error) {
                res.status(500).json({ error: 'Error processing document' });
            }
        });
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
