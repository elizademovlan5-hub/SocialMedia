
using SocialMedia.Domain.Entities;

public class Conversation : BaseEntity
{
    public Guid User1Id { get; set; }
    public AppUser User1 { get; set; } = null!;

    public Guid User2Id { get; set; }
    public AppUser User2 { get; set; } = null!;

    public DateTime? LastMessageAt { get; set; }

    public ICollection<Message> Messages { get; set; }
        = new List<Message>();
}