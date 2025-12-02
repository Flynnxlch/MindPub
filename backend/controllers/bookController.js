const Book = require('../models/Book');
const BookPage = require('../models/BookPage');
const FileParser = require('../services/fileParser');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');

class BookController {
  // Get all books dengan filter
  static async getAllBooks(req, res) {
    try {
      const { page, limit, category, sort, search } = req.query;
      
      const result = await Book.findAll({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        category,
        sort,
        search
      });
      
      res.json({
        success: true,
        ...result
      });
      
    } catch (error) {
      console.error('Get books error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching books',
        error: error.message
      });
    }
  }

  // Get popular books
  static async getPopularBooks(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 6;
      const books = await Book.getPopular(limit);
      
      res.json({
        success: true,
        books
      });
      
    } catch (error) {
      console.error('Get popular books error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching popular books',
        error: error.message
      });
    }
  }

  // Get recommended books
  static async getRecommendedBooks(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 4;
      const books = await Book.getRecommended(limit);
      
      res.json({
        success: true,
        books
      });
      
    } catch (error) {
      console.error('Get recommended books error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching recommended books',
        error: error.message
      });
    }
  }

  // Get book by ID
  static async getBookById(req, res) {
    try {
      const { id } = req.params;
      const book = await Book.findById(id);
      
      if (!book) {
        return res.status(404).json({
          success: false,
          message: 'Book not found'
        });
      }
      
      res.json({
        success: true,
        book
      });
      
    } catch (error) {
      console.error('Get book error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching book',
        error: error.message
      });
    }
  }

  // Create book with file upload
  static async createBook(req, res) {
    try {
      const { title, author, description, category, release_date, cover_color, user_id } = req.body;
      
      if (!req.files || !req.files.book) {
        return res.status(400).json({
          success: false,
          message: 'Book file is required'
        });
      }
      
      const bookFile = req.files.book[0];
      const coverFile = req.files.cover ? req.files.cover[0] : null;
      
      // Parse book file with retry logic
      console.log('Parsing book file...', bookFile.filename);
      const fileType = FileParser.getFileType(bookFile.filename);
      console.log('File type detected:', fileType);
      console.log('File path:', bookFile.path);
      
      // Add delay to ensure file is fully written
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Retry parsing up to 3 times
      let parsedData = null;
      let retries = 3;
      let lastError = null;
      
      while (retries > 0 && !parsedData) {
        try {
          console.log(`Parsing attempt ${4 - retries}...`);
          parsedData = await FileParser.parseFile(bookFile.path, fileType);
          
          // Verify parsing result
          if (parsedData && (parsedData.totalPages > 0 || (parsedData.pages && parsedData.pages.length > 0))) {
            console.log('Parsing successful:', {
              totalPages: parsedData.totalPages,
              pagesLength: parsedData.pages?.length,
              metadata: {
                title: parsedData.metadata?.title,
                author: parsedData.metadata?.author,
                publisher: parsedData.metadata?.publisher,
                published: parsedData.metadata?.published,
                subject: parsedData.metadata?.subject,
                rights: parsedData.metadata?.rights,
                description: parsedData.metadata?.description ? parsedData.metadata.description.substring(0, 100) + '...' : '',
                tags: parsedData.metadata?.tags
              }
            });
            break;
          } else {
            console.warn('Parsing returned empty result, retrying...');
            parsedData = null;
            retries--;
            if (retries > 0) {
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
        } catch (error) {
          console.error(`Parsing attempt failed:`, error.message);
          lastError = error;
          retries--;
          if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }
      
      if (!parsedData) {
        throw new Error(`Failed to parse file after 3 attempts: ${lastError?.message || 'Unknown error'}`);
      }
      
      // Fallback: jika totalPages 0 atau undefined, gunakan pages.length
      const finalTotalPages = parsedData.totalPages || parsedData.pages?.length || 0;
      console.log('Final total pages:', finalTotalPages);
      
      if (finalTotalPages === 0) {
        console.warn('WARNING: Total pages is 0! This might indicate a parsing error.');
        throw new Error('Failed to extract pages from file. Please ensure the file is a valid EPUB or PDF.');
      }
      
      // Extract cover image from file if available and no cover file uploaded
      let finalCoverUrl = null;
      if (coverFile) {
        // Use uploaded cover file (highest priority)
        finalCoverUrl = `/uploads/covers/${coverFile.filename}`;
        console.log('Using uploaded cover file:', finalCoverUrl);
      } else if (fileType === 'epub' && parsedData.coverImage) {
        // Extract cover from EPUB
        try {
          const coverExt = path.extname(parsedData.coverImagePath || 'cover.jpg');
          const coverFilename = `cover-${Date.now()}-${Math.round(Math.random() * 1E9)}${coverExt}`;
          const coverPath = path.join(__dirname, '..', 'uploads', 'covers', coverFilename);
          
          // Ensure covers directory exists
          const coversDir = path.dirname(coverPath);
          if (!fsSync.existsSync(coversDir)) {
            await fs.mkdir(coversDir, { recursive: true });
          }
          
          await fs.writeFile(coverPath, parsedData.coverImage);
          finalCoverUrl = `/uploads/covers/${coverFilename}`;
          console.log('Cover image extracted from EPUB:', finalCoverUrl);
        } catch (coverError) {
          console.warn('Could not save EPUB cover image:', coverError.message);
        }
      } else if (fileType === 'pdf') {
        // Extract first page of PDF as cover image
        try {
          const PDFParser = require('../services/pdfParser');
          const coverImageBuffer = await PDFParser.extractCoverImage(bookFile.path);
          
          if (coverImageBuffer) {
            const coverFilename = `cover-${Date.now()}-${Math.round(Math.random() * 1E9)}.png`;
            const coverPath = path.join(__dirname, '..', 'uploads', 'covers', coverFilename);
            
            // Ensure covers directory exists
            const coversDir = path.dirname(coverPath);
            if (!fsSync.existsSync(coversDir)) {
              await fs.mkdir(coversDir, { recursive: true });
            }
            
            await fs.writeFile(coverPath, coverImageBuffer);
            finalCoverUrl = `/uploads/covers/${coverFilename}`;
            console.log('Cover image extracted from PDF (page 1):', finalCoverUrl);
          } else {
            console.warn('Could not extract PDF cover image. pdfjs-dist or canvas may not be installed.');
          }
        } catch (coverError) {
          console.warn('Could not extract PDF cover image:', coverError.message);
        }
      }
      
      // Use metadata dari file jika tidak ada di request
      // Prioritize: request > parsed metadata
      const bookData = {
        title: title || parsedData.metadata.title || 'Unknown Title',
        author: author || parsedData.metadata.author || parsedData.metadata.creator || 'Unknown Author',
        description: description || parsedData.metadata.description || '',
        category: category || 'Uncategorized',
        pages: finalTotalPages,
        cover_url: finalCoverUrl,
        // For PDF, don't use cover_color (PDF doesn't have cover_color like EPUB)
        // For EPUB, use provided cover_color or default gradient
        cover_color: (fileType === 'pdf') ? null : (cover_color || 'from-blue-500 to-purple-600'),
        file_url: `/uploads/books/${bookFile.filename}`,
        file_type: fileType,
        release_date: release_date || parsedData.metadata.published || parsedData.metadata.date || null,
        uploaded_by: user_id || null,
        publisher: parsedData.metadata.publisher || null,
        subject: parsedData.metadata.subject || (parsedData.metadata.tags && parsedData.metadata.tags.length > 0 ? parsedData.metadata.tags.join(', ') : null),
        rights: parsedData.metadata.rights || null
      };
      
      // Save book to database
      const bookId = await Book.create(bookData);
      
      // Save parsed pages to database
      console.log(`Saving ${parsedData.pages.length} pages to database for book ${bookId}...`);
      console.log(`Book metadata: Title="${bookData.title}", Author="${bookData.author}", Pages=${bookData.pages}`);
      await BookPage.savePages(bookId, parsedData.pages);
      
      const book = await Book.findById(bookId);
      
      res.status(201).json({
        success: true,
        message: 'Book created successfully',
        book,
        parsedData: {
          totalPages: parsedData.totalPages,
          metadata: parsedData.metadata
        }
      });
      
    } catch (error) {
      console.error('Create book error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating book',
        error: error.message
      });
    }
  }

  // Update book
  static async updateBook(req, res) {
    try {
      const { id } = req.params;
      const { title, author, description, category, cover_color, status } = req.body;
      
      // Check if book exists
      const existingBook = await Book.findById(id);
      if (!existingBook) {
        return res.status(404).json({
          success: false,
          message: 'Book not found'
        });
      }
      
      // Build update data object
      const updateData = {};
      
      if (title !== undefined) updateData.title = title;
      if (author !== undefined) updateData.author = author;
      if (description !== undefined) updateData.description = description;
      if (category !== undefined) updateData.category = category;
      if (cover_color !== undefined) updateData.cover_color = cover_color;
      if (status !== undefined) updateData.status = status;
      
      // Update cover if provided
      if (req.file) {
        updateData.cover_url = `/uploads/covers/${req.file.filename}`;
        
        // Delete old cover if exists
        if (existingBook.cover_url) {
          const oldCoverPath = path.join(__dirname, '..', existingBook.cover_url);
          try {
            await fs.unlink(oldCoverPath);
            console.log('Old cover deleted:', oldCoverPath);
          } catch (err) {
            console.log('Could not delete old cover:', err.message);
          }
        }
      }
      
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No fields to update'
        });
      }
      
      const success = await Book.update(id, updateData);
      
      if (!success) {
        return res.status(400).json({
          success: false,
          message: 'Failed to update book'
        });
      }
      
      const book = await Book.findById(id);
      
      res.json({
        success: true,
        message: 'Book updated successfully',
        book
      });
      
    } catch (error) {
      console.error('Update book error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating book',
        error: error.message
      });
    }
  }

  // Delete book
  static async deleteBook(req, res) {
    try {
      const { id } = req.params;
      
      // Get book data untuk delete files
      const book = await Book.findById(id);
      if (!book) {
        return res.status(404).json({
          success: false,
          message: 'Book not found'
        });
      }
      
      // Delete book from database (akan cascade delete pages, ratings, dll)
      const success = await Book.delete(id);
      
      if (!success) {
        return res.status(400).json({
          success: false,
          message: 'Failed to delete book'
        });
      }
      
      // Delete files
      if (book.file_url) {
        const filePath = path.join(__dirname, '..', book.file_url);
        try {
          await fs.unlink(filePath);
        } catch (err) {
          console.log('Could not delete book file:', err.message);
        }
      }
      
      if (book.cover_url) {
        const coverPath = path.join(__dirname, '..', book.cover_url);
        try {
          await fs.unlink(coverPath);
        } catch (err) {
          console.log('Could not delete cover file:', err.message);
        }
      }
      
      res.json({
        success: true,
        message: 'Book deleted successfully'
      });
      
    } catch (error) {
      console.error('Delete book error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting book',
        error: error.message
      });
    }
  }

  // Get book page content
  static async getBookPage(req, res) {
    try {
      const { id, page } = req.params;
      const pageNumber = parseInt(page);
      
      // Get book info to check file type
      const book = await Book.findById(id);
      if (!book) {
        return res.status(404).json({
          success: false,
          message: 'Book not found'
        });
      }
      
      const pageData = await BookPage.getPage(id, pageNumber);
      
      if (!pageData) {
        return res.status(404).json({
          success: false,
          message: 'Page not found'
        });
      }
      
      // Add file type and file URL for PDF image rendering
      res.json({
        success: true,
        page: {
          ...pageData,
          fileType: book.file_type,
          fileUrl: book.file_url
        }
      });
      
    } catch (error) {
      console.error('Get page error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching page',
        error: error.message
      });
    }
  }

  // Get book page range
  static async getBookPageRange(req, res) {
    try {
      const { id } = req.params;
      const { start, end } = req.query;
      
      const startPage = parseInt(start) || 1;
      const endPage = parseInt(end) || startPage;
      
      const pages = await BookPage.getPageRange(id, startPage, endPage);
      
      res.json({
        success: true,
        pages
      });
      
    } catch (error) {
      console.error('Get page range error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching pages',
        error: error.message
      });
    }
  }

  // Get categories
  static async getCategories(req, res) {
    try {
      const categories = await Book.getCategories();
      
      res.json({
        success: true,
        categories
      });
      
    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching categories',
        error: error.message
      });
    }
  }

  // Preview file metadata (before upload)
  static async previewFile(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'File is required'
        });
      }

      const bookFile = req.file;
      const fileType = FileParser.getFileType(bookFile.filename);
      
      console.log('Previewing file:', bookFile.filename, 'Type:', fileType);
      
      // Parse file to get metadata
      const parsedData = await FileParser.parseFile(bookFile.path, fileType);
      
      // Clean up temporary file after parsing
      try {
        await fs.unlink(bookFile.path);
      } catch (unlinkError) {
        console.warn('Could not delete temp file:', unlinkError.message);
      }
      
      // Extract cover image info if available (for EPUB or PDF)
      let hasCover = false;
      if (fileType === 'epub' && parsedData.coverImage) {
        hasCover = true;
      } else if (fileType === 'pdf') {
        // PDF can extract cover from page 1 (if pdfjs-dist and canvas are available)
        try {
          const PDFParser = require('../services/pdfParser');
          // Just check if extraction is possible, don't actually extract for preview
          hasCover = PDFParser.extractCoverImage !== undefined;
        } catch (err) {
          hasCover = false;
        }
      }
      
      res.json({
        success: true,
        metadata: {
          title: parsedData.metadata?.title || '',
          author: parsedData.metadata?.author || parsedData.metadata?.creator || '',
          description: parsedData.metadata?.description || '',
          pages: parsedData.totalPages || parsedData.pages?.length || 0,
          publisher: parsedData.metadata?.publisher || '',
          published: parsedData.metadata?.published || parsedData.metadata?.date || null,
          subject: parsedData.metadata?.subject || '',
          rights: parsedData.metadata?.rights || '',
          identifier: parsedData.metadata?.identifier || '',
          language: parsedData.metadata?.language || 'en',
          tags: parsedData.metadata?.tags || [],
          hasCover: hasCover
        },
        fileType: fileType
      });
      
    } catch (error) {
      console.error('Preview file error:', error);
      
      // Clean up temp file on error
      if (req.file && req.file.path) {
        try {
          await fs.unlink(req.file.path);
        } catch (unlinkError) {
          console.warn('Could not delete temp file on error:', unlinkError.message);
        }
      }
      
      res.status(500).json({
        success: false,
        message: 'Error previewing file',
        error: error.message
      });
    }
  }
}

module.exports = BookController;

