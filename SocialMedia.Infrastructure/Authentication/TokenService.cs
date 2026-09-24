using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using SocialMedia.Domain.Entities;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

public class TokenService : ITokenService
{
    private readonly IConfiguration _configuration;
    private readonly UserManager<AppUser> _userManager;

    public TokenService(
        IConfiguration configuration,
        UserManager<AppUser> userManager)
    {
        _configuration = configuration;
        _userManager = userManager;
    }

    public async Task<(string Token, DateTime ExpiresAt)>
        CreateAccessTokenAsync(AppUser user)
    {
        var key = _configuration["Jwt:Key"]
            ?? throw new InvalidOperationException("JWT key is missing.");

        var issuer = _configuration["Jwt:Issuer"];
        var audience = _configuration["Jwt:Audience"];

        var minutes = int.Parse(
            _configuration["Jwt:AccessTokenExpirationMinutes"] ?? "15"
        );

        var expiresAt = DateTime.UtcNow.AddMinutes(minutes);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Name, user.UserName ?? string.Empty),
            new(ClaimTypes.Email, user.Email ?? string.Empty),
            new("firstName", user.FirstName),
            new("lastName", user.LastName)
        };

        var roles = await _userManager.GetRolesAsync(user);

        foreach (var role in roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        var signingKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(key)
        );

        var credentials = new SigningCredentials(
            signingKey,
            SecurityAlgorithms.HmacSha256
        );

        var descriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = expiresAt,
            Issuer = issuer,
            Audience = audience,
            SigningCredentials = credentials
        };

        var handler = new JwtSecurityTokenHandler();

        var token = handler.CreateToken(descriptor);

        return (
            handler.WriteToken(token),
            expiresAt
        );
    }

    public (string Token, DateTime ExpiresAt)
        CreateRefreshToken()
    {
        var days = int.Parse(
            _configuration["Jwt:RefreshTokenExpirationDays"] ?? "7"
        );

        var randomBytes = RandomNumberGenerator.GetBytes(64);

        var token = Convert.ToBase64String(randomBytes);

        return (
            token,
            DateTime.UtcNow.AddDays(days)
        );
    }
}