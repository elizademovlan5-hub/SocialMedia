namespace SMM.Application.Auth.DTOs;

public class AuthResponse
{
    public Guid UserId { get; set; }

    public string UserName { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string FirstName { get; set; } = null!;

    public string LastName { get; set; } = null!;

    public string AccessToken { get; set; } = null!;

    public string RefreshToken { get; set; } = null!;

    public DateTime AccessTokenExpiresAt { get; set; }

    public DateTime RefreshTokenExpiresAt { get; set; }
}