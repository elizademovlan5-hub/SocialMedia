using SocialMedia.Domain.Entities;

public class Comment : BaseEntity
{
    public string Content { get; set; } = null!;

    public Guid UserId { get; set; }

    public AppUser User { get; set; } = null!;

    public Guid PostId { get; set; }

    public Post Post { get; set; } = null!;
}