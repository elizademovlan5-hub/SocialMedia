using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;

public class LocalFileStorageService : IFileStorageService
{
    private readonly IWebHostEnvironment _environment;

    private static readonly string[] AllowedImageExtensions =
    {
        ".jpg",
        ".jpeg",
        ".png",
        ".webp",
        ".gif"
    };

    private static readonly string[] AllowedVideoExtensions =
    {
        ".mp4",
        ".webm",
        ".mov"
    };

    private const long MaxImageSize = 10 * 1024 * 1024;
    private const long MaxVideoSize = 150 * 1024 * 1024;

    public LocalFileStorageService(
        IWebHostEnvironment environment)
    {
        _environment = environment;
    }

    public async Task<string> SaveImageAsync(
        IFormFile file,
        CancellationToken cancellationToken = default)
    {
        ValidateFile(
            file,
            AllowedImageExtensions,
            MaxImageSize,
            "image"
        );

        return await SaveFileAsync(
            file,
            "images",
            cancellationToken
        );
    }

    public async Task<string> SaveVideoAsync(
        IFormFile file,
        CancellationToken cancellationToken = default)
    {
        ValidateFile(
            file,
            AllowedVideoExtensions,
            MaxVideoSize,
            "video"
        );

        return await SaveFileAsync(
            file,
            "videos",
            cancellationToken
        );
    }

    public Task DeleteAsync(
        string? fileUrl,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(fileUrl))
        {
            return Task.CompletedTask;
        }

        var relativePath = fileUrl
            .TrimStart('/')
            .Replace('/', Path.DirectorySeparatorChar);

        if (!relativePath.StartsWith(
                $"uploads{Path.DirectorySeparatorChar}",
                StringComparison.OrdinalIgnoreCase))
        {
            return Task.CompletedTask;
        }

        var fullPath = Path.Combine(
            GetWebRootPath(),
            relativePath
        );

        if (File.Exists(fullPath))
        {
            File.Delete(fullPath);
        }

        return Task.CompletedTask;
    }

    private async Task<string> SaveFileAsync(
        IFormFile file,
        string folderName,
        CancellationToken cancellationToken)
    {
        var extension = Path
            .GetExtension(file.FileName)
            .ToLowerInvariant();

        var fileName =
            $"{Guid.NewGuid():N}{extension}";

        var folder = Path.Combine(
            GetWebRootPath(),
            "uploads",
            folderName
        );

        Directory.CreateDirectory(folder);

        var fullPath = Path.Combine(
            folder,
            fileName
        );

        await using var stream = new FileStream(
            fullPath,
            FileMode.Create
        );

        await file.CopyToAsync(
            stream,
            cancellationToken
        );

        return $"/uploads/{folderName}/{fileName}";
    }

    private string GetWebRootPath()
    {
        if (!string.IsNullOrWhiteSpace(
                _environment.WebRootPath))
        {
            return _environment.WebRootPath;
        }

        var webRoot = Path.Combine(
            _environment.ContentRootPath,
            "wwwroot"
        );

        Directory.CreateDirectory(webRoot);

        return webRoot;
    }

    private static void ValidateFile(
        IFormFile file,
        string[] allowedExtensions,
        long maxFileSize,
        string fileType)
    {
        if (file is null || file.Length == 0)
        {
            throw new InvalidOperationException(
                $"The {fileType} file is empty."
            );
        }

        if (file.Length > maxFileSize)
        {
            throw new InvalidOperationException(
                $"The {fileType} file is too large."
            );
        }

        var extension = Path
            .GetExtension(file.FileName)
            .ToLowerInvariant();

        if (!allowedExtensions.Contains(extension))
        {
            throw new InvalidOperationException(
                $"Unsupported {fileType} format."
            );
        }
    }
}