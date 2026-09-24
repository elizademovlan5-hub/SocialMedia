using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using SocialMedia.Application.Messages.DTOs;
using SocialMedia.Infrastructure.Persistence;
using SocialMedia.Infrastructure.Realtime;

using System.Security.Claims;

namespace SMM.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MessagesController : ControllerBase
{
    private readonly AppDbContext _dbContext;

    private readonly IHubContext<ChatHub>
        _chatHub;

    public MessagesController(
        AppDbContext dbContext,
        IHubContext<ChatHub> chatHub)
    {
        _dbContext = dbContext;
        _chatHub = chatHub;
    }

    private Guid GetCurrentUserId()
    {
        return Guid.Parse(
            User.FindFirstValue(
                ClaimTypes.NameIdentifier
            )!
        );
    }

    private static (
        Guid User1Id,
        Guid User2Id
    ) NormalizeUsers(
        Guid userA,
        Guid userB)
    {
        return userA.CompareTo(userB) < 0
            ? (userA, userB)
            : (userB, userA);
    }

    private async Task<bool> AreFriendsAsync(
        Guid userA,
        Guid userB,
        CancellationToken cancellationToken)
    {
        var pair = NormalizeUsers(
            userA,
            userB
        );

        return await _dbContext
            .Friendships
            .AnyAsync(
                x =>
                    x.User1Id ==
                        pair.User1Id &&
                    x.User2Id ==
                        pair.User2Id,
                cancellationToken
            );
    }

    // =========================
    // CONVERSATIONS
    // =========================

    [HttpGet("conversations")]
    public async Task<ActionResult> GetConversations(
        CancellationToken cancellationToken)
    {
        var userId =
            GetCurrentUserId();

        var conversations =
            await _dbContext
                .Conversations
                .AsNoTracking()
                .Where(x =>
                    x.User1Id == userId ||
                    x.User2Id == userId
                )
                .OrderByDescending(
                    x => x.LastMessageAt
                )
                .Select(x =>
                    new ConversationResponse
                    {
                        Id = x.Id,

                        UserId =
                            x.User1Id ==
                            userId
                                ? x.User2Id
                                : x.User1Id,

                        FirstName =
                            x.User1Id ==
                            userId
                                ? x.User2.FirstName
                                : x.User1.FirstName,

                        LastName =
                            x.User1Id ==
                            userId
                                ? x.User2.LastName
                                : x.User1.LastName,

                        UserName =
                            x.User1Id ==
                            userId
                                ? x.User2.UserName!
                                : x.User1.UserName!,

                        ProfileImageUrl =
                            x.User1Id ==
                            userId
                                ? x.User2.ProfileImageUrl
                                : x.User1.ProfileImageUrl,

                        IsOnline =
                            x.User1Id ==
                            userId
                                ? x.User2.IsOnline
                                : x.User1.IsOnline,

                        LastSeenAt =
                            x.User1Id ==
                            userId
                                ? x.User2.LastSeenAt
                                : x.User1.LastSeenAt,

                        LastMessage =
                            x.Messages
                                .OrderByDescending(
                                    m => m.CreatedAt
                                )
                                .Select(
                                    m => m.Content
                                )
                                .FirstOrDefault(),

                        LastMessageAt =
                            x.LastMessageAt,

                        UnreadCount =
                            x.Messages.Count(
                                m =>
                                    m.ReceiverId ==
                                        userId &&
                                    !m.IsRead
                            )
                    })
                .ToListAsync(
                    cancellationToken
                );

        return Ok(conversations);
    }

    // =========================
    // CREATE / OPEN CONVERSATION
    // =========================

    [HttpPost("conversations/open/{friendId:guid}")]
    public async Task<ActionResult> OpenConversation(
        Guid friendId,
        CancellationToken cancellationToken)
    {
        var userId =
            GetCurrentUserId();

        if (userId == friendId)
        {
            return BadRequest();
        }

        var areFriends =
            await AreFriendsAsync(
                userId,
                friendId,
                cancellationToken
            );

        if (!areFriends)
        {
            return Forbid();
        }

        var pair =
            NormalizeUsers(
                userId,
                friendId
            );

        var conversation =
            await _dbContext
                .Conversations
                .FirstOrDefaultAsync(
                    x =>
                        x.User1Id ==
                            pair.User1Id &&
                        x.User2Id ==
                            pair.User2Id,
                    cancellationToken
                );

        if (conversation is null)
        {
            conversation =
                new Conversation
                {
                    User1Id =
                        pair.User1Id,

                    User2Id =
                        pair.User2Id
                };

            _dbContext.Conversations
                .Add(conversation);

            await _dbContext
                .SaveChangesAsync(
                    cancellationToken
                );
        }

        return Ok(new
        {
            conversationId =
                conversation.Id
        });
    }

    // =========================
    // MESSAGE HISTORY
    // =========================

