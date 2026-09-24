using SocialMedia.Domain.Entities;

public class Post : BaseEntity
{
    public string? Content { get; set; }

    public string? ImageUrl { get; set; }

    public string? VideoUrl { get; set; }

    public Guid UserId { get; set; }

    public AppUser User { get; set; } = null!;

    public ICollection<Comment> Comments { get; set; } = new List<Comment>();

    public ICollection<PostLike> Likes { get; set; } = new List<PostLike>();
}