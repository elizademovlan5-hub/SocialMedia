using SMM.Application.Auth.DTOs;
using SocialMedia.Domain.Entities;

public interface IAuthHelper
{
    Task<AuthResponse> CreateAuthResponseAsync(AppUser user);
}