    [HttpGet("conversations/{conversationId:guid}")]
    public async Task<ActionResult> GetMessages(
        Guid conversationId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 30,
        CancellationToken cancellationToken = default)
    {
        var userId =
            GetCurrentUserId();

        var conversation =
            await _dbContext
                .Conversations
                .AsNoTracking()
                .FirstOrDefaultAsync(
                    x =>
                        x.Id ==
                            conversationId &&
                        (
                            x.User1Id ==
                                userId ||
                            x.User2Id ==
                                userId
                        ),
                    cancellationToken
                );

        if (conversation is null)
        {
            return NotFound();
        }

        page = Math.Max(page, 1);

        pageSize =
            Math.Clamp(
                pageSize,
                1,
                100
            );

        var query =
            _dbContext.Messages
                .AsNoTracking()
                .Where(x =>
                    x.ConversationId ==
                    conversationId
                );

        var totalCount =
            await query.CountAsync(
                cancellationToken
            );

        var items =
            await query
                .OrderByDescending(
                    x => x.CreatedAt
                )
                .Skip(
                    (page - 1) *
                    pageSize
                )
                .Take(pageSize)
                .Select(x =>
                    new MessageResponse
                    {
                        Id = x.Id,

                        ConversationId =
                            x.ConversationId,

                        SenderId =
                            x.SenderId,

                        ReceiverId =
                            x.ReceiverId,

                        Content =
                            x.Content,

                        CreatedAt =
                            x.CreatedAt,

                        IsRead =
                            x.IsRead,

                        ReadAt =
                            x.ReadAt
                    })
                .ToListAsync(
                    cancellationToken
                );

        items.Reverse();

        return Ok(new
        {
            items,
            page,
            pageSize,
            totalCount
        });
    }

    // =========================
    // SEND MESSAGE
    // =========================

    [HttpPost("conversations/{conversationId:guid}")]
    public async Task<ActionResult<MessageResponse>> Send(
        Guid conversationId,
        SendMessageRequest request,
        CancellationToken cancellationToken)
    {
        var senderId =
            GetCurrentUserId();

        if (
            string.IsNullOrWhiteSpace(
                request.Content
            )
        )
        {
            return BadRequest(new
            {
                message =
                    "Message cannot be empty."
            });
        }

        var conversation =
            await _dbContext
                .Conversations
                .FirstOrDefaultAsync(
                    x =>
                        x.Id ==
                            conversationId &&
                        (
                            x.User1Id ==
                                senderId ||
                            x.User2Id ==
                                senderId
                        ),
                    cancellationToken
                );

        if (conversation is null)
        {
            return NotFound();
        }

        var receiverId =
            conversation.User1Id ==
                senderId
                ? conversation.User2Id
                : conversation.User1Id;

        // friendship yenə yoxlanılır.
        var areFriends =
            await AreFriendsAsync(
                senderId,
                receiverId,
                cancellationToken
            );

        if (!areFriends)
        {
            return Forbid();
        }

        var message =
            new Message
            {
                ConversationId =
                    conversation.Id,

                SenderId =
                    senderId,

                ReceiverId =
                    receiverId,

                Content =
                    request.Content.Trim()
            };

        _dbContext.Messages
            .Add(message);

        conversation.LastMessageAt =
            DateTime.UtcNow;

        await _dbContext
            .SaveChangesAsync(
                cancellationToken
            );

        var response =
            new MessageResponse
            {
                Id =
                    message.Id,

                ConversationId =
                    message.ConversationId,

                SenderId =
                    message.SenderId,

                ReceiverId =
                    message.ReceiverId,

                Content =
                    message.Content,

                CreatedAt =
                    message.CreatedAt,

                IsRead =
                    message.IsRead
            };

        // Receiver-in xususi aktiv connectionlarına.
        await _chatHub
            .Clients
            .User(
                receiverId.ToString()
            )
            .SendAsync(
                "messageReceived",
                response,
                cancellationToken
            );

        // Sender başqa device/tab açıbsa
        // ora da sync olsun.
        await _chatHub
            .Clients
            .User(
                senderId.ToString()
            )
            .SendAsync(
                "messageSent",
                response,
                cancellationToken
            );

        return Ok(response);
    }

    // =========================
    // MARK CONVERSATION READ
    // =========================

    [HttpPatch("conversations/{conversationId:guid}/read")]
    public async Task<IActionResult> MarkAsRead(
        Guid conversationId,
        CancellationToken cancellationToken)
    {
        var userId =
            GetCurrentUserId();

        var messages =
            await _dbContext.Messages
                .Where(x =>
                    x.ConversationId ==
                        conversationId &&
                    x.ReceiverId ==
                        userId &&
                    !x.IsRead
                )
                .ToListAsync(
                    cancellationToken
                );

        if (messages.Count == 0)
        {
            return NoContent();
        }

        var now =
            DateTime.UtcNow;

        foreach (var message in messages)
        {
            message.IsRead = true;
            message.ReadAt = now;
        }

        await _dbContext
            .SaveChangesAsync(
                cancellationToken
            );

        var senderIds =
            messages
                .Select(x => x.SenderId)
                .Distinct();

        foreach (
            var senderId in senderIds
        )
        {
            await _chatHub.Clients
                .User(senderId.ToString())
                .SendAsync(
                    "messagesRead",
                    new
                    {
                        conversationId,
                        readByUserId =
                            userId,
                        readAt = now
                    },
                    cancellationToken
                );
        }

        return NoContent();
    }

    // =========================
    // TOTAL UNREAD
    // =========================

    [HttpGet("unread-count")]
    public async Task<IActionResult> GetUnreadCount(
        CancellationToken cancellationToken)
    {
        var userId =
            GetCurrentUserId();

        var count =
            await _dbContext.Messages
                .CountAsync(
                    x =>
                        x.ReceiverId ==
                            userId &&
                        !x.IsRead,
                    cancellationToken
                );

        return Ok(new
        {
            count
        });
    }
}