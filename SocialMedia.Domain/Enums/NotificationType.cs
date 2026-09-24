namespace SocialMedia.Domain.Enums;

public enum NotificationType
{
    FriendRequest = 1,
    FriendRequestAccepted = 2,
    FriendRequestRejected = 3,
    FriendRequestCancelled = 4,

    PostLiked = 10,
    PostCommented = 11,

    MessageReceived = 20
}