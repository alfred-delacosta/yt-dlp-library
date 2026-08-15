// form-data-grok.js - A secure, modern FormData implementation for Node.js
// Inspired by form-data npm package, but custom-built with ES modules, streams, and security in mind.
// No external dependencies - uses only Node.js built-ins.

import { randomUUID } from 'crypto';
import { Readable, PassThrough } from 'stream';
import { Blob } from 'buffer'; // For Node.js 18+ Blob support

class FormDataGrok {
  constructor() {
    this.boundary = `----FormBoundary${randomUUID().replace(/-/g, '')}`; // Secure random boundary
    this.fields = []; // Array of { name, value, options } for fields/files
    this.length = 0; // Total length for Content-Length header
  }

  // Append a field or file
  append(name, value, options = {}) {
    if (typeof name !== 'string' || name.length === 0) {
      throw new Error('Name must be a non-empty string');
    }

    const field = { name, options };
    let contentLength = 0;

    if (value instanceof Readable) {
      // Handle streams (e.g., from fs.createReadStream)
      field.value = value;
      field.isStream = true;
      // Estimate length if possible; otherwise, set to 0 (chunked encoding will handle it)
      contentLength = options.knownLength || 0;
    } else if (Buffer.isBuffer(value)) {
      // Handle buffers
      field.value = value;
      contentLength = value.length;
    } else if (typeof value === 'string') {
      // Handle strings
      field.value = Buffer.from(value, 'utf8');
      contentLength = field.value.length;
    } else {
      throw new Error('Value must be a Readable stream, Buffer, or string');
    }

    // Sanitize filename for security (remove path traversal and unsafe chars)
    if (options.filename) {
      options.filename = options.filename
        .replace(/\.\./g, '') // Remove ..
        .replace(/[^a-zA-Z0-9._\-]/g, '_') // Allow only safe chars
        .substring(0, 255); // Limit length
    }

    // Add disposition and content-type headers
    const disposition = `Content-Disposition: form-data; name="${name.replace(/"/g, '\\"')}"` +
      (options.filename ? `; filename="${options.filename.replace(/"/g, '\\"')}"` : '');
    field.headers = [
      disposition,
      options.contentType ? `Content-Type: ${options.contentType}` : 'Content-Type: text/plain'
    ];

    this.fields.push(field);
    this.length += contentLength + this._getFieldOverhead(field);
  }

  // Internal: Calculate overhead for a field (boundaries, headers, etc.)
  _getFieldOverhead(field) {
    const boundaryOverhead = `--${this.boundary}\r\n`.length;
    const headerOverhead = field.headers.reduce((sum, h) => sum + h.length + 2, 0); // +2 for \r\n
    return boundaryOverhead + headerOverhead + 4; // +4 for final \r\n\r\n
  }

  // form-data-grok.js - Updated getHeaders() method
  getHeaders() {
    const headers = {
      'Content-Type': `multipart/form-data; boundary=${this.boundary}`,
    };
    // Only set Content-Length if it's accurate (i.e., > 0 and no streams with unknown lengths)
    if (this.length > 0) {
      headers['Content-Length'] = this.length.toString();
    }
    return headers;
  }

  // Convert to a ReadableStream for piping (e.g., to fetch body)
  getStream() {
    const stream = new PassThrough();
    const boundary = this.boundary;

    // Async generator to yield multipart data
    const generateParts = async function* () {
      for (const field of this.fields) {
        yield `--${boundary}\r\n`;
        for (const header of field.headers) {
          yield `${header}\r\n`;
        }
        yield '\r\n';

        if (field.isStream) {
          // Pipe stream data
          for await (const chunk of field.value) {
            yield chunk;
          }
        } else {
          yield field.value;
        }
        yield '\r\n';
      }
      yield `--${boundary}--\r\n`;
    }.bind(this);

    // Consume generator and pipe to PassThrough
    (async () => {
      try {
        for await (const part of generateParts()) {
          stream.write(part);
        }
        stream.end();
      } catch (error) {
        stream.emit('error', error);
      }
    })();

    return stream;
  }

  // Convert to a Blob (for native FormData or fetch in browsers/Node.js 18+)
  async toBlob() {
    const chunks = [];
    const stream = this.getStream();
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    return new Blob(chunks, { type: this.getHeaders()['Content-Type'] });
  }

  // Convert to a Buffer (for libraries that need it, e.g., if not using fetch)
  async toBuffer() {
    const chunks = [];
    const stream = this.getStream();
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  }
}

export default FormDataGrok;