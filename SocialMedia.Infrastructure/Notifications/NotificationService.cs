using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using SocialMedia.Application.Notifications.Interfaces;
using SocialMedia.Domain.Enums;
using SocialMedia.Infrastructure.Persistence;
using SocialMedia.Infrastructure.RealTime;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SocialMedia.Infrastructure.Notifications
{


    public class NotificationService
        : INotificationService
    {
        private readonly AppDbContext _dbContext;

        private readonly IHubContext<NotificationHub>
            _hubContext;

        public NotificationService(
            AppDbContext dbContext,
            IHubContext<NotificationHub> hubContext)
        {
            _dbContext = dbContext;
            _hubContext = hubContext;
        }

        public async Task<NotificationResponse> CreateAsync(
            Guid userId,
            Guid? actorUserId,
            NotificationType type,
            string message,
            Guid? postId = null,
            Guid? friendRequestId = null,
            Guid? messageId = null,
            CancellationToken cancellationToken = default)
        {
            var notification = new Notification
            {
                UserId = userId,
                ActorUserId = actorUserId,

                Type = type,
                Message = message,

                PostId = postId,
                FriendRequestId = friendRequestId,
                MessageId = messageId
            };

            _dbContext.Notifications.Add(notification);

            await _dbContext.SaveChangesAsync(
                cancellationToken
            );

            var response =
                await _dbContext.Notifications
                    .AsNoTracking()
                    .Where(x =>
                        x.Id == notification.Id
                    )
                    .Select(x =>
                        new NotificationResponse
                        {
                            Id = x.Id,

                            Type = x.Type,

                            Message =
                                x.Message,

                            IsRead =
                                x.IsRead,

                            CreatedAt =
                                x.CreatedAt,

                            ActorUserId =
                                x.ActorUserId,

                            ActorFirstName =
                                x.ActorUser != null
                                    ? x.ActorUser.FirstName
                                    : null,

                            ActorLastName =
                                x.ActorUser != null
                                    ? x.ActorUser.LastName
                                    : null,

                            ActorProfileImageUrl =
                                x.ActorUser != null
                                    ? x.ActorUser.ProfileImageUrl
                                    : null,

                            PostId =
                                x.PostId,

                            FriendRequestId =
                                x.FriendRequestId,

                            MessageId =
                                x.MessageId
                        })
                    .FirstAsync(
                        cancellationToken
                    );

            // DB-yə yazıldıqdan sonra
            // real-time göndəririk.
            await _hubContext.Clients
                .User(userId.ToString())
                .SendAsync(
                    "notificationReceived",
                    response,
                    cancellationToken
                );

            return response;
        }
    }
}
