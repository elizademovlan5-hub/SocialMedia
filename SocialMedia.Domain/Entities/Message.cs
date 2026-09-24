
using SocialMedia.Domain.Entities;

public class Message : BaseEntity
{
    public Guid ConversationId { get; set; }

    public Conversation Conversation { get; set; } = null!;

    public Guid SenderId { get; set; }

    public AppUser Sender { get; set; } = null!;

    public Guid ReceiverId { get; set; }

    public AppUser Receiver { get; set; } = null!;

    public string Content { get; set; } = null!;

    public bool IsRead { get; set; }

    public DateTime? ReadAt { get; set; }
}