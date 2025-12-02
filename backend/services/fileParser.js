const EPUBParser = require('./epubParser');
const PDFParser = require('./pdfParser');
const path = require('path');

class FileParser {
  /**
   * Parse file berdasarkan type (EPUB atau PDF)
   */
  static async parseFile(filePath, fileType) {
    const ext = fileType || path.extname(filePath).toLowerCase();
    
    switch (ext) {
      case '.epub':
      case 'epub':
        return await EPUBParser.parse(filePath);
        
      case '.pdf':
      case 'pdf':
        return await PDFParser.parse(filePath);
        
      default:
        throw new Error(`Unsupported file type: ${ext}`);
    }
  }

  /**
   * Get page count dari file
   */
  static async getPageCount(filePath, fileType) {
    const ext = fileType || path.extname(filePath).toLowerCase();
    
    try {
      if (ext === '.pdf' || ext === 'pdf') {
        return await PDFParser.getPageCount(filePath);
      } else if (ext === '.epub' || ext === 'epub') {
        const result = await EPUBParser.parse(filePath);
        return result.totalPages;
      }
      return 0;
    } catch (error) {
      console.error('Error getting page count:', error);
      return 0;
    }
  }

  /**
   * Extract metadata only (tanpa parse full content)
   */
  static async extractMetadata(filePath, fileType) {
    const ext = fileType || path.extname(filePath).toLowerCase();
    
    try {
      const result = await this.parseFile(filePath, ext);
      return result.metadata;
    } catch (error) {
      console.error('Error extracting metadata:', error);
      return null;
    }
  }

  /**
   * Validate file type
   */
  static isValidFileType(filename) {
    const ext = path.extname(filename).toLowerCase();
    return ['.epub', '.pdf'].includes(ext);
  }

  /**
   * Get file type dari filename
   */
  static getFileType(filename) {
    const ext = path.extname(filename).toLowerCase();
    if (ext === '.epub') return 'epub';
    if (ext === '.pdf') return 'pdf';
    return null;
  }
}

module.exports = FileParser;

