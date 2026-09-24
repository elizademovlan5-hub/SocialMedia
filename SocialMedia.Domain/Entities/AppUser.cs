using Microsoft.AspNetCore.Identity;
using SocialMedia.Domain.Entities;

namespace SocialMedia.Domain.Entities;

public class AppUser : IdentityUser<Guid>
{
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;

    public string? Bio { get; set; }
    public string? ProfileImageUrl { get; set; }
    public string? CoverImageUrl { get; set; }

    public DateTime? DateOfBirth { get; set; }

    public bool IsOnline { get; set; }
    public DateTime? LastSeenAt { get; set; }
    public bool IsDeleted { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public ICollection<Post> Posts { get; set; } = new List<Post>();
    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
    public ICollection<PostLike> PostLikes { get; set; } = new List<PostLike>();
    public ICollection<RefreshToken> RefreshTokens { get; set; }
    = new List<RefreshToken>();
}