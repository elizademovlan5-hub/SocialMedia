using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SocialMedia.Application.Friends.DTOs;
using SocialMedia.Application.Notifications.Interfaces;
using SocialMedia.Domain.Enums;
using SocialMedia.Infrastructure.Persistence;
using System.Security.Claims;

namespace SocialMedia.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class FriendsController : ControllerBase
    {
        private readonly AppDbContext _dbContext;

        private readonly INotificationService
            _notificationService;

        public FriendsController(
            AppDbContext dbContext,
            INotificationService notificationService)
        {
            _dbContext = dbContext;
            _notificationService =
                notificationService;
        }

        private Guid GetCurrentUserId()
        {
            var value =
                User.FindFirstValue(
                    ClaimTypes.NameIdentifier
                );

            if (
                string.IsNullOrWhiteSpace(
                    value
                )
            )
            {
                throw new UnauthorizedAccessException();
            }

            return Guid.Parse(value);
        }

        private static (Guid User1Id, Guid User2Id) NormalizeUsers(Guid userA, Guid userB)
        {
            return userA.CompareTo(userB) < 0
                ? (userA, userB)
                : (userB, userA);
        }

        // =========================
        // SEND REQUEST
        // =========================

        [HttpPost("requests/{receiverId:guid}")]
        public async Task<IActionResult> SendRequest(
            Guid receiverId,
            CancellationToken cancellationToken)
        {
            var senderId =
                GetCurrentUserId();

            if (senderId == receiverId)
            {
                return BadRequest(new
                {
                    message =
                        "You cannot send a friend request to yourself."
                });
            }

            var receiver =
                await _dbContext.Users
                    .AsNoTracking()
                    .FirstOrDefaultAsync(
                        x =>
                            x.Id ==
                            receiverId,
                        cancellationToken
                    );

            if (receiver is null)
            {
                return NotFound(new
                {
                    message =
                        "User not found."
                });
            }

            var pair =
                NormalizeUsers(
                    senderId,
                    receiverId
                );

            var alreadyFriends =
                await _dbContext
                    .Friendships
                    .AnyAsync(
                        x =>
                            x.User1Id ==
                                pair.User1Id &&
                            x.User2Id ==
                                pair.User2Id,
                        cancellationToken
                    );

            if (alreadyFriends)
            {
                return BadRequest(new
                {
                    message =
                        "You are already friends."
                });
            }

            var pendingRequest =
                await _dbContext
                    .FriendRequests
                    .FirstOrDefaultAsync(
                        x =>
                            x.Status ==
                                FriendRequestStatus.Pending &&
                            (
                                (
                                    x.SenderId ==
                                        senderId &&
                                    x.ReceiverId ==
                                        receiverId
                                )
                                ||
                                (
                                    x.SenderId ==
                                        receiverId &&
                                    x.ReceiverId ==
                                        senderId
                                )
                            ),
                        cancellationToken
                    );

            if (pendingRequest is not null)
            {
                return BadRequest(new
                {
                    message =
                        "A pending friend request already exists."
                });
            }

            var request =
                new FriendRequest
                {
                    SenderId =
                        senderId,

                    ReceiverId =
                        receiverId
                };

            _dbContext
                .FriendRequests
                .Add(request);

            await _dbContext
                .SaveChangesAsync(
                    cancellationToken
                );

            var sender =
                await _dbContext.Users
                    .AsNoTracking()
                    .FirstAsync(
                        x =>
                            x.Id ==
                            senderId,
                        cancellationToken
                    );

            await _notificationService
                .CreateAsync(
                    receiverId,
                    senderId,

                    NotificationType
                        .FriendRequest,

                    $"{sender.FirstName} {sender.LastName} sent you a friend request.",

                    friendRequestId:
                        request.Id,

                    cancellationToken:
                        cancellationToken
                );

            return Ok(new
            {
                requestId =
                    request.Id,

                status =
                    request.Status
            });
        }

        // =========================
        // ACCEPT
        // =========================

        [HttpPost("requests/{requestId:guid}/accept")]
        public async Task<IActionResult> Accept(
            Guid requestId,
            CancellationToken cancellationToken)
        {
            var userId =
                GetCurrentUserId();

            var request =
                await _dbContext
                    .FriendRequests
                    .Include(x => x.Receiver)
                    .FirstOrDefaultAsync(
                        x =>
                            x.Id ==
                                requestId &&
                            x.Status ==
                                FriendRequestStatus.Pending,
                        cancellationToken
                    );

            if (request is null)
            {
                return NotFound(new
                {
                    message =
                        "Friend request not found."
                });
            }

            if (
                request.ReceiverId !=
                userId
            )
            {
                return Forbid();
            }

            var pair =
                NormalizeUsers(
                    request.SenderId,
                    request.ReceiverId
                );

            var alreadyExists =
                await _dbContext
                    .Friendships
                    .AnyAsync(
                        x =>
                            x.User1Id ==
                                pair.User1Id &&
                            x.User2Id ==
                                pair.User2Id,
                        cancellationToken
                    );

            if (!alreadyExists)
            {
                _dbContext
                    .Friendships
                    .Add(
                        new Friendship
                        {
                            User1Id =
                                pair.User1Id,

                            User2Id =
                                pair.User2Id
                        }
                    );
            }

            request.Status =
                FriendRequestStatus.Accepted;

            request.RespondedAt =
                DateTime.UtcNow;

            await _dbContext
                .SaveChangesAsync(
                    cancellationToken
                );

            var receiver =
                request.Receiver;

            await _notificationService
                .CreateAsync(
                    request.SenderId,
                    userId,

                    NotificationType
                        .FriendRequestAccepted,

                    $"{receiver.FirstName} {receiver.LastName} accepted your friend request.",

                    friendRequestId:
                        request.Id,

                    cancellationToken:
                        cancellationToken
                );

            return Ok(new
            {
                message =
                    "Friend request accepted."
            });
        }

        // =========================
        // REJECT
        // =========================

        [HttpPost("requests/{requestId:guid}/reject")]
        public async Task<IActionResult> Reject(
            Guid requestId,
            CancellationToken cancellationToken)
        {
            var userId =
                GetCurrentUserId();

            var request =
                await _dbContext
                    .FriendRequests
                    .Include(x => x.Receiver)
                    .FirstOrDefaultAsync(
                        x =>
                            x.Id ==
                                requestId &&
                            x.Status ==
                                FriendRequestStatus.Pending,
                        cancellationToken
                    );

            if (request is null)
            {
                return NotFound();
            }

            if (
                request.ReceiverId !=
                userId
            )
            {
                return Forbid();
            }

            request.Status =
                FriendRequestStatus.Rejected;

            request.RespondedAt =
                DateTime.UtcNow;

            await _dbContext
                .SaveChangesAsync(
                    cancellationToken
                );

            await _notificationService
                .CreateAsync(
                    request.SenderId,
                    userId,

                    NotificationType
                        .FriendRequestRejected,

                    $"{request.Receiver.FirstName} {request.Receiver.LastName} declined your friend request.",

                    friendRequestId:
                        request.Id,

                    cancellationToken:
                        cancellationToken
                );

            return NoContent();
        }

        // =========================
        // CANCEL REQUEST
        // =========================

        [HttpDelete("requests/{requestId:guid}")]
        public async Task<IActionResult> CancelRequest(
            Guid requestId,
            CancellationToken cancellationToken)
        {
            var userId =
                GetCurrentUserId();

            var request =
                await _dbContext
                    .FriendRequests
                    .Include(x => x.Sender)
                    .FirstOrDefaultAsync(
                        x =>
                            x.Id ==
                                requestId &&
                            x.Status ==
                                FriendRequestStatus.Pending,
                        cancellationToken
                    );

            if (request is null)
            {
                return NotFound();
            }

            if (
                request.SenderId !=
                userId
            )
            {
                return Forbid();
            }

            request.Status =
                FriendRequestStatus.Cancelled;

            request.RespondedAt =
                DateTime.UtcNow;

            await _dbContext
                .SaveChangesAsync(
                    cancellationToken
                );

            await _notificationService
                .CreateAsync(
                    request.ReceiverId,
                    userId,

                    NotificationType
                        .FriendRequestCancelled,

                    $"{request.Sender.FirstName} {request.Sender.LastName} cancelled the friend request.",

                    friendRequestId:
                        request.Id,

                    cancellationToken:
                        cancellationToken
                );

            return NoContent();
        }


        [HttpGet("requests/incoming")]
        public async Task<ActionResult> GetIncomingRequests(
    CancellationToken cancellationToken)
        {
            var userId =
                GetCurrentUserId();

            var requests =
                await _dbContext
                    .FriendRequests
                    .AsNoTracking()
                    .Where(x =>
                        x.ReceiverId ==
                            userId &&
                        x.Status ==
                            FriendRequestStatus.Pending
                    )
                    .OrderByDescending(
                        x => x.CreatedAt
                    )
                    .Select(x =>
                        new FriendRequestResponse
                        {
                            Id =
                                x.Id,

                            SenderId =
                                x.SenderId,

                            SenderFirstName =
                                x.Sender.FirstName,

                            SenderLastName =
                                x.Sender.LastName,

                            SenderUserName =
                                x.Sender.UserName!,

                            SenderProfileImageUrl =
                                x.Sender.ProfileImageUrl,

                            ReceiverId =
                                x.ReceiverId,

                            Status =
                                x.Status,

                            CreatedAt =
                                x.CreatedAt
                        })
                    .ToListAsync(
                        cancellationToken
                    );

            return Ok(requests);
        }


        [HttpGet("requests/outgoing")]
        public async Task<ActionResult> GetOutgoingRequests(
    CancellationToken cancellationToken)
        {
            var userId =
                GetCurrentUserId();

            var requests =
                await _dbContext
                    .FriendRequests
                    .AsNoTracking()
                    .Where(x =>
                        x.SenderId ==
                            userId &&
                        x.Status ==
                            FriendRequestStatus.Pending
                    )
                    .OrderByDescending(
                        x => x.CreatedAt
                    )
                    .Select(x => new
                    {
                        x.Id,

                        x.ReceiverId,

                        x.Receiver.FirstName,

                        x.Receiver.LastName,

                        x.Receiver.UserName,

                        x.Receiver.ProfileImageUrl,

                        x.Status,

                        x.CreatedAt
                    })
                    .ToListAsync(
                        cancellationToken
                    );

            return Ok(requests);
        }

        [HttpGet]
        public async Task<ActionResult> GetFriends(
    CancellationToken cancellationToken)
        {
            var userId =
                GetCurrentUserId();

            var friends =
                await _dbContext
                    .Friendships
                    .AsNoTracking()
                    .Where(x =>
                        x.User1Id ==
                            userId ||
                        x.User2Id ==
                            userId
                    )
                    .Select(x =>
                        x.User1Id ==
                            userId
                            ? new
                            {
                                Id =
                                    x.User2.Id,

                                x.User2.FirstName,

                                x.User2.LastName,

                                x.User2.UserName,

                                x.User2.ProfileImageUrl,

                                x.User2.IsOnline,

                                x.User2.LastSeenAt
                            }
                            : new
                            {
                                Id =
                                    x.User1.Id,

                                x.User1.FirstName,

                                x.User1.LastName,

                                x.User1.UserName,

                                x.User1.ProfileImageUrl,

                                x.User1.IsOnline,

                                x.User1.LastSeenAt
                            }
                    )
                    .ToListAsync(
                        cancellationToken
                    );

            return Ok(friends);
        }

        [HttpDelete("{friendId:guid}")]
        public async Task<IActionResult> RemoveFriend(
    Guid friendId,
    CancellationToken cancellationToken)
        {
            var userId =
                GetCurrentUserId();

            var pair =
                NormalizeUsers(
                    userId,
                    friendId
                );

            var friendship =
                await _dbContext
                    .Friendships
                    .FirstOrDefaultAsync(
                        x =>
                            x.User1Id ==
                                pair.User1Id &&
                            x.User2Id ==
                                pair.User2Id,
                        cancellationToken
                    );

            if (friendship is null)
            {
                return NotFound(new
                {
                    message =
                        "Friendship not found."
                });
            }

            friendship.IsDeleted = true;
            friendship.UpdatedAt =
                DateTime.UtcNow;

            await _dbContext
                .SaveChangesAsync(
                    cancellationToken
                );

            return NoContent();
        }
    }
}
