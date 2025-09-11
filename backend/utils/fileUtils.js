function getFileParts(filename) {
  let fileType = '';

  if (typeof filename !== 'string') {
    return { basename: filename, extension: '' };
  }

  // List of possible media extensions (case-insensitive matching)
  const medialFileExtensions = ['.jpg', '.jpeg', '.png', '.heic', '.gif', '.bmp', '.tiff', '.webm', '.webp', '.mp4', '.mkv', '.mp3', '.aac', '.srt', '.description'];
  
  // Convert filename to lowercase for case-insensitive matching
  const lowerFilename = filename.toLowerCase();
  let matchedExtension = '';
  
  // Find the last matching media extension
  for (const ext of medialFileExtensions) {
    if (lowerFilename.endsWith(ext)) {
      matchedExtension = filename.slice(filename.length - ext.length); // Preserve original case
      break;
    }
  }

  // If no media extension is found, return filename as basename with empty extension
  if (!matchedExtension) {
    return { basename: filename, extension: '' };
  }

  // Extract basename (everything before the matched extension)
  const basename = filename.slice(0, filename.length - matchedExtension.length);

  // Determine what type of file it is
  switch (matchedExtension) {
    case ".webm":
      fileType = "video";
      break;
    case ".mp4":
      fileType = "video";
      break;
    case ".mkv":
      fileType = "video";
      break;
    case ".jpg":
      fileType = "thumbnail";
      break;
    case ".jpeg":
      fileType = "thumbnail";
      break;
    case ".png":
      fileType = "thumbnail";
      break;
    case ".heic":
      fileType = "thumbnail";
      break;
    case ".gif":
      fileType = "thumbnail";
      break;
    case ".bmp":
      fileType = "thumbnail";
      break;
    case ".tiff":
      fileType = "thumbnail";
      break;
    case ".webp":
      fileType = "thumbnail";
      break;
    case ".mp3":
      fileType = "audio";
      break;
    case ".aac":
      fileType = "audio";
      break;
    case ".srt":
      fileType = "subtitle";
      break;
    case ".description":
      fileType = "description";
      break;
  }
  
  return { basename, fileType, fullFileName: basename + matchedExtension, extension: matchedExtension };
}

export default getFileParts;