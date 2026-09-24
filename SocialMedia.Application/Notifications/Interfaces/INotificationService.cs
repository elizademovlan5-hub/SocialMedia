using SocialMedia.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SocialMedia.Application.Notifications.Interfaces
{
    public interface INotificationService
    {
        Task<NotificationResponse> CreateAsync(
            Guid userId,
            Guid? actorUserId,
            NotificationType type,
            string message,
            Guid? postId = null,
            Guid? friendRequestId = null,
            Guid? messageId = null,
            CancellationToken cancellationToken = default
        );
    }
}
