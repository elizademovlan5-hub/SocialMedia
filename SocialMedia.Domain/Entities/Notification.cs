using SocialMedia.Domain.Entities;
using SocialMedia.Domain.Enums;

public class Notification : BaseEntity
{
    public Guid UserId { get; set; }

    public AppUser User { get; set; } = null!;

    public Guid? ActorUserId { get; set; }

    public AppUser? ActorUser { get; set; }

    public NotificationType Type { get; set; }

    public string Message { get; set; } = null!;

    public bool IsRead { get; set; }

    public DateTime? ReadAt { get; set; }

    public Guid? PostId { get; set; }

    public Guid? FriendRequestId { get; set; }

    public Guid? MessageId { get; set; }
}