using SocialMedia.Domain.Enums;

public class NotificationResponse
{
    public Guid Id { get; set; }

    public NotificationType Type { get; set; }

    public string Message { get; set; } = null!;

    public bool IsRead { get; set; }

    public DateTime CreatedAt { get; set; }

    public Guid? ActorUserId { get; set; }

    public string? ActorFirstName { get; set; }

    public string? ActorLastName { get; set; }

    public string? ActorProfileImageUrl { get; set; }

    public Guid? PostId { get; set; }

    public Guid? FriendRequestId { get; set; }

    public Guid? MessageId { get; set; }
}