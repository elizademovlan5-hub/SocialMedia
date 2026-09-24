using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;

public class CloudinaryStorageService : IFileStorageService
{
    private readonly Cloudinary _cloudinary;

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

    public CloudinaryStorageService(IConfiguration configuration)
    {
        var cloudName = configuration["Cloudinary:CloudName"];
        var apiKey = configuration["Cloudinary:ApiKey"];
        var apiSecret = configuration["Cloudinary:ApiSecret"];

        if (string.IsNullOrWhiteSpace(cloudName) ||
            string.IsNullOrWhiteSpace(apiKey) ||
            string.IsNullOrWhiteSpace(apiSecret))
        {
            throw new InvalidOperationException(
                "Cloudinary configuration is missing."
            );
        }

        var account = new Account(
            cloudName,
            apiKey,
            apiSecret
        );

        _cloudinary = new Cloudinary(account);
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

        await using var stream = file.OpenReadStream();

        var uploadParams = new ImageUploadParams
        {
            File = new FileDescription(
                file.FileName,
                stream
            ),
            Folder = "socialmedia/images"
        };

        var result = await _cloudinary.UploadAsync(uploadParams);

        if (result.Error != null)
        {
            throw new InvalidOperationException(
                result.Error.Message
            );
        }

        return result.SecureUrl.ToString();
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

        await using var stream = file.OpenReadStream();

        var uploadParams = new VideoUploadParams
        {
            File = new FileDescription(
                file.FileName,
                stream
            ),
            Folder = "socialmedia/videos"
        };

        var result = await _cloudinary.UploadAsync(uploadParams);

        if (result.Error != null)
        {
            throw new InvalidOperationException(
                result.Error.Message
            );
        }

        return result.SecureUrl.ToString();
    }

    public async Task DeleteAsync(
        string? fileUrl,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(fileUrl))
            return;

        var uri = new Uri(fileUrl);

        var path = uri.AbsolutePath;

        var uploadIndex = path.IndexOf(
            "/upload/",
            StringComparison.OrdinalIgnoreCase
        );

        if (uploadIndex == -1)
            return;

        var publicId = path
            .Substring(uploadIndex + "/upload/".Length);

        publicId = publicId
            .Substring(publicId.IndexOf('/') + 1);

        var extension = Path.GetExtension(publicId);

        if (!string.IsNullOrEmpty(extension))
        {
            publicId = publicId[..^extension.Length];
        }

        var resourceType =
            fileUrl.Contains("/video/upload/")
                ? ResourceType.Video
                : ResourceType.Image;

        var deleteParams = new DeletionParams(publicId)
        {
            ResourceType = resourceType
        };

        await _cloudinary.DestroyAsync(deleteParams);
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