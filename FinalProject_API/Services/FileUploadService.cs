namespace FinalProject_API.Services
{
    public class FileUploadService
    {
        private readonly IWebHostEnvironment _environment;
        private readonly string[] _allowedExtensions = { ".jpg", ".jpeg", ".png", ".gif" };
        private const long _maxFileSize = 5 * 1024 * 1024; // 5 MB

        private readonly string[] _allowedPdfExtensions = { ".pdf" };
        private const long _maxPdfSize = 50 * 1024 * 1024; // 50 MB


        public FileUploadService(IWebHostEnvironment environment)
        {
            _environment = environment;
        }

        public async Task<string?> UploadPhotoAsync(IFormFile? file, string folderName)
        {
            if (file == null || file.Length == 0)
                return null;

            // Validate extension
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!_allowedExtensions.Contains(extension))
                throw new InvalidOperationException($"Invalid file type. Allowed: {string.Join(", ", _allowedExtensions)}");

            // Validate size
            if (file.Length > _maxFileSize)
                throw new InvalidOperationException($"File size exceeds {_maxFileSize / 1024 / 1024} MB");

            // Generate unique filename
            var fileName = $"{Guid.NewGuid()}{extension}";
            var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads", folderName);

            // Create directory if not exists
            Directory.CreateDirectory(uploadsFolder);

            var filePath = Path.Combine(uploadsFolder, fileName);
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Return relative URL
            return $"/uploads/{folderName}/{fileName}";
        }

        public async Task<string> UploadPdfAsync(IFormFile file, string folderName)
        {
            if (file == null || file.Length == 0)
                throw new InvalidOperationException("No file provided.");

            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!_allowedPdfExtensions.Contains(extension))
                throw new InvalidOperationException("Only PDF files are allowed.");

            if (file.Length > _maxPdfSize)
                throw new InvalidOperationException($"File size exceeds {_maxPdfSize / 1024 / 1024} MB.");

            var fileName = $"{Guid.NewGuid()}{extension}";
            var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads", folderName);
            Directory.CreateDirectory(uploadsFolder);

            var filePath = Path.Combine(uploadsFolder, fileName);
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            return $"/uploads/{folderName}/{fileName}";
        }
    }
}
