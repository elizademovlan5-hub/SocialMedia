using SocialMedia.Domain.Entities;

public class Friendship : BaseEntity
{
    public Guid User1Id { get; set; }

    public AppUser User1 { get; set; } = null!;

    public Guid User2Id { get; set; }

    public AppUser User2 { get; set; } = null!;
}