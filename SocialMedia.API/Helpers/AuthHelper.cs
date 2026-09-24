using SMM.Application.Auth.DTOs;
using SocialMedia.Domain.Entities;
using SocialMedia.Infrastructure.Persistence;

public class AuthHelper : IAuthHelper
{
    private readonly AppDbContext _dbContext;
    private readonly ITokenService _tokenService;


    public AuthHelper(AppDbContext dbContext, ITokenService tokenService)
    {
        _dbContext = dbContext;
        _tokenService = tokenService;
    }

    public async Task<AuthResponse> CreateAuthResponseAsync(AppUser user)
    {
        var accessToken =
            await _tokenService.CreateAccessTokenAsync(user);

        var refreshToken =
            _tokenService.CreateRefreshToken();

        var refreshTokenEntity = new RefreshToken
        {
            UserId = user.Id,
            Token = refreshToken.Token,
            ExpiresAt = refreshToken.ExpiresAt
        };

        _dbContext.RefreshTokens.Add(refreshTokenEntity);

        await _dbContext.SaveChangesAsync();

        return new AuthResponse
        {
            UserId = user.Id,
            UserName = user.UserName!,
            Email = user.Email!,
            FirstName = user.FirstName,
            LastName = user.LastName,

            AccessToken = accessToken.Token,
            AccessTokenExpiresAt = accessToken.ExpiresAt,

            RefreshToken = refreshToken.Token,
            RefreshTokenExpiresAt = refreshToken.ExpiresAt
        };
    }
}