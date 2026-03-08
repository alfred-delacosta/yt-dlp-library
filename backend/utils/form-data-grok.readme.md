# form-data-grok

A secure, modern, and lightweight implementation of a FormData utility for Node.js, built from scratch using ES modules and native Node.js features. This is inspired by the popular `form-data` npm package but designed with enhanced security, stream efficiency, and modern JavaScript practices in mind. It avoids common vulnerabilities like path traversal and ensures compatibility with Node.js 18+ for seamless file uploads via `fetch`.

## Features

- **Secure by Design**:
  - Sanitizes filenames to prevent directory traversal attacks (e.g., removes `../` and unsafe characters).
  - Uses cryptographically secure random boundaries to avoid collisions or prediction.
  - Validates inputs to prevent misuse (e.g., ensures names are strings and values are valid types).
  - No external dependencies—relies solely on Node.js built-ins for reduced attack surface.

- **Modern and Efficient**:
  - Uses ES modules (`import/export`) for better tree-shaking and compatibility.
  - Leverages streams (`Readable`, `PassThrough`) for memory-efficient handling of large files (no loading entire files into memory).
  - Supports async/await and promises throughout.
  - Compatible with `fetch` for HTTP requests, including direct stream piping.

- **API Compatibility**:
  - Mimics the `form-data` package's core API for easy migration.
  - Handles files as streams, buffers, or strings.
  - Generates proper `multipart/form-data` encoding.

- **Lightweight**: No bloated dependencies—just pure Node.js code.

## Requirements

- **Node.js**: Version 18+ (for native `Blob`, `fetch`, and ES module support).
- **No External Packages**: This is a standalone file—drop it into your project.

## Installation

1. Save the provided `form-data-grok.js` file to your project's root or a suitable directory (e.g., `./lib/`).
2. Import it in your code using ES module syntax.

No `npm install` required!

## Usage

Import the class and use it like the standard `form-data` package. Here's a basic example for uploading a file:

```javascript
import FormData from './form-data-grok.js'; // Adjust path if needed
import { createReadStream } from 'fs';
import path from 'path';

const form = new FormData();

// Append a file from disk (using a stream for efficiency)
const filePath = './example.txt';
const fileStream = createReadStream(filePath);
form.append('file', fileStream, {
  filename: path.basename(filePath),
  contentType: 'text/plain'
});

// Append a text field
form.append('description', 'This is a sample file upload');

// Use with fetch for an HTTP POST
const response = await fetch('https://api.example.com/upload', {
  method: 'POST',
  body: form.getStream(), // Pipe the multipart stream directly
  headers: form.getHeaders() // Sets Content-Type and Content-Length
});

if (response.ok) {
  console.log('Upload successful!');
} else {
  console.error('Upload failed:', response.statusText);
}
```

### Handling Different Data Types

- **Streams** (recommended for large files): `form.append('file', stream, { filename: 'file.txt' })`
- **Buffers**: `form.append('data', Buffer.from('content'))`
- **Strings**: `form.append('text', 'Hello World')`

### Downloading and Using the Stream

If you need to convert to a `Blob` (for browser-like environments) or `Buffer` (for other libraries):

```javascript
// Convert to Blob (for fetch or native FormData in Node.js 18+)
const blob = await form.toBlob();

// Convert to Buffer (e.g., for axios or other HTTP clients)
const buffer = await form.toBuffer();
```

## API Reference

### Class: `FormDataGrok`

#### Constructor
- `new FormDataGrok()`: Creates a new FormData instance with a secure random boundary.

#### Methods

- **`append(name, value, options?)`**:
  - Adds a field or file to the form.
  - `name` (string): The field name (required, non-empty).
  - `value` (Readable stream, Buffer, or string): The data to append.
  - `options` (object, optional):
    - `filename` (string): Filename for file fields (sanitized automatically).
    - `contentType` (string): MIME type (defaults to 'text/plain').
    - `knownLength` (number): Known byte length for streams (for accurate Content-Length).
  - Throws errors for invalid inputs.

- **`getHeaders()`**:
  - Returns an object with HTTP headers (e.g., `Content-Type` and `Content-Length`).
  - Use this for your request headers.

- **`getStream()`**:
  - Returns a `ReadableStream` for the multipart data.
  - Ideal for piping directly to `fetch` or other stream-based APIs.

- **`toBlob()`**:
  - Asynchronously converts the form to a `Blob`.
  - Returns a Promise resolving to a `Blob` (for compatibility with web APIs).

- **`toBuffer()`**:
  - Asynchronously converts the form to a `Buffer`.
  - Returns a Promise resolving to a `Buffer` (useful for non-stream libraries).

## Security Notes

- **Filename Sanitization**: Automatically removes path traversal sequences (`../`) and non-alphanumeric characters (except `._-`), limiting length to 255 characters.
- **Input Validation**: Ensures names are safe strings and values are streams, buffers, or strings to prevent injection or type errors.
- **Random Boundaries**: Uses `crypto.randomUUID()` for unpredictable multipart boundaries, reducing collision risks.
- **No Code Execution**: Pure Node.js code with no `eval`, dynamic requires, or unsafe parsing.
- **Memory Safety**: Streams prevent large files from overwhelming RAM.

Always validate file types, sizes, and sources externally (e.g., via middleware like `multer`). This library provides foundational security but isn't a complete upload solution.

## Limitations and Caveats

- **Not a Drop-in Replacement**: While API-similar, it may not support all advanced `form-data` features (e.g., custom per-field headers or complex options).
- **Content-Length Accuracy**: For streams without known lengths, `Content-Length` is estimated—some servers may require chunked encoding.
- **Node.js Only**: Designed for server-side Node.js; not intended for browsers (use native `FormData` there).
- **Testing Required**: Multipart encoding can vary by server—test with your API. For production, consider the official `form-data` package if you need full compatibility.
- **Performance**: Optimized for streams, but very large concurrent uploads may need monitoring.

## Examples

### Uploading Multiple Files
```javascript
const form = new FormData();
form.append('file1', createReadStream('./file1.txt'), { filename: 'file1.txt' });
form.append('file2', createReadStream('./file2.jpg'), { filename: 'file2.jpg', contentType: 'image/jpeg' });

await fetch('/upload', { method: 'POST', body: form.getStream(), headers: form.getHeaders() });
```

### Error Handling
```javascript
try {
  form.append('file', createReadStream('./nonexistent.txt'));
  // ... proceed
} catch (error) {
  console.error('Append failed:', error.message);
}
```

## Contributing

This is a custom, self-contained file. Feel free to modify it for your needs, but report issues or suggestions for improvements.

## License

This implementation is provided as-is for educational and practical use. It's not affiliated with the `form-data` npm package. Use at your own risk—consider the official package for production-critical applications.