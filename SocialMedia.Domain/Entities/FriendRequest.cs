using SocialMedia.Domain.Entities;

public class FriendRequest : BaseEntity
{
    public Guid SenderId { get; set; }

    public AppUser Sender { get; set; } = null!;

    public Guid ReceiverId { get; set; }

    public AppUser Receiver { get; set; } = null!;

    public FriendRequestStatus Status { get; set; }
        = FriendRequestStatus.Pending;

    public DateTime? RespondedAt { get; set; }
}