using Microsoft.AspNetCore.Http;

public interface IFileStorageService
{
    Task<string> SaveImageAsync(
        IFormFile file,
        CancellationToken cancellationToken = default
    );

    Task<string> SaveVideoAsync(
        IFormFile file,
        CancellationToken cancellationToken = default
    );

    Task DeleteAsync(
        string? fileUrl,
        CancellationToken cancellationToken = default
    );
}